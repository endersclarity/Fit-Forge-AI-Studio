# Spec: Workout Deletion Cascade

**Capability:** `workout-deletion-cascade`
**Related To:** Data integrity, workout management
**Status:** Draft

---

## Overview

This capability provides safe workout deletion with automatic recalculation of all dependent state. When a workout is deleted, muscle baselines, personal bests, and muscle states are updated to remain consistent with the remaining workout history.

---

## ADDED Requirements

### Requirement: Delete Workout with State Recalculation

The system SHALL provide an API endpoint to delete a workout and recalculate dependent state.

**Rationale:** Deleting a workout without updating baselines/PRs/muscle states leaves orphaned data. Safe deletion ensures consistency.

**Location:** `backend/server.ts` - New endpoint `DELETE /api/workouts/:id`

#### Scenario: Workout is deleted and all state is updated
**GIVEN** a workout with ID 42 exists
**AND** this workout contains a PR for Bench Press
**AND** this workout contributed to Chest baseline learning
**WHEN** DELETE /api/workouts/42 is called
**THEN** the workout is deleted from the workouts table
**AND** all exercise_sets for workout 42 are CASCADE deleted
**AND** `rebuildMuscleBaselines()` is called to update baselines
**AND** `rebuildPersonalBests()` is called to update PRs
**AND** `resetMuscleStatesForDate(workout.date)` is called
**AND** a summary of changes is returned
**AND** all operations occur in a single transaction

#### Scenario: Deletion is rolled back on error
**GIVEN** a workout with ID 42 exists
**AND** the baseline recalculation will fail (database error)
**WHEN** DELETE /api/workouts/42 is called
**THEN** the transaction is rolled back
**AND** the workout still exists in the database
**AND** no exercise_sets are deleted
**AND** no state is modified
**AND** a 500 error is returned with error details

#### Scenario: Deleting non-existent workout returns 404
**GIVEN** no workout with ID 999 exists
**WHEN** DELETE /api/workouts/999 is called
**THEN** a 404 Not Found response is returned
**AND** no database operations are performed

#### Scenario: Deletion summary includes all affected data
**GIVEN** a workout with ID 42 is deleted
**AND** this workout lowered Chest baseline from 12000 to 11000
**AND** this workout contained the Bench Press PR (500 lbs → 480 lbs)
**WHEN** the deletion completes successfully
**THEN** the response includes:
```json
{
  "success": true,
  "workoutId": 42,
  "deletedSets": 8,
  "affectedBaselines": [
    {"muscle": "Chest", "oldMax": 12000, "newMax": 11000}
  ],
  "affectedPRs": [
    {"exercise": "Bench Press", "oldPR": 500, "newPR": 480}
  ],
  "affectedMuscles": ["Chest", "Triceps", "Deltoids"]
}
```

---

### Requirement: Confirm Deletion for Workouts with PRs

The system SHOULD warn the user before deleting a workout containing personal records.

**Rationale:** Users might accidentally delete their best workouts. A warning prevents data loss.

**Location:** Frontend (optional enhancement) or API response

#### Scenario: API indicates workout contains PRs
**GIVEN** workout 42 contains 2 personal records
**WHEN** GET /api/workouts/42/delete-preview is called
**THEN** the response includes:
```json
{
  "workoutId": 42,
  "containsPRs": true,
  "prs": [
    {"exercise": "Bench Press", "value": 500},
    {"exercise": "Overhead Press", "value": 150}
  ],
  "warning": "This workout contains 2 personal records. Deleting it will lower these PRs."
}
```

#### Scenario: API indicates workout is safe to delete
**GIVEN** workout 43 contains no personal records
**WHEN** GET /api/workouts/43/delete-preview is called
**THEN** the response includes:
```json
{
  "workoutId": 43,
  "containsPRs": false,
  "prs": [],
  "warning": null
}
```

---

### Requirement: Atomic Deletion Transaction

The system SHALL perform deletion and recalculation as a single atomic transaction.

**Rationale:** If any step fails (deletion, baseline update, PR update), the entire operation must be rolled back to prevent inconsistent state.

**Location:** `backend/database/database.ts` - New function `deleteWorkoutWithRecalculation(workoutId: number)`

#### Scenario: Transaction commits only if all steps succeed
**GIVEN** a workout deletion transaction
**WHEN** workout is deleted successfully
**AND** baselines are recalculated successfully
**AND** PRs are recalculated successfully
**AND** muscle states are reset successfully
**THEN** the transaction commits
**AND** all changes are persisted

#### Scenario: Transaction rolls back if baseline recalculation fails
**GIVEN** a workout deletion transaction
**WHEN** workout is deleted successfully
**AND** baseline recalculation throws an error
**THEN** the transaction is rolled back
**AND** the workout still exists in the database
**AND** no state is modified

#### Scenario: Transaction rolls back if PR recalculation fails
**GIVEN** a workout deletion transaction
**WHEN** workout is deleted successfully
**AND** baseline recalculation succeeds
**AND** PR recalculation throws an error
**THEN** the transaction is rolled back
**AND** the workout still exists in the database
**AND** baselines are not updated

---

### Requirement: Deletion Audit Logging

The system SHALL log all workout deletions with details for audit purposes.

**Rationale:** Deletions are destructive operations. Logs enable troubleshooting and potential recovery.

**Location:** `backend/database/database.ts` - Console logging or audit table

#### Scenario: Deletion is logged with full details
**GIVEN** workout 42 is deleted
**WHEN** the deletion transaction completes
**THEN** a log entry is written:
```
[2025-10-29T14:32:18Z] WORKOUT_DELETED: {
  workoutId: 42,
  date: "2025-10-27",
  category: "Push",
  deletedSets: 8,
  affectedBaselines: ["Chest", "Triceps"],
  affectedPRs: ["Bench Press"],
  deletedBy: "user_1"
}
```

#### Scenario: Failed deletion is logged with error
**GIVEN** workout deletion fails due to baseline recalculation error
**WHEN** the transaction is rolled back
**THEN** a log entry is written:
```
[2025-10-29T14:35:42Z] WORKOUT_DELETE_FAILED: {
  workoutId: 42,
  error: "Baseline recalculation failed: [error details]",
  rollback: true
}
```

---

## MODIFIED Requirements

### Requirement: Workout Save Transaction Includes All State Updates

The system SHALL expand the `saveWorkout()` transaction to include baseline learning and PR detection.

**Rationale:** Currently, `saveWorkout()` only wraps the workout/sets insertion. Baseline learning and PR detection run outside the transaction, creating risk of partial writes.

**Location:** `backend/database/database.ts` - Function `saveWorkout()`

#### Scenario: Workout save includes baseline learning in transaction
**GIVEN** a workout with 3 sets to failure
**WHEN** `saveWorkout()` is called
**THEN** the transaction begins
**AND** workout is inserted
**AND** exercise_sets are inserted
**AND** `learnMuscleBaselinesFromWorkout()` is called INSIDE transaction
**AND** `detectPRsForWorkout()` is called INSIDE transaction
**AND** the transaction commits
**AND** all changes are persisted atomically

#### Scenario: Failed baseline learning rolls back entire workout
**GIVEN** a workout save operation
**WHEN** workout and sets are inserted successfully
**AND** baseline learning throws an error
**THEN** the transaction is rolled back
**AND** the workout is NOT saved
**AND** exercise_sets are NOT saved
**AND** no state is modified
**AND** an error is returned to the caller

#### Scenario: Failed PR detection rolls back entire workout
**GIVEN** a workout save operation
**WHEN** workout, sets, and baselines are saved successfully
**AND** PR detection throws an error
**THEN** the transaction is rolled back
**AND** the workout is NOT saved
**AND** exercise_sets are NOT saved
**AND** baselines are NOT updated
**AND** an error is returned to the caller

---

## REMOVED Requirements

None. This capability only adds functionality.

---

## Implementation Notes

### API Endpoint Design
```typescript
// DELETE /api/workouts/:id
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const workoutId = parseInt(req.params.id);
    const result = await deleteWorkoutWithRecalculation(workoutId);
    res.json(result);
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'Workout not found' });
    } else {
      res.status(500).json({ error: 'Deletion failed', details: error.message });
    }
  }
});

// GET /api/workouts/:id/delete-preview (optional)
app.get('/api/workouts/:id/delete-preview', async (req, res) => {
  const workoutId = parseInt(req.params.id);
  const preview = await getWorkoutDeletionPreview(workoutId);
  res.json(preview);
});
```

### Database Function
```typescript
function deleteWorkoutWithRecalculation(workoutId: number): DeletionResult {
  const deleteTransaction = db.transaction(() => {
    // 1. Get workout details before deletion
    const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
    if (!workout) {
      throw new Error('NOT_FOUND');
    }

    // 2. Count sets that will be deleted
    const setCount = db.prepare('SELECT COUNT(*) as count FROM exercise_sets WHERE workout_id = ?')
      .get(workoutId).count;

    // 3. Delete workout (CASCADE deletes exercise_sets)
    db.prepare('DELETE FROM workouts WHERE id = ?').run(workoutId);

    // 4. Recalculate baselines
    const baselineUpdates = rebuildMuscleBaselines();

    // 5. Recalculate PRs
    const prUpdates = rebuildPersonalBests();

    // 6. Reset muscle states for deleted date
    const muscleUpdates = resetMuscleStatesForDate(workout.date);

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

### Transaction Expansion for saveWorkout()
```typescript
function saveWorkout(workout: WorkoutSaveRequest): WorkoutResponse {
  const saveAllTransaction = db.transaction(() => {
    // 1. Insert workout and sets (existing code)
    const workoutId = insertWorkoutAndSets(workout);

    // 2. Learn baselines (MOVED INSIDE TRANSACTION)
    const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);

    // 3. Detect PRs (MOVED INSIDE TRANSACTION)
    const prs = detectPRsForWorkout(workoutId);

    return { workoutId, updatedBaselines, prs };
  });

  const result = saveAllTransaction();
  // Format and return response
}
```

---

## Testing Requirements

### Unit Tests
- Test deletion with no dependent state
- Test deletion with PR updates
- Test deletion with baseline updates
- Test deletion with muscle state updates
- Test transaction rollback on each failure point
- Test deletion of non-existent workout

### Integration Tests
- Create workout → delete workout → verify all state updated
- Create 10 workouts → delete 5 → verify consistency
- Delete workout with PR → verify PR lowered correctly
- Delete workout with max baseline → verify baseline lowered
- Test concurrent deletions (race conditions)

### Performance Tests
- Delete workout with recalculation in < 2 seconds
- Delete 100 workouts sequentially in < 60 seconds

---

## Acceptance Criteria

- [ ] `DELETE /api/workouts/:id` endpoint implemented
- [ ] Deletion triggers recalculation of baselines, PRs, and muscle states
- [ ] All operations occur in a single transaction
- [ ] Transaction rolls back on any error
- [ ] Deletion summary includes all affected data
- [ ] 404 returned for non-existent workouts
- [ ] `saveWorkout()` transaction expanded to include all state updates
- [ ] Deletion audit logging implemented
- [ ] Optional delete-preview endpoint implemented
- [ ] All tests pass
- [ ] API documented with examples

---

*Spec created: 2025-10-29*
*Last updated: 2025-10-29*
