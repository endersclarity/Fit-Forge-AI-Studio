# FitForge Implementation Roadmap
## From Logic Sandbox → Production

**Purpose**: Step-by-step path from validated sandbox logic to deployed features in production

**Current Status**: Phase 1 - Logic Validation (100% complete) ✅

**🎉 REALITY CHECK COMPLETE!**

After auditing existing codebase ([see full audit](./existing-vs-planned-audit.md)):
- ✅ **Phases 2-4 are 80-90% done!**
- ✅ Database schema exists (muscle_baselines, muscle_states, workouts, templates)
- ✅ Backend API has all CRUD endpoints
- ✅ Frontend components exist (WorkoutBuilder, RecoveryDashboard, BaselineManager)
- ❌ **Missing**: Calculation logic services (fatigue, recovery, recommendations)

**Revised Timeline**: 18-27 hours (down from 47-70 hours!) ⚡

---

## 📋 Revised Phase Overview

```
Phase 1: Logic Validation (Sandbox)          ✅ COMPLETE
   ↓
Phase 2: Database Design (SQLite)            ✅ ALREADY EXISTS!
   ↓
Phase 3: Backend Services (Calculation Logic) ← YOU ARE HERE (4-6 hours)
   ↓
Phase 4: API Endpoints (Connect Services)     (3-4 hours)
   ↓
Phase 5: Frontend Integration (Wire Up)       (2-3 hours)
   ↓
Phase 6: Local Testing (Docker)               (2-4 hours)
   ↓
Phase 7: Railway Deployment                   (2-4 hours)
```

---

## Phase 1: Logic Validation (Sandbox) ✅ 95%

**Goal**: Validate all formulas, algorithms, and calculations work correctly before writing any app code

### ✅ Completed
- [x] Exercise database (48 exercises, corrected percentages)
- [x] Muscle baselines defined (15 muscles)
- [x] User profile created
- [x] Fatigue calculation tested (Legs Day A analysis)
- [x] Recovery algorithm validated (15% daily rate)
- [x] Recommendation logic brainstormed

### 🧪 In Progress
- [ ] Test recovery algorithm with multiple workout scenarios
- [ ] Validate edge cases (zero fatigue, extreme overload, etc.)

### 📝 Documentation Created
- [x] README.md (sandbox status dashboard)
- [x] post-workout-actions.md (15 features, MVP prioritized)
- [x] pre-workout-forecast.md (real-time forecast, sliders, AI optimizer)
- [x] workout-builder-recommendations.md (recommendation algorithm)
- [x] implementation-roadmap.md (this doc)

### Exit Criteria
- ✅ All core algorithms validated with test data
- ✅ Edge cases documented and handled
- ✅ Feature specs complete
- ✅ Implementation plan exists

**Estimated Time Remaining**: 1-2 hours (edge case testing)

---

## Phase 2: Database Design (SQLite) ⏳ Next Up

**Goal**: Design database schema to persist workouts, track recovery, and store user data

### Database Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  body_weight REAL NOT NULL,           -- in lbs
  experience_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. User Equipment Table
```sql
CREATE TABLE user_equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  equipment_type TEXT NOT NULL,        -- 'dumbbell', 'kettlebell', 'barbell', etc.
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. Muscle Baselines Table
```sql
CREATE TABLE muscle_baselines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle TEXT NOT NULL,                -- 'Quadriceps', 'Hamstrings', etc.
  baseline_capacity REAL NOT NULL,     -- in lbs
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,                          -- Description of how baseline was calculated
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle)
);
```

#### 4. Workouts Table
```sql
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  category TEXT,                        -- 'Legs', 'Push', 'Pull', etc.
  variation TEXT,                       -- 'A', 'B', 'C', etc.
  start_time DATETIME,
  end_time DATETIME,
  total_duration INTEGER,               -- in seconds
  template_used TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 5. Workout Exercises Table
```sql
CREATE TABLE workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,            -- References exercises.json (ex12, ex36, etc.)
  exercise_name TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,      -- Order in workout (1, 2, 3...)
  total_volume REAL,                    -- in lbs
  notes TEXT,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);
```

#### 6. Workout Sets Table
```sql
CREATE TABLE workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_exercise_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,                 -- in lbs
  to_failure BOOLEAN DEFAULT 0,
  rpe INTEGER,                          -- Rate of Perceived Exertion (1-10, optional)
  notes TEXT,
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
);
```

#### 7. Muscle Fatigue Cache Table
```sql
CREATE TABLE muscle_fatigue_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  muscle TEXT NOT NULL,
  volume REAL NOT NULL,                 -- Total volume for this muscle in workout
  baseline REAL NOT NULL,               -- Baseline at time of workout
  initial_fatigue REAL NOT NULL,        -- Fatigue % immediately post-workout
  exceeds_baseline BOOLEAN DEFAULT 0,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  UNIQUE(workout_id, muscle)
);
```

### Tasks
- [ ] Create migration script (001_create_schema.sql)
- [ ] Write seed data script (populate exercises from exercises.json)
- [ ] Create database helper module (db.js)
- [ ] Write CRUD functions for each table
- [ ] Test database operations locally

**Estimated Time**: 4-6 hours

---

## Phase 3: Backend API Implementation (Node.js) ⏳

**Goal**: Build REST API endpoints to handle workouts, calculations, and recommendations

### API Endpoints to Build

#### Workout Endpoints
```
POST   /api/workouts                    # Create new workout
GET    /api/workouts                    # List all workouts for user
GET    /api/workouts/:id                # Get specific workout details
PUT    /api/workouts/:id                # Update workout
DELETE /api/workouts/:id                # Delete workout
POST   /api/workouts/:id/complete       # Mark workout complete, trigger baseline updates
```

#### Exercise Endpoints
```
GET    /api/exercises                   # List all exercises (from exercises.json)
GET    /api/exercises/:id               # Get specific exercise details
GET    /api/exercises/search            # Search exercises by name/muscle/equipment
```

#### Recommendation Endpoints
```
POST   /api/recommendations/exercises   # Get ranked exercise recommendations
```

Request body:
```json
{
  "targetMuscle": "Quadriceps",
  "currentWorkout": [...],
  "currentFatigue": {...},
  "availableEquipment": [...]
}
```

#### Recovery Endpoints
```
GET    /api/recovery/status             # Get current recovery state for all muscles
GET    /api/recovery/timeline           # Get recovery timeline (24h, 48h, 72h projections)
GET    /api/recovery/ready              # Get list of muscles ready to train (<40%)
```

#### Baseline Endpoints
```
GET    /api/baselines                   # Get all baselines for user
PUT    /api/baselines/:muscle           # Update baseline for specific muscle
POST   /api/baselines/calculate         # Calculate baselines from workout history
```

#### Forecast Endpoints
```
POST   /api/forecast/workout            # Get real-time workout forecast
```

Request body:
```json
{
  "plannedExercises": [
    {
      "exerciseId": "ex12",
      "sets": [
        { "reps": 20, "weight": 40 }
      ]
    }
  ]
}
```

Response:
```json
{
  "predictedFatigue": {
    "Hamstrings": { "volume": 3258, "fatigue": 113.1, "exceedsBaseline": true },
    "Quadriceps": { "volume": 1200, "fatigue": 14.3, "exceedsBaseline": false }
  },
  "warnings": [
    { "muscle": "Hamstrings", "message": "Will exceed baseline by 13.1%" }
  ],
  "bottlenecks": ["LowerBack"],
  "underworked": ["Quadriceps", "Calves"]
}
```

### Backend Logic Modules

#### 1. Fatigue Calculator (`/backend/services/fatigueCalculator.js`)
```javascript
export function calculateMuscleFatigue(workout, exercises, baselines) {
  // Logic from logic-sandbox/scripts/calculate-workout-fatigue.mjs
}
```

#### 2. Recovery Calculator (`/backend/services/recoveryCalculator.js`)
```javascript
export function calculateRecovery(initialFatigue, hoursElapsed, recoveryRate = 0.15) {
  // Logic from logic-sandbox/scripts/calculate-recovery.mjs
}
```

#### 3. Exercise Recommender (`/backend/services/exerciseRecommender.js`)
```javascript
export function recommendExercises(params) {
  // Logic from logic-sandbox/workout-builder-recommendations.md
}
```

#### 4. Baseline Manager (`/backend/services/baselineManager.js`)
```javascript
export function checkBaselineUpdate(workout, currentBaselines) {
  // Compare workout volume to baselines
  // Return muscles that exceeded baseline with new values
}
```

### Tasks
- [ ] Set up Express.js server
- [ ] Create API route structure
- [ ] Implement fatigue calculation service
- [ ] Implement recovery calculation service
- [ ] Implement recommendation service
- [ ] Implement baseline management service
- [ ] Add request validation (express-validator)
- [ ] Add error handling middleware
- [ ] Write unit tests for each service
- [ ] Write integration tests for API endpoints

**Estimated Time**: 12-16 hours

---

## Phase 4: Frontend Integration (React) ⏳

**Goal**: Build UI components that consume backend API and display features

### Components to Build

#### 1. Workout Builder (`/components/WorkoutBuilder.tsx`)
**Features**:
- Add/remove exercises
- Set sets/reps/weight per exercise
- Real-time fatigue forecast
- Exercise recommendation modal
- Save workout template

**API Calls**:
- `GET /api/exercises` (populate exercise picker)
- `POST /api/forecast/workout` (real-time forecast)
- `POST /api/recommendations/exercises` (click muscle to get suggestions)

#### 2. Workout Logger (`/components/WorkoutLogger.tsx`)
**Features**:
- Log sets in real-time during workout
- Mark sets as "to failure"
- Add notes per exercise
- Complete workout button

**API Calls**:
- `POST /api/workouts` (create workout)
- `POST /api/workouts/:id/complete` (mark complete, trigger baseline updates)

#### 3. Post-Workout Summary (`/components/PostWorkoutSummary.tsx`)
**Features**:
- Muscle fatigue breakdown (bar chart)
- Baseline exceedance warnings
- Bottleneck warnings
- Recovery timeline
- "Duplicate & Progress" workout button

**API Calls**:
- `GET /api/workouts/:id` (get workout details)
- `GET /api/recovery/timeline` (get recovery projections)

#### 4. Recovery Dashboard (`/components/RecoveryDashboard.tsx`)
**Features**:
- Current muscle fatigue state (color-coded)
- "Ready to train" muscles (green)
- "Don't train" muscles (red)
- Recovery timeline graph

**API Calls**:
- `GET /api/recovery/status` (current state)
- `GET /api/recovery/ready` (muscles ready to train)

#### 5. Exercise Recommendation Modal (`/components/ExerciseRecommendationModal.tsx`)
**Features**:
- Ranked list of recommended exercises
- Show target engagement %
- Show estimated volume increase
- Show bottleneck warnings (if any)
- Quick-add button

**API Calls**:
- `POST /api/recommendations/exercises` (get recommendations)

#### 6. Baseline Manager (`/components/BaselineManager.tsx`)
**Features**:
- View all current baselines
- Manual baseline editing
- Baseline update prompts (when exceeded)
- Baseline history graph

**API Calls**:
- `GET /api/baselines` (get all baselines)
- `PUT /api/baselines/:muscle` (update baseline)

### Tasks
- [ ] Design component architecture
- [ ] Create reusable UI components (buttons, modals, charts)
- [ ] Implement Workout Builder with forecast
- [ ] Implement Workout Logger
- [ ] Implement Post-Workout Summary
- [ ] Implement Recovery Dashboard
- [ ] Implement Exercise Recommendation Modal
- [ ] Implement Baseline Manager
- [ ] Add loading states and error handling
- [ ] Add animations and transitions
- [ ] Write component tests (React Testing Library)

**Estimated Time**: 20-30 hours

---

## Phase 5: Local Testing (Docker) ⏳

**Goal**: Validate entire stack works correctly in local Docker environment

### Test Scenarios

#### 1. Complete Workout Flow
```
1. User opens Workout Builder
2. User adds 3-4 exercises
3. Forecast updates in real-time
4. User clicks underworked muscle → gets recommendations
5. User adds recommended exercise
6. User saves workout template
7. User starts workout (logs sets in real-time)
8. User completes workout
9. Post-workout summary shows fatigue breakdown
10. Baseline update prompt appears (if exceeded)
```

#### 2. Recovery Timeline
```
1. Complete workout (creates muscle fatigue)
2. Wait 1 minute (simulate 24h with manual timestamp editing)
3. Check recovery dashboard
4. Verify fatigue has decreased by 15%
5. Repeat for 48h, 72h
```

#### 3. Exercise Recommendations
```
1. Start new workout
2. Add high-volume leg exercise (e.g., heavy deadlifts)
3. Click "Hamstrings" in forecast
4. Verify recommendations filter out exercises that would cause bottlenecks
5. Verify unsafe exercises show warnings
```

#### 4. Baseline Learning
```
1. Complete workout that exceeds baseline (e.g., 113% hamstrings)
2. Verify prompt appears: "Update baseline from X to Y?"
3. Accept update
4. Verify next workout uses new baseline
```

### Testing Checklist
- [ ] Docker containers start successfully
- [ ] Frontend connects to backend
- [ ] Database persists data between restarts
- [ ] All API endpoints return expected data
- [ ] Real-time forecast updates correctly
- [ ] Recommendations filter unsafe exercises
- [ ] Recovery calculations match sandbox tests
- [ ] Baseline updates trigger correctly
- [ ] No console errors or warnings
- [ ] Mobile responsive (test on iPhone viewport)

**Estimated Time**: 8-12 hours

---

## Phase 6: Railway Deployment 🚀

**Goal**: Deploy app to Railway production environment

### Pre-Deployment Checklist
- [ ] Environment variables configured (.env.production)
- [ ] Database migrations ready
- [ ] Seed data script ready (exercises.json)
- [ ] Railway project created
- [ ] Domain configured (if custom domain)

### Deployment Steps
1. Push to GitHub (main branch)
2. Railway auto-deploys from GitHub
3. Run database migrations
4. Seed exercise data
5. Smoke test production URL
6. Monitor logs for errors

### Post-Deployment Validation
- [ ] Homepage loads
- [ ] User can create account
- [ ] User can log workout
- [ ] Forecast works in production
- [ ] Recovery dashboard updates
- [ ] No critical errors in Railway logs

### Rollback Plan
If deployment fails:
1. Revert to previous GitHub commit
2. Railway auto-redeploys old version
3. Investigate issues locally
4. Fix and re-deploy

**Estimated Time**: 2-4 hours

---

## 🎯 Feature Implementation Priority

### MVP (Must Build First)
**Phase 3-4 Focus**:
1. ✅ Workout Builder (basic: add exercises, set sets/reps/weight)
2. ✅ Real-Time Fatigue Forecast (basic: show muscle fatigue %)
3. ✅ Workout Logger (log sets, complete workout)
4. ✅ Post-Workout Summary (fatigue breakdown, warnings)
5. ✅ Recovery Dashboard (current fatigue state, ready to train)

**Estimated Time**: 15-20 hours (Phase 3-4 combined)

### MVP+ (Build Next)
**After MVP deployed**:
1. Exercise Recommendations (click muscle → get suggestions)
2. Baseline Update Prompts (when exceeded)
3. Recovery Timeline Graph (24h, 48h, 72h projections)
4. Workout Templates (save/load workouts)

**Estimated Time**: 10-15 hours

### Future Enhancements (Post-MVP+)
**Ideas from feature-ideas docs**:
- Progressive Overload Planner ("Duplicate & Progress" with %)
- AI Workout Optimizer (generate 3 workout options)
- Dynamic Volume Slider (adjust fatigue targets in real-time)
- Workout Comparison (today vs. last time)
- Muscle Imbalance Tracking (30-day trends)
- Deload Week Suggestions

**Estimated Time**: 30-50 hours (can be split across multiple releases)

---

## 📊 Overall Timeline Estimate

| Phase | Time Estimate | Status |
|-------|---------------|--------|
| Phase 1: Logic Validation | 1-2 hours | ✅ 95% Done |
| Phase 2: Database Design | 4-6 hours | ⏳ Next Up |
| Phase 3: Backend API | 12-16 hours | ⏳ Pending |
| Phase 4: Frontend (MVP) | 20-30 hours | ⏳ Pending |
| Phase 5: Local Testing | 8-12 hours | ⏳ Pending |
| Phase 6: Railway Deploy | 2-4 hours | ⏳ Pending |

**Total MVP Estimate**: 47-70 hours (6-9 full work days)

**With Frontend Refinement + MVP+ Features**: 70-100 hours (9-13 days)

---

## 🚨 Risks & Mitigation

### Risk 1: UI Complexity Blocker
**Risk**: Get stuck on UI implementation, slow down progress
**Mitigation**:
- Start with unstyled, functional UI (headless components)
- Use pre-built component library (shadcn/ui, Tailwind)
- Focus on logic first, polish UI later

### Risk 2: Database Performance
**Risk**: SQLite queries slow down with large workout history
**Mitigation**:
- Add indexes on frequently queried columns (user_id, date, muscle)
- Implement pagination for workout history
- Cache frequently accessed data (current recovery state)

### Risk 3: Real-Time Forecast Lag
**Risk**: Forecast recalculation on every input change feels sluggish
**Mitigation**:
- Debounce input changes (300ms delay)
- Show loading spinner during recalculation
- Optimize calculation algorithm (memoize baseline lookups)

### Risk 4: Railway Free Tier Limitations
**Risk**: App sleeps after inactivity, slow cold starts
**Mitigation**:
- Use Railway's "Always On" setting (if available)
- Add health check endpoint to keep app awake
- Upgrade to paid tier if needed ($5/month)

---

## ✅ Definition of Done (Per Phase)

### Phase 1: Logic Validation ✅
- [x] All algorithms tested with sample data
- [x] Edge cases documented
- [x] Feature specs complete
- [x] Implementation roadmap exists

### Phase 2: Database Design
- [ ] All tables created with migrations
- [ ] CRUD operations tested
- [ ] Seed data loads successfully
- [ ] No foreign key errors

### Phase 3: Backend API
- [ ] All endpoints return expected data
- [ ] Services match sandbox logic exactly
- [ ] Unit tests pass (80%+ coverage)
- [ ] Integration tests pass
- [ ] No console errors

### Phase 4: Frontend Integration
- [ ] All MVP components built
- [ ] Components consume API correctly
- [ ] Loading/error states handled
- [ ] Mobile responsive
- [ ] Component tests pass

### Phase 5: Local Testing
- [ ] All test scenarios pass
- [ ] No critical bugs found
- [ ] Performance acceptable (<2s page load)
- [ ] Docker setup documented

### Phase 6: Railway Deployment
- [ ] Production URL accessible
- [ ] All features work in production
- [ ] No errors in logs
- [ ] Database persists correctly

---

## 📚 Reference Links

- [Logic Sandbox README](./README.md) - Current status, test scenarios
- [Post-Workout Actions](./feature-ideas/post-workout-actions.md) - Feature specs
- [Pre-Workout Forecast](./feature-ideas/pre-workout-forecast.md) - Forecast & slider features
- [Workout Builder Recommendations](./workout-builder-recommendations.md) - Recommendation algorithm
- [Recovery Testing Results](./calculations/2025-11-08-recovery-testing.md) - Validated recovery algorithm

---

**Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Status**: 📋 Roadmap complete, ready to start Phase 2 (Database Design)
