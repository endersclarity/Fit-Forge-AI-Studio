# FitForge Local - Initialization Guide

**Status:** ✅ Ready to Run
**Last Updated:** 2025-10-24
**Platform:** Windows, macOS, Linux (Docker recommended)

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Windows - Use the provided batch script
./start.bat

# Or manually with Docker Compose
docker-compose up -d

# Access the application
Frontend:  http://localhost:3000
Backend:   http://localhost:3001/api
Health:    http://localhost:3001/api/health
```

**Docker Services:**
- **fitforge-backend**: Express.js API server (port 3001, production database)
- **fitforge-frontend**: React Vite app (port 3000)
- **data volume**: SQLite database persistence at `./data/fitforge.db`

---

### Option 2: Local npm Development

**Prerequisites:**
- Node.js 16+ installed
- npm available in PATH
- Two terminal windows

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # if not already done
npm run dev

# Expected output:
# 2025-10-24T12:00:00.000Z - GET /api/health
# Server running on http://localhost:3002
```

**Terminal 2 - Frontend:**
```bash
npm install  # if not already done
npm run dev

# Expected output:
# VITE v6.2.0 ready in 234 ms
# ➜  Local:   http://localhost:3000/
```

**Important Notes:**
- Backend runs on **port 3002** (not 3001) to avoid Docker conflicts
- Frontend automatically connects to backend at correct port
- Database: `./data/fitforge.db` (shared between Docker and npm)

---

## Project Structure

```
fitforge-local/
├── Frontend (React/TypeScript - Vite)
│   ├── src/
│   │   ├── App.tsx              # Main application shell
│   │   ├── index.tsx            # React entry point
│   │   ├── api.ts               # API client (axios)
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── constants.ts         # Exercise database (48 exercises)
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.tsx     # Muscle states & recovery
│   │   │   ├── Workout.tsx       # Workout logging
│   │   │   ├── WorkoutTemplates.tsx  # Template management
│   │   │   ├── PersonalBests.tsx     # Performance history
│   │   │   ├── Profile.tsx       # User settings
│   │   │   ├── Toast.tsx         # Notifications
│   │   │   └── Icons.tsx         # SVG components
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAPIState.ts    # API request state
│   │   │   └── useLocalStorage.ts # LocalStorage sync
│   │   └── utils/               # Utilities
│   ├── index.html               # HTML entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
│
├── Backend (Express/Node.js)
│   ├── server.ts                # Express API server (TypeScript)
│   ├── server.js                # Compiled server (JavaScript)
│   ├── package.json             # Backend dependencies
│   ├── tsconfig.json            # TypeScript strict mode
│   ├── .env.local               # Environment variables
│   ├── database/
│   │   ├── database.ts          # Database operations (TypeScript)
│   │   ├── database.js          # Compiled database (JavaScript)
│   │   └── schema.sql           # SQLite schema & initialization
│   ├── middleware/              # Express middleware
│   └── routes/                  # API endpoints (modular)
│
├── Database (SQLite)
│   ├── data/
│   │   ├── fitforge.db          # Main database file
│   │   ├── fitforge.db-shm      # Shared memory (WAL mode)
│   │   └── fitforge.db-wal      # Write-ahead log
│
├── Configuration
│   ├── docker-compose.yml       # Docker services definition
│   ├── Dockerfile               # Frontend container build
│   ├── backend/Dockerfile       # Backend container build
│   ├── .env.example             # Environment template
│   ├── .gitignore               # Git ignore rules
│   ├── start.bat                # Windows launcher script
│   └── README-LOCAL.md          # Comprehensive setup guide
│
└── Documentation
    ├── FITFORGE-INIT.md         # This file (initialization guide)
    ├── HANDOFF-workout-templates.md  # Handoff notes
    └── metadata.json            # Project metadata
```

---

## Initialization Checklist

### ✅ Pre-requisites (Already Completed)
- [x] Dependencies installed (frontend & backend `node_modules/`)
- [x] Database created (`./data/fitforge.db`)
- [x] Database schema initialized (9 tables)
- [x] Default user created (user_id = 1, name = "Athlete")
- [x] All 13 muscle states initialized (0% fatigue)
- [x] All 13 muscle baselines initialized (10000 units max)
- [x] TypeScript configured (strict mode on backend)
- [x] Environment variables set (`.env.local`)
- [x] CORS configured (localhost only)
- [x] Docker ready (docker-compose.yml configured)

### 🚀 To Start the Application

**Docker:**
```bash
./start.bat              # Windows
docker-compose up -d     # Cross-platform
```

**Local npm:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### 📝 Verification Steps

After starting the application:

1. **Backend Health Check**
   ```bash
   curl http://localhost:3001/api/health  # Docker
   curl http://localhost:3002/api/health  # npm dev
   ```
   Expected: `{"status":"healthy","timestamp":"2025-10-24T..."}`

2. **User Profile**
   ```bash
   curl http://localhost:3001/api/profile
   ```
   Expected: User object with name "Athlete"

3. **Frontend Access**
   - Open http://localhost:3000 in browser
   - Should see Dashboard with 13 muscle groups
   - All fatigue percentages at 0%

4. **Workout Logging**
   - Navigate to "Workout" tab
   - Select any exercise
   - Enter weight and reps
   - Submit
   - Should see success toast notification

---

## Environment Configuration

### Backend (.env.local)
```bash
# Port Configuration
PORT=3002                    # npm dev (3001 for Docker)

# Database Path
DB_PATH=../data/fitforge.db # npm dev (/data/fitforge.db for Docker)

# Node Environment
NODE_ENV=development
```

### Frontend (Vite)
- Uses `VITE_API_URL` environment variable
- Docker: `VITE_API_URL=http://localhost:3001/api`
- npm dev: Auto-detected from backend port

---

## Database Initialization

The SQLite database is automatically initialized on first server start with:

### Tables (9 total)
1. **users** - Single user profile
2. **workouts** - Workout sessions
3. **exercise_sets** - Individual sets per exercise
4. **bodyweight_history** - Weight tracking
5. **muscle_states** - Fatigue/recovery per muscle
6. **personal_bests** - Exercise maxes
7. **muscle_baselines** - Learned capacity per muscle
8. **workout_templates** - Saved workout configurations
9. **equipment** - Equipment inventory

### Default Data
- **User:** ID=1, Name="Athlete", Experience="Beginner"
- **Muscles:** 13 muscle groups all initialized to 0% fatigue
- **Baselines:** 13 muscle baselines initialized to 10000 units

### Indexes (6 total)
Optimized queries for common operations:
- Workouts by user and date
- Exercise sets by workout
- Muscle states by user
- Personal bests by user
- Muscle baselines by user
- Templates by user

---

## Available API Endpoints

All endpoints require localhost and return JSON.

### Health & Status
- `GET /api/health` - Server health check

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Workouts
- `GET /api/workouts` - List workouts
- `POST /api/workouts` - Log a new workout
- `GET /api/workouts/:id` - Get workout details

### Muscle States (Fatigue/Recovery)
- `GET /api/muscle-states` - Get all muscle fatigue levels
- `PUT /api/muscle-states` - Update muscle states

### Personal Bests
- `GET /api/personal-bests` - Get exercise maxes
- `PUT /api/personal-bests` - Update personal bests

### Muscle Baselines (Capacity)
- `GET /api/muscle-baselines` - Get baseline capacities
- `PUT /api/muscle-baselines` - Update baselines

### Workout Templates
- `GET /api/templates` - List saved templates
- `POST /api/templates` - Create new template
- `GET /api/templates/:id` - Get template details
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

---

## Development Workflow

### Making Changes

**Frontend Changes:**
- Files auto-reload via Vite HMR (Hot Module Replacement)
- No manual restart needed
- Type-check: Run TypeScript in VS Code

**Backend Changes:**
- Manual restart required (or use `npm run dev:watch` with nodemon)
- TypeScript compiles on save
- API endpoints test with curl or test-api.html

**Database Changes:**
- Schema changes require server restart
- New tables must be added to schema.sql
- Remember: Schema uses `CREATE TABLE IF NOT EXISTS`

### Building for Production

```bash
# Frontend build
npm run build                # Creates optimized dist/

# Backend build
cd backend && npm run build  # Compiles TypeScript to dist/

# Docker build
docker-compose build         # Rebuilds all containers
docker-compose up -d         # Start production containers
```

---

## Troubleshooting

### Backend Won't Start (npm)

**Problem:** `Cannot find module 'dotenv'`
```bash
# Solution: Install backend dependencies
cd backend && npm install
```

**Problem:** Port 3002 already in use
```bash
# Solution: Change PORT in backend/.env.local
# Or kill process using port 3002
# Windows: netstat -ano | findstr :3002
# macOS/Linux: lsof -i :3002
```

**Problem:** `ENOENT: no such file or directory, open '../data/fitforge.db'`
```bash
# Solution: Create data directory
mkdir data
```

### Frontend Won't Start

**Problem:** npm start fails with rollup error
```bash
# Solution: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Can't reach backend API
```bash
# Verify backend is running on correct port
curl http://localhost:3001/api/health    # Docker
curl http://localhost:3002/api/health    # npm dev

# Check CORS origin in browser console
# Frontend must match one of server's allowed origins
```

### Docker Issues

**Problem:** `Cannot find module` in Docker logs
```bash
# Solution: Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d
```

**Problem:** Database empty in Docker
```bash
# Solution: Docker uses /data/fitforge.db
# The local ./data/ directory is mounted as volume
# Check: ls -la data/
```

**Problem:** Port already in use
```bash
# Solution: Stop existing containers
docker-compose down
# Or change ports in docker-compose.yml
```

---

## File Tree (Quick Reference)

```
fitforge-local/
├── README.md                    # Main documentation
├── README-LOCAL.md              # Detailed setup guide
├── FITFORGE-INIT.md            # This initialization guide
├── start.bat                    # Windows launcher
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Frontend container
│
├── backend/
│   ├── server.ts               # Express API server (TypeScript)
│   ├── server.js               # Compiled server
│   ├── package.json            # Backend dependencies
│   ├── .env.local              # Backend environment config
│   ├── Dockerfile              # Backend container
│   ├── database/
│   │   ├── database.ts         # DB operations (TypeScript)
│   │   ├── database.js         # Compiled DB operations
│   │   └── schema.sql          # SQLite schema
│   └── middleware/
│
├── components/
│   ├── App.tsx
│   ├── Dashboard.tsx
│   ├── Workout.tsx
│   ├── WorkoutTemplates.tsx
│   ├── PersonalBests.tsx
│   ├── Profile.tsx
│   └── ...
│
├── hooks/
│   ├── useAPIState.ts
│   └── useLocalStorage.ts
│
├── data/
│   ├── fitforge.db             # SQLite database
│   ├── fitforge.db-shm         # Shared memory
│   └── fitforge.db-wal         # Write-ahead log
│
└── node_modules/               # Dependencies installed
```

---

## Performance Tips

1. **Database Queries:** Indexed on user_id and dates - queries are fast
2. **Frontend Rendering:** React 19 with functional components, efficient re-renders
3. **API Calls:** Use useAPIState hook to prevent duplicate requests
4. **Local Storage:** Persists non-critical UI state (reduces API calls)

---

## Security Features

- **CORS:** Restricted to localhost origins only
- **Binding:** Server binds to 127.0.0.1 (no external access)
- **No Auth:** Single-user local design (no authentication needed)
- **Database:** SQLite with proper foreign keys and constraints
- **Environment:** Secrets in .env.local (added to .gitignore)

---

## Next Steps

1. **Start Application:**
   ```bash
   ./start.bat              # Windows
   docker-compose up -d     # Or Docker
   ```

2. **Open Browser:**
   ```
   http://localhost:3000
   ```

3. **Log a Workout:**
   - Go to "Workout" tab
   - Select any exercise
   - Enter weight and reps
   - Submit

4. **Check Dashboard:**
   - See updated muscle fatigue percentages
   - Verify recovery tracking

5. **Review Personal Bests:**
   - Check exercise maxes
   - See rolling averages

---

## Key Files Reference

| File | Purpose | Language |
|------|---------|----------|
| `backend/server.ts` | Express API server | TypeScript |
| `backend/database/database.ts` | Database operations | TypeScript |
| `App.tsx` | Main app component | TypeScript |
| `api.ts` | API client | TypeScript |
| `types.ts` | Shared types | TypeScript |
| `constants.ts` | Exercise database (48 exercises) | TypeScript |
| `docker-compose.yml` | Docker services | YAML |
| `backend/database/schema.sql` | SQLite schema | SQL |

---

## Support & Documentation

- **README.md** - Project overview
- **README-LOCAL.md** - Detailed setup guide
- **HANDOFF-workout-templates.md** - Handoff notes for templates feature
- **FITFORGE-INIT.md** - This file (initialization guide)
- **types.ts** - TypeScript interface definitions
- **constants.ts** - Exercise database and configurations

---

## Summary

**FitForge Local** is now initialized and ready to run. Choose your preferred startup method:

- **Docker (Recommended):** `./start.bat` or `docker-compose up -d`
- **Local npm:** `cd backend && npm run dev` + `npm run dev` in another terminal

All dependencies are installed, database is ready, and endpoints are configured. Start building your workout tracking!

---

*FitForge Local v1.0 - Offline Fitness Tracking*
