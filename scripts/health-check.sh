#!/bin/bash

# Health Check Script for Production Deployment
# Usage: ./health-check.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=2

log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

check_service() {
    local url=$1
    local name=$2
    local retries=0
    
    echo -n "Checking $name... "
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_info "$name is healthy"
            return 0
        fi
        
        retries=$((retries + 1))
        sleep $RETRY_INTERVAL
        echo -n "."
    done
    
    echo ""
    log_error "$name is not responding after $MAX_RETRIES attempts"
    return 1
}

check_database() {
    echo -n "Checking database connection... "
    
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U tacohouse > /dev/null 2>&1; then
        log_info "Database is healthy"
        return 0
    else
        log_error "Database is not responding"
        return 1
    fi
}

check_redis() {
    echo -n "Checking Redis... "
    
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis is healthy"
        return 0
    else
        log_error "Redis is not responding"
        return 1
    fi
}

main() {
    echo "=========================================="
    echo "  Tacohouse Health Check"
    echo "=========================================="
    echo ""
    
    local all_healthy=true
    
    # Check infrastructure
    check_database || all_healthy=false
    check_redis || all_healthy=false
    
    # Check services
    check_service "$BACKEND_URL/health" "Backend API" || all_healthy=false
    check_service "$FRONTEND_URL" "Frontend" || all_healthy=false
    
    echo ""
    echo "=========================================="
    
    if [ "$all_healthy" = true ]; then
        log_info "All services are healthy! ✨"
        exit 0
    else
        log_error "Some services are unhealthy"
        exit 1
    fi
}

main
