# Proposal: Fix Critical Data Bugs

**Change ID:** `fix-critical-data-bugs`
**Status:** Draft
**Created:** 2025-10-29
**Author:** System

---

## Problem Statement

During investigation of the baseline learning system, several critical data integrity bugs were discovered that silently corrupt user data:

### Bug 1: `to_failure` Default Always True (CRITICAL)

**Location:** `backend/database/database.ts:443`

**Current Code:**
```typescript
set.to_failure ? 1 : 1  // Default to 1 (true) for backward compatibility
```

**Impact:**
- EVERY set is marked as "to failure" regardless of actual user input
- The ternary operator always returns 1 (true) because both branches are identical
- Should be: `set.to_failure ? 1 : 0`
- This bug makes the `to_failure` flag completely useless
- Breaks PR detection, progression analysis, and any feature depending on accurate failure tracking

**Evidence:**
The code comment says "Default to 1 for backward compatibility" but the logic is clearly wrong - it should only default to 1 when `set.to_failure` is undefined/null, not when it's explicitly false.

---

### Bug 2: `volume_today` Never Updated (MODERATE)

**Location:** `backend/database/database.ts` (multiple locations)

**Current Behavior:**
- `volume_today` column exists in `muscle_states` table
- Initialized to 0 when muscle state is created (line 270)
- Read from database and returned in API responses (lines 317, 1709, 1757)
- **NEVER updated** after initialization

**Impact:**
- Vestigial column that serves no purpose
- Takes up database space
- Could confuse future developers
- If fatigue system was designed to use this, it's broken

**Why This Exists:**
The fatigue system is actually functional - it calculates fatigue in the **frontend** (App.tsx:80) using the workout volume directly, not the `volume_today` column. The column appears to be leftover from an earlier design.

---

### Bug 3: Frontend-Backend Baseline Update Race Condition (CRITICAL)

**Location:** `App.tsx:88` vs `backend/database/database.ts:450`

**Current Behavior:**

**Frontend (CORRECT logic):**
```typescript
// App.tsx lines 76-88
Object.entries(workoutMuscleVolumes).forEach(([muscleStr, volume]) => {
  const muscle = muscleStr as Muscle;
  const baseline = newBaselines[muscle]?.userOverride || newBaselines[muscle]?.systemLearnedMax || 10000;
  const fatiguePercent = Math.min((volume / baseline) * 100, 100);
  muscleFatigue[muscle] = fatiguePercent;

  if (volume > (newBaselines[muscle]?.systemLearnedMax || 0)) {
    newBaselines[muscle].systemLearnedMax = Math.round(volume);
  }
});
await setMuscleBaselines(newBaselines); // Updates via PUT /muscle-baselines
```
- ✅ Processes ALL sets (calculates total volume in lines 63-71)
- ✅ Uses SUM of all set volumes
- ✅ Updates baseline when total volume > current baseline

**Backend (BROKEN logic):**
```typescript
// database.ts lines 504-542
const failureSets = db.prepare(`
  SELECT exercise_name, weight, reps
  FROM exercise_sets
  WHERE workout_id = ? AND to_failure = 1  // ❌ Only failure sets
`).all(workoutId);

for (const set of failureSets) {
  // ...
  if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
    muscleVolumes[muscleName] = muscleVolume;  // ❌ MAX not SUM
  }
}
```
- ❌ Only processes sets with `to_failure = 1`
- ❌ Tracks MAX single-set volume, not session total
- ❌ Runs AFTER frontend update, OVERWRITES correct values

**Execution Order:**
1. Frontend calculates baseline update (CORRECT - SUM of ALL sets)
2. Frontend sends `PUT /muscle-baselines` with correct values
3. Workout saved via `workoutsAPI.create()`
4. Backend `learnMuscleBaselinesFromWorkout()` runs (BROKEN - MAX of failure sets)
5. Backend OVERWRITES frontend's correct values with broken values

**Result:** The correct frontend logic is sabotaged by the broken backend logic!

---

## Proposed Solution

### Fix 1: Correct `to_failure` Ternary (IMMEDIATE)

**Change:**
```typescript
// Line 443
set.to_failure ? 1 : 0  // Convert boolean to 0/1
```

**Impact:**
- Zero breaking changes
- Fixes data corruption going forward
- Historical data already corrupted (all sets marked to_failure=1)
- May need data migration to clean up historical records

---

### Fix 2: Remove `volume_today` Column (DEFERRED)

**Recommendation:** Do NOT fix immediately - investigate first

**Options:**
1. **Remove column** - If truly unused, drop it from schema
2. **Implement feature** - If it was meant to be used, implement volume tracking
3. **Leave as-is** - If removal is risky, document as unused

**Decision:** Defer to separate investigation/proposal

---

### Fix 3: Remove Backend Baseline Learning (IMMEDIATE)

**Rationale:**
- Frontend already does baseline learning correctly
- Backend version is broken and sabotages frontend
- No value in having two systems doing the same thing

**Change:**
```typescript
// database.ts line 449-450
// REMOVE THIS LINE:
const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);

// REMOVE from return value at line 455:
return { workoutId, updatedBaselines, prs };

// CHANGE TO:
return { workoutId, prs };
```

**Alternative:** Keep backend baseline learning but fix it per `fix-baseline-learning-logic` proposal. However, this creates redundancy - why have both?

---

## Impact Analysis

### Benefits
- ✅ **Stops active data corruption**: `to_failure` flag will work correctly
- ✅ **Preserves correct baseline learning**: Frontend logic no longer overwritten
- ✅ **Simplifies architecture**: One baseline learning system, not two

### Risks
- ⚠️ **Historical data corrupted**: All existing sets have `to_failure=1`
  - **Mitigation**: Could attempt heuristic correction (e.g., if last set has lower reps, probably was to_failure)
- ⚠️ **Baseline learning proposal conflicts**: Need to coordinate with `fix-baseline-learning-logic`
  - **Recommendation**: Fix this bug FIRST, then decide if backend baseline learning is needed

---

## Dependencies

### Blocks:
- `fix-baseline-learning-logic` - That proposal assumes backend baseline learning exists, but this proposal might remove it

### Blocked By:
- None - can be fixed independently

---

## Implementation Order

**Recommended sequence:**

1. **Fix `to_failure` bug** (1 hour)
   - Change line 443
   - Add test to verify boolean→integer conversion
   - Deploy immediately

2. **Investigate `volume_today`** (2 hours)
   - Search entire codebase for usage
   - Determine if column is truly unused
   - Create separate proposal for removal if confirmed unused

3. **Coordinate with baseline learning fix** (1 hour)
   - Decide: Remove backend baseline learning OR fix it?
   - If remove: Delete `learnMuscleBaselinesFromWorkout()` entirely
   - If fix: Implement `fix-baseline-learning-logic` changes
   - Update `fix-baseline-learning-logic` proposal accordingly

---

## Data Migration Considerations

### `to_failure` Historical Corruption

**Problem:** All existing sets have `to_failure=1` due to the bug

**Heuristic Correction Strategy:**
```sql
-- Identify likely non-failure sets:
-- If set is NOT the last set in exercise AND
-- next set has lower reps (progressive fatigue pattern)
-- then current set was probably NOT to failure

UPDATE exercise_sets
SET to_failure = 0
WHERE set_number < (
  SELECT MAX(set_number)
  FROM exercise_sets es2
  WHERE es2.workout_exercise_id = exercise_sets.workout_exercise_id
);
```

**Risk:** Heuristic may be wrong - could mark actual failure sets as non-failure

**Recommendation:** Accept data loss, fix going forward, don't attempt correction

---

## Success Criteria

1. `to_failure` flag correctly stores false values as 0, true values as 1
2. Tests confirm boolean→integer conversion works
3. New workouts have accurate `to_failure` data
4. Baseline learning no longer has race condition between frontend/backend
5. Decision made on backend baseline learning (keep and fix OR remove entirely)

---

## Open Questions

1. Should we attempt to correct historical `to_failure` data using heuristics?
   - **Recommendation**: NO - risk of making it worse

2. Should we keep backend baseline learning at all?
   - **Option A**: Remove it entirely (frontend is sufficient)
   - **Option B**: Fix it per `fix-baseline-learning-logic` and remove frontend version
   - **Recommendation**: Option A - frontend works, backend is broken, keep what works

3. What is `volume_today` supposed to do?
   - **Recommendation**: Investigate separately before removing

---

## Estimated Effort

- **Bug 1 Fix**: 1 hour (change code, add test, deploy)
- **Bug 2 Investigation**: 2 hours (comprehensive search, decision)
- **Bug 3 Fix**: 1 hour (remove backend baseline learning)
- **Coordination**: 1 hour (update `fix-baseline-learning-logic` proposal)
- **Total**: 5 hours

---

## References

- Discovery: Sequential thinking analysis of baseline learning system
- Related Proposal: `fix-baseline-learning-logic`
- Affected Files:
  - `backend/database/database.ts` (all three bugs)
  - `App.tsx` (baseline learning frontend logic)
