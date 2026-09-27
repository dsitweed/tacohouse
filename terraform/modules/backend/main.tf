resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the latest 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-api"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  tags = var.tags
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-backend"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/v1"
    matcher             = "200-399"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = var.tags
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.certificate_arn == null ? "forward" : "redirect"

    dynamic "forward" {
      for_each = var.certificate_arn == null ? [1] : []
      content {
        target_group {
          arn = aws_lb_target_group.backend.arn
        }
      }
    }

    dynamic "redirect" {
      for_each = var.certificate_arn == null ? [] : [1]
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count             = var.certificate_arn == null ? 0 : 1
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = var.certificate_arn
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_iam_role" "task_execution" {
  name = "${var.project_name}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "read_secrets" {
  name = "${var.project_name}-read-secrets"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [var.database_url_secret_arn, var.app_secrets_arn]
    }]
  })
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = "3000" },
      { name = "FRONTEND_URL", value = var.frontend_url },
      { name = "JWT_EXPIRES_IN", value = "15m" },
      { name = "JWT_REFRESH_EXPIRES_IN", value = "7d" },
      { name = "AUTH_EXPOSE_DEV_TOKENS", value = "false" }
    ]
    secrets = [
      { name = "DATABASE_URL", valueFrom = "${var.database_url_secret_arn}:DATABASE_URL::" },
      { name = "JWT_SECRET", valueFrom = "${var.app_secrets_arn}:JWT_SECRET::" },
      { name = "JWT_REFRESH_SECRET", valueFrom = "${var.app_secrets_arn}:JWT_REFRESH_SECRET::" },
      { name = "CLOUDFLARE_R2_ACCOUNT_ID", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_ACCOUNT_ID::" },
      { name = "CLOUDFLARE_R2_ACCESS_KEY_ID", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_ACCESS_KEY_ID::" },
      { name = "CLOUDFLARE_R2_SECRET_ACCESS_KEY", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_SECRET_ACCESS_KEY::" },
      { name = "CLOUDFLARE_R2_PRIVATE_BUCKET_NAME", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_PRIVATE_BUCKET_NAME::" },
      { name = "CLOUDFLARE_R2_PUBLIC_BUCKET_NAME", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_PUBLIC_BUCKET_NAME::" },
      { name = "CLOUDFLARE_R2_PUBLIC_DOMAIN", valueFrom = "${var.app_secrets_arn}:CLOUDFLARE_R2_PUBLIC_DOMAIN::" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])

  depends_on = [aws_iam_role_policy.read_secrets]
  tags       = var.tags
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.backend_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http, aws_iam_role_policy_attachment.task_execution]

  tags = var.tags
}
