# SNS Outputs
output "sns_topic_arn" {
  description = "SNS topic ARN"
  value       = aws_sns_topic.pix_transactions.arn
}

output "sns_topic_name" {
  description = "SNS topic name"
  value       = aws_sns_topic.pix_transactions.name
}

output "sns_topic_id" {
  description = "SNS topic ID"
  value       = aws_sns_topic.pix_transactions.id
}

# SQS Main Queue Outputs
output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = aws_sqs_queue.settlement_queue.url
}

output "sqs_queue_arn" {
  description = "SQS queue ARN"
  value       = aws_sqs_queue.settlement_queue.arn
}

output "sqs_queue_name" {
  description = "SQS queue name"
  value       = aws_sqs_queue.settlement_queue.name
}

output "sqs_queue_id" {
  description = "SQS queue ID"
  value       = aws_sqs_queue.settlement_queue.id
}

# SQS DLQ Outputs
output "sqs_dlq_url" {
  description = "SQS DLQ URL"
  value       = aws_sqs_queue.settlement_dlq.url
}

output "sqs_dlq_arn" {
  description = "SQS DLQ ARN"
  value       = aws_sqs_queue.settlement_dlq.arn
}

output "sqs_dlq_name" {
  description = "SQS DLQ name"
  value       = aws_sqs_queue.settlement_dlq.name
}

# SNS Subscription Output
output "sns_subscription_arn" {
  description = "SNS subscription ARN"
  value       = aws_sns_topic_subscription.settlement_queue.arn
}

# KMS Key Outputs
output "kms_key_id" {
  description = "KMS key ID"
  value       = var.enable_encryption ? aws_kms_key.sns_sqs[0].id : null
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = var.enable_encryption ? aws_kms_key.sns_sqs[0].arn : null
}

# CloudWatch Alarm Outputs
output "dlq_alarm_arn" {
  description = "DLQ CloudWatch alarm ARN"
  value       = var.enable_cloudwatch_alarms ? aws_cloudwatch_metric_alarm.dlq_messages[0].arn : null
}

output "queue_age_alarm_arn" {
  description = "Queue age CloudWatch alarm ARN"
  value       = var.enable_cloudwatch_alarms ? aws_cloudwatch_metric_alarm.queue_age[0].arn : null
}