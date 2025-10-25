# Proposal: Refactor to Backend-Driven Muscle State Calculations

**Change ID:** `refactor-backend-driven-muscle-states`
**Status:** Draft
**Created:** 2025-10-25
**Author:** Architecture Team
**Based On:** `docs/ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md` v1.1

---

## 📋 Summary

Transition FitForge from a hybrid frontend/backend muscle fatigue calculation model to a **backend-driven single source of truth** architecture. This refactor fixes a critical bug where API-created workouts show 0% fatigue and establishes clean separation of concerns: database stores historical facts, backend calculates current state, frontend displays data.

---

## 🎯 Problem Statement

### Current Issues

1. **Dual Calculation Logic Bug**
   - Frontend and backend both calculate muscle fatigue independently
   - Results in conflicting values and data inconsistencies
   - **Critical Bug:** API-created workouts display 0% fatigue in UI

2. **Ambiguous Database Schema**
   - `fatigue_percent` field name is unclear (initial or current fatigue?)
   - `recovered_at` field is always null (dead code)
   - UNIQUE constraint `muscle_name` broken for multi-user support (should be composite `(user_id, muscle_name)`)

3. **Calculation Code Duplication**
   - ~100 lines of recovery calculation logic duplicated across frontend components
   - Time-based decay formulas in multiple places
   - Difficult to maintain and prone to bugs

4. **Poor Separation of Concerns**
   - Frontend components contain business logic (recovery calculations)
   - Backend stores data but doesn't provide calculated values
   - Frontend can't trust API data alone

### User Impact

- Users see incorrect muscle fatigue percentages
- Workout planning decisions based on stale/incorrect data
- Inconsistent experience across different app entry points

---

## ✅ Proposed Solution

### Architectural Changes

Transform to a three-layer architecture:

1. **Database Layer (Storage)** - Stores immutable historical facts
   - Rename `fatigue_percent` → `initial_fatigue_percent` (semantic clarity)
   - Remove `recovered_at` field (dead code elimination)
   - Fix UNIQUE constraint to `(user_id, muscle_name)` (multi-user bug fix)

2. **Backend API Layer (Intelligence)** - Calculates current state from historical facts
   - Implement calculation engine with recovery formulas
   - Return 7 calculated fields per muscle (was 4 basic fields)
   - Apply time-based decay, recovery estimates, status determination

3. **Frontend Layer (Presentation)** - Displays data from API
   - Remove all time-based calculation logic (~100 lines)
   - Trust backend responses completely
   - Add manual refresh button for user control

### Data Flow

```
USER LOGS WORKOUT
    ↓
FRONTEND: Calculates initial fatigue from volume
    ↓
BACKEND: Stores initial_fatigue_percent + timestamp (immutable fact)
    ↓
[TIME PASSES]
    ↓
USER OPENS APP
    ↓
FRONTEND: fetch('/api/muscle-states')
    ↓
BACKEND:
    - Reads initial_fatigue_percent, last_trained from DB
    - Calculates daysElapsed = NOW - last_trained
    - Applies linear decay formula
    - Returns currentFatiguePercent, daysUntilRecovered, recoveryStatus
    ↓
FRONTEND: Displays the calculated values
```

---

## 📦 Capabilities

This change introduces/modifies **3 core capabilities**:

### 1. `backend-muscle-state-calculation` (NEW)
Backend becomes the authoritative calculation engine for all time-based muscle state computations.

**Key Features:**
- Linear decay recovery formula: `currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)`
- Recovery time formula: `recoveryDays = 1 + (initialFatigue / 100) * 6`
- Null handling for never-trained muscles
- Status determination: ready (<= 33%), recovering (<= 66%), fatigued (> 66%)

### 2. `muscle-state-storage` (MODIFIED)
Database schema cleanup and semantic improvements.

**Changes:**
- Rename field for clarity
- Remove dead code
- Fix multi-user constraint bug
- Maintain backward compatibility during migration

### 3. `muscle-state-presentation` (MODIFIED)
Frontend becomes pure presentation layer with zero calculation logic.

**Changes:**
- Remove ~100 lines of calculation code
- Use API fields directly
- Add refresh mechanism
- Improve loading/error states

---

## 📊 Success Metrics

### Code Quality
- ✅ Reduce frontend calculation code by ~100 lines
- ✅ Single source of truth (all calculations in backend)
- ✅ Zero duplicate logic between frontend/backend

### Bug Fixes
- ✅ API-created workouts display correct fatigue (fixes 0% bug)
- ✅ Multi-user database constraint fixed
- ✅ Eliminated race condition between frontend/backend calculations

### Developer Experience
- ✅ Easier debugging (check backend logs for calculations)
- ✅ Easier to modify recovery formula (one place to change)
- ✅ TypeScript types prevent API contract mismatches

### User Experience
- ✅ Heat map always accurate
- ✅ Manual refresh button provides control
- ✅ Fast loading (local API, <50ms)

---

## 🚧 Implementation Phases

### Phase 1: Backend Foundation (3-4 hours)
**Goal:** Update backend to calculate and return all derived values

**Tasks:**
- Create database migration script
- Update `getMuscleStates()` with calculation engine
- Update `updateMuscleStates()` to accept new field names
- Add validation, bounds checking, null handling
- Test with curl commands

**Testing:**
- GET returns all 7 calculated fields
- Never-trained muscles return sensible defaults
- All values within valid ranges

### Phase 2: TypeScript Types (30 minutes)
**Goal:** Add new types to match new API contract

**Tasks:**
- Add `MuscleStateResponse` type with 7 fields
- Add `MuscleStatesUpdateRequest` type
- Mark old `MuscleState` type as `@deprecated`
- Add JSDoc comments

**Testing:**
- TypeScript compilation succeeds
- No type errors in editor

### Phase 3: Frontend Display (2-3 hours)
**Goal:** Update Dashboard to use API values directly

**Tasks:**
- Update `Dashboard.tsx` to fetch and display API fields
- Replace calculation logic with API field access
- Add refresh button
- Add loading/error states
- Remove local calculation calls (keep functions in codebase temporarily)

**Testing:**
- Heat map displays correctly
- Refresh button works
- Never-trained muscles show "Never trained"

### Phase 4: Workout Integration (2 hours)
**Goal:** Update workout save flow to use new API structure

**Tasks:**
- Update `App.tsx` workout save logic
- Use `initial_fatigue_percent` instead of `fatiguePercentage`
- Refetch muscle states after workout save

**Testing:**
- Workout saves successfully
- Heat map reflects new workout
- PRs still work

### Phase 5: Cleanup & Polish (1-2 hours)
**Goal:** Remove all remaining frontend calculation logic

**Tasks:**
- Update remaining components (Workout.tsx, WorkoutSummaryModal.tsx)
- Remove deprecated calculation functions
- Remove old TypeScript types
- Search codebase to verify no calculation logic remains
- Update documentation

**Testing:**
- Full end-to-end workflow works
- No calculation logic in frontend

---

## 🔄 Migration Strategy

**Approach:** Fresh start (data wipe)

**Justification:**
- Only test data exists currently (2 workouts)
- User approved data wipe
- Simpler than migration script
- Reduces risk of migration bugs

**Procedure:**
```sql
-- Drop and recreate muscle_states table
DROP TABLE IF EXISTS muscle_states;

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

CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);

-- Re-initialize 13 muscle groups for default user
INSERT INTO muscle_states (user_id, muscle_name) VALUES
  (1, 'Pectoralis'), (1, 'Triceps'), (1, 'Deltoids'),
  (1, 'Lats'), (1, 'Biceps'), (1, 'Rhomboids'),
  (1, 'Trapezius'), (1, 'Forearms'), (1, 'Quadriceps'),
  (1, 'Glutes'), (1, 'Hamstrings'), (1, 'Calves'), (1, 'Core');
```

**Execution:**
```bash
docker-compose down
docker-compose up -d backend
docker-compose exec backend node database/run-migration.js migrations/002_refactor_muscle_states.sql
docker-compose down && docker-compose up
```

---

## ⚠️ Risks & Mitigation

### High-Priority Risks

1. **Null Handling for Never-Trained Muscles**
   - **Risk:** Division by zero, NaN values
   - **Mitigation:** Explicit null checks with ternary operators

2. **Time Zone Inconsistencies**
   - **Risk:** Wrong elapsed time calculations
   - **Mitigation:** Always use `new Date().toISOString()` (UTC)

3. **Incomplete Component Updates**
   - **Risk:** Fix Dashboard but miss other components
   - **Mitigation:** Grep for all muscle state usage, systematic component list

4. **Docker Container Caching**
   - **Risk:** Old schema cached in container
   - **Mitigation:** `docker-compose down -v && docker-compose build --no-cache`

### Medium-Priority Risks

5. **Floating Point Rounding**
   - **Risk:** Display shows "25.500000001%"
   - **Mitigation:** `Math.round(value * 10) / 10`

6. **Validation Gaps**
   - **Risk:** Backend returns nonsensical values
   - **Mitigation:** Bounds checking on all calculated values

---

## 🔙 Rollback Plan

### Quick Rollback
```bash
git log --oneline  # Find commit e2f67b4
git reset --hard e2f67b4
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Phase-Specific Rollback
- Phase 1 failure → `git revert <backend-commit>` + restart backend
- Phase 3 failure → `git revert <dashboard-commit>` + `npm run dev`

---

## 📚 Dependencies

**Blocked By:** None (can start immediately)

**Blocks:** None (fully independent change)

**Related Changes:**
- Future: Non-linear recovery curves (V2)
- Future: Muscle-specific recovery rates (V2)
- Future: Personalized baselines (V2)

---

## 📖 References

- **Architecture Doc:** `docs/ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md` (v1.1)
- **Current ERD:** `DATA_MODEL_ERD.md`
- **Post-Refactor ERD:** `DATA_MODEL_ERD_POST_REFACTOR.md`
- **Project Spec:** `openspec/project.md`

---

## 🤔 Open Questions

1. **Migration Timing:** Should we create migration as part of Phase 1 or as separate pre-work?
   - **Recommendation:** Part of Phase 1 (keeps related work together)

2. **Frontend Refresh Strategy:** Auto-refresh on mount only, or add periodic polling?
   - **Recommendation:** Auto-refresh on mount + manual button (YAGNI for polling)

3. **Cache Layer:** Should backend cache calculated muscle states?
   - **Recommendation:** No caching in V1 (premature optimization, <50ms response time)

---

## ✅ Approval Checklist

- [ ] Architecture reviewed and approved
- [ ] Migration strategy approved (data wipe acceptable)
- [ ] Phase breakdown makes sense
- [ ] Risk mitigation strategies adequate
- [ ] Rollback plan clear
- [ ] All open questions resolved

---

**Next Steps:**
1. Review this proposal with stakeholder
2. Get approval to proceed
3. Create spec deltas for each capability
4. Create tasks.md with detailed implementation steps
5. Begin Phase 1 implementation

---

*Proposal v1.0 - 2025-10-25*
