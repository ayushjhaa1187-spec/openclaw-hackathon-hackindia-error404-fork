#!/bin/bash

set -e

# ============================================================================
# EDUSYNC ECS CLUSTER SETUP
# Creates: ECS Cluster, CloudWatch Log Group
# ============================================================================

AWS_REGION="us-east-1"
CLUSTER_NAME="edusync-prod"

echo "🎯 Creating ECS Cluster..."

# Create ECS Cluster
aws ecs create-cluster \
  --cluster-name $CLUSTER_NAME \
  --region $AWS_REGION \
  2>/dev/null || echo "Cluster already exists"

# Create CloudWatch Log Group
aws logs create-log-group \
  --log-group-name /ecs/$CLUSTER_NAME \
  --region $AWS_REGION \
  2>/dev/null || echo "Log group already exists"

# Set retention policy (30 days)
aws logs put-retention-policy \
  --log-group-name /ecs/$CLUSTER_NAME \
  --retention-in-days 30 \
  --region $AWS_REGION

echo ""
echo "✅ ECS CLUSTER READY"
echo "Cluster: $CLUSTER_NAME"
echo "Log Group: /ecs/$CLUSTER_NAME"
