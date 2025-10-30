# Implementation Tasks: Fix Database Architecture Integrity

**Change ID:** `fix-database-architecture-integrity`
**Estimated Total Time:** 8-12 hours

---

## Phase 1: Schema Constraints (2-3 hours)

### Task 1.1: Add CHECK Constraints to Schema
**Estimated Time:** 45 minutes
**Files:** `backend/database/schema.sql`

Add database-level constraints:
```sql
-- Muscle states fatigue validation
ALTER TABLE muscle_states
ADD CONSTRAINT chk_fatigue_range
CHECK (initial_fatigue_percent >= 0 AND initial_fatigue_percent <= 100);

-- Exercise sets weight validation
ALTER TABLE exercise_sets
ADD CONSTRAINT chk_weight_range
CHECK (weight >= 0 AND weight <= 10000);

-- Exercise sets reps validation
ALTER TABLE exercise_sets
ADD CONSTRAINT chk_reps_range
CHECK (reps > 0 AND reps <= 1000);

-- Muscle baselines positive validation
ALTER TABLE muscle_baselines
ADD CONSTRAINT chk_baseline_positive
CHECK (system_learned_max > 0);
```

**Validation:**
- Attempt to insert invalid data (negative fatigue, zero reps, etc.)
- Verify constraint violations are raised
- Test boundary values (0, 100, 10000, etc.)

---

### Task 1.2: Create Data Validation Migration Script
**Estimated Time:** 1 hour
**Files:** New file `backend/database/migrations/009_add_integrity_constraints.sql`

Create migration that:
1. Validates existing data meets new constraints
2. Reports any violations to console
3. Provides option to clean violations
4. Applies constraints
5. Tests constraints work correctly

**Validation:**
- Run migration on test database with invalid data
- Verify violations are detected and reported
- Verify clean option fixes violations
- Verify constraints are applied successfully

---

### Task 1.3: Remove volume_today Column
**Estimated Time:** 30 minutes
**Files:** `backend/database/schema.sql`, migration script

Add to migration script:
```sql
-- Remove redundant volume_today column
ALTER TABLE muscle_states DROP COLUMN volume_today;
```

Update any code that references `volume_today`:
- `backend/database/database.ts` - Remove from queries
- Update TypeScript types if needed

**Validation:**
- Query muscle_states after migration, verify column is gone
- Verify existing muscle state data is intact
- Test workout save still works without volume_today

---

### Task 1.4: Add Application-Level Validation
**Estimated Time:** 45 minutes
**Files:** `backend/database/database.ts`

Add validation to `updateMuscleStates()`:
```typescript
function updateMuscleStates(states: MuscleStatesUpdateRequest): MuscleStatesResponse {
  // Validate all inputs before database operation
  for (const [muscleName, state] of Object.entries(states)) {
    if (state.initial_fatigue_percent < 0 || state.initial_fatigue_percent > 100) {
      throw new Error(`Invalid fatigue for ${muscleName}: ${state.initial_fatigue_percent}. Must be 0-100.`);
    }
  }
  // ... rest of function
}
```

**Validation:**
- Call `updateMuscleStates()` with invalid data
- Verify descriptive error is thrown
- Verify no database operation is attempted

---

## Phase 2: State Recalculation Functions (3-4 hours)

### Task 2.1: Implement rebuildMuscleBaselines()
**Estimated Time:** 1.5 hours
**Files:** `backend/database/database.ts`

```typescript
function rebuildMuscleBaselines(): BaselineUpdate[] {
  const rebuildTransaction = db.transaction(() => {
    // 1. Query all to_failure sets
    const failureSets = db.prepare(`
      SELECT es.exercise_name, es.weight, es.reps
      FROM exercise_sets es
      WHERE es.to_failure = 1
    `).all();

    // 2. Calculate max volume per muscle
    const muscleVolumes: Record<string, number> = {};
    for (const set of failureSets) {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);
      if (!exercise) continue;

      const volume = set.weight * set.reps;
      const calibrations = getExerciseCalibrations(exercise.id);

      for (const engagement of calibrations.engagements) {
        const muscleVolume = volume * (engagement.percentage / 100);
        const muscleName = engagement.muscle;

        if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
          muscleVolumes[muscleName] = muscleVolume;
        }
      }
    }

    // 3. Update baselines
    const updates: BaselineUpdate[] = [];
    for (const [muscleName, newMax] of Object.entries(muscleVolumes)) {
      const current = db.prepare(`
        SELECT system_learned_max FROM muscle_baselines
        WHERE user_id = 1 AND muscle_name = ?
      `).get(muscleName);

      if (current && current.system_learned_max !== newMax) {
        db.prepare(`
          UPDATE muscle_baselines
          SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = 1 AND muscle_name = ?
        `).run(newMax, muscleName);

        updates.push({
          muscle: muscleName,
          oldMax: current.system_learned_max,
          newMax
        });
      }
    }

    return updates;
  });

  return rebuildTransaction();
}
```

**Validation:**
- Test with empty database (no workouts)
- Test with single workout
- Test with 100 workouts
- Verify baselines match manual calculation
- Verify function is idempotent (run twice, same result)

---

### Task 2.2: Implement rebuildPersonalBests()
**Estimated Time:** 1.5 hours
**Files:** `backend/database/database.ts`

```typescript
function rebuildPersonalBests(): PRUpdate[] {
  const rebuildTransaction = db.transaction(() => {
    // 1. Clear existing PRs
    db.prepare('DELETE FROM personal_bests WHERE user_id = 1').run();

    // 2. Query all sets grouped by exercise
    const allSets = db.prepare(`
      SELECT es.exercise_name, es.weight, es.reps, w.id as workout_id
      FROM exercise_sets es
      JOIN workouts w ON es.workout_id = w.id
      WHERE w.user_id = 1
      ORDER BY w.date ASC
    `).all();

    // 3. Calculate PRs per exercise
    const exercisePRs: Record<string, {bestSingle: number; bestSession: number}> = {};

    for (const set of allSets) {
      const volume = set.weight * set.reps;

      if (!exercisePRs[set.exercise_name]) {
        exercisePRs[set.exercise_name] = { bestSingle: 0, bestSession: 0 };
      }

      if (volume > exercisePRs[set.exercise_name].bestSingle) {
        exercisePRs[set.exercise_name].bestSingle = volume;
      }

      // Session volume calculation would need workout grouping
      // (simplified for this example)
    }

    // 4. Insert new PRs
    const updates: PRUpdate[] = [];
    for (const [exerciseName, prs] of Object.entries(exercisePRs)) {
      db.prepare(`
        INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, updated_at)
        VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(exerciseName, prs.bestSingle, prs.bestSession);

      updates.push({
        exercise: exerciseName,
        oldBestSingleSet: null,
        newBestSingleSet: prs.bestSingle,
        oldBestSessionVolume: null,
        newBestSessionVolume: prs.bestSession
      });
    }

    return updates;
  });

  return rebuildTransaction();
}
```

**Validation:**
- Test with various workout configurations
- Verify PRs match actual max performance
- Test session volume calculation accuracy
- Verify function handles deleted exercises

---

### Task 2.3: Implement resetMuscleStatesForDate()
**Estimated Time:** 45 minutes
**Files:** `backend/database/database.ts`

```typescript
function resetMuscleStatesForDate(date: string): MuscleStateUpdate[] {
  const resetTransaction = db.transaction(() => {
    const updates: MuscleStateUpdate[] = [];

    // Find all muscles that were last trained on this date
    const affectedMuscles = db.prepare(`
      SELECT muscle_name, initial_fatigue_percent, last_trained
      FROM muscle_states
      WHERE user_id = 1 AND last_trained = ?
    `).all(date);

    for (const muscle of affectedMuscles) {
      // Find previous workout date for this muscle
      const previousWorkout = db.prepare(`
        SELECT MAX(w.date) as prev_date
        FROM workouts w
        JOIN exercise_sets es ON w.id = es.workout_id
        WHERE w.user_id = 1 AND w.date < ?
          AND es.exercise_name IN (
            SELECT name FROM exercises WHERE muscle LIKE ?
          )
      `).get(date, `%${muscle.muscle_name}%`);

      const newLastTrained = previousWorkout?.prev_date || null;
      const newFatigue = newLastTrained ? calculateFatigueFromDate(newLastTrained) : 0;

      db.prepare(`
        UPDATE muscle_states
        SET last_trained = ?, initial_fatigue_percent = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 1 AND muscle_name = ?
      `).run(newLastTrained, newFatigue, muscle.muscle_name);

      updates.push({
        muscle: muscle.muscle_name,
        oldLastTrained: muscle.last_trained,
        newLastTrained,
        oldFatigue: muscle.initial_fatigue_percent,
        newFatigue
      });
    }

    return updates;
  });

  return resetTransaction();
}
```

**Validation:**
- Test with muscle that has previous workouts
- Test with muscle that has no previous workouts
- Verify last_trained dates are correct
- Verify fatigue calculations are correct

---

### Task 2.4: Implement validateDataIntegrity()
**Estimated Time:** 30 minutes
**Files:** `backend/database/database.ts`

```typescript
function validateDataIntegrity(): {valid: boolean; issues: IntegrityIssue[]} {
  const issues: IntegrityIssue[] = [];

  // Check baseline mismatches
  // Check PR mismatches
  // Check orphaned muscle states

  return {
    valid: issues.length === 0,
    issues
  };
}
```

**Validation:**
- Create intentional mismatch, verify detection
- Test with consistent data, verify passes
- Test all issue types are detected

---

## Phase 3: Workout Deletion Handling (2-3 hours)

### Task 3.1: Implement deleteWorkoutWithRecalculation()
**Estimated Time:** 1 hour
**Files:** `backend/database/database.ts`

```typescript
function deleteWorkoutWithRecalculation(workoutId: number): DeletionResult {
  const deleteTransaction = db.transaction(() => {
    // 1. Get workout details
    const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
    if (!workout) throw new Error('NOT_FOUND');

    // 2. Count sets
    const setCount = db.prepare('SELECT COUNT(*) as count FROM exercise_sets WHERE workout_id = ?')
      .get(workoutId).count;

    // 3. Delete workout (CASCADE deletes sets)
    db.prepare('DELETE FROM workouts WHERE id = ?').run(workoutId);

    // 4. Recalculate all state
    const baselineUpdates = rebuildMuscleBaselines();
    const prUpdates = rebuildPersonalBests();
    const muscleUpdates = resetMuscleStatesForDate(workout.date);

    // 5. Log deletion
    console.log(`[${new Date().toISOString()}] WORKOUT_DELETED:`, {
      workoutId,
      date: workout.date,
      deletedSets: setCount
    });

    return {
      success: true,
      workoutId,
      deletedSets: setCount,
      affectedBaselines: baselineUpdates,
      affectedPRs: prUpdates,
      affectedMuscles: muscleUpdates.map(u => u.muscle)
    };
  });

  return deleteTransaction();
}
```

**Validation:**
- Test deletion with no dependent state
- Test deletion with PR updates
- Test deletion with baseline updates
- Test transaction rollback on error

---

### Task 3.2: Add DELETE /api/workouts/:id Endpoint
**Estimated Time:** 30 minutes
**Files:** `backend/server.ts`

```typescript
app.delete('/api/workouts/:id', (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const result = deleteWorkoutWithRecalculation(workoutId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Workout not found' });
    } else {
      console.error('Error deleting workout:', error);
      res.status(500).json({ error: 'Failed to delete workout', details: error.message });
    }
  }
});
```

**Validation:**
- Call endpoint with valid workout ID
- Call endpoint with non-existent ID (404)
- Verify response includes deletion summary

---

### Task 3.3: Add Optional Delete-Preview Endpoint
**Estimated Time:** 30 minutes
**Files:** `backend/server.ts`, `backend/database/database.ts`

```typescript
function getWorkoutDeletionPreview(workoutId: number): DeletionPreview {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  if (!workout) throw new Error('NOT_FOUND');

  // Check if workout contains PRs
  const sets = db.prepare('SELECT * FROM exercise_sets WHERE workout_id = ?').all(workoutId);
  const prs = sets.filter(set => {
    const currentPR = db.prepare(`
      SELECT best_single_set FROM personal_bests
      WHERE user_id = 1 AND exercise_name = ?
    `).get(set.exercise_name);

    return currentPR && (set.weight * set.reps) === currentPR.best_single_set;
  });

  return {
    workoutId,
    containsPRs: prs.length > 0,
    prs: prs.map(s => ({exercise: s.exercise_name, value: s.weight * s.reps})),
    warning: prs.length > 0 ? `This workout contains ${prs.length} personal records.` : null
  };
}

app.get('/api/workouts/:id/delete-preview', (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const preview = getWorkoutDeletionPreview(workoutId);
    res.json(preview);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Workout not found' });
    } else {
      res.status(500).json({ error: 'Failed to get preview' });
    }
  }
});
```

**Validation:**
- Call preview for workout with PRs
- Call preview for workout without PRs
- Verify warnings are accurate

---

## Phase 4: Transaction Expansion (1-2 hours)

### Task 4.1: Expand saveWorkout() Transaction
**Estimated Time:** 1 hour
**Files:** `backend/database/database.ts`

Refactor `saveWorkout()` to include all state updates in transaction:

```typescript
function saveWorkout(workout: WorkoutSaveRequest): WorkoutResponse {
  const saveAllTransaction = db.transaction(() => {
    // 1. Insert workout
    const result = db.prepare(`
      INSERT INTO workouts (user_id, date, category, variation, progression_method, duration_seconds)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(/* ... */);
    const workoutId = result.lastInsertRowid as number;

    // 2. Insert exercise sets
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        db.prepare(`
          INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(/* ... */);
      }
    }

    // 3. Learn baselines (NOW INSIDE TRANSACTION)
    const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);

    // 4. Detect PRs (NOW INSIDE TRANSACTION)
    const prs = detectPRsForWorkout(workoutId);

    return { workoutId, updatedBaselines, prs };
  });

  const result = saveAllTransaction();

  // Fetch and return saved workout
  const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.workoutId);
  // ... format response
}
```

**Validation:**
- Test workout save with baseline updates
- Test workout save with PR detection
- Test transaction rollback if baseline learning fails
- Test transaction rollback if PR detection fails
- Verify atomicity (all-or-nothing)

---

### Task 4.2: Add Error Handling for Transaction Rollback
**Estimated Time:** 30 minutes
**Files:** `backend/database/database.ts`, `backend/server.ts`

Ensure all transaction failures are properly caught and returned:

```typescript
app.post('/api/workouts', (req, res) => {
  try {
    const workout = saveWorkout(req.body);
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error saving workout:', error);

    // Check if it's a constraint violation
    if (error.message.includes('CHECK constraint failed')) {
      res.status(400).json({
        error: 'Invalid workout data',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Failed to save workout' });
    }
  }
});
```

**Validation:**
- Test constraint violation handling
- Test generic error handling
- Verify descriptive errors are returned

---

## Phase 5: Testing & Documentation (1 hour)

### Task 5.1: Write Unit Tests
**Estimated Time:** 30 minutes
**Files:** New file `backend/database/database.integrity.test.ts`

Write tests for:
- Each constraint with valid/invalid data
- Each recalculation function
- Deletion with recalculation
- Transaction rollback scenarios

**Validation:**
- All tests pass
- Code coverage > 80% for new functions

---

### Task 5.2: Write Integration Tests
**Estimated Time:** 20 minutes
**Files:** Add to existing test files

Test full workflows:
- Create workout → delete → verify consistency
- Create 100 workouts → delete 50 → rebuild → verify
- Test concurrent operations

**Validation:**
- All integration tests pass
- Performance meets requirements

---

### Task 5.3: Update API Documentation
**Estimated Time:** 10 minutes
**Files:** `openspec/project.md` or API docs

Document new endpoints:
- `DELETE /api/workouts/:id`
- `GET /api/workouts/:id/delete-preview`

Document new error responses and constraint violations.

**Validation:**
- Documentation is accurate
- Examples are correct

---

## Dependencies & Parallelization

### Can be done in parallel:
- Phase 1 (Schema) and Phase 2 (Recalculation) can be developed simultaneously
- Task 2.1, 2.2, 2.3 can be implemented in parallel

### Must be done sequentially:
- Phase 1 must complete before Phase 3 (deletion needs constraints)
- Phase 2 must complete before Phase 3 (deletion needs recalculation functions)
- Phase 4 depends on Phase 2 (transaction expansion needs recalculation functions)
- Phase 5 depends on all phases (testing needs everything)

---

## Rollback Plan

If issues arise during implementation:

1. **Schema changes**: Revert migration, remove constraints
2. **Recalculation functions**: Simply don't call them (no breaking change)
3. **Deletion endpoint**: Remove endpoint, no impact on existing features
4. **Transaction expansion**: Revert to original saveWorkout() implementation

All changes are additive and can be safely reverted without data loss.

---

## Success Criteria

- [ ] All CHECK constraints are applied and enforced
- [ ] `volume_today` column is removed
- [ ] All recalculation functions are implemented and tested
- [ ] Deletion endpoint is implemented with full recalculation
- [ ] `saveWorkout()` transaction includes all state updates
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Performance meets requirements (< 5s rebuilds, < 2s deletions)
- [ ] API documentation is updated
- [ ] Migration script is tested and works correctly

---

*Tasks created: 2025-10-29*
*Last updated: 2025-10-29*
