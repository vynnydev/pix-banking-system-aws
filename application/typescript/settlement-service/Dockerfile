FROM node:18-alpine
WORKDIR /app
COPY settlement-service/package*.json ./
RUN npm install --production --ignore-scripts || true
COPY shared/dist ./node_modules/@pix-banking/shared/dist
COPY shared/package.json ./node_modules/@pix-banking/shared/
COPY settlement-service/dist ./dist
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]