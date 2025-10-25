# Spec: Progressive Overload Suggestions

**Capability:** progressive-overload-suggestions
**Change ID:** enable-smart-workout-continuation
**Status:** Draft

---

## ADDED Requirements

### Requirement: System SHALL calculate +3% progressive overload for weight
**ID:** POS-001
**Priority:** Must Have

The system SHALL calculate a 3% weight increase based on the user's last performance for the same exercise.

#### Scenario: Suggesting weight progression

**Given** the user's last performance for "Bench Press" was 100 lbs @ 8 reps
**And** the last progression method was "reps" (or null)
**When** the system calculates the progressive overload suggestion
**Then** the system SHALL suggest increasing weight by 3%
**And** the suggested weight SHALL be 103 lbs (100 × 1.03)
**And** the suggested reps SHALL remain 8 (same as last time)
**And** the progression method SHALL be recorded as "weight"

**Example:**
```
Last: 8 reps @ 100 lbs (progression_method = 'reps')
→ Suggest: 8 reps @ 103 lbs (+3% weight)
→ Record as: progression_method = 'weight'
```

---

### Requirement: System SHALL calculate +3% progressive overload for reps
**ID:** POS-002
**Priority:** Must Have

The system SHALL calculate a 3% rep increase based on the user's last performance for the same exercise.

#### Scenario: Suggesting reps progression

**Given** the user's last performance for "Bench Press" was 8 reps @ 100 lbs
**And** the last progression method was "weight"
**When** the system calculates the progressive overload suggestion
**Then** the system SHALL suggest increasing reps by 3%
**And** the suggested reps SHALL be 9 (ceil(8 × 1.03) = 9)
**And** the suggested weight SHALL remain 100 lbs (same as last time)
**And** the progression method SHALL be recorded as "reps"

**Example:**
```
Last: 8 reps @ 100 lbs (progression_method = 'weight')
→ Suggest: 9 reps @ 100 lbs (+3% reps)
→ Record as: progression_method = 'reps'
```

---

### Requirement: System SHALL alternate between weight and reps progression
**ID:** POS-003
**Priority:** Must Have

The system SHALL alternate the progression method between consecutive workouts to attack adaptation from multiple angles.

#### Scenario: Alternating progression across sessions

**Given** a series of workouts for the same exercise
**When** calculating progressive overload for each workout
**Then** the system SHALL apply the following pattern:
- Session 1 (baseline): progression_method = null
- Session 2: progression_method = "weight" (default when null)
- Session 3: progression_method = "reps" (opposite of last)
- Session 4: progression_method = "weight" (opposite of last)
- And so on...

**Example:**
```
Session 1: 8 reps @ 100 lbs (baseline, method = null)
Session 2: 8 reps @ 103 lbs (method = 'weight')
Session 3: 9 reps @ 100 lbs (method = 'reps', back to base weight)
Session 4: 9 reps @ 103 lbs (method = 'weight', new rep count)
Session 5: 10 reps @ 100 lbs (method = 'reps')
```

---

### Requirement: System SHALL round weight suggestions to practical increments
**ID:** POS-004
**Priority:** Must Have

The system SHALL round weight suggestions to the nearest 0.5 lb increment to match standard equipment.

#### Scenario: Rounding weight calculations

**Given** the calculated 3% weight increase results in a non-standard value
**When** the system generates the suggestion
**Then** the system SHALL round to the nearest 0.5 lb
**And** the rounded value SHALL be displayed to the user

**Example:**
```
Last: 97 lbs
Calculation: 97 × 1.03 = 99.91
→ Rounded: 100.0 lbs

Last: 83 lbs
Calculation: 83 × 1.03 = 85.49
→ Rounded: 85.5 lbs
```

**Formula:**
```typescript
roundedWeight = Math.round(calculatedWeight * 2) / 2
```

---

### Requirement: System SHALL round reps suggestions to whole numbers
**ID:** POS-005
**Priority:** Must Have

The system SHALL round rep suggestions up to the nearest whole number.

#### Scenario: Rounding rep calculations

**Given** the calculated 3% rep increase results in a decimal value
**When** the system generates the suggestion
**Then** the system SHALL round UP to the nearest whole number
**And** the minimum increase SHALL be 1 rep

**Example:**
```
Last: 8 reps
Calculation: 8 × 1.03 = 8.24
→ Rounded: 9 reps (ceil)

Last: 30 reps
Calculation: 30 × 1.03 = 30.9
→ Rounded: 31 reps (ceil)

Last: 5 reps
Calculation: 5 × 1.03 = 5.15
→ Rounded: 6 reps (minimum +1)
```

---

### Requirement: System SHALL NOT suggest below personal best
**ID:** POS-006
**Priority:** Must Have

The system SHALL NOT suggest a weight lower than the user's personal best for that exercise.

#### Scenario: Respecting personal bests during reps progression

**Given** the user's personal best for "Bench Press" is 105 lbs @ 10 reps
**And** the last workout was 9 reps @ 100 lbs (progression_method = 'weight')
**And** the next suggestion is for reps progression (back to base weight)
**When** the system calculates the suggestion
**Then** the system SHALL detect that 100 lbs < 105 lbs (PR)
**And** the system SHALL suggest 105 lbs @ 10 reps (match PR)
**Or** the system SHALL suggest 9 reps @ 105 lbs (use PR weight)
**And** the system SHALL display a note: "Using your PR weight"

**Example:**
```
PR: 105 lbs @ 10 reps
Last: 9 reps @ 100 lbs (method = 'weight')
Next method: 'reps'

Naive calculation: 10 reps @ 100 lbs
→ Adjusted: 10 reps @ 105 lbs (use PR weight)
```

---

### Requirement: System SHALL track progression method with workout
**ID:** POS-007
**Priority:** Must Have

The system SHALL record which progression method (weight or reps) was used for each workout.

#### Scenario: Recording progression method

**Given** the user completes a workout
**And** the workout includes progressive overload on one or more exercises
**When** the workout is saved
**Then** the system SHALL determine the predominant progression method
**And** the progression_method SHALL be stored in the workouts table
**And** the value SHALL be one of: "weight", "reps", or null

**Determination logic:**
```
If majority of exercises increased weight → "weight"
If majority of exercises increased reps → "reps"
If first workout or no clear majority → null
```

---

### Requirement: System SHALL display progression suggestions in UI
**ID:** POS-008
**Priority:** Must Have

The system SHALL display progressive overload suggestions alongside each exercise in the workout UI.

#### Scenario: Showing suggestions to user

**Given** the user is viewing an exercise from their last workout
**When** the UI renders the exercise
**Then** the UI SHALL display:
- Last performance: "{reps} reps @ {weight} lbs"
- Suggested performance: "{suggestedReps} reps @ {suggestedWeight} lbs"
- Progression type badge: "+3% WEIGHT" or "+3% REPS"
- Visual indicator (arrow/highlight) showing what changed

**Example UI:**
```
Bench Press                    [+3% REPS]
Last: 8 reps @ 103 lbs
Try:  9 reps @ 103 lbs ↑

[Set 1] Weight: 103  Reps: 9  [Log Set]
```

---

### Requirement: System SHALL allow user to override suggestions
**ID:** POS-009
**Priority:** Must Have

The system SHALL allow users to modify or ignore progressive overload suggestions.

#### Scenario: User overrides suggestion

**Given** the system suggests 9 reps @ 100 lbs
**When** the user enters 10 reps @ 105 lbs instead
**Then** the system SHALL accept the user's input
**And** the system SHALL record the actual performance (10 @ 105)
**And** the next workout's suggestions SHALL be based on actual performance
**And** the system SHALL check if this is a new personal best

---

### Requirement: System SHALL handle exercises not in previous workout
**ID:** POS-010
**Priority:** Must Have

The system SHALL gracefully handle exercises that were not performed in the previous workout.

#### Scenario: New exercise added to template

**Given** the current template includes "Dumbbell Flyes"
**And** the last workout did not include "Dumbbell Flyes"
**When** the UI displays the exercise
**Then** the system SHALL NOT show last performance
**And** the system SHALL NOT show a suggestion
**And** the user SHALL enter baseline performance
**And** this performance SHALL be used for future suggestions

---

### Requirement: Database schema SHALL support progression tracking
**ID:** POS-011
**Priority:** Must Have

The workouts table SHALL be modified to include a progression_method column.

#### Scenario: Database schema migration

**Given** the existing workouts table
**When** the database migration is applied
**Then** the workouts table SHALL have:
- progression_method column (TEXT, nullable)
**And** valid values SHALL be: "weight", "reps", null
**And** existing workouts SHALL default to null

**Schema:**
```sql
ALTER TABLE workouts ADD COLUMN progression_method TEXT;
```

---

## MODIFIED Requirements

*(No requirements modified - this is a new capability)*

---

## REMOVED Requirements

*(No requirements removed)*

---

## Cross-References

**Depends on:**
- workout-variation-tracking (needs last workout data)
- Personal bests tracking (existing)
- Exercise sets data (existing)

**Enables:**
- Intelligent workout progression
- User motivation through clear goals
- Systematic strength building

**Related:**
- workout-loading-ui (displays these suggestions)
