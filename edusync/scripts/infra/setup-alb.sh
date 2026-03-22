#!/bin/bash

set -e

# ============================================================================
# EDUSYNC APPLICATION LOAD BALANCER SETUP
# Creates: ALB, Target Groups, Listeners, Auto Scaling
# ============================================================================

AWS_REGION="us-east-1"
VPC_ID=$(aws ec2 describe-vpcs --filter Name=tag:Name,Values=edusync-prod-vpc --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text)
PUBLIC_SUBNET_1=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-public-1 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
PUBLIC_SUBNET_2=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-public-2 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
SG_PUBLIC=$(aws ec2 describe-security-groups --filter Name=group-name,Values=edusync-public-sg --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text)

echo "🎯 Creating Application Load Balancer..."

# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name edusync-prod-alb \
  --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
  --security-groups $SG_PUBLIC \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "✅ ALB created: $ALB_DNS"

# Create Target Groups
echo "📍 Creating target groups..."

TG_API=$(aws elbv2 create-target-group \
  --name edusync-api-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /api/v1/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

TG_WEB=$(aws elbv2 create-target-group \
  --name edusync-web-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

TG_ADMIN=$(aws elbv2 create-target-group \
  --name edusync-admin-tg \
  --protocol HTTP \
  --port 3002 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "✅ Target Groups created"

# Create Listeners
echo "📍 Creating listeners..."

# API Listener (on path /api/*)
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_WEB \
  --region $AWS_REGION > /dev/null

# Get listener ARN
LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --region $AWS_REGION \
  --query 'Listeners[0].ListenerArn' \
  --output text)

# Add path-based routing for API
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --conditions Field=path-pattern,Values=/api/* \
  --actions Type=forward,TargetGroupArn=$TG_API \
  --priority 1 \
  --region $AWS_REGION

# Add path-based routing for Admin
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --conditions Field=path-pattern,Values=/admin/* \
  --actions Type=forward,TargetGroupArn=$TG_ADMIN \
  --priority 2 \
  --region $AWS_REGION

echo "✅ Listeners and routing rules created"

echo ""
echo "✅ ALB SETUP COMPLETE"
echo "ALB DNS: $ALB_DNS"
echo "Target Groups:"
echo "  API:   $TG_API"
echo "  Web:   $TG_WEB"
echo "  Admin: $TG_ADMIN"
echo ""
echo "Routing:"
echo "  GET http://$ALB_DNS/         → Web (3000)"
echo "  GET http://$ALB_DNS/api/*    → API (3001)"
echo "  GET http://$ALB_DNS/admin/*  → Admin (3002)"
