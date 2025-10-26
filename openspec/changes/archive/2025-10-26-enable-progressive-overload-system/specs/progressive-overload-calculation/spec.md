# Spec: Progressive Overload Calculation

**Capability:** `progressive-overload-calculation`
**Status:** Draft
**Change:** `enable-progressive-overload-system`

---

## Overview

The progressive overload calculation engine automatically generates +3% weight and +3% reps suggestions based on the user's last performance for each exercise. It intelligently detects which progression method was used last time and recommends alternating between methods to prevent plateaus.

**Core Behavior:** When a user starts a workout or loads an exercise, the system fetches the last two performances, calculates both +3% options, detects the pattern, and returns a smart recommendation.

---

## ADDED Requirements

### Requirement: Fetch Last Performance for Exercise

**Description:** System SHALL retrieve the most recent performance data for a given exercise to use as the baseline for progressive suggestions.

**Acceptance Criteria:**
- Query returns most recent workout containing the exercise
- Uses FIRST set from workout (best fresh performance)
- Includes weight, reps, and date
- Returns null if no history exists
- Query optimized with indexes

#### Scenario: User has history for exercise

**Given:** User has completed Pull-ups in 3 previous workouts:
- 2025-10-23: Set 1 (30 reps @ 200lbs), Set 2 (25 reps)
- 2025-10-20: Set 1 (29 reps @ 200lbs)
- 2025-10-18: Set 1 (28 reps @ 200lbs)
**When:** System fetches last performance for "Pull-ups"
**Then:** Returns workout from 2025-10-23
**And:** Returns Set 1 data: 30 reps @ 200lbs
**And:** Ignores Set 2 (only first set used)

#### Scenario: User has never done exercise

**Given:** User has no workout history for "Dumbbell Row"
**When:** System fetches last performance for "Dumbbell Row"
**Then:** Returns null (no history)
**And:** Triggers "No history" handling in UI

---

### Requirement: Calculate +3% Weight Suggestion

**Description:** System SHALL calculate progressive overload suggestion by increasing weight by 3% while keeping reps constant.

**Acceptance Criteria:**
- Multiplies last weight by 1.03
- Rounds result to nearest whole number (pound/kg)
- Keeps reps identical to last performance
- Returns weight/reps pair with method: "weight"

#### Scenario: Calculate weight progression from last performance

**Given:** Last performance was 30 reps @ 100lbs
**When:** System calculates +3% weight suggestion
**Then:** New weight = 100 × 1.03 = 103lbs
**And:** Reps remain 30
**And:** Returns: { weight: 103, reps: 30, method: "weight" }

#### Scenario: Rounding decimal weights

**Given:** Last performance was 30 reps @ 33lbs
**When:** System calculates +3% weight suggestion
**Then:** New weight = 33 × 1.03 = 33.99 → rounds to 34lbs
**And:** Returns: { weight: 34, reps: 30, method: "weight" }

#### Scenario: Handling large weights

**Given:** Last performance was 5 reps @ 225lbs
**When:** System calculates +3% weight suggestion
**Then:** New weight = 225 × 1.03 = 231.75 → rounds to 232lbs
**And:** Returns: { weight: 232, reps: 5, method: "weight" }

---

### Requirement: Calculate +3% Reps Suggestion

**Description:** System SHALL calculate progressive overload suggestion by increasing reps by 3% while keeping weight constant.

**Acceptance Criteria:**
- Multiplies last reps by 1.03
- Rounds UP to next whole number (can't do partial reps)
- Keeps weight identical to last performance
- Returns weight/reps pair with method: "reps"

#### Scenario: Calculate reps progression from last performance

**Given:** Last performance was 10 reps @ 100lbs
**When:** System calculates +3% reps suggestion
**Then:** New reps = 10 × 1.03 = 10.3 → rounds up to 11
**And:** Weight remains 100lbs
**And:** Returns: { weight: 100, reps: 11, method: "reps" }

#### Scenario: Rounding fractional reps

**Given:** Last performance was 30 reps @ 200lbs
**When:** System calculates +3% reps suggestion
**Then:** New reps = 30 × 1.03 = 30.9 → rounds up to 31
**And:** Returns: { weight: 200, reps: 31, method: "reps" }

#### Scenario: Low rep counts

**Given:** Last performance was 5 reps @ 225lbs
**When:** System calculates +3% reps suggestion
**Then:** New reps = 5 × 1.03 = 5.15 → rounds up to 6
**And:** Returns: { weight: 225, reps: 6, method: "reps" }

---

### Requirement: Detect Last Progression Method

**Description:** System SHALL analyze the last two performances to determine which progression method (weight or reps) was used, enabling intelligent alternating recommendations.

**Acceptance Criteria:**
- Compares last performance to previous performance
- Detects "weight" if weight increased and reps stayed same
- Detects "reps" if reps increased and weight stayed same
- Returns "none" if both changed, neither changed, or only one workout exists
- Handles edge cases (both decreased, one up/one down)

#### Scenario: User increased weight last time

**Given:** Previous performance: 30 reps @ 100lbs
**And:** Last performance: 30 reps @ 103lbs
**When:** System detects last method
**Then:** Weight increased (100 → 103)
**And:** Reps stayed same (30 → 30)
**And:** Returns: lastMethod = "weight"

#### Scenario: User increased reps last time

**Given:** Previous performance: 10 reps @ 100lbs
**And:** Last performance: 11 reps @ 100lbs
**When:** System detects last method
**Then:** Reps increased (10 → 11)
**And:** Weight stayed same (100 → 100)
**And:** Returns: lastMethod = "reps"

#### Scenario: User increased both (custom progression)

**Given:** Previous performance: 10 reps @ 100lbs
**And:** Last performance: 12 reps @ 105lbs
**When:** System detects last method
**Then:** Both weight AND reps increased
**And:** Returns: lastMethod = "none" (pattern unclear)

#### Scenario: Performance decreased (regression/deload)

**Given:** Previous performance: 30 reps @ 200lbs
**And:** Last performance: 25 reps @ 200lbs
**When:** System detects last method
**Then:** Reps decreased, weight stayed same
**And:** Returns: lastMethod = "none" (not progression)

#### Scenario: Only one workout exists

**Given:** User has only done Pull-ups once
**When:** System detects last method
**Then:** No previous performance to compare
**And:** Returns: lastMethod = "none"

---

### Requirement: Recommend Alternating Method

**Description:** System SHALL suggest the OPPOSITE progression method from what was used last time to encourage stimulus variation and prevent plateaus.

**Acceptance Criteria:**
- If lastMethod = "weight", suggest "reps"
- If lastMethod = "reps", suggest "weight"
- If lastMethod = "none", default to "reps" (safer, easier)
- Recommendation is advisory only (user can choose either option)

#### Scenario: Alternate from weight to reps

**Given:** Last method detected as "weight"
**When:** System calculates recommendation
**Then:** suggested = "reps"
**And:** UI highlights +REPS button as recommended
**And:** User can still choose +WEIGHT if desired

#### Scenario: Alternate from reps to weight

**Given:** Last method detected as "reps"
**When:** System calculates recommendation
**Then:** suggested = "weight"
**And:** UI highlights +WEIGHT button as recommended

#### Scenario: Default to reps when unclear

**Given:** Last method detected as "none" (custom progression last time)
**When:** System calculates recommendation
**Then:** suggested = "reps" (default to safer option)
**And:** Reps increase is easier on joints than weight increase

---

### Requirement: Return Complete Progressive Suggestion

**Description:** System SHALL return a complete suggestion object containing last performance, both +3% options, detected method, and recommendation.

**Acceptance Criteria:**
- Includes last performance (weight, reps, date)
- Includes both weight and reps options (calculated)
- Includes detected last method
- Includes suggested method (alternating recommendation)
- Includes days since last performance
- Returns null if no history exists

#### Scenario: Complete suggestion with history

**Given:** User did Pull-ups on 2025-10-22 (30 reps @ 200lbs)
**And:** Previous workout on 2025-10-19 (29 reps @ 200lbs)
**And:** Today is 2025-10-25
**When:** System generates progressive suggestion
**Then:** Returns:
```json
{
  "lastPerformance": {
    "weight": 200,
    "reps": 30,
    "date": "2025-10-22"
  },
  "lastMethod": "reps",
  "weightOption": {
    "weight": 206,
    "reps": 30,
    "method": "weight"
  },
  "repsOption": {
    "weight": 200,
    "reps": 31,
    "method": "reps"
  },
  "suggested": "weight",
  "daysAgo": 3
}
```

#### Scenario: No history available

**Given:** User has never done "Dumbbell Row"
**When:** System generates progressive suggestion
**Then:** Returns null
**And:** UI shows "No history - establish baseline"

---

### Requirement: Handle Edge Cases Gracefully

**Description:** System SHALL handle edge cases (bodyweight exercises, very low weights, very high weights) without errors or invalid suggestions.

**Acceptance Criteria:**
- Works with bodyweight exercises (weight = user's bodyweight)
- Works with fractional weights (35.5lbs)
- Works with very low reps (1-3)
- Works with very high reps (50+)
- Never suggests negative values
- Never suggests zero weight or reps

#### Scenario: Bodyweight exercise progression

**Given:** Last performance: 30 reps @ 200lbs (user's bodyweight)
**When:** System calculates +3% weight
**Then:** Suggests 206lbs (200 × 1.03)
**And:** User can add weighted vest/belt to achieve 6lbs
**And:** Or user chooses +reps option instead

#### Scenario: Very low rep count

**Given:** Last performance: 3 reps @ 315lbs (heavy deadlift)
**When:** System calculates +3% reps
**Then:** New reps = 3 × 1.03 = 3.09 → rounds up to 4
**And:** Returns valid suggestion: 4 reps @ 315lbs

#### Scenario: Very high rep count

**Given:** Last performance: 100 reps @ 0lbs (bodyweight squats)
**When:** System calculates +3% reps
**Then:** New reps = 100 × 1.03 = 103
**And:** Returns valid suggestion: 103 reps

---

## MODIFIED Requirements

None. This is a new capability that extends workout logging without modifying existing behavior.

---

## REMOVED Requirements

None. All existing workout functionality remains unchanged.

---

## Dependencies

**Required:**
- ✅ `exercise_sets` table with workout_id, exercise_name, weight, reps
- ✅ `workouts` table with date
- ✅ Indexes on workout_id and exercise_name for query performance

**Consumed Capabilities:**
- `workout-history-display`: Provides historical performance data

**Provides To:**
- `progressive-suggestion-ui`: Supplies calculation results for display
- Future: `progression-analytics`: Historical progression tracking

---

## Implementation Notes

**File:** `backend/database/database.ts`

**New Functions:**

```typescript
function getLastPerformanceForExercise(
  exerciseName: string
): { weight: number; reps: number; date: string } | null {
  // Query last workout with this exercise, return first set
}

function getPreviousPerformanceForExercise(
  exerciseName: string
): { weight: number; reps: number; date: string } | null {
  // Query second-to-last workout with this exercise
}

function getProgressiveSuggestions(
  exerciseName: string
): ProgressiveSuggestion | null {
  // Main function - combines all logic
}
```

**Performance:** Expected <10ms per exercise (with indexes)

---

## Testing Coverage

**Unit Tests:**
- +3% weight calculation ✓
- +3% reps calculation ✓
- Weight rounding (decimal → integer) ✓
- Reps rounding (always up) ✓
- Method detection (weight increase) ✓
- Method detection (reps increase) ✓
- Method detection (both/neither) ✓
- Alternating recommendation logic ✓
- Edge cases (bodyweight, low reps, high reps) ✓

**Integration Tests:**
- Full suggestion generation workflow ✓
- Database queries with real data ✓
- API response structure ✓

---

## Success Criteria

- ✅ Accurately calculates +3% for both weight and reps
- ✅ Correctly detects last progression method
- ✅ Recommends alternating method intelligently
- ✅ Handles all edge cases without errors
- ✅ Query performance <10ms per exercise
- ✅ Returns null gracefully when no history
- ✅ All unit tests pass
