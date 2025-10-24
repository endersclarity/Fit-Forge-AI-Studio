# FitForge Local - Offline Setup

Run FitForge completely offline with a real database on your computer.

## Features

- ✅ **Completely Offline** - No internet connection needed
- ✅ **Real Database** - SQLite database stores all your data
- ✅ **Persistent Data** - All workouts saved to your computer
- ✅ **Easy Backup** - Just copy the database file
- ✅ **Docker-based** - Clean, isolated installation (RECOMMENDED)

## Architecture

FitForge Local uses a **microservices architecture** with separate frontend and backend services. This is NOT a monolith - the backend does not serve the frontend.

```
┌─────────────────────────────────────────────┐
│  Your Computer                              │
│                                             │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │   Frontend   │───▶│    Backend API   │  │
│  │   (React)    │◀───│    (Express)     │  │
│  │              │    │                  │  │
│  │  Separate    │    │  API-only server │  │
│  │  Service     │    │  (no static      │  │
│  │              │    │   files served)  │  │
│  │  localhost:  │    │                  │  │
│  │     3000     │    │  localhost:      │  │
│  │              │    │  3001 (Docker)   │  │
│  │              │    │  3002 (npm dev)  │  │
│  └──────────────┘    └────────┬─────────┘  │
│                               │             │
│                               ▼             │
│                      ┌──────────────────┐   │
│                      │  SQLite Database │   │
│                      │                  │   │
│                      │  fitforge.db     │   │
│                      │                  │   │
│                      │  Located at:     │   │
│                      │  ./data/         │   │
│                      └──────────────────┘   │
└─────────────────────────────────────────────┘
```

**Key Architectural Principles:**
- Frontend and backend are **completely separate services**
- Backend is **API-only** - it does NOT serve static files or HTML
- Frontend is served by either:
  - Docker container (production-like, recommended)
  - Vite dev server (local development)
- This separation allows independent scaling and deployment
- Clean separation of concerns: UI layer vs. API layer

## Port Configuration

FitForge uses different ports depending on how you start the application:

| Startup Method | Frontend | Backend | Access URL |
|---------------|----------|---------|------------|
| Docker (Recommended) | 3000 | 3001 | http://localhost:3000 |
| npm dev (Local) | 3000 (Vite) | 3002 | http://localhost:3000 |

**Why different backend ports?**
- Docker uses port 3001 (defined in docker-compose.yml)
- Local npm development uses port 3002 to avoid conflicts if Docker containers are still running
- Both methods can coexist on your machine without port conflicts

**Configuration files:**
- Docker: Port set in `docker-compose.yml`
- npm dev: Port set in `backend/.env.local` (PORT=3002)

## Prerequisites

### For Docker Setup (Recommended)

- **Docker Desktop** installed on your computer
  - Download from: https://www.docker.com/products/docker-desktop/
  - Ensures consistent, reliable environment across all platforms
  - Avoids npm/node dependency issues on Windows

## Quick Start (Docker - RECOMMENDED)

**Docker is the recommended way to run FitForge Local.** It avoids dependency issues and provides a consistent, reliable environment.

### Option A: Windows Users - Use start.bat (Easiest!)

1. Open File Explorer and navigate to `fitforge-local` folder
2. Double-click `start.bat`
3. Wait for containers to start
4. Open browser to: **http://localhost:3000**

### Option B: Command Line

```bash
# Navigate to fitforge-local directory
cd C:\Users\ender\.claude\projects\launchpad\fitforge-local

# Start all services
docker-compose up -d

# Access the app
# Open browser to: http://localhost:3000
```

### Stop the App

```bash
# Stop all services
docker-compose down
```

Your data is preserved in the `./data/` folder!

## Commands

```bash
# Start app (with logs visible)
docker-compose up

# Start app (in background)
docker-compose up -d

# Stop app
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build

# Remove everything (including data!)
docker-compose down -v
```

## Data Storage

### Database Location

Your workout data is stored at:
```
C:\Users\ender\.claude\projects\launchpad\fitforge-local\data\fitforge.db
```

### Backup Your Data

Simply copy the entire `data/` folder:

```bash
# Create a backup
cp -r data data-backup-2025-10-23

# Or zip it
zip -r fitforge-backup.zip data/
```

### Restore from Backup

```bash
# Stop the app first
docker-compose down

# Replace the data folder
cp -r data-backup-2025-10-23 data

# Start the app
docker-compose up -d
```

## Database Schema

The SQLite database includes these tables:

- **users** - Your profile information
- **workouts** - All workout sessions
- **exercise_sets** - Individual sets for each exercise
- **muscle_states** - Current fatigue and recovery status
- **personal_bests** - Your PRs (bestSingleSet, bestSessionVolume, rollingAverageMax)
- **muscle_baselines** - Learned capacity for each muscle
- **bodyweight_history** - Weight tracking over time
- **equipment** - Your equipment inventory

## API Endpoints

The backend exposes these endpoints:
- Docker: http://localhost:3001/api
- npm dev: http://localhost:3002/api

Available endpoints:

- `GET /api/health` - Health check
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Save new workout
- `GET /api/muscle-states` - Get muscle fatigue states
- `PUT /api/muscle-states` - Update muscle states
- `GET /api/personal-bests` - Get PRs
- `PUT /api/personal-bests` - Update PRs
- `GET /api/muscle-baselines` - Get muscle baselines
- `PUT /api/muscle-baselines` - Update baselines

## Troubleshooting

### Port Already in Use

**Docker ports (3000, 3001):**

If port 3000 or 3001 is already in use:

```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Stop other services using those ports, or
# Edit docker-compose.yml to use different ports:
ports:
  - "8080:3000"  # Access frontend at localhost:8080 instead
  - "8081:3001"  # Backend API at localhost:8081 instead
```

**npm dev port (3002):**

Port 3002 is specifically chosen to avoid conflicts with Docker. If it's already in use:

```bash
# Check what's using port 3002
netstat -ano | findstr :3002

# Edit backend/.env.local to use a different port:
PORT=3003
```

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Corruption

```bash
# Stop the app
docker-compose down

# Backup current database
mv data/fitforge.db data/fitforge.db.corrupted

# Restart (will create fresh database)
docker-compose up -d
```

## Alternative: Local Development (Not Recommended on Windows)

### Why Docker is Recommended

**Windows users**: npm has a known bug with optional dependencies that affects the Rollup bundler used by Vite. You may encounter errors like:

```
Error: Cannot find module '@rollup/rollup-win32-x64-msvc'
```

This is a documented npm issue (https://github.com/npm/cli/issues/4828) that is difficult to resolve. **Docker avoids this issue entirely.**

### If You Must Run Without Docker

**Prerequisites:**
- Node.js 16+ installed
- npm or pnpm package manager

**Setup:**

```bash
# Backend configuration is already set up
# The backend/.env.local file configures PORT=3002 for local development
# This avoids conflicts with Docker (which uses port 3001)
```

**Steps:**

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start
# Backend will run on port 3002

# Terminal 2: Start frontend (from fitforge-local root)
npm install
npm run dev
# Frontend will run on port 3000 (Vite default)
```

**Access the application:**
- Frontend: http://localhost:3000 (Vite dev server)
- Backend API: http://localhost:3002/api

### Troubleshooting Local Development

#### Windows: Rollup/npm Optional Dependency Issue

**Symptoms:**
- `npm install` completes without errors
- `npm run dev` fails with "Cannot find module '@rollup/rollup-win32-x64-msvc'"
- Reinstalling doesn't fix the issue

**Attempted Solutions (often don't work):**
```bash
# These rarely work due to the npm bug:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --force
npm install --include=optional
```

**Recommended Solution:**
Use Docker instead (see Quick Start section above). The `start.bat` script makes this easy.

**Alternative Solution (if Docker not available):**
Switch to pnpm package manager:
```bash
# Install pnpm globally
npm install -g pnpm

# Use pnpm instead of npm
pnpm install
pnpm run dev
```

pnpm handles optional dependencies correctly on Windows and may resolve the issue.

#### Port Already in Use (Frontend)

If port 5173 is already in use:
```bash
# Kill the process using port 5173, or
# Edit vite.config.ts to use a different port
```

#### Backend Connection Issues

Ensure backend is running on the correct port:

**For Docker:**
```bash
docker-compose logs backend
# Should show: Server running on: http://localhost:3001
```

**For npm dev:**
```bash
cd backend
npm start
# Should show: Server running on: http://localhost:3002
```

If the backend is on the wrong port, check:
- Docker: Verify `docker-compose.yml` has `PORT=3001` in environment
- npm dev: Verify `backend/.env.local` has `PORT=3002`

## System Requirements

- **Docker Desktop**: 4GB RAM minimum
- **Disk Space**: ~500MB for containers + your workout data
- **OS**: Windows 10/11, macOS, or Linux

## Privacy

- ✅ All data stays on your computer
- ✅ No cloud synchronization
- ✅ No telemetry or tracking
- ✅ Works completely offline

## License

Personal use only. Based on FitForge by Google AI Studio.
