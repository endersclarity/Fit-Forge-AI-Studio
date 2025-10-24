# Backend Dockerfile for FitForge Local
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose API port
EXPOSE 3001

# Set environment variable for database path
ENV DB_PATH=/data/fitforge.db

# Start the server
CMD ["node", "server.js"]
