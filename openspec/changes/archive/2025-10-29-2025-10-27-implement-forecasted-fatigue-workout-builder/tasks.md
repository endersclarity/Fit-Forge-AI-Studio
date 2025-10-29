# Tasks: Forecasted Fatigue Workout Builder (MVP)

**Change ID:** `implement-forecasted-fatigue-workout-builder`
**Estimated Effort:** 40 hours (1 week)

---

## Phase 0: Research & Validation ✅

- [x] Examine existing fatigue calculation logic (Workout.tsx:528-570)
- [x] Verify calculation can be extracted as pure function
- [x] Document muscle engagement data structure (constants.ts)
- [x] Confirm muscle baselines API exists (GET /api/muscle-baselines)
- [x] Create design.md with MVP scope
- [ ] Review design.md with user/team for approval

---

## Phase 1: Core Utility & Types (Day 1 - 8 hours) ✅

### 1.1 Create TypeScript Types
- [x] Add `PlannedExercise` interface to types.ts
- [x] Add `ForecastedMuscleState` interface to types.ts
- [x] Add `WorkoutPlan` interface to types.ts

### 1.2 Create Forecast Calculation Utility
- [x] Create `utils/workoutPlanner.ts`
- [x] Implement `calculateForecastedFatigue()` function
  - [x] Initialize muscle volumes to 0 for all muscles
  - [x] Calculate exercise volume (sets × reps × weight)
  - [x] Apply muscle engagement percentages
  - [x] Sum cumulative volume per muscle
  - [x] Calculate fatigue percentage (volume / baseline × 100)
  - [x] Cap fatigue at 100%
- [x] Export utility function

### 1.3 Unit Tests
- [x] Create `utils/workoutPlanner.test.ts`
- [x] Test: Single exercise calculation
- [x] Test: Multiple exercises cumulative effect
- [x] Test: Fatigue capped at 100%
- [x] Test: Zero exercises returns 0% fatigue
- [x] Test: Missing baseline uses default
- [x] Verify all tests pass (16/16 tests passing)

---

## Phase 2: Planning UI Components (Day 2 - 8 hours) ✅

### 2.1 Create PlannedExerciseList Component
- [x] Create `components/PlannedExerciseList.tsx`
- [x] Accept props: exercises, onUpdate, onRemove, muscleBaselines
- [x] Render list of planned exercises
- [x] Add number inputs for sets, reps, weight
  - [x] Set min="1" constraint
  - [x] Validate input: Math.max(1, value)
- [x] Calculate and display muscle impact per exercise
  - [x] Format: "Pec +40%, Tri +20%, Delt +15%"
  - [x] Only show muscles with >5% engagement
- [x] Add "Remove" button per exercise
- [x] Handle onUpdate when inputs change
- [x] Handle onRemove when remove clicked

### 2.2 Create WorkoutPlannerModal Component
- [x] Create `components/WorkoutPlannerModal.tsx`
- [x] Accept props: isOpen, onClose, onStartWorkout
- [x] Set up component state
  - [x] plannedExercises: PlannedExercise[]
  - [x] muscleBaselines: Record<Muscle, number>
  - [x] isExerciseSelectorOpen: boolean
- [x] Fetch muscle baselines on mount
  - [x] Call GET /api/muscle-baselines
  - [x] Store in state
- [x] Fetch current muscle states on mount
  - [x] Call GET /api/muscle-states
  - [x] Pass to current state visualization
- [x] Calculate forecasted states with useMemo
  - [x] Call calculateForecastedFatigue()
  - [x] Recompute when plannedExercises or muscleBaselines change
- [x] Render modal UI structure
  - [x] Full-screen modal backdrop
  - [x] Header with title and close button
  - [x] Two-column layout: Current | Forecasted
  - [x] PlannedExerciseList component
  - [x] Footer with Cancel and Start buttons

### 2.3 Exercise Selection Integration
- [x] Add "+ Add Exercise" button
- [x] Integrate ExerciseSelector component (reused from Workout.tsx)
- [x] Handle exercise selection
  - [x] Add to plannedExercises with defaults (3 sets, 10 reps, 50 lbs)
  - [x] Close selector
- [x] Update plannedExercises state
- [x] Verify forecast recalculates automatically

---

## Phase 3: Visualization Integration (Day 3 - 8 hours) ✅

### 3.1 Current State Visualization
- [x] Import MuscleVisualization component
- [x] Pass current muscle states from API
- [x] Add label: "Current State"
- [x] Position in left column
- [x] Style with bg-brand-surface, border-brand-muted

### 3.2 Forecasted State Visualization
- [x] Import MuscleVisualization component
- [x] Transform forecasted states to MuscleStatesResponse format
  - [x] Map ForecastedMuscleState to expected format
  - [x] Set fatigue percent to forecastedFatiguePercent
- [x] Add label: "Forecasted (After Workout)"
- [x] Position in right column
- [x] Style to match current state panel

### 3.3 Side-by-Side Layout
- [x] Create grid layout: `grid grid-cols-2 gap-4`
- [x] Ensure responsive on mobile (stack vertically)
- [x] Add visual separator between columns
- [x] Verify both visualizations render correctly

### 3.4 Real-Time Updates
- [x] Verify forecasted viz updates when exercise added
- [x] Verify forecasted viz updates when sets/reps/weight changed
- [x] Verify forecasted viz updates when exercise removed
- [x] Test with multiple exercises
- [x] Confirm performance is smooth (<100ms updates via useMemo)

---

## Phase 4: Dashboard Integration & Workflow (Day 4 - 8 hours) ✅

### 4.1 Add "Plan Workout" Button to Dashboard
- [x] Open `components/Dashboard.tsx`
- [x] Find "Start Custom Workout" button
- [x] Add new "Plan Workout" button next to it
  - [x] Text: "📊 Plan Workout"
  - [x] Icon: 📊
  - [x] Style: Match existing button styling
- [x] Add state: `isPlannerOpen: boolean`
- [x] Add onClick handler to open planner
- [x] Import WorkoutPlannerModal
- [x] Render WorkoutPlannerModal component
  - [x] Pass isOpen={isPlannerOpen}
  - [x] Pass onClose={() => setIsPlannerOpen(false)}
  - [x] Pass onStartWorkout={handleStartPlannedWorkout}

### 4.2 Implement "Start This Workout" Flow
- [x] Create handleStartPlannedWorkout function in App.tsx
  - [x] Accept plannedExercises: PlannedExercise[]
  - [x] Navigate to workout execution mode
  - [x] Pass planned exercises as initial state
- [x] Close planner modal
- [x] Open Workout component with pre-populated exercises

### 4.3 Modify Workout Component to Accept Pre-Populated Exercises
- [x] Open `components/Workout.tsx`
- [x] Add optional prop: `plannedExercises?: PlannedExercise[]`
- [x] On mount, if plannedExercises provided:
  - [x] Convert PlannedExercise[] to loggedExercises format
  - [x] Pre-populate loggedExercises state with exact sets/reps/weight from plan
  - [x] Sets are ready for execution (not logged until user completes them)
- [x] Test: Plan workout → Start → Verify exercises appear with correct values

---

## Phase 5: Polish & Edge Cases (PARTIALLY IMPLEMENTED)

### 5.1 Handle Edge Cases
- [x] **No Baselines Set**
  - [x] Use default baseline (5000 lbs per muscle) in calculateForecastedFatigue
  - [ ] Show warning: "Set muscle baselines in Profile for accurate forecasts"
  - [ ] Mark forecast as "Estimated"
- [x] **Empty Plan**
  - [x] Disable "Start This Workout" button if no exercises
  - [x] Show empty state message: "No exercises planned yet"
- [x] **Invalid Inputs**
  - [x] Enforce min="1" on number inputs
  - [x] Validate on change with Math.max(1, value)
- [x] **Forecast >100%**
  - [x] Cap fatigue at 100% in calculation
  - [ ] Show warning: "⚠️ High fatigue - consider reducing volume"

### 5.2 UX Improvements
- [x] Add loading state while fetching baselines/states
- [x] Add empty state: "No exercises planned yet"
- [x] Add confirmation: "Are you sure?" when closing with unsaved plan
- [x] Add keyboard shortcuts: Esc to close
- [ ] Add tooltips for muscle impact percentages

### 5.3 Styling & Visual Polish
- [x] Consistent spacing and padding
- [x] Smooth transitions for adding/removing exercises
- [x] Color-coded fatigue levels (inherited from MuscleVisualization):
  - [x] Green (0-33%): Ready
  - [ ] Yellow (34-66%): Moderate
  - [ ] Red (67-100%): Fatigued
- [ ] Responsive design: mobile, tablet, desktop
- [ ] Dark mode consistency

---

## Phase 6: Testing & Validation (Ongoing)

### 6.1 Integration Tests
- [ ] Test: Open planner from dashboard
- [ ] Test: Add exercise → Forecast updates
- [ ] Test: Edit sets/reps/weight → Forecast updates
- [ ] Test: Remove exercise → Forecast updates
- [ ] Test: Add multiple exercises → Cumulative forecast
- [ ] Test: Start workout → Exercises pre-populate
- [ ] Test: Close planner → State resets

### 6.2 Manual Validation
- [ ] Plan workout with 3 exercises
- [ ] Note forecasted fatigue percentages
- [ ] Execute workout
- [ ] Compare forecast vs actual (from Muscle Capacity panel)
- [ ] Calculate accuracy: |forecast - actual| / actual
- [ ] Target: ±15% accuracy
- [ ] Repeat for 5 workouts
- [ ] Document results

### 6.3 User Testing
- [ ] Have user (Kaelin) try planning a workout
- [ ] Observe: Is it intuitive?
- [ ] Ask: Does forecast make sense?
- [ ] Collect feedback on UX
- [ ] Note any confusion points
- [ ] Iterate based on feedback

---

## Phase 7: Documentation & Completion

### 7.1 Code Documentation
- [ ] Add JSDoc comments to calculateForecastedFatigue()
- [ ] Add component prop documentation
- [ ] Add inline comments for complex logic
- [ ] Update types.ts with exported types

### 7.2 User Documentation
- [ ] Add section to docs explaining workout planning
- [ ] Include screenshots of planning flow
- [ ] Explain how forecast is calculated
- [ ] Mention accuracy expectations

### 7.3 Update Changelog
- [ ] Add entry to CHANGELOG.md
- [ ] Format: "feat: add workout planner with forecasted fatigue"
- [ ] Include commit hash
- [ ] Note MVP scope limitations

### 7.4 Mark Proposal as Complete
- [ ] Update proposal.md status to "Implemented"
- [ ] Move to archive/ folder
- [ ] Update tasks.md to mark all tasks complete
- [ ] Create completion summary

---

## Acceptance Criteria (Must Pass Before Completion)

- [ ] ✅ User can click "Plan Workout" button on dashboard
- [ ] ✅ User can add exercises to plan without executing
- [ ] ✅ User can manually input sets/reps/weight for each exercise
- [ ] ✅ User sees current muscle fatigue state (left panel)
- [ ] ✅ User sees forecasted post-workout state (right panel)
- [ ] ✅ Forecast updates in real-time as exercises added/removed/edited
- [ ] ✅ User can click "Start This Workout" to begin execution
- [ ] ✅ Planned exercises pre-populate in workout execution mode
- [ ] ✅ Forecast accuracy within ±15% of actual (tested over 5 workouts)
- [ ] ✅ No console errors or warnings
- [ ] ✅ Responsive on mobile, tablet, desktop
- [ ] ✅ All unit tests pass
- [ ] ✅ User testing completed with positive feedback

---

## Progress Tracking

**Current Phase:** Phase 0 (Research & Validation) ✅
**Next Phase:** Phase 1 (Core Utility & Types)

**Estimated Completion:** 5 working days from start

---

## Notes

- Focus on MVP scope: forward planning mode only
- Defer volume sliders and backward mode to V2
- Prioritize accuracy and UX over features
- Validate with real workouts before marking complete
- Be ready to iterate based on user feedback
