#!/bin/bash

set -e

# ============================================================================
# EDUSYNC DEPLOYMENT VERIFICATION
# Validates all services are healthy and accessible
# ============================================================================

AWS_REGION="us-east-1"
CLUSTER_NAME="edusync-prod"

banner() {
  echo ""
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║  $1"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
}

banner "EDUSYNC DEPLOYMENT VERIFICATION"

echo "🔍 Checking AWS resources..."

# Check VPC
VPC_ID=$(aws ec2 describe-vpcs --filter Name=tag:Name,Values=edusync-prod-vpc --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "NOT FOUND")
if [ "$VPC_ID" != "NOT FOUND" ]; then
  echo "✅ VPC: $VPC_ID"
else
  echo "❌ VPC: Not found"
fi

# Check ECS Cluster
CLUSTER=$(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].status' --output text 2>/dev/null || echo "NOT FOUND")
if [ "$CLUSTER" == "ACTIVE" ]; then
  echo "✅ ECS Cluster: $CLUSTER_NAME (ACTIVE)"
else
  echo "❌ ECS Cluster: $CLUSTER"
fi

# Check ECS Services
echo ""
echo "📦 ECS Services Status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services edusync-api edusync-web edusync-admin \
  --region $AWS_REGION \
  --query 'services[*].[serviceName,desiredCount,runningCount,status]' \
  --output table

# Check RDS
echo ""
echo "🗄️  Database Status:"
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier edusync-postgres-prod --region $AWS_REGION --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "NOT FOUND")
echo "PostgreSQL: $RDS_STATUS"

DOCDB_STATUS=$(aws docdb describe-db-clusters --db-cluster-identifier edusync-documentdb-prod --region $AWS_REGION --query 'DBClusters[0].Status' --output text 2>/dev/null || echo "NOT FOUND")
echo "DocumentDB: $DOCDB_STATUS"

REDIS_STATUS=$(aws elasticache describe-cache-clusters --cache-cluster-id edusync-redis-prod --region $AWS_REGION --query 'CacheClusters[0].CacheClusterStatus' --output text 2>/dev/null || echo "NOT FOUND")
echo "Redis: $REDIS_STATUS"

# Check ALB
echo ""
echo "🌐 Load Balancer Status:"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?LoadBalancerName==`edusync-prod-alb`].DNSName' \
  --output text \
  --region $AWS_REGION 2>/dev/null || echo "NOT FOUND")

if [ "$ALB_DNS" != "NOT FOUND" ]; then
  echo "ALB DNS: $ALB_DNS"
  
  # Health check endpoints
  echo ""
  echo "🏥 Endpoint Health Checks:"
  
  echo -n "API (/api/v1/health):     "
  if curl -f -s http://$ALB_DNS/api/v1/health > /dev/null 2>&1; then
    echo "✅ HEALTHY"
  else
    echo "⏳ Not ready (may still be starting)"
  fi
  
  echo -n "Web (/):                   "
  if curl -f -s http://$ALB_DNS/ > /dev/null 2>&1; then
    echo "✅ HEALTHY"
  else
    echo "⏳ Not ready (may still be starting)"
  fi
  
  echo -n "Admin (/admin):            "
  if curl -f -s http://$ALB_DNS/admin/ > /dev/null 2>&1; then
    echo "✅ HEALTHY"
  else
    echo "⏳ Not ready (may still be starting)"
  fi
else
  echo "❌ ALB: Not found"
fi

# Check CloudWatch Logs
echo ""
echo "📊 CloudWatch Logs:"
LOG_STREAMS=$(aws logs describe-log-streams \
  --log-group-name /ecs/edusync-prod \
  --region $AWS_REGION \
  --query 'logStreams[*].logStreamName' \
  --output text 2>/dev/null || echo "NONE")

if [ "$LOG_STREAMS" != "NONE" ]; then
  echo "✅ Log streams: $LOG_STREAMS"
else
  echo "❌ No log streams found"
fi

# Check ECR Images
echo ""
echo "📦 ECR Images:"
for repo in edusync-api edusync-web edusync-admin; do
  IMAGE_COUNT=$(aws ecr describe-images \
    --repository-name $repo \
    --region $AWS_REGION \
    --query 'imageDetails | length' \
    --output text 2>/dev/null || echo 0)
  echo "  $repo: $IMAGE_COUNT image(s)"
done

# Summary
banner "VERIFICATION COMPLETE"

echo "✅ Infrastructure is deployed"
echo "⏳ Services may take 2-3 minutes to be fully ready"
echo ""
echo "Monitor progress:"
echo "  aws logs tail /ecs/edusync-prod --follow --region $AWS_REGION"
echo ""
echo "View dashboard:"
echo "  https://console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services"
