variable "aws_region" {
  description = "AWS region for the deployment."
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Prefix used to name AWS resources."
  type        = string
  default     = "tacohouse"
}

variable "api_domain" {
  description = "Custom DNS hostname configured for the API load balancer."
  type        = string
  default     = "api.brain.io.vn"
}

variable "vpc_cidr" {
  description = "CIDR block for the deployment VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "frontend_url" {
  description = "Comma-separated allowed browser origins for the API."
  type        = string
}

variable "auth_cookie_domain" {
  description = "Parent domain shared by the frontend and API auth cookies."
  type        = string
  default     = ".brain.io.vn"
}

variable "app_secrets_arn" {
  description = "ARN of a Secrets Manager JSON secret with JWT and required CLOUDFLARE_R2_* keys."
  type        = string
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN. When set, HTTP redirects to HTTPS."
  type        = string
  default     = null
  nullable    = true
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Initial RDS storage size in GiB."
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "RDS automated backup retention in days. Free Tier accounts may be limited to 1 day."
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Number of backend tasks to run. Set to 0 until the initial database migration is complete."
  type        = number
  default     = 0
}
