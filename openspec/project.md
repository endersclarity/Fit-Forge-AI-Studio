# FitForge Local - Project Specification

## 📋 Project Overview

**FitForge Local** is a fully offline fitness tracking web application designed for single-user, local-only operation. It helps users log workouts, track muscle fatigue, manage personal bests, and organize workout templates.

- **Type:** Web Application (SPA)
- **Scope:** Single-user, offline-first fitness tracker
- **Status:** Active development
- **Last Updated:** 2025-10-24

---

## 🎯 Core Purpose

FitForge Local enables users to:
1. **Log Workouts** - Record exercises with weight and reps
2. **Track Muscle Fatigue** - Monitor fatigue levels for 13 muscle groups
3. **View Personal Bests** - Track best single sets and session volumes per exercise
4. **Manage Templates** - Save and reuse favorite workout configurations
5. **Monitor Bodyweight** - Track weight changes over time

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 19.2.0
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite 6.2.0
- **Package Manager:** npm
- **HTTP Client:** Axios
- **State Management:** React Hooks + localStorage

### Backend
- **Runtime:** Node.js (20-alpine in Docker)
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** SQLite 3 (better-sqlite3)
- **Port (dev):** 3002 (npm), 3001 (Docker)

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Frontend Server:** Vite dev server (dev), serve (Docker)
- **Database:** SQLite with WAL mode
- **Networking:** Localhost only (CORS restricted to 127.0.0.1:3000, localhost:3000)

---

## 📂 Project Structure

```
fitforge-local/
├── Frontend
│   ├── index.html
│   ├── index.tsx
│   ├── App.tsx (Root component)
│   ├── api.ts (Axios API client)
│   ├── types.ts (TypeScript interfaces)
│   ├── constants.ts (48 exercises database)
│   ├── components/
│   │   ├── Dashboard.tsx (Main muscle fatigue view)
│   │   ├── Workout.tsx (Exercise logging)
│   │   ├── WorkoutTemplates.tsx (Template CRUD)
│   │   ├── PersonalBests.tsx (Best metrics tracking)
│   │   ├── Profile.tsx (User settings)
│   │   ├── ProfileModal.tsx
│   │   ├── WorkoutSummaryModal.tsx
│   │   ├── Toast.tsx (Notifications)
│   │   └── Icons.tsx (SVG components)
│   ├── hooks/
│   │   ├── useAPIState.ts (API request state)
│   │   └── useLocalStorage.ts (Persistent state)
│   ├── utils/
│   │   └── helpers.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── Backend
│   ├── server.ts (Express app entry point)
│   ├── server.js (Compiled)
│   ├── database/
│   │   ├── database.ts (Database operations)
│   │   ├── database.js (Compiled)
│   │   └── schema.sql (SQLite schema)
│   ├── .env.local (Configuration)
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── Database
│   └── data/
│       ├── fitforge.db (SQLite database)
│       ├── fitforge.db-shm (Shared memory)
│       └── fitforge.db-wal (Write-ahead log)
│
├── Infrastructure
│   ├── docker-compose.yml
│   ├── Dockerfile (Frontend)
│   └── start.bat (Windows launcher)
│
├── Documentation
│   ├── README.md
│   ├── README-LOCAL.md
│   ├── ARCHITECTURE.md (Detailed system design)
│   ├── QUICK-START.md
│   ├── FITFORGE-INIT.md (Setup guide)
│   ├── INIT-STATUS.md
│   └── HANDOFF-workout-templates.md
│
└── OpenSpec
    └── project.md (This file)
```

---

## 🗄️ Database Schema

### Core Tables
- **users** - Single default user (ID=1)
- **workouts** - Workout sessions with date/time
- **exercise_sets** - Individual sets within workouts

### Analytics Tables
- **muscle_states** - Current fatigue per muscle (0-100%)
- **personal_bests** - Best single set and volumes per exercise
- **muscle_baselines** - Maximum capacity per muscle (10000 units default)

### Configuration Tables
- **workout_templates** - Saved workout configurations
- **bodyweight_history** - Weight tracking over time
- **equipment** - Available equipment inventory

### Indexes (6 total)
- idx_workouts_user_date
- idx_exercise_sets_workout
- idx_muscle_states_user
- idx_personal_bests_user
- idx_muscle_baselines_user
- idx_workout_templates_user

**Features:** WAL mode enabled, foreign key constraints, data validation

---

## 🎮 Core Features

### 1. Workout Logging
- Select from 48 predefined exercises
- Log up to 5 sets per workout
- Track weight and repetitions
- Automatic muscle fatigue calculation
- Real-time dashboard updates

### 2. Muscle Fatigue System
- 13 muscle groups tracked
- Fatigue percentage (0-100%)
- Volume-based calculations
- Recovery time estimates
- Daily volume tracking

### 3. Personal Bests Tracking
- Best single set per exercise
- Session volume tracking
- Rolling averages (7d, 30d, all-time)
- Historical comparison

### 4. Workout Templates
- Save favorite workout configurations
- Mark as favorites
- Track usage frequency
- Quick load for repeated workouts
- Full CRUD operations

### 5. User Profile
- User information storage
- Experience level tracking
- Settings management

---

## 📊 Exercise Database

**Total Exercises:** 48

**Categories:**
- Push (chest, shoulders, triceps focused)
- Pull (back, biceps focused)
- Legs (lower body)
- Core (abdominal and stabilizer)

**Muscle Groups (13 total):**

Upper Body (9):
- Pectoralis (Chest)
- Deltoids (Shoulders)
- Triceps
- Biceps
- Lats (Upper back)
- Rhomboids
- Trapezius
- Forearms

Lower Body (4):
- Quadriceps
- Hamstrings
- Glutes
- Calves

Core (1):
- Core

**Each exercise includes:**
- Equipment requirements
- Difficulty level
- Muscle engagement percentages (1-13 muscles)
- Variations (A, B, or Both)

---

## 🔐 Security & Design

### Security Model
- **Single-user design** - No authentication implemented
- **Localhost only** - CORS restricted to 127.0.0.1:3000, localhost:3000
- **No external binding** - Server runs on 127.0.0.1 only
- **Local file storage** - SQLite on local disk only
- **Parameterized queries** - SQL injection prevention
- **Foreign key constraints** - Data integrity validation

### Important Security Notes
⚠️ **NOT suitable for:**
- Multi-user deployment
- Internet-facing use
- Untrusted networks
- Production external hosting

---

## 🔄 API Endpoints

### Workouts
- `POST /api/workouts` - Log a new workout
- `GET /api/workouts` - Retrieve workout history
- `GET /api/workouts?exerciseName=name` - Filter by exercise

### Muscle States
- `GET /api/muscle-states` - Current fatigue per muscle
- `PUT /api/muscle-states` - Update muscle states

### Personal Bests
- `GET /api/personal-bests` - All-time personal bests
- `PUT /api/personal-bests` - Update personal bests

### Templates
- `GET /api/templates` - List workout templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Profile
- `GET /api/profile` - User profile information
- `PUT /api/profile` - Update user profile

### Health
- `GET /api/health` - Server health check

---

## 📋 Coding Conventions

### TypeScript
- **Strict Mode:** Enabled
- **Target:** ES2022 (frontend), ES2020 (backend)
- **Module:** ESM (frontend), CommonJS (backend)
- **No implicit any:** Enforced
- **Strict null checks:** Enabled
- **Unused locals detection:** Enabled

### File Naming
- Components: PascalCase (e.g., Dashboard.tsx)
- Functions: camelCase (e.g., useAPIState.ts)
- Constants: UPPER_SNAKE_CASE (in constants.ts)
- Types: PascalCase interfaces (in types.ts)

### Component Structure
```typescript
// hooks at top
// state declarations
// effects
// handlers
// render/return
```

### State Management
- **Component state:** React useState for local UI state
- **Global state:** localStorage for app-wide preferences
- **Server state:** API calls via Axios with custom hooks
- **Loading states:** Managed via useAPIState hook

### Error Handling
- **Frontend:** Axios interceptors + Toast notifications
- **Backend:** Express error middleware
- **Database:** Better-sqlite3 try-catch blocks

---

## 🚀 Deployment

### Development (npm)
```bash
cd backend && npm run dev      # Terminal 1
npm run dev                    # Terminal 2
# Frontend: http://localhost:3000
# Backend: http://localhost:3002/api
```

### Docker (Recommended)
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api
```

### Windows Quick Start
```bash
./start.bat
# Opens http://localhost:3000 automatically
```

**Database Persistence:**
- Dev: ./data/fitforge.db (local file)
- Docker: Named volume `data` → /data inside container
- Backup: Copy ./data/ directory

---

## 📦 Dependencies

### Frontend
- react: ^19.2.0
- react-dom: ^19.2.0
- axios: (HTTP client)
- typescript: ~5.8.2
- vite: ^6.2.0
- @vitejs/plugin-react: ^5.0.0

### Backend
- express: (Web framework)
- better-sqlite3: (Database driver)
- cors: (Cross-Origin middleware)
- body-parser: (Request parsing)
- typescript: ~5.8.2

### Optional Dependencies
- @rollup/rollup-win32-x64-msvc: ^4.52.5 (Windows build tool)

---

## ✅ Code Quality Standards

### Required
- ✅ TypeScript strict mode enabled
- ✅ No `any` type usage (removed in recent refactor)
- ✅ Parameterized SQL queries (no string concatenation)
- ✅ Error handling on all API calls
- ✅ Component prop validation

### Recommended
- ✅ Meaningful variable names
- ✅ Comments on complex logic
- ✅ Consistent indentation (2 spaces)
- ✅ Trailing commas in objects/arrays
- ✅ Function return types explicit

### Testing
- Currently: Manual testing via browser
- Future: Unit tests for database operations
- Future: Integration tests for API endpoints

---

## 🎓 Key Principles

1. **Type Safety First** - Strict TypeScript throughout
2. **Single User Design** - No multi-user complexity
3. **Offline-First** - Works completely without internet
4. **Data Persistence** - All data survives restart
5. **Local Only** - Never exposes to untrusted networks
6. **Clean Architecture** - Layered separation of concerns
7. **Performance** - SQLite with proper indexing and WAL mode

---

## 📈 Development Workflow

### Starting Development
1. `npm install` (frontend)
2. `cd backend && npm install` (backend)
3. Run: `./start.bat` (Windows) or Docker Compose
4. Open: http://localhost:3000

### Making Changes
1. Edit TypeScript files
2. Vite auto-rebuilds frontend
3. Node auto-restarts backend (with nodemon or manual restart)
4. Refresh browser to see changes

### Database Changes
1. Modify `backend/database/schema.sql`
2. Update `backend/database/database.ts` operations
3. Run backend restart to initialize new schema

### Adding New Features
1. Check ARCHITECTURE.md for system understanding
2. Define types in types.ts
3. Implement API endpoint in backend/server.ts
4. Add database operation in backend/database/database.ts
5. Create React component in components/
6. Wire up API call in App.tsx or component
7. Test in browser

---

## 🔗 Related Documentation

- **ARCHITECTURE.md** - Detailed system design and data flow
- **QUICK-START.md** - 30-second setup guide
- **FITFORGE-INIT.md** - Comprehensive setup instructions
- **README-LOCAL.md** - Security details and offline setup
- **HANDOFF-workout-templates.md** - Workout templates feature details

---

## 📝 Version History

| Version | Date | Key Changes |
|---------|------|------------|
| Current | 2025-10-24 | Type safety improvements, TypeScript backend conversion |
| - | - | Security fixes (CORS, .gitignore, localhost binding) |
| - | - | Frontend-to-backend API connection complete |
| - | - | Personal bests and exercise maxes tracking |
| - | - | Workout templates feature |

---

## 🤝 Contributing Guidelines

When working on FitForge:

1. **Before Changes:** Read ARCHITECTURE.md for system understanding
2. **TypeScript:** Keep strict mode enabled, no `any` types
3. **SQL:** Use parameterized queries only
4. **Components:** Keep components focused and single-purpose
5. **Testing:** Test manually in browser before committing
6. **Documentation:** Update relevant docs when making changes
7. **Commits:** Write clear commit messages explaining the "why"

---

## ❓ Questions or Issues?

Refer to the comprehensive documentation:
- System questions → ARCHITECTURE.md
- Setup issues → FITFORGE-INIT.md or QUICK-START.md
- Security concerns → README-LOCAL.md
- Feature details → Relevant handoff documents

---

*Last Updated: 2025-10-24 | Maintained by: Development Team*
