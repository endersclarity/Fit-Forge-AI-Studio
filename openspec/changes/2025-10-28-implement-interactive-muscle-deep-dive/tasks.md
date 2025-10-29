# Tasks: Implement Interactive Muscle Deep-Dive Modal

## Phase 1: Core Utilities (2 hours)

### Task 1.1: Exercise Efficiency Algorithm
- [ ] Create `utils/exerciseEfficiency.ts`
- [ ] Implement `calculateEfficiencyScore(targetMuscle, muscleEngagements, muscleStates)`
- [ ] Implement `getEfficiencyBadge(score)` → {label, color}
- [ ] Implement `findBottleneckMuscle(targetMuscle, muscleEngagements, muscleStates)`
- [ ] Write unit tests covering isolation vs compound ranking
- [ ] **Validation:** Test passes, tricep pushdowns rank higher than bench press when pectorals fatigued

### Task 1.2: Volume Forecasting Utilities
- [ ] Create `utils/volumeForecasting.ts`
- [ ] Implement `forecastMuscleFatigueForExercise(muscleEngagements, volume, muscleStates)`
- [ ] Implement `findOptimalVolume(targetMuscle, muscleEngagements, muscleStates)`
- [ ] Write unit tests for forecasting accuracy
- [ ] **Validation:** Optimal volume calculation matches manual math

### Task 1.3: Set Builder with Locked Volume
- [ ] Create `utils/setBuilder.ts`
- [ ] Implement `calculateSetsRepsWeight(targetVolume, options)` → {sets, reps, weight}
- [ ] Implement `adjustSetConfiguration(targetVolume, current, adjustment)`
- [ ] Write unit tests for volume locking behavior
- [ ] **Validation:** Changing sets recalculates reps/weight to maintain volume

## Phase 2: Modal Components (3 hours)

### Task 2.1: Modal Shell
- [ ] Create `components/MuscleDeepDiveModal.tsx`
- [ ] Implement basic modal structure (backdrop, close handlers)
- [ ] Add header with muscle name + fatigue % + progress bar
- [ ] Implement 3-tab UI (Recommended/All/History)
- [ ] Add ESC key listener and click-outside handler
- [ ] **Validation:** Modal opens/closes correctly, tabs switch

### Task 2.2: Interactive Exercise Card
- [ ] Create `components/ExerciseCard.tsx`
- [ ] Implement collapsed state (name, target %, badge)
- [ ] Implement expanded state with volume slider (0-10,000 lbs)
- [ ] Add real-time muscle impact bars using `forecastMuscleFatigueForExercise`
- [ ] Add "Find Sweet Spot" button calling `findOptimalVolume`
- [ ] Add "Build Sets" section with set/rep/weight inputs
- [ ] Implement locked-target volume (adjustments maintain total)
- [ ] Add "Add to Workout" button
- [ ] **Validation:** Slider updates bars smoothly, set builder math works

### Task 2.3: Recommended Tab Implementation
- [ ] Filter exercises that engage target muscle
- [ ] Calculate efficiency scores for all exercises
- [ ] Sort by efficiency (descending)
- [ ] Take top 5 exercises
- [ ] Render ExerciseCard components
- [ ] **Validation:** Top 5 exercises make sense (isolation exercises rank high when supporting muscles fatigued)

### Task 2.4: All Exercises Tab Implementation
- [ ] Add filter chips (Isolation Only, Compound Only, High Efficiency)
- [ ] Add sort dropdown (Efficiency, Target%, Alphabetical)
- [ ] Implement filter logic:
  - Isolation: target ≥70%, all supporting <30%
  - Compound: 2+ muscles with ≥30% engagement
  - High Efficiency: green badge only
- [ ] Implement sort logic
- [ ] Render filtered + sorted ExerciseCard list
- [ ] **Validation:** Filters and sorts work correctly

### Task 2.5: History Tab Implementation
- [ ] Query workout history for exercises engaging target muscle
- [ ] Extract last 3 exercises with dates and total volume
- [ ] Render exercise cards with "X days ago" + volume
- [ ] Add "View workout" links (stub for now)
- [ ] Handle empty state ("No training history")
- [ ] **Validation:** History shows correct exercises from workout sessions

## Phase 3: Integration (1 hour)

### Task 3.1: Connect to Dashboard
- [ ] Import MuscleDeepDiveModal in Dashboard.tsx
- [ ] Add modal state (isOpen, selectedMuscle)
- [ ] Wire muscle visualization onClick to open modal
- [ ] Pass muscleStates, muscleBaselines, workoutHistory props
- [ ] Implement onAddToWorkout handler (console.log for MVP)
- [ ] **Validation:** Clicking muscle opens modal with correct data

### Task 3.2: Manual Testing & Polish
- [ ] Test all 13 muscle groups
- [ ] Test with different fatigue states (0%, 50%, 90%)
- [ ] Test volume slider performance (60fps?)
- [ ] Test set builder edge cases (0 weight, 100 reps, etc.)
- [ ] Test filters with empty results
- [ ] Test on mobile viewport
- [ ] **Validation:** No console errors, smooth UX

### Task 3.3: Documentation
- [ ] Add JSDoc comments to utility functions
- [ ] Update component README (if exists)
- [ ] Add inline comments for efficiency algorithm
- [ ] **Validation:** Code is self-documenting

## Phase 4: Future Enhancements (Deferred)

### Task 4.1: WorkoutPlannerModal Integration
- [ ] Replace console.log with WorkoutPlannerModal state update
- [ ] Open planner with pre-populated exercise
- [ ] Handle "add to existing workout" vs "start new workout"
- [ ] **Validation:** Exercise appears in planner after adding

### Task 4.2: Multiple Entry Points
- [ ] Add "Add Exercise" button that opens modal
- [ ] Allow opening modal without selecting muscle first
- [ ] Add muscle selector dropdown in modal header
- [ ] **Validation:** Modal accessible from multiple locations

### Task 4.3: Advanced Features
- [ ] Save user's preferred rep range in profile
- [ ] Use historical average volume per exercise for ranking
- [ ] Add "Compare Exercises" multi-select mode
- [ ] Forecasted fatigue visualization (line chart over time)
- [ ] **Validation:** User testing validates value of features

---

**Total Tasks:** 20 core tasks + 4 future tasks
**Estimated Time:** 6-8 hours for MVP (Tasks 1-3)
**Dependencies:** None (all required types and utilities exist)
