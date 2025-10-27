# workout-session-grouping Specification

## Purpose
Group all exercises and sets logged in a single Quick Workout Logger session into one cohesive workout with auto-detected category and variation.

## ADDED Requirements

### Requirement: Batch Workout API Endpoint
**ID:** `WSG-001`
**Priority:** P0 (Critical)

The system SHALL provide a new API endpoint that accepts multiple exercises with multiple sets and creates one workout.

#### Scenario: API accepts multi-exercise payload

**Given** the API endpoint `POST /api/quick-workout` exists
**When** a request is made with payload:
```json
{
  "exercises": [
    {
      "exercise_name": "Push-ups",
      "sets": [
        {"weight": 0, "reps": 20, "to_failure": false},
        {"weight": 0, "reps": 18, "to_failure": false}
      ]
    },
    {
      "exercise_name": "Dips",
      "sets": [
        {"weight": 0, "reps": 15, "to_failure": true}
      ]
    }
  ],
  "timestamp": "2025-10-26T14:30:00Z"
}
```
**Then** the API SHALL return 200 OK
**And** the API SHALL create ONE workout record
**And** the API SHALL create 3 exercise_sets records (2 for Push-ups, 1 for Dips)
**And** all exercise_sets SHALL reference the same workout_id

#### Scenario: API validates exercise names

**Given** the API receives a workout with exercise "Nonexistent Exercise"
**When** the API processes the request
**Then** the API SHALL return 400 Bad Request
**And** the response SHALL include error: "Invalid exercise name: Nonexistent Exercise"
**And** NO workout or exercise_sets SHALL be created

#### Scenario: API validates timestamp format

**Given** the API receives a workout with invalid timestamp "not-a-date"
**When** the API processes the request
**Then** the API SHALL return 400 Bad Request
**And** the response SHALL include error: "Invalid timestamp format"

---

### Requirement: Category Auto-Detection
**ID:** `WSG-002`
**Priority:** P0 (Critical)

The system SHALL automatically detect the workout category based on logged exercises.

#### Scenario: Single category workout

**Given** the workout includes exercises: "Push-ups", "Bench Press", "Dips"
**And** all exercises are in "Push" category
**When** the API processes the workout
**Then** the workout SHALL be assigned category "Push"
**And** the category field SHALL be set in the workout record

#### Scenario: Mixed category workout - majority wins

**Given** the workout includes exercises:
  - "Push-ups" (Push)
  - "Bench Press" (Push)
  - "Pull-ups" (Pull)
**When** the API processes the workout
**Then** the workout SHALL be assigned category "Push"
**And** the system SHALL choose the category with most exercises (2 Push vs 1 Pull)

#### Scenario: Mixed category workout - tie breaker

**Given** the workout includes exercises:
  - "Push-ups" (Push)
  - "Pull-ups" (Pull)
**When** the API processes the workout
**Then** the workout SHALL be assigned category of the first logged exercise ("Push")
**And** ties SHALL be broken by first exercise's category

#### Scenario: Single exercise workout

**Given** the workout includes only "Squats" (Legs)
**When** the API processes the workout
**Then** the workout SHALL be assigned category "Legs"

---

### Requirement: Variation Auto-Detection (A/B)
**ID:** `WSG-003`
**Priority:** P0 (Critical)

The system SHALL automatically assign workout variation (A or B) based on last workout of same category.

#### Scenario: No previous workouts - assign A

**Given** this is the user's first "Push" workout
**When** the API processes the workout
**Then** the workout SHALL be assigned variation "A"
**And** the variation field SHALL be set to "A"

#### Scenario: Last workout was A - assign B

**Given** the user's last "Push" workout was variation "A"
**And** the new workout is also "Push" category
**When** the API processes the workout
**Then** the workout SHALL be assigned variation "B"
**And** the system SHALL alternate from previous variation

#### Scenario: Last workout was B - assign A

**Given** the user's last "Pull" workout was variation "B"
**And** the new workout is also "Pull" category
**When** the API processes the workout
**Then** the workout SHALL be assigned variation "A"
**And** the system SHALL alternate from previous variation

#### Scenario: Different category - independent variation

**Given** the user's last "Push" workout was variation "A"
**When** the user logs a "Pull" workout
**Then** the system SHALL check last "Pull" workout only
**And** "Push" variation SHALL NOT affect "Pull" variation assignment

---

### Requirement: Duration Estimation
**ID:** `WSG-004`
**Priority:** P1 (High)

The system SHALL estimate workout duration based on set count and reasonable rest assumptions.

#### Scenario: Duration estimated for workout

**Given** the workout has 9 total sets across all exercises
**When** the API calculates duration
**Then** the duration SHALL be estimated as:
  - 9 sets × 30 seconds execution = 270 seconds
  - 8 rest periods × 60 seconds = 480 seconds
  - Total = 750 seconds (12.5 minutes)
**And** the workout record SHALL store duration_seconds = 750

#### Scenario: Single set has minimum duration

**Given** the workout has only 1 set
**When** the API calculates duration
**Then** the duration SHALL be 30 seconds
**And** no rest time SHALL be added

---

### Requirement: Workout Timestamp Handling
**ID:** `WSG-005`
**Priority:** P1 (High)

The system SHALL use provided timestamp or default to current time.

#### Scenario: User provides timestamp

**Given** the API receives timestamp "2025-10-26T08:00:00Z"
**When** the workout is created
**Then** the workout.date SHALL be "2025-10-26"
**And** the workout.created_at SHALL be "2025-10-26T08:00:00Z"

#### Scenario: No timestamp provided - use current time

**Given** the API receives no timestamp field
**When** the workout is created at 2025-10-26T14:30:00Z
**Then** the workout.date SHALL be "2025-10-26"
**And** the workout.created_at SHALL be "2025-10-26T14:30:00Z"

---

### Requirement: Post-Workout Processing
**ID:** `WSG-006`
**Priority:** P0 (Critical)

The system SHALL trigger all standard workout post-processing: PR detection, baseline updates, muscle state updates.

#### Scenario: PR detection runs for all exercises

**Given** the workout includes "Push-ups" and "Pull-ups"
**And** the Push-ups Set 1 (20 reps) beats previous best (18 reps)
**When** the API processes the workout
**Then** the API SHALL run PR detection for Push-ups
**And** the API SHALL run PR detection for Pull-ups
**And** the response SHALL include PR info for Push-ups

#### Scenario: Muscle states updated based on total volume

**Given** the workout includes:
  - "Push-ups": 2 sets, 40 total volume
  - "Bench Press": 2 sets, 1080 total volume
**When** the API processes the workout
**Then** the system SHALL calculate Chest volume from both exercises
**And** the system SHALL update muscle_states for all engaged muscles
**And** muscle fatigue percentages SHALL reflect combined volume

#### Scenario: Baselines updated if volume exceeded

**Given** the Chest muscle baseline is 5000 lbs
**And** the workout generates 5500 lbs of Chest volume
**When** the API processes the workout
**Then** the system SHALL update Chest baseline to 5500 lbs
**And** the response SHALL include updated_baselines with "Chest"

---

## MODIFIED Requirements

### Requirement: Workout History Display
**ID:** `WH-001` (from workout-history-display)
**Priority:** P1 (High)

The workout history SHALL display quick-logged workouts identically to full workout tracker sessions.

#### Scenario: Quick-logged workout appears in history

**Given** the user completed a quick workout log with 3 exercises
**When** the user views workout history
**Then** the workout SHALL appear in chronological list
**And** the workout SHALL show category badge ("Push Day A")
**And** the workout SHALL show exercise count ("3 exercises, 9 sets")
**And** the workout SHALL be indistinguishable from full-tracker workouts
