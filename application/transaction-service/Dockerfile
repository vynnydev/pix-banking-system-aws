FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY application/shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Copy transaction-service
WORKDIR /app/transaction-service
COPY application/transaction-service/package*.json ./
RUN npm ci

COPY application/transaction-service/tsconfig.json ./
COPY application/transaction-service/src ./src
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

# Copy transaction-service
COPY --from=builder --chown=nodejs:nodejs /app/transaction-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/transaction-service/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/transaction-service/package.json ./

USER nodejs

EXPOSE 3002

CMD ["node", "dist/index.js"]