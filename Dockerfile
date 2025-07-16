# Finance Tracker - Multi-stage Docker Build
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# Stage 1: Frontend Build
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production --silent
COPY frontend/ .
RUN npm run build

# Stage 2: Backend Build
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production --silent
COPY backend/ .
RUN npm run build

# Stage 3: Production Container
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S finance-tracker -u 1001

# Create app directories
RUN mkdir -p /app/data /app/logs && \
    chown -R finance-tracker:nodejs /app

# Copy built applications
COPY --from=frontend-builder --chown=finance-tracker:nodejs /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder --chown=finance-tracker:nodejs /app/backend/dist /app/backend/dist
COPY --from=backend-builder --chown=finance-tracker:nodejs /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder --chown=finance-tracker:nodejs /app/backend/package.json /app/backend/

# Copy startup script
COPY --chown=finance-tracker:nodejs scripts/start.sh /app/scripts/
RUN chmod +x /app/scripts/start.sh

# Switch to non-root user
USER finance-tracker

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/finance.db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["/app/scripts/start.sh"]