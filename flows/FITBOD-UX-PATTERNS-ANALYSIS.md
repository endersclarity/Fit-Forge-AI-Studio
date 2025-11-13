# Fitbod UX Patterns Analysis for FitForge

Actionable UX patterns extracted from Fitbod reference flows for implementation in FitForge.

## 1. Workout Logging Patterns

### 1.1 Set Logging Interface

**Reference Flow:** `flows/workout/routine-options/starting-workout/logging-a-set/`

#### Key UX Principles

**Progressive Disclosure in Action**
- Exercise detail view uses a **modal overlay** that dims the workout list beneath
- Background shows exercise demonstration image/video at full bleed (top 1/3 of screen)
- Critical logging controls (reps, weight, LOG SET button) are immediately visible
- Secondary controls (Replace, Delete, Achievements, Rest Timer) hidden behind scrolling

**Visual Hierarchy Through Size & Color**
- Reps and Weight values are **large and bold** (48-60pt) for easy tapping during workout
- "LOG SET" button is prominent coral/red (#FF6B7A) at 90% screen width
- Set numbers use **circular badges** (1, 2, 3) for clear visual progression
- Completed sets show checkmark icon, incomplete sets show set number

**State Communication**
- Rest timer appears automatically after logging a set with countdown (e.g., "0:30 REST")
- Timer badge changes from OFF to ON when active
- Weight/reps that were just logged show subtle highlight or animation
- "3/3 logged" status appears in workout list after completing all sets

#### Interaction Patterns

**Single-Tap Logging Flow**
1. Tap exercise from workout list → Opens exercise detail modal
2. Modal shows all planned sets with pre-filled reps/weight
3. Tap weight or reps to edit → Native number picker appears inline
4. Tap "LOG SET" button → Set marked complete, rest timer starts
5. After rest → Next set auto-highlights, repeat

**Quick Completion Shortcuts**
- After logging 2/3 sets, system asks: "Do you want to log all 3 sets?"
- "Log All Sets" button allows batch completion
- "Don't Ask Again" option for experienced users who prefer manual logging

**Edit-in-Place Paradigm**
- Reps and weight are editable directly in the set rows
- Tap any value → iOS number pad appears at bottom
- Blue cursor indicates active field
- No separate "edit mode" required

#### Visual Design Choices

**Layout & Spacing**
- Exercise name in italic serif font (editorial style)
- Set rows have generous vertical padding (16-20px between rows)
- Clear visual separation between sets with horizontal rules
- Fixed bottom sheet contains primary action button

**Information Density**
- Each set row shows: Set # + Reps + Weight + Rest timer
- All in single row, no wrapping
- Icons supplement text (timer icon, weight icon)
- Whitespace used generously to reduce cognitive load

**Color System**
- Primary CTA: Coral/red for "LOG SET"
- Success state: Green checkmark for completed sets
- Neutral: Gray for incomplete/upcoming sets
- Background: Dark mode with semi-transparent overlays

#### Navigation Affordances

**Escape Routes (Multiple Exit Options)**
- Back arrow (top-left) → Returns to workout list
- Swipe down gesture → Dismisses modal
- Tap dimmed background → Returns to workout list
- "DONE" button after completing all sets → Returns with confirmation

**Modal Behavior**
- Modal slides up from bottom (iOS sheet pattern)
- Background dimmed at 60% opacity
- Scrollable content with sticky header (exercise name)
- Fixed footer for primary actions

### 1.2 Rest Timer Integration

**Smart Timer Activation**
- Timer auto-starts after logging a set
- Default rest time contextual to exercise type (30-90 seconds)
- Timer shows in both: (1) Exercise detail view, (2) Collapsed exercise card
- Can be toggled OFF for circuits/supersets

**Timer Display States**
- Counting down: "0:30 REST" in gray badge
- Complete: Gentle haptic + color change to green
- Dismissible: Tap X to skip rest early

### 1.3 Exertion Rating (Post-Set Feedback)

**Delayed Appearance Pattern**
- After completing final set, "EXERTION RATING" prompt appears
- Question format: "How difficult was 10 Reps x 20 Pounds?"
- 5-option scale (visual emoji + text labels)
- Optional but encouraged through positioning

---

## 2. Exercise Selection Patterns

### 2.1 Exercise Browser Interface

**Reference Flow:** `flows/workout/adding-an-exercise/`

#### Key UX Principles

**Three-Tab Navigation**
- "All" | "By Muscle" | "Categories" tabs at top
- Persistent search bar above tabs
- Filter/Sort controls accessible via icon (top-right)
- Maintains scroll position when switching tabs

**Thumbnail-First Design**
- Each exercise shows square thumbnail (60x60px) of demonstration
- Exercise name in bold, secondary text shows equipment/variation
- Checkbox on right for multi-select mode
- Subtle dividers between rows

**Progressive Refinement**
- Start broad ("All Exercises")
- Drill down by category ("By Equipment" → "Dumbbells")
- Or filter inline ("Filter by Your Available Equipment" toggle)

#### Interaction Patterns

**Multi-Select Mode**
- Tap checkbox or long-press exercise → Enables selection mode
- Bottom sheet appears: "Group as..." + "Add 3 Exercises"
- Can group selected exercises as: Superset, Timed Intervals, Warm-up, Cool-down
- Exit selection mode via "X" or "Cancel"

**Contextual Help**
- First visit shows tooltip: "Tap a thumbnail to see instructions"
- Tooltip has X to dismiss
- Never shows again after dismissal

**Quick Preview**
- Tap thumbnail → Opens exercise info modal with video/instructions
- Tap exercise name → Adds exercise directly to workout
- Differentiation prevents accidental additions

#### Visual Design Choices

**List Density**
- Compact rows (64-72px height) allow scanning 8-10 exercises at once
- Alphabetical sections with sticky headers ("A", "B", "C")
- Search highlights matching text
- Loading skeleton shows during fetch

**Empty States**
- No results: "No exercises match your filters" + "Clear Filters" button
- First time: "Tap + Add an exercise to build your workout"

#### Navigation Affordances

**Modal Presentation**
- Full-screen modal (no background visible)
- "X" in top-right to dismiss
- Search bar with "X" to clear
- Breadcrumb trail for category navigation ("< By Equipment")

---

## 3. Equipment Filtering Patterns

### 3.1 Filter Panel Design

**Reference Flow:** `flows/workout/adding-an-exercise/filtering-by-available-equipment/`

#### Key UX Principles

**Slide-Up Filter Sheet**
- Tap filter icon → Sheet slides up from bottom (not full screen)
- Semi-transparent background overlay
- Sheet is dismissible by swiping down or tapping outside
- Filters apply in real-time (no "Apply" button needed)

**Toggle + Radio Pattern**
- "Filter by Your available equipment" → Single toggle switch (ON/OFF)
- "Sort by" → Radio button group (Alphabetically, Most Logged)
- Clear visual grouping with section headers
- State persists across sessions

#### Interaction Patterns

**Real-Time Filtering**
- Toggle equipment filter ON → List updates immediately
- Sort selection → List reorders with smooth animation
- Filter icon shows badge when filters active (e.g., "1")

**Smart Defaults**
- Equipment filter defaults to OFF (show all)
- Sort defaults to "Alphabetically"
- Most Logged option for experienced users

#### Visual Design Choices

**Filter Sheet Layout**
- 40% screen height (not full screen)
- Rounded top corners (16px radius)
- Drag handle at top (indicates dismissibility)
- Large toggle switches for easy thumb access

---

## 4. Modal and Navigation Patterns

### 4.1 Modal Hierarchy

**Reference Flows:** Multiple flows analyzed

#### Key UX Principles

**Three Modal Depths**

1. **Full-Screen Modal** (Primary navigation)
   - Exercise browser, Settings, Profile
   - Has back arrow or X in top-left
   - Can contain nested navigation

2. **Sheet Modal** (Contextual actions)
   - Exercise detail during workout
   - Filter panels
   - 70-90% screen height
   - Slides up from bottom
   - Dismissible by swipe-down

3. **Alert/Menu Modal** (Quick choices)
   - "Group exercises as..." menu
   - "Log All Sets?" confirmation
   - 30-50% screen height
   - Centered or bottom-aligned
   - Dims background 80%

#### Interaction Patterns

**Consistent Dismissal**
- Swipe down on sheet modals
- Tap outside on alerts
- X button always top-right
- Back arrow always top-left
- Hardware back button supported

**Modal Stacking Rules**
- Maximum 2 modals deep
- Third interaction dismisses oldest modal
- Prevents "modal hell" trap

**State Preservation**
- Workout timer continues when modal open
- List scroll position saved
- Form inputs preserved on dismiss

#### Navigation Affordances

**Visual Cues for Dismissal**
- Rounded top corners on sheets (affordance for swiping)
- Drag handle (horizontal line) at top of sheets
- Dimmed background (signals tappability)
- "Cancel" button always available

**Gestural Navigation**
- Swipe right from edge → Go back (iOS standard)
- Swipe down on sheet → Dismiss
- Long-press → Context menu
- Pull-to-refresh on lists

### 4.2 Action Button Placement

**Primary Action Pattern**
- Always bottom of screen (thumb zone)
- Full width minus 16px margins
- Fixed position (doesn't scroll away)
- High contrast color (coral/red vs dark background)

**Secondary Actions**
- Either: Top-right (e.g., "Edit", "Skip")
- Or: Below primary in footer
- Never more than 2 actions in footer

### 4.3 Confirmation Patterns

**Destructive Actions**
- "Delete from Workout" shows alert with:
  - Title: "Delete Exercise?"
  - Body: "This cannot be undone."
  - Buttons: "Cancel" (safe, left) + "Delete" (destructive, red, right)

**Smart Confirmations**
- "Don't Ask Again" checkbox for repeated actions
- Remembers user preference per-action type
- Can reset in Settings

---

## 5. Fitbod vs FitForge Current Approach

### 5.1 Workout Logging

| Aspect | Fitbod | FitForge Current | Recommendation |
|--------|--------|------------------|----------------|
| **Set Input** | Inline editing with number picker | [Need to verify] | Adopt inline editing with iOS number picker |
| **Rest Timer** | Auto-starts, dismissible | [Need to verify] | Implement auto-start with skip option |
| **Visual Feedback** | Large numbers, checkmarks, color states | [Need to verify] | Use larger font sizes (48-60pt) for gym visibility |
| **Quick Logging** | "Log All Sets" shortcut after 2/3 complete | [Need to verify] | Add smart batch logging |

### 5.2 Exercise Selection

| Aspect | Fitbod | FitForge Current | Recommendation |
|--------|--------|------------------|----------------|
| **Navigation** | 3 tabs + search + filter | [Need to verify] | Implement tabbed navigation |
| **Thumbnails** | All exercises show demo image | [Need to verify] | Add thumbnail support |
| **Multi-Select** | Long-press activates selection mode | [Need to verify] | Add multi-select for supersets |
| **Contextual Help** | One-time tooltip for first use | [Need to verify] | Add dismissible first-use hints |

### 5.3 Equipment Filtering

| Aspect | Fitbod | FitForge Current | Recommendation |
|--------|--------|------------------|----------------|
| **Filter UI** | Slide-up sheet (40% height) | [Need to verify] | Use bottom sheet instead of full-screen |
| **Real-Time Updates** | Filters apply immediately | [Need to verify] | Remove "Apply" button if present |
| **Filter Persistence** | Filters persist across sessions | [Need to verify] | Save filter state to localStorage |
| **Visual Indicator** | Badge on filter icon when active | [Need to verify] | Add badge to show active filters |

### 5.4 Modal Patterns

| Aspect | Fitbod | FitForge Current | Recommendation |
|--------|--------|------------------|----------------|
| **Modal Types** | 3 distinct depths with clear rules | [Need to verify] | Establish modal hierarchy |
| **Dismissal** | Multiple methods (swipe, tap, X, back) | [Need to verify] | Support all dismissal methods |
| **Stacking** | Maximum 2 deep | [Need to verify] | Enforce stacking limits |
| **Drag Handle** | Visible on all sheets | [Need to verify] | Add drag handle for affordance |

---

## 6. Implementation Priorities for FitForge

### High Priority (Core Workout Experience)

1. **Inline Set Editing**
   - Tap reps/weight → Number picker appears
   - No separate edit mode required
   - File: `components/ExerciseCard.tsx`

2. **Modal Exercise Detail**
   - Sheet modal for active exercise
   - Background image/video
   - Large, tappable controls
   - File: Create `components/ExerciseDetailSheet.tsx`

3. **Rest Timer Auto-Start**
   - Start after logging set
   - Show in both detail and list views
   - Dismissible with skip option
   - File: Add to `components/ExerciseCard.tsx`

4. **Large Touch Targets**
   - Increase button sizes to 48px minimum
   - Increase font sizes for reps/weight to 48-60pt
   - Add generous padding (16-20px)
   - Files: Update all exercise components

### Medium Priority (Exercise Selection)

5. **Tabbed Exercise Browser**
   - All | By Muscle | Categories tabs
   - Persistent search bar
   - File: `components/ExercisePicker.tsx`

6. **Exercise Thumbnails**
   - 60x60px demo images
   - Tap thumbnail → Show video
   - Tap name → Add to workout
   - Files: Update exercise data model + components

7. **Bottom Sheet Filter Panel**
   - 40% screen height
   - Real-time filtering
   - Toggle + radio patterns
   - File: Create `components/FilterSheet.tsx`

8. **Multi-Select Mode**
   - Long-press activates
   - Group as Superset/Circuit
   - File: Update `components/ExercisePicker.tsx`

### Lower Priority (Polish & Advanced Features)

9. **Smart Confirmations**
   - "Don't Ask Again" for repeated actions
   - Preference storage
   - File: Create `hooks/useConfirmation.ts`

10. **Contextual Tooltips**
    - First-use hints
    - Dismissible
    - Never show again
    - File: Create `components/OnboardingTooltip.tsx`

11. **Exertion Rating**
    - Post-set difficulty feedback
    - 5-option scale
    - File: Add to `components/ExerciseDetailSheet.tsx`

12. **Exercise Preview on Thumbnail Tap**
    - Modal with video/instructions
    - Doesn't add to workout
    - File: Create `components/ExercisePreviewModal.tsx`

---

## 7. Key Design Tokens to Extract

### Typography Scale (for Set Logging)
```css
--font-exercise-name: italic 24px/28px serif;
--font-set-value: bold 56px/64px sans-serif;
--font-set-label: 14px/20px sans-serif;
--font-button-primary: semibold 16px/24px sans-serif;
```

### Spacing System
```css
--space-set-row-vertical: 20px;
--space-modal-padding: 24px;
--space-button-height: 56px;
--space-touch-target-min: 48px;
```

### Color Palette (Dark Mode Focus)
```css
--color-background: #1a1a1a;
--color-surface: #2a2a2a;
--color-primary-action: #ff6b7a;
--color-success: #4ade80;
--color-text-primary: #ffffff;
--color-text-secondary: #a0a0a0;
--color-overlay: rgba(0, 0, 0, 0.6);
```

### Border Radius
```css
--radius-sheet-top: 16px;
--radius-button: 12px;
--radius-card: 8px;
--radius-badge: 50%;
```

### Shadows & Elevation
```css
--shadow-sheet: 0 -4px 20px rgba(0, 0, 0, 0.3);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.2);
--shadow-button: 0 4px 12px rgba(255, 107, 122, 0.3);
```

---

## 8. Component Library Mapping

### Proposed Component Architecture

```
components/
├── workout/
│   ├── WorkoutList.tsx              # Main workout view
│   ├── ExerciseCard.tsx             # Exercise in workout list
│   ├── ExerciseDetailSheet.tsx      # Modal for logging sets
│   ├── SetRow.tsx                   # Individual set display/edit
│   ├── RestTimer.tsx                # Timer component
│   └── QuickLogPrompt.tsx           # "Log all sets?" prompt
├── exercises/
│   ├── ExercisePicker.tsx           # Exercise selection modal
│   ├── ExerciseBrowser.tsx          # Tabbed browser
│   ├── ExerciseListItem.tsx         # Exercise in picker list
│   ├── ExercisePreview.tsx          # Video/instructions modal
│   ├── FilterSheet.tsx              # Filter/sort panel
│   └── ExerciseThumbnail.tsx        # Demo image component
├── ui/
│   ├── BottomSheet.tsx              # Reusable sheet modal
│   ├── ActionButton.tsx             # Primary CTA button
│   ├── NumberPicker.tsx             # Inline number input
│   ├── ConfirmationDialog.tsx       # Alert modal
│   └── OnboardingTooltip.tsx        # First-use hints
└── shared/
    ├── Header.tsx                   # Consistent header
    ├── SearchBar.tsx                # Search component
    └── TabBar.tsx                   # Tab navigation
```

---

## 9. Accessibility Considerations Observed

### From Fitbod Patterns

1. **Touch Target Sizes**
   - All interactive elements ≥48px
   - Extra padding in workout logging (sweaty fingers)

2. **Color Independence**
   - Checkmarks supplement green color
   - Icons supplement colored states
   - Text labels for all actions

3. **Screen Reader Support**
   - Button labels are descriptive
   - State changes announced
   - Exercise descriptions available

4. **Gesture Alternatives**
   - Swipe gestures have button alternatives
   - Long-press has explicit "Select" mode toggle
   - No gesture-only features

---

## 10. Animation & Feedback Patterns

### Observed Micro-Interactions

1. **Set Completion**
   - Checkmark animates in with scale + fade
   - Row background pulses green briefly
   - Haptic feedback on tap

2. **Modal Transitions**
   - Sheet slides up with spring animation
   - Background dims with fade (200ms)
   - Content fades in after sheet settles

3. **List Updates**
   - New exercises slide in from bottom
   - Deleted exercises fade + slide out
   - Reordering uses smooth drag animation

4. **Rest Timer**
   - Countdown animates
   - Final 3 seconds pulse
   - Completion uses gentle haptic

---

## Screenshot References

### Workout Logging
- **Main workout view:** `flows/workout/routine-options/starting-workout/logging-a-set/Fitbod iOS Logging a set 0.png`
- **Exercise detail (before logging):** `Fitbod iOS Logging a set 2.png`
- **Active number input:** `Fitbod iOS Logging a set 3.png`
- **Rest timer active:** `Fitbod iOS Logging a set 5.png`
- **Quick log prompt:** `Fitbod iOS Logging a set 12.png`

### Exercise Selection
- **Exercise browser:** `flows/workout/adding-an-exercise/Fitbod iOS Adding an exercise 1.png`
- **Multi-select mode:** `Fitbod iOS Adding an exercise 3.png`
- **Group options menu:** `Fitbod iOS Adding an exercise 4.png`

### Equipment Filtering
- **Filter sheet open:** `flows/workout/adding-an-exercise/filtering-by-available-equipment/Fitbod iOS Filtering by available equipment 1.png`

### Exercise Info
- **Muscle visualization:** `flows/workout/routine-options/starting-workout/logging-a-set/Fitbod iOS Logging a set 12.png`

### Exercise Replacement
- **Replacement suggestions:** `flows/workout/routine-options/replacing-an-exercise/Fitbod iOS Replacing an exercise 2.png`

---

## Next Steps

1. **Audit FitForge Current State**
   - Review existing workout logging flow
   - Document current exercise selection UX
   - Identify quick wins vs. major refactors

2. **Create Component Specs**
   - Design `ExerciseDetailSheet` component
   - Spec out `BottomSheet` base component
   - Define `NumberPicker` behavior

3. **Build Design System**
   - Create Figma/design file with extracted patterns
   - Define component variants
   - Document interaction states

4. **Implement High-Priority Items**
   - Start with inline set editing
   - Add modal exercise detail
   - Implement rest timer

5. **User Testing**
   - Test with actual workout scenarios
   - Validate touch target sizes in gym setting
   - Gather feedback on modal dismissal patterns
