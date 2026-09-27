variable "project_name" {
  description = "Prefix used to name network resources."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "enable_https" {
  description = "Whether to allow HTTPS traffic to the load balancer."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags applied to network resources."
  type        = map(string)
  default     = {}
}
