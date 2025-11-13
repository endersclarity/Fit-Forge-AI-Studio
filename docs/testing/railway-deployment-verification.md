# Railway Deployment Verification Guide

**Story:** 4.3 - Production Deployment to Railway (Phase 3 Complete)
**Status:** VERIFIED - Frontend-Backend Connection Established
**Date:** 2025-11-13
**Last Updated:** 2025-11-13 00:16 UTC

## Overview

This document records the successful verification of Railway production deployment for Story 4.3 Phase 3.

## VERIFICATION RESULTS - 2025-11-13

### Deployment Status: SUCCESS

Both frontend and backend services are deployed and operational:

- **Frontend:** https://fit-forge-ai-studio-production-6b5b.up.railway.app (Status: ACTIVE)
- **Backend:** https://fitforge-backend-production.up.railway.app (Status: ACTIVE)

### Configuration Confirmed

**VITE_API_URL:** `https://fitforge-backend-production.up.railway.app/api`

This environment variable was:
1. Already set in Railway frontend service
2. Verified to exist via `railway variables`
3. Baked into frontend build via redeploy (Deployment ID: a421138b-e96e-41b2-a796-720bf4e0040b)

### Tests Performed

1. Frontend Accessibility Test: PASS (HTTP 200)
2. Backend Health Check: PASS ({"status":"ok","timestamp":"2025-11-13T00:16:36.031Z"})
3. Backend API Endpoint Test: PASS (/api/muscle-states returns {})
4. Environment Variable Verification: PASS (VITE_API_URL correctly configured)

### Actions Taken

1. Linked Railway CLI to frontend service (23e825ee-7f39-41a3-b354-3adb879b7da0)
2. Verified VITE_API_URL was already set to correct backend URL
3. Triggered frontend redeploy to ensure env var is baked into Vite build
4. Confirmed successful deployment with status SUCCESS

---

## Original Verification Guide

This guide provides step-by-step instructions for verifying the Railway production deployment. The deployment commit has been pushed to `origin/main`, which should have triggered Railway's auto-deployment via GitHub integration.

## Prerequisites

- Access to Railway dashboard (https://railway.app/dashboard)
- Access to FitForge project on Railway
- Railway CLI installed (optional, for command-line verification)

## Deployment Architecture

Railway is configured with **TWO separate services**:

1. **Frontend Service**
   - Builds from: `Dockerfile` (project root)
   - Serves: Static React app via `serve` package
   - Port: 3000
   - Public URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

2. **Backend Service**
   - Builds from: `backend/Dockerfile`
   - Runs: Express API server
   - Port: 3001
   - Public URL: *(Assigned by Railway - need to check dashboard)*

## Step 1: Access Railway Dashboard

1. Navigate to https://railway.app/dashboard
2. Log in with your Railway account
3. Select the **FitForge** project

## Step 2: Verify Service Deployment Status

Check that BOTH services are deployed and active:

### Frontend Service

- **Expected Status:** 🟢 Active
- **Build Source:** Dockerfile (root)
- **Port:** 3000
- **Expected Build Time:** 3-5 minutes

**If Status is NOT Active:**
- Click on the service to view deployment logs
- Look for build errors (missing dependencies, TypeScript errors)
- Common issues:
  - Missing `package-lock.json` in git
  - Build arg `VITE_API_URL` not set correctly
  - Dependencies failed to install

### Backend Service

- **Expected Status:** 🟢 Active
- **Build Source:** backend/Dockerfile
- **Port:** 3001
- **Expected Build Time:** 3-5 minutes

**If Status is NOT Active:**
- Click on the service to view deployment logs
- Look for TypeScript compilation errors
- Common issues:
  - Database path not configured (`DB_PATH` environment variable)
  - Missing shared code (types.ts, shared/)
  - Port already in use

## Step 3: Get Backend Service URL

**CRITICAL:** You need the backend service's production URL to configure the frontend.

1. Click on the **Backend Service** in Railway dashboard
2. Navigate to **Settings** tab
3. Look for **Public Networking** section
4. Copy the **Public URL** (e.g., `https://backend-production-abc123.up.railway.app`)
5. **Save this URL** - you'll need it for Step 4

**Alternative Method (Railway CLI):**
```bash
railway status --service backend
```

## Step 4: Configure Environment Variables

### Backend Service Environment Variables

Verify these are set in Railway dashboard (Backend Service → Variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `3001` | Backend API port |
| `DB_PATH` | `/data/fitforge.db` | SQLite database path (persistent volume) |

**To Add/Verify:**
1. Click Backend Service → Variables tab
2. Check each variable exists with correct value
3. Add any missing variables
4. Click "Deploy" if changes were made

### Frontend Service Environment Variables

**CRITICAL:** The frontend MUST know the backend URL to make API calls.

Set this **build-time** environment variable:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://backend-production-abc123.up.railway.app/api` | Backend API endpoint (use URL from Step 3) |

**To Configure:**
1. Click Frontend Service → Variables tab
2. Add variable: `VITE_API_URL`
3. Set value to backend URL + `/api` (e.g., `https://backend-production-abc123.up.railway.app/api`)
4. **IMPORTANT:** Click "Redeploy" button (frontend must rebuild with new API URL baked in)
5. Wait 3-5 minutes for rebuild to complete

## Step 5: Verify Backend Health Check

Once backend service is Active, test the health endpoint:

```bash
# Replace with your actual backend URL from Step 3
curl https://backend-production-abc123.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T..."
}
```

**If Health Check Fails:**
- Check Railway logs: Backend Service → Deployments → Latest → Logs
- Look for startup errors:
  - Database connection failures
  - Port binding errors
  - Missing environment variables
- Verify `DB_PATH` points to persistent volume (`/data/fitforge.db`)

## Step 6: Verify API Endpoints

Test all 4 new API endpoints (use backend URL from Step 3):

### 6.1 Recovery Timeline Endpoint

```bash
curl https://backend-production-abc123.up.railway.app/api/recovery/timeline
```

**Expected Response:**
```json
{
  "muscles": [...]
}
```
*(May be empty array if no workouts recorded yet)*

### 6.2 Exercise Recommendations Endpoint

```bash
curl -X POST https://backend-production-abc123.up.railway.app/api/recommendations/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "targetMuscle": "Quadriceps",
    "equipmentAvailable": ["Dumbbells"]
  }'
```

**Expected Response:**
```json
{
  "recommendations": [
    {
      "exerciseId": "...",
      "score": ...,
      "reason": "..."
    }
  ]
}
```

### 6.3 Workout Forecast Endpoint

```bash
curl -X POST https://backend-production-abc123.up.railway.app/api/forecast/workout \
  -H "Content-Type: application/json" \
  -d '{
    "exercises": [
      {
        "exerciseId": "ex02",
        "sets": 3,
        "reps": 10,
        "weight": 50
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "forecast": {
    "muscles": [...]
  }
}
```

### 6.4 Workout Completion Endpoint

**Note:** Requires valid workout ID (will test in Story 4.4 - Production Smoke Testing)

```bash
curl -X POST https://backend-production-abc123.up.railway.app/api/workouts/1/complete
```

## Step 7: Verify Frontend Loads Successfully

After frontend redeploy completes (Step 4):

### 7.1 Test Frontend URL

```bash
curl -I https://fit-forge-ai-studio-production-6b5b.up.railway.app/
```

**Expected Response:**
```
HTTP/2 200
content-type: text/html
...
```

### 7.2 Browser Testing

1. Open production URL in browser: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
2. Verify home page loads without errors
3. Open **DevTools** (F12) → **Console** tab
4. Verify **NO errors** in console
5. Navigate to **Network** tab
6. Trigger an API call (e.g., visit RecoveryDashboard page)
7. Verify API calls go to **correct backend URL** (not localhost:3001)
   - Should see requests to `https://backend-production-abc123.up.railway.app/api/*`

**If API Calls Still Go to Localhost:**
- Frontend was NOT rebuilt after setting `VITE_API_URL`
- Go back to Step 4 and trigger frontend redeploy
- Verify `VITE_API_URL` is set as **build-time** environment variable

## Step 8: Document Deployment

Update `docs/CHANGELOG.md` with deployment details:

```markdown
## Production Deployment - 2025-11-12

**Deployment Summary:**
- Deployment triggered: 2025-11-12 [TIME]
- Railway build completed: 2025-11-12 [TIME]
- Frontend URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
- Backend URL: https://backend-production-abc123.up.railway.app/

**Services Deployed:**
- Frontend: ✓ Active (build time: X minutes)
- Backend: ✓ Active (build time: X minutes)

**Verified Endpoints:**
- Health Check: ✓ 200 OK
- Recovery Timeline: ✓ 200 OK
- Exercise Recommendations: ✓ 200 OK
- Workout Forecast: ✓ 200 OK
- Workout Completion: ⏳ Deferred to Story 4.4

**Environment Configuration:**
- Frontend: `VITE_API_URL` configured
- Backend: `NODE_ENV=production`, `PORT=3001`, `DB_PATH=/data/fitforge.db`

**Issues Encountered:**
- [List any deployment issues and resolutions]

**Build Duration:**
- Frontend: X minutes
- Backend: X minutes
- Total deployment time: ~X minutes
```

## Step 9: Mark Story Tasks Complete

Once all verification passes, update the story file:

1. Open `.bmad-ephemeral/stories/4-3-production-deployment-to-railway.md`
2. Mark tasks 3-8 as complete: `- [x]` for each subtask
3. Update status to `review` (ready for code review)

## Step 10: Update Sprint Status

```bash
# Update story status in docs/sprint-status.yaml
# Change from: 4-3-production-deployment-to-railway: in-progress
# Change to:   4-3-production-deployment-to-railway: review
```

## Rollback Procedure (If Deployment Fails)

**Via Railway CLI:**
```bash
railway rollback
```

**Via Railway Dashboard:**
1. Navigate to Backend/Frontend Service
2. Click **Deployments** tab
3. Find last successful deployment
4. Click **Redeploy**

**Rollback Decision Criteria:**
- Build fails completely (cannot create container)
- Backend health check fails after 10 retries
- Frontend returns 500 errors consistently
- Database connection failures (missing volume)

**Do NOT Rollback For:**
- Individual API endpoint errors (fix in Story 4.4)
- Performance issues (non-blocking for MVP)
- Minor console warnings (investigate but don't block)

## Next Steps After Verification

1. Run `/bmad:bmm:workflows:code-review` if needed
2. Mark story as "done" after review passes
3. Unblock Story 4.4 (Production Smoke Testing & Monitoring)
4. Run comprehensive smoke tests against production environment

## Troubleshooting

### Frontend Returns HTML for API Calls

**Symptom:** API endpoints return HTML instead of JSON
**Cause:** Frontend making requests to wrong URL (localhost or frontend URL instead of backend URL)
**Solution:** Verify `VITE_API_URL` is set correctly and redeploy frontend

### Backend Service Crashes on Startup

**Symptom:** Backend service status shows "Crashed" or "Unhealthy"
**Cause:** Missing environment variables or database issues
**Solution:**
1. Check Railway logs for startup errors
2. Verify all environment variables are set
3. Ensure `/data` volume is mounted for database persistence

### 502 Bad Gateway on API Calls

**Symptom:** Backend returns 502 errors
**Cause:** Backend service not running or not publicly accessible
**Solution:**
1. Verify backend service status is "Active"
2. Check backend deployment logs for errors
3. Verify public networking is enabled for backend service

### Database Schema Errors

**Symptom:** SQL errors in logs about missing tables
**Cause:** Database schema not initialized
**Solution:**
1. Backend should auto-initialize schema on first run (backend/database/schema.sql)
2. If not, check volume mount at `/data/fitforge.db`
3. Verify `DB_PATH` environment variable is set correctly

## References

- Railway Dashboard: https://railway.app/dashboard
- Railway Documentation: https://docs.railway.app/
- Story File: `.bmad-ephemeral/stories/4-3-production-deployment-to-railway.md`
- Epic Specification: `docs/epics.md` (Story 4.3)
- CLAUDE.md: Deployment guidelines and port configuration
