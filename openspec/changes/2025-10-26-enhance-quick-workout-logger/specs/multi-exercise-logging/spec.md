# multi-exercise-logging Specification

## Purpose
Allow users to log multiple different exercises in a single workout session, enabling complete workout logging without modal closure.

## ADDED Requirements

### Requirement: Add Exercise Button
**ID:** `MEL-001`
**Priority:** P0 (Critical)

The system SHALL provide an "Add Exercise" button that returns the user to the exercise picker to select a different exercise.

#### Scenario: User adds second exercise to workout

**Given** the user has logged 3 sets of "Push-ups"
**And** the summary view is displayed
**When** the user clicks "Add Exercise"
**Then** the system SHALL switch to exercise-picker mode
**And** the system SHALL display the ExercisePicker component
**And** the system SHALL maintain the 3 sets of "Push-ups" in state
**And** the system SHALL NOT close the modal

#### Scenario: User selects new exercise after adding

**Given** the user clicked "Add Exercise"
**And** the exercise picker is displayed
**When** the user selects "Pull-ups"
**Then** the system SHALL switch to set-entry mode
**And** the system SHALL show "Pull-ups - Set 1"
**And** the system SHALL fetch smart defaults for "Pull-ups"
**And** the system SHALL NOT clear "Push-ups" sets from state

#### Scenario: User can add unlimited exercises

**Given** the user has logged 5 different exercises
**When** the user clicks "Add Exercise"
**Then** the system SHALL allow selecting a 6th exercise
**And** there SHALL be no maximum exercise limit enforced

---

### Requirement: Exercise State Management
**ID:** `MEL-002`
**Priority:** P0 (Critical)

The system SHALL maintain separate set lists for each exercise logged in the current workout session.

#### Scenario: Sets tracked per exercise

**Given** the user has logged:
  - "Push-ups": Set 1 (20 reps), Set 2 (18 reps)
  - "Pull-ups": Set 1 (10 reps)
**When** the user views the summary
**Then** the system SHALL display:
  - "Push-ups" with 2 sets
  - "Pull-ups" with 1 set
**And** each exercise SHALL show its own set list

#### Scenario: Adding set to specific exercise

**Given** the user has logged:
  - "Push-ups": 2 sets
  - "Pull-ups": 1 set
  - "Dips": 2 sets
**And** the summary view shows all exercises
**When** the user clicks "Another Set" for "Pull-ups"
**Then** the system SHALL open set-entry form for "Pull-ups"
**And** the system SHALL set set number to 2
**And** "Push-ups" and "Dips" SHALL remain unchanged

---

### Requirement: Exercise Picker State Persistence
**ID:** `MEL-003`
**Priority:** P1 (High)

The exercise picker SHALL remember search/filter state across multiple uses within the same workout session.

#### Scenario: Search persists when returning to picker

**Given** the user searched "pull" in exercise picker
**And** the user selected "Pull-ups"
**And** the user logged 2 sets
**When** the user clicks "Add Exercise"
**Then** the exercise picker search SHALL be cleared
**And** the picker SHALL show all exercises by default
**And** the user SHALL start with fresh search state

#### Scenario: Recently selected exercises shown first

**Given** the user has selected "Push-ups" in this session
**When** the user clicks "Add Exercise"
**Then** "Push-ups" SHALL appear in "Recently Selected" section
**And** clicking it SHALL allow logging more sets of same exercise
**And** this SHALL NOT create duplicate exercise entry

---

## MODIFIED Requirements

### Requirement: Exercise Picker Component
**ID:** `QA-UI-002` (from quick-add-ui)
**Priority:** P0 (Critical)

The ExercisePicker SHALL support returning after logging and prevent duplicate exercise selection.

#### Scenario: Picker warns about duplicate exercise

**Given** the user has already logged "Push-ups" in current session
**When** the user opens exercise picker via "Add Exercise"
**And** the user attempts to select "Push-ups" again
**Then** the system SHALL show info message: "Already logged Push-ups. Use 'Another Set' to add more sets."
**And** the system SHALL return to summary view
**And** the system SHALL NOT create duplicate exercise entry

#### Scenario: Picker shows workout context

**Given** the user has logged 2 exercises already
**When** the exercise picker opens
**Then** the picker SHALL display "Adding exercise 3 of workout" context
**And** the picker SHALL NOT show already-logged exercises in main list
**Or** SHALL show them with "Already logged" badge
