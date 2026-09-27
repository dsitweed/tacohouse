output "api_url" {
  description = "Public base URL for the backend API."
  value       = module.backend.api_url
}

output "ecr_repository_url" {
  description = "ECR repository URL for the backend image."
  value       = module.backend.ecr_repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name for running one-off tasks."
  value       = module.backend.ecs_cluster_name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = module.backend.ecs_service_name
}

output "ecs_task_definition_arn" {
  description = "Task definition ARN for the backend."
  value       = module.backend.ecs_task_definition_arn
}

output "backend_subnet_ids" {
  description = "Public subnet IDs for one-off ECS tasks."
  value       = module.network.public_subnet_ids
}

output "backend_security_group_id" {
  description = "Backend task security group ID for one-off ECS tasks."
  value       = module.network.backend_security_group_id
}

output "aws_account_id" {
  description = "AWS account ID used by this deployment."
  value       = data.aws_caller_identity.current.account_id
}
