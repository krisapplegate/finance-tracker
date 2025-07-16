#!/bin/sh

# Finance Tracker - Container Startup Script
set -e

echo "🚀 Starting Finance Tracker Application..."

# Create data directory if it doesn't exist
mkdir -p /app/data

# Set proper permissions
chmod 755 /app/data

# Check if database exists, if not it will be created automatically
if [ ! -f "/app/data/finance.db" ]; then
    echo "📊 Database will be initialized on first API call..."
fi

# Start the application
echo "🌟 Starting server on port $PORT..."
cd /app/backend

# Try compiled version first, then fallback to TypeScript source
if [ -f "dist/index.js" ]; then
    echo "📦 Running compiled version..."
    exec node dist/index.js
else
    echo "🔧 Running TypeScript source..."
    exec npx ts-node src/index.ts
fi