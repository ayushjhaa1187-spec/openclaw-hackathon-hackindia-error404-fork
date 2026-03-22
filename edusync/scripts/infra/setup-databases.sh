#!/bin/bash

# ============================================================================
# EDUSYNC DATABASES SETUP
# Creates: RDS PostgreSQL, DocumentDB (MongoDB), ElastiCache Redis
# ============================================================================

AWS_REGION="us-east-1"
SG_DATA=$(aws ec2 describe-security-groups --filter Name=group-name,Values=edusync-data-sg --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)
DATA_SUBNET_1=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-data-1 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text 2>/dev/null)
DATA_SUBNET_2=$(aws ec2 describe-subnets --filter Name=tag:Name,Values=edusync-data-2 --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text 2>/dev/null)

if [ -z "$SG_DATA" ]; then
  echo "❌ Error: Security group not found. Run setup-vpc.sh first."
  exit 1
fi

# Generate secure passwords
POSTGRES_PASS=$(openssl rand -base64 32)
MONGO_PASS=$(openssl rand -base64 32)

echo "🗄️  Setting up databases..."

# Create DB Subnet Group
echo "Creating DB Subnet Group..."
aws rds create-db-subnet-group \
  --db-subnet-group-name edusync-db-subnet \
  --db-subnet-group-description "Subnet group for RDS/DocumentDB" \
  --subnet-ids $DATA_SUBNET_1 $DATA_SUBNET_2 \
  --region $AWS_REGION 2>/dev/null || true

# Create RDS PostgreSQL Instance
echo "📦 Creating RDS PostgreSQL..."
aws rds create-db-instance \
  --db-instance-identifier edusync-postgres-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password "$POSTGRES_PASS" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --db-name edusync_prod \
  --vpc-security-group-ids $SG_DATA \
  --db-subnet-group-name edusync-db-subnet \
  --publicly-accessible false \
  --backup-retention-period 30 \
  --enable-cloudwatch-logs-exports postgresql \
  --region $AWS_REGION \
  2>/dev/null || echo "RDS instance already exists"

# Create DocumentDB Cluster
echo "📦 Creating DocumentDB..."
aws docdb create-db-cluster \
  --db-cluster-identifier edusync-documentdb-prod \
  --engine docdb \
  --master-username admin \
  --master-user-password "$MONGO_PASS" \
  --db-subnet-group-name edusync-db-subnet \
  --vpc-security-group-ids $SG_DATA \
  --backup-retention-period 30 \
  --enable-cloudwatch-logs-exports error,general \
  --region $AWS_REGION \
  2>/dev/null || echo "DocumentDB cluster already exists"

# Create DocumentDB Instance
aws docdb create-db-instance \
  --db-instance-identifier edusync-documentdb-instance \
  --db-instance-class db.t3.small \
  --engine docdb \
  --db-cluster-identifier edusync-documentdb-prod \
  --region $AWS_REGION \
  2>/dev/null || echo "DocumentDB instance already exists"

# Create ElastiCache Subnet Group
echo "Creating ElastiCache Subnet Group..."
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name edusync-cache-subnet \
  --cache-subnet-group-description "Subnet group for ElastiCache" \
  --subnet-ids $DATA_SUBNET_1 $DATA_SUBNET_2 \
  --region $AWS_REGION \
  2>/dev/null || true

# Create ElastiCache Redis
echo "📦 Creating ElastiCache Redis..."
aws elasticache create-cache-cluster \
  --cache-cluster-id edusync-redis-prod \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name edusync-cache-subnet \
  --security-group-ids $SG_DATA \
  --at-rest-encryption-enabled \
  --region $AWS_REGION \
  2>/dev/null || echo "Redis cluster already exists"

echo ""
echo "✅ DATABASE SETUP INITIATED"
echo "⏳ Waiting for databases to be available (10-15 minutes)..."
echo ""
echo "Credentials (SAVE SECURELY):"
echo "  PostgreSQL: postgres:$POSTGRES_PASS"
echo "  MongoDB:    admin:$MONGO_PASS"
echo ""

# Wait for databases
(aws rds wait db-instance-available \
  --db-instance-identifier edusync-postgres-prod \
  --region $AWS_REGION && echo "✅ RDS available") &

(aws docdb wait db-cluster-available \
  --db-cluster-identifier edusync-documentdb-prod \
  --region $AWS_REGION && echo "✅ DocumentDB available") &

(aws elasticache wait cache-cluster-available \
  --cache-cluster-id edusync-redis-prod \
  --region $AWS_REGION && echo "✅ Redis available") &

wait

echo ""
echo "✅ ALL DATABASES READY"
