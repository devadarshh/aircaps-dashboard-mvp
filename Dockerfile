# Dockerfile for the worker-only service (Render)
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json tsconfig.worker.json ./

# Install ALL dependencies (with explicit flag to include dev)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the worker TypeScript directly with tsc
RUN npx tsc -p tsconfig.worker.json

# Now remove dev dependencies to reduce final image size
RUN npm prune --omit=dev --prefer-offline --no-audit

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
