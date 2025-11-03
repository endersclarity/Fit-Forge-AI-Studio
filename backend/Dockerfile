# Backend Dockerfile for FitForge Local
# This Dockerfile is designed to run from the /backend directory as root
FROM node:20-slim

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy shared folder and root types from parent directory (needed for exercise library)
COPY ../shared/ ../shared/
COPY ../types.ts ../types.ts

# Copy backend source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose API port
EXPOSE 3001

# Set environment variable for database path
ENV DB_PATH=/data/fitforge.db

# Start the server from compiled output
# Note: TypeScript with rootDir="../" creates nested structure
CMD ["node", "dist/backend/server.js"]
