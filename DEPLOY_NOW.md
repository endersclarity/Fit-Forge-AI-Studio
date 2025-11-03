# FIX DEPLOYMENT NOW - Quick Steps

## Current Status (Updated)
❌ Backend is using WRONG Dockerfile (frontend's alpine/serve build)
✅ Configuration files are correct in repo (backend/railway.json)
⏳ Need to force Railway to rebuild with correct config

## FASTEST FIX - Do This Now

### Option 1: Force Redeploy via CLI (FASTEST)
```bash
railway redeploy --service FitForge-Backend
```
This should pick up the correct railway.json config.

### Option 2: Via Railway Dashboard
1. Go to: https://railway.app/project/humorous-success
2. Click on **FitForge-Backend** service
3. Go to **Settings** tab
4. Scroll to **Build** section
5. Verify **Root Directory** is BLANK/EMPTY
6. Verify **Dockerfile Path** is `backend/Dockerfile`
7. If wrong, fix and save
8. Go to **Deployments** tab
9. Click **"Deploy"** button (NOT Redeploy)

### Step 2: Create Backend Service

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose repository: **Fit-Forge-AI-Studio**
4. Railway will ask about the service name - name it: **FitForge-Backend**
5. Click **"Deploy"**

### Step 3: Configure Backend Service

Click on the **FitForge-Backend** service, then:

#### A. Add Environment Variables
Go to **"Variables"** tab and add these THREE variables:

```
PORT = 3001
FRONTEND_URL = https://fit-forge-ai-studio-production-6b5b.up.railway.app
DB_PATH = /data/fitforge.db
```

#### B. Add Database Volume
1. Click **"Volumes"** tab (left sidebar)
2. Click **"+ New Volume"**
3. Set **Mount Path**: `/data`
4. Click **"Add"**

#### C. Verify Build Settings
1. Click **"Settings"** tab
2. Under **"Build"**, verify it shows:
   - Builder: **Dockerfile**
   - Dockerfile Path: **backend/Dockerfile**
3. If not, click **"Configure"** and set it

#### D. Get Backend URL
1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** if no domain exists
3. **COPY THIS URL** - you'll need it in Step 4
   - Example: `fitforge-backend-production-xxxx.up.railway.app`

### Step 4: Update Frontend Service

Click on the **Fit-Forge-AI-Studio** service (your current frontend), then:

#### A. Add Environment Variable
1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Set:
   ```
   VITE_API_URL = https://<BACKEND-URL-FROM-STEP-3D>/api
   ```
   - Replace `<BACKEND-URL-FROM-STEP-3D>` with actual backend URL
   - Don't forget the `/api` at the end!
   - Example: `https://fitforge-backend-production-xxxx.up.railway.app/api`

#### B. Trigger New Deployment
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **three dots (⋮)** on the right
4. Click **"Redeploy"**

This will rebuild the frontend with:
- New code from GitHub (that uses environment variables)
- The VITE_API_URL variable you just set

### Step 5: Wait for Deployments

Watch both services:
- **Backend**: Should build from Dockerfile (takes ~2-3 minutes)
- **Frontend**: Should rebuild with new env var (takes ~1-2 minutes)

### Step 6: Verify Everything Works

Once both show green checkmarks:

1. **Test Backend Health**:
   - Open: `https://<backend-url>/api/health`
   - Should see: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**:
   - Open: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
   - Should load WITHOUT the "Failed to connect" error
   - Dashboard should display (might be empty if no data)

## Troubleshooting

### If Backend Fails to Deploy
1. Click on backend service
2. Go to **"Deployments"** tab
3. Click on the failed deployment
4. Check **"Build Logs"** and **"Deploy Logs"** for errors

Common issues:
- Dockerfile path incorrect
- Missing dependencies
- Port conflict

### If Frontend Still Shows localhost:3001 Error
This means the frontend wasn't rebuilt with new code:
1. Verify `VITE_API_URL` variable is set
2. Go to Deployments and **manually trigger "Redeploy"**
3. Check deployment logs to ensure it's pulling latest code

### If CORS Errors in Browser Console
1. Check `FRONTEND_URL` is set correctly in backend
2. Make sure it matches EXACTLY (with https://)
3. Redeploy backend after fixing

## Expected Results

After successful deployment:

✅ Backend at: `https://<backend-url>.railway.app`
✅ Backend health: `https://<backend-url>.railway.app/api/health` returns OK
✅ Frontend at: `https://fit-forge-ai-studio-production-6b5b.up.railway.app/`
✅ Frontend loads without errors
✅ No CORS errors in browser console
✅ Can create profile and use the app

## Next Steps After Deployment

1. **Create Your Profile**: Visit the frontend and complete setup
2. **Test a Workout**: Log a test workout to verify database works
3. **Verify Persistence**: Redeploy backend, check data remains
4. **Monitor Logs**: Watch for any runtime errors
5. **Optional**: Add custom domain in Railway settings

---

## Quick Reference: Environment Variables

### Backend Service (FitForge-Backend)
| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://fit-forge-ai-studio-production-6b5b.up.railway.app` |
| `DB_PATH` | `/data/fitforge.db` |

### Frontend Service (Fit-Forge-AI-Studio)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://<backend-url>/api` |

---

**Need Help?** Check the full guide in `RAILWAY_DEPLOYMENT.md`
