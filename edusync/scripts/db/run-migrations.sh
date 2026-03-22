#!/bin/bash

set -e

# ============================================================================
# EDUSYNC DATABASE MIGRATIONS
# Applies all pending migrations to PostgreSQL
# ============================================================================

AWS_REGION="us-east-1"
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier edusync-postgres-prod \
  --region $AWS_REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

read -sp "PostgreSQL Password: " DB_PASSWORD
echo ""

DATABASE_URL="postgresql://postgres:$DB_PASSWORD@$DB_ENDPOINT:5432/edusync_prod"

echo "🗄️  Running PostgreSQL migrations..."

# Find all migration files
for migration in packages/db/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Applying: $(basename $migration)"
    psql "$DATABASE_URL" -f "$migration"
    if [ $? -eq 0 ]; then
      echo "✅ $(basename $migration) applied"
    else
      echo "❌ $(basename $migration) failed"
      exit 1
    fi
  fi
done

echo ""
echo "✅ All PostgreSQL migrations applied"

# Verify schema
psql "$DATABASE_URL" << 'VERIFY'
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
VERIFY

echo ""
echo "✅ Database migration complete"
