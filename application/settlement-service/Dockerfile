FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY application/shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Copy settlement-service
WORKDIR /app/settlement-service
COPY application/settlement-service/package*.json ./
RUN npm ci

COPY application/settlement-service/tsconfig.json ./
COPY application/settlement-service/src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy shared
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/shared/node_modules ./shared/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/shared/package.json ./shared/

# Copy settlement-service
COPY --from=builder --chown=nodejs:nodejs /app/settlement-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/settlement-service/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/settlement-service/package.json ./

USER nodejs

# Default command (can be overridden in Kubernetes)
CMD ["node", "dist/index.js"]