# ==============================================================================
# EKS Module - Kubernetes Cluster (SIMPLIFIED FOR COST OPTIMIZATION)
# ==============================================================================

# ------------------------------------------------------------------------------
# Data Sources
# ------------------------------------------------------------------------------

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

# ------------------------------------------------------------------------------
# EKS Cluster
# ------------------------------------------------------------------------------

resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-eks"
  role_arn = var.cluster_role_arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = var.cluster_endpoint_public_access_cidrs
    security_group_ids      = [aws_security_group.cluster.id]
  }

  # Minimal logging to save costs
  enabled_cluster_log_types = ["api"]  # Only API logs

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-eks"
    }
  )

  depends_on = [
    aws_cloudwatch_log_group.cluster
  ]
}

# ------------------------------------------------------------------------------
# CloudWatch Log Group for EKS (shorter retention)
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${var.project_name}-eks/cluster"
  retention_in_days = 3  # Reduced from 7 to 3 days

  tags = var.common_tags
}

# ------------------------------------------------------------------------------
# EKS Cluster Security Group
# ------------------------------------------------------------------------------

resource "aws_security_group" "cluster" {
  name        = "${var.project_name}-eks-cluster-sg"
  description = "Security group for EKS cluster control plane"
  vpc_id      = var.vpc_id

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-eks-cluster-sg"
    }
  )
}

resource "aws_security_group_rule" "cluster_ingress_nodes" {
  description              = "Allow nodes to communicate with cluster API"
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.node.id
}

resource "aws_security_group_rule" "cluster_egress_nodes" {
  description              = "Allow cluster API to communicate with nodes"
  type                     = "egress"
  from_port                = 1024
  to_port                  = 65535
  protocol                 = "tcp"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.node.id
}

resource "aws_security_group_rule" "cluster_egress_internet" {
  description       = "Allow cluster to communicate with internet"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.cluster.id
  cidr_blocks       = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# EKS Node Security Group
# ------------------------------------------------------------------------------

resource "aws_security_group" "node" {
  name        = "${var.project_name}-eks-node-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = var.vpc_id

  tags = merge(
    var.common_tags,
    {
      Name                                            = "${var.project_name}-eks-node-sg"
      "kubernetes.io/cluster/${var.project_name}-eks" = "owned"
    }
  )
}

resource "aws_security_group_rule" "node_ingress_self" {
  description       = "Allow nodes to communicate with each other"
  type              = "ingress"
  from_port         = 0
  to_port           = 65535
  protocol          = "-1"
  security_group_id = aws_security_group.node.id
  self              = true
}

resource "aws_security_group_rule" "node_ingress_cluster" {
  description              = "Allow nodes to receive communication from cluster API"
  type                     = "ingress"
  from_port                = 1024
  to_port                  = 65535
  protocol                 = "tcp"
  security_group_id        = aws_security_group.node.id
  source_security_group_id = aws_security_group.cluster.id
}

resource "aws_security_group_rule" "node_ingress_cluster_https" {
  description              = "Allow nodes to communicate with cluster API"
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.node.id
  source_security_group_id = aws_security_group.cluster.id
}

resource "aws_security_group_rule" "node_egress_internet" {
  description       = "Allow nodes to communicate with internet"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.node.id
  cidr_blocks       = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# EKS Node Group (SIMPLIFIED)
# ------------------------------------------------------------------------------

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-node-group"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.private_subnet_ids
  
  instance_types = [var.node_instance_type]

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  disk_size = var.node_disk_size

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-node-group"
    }
  )

  depends_on = [
    aws_eks_cluster.main
  ]

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [scaling_config[0].desired_size]
  }
}

# ------------------------------------------------------------------------------
# EKS Add-ons (ESSENTIAL ONLY)
# ------------------------------------------------------------------------------

# VPC CNI Add-on (networking) - ESSENCIAL
resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "vpc-cni"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = var.common_tags
}

# CoreDNS Add-on (DNS) - ESSENCIAL
resource "aws_eks_addon" "coredns" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "coredns"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = var.common_tags

  depends_on = [aws_eks_node_group.main]
}

# Kube-proxy Add-on (networking) - ESSENCIAL
resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "kube-proxy"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = var.common_tags
}

# ------------------------------------------------------------------------------
# OIDC Provider (for IRSA)
# ------------------------------------------------------------------------------

data "tls_certificate" "cluster" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}