# Railway Deployment Guide for FitForge

This guide explains how to deploy FitForge to Railway with separate frontend and backend services.

## Current Status

- **Frontend Service**: ✅ Deployed at `https://fit-forge-ai-studio-production-6b5b.up.railway.app/`
- **Backend Service**: ❌ Not deployed yet

## Architecture

```
┌─────────────────────────────────────────────────┐
│ Railway Project: humorous-success               │
│                                                 │
│  ┌──────────────────┐      ┌─────────────────┐ │
│  │  Frontend        │      │  Backend        │ │
│  │  (React/Vite)    │─────▶│  (Express API)  │ │
│  │  Port: 3000      │      │  Port: 3001     │ │
│  └──────────────────┘      └─────────────────┘ │
│         │                         │            │
│         │                         │            │
│         │                   ┌─────▼─────┐     │
│         │                   │  Volume   │     │
│         │                   │  (SQLite) │     │
│         │                   └───────────┘     │
└─────────────────────────────────────────────────┘
```

## Step 1: Deploy Backend Service

### 1.1 Create Backend Service in Railway

1. Go to your Railway project "humorous-success"
2. Click "New Service"
3. Select "GitHub Repo"
4. Choose the same repository as your frontend
5. Name it "FitForge-Backend" or similar

### 1.2 Configure Backend Service

Set the following environment variables in Railway:

```bash
# Port configuration (Railway will auto-assign, but backend expects this)
PORT=3001

# Frontend URL for CORS (use your frontend's Railway URL)
FRONTEND_URL=https://fit-forge-ai-studio-production-6b5b.up.railway.app

# Database path (will be stored in Railway volume)
DB_PATH=/data/fitforge.db
```

### 1.3 Add Volume for Database

1. In the backend service settings, go to "Volumes"
2. Click "Add Volume"
3. Mount path: `/data`
4. This will persist your SQLite database across deployments

### 1.4 Configure Build Settings

Railway should auto-detect the `backend/railway.json` configuration, which uses:
- Builder: `DOCKERFILE`
- Dockerfile path: `backend/Dockerfile`

The backend Dockerfile is already configured correctly at `backend/Dockerfile`.

## Step 2: Update Frontend Service

### 2.1 Add Environment Variable

In your existing frontend service, add this environment variable:

```bash
# Backend API URL (use Railway's internal or public URL)
VITE_API_URL=https://<backend-service-url>.railway.app/api
```

**Note**: Replace `<backend-service-url>` with your actual backend service URL from Railway.

Alternatively, if both services are in the same project, you can use Railway's internal networking:
```bash
VITE_API_URL=http://fitforge-backend.railway.internal:3001/api
```

### 2.2 Trigger Rebuild

After adding the environment variable, trigger a new deployment of the frontend so it picks up the backend URL.

## Step 3: Verify Deployment

### 3.1 Check Backend Health

Visit your backend URL:
```
https://<backend-service-url>.railway.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T..."
}
```

### 3.2 Check Frontend Connection

Visit your frontend URL and check:
1. No "Failed to connect to backend" error
2. Dashboard loads with data
3. Browser console has no CORS errors

## Environment Variables Summary

### Frontend Service
| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://<backend>.railway.app/api` | Backend API endpoint |

### Backend Service
| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3001` | API server port |
| `FRONTEND_URL` | `https://fit-forge-ai-studio-production-6b5b.up.railway.app` | Frontend URL for CORS |
| `DB_PATH` | `/data/fitforge.db` | Database file path in volume |

## Database Persistence

The backend uses a Railway volume mounted at `/data` to persist the SQLite database. This ensures:
- Data survives deployments
- Database is not lost on service restarts
- Consistent data across replicas (if scaled)

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify `FRONTEND_URL` is set correctly in backend service
2. Check that it matches your frontend's actual URL (including https://)
3. Redeploy backend after changing the variable

### Backend Connection Failed
If frontend can't connect to backend:
1. Verify `VITE_API_URL` is set in frontend service
2. Check that backend service is running (view logs in Railway)
3. Test backend health endpoint directly
4. Redeploy frontend after changing the variable

### Database Issues
If data is lost between deployments:
1. Verify volume is mounted at `/data`
2. Check `DB_PATH` environment variable is `/data/fitforge.db`
3. View backend logs to see database file location

## Local Development

The configuration changes are backward compatible with local development:

### Docker (Recommended)
```bash
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### npm (Alternative)
```bash
# Backend
cd backend
npm install
npm run dev  # Runs on port 3002 by default

# Frontend (in separate terminal)
npm install
npm run dev  # Runs on port 3000
```

Make sure to set `VITE_API_URL=http://localhost:3002/api` for npm development.

## Next Steps

After successful deployment:

1. **Initialize Profile**: Visit the frontend and complete the setup flow
2. **Test Workout Logging**: Create and save a test workout
3. **Verify Data Persistence**: Redeploy backend and confirm data remains
4. **Monitor**: Check Railway logs for any errors
5. **Custom Domain** (Optional): Add a custom domain in Railway settings

## Support

If you encounter issues:
1. Check Railway service logs
2. Review browser console for errors
3. Verify all environment variables are set correctly
4. Ensure both services are in the same Railway project
