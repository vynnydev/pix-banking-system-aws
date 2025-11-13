FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package first
COPY application/shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Copy auth-service
WORKDIR /app/auth-service
COPY application/auth-service/package*.json ./
RUN npm ci

COPY application/auth-service/tsconfig.json ./
COPY application/auth-service/src ./src
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

# Copy auth-service
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/auth-service/package.json ./

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]