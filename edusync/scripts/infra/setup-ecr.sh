#!/bin/bash

set -e

# ============================================================================
# EDUSYNC ECR SETUP
# Creates: ECR repositories for api, web, admin
# ============================================================================

AWS_REGION="us-east-1"

echo "🏗️  Creating ECR repositories..."

# Create repositories
for repo in edusync-api edusync-web edusync-admin; do
  aws ecr create-repository \
    --repository-name $repo \
    --region $AWS_REGION \
    --image-tag-mutability IMMUTABLE \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null || echo "Repository $repo already exists"
  
  echo "✅ ECR: $repo"
done

# Get registry URL
REGISTRY=$(aws sts get-caller-identity \
  --query Account \
  --output text).dkr.ecr.$AWS_REGION.amazonaws.com

echo ""
echo "✅ ECR SETUP COMPLETE"
echo "Registry URL: $REGISTRY"
echo ""
echo "Next: Push images to ECR"
echo "  aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY"
echo "  docker tag edusync-api:latest $REGISTRY/edusync-api:latest"
echo "  docker push $REGISTRY/edusync-api:latest"
