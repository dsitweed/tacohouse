output "api_url" {
  description = "Public base URL for the backend API."
  value       = "${var.certificate_arn == null ? "http" : "https"}://${var.api_domain == null ? aws_lb.main.dns_name : var.api_domain}"
}

output "ecr_repository_url" {
  description = "ECR repository URL for the backend image."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name for one-off tasks."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.backend.name
}

output "ecs_task_definition_arn" {
  description = "Task definition ARN for the backend."
  value       = aws_ecs_task_definition.backend.arn
}
