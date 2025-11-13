# ==============================================================================
# VPC Outputs
# ==============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

# ==============================================================================
# EKS Outputs
# ==============================================================================

output "eks_cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

# ==============================================================================
# DynamoDB Outputs
# ==============================================================================

output "dynamodb_table_names" {
  description = "DynamoDB table names"
  value       = module.dynamodb.table_names
}

output "dynamodb_table_arns" {
  description = "DynamoDB table ARNs"
  value       = module.dynamodb.table_arns
}

# ==============================================================================
# SNS/SQS Outputs
# ==============================================================================

output "sns_topic_arn" {
  description = "SNS topic ARN"
  value       = module.sns_sqs.sns_topic_arn
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.sns_sqs.sqs_queue_url
}

output "sqs_queue_arn" {
  description = "SQS queue ARN"
  value       = module.sns_sqs.sqs_queue_arn
}

# ==============================================================================
# ECR Outputs
# ==============================================================================

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

# ==============================================================================
# ElastiCache Outputs
# ==============================================================================

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = var.enable_elasticache ? module.elasticache[0].redis_endpoint : null
}

output "redis_port" {
  description = "Redis port"
  value       = var.enable_elasticache ? module.elasticache[0].redis_port : null
}

# ==============================================================================
# IAM Outputs
# ==============================================================================

output "eks_node_role_arn" {
  description = "EKS node IAM role ARN"
  value       = module.iam.eks_node_role_arn
}

output "eks_cluster_role_arn" {
  description = "EKS cluster IAM role ARN"
  value       = module.iam.eks_cluster_role_arn
}

# ==============================================================================
# ALB API Gateway Ingress Controller Outputs
# ==============================================================================

output "alb_controller_role_arn" {
  description = "ALB Ingress Controller IAM role ARN"
  value       = var.enable_alb_controller ? module.alb_controller[0].alb_controller_role_arn : null
}

output "alb_controller_role_name" {
  description = "ALB Ingress Controller IAM role name"
  value       = var.enable_alb_controller ? module.alb_controller[0].alb_controller_role_name : null
}

output "alb_ingress_class" {
  description = "IngressClass name for ALB"
  value       = var.enable_alb_controller ? module.alb_controller[0].ingress_class_name : null
}

output "alb_controller_installation_commands" {
  description = "Commands to install ALB controller manually"
  value       = var.enable_alb_controller ? module.alb_controller[0].installation_commands : "ALB controller not enabled"
}

# ==============================================================================
# Quick Access Commands
# ==============================================================================

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "ecr_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecr.registry_url}"
}

# ==============================================================================
# Complete Deployment Summary
# ==============================================================================

output "deployment_summary" {
  description = "Complete deployment summary with all important information"
  value       = <<-EOT
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                   PIX BANKING SYSTEM - DEPLOYMENT SUMMARY                 ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    📋 PROJECT INFORMATION
    ├─ Project Name: ${var.project_name}
    ├─ Environment: ${var.environment}
    ├─ Region: ${var.aws_region}
    └─ Student RM: ${var.student_rm}
    
    🌐 NETWORKING
    ├─ VPC ID: ${module.vpc.vpc_id}
    ├─ VPC CIDR: ${module.vpc.vpc_cidr}
    ├─ Private Subnets: ${length(module.vpc.private_subnet_ids)} subnets
    ├─ Public Subnets: ${length(module.vpc.public_subnet_ids)} subnets
    └─ NAT Gateway: ${length(module.vpc.nat_gateway_ids)} NAT(s)
    
    🗄️  DATABASES & STORAGE
    ├─ DynamoDB Tables: ${length(module.dynamodb.table_names)} tables
    │  ├─ Users: ${module.dynamodb.table_names["users"]}
    │  ├─ Accounts: ${module.dynamodb.table_names["accounts"]}
    │  ├─ Transactions: ${module.dynamodb.table_names["transactions"]}
    │  ├─ PIX Keys: ${module.dynamodb.table_names["pixkeys"]}
    │  └─ Notifications: ${module.dynamodb.table_names["notifications"]}
    │
    └─ ElastiCache Redis: ${var.enable_elasticache ? "✅ Enabled" : "❌ Disabled"}
       ${var.enable_elasticache ? "├─ Endpoint: ${module.elasticache[0].redis_endpoint}" : ""}
       ${var.enable_elasticache ? "└─ Port: ${module.elasticache[0].redis_port}" : ""}
    
    📨 MESSAGING
    ├─ SNS Topic: ${module.sns_sqs.sns_topic_name}
    │  └─ ARN: ${module.sns_sqs.sns_topic_arn}
    │
    └─ SQS Queue: ${module.sns_sqs.sqs_queue_name}
       ├─ URL: ${module.sns_sqs.sqs_queue_url}
       └─ DLQ: ${module.sns_sqs.sqs_dlq_name}
    
    🐳 CONTAINER REGISTRY
    ├─ ECR Repositories: ${length(module.ecr.repository_names)}
    │  ├─ auth-service
    │  ├─ transaction-service
    │  ├─ settlement-service
    │  └─ frontend
    │
    └─ Login command:
       ${module.ecr.registry_url != "" ? "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecr.registry_url}" : ""}
    
    ⚙️  KUBERNETES (EKS)
    ├─ Cluster Name: ${module.eks.cluster_name}
    ├─ Cluster Endpoint: ${module.eks.cluster_endpoint}
    ├─ Cluster Version: ${module.eks.cluster_version}
    ├─ Node Group: ${module.eks.node_group_id}
    ├─ OIDC Provider: ${module.eks.cluster_oidc_issuer_url}
    │
    └─ Configure kubectl:
       ${module.eks.kubeconfig_command}
    
    🌐 API GATEWAY (ALB) - MANUAL INSTALLATION REQUIRED
    ${var.enable_alb_controller ? "├─ IAM Role: ✅ Created by Terraform" : "├─ Status: ❌ Disabled"}
    ${var.enable_alb_controller ? "├─ Role ARN: ${module.alb_controller[0].alb_controller_role_arn}" : ""}
    ${var.enable_alb_controller ? "├─ IngressClass: ${module.alb_controller[0].ingress_class_name}" : ""}
    ${var.enable_alb_controller ? "└─ 📝 Installation: Run 'terraform output alb_controller_installation_commands' for instructions" : ""}
    
    🔐 IAM ROLES
    ├─ EKS Cluster Role: ${module.iam.eks_cluster_role_name}
    ├─ EKS Node Role: ${module.iam.eks_node_role_name}
    ├─ Auth Service SA Role: ${module.iam.auth_service_role_arn != null ? "✅ Created" : "⏳ Pending IRSA"}
    ├─ Transaction Service SA Role: ${module.iam.transaction_service_role_arn != null ? "✅ Created" : "⏳ Pending IRSA"}
    ├─ Settlement Service SA Role: ${module.iam.settlement_service_role_arn != null ? "✅ Created" : "⏳ Pending IRSA"}
    └─ ALB Controller Role: ${var.enable_alb_controller ? "✅ Created" : "❌ Not created"}
    
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                              NEXT STEPS                                   ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    1️⃣  Configure kubectl:
        ${module.eks.kubeconfig_command}
    
    2️⃣  Verify cluster:
        kubectl get nodes
    
    3️⃣  Install ALB Ingress Controller (REQUIRED):
        terraform output -raw alb_controller_installation_commands
        
        # Copy and execute the commands shown above
    
    4️⃣  Prepare ConfigMaps and Secrets:
        # Edit these files with your Terraform outputs:
        # - infrastructure/kubernetes/configmap.yaml
        # - infrastructure/kubernetes/secrets.yaml
        
        # Replace placeholders:
        # <REDIS_ENDPOINT>  = ${var.enable_elasticache ? module.elasticache[0].redis_endpoint : "REDIS_NOT_ENABLED"}
        # <SNS_TOPIC_ARN>   = ${module.sns_sqs.sns_topic_arn}
        # <SQS_QUEUE_URL>   = ${module.sns_sqs.sqs_queue_url}
        # <ACCOUNT_ID>      = Your AWS Account ID
    
    5️⃣  Deploy Kubernetes resources:
        kubectl apply -f infrastructure/kubernetes/namespace/microservices-namespace.yaml
        kubectl apply -f infrastructure/kubernetes/configmap.yaml
        kubectl apply -f infrastructure/kubernetes/secrets.yaml
        kubectl apply -f infrastructure/kubernetes/rbac/
        kubectl apply -f infrastructure/kubernetes/auth-service/
        kubectl apply -f infrastructure/kubernetes/transaction-service/
        kubectl apply -f infrastructure/kubernetes/settlement-service/
    
    6️⃣  Deploy API Gateway (Ingress):
        kubectl apply -f infrastructure/kubernetes/ingress/alb-api-gateway-ingress.yaml
    
    7️⃣  Get API Gateway URL (wait 2-3 minutes):
        kubectl get ingress api-gateway -n microservices
        
        Access your API at: http://<ALB_DNS>/api/auth/health
    
8️⃣  Build and push Docker images:
        # Login to ECR
        aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecr.registry_url}
        
        # Build and push auth-service
        cd application
        docker build -f auth-service/Dockerfile -t auth-service:latest .
        docker tag auth-service:latest ${module.ecr.auth_service_url}:latest
        docker push ${module.ecr.auth_service_url}:latest
        
        # Build and push transaction-service
        docker build -f transaction-service/Dockerfile -t transaction-service:latest .
        docker tag transaction-service:latest ${module.ecr.transaction_service_url}:latest
        docker push ${module.ecr.transaction_service_url}:latest
        
        # Build and push settlement-service
        docker build -f settlement-service/Dockerfile -t settlement-service:latest .
        docker tag settlement-service:latest ${module.ecr.settlement_service_url}:latest
        docker push ${module.ecr.settlement_service_url}:latest
        
        # Build and push frontend
        docker build -f frontend/Dockerfile -t frontend:latest .
        docker tag frontend:latest ${module.ecr.frontend_url}:latest
        docker push ${module.ecr.frontend_url}:latest
    
    9️⃣  Install Rancher (optional):
        # Add cert-manager
        helm repo add jetstack https://charts.jetstack.io
        helm repo update
        kubectl create namespace cert-manager
        helm install cert-manager jetstack/cert-manager \
          --namespace cert-manager \
          --version v1.13.0 \
          --set installCRDs=true
        
        # Add rancher
        helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
        kubectl create namespace cattle-system
        helm install rancher rancher-stable/rancher \
          --namespace cattle-system \
          --set hostname=rancher.local \
          --set bootstrapPassword=Admin123! \
          --set replicas=1
    
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                          COST ESTIMATION                                  ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    Monthly costs (approximate):
    ├─ EKS Control Plane:        $72.00
    ├─ EC2 Nodes (2x t3.small):  $30.00
    ├─ NAT Gateway:              $32.00
    ├─ ALB (when deployed):      $16.00
    ├─ ElastiCache (t3.micro):   ${var.enable_elasticache ? "$12.50" : "$0.00 (disabled)"}
    ├─ DynamoDB (on-demand):      $5.00
    ├─ SNS/SQS:                   $1.00
    └─ ECR:                       $0.12
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    TOTAL:                      ~$${var.enable_elasticache ? "168.62" : "156.12"}/month
    
    💡 Tips to reduce costs:
    - Stop EKS cluster when not in use (saves $72/month)
    - Use Spot instances for nodes (save ~50% on EC2)
    - Delete NAT Gateway when testing (save $32/month)
    - Disable ElastiCache if not needed (save $12.50/month)
    
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                           CONGRATULATIONS!                                ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    🎉 Your PIX Banking System infrastructure is ready!
    
    You've successfully deployed:
    ✅ Complete VPC networking
    ✅ DynamoDB tables for data persistence
    ✅ SNS/SQS for asynchronous messaging
    ✅ ECR for container images
    ✅ EKS cluster with Kubernetes
    ${var.enable_elasticache ? "✅ ElastiCache Redis for caching" : ""}
    ✅ IAM roles with IRSA for secure access
    ✅ ALB Controller IAM role (manual installation pending)
    
    ⚠️  IMPORTANT: Don't forget to install ALB Ingress Controller manually!
        Run: terraform output -raw alb_controller_installation_commands
    
    This is a production-ready microservices architecture! 🚀
    
  EOT
}