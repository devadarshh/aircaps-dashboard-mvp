# Dockerfile for the worker-only service (Render)
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy ALL source files first
COPY . .

# Install all dependencies (dev deps needed for TypeScript build)
RUN npm install --legacy-peer-deps

# Build the worker TypeScript
RUN npm run build:worker

# Now remove dev dependencies to reduce final image size
RUN npm prune --omit=dev --prefer-offline --no-audit

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
