# Implementation Tasks: Enhance Quick Builder with Smart Generation

## Phase 1: Exercise History API (Day 1)

- [x] Create `/api/exercise-history/:exerciseId/latest` endpoint in `backend/server.ts`
- [x] Implement database query with JOIN on `exercise_sets` and `workouts` tables
- [x] Add LIMIT 10 clause and ORDER BY date DESC
- [x] Calculate totalVolume by summing weight × reps across last session sets
- [x] Find personalRecord (highest weight × reps product across all history)
- [x] Return JSON response matching spec schema
- [x] Add database index: `CREATE INDEX idx_workouts_user_exercise_date ON workouts(user_id, date DESC)` (migration 008)
- [x] Add `getExerciseHistory()` method to `api.ts` frontend API client
- [x] Add `ExerciseHistoryResponse` type to `backend/types.ts`
- [ ] Test endpoint with curl/Postman for exercises with/without history
- [ ] **Validation:** API responds in <200ms, returns correct data structure

## Phase 2: Volume Slider Component (Day 2)

- [x] Create `generateSetsFromVolume()` utility function in `utils/setBuilder.ts`
  - Input: targetVolume, lastPerformance { weight, reps }
  - Apply 3% progressive overload to weight
  - Calculate reps needed (clamp to 5-15 range)
  - Round weight to nearest 5 lbs
  - Return { sets, reps, weight, actualVolume }
- [x] Add `formatSetBreakdown()` helper function
- [x] Add `calculateProgressiveOverload()` helper function
- [ ] Add unit tests for `generateSetsFromVolume()` with edge cases
- [x] Create `VolumeSlider` component in `components/VolumeSlider.tsx`
  - Range input: 0-10,000 lbs
  - Display current value and breakdown (e.g., "4,050 lbs → 3×10@135")
  - Update breakdown on slider change (debounced on release)
  - Progressive overload comparison display
  - Fine-tune button support
- [ ] Integrate volume slider into `SetConfigurator` component (or create new Quick Builder set configurator)
- [ ] Fetch exercise history on exercise selection
- [ ] Pre-populate slider with (lastVolume × 1.03) or default to 3,000 lbs
- [ ] Show comparison text: "Last time: 3×10@130, Today: 3×10@135 (+3%)"
- [ ] Add "Fine-tune" button that opens manual set editor with pre-populated values
- [ ] **Validation:** Slider updates smoothly (<50ms), breakdown calculation correct

## Phase 3: Smart Defaults Integration (Day 3)

- [x] Modify `SetConfigurator` to call `getExerciseHistory()` on exercise selection
- [x] Handle loading state while history fetches
- [x] Pre-populate volume slider based on history response
- [x] Calculate progressive overload: lastVolume × 1.03
- [x] Show "No history" state for first-time exercises (default to 3,000 lbs)
- [x] Wire volume slider output to workout builder state
- [x] Update forecasted muscle states when volume changes
- [ ] Test with exercises: (1) with history, (2) without history, (3) first workout ever
- [ ] **Validation:** Smart defaults appear instantly, progressive overload +3% applied correctly

## Phase 4: Target Mode UI (Day 4)

- [x] Add mode toggle button in `WorkoutBuilder.tsx`: "Forward Planning" | "Target-Driven"
- [x] Create `TargetModePanel` component
- [x] Add muscle target sliders (one per muscle, 0-100% range)
- [x] Show current fatigue vs target fatigue for each muscle
- [x] Add optional "Max Allowed" constraint input per muscle
- [x] Add "Generate Workout" button
- [x] Display loading state during generation
- [ ] **Validation:** UI switches between modes, sliders work, constraints save

## Phase 5: Target-Driven Algorithm (Days 5-6)

- [x] Create `utils/targetDrivenGeneration.ts` module
- [x] Implement `generateWorkoutFromTargets()` greedy algorithm:
  - Sort targets by fatigue gap (largest first)
  - For each target, score all exercises with `calculateExerciseScore()`
  - Pick best exercise, calculate volume with `calculateVolumeForFatigueGap()`
  - Check constraint violations, skip if violated
  - Update simulated muscle states
  - Return array of recommendations
- [x] Implement `calculateExerciseScore()` efficiency function:
  - Score = (target engagement) / (1 + collateral risk)
  - Collateral risk = sum of (engagement% / headroom) for constrained muscles
- [x] Implement `calculateVolumeForFatigueGap()`:
  - volume = (fatigueGap / 100) × baseline / (engagement% / 100)
- [x] Implement `calculateMuscleImpact()` to compute fatigue increase per muscle
- [ ] Add performance optimization: algorithm must complete in <500ms
- [ ] Add unit tests for algorithm with 5+ test scenarios
- [ ] **Validation:** Algorithm generates valid workouts, respects constraints, completes in <500ms

## Phase 6: Target Mode Integration (Day 6)

- [x] Wire `generateWorkoutFromTargets()` to "Generate Workout" button
- [x] Fetch exercise history for each recommended exercise
- [x] Generate set/rep/weight breakdown using `generateSetsFromVolume()`
- [x] Display recommendations in UI with:
  - Exercise name, suggested sets×reps@weight
  - Muscle impact breakdown (Pec +30%, Tri +18%, etc.)
  - Efficiency score or badge (High/Medium/Low)
- [x] Show projected results: "Pectoralis: 45% → 80% ✅"
- [x] Add "Accept" button to add all exercises to workout
- [x] Add "Regenerate" button to try again with different exercises
- [x] Handle edge cases: impossible targets, no valid exercises, constraint conflicts
- [ ] **Validation:** Complete target → generated workout flow works end-to-end

## Phase 7: Polish & Testing (Day 7)

- [ ] User testing with 3 different workout scenarios
- [ ] Performance profiling: ensure <50ms slider updates, <500ms generation
- [ ] Error handling: network failures, empty history, impossible targets
- [ ] Add helpful error messages: "Can't reach chest 100% without exceeding shoulder limit"
- [ ] Documentation: Update UI-ELEMENTS.md with new components
- [ ] Accessibility: keyboard navigation, ARIA labels for sliders
- [ ] Mobile testing: sliders work on touch devices
- [ ] **Validation:** 3 users successfully generate workout in <30 seconds each

---

## Dependencies

- Phase 1 (API) can start immediately
- Phase 2 (Slider) can start immediately
- Phase 3 depends on Phase 1 + Phase 2
- Phase 4 (Target UI) can start in parallel with Phase 3
- Phase 5 (Algorithm) depends on Phase 2 (for volume calculations)
- Phase 6 depends on Phase 4 + Phase 5
- Phase 7 depends on all previous phases

**Parallelizable work:** Phases 1+2 can run in parallel, Phases 3+4 can run in parallel

---

## Estimated Timeline

- **Days 1-2:** API + Slider (parallel) = 16 hours
- **Day 3:** Integration = 6 hours
- **Day 4:** Target UI = 6 hours
- **Days 5-6:** Algorithm + Integration = 12 hours
- **Day 7:** Polish = 4 hours

**Total:** 44 hours (~5-6 days with 8-hour days)

---

## Verification Checklist

After implementation, verify:

- [ ] Exercise history API returns correct data for 3 different exercises
- [ ] Volume slider pre-populates with last volume × 1.03
- [ ] Set breakdown calculation is mathematically correct
- [ ] Progressive overload comparison shows +3% increase
- [ ] Fine-tune button opens manual editor with correct values
- [ ] Target mode accepts muscle targets and constraints
- [ ] Algorithm generates workout meeting targets without constraint violations
- [ ] Projected results match actual muscle states after workout execution
- [ ] Performance: slider <50ms, API <200ms, generation <500ms
- [ ] User testing: 3/3 users successfully use target mode
