#!/bin/bash

set -e

# ============================================================================
# EDUSYNC ROLLBACK PROCEDURES
# Safely rolls back failed deployments
# ============================================================================

AWS_REGION="us-east-1"
CLUSTER_NAME="edusync-prod"

banner() {
  echo ""
  echo "⚠️  $1"
  echo ""
}

error() {
  echo "❌ $1"
  exit 1
}

banner "EDUSYNC ROLLBACK UTILITY"

echo "What do you want to rollback?"
echo "1. Rollback API service"
echo "2. Rollback Web service"
echo "3. Rollback Admin service"
echo "4. Rollback all services"
echo "5. Reset to previous task definition version"
echo ""
read -p "Choose (1-5): " choice

case $choice in
  1)
    echo "Rolling back API service..."
    aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service edusync-api \
      --force-new-deployment \
      --region $AWS_REGION
    echo "✅ API rollback initiated"
    ;;
  2)
    echo "Rolling back Web service..."
    aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service edusync-web \
      --force-new-deployment \
      --region $AWS_REGION
    echo "✅ Web rollback initiated"
    ;;
  3)
    echo "Rolling back Admin service..."
    aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service edusync-admin \
      --force-new-deployment \
      --region $AWS_REGION
    echo "✅ Admin rollback initiated"
    ;;
  4)
    echo "Rolling back all services..."
    for service in edusync-api edusync-web edusync-admin; do
      aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $service \
        --force-new-deployment \
        --region $AWS_REGION
    done
    echo "✅ All services rollback initiated"
    ;;
  5)
    echo "Available task definition versions:"
    for task in edusync-api edusync-web edusync-admin; do
      echo ""
      echo "$task:"
      aws ecs describe-task-definition \
        --task-definition $task \
        --region $AWS_REGION \
        --query 'taskDefinition.containerDefinitions[0].image' \
        --output text
    done
    ;;
  *)
    error "Invalid choice"
    ;;
esac

echo ""
echo "Waiting for services to stabilize..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services edusync-api edusync-web edusync-admin \
  --region $AWS_REGION

echo "✅ Rollback complete"
