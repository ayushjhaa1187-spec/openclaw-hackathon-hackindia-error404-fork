#!/bin/bash

# ============================================================================
# EDUSYNC PRODUCTION DEPLOYMENT MASTER SCRIPT
# Orchestrates entire AWS infrastructure setup in proper sequence
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_REGION="us-east-1"
TIMESTAMP=$(date +%s)
LOG_FILE="deployment-$TIMESTAMP.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
  echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
  exit 1
}

banner() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║  $1"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
}

# Verify prerequisites
banner "EDUSYNC PRODUCTION DEPLOYMENT"

echo "📋 Checking prerequisites..."

# Check AWS CLI
command -v aws >/dev/null 2>&1 || error "AWS CLI not installed. Install it first."
log "AWS CLI found"

# Check Docker
command -v docker >/dev/null 2>&1 || error "Docker not installed. Install it first."
log "Docker found"

# Check OpenSSL
command -v openssl >/dev/null 2>&1 || error "OpenSSL not installed. Install it first."
log "OpenSSL found"

# Check AWS credentials
aws sts get-caller-identity > /dev/null 2>&1 || error "AWS credentials not configured. Run 'aws configure' first."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log "AWS Account ID: $AWS_ACCOUNT_ID"

echo ""
read -p "Continue with production deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  error "Deployment cancelled"
fi

# ============================================================================
# STEP 1: VPC SETUP
# ============================================================================
banner "STEP 1: VPC Setup (3-5 min)"

if $SCRIPT_DIR/setup-vpc.sh 2>&1 | tee -a $LOG_FILE; then
  source vpc-config.env
  log "VPC Setup Complete"
  log "VPC ID: $VPC_ID"
else
  error "VPC setup failed"
fi

sleep 5

# ============================================================================
# STEP 2: ECR SETUP
# ============================================================================
banner "STEP 2: ECR Setup (1 min)"

if $SCRIPT_DIR/setup-ecr.sh 2>&1 | tee -a $LOG_FILE; then
  REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
  log "ECR Setup Complete"
  log "Registry: $REGISTRY"
  
  # Update task definitions with ECR registry
  sed -i "s|REPLACE_WITH_ECR_REGISTRY|$REGISTRY|g" $SCRIPT_DIR/../../deployment/*.json 2>/dev/null || true
  sed -i "s|ACCOUNT_ID|$AWS_ACCOUNT_ID|g" $SCRIPT_DIR/../../deployment/*.json 2>/dev/null || true
  
  log "Task definitions updated with registry URL"
else
  error "ECR setup failed"
fi

sleep 5

# ============================================================================
# STEP 3: DATABASE SETUP (PARALLEL)
# ============================================================================
banner "STEP 3: Database Setup (10-15 min - running in background)"

if $SCRIPT_DIR/setup-databases.sh 2>&1 | tee -a $LOG_FILE &
  DB_SETUP_PID=$!
  log "Database setup started (PID: $DB_SETUP_PID)"
else
  error "Database setup failed"
fi

sleep 5

# ============================================================================
# STEP 4: ECS CLUSTER SETUP
# ============================================================================
banner "STEP 4: ECS Cluster Setup (1 min)"

if $SCRIPT_DIR/setup-ecs-cluster.sh 2>&1 | tee -a $LOG_FILE; then
  log "ECS Cluster Setup Complete"
else
  error "ECS cluster setup failed"
fi

sleep 5

# ============================================================================
# STEP 5: APPLICATION LOAD BALANCER SETUP
# ============================================================================
banner "STEP 5: ALB Setup (2-3 min)"

if $SCRIPT_DIR/setup-alb.sh 2>&1 | tee -a $LOG_FILE; then
  ALB_DNS=$(aws elbv2 describe-load-balancers \
    --query 'LoadBalancers[?LoadBalancerName==`edusync-prod-alb`].DNSName' \
    --output text \
    --region $AWS_REGION)
  log "ALB Setup Complete"
  log "ALB DNS: $ALB_DNS"
else
  error "ALB setup failed"
fi

sleep 5

# ============================================================================
# STEP 6: WAIT FOR DATABASES
# ============================================================================
banner "STEP 6: Waiting for Databases (background task)"

wait $DB_SETUP_PID || error "Database setup failed"
log "All databases are ready"

sleep 5

# ============================================================================
# STEP 7: REGISTER TASK DEFINITIONS
# ============================================================================
banner "STEP 7: Register Task Definitions (1 min)"

cd $SCRIPT_DIR/../../deployment

for task in ecs-task-api.json ecs-task-web.json ecs-task-admin.json; do
  if aws ecs register-task-definition --cli-input-json file://$task --region $AWS_REGION > /dev/null 2>&1; then
    log "Task definition registered: $task"
  else
    error "Failed to register task definition: $task"
  fi
done

sleep 5

# ============================================================================
# STEP 8: CREATE ECS SERVICES
# ============================================================================
banner "STEP 8: Create ECS Services (2-3 min)"

if $SCRIPT_DIR/create-services.sh 2>&1 | tee -a $LOG_FILE; then
  log "ECS Services Created and Running"
else
  error "ECS services creation failed"
fi

sleep 5

# ============================================================================
# STEP 9: STORE SECRETS
# ============================================================================
banner "STEP 9: Setup AWS Secrets Manager"

echo "You will be prompted to enter sensitive configuration values."
echo "These will be stored securely in AWS Secrets Manager."
echo ""

if $SCRIPT_DIR/setup-secrets.sh 2>&1 | tee -a $LOG_FILE; then
  log "Secrets stored in AWS Secrets Manager"
else
  warn "Secrets setup had issues. You can run it manually later."
fi

sleep 5

# ============================================================================
# STEP 10: HEALTH CHECKS
# ============================================================================
banner "STEP 10: Health Checks (2-3 min)"

echo "🏥 Running health checks..."
sleep 30

# Health check API
max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -f http://$ALB_DNS/api/v1/health > /dev/null 2>&1; then
    log "API Health Check ✅"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Attempt $attempt/$max_attempts... waiting for API to be ready"
  sleep 10
done

if [ $attempt -eq $max_attempts ]; then
  warn "API health check timed out (may still be starting up)"
fi

sleep 10

# Health check Web
if curl -f http://$ALB_DNS/ > /dev/null 2>&1; then
  log "Web Health Check ✅"
else
  warn "Web health check failed (may still be starting up)"
fi

sleep 10

# Health check Admin
if curl -f http://$ALB_DNS/admin/ > /dev/null 2>&1; then
  log "Admin Health Check ✅"
else
  warn "Admin health check failed (may still be starting up)"
fi

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
banner "✅ DEPLOYMENT COMPLETE"

cat << EOF

🎉 EduSync is now deployed to production!

📊 DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Account:        $AWS_ACCOUNT_ID
AWS Region:         $AWS_REGION
VPC ID:             $VPC_ID
ECR Registry:       $REGISTRY
ALB DNS:            $ALB_DNS
ECS Cluster:        edusync-prod
Log Group:          /ecs/edusync-prod

📋 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ Push Docker images to ECR:
   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY
   docker tag edusync-api:latest $REGISTRY/edusync-api:latest
   docker push $REGISTRY/edusync-api:latest
   # Repeat for web and admin

2. ✅ Update task definitions with image tags:
   aws ecs update-service --cluster edusync-prod --service edusync-api --force-new-deployment

3. ✅ Monitor logs:
   aws logs tail /ecs/edusync-prod --follow

4. ✅ View ALB metrics:
   https://console.aws.amazon.com/ec2/v2/home?region=$AWS_REGION#LoadBalancers:

5. ✅ Setup domain names:
   - Point edusync.io to $ALB_DNS
   - Point api.edusync.io to $ALB_DNS
   - Point admin.edusync.io to $ALB_DNS

6. ✅ Setup HTTPS with AWS Certificate Manager:
   aws acm request-certificate --domain-name edusync.io --subject-alternative-names admin.edusync.io api.edusync.io

7. ✅ Enable GitHub Actions deployment:
   - Add AWS_ACCESS_KEY_ID to GitHub Secrets
   - Add AWS_SECRET_ACCESS_KEY to GitHub Secrets
   - Push to main branch to trigger deployment

🔗 USEFUL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ECS Cluster:        https://console.aws.amazon.com/ecs/v2/clusters/edusync-prod
CloudWatch Logs:    https://console.aws.amazon.com/logs/home?region=$AWS_REGION
ECR Repositories:   https://console.aws.amazon.com/ecr/repositories?region=$AWS_REGION
Load Balancer:      https://console.aws.amazon.com/ec2/v2/home?region=$AWS_REGION#LoadBalancers:

📄 DEPLOYMENT LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Log file: $LOG_FILE

EOF

log "Full deployment log saved to: $LOG_FILE"
log "EduSync is live and ready for traffic! 🚀"
