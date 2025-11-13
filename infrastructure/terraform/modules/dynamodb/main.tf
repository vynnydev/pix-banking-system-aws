# ==============================================================================
# DynamoDB Tables for PIX Banking System
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Users Table
# ------------------------------------------------------------------------------

resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users"
  billing_mode   = var.billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "cpf"
    type = "S"
  }

  # GSI for querying by email
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  # GSI for querying by CPF
  global_secondary_index {
    name            = "CpfIndex"
    hash_key        = "cpf"
    projection_type = "ALL"
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # TTL configuration (optional)
  ttl {
    enabled        = false
    attribute_name = ""
  }

  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project_name}-users"
      Table = "Users"
    }
  )
}

# ------------------------------------------------------------------------------
# 2. Accounts Table
# ------------------------------------------------------------------------------

resource "aws_dynamodb_table" "accounts" {
  name           = "${var.project_name}-accounts"
  billing_mode   = var.billing_mode
  hash_key       = "accountId"

  attribute {
    name = "accountId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "accountNumber"
    type = "S"
  }

  # GSI for querying by userId
  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  # GSI for querying by accountNumber
  global_secondary_index {
    name            = "AccountNumberIndex"
    hash_key        = "accountNumber"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    enabled        = false
    attribute_name = ""
  }

  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project_name}-accounts"
      Table = "Accounts"
    }
  )
}

# ------------------------------------------------------------------------------
# 3. Transactions Table
# ------------------------------------------------------------------------------

resource "aws_dynamodb_table" "transactions" {
  name           = "${var.project_name}-transactions"
  billing_mode   = var.billing_mode
  hash_key       = "transactionId"

  attribute {
    name = "transactionId"
    type = "S"
  }

  attribute {
    name = "accountId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # GSI for querying transactions by accountId
  global_secondary_index {
    name            = "AccountIdIndex"
    hash_key        = "accountId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # GSI for querying transactions by status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = true
  }

  # TTL for old transactions (optional - keep for 7 years for compliance)
  ttl {
    enabled        = var.enable_ttl
    attribute_name = "expiresAt"
  }

  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project_name}-transactions"
      Table = "Transactions"
    }
  )
}

# ------------------------------------------------------------------------------
# 4. PIX Keys Table
# ------------------------------------------------------------------------------

resource "aws_dynamodb_table" "pixkeys" {
  name           = "${var.project_name}-pixkeys"
  billing_mode   = var.billing_mode
  hash_key       = "pixKeyId"

  attribute {
    name = "pixKeyId"
    type = "S"
  }

  attribute {
    name = "accountId"
    type = "S"
  }

  attribute {
    name = "keyValue"
    type = "S"
  }

  attribute {
    name = "keyType"
    type = "S"
  }

  # GSI for querying PIX keys by accountId
  global_secondary_index {
    name            = "AccountIdIndex"
    hash_key        = "accountId"
    projection_type = "ALL"
  }

  # GSI for querying PIX keys by keyValue (for lookups)
  global_secondary_index {
    name            = "KeyValueIndex"
    hash_key        = "keyValue"
    projection_type = "ALL"
  }

  # GSI for querying PIX keys by keyType
  global_secondary_index {
    name            = "KeyTypeIndex"
    hash_key        = "keyType"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    enabled        = false
    attribute_name = ""
  }

  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project_name}-pixkeys"
      Table = "PixKeys"
    }
  )
}

# ------------------------------------------------------------------------------
# 5. Notifications Table
# ------------------------------------------------------------------------------

resource "aws_dynamodb_table" "notifications" {
  name           = "${var.project_name}-notifications"
  billing_mode   = var.billing_mode
  hash_key       = "notificationId"

  attribute {
    name = "notificationId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "isRead"
    type = "S"
  }

  # GSI for querying notifications by userId
  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # GSI for querying unread notifications
  global_secondary_index {
    name            = "UnreadIndex"
    hash_key        = "userId"
    range_key       = "isRead"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = true
  }

  # TTL for old notifications (auto-delete after 90 days)
  ttl {
    enabled        = var.enable_ttl
    attribute_name = "expiresAt"
  }

  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project_name}-notifications"
      Table = "Notifications"
    }
  )
}

# ------------------------------------------------------------------------------
# DynamoDB Auto Scaling (optional - only if using PROVISIONED billing)
# ------------------------------------------------------------------------------

# Only create auto scaling if billing mode is PROVISIONED
locals {
  enable_auto_scaling = var.billing_mode == "PROVISIONED" && var.enable_auto_scaling
}

# Auto scaling targets would go here if needed
# For PAY_PER_REQUEST, auto scaling is automatic