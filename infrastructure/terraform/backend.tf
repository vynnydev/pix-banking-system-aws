# Remote state configuration
# Uncomment after creating S3 bucket manually

# terraform {
#   backend "s3" {
#     bucket         = "pix-banking-terraform-state"
#     key            = "pix-banking/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }

# For now, use local backend (default)