variable "project_name" {
  description = "Project name"
  type        = string
}

variable "billing_mode" {
  description = "DynamoDB billing mode (PROVISIONED or PAY_PER_REQUEST)"
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PROVISIONED", "PAY_PER_REQUEST"], var.billing_mode)
    error_message = "Billing mode must be either PROVISIONED or PAY_PER_REQUEST."
  }
}

variable "enable_point_in_time_recovery" {
  description = "Enable point-in-time recovery for DynamoDB tables"
  type        = bool
  default     = true
}

variable "enable_ttl" {
  description = "Enable TTL for DynamoDB tables"
  type        = bool
  default     = true
}

variable "enable_auto_scaling" {
  description = "Enable auto scaling (only for PROVISIONED billing mode)"
  type        = bool
  default     = false
}

variable "read_capacity" {
  description = "Read capacity units (only for PROVISIONED billing mode)"
  type        = number
  default     = 5
}

variable "write_capacity" {
  description = "Write capacity units (only for PROVISIONED billing mode)"
  type        = number
  default     = 5
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}