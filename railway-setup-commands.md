# Railway Setup Commands

Since Railway CLI has interactive prompts, here are the exact steps to complete the deployment:

## Option 1: Using Railway Web Dashboard (Recommended)

### Step 1: Add Backend Service
1. Go to: https://railway.app/dashboard
2. Open the "humorous-success" project
3. Click "New Service" → "GitHub Repo"
4. Select your repository: `Fit-Forge-AI-Studio`
5. Name the service: "FitForge-Backend"

### Step 2: Configure Backend Service

Click on the backend service, then go to "Variables":

Add these variables:
```
PORT=3001
FRONTEND_URL=https://fit-forge-ai-studio-production-6b5b.up.railway.app
DB_PATH=/data/fitforge.db
```

### Step 3: Add Database Volume

In the backend service:
1. Click "Volumes" tab
2. Click "New Volume"
3. Mount Path: `/data`
4. Click "Add"

### Step 4: Configure Build Settings

In backend service "Settings":
1. Root Directory: Leave blank (or set to `/`)
2. Railway should auto-detect `backend/railway.json`
3. Verify it's using Dockerfile: `backend/Dockerfile`

### Step 5: Update Frontend Service

Click on "Fit-Forge-AI-Studio" service (frontend):
1. Go to "Variables"
2. Add new variable: `VITE_API_URL`
3. Value: `https://<backend-service-url>/api`

   To get the backend URL:
   - Click on backend service
   - Go to "Settings" → "Networking"
   - Copy the "Public Networking" URL
   - Add `/api` at the end

### Step 6: Deploy

1. Backend should auto-deploy after configuration
2. Frontend needs redeploy to pick up new env var:
   - Click frontend service
   - Click "Deployments" tab
   - Click the three dots on latest deployment
   - Click "Redeploy"

### Step 7: Verify

1. Check backend health: `https://<backend-url>/api/health`
2. Open frontend: `https://fit-forge-ai-studio-production-6b5b.up.railway.app/`
3. Should see dashboard without connection errors

---

## Option 2: Using Railway CLI (Semi-Automated)

If you want to use CLI, you'll need to manually select options from prompts:

### 1. Link to Project
```bash
railway link
# Select: humorous-success
# Select: Create new service? No
# Select: Fit-Forge-AI-Studio (frontend service)
```

### 2. Add Backend Service
You'll need to use the web dashboard to add a new service from GitHub.

### 3. Set Variables (Frontend)
```bash
railway variables --set VITE_API_URL=https://<backend-url>/api
```

### 4. Link to Backend Service
```bash
railway unlink
railway link
# Select: humorous-success
# Select: FitForge-Backend (after creating it)
```

### 5. Set Variables (Backend)
```bash
railway variables --set PORT=3001
railway variables --set FRONTEND_URL=https://fit-forge-ai-studio-production-6b5b.up.railway.app
railway variables --set DB_PATH=/data/fitforge.db
```

### 6. Add Volume (Backend)
```bash
railway volume add --mount-path /data
```

---

## Quick Check Commands

After setup:

```bash
# Check backend health
curl https://<backend-url>/api/health

# Check frontend can reach backend
# Open browser dev tools at frontend URL and check network tab
```

## Troubleshooting

If backend doesn't deploy:
- Check "Deployments" tab for build logs
- Verify Dockerfile path is correct
- Ensure GitHub connection is working

If frontend can't connect:
- Verify VITE_API_URL is set correctly
- Check backend URL is accessible
- Verify CORS (FRONTEND_URL) is set in backend
- Redeploy frontend after changing variables
