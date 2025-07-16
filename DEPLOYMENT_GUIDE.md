# Finance Tracker - Deployment Guide

## Quick Start

### Local Development with Docker
```bash
# Build and run the application
docker-compose up --build

# Access the application
open http://localhost:3000
```

### Production Deployment
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or direct Docker run
docker run -d \
  --name finance-tracker \
  -p 3000:3000 \
  -v finance-data:/app/data \
  -e JWT_SECRET="your-secure-secret" \
  ghcr.io/your-username/finance-tracker:latest
```

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **Docker**: Version 20.10+ with Docker Compose
- **Memory**: Minimum 512MB RAM (1GB+ recommended)
- **Disk**: 1GB free space minimum
- **Network**: Port 3000 available (or custom port via `PORT` env var)

### For CI/CD Setup
- **GitHub Account** with repository access
- **Container Registry** (GitHub Container Registry included)
- **Deployment Server** with SSH access and Docker installed

## Environment Setup

### Required Environment Variables
```bash
# Security (REQUIRED)
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters

# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_PATH=/app/data/finance.db

# Frontend (optional)
FRONTEND_URL=https://your-domain.com
```

### GitHub Secrets (for CI/CD)
Set these in your GitHub repository settings:

#### Container Registry
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

#### Deployment Servers
- `STAGING_HOST`: staging.your-domain.com
- `STAGING_USER`: deploy
- `STAGING_SSH_KEY`: SSH private key for staging server
- `PRODUCTION_HOST`: your-domain.com
- `PRODUCTION_USER`: deploy
- `PRODUCTION_SSH_KEY`: SSH private key for production server

#### Application Secrets
- `JWT_SECRET_STAGING`: JWT secret for staging environment
- `JWT_SECRET_PRODUCTION`: JWT secret for production environment

#### Optional
- `SLACK_WEBHOOK`: Slack webhook URL for deployment notifications

## Deployment Options

### Option 1: Single VPS Deployment (Recommended)

#### Server Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Deployment Script
```bash
#!/bin/bash
# deploy.sh

# Pull latest image
docker pull ghcr.io/your-username/finance-tracker:latest

# Stop existing container
docker stop finance-tracker || true
docker rm finance-tracker || true

# Run new container
docker run -d \
  --name finance-tracker \
  --restart unless-stopped \
  -p 3000:3000 \
  -v finance-tracker-data:/app/data \
  -v finance-tracker-logs:/app/logs \
  -e NODE_ENV=production \
  -e JWT_SECRET="$JWT_SECRET" \
  ghcr.io/your-username/finance-tracker:latest

# Health check
sleep 10
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

### Option 2: Cloud Container Services

#### AWS ECS
```json
{
  "family": "finance-tracker",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "finance-tracker",
      "image": "ghcr.io/your-username/finance-tracker:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:finance-tracker/jwt-secret"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "finance-data",
          "containerPath": "/app/data"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ],
  "volumes": [
    {
      "name": "finance-data",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-xxxxxxxxx"
      }
    }
  ]
}
```

#### Google Cloud Run
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: finance-tracker
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: ghcr.io/your-username/finance-tracker:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: finance-tracker-secrets
              key: jwt-secret
        volumeMounts:
        - name: finance-data
          mountPath: /app/data
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: finance-data
        persistentVolumeClaim:
          claimName: finance-tracker-pvc
```

## Database Management

### Backup Database
```bash
# Manual backup
docker exec finance-tracker /app/scripts/db-backup.sh

# Automated backup (cron job)
echo "0 2 * * * docker exec finance-tracker /app/scripts/db-backup.sh" | crontab -
```

### Restore Database
```bash
# List available backups
docker exec finance-tracker ls -la /app/data/backups/

# Restore from backup
docker exec finance-tracker /app/scripts/db-restore.sh finance_backup_20240101_120000.db.gz
```

### Database Migration
```bash
# The application automatically handles database initialization
# On first startup, it creates tables and seeds default categories
# No manual migration required for initial deployment
```

## Monitoring and Maintenance

### Health Monitoring
```bash
# Manual health check
docker exec finance-tracker /app/scripts/health-check.sh

# Continuous monitoring (if enabled)
docker exec finance-tracker /app/scripts/monitor.sh
```

### Log Management
```bash
# View application logs
docker logs finance-tracker

# View monitoring logs
docker exec finance-tracker tail -f /app/logs/monitor.log

# Export logs
docker exec finance-tracker tar -czf /tmp/logs.tar.gz /app/logs/
docker cp finance-tracker:/tmp/logs.tar.gz ./logs.tar.gz
```

### Container Management
```bash
# Update to latest version
docker pull ghcr.io/your-username/finance-tracker:latest
docker stop finance-tracker
docker rm finance-tracker
docker run -d --name finance-tracker [same options as before]

# Scale resources (if using Docker Compose)
docker-compose up --scale finance-tracker=2
```

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/finance-tracker
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

### Using Traefik (Docker Labels)
```yaml
# docker-compose.yml with Traefik
services:
  finance-tracker:
    image: ghcr.io/your-username/finance-tracker:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.finance-tracker.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.finance-tracker.tls.certresolver=letsencrypt"
      - "traefik.http.services.finance-tracker.loadbalancer.server.port=3000"
```

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs finance-tracker

# Common causes:
# 1. Missing JWT_SECRET environment variable
# 2. Port 3000 already in use
# 3. Insufficient memory
```

#### Database Issues
```bash
# Check database file permissions
docker exec finance-tracker ls -la /app/data/

# Test database connectivity
docker exec finance-tracker sqlite3 /app/data/finance.db "SELECT COUNT(*) FROM sqlite_master;"

# Restore from backup if corrupted
docker exec finance-tracker /app/scripts/db-restore.sh [backup-file]
```

#### Performance Issues
```bash
# Check resource usage
docker stats finance-tracker

# Check health status
docker exec finance-tracker /app/scripts/health-check.sh

# Scale resources
docker update --memory=1g --cpus=1.0 finance-tracker
```

### Debug Mode
```bash
# Run with debug logging
docker run -d \
  --name finance-tracker-debug \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e DEBUG=* \
  ghcr.io/your-username/finance-tracker:latest
```

## Performance Optimization

### Container Resources
```bash
# Production resource limits
docker run -d \
  --name finance-tracker \
  --memory=512m \
  --cpus=0.5 \
  --restart unless-stopped \
  ghcr.io/your-username/finance-tracker:latest
```

### Database Optimization
```bash
# SQLite performance tuning (automatic in production)
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
```

## Security Considerations

### Container Security
- Runs as non-root user (`finance-tracker`)
- Read-only filesystem except for `/app/data` and `/app/logs`
- Minimal attack surface with Alpine Linux base
- Regular security updates via automated builds

### Network Security
- Use HTTPS in production
- Configure firewall to only allow necessary ports
- Use strong JWT secrets (minimum 32 characters)
- Regular security audits via `npm audit`

### Data Security
- SQLite database file permissions restricted to application user
- Regular encrypted backups
- Sensitive data handled in memory only
- No logging of sensitive information

## Scaling Considerations

### Vertical Scaling
```bash
# Increase container resources
docker update --memory=1g --cpus=1.0 finance-tracker
```

### Horizontal Scaling
For high availability, consider:
- Load balancer (Nginx, HAProxy, or cloud LB)
- Shared database storage (NFS, EFS, or cloud storage)
- Session management (Redis or database sessions)

### Database Scaling
SQLite limitations for high-scale deployments:
- Single writer limitation
- File-based storage
- Consider PostgreSQL migration for >1000 concurrent users

## Cost Optimization

### Resource Efficiency
- Minimal Docker image (~200MB)
- Efficient SQLite database
- Shared frontend/backend container
- Automatic log rotation

### Cloud Costs
- Use spot instances for development
- Auto-scaling based on usage
- Reserved instances for production
- Monitor and optimize resource usage

This deployment guide provides comprehensive instructions for deploying the Finance Tracker application in various environments, from local development to production cloud deployments.