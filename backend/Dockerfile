FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app
FROM node:18-alpine AS production
RUN apk --no-cache add curl
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app ./
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
CMD ["node", "src/app.js"]
