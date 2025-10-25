# Tasks: Refactor to Backend-Driven Muscle State Calculations

**Change ID:** `refactor-backend-driven-muscle-states`
**Status:** In Progress
**Estimated Time:** 8-12 hours total
**Progress:** Phase 1-3 Complete (6/7 hours done)

---

## Task Organization

**Phases:** 5 sequential phases with checkpoints
**Dependencies:** Each phase builds on previous phase
**Parallelizable Work:** None (sequential migration for safety)
**Rollback Points:** After each phase completion

---

## Phase 1: Backend Foundation (3-4 hours) ✅ COMPLETE

**Goal:** Backend calculates and returns all derived values

### Task 1.1: Create Database Migration Script ✅
**Time:** 30 minutes
**Files:** `backend/database/migrations/002_refactor_muscle_states.sql`

**Steps:**
1. Create migrations directory if not exists: `mkdir -p backend/database/migrations`
2. Create migration file with:
   - DROP TABLE IF EXISTS muscle_states
   - CREATE TABLE with new schema (initial_fatigue_percent, no recovered_at, composite UNIQUE)
   - Re-insert 13 muscle groups for user_id = 1
3. Add index: idx_muscle_states_user

**Validation:**
- SQL syntax check: `sqlite3 :memory: < migrations/002_refactor_muscle_states.sql`
- File contains complete DROP/CREATE/INSERT sequence

### Task 1.2: Run Migration ✅
**Time:** 15 minutes
**Commands:**

```bash
docker-compose down
docker-compose up -d backend
docker-compose exec backend node database/run-migration.js migrations/002_refactor_muscle_states.sql

# Verify migration
docker-compose exec backend sqlite3 /data/fitforge.db "PRAGMA table_info(muscle_states);"
# Expected: 7 columns, initial_fatigue_percent exists, recovered_at absent

docker-compose exec backend sqlite3 /data/fitforge.db "SELECT COUNT(*) FROM muscle_states;"
# Expected: 13 (all muscles initialized)

docker-compose down && docker-compose up
```

**Validation:**
- ✅ Schema has 7 columns (not 8)
- ✅ `initial_fatigue_percent` field exists
- ✅ `recovered_at` field does NOT exist
- ✅ 13 muscle records exist

### Task 1.3: Update Backend Types ✅
**Time:** 30 minutes
**Files:** `backend/types.ts`

**Steps:**
1. Update `MuscleStateRow` interface to use `initial_fatigue_percent`
2. Remove `recovered_at` field
3. Add JSDoc comment explaining temporal semantics

**Validation:**
- TypeScript compilation succeeds: `cd backend && npm run build`
- No unused field warnings

### Task 1.4: Implement Calculation Engine in getMuscleStates() ✅
**Time:** 1.5 hours
**Files:** `backend/database/database.ts`

**Steps:**
1. Update SELECT query to use `initial_fatigue_percent`
2. Add calculation logic:
   - `daysElapsed = (now - lastTrained) / (1000*60*60*24)` with null check
   - `recoveryDays = 1 + (initialFatigue / 100) * 6`
   - `currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)` with bounds
   - `daysUntilRecovered = max(0, recoveryDays - daysElapsed)`
   - `recoveryStatus = currentFatigue <= 33 ? 'ready' : <= 66 ? 'recovering' : 'fatigued'`
3. Add rounding: `Math.round(value * 10) / 10`
4. Add bounds checking: `Math.max(0, Math.min(100, fatigue))`
5. Handle never-trained muscles (null `last_trained`)

**Code Structure:**
```typescript
function getMuscleStates(): MuscleStatesResponse {
  const now = Date.now();
  const muscles = db.prepare('SELECT * FROM muscle_states WHERE user_id = 1').all();

  return muscles.reduce((acc, muscle) => {
    // Calculate fields here
    acc[muscle.muscle_name] = {
      currentFatiguePercent: ...,
      initialFatiguePercent: muscle.initial_fatigue_percent,
      lastTrained: muscle.last_trained,
      daysElapsed: ...,
      estimatedRecoveryDays: ...,
      daysUntilRecovered: ...,
      recoveryStatus: ...
    };
    return acc;
  }, {});
}
```

**Validation:**
- Function compiles without errors
- Returns object with all 13 muscles
- Each muscle has all 7 fields

### Task 1.5: Update updateMuscleStates() Function ✅
**Time:** 30 minutes
**Files:** `backend/database/database.ts`

**Steps:**
1. Update SQL UPDATE to use `initial_fatigue_percent`
2. Remove any `recovered_at` references
3. After update, call `getMuscleStates()` to return calculated state
4. Validate UTC timestamp format

**Validation:**
- Function accepts `initial_fatigue_percent` parameter
- Function returns `MuscleStatesResponse` (calculated values)
- No references to old field names

### Task 1.6: Update API Route Handlers ✅
**Time:** 15 minutes
**Files:** `backend/server.ts`

**Steps:**
1. Verify GET `/api/muscle-states` calls updated `getMuscleStates()`
2. Verify PUT `/api/muscle-states` calls updated `updateMuscleStates()`
3. Update TypeScript types for request/response

**Validation:**
- Server compiles: `cd backend && npm run build`
- No TypeScript errors

### Task 1.7: Test Backend with curl ✅
**Time:** 30 minutes

**Commands:**
```bash
# Test GET endpoint
curl http://localhost:3001/api/muscle-states | jq

# Expected: All 13 muscles with 7 fields each
# currentFatiguePercent, initialFatiguePercent, lastTrained,
# daysElapsed, estimatedRecoveryDays, daysUntilRecovered, recoveryStatus

# Test never-trained muscle
jq '.Pectoralis' # Should show: currentFatigue=0, lastTrained=null, status='ready'

# Test PUT endpoint
curl -X PUT http://localhost:3001/api/muscle-states \
  -H "Content-Type: application/json" \
  -d '{
    "Triceps": {
      "initial_fatigue_percent": 51,
      "last_trained": "2025-10-25T12:00:00.000Z",
      "volume_today": 5100
    }
  }' | jq

# Expected: Returns all muscle states with Triceps updated
# Triceps.currentFatiguePercent should be 51.0 (just trained)
# Triceps.daysElapsed should be ~0.0
# Triceps.recoveryStatus should be 'recovering'
```

**Validation:**
- ✅ GET returns 13 muscles
- ✅ Each muscle has exactly 7 fields
- ✅ Never-trained muscles return sensible defaults
- ✅ PUT updates database and returns calculated state
- ✅ All values within valid ranges (0-100, >= 0)

**Checkpoint:** Commit backend changes
```bash
git add backend/
git commit -m "Phase 1: Implement backend calculation engine for muscle states"
```

---

## Phase 2: Frontend Types (30 minutes) ✅ COMPLETE

**Goal:** Add new TypeScript types for API contract

### Task 2.1: Add New Response Type ✅
**Time:** 15 minutes
**Files:** `types.ts`

**Steps:**
1. Add `MuscleStateResponse` interface:
```typescript
export interface MuscleStateResponse {
  // Calculated fields
  currentFatiguePercent: number;
  daysElapsed: number | null;
  estimatedRecoveryDays: number;
  daysUntilRecovered: number;
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';
  // Stored fields
  initialFatiguePercent: number;
  lastTrained: string | null;
}

export type MuscleStatesResponse = Record<Muscle, MuscleStateResponse>;
```

2. Add `MuscleStateUpdate` interface for PUT requests:
```typescript
export interface MuscleStateUpdate {
  initial_fatigue_percent: number;
  last_trained: string;
  volume_today?: number;
}

export type MuscleStatesUpdateRequest = Partial<Record<Muscle, MuscleStateUpdate>>;
```

**Validation:**
- TypeScript compilation succeeds: `npm run type-check`
- No errors in editor (VS Code)

### Task 2.2: Mark Old Type as Deprecated ✅
**Time:** 10 minutes
**Files:** `types.ts`

**Steps:**
1. Add `@deprecated` JSDoc to old `MuscleState` interface:
```typescript
/**
 * @deprecated Use MuscleStateResponse from API instead.
 * This type will be removed after frontend refactor is complete (Phase 5).
 */
export interface MuscleState {
  lastTrained: number;
  fatiguePercentage: number;
  recoveryDaysNeeded: number;
}
```

**Validation:**
- TypeScript still compiles (type not removed yet)
- Warning appears when using deprecated type

**Checkpoint:** Commit type changes
```bash
git add types.ts
git commit -m "Phase 2: Add new TypeScript types for backend-calculated muscle states"
```

---

## Phase 3: Frontend Display (2-3 hours) ✅ COMPLETE

**Goal:** Update Dashboard to use API values directly

### Task 3.1: Update Dashboard State Management ✅
**Time:** 45 minutes
**Files:** `components/Dashboard.tsx`

**Steps:**
1. Change state type: `const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({})`
2. Add loading state: `const [loading, setLoading] = useState(false)`
3. Add error state: `const [error, setError] = useState<string | null>(null)`
4. Create `fetchMuscleStates()` async function:
```typescript
const fetchMuscleStates = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/muscle-states');
    if (!response.ok) throw new Error('Failed to fetch muscle states');
    const data = await response.json();
    setMuscleStates(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```
5. Add useEffect: `useEffect(() => { fetchMuscleStates(); }, [])`

**Validation:**
- Component compiles
- Auto-refresh triggers on mount
- Loading/error states work

### Task 3.2: Update Muscle Card Rendering ✅
**Time:** 1 hour
**Files:** `components/Dashboard.tsx`

**Steps:**
1. Replace calculation calls with direct API field access:
   - ❌ Remove: `const daysSince = getDaysSince(state.lastTrained)`
   - ❌ Remove: `const recovery = calculateRecoveryPercentage(...)`
   - ❌ Remove: `const fatiguePercent = 100 - recovery`
   - ✅ Use: `state.currentFatiguePercent`
   - ✅ Use: `state.recoveryStatus`
   - ✅ Use: `state.daysUntilRecovered`

2. Update MuscleCard props:
```typescript
<MuscleCard
  name={muscle}
  fatiguePercent={state.currentFatiguePercent}
  status={state.recoveryStatus}
  lastTrained={state.lastTrained}
  daysUntilRecovered={state.daysUntilRecovered}
/>
```

3. Remove unused local calculation variables

**Validation:**
- Component renders without errors
- Heat map displays correctly
- Fatigue percentages match backend values
- Status badges show correct colors

### Task 3.3: Add Refresh Button ✅
**Time:** 30 minutes
**Files:** `components/Dashboard.tsx`

**Steps:**
1. Add button in header/toolbar:
```typescript
<div className="flex justify-between items-center mb-4">
  <h3>Muscle Fatigue Heat Map</h3>
  <button
    onClick={fetchMuscleStates}
    disabled={loading}
    className="..."
  >
    🔄 Refresh
  </button>
</div>
```

2. Disable button during loading
3. Style button appropriately

**Validation:**
- Button visible in Dashboard
- Button triggers fetch
- Button disabled during loading
- Data updates after click

### Task 3.4: Add Loading/Error UI ✅
**Time:** 30 minutes
**Files:** `components/Dashboard.tsx`

**Steps:**
1. Add loading spinner:
```typescript
if (loading) return <LoadingSpinner />;
```

2. Add error display:
```typescript
if (error) return (
  <div>
    <p>Error: {error}</p>
    <button onClick={fetchMuscleStates}>Retry</button>
  </div>
);
```

3. Conditionally render heat map only when data loaded

**Validation:**
- Loading spinner shows during fetch
- Error message shows on failure
- Retry button works

### Task 3.5: Test Dashboard Component ✅
**Time:** 30 minutes

**Manual Tests:**
1. Navigate to Dashboard → auto-refresh works
2. Never-trained muscles → show "Never trained"
3. Partially recovered muscles → show correct percentage
4. Fully recovered muscles → show "Ready now"
5. Click refresh button → data updates
6. Status badges → correct colors (green/yellow/red)
7. Progress bars → render correctly
8. Simulate backend down → error state displays

**Validation:**
- ✅ All manual tests pass
- ✅ No console errors
- ✅ No calculation logic in component
- ✅ Dashboard displays correctly

**Checkpoint:** Commit Dashboard changes
```bash
git add components/Dashboard.tsx
git commit -m "Phase 3: Update Dashboard to use backend-calculated muscle states"
```

---

## Phase 4: Workout Integration (2 hours) ✅ COMPLETE

**Goal:** Update workout save flow to use new API structure

### Task 4.1: Update Workout Save Logic
**Time:** 1 hour
**Files:** `App.tsx` or `components/Workout.tsx`

**Steps:**
1. Find workout save handler
2. Update muscle state update payload:
```typescript
// OLD
const muscleUpdates = {
  [muscle]: {
    fatiguePercentage: fatigue,
    recoveryDaysNeeded: recoveryDays
  }
};

// NEW
const muscleUpdates = {
  [muscle]: {
    initial_fatigue_percent: fatigue,
    last_trained: new Date().toISOString(),  // UTC
    volume_today: workoutMuscleVolumes[muscle] || 0
  }
};
```

3. Update API call to PUT /api/muscle-states
4. After successful save, refetch muscle states (GET /api/muscle-states)
5. Update local React state with fresh data

**Validation:**
- Workout saves successfully
- Muscle states update in database
- Heat map reflects new workout
- PRs still detected (existing functionality)

### Task 4.2: Test Workout Save Flow
**Time:** 1 hour

**Manual Tests:**
1. Log complete workout (6 exercises, 18 sets)
2. Verify workout saves without errors
3. Navigate to Dashboard
4. Verify heat map shows updated fatigue values
5. Verify targeted muscles show correct percentages
6. Verify PRs detected and displayed
7. Verify workout appears in history
8. Log second workout next day
9. Verify fatigue decreased from first workout

**Validation:**
- ✅ Workout saves successfully
- ✅ Muscle states update correctly
- ✅ Heat map reflects new workout
- ✅ PRs still work
- ✅ No console errors

**Checkpoint:** Commit workout integration
```bash
git add App.tsx components/Workout.tsx
git commit -m "Phase 4: Update workout save flow to use new muscle state API"
```

---

## Phase 5: Cleanup & Polish (1-2 hours) ✅ COMPLETE

**Goal:** Remove all remaining frontend calculation logic and deprecated code

### Task 5.1: Update Remaining Components
**Time:** 30 minutes
**Files:** `components/Workout.tsx`, `components/WorkoutSummaryModal.tsx`

**Steps:**
1. Search for muscle state usage in components
2. Update to use API fields directly
3. Remove any local calculation calls

**Validation:**
- All components use `MuscleStateResponse` type
- No local time calculations remain

### Task 5.2: Remove Deprecated Calculation Functions
**Time:** 30 minutes
**Files:** `utils/helpers.ts` or wherever calculation functions are defined

**Steps:**
1. Search for calculation functions:
```bash
grep -r "calculateRecovery" --include="*.tsx" --include="*.ts"
grep -r "getDaysSince" --include="*.tsx" --include="*.ts"
grep -r "100 - recovery" --include="*.tsx" --include="*.ts"
```

2. Remove functions:
   - `calculateRecoveryPercentage()`
   - `getDaysSince()`
   - `calculateDaysUntilReady()`
   - Any other time-based calculation functions

3. Verify no components reference these functions

**Validation:**
- Grep searches return zero results
- TypeScript compilation succeeds
- No runtime errors

### Task 5.3: Remove Old TypeScript Types
**Time:** 15 minutes
**Files:** `types.ts`

**Steps:**
1. Remove `MuscleState` interface (marked `@deprecated` in Phase 2)
2. Remove `MuscleStates` type alias
3. Remove `recoveryDaysNeeded` references

**Validation:**
- TypeScript compilation succeeds
- No components broken by removal

### Task 5.4: Update Documentation
**Time:** 30 minutes
**Files:** `README.md`, `ARCHITECTURE.md`, inline comments

**Steps:**
1. Update API documentation with new endpoint response format
2. Add migration notes
3. Update architecture diagrams if present
4. Add inline comments explaining calculation formulas

**Validation:**
- Documentation accurate
- Migration procedure documented
- Recovery formula documented

### Task 5.5: Full End-to-End Test
**Time:** 45 minutes

**Test Procedure:**
```
1. Fresh database (docker-compose down -v)
2. Start app (docker-compose up)
3. Create profile
4. Log workout (6 exercises, 18 sets)
5. Check heat map (all targeted muscles fatigued)
6. Navigate to Profile and back (auto-refresh)
7. Click refresh button (manual refresh)
8. Log second workout next day
9. Verify fatigue decreased from first workout
10. Check PRs still work
11. Verify all features functional
```

**Validation:**
- ✅ Full workflow works end-to-end
- ✅ No console errors
- ✅ No calculation logic in frontend
- ✅ All existing features still work

**Checkpoint:** Final commit
```bash
git add .
git commit -m "Phase 5: Complete backend-driven muscle states refactor - remove deprecated code"
```

---

## Final Validation Checklist

### Backend Validation
- [ ] GET `/api/muscle-states` returns 7 fields per muscle
- [ ] Never-trained muscles return sensible defaults (0%, null, "ready")
- [ ] Freshly trained muscles show initial fatigue correctly
- [ ] Partially recovered muscles show decay correctly
- [ ] Fully recovered muscles show 0% fatigue
- [ ] PUT `/api/muscle-states` accepts new field names
- [ ] PUT returns calculated state in response

### Frontend Validation
- [ ] Dashboard displays without errors
- [ ] All 13 muscles visible in heat map
- [ ] Fatigue percentages match backend exactly
- [ ] Progress bars render correctly
- [ ] Color coding correct (green <= 33%, yellow <= 66%, red > 66%)
- [ ] "Last trained" displays correctly or "Never trained"
- [ ] "Ready now" vs "Ready in X days" accurate
- [ ] Refresh button updates data
- [ ] Loading spinner shows during fetch
- [ ] Error state displays on failure

### Integration Validation
- [ ] Workout save updates muscle states
- [ ] Heat map reflects new workouts
- [ ] PRs still detected and displayed
- [ ] Workout history still accessible
- [ ] Navigation triggers auto-refresh
- [ ] Multiple workouts same day handled correctly

### Code Quality Validation
- [ ] No calculation logic in frontend (grep returns zero)
- [ ] No `calculateRecovery*` functions exist
- [ ] No `getDaysSince` functions exist
- [ ] No `100 - recovery` patterns exist
- [ ] All TypeScript types correct
- [ ] No `@deprecated` types remain
- [ ] Documentation updated

---

## Rollback Procedures

### Quick Rollback (Any Phase)
```bash
git log --oneline  # Find last known good commit
git reset --hard <commit-hash>
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Phase-Specific Rollback

**Phase 1 Failure:**
```bash
git revert <backend-commit-hash>
docker-compose restart backend
```

**Phase 3 Failure:**
```bash
git revert <dashboard-commit-hash>
npm run dev
```

---

## Dependencies

**Required Before Starting:**
- Docker and Docker Compose installed
- Node.js and npm installed
- Backend and frontend running successfully
- Test data present (or willing to start fresh)

**Blockers:**
- None (can start immediately)

---

## Estimated Time Breakdown

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Backend Foundation | 7 tasks | 3-4 hours |
| Phase 2: Frontend Types | 2 tasks | 30 minutes |
| Phase 3: Frontend Display | 5 tasks | 2-3 hours |
| Phase 4: Workout Integration | 2 tasks | 2 hours |
| Phase 5: Cleanup & Polish | 5 tasks | 1-2 hours |
| **Total** | **21 tasks** | **8-12 hours** |

---

*Tasks Document v1.0 - 2025-10-25*
