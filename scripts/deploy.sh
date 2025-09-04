#!/bin/bash

# Script for deploying Kelbetty application
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting deployment to environment: $ENVIRONMENT"

# Check environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment. Use: staging or production"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Check for required files
if [[ ! -f ".env.$ENVIRONMENT" ]]; then
    echo "❌ File .env.$ENVIRONMENT not found!"
    echo "📝 Copy env.$ENVIRONMENT.example to .env.$ENVIRONMENT and fill in variables"
    exit 1
fi

if [[ ! -f "docker-compose.$ENVIRONMENT.yml" ]]; then
    echo "❌ File docker-compose.$ENVIRONMENT.yml not found!"
    exit 1
fi

# Copy environment variables
echo "📋 Setting up environment variables..."
cp ".env.$ENVIRONMENT" .env

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f "docker-compose.$ENVIRONMENT.yml" down

# Update images
echo "📦 Updating Docker images..."
docker-compose -f "docker-compose.$ENVIRONMENT.yml" pull

# Start services
echo "🚀 Starting services..."
docker-compose -f "docker-compose.$ENVIRONMENT.yml" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check application health
echo "🧪 Checking application health..."
if [[ "$ENVIRONMENT" == "staging" ]]; then
    HEALTH_URL="http://localhost:8080/api/test"
else
    HEALTH_URL="http://localhost/api/test"
fi

# Wait for application readiness (maximum 5 minutes)
for i in {1..30}; do
    if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
        echo "✅ Application is ready!"
        break
    fi
    
    if [[ $i -eq 30 ]]; then
        echo "❌ Application not responding after 5 minutes of waiting"
        echo "📋 Application logs:"
        docker-compose -f "docker-compose.$ENVIRONMENT.yml" logs app
        exit 1
    fi
    
    echo "⏳ Waiting... ($i/30)"
    sleep 10
done

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f "docker-compose.$ENVIRONMENT.yml" exec -T app npx prisma db push

# Check container status
echo "📊 Container status:"
docker-compose -f "docker-compose.$ENVIRONMENT.yml" ps

# Clean up old images
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo ""
echo "✅ Deployment to $ENVIRONMENT completed successfully!"
echo "🌐 URL: $HEALTH_URL"
echo ""
echo "📋 Useful commands:"
echo "   docker-compose -f docker-compose.$ENVIRONMENT.yml logs -f app"
echo "   docker-compose -f docker-compose.$ENVIRONMENT.yml restart app"
echo "   docker-compose -f docker-compose.$ENVIRONMENT.yml down"
echo ""
