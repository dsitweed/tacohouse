output "database_url_secret_arn" {
  description = "Secrets Manager ARN containing the generated database URL."
  value       = aws_secretsmanager_secret.database_url.arn
}

output "database_address" {
  description = "Private RDS endpoint address."
  value       = aws_db_instance.main.address
}
