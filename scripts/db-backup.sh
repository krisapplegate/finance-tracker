#!/bin/sh

# Database Backup Script
set -e

# Configuration
DB_PATH="/app/data/finance.db"
BACKUP_DIR="/app/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/finance_backup_$DATE.db"
RETENTION_DAYS=7

echo "📦 Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found at $DB_PATH"
    exit 1
fi

# Create backup using SQLite backup command
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

if [ -f "$BACKUP_FILE" ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
    # Compress backup (optional)
    if command -v gzip >/dev/null 2>&1; then
        gzip "$BACKUP_FILE"
        echo "🗜️  Backup compressed: ${BACKUP_FILE}.gz"
        BACKUP_FILE="${BACKUP_FILE}.gz"
    fi
    
    # Clean up old backups
    echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "finance_backup_*.db*" -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "📁 Available backups:"
    ls -lh "$BACKUP_DIR"/finance_backup_*.db* 2>/dev/null || echo "No backups found"
    
else
    echo "❌ Backup failed"
    exit 1
fi

echo "✅ Database backup completed successfully"