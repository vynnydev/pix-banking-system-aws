variable "project_name" {
  description = "Project name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS nodes"
  type        = list(string)
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "cluster_role_arn" {
  description = "IAM role ARN for EKS cluster"
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for EKS nodes"
  type        = string
}

variable "cluster_endpoint_public_access_cidrs" {
  description = "CIDR blocks allowed to access cluster endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Node Group Configuration
variable "node_instance_type" {
  description = "EC2 instance type for nodes"
  type        = string
  default     = "t3.small"  # Changed from t3.medium to t3.small
}

variable "node_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 3  # Reduced from 4 to 3
}

variable "node_disk_size" {
  description = "Disk size for nodes (GB)"
  type        = number
  default     = 30  # Reduced from 50 to 30GB
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}