# Repository URLs
output "repository_urls" {
  description = "Map of ECR repository URLs"
  value = {
    for repo in aws_ecr_repository.services :
    repo.name => repo.repository_url
  }
}

# Repository ARNs
output "repository_arns" {
  description = "Map of ECR repository ARNs"
  value = {
    for repo in aws_ecr_repository.services :
    repo.name => repo.arn
  }
}

# Repository Names
output "repository_names" {
  description = "List of ECR repository names"
  value       = [for repo in aws_ecr_repository.services : repo.name]
}

# Registry URL
output "registry_url" {
  description = "ECR registry URL"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
}

# Registry ID
output "registry_id" {
  description = "ECR registry ID"
  value       = data.aws_caller_identity.current.account_id
}

# Individual repository outputs
output "auth_service_url" {
  description = "Auth service repository URL"
  value       = aws_ecr_repository.services["auth-service"].repository_url
}

output "transaction_service_url" {
  description = "Transaction service repository URL"
  value       = aws_ecr_repository.services["transaction-service"].repository_url
}

output "settlement_service_url" {
  description = "Settlement service repository URL"
  value       = aws_ecr_repository.services["settlement-service"].repository_url
}

output "frontend_url" {
  description = "Frontend repository URL"
  value       = aws_ecr_repository.services["frontend"].repository_url
}

# Docker commands
output "docker_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
}

output "docker_build_commands" {
  description = "Commands to build and push images"
  value = {
    for service in local.repositories :
    service => [
      "# Build ${service}",
      "docker build -f application/${service}/Dockerfile -t ${service}:latest .",
      "docker tag ${service}:latest ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.project_name}-${service}:latest",
      "docker push ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.project_name}-${service}:latest"
    ]
  }
}

# KMS Key outputs
output "kms_key_id" {
  description = "KMS key ID for ECR encryption"
  value       = var.enable_kms_encryption ? aws_kms_key.ecr[0].id : null
}

output "kms_key_arn" {
  description = "KMS key ARN for ECR encryption"
  value       = var.enable_kms_encryption ? aws_kms_key.ecr[0].arn : null
}