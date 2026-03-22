#!/bin/bash

# ============================================================================
# EDUSYNC ECS SERVICES CREATION
# Creates: 3 ECS services (API, Web, Admin) with auto-scaling
# ============================================================================

AWS_REGION="us-east-1"
CLUSTER_NAME="edusync-prod"
PRIVATE_SUBNET_1=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-private-1 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
PRIVATE_SUBNET_2=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-private-2 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
SG_PRIVATE=$(aws ec2 describe-security-groups --filter Name=group-name,Values=edusync-private-sg --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text)

# Get target group ARNs
TG_API=$(aws elbv2 describe-target-groups --names edusync-api-tg --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
TG_WEB=$(aws elbv2 describe-target-groups --names edusync-web-tg --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
TG_ADMIN=$(aws elbv2 describe-target-groups --names edusync-admin-tg --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")

if [ -z "$TG_API" ] || [ -z "$TG_WEB" ] || [ -z "$TG_ADMIN" ]; then
  echo "❌ Error: Target groups not found. Run setup-alb.sh first."
  exit 1
fi

echo "🎯 Creating ECS Services..."

# ============================================================================
# API SERVICE
# ============================================================================
echo "📦 Creating API service..."

aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name edusync-api \
  --task-definition edusync-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2],
    securityGroups=[$SG_PRIVATE],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=$TG_API,containerName=edusync-api,containerPort=3001" \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
  --enable-execute-command \
  --region $AWS_REGION \
  2>/dev/null || echo "Service edusync-api already exists"

# Create Auto Scaling Target for API
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region $AWS_REGION \
  2>/dev/null || true

# Create Auto Scaling Policy for API (CPU)
aws application-autoscaling put-scaling-policy \
  --policy-name edusync-api-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "
    TargetValue=70.0,
    PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},
    ScaleOutCooldown=60,
    ScaleInCooldown=300
  " \
  --region $AWS_REGION \
  2>/dev/null || true

# Create Auto Scaling Policy for API (Memory)
aws application-autoscaling put-scaling-policy \
  --policy-name edusync-api-memory-scaling \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "
    TargetValue=80.0,
    PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization},
    ScaleOutCooldown=60,
    ScaleInCooldown=300
  " \
  --region $AWS_REGION \
  2>/dev/null || true

echo "✅ API service created with auto-scaling"

# ============================================================================
# WEB SERVICE
# ============================================================================
echo "📦 Creating Web service..."

aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name edusync-web \
  --task-definition edusync-web:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2],
    securityGroups=[$SG_PRIVATE],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=$TG_WEB,containerName=edusync-web,containerPort=3000" \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
  --enable-execute-command \
  --region $AWS_REGION \
  2>/dev/null || echo "Service edusync-web already exists"

# Auto Scaling for Web
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-web \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region $AWS_REGION \
  2>/dev/null || true

aws application-autoscaling put-scaling-policy \
  --policy-name edusync-web-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-web \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "
    TargetValue=70.0,
    PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},
    ScaleOutCooldown=60,
    ScaleInCooldown=300
  " \
  --region $AWS_REGION \
  2>/dev/null || true

echo "✅ Web service created with auto-scaling"

# ============================================================================
# ADMIN SERVICE
# ============================================================================
echo "📦 Creating Admin service..."

aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name edusync-admin \
  --task-definition edusync-admin:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2],
    securityGroups=[$SG_PRIVATE],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=$TG_ADMIN,containerName=edusync-admin,containerPort=3002" \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
  --enable-execute-command \
  --region $AWS_REGION \
  2>/dev/null || echo "Service edusync-admin already exists"

# Auto Scaling for Admin
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-admin \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 5 \
  --region $AWS_REGION \
  2>/dev/null || true

aws application-autoscaling put-scaling-policy \
  --policy-name edusync-admin-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/edusync-admin \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "
    TargetValue=70.0,
    PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},
    ScaleOutCooldown=60,
    ScaleInCooldown=300
  " \
  --region $AWS_REGION \
  2>/dev/null || true

echo "✅ Admin service created with auto-scaling"

echo ""
echo "✅ ALL ECS SERVICES CREATED"
echo "Waiting for services to stabilize (2-3 minutes)..."

aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services edusync-api edusync-web edusync-admin \
  --region $AWS_REGION

echo ""
echo "✅ SERVICES STABLE AND READY"
echo ""
echo "Service Status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services edusync-api edusync-web edusync-admin \
  --region $AWS_REGION \
  --query 'services[*].[serviceName,desiredCount,runningCount,deploymentConfiguration.deploymentCircuitBreaker.rollback]' \
  --output table
