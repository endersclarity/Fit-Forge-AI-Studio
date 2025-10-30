# Capability: UI Bug Fixes

## Overview

Fix three critical UI bugs preventing users from using core features: non-functional "Add to Workout" button, missing Analytics back button, and hardcoded template metadata.

**Related Components:**
- `components/Dashboard.tsx` - Muscle Deep Dive modal
- `components/Analytics.tsx` - Analytics page header
- `components/WorkoutBuilder.tsx` - Template save dialog

---

## MODIFIED Requirements

### Requirement: Muscle Deep Dive Add to Workout

The system SHALL allow users to add exercises from the Muscle Deep Dive modal to their active workout or workout planner.

**Current Issue:** Button exists but only logs to console (line 516).

**Rationale:** Users expect to be able to add recommended exercises to their workout directly from the muscle analysis modal.

#### Scenario: User adds exercise from Muscle Deep Dive with no active workout

**Given:** User clicks on "Deltoids" muscle card on Dashboard
**And:** Muscle Deep Dive modal opens
**And:** User does not have an active workout in progress
**When:** User configures an exercise and clicks "Add to Workout"
**Then:** System navigates to `/workout` route
**And:** Exercise appears in workout with configured sets/reps/weight
**And:** User can immediately log the workout or add more exercises

#### Scenario: User adds exercise from Muscle Deep Dive with existing active workout

**Given:** User is on Dashboard
**And:** User has an active workout in progress with 2 exercises already added
**When:** User clicks "Deltoids" muscle card
**And:** User configures an exercise in Muscle Deep Dive modal
**And:** User clicks "Add to Workout"
**Then:** System navigates to `/workout` route
**And:** Exercise appears as 3rd exercise in the workout
**And:** Previously added exercises remain unchanged

---

### Requirement: Analytics Page Navigation

The system SHALL provide a back button on the Analytics page to return to the Dashboard.

**Current Issue:** No back button in header (line 73).

**Rationale:** All other pages (Profile, Personal Bests, Muscle Baselines) have back buttons. Analytics should follow the same navigation pattern.

#### Scenario: User navigates back from Analytics page

**Given:** User is on Analytics page (`/analytics`)
**When:** User clicks the back button in the page header
**Then:** System navigates to Dashboard (`/`)
**And:** Navigation completes in <100ms
**And:** Dashboard loads with current muscle states

#### Scenario: Back button styling matches other pages

**Given:** User opens Analytics page
**When:** Page renders
**Then:** Back button appears in top-left of header
**And:** Back button uses ArrowLeft icon from lucide-react
**And:** Back button styling matches Profile and Personal Bests pages
**And:** Back button is 44x44px touch target (mobile accessible)

---

### Requirement: Template Category and Variation Selection

The system SHALL prompt users to select category and variation when saving workout templates instead of hardcoding values.

**Current Issue:** All templates save as "Push A" regardless of exercises (lines 234-235).

**Rationale:** Templates need accurate metadata for proper organization and recommendations.

#### Scenario: User saves template and selects category/variation

**Given:** User has configured a workout in Workout Builder
**And:** Workout contains pull exercises (Pull-ups, Rows)
**When:** User clicks "Save Template"
**Then:** System displays category selection dialog
**And:** Dialog shows dropdown with options: Push, Pull, Legs, Core
**And:** Dialog shows dropdown with options: A, B, Both
**And:** Dialog shows "Save" and "Cancel" buttons

#### Scenario: Template saves with user-selected metadata

**Given:** User is saving a template
**And:** Category selection dialog is open
**When:** User selects "Pull" from category dropdown
**And:** User selects "B" from variation dropdown
**And:** User clicks "Save"
**Then:** Template saves to database with category="Pull" and variation="B"
**And:** Dialog closes
**And:** User sees success confirmation
**And:** Template appears in template list with "Pull B" label

#### Scenario: User cancels template save dialog

**Given:** Category selection dialog is open
**When:** User clicks "Cancel"
**Then:** Dialog closes
**And:** Template is NOT saved
**And:** User returns to Workout Builder with exercises preserved

---

## Testing

### Manual Test Cases

1. **Add to Workout (no active workout):**
   - Click muscle card → Configure exercise → Click "Add to Workout"
   - Verify navigation to `/workout`
   - Verify exercise appears with correct configuration

2. **Add to Workout (with active workout):**
   - Start workout with 1-2 exercises
   - Return to Dashboard
   - Click muscle card → Configure exercise → Click "Add to Workout"
   - Verify exercise added to existing workout

3. **Analytics back button:**
   - Navigate to Analytics
   - Click back button
   - Verify navigation to Dashboard

4. **Template category/variation:**
   - Create workout in Workout Builder
   - Click "Save Template"
   - Select category and variation
   - Verify template saves with correct metadata
   - Load template list and verify label is correct

### Regression Tests

- Verify Dashboard still loads correctly
- Verify Muscle Deep Dive modal still opens and displays correctly
- Verify Workout Planner still works
- Verify existing templates still load correctly
- Verify all other navigation works (Profile, Bests, Baselines)
- **NEW:** Verify WorkoutTracker normal flow (start workout WITHOUT preloaded exercises)
- **NEW:** Verify no UI lag with auto-save running every 5 seconds
- **NEW:** Verify multi-tab scenario - open same modal in 2 tabs, no localStorage corruption

---

## Implementation Notes

### Add to Workout Implementation

**CORRECTED approach:** Use existing `onStartPlannedWorkout` prop. All infrastructure already exists!

```typescript
const handleAddToWorkout = (planned: PlannedExercise) => {
  if (onStartPlannedWorkout) {
    onStartPlannedWorkout([planned]);  // Uses existing infrastructure
  }
  setDeepDiveModalOpen(false);
};
```

**Why this works:**
- `onStartPlannedWorkout` prop already exists on Dashboard
- App.tsx already has `handleStartPlannedWorkout` that navigates to `/workout`
- WorkoutTracker already handles `plannedExercises` prop
- No new code or route state needed!

### Analytics Back Button Implementation

Copy exact header structure from `Profile.tsx`:

```typescript
<div className="flex items-center gap-3 mb-6">
  <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-700 rounded-lg">
    <ArrowLeft size={20} />
  </button>
  <h1 className="text-2xl font-bold">Analytics</h1>
</div>
```

### Template Category/Variation Implementation

Add modal dialog with two dropdowns before template save:

```typescript
const [showSaveDialog, setShowSaveDialog] = useState(false);
const [templateCategory, setTemplateCategory] = useState<ExerciseCategory>('Push');
const [templateVariation, setTemplateVariation] = useState<'A' | 'B' | 'Both'>('A');

// Show dialog instead of saving directly
const handleSaveAsTemplate = () => {
  setShowSaveDialog(true);
};

// Actual save with user selections
const handleConfirmSave = async () => {
  const template = {
    name: templateName,
    category: templateCategory,  // User-selected
    variation: templateVariation, // User-selected
    exerciseIds: sets.map(s => s.exerciseId),
  };
  await api.createTemplate(template);
  setShowSaveDialog(false);
};
```

---

### Requirement: Muscle Detail Level Toggle

The system SHALL provide a UI control to switch between simple (13 muscles) and detailed (42 muscles) visualization.

**Current Issue:** Code reads `muscleDetailLevel` from localStorage but no UI to change it (line 475-477).

**Rationale:** System already supports detailed muscle tracking but users have no way to access it. This exposes hidden functionality.

#### Scenario: User toggles to detailed muscle view

**Given:** User is on Dashboard
**And:** Muscle heat map shows 13 simple muscle groups
**When:** User clicks "Show Detailed (42 muscles)" button
**Then:** System updates muscleDetailLevel in localStorage to "detailed"
**And:** Muscle visualization re-renders showing 42 specific muscles
**And:** Button text changes to "Show Simple (13 muscles)"
**And:** Setting persists across page reloads

#### Scenario: Detailed view persists across sessions

**Given:** User has selected detailed muscle view
**And:** User closes and reopens the app
**When:** Dashboard loads
**Then:** System reads muscleDetailLevel from localStorage
**And:** Muscle visualization displays 42 detailed muscles
**And:** Toggle button shows "Show Simple (13 muscles)"

---

### Requirement: Modal Auto-Save to Prevent Data Loss

The system SHALL automatically save workout planning data to localStorage every 5 seconds to prevent data loss.

**Current Issue:** Accidentally closing WorkoutBuilder or WorkoutPlanner modals loses all entered data.

**Rationale:** Users spend 5+ minutes configuring workouts. Data loss is frustrating and wastes time.

#### Scenario: WorkoutBuilder auto-saves planning data

**Given:** User opens Workout Builder modal
**And:** User adds 3 exercises with sets configured
**When:** 5 seconds elapse
**Then:** System saves all planning data to localStorage with key "workoutBuilder_draft"
**And:** Draft includes sets, templateName, and timestamp
**And:** Auto-save repeats every 5 seconds while modal is open

#### Scenario: User is prompted to resume or start fresh

**Given:** User was planning a workout in WorkoutBuilder
**And:** User accidentally closes the modal
**And:** Draft was saved less than 24 hours ago
**When:** User reopens Workout Builder modal
**Then:** System detects saved draft in localStorage
**And:** System displays confirmation dialog: "Resume Planning?"
**And:** Dialog shows message: "You have unsaved work from earlier. Would you like to resume or start fresh?"
**And:** Dialog shows "Resume" button
**And:** Dialog shows "Start Fresh" button

#### Scenario: User chooses to resume draft

**Given:** User sees draft restoration dialog
**When:** User clicks "Resume" button
**Then:** System restores sets and templateName from draft
**And:** Dialog closes
**And:** User can continue planning from where they left off

#### Scenario: User chooses to start fresh

**Given:** User sees draft restoration dialog
**When:** User clicks "Start Fresh" button
**Then:** System clears draft from localStorage
**And:** Dialog closes
**And:** User starts with empty modal state

#### Scenario: Old drafts are automatically cleaned up

**Given:** User has a saved draft from 25 hours ago
**When:** User opens Workout Builder modal
**Then:** System checks draft timestamp
**And:** Draft is older than 24 hours
**And:** System deletes the old draft from localStorage
**And:** User starts with a clean slate

#### Scenario: Draft is cleared after successful save

**Given:** User has planning data auto-saved
**When:** User clicks "Save Template"
**And:** Template saves successfully
**Then:** System clears "workoutBuilder_draft" from localStorage
**And:** Next modal open starts fresh (no restore)

#### Scenario: WorkoutPlanner has same auto-save behavior

**Given:** User opens Workout Planner modal
**When:** User configures exercises
**Then:** Data auto-saves to localStorage with key "workoutPlanner_draft"
**And:** All restoration and cleanup logic works identically to WorkoutBuilder

---

### Requirement: Remove Dead Code (BottomNav Component)

The system SHALL have unused BottomNav component removed from codebase.

**Current Issue:** Component defined but never imported/used (components/layout/BottomNav.tsx).

**Rationale:** Dead code clutters codebase and creates technical debt. Should be removed.

#### Scenario: BottomNav component is deleted

**Given:** BottomNav.tsx exists in components/layout/ directory
**When:** Developer runs cleanup task
**Then:** BottomNav.tsx file is deleted
**And:** Export is removed from components/layout/index.ts
**And:** No files import BottomNav
**And:** Build completes successfully with no errors

---

## Out of Scope

This change does NOT address:
- Personal Records edit/delete functionality
- Minor issues (breadcrumbs, simplified flows, exercise selector UX improvements)
- Incomplete features (dual-layer tracking full implementation, calibration system)

These will be addressed in separate changes if needed.
