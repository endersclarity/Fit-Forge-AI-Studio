# Railway Deployment Configuration Issue

## Problem Summary

The FitForge backend service on Railway was failing to deploy because it was building with the **frontend's Dockerfile** instead of the **backend's Dockerfile**.

## Root Cause

Railway's build configuration had two settings that created a **double failure**:

1. **Root Directory** setting in Railway UI: Set to "backend"
2. **dockerfilePath** in `backend/railway.json`: Originally set to "Dockerfile"

### Understanding Railway's Path Resolution

**Critical insight**: Railway's `dockerfilePath` is **always resolved from the project root**, regardless of the Root Directory setting.

- When `dockerfilePath = "Dockerfile"`, Railway looks for: `project-root/Dockerfile`
- This is true even if Root Directory is set to "backend"
- Root Directory **only affects the build context** (where COPY commands start from), not which Dockerfile is selected

### The Double Failure

**Failure 1: Wrong Dockerfile Selected**

With Root Directory = "backend" and dockerfilePath = "Dockerfile":
- Railway selected: `project-root/Dockerfile` (frontend's Alpine-based Dockerfile)
- Should have selected: `project-root/backend/Dockerfile` (backend's Slim-based Dockerfile)
- Result: Backend service built with frontend's `serve` configuration instead of Express server

**Failure 2: Wrong Build Context (Would Have Failed Anyway)**

Even if the correct Dockerfile was somehow selected, the Root Directory = "backend" setting would cause build failures because the backend Dockerfile expects project root as build context:

```dockerfile
# backend/Dockerfile expects these paths from project root:
COPY backend/package*.json ./backend/   # Would look for backend/backend/ ❌
COPY shared/ ./shared/                  # Would look for backend/shared/ ❌
COPY types.ts ./types.ts                # Would look for backend/types.ts ❌
```

With Root Directory = "backend", the build context starts in `backend/`, making all these COPY paths invalid.

### Actual File Structure
```
project-root/
├── Dockerfile              # Frontend Dockerfile (Alpine, serve) ← Was incorrectly used
├── railway.json            # Frontend service config
├── shared/                 # Shared code library
├── types.ts                # Shared types
└── backend/
    ├── Dockerfile         # Backend Dockerfile (Slim, Express) ← Should be used
    ├── railway.json       # Backend service config
    └── server.ts
```

**Note**: There are TWO separate `railway.json` files - one for each service. The frontend's config at project root is correct. The backend's config was misconfigured.

## Evidence from Build Logs

**Wrong Dockerfile (Frontend)**:
```
Step 1/15 : FROM node:20-alpine as builder
Step 14/15 : RUN npm install -g serve
Step 15/15 : CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Correct Dockerfile (Backend)**:
```
Step 1/12 : FROM node:20-slim
Step 2/12 : RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
Step 12/12 : CMD ["node", "dist/backend/server.js"]
```

## Fix Applied

The fix addresses both failures by ensuring correct Dockerfile selection AND correct build context:

1. **Cleared Root Directory in Railway UI**
   - Set Root Directory to empty/blank
   - This sets the build context to project root (required for COPY commands in backend Dockerfile)

2. **Updated `backend/railway.json`**
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "backend/Dockerfile"  // Explicit path from project root
     }
   }
   ```
   - Changed from "Dockerfile" to "backend/Dockerfile"
   - Now explicitly selects the backend Dockerfile

3. **Committed and pushed changes to GitHub**

**Why this works**:
- Root Directory = "" (empty) → Build context is project root → COPY commands work ✅
- dockerfilePath = "backend/Dockerfile" → Correct Dockerfile selected ✅
- Result: Backend builds with correct Dockerfile AND correct file paths

## Current Status

Configuration has been fixed in both Railway UI and repository. However, Railway may be using cached builds and hasn't picked up the new configuration yet.

## Manual Verification Steps

To verify the fix is working:

1. **Check latest build logs** for backend service:
   ```bash
   railway logs --service FitForge-Backend --build -n 50
   ```

2. **Look for backend Dockerfile indicators**:
   - ✅ Should see: `FROM node:20-slim`
   - ✅ Should see: `RUN apt-get update`
   - ✅ Should see: `CMD ["node", "dist/backend/server.js"]`
   - ❌ Should NOT see: `FROM node:20-alpine`
   - ❌ Should NOT see: `RUN npm install -g serve`

3. **Force new deployment if needed**:
   - Option A: Use Railway dashboard "Deploy" button (not "Redeploy")
   - Option B: Make a dummy commit to trigger GitHub webhook
   - Option C: Use `railway up` to force push

## Architecture Notes

**Backend Service Configuration**:
- Port: 3001 (set via Railway PORT env var)
- Health check: `/api/health`
- Dockerfile: `backend/Dockerfile`
- Build: TypeScript compilation with shared types

**Frontend Service Configuration**:
- Port: 3000 (set via Railway PORT env var)
- Build: Vite React SPA
- Dockerfile: Root `Dockerfile`
- API URL: Set via `VITE_API_URL` env var

**Important**: This project uses a monorepo structure with both services in one repository:
- Both services have their own `railway.json` configuration files
- Both services share code from `shared/` directory and `types.ts`
- Backend Dockerfile MUST build from project root to access shared code
- Frontend Dockerfile also builds from project root
- Root Directory should be empty for both services in this monorepo setup

## Files Changed

- `backend/railway.json` - Updated dockerfilePath to "backend/Dockerfile"
- Railway UI - Cleared Root Directory setting

## Commits

- Most recent: Fixed Railway configuration to use correct Dockerfile path
- Previous attempts visible in git history showing troubleshooting progression
