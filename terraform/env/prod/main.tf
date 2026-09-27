data "aws_caller_identity" "current" {}

locals {
  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
    Env       = "prod"
  }
}

module "network" {
  source = "../../modules/network"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
  enable_https = var.certificate_arn != null
  tags         = local.tags
}

module "database" {
  source = "../../modules/database"

  project_name       = var.project_name
  private_subnet_ids = module.network.private_subnet_ids
  security_group_id  = module.network.database_security_group_id
  instance_class     = var.db_instance_class
  allocated_storage  = var.db_allocated_storage
  tags               = local.tags
}

module "backend" {
  source = "../../modules/backend"

  project_name              = var.project_name
  aws_region                = var.aws_region
  frontend_url              = var.frontend_url
  app_secrets_arn           = var.app_secrets_arn
  certificate_arn           = var.certificate_arn
  task_cpu                  = var.task_cpu
  task_memory               = var.task_memory
  desired_count             = var.desired_count
  vpc_id                    = module.network.vpc_id
  public_subnet_ids         = module.network.public_subnet_ids
  alb_security_group_id     = module.network.alb_security_group_id
  backend_security_group_id = module.network.backend_security_group_id
  database_url_secret_arn   = module.database.database_url_secret_arn
  tags                      = local.tags
}
