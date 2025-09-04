#!/bin/bash

# Script for creating database and files backup
# Usage: ./scripts/backup.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Creating backup for environment: $ENVIRONMENT"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if containers are running
if ! docker-compose -f "docker-compose.$ENVIRONMENT.yml" ps | grep -q "Up"; then
    echo "❌ Containers are not running. Start the application first."
    exit 1
fi

# Database backup
echo "🗄️ Creating database backup..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

if docker-compose -f "docker-compose.$ENVIRONMENT.yml" exec -T postgres pg_dump -U kelbetty_user kelbetty > "$DB_BACKUP_FILE"; then
    echo "✅ Database backup created: $DB_BACKUP_FILE"
    
    # Compress backup
    gzip "$DB_BACKUP_FILE"
    echo "📦 Backup compressed: ${DB_BACKUP_FILE}.gz"
else
    echo "❌ Error creating database backup"
    exit 1
fi

# Uploaded files backup
echo "📁 Creating uploaded files backup..."
FILES_BACKUP_FILE="$BACKUP_DIR/files_backup_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"

if docker-compose -f "docker-compose.$ENVIRONMENT.yml" exec -T app tar -czf - -C /app/public uploads > "$FILES_BACKUP_FILE"; then
    echo "✅ Files backup created: $FILES_BACKUP_FILE"
else
    echo "❌ Error creating files backup"
    exit 1
fi

# Remove old backups (older than 7 days)
echo "🧹 Removing old backups..."
find "$BACKUP_DIR" -name "db_backup_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "files_backup_${ENVIRONMENT}_*.tar.gz" -mtime +7 -delete

# Show backup information
echo ""
echo "📊 Backup information:"
echo "🗄️ Database: $(du -h "${DB_BACKUP_FILE}.gz" | cut -f1)"
echo "📁 Files: $(du -h "$FILES_BACKUP_FILE" | cut -f1)"
echo ""
echo "📋 All backups in directory $BACKUP_DIR:"
ls -lh "$BACKUP_DIR" | grep "$ENVIRONMENT"

echo ""
echo "✅ Backup completed successfully!"
echo "📅 Time: $(date)"
echo "📂 Directory: $BACKUP_DIR"
