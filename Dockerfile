# Dockerfile for the worker-only service (Render)
# Simplified: installs all deps, builds worker, then keeps only prod deps
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json tsconfig.worker.json ./

# Install ALL dependencies (including dev, needed for TypeScript build)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the worker TypeScript
RUN npm run build:worker

# Now remove dev dependencies to reduce final image size
RUN npm prune --omit=dev --prefer-offline --no-audit

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
