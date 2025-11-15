# Dockerfile for the worker-only service (Render)
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy ALL source files
COPY . .

# Remove lock files to force fresh install with all deps from package.json
RUN rm -f package-lock.json npm-shrinkwrap.json

# Install all dependencies (both prod and dev)
RUN npm install

# Build the worker TypeScript
RUN npm run build:worker

# Now remove dev dependencies to reduce final image size
RUN npm prune --omit=dev

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
