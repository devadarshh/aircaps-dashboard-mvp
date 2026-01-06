# Dockerfile for the Next.js application
FROM node:20-slim

WORKDIR /app



# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies (using legacy-peer-deps to bypass next-auth conflict)
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build:web

# Remove dev dependencies
RUN npm prune --omit=dev --legacy-peer-deps

# Set production environment for runtime
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
