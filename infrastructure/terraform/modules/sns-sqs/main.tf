# ==============================================================================
# SNS/SQS Module for Asynchronous Messaging
# ==============================================================================

# ------------------------------------------------------------------------------
# SNS Topic - PIX Transactions
# ------------------------------------------------------------------------------

resource "aws_sns_topic" "pix_transactions" {
  name              = "${var.project_name}-pix-transactions"
  display_name      = "PIX Transactions Topic"
  fifo_topic        = false
  
  # Message delivery settings
  delivery_policy = jsonencode({
    http = {
      defaultHealthyRetryPolicy = {
        minDelayTarget     = 20
        maxDelayTarget     = 20
        numRetries         = 3
        numMaxDelayRetries = 0
        numNoDelayRetries  = 0
        numMinDelayRetries = 0
        backoffFunction    = "linear"
      }
      disableSubscriptionOverrides = false
    }
  })

  # Server-side encryption
  kms_master_key_id = var.enable_encryption ? aws_kms_key.sns_sqs[0].id : null

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-pix-transactions-topic"
    }
  )
}

# ------------------------------------------------------------------------------
# SNS Topic Policy
# ------------------------------------------------------------------------------

resource "aws_sns_topic_policy" "pix_transactions" {
  arn = aws_sns_topic.pix_transactions.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPublishFromServices"
        Effect = "Allow"
        Principal = {
          Service = [
            "events.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        }
        Action = [
          "SNS:Publish"
        ]
        Resource = aws_sns_topic.pix_transactions.arn
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# SQS Queue - Settlement Queue (Main)
# ------------------------------------------------------------------------------

resource "aws_sqs_queue" "settlement_queue" {
  name                       = "${var.project_name}-settlement-queue"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 1209600 # 14 days
  receive_wait_time_seconds  = 20      # Long polling
  visibility_timeout_seconds = 300     # 5 minutes

  # Dead Letter Queue configuration
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.settlement_dlq.arn
    maxReceiveCount     = 3
  })

  # Server-side encryption
  sqs_managed_sse_enabled = var.enable_encryption ? false : true
  kms_master_key_id       = var.enable_encryption ? aws_kms_key.sns_sqs[0].id : null
  kms_data_key_reuse_period_seconds = 300

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-settlement-queue"
    }
  )
}

# ------------------------------------------------------------------------------
# SQS Queue - Dead Letter Queue (DLQ)
# ------------------------------------------------------------------------------

resource "aws_sqs_queue" "settlement_dlq" {
  name                      = "${var.project_name}-settlement-dlq"
  message_retention_seconds = 1209600 # 14 days

  # Server-side encryption
  sqs_managed_sse_enabled = var.enable_encryption ? false : true
  kms_master_key_id       = var.enable_encryption ? aws_kms_key.sns_sqs[0].id : null

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-settlement-dlq"
      Type = "DeadLetterQueue"
    }
  )
}

# ------------------------------------------------------------------------------
# SQS Queue Policy - Settlement Queue
# ------------------------------------------------------------------------------

resource "aws_sqs_queue_policy" "settlement_queue" {
  queue_url = aws_sqs_queue.settlement_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSNSPublish"
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "SQS:SendMessage"
        Resource = aws_sqs_queue.settlement_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.pix_transactions.arn
          }
        }
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# SNS Subscription - SQS
# ------------------------------------------------------------------------------

resource "aws_sns_topic_subscription" "settlement_queue" {
  topic_arn = aws_sns_topic.pix_transactions.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.settlement_queue.arn

  # Filter policy (only subscribe to specific event types)
  filter_policy = jsonencode({
    eventType = ["TransactionCreated", "TransactionUpdated"]
  })

  # Enable raw message delivery
  raw_message_delivery = false

  depends_on = [aws_sqs_queue_policy.settlement_queue]
}

# ------------------------------------------------------------------------------
# CloudWatch Alarms for Queue Monitoring
# ------------------------------------------------------------------------------

# Alarm for DLQ messages
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-settlement-dlq-messages"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Alert when messages appear in DLQ"
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.settlement_dlq.name
  }

  alarm_actions = var.alarm_sns_topic_arn != null ? [var.alarm_sns_topic_arn] : []

  tags = var.common_tags
}

# Alarm for queue age
resource "aws_cloudwatch_metric_alarm" "queue_age" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-settlement-queue-age"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 600 # 10 minutes
  alarm_description   = "Alert when messages are too old in queue"
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.settlement_queue.name
  }

  alarm_actions = var.alarm_sns_topic_arn != null ? [var.alarm_sns_topic_arn] : []

  tags = var.common_tags
}

# ------------------------------------------------------------------------------
# KMS Key for Encryption (optional)
# ------------------------------------------------------------------------------

resource "aws_kms_key" "sns_sqs" {
  count = var.enable_encryption ? 1 : 0

  description             = "KMS key for SNS/SQS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-sns-sqs-kms"
    }
  )
}

resource "aws_kms_alias" "sns_sqs" {
  count = var.enable_encryption ? 1 : 0

  name          = "alias/${var.project_name}-sns-sqs"
  target_key_id = aws_kms_key.sns_sqs[0].key_id
}

resource "aws_kms_key_policy" "sns_sqs" {
  count = var.enable_encryption ? 1 : 0

  key_id = aws_kms_key.sns_sqs[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow SNS to use the key"
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow SQS to use the key"
        Effect = "Allow"
        Principal = {
          Service = "sqs.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# Data Sources
# ------------------------------------------------------------------------------

data "aws_caller_identity" "current" {}