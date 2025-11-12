# Backend Dockerfile for FitForge Local
# Force rebuild after Root Directory fix
FROM node:20-slim

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Set working directory to project root
WORKDIR /app

# Copy package files to backend subdirectory
COPY backend/package*.json ./backend/

# Install dependencies in backend subdirectory
WORKDIR /app/backend
RUN npm install

# Return to project root to copy shared code
WORKDIR /app

# Copy shared folder and root types (needed for exercise library)
COPY shared/ ./shared/
COPY types.ts ./types.ts

# Copy backend source files (preserves directory structure)
COPY backend/ ./backend/

# Build TypeScript from backend directory
WORKDIR /app/backend
RUN npm run build

# Copy .js service files to dist (TypeScript only compiles .ts files)
RUN mkdir -p dist/backend/services && cp services/*.js dist/backend/services/

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose API port
EXPOSE 3001

# Set environment variable for database path
ENV DB_PATH=/data/fitforge.db

# Start the server from compiled output (runs from /app/backend)
# Note: TypeScript with rootDir="../" creates nested structure
CMD ["node", "dist/backend/server.js"]
