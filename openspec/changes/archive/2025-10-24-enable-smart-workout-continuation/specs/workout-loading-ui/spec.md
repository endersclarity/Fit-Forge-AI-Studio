# Spec: Workout Loading UI

**Capability:** workout-loading-ui
**Change ID:** enable-smart-workout-continuation
**Status:** Draft

---

## ADDED Requirements

### Requirement: System SHALL display last workout summary card
**ID:** WLU-001
**Priority:** Must Have

The system SHALL display a summary card showing the user's last workout for the current category at the top of the Workout screen.

#### Scenario: Showing last workout summary

**Given** the user navigates to the Workout screen
**And** they have previously completed at least one workout in the selected category
**When** the screen loads
**Then** the system SHALL display a summary card with:
- Header: "Continue from last {category} workout"
- Last workout details: "{Category} {Variation} - {X} days ago"
- Suggested next variation: "Try {Category} {OppositeVariation} today"
- Action button: "Load {Category} {Variation} Template"

**Example:**
```
┌──────────────────────────────────────────┐
│ Continue from last Push workout         │
│                                          │
│ Push B - 3 days ago                     │
│ Try Push A today                         │
│                                          │
│  [Load Push A Template]                  │
└──────────────────────────────────────────┘
```

---

### Requirement: System SHALL display first-time user message
**ID:** WLU-002
**Priority:** Must Have

The system SHALL display an encouraging message when no previous workout exists for the selected category.

#### Scenario: No previous workout for category

**Given** the user navigates to the Workout screen
**And** they have never completed a workout in the selected category
**When** the screen loads
**Then** the system SHALL display:
- Message: "Start your first {category} workout!"
- Suggestion: "Try {Category} A to begin"
- No last workout summary

**Example:**
```
┌──────────────────────────────────────────┐
│ Start your first Push workout!          │
│                                          │
│ Try Push A to begin                      │
│                                          │
│  [Load Push A Template]                  │
└──────────────────────────────────────────┘
```

---

### Requirement: System SHALL display time since last workout
**ID:** WLU-003
**Priority:** Must Have

The system SHALL calculate and display the number of days since the last workout in the same category.

#### Scenario: Recent workout (< 7 days)

**Given** the user's last Push workout was 3 days ago
**When** the last workout summary is displayed
**Then** the system SHALL show "3 days ago"
**And** no warning indicator SHALL be shown

#### Scenario: Old workout (≥ 7 days)

**Given** the user's last Push workout was 8 days ago
**When** the last workout summary is displayed
**Then** the system SHALL show "8 days ago"
**And** a warning icon or color SHALL be displayed
**And** a tooltip SHALL show: "Strength may have changed - adjust as needed"

**Example:**
```
Push B - 3 days ago ✓
Push B - 8 days ago ⚠️ (hover: "Strength may have changed")
```

---

### Requirement: System SHALL load template with variation selection
**ID:** WLU-004
**Priority:** Must Have

The system SHALL allow users to load a workout template for the suggested or selected variation.

#### Scenario: Loading suggested variation template

**Given** the user's last workout was "Push B"
**And** the system suggests "Push A"
**When** the user clicks "Load Push A Template"
**Then** the system SHALL:
- Load all exercises from the "Push A" template
- Display each exercise in the workout UI
- Pre-populate progressive overload suggestions (from POS specs)
- Set the variation toggle to "A"

---

### Requirement: System SHALL display progressive overload suggestions per exercise
**ID:** WLU-005
**Priority:** Must Have

The system SHALL display progressive overload suggestions for each exercise that was performed in the previous workout.

#### Scenario: Exercise with progression suggestion

**Given** an exercise "Bench Press" was in the last workout
**And** the last performance was 8 reps @ 100 lbs
**When** the exercise is displayed in the UI
**Then** the system SHALL show:
- Exercise name
- Progression badge ("+3% WEIGHT" or "+3% REPS")
- Last performance row: "Last: 8 reps @ 100 lbs"
- Suggested performance row: "Try: 8 reps @ 103 lbs ↑"
- Input fields pre-populated with suggested values

**Example:**
```
┌────────────────────────────────────────────┐
│ Bench Press              [+3% WEIGHT]     │
│ Last: 8 reps @ 100 lbs                    │
│ Try:  8 reps @ 103 lbs ↑                  │
│                                            │
│ [Set 1] Weight: 103  Reps: 8  [Log Set]  │
└────────────────────────────────────────────┘
```

---

### Requirement: System SHALL display exercises without previous data
**ID:** WLU-006
**Priority:** Must Have

The system SHALL display exercises that are new to the workout (not in previous session) without suggestions.

#### Scenario: New exercise in template

**Given** an exercise "Dumbbell Flyes" is in the current template
**And** "Dumbbell Flyes" was NOT in the last workout
**When** the exercise is displayed in the UI
**Then** the system SHALL show:
- Exercise name
- No progression badge
- No "Last:" row
- No "Try:" row
- Empty input fields (user provides baseline)

**Example:**
```
┌────────────────────────────────────────────┐
│ Dumbbell Flyes                            │
│                                            │
│ [Set 1] Weight: ___  Reps: ___  [Log]    │
└────────────────────────────────────────────┘
```

---

### Requirement: System SHALL provide variation toggle control
**ID:** WLU-007
**Priority:** Must Have

The system SHALL provide a variation toggle allowing users to select A or B for the current workout.

#### Scenario: Variation toggle defaults to suggestion

**Given** the system suggests variation "A" based on last workout
**When** the Workout screen loads
**Then** the variation toggle SHALL default to "A"
**And** the user SHALL be able to toggle to "B"
**And** changing the toggle SHALL reload the appropriate template
**And** the selected variation SHALL be saved with the workout

**UI:**
```
Variation:  ( ) A  (•) B
            ↑ Selected
```

---

### Requirement: System SHALL pre-populate input fields with suggestions
**ID:** WLU-008
**Priority:** Must Have

The system SHALL pre-populate weight and reps input fields with progressive overload suggestions.

#### Scenario: Auto-filled suggestion values

**Given** the system suggests 9 reps @ 103 lbs for "Bench Press"
**When** the exercise row is rendered
**Then** the weight input field SHALL contain "103"
**And** the reps input field SHALL contain "9"
**And** the user SHALL be able to modify these values
**And** modified values SHALL be used when logging the set

---

### Requirement: System SHALL provide visual indicators for progression type
**ID:** WLU-009
**Priority:** Must Have

The system SHALL use visual badges to indicate whether weight or reps are increasing.

#### Scenario: Weight progression badge

**Given** the progression type is "weight"
**When** the exercise is displayed
**Then** a badge SHALL show "+3% WEIGHT"
**And** the badge SHALL use a distinct color (e.g., blue)
**And** the weight value SHALL be highlighted or bolded

#### Scenario: Reps progression badge

**Given** the progression type is "reps"
**When** the exercise is displayed
**Then** a badge SHALL show "+3% REPS"
**And** the badge SHALL use a distinct color (e.g., green)
**And** the reps value SHALL be highlighted or bolded

**Visual:**
```
[+3% WEIGHT] - Blue badge, weight value highlighted
[+3% REPS]   - Green badge, reps value highlighted
```

---

### Requirement: System SHALL provide loading states and error handling
**ID:** WLU-010
**Priority:** Must Have

The system SHALL display appropriate loading and error states while fetching last workout data.

#### Scenario: Loading last workout data

**Given** the user navigates to the Workout screen
**When** the last workout data is being fetched
**Then** the system SHALL display a loading skeleton or spinner
**And** exercise rows SHALL show placeholder content
**And** the "Load Template" button SHALL be disabled

#### Scenario: Failed to load last workout

**Given** the API request to fetch last workout fails
**When** the error is detected
**Then** the system SHALL display: "Unable to load last workout"
**And** the system SHALL still allow loading a template
**And** no suggestions SHALL be shown
**And** the user SHALL be able to retry

---

### Requirement: System SHALL provide responsive layout for suggestions
**ID:** WLU-011
**Priority:** Should Have

The system SHALL display progressive overload suggestions in a mobile-friendly layout.

#### Scenario: Mobile view

**Given** the user is on a mobile device (< 768px width)
**When** exercise suggestions are displayed
**Then** the "Last:" and "Try:" rows SHALL stack vertically
**And** progression badges SHALL remain visible
**And** tap targets SHALL be at least 44px
**And** text SHALL be readable without zooming

---

### Requirement: System SHALL provide keyboard navigation support
**ID:** WLU-012
**Priority:** Should Have

The system SHALL support keyboard navigation through workout suggestions.

#### Scenario: Navigating with keyboard

**Given** the user is using a keyboard
**When** they tab through the Workout screen
**Then** focus SHALL move through:
1. Load Template button
2. Variation toggle
3. Each exercise's weight input
4. Each exercise's reps input
5. Log Set buttons
**And** pressing Enter on "Load Template" SHALL load the template
**And** pressing Space on variation toggle SHALL switch variations

---

## MODIFIED Requirements

*(No requirements modified - this is a new capability)*

---

## REMOVED Requirements

*(No requirements removed)*

---

## Cross-References

**Depends on:**
- workout-variation-tracking (to fetch last workout)
- progressive-overload-suggestions (to calculate suggestions)

**Enables:**
- Efficient workout setup
- Clear progression visibility
- User motivation through visible goals

**Related:**
- Workout Templates (loads templates with variations)
- Personal Bests (displays PR context)
