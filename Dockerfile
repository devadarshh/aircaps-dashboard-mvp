# Dockerfile for the worker-only service (Render)
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy package files first
COPY package.json package-lock.json tsconfig.worker.json ./

# Install all dependencies from package.json (fresh, no cached lock)
RUN npm install --no-package-lock

# Copy ALL source files after deps are installed
COPY . .

# Build the worker TypeScript
RUN npm run build:worker

# Now remove dev dependencies to reduce final image size
RUN npm prune --omit=dev

# Run the compiled worker
CMD ["node", "dist-worker/lib/worker.js"]
