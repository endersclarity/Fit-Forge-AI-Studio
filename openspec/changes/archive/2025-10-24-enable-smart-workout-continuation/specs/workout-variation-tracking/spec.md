# Spec: Workout Variation Tracking

**Capability:** workout-variation-tracking
**Change ID:** enable-smart-workout-continuation
**Status:** Draft

---

## ADDED Requirements

### Requirement: System SHALL track workout category with each workout session
**ID:** WVT-001
**Priority:** Must Have

The system SHALL record the workout category (Push, Pull, Legs, or Core) for every workout session.

#### Scenario: Logging a workout with category

**Given** a user is logging a workout session
**And** they select exercises from a template or manually
**When** the workout is saved
**Then** the system SHALL store the category associated with the workout
**And** the category SHALL be one of: "Push", "Pull", "Legs", "Core"
**And** the category SHALL be determined from:
- The template category if loaded from a template, OR
- The predominant exercise category if exercises added manually

**Example:**
```
User loads "Push A" template
→ Workout saved with category = "Push"

User adds 3 Push exercises + 1 Pull exercise manually
→ Workout saved with category = "Push" (predominant)
```

---

### Requirement: System SHALL track workout variation (A or B) with each workout session
**ID:** WVT-002
**Priority:** Must Have

The system SHALL record the workout variation (A or B) for every workout session.

#### Scenario: Logging a workout with variation

**Given** a user is logging a workout session
**When** the workout is saved
**Then** the system SHALL store the variation (A or B)
**And** the variation SHALL default to the template variation if using a template
**And** the user SHALL be able to override the variation selection

**Example:**
```
User loads "Push A" template
→ variation field defaults to "A"
→ User can toggle to "B" if desired
→ Workout saved with selected variation
```

---

### Requirement: System SHALL query last workout by category
**ID:** WVT-003
**Priority:** Must Have

The system SHALL provide an API endpoint to retrieve the most recent workout for a given category.

#### Scenario: Fetching last Push workout

**Given** the user has completed multiple workouts
**And** at least one workout has category = "Push"
**When** the system queries for the last "Push" workout
**Then** the system SHALL return the most recent workout with category = "Push"
**And** the result SHALL include:
- Workout ID, date, variation
- All exercises performed in that workout
- All sets (weight, reps) for each exercise
- Progression method used (if available)

**Example:**
```
Database has:
- 2025-10-20: Push B workout
- 2025-10-22: Pull A workout
- 2025-10-23: Push A workout

Query: GET /api/workouts/last?category=Push
Result: 2025-10-23 Push A workout (most recent Push)
```

#### Scenario: No previous workout for category

**Given** the user has never logged a workout for a specific category
**When** the system queries for the last workout in that category
**Then** the system SHALL return a 404 or empty result
**And** the UI SHALL display "Start your first {category} workout!"

---

### Requirement: System SHALL display variation suggestion based on last workout
**ID:** WVT-004
**Priority:** Must Have

The system SHALL suggest the opposite variation from the last workout in the same category.

#### Scenario: Suggesting opposite variation

**Given** the user's last "Push" workout was variation "B"
**When** the user starts a new "Push" workout
**Then** the system SHALL suggest variation "A"
**And** the suggestion SHALL be displayed prominently in the UI
**And** the user SHALL be able to override and select any variation

**Example:**
```
Last Push workout: Push B (3 days ago)
→ System suggests: "Try Push A today"
→ User can still select Push B if desired
```

---

### Requirement: Database schema SHALL support category and variation
**ID:** WVT-005
**Priority:** Must Have

The workouts table SHALL be modified to include category and variation columns.

#### Scenario: Database schema migration

**Given** the existing workouts table
**When** the database migration is applied
**Then** the workouts table SHALL have:
- category column (TEXT, nullable for backward compatibility)
- variation column (TEXT, already exists)
**And** existing workouts without category SHALL be queryable
**And** new workouts SHALL require category to be set

**Schema:**
```sql
ALTER TABLE workouts ADD COLUMN category TEXT;
-- variation TEXT already exists from previous schema
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
- Existing workout logging system
- Existing workout templates with A/B variations

**Enables:**
- Progressive overload suggestions (requires knowing which variation was used)
- Workout loading UI (needs to fetch last workout)

**Related:**
- Workout Templates feature (already implements A/B system)
