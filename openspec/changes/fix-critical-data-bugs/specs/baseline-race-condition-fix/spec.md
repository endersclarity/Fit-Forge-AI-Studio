# baseline-race-condition-fix Specification

## Purpose

Eliminate the race condition where frontend and backend both attempt to update muscle baselines, with the broken backend logic overwriting the correct frontend calculations.

---

## Problem Statement

### Current Architecture: Two Baseline Learning Systems

**Frontend Baseline Learning** (`App.tsx:63-88`)
- ✅ Calculates total session volume from ALL sets
- ✅ Uses SUM aggregation (adds all set volumes)
- ✅ Compares total volume to baseline
- ✅ Updates baseline if total > current
- **Runs FIRST** when workout is finished

**Backend Baseline Learning** (`database.ts:502-581`)
- ❌ Processes only sets with `to_failure = 1`
- ❌ Uses MAX aggregation (highest single set)
- ❌ Ignores most of the workout data
- **Runs SECOND** when workout is saved, **OVERWRITES** frontend values

### Execution Order (The Race Condition)

```
1. User finishes workout
2. Frontend: handleFinishWorkout() runs
3. Frontend: Calculates volumes from ALL sets (lines 63-71)
   → Pectoralis: 850 + 765 + 680 + 807.5 = 3,102.5 units
4. Frontend: Updates baseline to 3,102.5 (line 88)
   → Sends PUT /muscle-baselines with correct value
5. Frontend: Calls workoutsAPI.create() (line 163)
6. Backend: saveWorkout() runs in database.ts
7. Backend: Inserts workout and sets into database
8. Backend: learnMuscleBaselinesFromWorkout() runs (line 450)
   → Only processes to_failure sets
   → Uses MAX: Pectoralis gets 807.5 (highest single set)
   → Updates baseline to 807.5 (WRONG!)
9. Result: Correct value (3,102.5) overwritten with wrong value (807.5)
```

**Outcome:** Backend sabotages frontend's correct calculations.

---

## Root Cause Analysis

### Why Do We Have Two Systems?

**Historical Evidence:**
- Frontend implementation suggests earlier design without backend learning
- Backend implementation added later, possibly as "improvement"
- No coordination between the two implementations
- Different aggregation strategies (SUM vs MAX) suggest different understanding of requirements

### Why Does Backend Win?

**Timing:**
- Frontend updates baselines via PUT /muscle-baselines (async)
- Workout save happens immediately after (async)
- Backend baseline learning runs **inside** the workout save transaction
- Backend write happens chronologically after frontend write
- **Last write wins** - database contains backend's incorrect values

---

## Proposed Solution

### Option 1: Remove Backend Baseline Learning (RECOMMENDED)

**Approach:**
- Delete `learnMuscleBaselinesFromWorkout()` function
- Remove call at line 450 in `saveWorkout()`
- Remove from return value (line 455)
- Keep frontend baseline learning as-is

**Rationale:**
1. **Frontend logic is correct** - Uses SUM of ALL sets
2. **Backend logic is broken** - Uses MAX of failure sets only
3. **No value in redundancy** - Why have two systems doing same thing?
4. **Frontend is sufficient** - Already works correctly

**Code Changes:**
```typescript
// database.ts line 449-455
// REMOVE these lines:
const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);
// ...
return { workoutId, updatedBaselines, prs };

// CHANGE TO:
return { workoutId, prs };

// DELETE entire function (lines 502-581):
function learnMuscleBaselinesFromWorkout(workoutId: number): BaselineUpdate[] {
  // ... DELETE ALL THIS CODE
}
```

**Benefits:**
- ✅ Eliminates race condition
- ✅ Preserves correct frontend logic
- ✅ Simplifies architecture (one system, not two)
- ✅ Removes 80 lines of broken code

**Risks:**
- ⚠️ Removes backend toast notification about baseline updates
  - **Mitigation:** Frontend already shows toast (App.tsx:85)
- ⚠️ Removes `updated_baselines` from API response
  - **Impact:** Frontend displays notification (line 172-175) - will need update

---

### Option 2: Fix Backend, Remove Frontend (ALTERNATIVE)

**Approach:**
- Implement `fix-baseline-learning-logic` proposal in backend
- Remove baseline learning from frontend `handleFinishWorkout()`
- Backend becomes single source of truth

**Code Changes:**
1. **Backend:** Apply `fix-baseline-learning-logic` fixes
   - Remove `to_failure` filter
   - Change MAX to SUM aggregation
2. **Frontend:** Remove lines 73-88 from `App.tsx`
   - Delete volume calculation
   - Delete baseline update logic
   - Keep fatigue calculation (uses baseline, doesn't update it)

**Benefits:**
- ✅ Centralizes logic in backend (single source of truth)
- ✅ Frontend lighter (less business logic)
- ✅ Baseline learning in transaction with workout save (atomic)

**Risks:**
- ⚠️ More complex implementation (two changes, not one)
- ⚠️ Frontend loses immediate feedback (waits for backend response)
- ⚠️ Requires coordination with `fix-baseline-learning-logic` proposal

---

### Option 3: Keep Both, Add Coordination (NOT RECOMMENDED)

**Approach:**
- Frontend checks if backend will update baselines
- If yes, skip frontend update
- If no, do frontend update

**Problems:**
- ❌ Still two systems (complex maintenance)
- ❌ Race conditions still possible
- ❌ Doesn't fix the underlying broken backend logic
- ❌ Adds coordination complexity for no benefit

---

## Recommendation

**Option 1: Remove Backend Baseline Learning**

**Justification:**
1. **Frontend works** - Logic is correct, tested, and deployed
2. **Backend broken** - Would need fixes from `fix-baseline-learning-logic` proposal
3. **Simpler is better** - One system easier than two coordinated systems
4. **Faster implementation** - Just delete code, don't rewrite it

**Coordination with Other Proposals:**
- If we remove backend baseline learning, the `fix-baseline-learning-logic` proposal becomes **OBSOLETE**
- That proposal can be marked as "Superseded by baseline-race-condition-fix"
- Or: Keep it as documentation of what the fix WOULD have been

---

## Implementation Requirements

### Requirement: Remove Backend Baseline Learning

**Description:** System SHALL remove the backend baseline learning function and all calls to it, relying solely on frontend baseline updates.

**Acceptance Criteria:**
- `learnMuscleBaselinesFromWorkout()` function deleted from codebase
- Call at line 450 removed
- `updatedBaselines` removed from return value
- Workout save still works correctly
- Frontend baseline learning continues functioning

#### Scenario: Workout saved without backend baseline interference

**Given:** Frontend has updated baselines to correct values
**And:** Pectoralis baseline set to 3,102.5 (total session volume)
**When:** Workout is saved via `workoutsAPI.create()`
**Then:** Backend saves workout and sets to database
**And:** Backend does NOT call `learnMuscleBaselinesFromWorkout()`
**And:** Pectoralis baseline remains 3,102.5 (not overwritten)
**And:** Workout save completes successfully

#### Scenario: Frontend continues to update baselines correctly

**Given:** User completes workout with 3 sets totaling 2,550 units
**And:** Current Pectoralis baseline is 1,000 units
**When:** Frontend `handleFinishWorkout()` runs
**Then:** Frontend calculates total volume: 2,550 units
**And:** Frontend compares to baseline: 2,550 > 1,000
**And:** Frontend updates baseline via PUT /muscle-baselines
**And:** Baseline stored as 2,550
**And:** No backend code overwrites this value

---

### Requirement: Update Frontend API Response Handling

**Description:** System SHALL update frontend code to handle workout save response without `updated_baselines` field.

**Current Code** (`App.tsx:172-175`):
```typescript
if (savedWorkout.updated_baselines && savedWorkout.updated_baselines.length > 0) {
  const muscleNames = savedWorkout.updated_baselines.map(u => u.muscle).join(', ');
  setToastMessage(`🤖 Muscle capacity updated for ...`);
}
```

**Problem:** Backend won't return `updated_baselines` anymore

**Solution:** Frontend already shows baseline update toast at line 85:
```typescript
if (volume > (newBaselines[muscle]?.systemLearnedMax || 0)) {
  newBaselines[muscle].systemLearnedMax = Math.round(volume);
  setToastMessage(`New ${muscle} max: ${Math.round(volume).toLocaleString()} lbs!`);
}
```

**Action:** Remove lines 172-175 (redundant toast, frontend already shows it)

---

## Breaking Changes

### API Response Change

**Before:**
```json
{
  "workoutId": 123,
  "updated_baselines": [
    { "muscle": "Pectoralis", "oldMax": 1000, "newMax": 2550 }
  ],
  "prs": []
}
```

**After:**
```json
{
  "workoutId": 123,
  "prs": []
}
```

**Impact:**
- Frontend code at lines 172-175 will fail if not updated
- Any external API consumers reading `updated_baselines` will break
- Mobile app (if exists) may expect this field

**Mitigation:**
- Update frontend code before deploying backend change
- Document API change in CHANGELOG
- Search for all references to `updated_baselines` in codebase

---

## Code Changes Required

### Change 1: Remove Backend Function

**File:** `backend/database/database.ts`

**Delete lines 502-581:**
```typescript
function learnMuscleBaselinesFromWorkout(workoutId: number): BaselineUpdate[] {
  // DELETE ENTIRE FUNCTION
}
```

**Update `rebuildMuscleBaselines()` function:**
Current function may call `learnMuscleBaselinesFromWorkout()` internally. Search and remove any references.

---

### Change 2: Remove Function Call

**File:** `backend/database/database.ts`
**Line:** 450

**Current:**
```typescript
const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);
const prs = detectPRsForWorkout(workoutId);
return { workoutId, updatedBaselines, prs };
```

**After:**
```typescript
const prs = detectPRsForWorkout(workoutId);
return { workoutId, prs };
```

---

### Change 3: Update TypeScript Return Type

**File:** `backend/database/database.ts` (function signature)

**Current:**
```typescript
function saveWorkout(...): { workoutId: number; updatedBaselines: BaselineUpdate[]; prs: PRInfo[] }
```

**After:**
```typescript
function saveWorkout(...): { workoutId: number; prs: PRInfo[] }
```

**Also Update:** `backend/types.ts` if `WorkoutSaveResponse` type exists

---

### Change 4: Update Frontend Response Handling

**File:** `App.tsx`
**Line:** 172-175

**DELETE these lines:**
```typescript
if (savedWorkout.updated_baselines && savedWorkout.updated_baselines.length > 0) {
  const muscleNames = savedWorkout.updated_baselines.map(u => u.muscle).join(', ');
  setToastMessage(`🤖 Muscle capacity updated for ${savedWorkout.updated_baselines.length} muscle${savedWorkout.updated_baselines.length > 1 ? 's' : ''}: ${muscleNames}`);
}
```

**Rationale:** Frontend already shows baseline update toast at line 85

---

## Test Updates Required

### Remove Tests for Backend Baseline Learning

**Search for tests containing:**
- `learnMuscleBaselinesFromWorkout`
- `updated_baselines`
- Backend baseline learning scenarios

**Action:** Delete obsolete tests

---

### Add Test for No Backend Baseline Update

**New Test:**
```typescript
test('saveWorkout does not update baselines (frontend responsibility)', async () => {
  // Setup: Set current baseline
  await db.updateMuscleBaselines({ Pectoralis: { systemLearnedMax: 1000 } });

  // Save workout with higher volume
  const workout = createWorkout([
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: true },
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: false },
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: false }
  ]);

  const result = await db.saveWorkout(workout);

  // Verify: Backend did NOT update baseline
  const baselines = await db.getMuscleBaselines();
  expect(baselines.Pectoralis.systemLearnedMax).toBe(1000); // Unchanged

  // Verify: Response does not include updated_baselines
  expect(result.updated_baselines).toBeUndefined();
});
```

---

## Validation Checklist

- [ ] `learnMuscleBaselinesFromWorkout()` function deleted
- [ ] All calls to function removed
- [ ] Return type updated (removed `updatedBaselines`)
- [ ] Frontend toast code removed (lines 172-175)
- [ ] Frontend baseline learning still works
- [ ] Workout save completes successfully
- [ ] Baselines update correctly from frontend
- [ ] Backend does NOT overwrite frontend values
- [ ] All tests passing
- [ ] No references to `updated_baselines` in codebase (except types cleanup)

---

## Related Specifications

- `fix-critical-data-bugs` - Parent proposal
- `fix-baseline-learning-logic` - **OBSOLETE** if this approach is taken
- `baseline-learning-accuracy` - May need update to reflect frontend-only approach

---

## Success Criteria

- [ ] Race condition eliminated
- [ ] Frontend baseline learning works correctly
- [ ] Backend does not interfere with baseline updates
- [ ] Workouts save successfully without baseline learning
- [ ] No regressions in existing features
- [ ] API response updated (no `updated_baselines` field)
- [ ] Frontend handles new response format
- [ ] All tests passing
