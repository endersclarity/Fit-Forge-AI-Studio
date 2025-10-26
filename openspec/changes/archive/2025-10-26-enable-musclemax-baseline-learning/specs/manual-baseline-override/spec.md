# Spec: Manual Baseline Override

**Capability:** `manual-baseline-override`
**Status:** Draft
**Change:** `enable-musclemax-baseline-learning`

---

## Overview

The manual baseline override system allows users to view and manually adjust muscle capacity baselines through a dedicated settings interface. It provides full transparency into system-learned vs. user-set vs. effective baseline values, with smart warnings when system learning exceeds user overrides.

**Core Behavior:** Users can set custom baselines that take priority over system-learned values, while still seeing what the system has learned. Both values are stored independently for full transparency and control.

---

## ADDED Requirements

### Requirement: Display Muscle Baseline Management UI

**Description:** System SHALL provide settings page showing all 13 muscle baselines with system-learned, user-override, and effective values.

**Acceptance Criteria:**
- Accessible from Settings → Personal Metrics → Muscle Baselines
- Shows all 13 muscles grouped by category (Upper Body, Lower Body, Core)
- Each muscle displays: system learned value, user override input, effective value
- Last updated timestamp for system-learned values
- Clear visual hierarchy and labeling

#### Scenario: User navigates to baseline management page

**Given:** User is on Settings page
**When:** User taps "Personal Metrics" → "Muscle Baselines"
**Then:** Page displays titled "Muscle Baselines"
**And:** Shows info text explaining what baselines are used for
**And:** Lists all 13 muscles in groups:
- Upper Body (9 muscles)
- Lower Body (4 muscles)
- Core (1 muscle)
**And:** Each muscle shows three values clearly labeled

#### Scenario: Viewing muscle with no user override

**Given:** Pectoralis has system_learned_max = 8,500, user_override = NULL
**When:** User views Pectoralis baseline card
**Then:** Displays "🤖 System: 8,500 lbs (Updated 2 days ago)"
**And:** Displays "✏️ Override: [empty input]"
**And:** Displays "✅ Using: 8,500 lbs"
**And:** No warnings shown

#### Scenario: Viewing muscle with active user override

**Given:** Triceps has system_learned_max = 3,200, user_override = 5,000
**When:** User views Triceps baseline card
**Then:** Displays "🤖 System: 3,200 lbs (Updated 5 days ago)"
**And:** Displays "✏️ Override: [5,000]"
**And:** Displays "✅ Using: 5,000 lbs (Your override)"
**And:** Shows badge or indicator that override is active

---

### Requirement: Allow User to Set Baseline Override

**Description:** User SHALL be able to input custom baseline value for any muscle, which takes priority over system-learned value.

**Acceptance Criteria:**
- Number input field for each muscle
- Saves to `muscle_baselines.user_override` column
- Validates input (positive number, min 100, max 1,000,000)
- Updates effective baseline calculation immediately
- Persists across sessions

#### Scenario: User sets override higher than system value

**Given:** Deltoids has system_learned_max = 2,500
**And:** User knows they are stronger than system has observed
**When:** User enters "4,000" in override field
**And:** Clicks save or field loses focus
**Then:** API call: PUT /api/muscle-baselines with `{muscle: "Deltoids", user_override: 4000}`
**And:** Database updated: user_override = 4,000
**And:** Effective baseline becomes 4,000 (override takes priority)
**And:** UI updates to show "✅ Using: 4,000 lbs (Your override)"

#### Scenario: User sets override lower than system value

**Given:** Biceps has system_learned_max = 7,200
**And:** User recovering from injury, wants conservative estimates
**When:** User enters "5,000" in override field
**Then:** Override saved successfully (user in control)
**And:** Effective baseline: 5,000 (uses override)
**And:** Warning shown: "⚠️ System learned 7,200 but using your override of 5,000"
**And:** Fatigue calculations use 5,000 (more conservative)

#### Scenario: Invalid override input rejected

**Given:** User attempts to set override
**When:** User enters negative number (e.g., "-100")
**Or:** User enters zero
**Or:** User enters value > 1,000,000
**Then:** Validation error shown: "Must be between 100 and 1,000,000"
**And:** Override not saved
**And:** Previous value (if any) retained

---

### Requirement: Allow User to Clear Override

**Description:** User SHALL be able to remove custom override, reverting to system-learned baseline.

**Acceptance Criteria:**
- "Clear" button or empty input triggers override removal
- Sets `user_override` to NULL in database
- Effective baseline reverts to `system_learned_max`
- Immediate visual feedback

#### Scenario: User clears existing override

**Given:** Quadriceps has user_override = 12,000, system_learned_max = 9,500
**When:** User clicks "Clear" button next to override input
**Or:** User deletes override text and saves empty field
**Then:** API call: PUT /api/muscle-baselines with `{muscle: "Quadriceps", user_override: null}`
**And:** Database: user_override = NULL
**And:** Effective baseline becomes 9,500 (reverts to system)
**And:** UI shows "✅ Using: 9,500 lbs" (no override indicator)

---

### Requirement: Warn When System Exceeds Override

**Description:** When system learns a baseline higher than user's override, SHALL display warning with option to update override.

**Acceptance Criteria:**
- Warning shown when `system_learned_max > user_override`
- Displays both values for comparison
- Offers "Update Override" button
- Warning dismissible but persists until resolved
- Non-blocking (user can ignore)

#### Scenario: System learns higher value than user override

**Given:** Hamstrings has user_override = 6,000, system_learned_max = 5,500
**When:** User completes workout that updates system_learned_max to 7,200
**And:** User views baseline management page
**Then:** Hamstrings card shows warning:
```
⚠️ Recent workout: 7,200 lbs
Your override (6,000) is lower than system learned value.
[Update Override to 7,200] [Dismiss]
```
**And:** Effective baseline still 6,000 (user override priority)
**And:** User can click button to update override to 7,200

#### Scenario: User updates override from warning

**Given:** Warning displayed for Hamstrings (override 6,000, system 7,200)
**When:** User clicks "Update Override to 7,200"
**Then:** user_override updated to 7,200
**And:** Warning disappears (values now aligned)
**And:** Effective baseline: 7,200

---

### Requirement: Provide Reset All Functionality

**Description:** User SHALL be able to reset all baselines to default values with confirmation dialog.

**Acceptance Criteria:**
- "Reset All to Defaults" button visible at bottom of page
- Shows confirmation dialog before executing
- Resets all `system_learned_max` to 10,000
- Clears all `user_override` values (sets to NULL)
- Cannot be undone (destructive action)

#### Scenario: User resets all baselines

**Given:** Multiple muscles have learned baselines and user overrides
**When:** User clicks "Reset All to Defaults" button
**Then:** Confirmation dialog shown:
```
⚠️ Reset All Baselines?
This will:
- Reset all system-learned baselines to 10,000
- Clear all your manual overrides
- Cannot be undone

[Cancel] [Reset All Baselines]
```
**When:** User confirms reset
**Then:** All 13 muscles updated:
- system_learned_max = 10,000
- user_override = NULL
**And:** UI refreshes showing default values
**And:** Success toast: "All baselines reset to defaults"

#### Scenario: User cancels reset

**Given:** User clicks "Reset All to Defaults"
**When:** Confirmation dialog appears
**And:** User clicks "Cancel"
**Then:** Dialog closes
**And:** No changes made to database
**And:** Baselines remain as they were

---

### Requirement: Calculate Effective Baseline for Fatigue

**Description:** Muscle fatigue calculations SHALL use effective baseline computed as: `user_override ?? system_learned_max ?? 10000`

**Acceptance Criteria:**
- Priority order: user override > system learned > default (10,000)
- NULL override = use system value
- NULL system value = use 10,000 default
- Calculation transparent and verifiable

#### Scenario: Muscle has user override set

**Given:** Lats has system_learned_max = 8,200, user_override = 10,000
**When:** System calculates fatigue for Lats
**Then:** Effective baseline = 10,000 (override priority)
**And:** Fatigue = (today_volume / 10,000) × 100

#### Scenario: Muscle has no override, system learned value exists

**Given:** Pectoralis has system_learned_max = 8,500, user_override = NULL
**When:** System calculates fatigue
**Then:** Effective baseline = 8,500 (system learned)
**And:** Fatigue = (today_volume / 8,500) × 100

#### Scenario: New muscle with no data yet

**Given:** Core has system_learned_max = 10,000 (default), user_override = NULL
**When:** System calculates fatigue
**Then:** Effective baseline = 10,000 (default)
**And:** Fatigue = (today_volume / 10,000) × 100

---

### Requirement: Persist Override Across Sessions

**Description:** User overrides SHALL be stored in database and persist across app restarts, device changes, and browser sessions.

**Acceptance Criteria:**
- Overrides stored in `muscle_baselines.user_override` column
- SQLite database persisted to disk
- No localStorage or session storage used
- Values available immediately on page load

#### Scenario: User sets override and restarts app

**Given:** User sets Glutes override to 15,000
**And:** Override saved to database
**When:** User closes app completely
**And:** User reopens app days later
**Then:** Baseline management page loads
**And:** Glutes shows user_override = 15,000
**And:** Effective baseline = 15,000
**And:** No data loss

---

## MODIFIED Requirements

None. This capability extends settings functionality without modifying existing capabilities.

**Note:** This change does update the internal implementation of fatigue calculation to use `COALESCE(user_override, system_learned_max, 10000)` instead of just `system_learned_max`, but this is an implementation detail of the new effective baseline requirement (REQ-206) rather than a modification to an existing capability spec.

---

## REMOVED Requirements

None. This capability extends settings functionality without removing existing features.

---

## Dependencies

**Required:**
- ✅ `muscle_baselines` table with `user_override` column (already exists)
- ✅ GET /api/muscle-baselines endpoint (already exists)
- ✅ PUT /api/muscle-baselines endpoint (already exists)

**Consumed Capabilities:**
- `baseline-learning-engine`: Provides system-learned values to display
- Settings page infrastructure: Adds new section

**Provides To:**
- Users: Direct control over baseline calibration
- `muscle-fatigue-tracking`: More accurate baselines (user-calibrated)

---

## UI Component Structure

**File:** `src/pages/MuscleBaselinesPage.tsx` (new) or section in existing Settings

**Components:**

1. **MuscleBaselineCard** (repeated for each muscle)
   - Props: `muscle, systemMax, userOverride, lastUpdated, onSave, onClear`
   - Displays all three values
   - Input field with validation
   - Save/Clear buttons
   - Warning alert when system > override

2. **MuscleBaselinesPage** (container)
   - Fetches baselines on mount
   - Groups muscles by category
   - Handles save/clear API calls
   - Manages reset all dialog
   - Shows success/error toasts

**API Calls:**

```typescript
// Load baselines
GET /api/muscle-baselines
Response: {
  Pectoralis: {systemLearnedMax, userOverride, updatedAt},
  ...
}

// Update override
PUT /api/muscle-baselines
Body: {
  updates: [{muscle: "Pectoralis", user_override: 5000}]
}

// Clear override
PUT /api/muscle-baselines
Body: {
  updates: [{muscle: "Pectoralis", user_override: null}]
}

// Reset all
PUT /api/muscle-baselines
Body: {
  resetAll: true
}
```

---

## Validation Rules

**User Override Input:**
- Type: Number (integer or decimal)
- Minimum: 100
- Maximum: 1,000,000
- Null/Empty: Clears override (valid)
- Invalid: Show error, prevent save

**Error Messages:**
- Negative/Zero: "Baseline must be a positive number"
- Too small: "Minimum baseline is 100 lbs"
- Too large: "Maximum baseline is 1,000,000 lbs"
- Non-numeric: "Please enter a valid number"

---

## Testing Coverage

**UI Tests:**
- Render all 13 muscles correctly ✓
- Input validation (min/max/type) ✓
- Save override updates UI ✓
- Clear override reverts to system ✓
- Warning shown when system > override ✓
- Reset all with confirmation ✓

**API Tests:**
- PUT /api/muscle-baselines updates database ✓
- NULL override persists correctly ✓
- Invalid values rejected ✓
- Reset all clears all overrides ✓

**Integration Tests:**
- Override persists across page reload ✓
- Effective baseline used in fatigue calc ✓
- Override priority over system value ✓

---

## Success Criteria

- ✅ All 13 muscles visible and editable
- ✅ Overrides persist across sessions
- ✅ Effective baseline calculation correct
- ✅ Smart warnings non-intrusive but visible
- ✅ Reset functionality works with confirmation
- ✅ Input validation prevents invalid data
- ✅ UI responsive and intuitive

---

## Accessibility Considerations

- Labels clearly associated with inputs
- Warning messages announced to screen readers
- Keyboard navigation supported
- Color not sole indicator (icons + text)
- Confirmation dialogs accessible
- Error messages descriptive and actionable
