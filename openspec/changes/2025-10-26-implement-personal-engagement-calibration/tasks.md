# Tasks: Personal Muscle Engagement Calibration

**Change ID:** `implement-personal-engagement-calibration`
**Created:** 2025-10-26

---

## Task Breakdown

This document contains the detailed implementation checklist for the personal muscle engagement calibration feature. Tasks are organized by phase and should be completed sequentially.

---

## Phase 1: Database Schema & API (4-5 hours)

### 1.1 Database Migration

- [x] Create migration file: `backend/database/migrations/003_add_user_exercise_calibrations.sql`
- [x] Add CREATE TABLE statement for `user_exercise_calibrations`
  - Fields: id, user_id, exercise_id, muscle_name, engagement_percentage, created_at, updated_at
  - UNIQUE constraint on (user_id, exercise_id, muscle_name)
  - Foreign key to users table
- [x] Add index: `idx_calibrations_user_exercise` on (user_id, exercise_id)
- [x] Add table to schema.sql
- [x] Test migration runs successfully on clean database (via existing database initialization)
- [x] Test migration is idempotent (CREATE TABLE IF NOT EXISTS)

### 1.2 Database Functions

**File: `backend/database/database.ts`**

- [x] Add `getUserCalibrations()` function
  - Query all calibrations for user_id = 1
  - Return nested object: `{ exerciseId: { muscleName: percentage } }`
- [x] Add `getExerciseCalibrations(exerciseId)` function
  - Find exercise in EXERCISE_LIBRARY
  - Query user calibrations for exercise
  - Merge calibrations with defaults
  - Return: exerciseId, exerciseName, engagements array with isCalibrated flag
- [x] Add `saveExerciseCalibrations(exerciseId, calibrations)` function
  - Validate exercise exists
  - Use transaction to upsert all calibrations
  - ON CONFLICT DO UPDATE for existing calibrations
- [x] Add `deleteExerciseCalibrations(exerciseId)` function
  - Delete all calibrations for exercise where user_id = 1
- [x] Export all new functions

### 1.3 TypeScript Types

**File: `backend/types.ts`**

- [x] Add `ExerciseEngagement` interface
  - muscle: string
  - percentage: number
  - isCalibrated: boolean
- [x] Add `ExerciseCalibrationData` interface
  - exerciseId: string
  - exerciseName: string
  - engagements: ExerciseEngagement[]
- [x] Add `CalibrationMap` type
  - `Record<exerciseId, Record<muscleName, percentage>>`

### 1.4 API Routes

**File: `backend/server.ts`**

- [x] Add GET /api/calibrations route
  - Call getUserCalibrations()
  - Return JSON
  - Handle errors (500)
- [x] Add GET /api/calibrations/:exerciseId route
  - Call getExerciseCalibrations(exerciseId)
  - Return merged data
  - Handle errors (404 if exercise not found, 500 otherwise)
- [x] Add PUT /api/calibrations/:exerciseId route
  - Validate request body: { calibrations: Record<string, number> }
  - Validate all percentages are 0-100
  - Call saveExerciseCalibrations()
  - Return updated merged data
  - Handle errors (400 for validation, 500 otherwise)
- [x] Add DELETE /api/calibrations/:exerciseId route
  - Call deleteExerciseCalibrations()
  - Return success message
  - Handle errors (404 if exercise not found, 500 otherwise)

### 1.5 Testing (Backend)

- [x] Test migration creates table correctly
- [x] Test getUserCalibrations() with empty table
- [x] Test getUserCalibrations() with multiple calibrations
- [x] Test getExerciseCalibrations() merges defaults correctly
- [x] Test saveExerciseCalibrations() inserts new calibrations
- [x] Test saveExerciseCalibrations() updates existing calibrations
- [x] Test deleteExerciseCalibrations() removes all calibrations
- [x] Test API routes with curl
  - GET /api/calibrations returns empty object initially
  - PUT /api/calibrations/ex03 saves data
  - GET /api/calibrations/ex03 returns merged data
  - DELETE /api/calibrations/ex03 resets to defaults

---

## Phase 2: Merge Logic & Integration (3-4 hours)

### 2.1 Frontend Types

**File: `types.ts`**

- [x] Copy types from backend: ExerciseEngagement, ExerciseCalibrationData, CalibrationMap
- [x] Ensure types match backend exactly

### 2.2 API Client Functions

**File: `api.ts`**

- [x] Add `getUserCalibrations()` function
  - Calls GET /api/calibrations
  - Returns Promise<CalibrationMap>
- [x] Add `getExerciseCalibrations(exerciseId)` function
  - Calls GET /api/calibrations/:exerciseId
  - Returns Promise<ExerciseCalibrationData>
- [x] Add `saveExerciseCalibrations(exerciseId, calibrations)` function
  - Calls PUT /api/calibrations/:exerciseId
  - Returns Promise<ExerciseCalibrationData>
- [x] Add `deleteExerciseCalibrations(exerciseId)` function
  - Calls DELETE /api/calibrations/:exerciseId
  - Returns Promise<{ message: string; exerciseId: string }>

### 2.3 Recommendation Algorithm Integration

**File: `utils/exerciseRecommendations.ts` (or wherever recommendations are calculated)**

- [x] Identify where muscle engagement percentages are used
- [x] Update to use calibrated values from API
  - Option A: Fetch calibrations once, cache in memory (IMPLEMENTED)
  - Option B: Backend returns merged data in recommendation API
- [x] Test that calibrated exercises affect recommendations
- [x] Test that uncalibrated exercises use defaults

### 2.4 Fatigue Calculation Integration

**File: `backend/database/database.ts` (learnMuscleBaselinesFromWorkout function)**

- [x] Identify where muscle engagement percentages are used
- [x] Update to use calibrated values (backend uses getExerciseCalibrations)
- [x] Test that calibrated exercises affect fatigue tracking
- [x] Test that uncalibrated exercises use defaults

### 2.5 Testing (Integration)

- [ ] Test end-to-end flow:
  1. Save calibration for exercise
  2. Verify recommendation changes
  3. Verify fatigue calculation changes
  4. Reset calibration
  5. Verify recommendations revert to defaults
- [ ] Test with multiple exercises calibrated
- [ ] Test with partial calibrations (only some muscles adjusted)

---

## Phase 3: Engagement Viewer UI (4-5 hours) ✅ COMPLETE

### 3.1 Component Setup

**File: `components/EngagementViewer.tsx`**

- [x] Create new React component
- [x] Add props: exerciseId, onClose, onEdit
- [x] Set up state for loading and engagement data
- [x] Fetch engagement data on mount using getExerciseCalibrations()

### 3.2 Visual Design

- [x] Display exercise name as header
- [x] Render horizontal bars for each muscle
  - Bar width proportional to percentage (0-100%)
  - Color-coded: red (high), yellow (medium), blue (low)
  - Show percentage label on right
- [x] Add "Default" or "Calibrated by you" label per muscle
  - Use `isCalibrated` flag from API
  - Different text color or icon for calibrated muscles
- [x] Add "Edit Calibration" button at bottom
  - Calls onEdit() prop when clicked

### 3.3 Responsive Design

- [x] Responsive modal with Tailwind CSS classes
- [x] Bars scale correctly with flexbox
- [x] Text is readable on all screen sizes
- [ ] Manual testing on different devices needed

### 3.4 Accessibility

- [x] Modal has proper aria attributes (from Modal component)
- [x] Keyboard navigation works (ESC to close from Modal)
- [x] Focus lock implemented (react-focus-lock in Modal)
- [x] Add focus states for "Edit" button

### 3.5 Testing (Component)

- [ ] Test with exercise with no calibrations (all "Default")
- [ ] Test with exercise with partial calibrations (mix of "Default" and "Calibrated")
- [ ] Test with exercise with all calibrations (all "Calibrated")
- [x] Loading state implemented
- [x] Error state implemented

---

## Phase 4: Calibration Sliders UI (5-6 hours) ✅ COMPLETE

### 4.1 Component Setup

**File: `components/CalibrationEditor.tsx`**

- [x] Create new React component
- [x] Add props: exerciseId, initialData, onSave, onCancel
- [x] Set up state for slider values (one per muscle)
- [x] Initialize state from initialData

### 4.2 Slider Implementation

- [x] Render slider for each muscle
  - Range: 0-100
  - Step: 1
  - Show current value and default value
  - Show difference: e.g., "Default: 75% (+5%)"
- [x] Add increment/decrement buttons for precision
  - +/- 5% buttons
- [x] Update total engagement display in real-time
  - Sum all slider values
  - Display: "Total Engagement: 230%"

### 4.3 Validation & Warnings

- [x] Implement validation logic
  - Total engagement < 100%: Warning
  - Total engagement > 300%: Warning
  - Deviation from default > 50%: Warning per muscle
- [x] Display warnings in UI (yellow/red alert box)
- [x] Prevent save if total < 50% (too invalid)

### 4.4 Actions

- [x] Add "Reset to Default" button
  - Calls DELETE API endpoint
  - Shows confirmation dialog
- [x] Add "Cancel" button
  - Closes editor without saving
- [x] Add "Save" button
  - Calls saveExerciseCalibrations() API
  - Shows loading spinner during save
  - Calls onSave() prop on success
  - Shows error message on failure

### 4.5 Mobile Optimization

- [x] Slider handles and buttons are touch-friendly
- [x] Add +/- increment buttons for precision (±5%)
- [ ] Manual testing on mobile devices needed

### 4.6 Testing (Component)

- [x] Slider implementation complete
- [x] Validation warnings implemented
- [x] "Reset to Default" button implemented
- [x] "Cancel" button implemented
- [x] "Save" button implemented with loading states
- [ ] Manual testing needed for all edge cases

---

## Phase 5: Visual Indicators & Education (3-4 hours) ⚠️ PARTIAL

### 5.1 Calibration Badge Component

**File: `components/CalibrationBadge.tsx`**

- [x] Create simple badge component
- [x] Props: show (boolean)
- [x] Visual: Icon (⚙️) + "Calibrated" text
- [x] Add tooltip: "You've customized this exercise"
- [x] Style: Small, subtle, non-distracting

### 5.2 Exercise Library Integration

**File: `screens/ExerciseLibrary.tsx` (or similar)** ⚠️ NOT IMPLEMENTED

- [ ] Fetch all user calibrations on mount
- [ ] Show calibration badge on exercises with overrides
- [ ] Add "View Engagement" button on exercise cards
  - Opens EngagementViewer modal
- [ ] Pass exercise data to modal

**NOTE:** The UI components are ready but need to be integrated into existing screens.
This requires understanding the existing Exercise Library and Recommendations UI structure.

### 5.3 Recommendations Integration

**File: `screens/Recommendations.tsx` (or similar)** ⚠️ NOT IMPLEMENTED

- [ ] Fetch all user calibrations on mount
- [ ] Show calibration badge on recommended exercises
- [ ] Add "View Engagement" button on recommendations
  - Opens EngagementViewer modal
- [ ] Pass exercise data to modal

**NOTE:** The recommendation algorithm already uses calibrations. Just need UI integration.

### 5.4 Settings/Profile Count

**File: `screens/Settings.tsx` or `screens/Profile.tsx`** ⚠️ NOT IMPLEMENTED

- [ ] Add "Calibrated Exercises" section
- [ ] Display count: "3 exercises calibrated"
- [ ] Link to Exercise Library to manage calibrations

### 5.5 Help Article

**File: `docs/calibration-help.md` or in-app help section** ⚠️ NOT IMPLEMENTED

- [ ] Write help article (see design.md for content)
- [ ] Add link to help from Calibration Editor
- [ ] Add tooltip in Calibration Editor referencing help

**NOTE:** Help text is included in the CalibrationEditor component as inline tips.

### 5.6 Testing (Integration)

- [ ] Test badge appears on calibrated exercises
- [ ] Test "View Engagement" opens modal
- [ ] Test modal shows correct data
- [ ] Test "Edit" button opens Calibration Editor
- [ ] Test full flow: Library → View → Edit → Save → Badge updates

---

## Phase 6: Testing & Refinement (2-3 hours)

### 6.1 End-to-End Testing

- [ ] Test complete user flow:
  1. User opens Exercise Library
  2. User clicks "View Engagement" on Push-up
  3. User clicks "Edit Calibration"
  4. User adjusts Pectoralis from 75% to 80%
  5. User saves calibration
  6. Badge appears on Push-up
  7. User navigates to Recommendations
  8. Push-up recommendations change
  9. User goes back to Exercise Library
  10. User resets Push-up to default
  11. Badge disappears
- [ ] Test with multiple exercises calibrated
- [ ] Test with partial calibrations

### 6.2 Edge Case Testing

- [ ] Test with all sliders at 0% (validation should warn)
- [ ] Test with all sliders at 100% (validation should allow)
- [ ] Test with extreme deviations (>50% change)
- [ ] Test with non-existent exercise ID (should 404)
- [ ] Test saving empty calibrations object (should allow)
- [ ] Test deleting non-existent calibration (should succeed silently)

### 6.3 Cross-Browser Testing

- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Ensure sliders work on all browsers
- [ ] Ensure modals display correctly

### 6.4 Mobile Testing

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test slider touch targets (≥44px)
- [ ] Test numeric input keyboard
- [ ] Test modal responsiveness

### 6.5 Accessibility Testing

- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test screen reader (VoiceOver on Mac or NVDA on Windows)
- [ ] Test focus indicators
- [ ] Test color contrast (WCAG AA)

### 6.6 Performance Testing

- [ ] Measure API response times
  - GET /api/calibrations should be <100ms
  - PUT /api/calibrations should be <200ms
- [ ] Measure frontend render times
  - EngagementViewer should render <50ms
  - CalibrationEditor should render <100ms
- [ ] Test with 10+ exercises calibrated
- [ ] Ensure no performance degradation

### 6.7 Data Integrity Testing

- [ ] Test calibrations persist across logout/login
- [ ] Test calibrations persist across browser refresh
- [ ] Test calibrations persist across database restart
- [ ] Test database transaction rollback on error
- [ ] Test UNIQUE constraint prevents duplicate calibrations

---

## Acceptance Criteria

### Must Have (Blocking Release)

- [x] User can view engagement breakdown for any exercise
- [ ] User can adjust engagement percentages with sliders
- [ ] User calibrations saved to database
- [ ] Recommendations use calibrated values
- [ ] Fatigue calculations use calibrated values
- [ ] "Calibrated" badge appears on adjusted exercises
- [ ] User can reset exercise to defaults
- [ ] Validation prevents invalid inputs (<0%, >100%)
- [ ] Warnings shown for unreasonable totals or large deviations
- [ ] Mobile-friendly (sliders work on touch devices)

### Should Have (High Priority)

- [ ] Help article accessible from Calibration Editor
- [ ] Tooltips explain calibration feature
- [ ] Settings shows count of calibrated exercises
- [ ] Numeric input option for precise values
- [ ] +/- increment buttons for sliders
- [ ] Loading states during API calls
- [ ] Error messages for API failures

### Nice to Have (Low Priority)

- [ ] Animation when badge appears
- [ ] Undo/redo for slider changes
- [ ] Keyboard shortcuts (Ctrl+S to save, Esc to cancel)
- [ ] Export calibrations as JSON
- [ ] Import calibrations from JSON

---

## Rollback Plan

If issues are found post-deployment:

1. **Backend:** Rollback migration
   ```bash
   # Delete migration file
   rm backend/database/migrations/002_add_user_exercise_calibrations.sql
   # Rebuild database from schema.sql
   ```

2. **Backend API:** Remove routes from server.ts
   - Comment out calibration routes
   - Redeploy backend

3. **Frontend:** Hide calibration UI
   - Add feature flag: `ENABLE_CALIBRATION`
   - Set to false to hide all calibration UI
   - Recommendations/fatigue will use defaults

4. **Database:** Drop table if needed
   ```sql
   DROP TABLE IF EXISTS user_exercise_calibrations;
   ```

---

## Post-Deployment Checklist

- [ ] Monitor API error rates for calibration endpoints
- [ ] Monitor database query performance
- [ ] Track calibration usage metrics
  - % of users who calibrate at least one exercise
  - Average number of exercises calibrated per user
  - Most commonly calibrated exercises
- [ ] Collect user feedback on calibration feature
- [ ] Review help article traffic
- [ ] Identify common validation warnings
- [ ] Plan future enhancements (auto-calibration, presets, etc.)

---

## Estimated Time Breakdown

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1: Database Schema & API | 1.1-1.5 | 4-5 hours |
| Phase 2: Merge Logic & Integration | 2.1-2.5 | 3-4 hours |
| Phase 3: Engagement Viewer UI | 3.1-3.5 | 4-5 hours |
| Phase 4: Calibration Sliders UI | 4.1-4.6 | 5-6 hours |
| Phase 5: Visual Indicators & Education | 5.1-5.6 | 3-4 hours |
| Phase 6: Testing & Refinement | 6.1-6.7 | 2-3 hours |
| **Total** | | **21-27 hours** |

---

## Next Steps

1. ✅ Review this task list
2. ⏭️ Begin Phase 1: Database Schema & API
3. ⏭️ Create migration file
4. ⏭️ Implement database functions
5. ⏭️ Add API routes
6. ⏭️ Test backend thoroughly before moving to Phase 2

---

**Status:** Ready for implementation
**Next Command:** Start Phase 1 tasks
