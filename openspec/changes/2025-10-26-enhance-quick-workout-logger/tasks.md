# Implementation Tasks: Enhance Quick Workout Logger

## Phase 1: Frontend State Management (4-6 hours)

### Task 1.1: Refactor QuickAdd State Machine
**Estimate:** 2 hours
**Dependencies:** None

- [ ] Create `QuickWorkoutMode` type: `'exercise-picker' | 'set-entry' | 'summary'`
- [ ] Define `QuickWorkoutState` interface with exercises array and current mode
- [ ] Define `LoggedExercise` interface with exerciseId, name, and sets array
- [ ] Replace single-set state with multi-exercise state structure
- [ ] Implement state transitions: picker → entry → summary → (another set/add exercise/finish)
- [ ] Add validation: prevent adding same exercise twice
- [ ] **Validation:** State transitions work correctly via console.log in dev
- [ ] **Test:** Can add multiple exercises, multiple sets, state persists correctly

### Task 1.2: Build Summary View Component
**Estimate:** 2 hours
**Dependencies:** Task 1.1

- [ ] Create `WorkoutSummaryView.tsx` component
- [ ] Display list of logged exercises with set details
- [ ] Format: "Exercise Name: Set X: Y reps @ Z lbs"
- [ ] Show to-failure indicator (🔥 emoji) when applicable
- [ ] Make summary scrollable when many exercises
- [ ] Add empty state (should not be shown if no sets)
- [ ] **Validation:** Summary renders correctly with 1 exercise, 3 exercises, 10 exercises
- [ ] **Test:** Scrolling works when content exceeds modal height

### Task 1.3: Implement Action Buttons
**Estimate:** 1-2 hours
**Dependencies:** Task 1.2

- [ ] Add "Another Set" button (secondary style, contextual label)
- [ ] Add "Add Exercise" button (secondary style)
- [ ] Add "Finish Workout" button (primary style, prominent)
- [ ] Wire "Another Set" → transitions to set-entry with pre-filled values
- [ ] Wire "Add Exercise" → transitions to exercise-picker
- [ ] Wire "Finish Workout" → calls API and closes modal
- [ ] Add responsive layout (stacked on mobile, horizontal on desktop)
- [ ] **Validation:** All three buttons work and trigger correct state transitions
- [ ] **Test:** Button hierarchy is clear, "Finish Workout" stands out

### Task 1.4: Add Close Confirmation Dialog
**Estimate:** 1 hour
**Dependencies:** Task 1.1

- [ ] Detect if sets have been logged when user clicks X or clicks outside modal
- [ ] Show confirmation dialog: "Discard workout? You have X exercises logged."
- [ ] Provide "Discard" and "Keep Logging" options
- [ ] If "Discard", clear state and close modal
- [ ] If "Keep Logging", keep modal open
- [ ] **Validation:** Confirmation only shows if sets exist, not on empty state
- [ ] **Test:** Can discard, can cancel, state cleared correctly on discard

---

## Phase 2: Multi-Set & Multi-Exercise Logic (3-4 hours)

### Task 2.1: Implement "Another Set" Flow
**Estimate:** 1.5 hours
**Dependencies:** Task 1.3

- [ ] On "Another Set" click, extract last logged exercise and set
- [ ] Pre-fill form with exercise name, last set's weight/reps
- [ ] Apply 10% rep reduction for smart progressive defaults
- [ ] Increment set number automatically
- [ ] Add hint labels: "(last set: 135 lbs)", "(suggested: -10%)"
- [ ] Allow user to modify all fields
- [ ] On "Log Set", append to current exercise's sets array
- [ ] Transition back to summary view
- [ ] **Validation:** Set number increments correctly (1, 2, 3, ...)
- [ ] **Test:** Pre-filled values are correct, user can modify, sets append correctly

### Task 2.2: Implement "Add Exercise" Flow
**Estimate:** 1 hour
**Dependencies:** Task 1.3

- [ ] On "Add Exercise" click, transition to exercise-picker mode
- [ ] Clear exercise picker search/filters
- [ ] When user selects exercise, check if already logged
- [ ] If already logged, show Toast info: "Already logged [name]. Use 'Another Set'."
- [ ] If not logged, fetch smart defaults for that exercise
- [ ] Transition to set-entry mode with set number = 1
- [ ] On "Log Set", add new exercise to exercises array
- [ ] **Validation:** Cannot add duplicate exercise
- [ ] **Test:** Can add multiple different exercises, state maintains all

### Task 2.3: Update Set Entry Form Display
**Estimate:** 0.5 hours
**Dependencies:** Task 2.1

- [ ] Modify QuickAddForm header to show "Exercise Name - Set X"
- [ ] Display set number prominently but not editable
- [ ] Update input hints to show smart default reasoning
- [ ] Add back arrow button to return to summary
- [ ] **Validation:** Set number and exercise name display correctly
- [ ] **Test:** Back arrow returns to summary without losing state

---

## Phase 3: Backend API Endpoint (3-4 hours)

### Task 3.1: Create Batch Workout Endpoint
**Estimate:** 2 hours
**Dependencies:** None (can parallel with Phase 1)

- [ ] Create `POST /api/quick-workout` route
- [ ] Define request schema validation (exercises array, sets array, timestamp)
- [ ] Validate all exercise names exist in EXERCISE_LIBRARY
- [ ] Validate timestamp format (ISO 8601) or default to now
- [ ] Create single workout record with user_id, date, created_at
- [ ] Create exercise_sets records (bulk insert for efficiency)
- [ ] Link all exercise_sets to same workout_id
- [ ] Return workout ID in response
- [ ] **Validation:** API accepts valid payloads, rejects invalid (wrong exercise, bad timestamp)
- [ ] **Test:** Database has 1 workout + N exercise_sets after call

### Task 3.2: Implement Category Auto-Detection
**Estimate:** 1 hour
**Dependencies:** Task 3.1

- [ ] Extract category from each exercise in EXERCISE_LIBRARY
- [ ] Count exercises per category (Push: 2, Pull: 1, etc.)
- [ ] Assign workout.category to category with most exercises
- [ ] If tie, use first logged exercise's category
- [ ] Update workout record with detected category
- [ ] **Validation:** Correct category for single-category workout
- [ ] **Validation:** Correct majority for mixed workouts
- [ ] **Validation:** First exercise wins on tie
- [ ] **Test:** Edge cases (1 exercise, all same category, 2-2 tie)

### Task 3.3: Implement Variation Auto-Detection (A/B)
**Estimate:** 1 hour
**Dependencies:** Task 3.2

- [ ] Query last workout of same category for this user
- [ ] If no last workout, assign variation "A"
- [ ] If last workout was "A", assign "B"
- [ ] If last workout was "B", assign "A"
- [ ] Update workout record with variation
- [ ] **Validation:** First workout gets "A"
- [ ] **Validation:** A → B, B → A alternation works
- [ ] **Validation:** Different categories have independent variations
- [ ] **Test:** 5 workouts alternate correctly (A, B, A, B, A)

### Task 3.4: Calculate Workout Duration
**Estimate:** 0.5 hours
**Dependencies:** Task 3.1

- [ ] Count total sets across all exercises
- [ ] Calculate: `(sets * 30) + ((sets - 1) * 60)` seconds
- [ ] Update workout.duration_seconds field
- [ ] **Validation:** 1 set = 30s, 2 sets = 90s, 9 sets = 750s
- [ ] **Test:** Duration stored correctly in database

---

## Phase 4: Post-Workout Processing Integration (2-3 hours)

### Task 4.1: Trigger PR Detection for All Exercises
**Estimate:** 1 hour
**Dependencies:** Task 3.1

- [ ] After workout created, loop through each logged exercise
- [ ] Call existing PR detection logic for each exercise with its sets
- [ ] Collect all PRs into array
- [ ] Include PR info in API response: exercise, type, old_value, new_value, percent
- [ ] **Validation:** PRs detected across multiple exercises
- [ ] **Test:** Response includes correct PR count and details

### Task 4.2: Update Muscle States for Total Volume
**Estimate:** 1 hour
**Dependencies:** Task 3.1

- [ ] Calculate muscle volume contributions from all exercises
- [ ] Sum volumes per muscle across all exercises in workout
- [ ] Update muscle_states table with new fatigue percentages
- [ ] Update last_trained timestamp for all engaged muscles
- [ ] Return muscle_states_updated: true in response
- [ ] **Validation:** Muscle fatigue reflects combined volume from multiple exercises
- [ ] **Test:** Chest fatigue after Push-ups + Bench Press = sum of both

### Task 4.3: Update Baselines for Exceeded Volumes
**Estimate:** 0.5 hours
**Dependencies:** Task 4.2

- [ ] Check if any muscle's total volume exceeds current baseline
- [ ] Update muscle_baselines table for exceeded muscles
- [ ] Collect updated baselines into array
- [ ] Include updated_baselines in API response
- [ ] **Validation:** Baselines update when volume exceeds previous max
- [ ] **Test:** Response includes correct muscles with old/new baseline values

### Task 4.4: Return Comprehensive Response
**Estimate:** 0.5 hours
**Dependencies:** Tasks 4.1, 4.2, 4.3

- [ ] Structure response JSON with all post-processing results
- [ ] Include: workout_id, category, variation, duration, prs, updated_baselines
- [ ] Add muscle_states_updated boolean flag
- [ ] **Validation:** Response schema matches expected format
- [ ] **Test:** Frontend can parse and use all response fields

---

## Phase 5: Toast Integration & Polish (2-3 hours)

### Task 5.1: Add onToast Prop to QuickAdd
**Estimate:** 0.5 hours
**Dependencies:** None (can parallel)

- [ ] Add `onToast: (message: string, type?: 'success' | 'error') => void` prop to QuickAdd
- [ ] Pass onToast from App component (manages Toast state)
- [ ] Ensure Toast renders above modal (z-index adjustment)
- [ ] **Validation:** Can trigger Toast from QuickAdd component
- [ ] **Test:** Toast appears above modal, visible and not hidden

### Task 5.2: Replace alert() with Toast Calls
**Estimate:** 1 hour
**Dependencies:** Task 5.1

- [ ] Remove `alert()` call after set logged (QuickAdd.tsx:120)
- [ ] Call `onToast('Set X logged! Y reps @ Z lbs', 'success')` instead
- [ ] Toast duration: 2 seconds
- [ ] Remove alert() for PR notifications
- [ ] Call `onToast('Workout saved! X PRs detected', 'success')` after finish
- [ ] Toast duration: 4 seconds
- [ ] **Validation:** No alert() calls remain in QuickAdd code
- [ ] **Test:** Toasts show for set logged, workout saved, PRs

### Task 5.3: Add Error Toast Handling
**Estimate:** 0.5 hours
**Dependencies:** Task 5.1

- [ ] Wrap API call in try/catch
- [ ] On error, call `onToast('Failed to save workout. Please try again.', 'error')`
- [ ] Error Toast does not auto-dismiss (duration: 0)
- [ ] Keep modal open on error so user can retry
- [ ] **Validation:** Error toast shows on API failure
- [ ] **Test:** Modal stays open, logged sets preserved, can retry

### Task 5.4: Add Loading States
**Estimate:** 1 hour
**Dependencies:** Task 3.1

- [ ] Add `saving` boolean to QuickAdd state
- [ ] Show loading spinner on "Finish Workout" button when saving
- [ ] Disable all buttons during save
- [ ] Show "Saving workout..." text
- [ ] Clear loading state on success or error
- [ ] **Validation:** Loading indicator shows during API call
- [ ] **Test:** Buttons disabled, user cannot trigger multiple saves

---

## Phase 6: Testing & Quality (2-3 hours)

### Task 6.1: Unit Tests for State Machine
**Estimate:** 1 hour
**Dependencies:** Phase 1 complete

- [ ] Test state transitions: picker → entry → summary
- [ ] Test "Another Set" increments set number correctly
- [ ] Test "Add Exercise" prevents duplicates
- [ ] Test "Finish Workout" validates at least 1 set logged
- [ ] Test close confirmation only shows when sets exist
- [ ] **Target:** 90%+ coverage of state management logic

### Task 6.2: Integration Tests for API
**Estimate:** 1 hour
**Dependencies:** Phase 3 complete

- [ ] Test `POST /api/quick-workout` with valid payload
- [ ] Test category detection for single-category and mixed workouts
- [ ] Test variation alternation (A → B → A)
- [ ] Test PR detection across multiple exercises
- [ ] Test muscle state updates with combined volume
- [ ] Test baseline updates when exceeded
- [ ] **Target:** All happy paths + error cases covered

### Task 6.3: E2E Test for Complete Flow
**Estimate:** 0.5 hours
**Dependencies:** All phases complete

- [ ] E2E: Open modal → log 3 exercises with 2-3 sets each → finish workout
- [ ] Verify workout appears in history with correct category/variation
- [ ] Verify PRs detected if applicable
- [ ] Verify Dashboard shows updated muscle states
- [ ] **Target:** Full user journey works end-to-end

### Task 6.4: Accessibility Audit
**Estimate:** 0.5 hours
**Dependencies:** Phase 5 complete

- [ ] Test keyboard navigation through all states
- [ ] Test screen reader announces summary content
- [ ] Test focus management between state transitions
- [ ] Test "Finish Workout" button has clear focus indicator
- [ ] Ensure all buttons have proper aria-labels
- [ ] **Target:** WCAG AA compliance maintained

---

## Phase 7: Documentation & Deployment (1 hour)

### Task 7.1: Update User-Facing Docs
**Estimate:** 0.5 hours

- [ ] Update docs to explain multi-set, multi-exercise logging
- [ ] Add screenshots of summary view
- [ ] Document "Another Set" and "Add Exercise" buttons
- [ ] Explain category/variation auto-detection

### Task 7.2: Archive Old Quick Add Spec
**Estimate:** 0.5 hours

- [ ] Run `openspec archive enhance-quick-workout-logger`
- [ ] Verify specs updated correctly
- [ ] Verify old change moved to archive/
- [ ] Update project.md with new capabilities

---

## Summary

**Total Estimated Time:** 16-23 hours
**Critical Path:** Phase 1 → Phase 2 → Phase 5 (frontend), Phase 3 → Phase 4 (backend)
**Parallelizable:** Phase 1-2 can run parallel with Phase 3-4

**Verification Gates:**
- [ ] Phase 1: Can add multiple exercises/sets via UI
- [ ] Phase 3: API accepts batch workout and creates correct DB records
- [ ] Phase 4: PR detection + muscle states work for multi-exercise workouts
- [ ] Phase 5: No alert() calls, Toast feedback works
- [ ] Phase 6: All tests pass, accessibility maintained
