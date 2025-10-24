# FitForge Local - Offline Docker Setup

Run FitForge completely offline with a real database on your computer.

## Features

- ✅ **Completely Offline** - No internet connection needed
- ✅ **Real Database** - SQLite database stores all your data
- ✅ **Persistent Data** - All workouts saved to your computer
- ✅ **Easy Backup** - Just copy the database file
- ✅ **Docker-based** - Clean, isolated installation

## Architecture

```
┌─────────────────────────────────────────────┐
│  Your Computer                              │
│                                             │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │   Frontend   │───▶│    Backend API   │  │
│  │   (React)    │◀───│    (Express)     │  │
│  │              │    │                  │  │
│  │  localhost:  │    │  localhost:3001  │  │
│  │     3000     │    │                  │  │
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

## Prerequisites

- **Docker Desktop** installed on your computer
  - Download from: https://www.docker.com/products/docker-desktop/

## Quick Start

### 1. Start the App

```bash
# Navigate to fitforge-local directory
cd C:\Users\ender\.claude\projects\launchpad\fitforge-local

# Start all services
docker-compose up -d
```

### 2. Access the App

Open your browser to: **http://localhost:3000**

### 3. Stop the App

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

The backend exposes these endpoints (available at http://localhost:3001/api):

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

If port 3000 or 3001 is already in use:

```bash
# Stop other services using those ports, or
# Edit docker-compose.yml to use different ports:
ports:
  - "8080:3000"  # Access at localhost:8080 instead
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

## Development

### Run Without Docker

If you prefer to run locally without Docker:

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start

# Terminal 2: Start frontend
npm install
npm run dev
```

Access at: http://localhost:5173 (Vite dev server)

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
