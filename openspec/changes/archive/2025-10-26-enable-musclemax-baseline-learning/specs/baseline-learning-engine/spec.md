# Spec: Baseline Learning Engine

**Capability:** `baseline-learning-engine`
**Status:** Draft
**Change:** `enable-musclemax-baseline-learning`

---

## Overview

The baseline learning engine automatically calibrates muscle capacity baselines by analyzing "to failure" sets. It uses a conservative max observed volume algorithm to progressively improve the accuracy of muscle baselines without requiring complex constraint solving.

**Core Behavior:** When a user logs a workout with sets marked "to failure", the system calculates the volume handled by each involved muscle and updates the baseline if the observed volume exceeds the current learned maximum.

---

## ADDED Requirements

### Requirement: Auto-Update Baselines from Failure Sets

**Description:** System SHALL automatically update `muscle_baselines.system_learned_max` when a "to failure" set demonstrates higher capacity than currently recorded.

**Acceptance Criteria:**
- Baseline update triggered after workout save
- Only processes sets with `to_failure = 1`
- Updates occur within same transaction as workout save
- Returns list of updated muscles in API response
- Updates timestamp in `muscle_baselines.updated_at`

#### Scenario: User breaks previous capacity on single muscle

**Given:** Pectoralis baseline is currently 3,500 units
**And:** User logs Push-ups: 30 reps @ 200lbs with `to_failure = 1`
**And:** Push-up muscle engagement: Pectoralis 70%
**When:** Workout is saved
**Then:** System calculates volume: 30 × 200 = 6,000 total
**And:** Pectoralis volume: 6,000 × 0.70 = 4,200 units
**And:** Compares 4,200 > 3,500 (current baseline)
**And:** Updates `muscle_baselines.system_learned_max` to 4,200 for Pectoralis
**And:** Returns `updated_baselines: [{muscle: "Pectoralis", oldMax: 3500, newMax: 4200}]`

#### Scenario: User does submaximal workout (no baseline updates)

**Given:** All muscles have existing baselines
**When:** User logs workout with all sets marked `to_failure = 0`
**Then:** Baseline learning is skipped (no failure sets)
**And:** `updated_baselines` array is empty
**And:** No database updates occur
**And:** Workout data is still saved normally

#### Scenario: Observed volume lower than current baseline

**Given:** Triceps baseline is 5,000 units
**When:** User logs Tricep Extension: 15 reps @ 40lbs to failure
**And:** Tricep engagement is 95%
**Then:** System calculates: 15 × 40 × 0.95 = 570 units
**And:** Compares 570 < 5,000 (current baseline)
**And:** No update performed (not a new maximum)
**And:** Baseline remains 5,000

---

### Requirement: Calculate Muscle Volume from Exercise Engagement

**Description:** System SHALL calculate per-muscle volume by multiplying set total volume by muscle engagement percentage from exercise constants.

**Acceptance Criteria:**
- Retrieves exercise definition from `constants.ts`
- Applies correct muscle engagement percentages
- Handles exercises with multiple muscles involved
- Calculates volume for each engaged muscle independently

#### Scenario: Compound exercise involves multiple muscles

**Given:** User logs Bench Press: 10 reps @ 100lbs to failure
**And:** Bench Press engagements: Pectoralis 85%, Triceps 35%, Deltoids 25%
**When:** Baseline learning processes this set
**Then:** Total volume calculated: 10 × 100 = 1,000 lbs
**And:** Pectoralis volume: 1,000 × 0.85 = 850 units
**And:** Triceps volume: 1,000 × 0.35 = 350 units
**And:** Deltoids volume: 1,000 × 0.25 = 250 units
**And:** Each muscle baseline compared/updated independently

#### Scenario: Isolation exercise primarily targets one muscle

**Given:** User logs Tricep Extension: 20 reps @ 30lbs to failure
**And:** Tricep Extension engagement: Triceps 95%
**When:** Baseline learning processes this set
**Then:** Total volume: 20 × 30 = 600 lbs
**And:** Triceps volume: 600 × 0.95 = 570 units
**And:** Only Triceps baseline considered for update
**And:** Other muscles not involved (correct behavior)

---

### Requirement: Track Maximum Observed Volume Per Muscle

**Description:** When multiple failure sets in same workout involve the same muscle, system SHALL use the highest observed volume for baseline comparison.

**Acceptance Criteria:**
- Processes all failure sets in workout
- Tracks max volume per muscle across all sets
- Single update per muscle per workout (to highest value)
- Prevents multiple incremental updates from same workout

#### Scenario: Multiple failure sets for same exercise

**Given:** User logs 3 sets of Push-ups to failure in single workout:
- Set 1: 30 reps @ 200lbs (6,000 total, 4,200 pec volume)
- Set 2: 25 reps @ 200lbs (5,000 total, 3,500 pec volume)
- Set 3: 20 reps @ 200lbs (4,000 total, 2,800 pec volume)
**When:** Baseline learning processes workout
**Then:** System tracks max pec volume: 4,200 (from Set 1)
**And:** Compares only 4,200 against current baseline
**And:** Single update (or no update) for Pectoralis
**And:** Ignores lower volumes from Sets 2 and 3

#### Scenario: Different exercises targeting same muscle

**Given:** Workout includes:
- Push-ups to failure: 30 reps @ 200lbs (Pec volume: 4,200)
- Bench Press to failure: 12 reps @ 100lbs (Pec volume: 1,020)
**When:** Baseline learning processes both sets
**Then:** Tracks max Pectoralis volume: 4,200
**And:** Uses 4,200 for baseline comparison
**And:** Correctly identifies best performance for muscle

---

### Requirement: Return Updated Baselines in API Response

**Description:** Workout save API response SHALL include array of updated muscle baselines with old and new values for user feedback.

**Acceptance Criteria:**
- Response includes `updated_baselines` array (may be empty)
- Each update contains: `muscle`, `oldMax`, `newMax`
- Array is empty when no updates occur
- Backend compatible (optional field for old clients)

#### Scenario: Workout triggers multiple baseline updates

**Given:** User completes workout with exercises targeting multiple muscles
**When:** Baselines updated for Pectoralis (3500→4200) and Deltoids (2000→2400)
**Then:** API response includes:
```json
{
  "id": 123,
  "date": "2025-10-25",
  "exercises": [...],
  "updated_baselines": [
    {"muscle": "Pectoralis", "oldMax": 3500, "newMax": 4200},
    {"muscle": "Deltoids", "oldMax": 2000, "newMax": 2400}
  ]
}
```

#### Scenario: Workout has no baseline updates

**Given:** User logs workout with all submaximal sets
**Or:** All observed volumes below current baselines
**When:** Workout save completes
**Then:** API response includes `updated_baselines: []`
**And:** Empty array (not null or undefined)

---

### Requirement: Preserve Baseline Ratchet Model

**Description:** System SHALL only increase baselines, never decrease them, implementing a ratchet model where observed capacity sets a floor.

**Acceptance Criteria:**
- Baselines only updated when observed > current
- No automatic decrease even after long inactivity
- User must manually reset if desired
- Progressive improvement over time

#### Scenario: User returns after extended break

**Given:** User has Pectoralis baseline of 8,500 from previous training
**And:** User took 3 months off (detraining occurred)
**When:** User returns and logs Push-ups: 20 reps @ 200lbs (2,800 pec volume)
**Then:** Observed volume (2,800) < current baseline (8,500)
**And:** No baseline update occurs
**And:** Baseline remains 8,500 (does not decay automatically)
**And:** User can manually reset in settings if desired

#### Scenario: Progressive strength gains over time

**Given:** User starts with default baseline of 10,000
**When:** Week 1: Logs set with 3,500 volume
**Then:** Baseline stays at 10,000 (3,500 < 10,000)
**When:** Week 4: Logs set with 12,000 volume
**Then:** Baseline updates to 12,000 (exceeded default)
**When:** Week 8: Logs set with 14,500 volume
**Then:** Baseline updates to 14,500 (progressive improvement)
**And:** Baseline never decreases between weeks

---

### Requirement: Handle Missing or Invalid Exercise Data

**Description:** System SHALL gracefully handle cases where exercise is not found in constants or has invalid engagement data.

**Acceptance Criteria:**
- Skips sets for exercises not in `EXERCISE_LIBRARY`
- Logs warning for unrecognized exercises
- Continues processing other valid sets
- Does not crash or block workout save

#### Scenario: User logs exercise not in library

**Given:** User somehow logs set for "Custom Exercise" not in constants
**When:** Baseline learning attempts to process this set
**Then:** Exercise lookup returns undefined
**And:** System skips this set with warning log
**And:** Continues processing other valid exercises
**And:** Workout save completes successfully

#### Scenario: Exercise has no muscle engagements

**Given:** Exercise definition exists but `muscleEngagements` array is empty
**When:** Baseline learning processes this set
**Then:** No muscles to calculate volumes for
**And:** Set is skipped (no baseline updates)
**And:** No errors thrown

---

## MODIFIED Requirements

None. This is a new capability that extends existing workout logging without modifying current behavior.

---

## REMOVED Requirements

None. All existing workout logging functionality remains unchanged.

---

## Dependencies

**Required:**
- ✅ `to_failure` column in `exercise_sets` table (already exists in schema)
- ✅ `muscle_baselines` table with `system_learned_max` column (already exists)
- ✅ `EXERCISE_LIBRARY` in `constants.ts` with muscle engagements (already exists)

**Consumed Capabilities:**
- `workout-logging`: Triggers baseline learning after save
- `failure-status-tracking`: Provides `to_failure` flag for quality data filtering

**Provides To:**
- `muscle-fatigue-tracking`: More accurate baselines → better fatigue estimates
- `manual-baseline-override`: System-learned values visible/usable in UI
- Future: `triangulation-algorithm`, `baseline-history-tracking`

---

## Implementation Notes

**File:** `backend/database/database.ts`

**New Function:**
```typescript
function updateMuscleBaselines(workoutId: number): Array<{
  muscle: string;
  oldMax: number;
  newMax: number;
}> {
  // Implementation per design.md
}
```

**Modified Function:**
```typescript
function saveWorkout(workout: WorkoutSaveRequest): WorkoutResponse {
  // ... existing save logic ...
  const updatedBaselines = updateMuscleBaselines(workoutId); // NEW
  return {
    ...savedWorkout,
    updated_baselines: updatedBaselines // NEW
  };
}
```

**Performance:** Expected <10ms overhead per workout save (conservative estimate).

---

## Testing Coverage

**Unit Tests:**
- Update when observed > current ✓
- No update when observed < current ✓
- Multiple muscles from compound exercise ✓
- Max volume tracking across sets ✓
- Invalid exercise handling ✓

**Integration Tests:**
- Full workout save workflow ✓
- API response structure ✓
- Database persistence ✓

---

## Success Criteria

- ✅ Baselines auto-update from failure sets
- ✅ No manual intervention required
- ✅ Progressive accuracy over 5-10 workouts
- ✅ Zero downtime deployment (backward compatible)
- ✅ <50ms added latency to workout save
