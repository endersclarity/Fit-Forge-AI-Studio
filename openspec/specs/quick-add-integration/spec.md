# quick-add-integration Specification

## Purpose
TBD - created by archiving change enable-smart-exercise-recommendations. Update Purpose after archive.
## Requirements
### Requirement: System SHALL display "Add to Workout" button on recommendation cards

**ID:** QA-INT-001

Each recommendation card SHALL display an "Add to Workout" button that:
- Is enabled when exercise is available (equipment present)
- Is disabled when exercise unavailable (equipment missing)
- Shows different text based on status:
  - Excellent/Good: "Add to Workout"
  - Suboptimal: "Add Anyway"
  - Not recommended: "Add Despite Fatigue" (disabled)

#### Scenario: Add excellent recommendation

**Given:**
- Recommendation card for Pull-ups (status: excellent)
- User has Pull-up Bar equipment

**When:** Card renders

**Then:**
- Button text: "Add to Workout"
- Button enabled: true
- Button style: Primary (green background)

---

#### Scenario: Add suboptimal recommendation

**Given:**
- Recommendation card for Dumbbell Pullover (status: suboptimal)
- User has Dumbbells equipment

**When:** Card renders

**Then:**
- Button text: "Add Anyway"
- Button enabled: true
- Button style: Secondary (gray background)
- Tooltip: "Limiting factors may reduce effectiveness"

---

#### Scenario: Equipment not available

**Given:**
- Recommendation card for Bench Press
- User does not have Bench equipment

**When:** Card renders

**Then:**
- Button disabled: true
- Button text: "Equipment Missing"
- Card grayed out (opacity 0.5)

---

### Requirement: System SHALL navigate to workout screen with pre-selected exercise

**ID:** QA-INT-002

When user clicks "Add to Workout", the system SHALL:
1. Navigate to Workout screen
2. Auto-add selected exercise to current workout
3. If exercise was done before, apply progressive overload suggestion

#### Scenario: Add exercise (first time)

**Given:**
- User on Dashboard
- Clicks "Add to Workout" on Pull-ups recommendation
- Pull-ups never done before

**When:** Button clicked

**Then:**
- Navigate to Workout screen
- Pull-ups added to exercise list
- Default: 3 sets, 0 reps, 0 weight
- User fills in actual performance

---

#### Scenario: Add exercise (with history)

**Given:**
- User on Dashboard
- Clicks "Add to Workout" on Bench Press
- Last Bench Press: 8 reps @ 100 lbs (weight progression method)

**When:** Button clicked

**Then:**
- Navigate to Workout screen
- Bench Press added to exercise list
- Progressive overload applied: 8 reps @ 103 lbs (+3% weight)
- Sets pre-populated with suggested values
- User can edit before saving

---

### Requirement: System SHALL integrate with progressive overload system

**ID:** QA-INT-003

When adding an exercise with workout history, the system SHALL leverage the existing progressive overload algorithm (from Priority 1 feature) to suggest weights/reps.

#### Scenario: Apply progressive overload on quick-add

**Given:**
- Exercise: Dumbbell Row
- Last performance: 12 reps @ 50 lbs
- Last progression method: "reps"

**When:** User adds via "Add to Workout" button

**Then:**
- Fetch last workout performance for Dumbbell Row
- Determine next progression method: "weight" (alternate from "reps")
- Calculate: 50 lbs × 1.03 = 51.5 lbs → round to 52 lbs
- Suggest: 12 reps @ 52 lbs
- Display in workout form: "Suggested: 12 reps @ 52 lbs (previous: 50 lbs)"

---

### Requirement: System SHALL handle multiple exercise additions

**ID:** QA-INT-004

The system SHALL allow users to add multiple recommended exercises to a single workout session.

#### Scenario: Add multiple exercises from recommendations

**Given:**
- User on Dashboard
- Adds Pull-ups
- Stays on Workout screen
- Returns to Dashboard
- Adds Dumbbell Row

**When:** Second exercise added

**Then:**
- Both Pull-ups AND Dumbbell Row in current workout
- Each retains its own progressive overload suggestions
- No duplicate entries

---

### Requirement: System SHALL provide visual feedback on add action

**ID:** QA-INT-005

When user clicks "Add to Workout", the system SHALL provide immediate visual feedback:
- Button shows loading spinner (200ms)
- Button text changes to "Adding..."
- Success toast notification: "✅ [Exercise] added to workout"
- Navigate to Workout screen after animation completes

#### Scenario: Successful add with toast notification

**Given:**
- User clicks "Add to Workout" on Pull-ups

**When:** Button clicked

**Then:**
- Button disabled immediately
- Loading spinner appears
- After 200ms: Toast shows "✅ Pull-ups added to workout"
- Navigate to Workout screen
- Toast auto-dismisses after 2 seconds

---

### Requirement: System SHALL prevent duplicate exercise additions

**ID:** QA-INT-006

The system SHALL prevent adding the same exercise twice to the current workout:
- If exercise already in workout, button text changes to "Already Added"
- Button disabled
- Clicking navigates to Workout screen and highlights existing exercise

#### Scenario: Exercise already in current workout

**Given:**
- Current workout contains Pull-ups
- User returns to Dashboard

**When:** Recommendations render

**Then:**
- Pull-ups recommendation card button shows "Already Added"
- Button disabled: true
- Clicking navigates to workout and scrolls to Pull-ups section

---

### Requirement: System SHALL update workout context

**ID:** QA-INT-007

The system SHALL maintain workout session state when navigating between Dashboard and Workout screens:
- Preserve current workout exercises
- Preserve category and variation
- Preserve start time

#### Scenario: Preserve workout state during navigation

**Given:**
- User starts Push A workout
- Adds Bench Press manually
- Returns to Dashboard
- Adds Dumbbell Flyes via "Add to Workout"

**When:** Navigates back to Workout

**Then:**
- Workout still shows "Push A"
- Bench Press still present
- Dumbbell Flyes added as second exercise
- Start time unchanged

---

### Requirement: System SHALL perform category auto-selection

**ID:** QA-INT-008

When adding an exercise from a specific category, the system SHALL:
- If workout not started: Auto-select exercise's category (Push/Pull/Legs/Core)
- If workout started: Only allow adding exercises from same category
- Show warning if exercise category doesn't match current workout

#### Scenario: Auto-select category (new workout)

**Given:**
- No workout in progress
- User adds "Pull-ups" (category: Pull)

**When:** Exercise added

**Then:**
- Workout category set to "Pull"
- Variation defaulted to "A"
- Pull-ups added as first exercise

---

#### Scenario: Category mismatch warning

**Given:**
- Current workout: Push A (in progress)
- User tries to add "Pull-ups" (category: Pull)

**When:** "Add to Workout" clicked

**Then:**
- Warning modal: "This is a Pull exercise. Your current workout is Push A. Starting a Pull workout will end your current Push session. Continue?"
- Options: [Cancel] [End Push & Start Pull]

---

### Requirement: System SHALL support mobile gestures

**ID:** QA-INT-009

On mobile devices, the system SHALL support swipe gestures for quick actions:
- Swipe right on card: Quick add to workout
- Visual feedback: Card slides right, green background reveal
- Undo option appears briefly after swipe

#### Scenario: Swipe to add (mobile)

**Given:**
- User on mobile device (screen width < 768px)
- Viewing Pull-ups recommendation card

**When:** User swipes card right

**Then:**
- Card animates sliding right
- Green "✅ Added" background revealed
- Exercise added to workout
- Undo button appears for 3 seconds
- Card returns to normal position

---

### Requirement: System SHALL support keyboard shortcuts

**ID:** QA-INT-010

The system SHALL support keyboard shortcuts for power users:
- `A` or `Enter`: Add focused recommendation to workout
- `1-9`: Quick add first 9 recommendations
- `Esc`: Close recommendation modal if open

#### Scenario: Keyboard quick-add

**Given:**
- User on Dashboard with keyboard
- Pull-ups card has focus (first excellent recommendation)

**When:** User presses "A" key

**Then:**
- Pull-ups added to workout
- Same behavior as clicking "Add to Workout"
- Toast notification displayed

---

### Requirement: System SHALL integrate with existing workout flow

**ID:** QA-INT-011

The quick-add feature SHALL integrate seamlessly with existing workout features:
- "To Failure" flag defaults (last set marked as failure)
- PR detection active after workout saved
- Muscle states updated after workout logged

#### Scenario: Complete workflow with quick-add

**Given:**
- User adds Pull-ups via Dashboard recommendation

**When:**
- Navigates to Workout
- Completes 3 sets of Pull-ups
- Marks last set "to failure"
- Saves workout

**Then:**
- Pull-ups logged in workout history
- PR detection runs (if applicable)
- Muscle states updated (Lats, Biceps, etc.)
- Dashboard recommendations refresh with new muscle states

---

