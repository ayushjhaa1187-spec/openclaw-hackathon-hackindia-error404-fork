#!/bin/bash

# ============================================================================
# EDUSYNC DATABASE MIGRATIONS & BACKUPS MASTER SCRIPT
# ============================================================================

banner() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  $1"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
}

banner "SESSION 22: DATABASE MIGRATIONS & BACKUPS"

echo "📋 Migration Checklist:"
echo "  1. PostgreSQL Schema Initialization"
echo "  2. MongoDB Index Creation"
echo "  3. Backup Configuration"
echo "  4. Disaster Recovery Testing"
echo ""

read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 0
fi

# Step 1: PostgreSQL Migrations
banner "STEP 1: PostgreSQL Schema Initialization"

./scripts/db/run-migrations.sh

if [ $? -ne 0 ]; then
  echo "❌ PostgreSQL migrations failed"
  exit 1
fi

sleep 5

# Step 2: MongoDB Indexes
banner "STEP 2: MongoDB Index Creation"

./scripts/db/apply-mongo-indexes.sh

if [ $? -ne 0 ]; then
  echo "❌ MongoDB index creation failed"
  exit 1
fi

sleep 5

# Step 3: Test Backup
banner "STEP 3: Test Backup"

read -p "Run test backup now? (yes/no): " run_backup

if [ "$run_backup" == "yes" ]; then
  ./scripts/db/backup-databases.sh
fi

sleep 5

banner "✅ SESSION 22 COMPLETE"
echo "Databases are now production-ready"
echo ""
echo "Next Steps:"
echo "  - Schedule backup cron job: (0 2 * * * /app/scripts/db/backup-databases.sh)"
echo "  - Setup CloudWatch alarms for backup failures"
echo "  - Test restore procedure monthly"
