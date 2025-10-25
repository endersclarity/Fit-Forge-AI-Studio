# FitForge Local - Architecture Overview

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER (localhost:3000)              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Application (React 19 + TypeScript + Vite)        │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  UI Components                                  │   │  │
│  │  │  ├─ Dashboard (Muscle Fatigue Display)         │   │  │
│  │  │  ├─ Workout (Exercise Logging)                 │   │  │
│  │  │  ├─ PersonalBests (Performance History)        │   │  │
│  │  │  ├─ WorkoutTemplates (Template Management)     │   │  │
│  │  │  ├─ Profile (User Settings)                    │   │  │
│  │  │  ├─ Toast (Notifications)                      │   │  │
│  │  │  └─ Icons (SVG Components)                     │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  State Management                               │   │  │
│  │  │  ├─ useAPIState (API Request State)            │   │  │
│  │  │  ├─ useLocalStorage (Persistent State)         │   │  │
│  │  │  └─ React Hooks (useState, useEffect)          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  API Client (Axios)                            │   │  │
│  │  │  └─ api.ts (Endpoints: /api/*)               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                      VITE DEV SERVER (Port 3000)                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │ (JSON)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS API SERVER                           │
│              (Port 3001: Docker, 3002: npm dev)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Routes                                              │  │
│  │  ├─ GET/PUT   /api/profile        → User Profile        │  │
│  │  ├─ GET/POST  /api/workouts       → Workout Logging     │  │
│  │  ├─ GET/PUT   /api/muscle-states  → Fatigue Tracking    │  │
│  │  ├─ GET/PUT   /api/personal-bests → Exercise Maxes      │  │
│  │  ├─ GET/PUT   /api/muscle-baselines → Capacity Limits   │  │
│  │  ├─ GET/POST/PUT/DEL /api/templates → Template CRUD     │  │
│  │  └─ GET       /api/health         → Server Health       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Middleware                                              │  │
│  │  ├─ CORS (Localhost only: 127.0.0.1:3000, etc.)        │  │
│  │  ├─ Body Parser (JSON & URL-encoded)                   │  │
│  │  └─ Logging (HTTP request logs)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Database Operations (database.ts)                       │  │
│  │  ├─ createWorkout()                                     │  │
│  │  ├─ getWorkouts()                                       │  │
│  │  ├─ getMuscleStates()                                   │  │
│  │  ├─ updateMuscleStates()                               │  │
│  │  ├─ getPersonalBests()                                 │  │
│  │  ├─ updatePersonalBests()                              │  │
│  │  ├─ getProfile()                                        │  │
│  │  ├─ updateProfile()                                     │  │
│  │  └─ Template CRUD operations                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ SQL Queries
                       │ (better-sqlite3)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite Database                               │
│              (./data/fitforge.db - 4.1 MB)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Core Tables                                             │  │
│  │  ├─ users (1 default user)                              │  │
│  │  ├─ workouts (Workout sessions)                         │  │
│  │  └─ exercise_sets (Individual sets)                     │  │
│  │                                                           │  │
│  │  Analytics Tables                                        │  │
│  │  ├─ muscle_states (13 muscles, 0% fatigue default)     │  │
│  │  ├─ personal_bests (Exercise maxes)                    │  │
│  │  └─ muscle_baselines (10000 units default)            │  │
│  │                                                           │  │
│  │  Configuration Tables                                   │  │
│  │  ├─ bodyweight_history (Weight tracking)               │  │
│  │  ├─ equipment (Equipment inventory)                    │  │
│  │  └─ workout_templates (Saved plans)                   │  │
│  │                                                           │  │
│  │  Indexes (6 for performance)                            │  │
│  │  ├─ idx_workouts_user_date                             │  │
│  │  ├─ idx_exercise_sets_workout                          │  │
│  │  ├─ idx_muscle_states_user                             │  │
│  │  ├─ idx_personal_bests_user                            │  │
│  │  ├─ idx_muscle_baselines_user                          │  │
│  │  └─ idx_workout_templates_user                         │  │
│  │                                                           │  │
│  │  WAL Mode (Write-Ahead Logging)                         │  │
│  │  ├─ fitforge.db (Main database)                        │  │
│  │  ├─ fitforge.db-shm (Shared memory)                   │  │
│  │  └─ fitforge.db-wal (Write-ahead log)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Architecture

```
USER ACTION (Browser)
    │
    ▼
React Component (handles UI state)
    │
    ▼
API Call (Axios) → api.ts
    │
    ▼
HTTP Request → Express Router
    │
    ▼
Route Handler (server.ts)
    │
    ├─ Validate request
    ├─ Process business logic
    │
    ▼
Database Operation (database.ts)
    │
    ├─ Build SQL query
    ├─ Execute using better-sqlite3
    │
    ▼
SQLite Engine
    │
    ├─ Parse SQL
    ├─ Apply constraints
    ├─ Write to file (or WAL)
    │
    ▼
Response (JSON)
    │
    ▼
HTTP Response → Axios Promise
    │
    ▼
React State Update
    │
    ▼
Component Re-render
    │
    ▼
Browser Display Update
```

---

## 🔄 Feature Architecture

### 1. Workout Logging Flow

```
Dashboard
  ↓
Workout Component
  ↓
Select Exercise (from 48 exercises in constants.ts)
  ↓
Enter Weight & Reps
  ↓
POST /api/workouts
  ↓
database.createWorkout()
  ↓
Insert into exercise_sets table
  ↓
Calculate muscle engagement (from exercise definition)
  ↓
Update muscle_states (fatigue percentage)
  ↓
Return success response
  ↓
Toast notification
  ↓
Dashboard auto-updates (via useEffect)
```

### 2. Muscle Fatigue Calculation

```
New Workout Logged
  ↓
For each exercise:
  - Get muscle engagements (from constants.ts)
  - Calculate volume = weight × reps × engagement %
  ↓
Update muscle_states table:
  - fatigue_percent = current + new volume
  - volume_today += calculated volume
  ↓
Dashboard displays:
  - Fatigue as percentage (0-100%)
  - Progress bar per muscle
  - Recovery time estimate
```

### 3. Personal Bests Tracking

```
Exercise Completed
  ↓
Post-workout Summary Modal
  ↓
Extract exercise metrics:
  - Best single set (max weight for reps)
  - Session volume (total weight × reps)
  ↓
Compare with personal_bests record
  ↓
IF new PR:
  - Update personal_bests table
  - Show celebration UI
ELSE:
  - Keep existing record
  ↓
PersonalBests component displays all time maxes
```

---

## 📦 Component Hierarchy

```
App (Root)
├─ Router / Navigation
│
├─ Dashboard
│   ├─ MuscleCard (×13)
│   │   ├─ Progress bar
│   │   ├─ Fatigue percentage
│   │   ├─ Recovery time
│   │   └─ Last trained
│   │
│   ├─ Stats Summary
│   └─ Quick Actions
│
├─ Workout
│   ├─ Exercise Selector
│   │   └─ 48 exercises from constants.ts
│   │
│   ├─ Set Logger (×5 sets typical)
│   │   ├─ Weight input
│   │   └─ Reps input
│   │
│   └─ Submit Button
│       └─ POST /api/workouts
│
├─ PersonalBests
│   ├─ Exercise List
│   │   └─ Best metrics (single set, volume, rolling avg)
│   │
│   └─ Charts/Graphs
│
├─ WorkoutTemplates
│   ├─ Template List
│   │   ├─ Favorite toggle
│   │   └─ Times used counter
│   │
│   ├─ Create Template Modal
│   ├─ Edit Template Modal
│   └─ Delete Confirmation
│
├─ Profile
│   ├─ User Info Form
│   │   ├─ Name input
│   │   └─ Experience selector
│   │
│   └─ Settings
│
├─ ProfileModal
│   └─ Modal dialog for profile edit
│
├─ WorkoutSummaryModal
│   ├─ Personal bests achieved
│   └─ Volume summary
│
├─ Toast
│   └─ Notification system
│
└─ Icons
    └─ SVG components
```

---

## 🗂️ State Management Architecture

### Component-Level State (React Hooks)
```
Dashboard:
  - selectedMuscle: Muscle | null
  - expandedMuscle: Muscle | null
  - refreshTrigger: boolean

Workout:
  - selectedExercise: Exercise | null
  - sets: SetData[]
  - isLoading: boolean

PersonalBests:
  - selectedExercise: Exercise | null
  - timeRange: '7d' | '30d' | 'all'
```

### Global State (localStorage)
```
fitforge-app-state:
  - lastWorkoutDate: string
  - favoriteExercises: string[]
  - sidebarCollapsed: boolean
  - theme: 'light' | 'dark' (if implemented)
```

### Server State (API/Database)
```
Users:
  - Profile info
  - Preferences

Workouts:
  - Exercise history
  - Weight/rep progression

Muscle States:
  - Current fatigue
  - Recovery status

Personal Bests:
  - Best single set per exercise
  - Session volumes
  - Rolling averages
```

---

## 🔐 Security Architecture

```
┌─────────────────┐
│  Web Browser    │ (localhost:3000)
└────────┬────────┘
         │
         │ CORS Check (Allowed Origins)
         │ ├─ http://localhost:3000 ✓
         │ ├─ http://127.0.0.1:3000 ✓
         │ └─ All others ✗
         │
         ▼
┌─────────────────────────┐
│  Express.js Server      │ (127.0.0.1:3001/3002)
├─────────────────────────┤
│ • No external binding   │
│ • Localhost only        │
│ • No authentication     │ (Single-user design)
│ • Single user (ID=1)    │
└────────┬────────────────┘
         │
         │ SQL Queries
         │ ├─ Foreign key constraints
         │ ├─ Data validation
         │ └─ No SQL injection (parameterized queries)
         │
         ▼
┌─────────────────┐
│  SQLite DB      │ (./data/fitforge.db)
├─────────────────┤
│ • File-based    │
│ • Local disk    │
│ • No network    │
└─────────────────┘
```

---

## 🚀 Deployment Architecture

### Local Development
```
Developer Machine
├─ Port 3000: Vite Dev Server (Frontend)
├─ Port 3002: Node.js Server (Backend)
└─ File: ./data/fitforge.db (SQLite)
```

### Docker Production
```
Docker Host
├─ fitforge-frontend (Port 3000)
│   ├─ Base: node:20-alpine
│   ├─ Build: npm install + npm run build (Vite)
│   ├─ Runtime: serve -s dist
│   └─ EntryPoint: /bin/sh -c
│
├─ fitforge-backend (Port 3001)
│   ├─ Base: node:20-alpine
│   ├─ Build: npm install --production
│   ├─ Runtime: node server.js
│   ├─ HealthCheck: /api/health
│   └─ Env: NODE_ENV=production, PORT=3001
│
├─ data (Named Volume)
│   └─ ./data → /data (Database persistence)
│
└─ Network: fitforge-network
    └─ Services communicate via service names
```

---

## 📈 Database Schema Relationships

```
users (id)
  │
  ├─→ workouts (user_id)
  │    │
  │    └─→ exercise_sets (workout_id)
  │
  ├─→ muscle_states (user_id, muscle_name)
  │
  ├─→ personal_bests (user_id, exercise_name)
  │
  ├─→ muscle_baselines (user_id, muscle_name)
  │
  ├─→ workout_templates (user_id)
  │
  ├─→ bodyweight_history (user_id, date)
  │
  └─→ equipment (user_id, name)

Constraints:
  - Foreign keys ON DELETE CASCADE
  - UNIQUE constraints on (user_id, muscle_name)
  - UNIQUE constraints on (user_id, exercise_name)
```

---

## 🔄 API Request/Response Cycle

```
FRONTEND REQUEST FLOW:

1. User Action
   └─ Click "Log Workout"

2. React Component Handler
   └─ useState updates (isLoading = true)

3. API Call
   └─ axios.post('/api/workouts', {data})
      └─ HTTP POST to http://localhost:3001/api/workouts

4. Express Router Match
   └─ app.post('/api/workouts', handler)

5. Route Handler
   ├─ Extract request body
   ├─ Validate data
   └─ Call db.createWorkout()

6. Database Operation
   ├─ Calculate muscle engagement
   ├─ INSERT into exercise_sets
   ├─ UPDATE muscle_states
   └─ SELECT updated data

7. Response
   └─ HTTP 200 + JSON

8. Frontend Handler
   ├─ setState(isLoading = false)
   ├─ setState(successMessage)
   └─ Refresh data via useEffect

9. UI Update
   └─ Component re-renders
      ├─ Toast shows success
      └─ Dashboard updates muscle fatigue
```

---

## 📊 Exercise Database

```
constants.ts (48 exercises)

Exercise Structure:
{
  id: string              // Unique identifier
  name: string            // Display name
  category: string        // 'Push' | 'Pull' | 'Legs' | 'Core'
  equipment: string       // Dumbbells, Kettlebell, etc.
  difficulty: string      // 'Beginner' | 'Intermediate' | 'Advanced'
  muscleEngagements: [
    { muscle: Muscle, percentage: number }  // 1-13 muscles
  ]
  variation: string       // 'A' | 'B' | 'Both'
}

Muscle Groups (13 total):
  Upper Body (9):
    ├─ Pectoralis (Chest)
    ├─ Triceps
    ├─ Deltoids (Shoulders)
    ├─ Lats (Upper back)
    ├─ Biceps
    ├─ Rhomboids
    ├─ Trapezius
    └─ Forearms

  Lower Body (4):
    ├─ Quadriceps
    ├─ Glutes
    ├─ Hamstrings
    └─ Calves

  Core (1):
    └─ Core
```

---

## 🎯 Type Safety Architecture

```
Frontend Types (types.ts)
├─ interface User
├─ interface Workout
├─ interface ExerciseSet
├─ interface MuscleState
├─ interface PersonalBest
├─ interface Exercise
└─ interface WorkoutTemplate

Backend Types (same file: types.ts)
├─ interface ProfileResponse
├─ interface WorkoutResponse
├─ interface WorkoutSaveRequest
├─ interface MuscleStatesResponse
├─ interface PersonalBestsResponse
└─ interface ApiErrorResponse

TypeScript Configuration:
  Frontend:
    - target: ES2022
    - jsx: react-jsx
    - strict: true (derived)

  Backend:
    - target: ES2020
    - module: commonjs
    - strict: true
    - noImplicitAny: true
    - strictNullChecks: true
    - noUnusedLocals: true
    - noImplicitReturns: true
```

---

## 📍 File Organization

```
fitforge-local/
│
├─ Frontend Assets
│   ├─ index.html (HTML entry)
│   ├─ index.tsx (React entry)
│   └─ favicon, assets/
│
├─ Frontend Source
│   ├─ App.tsx (Main component)
│   ├─ api.ts (API client)
│   ├─ types.ts (Shared types)
│   ├─ constants.ts (Exercises DB)
│   │
│   ├─ components/
│   │   ├─ Dashboard.tsx
│   │   ├─ Workout.tsx
│   │   ├─ WorkoutTemplates.tsx
│   │   ├─ PersonalBests.tsx
│   │   ├─ Profile.tsx
│   │   ├─ ProfileModal.tsx
│   │   ├─ WorkoutSummaryModal.tsx
│   │   ├─ Toast.tsx
│   │   └─ Icons.tsx
│   │
│   ├─ hooks/
│   │   ├─ useAPIState.ts
│   │   └─ useLocalStorage.ts
│   │
│   └─ utils/
│       └─ helpers.ts
│
├─ Backend Source
│   ├─ backend/server.ts (Express app)
│   ├─ backend/server.js (Compiled)
│   │
│   ├─ backend/database/
│   │   ├─ database.ts (Operations)
│   │   ├─ database.js (Compiled)
│   │   └─ schema.sql (Schema)
│   │
│   ├─ backend/middleware/ (Custom middleware)
│   ├─ backend/routes/ (Route handlers)
│   │
│   └─ backend/.env.local (Config)
│
├─ Database
│   └─ data/
│       ├─ fitforge.db (Main)
│       ├─ fitforge.db-shm (Shared mem)
│       └─ fitforge.db-wal (WAL)
│
├─ Configuration
│   ├─ docker-compose.yml
│   ├─ Dockerfile (Frontend)
│   ├─ backend/Dockerfile
│   ├─ vite.config.ts
│   ├─ backend/tsconfig.json
│   ├─ tsconfig.json
│   ├─ package.json (Frontend)
│   └─ backend/package.json
│
├─ Documentation
│   ├─ README.md
│   ├─ README-LOCAL.md
│   ├─ FITFORGE-INIT.md
│   ├─ QUICK-START.md
│   ├─ INIT-STATUS.md
│   ├─ ARCHITECTURE.md (This file)
│   └─ HANDOFF-workout-templates.md
│
└─ Utilities
    ├─ start.bat (Windows launcher)
    └─ test-api.html (API testing tool)
```

---

## 🔗 Key Integrations

### Frontend ↔ Backend
- **Protocol:** HTTP/REST with JSON
- **Auth:** None (single-user local)
- **CORS:** Localhost only
- **Error Handling:** Axios interceptors + useAPIState hook

### Backend ↔ Database
- **Driver:** better-sqlite3
- **Mode:** Synchronous (blocking)
- **Transactions:** Implicit per statement
- **Connection:** Single persistent connection

### Container Orchestration
- **Compose:** Services communicate via service names
- **Networking:** fitforge-network (bridge)
- **Volumes:** data (shared SQLite location)
- **Health:** /api/health endpoint checks

---

## 💾 Data Persistence Strategy

```
Development (npm):
  - Database: ./data/fitforge.db (local file)
  - Workouts: In-process during development
  - Persistence: Automatic on each operation

Production (Docker):
  - Database: /data/fitforge.db (inside container)
  - Volume Mount: ./data → /data (host → container)
  - Persistence: Data survives container restart
  - Backup: Manual backup of ./data/ directory

WAL Mode:
  - fitforge.db (Main database pages)
  - fitforge.db-wal (Uncommitted changes)
  - fitforge.db-shm (Shared memory index)
  - Benefits: Better concurrency, faster writes
```

---

## 🎓 Summary

FitForge Local follows a clean, layered architecture:

1. **Presentation Layer:** React components + state management
2. **API Layer:** Express.js RESTful endpoints
3. **Business Logic:** Database operations + calculations
4. **Data Layer:** SQLite with proper schema and indexes
5. **Infrastructure:** Docker for consistent deployment

The system is designed for a single user, offline-first operation with complete data persistence and type safety throughout.

---

*Architecture Last Updated: 2025-10-24*
