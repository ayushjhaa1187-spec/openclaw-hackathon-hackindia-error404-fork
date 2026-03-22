#!/bin/bash

set -e

# ============================================================================
# EDUSYNC SECRETS SETUP
# Stores all secrets in AWS Secrets Manager for ECS task definitions
# ============================================================================

AWS_REGION="us-east-1"

echo "🔐 Setting up secrets in AWS Secrets Manager..."

# Get database endpoints
POSTGRES_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier edusync-postgres-prod \
  --region $AWS_REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text 2>/dev/null || echo "postgres.xxxxx.us-east-1.rds.amazonaws.com")

MONGO_ENDPOINT=$(aws docdb describe-db-clusters \
  --db-cluster-identifier edusync-documentdb-prod \
  --region $AWS_REGION \
  --query 'DBClusters[0].Endpoint' \
  --output text 2>/dev/null || echo "docdb.xxxxx.us-east-1.docdb.amazonaws.com")

REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id edusync-redis-prod \
  --region $AWS_REGION \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
  --output text 2>/dev/null || echo "redis.xxxxx.cache.amazonaws.com")

# Prompt for sensitive values
read -sp "PostgreSQL Password: " POSTGRES_PASS
echo ""
read -sp "MongoDB Password: " MONGO_PASS
echo ""
read -sp "JWT Secret (generate: openssl rand -base64 32): " JWT_SECRET
echo ""
read -sp "GEMINI API Key: " GEMINI_API_KEY
echo ""
read -sp "Meilisearch Master Key: " MEILISEARCH_KEY
echo ""

# Create DATABASE_URL
DATABASE_URL="postgresql://postgres:$POSTGRES_PASS@$POSTGRES_ENDPOINT:5432/edusync_prod"

# Create MONGODB_URI
MONGODB_URI="mongodb+srv://admin:$MONGO_PASS@$MONGO_ENDPOINT:27017/edusync?retryWrites=true&w=majority"

# Create REDIS_URL
REDIS_URL="redis://$REDIS_ENDPOINT:6379"

# Store secrets
echo "💾 Storing secrets..."

aws secretsmanager create-secret \
  --name edusync/api/DATABASE_URL \
  --secret-string "$DATABASE_URL" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/DATABASE_URL \
  --secret-string "$DATABASE_URL" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name edusync/api/MONGODB_URI \
  --secret-string "$MONGODB_URI" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/MONGODB_URI \
  --secret-string "$MONGODB_URI" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name edusync/api/REDIS_URL \
  --secret-string "$REDIS_URL" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/REDIS_URL \
  --secret-string "$REDIS_URL" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name edusync/api/JWT_SECRET \
  --secret-string "$JWT_SECRET" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/JWT_SECRET \
  --secret-string "$JWT_SECRET" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name edusync/api/GEMINI_API_KEY \
  --secret-string "$GEMINI_API_KEY" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/GEMINI_API_KEY \
  --secret-string "$GEMINI_API_KEY" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name edusync/api/MEILISEARCH_HOST \
  --secret-string "http://meilisearch.edusync.io" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/api/MEILISEARCH_MASTER_KEY \
  --secret-string "$MEILISEARCH_KEY" \
  --region $AWS_REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id edusync/api/MEILISEARCH_MASTER_KEY \
  --secret-string "$MEILISEARCH_KEY" \
  --region $AWS_REGION

# Web & Admin secrets
aws secretsmanager create-secret \
  --name edusync/web/NEXT_PUBLIC_API_URL \
  --secret-string "https://api.edusync.io" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/web/NEXTAUTH_SECRET \
  --secret-string "$(openssl rand -base64 32)" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/web/NEXTAUTH_URL \
  --secret-string "https://edusync.io" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/admin/NEXT_PUBLIC_API_URL \
  --secret-string "https://api.edusync.io" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/admin/NEXTAUTH_SECRET \
  --secret-string "$(openssl rand -base64 32)" \
  --region $AWS_REGION 2>/dev/null || true

aws secretsmanager create-secret \
  --name edusync/admin/NEXTAUTH_URL \
  --secret-string "https://admin.edusync.io" \
  --region $AWS_REGION 2>/dev/null || true

echo ""
echo "✅ ALL SECRETS STORED"
