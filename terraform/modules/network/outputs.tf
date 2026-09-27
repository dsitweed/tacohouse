output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs for the load balancer and ECS tasks."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs for RDS."
  value       = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  description = "Security group ID for the application load balancer."
  value       = aws_security_group.alb.id
}

output "backend_security_group_id" {
  description = "Security group ID for ECS tasks."
  value       = aws_security_group.backend.id
}

output "database_security_group_id" {
  description = "Security group ID for RDS."
  value       = aws_security_group.database.id
}
