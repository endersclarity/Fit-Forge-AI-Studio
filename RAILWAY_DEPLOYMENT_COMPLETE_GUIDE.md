# FitForge Railway Deployment - Complete Guide

## 🎉 What We've Accomplished

### ✅ Backend Service (COMPLETED)
- **Service Created**: FitForge-Backend
- **Repository Connected**: endersclarity/Fit-Forge-AI-Studio (main branch)
- **Dockerfile**: `/backend/Dockerfile` ✅
- **Environment Variables Set**:
  - `PORT=3001` ✅
  - `FRONTEND_URL=https://fit-forge-ai-studio-production-6b5b.up.railway.app` ✅
  - `DB_PATH=/data/fitforge.db` ✅
- **Volume Created**: `fitforge-backend-volume` mounted at `/data` ✅
- **Deployment Status**: ACTIVE and SUCCESSFUL ✅
- **Public URL**: `https://fitforge-backend-production.up.railway.app` ✅

### ⚠️ Frontend Service (NEEDS UPDATE)
- **Service Created**: Fit-Forge-AI-Studio
- **Repository Connected**: endersclarity/Fit-Forge-AI-Studio (main branch)
- **Public URL**: `https://fit-forge-ai-studio-production-6b5b.up.railway.app`
- **Status**: Deployed but using OLD code (still trying localhost:3001)
- **Missing**: `VITE_API_URL` environment variable ❌

---

## 🚀 Next Steps to Complete Deployment

### Step 1: Update Frontend Environment Variable on Railway

**On Railway Dashboard:**

1. Go to: https://railway.app/project/humorous-success
2. Click on **"Fit-Forge-AI-Studio"** service
3. Click **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   ```
   Name:  VITE_API_URL
   Value: https://fitforge-backend-production.up.railway.app/api
   ```
   ⚠️ **CRITICAL**: Include `/api` at the end!

### Step 2: Redeploy Frontend

**Still in Railway Dashboard:**

1. Click **"Deployments"** tab
2. Find the latest deployment (top of the list)
3. Click the **three dots (⋮)** on the right
4. Click **"Redeploy"**
5. Wait 1-2 minutes for rebuild

### Step 3: Verify Everything Works

#### A. Test Backend Health
Open in browser:
```
https://fitforge-backend-production.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T..."
}
```

#### B. Test Frontend
Open in browser:
```
https://fit-forge-ai-studio-production-6b5b.up.railway.app/
```

**Expected:**
- ✅ No "Failed to connect to server" errors
- ✅ Dashboard loads
- ✅ Can create profile
- ✅ Can log workouts

#### C. Check Browser Console
Press F12 → Console tab

**Should NOT see:**
- ❌ "Failed to fetch"
- ❌ "localhost:3001"
- ❌ CORS errors

---

## 🔄 How Future Updates Work

### YES! You can deploy by just pushing to GitHub! 🎉

**The workflow is now:**

```
1. Make code changes locally
2. Commit to Git
3. Push to GitHub (main branch)
4. Railway automatically detects the push
5. Railway rebuilds and redeploys automatically
6. Changes are live in 2-5 minutes
```

**No manual Railway configuration needed after initial setup!**

### Example: Fixing a Bug

```bash
# 1. Fix the bug in your code
# Edit: backend/src/services/workoutService.ts

# 2. Commit the fix
git add .
git commit -m "fix: correct muscle fatigue calculation"

# 3. Push to GitHub
git push origin main

# 4. Railway automatically:
#    - Detects the push to main branch
#    - Pulls latest code
#    - Builds using backend/Dockerfile
#    - Deploys new version
#    - Keeps database data (volume persists!)

# 5. Check Railway dashboard to monitor deployment
```

---

## 📁 Files Already in Your Repository (Ready for Railway)

### Backend Configuration ✅
- **`backend/Dockerfile`** - Tells Railway how to build backend
- **`backend/railway.json`** - Railway-specific settings
- **`backend/package.json`** - Dependencies
- **`backend/src/index.ts`** - Uses environment variables correctly

### Frontend Configuration ✅
- **`frontend/railway.json`** - Railway-specific settings
- **`frontend/package.json`** - Dependencies
- **`frontend/vite.config.ts`** - Build configuration
- **`frontend/src/config/api.ts`** - Uses `VITE_API_URL` environment variable

**ALL FILES ARE READY!** No code changes needed in repository.

---

## 🔧 Current Environment Variables

### Backend (FitForge-Backend)
```
PORT = 3001
FRONTEND_URL = https://fit-forge-ai-studio-production-6b5b.up.railway.app
DB_PATH = /data/fitforge.db
```

### Frontend (Fit-Forge-AI-Studio)
```
VITE_API_URL = https://fitforge-backend-production.up.railway.app/api
```
⚠️ **This needs to be added manually in Railway dashboard (Step 1 above)**

---

## 💾 Database Persistence

### Volume Information
- **Name**: `fitforge-backend-volume`
- **Mount Path**: `/data`
- **Database File**: `/data/fitforge.db`
- **Size**: Up to 500MB (Hobby plan limit)

### Important Notes
- ✅ **Data WILL persist** across deployments
- ✅ **Data WILL persist** across restarts
- ⚠️ **Backups**: Railway doesn't auto-backup volumes - consider manual backups for production
- 🔄 Volume is tied to backend service in us-west2 region

---

## 🐛 Troubleshooting

### Frontend still shows "Failed to connect" after redeploy

**Problem**: Frontend wasn't rebuilt with new environment variable

**Solution**:
1. Verify `VITE_API_URL` is set in Railway → Fit-Forge-AI-Studio → Variables
2. Go to Deployments
3. Manually click "Redeploy" again
4. Check deployment logs for errors
5. Clear browser cache (Ctrl+Shift+R)

### Backend shows "Unexposed service"

**Problem**: Public URL wasn't generated

**Solution**:
1. Go to FitForge-Backend → Settings
2. Under "Public Networking" click "Generate Domain"
3. Copy the generated URL
4. Update frontend's `VITE_API_URL` variable

### Database errors or missing data

**Problem**: Volume not properly mounted

**Solution**:
1. Check FitForge-Backend → Settings → scroll to verify volume is attached
2. Check environment variable: `DB_PATH=/data/fitforge.db`
3. View logs: FitForge-Backend → Deployments → View logs
4. Look for SQLite initialization messages

### CORS errors in browser console

**Problem**: `FRONTEND_URL` mismatch or missing

**Solution**:
1. Verify backend variable: `FRONTEND_URL=https://fit-forge-ai-studio-production-6b5b.up.railway.app`
2. Must match EXACTLY (no trailing slash!)
3. Redeploy backend after fixing

### Deployment fails to build

**Problem**: Dockerfile or dependencies issue

**Solution**:
1. Check FitForge-Backend → Deployments → View logs
2. Look for error in "Build" section
3. Common issues:
   - Missing dependencies in package.json
   - Dockerfile syntax errors
   - Out of memory during build

---

## 📊 Monitoring Your Deployment

### View Logs
**Backend Logs:**
1. Railway Dashboard → FitForge-Backend
2. Click "Logs" tab (top navigation)
3. See real-time logs

**Frontend Logs:**
1. Railway Dashboard → Fit-Forge-AI-Studio
2. Click "Logs" tab

### Check Metrics
1. Click on service
2. Click "Metrics" tab
3. See:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Deployment History
1. Click "Deployments" tab
2. See all past deployments
3. Can rollback to previous deployment if needed
4. Click deployment to see build/deploy logs

---

## 🎯 Testing Checklist

After completing Steps 1-3 above, verify:

- [ ] Backend health endpoint returns `{"status":"ok"}`
- [ ] Frontend loads without "Failed to connect" error
- [ ] Can create a user profile
- [ ] Can select training level and goals
- [ ] Can log a workout (e.g., "I did 10 pushups")
- [ ] Workout appears in dashboard
- [ ] Muscle fatigue calculations work
- [ ] No CORS errors in browser console
- [ ] No localhost:3001 references in network tab

---

## 🚨 Critical URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend** | `https://fitforge-backend-production.up.railway.app` | API server |
| **Backend Health** | `https://fitforge-backend-production.up.railway.app/api/health` | Health check |
| **Frontend** | `https://fit-forge-ai-studio-production-6b5b.up.railway.app/` | Web app |
| **Railway Project** | `https://railway.app/project/humorous-success` | Manage deployment |

---

## 📝 Summary: What's Left to Do

### On Railway Dashboard (5 minutes):
1. ✅ Add `VITE_API_URL` variable to frontend
2. ✅ Redeploy frontend
3. ✅ Test backend health endpoint
4. ✅ Test frontend app

### On GitHub Repository:
❌ **NOTHING!** All code is already configured correctly.

### Future Development:
Just push to GitHub main branch → Railway auto-deploys → Done! 🎉

---

## ✅ Success Criteria

You'll know everything is working when:

1. **Backend Health Check**:
   - `https://fitforge-backend-production.up.railway.app/api/health` returns JSON

2. **Frontend Loads**:
   - `https://fit-forge-ai-studio-production-6b5b.up.railway.app/` shows dashboard

3. **Full Workflow Works**:
   - Create profile → Set goals → Log workout → See results

4. **Console is Clean**:
   - No red errors in browser console (F12)
   - No "localhost" references in Network tab

---

## 🆘 Need Help?

**Check Railway Logs First:**
1. Go to Railway dashboard
2. Click on failing service
3. Click "Deployments" → latest deployment → "View logs"
4. Look for errors in Build or Deploy phases

**Common Error Patterns:**
- `ERR_CONNECTION_REFUSED` → Backend not running or wrong URL
- `CORS error` → FRONTEND_URL mismatch
- `404 Not Found` → Wrong API endpoint path
- `Database locked` → Multiple instances trying to write (should only be 1 replica)

**Railway Dashboard:**
- https://railway.app/project/humorous-success

**GitHub Repository:**
- https://github.com/endersclarity/Fit-Forge-AI-Studio

---

## 🎓 Understanding the Setup

### How Railway Knows What to Build

**Backend:**
```
Railway reads: backend/railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "/backend/Dockerfile"
  }
}
```

**Frontend:**
```
Railway reads: frontend/railway.json
{
  "build": {
    "builder": "NIXPACKS"
  }
}
```

### How Environment Variables Work

**Backend (`backend/src/index.ts`):**
```typescript
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const DB_PATH = process.env.DB_PATH || './database/fitforge.db';
```

**Frontend (`frontend/src/config/api.ts`):**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

⚠️ **VITE_ prefix is required** for Vite environment variables!

### Auto-Deploy Trigger

Railway watches your GitHub repository:
```
GitHub Push → Railway Webhook → Pull Code → Build → Deploy
```

**What triggers deployment:**
- ✅ Push to `main` branch
- ✅ Merge pull request to `main`
- ❌ Commits to other branches (by default)

---

## 💡 Pro Tips

1. **View Live Logs**: Keep Railway logs open while testing to see real-time errors

2. **Check Both Services**: If frontend has issues, check backend logs too

3. **Environment Variables**: Remember Vite needs `VITE_` prefix for env vars

4. **Clear Cache**: Browser cache can cause issues - use Ctrl+Shift+R

5. **Health Check First**: Always verify backend `/api/health` before testing frontend

6. **Watch Build Logs**: Most issues show up during build phase, not deploy

7. **One Change at a Time**: When debugging, change one thing and redeploy

8. **Use Railway CLI**: `railway logs` for faster log viewing locally

---

**You're almost there! Just complete Steps 1-3 and you'll be fully deployed! 🚀**
