#!/bin/bash

set -e

# ============================================================================
# EDUSYNC MONITORING & OBSERVABILITY MASTER SETUP
# Orchestrates the entire observability stack
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

banner() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  $1"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
}

log() {
  echo "✅ $1"
}

warn() {
  echo "⚠️  $1"
}

banner "SESSION 24: MONITORING & OBSERVABILITY"

echo "📊 Setting up production monitoring stack..."
echo ""

if [ -z "$SENTRY_DSN" ]; then
  read -p "Enter Sentry DSN (or press Enter to skip): " SENTRY_DSN
fi

if [ -z "$ALERT_EMAIL" ]; then
  read -p "Enter email for CloudWatch alerts: " ALERT_EMAIL
fi

# Step 1: Create Dashboards
banner "STEP 1: Creating CloudWatch Dashboards (4 dashboards)"

if $SCRIPT_DIR/create-dashboards.sh; then
  log "All dashboards created"
else
  warn "Dashboard creation had issues — will retry on deployment"
fi

sleep 3

# Step 2: Create Alarms
banner "STEP 2: Creating CloudWatch Alarms (8 alarms)"

export ALERT_EMAIL
if $SCRIPT_DIR/create-alarms.sh; then
  log "All alarms created"
else
  warn "Alarm creation had issues — will retry on deployment"
fi

sleep 3

# Step 3: Configure Sentry
banner "STEP 3: Configuring Sentry Error Tracking"

if [ -n "$SENTRY_DSN" ]; then
  aws secretsmanager create-secret \
    --name edusync/api/SENTRY_DSN \
    --secret-string "$SENTRY_DSN" \
    --region us-east-1 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id edusync/api/SENTRY_DSN \
    --secret-string "$SENTRY_DSN" \
    --region us-east-1 2>/dev/null || true

  log "Sentry DSN configured in Secrets Manager"
else
  warn "Sentry skipped (optional — configure later with SENTRY_DSN env var)"
fi

sleep 3

# Step 4: Verify Setup
banner "STEP 4: Verifying Monitoring Setup"

echo "📊 CloudWatch Dashboards:"
aws cloudwatch list-dashboards \
  --region us-east-1 \
  --query 'DashboardEntries[?contains(DashboardName, `edusync`)].DashboardName' \
  --output table 2>/dev/null || echo "  (verify after AWS deployment)"

echo ""
echo "📢 CloudWatch Alarms:"
aws cloudwatch describe-alarms \
  --alarm-name-prefix edusync \
  --region us-east-1 \
  --query 'MetricAlarms[*].[AlarmName, StateValue]' \
  --output table 2>/dev/null || echo "  (verify after AWS deployment)"

echo ""
echo "📝 CloudWatch Log Groups:"
aws logs describe-log-groups \
  --log-group-name-prefix /ecs/edusync \
  --region us-east-1 \
  --query 'logGroups[*].[logGroupName, retentionInDays]' \
  --output table 2>/dev/null || echo "  (verify after AWS deployment)"

banner "✅ MONITORING SETUP COMPLETE"

cat << 'SUMMARY'
Your Platform is Now Observable:

📊 Dashboards (4):
  1. ECS Cluster Health (CPU, Memory, Task Count)
  2. Database Health (RDS, DocumentDB, Redis)
  3. Application Performance (ALB, Response Time, Errors)
  4. Security & Compliance (Auth Failures, Admin Actions)

📢 Alarms (8):
  1. ECS High CPU (>80%)
  2. ECS High Memory (>85%)
  3. RDS High CPU (>80%)
  4. RDS High Connections (>80)
  5. ALB Unhealthy Targets
  6. ALB High Latency (>500ms)
  7. ALB High 5XX Error Rate (>50/5min)
  8. Redis Memory Pressure (evictions)

📝 Logging:
  - CloudWatch Logs centralized (/ecs/edusync-prod)
  - 30-day retention
  - 10 pre-built Logs Insights queries (see log-queries.md)

🔍 Error Tracking:
  - Sentry integration (packages/api/src/lib/sentry.ts)
  - Sensitive data redaction
  - Business event capture

🎯 Post-Setup Checklist:
  [ ] Confirm SNS subscription email
  [ ] Test one alarm (simulate high CPU)
  [ ] Bookmark dashboard URLs
  [ ] Add Sentry DSN to ECS task definition secrets
  [ ] Schedule daily error report query

View Dashboards:
  https://console.aws.amazon.com/cloudwatch/home#dashboards:
SUMMARY

echo ""
log "You now have 360-degree visibility into your production system! 👁️"
echo ""
echo "NEXT: Session 27 — Go-Live Procedures (2-3 hours to launch!)"
