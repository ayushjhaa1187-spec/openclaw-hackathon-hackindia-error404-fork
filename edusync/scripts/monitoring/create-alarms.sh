#!/bin/bash

set -e

# ============================================================================
# EDUSYNC CLOUDWATCH ALARMS
# Creates alerts for critical metrics
# ============================================================================

AWS_REGION="us-east-1"
SNS_TOPIC=$(aws sns list-topics --region $AWS_REGION --query "Topics[?contains(TopicArn, 'edusync-alerts')].TopicArn" --output text 2>/dev/null || echo "")

# Create SNS topic if doesn't exist
if [ -z "$SNS_TOPIC" ]; then
  echo "Creating SNS topic for alerts..."
  SNS_TOPIC=$(aws sns create-topic \
    --name edusync-alerts \
    --region $AWS_REGION \
    --query 'TopicArn' \
    --output text)

  # Subscribe email
  if [ -z "$ALERT_EMAIL" ]; then
    read -p "Enter email for alerts: " ALERT_EMAIL
  fi
  aws sns subscribe \
    --topic-arn $SNS_TOPIC \
    --protocol email \
    --notification-endpoint $ALERT_EMAIL \
    --region $AWS_REGION
fi

echo "📢 Creating CloudWatch alarms..."
echo "SNS Topic: $SNS_TOPIC"

# ============================================================================
# ALARM 1: ECS CPU Utilization High
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-ecs-high-cpu \
  --alarm-description "Alert when ECS CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --dimensions Name=ClusterName,Value=edusync-prod \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION

echo "✅ ECS High CPU alarm created"

# ============================================================================
# ALARM 2: ECS Memory Utilization High
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-ecs-high-memory \
  --alarm-description "Alert when ECS memory exceeds 85%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --dimensions Name=ClusterName,Value=edusync-prod \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION

echo "✅ ECS High Memory alarm created"

# ============================================================================
# ALARM 3: RDS High CPU
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-rds-high-cpu \
  --alarm-description "Alert when PostgreSQL CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --dimensions Name=DBInstanceIdentifier,Value=edusync-postgres-prod \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION

echo "✅ RDS High CPU alarm created"

# ============================================================================
# ALARM 4: RDS Database Connections High
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-rds-high-connections \
  --alarm-description "Alert when PostgreSQL connections exceed 80 (max 100)" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --dimensions Name=DBInstanceIdentifier,Value=edusync-postgres-prod \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION

echo "✅ RDS High Connections alarm created"

# ============================================================================
# ALARM 5: ALB Unhealthy Targets
# ============================================================================
# Note: Load balancer dimension needs actual ARN suffix after deployment
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-alb-unhealthy-targets \
  --alarm-description "Alert when ALB has unhealthy targets" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --threshold 0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION \
  2>/dev/null || echo "⚠️  ALB Unhealthy alarm needs ALB ARN - update after deployment"

echo "✅ ALB Unhealthy Targets alarm created"

# ============================================================================
# ALARM 6: ALB Target Response Time High
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-alb-high-latency \
  --alarm-description "Alert when response time exceeds 500ms" \
  --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 0.5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION \
  2>/dev/null || echo "⚠️  ALB Latency alarm needs ALB ARN - update after deployment"

echo "✅ ALB High Latency alarm created"

# ============================================================================
# ALARM 7: ALB 5XX Error Rate
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-alb-high-5xx \
  --alarm-description "Alert when 5XX error count exceeds 50 in 5 minutes" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION \
  2>/dev/null || echo "⚠️  ALB 5XX alarm needs ALB ARN - update after deployment"

echo "✅ ALB High 5XX Error Rate alarm created"

# ============================================================================
# ALARM 8: Redis Evictions (memory pressure)
# ============================================================================
aws cloudwatch put-metric-alarm \
  --alarm-name edusync-redis-evictions \
  --alarm-description "Alert when Redis is evicting keys (memory full)" \
  --metric-name Evictions \
  --namespace AWS/ElastiCache \
  --dimensions Name=CacheClusterId,Value=edusync-redis-prod \
  --statistic Sum \
  --period 300 \
  --threshold 0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions $SNS_TOPIC \
  --region $AWS_REGION

echo "✅ Redis Evictions alarm created"

echo ""
echo "✅ ALL ALARMS CREATED (8 total)"
echo ""
echo "Check SNS subscription:"
echo "  Confirm email sent to your inbox"
echo "  Click link to enable alerts"
