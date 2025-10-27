# multi-set-logging Specification

## Purpose
Enable users to log multiple sets of the same exercise within a single modal session, eliminating the need to repeatedly open/close the Quick Add interface.

## ADDED Requirements

### Requirement: Another Set Button
**ID:** `MSL-001`
**Priority:** P0 (Critical)

The system SHALL provide an "Another Set" button that allows users to log additional sets of the current exercise without closing the modal.

#### Scenario: User logs another set with same weight/reps

**Given** the user has logged Set 1 of "Push-ups" (20 reps @ 0 lbs)
**And** the modal shows the summary view
**When** the user clicks "Another Set"
**Then** the system SHALL switch to set-entry mode
**And** the system SHALL pre-fill exercise as "Push-ups"
**And** the system SHALL pre-fill weight as 0 lbs
**And** the system SHALL pre-fill reps as 20
**And** the system SHALL pre-fill to-failure as unchecked
**And** the system SHALL set set number to 2
**And** the system SHALL focus the reps input field

#### Scenario: User modifies weight/reps for subsequent set

**Given** the user has logged Set 1 of "Bench Press" (135 lbs, 10 reps)
**And** the user clicked "Another Set"
**And** the form is pre-filled with 135 lbs, 10 reps
**When** the user changes weight to 140 lbs
**And** the user changes reps to 8
**And** the user clicks "Log Set"
**Then** the system SHALL save Set 2 as 140 lbs, 8 reps
**And** the system SHALL return to summary view
**And** the summary SHALL show both sets:
  - "Set 1: 10 reps @ 135 lbs"
  - "Set 2: 8 reps @ 140 lbs"

#### Scenario: User can add unlimited sets

**Given** the user has logged 5 sets of "Squats"
**When** the user clicks "Another Set" again
**Then** the system SHALL allow logging Set 6
**And** the system SHALL increment set number to 6
**And** there SHALL be no maximum set limit enforced

---

### Requirement: Set Number Tracking
**ID:** `MSL-002`
**Priority:** P0 (Critical)

The system SHALL automatically track and increment set numbers for each exercise.

#### Scenario: Set numbers auto-increment

**Given** the user is logging "Pull-ups"
**When** the user logs the first set
**Then** the set SHALL be numbered 1
**When** the user clicks "Another Set" and logs
**Then** the set SHALL be numbered 2
**When** the user clicks "Another Set" and logs
**Then** the set SHALL be numbered 3

#### Scenario: Set numbers reset per exercise

**Given** the user has logged 3 sets of "Push-ups" (sets 1, 2, 3)
**When** the user clicks "Add Exercise"
**And** the user selects "Pull-ups"
**And** the user logs a set
**Then** the Pull-ups set SHALL be numbered 1
**And** the Push-ups sets SHALL remain numbered 1, 2, 3

---

### Requirement: Smart Progressive Defaults
**ID:** `MSL-003`
**Priority:** P1 (High)

When logging subsequent sets, the system SHALL apply intelligent progressive defaults based on typical fatigue patterns.

#### Scenario: Reps decrease suggestion for bodyweight

**Given** the user logged Set 1 of "Push-ups" with 20 reps @ 0 lbs
**When** the user clicks "Another Set"
**Then** the system SHALL suggest 18 reps (10% fewer)
**And** the weight SHALL remain 0 lbs

#### Scenario: Reps decrease suggestion for weighted exercise

**Given** the user logged Set 1 of "Bench Press" with 10 reps @ 135 lbs
**When** the user clicks "Another Set"
**Then** the system SHALL suggest 9 reps (10% fewer, rounded)
**And** the weight SHALL remain 135 lbs

#### Scenario: User can ignore suggestions

**Given** the "Another Set" form suggests 18 reps
**When** the user types 20 reps instead
**And** the user logs the set
**Then** the system SHALL accept 20 reps
**And** the system SHALL NOT show any error or warning

---

## MODIFIED Requirements

### Requirement: Quick Add Form Component
**ID:** `QA-UI-003` (from quick-add-ui)
**Priority:** P0 (Critical)

The QuickAddForm component SHALL support set number display and progressive defaults.

#### Scenario: Form displays current set number

**Given** the user is logging Set 3 of "Squats"
**When** the form renders
**Then** the form SHALL display "Squats - Set 3" in the header
**And** the set number SHALL be visible but not editable

#### Scenario: Form shows smart defaults label

**Given** the form is pre-filled with suggested values
**When** the form renders
**Then** weight input SHALL show "(last set: 135 lbs)" hint
**And** reps input SHALL show "(suggested: -10%)" hint
**And** hints SHALL be visually distinct (lighter text)
