# ==============================================================================
# ALB API Gateway Ingress Controller - Outputs
# ==============================================================================

# IAM Outputs
output "alb_controller_role_arn" {
  description = "IAM role ARN for ALB Ingress Controller"
  value       = aws_iam_role.alb_controller.arn
}

output "alb_controller_role_name" {
  description = "IAM role name for ALB Ingress Controller"
  value       = aws_iam_role.alb_controller.name
}

output "alb_controller_policy_arn" {
  description = "IAM policy ARN for ALB Ingress Controller"
  value       = aws_iam_policy.alb_controller.arn
}

# Configuration Info
output "ingress_class_name" {
  description = "IngressClass name to use in Ingress resources"
  value       = "alb"
}

output "controller_version" {
  description = "AWS Load Balancer Controller recommended version"
  value       = "2.6.2"
}

# Service Account Info
output "service_account_name" {
  description = "Kubernetes service account name"
  value       = "aws-load-balancer-controller"
}

output "service_account_namespace" {
  description = "Kubernetes service account namespace"
  value       = "kube-system"
}

output "cluster_name" {
  description = "EKS cluster name for ALB controller"
  value       = var.cluster_name
}

output "vpc_id" {
  description = "VPC ID for ALB controller"
  value       = var.vpc_id
}

# Installation Instructions
output "installation_commands" {
  description = "Commands to install ALB Ingress Controller manually"
  value       = <<-EOT
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║          ALB INGRESS CONTROLLER - MANUAL INSTALLATION                    ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    ⚠️  IAM Role created by Terraform, but controller installation is manual.
    
    📋 PREREQUISITES:
    ├─ kubectl configured: aws eks update-kubeconfig --region us-east-1 --name ${var.cluster_name}
    ├─ helm installed: brew install helm (or appropriate package manager)
    └─ AWS CLI configured with proper credentials
    
    🚀 INSTALLATION STEPS:
    
    1️⃣  Add EKS Helm repository:
        helm repo add eks https://aws.github.io/eks-charts
        helm repo update
    
    2️⃣  Create ServiceAccount with IRSA annotation:
        kubectl apply -f - <<EOF
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: aws-load-balancer-controller
          namespace: kube-system
          annotations:
            eks.amazonaws.com/role-arn: ${aws_iam_role.alb_controller.arn}
        EOF
    
    3️⃣  Install AWS Load Balancer Controller:
        helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
          -n kube-system \
          --set clusterName=${var.cluster_name} \
          --set serviceAccount.create=false \
          --set serviceAccount.name=aws-load-balancer-controller \
          --set region=us-east-1 \
          --set vpcId=${var.vpc_id}
    
    4️⃣  Verify installation:
        kubectl get deployment -n kube-system aws-load-balancer-controller
        kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
    
    5️⃣  Create IngressClass (if not exists):
        kubectl apply -f - <<EOF
        apiVersion: networking.k8s.io/v1
        kind: IngressClass
        metadata:
          name: alb
          annotations:
            ingressclass.kubernetes.io/is-default-class: "true"
        spec:
          controller: ingress.k8s.aws/alb
        EOF
    
    6️⃣  Verify IngressClass:
        kubectl get ingressclass
    
    ✅ READY! Now you can deploy your Ingress resources using ingressClassName: alb
    
    📝 NEXT STEPS:
    - Deploy microservices: kubectl apply -f infrastructure/kubernetes/
    - Deploy Ingress: kubectl apply -f infrastructure/kubernetes/ingress/
    - Get ALB URL: kubectl get ingress -n microservices
    
  EOT
}

output "troubleshooting" {
  description = "Common troubleshooting commands"
  value       = <<-EOT
    🔍 TROUBLESHOOTING:
    
    # Check if IAM role is correctly annotated
    kubectl describe sa aws-load-balancer-controller -n kube-system
    
    # Check controller logs
    kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail=100
    
    # Check controller events
    kubectl get events -n kube-system --sort-by='.lastTimestamp' | grep aws-load-balancer
    
    # List all IngressClasses
    kubectl get ingressclass
    
    # Describe Ingress to see events
    kubectl describe ingress <ingress-name> -n <namespace>
    
    # Check ALBs in AWS
    aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[?VpcId==`${var.vpc_id}`]'
    
    # Restart controller if needed
    kubectl rollout restart deployment aws-load-balancer-controller -n kube-system
    
    # Uninstall and reinstall if needed
    helm uninstall aws-load-balancer-controller -n kube-system
    # Then follow installation steps again
  EOT
}