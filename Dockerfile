# Multi-stage Dockerfile for the worker-only service (Render)
# Builds the TypeScript worker and runs it in a loop
FROM node:20 AS builder
WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json tsconfig.worker.json ./

# Copy full repo
COPY . .

# Install all dependencies (dev needed for tsc)
RUN npm ci --prefer-offline --no-audit

# Build the worker output
RUN npm run build:worker

# Production image
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package metadata and install production deps
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit

# Copy compiled worker from builder
COPY --from=builder /app/dist-worker ./dist-worker

# Copy health check endpoint (if we add one)
COPY lib/worker-server.ts ./dist-worker/lib/worker-server.js

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
