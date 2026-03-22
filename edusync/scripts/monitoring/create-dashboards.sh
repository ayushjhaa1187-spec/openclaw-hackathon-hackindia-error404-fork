#!/bin/bash

set -e

# ============================================================================
# EDUSYNC CLOUDWATCH DASHBOARDS
# Creates production monitoring dashboards
# ============================================================================

AWS_REGION="us-east-1"
CLUSTER_NAME="edusync-prod"

echo "📊 Creating CloudWatch dashboards..."

# ============================================================================
# DASHBOARD 1: ECS SERVICES OVERVIEW
# ============================================================================
aws cloudwatch put-dashboard \
  --dashboard-name edusync-ecs-overview \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ECS", "CPUUtilization", "ClusterName", "edusync-prod", "ServiceName", "edusync-api"],
            ["...", "edusync-web"],
            ["...", "edusync-admin"]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "ECS CPU Utilization by Service",
          "yAxis": {"left": {"min": 0, "max": 100}}
        }
      },
      {
        "type": "metric",
        "x": 12, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", "edusync-prod", "ServiceName", "edusync-api"],
            ["...", "edusync-web"],
            ["...", "edusync-admin"]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "ECS Memory Utilization by Service",
          "yAxis": {"left": {"min": 0, "max": 100}}
        }
      },
      {
        "type": "metric",
        "x": 0, "y": 6, "width": 24, "height": 6,
        "properties": {
          "metrics": [
            ["ECS/ContainerInsights", "RunningTaskCount", "ClusterName", "edusync-prod", "ServiceName", "edusync-api"],
            ["...", "edusync-web"],
            ["...", "edusync-admin"],
            ["ECS/ContainerInsights", "DesiredTaskCount", "ClusterName", "edusync-prod", "ServiceName", "edusync-api"],
            ["...", "edusync-web"],
            ["...", "edusync-admin"]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "Service Task Count (Running vs Desired)"
        }
      }
    ]
  }' \
  --region $AWS_REGION

echo "✅ ECS Overview dashboard created"

# ============================================================================
# DASHBOARD 2: DATABASE HEALTH
# ============================================================================
aws cloudwatch put-dashboard \
  --dashboard-name edusync-database-health \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "edusync-postgres-prod"],
            [".", "DatabaseConnections", ".", "."]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "PostgreSQL RDS - CPU & Connections"
        }
      },
      {
        "type": "metric",
        "x": 12, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", "edusync-postgres-prod"],
            [".", "WriteLatency", ".", "."],
            [".", "FreeableMemory", ".", "."]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "PostgreSQL RDS - Latency & Memory"
        }
      },
      {
        "type": "metric",
        "x": 0, "y": 6, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/DocDB", "CPUUtilization", "DBClusterIdentifier", "edusync-documentdb-prod"],
            [".", "DatabaseConnections", ".", "."]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "DocumentDB (MongoDB) Health"
        }
      },
      {
        "type": "metric",
        "x": 12, "y": 6, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "edusync-redis-prod"],
            [".", "CacheHits", ".", "."],
            [".", "CacheMisses", ".", "."],
            [".", "Evictions", ".", "."]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "Redis ElastiCache Health"
        }
      }
    ]
  }' \
  --region $AWS_REGION

echo "✅ Database Health dashboard created"

# ============================================================================
# DASHBOARD 3: APPLICATION PERFORMANCE
# ============================================================================
aws cloudwatch put-dashboard \
  --dashboard-name edusync-app-performance \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/edusync-prod-alb/placeholder", {"stat": "Sum"}],
            [".", "TargetResponseTime", ".", ".", {"stat": "Average"}]
          ],
          "period": 60,
          "region": "us-east-1",
          "title": "ALB Request Count & Response Time"
        }
      },
      {
        "type": "metric",
        "x": 12, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", "app/edusync-prod-alb/placeholder", {"stat": "Sum"}],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", {"stat": "Sum"}],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", {"stat": "Sum"}]
          ],
          "period": 60,
          "region": "us-east-1",
          "title": "ALB HTTP Status Codes"
        }
      },
      {
        "type": "metric",
        "x": 0, "y": 6, "width": 24, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", "targetgroup/edusync-api-tg/placeholder", "LoadBalancer", "app/edusync-prod-alb/placeholder"],
            [".", "UnHealthyHostCount", ".", ".", ".", "."],
            [".", "HealthyHostCount", "TargetGroup", "targetgroup/edusync-web-tg/placeholder", ".", "."],
            [".", "HealthyHostCount", "TargetGroup", "targetgroup/edusync-admin-tg/placeholder", ".", "."]
          ],
          "period": 60,
          "region": "us-east-1",
          "title": "Target Group Health (Healthy vs Unhealthy)"
        }
      }
    ]
  }' \
  --region $AWS_REGION

echo "✅ Application Performance dashboard created"

# ============================================================================
# DASHBOARD 4: SECURITY & COMPLIANCE
# ============================================================================
aws cloudwatch put-dashboard \
  --dashboard-name edusync-security-audit \
  --dashboard-body '{
    "widgets": [
      {
        "type": "log",
        "x": 0, "y": 0, "width": 12, "height": 6,
        "properties": {
          "query": "SOURCE \"/ecs/edusync-prod\" | fields @timestamp, @message | filter @message like /WARN|ERROR|CRITICAL/ | stats count() as Count by bin(5m)",
          "region": "us-east-1",
          "title": "Warning/Error Events Over Time"
        }
      },
      {
        "type": "log",
        "x": 12, "y": 0, "width": 12, "height": 6,
        "properties": {
          "query": "SOURCE \"/ecs/edusync-prod\" | fields @timestamp, @message | filter @message like /AUTH_FAILED|INVALID_TOKEN|RATE_LIMITED/ | stats count() as Count by bin(5m)",
          "region": "us-east-1",
          "title": "Security Events (Auth Failures, Rate Limits)"
        }
      }
    ]
  }' \
  --region $AWS_REGION

echo "✅ Security & Compliance dashboard created"

echo ""
echo "✅ ALL DASHBOARDS CREATED"
echo ""
echo "View dashboards:"
echo "  https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:"
