# Table Names
output "table_names" {
  description = "Map of DynamoDB table names"
  value = {
    users         = aws_dynamodb_table.users.name
    accounts      = aws_dynamodb_table.accounts.name
    transactions  = aws_dynamodb_table.transactions.name
    pixkeys       = aws_dynamodb_table.pixkeys.name
    notifications = aws_dynamodb_table.notifications.name
  }
}

# Table ARNs
output "table_arns" {
  description = "Map of DynamoDB table ARNs"
  value = {
    users         = aws_dynamodb_table.users.arn
    accounts      = aws_dynamodb_table.accounts.arn
    transactions  = aws_dynamodb_table.transactions.arn
    pixkeys       = aws_dynamodb_table.pixkeys.arn
    notifications = aws_dynamodb_table.notifications.arn
  }
}

# Individual Table Outputs
output "users_table_name" {
  description = "Users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "Users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "accounts_table_name" {
  description = "Accounts table name"
  value       = aws_dynamodb_table.accounts.name
}

output "accounts_table_arn" {
  description = "Accounts table ARN"
  value       = aws_dynamodb_table.accounts.arn
}

output "transactions_table_name" {
  description = "Transactions table name"
  value       = aws_dynamodb_table.transactions.name
}

output "transactions_table_arn" {
  description = "Transactions table ARN"
  value       = aws_dynamodb_table.transactions.arn
}

output "pixkeys_table_name" {
  description = "PIX Keys table name"
  value       = aws_dynamodb_table.pixkeys.name
}

output "pixkeys_table_arn" {
  description = "PIX Keys table ARN"
  value       = aws_dynamodb_table.pixkeys.arn
}

output "notifications_table_name" {
  description = "Notifications table name"
  value       = aws_dynamodb_table.notifications.name
}

output "notifications_table_arn" {
  description = "Notifications table ARN"
  value       = aws_dynamodb_table.notifications.arn
}

# GSI Information
output "users_gsi_names" {
  description = "Users table GSI names"
  value       = ["EmailIndex", "CpfIndex"]
}

output "accounts_gsi_names" {
  description = "Accounts table GSI names"
  value       = ["UserIdIndex", "AccountNumberIndex"]
}

output "transactions_gsi_names" {
  description = "Transactions table GSI names"
  value       = ["AccountIdIndex", "StatusIndex"]
}

output "pixkeys_gsi_names" {
  description = "PIX Keys table GSI names"
  value       = ["AccountIdIndex", "KeyValueIndex", "KeyTypeIndex"]
}

output "notifications_gsi_names" {
  description = "Notifications table GSI names"
  value       = ["UserIdIndex", "UnreadIndex"]
}