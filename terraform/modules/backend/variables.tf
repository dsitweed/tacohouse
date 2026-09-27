variable "project_name" {
  description = "Prefix used to name backend resources."
  type        = string
}

variable "aws_region" {
  description = "AWS region used by the backend and log driver."
  type        = string
}

variable "frontend_url" {
  description = "Comma-separated allowed browser origins for the API."
  type        = string
}

variable "app_secrets_arn" {
  description = "Secrets Manager JSON secret ARN for JWT and Cloudflare R2 settings."
  type        = string
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN for HTTPS."
  type        = string
  default     = null
  nullable    = true
}

variable "task_cpu" {
  description = "Fargate task CPU units."
  type        = number
}

variable "task_memory" {
  description = "Fargate task memory in MiB."
  type        = number
}

variable "desired_count" {
  description = "Number of backend tasks to run."
  type        = number
}

variable "vpc_id" {
  description = "VPC ID where the ALB and ECS service run."
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB and ECS service."
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB."
  type        = string
}

variable "backend_security_group_id" {
  description = "Security group ID for ECS tasks."
  type        = string
}

variable "database_url_secret_arn" {
  description = "Secrets Manager ARN containing DATABASE_URL."
  type        = string
}

variable "tags" {
  description = "Tags applied to backend resources."
  type        = map(string)
  default     = {}
}
