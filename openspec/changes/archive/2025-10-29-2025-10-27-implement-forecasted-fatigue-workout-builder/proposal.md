# Proposal: Implement Forecasted Fatigue Workout Builder

**Change ID:** `implement-forecasted-fatigue-workout-builder`
**Created:** 2025-10-27
**Status:** Draft
**Priority:** Epic / Future
**Estimated Effort:** 2-3 weeks (80-120 hours)

---

## Problem Statement

Based on user feedback (USER_FEEDBACK.md, 2025-10-27), this is identified as a **"KILLER FEATURE"**:

**User Quote:**
> "🔥 KILLER FEATURE - Forecasted Fatigue Workout Builder:
> - While building a workout, show forecasted fatigue levels in real-time
> - Use volume sliders instead of manual weight/reps entry during planning
> - As slider moves, visualize how muscle fatigue would increase for each engaged muscle
> - Show what all muscles would look like POST-workout
> - Then, once desired fatigue targets are set, automatically create workout structure (sets/reps/weight based on history and PRs)
> - This lets users work backward from desired fatigue outcomes to workout structure"

**Current Gap:**
- Users manually select exercises and enter sets/reps/weight
- No visibility into how workout will affect muscle fatigue BEFORE doing it
- No "work backward" planning from fatigue goals
- No real-time visualization of cumulative muscle impact

---

## Goals

### Primary Goal
Enable users to **design workouts by desired fatigue outcome**, not by exercise selection. Visualize muscle fatigue changes in real-time as workout is planned.

### Success Criteria
1. ✅ Volume sliders for each exercise (adjust intensity without manual input)
2. ✅ Real-time muscle fatigue visualization (updates as sliders move)
3. ✅ Shows POST-workout fatigue for all 13 muscle groups
4. ✅ "Work backward" mode: Set fatigue targets, auto-generate exercises
5. ✅ Auto-generates sets/reps/weight based on user history and PRs
6. ✅ Users can preview workout before executing it
7. ✅ Integration with existing workout logging system

---

## Proposed Solution

### Workflow: Forward Mode (Manual Planning)

```
1. User clicks "Build Custom Workout"
2. Interface shows:
   - Current muscle fatigue (before workout)
   - Exercise selector
   - Volume slider for selected exercise
   - Real-time muscle visualization (forecasted post-workout state)
3. User adds exercises and adjusts volume sliders
4. Muscle viz updates in real-time showing cumulative effect
5. When satisfied, user clicks "Generate Workout Structure"
6. System creates sets/reps/weight recommendations
7. User reviews and starts workout
```

### Workflow: Backward Mode (Target-Driven Planning)

```
1. User clicks "Build Custom Workout" → "Set Fatigue Targets"
2. Interface shows muscle visualization with sliders per muscle
3. User sets target fatigue for muscles they want to train
   Example: "Pectoralis 80%, Triceps 60%, Deltoids 40%"
4. System recommends exercises that achieve those targets
5. User reviews recommendations, adjusts if needed
6. System generates sets/reps/weight
7. User starts workout
```

### Key Components

#### 1. Volume Slider
- **Input:** Exercise + volume percentage (0-100%)
- **Output:** Forecasted volume (e.g., "3 sets of 10 reps at 50lbs")
- **Calculation:** Based on user's PR and muscle baseline

```typescript
interface VolumeSlider {
  exercise: Exercise;
  volumePercentage: number; // 0-100
  forecastedSets: number;
  forecastedReps: number;
  forecastedWeight: number;
  totalVolume: number; // weight * reps * sets
}
```

#### 2. Real-Time Fatigue Calculator

```typescript
function calculateForecastedFatigue(
  currentFatigue: MuscleStates,
  plannedExercises: VolumeSlider[]
): MuscleStates {
  const forecasted = { ...currentFatigue };

  for (const exercise of plannedExercises) {
    for (const engagement of exercise.exercise.muscleEngagements) {
      const muscleVolume = exercise.totalVolume * (engagement.percentage / 100);
      const fatigueIncrease = calculateFatigueFromVolume(muscleVolume, muscle);
      forecasted[engagement.muscle].fatiguePercentage += fatigueIncrease;
    }
  }

  return forecasted;
}
```

#### 3. Workout Structure Generator

```typescript
function generateWorkoutStructure(
  plannedExercises: VolumeSlider[],
  userHistory: WorkoutHistory,
  personalBests: PersonalBests
): WorkoutPlan {
  // For each exercise:
  // 1. Get user's last performance (weight, reps)
  // 2. Apply progressive overload (+3% weight or +3% reps)
  // 3. Calculate sets needed to hit target volume
  // 4. Return structured workout (3x10@50lbs format)
}
```

#### 4. Target-Driven Exercise Selector

```typescript
function recommendExercises(
  targetFatigue: Partial<Record<Muscle, number>>,
  currentFatigue: MuscleStates,
  availableExercises: Exercise[]
): Exercise[] {
  // Constraint satisfaction problem:
  // Find combination of exercises that achieve target fatigue
  // Minimize: Number of exercises
  // Maximize: Efficiency (hit targets with fewest exercises)
}
```

---

## Capabilities

This change introduces:

1. **`forecasted-fatigue-visualization`** (NEW)
   - Real-time muscle fatigue prediction
   - Cumulative effect calculation
   - Visual feedback as workout is planned

2. **`volume-based-workout-planning`** (NEW)
   - Volume sliders for exercise intensity
   - Converts volume % to sets/reps/weight
   - Based on user history and PRs

3. **`target-driven-workout-generation`** (NEW)
   - Set fatigue targets per muscle
   - Auto-recommend exercises to hit targets
   - Constraint satisfaction algorithm

4. **`workout-preview-mode`** (NEW)
   - Preview workout before executing
   - See forecasted fatigue outcomes
   - Adjust before committing

---

## Implementation Phases

### Phase 1: Fatigue Forecasting Engine (1-2 weeks)
- Implement `calculateForecastedFatigue()` function
- Integrate with muscle engagement data
- Test accuracy against actual post-workout fatigue
- Optimize calculation performance (real-time updates)

### Phase 2: Volume Slider UI (1 week)
- Design volume slider component
- Integrate with exercise selector
- Real-time fatigue visualization updates
- Preview panel showing post-workout state

### Phase 3: Workout Structure Generator (3-5 days)
- Implement `generateWorkoutStructure()` algorithm
- Integrate with user history and PRs
- Progressive overload logic
- Output format: sets × reps @ weight

### Phase 4: Target-Driven Mode (1-2 weeks)
- Design target-setting UI (sliders per muscle)
- Implement constraint satisfaction algorithm
- Exercise recommendation engine
- Test recommendation quality

### Phase 5: Integration & Polish (3-5 days)
- Integrate with existing workout logging
- Save forecasted workouts as templates
- Preview mode UI
- Testing and bug fixes

---

## Out of Scope (V1)

1. **AI-powered recommendations** - V1 uses algorithmic approach
2. **Multi-day workout planning** - V1 plans single workouts
3. **Periodization planning** - Future enhancement
4. **Social sharing of workout plans** - Out of scope
5. **Exercise video library** - Separate feature

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Forecasted fatigue inaccurate | High | Calibrate with real workout data, iterate |
| Volume slider UX confusing | Medium | User testing, clear help text |
| Constraint satisfaction too slow | Medium | Pre-compute, cache, optimize algorithm |
| Users prefer manual entry | Low | Keep both modes available |
| Complexity overwhelms users | Medium | Progressive disclosure, simple default mode |

---

## Dependencies

- ✅ Muscle engagement data (constants.ts)
- ✅ Muscle fatigue calculation engine
- ✅ Personal bests tracking
- ✅ Workout history API
- ⚠️  Need muscle baseline data (may need to enhance)
- ⚠️  Need user calibration data (for accuracy)

---

## Technical Challenges

### Challenge 1: Real-Time Performance
**Problem:** Recalculating fatigue for 13 muscles × N exercises on every slider move
**Solution:**
- Debounce slider updates (100-200ms)
- Memoize calculations
- Use Web Workers for heavy computation

### Challenge 2: Constraint Satisfaction Complexity
**Problem:** Finding optimal exercise combination is NP-complete
**Solution:**
- Use greedy algorithm (good enough, fast)
- Limit search space (top 20 exercises per muscle)
- Timeout after 1 second, return best found

### Challenge 3: Accurate Forecasting
**Problem:** Forecasted fatigue may not match actual fatigue
**Solution:**
- Calibrate with user's actual results
- Learn from discrepancies (future ML)
- Start conservative, adjust over time

---

## UI/UX Mockup

```
┌────────────────────────────────────────────────────────┐
│ Build Custom Workout                            [Mode] │
├────────────────────────────────────────────────────────┤
│ Current Fatigue          │  Forecasted Fatigue        │
│                          │                             │
│  🧍 Muscle Viz           │  🧍 Muscle Viz              │
│  (before workout)        │  (after workout)            │
│                          │                             │
├─────────────────────────┴─────────────────────────────┤
│ Planned Exercises                                      │
│ ┌────────────────────────────────────────────────┐    │
│ │ 1. Dumbbell Bench Press                        │    │
│ │    Volume: [▓▓▓▓▓░░░░░] 60%                    │    │
│ │    → 3 sets × 10 reps @ 50 lbs                 │    │
│ │    Pectoralis +40%, Triceps +20%, Deltoids +15%│    │
│ └────────────────────────────────────────────────┘    │
│ ┌────────────────────────────────────────────────┐    │
│ │ 2. Pull-ups                                    │    │
│ │    Volume: [▓▓▓▓▓▓▓▓░░] 80%                    │    │
│ │    → 4 sets × 8 reps @ Bodyweight              │    │
│ │    Lats +65%, Biceps +25%, Rhomboids +15%      │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ [+ Add Exercise]                                       │
├────────────────────────────────────────────────────────┤
│ [Preview Workout]  [Save as Template]  [Start Workout]│
└────────────────────────────────────────────────────────┘
```

---

## Success Metrics

1. **User Adoption:** >70% of users try forecasted builder within first month
2. **Accuracy:** Forecasted fatigue within ±10% of actual fatigue
3. **Efficiency:** Workout generation completes in <500ms
4. **User Satisfaction:** NPS >8 for this feature
5. **Retention:** Users who use builder return for >5 sessions

---

## Related

- **User Feedback:** USER_FEEDBACK.md (2025-10-27 entry - "KILLER FEATURE")
- **Related Proposals:**
  - Muscle Visualization (already implemented, used for display)
  - Personal Calibration (enhances accuracy)
  - Progressive Overload (used in workout generation)

- **Future Enhancements:**
  - AI-powered workout optimization
  - Multi-day periodization planning
  - Fatigue prediction ML model
  - Social workout sharing

---

## Notes

**Why This Is a "Killer Feature":**
- Shifts focus from "what exercises?" to "what outcomes?"
- Visualizes invisible data (muscle fatigue)
- Empowers users to optimize training scientifically
- Differentiates FitForge from all other workout trackers

**User's Insight:**
> "This lets users work backward from desired fatigue outcomes to workout structure"

This is the core innovation: outcome-driven workout design, not exercise-driven.

---

## Recommendation

**Status:** This is an **epic-level proposal** requiring significant effort (2-3 weeks).

**Suggested Approach:**
1. Implement other high-priority proposals first (homepage, navigation, rotation)
2. Validate forecasting accuracy with simpler prototype
3. User test core concept before full implementation
4. Consider phased rollout:
   - V1: Forward mode only (manual planning with forecast)
   - V2: Backward mode (target-driven generation)
   - V3: AI optimization

**Next Steps:**
1. Create detailed design document
2. Build prototype of volume slider + forecasting
3. User test prototype with Kaelin
4. Refine based on feedback
5. Full implementation if validated
