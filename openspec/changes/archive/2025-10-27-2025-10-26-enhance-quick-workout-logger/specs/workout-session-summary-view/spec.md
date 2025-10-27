# workout-session-summary-view Specification

## Purpose
Provide a visual summary of all logged exercises and sets within the current workout session, with clear action buttons for next steps.

## ADDED Requirements

### Requirement: Summary View Component
**ID:** `WSS-001`
**Priority:** P0 (Critical)

The system SHALL display a summary view showing all logged exercises with their sets after each set is logged.

#### Scenario: Summary shows logged exercises

**Given** the user has logged:
  - "Push-ups": Set 1 (20 reps @ 0 lbs), Set 2 (18 reps @ 0 lbs)
  - "Pull-ups": Set 1 (10 reps @ 0 lbs)
**When** the summary view renders
**Then** the system SHALL display:
```
Logged Exercises:

Push-ups
 • Set 1: 20 reps @ 0 lbs
 • Set 2: 18 reps @ 0 lbs

Pull-ups
 • Set 1: 10 reps @ 0 lbs
```
**And** exercises SHALL be listed in chronological order (first logged first)
**And** sets SHALL be numbered within each exercise

#### Scenario: Summary is scrollable with many exercises

**Given** the user has logged 8 exercises with 3 sets each (24 total sets)
**When** the summary view renders
**Then** the summary content SHALL be scrollable
**And** the action buttons SHALL remain fixed at bottom
**And** the modal height SHALL NOT exceed 90vh

#### Scenario: To-failure indicator shown

**Given** the user logged Set 2 of "Push-ups" with to-failure=true
**When** the summary displays that set
**Then** the set line SHALL show "Set 2: 18 reps @ 0 lbs 🔥"
**And** the flame emoji SHALL indicate to-failure

---

### Requirement: Action Buttons in Summary
**ID:** `WSS-002`
**Priority:** P0 (Critical)

The summary view SHALL provide three action buttons with clear visual hierarchy.

#### Scenario: Three action buttons displayed

**Given** the summary view is rendered
**And** at least one set has been logged
**When** the user views the action buttons
**Then** the system SHALL display three buttons:
  - "➕ Another Set" (secondary style)
  - "🔄 Add Exercise" (secondary style)
  - "✓ Finish Workout" (primary style, prominent)
**And** buttons SHALL be stacked vertically on mobile
**And** buttons SHALL be horizontally arranged on desktop

#### Scenario: Another Set button contextual to last exercise

**Given** the user last logged Set 2 of "Pull-ups"
**When** the summary view renders
**Then** "Another Set" button SHALL show "➕ Another Set of Pull-ups"
**And** the button SHALL be contextually labeled

#### Scenario: Finish Workout button prominence

**Given** the summary view is displayed
**When** the user views the buttons
**Then** "Finish Workout" button SHALL have:
  - Primary brand color (brand-cyan background)
  - Larger size than other buttons
  - Higher visual weight
**And** "Another Set" and "Add Exercise" SHALL have secondary styling

---

### Requirement: Summary View State Transitions
**ID:** `WSS-003`
**Priority:** P0 (Critical)

The system SHALL correctly transition between summary and other modal states.

#### Scenario: From summary to set-entry via Another Set

**Given** the summary view is displayed
**When** the user clicks "Another Set"
**Then** the system SHALL transition to set-entry mode
**And** the summary SHALL NOT be visible
**And** the set-entry form SHALL be visible
**And** the back arrow SHALL return to summary

#### Scenario: From summary to exercise-picker via Add Exercise

**Given** the summary view is displayed
**When** the user clicks "Add Exercise"
**Then** the system SHALL transition to exercise-picker mode
**And** the summary SHALL NOT be visible
**And** the exercise picker SHALL be visible

#### Scenario: From set-entry to summary after logging set

**Given** the user is in set-entry mode
**When** the user fills form and clicks "Log Set"
**Then** the system SHALL add set to state
**And** the system SHALL transition to summary mode
**And** the system SHALL show the newly logged set in summary
**And** the system SHALL show success toast

---

### Requirement: Empty State Handling
**ID:** `WSS-004`
**Priority:** P1 (High)

The system SHALL handle the edge case where summary is accessed with no sets logged.

#### Scenario: Summary not shown if no sets logged

**Given** the modal is open
**And** no sets have been logged
**Then** the system SHALL NOT show summary view
**And** the system SHALL show exercise-picker or set-entry mode
**And** "Finish Workout" button SHALL NOT be available

---

## MODIFIED Requirements

### Requirement: Modal State Management
**ID:** `QA-UI-001` (from quick-add-ui)
**Priority:** P0 (Critical)

The QuickAdd modal SHALL support three states: exercise-picker, set-entry, and summary.

#### Scenario: Modal tracks current state

**Given** the modal is open
**When** state transitions occur
**Then** the modal SHALL render only the component for current state:
  - exercise-picker → ExercisePicker
  - set-entry → QuickAddForm
  - summary → SummaryView
**And** only one component SHALL be visible at a time
**And** state transitions SHALL be animated (fade in/out)
