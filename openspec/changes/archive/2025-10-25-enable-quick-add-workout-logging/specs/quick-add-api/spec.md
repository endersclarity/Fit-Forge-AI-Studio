# Spec: Quick-Add API

**Capability:** `quick-add-api`
**Change:** `enable-quick-add-workout-logging`
**Version:** 1.0

---

## Overview

This spec defines the backend API endpoint and services that enable frictionless exercise logging through a "quick-add" system. The API creates minimal workout records, updates muscle fatigue states, detects personal records, and provides smart defaults for progressive overload.

**Related Capabilities:**
- `quick-add-ui` - Frontend components that consume this API
- `quick-add-history-integration` - History display that shows quick-add workouts

**Related Specs:**
- `failure-status-tracking` - Reuses to_failure flag logic
- `pr-detection-and-celebration` - Integrates PR detection
- `progressive-overload-suggestions` - Uses progressive overload formulas
- `backend-muscle-state-calculation` - Reuses muscle fatigue engine

---

## ADDED Requirements

### Requirement: Quick-Add Endpoint Creation
**ID:** `QA-API-001`
**Priority:** P0 (Critical)

The system SHALL provide a POST endpoint at `/api/quick-add` that accepts exercise logging data and creates workout records with muscle state updates.

#### Scenario: User logs single exercise set via quick-add

**Given** the user has opened the quick-add interface
**And** the user selects "Pull-ups" exercise
**And** the user enters weight 200 lbs and reps 10
**When** the user submits the quick-add form
**Then** the system SHALL create a new workout record with:
- `category` = "Quick Add"
- `variation` = "Both"
- `duration_seconds` = 0
- `date` = current date (UTC ISO 8601)
**And** the system SHALL create an exercise_set record with:
- `workout_id` = newly created workout ID
- `exercise_name` = "Pull-ups"
- `weight` = 200
- `reps` = 10
- `set_number` = 1
- `to_failure` = false (default)
**And** the system SHALL update muscle_states for all engaged muscles
**And** the system SHALL return status 200 with QuickAddResponse containing:
- Created workout data
- Updated muscle states
- PR info (if applicable)

---

### Requirement: Request Validation
**ID:** `QA-API-002`
**Priority:** P0 (Critical)

The system SHALL validate all quick-add requests and reject invalid data with descriptive error messages.

#### Scenario: User submits invalid exercise name

**Given** the user attempts to log an exercise
**When** the user submits exercise_name "InvalidExercise" (not in EXERCISE_LIBRARY)
**Then** the system SHALL return status 400
**And** the system SHALL return error message "Invalid exercise name"
**And** the system SHALL NOT create any database records

#### Scenario: User submits negative weight

**Given** the user attempts to log an exercise
**When** the user submits weight -10
**Then** the system SHALL return status 400
**And** the system SHALL return error message "Weight must be between 0 and 10000 lbs"

#### Scenario: User submits non-integer reps

**Given** the user attempts to log an exercise
**When** the user submits reps 10.5
**Then** the system SHALL return status 400
**And** the system SHALL return error message "Reps must be a positive integer between 1 and 1000"

---

### Requirement: Smart Defaults Endpoint
**ID:** `QA-API-003`
**Priority:** P0 (Critical)

The system SHALL provide a GET endpoint at `/api/workouts/last-two-sets` that returns the last two performances of a specific exercise for progressive overload calculations.

#### Scenario: User selects exercise with previous performance

**Given** the user has logged "Pull-ups" twice before:
- 3 days ago: 200 lbs × 10 reps (weight progression)
- 7 days ago: 195 lbs × 10 reps
**When** the system receives GET `/api/workouts/last-two-sets?exerciseName=Pull-ups`
**Then** the system SHALL return status 200 with:
```json
{
  "lastSet": {
    "weight": 200,
    "reps": 10,
    "to_failure": true,
    "date": "2025-10-22T12:00:00Z"
  },
  "secondLastSet": {
    "weight": 195,
    "reps": 10,
    "to_failure": true,
    "date": "2025-10-18T12:00:00Z"
  }
}
```

#### Scenario: User selects exercise with no previous performance

**Given** the user has never logged "Dumbbell Row"
**When** the system receives GET `/api/workouts/last-two-sets?exerciseName=Dumbbell Row`
**Then** the system SHALL return status 200 with:
```json
{
  "lastSet": null,
  "secondLastSet": null
}
```

---

### Requirement: Muscle Fatigue Integration
**ID:** `QA-API-004`
**Priority:** P0 (Critical)
**Related:** `backend-muscle-state-calculation`

The system SHALL calculate and update muscle fatigue states using the same algorithm as full workout sessions when processing quick-adds.

#### Scenario: Quick-add updates muscle fatigue correctly

**Given** user's current muscle states are:
- Lats: 5% fatigue
- Biceps: 10% fatigue
- Rhomboids: 8% fatigue
**When** user quick-adds "Pull-ups" at 200 lbs × 10 reps
**Then** the system SHALL calculate volume = 200 × 10 = 2000
**And** the system SHALL apply muscle engagement percentages:
- Lats (85%): delta = (2000 × 0.85) / 10000 = 17%
- Biceps (30%): delta = (2000 × 0.30) / 10000 = 6%
- Rhomboids (20%): delta = (2000 × 0.20) / 10000 = 4%
**And** the system SHALL update muscle_states table:
- Lats: initial_fatigue_percent = 5 + 17 = 22%, last_trained = NOW()
- Biceps: initial_fatigue_percent = 10 + 6 = 16%, last_trained = NOW()
- Rhomboids: initial_fatigue_percent = 8 + 4 = 12%, last_trained = NOW()
**And** the system SHALL return updated muscle states in response

---

### Requirement: Personal Best Detection
**ID:** `QA-API-005`
**Priority:** P1 (High)
**Related:** `pr-detection-and-celebration`

The system SHALL detect personal records during quick-adds using the same algorithm as full workout sessions.

#### Scenario: Quick-add sets new single-set PR

**Given** user's current PR for "Pull-ups" is:
- best_single_set = 2000 (200 lbs × 10 reps)
**When** user quick-adds "Pull-ups" at 206 lbs × 10 reps
**Then** the system SHALL calculate volume = 206 × 10 = 2060
**And** the system SHALL detect 2060 > 2000 (NEW PR)
**And** the system SHALL update personal_bests table:
- best_single_set = 2060
- updated_at = NOW()
**And** the system SHALL return pr_info in response:
```json
{
  "isPR": true,
  "exercise": "Pull-ups",
  "newVolume": 2060,
  "previousVolume": 2000,
  "improvement": 60,
  "percentIncrease": 3,
  "isFirstTime": false
}
```

#### Scenario: Quick-add does not set new PR

**Given** user's current PR for "Pull-ups" is 2500
**When** user quick-adds "Pull-ups" at 200 lbs × 10 reps (volume = 2000)
**Then** the system SHALL detect 2000 < 2500 (not a PR)
**And** the system SHALL NOT update personal_bests table
**And** the system SHALL NOT include pr_info in response

---

### Requirement: Active Workout Integration
**ID:** `QA-API-006`
**Priority:** P2 (Medium)

The system SHALL support attaching quick-adds to active workout sessions when requested.

#### Scenario: Quick-add during active workout attaches to existing session

**Given** user has started a workout at 10:00 AM (not yet ended)
**And** the active workout is "Pull Day A"
**When** user quick-adds "Pull-ups" with attach_to_active_workout=true
**Then** the system SHALL add the exercise set to the active workout
**And** the system SHALL set set_number = next available for this exercise in workout
**And** the system SHALL NOT create a new workout record
**And** the system SHALL return attached_to_active=true in response

#### Scenario: Quick-add with no active workout creates standalone record

**Given** user has no active workouts (all workouts have end times)
**When** user quick-adds "Pull-ups" with attach_to_active_workout=true
**Then** the system SHALL create a new "Quick Add" workout record
**And** the system SHALL return attached_to_active=false in response

---

### Requirement: Transaction Integrity
**ID:** `QA-API-007`
**Priority:** P0 (Critical)

The system SHALL wrap all quick-add database operations in a single transaction to ensure data consistency.

#### Scenario: Muscle state update fails, entire quick-add rolls back

**Given** user submits a valid quick-add request
**When** the workout and exercise_set inserts succeed
**But** the muscle_states update fails due to database error
**Then** the system SHALL rollback the entire transaction
**And** the system SHALL NOT create workout or exercise_set records
**And** the system SHALL return status 500
**And** the system SHALL return error message "Failed to log exercise"

---

### Requirement: Date Handling
**ID:** `QA-API-008`
**Priority:** P1 (High)

The system SHALL accept optional date parameter for backdated quick-adds and default to current date if not provided.

#### Scenario: User backdates quick-add to yesterday

**Given** today is 2025-10-25
**When** user submits quick-add with date "2025-10-24T14:30:00Z"
**Then** the system SHALL create workout with date = "2025-10-24"
**And** the system SHALL create exercise_set with created_at from request date
**And** the system SHALL update muscle_states with last_trained = "2025-10-24T14:30:00Z"

#### Scenario: User omits date parameter

**Given** current time is 2025-10-25T12:00:00Z
**When** user submits quick-add without date parameter
**Then** the system SHALL create workout with date = current date
**And** the system SHALL use current timestamp for created_at fields

---

### Requirement: Performance Optimization
**ID:** `QA-API-009`
**Priority:** P1 (High)

The system SHALL complete quick-add requests in under 200ms (95th percentile).

#### Scenario: Quick-add completes within performance target

**Given** database has 1000 existing workouts
**And** database has 13 muscle states
**And** database has 50 personal best records
**When** user submits quick-add request
**Then** the system SHALL respond within 200ms
**And** the response SHALL include complete workout, muscle states, and PR data

---

### Requirement: Error Handling
**ID:** `QA-API-010`
**Priority:** P0 (Critical)

The system SHALL handle all error conditions gracefully and return descriptive error messages.

#### Scenario: Database connection fails during quick-add

**Given** the database connection is unavailable
**When** user submits quick-add request
**Then** the system SHALL return status 500
**And** the system SHALL return error message "Database connection failed"
**And** the system SHALL log error details for debugging

#### Scenario: Invalid JSON in request body

**Given** user submits malformed JSON
**When** the system attempts to parse request body
**Then** the system SHALL return status 400
**And** the system SHALL return error message "Invalid JSON format"

---

## API Contracts

### POST /api/quick-add

**Request:**
```typescript
{
  exercise_name: string;          // Required, must exist in EXERCISE_LIBRARY
  weight: number;                  // Required, 0-10000
  reps: number;                    // Required, 1-1000, integer
  to_failure?: boolean;            // Optional, defaults to false
  date?: string;                   // Optional, ISO 8601, defaults to now
  attach_to_active_workout?: boolean; // Optional, defaults to false
}
```

**Response (200 OK):**
```typescript
{
  workout: WorkoutResponse;        // Created or updated workout
  muscle_states: MuscleStatesResponse; // All 13 muscles with calculated fields
  pr_info?: PRInfo;                // Only if new PR was set
  attached_to_active: boolean;     // True if added to existing workout
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `500 Internal Server Error` - Database or server errors

### GET /api/workouts/last-two-sets

**Query Parameters:**
```
exerciseName: string  // Required, exercise name to lookup
```

**Response (200 OK):**
```typescript
{
  lastSet: {
    weight: number;
    reps: number;
    to_failure: boolean;
    date: string;  // ISO 8601
  } | null,
  secondLastSet: {
    weight: number;
    reps: number;
    to_failure: boolean;
    date: string;  // ISO 8601
  } | null
}
```

---

## Database Schema Impact

**No schema changes required.** Uses existing tables:

### workouts
Quick-adds create rows with:
- `category` = "Quick Add"
- `variation` = "Both"
- `duration_seconds` = 0

### exercise_sets
Standard rows, no special handling

### muscle_states
Updated using existing fatigue calculation algorithm

### personal_bests
Updated using existing PR detection algorithm

---

## Performance Requirements

| Operation | Target | Measurement |
|-----------|--------|-------------|
| POST /api/quick-add | < 200ms (p95) | Time from request to response |
| GET /api/workouts/last-two-sets | < 50ms (p95) | Time from request to response |
| Database transaction | < 100ms | Time from BEGIN to COMMIT |
| Muscle state calculation | < 20ms | Time to calculate all 13 muscles |
| PR detection | < 10ms | Time to check and update PR |

---

## Testing Requirements

### Unit Tests
- [ ] Validate request with valid data
- [ ] Reject request with invalid exercise name
- [ ] Reject request with negative weight
- [ ] Reject request with non-integer reps
- [ ] Reject request with future date
- [ ] Create workout and exercise_set correctly
- [ ] Update muscle states correctly
- [ ] Detect PR correctly
- [ ] Handle no PR correctly
- [ ] Attach to active workout when requested
- [ ] Create standalone workout when no active workout
- [ ] Rollback transaction on error
- [ ] Return last-two-sets correctly
- [ ] Handle no previous sets correctly
- [ ] Meet performance targets

### Integration Tests
- [ ] End-to-end quick-add flow
- [ ] Quick-add updates Dashboard muscle states
- [ ] Quick-add triggers PR notification
- [ ] Quick-add appears in workout history
- [ ] Smart defaults pre-fill correctly
- [ ] Progressive overload calculation accurate

---

## Dependencies

**Requires:**
- `backend/database/database.ts` - Existing workout save functions
- `backend/server.ts` - Express app setup
- `constants.ts` - EXERCISE_LIBRARY
- `muscle_states` table - Existing schema
- `personal_bests` table - Existing schema

**Provides:**
- POST /api/quick-add endpoint
- GET /api/workouts/last-two-sets endpoint
- Smart defaults for progressive overload
- Real-time muscle state updates
- PR detection for quick-adds

---

## Migration Notes

**No database migration needed.**

Existing workouts can be identified as quick-adds by:
- `category = "Quick Add"`
- OR `duration_seconds = 0`

---

## Security Considerations

- Input validation prevents SQL injection
- Parameterized queries for all DB operations
- Single-user app, no authentication bypass risk
- Rate limiting recommended (future enhancement)
- No sensitive data exposure in responses

---

*This spec ensures quick-add API integrates seamlessly with existing FitForge backend systems while providing the foundation for frictionless exercise logging.*
