# ==============================================================================
# ECR Module - Container Registries
# ==============================================================================

# ------------------------------------------------------------------------------
# ECR Repositories
# ------------------------------------------------------------------------------

# List of microservices
locals {
  repositories = [
    "auth-service",
    "transaction-service",
    "settlement-service",
    "frontend"  # NextJS frontend
  ]
}

# Create ECR repositories
resource "aws_ecr_repository" "services" {
  for_each = toset(local.repositories)

  name                 = "${var.project_name}-${each.value}"
  image_tag_mutability = var.image_tag_mutability

  # Image scanning on push
  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  # Encryption configuration
  encryption_configuration {
    encryption_type = var.enable_kms_encryption ? "KMS" : "AES256"
    kms_key         = var.enable_kms_encryption ? aws_kms_key.ecr[0].arn : null
  }

  tags = merge(
    var.common_tags,
    {
      Name    = "${var.project_name}-${each.value}"
      Service = each.value
    }
  )
}

# ------------------------------------------------------------------------------
# ECR Lifecycle Policies
# ------------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "services" {
  for_each = aws_ecr_repository.services

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.max_image_count} images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = var.max_image_count
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after ${var.untagged_image_retention_days} days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.untagged_image_retention_days
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep latest images"
        selection = {
          tagStatus   = "tagged"
          tagPrefixList = ["latest"]
          countType   = "imageCountMoreThan"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# ECR Repository Policies
# ------------------------------------------------------------------------------

resource "aws_ecr_repository_policy" "services" {
  for_each = aws_ecr_repository.services

  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPull"
        Effect = "Allow"
        Principal = {
          AWS = var.allowed_principal_arns
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      },
      {
        Sid    = "AllowPush"
        Effect = "Allow"
        Principal = {
          AWS = var.allowed_principal_arns
        }
        Action = [
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# KMS Key for ECR Encryption (optional)
# ------------------------------------------------------------------------------

resource "aws_kms_key" "ecr" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for ECR encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-ecr-kms"
    }
  )
}

resource "aws_kms_alias" "ecr" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-ecr"
  target_key_id = aws_kms_key.ecr[0].key_id
}

# ------------------------------------------------------------------------------
# CloudWatch Log Group for ECR
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "ecr" {
  count = var.enable_cloudwatch_logs ? 1 : 0

  name              = "/aws/ecr/${var.project_name}"
  retention_in_days = var.log_retention_days

  tags = var.common_tags
}

# ------------------------------------------------------------------------------
# Data Sources
# ------------------------------------------------------------------------------

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}