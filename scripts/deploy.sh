#!/bin/bash

# Deploy Tacohouse to Production
# Usage: ./deploy.sh [backend|frontend|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_TARGET="${1:-all}"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "$ENV_FILE not found. Copy from .env.production.example"
        exit 1
    fi
    
    log_info "✓ All requirements met"
}

build_shared() {
    log_info "Building shared package..."
    cd shared
    pnpm install --frozen-lockfile
    pnpm build
    cd ..
    log_info "✓ Shared package built"
}

deploy_backend() {
    log_info "Deploying backend..."
    
    docker-compose -f docker-compose.prod.yml build backend
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    log_info "Waiting for database to be ready..."
    sleep 10
    
    docker-compose -f docker-compose.prod.yml up -d backend
    
    log_info "✓ Backend deployed"
}

deploy_frontend() {
    log_info "Deploying frontend..."
    
    docker-compose -f docker-compose.prod.yml build frontend
    docker-compose -f docker-compose.prod.yml up -d frontend
    
    log_info "✓ Frontend deployed"
}

deploy_all() {
    log_info "Deploying all services..."
    
    # Build images
    docker-compose -f docker-compose.prod.yml build
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    log_info "✓ All services deployed"
}

show_status() {
    log_info "Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    log_info "Logs (last 20 lines):"
    docker-compose -f docker-compose.prod.yml logs --tail=20
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Deploy target: $DEPLOY_TARGET"
    
    check_requirements
    
    case "$DEPLOY_TARGET" in
        backend)
            deploy_backend
            ;;
        frontend)
            deploy_frontend
            ;;
        all)
            deploy_all
            ;;
        *)
            log_error "Invalid target: $DEPLOY_TARGET"
            echo "Usage: $0 [backend|frontend|all]"
            exit 1
            ;;
    esac
    
    sleep 5
    show_status
    
    log_info "Deployment completed!"
    log_info "Backend: http://localhost:3001"
    log_info "Frontend: http://localhost:3000"
}

# Run main function
main
