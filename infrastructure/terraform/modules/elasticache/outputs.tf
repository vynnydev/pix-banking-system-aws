# Cluster Outputs
output "redis_cluster_id" {
  description = "ElastiCache cluster ID"
  value       = aws_elasticache_cluster.redis.id
}

output "redis_cluster_arn" {
  description = "ElastiCache cluster ARN"
  value       = aws_elasticache_cluster.redis.arn
}

output "redis_endpoint" {
  description = "Redis endpoint address"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_cluster.redis.port
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.port}"
}

# Security Group
output "redis_security_group_id" {
  description = "Security group ID for Redis"
  value       = aws_security_group.redis.id
}

# Subnet Group
output "redis_subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

# Parameter Group
output "redis_parameter_group_name" {
  description = "ElastiCache parameter group name"
  value       = aws_elasticache_parameter_group.redis.name
}

# CloudWatch Alarms
output "cpu_alarm_arn" {
  description = "CPU utilization alarm ARN"
  value       = var.enable_cloudwatch_alarms ? aws_cloudwatch_metric_alarm.redis_cpu[0].arn : null
}

output "memory_alarm_arn" {
  description = "Memory utilization alarm ARN"
  value       = var.enable_cloudwatch_alarms ? aws_cloudwatch_metric_alarm.redis_memory[0].arn : null
}

output "evictions_alarm_arn" {
  description = "Evictions alarm ARN"
  value       = var.enable_cloudwatch_alarms ? aws_cloudwatch_metric_alarm.redis_evictions[0].arn : null
}