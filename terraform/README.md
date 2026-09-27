# Deploy the backend to AWS

Terraform is organized into reusable modules and environment roots:

```text
terraform/
├── env/
│   └── prod/       # Production root module, provider config, variables and outputs
└── modules/
   ├── backend/    # ECR, ALB, ECS/Fargate, IAM and logs
   ├── database/   # Private PostgreSQL RDS and database URL secret
   └── network/    # VPC, subnets, routes and security groups
```

The production stack provisions a VPC, public Application Load Balancer, ECS Fargate service, ECR repository, private PostgreSQL RDS instance, CloudWatch logs, and the IAM roles and security groups needed by the backend. ECS tasks run in public subnets with public IPs so they can pull from ECR without a NAT Gateway; their security group accepts application traffic only from the load balancer. RDS stays in private subnets.

## Prerequisites

- Terraform 1.6 or later and AWS CLI v2.
- AWS credentials configured for an account with permission to create VPC, ECS, ECR, RDS, IAM, ALB, Secrets Manager, and CloudWatch resources.
- A Secrets Manager **JSON** secret containing all required keys: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_PRIVATE_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_BUCKET_NAME`, and `CLOUDFLARE_R2_PUBLIC_DOMAIN`. These values are read by the backend's environment validation at startup.
- An ACM certificate in the selected region for HTTPS. It is optional for initial testing, but recommended before production traffic.

Run Terraform commands from `terraform/env/prod` (or use `terraform -chdir=terraform/env/prod`). Use a remote Terraform backend with encryption and state locking for shared or production deployments. Terraform state contains the generated RDS password and database URL secret. Do not commit `terraform.tfvars` or state files.

## First deployment

1. Create a Secrets Manager secret with the required JSON keys, then copy `terraform.tfvars.example` to `terraform.tfvars` inside `terraform/env/prod` and set the region, frontend origin, and secret ARN. Add `certificate_arn` if an ACM certificate is ready.
2. Initialize and create only ECR first:

   ```sh
   terraform -chdir=terraform/env/prod init
   terraform -chdir=terraform/env/prod apply -target=module.backend.aws_ecr_repository.backend
   ```

3. Build and push the production image from the repository root (replace the region/account values with Terraform outputs):

   ```sh
   ECR_URL=$(terraform -chdir=terraform/env/prod output -raw ecr_repository_url)
   AWS_REGION=ap-northeast-1
   AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
   docker build -f backend/Dockerfile.prod -t "${ECR_URL}:latest" backend
   docker push "${ECR_URL}:latest"
   ```

4. Provision the remaining infrastructure and start the service:

   ```sh
   terraform -chdir=terraform/env/prod apply
   ```

   The service starts with zero tasks so the database can be migrated before the API is marked healthy. Run the initial migration as a one-off task:

   ```sh
    SUBNETS=$(terraform -chdir=terraform/env/prod output -json backend_subnet_ids | jq -r 'join(",")')
    BACKEND_SG=$(terraform -chdir=terraform/env/prod output -raw backend_security_group_id)
   TASK_ARN=$(aws ecs run-task \
       --cluster "$(terraform -chdir=terraform/env/prod output -raw ecs_cluster_name)" \
       --task-definition "$(terraform -chdir=terraform/env/prod output -raw ecs_task_definition_arn)" \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$BACKEND_SG],assignPublicIp=ENABLED}" \
     --overrides '{"containerOverrides":[{"name":"backend","command":["pnpm","prisma","migrate","deploy"]}]}' \
     --query 'tasks[0].taskArn' --output text)
   aws ecs wait tasks-stopped --cluster "$(terraform -chdir=terraform/env/prod output -raw ecs_cluster_name)" --tasks "$TASK_ARN"
   aws ecs describe-tasks --cluster "$(terraform -chdir=terraform/env/prod output -raw ecs_cluster_name)" --tasks "$TASK_ARN" --query 'tasks[0].containers[0].exitCode' --output text
   ```

   Confirm the migration task exit code is `0`, set `desired_count = 1` in `terraform.tfvars`, and run `terraform -chdir=terraform/env/prod apply`. The API URL is available with `terraform -chdir=terraform/env/prod output api_url`.

For later releases, run `pnpm prisma migrate deploy` as a one-off task before deploying a schema-dependent application release. Do not run `migrate dev` against production. After pushing a new image, run `terraform -chdir=terraform/env/prod apply -replace=module.backend.aws_ecs_task_definition.backend` to register a fresh task definition and roll the service.

## Operational notes

- The API is reachable at the `api_url` output from `terraform/env/prod`; endpoints are under `/api/v1`, with Swagger at `/api/docs`.
- Without `certificate_arn`, the load balancer serves HTTP. Configure ACM before sending sensitive production traffic.
- This starter stack uses one NAT-free public ECS service and one RDS instance. For higher availability, increase `desired_count`; for private ECS networking, add NAT Gateways or VPC endpoints for ECR, Secrets Manager, and CloudWatch Logs.
- Cost-conscious defaults use RDS `db.t4g.micro` with 20 GiB storage, one-day backups, Fargate 0.25 vCPU/1 GiB, no Container Insights, 7-day log retention, and at most 3 ECR images. Free Tier eligibility depends on the AWS account plan, region, service offer, and usage; this stack is not guaranteed to be free. The ALB and Fargate can incur charges, and the ALB remains deployed even while the ECS desired count is zero. Check AWS Billing before leaving the stack running. Changing or deleting the database requires a deliberate Terraform change.
- RDS credentials and Terraform-managed secrets are in state. Store state in a private encrypted backend, restrict access, and enable state locking.


```
aws login
aws sts get-caller-identity      
eval "$(aws configure export-credentials --format env)" && terraform -chdir=terraform/env/prod plan
```