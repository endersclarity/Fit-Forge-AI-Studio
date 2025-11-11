# FitForge-Local Architecture Document

**Author:** Kaelen
**Date:** 2025-11-10
**Version:** 1.0 (Brownfield Integration Architecture)
**Project Status:** 80% Infrastructure Complete, Ready for Logic Integration

---

## Executive Summary

FitForge-Local is a brownfield Express + React application where **80% of infrastructure exists** and **validated calculation algorithms need integration**. This architecture documents the patterns for integrating 3 backend services and 4 API endpoints into the existing codebase, ensuring AI agents implement consistently with established patterns.

**Key Architectural Challenge:** Integrate validated logic-sandbox algorithms into existing infrastructure without breaking current functionality.

**No Starter Template Needed:** Project infrastructure already established with Vite, Express, SQLite, and Docker Compose.

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Backend Services Location | Create `backend/services/` folder | N/A | Epic 1, 2 | Standard Express pattern, separates business logic from data access |
| API Response Format | Direct responses (no wrapper) | N/A | Epic 2, 3 | Matches existing code, simpler, less overhead |
| Error Handling | Throw in services, catch in routes | N/A | Epic 1, 2 | Standard JavaScript pattern, route controls HTTP codes |
| File Naming | camelCase for files/functions | N/A | All | Matches existing codebase convention |
| Module Exports (Node.js) | CommonJS `module.exports` | N/A | Epic 1 | Existing pattern in database.js |
| Module Exports (TypeScript) | ES6 `export` | N/A | Epic 2, 3 | Existing pattern in server.ts |
| Database Access | All DB ops through `database.js` | N/A | Epic 1, 2 | Centralized data access layer exists |
| API URL Pattern | `/api/resource/:id/action` | N/A | Epic 2 | Matches existing endpoints |

## Project Structure

### Existing Structure (80% Complete)

```
FitForge-Local/
├── components/                  # ✅ React UI (80+ components)
│   ├── WorkoutBuilder.tsx      # Needs: Forecast API integration
│   ├── RecoveryDashboard.tsx   # Needs: Timeline API integration
│   ├── ExerciseRecommendations.tsx  # Needs: Scoring API integration
│   └── ...
├── contexts/                    # ✅ React Context providers
│   └── WorkoutContext.tsx
├── shared/                      # ✅ Shared TypeScript code
│   └── exercise-library.ts     # ✅ 48 validated exercises
├── backend/                     # ✅ Express API
│   ├── server.ts               # ✅ Main server (20+ endpoints)
│   ├── types.ts                # ✅ Type definitions
│   ├── constants.ts            # ✅ Constants
│   ├── database/               # ✅ SQLite operations
│   │   ├── schema.sql          # ✅ 7 tables defined
│   │   ├── database.js         # ✅ CRUD operations
│   │   └── analytics.ts        # ✅ Metrics calculation
│   └── services/               # ❌ NEEDS TO BE CREATED
│       ├── fatigueCalculator.js      # ❌ To be ported from logic-sandbox
│       ├── recoveryCalculator.js     # ❌ To be ported from logic-sandbox
│       └── exerciseRecommender.js    # ❌ To be implemented
├── docs/                        # ✅ Documentation
│   └── logic-sandbox/          # ✅ Validated algorithms (PRIMARY SOURCE)
│       ├── exercises.json      # ✅ 48 exercises (corrected to 100%)
│       ├── baselines.json      # ✅ Muscle baseline data
│       └── scripts/            # ✅ Calculation scripts (SOURCE LOGIC)
│           ├── calculate-workout-fatigue.mjs  # Port to fatigueCalculator.js
│           └── calculate-recovery.mjs         # Port to recoveryCalculator.js
├── docker-compose.yml           # ✅ Local dev with HMR
└── package.json                 # ✅ Dependencies
```

### What Gets Added (20% Remaining)

**Backend Services:**
- `backend/services/fatigueCalculator.js` - Algorithm validated in logic-sandbox
- `backend/services/recoveryCalculator.js` - Algorithm validated in logic-sandbox
- `backend/services/exerciseRecommender.js` - 5-factor scoring algorithm

**API Endpoints in `backend/server.ts`:**
- `POST /api/workouts/:id/complete` - Calculate fatigue after workout
- `POST /api/recommendations/exercises` - Get ranked exercise list
- `GET /api/recovery/timeline` - Get recovery projections
- `POST /api/forecast/workout` - Predict fatigue for planned exercises

**Frontend Integration:**
- Connect WorkoutBuilder to forecast API
- Connect RecoveryDashboard to timeline API
- Connect ExerciseRecommendations to scoring API
- Wire baseline update trigger

## Epic to Architecture Mapping

| Epic | Architecture Components | Implementation Location |
| ---- | ---------------------- | ---------------------- |
| **Epic 1: Calculation Services (Backend)** | Fatigue calculator, Recovery calculator, Exercise recommender | `backend/services/` folder (new) |
| **Epic 2: API Endpoints (Backend)** | 4 new REST endpoints | `backend/server.ts` (existing file) |
| **Epic 3: Frontend Integration (React)** | WorkoutBuilder, RecoveryDashboard, ExerciseRecommendations | `components/` (existing files) |
| **Epic 4: Testing & Deployment** | Docker testing, Railway deployment | `docker-compose.yml`, Railway config |

---

## Technology Stack Details

### Core Technologies (Existing)

**Frontend:**
- **React**: 19.2.0
- **TypeScript**: 5.8.2
- **Vite**: 6.2.0 (build tool with HMR)
- **React Router DOM**: 6.30.1
- **Recharts**: 3.3.0 (muscle visualizations)

**Backend:**
- **Node.js**: Runtime
- **Express**: 4.18.2
- **TypeScript**: 5.3.3
- **better-sqlite3**: 9.2.2 (synchronous SQLite)

**Development:**
- **Docker Compose**: Local dev with HMR
- **nodemon**: 3.0.2 (backend auto-restart)
- **Vite Dev Server**: Frontend hot reload

**Deployment:**
- **Railway**: Auto-deploy from GitHub
- **Production URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

### Integration Points

**Frontend ↔ Backend:**
- Base URL: `http://localhost:3001` (dev) or `BACKEND_URL` env var (prod)
- Communication: HTTP REST API
- Data Format: JSON
- Error Handling: HTTP status codes + `{ error: "message" }` response

**Backend ↔ Database:**
- Database: SQLite via better-sqlite3
- Location: `data/fitforge.db` (persisted volume)
- Access Pattern: All DB operations through `database.js`
- Transactions: Used for multi-step operations

**Backend ↔ Logic Sandbox:**
- Source: `docs/logic-sandbox/scripts/` (validated algorithms)
- Destination: `backend/services/` (production services)
- Port: Copy logic, adapt to Express patterns, maintain formulas exactly

---

## Implementation Patterns

**These patterns ensure consistent implementation across all AI agents:**

### Pattern 1: Backend Service Structure

**All calculation services MUST follow this structure:**

```javascript
// backend/services/fatigueCalculator.js

/**
 * Calculate muscle fatigue from workout data
 * @param {Object} workout - Workout with exercises and sets
 * @param {Array} exercises - Exercise library with muscle engagement
 * @param {Object} baselines - Muscle baseline capacities
 * @returns {Object} Fatigue data by muscle
 */
function calculateMuscleFatigue(workout, exercises, baselines) {
  if (!workout) throw new Error("Workout is required");
  if (!exercises) throw new Error("Exercise library is required");
  if (!baselines) throw new Error("Baselines are required");

  // ... calculation logic (port from logic-sandbox)

  return {
    muscleStates: [...],
    warnings: [...],
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  calculateMuscleFatigue
};
```

**Key Requirements:**
- Export functions with `module.exports`
- Validate all inputs, throw errors for invalid data
- Return plain objects (not classes)
- Include JSDoc comments
- Keep formulas EXACTLY as validated in logic-sandbox

**Exercise Data Source (CRITICAL):**
- **Import from:** `docs/logic-sandbox/exercises.json` (CORRECTED percentages add to 100%)
- Load JSON file using `fs.readFileSync()` or `require()`
- Convert format as needed (JSON has `"primary": true/false`, services may need different structure)
- **DO NOT use:** `backend/constants.ts` or `shared/exercise-library.ts` (incorrect percentages >100%)

---

### Pattern 2: API Endpoint Structure

**All new endpoints MUST follow this structure:**

```typescript
// backend/server.ts

app.post('/api/workouts/:id/complete', async (req: Request, res: Response) => {
  try {
    const workoutId = parseInt(req.params.id);
    const workout = db.getWorkoutById(workoutId);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Call service
    const result = fatigueCalculator.calculateMuscleFatigue(
      workout,
      EXERCISE_LIBRARY,
      db.getMuscleBaselines()
    );

    // Update database
    db.updateMuscleStates(result.muscleStates);

    // Return direct response
    res.json(result);

  } catch (error: any) {
    console.error('Error completing workout:', error);
    res.status(400).json({ error: error.message });
  }
});
```

**Key Requirements:**
- Try-catch around ALL service calls
- Validate params before calling services
- Return 404 for missing resources
- Return 400 for validation errors
- Return 500 for server errors
- Direct response (no wrapper object)
- Log errors to console

---

### Pattern 3: Frontend API Integration

**All frontend API calls MUST follow this structure:**

```typescript
// components/WorkoutBuilder.tsx

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchForecast = async (plannedExercises: Exercise[]) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${API_BASE_URL}/api/forecast/workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plannedExercises })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch forecast');
    }

    const data = await response.json();
    // Update state with data

  } catch (err: any) {
    setError(err.message);
    console.error('Forecast error:', err);
  } finally {
    setLoading(false);
  }
};
```

**Key Requirements:**
- Use loading/error state
- Check `response.ok` before parsing JSON
- Parse error from `{ error: "message" }` response
- Show user-friendly error messages
- Always set loading to false in finally block

---

## Consistency Rules

### Naming Conventions

**Files & Functions:**
- camelCase for all files: `fatigueCalculator.js`, `exerciseRecommender.js`
- camelCase for all functions: `calculateMuscleFatigue()`, `getRecoveryTimeline()`
- camelCase for variables: `muscleStates`, `workoutId`, `exerciseLibrary`

**Types & Interfaces:**
- PascalCase for types: `WorkoutResponse`, `MuscleStateData`, `ExerciseRecommendation`
- Suffix with "Response" for API responses: `ProfileResponse`, `AnalyticsResponse`
- Suffix with "Request" for API requests: `WorkoutSaveRequest`, `QuickAddRequest`

**API Endpoints:**
- Lowercase with hyphens: `/api/muscle-states`, `/api/personal-bests`
- Resource-based: `/api/workouts/:id/complete` (not `/api/complete-workout`)
- Actions as suffixes: `/complete`, `/calculate`, `/forecast`

**Database:**
- snake_case for tables: `muscle_states`, `personal_bests`, `workout_templates`
- snake_case for columns: `user_id`, `muscle_name`, `fatigue_percentage`
- Plural table names: `workouts`, `exercises`, `baselines`

---

### Code Organization

**Backend Services (`backend/services/`):**
- One service per file
- Export multiple functions if related
- Keep services pure (no direct DB access)
- Services call `database.js` if needed

**API Routes (`backend/server.ts`):**
- Group related endpoints together
- Add comments for section headers
- Keep route handlers thin (business logic in services)

**Frontend Components (`components/`):**
- One component per file
- Co-locate styles if using CSS modules
- Keep components focused (single responsibility)

**Shared Code (`shared/`):**
- Types used by both frontend and backend
- Exercise library (single source of truth)
- Constants and enums

---

### Error Handling

**Backend Services:**
```javascript
// Throw descriptive errors
throw new Error("Baseline not found for muscle: Hamstrings");
throw new Error("Invalid workout ID: must be a positive integer");
```

**API Routes:**
```typescript
// Catch and return appropriate status
try {
  const result = service.method();
  res.json(result);
} catch (error: any) {
  console.error('Error:', error);
  res.status(400).json({ error: error.message });
}
```

**Frontend:**
```typescript
// Show user-friendly messages
try {
  const data = await fetchData();
} catch (err: any) {
  setError("Failed to load workout data. Please try again.");
}
```

**HTTP Status Codes:**
- 200: Success
- 400: Bad request (validation error)
- 404: Not found
- 500: Server error (unexpected)

---

### Logging Strategy

**What to Log:**
- All API requests: `${method} ${path}`
- All errors: `console.error('Context:', error)`
- Database operations: Connection status, schema init
- Service calculations: Input validation failures

**What NOT to Log:**
- Sensitive user data
- Full database dumps
- Successful operations (too verbose)

**Format:**
```javascript
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
console.error('Error calculating fatigue:', error.message);
```

## Data Architecture

### Database Schema (Existing - 7 Tables)

**Primary Tables:**
1. `users` - User profile (name, experience)
2. `workouts` - Workout sessions
3. `workout_exercises` - Exercises in workouts
4. `exercise_sets` - Individual sets (weight, reps, RPE)
5. `muscle_states` - Time-series fatigue tracking
6. `muscle_baselines` - Learned capacity per muscle
7. `workout_templates` - Saved templates

**Key Relationships:**
- workouts → workout_exercises (1:many)
- workout_exercises → exercise_sets (1:many)
- workouts → muscle_states (1:many, tracks source)

**Data Flow:**
1. User logs workout → `workouts` table
2. Exercises added → `workout_exercises` table
3. Sets logged → `exercise_sets` table
4. Workout completed → Calculate fatigue → `muscle_states` table updated
5. Baseline exceeded → Prompt user → `muscle_baselines` table updated

---

## API Contracts

### New Endpoints (To Be Implemented)

#### 1. POST `/api/workouts/:id/complete`

**Purpose:** Calculate muscle fatigue after workout completion

**Request:**
```json
{
  "workoutId": 123
}
```

**Response (200):**
```json
{
  "muscleStates": [
    { "muscle": "Hamstrings", "fatigue": 85.2, "volume": 3258 },
    { "muscle": "Glutes", "fatigue": 72.1, "volume": 2890 }
  ],
  "warnings": [
    { "muscle": "Lower Back", "message": "Approaching baseline (94%)" }
  ],
  "baselineSuggestions": [
    { "muscle": "Hamstrings", "currentBaseline": 2880, "newVolume": 3258, "exceedPercent": 13.1 }
  ],
  "timestamp": "2025-11-10T10:30:00Z"
}
```

#### 2. POST `/api/recommendations/exercises`

**Purpose:** Get ranked exercise recommendations

**Request:**
```json
{
  "targetMuscle": "Quadriceps",
  "currentFatigue": { "Quadriceps": 14, "Lower Back": 94 },
  "availableEquipment": ["Dumbbells", "Kettlebell"]
}
```

**Response (200):**
```json
{
  "recommendations": [
    {
      "exercise": "Bulgarian Split Squats",
      "score": 92,
      "quadEngagement": 65,
      "predictedFatigue": 45,
      "safe": true
    },
    {
      "exercise": "Leg Extensions",
      "score": 88,
      "quadEngagement": 85,
      "predictedFatigue": 62,
      "safe": true
    }
  ]
}
```

#### 3. GET `/api/recovery/timeline`

**Purpose:** Get recovery projections at 24h, 48h, 72h

**Response (200):**
```json
{
  "current": { "Hamstrings": 85.2, "Quadriceps": 14 },
  "24h": { "Hamstrings": 70.2, "Quadriceps": 0 },
  "48h": { "Hamstrings": 55.2, "Quadriceps": 0 },
  "72h": { "Hamstrings": 40.2, "Quadriceps": 0 },
  "readyMuscles": ["Quadriceps", "Biceps", "Triceps"]
}
```

#### 4. POST `/api/forecast/workout`

**Purpose:** Predict muscle fatigue for planned exercises

**Request:**
```json
{
  "plannedExercises": [
    {
      "name": "Goblet Squat",
      "sets": [
        { "weight": 40, "reps": 20 },
        { "weight": 40, "reps": 20 },
        { "weight": 40, "reps": 20 }
      ]
    }
  ]
}
```

**Response (200):**
```json
{
  "predictedFatigue": [
    { "muscle": "Quadriceps", "fatigue": 45 },
    { "muscle": "Glutes", "fatigue": 38 }
  ],
  "warnings": [
    { "muscle": "Lower Back", "message": "Would exceed baseline (112%)" }
  ],
  "safe": true
}
```

---

## Security Architecture

**Current Status (MVP):**
- No authentication (single-user local app)
- CORS enabled for development origins
- SQL injection protected (prepared statements)
- Input validation in services (throw on invalid)

**Post-MVP Considerations:**
- Add user authentication (bcrypt + JWT)
- Input validation middleware (express-validator)
- Rate limiting for API endpoints
- HTTPS enforcement in production

---

## Performance Considerations

**Existing Optimizations:**
- SQLite indexes on frequently queried columns
- Synchronous database operations (better-sqlite3)
- Vite code splitting (automatic)
- React.memo for expensive components

**New Service Performance:**
- Fatigue calculation: O(n) where n = number of exercises
- Recovery calculation: O(m) where m = number of muscles
- Recommendation scoring: O(e) where e = exercise library size

**Target:** <500ms API response times (existing baseline)

---

## Deployment Architecture

**Local Development:**
- Docker Compose with HMR
- Frontend: http://localhost:3000 (Vite dev server)
- Backend: http://localhost:3001 (nodemon auto-restart)
- Database: `data/fitforge.db` (volume mounted)

**Production (Railway):**
- Auto-deploy from GitHub main branch
- Multi-stage Docker build (`Dockerfile`)
- Frontend built with `vite build` → static files
- Backend compiled with `tsc` → dist/
- Single container serves both
- Database: SQLite with persistent volume
- URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Port Rules (MANDATORY):**
- Frontend: Always port 3000
- Backend: Always port 3001
- Never allow alternate ports

---

## Development Environment

### Prerequisites

- Docker Desktop installed
- Git for version control
- Node.js 18+ (optional, for local testing without Docker)

### Setup Commands

```bash
# Clone repository
git clone <repo-url>
cd FitForge-Local

# Start development environment
docker-compose up -d

# Access application
open http://localhost:3000

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild (only when package.json changes)
docker-compose down
docker-compose up -d --build
```

### Hot Module Reload (HMR)

**NO container rebuilds needed for code changes!**
- Frontend: Instant browser refresh on `.tsx`, `.ts`, `.css` changes
- Backend: Automatic server restart on file changes
- Only rebuild when dependencies change in `package.json`

---

## Architecture Decision Records (ADRs)

### ADR-001: Create backend/services/ Folder

**Status:** Accepted
**Date:** 2025-11-10
**Context:** Need location for 3 new calculation services in brownfield project
**Decision:** Create `backend/services/` folder for business logic
**Rationale:** Standard Express pattern, separates business logic from data access
**Consequences:** Clear separation of concerns, future services go here

### ADR-002: Direct API Response Format

**Status:** Accepted
**Date:** 2025-11-10
**Context:** Need consistent response format for 4 new endpoints
**Decision:** Use direct responses, no wrapper objects
**Rationale:** Matches existing code, simpler, less overhead
**Consequences:** Consistent with existing 20+ endpoints

### ADR-003: Throw/Catch Error Handling

**Status:** Accepted
**Date:** 2025-11-10
**Context:** Need error handling pattern for services and routes
**Decision:** Services throw errors, routes catch and return HTTP status codes
**Rationale:** Standard JavaScript pattern, route handlers control responses
**Consequences:** Try-catch required in all route handlers

### ADR-004: Port Logic from logic-sandbox

**Status:** Accepted
**Date:** 2025-11-10
**Context:** Validated algorithms exist in `docs/logic-sandbox/scripts/`
**Decision:** Port logic exactly as validated, adapt only Express patterns
**Rationale:** Algorithms are validated with test data, formulas must not change
**Consequences:** Services must maintain exact calculation formulas

### ADR-005: Use Logic-Sandbox as Authoritative Exercise Data

**Status:** Accepted
**Date:** 2025-11-10
**Context:** Exercise data exists in 2 locations with conflicting muscle percentages
- `backend/constants.ts` & `shared/exercise-library.ts`: Muscle % adds to >100% (INCORRECT)
- `docs/logic-sandbox/exercises.json`: Muscle % adds to exactly 100% (CORRECTED)

**Decision:** Backend calculation services MUST import from `logic-sandbox/exercises.json`
**Rationale:** Validated data is critical for accurate fatigue calculations. Incorrect percentages cause wildly inaccurate results.
**Consequences:**
- New services load JSON file and convert format as needed
- Existing frontend uses `backend/constants.ts` (unchanged for MVP, prevents breaking UI)
- Post-MVP: Create epic to migrate entire app to single source of truth

---

## Critical Reminders for AI Agents

**⚠️ PRIMARY SOURCE OF TRUTH:**
1. `docs/logic-sandbox/NEXT-STEPS.md` - Implementation roadmap
2. `docs/logic-sandbox/README.md` - Validated algorithms
3. `docs/PRD.md` - Feature requirements
4. This architecture document - Implementation patterns

**⚠️ MANDATORY RULES:**
- Create `backend/services/` folder before implementing services
- All calculation formulas MUST match logic-sandbox scripts exactly
- Services MUST load exercise data from `logic-sandbox/exercises.json` (corrected percentages)
- All API responses MUST be direct (no wrapper objects)
- All errors MUST be caught and returned as `{ error: "message" }`
- All services MUST validate inputs and throw descriptive errors
- All frontend API calls MUST handle loading/error states

**⚠️ DO NOT:**
- Change validated calculation formulas
- Use exercise data from `backend/constants.ts` or `shared/exercise-library.ts` in services
- Build features marked "OUT OF SCOPE" in PRD
- Use alternate ports (must be 3000 frontend, 3001 backend)
- Create wrapper response objects
- Skip error handling in route handlers

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_
_Date: 2025-11-10_
_For: Kaelen_
_Purpose: Guide AI agents through brownfield integration with consistency_
