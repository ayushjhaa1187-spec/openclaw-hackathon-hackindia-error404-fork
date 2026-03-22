#!/bin/bash

set -e

# ============================================================================
# EDUSYNC DISASTER RECOVERY - RESTORE DATABASES
# Restores from S3 backup
# ============================================================================

AWS_REGION="us-east-1"
BACKUP_BUCKET="edusync-backups-prod"

banner() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  $1"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
}

error() {
  echo "❌ $1"
  exit 1
}

banner "DISASTER RECOVERY - DATABASE RESTORE"

echo "⚠️  WARNING: This will OVERWRITE all current database data!"
echo ""
read -p "Type 'RESTORE' to continue: " confirm

if [ "$confirm" != "RESTORE" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

echo ""
echo "Available backups:"
aws s3 ls s3://$BACKUP_BUCKET/ --recursive --region $AWS_REGION | grep tar.gz

echo ""
read -p "Enter backup filename (e.g., backup-2025-03-22-14-30-15.tar.gz): " backup_file

if [ -z "$backup_file" ]; then
  error "No backup file specified"
fi

# Download backup
DOWNLOAD_DIR="/tmp/edusync-restore-$$"
mkdir -p $DOWNLOAD_DIR

echo "📥 Downloading backup from S3..."
aws s3 cp s3://$BACKUP_BUCKET/$backup_file $DOWNLOAD_DIR/ \
  --region $AWS_REGION

if [ ! -f "$DOWNLOAD_DIR/$backup_file" ]; then
  error "Backup download failed"
fi

# Extract
echo "📦 Extracting backup..."
cd $DOWNLOAD_DIR
tar xzf $backup_file
rm $backup_file

# Get credentials
read -sp "PostgreSQL Password: " POSTGRES_PASS
echo ""
read -sp "MongoDB Password: " MONGO_PASS
echo ""

POSTGRES_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier edusync-postgres-prod \
  --region $AWS_REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

MONGO_ENDPOINT=$(aws docdb describe-db-clusters \
  --db-cluster-identifier edusync-documentdb-prod \
  --region $AWS_REGION \
  --query 'DBClusters[0].Endpoint' \
  --output text)

# Restore PostgreSQL
echo "🗄️  Restoring PostgreSQL..."
DATABASE_URL="postgresql://postgres:$POSTGRES_PASS@$POSTGRES_ENDPOINT:5432/edusync_prod"

# Drop existing data (BE CAREFUL!)
psql "$DATABASE_URL" << SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
SQL

# Restore dump
gunzip -c postgres-*.sql.gz | psql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL restored"
else
  error "PostgreSQL restore failed"
fi

# Restore MongoDB
echo "🗄️  Restoring MongoDB..."
MONGODB_URI="mongodb+srv://admin:$MONGO_PASS@$MONGO_ENDPOINT:27017/edusync?retryWrites=true&w=majority"

mongorestore --uri="$MONGODB_URI" mongo-*/ --drop

if [ $? -eq 0 ]; then
  echo "✅ MongoDB restored"
else
  error "MongoDB restore failed"
fi

# Cleanup
rm -rf $DOWNLOAD_DIR

banner "✅ RESTORE COMPLETE"
echo "Databases have been restored from backup"
echo "Verify data integrity before resuming operations"
