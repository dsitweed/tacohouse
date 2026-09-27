variable "project_name" {
  description = "Prefix used to name database resources."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the RDS subnet group."
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID allowed to access PostgreSQL."
  type        = string
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
}

variable "allocated_storage" {
  description = "Initial RDS storage size in GiB."
  type        = number
}

variable "tags" {
  description = "Tags applied to database resources."
  type        = map(string)
  default     = {}
}
