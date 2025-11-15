# Dockerfile for the worker-only service (Render)
# Simplified: builds the full project and runs only the worker
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json tsconfig.worker.json ./

# Install all dependencies (including dev for build)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the worker
RUN npm run build:worker

# Remove dev dependencies to reduce image size
RUN npm ci --omit=dev --prefer-offline --no-audit

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
