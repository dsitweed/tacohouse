resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db"
  subnet_ids = var.private_subnet_ids

  tags = var.tags
}

resource "random_password" "database" {
  length  = 32
  special = false
}

resource "aws_db_instance" "main" {
  identifier                      = "${var.project_name}-postgres"
  engine                          = "postgres"
  engine_version                  = "16"
  instance_class                  = var.instance_class
  allocated_storage               = var.allocated_storage
  max_allocated_storage           = var.allocated_storage + 40
  storage_type                    = "gp3"
  db_name                         = "tacohouse"
  username                        = "tacohouse"
  password                        = random_password.database.result
  db_subnet_group_name            = aws_db_subnet_group.main.name
  vpc_security_group_ids          = [var.security_group_id]
  publicly_accessible             = false
  storage_encrypted               = true
  backup_retention_period         = var.backup_retention_days
  auto_minor_version_upgrade      = true
  deletion_protection             = true
  skip_final_snapshot             = false
  final_snapshot_identifier       = "${var.project_name}-final"
  apply_immediately               = false
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = var.tags
}

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/database-url"
  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://tacohouse:${random_password.database.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/tacohouse?schema=public&sslmode=require"
  })
}
