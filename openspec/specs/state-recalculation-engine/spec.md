# Spec: State Recalculation Engine

**Capability:** `state-recalculation-engine`
**Related To:** Data integrity, workout deletion
**Status:** Draft

---

## Overview

This capability provides functions to rebuild derived state (muscle baselines, personal bests, muscle states) from source workout data. These functions ensure data integrity can be restored if inconsistencies arise from deletions or bugs.

---

## ADDED Requirements

### Requirement: Rebuild Muscle Baselines from Failure Sets

The system SHALL provide a function to recalculate all muscle baselines from workout history.

**Rationale:** When workouts are deleted or data becomes inconsistent, baselines must be rebuilt from remaining failure sets to maintain accuracy.

**Location:** `backend/database/database.ts` - New function `rebuildMuscleBaselines()`

#### Scenario: Baselines are recalculated from all failure sets
**GIVEN** the database contains 100 workouts with 40 sets to failure
**WHEN** `rebuildMuscleBaselines()` is called
**THEN** the function queries all exercise_sets WHERE to_failure = 1
**AND** calculates muscle-specific volume for each failure set
**AND** determines the maximum observed volume per muscle
**AND** updates muscle_baselines.system_learned_max for each muscle
**AND** returns a list of updated baselines

#### Scenario: Baselines decrease if max workout was deleted
**GIVEN** Chest baseline is 12,000 from a workout that was deleted
**AND** the remaining max chest workout volume is 10,500
**WHEN** `rebuildMuscleBaselines()` is called
**THEN** Chest baseline is updated to 10,500
**AND** the update is logged in the return value

#### Scenario: Baselines remain unchanged if max is still present
**GIVEN** Biceps baseline is 8,000 from an existing workout
**AND** no biceps workouts have been deleted
**WHEN** `rebuildMuscleBaselines()` is called
**THEN** Biceps baseline remains 8,000
**AND** no update occurs for Biceps

#### Scenario: Muscles with no failure sets get default baseline
**GIVEN** Calves have never been trained to failure
**WHEN** `rebuildMuscleBaselines()` is called
**THEN** Calves baseline is set to the default (5000 for Beginner)
**AND** the baseline source is marked as 'inherited'

#### Scenario: Function uses calibrated engagement percentages
**GIVEN** user has calibrated Bench Press to 80% Chest (vs default 70%)
**WHEN** `rebuildMuscleBaselines()` recalculates from Bench Press failure sets
**THEN** the function uses the calibrated 80% Chest engagement
**AND** baselines reflect the user's personal muscle recruitment

---

### Requirement: Rebuild Personal Bests from Workout History

The system SHALL provide a function to recalculate all personal bests from workout history.

**Rationale:** PRs are incrementally updated but never validated. If a PR workout is deleted, the PR becomes stale. Rebuilding from source ensures accuracy.

**Location:** `backend/database/database.ts` - New function `rebuildPersonalBests()`

#### Scenario: PRs are recalculated from all workouts
**GIVEN** the database contains 100 workouts with 300 exercise sets
**WHEN** `rebuildPersonalBests()` is called
**THEN** the function queries all exercise_sets joined with workouts
**AND** groups sets by exercise_name
**AND** calculates best single set (max weight × reps) per exercise
**AND** calculates best session volume (sum of workout sets) per exercise
**AND** updates personal_bests table with accurate values
**AND** returns a list of updated PRs

#### Scenario: PR is lowered if max workout was deleted
**GIVEN** Bench Press PR was 500 lbs from a workout that was deleted
**AND** the remaining max Bench Press set is 450 lbs
**WHEN** `rebuildPersonalBests()` is called
**THEN** Bench Press PR is updated to 450 lbs
**AND** the change is logged in the return value

#### Scenario: Exercises with no history are removed from PRs
**GIVEN** Leg Press has a PR but all Leg Press workouts were deleted
**WHEN** `rebuildPersonalBests()` is called
**THEN** Leg Press is deleted from personal_bests table
**AND** the removal is logged in the return value

#### Scenario: Session volume PR considers all sets in workout
**GIVEN** Squats workout has sets: 225×8, 225×8, 225×6, 225×5
**WHEN** `rebuildPersonalBests()` calculates session volume
**THEN** session volume = (225×8) + (225×8) + (225×6) + (225×5) = 6075 lbs
**AND** the PR is stored if it exceeds previous session volume

#### Scenario: Best single set considers only the max set
**GIVEN** Squats workout has sets: 225×8, 245×6, 265×4, 225×8
**WHEN** `rebuildPersonalBests()` calculates best single set
**THEN** best single set = 265×4 = 1060 lbs
**AND** the PR is stored if it exceeds previous best single set

---

### Requirement: Reset Muscle States for Deleted Workout Date

The system SHALL provide a function to reset muscle states when a workout is deleted.

**Rationale:** If the last workout for a muscle is deleted, `last_trained` date becomes invalid and fatigue calculations are wrong.

**Location:** `backend/database/database.ts` - New function `resetMuscleStatesForDate(date: string)`

#### Scenario: Muscle states are reset if last trained date matches
**GIVEN** Chest last_trained is "2025-10-29"
**AND** the workout from 2025-10-29 is deleted
**WHEN** `resetMuscleStatesForDate("2025-10-29")` is called
**THEN** Chest last_trained is updated to the previous workout date for Chest
**AND** Chest initial_fatigue_percent is recalculated from that workout
**AND** Chest fatigue decays from the new last_trained date

#### Scenario: Muscle states are unchanged if not affected
**GIVEN** Biceps last_trained is "2025-10-27"
**AND** the workout from 2025-10-29 is deleted
**WHEN** `resetMuscleStatesForDate("2025-10-29")` is called
**THEN** Biceps last_trained remains "2025-10-27"
**AND** Biceps fatigue is not modified

#### Scenario: Muscle resets to zero fatigue if no previous workouts
**GIVEN** Calves last_trained is "2025-10-29"
**AND** this is the only Calves workout in history
**AND** the workout from 2025-10-29 is deleted
**WHEN** `resetMuscleStatesForDate("2025-10-29")` is called
**THEN** Calves last_trained is set to NULL
**AND** Calves initial_fatigue_percent is set to 0
**AND** Calves is marked as fully recovered

---

### Requirement: Validate Data Consistency

The system SHALL provide a function to validate that derived state matches source data.

**Rationale:** After deletions or migrations, users need to verify data integrity. A validation function identifies discrepancies.

**Location:** `backend/database/database.ts` - New function `validateDataIntegrity()`

#### Scenario: Validation passes when all state is consistent
**GIVEN** all muscle baselines match max failure sets
**AND** all personal bests match max workout performance
**AND** all muscle states last_trained dates have corresponding workouts
**WHEN** `validateDataIntegrity()` is called
**THEN** the function returns {valid: true, issues: []}

#### Scenario: Validation detects baseline mismatch
**GIVEN** Chest baseline is 15,000 but max failure set volume is 12,000
**WHEN** `validateDataIntegrity()` is called
**THEN** the function returns {valid: false, issues: [{type: 'baseline_mismatch', muscle: 'Chest', stored: 15000, actual: 12000}]}

#### Scenario: Validation detects PR mismatch
**GIVEN** Bench Press PR is 600 lbs but max workout set is 500 lbs
**WHEN** `validateDataIntegrity()` is called
**THEN** the function returns {valid: false, issues: [{type: 'pr_mismatch', exercise: 'Bench Press', stored: 600, actual: 500}]}

#### Scenario: Validation detects orphaned muscle state
**GIVEN** Triceps last_trained is "2025-10-15"
**AND** no workouts exist from 2025-10-15
**WHEN** `validateDataIntegrity()` is called
**THEN** the function returns {valid: false, issues: [{type: 'orphaned_muscle_state', muscle: 'Triceps', last_trained: '2025-10-15'}]}

---

## MODIFIED Requirements

None. This capability adds new functions without modifying existing behavior.

---

## REMOVED Requirements

None. This capability only adds functionality.

---

## Implementation Notes

### Function Signatures
```typescript
// Rebuild all muscle baselines from failure sets
function rebuildMuscleBaselines(): BaselineUpdate[];

// Rebuild all personal bests from workout history
function rebuildPersonalBests(): PRUpdate[];

// Reset muscle states after deleting workout on specific date
function resetMuscleStatesForDate(date: string): MuscleStateUpdate[];

// Validate all derived state matches source data
function validateDataIntegrity(): {
  valid: boolean;
  issues: IntegrityIssue[];
};

interface BaselineUpdate {
  muscle: string;
  oldMax: number;
  newMax: number;
}

interface PRUpdate {
  exercise: string;
  oldBestSingleSet: number | null;
  newBestSingleSet: number | null;
  oldBestSessionVolume: number | null;
  newBestSessionVolume: number | null;
}

interface MuscleStateUpdate {
  muscle: string;
  oldLastTrained: string | null;
  newLastTrained: string | null;
  oldFatigue: number;
  newFatigue: number;
}

interface IntegrityIssue {
  type: 'baseline_mismatch' | 'pr_mismatch' | 'orphaned_muscle_state';
  details: any;
}
```

### Performance Considerations
- Rebuild functions scan entire workout history (potentially expensive)
- Should be run in background or with loading indicator
- Consider adding LIMIT for testing on large datasets
- Add indexes to optimize queries (see optimization spec)

### Transaction Requirements
- All rebuild functions MUST run in a transaction
- Rollback if any error occurs
- Return summary of changes for logging

---

## Testing Requirements

### Unit Tests
- Test rebuild with empty database (no workouts)
- Test rebuild with single workout
- Test rebuild with 1000 workouts (performance)
- Test validation detects all mismatch types
- Test reset handles edge cases (no previous workout, NULL dates)

### Integration Tests
- Create workout → delete workout → rebuild → verify consistency
- Create 100 workouts → delete 50 → rebuild → verify accuracy
- Modify baseline → run validation → detect mismatch
- Test rebuild functions are idempotent (run twice, same result)

### Performance Tests
- Rebuild baselines with 1000 workouts in < 5 seconds
- Rebuild PRs with 5000 sets in < 10 seconds
- Validation runs in < 2 seconds on large dataset

---

## Acceptance Criteria

- [ ] `rebuildMuscleBaselines()` correctly recalculates from all failure sets
- [ ] `rebuildPersonalBests()` correctly recalculates from all workouts
- [ ] `resetMuscleStatesForDate()` properly handles muscle state cleanup
- [ ] `validateDataIntegrity()` detects all types of inconsistencies
- [ ] All functions run in transactions with rollback
- [ ] All functions return structured change summaries
- [ ] Performance meets requirements (< 5s for 1000 workouts)
- [ ] All tests pass
- [ ] Functions are documented with JSDoc

---

*Spec created: 2025-10-29*
*Last updated: 2025-10-29*
