# ==============================================================================
# PIX Banking System - AWS Infrastructure
# ==============================================================================

# Local variables
locals {
  project_name = "${var.project_name}-${var.environment}"
  
  common_tags = merge(
    var.common_tags,
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      StudentRM   = var.student_rm
    }
  )
}

# ==============================================================================
# VPC Module
# ==============================================================================

module "vpc" {
  source = "./modules/vpc"

  project_name       = local.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  
  # NAT Gateway Configuration
  enable_nat_gateway = true
  single_nat_gateway = true  # Use single NAT to save costs (~$32/month)
  
  # VPC Flow Logs (optional - disabled by default)
  enable_flow_logs = false

  common_tags = local.common_tags
}

# ==============================================================================
# DynamoDB Module (coming next)
# ==============================================================================

module "dynamodb" {
  source = "./modules/dynamodb"

  project_name  = local.project_name
  billing_mode  = var.dynamodb_billing_mode
  common_tags   = local.common_tags
}

# ==============================================================================
# SNS/SQS Module (coming next)
# ==============================================================================

module "sns_sqs" {
  source = "./modules/sns-sqs"

  project_name = local.project_name
  common_tags  = local.common_tags
}

# ==============================================================================
# ECR Module (coming next)
# ==============================================================================

module "ecr" {
  source = "./modules/ecr"

  project_name                  = local.project_name
  image_tag_mutability          = "MUTABLE"
  scan_on_push                  = true
  enable_kms_encryption         = false  # Set to true for production
  max_image_count               = 30
  untagged_image_retention_days = 7
  
  # Allow EKS nodes to pull images (will be updated after IAM module)
  allowed_principal_arns = ["*"]  # TODO: Restrict after IAM module
  
  common_tags = local.common_tags
}

# ==============================================================================
# IAM Module (coming next)
# ==============================================================================

module "iam" {
  source = "./modules/iam"

  project_name = local.project_name
  aws_region   = var.aws_region
  
  # IRSA Configuration (disabled until EKS is created)
  enable_irsa         = false  # ← IMPORTANTE: false na primeira execução
  oidc_provider_url   = ""
  
  # Kubernetes Configuration
  kubernetes_namespace = "default"
  
  # ALB Controller (will be created after EKS)
  enable_alb_controller = true
  
  common_tags = local.common_tags
}

# ==============================================================================
# EKS Module (coming next)
# ==============================================================================

# module "eks" {
#   source = "./modules/eks"
#
#   project_name          = local.project_name
#   vpc_id                = module.vpc.vpc_id
#   private_subnet_ids    = module.vpc.private_subnet_ids
#   cluster_version       = var.eks_cluster_version
#   node_instance_type    = var.eks_node_instance_type
#   node_desired_size     = var.eks_node_desired_size
#   node_min_size         = var.eks_node_min_size
#   node_max_size         = var.eks_node_max_size
#   cluster_role_arn      = module.iam.eks_cluster_role_arn
#   node_role_arn         = module.iam.eks_node_role_arn
#   common_tags           = local.common_tags
#
#   depends_on = [module.vpc, module.iam]
# }

# ==============================================================================
# ElastiCache Module (optional - coming next)
# ==============================================================================

# module "elasticache" {
#   count  = var.enable_elasticache ? 1 : 0
#   source = "./modules/elasticache"
#
#   project_name       = local.project_name
#   vpc_id             = module.vpc.vpc_id
#   private_subnet_ids = module.vpc.private_subnet_ids
#   node_type          = var.elasticache_node_type
#   common_tags        = local.common_tags
#
#   depends_on = [module.vpc]
# }