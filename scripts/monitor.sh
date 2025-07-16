#!/bin/sh

# Monitoring Script for Finance Tracker
# Runs continuous monitoring and logging

set -e

# Configuration
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-60}  # seconds
LOG_FILE="/app/logs/monitor.log"
ALERT_THRESHOLD=${ALERT_THRESHOLD:-3}  # consecutive failures before alert

# Create logs directory
mkdir -p /app/logs

# Initialize counters
consecutive_failures=0
last_alert_time=0

log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

check_system_metrics() {
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    
    # CPU usage (if available)
    if command -v top >/dev/null 2>&1; then
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//' || echo "N/A")
        log_message "METRICS" "CPU Usage: $cpu_usage"
    fi
    
    # Memory usage
    if command -v free >/dev/null 2>&1; then
        local memory_info=$(free -h | awk 'NR==2{printf "Used: %s/%s (%.0f%%)", $3,$2,$3*100/$2}')
        log_message "METRICS" "Memory $memory_info"
    fi
    
    # Disk usage
    local disk_usage=$(df -h /app/data | awk 'NR==2{printf "%s used of %s (%s)", $3,$2,$5}')
    log_message "METRICS" "Disk Usage: $disk_usage"
    
    # Database size
    if [ -f "/app/data/finance.db" ]; then
        local db_size=$(du -h /app/data/finance.db | cut -f1)
        log_message "METRICS" "Database Size: $db_size"
    fi
}

send_alert() {
    local message="$1"
    local current_time=$(date +%s)
    
    # Rate limit alerts (minimum 5 minutes between alerts)
    if [ $((current_time - last_alert_time)) -lt 300 ]; then
        log_message "ALERT" "Alert rate limited: $message"
        return
    fi
    
    log_message "ALERT" "$message"
    last_alert_time=$current_time
    
    # Send webhook alert if configured
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        local payload="{\"text\":\"🚨 Finance Tracker Alert: $message\"}"
        curl -X POST -H "Content-Type: application/json" -d "$payload" "$ALERT_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
    
    # Send email alert if configured
    if [ -n "$ALERT_EMAIL" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Finance Tracker Alert" "$ALERT_EMAIL" || true
    fi
}

monitor_loop() {
    log_message "INFO" "Starting monitoring loop (interval: ${HEALTH_CHECK_INTERVAL}s)"
    
    while true; do
        # Run health check
        if /app/scripts/health-check.sh >/dev/null 2>&1; then
            log_message "INFO" "Health check passed"
            consecutive_failures=0
            
            # Log system metrics every 10 checks (10 minutes with 60s interval)
            if [ $(($(date +%s) % 600)) -lt $HEALTH_CHECK_INTERVAL ]; then
                check_system_metrics
            fi
            
        else
            consecutive_failures=$((consecutive_failures + 1))
            log_message "WARNING" "Health check failed (consecutive failures: $consecutive_failures)"
            
            # Send alert if threshold reached
            if [ $consecutive_failures -ge $ALERT_THRESHOLD ]; then
                send_alert "Health check failed $consecutive_failures times consecutively"
            fi
        fi
        
        # Rotate logs if they get too large (>10MB)
        if [ -f "$LOG_FILE" ] && [ $(du -m "$LOG_FILE" | cut -f1) -gt 10 ]; then
            mv "$LOG_FILE" "${LOG_FILE}.old"
            log_message "INFO" "Log file rotated"
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Signal handlers for graceful shutdown
cleanup() {
    log_message "INFO" "Monitoring stopped"
    exit 0
}

trap cleanup TERM INT

# Start monitoring
log_message "INFO" "Finance Tracker monitoring started"
log_message "INFO" "Health check interval: ${HEALTH_CHECK_INTERVAL}s"
log_message "INFO" "Alert threshold: $ALERT_THRESHOLD consecutive failures"

# Run initial health check
if /app/scripts/health-check.sh; then
    log_message "INFO" "Initial health check passed"
else
    log_message "WARNING" "Initial health check failed"
fi

# Start monitoring loop
monitor_loop