# quick-add-ui Specification

## Purpose
TBD - created by archiving change enable-quick-add-workout-logging. Update Purpose after archive.
## Requirements
### Requirement: Quick-Add Entry Point (FAB)
**ID:** `QA-UI-001`
**Priority:** P0 (Critical)

The system SHALL provide a Floating Action Button (FAB) on the Dashboard that opens the quick-add modal.

#### Scenario: User taps FAB to open quick-add

**Given** the user is viewing the Dashboard
**When** the user taps the quick-add FAB in the bottom-right corner
**Then** the system SHALL open the QuickAdd modal
**And** the modal SHALL display the ExercisePicker component
**And** the FAB SHALL be hidden while modal is open

#### Scenario: FAB is visible and accessible on mobile

**Given** the user is on a mobile device (screen width < 768px)
**When** the user views the Dashboard
**Then** the FAB SHALL be positioned 16px from bottom and right edges
**And** the FAB SHALL be 48px × 48px
**And** the FAB SHALL have z-index 100 (above content, below modals)
**And** the FAB SHALL NOT interfere with scrolling

#### Scenario: FAB has proper accessibility

**Given** the user navigates with keyboard
**When** the user tabs to the FAB
**Then** the FAB SHALL receive focus with visible outline
**And** the FAB SHALL have aria-label "Quick add exercise"
**And** pressing Enter or Space SHALL open the modal

---

### Requirement: Exercise Picker Component
**ID:** `QA-UI-002`
**Priority:** P0 (Critical)

The system SHALL provide an ExercisePicker component that allows users to search, filter, and select exercises.

#### Scenario: User searches for exercise by name

**Given** the ExercisePicker is open
**And** the exercise library has "Pull-ups", "Push-ups", "Dumbbell Press"
**When** the user types "pull" in the search box
**Then** the system SHALL filter to show only "Pull-ups"
**And** other exercises SHALL be hidden

#### Scenario: User filters by category

**Given** the ExercisePicker is open
**When** the user taps the "Pull" category tab
**Then** the system SHALL show only Pull category exercises
**And** exercises in Push/Legs/Core SHALL be hidden

#### Scenario: User selects from recent exercises

**Given** the user's last 5 exercises are ["Pull-ups", "Push-ups", "Squats", "Plank", "Rows"]
**And** the ExercisePicker is open
**When** the user views the "Recent" section
**Then** the system SHALL display all 5 exercises in horizontal scrollable cards
**And** when user taps "Pull-ups"
**Then** the system SHALL select "Pull-ups" and advance to input form

#### Scenario: Exercise picker shows equipment availability

**Given** the user has "Dumbbells" and "Pull-up Bar" in their equipment profile
**And** the ExercisePicker is open
**When** the user views exercise "Barbell Row" (requires Barbell)
**Then** the system SHALL show "⚠️ Equipment not available" badge
**And** the exercise SHALL be selectable but visually de-emphasized

---

### Requirement: Smart Defaults Pre-fill
**ID:** `QA-UI-003`
**Priority:** P0 (Critical)
**Related:** `quick-add-api`

The system SHALL pre-fill weight and reps inputs based on last performance and progressive overload calculations.

#### Scenario: User selects exercise with previous performance (weight progression)

**Given** user's last "Pull-ups" performance was:
- 3 days ago: 200 lbs × 10 reps (weight progression from previous)
- 7 days ago: 195 lbs × 10 reps
**When** user selects "Pull-ups" in ExercisePicker
**Then** the system SHALL fetch smart defaults from API
**And** the system SHALL pre-fill weight = 200 lbs (last weight)
**And** the system SHALL pre-fill reps = 10 (last reps)
**And** the system SHALL show suggestion: "Suggested: 11 reps @ 200 lbs (reps progression)"
**And** the system SHALL show context: "Last: 10 reps @ 200 lbs (3 days ago)"

#### Scenario: User selects exercise with no previous performance

**Given** user has never logged "Dumbbell Row"
**When** user selects "Dumbbell Row" in ExercisePicker
**Then** the system SHALL show weight input = 0 (empty)
**And** the system SHALL show reps input = 0 (empty)
**And** the system SHALL show helper text: "First time logging this exercise"
**And** the system SHALL NOT show progressive overload suggestion

#### Scenario: Loading state during smart defaults fetch

**Given** user selects "Pull-ups"
**When** the system is fetching smart defaults from API
**Then** the system SHALL show loading spinner in weight/reps inputs
**And** inputs SHALL be disabled until data loaded
**And** submit button SHALL be disabled

---

### Requirement: Weight and Reps Input
**ID:** `QA-UI-004`
**Priority:** P0 (Critical)

The system SHALL provide intuitive input controls for weight and reps with increment buttons for quick adjustments.

#### Scenario: User enters weight manually

**Given** the quick-add form is displayed
**When** the user types "205.5" in the weight input
**Then** the system SHALL accept the value
**And** the system SHALL format as "205.5 lbs"

#### Scenario: User increments weight with +5 button

**Given** the weight input shows 200 lbs
**When** the user taps the "+5" button
**Then** the system SHALL update weight to 205 lbs
**And** the input SHALL re-render immediately

#### Scenario: User decrements weight with -5 button

**Given** the weight input shows 200 lbs
**When** the user taps the "-5" button
**Then** the system SHALL update weight to 195 lbs

#### Scenario: User enters reps manually

**Given** the quick-add form is displayed
**When** the user types "12" in the reps input
**Then** the system SHALL accept the value
**And** the system SHALL validate as positive integer

#### Scenario: User uses +1/-1 buttons for reps

**Given** the reps input shows 10
**When** the user taps "+1" button
**Then** the system SHALL increment to 11
**When** the user taps "-1" button
**Then** the system SHALL decrement to 10

---

### Requirement: To Failure Checkbox
**ID:** `QA-UI-005`
**Priority:** P1 (High)
**Related:** `failure-status-tracking`

The system SHALL provide a "To failure?" checkbox that defaults to unchecked for quick-adds.

#### Scenario: User marks set as to failure

**Given** the quick-add form is displayed
**And** the "To failure?" checkbox is unchecked
**When** the user taps the checkbox
**Then** the system SHALL check the box
**And** to_failure flag SHALL be true when submitted

#### Scenario: Checkbox defaults to unchecked

**Given** user opens quick-add modal
**When** the form is displayed
**Then** the "To failure?" checkbox SHALL be unchecked by default

---

### Requirement: Form Validation
**ID:** `QA-UI-006`
**Priority:** P0 (Critical)

The system SHALL validate input before submission and show clear error messages.

#### Scenario: User attempts to submit with zero weight

**Given** the quick-add form is displayed
**And** weight input is 0
**When** the user taps "Log It" button
**Then** the system SHALL prevent submission
**And** the system SHALL show error message below weight input: "Weight must be greater than 0"
**And** the submit button SHALL remain enabled for retry

#### Scenario: User attempts to submit with zero reps

**Given** the quick-add form is displayed
**And** reps input is 0
**When** the user taps "Log It" button
**Then** the system SHALL prevent submission
**And** the system SHALL show error message below reps input: "Reps must be at least 1"

#### Scenario: User attempts to submit with decimal reps

**Given** the quick-add form is displayed
**And** user enters reps as 10.5
**When** the user taps "Log It" button
**Then** the system SHALL prevent submission
**And** the system SHALL show error message: "Reps must be a whole number"

---

### Requirement: Submission and Loading States
**ID:** `QA-UI-007`
**Priority:** P0 (Critical)

The system SHALL provide clear loading feedback during submission and prevent double-submission.

#### Scenario: User submits quick-add successfully

**Given** the quick-add form has valid data:
- Exercise: "Pull-ups"
- Weight: 200 lbs
- Reps: 10
**When** the user taps "Log It" button
**Then** the button SHALL change to "Logging..." with spinner
**And** all inputs SHALL be disabled
**And** the "Change Exercise" button SHALL be disabled
**And** when API responds successfully
**Then** the system SHALL close the modal
**And** the system SHALL show success toast: "✓ Pull-ups logged!"

#### Scenario: User attempts double-submission

**Given** user has tapped "Log It" button
**And** the API request is in progress
**When** the user taps "Log It" button again
**Then** the system SHALL ignore the second tap
**And** the button SHALL remain in loading state

#### Scenario: Submission fails with error

**Given** user submits quick-add
**When** the API returns 500 error
**Then** the system SHALL re-enable all inputs
**And** the button SHALL return to "Log It" state
**And** the system SHALL show error toast: "Failed to log exercise. Please try again."
**And** the modal SHALL remain open

---

### Requirement: Success Toast with PR Notification
**ID:** `QA-UI-008`
**Priority:** P1 (High)
**Related:** `pr-detection-and-celebration`

The system SHALL show success toast notification with PR celebration when applicable.

#### Scenario: Quick-add sets new PR

**Given** user submits "Pull-ups" at 206 lbs × 10 reps
**When** API returns pr_info indicating new PR (2060 lbs, +3%)
**Then** the system SHALL show toast: "✓ Pull-ups logged! 🎉 NEW PR: 2060 lbs (↑3%)"
**And** toast SHALL display for 5 seconds
**And** toast SHALL have success styling with green background

#### Scenario: Quick-add does not set PR

**Given** user submits "Pull-ups" at 200 lbs × 10 reps
**When** API returns no pr_info
**Then** the system SHALL show toast: "✓ Pull-ups logged!"
**And** toast SHALL display for 3 seconds

---

### Requirement: Progressive Overload Suggestion Display
**ID:** `QA-UI-009`
**Priority:** P1 (High)
**Related:** `progressive-overload-suggestions`

The system SHALL display progressive overload suggestions based on smart defaults.

#### Scenario: System suggests weight progression

**Given** user's last performance was reps progression
**When** smart defaults indicate next method is weight
**Then** the system SHALL show suggestion card above weight input:
```
💡 Suggested: +3% weight (206 lbs @ 10 reps)
Last: 200 lbs @ 10 reps (3 days ago)
```
**And** the suggestion card SHALL have button "Use Suggestion"
**And** when user taps "Use Suggestion"
**Then** weight SHALL update to 206 lbs

#### Scenario: System suggests reps progression

**Given** user's last performance was weight progression
**When** smart defaults indicate next method is reps
**Then** the system SHALL show suggestion card:
```
💡 Suggested: +3% reps (11 reps @ 200 lbs)
Last: 10 reps @ 200 lbs (3 days ago)
```

---

### Requirement: Modal Navigation
**ID:** `QA-UI-010`
**Priority:** P1 (High)

The system SHALL provide clear navigation within the quick-add modal.

#### Scenario: User changes selected exercise

**Given** user has selected "Pull-ups"
**And** the input form is displayed
**When** the user taps "Change Exercise" button
**Then** the system SHALL return to ExercisePicker
**And** previous weight/reps values SHALL be discarded
**And** search/filter state SHALL be preserved

#### Scenario: User closes modal without submitting

**Given** the quick-add modal is open
**And** user has partially filled the form
**When** the user taps the X button or presses Escape key
**Then** the system SHALL close the modal
**And** the system SHALL NOT submit data
**And** form state SHALL be reset

---

### Requirement: Keyboard Navigation
**ID:** `QA-UI-011`
**Priority:** P2 (Medium)

The system SHALL support full keyboard navigation within the quick-add modal.

#### Scenario: User navigates with Tab key

**Given** the quick-add modal is open with input form
**When** the user presses Tab
**Then** focus SHALL move through elements in order:
1. Weight input
2. Weight +5 button
3. Weight -5 button
4. Reps input
5. Reps +1 button
6. Reps -1 button
7. To failure checkbox
8. Log It button
9. Change Exercise button

#### Scenario: User submits with Enter key

**Given** weight and reps inputs have valid values
**And** weight input has focus
**When** the user presses Enter key
**Then** the system SHALL submit the form
**And** the same behavior as clicking "Log It"

---

### Requirement: Mobile Responsive Design
**ID:** `QA-UI-012`
**Priority:** P1 (High)

The system SHALL provide optimized layout for mobile devices.

#### Scenario: Modal on mobile device

**Given** user is on device with screen width < 768px
**When** quick-add modal opens
**Then** modal SHALL occupy full width (minus 16px margins)
**And** modal SHALL be vertically scrollable
**And** all buttons SHALL be minimum 44px touch target
**And** inputs SHALL use mobile-optimized number keyboards

#### Scenario: Exercise picker on mobile

**Given** ExercisePicker is open on mobile
**When** user views recent exercises
**Then** exercises SHALL scroll horizontally
**And** category tabs SHALL be horizontally scrollable
**And** exercise list SHALL stack vertically

---

### Requirement: Dashboard Integration
**ID:** `QA-UI-013`
**Priority:** P0 (Critical)

The system SHALL integrate quick-add with Dashboard muscle state updates.

#### Scenario: Muscle states refresh after quick-add

**Given** user is on Dashboard
**And** current Lats fatigue is 5%
**When** user successfully quick-adds "Pull-ups"
**And** modal closes
**Then** the system SHALL trigger muscle states refresh
**And** Dashboard muscle heat map SHALL re-render
**And** Lats fatigue SHALL update to new value (e.g., 22%)
**And** update SHALL be visible without page reload

#### Scenario: Quick-add from recommendation card

**Given** Dashboard shows exercise recommendations
**And** "Pull-ups" is recommended as "Excellent"
**When** user taps "Quick Add" button on Pull-ups recommendation
**Then** the system SHALL open quick-add modal
**And** "Pull-ups" SHALL be pre-selected
**And** smart defaults SHALL load immediately

---

