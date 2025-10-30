# to-failure-boolean-fix Specification

## Purpose

Fix critical data corruption bug where `to_failure` flag is always set to `1` (true) regardless of actual user input, making the flag completely useless and corrupting all historical workout data.

---

## Problem Statement

**Location:** `backend/database/database.ts:443`

**Current Code:**
```typescript
set.to_failure ? 1 : 1  // Default to 1 (true) for backward compatibility
```

**The Bug:**
Both branches of the ternary operator return `1`, so the result is ALWAYS `1` regardless of the value of `set.to_failure`.

**Correct Code:**
```typescript
set.to_failure ? 1 : 0  // Convert boolean to integer (1 for true, 0 for false)
```

**Impact:**
- Every set in the database has `to_failure = 1` (true)
- PR detection cannot distinguish between failure sets and non-failure sets
- Progression analysis assumes every set went to failure
- Volume calculations based on failure status are wrong
- Users cannot track which sets were actually to failure

---

## MODIFIED Requirements

### Requirement: Correctly Store Boolean to_failure Flag

**Description:** System SHALL correctly convert the JavaScript boolean `set.to_failure` to a SQLite integer (0 or 1) when inserting exercise sets.

**Changes from Current (Broken) Behavior:**
- **REMOVED**: Always returning 1 regardless of input
- **ADDED**: Ternary operator with different values for true/false branches

**Acceptance Criteria:**
- When `set.to_failure === true`, store `1` in database
- When `set.to_failure === false`, store `0` in database
- When `set.to_failure === undefined/null`, store `0` (default to false)
- Database column remains INTEGER type (no schema change needed)

#### Scenario: User marks set as to failure

**Given:** User logs set: "Bench Press 100 lbs × 10 reps"
**And:** User checks "To Failure" checkbox in UI
**And:** Frontend sends `set.to_failure = true`
**When:** Backend saves set to database
**Then:** `exercise_sets.to_failure` column stores `1`
**And:** Future queries reading this set see `to_failure = 1`

#### Scenario: User does NOT mark set as to failure

**Given:** User logs set: "Bench Press 100 lbs × 10 reps"
**And:** User does NOT check "To Failure" checkbox
**And:** Frontend sends `set.to_failure = false`
**When:** Backend saves set to database
**Then:** `exercise_sets.to_failure` column stores `0`
**And:** Future queries reading this set see `to_failure = 0`

#### Scenario: to_failure flag is undefined (backward compatibility)

**Given:** Old frontend or API client doesn't send `to_failure` field
**And:** `set.to_failure === undefined`
**When:** Backend saves set to database
**Then:** `exercise_sets.to_failure` column stores `0` (default to false)
**And:** No error occurs
**And:** Backward compatible with older code

---

### Requirement: Preserve Existing PR Detection Logic

**Description:** System SHALL continue using `to_failure` flag for PR detection without modifications, ensuring PRs are detected only on actual failure sets once data is corrected.

**Acceptance Criteria:**
- PR detection query continues to filter `WHERE to_failure = 1`
- No changes needed to PR detection logic
- Once bug is fixed, new PRs detected only on genuine failure sets
- Historical PRs remain unchanged (already stored)

#### Scenario: PR detected on genuine failure set (after fix)

**Given:** User's previous best: Bench Press 95 lbs × 10 reps
**When:** User logs: Bench Press 100 lbs × 10 reps with `to_failure = true`
**Then:** Backend detects PR because weight increased AND set went to failure
**And:** PR stored in database with correct `to_failure = 1`

#### Scenario: No PR detected on non-failure set (after fix)

**Given:** User's previous best: Bench Press 95 lbs × 10 reps (to failure)
**When:** User logs: Bench Press 100 lbs × 10 reps with `to_failure = false`
**Then:** Backend does NOT detect PR (set didn't go to failure)
**And:** Non-failure sets excluded from PR calculations

---

## Implementation Notes

### Code Change Required

**File:** `backend/database/database.ts`
**Line:** 443

**Current (Broken):**
```typescript
db.prepare(`
  INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  workoutId,
  exerciseEntry.exercise,
  set.weight,
  set.reps,
  globalSetNumber,
  set.to_failure ? 1 : 1 // ❌ BUG: Always 1
);
```

**Corrected:**
```typescript
db.prepare(`
  INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  workoutId,
  exerciseEntry.exercise,
  set.weight,
  set.reps,
  globalSetNumber,
  set.to_failure ? 1 : 0 // ✅ FIXED: 1 for true, 0 for false
);
```

**Comment Update:**
```typescript
// Convert boolean to SQLite integer: 1 for true (failure), 0 for false (non-failure)
set.to_failure ? 1 : 0
```

### No Schema Changes Needed

Database schema already correct:
```sql
to_failure INTEGER NOT NULL DEFAULT 0
```

Column accepts 0 or 1, defaults to 0 (false). No migration needed for schema.

---

## Test Updates Required

### New Test Cases to Add

**Test 1: Verify true converts to 1**
```typescript
test('saves to_failure=true as 1 in database', async () => {
  const workout = createWorkout([
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: true }
  ]);

  const saved = await db.saveWorkout(workout);
  const sets = db.getSetsForWorkout(saved.workoutId);

  expect(sets[0].to_failure).toBe(1);
});
```

**Test 2: Verify false converts to 0**
```typescript
test('saves to_failure=false as 0 in database', async () => {
  const workout = createWorkout([
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: false }
  ]);

  const saved = await db.saveWorkout(workout);
  const sets = db.getSetsForWorkout(saved.workoutId);

  expect(sets[0].to_failure).toBe(0);
});
```

**Test 3: Verify undefined defaults to 0**
```typescript
test('saves to_failure=undefined as 0 (backward compatibility)', async () => {
  const workout = createWorkout([
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: undefined }
  ]);

  const saved = await db.saveWorkout(workout);
  const sets = db.getSetsForWorkout(saved.workoutId);

  expect(sets[0].to_failure).toBe(0);
});
```

**Test 4: Mixed sets in same workout**
```typescript
test('correctly handles mixed to_failure values in same workout', async () => {
  const workout = createWorkout([
    { exercise: 'Bench Press', weight: 100, reps: 10, to_failure: false },
    { exercise: 'Bench Press', weight: 100, reps: 9, to_failure: false },
    { exercise: 'Bench Press', weight: 100, reps: 8, to_failure: true }
  ]);

  const saved = await db.saveWorkout(workout);
  const sets = db.getSetsForWorkout(saved.workoutId);

  expect(sets[0].to_failure).toBe(0); // First set
  expect(sets[1].to_failure).toBe(0); // Second set
  expect(sets[2].to_failure).toBe(1); // Third set (failure)
});
```

---

## Data Migration Considerations

### Historical Data Corruption

**Problem:** All existing sets in database have `to_failure = 1` due to the bug.

**Scope:** Every workout saved since the bug was introduced has corrupted data.

**Options:**

#### Option 1: Accept Data Loss (RECOMMENDED)

**Approach:**
- Fix code going forward
- Leave historical data as-is
- Document that historical `to_failure` data is unreliable

**Rationale:**
- Cannot reliably determine which historical sets were actually to failure
- Risk of making data worse with incorrect heuristics
- Users can still use app normally with corrected future data

**Documentation Required:**
```typescript
// NOTE: Historical data before [FIX DATE] has all to_failure=1 due to bug.
// Do not rely on to_failure flag for historical analysis prior to this date.
```

---

#### Option 2: Heuristic Correction (NOT RECOMMENDED)

**Approach:**
- Attempt to infer which sets were NOT to failure
- Apply heuristic patterns to historical data
- Mark likely non-failure sets as `to_failure = 0`

**Heuristic Pattern:**
```sql
-- If set is NOT the last set in an exercise sequence AND
-- next set has fewer reps (progressive fatigue pattern)
-- then current set was probably NOT to failure

UPDATE exercise_sets AS current
SET to_failure = 0
WHERE current.set_number < (
  SELECT MAX(set_number)
  FROM exercise_sets
  WHERE workout_exercise_id = current.workout_exercise_id
)
AND current.reps > (
  SELECT next.reps
  FROM exercise_sets AS next
  WHERE next.workout_exercise_id = current.workout_exercise_id
  AND next.set_number = current.set_number + 1
);
```

**Problems:**
- Heuristic may be wrong (user could have rested and done more reps)
- Could mark actual failure sets as non-failure
- Complex query, risk of bugs
- Cannot verify accuracy

**Recommendation:** DO NOT ATTEMPT - too risky

---

#### Option 3: User-Driven Correction

**Approach:**
- Provide UI for users to review historical workouts
- Let user manually mark which sets were to failure
- Store corrections in database

**Problems:**
- Massive UX burden (hundreds of sets to review)
- Users may not remember
- Implementation effort too high for questionable benefit

**Recommendation:** DO NOT IMPLEMENT

---

## Breaking Changes

### None (Technically)

**Why No Breaking Change:**
- Database schema unchanged (column already exists as INTEGER)
- API contract unchanged (still accepts boolean)
- Frontend unchanged (still sends boolean)

**However:**
- Historical data is corrupted and cannot be reliably corrected
- Any analytics/features depending on `to_failure` flag from historical data will give wrong results
- Future PR detection will work correctly, historical PRs unaffected (already stored)

---

## Validation Checklist

- [ ] Code change applied (line 443)
- [ ] Comment updated to explain boolean→integer conversion
- [ ] Test 1 passes: `to_failure=true` stores as 1
- [ ] Test 2 passes: `to_failure=false` stores as 0
- [ ] Test 3 passes: `to_failure=undefined` stores as 0
- [ ] Test 4 passes: Mixed values in same workout
- [ ] Manual test: Save workout with mix of failure/non-failure sets
- [ ] Verify: Query `SELECT * FROM exercise_sets` shows mix of 0 and 1 values
- [ ] Verify: PR detection still works (only on to_failure=1 sets)
- [ ] Document: Historical data unreliable before fix date

---

## Rollback Plan

If issues discovered after deployment:

1. **Immediate:** Revert code change to previous version
2. **Database:** No rollback needed (schema unchanged)
3. **Data:** New data written with bug restored (returns to broken state)
4. **Investigation:** Analyze what went wrong
5. **Re-attempt:** Fix issues and re-deploy

---

## Related Specifications

- `fix-critical-data-bugs` - Parent proposal
- `pr-detection-and-celebration` - Uses `to_failure` flag (unchanged)
- `baseline-learning-accuracy` - May use `to_failure` flag in future (currently doesn't)

---

## Success Criteria

- [ ] Boolean `true` correctly stores as `1` in database
- [ ] Boolean `false` correctly stores as `0` in database
- [ ] Undefined/null values default to `0`
- [ ] New workouts have accurate `to_failure` data
- [ ] PR detection continues working on new data
- [ ] Historical data documented as unreliable
- [ ] All tests passing
- [ ] No regressions in existing features
