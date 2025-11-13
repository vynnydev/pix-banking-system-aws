# EKS Cluster Role
output "eks_cluster_role_arn" {
  description = "EKS cluster IAM role ARN"
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_cluster_role_name" {
  description = "EKS cluster IAM role name"
  value       = aws_iam_role.eks_cluster.name
}

# EKS Node Role
output "eks_node_role_arn" {
  description = "EKS node IAM role ARN"
  value       = aws_iam_role.eks_node.arn
}

output "eks_node_role_name" {
  description = "EKS node IAM role name"
  value       = aws_iam_role.eks_node.name
}

# Microservices Policy
output "microservices_policy_arn" {
  description = "Microservices IAM policy ARN"
  value       = aws_iam_policy.microservices.arn
}

# OIDC Provider
output "oidc_provider_arn" {
  description = "OIDC provider ARN"
  value       = var.enable_irsa && length(aws_iam_openid_connect_provider.eks) > 0 ? aws_iam_openid_connect_provider.eks[0].arn : null
}

output "oidc_provider_url" {
  description = "OIDC provider URL"
  value       = var.enable_irsa && length(aws_iam_openid_connect_provider.eks) > 0 ? aws_iam_openid_connect_provider.eks[0].url : null
}

# Service Account Roles
output "auth_service_role_arn" {
  description = "Auth service IAM role ARN"
  value       = var.enable_irsa && length(aws_iam_role.auth_service) > 0 ? aws_iam_role.auth_service[0].arn : null
}

output "transaction_service_role_arn" {
  description = "Transaction service IAM role ARN"
  value       = var.enable_irsa && length(aws_iam_role.transaction_service) > 0 ? aws_iam_role.transaction_service[0].arn : null
}

output "settlement_service_role_arn" {
  description = "Settlement service IAM role ARN"
  value       = var.enable_irsa && length(aws_iam_role.settlement_service) > 0 ? aws_iam_role.settlement_service[0].arn : null
}

# ALB Controller Role
output "alb_controller_role_arn" {
  description = "ALB Controller IAM role ARN"
  value       = var.enable_alb_controller && var.enable_irsa && length(aws_iam_role.alb_controller) > 0 ? aws_iam_role.alb_controller[0].arn : null
}

output "alb_controller_role_name" {
  description = "ALB Controller IAM role name"
  value       = var.enable_alb_controller && var.enable_irsa && length(aws_iam_role.alb_controller) > 0 ? aws_iam_role.alb_controller[0].name : null
}