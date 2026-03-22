#!/bin/bash

set -e

# ============================================================================
# EDUSYNC MONGODB INDEX CREATION
# ============================================================================

echo "🗄️  Creating MongoDB indexes..."

read -sp "MongoDB Connection String (or press Enter for default): " MONGODB_URI
echo ""

if [ -z "$MONGODB_URI" ]; then
  # Get from AWS Secrets Manager
  MONGODB_URI=$(aws secretsmanager get-secret-value \
    --secret-id edusync/api/MONGODB_URI \
    --region us-east-1 \
    --query 'SecretString' \
    --output text 2>/dev/null)
  
  if [ -z "$MONGODB_URI" ]; then
    echo "❌ No MongoDB URI provided or found in Secrets Manager"
    exit 1
  fi
fi

# Run the index creation script
MONGODB_URI="$MONGODB_URI" node packages/db/mongo/create-indexes.js

if [ $? -eq 0 ]; then
  echo "✅ MongoDB indexes created successfully"
else
  echo "❌ MongoDB index creation failed"
  exit 1
fi
