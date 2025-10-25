# FitForge Architecture Refactor: Backend-Driven Muscle State Calculations

**Document Version:** 1.1 (Critical Fixes Applied)
**Created:** 2025-10-24
**Updated:** 2025-10-24
**Author:** Winston (Architect Agent)
**Status:** Ready for Implementation

---

## Executive Summary

This document outlines the architectural refactor of FitForge's muscle state management system, transitioning from a hybrid frontend/backend calculation model to a **backend-driven single source of truth** architecture.

**Current Problem:** Frontend and backend both calculate muscle fatigue independently, resulting in conflicting values and bugs when workouts are created via API.

**Solution:** Backend becomes the authoritative calculation engine, frontend becomes a pure presentation layer.

**Benefits:**
- Single source of truth for all muscle state calculations
- Simplified frontend code (remove ~100 lines of calculation logic)
- Eliminates current bug where API-created workouts show 0% fatigue
- Easier debugging and testing
- Aligns with user's mental model: "frontend as fancy spreadsheet displaying database data"

---

## Architectural Principles

### Core Principle: Separation of Concerns

**Database Layer** (Storage)
- Stores immutable historical facts
- What happened: workout occurred, initial fatigue was X%
- No derived/calculated values

**Backend API Layer** (Intelligence)
- Calculates current state from historical facts
- Applies business logic (recovery formulas, time decay)
- Returns computed values ready for display
- Single source of truth for all calculations

**Frontend Layer** (Presentation)
- Displays data from API
- Handles user interactions
- Zero calculation logic
- Trusts backend completely

### Data Flow Philosophy

```
USER LOGS WORKOUT
    ↓
FRONTEND: Calculates initial fatigue from volume
    ↓
BACKEND: Stores initial_fatigue_percent + timestamp
    ↓
[TIME PASSES]
    ↓
USER OPENS APP
    ↓
FRONTEND: fetch('/api/muscle-states')
    ↓
BACKEND:
    - Reads initial_fatigue_percent, last_trained from DB
    - Calculates days_elapsed = NOW - last_trained
    - Applies decay formula
    - Returns current_fatigue_percent
    ↓
FRONTEND: Displays the value
```

**Key Insight:** Database stores "what was" (historical facts), Backend provides "what is" (current interpretation), Frontend shows "what user sees" (presentation).

---

## Database Schema Changes

### Current Schema (Before Refactor)

```sql
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL UNIQUE,
  fatigue_percent REAL NOT NULL DEFAULT 0,      -- Ambiguous: initial or current?
  volume_today REAL NOT NULL DEFAULT 0,
  recovered_at TEXT,                             -- Always null, unused
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Problems:**
- `fatigue_percent` is ambiguous (initial or current fatigue?)
- `recovered_at` is unused (always null)
- Frontend recalculates fatigue because field name doesn't indicate it's initial value

### New Schema (After Refactor)

```sql
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,  -- Clear: fatigue at time of workout
  volume_today REAL NOT NULL DEFAULT 0,              -- Kept for future same-day tracking
  last_trained TEXT,                                 -- UTC ISO timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)                       -- Composite constraint for multi-user support
);
```

**Changes:**
1. **Renamed:** `fatigue_percent` → `initial_fatigue_percent` (semantic clarity)
2. **Removed:** `recovered_at` (unused, always null)
3. **Kept:** `volume_today` (future-proofing for same-day workout tracking)
4. **Fixed:** UNIQUE constraint now composite `(user_id, muscle_name)` for proper multi-user support

**Rationale:**
- `initial_fatigue_percent` clearly indicates this is the starting point, not current state
- Pairs conceptually with `currentFatiguePercent` (calculated by backend)
- Stores immutable fact: "muscle was X% fatigued when workout happened"

### Migration Strategy

**Approach:** Fresh start (data wipe)

```sql
-- Drop existing table
DROP TABLE IF EXISTS muscle_states;

-- Recreate with new schema
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

-- Re-initialize default muscle states
INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today) VALUES
  (1, 'Pectoralis', 0, 0),
  (1, 'Triceps', 0, 0),
  (1, 'Deltoids', 0, 0),
  (1, 'Lats', 0, 0),
  (1, 'Biceps', 0, 0),
  (1, 'Rhomboids', 0, 0),
  (1, 'Trapezius', 0, 0),
  (1, 'Forearms', 0, 0),
  (1, 'Quadriceps', 0, 0),
  (1, 'Glutes', 0, 0),
  (1, 'Hamstrings', 0, 0),
  (1, 'Calves', 0, 0),
  (1, 'Core', 0, 0);
```

**Justification:**
- Only test data exists currently (2 workouts)
- User approved data wipe
- Simpler than migration script
- Reduces risk of migration bugs

**How to Execute Migration:**

```bash
# Step 1: Save the SQL above to a file
# Save migration SQL to: backend/database/migrations/002_refactor_muscle_states.sql

# Step 2: Stop the containers
docker-compose down

# Step 3: Option A - Run migration directly (simple)
docker-compose up -d backend
docker-compose exec backend sqlite3 /data/fitforge.db < backend/database/migrations/002_refactor_muscle_states.sql

# Step 3: Option B - Use migration script (recommended for logging)
docker-compose up -d backend
docker-compose exec backend node database/run-migration.js migrations/002_refactor_muscle_states.sql

# Step 4: Verify migration succeeded
docker-compose exec backend sqlite3 /data/fitforge.db "SELECT name FROM sqlite_master WHERE type='table' AND name='muscle_states';"
docker-compose exec backend sqlite3 /data/fitforge.db "PRAGMA table_info(muscle_states);"

# Step 5: Restart all services
docker-compose down
docker-compose up
```

**Expected Output from Verification:**
```
muscle_states
---
0|id|INTEGER|0||1
1|user_id|INTEGER|1||0
2|muscle_name|TEXT|1||0
3|initial_fatigue_percent|REAL|1|0|0
4|volume_today|REAL|1|0|0
5|last_trained|TEXT|0||0
6|updated_at|TIMESTAMP|0|CURRENT_TIMESTAMP|0
```

---

## Backend API Contract

### GET /api/muscle-states

**Purpose:** Return current muscle state with all calculated values

**Response Format:**

```json
{
  "Pectoralis": {
    "currentFatiguePercent": 25.5,
    "initialFatiguePercent": 51.0,
    "lastTrained": "2025-10-24T18:30:00.000Z",
    "daysElapsed": 1.2,
    "estimatedRecoveryDays": 4.1,
    "daysUntilRecovered": 2.9,
    "recoveryStatus": "ready"
  },
  "Triceps": {
    "currentFatiguePercent": 42.3,
    "initialFatiguePercent": 51.0,
    "lastTrained": "2025-10-24T18:30:00.000Z",
    "daysElapsed": 1.2,
    "estimatedRecoveryDays": 4.1,
    "daysUntilRecovered": 2.9,
    "recoveryStatus": "recovering"
  },
  // ... other 11 muscles
}
```

**Field Definitions:**

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `currentFatiguePercent` | number | Calculated | Current fatigue after time decay (0-100) |
| `initialFatiguePercent` | number | Database | Fatigue immediately after workout |
| `lastTrained` | string | Database | ISO timestamp of workout |
| `daysElapsed` | number | Calculated | Days since workout |
| `estimatedRecoveryDays` | number | Calculated | Total days needed for recovery |
| `daysUntilRecovered` | number | Calculated | Days remaining until recovered |
| `recoveryStatus` | enum | Calculated | "ready" \| "recovering" \| "fatigued" |

**Calculation Logic:**

```javascript
function getMuscleStates() {
  const now = Date.now();
  const muscles = db.query('SELECT * FROM muscle_states WHERE user_id = 1');

  return muscles.reduce((acc, muscle) => {
    // Handle never-trained muscles
    const daysElapsed = muscle.last_trained
      ? (now - new Date(muscle.last_trained)) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Recovery formula: 1 base day + up to 6 days based on fatigue
    const recoveryDays = 1 + (muscle.initial_fatigue_percent / 100) * 6;

    // Linear decay: fatigue decreases linearly over recovery period
    const currentFatigue = muscle.last_trained
      ? Math.max(0, muscle.initial_fatigue_percent * (1 - daysElapsed / recoveryDays))
      : 0;

    const daysUntilRecovered = Math.max(0, recoveryDays - daysElapsed);

    // Recovery status thresholds
    const recoveryStatus = currentFatigue <= 33 ? 'ready'
      : currentFatigue <= 66 ? 'recovering'
      : 'fatigued';

    acc[muscle.muscle_name] = {
      currentFatiguePercent: Math.round(currentFatigue * 10) / 10,  // 1 decimal
      initialFatiguePercent: muscle.initial_fatigue_percent,
      lastTrained: muscle.last_trained,
      daysElapsed: Math.round(daysElapsed * 10) / 10,
      estimatedRecoveryDays: Math.round(recoveryDays * 10) / 10,
      daysUntilRecovered: Math.round(daysUntilRecovered * 10) / 10,
      recoveryStatus
    };

    return acc;
  }, {});
}
```

**Critical Requirements:**
- ✅ All timestamps in UTC (prevent timezone bugs)
- ✅ Null handling for never-trained muscles
- ✅ Bounds checking: `Math.max(0, Math.min(100, fatigue))`
- ✅ Rounding to 1 decimal place (prevent floating point display issues)
- ✅ Validation: ensure all values are within expected ranges

---

### PUT /api/muscle-states

**Purpose:** Update muscle states after workout

**Request Format:**

```json
{
  "Pectoralis": {
    "initial_fatigue_percent": 25.5,
    "last_trained": "2025-10-24T18:30:00.000Z",
    "volume_today": 2550
  },
  "Triceps": {
    "initial_fatigue_percent": 51.0,
    "last_trained": "2025-10-24T18:30:00.000Z",
    "volume_today": 5100
  }
}
```

**Response:** Same as GET /api/muscle-states (returns calculated current state)

**Backend Logic:**

```javascript
function updateMuscleStates(updates) {
  const stmt = db.prepare(`
    UPDATE muscle_states
    SET initial_fatigue_percent = ?,
        last_trained = ?,
        volume_today = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  Object.entries(updates).forEach(([muscle, data]) => {
    stmt.run(
      data.initial_fatigue_percent,
      data.last_trained,
      data.volume_today || 0,
      muscle
    );
  });

  // Return calculated current state
  return getMuscleStates();
}
```

**Critical Requirements:**
- ✅ Store values as-is (no calculation)
- ✅ Validate timestamp format (ISO 8601 UTC)
- ✅ Return calculated state after update (frontend gets fresh data)

---

## Frontend Architecture

### Before Refactor (Current State)

**Dashboard.tsx - Complex Calculation Logic:**

```typescript
// 50+ lines of calculation logic
const daysSince = getDaysSince(status.lastTrained);
const recovery = calculateRecoveryPercentage(daysSince, status.recoveryDaysNeeded);
const fatiguePercent = 100 - recovery;  // Recalculates what backend already knows
// ... more calculations
```

**Problems:**
- Duplicate logic (backend stores fatigue, frontend recalculates)
- Missing data (recoveryDaysNeeded not in database)
- Confusing state management
- Bug: shows 0% for API-created workouts

### After Refactor (Proposed State)

**Dashboard.tsx - Pure Presentation:**

```typescript
function Dashboard() {
  const [muscleStates, setMuscleStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMuscleStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/muscle-states');
      if (!response.ok) throw new Error('Failed to fetch muscle states');
      const data = await response.json();
      setMuscleStates(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching muscle states:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMuscleStates();  // Auto-refresh on mount
  }, []);

  if (loading) return <div>Loading muscle states...</div>;
  if (error) return <div>Error: {error} <button onClick={fetchMuscleStates}>Retry</button></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3>Muscle Fatigue Heat Map</h3>
        <button onClick={fetchMuscleStates}>🔄 Refresh</button>
      </div>

      <MuscleCategory title="PUSH MUSCLES" muscles={['Pectoralis', 'Deltoids', 'Triceps']}>
        {muscle => {
          const state = muscleStates[muscle];
          if (!state) return null;

          return (
            <MuscleCard
              name={muscle}
              fatiguePercent={state.currentFatiguePercent}
              status={state.recoveryStatus}
              lastTrained={state.lastTrained}
              daysUntilRecovered={state.daysUntilRecovered}
            />
          );
        }}
      </MuscleCategory>

      {/* Repeat for PULL, LEGS, CORE categories */}
    </div>
  );
}
```

**Benefits:**
- ~80% less code in Dashboard
- No calculation logic
- Easier to understand and maintain
- Automatically works with API-created workouts

---

### Refresh Strategy

**Implementation:** Auto-refresh on mount + manual refresh button

```typescript
// Auto-refresh when component mounts (navigating to Dashboard)
useEffect(() => {
  fetchMuscleStates();
}, []);

// Manual refresh button for user control
<button onClick={fetchMuscleStates}>🔄 Refresh</button>
```

**Rationale:**
- User typically opens app, checks heat map, logs workout, closes app (5-30 min sessions)
- Auto-refresh ensures fresh data when opening Dashboard
- Manual button for users who sit on page thinking about workout
- Skip periodic interval (YAGNI - unnecessary complexity for this use case)

**Future Enhancement (V2):**
If users request real-time updates, add:
```typescript
const interval = setInterval(() => {
  if (document.visibilityState === 'visible') {
    fetchMuscleStates();
  }
}, 10 * 60 * 1000);  // Every 10 minutes if page visible
```

---

## TypeScript Type Definitions

### Backend Response Type

```typescript
// types.ts - API Response
export interface MuscleStateResponse {
  currentFatiguePercent: number;      // 0-100, 1 decimal place
  initialFatiguePercent: number;      // 0-100
  lastTrained: string | null;         // ISO 8601 UTC or null if never trained
  daysElapsed: number;                // >= 0, 1 decimal place
  estimatedRecoveryDays: number;      // >= 0, 1 decimal place
  daysUntilRecovered: number;         // >= 0, 1 decimal place
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';
}

export type MuscleStatesResponse = Record<Muscle, MuscleStateResponse>;
```

### Backend Request Type

```typescript
// types.ts - API Request
export interface MuscleStateUpdate {
  initial_fatigue_percent: number;
  last_trained: string;  // ISO 8601 UTC
  volume_today?: number;
}

export type MuscleStatesUpdateRequest = Partial<Record<Muscle, MuscleStateUpdate>>;
```

### Frontend State Type (Deprecated)

```typescript
// OLD - REMOVE AFTER REFACTOR
export interface MuscleState {
  lastTrained: number;          // ❌ Remove
  fatiguePercentage: number;    // ❌ Remove
  recoveryDaysNeeded: number;   // ❌ Remove
}

// Frontend should use MuscleStateResponse directly from API
```

---

## Recovery Formula Documentation

### V1 Formula (Linear Decay)

**Recovery Time Calculation:**
```javascript
recoveryDays = 1 + (initialFatigue / 100) * 6
```

**Examples:**
- 0% fatigue → 1 day recovery
- 50% fatigue → 4 days recovery
- 100% fatigue → 7 days recovery

**Decay Calculation:**
```javascript
currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
currentFatigue = Math.max(0, currentFatigue)  // Floor at 0%
```

**Decay Curve:**
```
100% │     ●
     │      ╲
     │       ╲
 75% │        ╲
     │         ╲
 50% │          ●
     │           ╲
 25% │            ╲
     │             ╲
  0% │______________●_______
     0   1   2   3   4   5   6   7
         Days Elapsed
```

**Limitations (Acknowledged for V1):**
- Linear decay is physiologically inaccurate (real recovery is non-linear)
- Same formula for all muscle groups (larger muscles recover slower in reality)
- 10,000 lb baseline is hardcoded (not personalized)

**Future Enhancements (V2+):**
- Non-linear decay curves (exponential or logarithmic)
- Muscle-specific recovery rates based on size
- Personalized baselines learned from workout history
- Research-backed recovery models from sports science

---

## Implementation Plan

### Phase 1: Backend Foundation ✅

**Goal:** Update backend to calculate and return all derived values

**Tasks:**
1. Create database migration script
2. Update `getMuscleStates()` function with calculation logic
3. Update `updateMuscleStates()` function to accept new field names
4. Add validation and bounds checking
5. Add null handling for never-trained muscles

**Testing:**
```bash
# Test GET endpoint
curl http://localhost:3001/api/muscle-states | jq

# Expected Output: All muscles with default values (never trained)
# {
#   "Pectoralis": {
#     "currentFatiguePercent": 0,
#     "initialFatiguePercent": 0,
#     "lastTrained": null,
#     "daysElapsed": Infinity,
#     "estimatedRecoveryDays": 1,
#     "daysUntilRecovered": 0,
#     "recoveryStatus": "ready"
#   },
#   "Triceps": { ... },
#   ...
# }

# Test PUT endpoint
curl -X PUT http://localhost:3001/api/muscle-states \
  -H "Content-Type: application/json" \
  -d '{
    "Triceps": {
      "initial_fatigue_percent": 51,
      "last_trained": "2025-10-24T18:30:00.000Z",
      "volume_today": 5100
    }
  }' | jq

# Expected Output: Returns calculated current state
# {
#   "Triceps": {
#     "currentFatiguePercent": 51.0,  (if just trained)
#     "initialFatiguePercent": 51.0,
#     "lastTrained": "2025-10-24T18:30:00.000Z",
#     "daysElapsed": 0.0,
#     "estimatedRecoveryDays": 4.1,
#     "daysUntilRecovered": 4.1,
#     "recoveryStatus": "recovering"
#   },
#   ... (other muscles unchanged)
# }
```

**Success Criteria:**
- ✅ GET returns all calculated fields
- ✅ PUT accepts new field names and returns updated state
- ✅ Never-trained muscles return sensible defaults
- ✅ All values within valid ranges (0-100, >= 0, etc.)

**Checkpoint:** Commit backend changes before touching frontend

---

### Phase 2: Frontend Types ✅

**Goal:** Add new TypeScript interfaces to match new API contract

**Tasks:**
1. Add `MuscleStateResponse` type to `types.ts`
2. Add `MuscleStatesUpdateRequest` type to `types.ts`
3. Mark old `MuscleState` type as `@deprecated` (keep it for now, will remove in Phase 5)
4. Add JSDoc comments explaining new types

**⚠️ IMPORTANT:** Do NOT remove old `MuscleState` type yet - other components still use it until Phases 3-4 are complete.

**Testing:**
```bash
npm run type-check
# Should compile without errors (both old and new types exist)
```

**Success Criteria:**
- ✅ TypeScript compilation succeeds
- ✅ No type errors in editor
- ✅ New types added
- ✅ Old types marked `@deprecated` but not removed

**Checkpoint:** Commit type additions (not removals)

---

### Phase 3: Frontend Display ✅

**Goal:** Update Dashboard to use API values directly (without removing shared functions yet)

**Tasks:**
1. Update `Dashboard.tsx` to fetch and display API fields directly
2. Replace calculation logic with API field access
3. Add refresh button (`onClick={fetchMuscleStates}`)
4. Add loading state (`if (loading) return ...`)
5. Add error handling (`try/catch` with error state)
6. Remove local calculation calls (but keep functions in codebase for now)

**⚠️ IMPORTANT:** Do NOT remove `calculateRecoveryPercentage()` or other calculation functions yet - other components (Workout.tsx, etc.) might still use them. Just stop calling them from Dashboard. Functions will be removed in Phase 5 after all components are updated.

**Testing:**
```
1. Navigate to Dashboard
2. Verify heat map displays correctly
3. Verify "Last trained" shows correct dates
4. Verify "Ready now" / "Ready in X days" is accurate
5. Click refresh button, verify data updates
6. Test with empty database (all "Never trained")
7. Check console - no errors about missing calculations
```

**Success Criteria:**
- ✅ Heat map shows correct fatigue percentages from API
- ✅ No console errors
- ✅ Refresh button works
- ✅ Never-trained muscles show "Never trained"
- ✅ Dashboard component has no calculation logic (but functions still exist in codebase)

**Checkpoint:** Commit Dashboard changes

---

### Phase 4: Workout Integration ✅

**Goal:** Update workout save flow to use new API structure

**Tasks:**
1. Update `App.tsx` workout save logic
2. Change to use `initial_fatigue_percent` instead of `fatiguePercentage`
3. Update `setMuscleStates()` API call
4. Refetch muscle states after workout save

**Code Changes:**

```typescript
// App.tsx - Before
newMuscleStates[muscle] = {
  lastTrained: session.endTime,
  fatiguePercentage: fatigue,        // ❌ Old field
  recoveryDaysNeeded: recoveryDays   // ❌ Old field
};

// App.tsx - After
const muscleUpdates = {};
Object.entries(muscleFatigue).forEach(([muscle, fatigue]) => {
  muscleUpdates[muscle] = {
    initial_fatigue_percent: fatigue,  // ✅ New field
    last_trained: new Date().toISOString(),  // ✅ UTC
    volume_today: workoutMuscleVolumes[muscle] || 0
  };
});

// Update backend via API (PUT request)
await muscleStatesAPI.update(muscleUpdates);

// Refetch calculated current state from backend (GET request)
const updatedStates = await muscleStatesAPI.get();

// Update React state with fresh data
setMuscleStates(updatedStates);
```

**Testing:**
```
1. Log a complete workout
2. Verify workout saves successfully
3. Navigate to Dashboard
4. Verify heat map shows updated fatigue values
5. Verify PRs still work
6. Verify workout appears in history
```

**Success Criteria:**
- ✅ Workout saves without errors
- ✅ Muscle states update correctly
- ✅ Heat map reflects new workout
- ✅ PRs still detected and displayed

**Checkpoint:** Commit workout integration

---

### Phase 5: Cleanup & Polish ✅

**Goal:** Remove all remaining frontend calculation logic and deprecated code

**Tasks:**
1. Update remaining components to use API values:
   - Update `Workout.tsx` to use API fields
   - Update `WorkoutSummaryModal.tsx` to use API fields
2. Remove deprecated code (NOW SAFE because all components updated):
   - Remove `calculateRecoveryPercentage()` function
   - Remove all time-based fatigue calculation functions
   - Remove old `MuscleState` TypeScript type (marked `@deprecated` in Phase 2)
   - Remove `recoveryDaysNeeded` references
3. Search codebase to verify no calculation logic remains
4. Update documentation (README, inline comments)

**Search Commands:**
```bash
# Find remaining calculation logic
grep -r "calculateRecovery" --include="*.tsx" --include="*.ts"
grep -r "fatiguePercentage" --include="*.tsx" --include="*.ts"
grep -r "recoveryDaysNeeded" --include="*.tsx" --include="*.ts"
grep -r "100 - recovery" --include="*.tsx" --include="*.ts"
```

**Testing:**
```
Full end-to-end test:
1. Fresh database (docker-compose down -v)
2. Start app
3. Create profile
4. Log workout
5. Check heat map
6. Navigate away and back
7. Refresh button
8. Log second workout
9. Verify everything still works
```

**Success Criteria:**
- ✅ No calculation logic in frontend
- ✅ All components use API values
- ✅ Full workout flow works
- ✅ Documentation updated

**Final Commit:** "Complete backend-driven architecture refactor"

---

## Risk Mitigation

### High-Priority Risks

#### 1. Null Handling for Never-Trained Muscles
**Risk:** Division by zero, NaN values
**Mitigation:**
```javascript
const daysElapsed = muscle.last_trained
  ? (now - new Date(muscle.last_trained)) / (1000 * 60 * 60 * 24)
  : Infinity;

const currentFatigue = muscle.last_trained ? calculateDecay(...) : 0;
```

#### 2. Time Zone Inconsistencies
**Risk:** Wrong elapsed time calculations
**Mitigation:**
- Always use `new Date().toISOString()` (UTC)
- Never use `new Date().toString()` (local time)
- Document in code comments

#### 3. Incomplete Component Updates
**Risk:** Fix Dashboard but miss other components
**Mitigation:**
- Grep for all muscle state usage
- Update components list:
  - Dashboard.tsx ✓
  - Workout.tsx ✓
  - App.tsx ✓
  - WorkoutSummaryModal.tsx ✓
- Test each individually

#### 4. Docker Container Caching
**Risk:** Old schema cached in container
**Mitigation:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

### Medium-Priority Risks

#### 5. Floating Point Rounding
**Risk:** Display shows "25.500000001%"
**Mitigation:**
```javascript
Math.round(value * 10) / 10  // Round to 1 decimal
```

#### 6. Validation Gaps
**Risk:** Backend returns nonsensical values
**Mitigation:**
```javascript
// Bounds checking
currentFatigue = Math.max(0, Math.min(100, currentFatigue));
daysUntilRecovered = Math.max(0, daysUntilRecovered);
```

---

## Rollback Procedures

### If Implementation Fails

**Step 1: Identify Phase**
Determine which phase failed (check commit history)

**Step 2: Rollback to Safety Commit**
```bash
git log --oneline  # Find commit e2f67b4
git reset --hard e2f67b4
```

**Step 3: Rebuild Containers**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Step 4: Verify App Works**
- Navigate to Dashboard
- Log test workout
- Verify heat map displays

### Partial Rollback (Phase-Specific)

**If Phase 1 (Backend) fails:**
```bash
git revert <backend-commit-hash>
docker-compose restart backend
```

**If Phase 3 (Frontend Display) fails:**
```bash
git revert <dashboard-commit-hash>
npm run dev
```

---

## Testing Checklist

### Backend Tests (Phase 1)

- [ ] GET /api/muscle-states returns correct structure
- [ ] All calculated fields present and correct types
- [ ] Never-trained muscles return defaults (0%, null, "Never trained")
- [ ] Freshly trained muscles show correct initial fatigue
- [ ] Partially recovered muscles show correct current fatigue
- [ ] Fully recovered muscles show 0% fatigue
- [ ] PUT /api/muscle-states accepts new field names
- [ ] PUT returns updated calculated state

### Frontend Tests (Phase 3-4)

- [ ] Dashboard displays on initial load
- [ ] All muscles visible in heat map
- [ ] Fatigue percentages match backend values
- [ ] Progress bars render correctly
- [ ] Color coding correct (green/yellow/red)
- [ ] "Last trained" displays correctly
- [ ] "Ready now" vs "Ready in X days" accurate
- [ ] Refresh button updates data
- [ ] Loading state displays during fetch
- [ ] Error state displays on fetch failure
- [ ] Workout save updates heat map
- [ ] PRs still detected and displayed
- [ ] Navigation works (Dashboard ↔ Workout)

### Edge Cases

- [ ] Empty database (all muscles never trained)
- [ ] Single muscle trained, others never trained
- [ ] Multiple workouts same day
- [ ] Workout at midnight (boundary case)
- [ ] Very high fatigue (100%)
- [ ] Very low fatigue (<5%)
- [ ] Recovery exactly at threshold (33%, 66%)
- [ ] Network error during fetch
- [ ] Backend down

---

## Success Metrics

**Code Quality:**
- ✅ Reduce frontend calculation code by ~100 lines
- ✅ Single source of truth (all calculations in backend)
- ✅ Zero duplicate logic between frontend/backend

**Functionality:**
- ✅ Heat map displays correctly for all muscles
- ✅ Workout save → heat map update works
- ✅ API-created workouts display correctly (bug fixed)
- ✅ All existing features still work (PRs, templates, etc.)

**Developer Experience:**
- ✅ Easier to debug (check backend calculation, not frontend)
- ✅ Easier to modify recovery formula (one place to change)
- ✅ TypeScript types prevent API contract mismatches

**User Experience:**
- ✅ Heat map always accurate
- ✅ Refresh button provides control
- ✅ Fast loading (local API, <50ms)

---

## Future Enhancements (V2+)

### Non-Linear Recovery Curves
Replace linear decay with physiologically accurate models:
```javascript
// Exponential decay (fast recovery initially, then plateaus)
currentFatigue = initialFatigue * Math.exp(-decayRate * daysElapsed);

// Logarithmic curve (based on sports science research)
currentFatigue = initialFatigue * (1 - Math.log(1 + daysElapsed) / Math.log(1 + recoveryDays));
```

### Muscle-Specific Recovery Rates
Different recovery times for different muscle groups:
```javascript
const RECOVERY_RATES = {
  'Pectoralis': 1.2,  // Larger muscles recover slower
  'Lats': 1.3,
  'Quadriceps': 1.4,
  'Triceps': 0.8,     // Smaller muscles recover faster
  'Biceps': 0.8,
  'Forearms': 0.7
};
```

### Personalized Baselines
Learn actual capacity from workout history instead of hardcoded 10,000:
```javascript
// Track highest volume achieved per muscle
const personalBaseline = Math.max(...historicalVolumes[muscle]);
```

### Caching Layer (If Performance Needed)
```javascript
// In-memory cache with 1-minute TTL
const muscleStateCache = {
  data: null,
  timestamp: 0,
  TTL: 60000  // 1 minute
};

function getMuscleStates() {
  const now = Date.now();
  if (muscleStateCache.data && (now - muscleStateCache.timestamp) < muscleStateCache.TTL) {
    return muscleStateCache.data;  // Return cached
  }

  const fresh = calculateMuscleStates();  // Calculate fresh
  muscleStateCache.data = fresh;
  muscleStateCache.timestamp = now;
  return fresh;
}
```

---

## Conclusion

This refactor establishes a clean, maintainable architecture where:
- **Database stores facts** (what happened)
- **Backend provides intelligence** (what it means)
- **Frontend displays data** (what user sees)

The implementation is phased to minimize risk, with testing checkpoints after each phase. The rollback plan ensures we can revert safely if issues arise.

**Estimated Effort:** 3-4 hours total
- Phase 1 (Backend): 1 hour
- Phase 2 (Types): 15 minutes
- Phase 3 (Dashboard): 1 hour
- Phase 4 (Workout): 1 hour
- Phase 5 (Cleanup): 30 minutes

**Next Steps:**
1. Review this document with stakeholder (Kaelen)
2. Get approval to proceed
3. Begin Phase 1 implementation
4. Test and checkpoint after each phase

---

## Version History

**Version 1.1 - 2025-10-24 (Critical Fixes Applied)**

Fixed the following blocking and quality issues:

**Blocking Issues Fixed:**
1. ✅ **Phase 2 Sequencing:** Deferred type removal to Phase 5 (was going to break compilation in Phase 3-4)
2. ✅ **Phase 3 Sequencing:** Deferred function removal to Phase 5 (was going to cause runtime errors)
3. ✅ **Migration Execution:** Added complete step-by-step Docker commands with expected outputs

**Quality Improvements:**
4. ✅ **Database Schema:** Fixed UNIQUE constraint to composite `(user_id, muscle_name)` for proper multi-user support
5. ✅ **API Naming:** Clarified distinction between `muscleStatesAPI.update()` (API call) vs `setMuscleStates()` (React setState)
6. ✅ **Test Verification:** Added expected curl outputs for all Phase 1 tests

The document is now safe to use for implementation without risk of blocking errors.

---

**Version 1.0 - 2025-10-24 (Initial Draft)**

Original comprehensive architecture document with known issues (fixed in v1.1).

---

**Document End**

*Created by Winston (Architect Agent)*
*For FitForge Backend-Driven Architecture Refactor*
*Latest Version: 1.1 - 2025-10-24*
