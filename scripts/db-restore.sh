#!/bin/sh

# Database Restore Script
set -e

# Configuration
DB_PATH="/app/data/finance.db"
BACKUP_DIR="/app/data/backups"

echo "🔄 Database Restore Script"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/finance_backup_*.db* 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try looking in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "❌ Backup file not found: $BACKUP_FILE"
        echo ""
        echo "Available backups:"
        ls -lh "$BACKUP_DIR"/finance_backup_*.db* 2>/dev/null || echo "No backups found"
        exit 1
    fi
fi

echo "📦 Restoring from backup: $BACKUP_FILE"

# Create backup of current database
if [ -f "$DB_PATH" ]; then
    CURRENT_BACKUP="${DB_PATH}.backup_$(date +%Y%m%d_%H%M%S)"
    echo "💾 Creating backup of current database: $CURRENT_BACKUP"
    cp "$DB_PATH" "$CURRENT_BACKUP"
fi

# Handle compressed backups
if [ "${BACKUP_FILE##*.}" = "gz" ]; then
    echo "🗜️  Decompressing backup file..."
    TEMP_FILE="/tmp/restore_temp.db"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_SOURCE="$TEMP_FILE"
else
    RESTORE_SOURCE="$BACKUP_FILE"
fi

# Restore database
echo "🔄 Restoring database..."
cp "$RESTORE_SOURCE" "$DB_PATH"

# Clean up temporary file
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

# Verify restored database
if sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null 2>&1; then
    echo "✅ Database restored successfully"
    
    # Show database info
    echo "📊 Database information:"
    echo "  Tables: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")"
    echo "  Size: $(du -h "$DB_PATH" | cut -f1)"
    
else
    echo "❌ Database restore failed - database appears corrupted"
    
    # Restore previous database if we backed it up
    if [ -n "$CURRENT_BACKUP" ] && [ -f "$CURRENT_BACKUP" ]; then
        echo "🔄 Restoring previous database..."
        cp "$CURRENT_BACKUP" "$DB_PATH"
        echo "✅ Previous database restored"
    fi
    
    exit 1
fi

echo "✅ Database restore completed successfully"