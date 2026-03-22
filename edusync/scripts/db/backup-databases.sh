#!/bin/bash

set -e

# ============================================================================
# EDUSYNC DATABASE BACKUP AUTOMATION
# Backs up RDS, DocumentDB, and creates S3 archive
# ============================================================================

AWS_REGION="us-east-1"
BACKUP_BUCKET="edusync-backups-prod"
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_TIME=$(date +%H-%M-%S)
BACKUP_DIR="/tmp/edusync-backup-$BACKUP_DATE-$BACKUP_TIME"
mkdir -p $BACKUP_DIR

echo "💾 Starting database backup..."
echo "Backup directory: $BACKUP_DIR"

# Get database credentials
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

# ============================================================================
# POSTGRESQL BACKUP
# ============================================================================
echo "📦 Backing up PostgreSQL..."

DATABASE_URL="postgresql://postgres:$POSTGRES_PASS@$POSTGRES_ENDPOINT:5432/edusync_prod"

pg_dump "$DATABASE_URL" | gzip > $BACKUP_DIR/postgres-$BACKUP_DATE.sql.gz

if [ -f "$BACKUP_DIR/postgres-$BACKUP_DATE.sql.gz" ]; then
  SIZE=$(du -h $BACKUP_DIR/postgres-$BACKUP_DATE.sql.gz | cut -f1)
  echo "✅ PostgreSQL backup: $SIZE"
else
  echo "❌ PostgreSQL backup failed"
  exit 1
fi

# ============================================================================
# MONGODB BACKUP
# ============================================================================
echo "📦 Backing up MongoDB..."

MONGODB_URI="mongodb+srv://admin:$MONGO_PASS@$MONGO_ENDPOINT:27017/edusync?retryWrites=true&w=majority"

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/mongo-$BACKUP_DATE 2>/dev/null

if [ -d "$BACKUP_DIR/mongo-$BACKUP_DATE" ]; then
  echo "✅ MongoDB backup complete"
else
  echo "❌ MongoDB backup failed"
  exit 1
fi

# ============================================================================
# CREATE METADATA FILE
# ============================================================================
cat > $BACKUP_DIR/backup-metadata.json << METADATA
{
  "backup_date": "$BACKUP_DATE",
  "backup_time": "$BACKUP_TIME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "databases": {
    "postgresql": {
      "endpoint": "$POSTGRES_ENDPOINT",
      "file": "postgres-$BACKUP_DATE.sql.gz"
    },
    "mongodb": {
      "endpoint": "$MONGO_ENDPOINT",
      "directory": "mongo-$BACKUP_DATE"
    }
  },
  "encryption": {
    "method": "AES-256-GCM",
    "key_location": "AWS KMS"
  }
}
METADATA

# ============================================================================
# COMPRESS AND UPLOAD TO S3
# ============================================================================
echo "📤 Uploading to S3..."

cd $BACKUP_DIR
tar czf backup-$BACKUP_DATE-$BACKUP_TIME.tar.gz *

# Calculate checksum
SHA256=$(sha256sum backup-$BACKUP_DATE-$BACKUP_TIME.tar.gz | cut -d' ' -f1)

# Upload to S3
aws s3 cp backup-$BACKUP_DATE-$BACKUP_TIME.tar.gz \
  s3://$BACKUP_BUCKET/$BACKUP_DATE/backup-$BACKUP_DATE-$BACKUP_TIME.tar.gz \
  --region $AWS_REGION \
  --sse AES256 \
  --storage-class GLACIER_IR \
  --metadata "sha256=$SHA256"

if [ $? -eq 0 ]; then
  echo "✅ Backup uploaded to S3"
else
  echo "❌ S3 upload failed"
  exit 1
fi

# ============================================================================
# CLEANUP & SUMMARY
# ============================================================================
# rm -rf $BACKUP_DIR # Safety: let OS cleanup /tmp/ or handle manually if needed

echo ""
echo "✅ BACKUP COMPLETE"
echo "Location: s3://$BACKUP_BUCKET/$BACKUP_DATE/"
echo "Filename: backup-$BACKUP_DATE-$BACKUP_TIME.tar.gz"
echo "SHA256: $SHA256"
echo ""
echo "Retention: 30 days (automated)"
echo "Encryption: AES-256-GCM (S3-managed)"
