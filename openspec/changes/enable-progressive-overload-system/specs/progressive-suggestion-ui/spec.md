# Spec: Progressive Suggestion UI

**Capability:** `progressive-suggestion-ui`
**Status:** Draft
**Change:** `enable-progressive-overload-system`

---

## Overview

The progressive suggestion UI provides an intuitive two-button interface that displays last performance context and allows users to quickly select either +3% weight or +3% reps progression with a single tap.

**Core Behavior:** For each exercise in a workout, the UI displays last performance, shows both progressive options as tappable buttons, highlights the recommended option, and auto-fills selected values.

---

## ADDED Requirements

### Requirement: Display Last Performance Context

**Description:** System SHALL display clear context about the user's last performance for each exercise before they begin logging sets.

**Acceptance Criteria:**
- Shows last weight and reps
- Shows number of days since last performance
- Shows which method was used last time (if detected)
- Displays "No history" message for new exercises
- Context always visible during exercise logging

#### Scenario: Show complete context for exercise with history

**Given:** User's last Pull-ups performance: 30 reps @ 200lbs on 2025-10-22
**And:** That workout used +Reps method
**And:** Today is 2025-10-25
**When:** User starts logging Pull-ups
**Then:** UI displays:
```
Last: 30 reps @ 200lbs (3 days ago)
Used: +REPS method
```

#### Scenario: Show message for new exercise

**Given:** User has never done "Dumbbell Row"
**When:** User starts logging Dumbbell Row
**Then:** UI displays: "No history - establish your baseline"
**And:** Only manual entry fields shown (no buttons)

---

### Requirement: Display Two-Button Progressive Options

**Description:** System SHALL present both +3% weight and +3% reps options as equally accessible tappable buttons.

**Acceptance Criteria:**
- Both options displayed side-by-side
- Each button shows method label (+WEIGHT / +REPS)
- Each button shows calculated values (weight and reps)
- Recommended option has visual indicator
- Both buttons equally tappable (no disabled states)
- Responsive on mobile and desktop

#### Scenario: Display both options with recommendation

**Given:** Progressive suggestions calculated:
- Weight option: 30 reps @ 206lbs
- Reps option: 31 reps @ 200lbs
- Recommended: "weight"
**When:** UI renders suggestion buttons
**Then:** Displays two buttons:
```
┌──────────────────────┐  ┌──────────────────────┐
│ 💪 +WEIGHT          │  │      +REPS           │
│ (Recommended)        │  │                      │
│ 30 reps @ 206lbs     │  │ 31 reps @ 200lbs     │
└──────────────────────┘  └──────────────────────┘
```
**And:** +WEIGHT button has highlighted border/background
**And:** Both buttons are tappable

---

### Requirement: Auto-Fill on Button Tap

**Description:** System SHALL automatically populate weight and reps input fields when user taps a suggestion button.

**Acceptance Criteria:**
- Tap +WEIGHT button → fills weight (206) and reps (30)
- Tap +REPS button → fills weight (200) and reps (31)
- Auto-filled values immediately editable
- User can still manually type values
- Works for each set in exercise

#### Scenario: User taps +WEIGHT button

**Given:** Weight and reps fields are empty
**And:** +WEIGHT suggestion is 30 reps @ 206lbs
**When:** User taps "+WEIGHT" button
**Then:** Weight field auto-fills with "206"
**And:** Reps field auto-fills with "30"
**And:** Cursor moves to next action (add set or next exercise)
**And:** User can still edit values if needed

#### Scenario: User taps +REPS button

**Given:** +REPS suggestion is 31 reps @ 200lbs
**When:** User taps "+REPS" button
**Then:** Weight field auto-fills with "200"
**And:** Reps field auto-fills with "31"

#### Scenario: User taps button then modifies values

**Given:** User tapped +WEIGHT (auto-filled 206lbs, 30 reps)
**When:** User manually changes weight to 210lbs
**Then:** Modified value is kept
**And:** Set logs with 210lbs @ 30 reps (user's adjustment)

---

### Requirement: Maintain Manual Entry Option

**Description:** System SHALL always provide manual weight/reps input fields below suggestion buttons as fallback option.

**Acceptance Criteria:**
- Input fields always visible and accessible
- Can type directly without tapping buttons
- Manual entry works identically to current flow
- No forced button selection
- Progressive suggestions are optional enhancement

#### Scenario: User ignores buttons and enters manually

**Given:** Suggestion buttons displayed
**When:** User clicks directly into weight field
**And:** Types "205" for weight
**And:** Types "32" for reps
**Then:** Set logs with 205lbs @ 32 reps (manual values)
**And:** System adapts next time (new baseline)

#### Scenario: Buttons disabled when no history

**Given:** Exercise has no history
**When:** UI renders
**Then:** No suggestion buttons shown
**And:** Only manual input fields displayed
**And:** Message: "No history - establish your baseline"

---

### Requirement: Visual Recommendation Indicator

**Description:** System SHALL clearly indicate which progressive option is recommended without forcing user choice.

**Acceptance Criteria:**
- Recommended button has visual distinction (icon, border, color)
- Non-recommended button still fully functional
- Indicator is subtle guidance, not mandatory
- Mobile and desktop both show clear indicator
- Accessibility: screen readers announce recommendation

#### Scenario: Recommended option visually distinguished

**Given:** +WEIGHT is recommended
**When:** UI renders buttons
**Then:** +WEIGHT button displays 💪 emoji
**And:** +WEIGHT button has "(Recommended)" label
**And:** +WEIGHT button has highlighted border
**And:** +REPS button has standard styling
**And:** Both buttons remain equally tappable

---

### Requirement: Responsive Layout for Mobile and Desktop

**Description:** System SHALL render progressive suggestion UI appropriately for different screen sizes.

**Acceptance Criteria:**
- Desktop: Buttons side-by-side
- Mobile: Buttons stacked vertically OR side-by-side if space allows
- Text remains readable at all sizes
- Touch targets ≥44px for mobile
- No horizontal scrolling

#### Scenario: Desktop layout (wide screen)

**Given:** Viewport width > 768px
**When:** UI renders
**Then:** Buttons displayed side-by-side
**And:** Each button ~50% width
**And:** Comfortable spacing between buttons

#### Scenario: Mobile layout (narrow screen)

**Given:** Viewport width ≤ 480px
**When:** UI renders
**Then:** Buttons may stack vertically OR shrink side-by-side
**And:** Touch targets remain ≥44px
**And:** All text readable

---

### Requirement: Handle Multiple Sets Per Exercise

**Description:** System SHALL provide progressive suggestions for FIRST set and allow manual or repeated suggestions for subsequent sets.

**Acceptance Criteria:**
- First set shows full suggestion UI
- Subsequent sets can show simplified version OR repeat suggestions
- Each set logged independently
- User can vary weights/reps across sets (drop sets, pyramids)

#### Scenario: First set uses suggestion, second set adjusted

**Given:** User taps +WEIGHT for Set 1 (206lbs @ 30 reps)
**When:** User moves to Set 2
**Then:** Can use same values OR adjust manually
**And:** Might do 206lbs @ 25 reps (fatigue drop-off)
**And:** System tracks all sets independently

---

## MODIFIED Requirements

### Requirement: Enhance Workout Logging UI

**Description:** System SHALL enhance workout logging interface by adding progressive suggestion buttons above weight/reps input fields while preserving all existing manual entry functionality.

**Previous:** Weight and reps input fields with no guidance
**Modified:** Weight and reps input fields WITH progressive suggestion buttons above

**Acceptance Criteria:**
- System MUST add suggestion buttons above input fields
- Input fields functionality SHALL remain unchanged
- Manual entry workflow SHALL have no breaking changes
- Feature SHALL be backward compatible (works without suggestions)

#### Scenario: New UI preserves manual entry

**Given:** Existing user accustomed to manual entry
**When:** Progressive suggestion feature deployed
**Then:** Manual entry fields still work identically
**And:** New buttons are additive enhancement
**And:** User can choose to use or ignore buttons

---

## REMOVED Requirements

None. All existing UI functionality preserved.

---

## Dependencies

**Required:**
- ✅ `progressive-overload-calculation`: Provides suggestion data
- ✅ React components for workout logging (existing)
- ✅ Axios for API calls (existing)

**Consumed Capabilities:**
- `progressive-overload-calculation`: Backend suggestion engine
- `workout-variation-tracking`: Variation context display

**Provides To:**
- End users: Intelligent workout guidance
- Future: Progressive overload analytics

---

## Implementation Notes

**New Component:**
```typescript
// components/ProgressiveSuggestionButtons.tsx
interface ProgressiveSuggestionButtonsProps {
  exerciseName: string;
  onSelectWeight: (weight: number, reps: number) => void;
  onSelectReps: (weight: number, reps: number) => void;
}
```

**Modified Component:**
```typescript
// components/Workout.tsx
// Add ProgressiveSuggestionButtons above weight/reps inputs
```

**Styling:**
- Use existing brand colors for consistency
- Recommended button: subtle highlight (border or background)
- Buttons: Clear tap targets, good contrast

---

## Testing Coverage

**Component Tests:**
- Renders both buttons correctly ✓
- Shows recommendation indicator ✓
- Button tap auto-fills fields ✓
- Manual entry still works ✓
- No history shows appropriate message ✓
- Responsive on mobile ✓

**Integration Tests:**
- Full workflow: Load exercise → see suggestions → tap button → log set ✓
- Multiple sets workflow ✓
- Manual override after button tap ✓

**Accessibility Tests:**
- Keyboard navigation works ✓
- Screen reader announces recommendations ✓
- Touch targets ≥44px on mobile ✓

---

## Success Criteria

- ✅ Suggestion buttons display correctly
- ✅ Recommended option visually indicated
- ✅ Button tap auto-fills accurately
- ✅ Manual entry preserved and functional
- ✅ Responsive on all screen sizes
- ✅ No breaking changes to existing workflow
- ✅ Accessible to keyboard and screen reader users
- ✅ Performance: UI renders <100ms
