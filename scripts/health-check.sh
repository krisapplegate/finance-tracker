#!/bin/sh

# Health Check Script for Finance Tracker
set -e

# Configuration
HOST=${HOST:-localhost}
PORT=${PORT:-3000}
TIMEOUT=${TIMEOUT:-10}
MAX_RETRIES=${MAX_RETRIES:-3}

echo "🏥 Health Check Starting..."
echo "Target: http://$HOST:$PORT/api/health"

# Function to check API health
check_api_health() {
    local response
    local http_code
    
    # Make HTTP request with timeout
    response=$(curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" "http://$HOST:$PORT/api/health" 2>/dev/null || echo -e "\nERROR")
    
    # Extract HTTP status code
    http_code=$(echo "$response" | tail -n1)
    
    # Extract response body
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ API Health Check: PASS"
        echo "📊 Response: $body"
        return 0
    else
        echo "❌ API Health Check: FAIL (HTTP: $http_code)"
        [ "$http_code" != "ERROR" ] && echo "Response: $body"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    if [ -f "/app/data/finance.db" ]; then
        if sqlite3 "/app/data/finance.db" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null 2>&1; then
            echo "✅ Database Check: PASS"
            return 0
        else
            echo "❌ Database Check: FAIL (corrupted or inaccessible)"
            return 1
        fi
    else
        echo "⚠️  Database Check: WARNING (database file not found, will be created on first use)"
        return 0
    fi
}

# Function to check disk space
check_disk_space() {
    local available_space
    local threshold=90
    
    available_space=$(df /app/data | awk 'NR==2{printf "%.0f", $5}' | sed 's/%//')
    
    if [ "$available_space" -lt "$threshold" ]; then
        echo "✅ Disk Space Check: PASS (${available_space}% used)"
        return 0
    else
        echo "❌ Disk Space Check: FAIL (${available_space}% used, threshold: ${threshold}%)"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    local memory_usage
    local threshold=90
    
    if command -v free >/dev/null 2>&1; then
        memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2 }')
        
        if [ "$memory_usage" -lt "$threshold" ]; then
            echo "✅ Memory Check: PASS (${memory_usage}% used)"
            return 0
        else
            echo "❌ Memory Check: FAIL (${memory_usage}% used, threshold: ${threshold}%)"
            return 1
        fi
    else
        echo "⚠️  Memory Check: SKIP (free command not available)"
        return 0
    fi
}

# Main health check function
run_health_checks() {
    local api_ok=0
    local db_ok=0
    local disk_ok=0
    local memory_ok=0
    local overall_status=0
    
    echo "🔍 Running comprehensive health checks..."
    echo ""
    
    # API Health Check with retries
    echo "1. API Health Check:"
    for i in $(seq 1 $MAX_RETRIES); do
        if check_api_health; then
            api_ok=1
            break
        else
            if [ $i -lt $MAX_RETRIES ]; then
                echo "   Retrying in 2 seconds... ($i/$MAX_RETRIES)"
                sleep 2
            fi
        fi
    done
    echo ""
    
    # Database Check
    echo "2. Database Check:"
    if check_database; then
        db_ok=1
    fi
    echo ""
    
    # Disk Space Check
    echo "3. Disk Space Check:"
    if check_disk_space; then
        disk_ok=1
    fi
    echo ""
    
    # Memory Check
    echo "4. Memory Check:"
    if check_memory; then
        memory_ok=1
    fi
    echo ""
    
    # Overall Status
    echo "📋 Health Check Summary:"
    echo "   API Health: $([ $api_ok -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")"
    echo "   Database: $([ $db_ok -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")"
    echo "   Disk Space: $([ $disk_ok -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")"
    echo "   Memory: $([ $memory_ok -eq 1 ] && echo "✅ PASS" || echo "❌ FAIL")"
    echo ""
    
    # Determine overall status
    if [ $api_ok -eq 1 ] && [ $db_ok -eq 1 ] && [ $disk_ok -eq 1 ] && [ $memory_ok -eq 1 ]; then
        echo "🎉 Overall Status: HEALTHY"
        overall_status=0
    else
        echo "🚨 Overall Status: UNHEALTHY"
        overall_status=1
    fi
    
    echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    
    return $overall_status
}

# Run health checks
if run_health_checks; then
    echo ""
    echo "✅ All health checks passed!"
    exit 0
else
    echo ""
    echo "❌ Some health checks failed!"
    exit 1
fi