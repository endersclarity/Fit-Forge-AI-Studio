# Better-SQLite3 Runtime Error on Alpine Linux

**Status:** Identified - Not Fixed
**Created:** 2025-10-30
**Severity:** High (blocks container startup)
**Related To:** Docker containerization, NOT related to shared code architecture fix

## Problem Statement

The backend Docker container fails to start with the following error:

```
Error: Error loading shared library /app/backend/node_modules/better-sqlite3/build/Release/better_sqlite3.node: Exec format error
    at Module._extensions..node (node:internal/modules/cjs/loader:1661:18)
    at Module.load (node:internal/modules/cjs/loader:1266:32)
    ...
  code: 'ERR_DLOPEN_FAILED'
```

### When It Occurs

- **Build Phase:** ✅ Succeeds - TypeScript compiles without errors
- **Runtime Phase:** ❌ Fails - Container crashes immediately on startup when trying to load better-sqlite3
- **Development:** ✅ Works - Local development outside Docker runs fine

## Root Cause Analysis

### The Core Issue

Better-SQLite3 is a native Node.js addon that contains compiled C++ code. The binary format must match both:
1. The operating system architecture (x86_64, ARM, etc.)
2. The C standard library implementation (glibc vs musl)

### Why Alpine Linux Causes Problems

Alpine Linux uses **musl libc** instead of **glibc** (used by Debian, Ubuntu, etc.). When `npm install` runs in the Alpine container:

1. Better-sqlite3 attempts to download a pre-built binary
2. It detects `linux-x64` platform
3. Downloads a binary compiled for **glibc-based** Linux systems
4. This binary is **incompatible** with Alpine's musl libc
5. Runtime error occurs when Node.js tries to load the .node file

### Evidence from Build Logs

```bash
#11 [ 6/13] RUN npm install
#11 3.851 added 202 packages, and audited 203 packages in 4s
```

The npm install completed in **4 seconds** - this indicates pre-built binaries were used. If better-sqlite3 was compiling from source (using node-gyp, make, g++), it would take 30+ seconds and show compilation output.

### Why Build Succeeds But Runtime Fails

- **TypeScript compilation** happens during Docker build and completes successfully
- The incompatible better_sqlite3.node file exists in the container
- The error only occurs at **runtime** when Node.js tries to **execute** the binary
- "Exec format error" specifically means the binary format is wrong for the current system

## Impact Assessment

### What Works ✅

- Docker build completes successfully
- TypeScript compilation passes
- Shared code architecture (separate OpenSpec fix) works perfectly
- Frontend container works fine
- Local development works fine

### What Fails ❌

- Backend container cannot start
- Database operations unavailable
- API endpoints unreachable
- Health checks fail
- Cannot test end-to-end workflow in Docker

## Solution Options

### Option 1: Force Compilation from Source on Alpine (Quick Fix)

**Add build tools and force better-sqlite3 to compile from source:**

```dockerfile
# Backend Dockerfile
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    wget

# ... rest of Dockerfile ...

# Force better-sqlite3 to build from source
WORKDIR /app/backend
ENV npm_config_build_from_source=true
RUN npm install

# ... rest of Dockerfile ...
```

**Pros:**
- Minimal changes to current setup
- Keeps Alpine Linux (smaller base image)
- Guaranteed compatibility

**Cons:**
- Larger Docker image (~50-100MB additional)
- Longer build time (30-60 seconds extra)
- More dependencies in production image

### Option 2: Switch to Debian-Based Image (Recommended)

**Change base image to support glibc-based pre-built binaries:**

```dockerfile
# Backend Dockerfile
FROM node:20-slim  # Changed from node:20-alpine

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# ... rest of Dockerfile unchanged ...
```

**Pros:**
- Better compatibility with pre-built native modules
- Faster builds (uses pre-built binaries)
- Fewer edge cases with other native dependencies
- Industry standard for Node.js containers

**Cons:**
- Slightly larger base image (~50MB more than Alpine)
- Uses glibc instead of musl (not really a con for most use cases)

**Why This Is Recommended:**
- Node.js ecosystem heavily optimized for Debian/Ubuntu
- Better-sqlite3 and most native modules ship glibc-compatible pre-builts
- Avoids entire class of musl-related issues
- Faster iteration during development

### Option 3: Use Alternative SQLite Library

**Replace better-sqlite3 with sql.js (WebAssembly-based) or other pure JS alternative:**

**Pros:**
- No native compilation issues
- Works on any platform
- No build tools needed

**Cons:**
- Major code changes required
- Potential performance degradation
- Different API - requires refactoring
- sql.js has different transaction semantics

**Verdict:** Not recommended - too much effort for minimal benefit

## Recommended Implementation

### Immediate Action: Option 2 (Switch to node:20-slim)

1. **Update Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM node:20-slim  # Changed from node:20-alpine

# Install wget for healthcheck (apt instead of apk)
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Rest of Dockerfile remains the same
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

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose API port
EXPOSE 3001

# Set environment variable for database path
ENV DB_PATH=/data/fitforge.db

# Start the server from compiled output (runs from /app/backend)
CMD ["node", "dist/server.js"]
```

2. **Rebuild and test:**

```bash
docker-compose down -v
docker-compose build backend
docker-compose up -d
docker logs fitforge-backend
```

3. **Verify success:**

```bash
# Health check should return 200
curl http://localhost:3001/api/health

# Container should stay running
docker ps | grep fitforge-backend
```

### Future Consideration: Build Optimization

If image size becomes a concern after switching to Debian:

1. Use multi-stage builds to separate build dependencies from runtime
2. Add .dockerignore rules for unnecessary files
3. Use `npm ci --only=production` instead of `npm install`
4. Consider node:20-slim-bullseye for even smaller base

## Verification Steps

After implementing the fix:

1. ✅ Backend Docker image builds successfully
2. ✅ Container starts without errors
3. ✅ Health check endpoint responds: `curl http://localhost:3001/api/health`
4. ✅ Database operations work: Import a workout
5. ✅ No "Exec format error" in logs
6. ✅ better-sqlite3 loads successfully at runtime

## Related Information

### Distinction from Shared Code Fix

This better-sqlite3 issue is **completely separate** from the recently completed OpenSpec change `fix-shared-code-docker-build`. That fix addressed:

- ✅ TypeScript compilation in Docker
- ✅ Shared code imports (`/shared/exercise-library.ts`)
- ✅ Type consolidation
- ✅ Directory structure preservation

The shared code fix is **working perfectly** - the Docker build succeeds and TypeScript compiles without errors. The better-sqlite3 issue is a **runtime problem** unrelated to code sharing.

### Why This Wasn't Caught Earlier

- Local development uses native binaries compiled for the host OS (Windows)
- The issue only manifests when running in the Alpine Linux container
- Docker build succeeds because TypeScript compilation doesn't execute the .node file
- Error only occurs at runtime when Node.js loads the database module

## References

- Better-sqlite3 documentation: https://github.com/WiseLibs/better-sqlite3
- Alpine Linux and Node.js native modules: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#alpine-linux
- Node.js official Docker images: https://hub.docker.com/_/node/

## Next Steps

1. [ ] Implement Option 2 (switch to node:20-slim)
2. [ ] Test container startup
3. [ ] Verify database operations
4. [ ] Update CHANGELOG.md
5. [ ] Commit changes
6. [ ] Document in project README if needed
