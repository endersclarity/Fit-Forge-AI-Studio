# Backend Dockerfile for FitForge Local
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for TypeScript build)
RUN npm install

# Copy source files
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
CMD ["node", "dist/server.js"]
