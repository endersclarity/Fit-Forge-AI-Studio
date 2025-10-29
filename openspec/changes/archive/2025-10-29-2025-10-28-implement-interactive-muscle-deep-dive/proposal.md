# Proposal: Implement Interactive Muscle Deep-Dive Modal

**Change ID:** `implement-interactive-muscle-deep-dive`
**Type:** Feature Enhancement
**Status:** Draft
**Created:** 2025-10-28
**Priority:** High (Core workout planning feature)
**Depends On:**
- `implement-muscle-visualization-feature` (complete)
- `implement-forecasted-fatigue-workout-builder` (uses PlannedExercise types)

---

## Executive Summary

Build an interactive muscle deep-dive modal that transforms exercise discovery into an intelligent forecasting tool. Users click a muscle, explore exercises with real-time volume sliders showing forecasted fatigue across ALL muscles, optimize volume to find the "sweet spot" before bottleneck muscles fail, and build workout sets with locked-target volume.

**Problem:** Current exercise selection is guesswork. Users don't know how much they can push a target muscle before supporting muscles hit their limits. No way to visualize trade-offs or optimize volume before starting a workout.

**Solution:** Interactive modal with 3 tabs:
1. **Recommended** - Top 5 exercises ranked by efficiency (can push target muscle furthest before any supporting muscle hits 100%)
2. **All Exercises** - Full list with filters (Isolation/Compound/High Efficiency) and sort options
3. **History** - Last 3 exercises that used this muscle

**Key Innovation - Interactive Forecasting:**
- Select exercise → Volume slider appears (0-10,000 lbs)
- Slide volume → See real-time muscle impact bars for ALL engaged muscles
- "Find Sweet Spot" button → Auto-calculates optimal volume where target muscle reaches 100% before any supporting muscle
- "Build Sets" → Opens set/rep/weight calculator with LOCKED target volume (all adjustments maintain total)
- "Add to Workout" → Exports PlannedExercise to WorkoutPlannerModal

**Impact:**
- **Data-driven workout planning:** See exactly how volume affects all muscles before lifting
- **Optimal muscle targeting:** Find max volume for target muscle without overtaxing supporting muscles
- **Smart set building:** Automatically calculate sets/reps/weight to hit target volume
- **Prevent overtraining:** Visual warnings when supporting muscles would exceed 100%
- **Faster workout creation:** Discover, optimize, and plan exercises in one flow

---

## Why

### Current State

**What Exists:**
- ✅ Muscle visualization with click handlers
- ✅ Muscle states API (current fatigue %, baselines)
- ✅ Exercise library with muscle engagement %
- ✅ WorkoutPlannerModal with PlannedExercise support
- ✅ forecastMuscleFatigueForExercise utility (from workout planner)

**What's Missing:**
- ❌ Modal UI for muscle deep-dive
- ❌ Exercise efficiency ranking algorithm
- ❌ Interactive volume slider with real-time forecasting
- ❌ Sweet spot calculation (optimal volume finder)
- ❌ Locked-target set builder
- ❌ Integration between muscle modal and workout planner

### User Story

**Before (Current Experience):**
> "I want to train triceps. Let me pick... tricep pushdowns? Or maybe bench press? I don't know how much volume to do. I'll just guess 3 sets of 10 and see what happens. Oh no, my pectorals are overtrained now."

**After (With Interactive Modal):**
> "I click Triceps (40% fatigued). Modal shows Tricep Pushdowns ranked #1 - can get triceps to 98% before forearms hit limit. I slide volume to 4,200 lbs, see triceps → 100%, forearms → 45%. Perfect! Click 'Build Sets' → shows 3×10×140lbs. Add to workout. Done in 30 seconds."

### Design Philosophy

**Start Simple, Iterate:**
- Efficiency algorithm: Simple capacity-based ranking (not complex weighted formulas)
- Standard volume: Use 3,000 lbs for initial ranking (no need for historical averages yet)
- Set builder: Default to 3 sets, allow manual tweaks (not infinite variations)
- Integration: Export to console for MVP, wire to WorkoutPlannerModal later

**Progressive Disclosure:**
- Modal defaults to "Recommended" tab (5 exercises, simple)
- Exercise cards collapsed by default (clean list)
- Expand card → Volume slider + muscle impact (power users)
- "Build Sets" → Additional controls (when ready to commit)

---

## What Changes

### New Capabilities

**`exercise-efficiency-ranking`**
- Algorithm: `efficiency = (target_engagement × target_capacity) ÷ lowest_supporting_muscle_capacity`
- Ranks exercises by "how much can I push target muscle before ANY supporting muscle hits 100%"
- Returns efficiency score (0-∞), badge (Efficient/Limited/Poor), bottleneck muscle
- Simple capacity calculation: `capacity = 100 - currentFatiguePercent`

**`volume-forecasting-slider`**
- Interactive slider (0-10,000 lbs range)
- Real-time forecasted fatigue bars for all engaged muscles
- Color-coded: Green <70%, Yellow 70-100%, Red >100%
- Shows current → forecasted fatigue % (e.g., "40% → 67%")
- Highlights bottleneck muscle with warning

**`optimal-volume-finder`**
- "Find Sweet Spot" button calculates max volume where:
  - Target muscle reaches 100% fatigue
  - NO supporting muscle exceeds 100%
- Formula: Find minimum of (capacity_remaining × baseline ÷ engagement%) across all muscles
- Auto-slides volume slider to optimal point

**`locked-target-set-builder`**
- Target volume is LOCKED (from slider value)
- Default: 3 sets × 10 reps × calculated weight
- User can adjust sets → reps/weight recalculate to maintain volume
- User can adjust reps → weight recalculates
- User can adjust weight → shows warning if volume drops below target
- All math rounds to nearest 5 lbs for weight

**`muscle-deep-dive-modal-ui`**
- Tab-based interface (Recommended/All Exercises/History)
- Header: Muscle name, fatigue %, color-coded progress bar
- Recommended: Top 5 exercises by efficiency
- All Exercises: Full list + filters (Isolation/Compound/High Efficiency) + sort (Efficiency/Target%/Alphabetical)
- History: Last 3 exercises with date + volume
- ESC key, click-outside, X button to close

**`exercise-card-interactive`**
- Collapsed: Exercise name, target %, efficiency badge
- Expanded: Volume slider, muscle impact visualization, sweet spot finder, set builder
- "Add to Workout" exports PlannedExercise {exercise, sets, reps, weight}

### Modified Capabilities

**`muscle-visualization-interactions`**
- MODIFIED: onClick now opens MuscleDeepDiveModal (currently unused)
- ADDED: Pass muscle to modal via prop

**`workout-planner-integration`** (Deferred to future)
- MODIFIED: Accept pre-populated PlannedExercise from muscle modal
- MODIFIED: Open with exercises already in list

### Removed Capabilities

**None** - Purely additive.

---

## Implementation Approach

### Phase 1: Utilities (2 hours)
1. `utils/exerciseEfficiency.ts` - Ranking algorithm
2. `utils/volumeForecasting.ts` - Forecast calculation + optimal volume finder
3. `utils/setBuilder.ts` - Locked-target set calculation
4. Unit tests for all three

### Phase 2: Components (3 hours)
1. `components/MuscleDeepDiveModal.tsx` - Shell with tabs
2. `components/ExerciseCard.tsx` - Interactive card with slider + set builder
3. Wire recommended tab with efficiency ranking
4. Wire all exercises tab with filters
5. Wire history tab

### Phase 3: Integration (1 hour)
1. Connect modal to Dashboard muscle visualization
2. Export PlannedExercise to console (WorkoutPlannerModal integration deferred)
3. Manual testing

**Total: 6-8 hours**

---

## Success Criteria

**Functional:**
- ✅ Click muscle → Modal opens with correct data
- ✅ Recommended tab shows top 5 exercises ranked by efficiency
- ✅ Volume slider updates muscle impact bars in real-time
- ✅ Find Sweet Spot calculates optimal volume correctly
- ✅ Set builder maintains locked volume when adjusting sets/reps/weight
- ✅ All filters work (Isolation/Compound/High Efficiency)
- ✅ All sort options work (Efficiency/Target%/Alphabetical)
- ✅ History shows last 3 exercises with correct data
- ✅ Add to Workout logs PlannedExercise to console

**Performance:**
- ✅ Modal opens <200ms
- ✅ Volume slider updates <50ms (smooth 60fps)
- ✅ Efficiency calculation <100ms for all exercises

**UX:**
- ✅ User can find optimal exercise for a muscle in <30 seconds
- ✅ Visual feedback clearly shows bottleneck muscles
- ✅ Set builder is intuitive (no manual volume math required)

---

## Risks & Mitigation

### Risk: Efficiency algorithm produces unexpected rankings
**Likelihood:** Medium
**Impact:** High (users lose trust if rankings are wrong)
**Mitigation:**
- Start with simple capacity-based formula (easy to validate)
- Manual testing with known scenarios (e.g., triceps pushdowns vs bench press)
- Log efficiency scores to console for debugging
- Iterate based on real usage, not theory

### Risk: Volume slider is too sensitive (hard to hit exact value)
**Likelihood:** Low
**Impact:** Medium (frustrating UX)
**Mitigation:**
- Use 100 lbs step increment (not 1 lb)
- "Find Sweet Spot" button for precision
- Show exact volume number above slider

### Risk: Set builder is confusing (locked volume not obvious)
**Likelihood:** Medium
**Impact:** Medium (users confused why changes don't work as expected)
**Mitigation:**
- 🔒 icon + "Target: 4,200 lbs (locked)" label
- Show total volume calculation: "3 × 10 × 140 = 4,200 lbs"
- Warning when manual weight adjustment drops below target

### Risk: Integration with WorkoutPlannerModal is complex
**Likelihood:** High
**Impact:** Low (deferrable - console.log works for MVP)
**Mitigation:**
- Defer integration to separate change
- Export PlannedExercise to console for now
- Design modal as standalone tool (not tightly coupled)

---

## Dependencies

**Requires:**
- ✅ Muscle visualization with onClick handler
- ✅ MuscleStatesResponse type
- ✅ MuscleBaselinesResponse type
- ✅ PlannedExercise type
- ✅ EXERCISE_LIBRARY constant
- ✅ forecastMuscleFatigueForExercise utility (can extract from workoutPlanner.ts)

**Blocks:**
- Workout planner pre-population feature
- Exercise discovery "quick add" from muscle modal

**Related:**
- `implement-forecasted-fatigue-workout-builder` (uses same PlannedExercise type)
- `implement-personal-engagement-calibration` (can use calibrated % in modal)

---

## Open Questions

**Q1: Should we use historical average volume per exercise or standard 3,000 lbs for initial ranking?**
- **Decision:** Standard 3,000 lbs for MVP. Simpler, no historical data required.
- **Rationale:** Start simple. Add personalization later if needed.

**Q2: What rep range should set builder default to?**
- **Decision:** 8-12 reps (strength/hypertrophy range)
- **Rationale:** Most common training range. Can be configurable in profile later.

**Q3: Should locked-target volume allow going OVER the target if user manually adjusts weight up?**
- **Decision:** Yes, but show warning: "⚠️ Exceeds safe volume"
- **Rationale:** Give users control, but educate on consequences.

**Q4: How should we handle exercises with no muscle baseline data?**
- **Decision:** Use default 10,000 lbs baseline
- **Rationale:** Better than crashing. Users can calibrate baselines later.

**Q5: Should efficiency badge thresholds be configurable or hardcoded?**
- **Decision:** Hardcoded for MVP (>5.0=Green, 2.0-5.0=Yellow, <2.0=Red)
- **Rationale:** Avoid premature abstraction. Tune based on real data.

---

## Success Metrics

**Engagement:**
- 70%+ of users open muscle modal in first session
- Average 3+ modal opens per dashboard visit
- 50%+ of planned workouts include exercises from modal

**Behavior Change:**
- Users spend 30-60 seconds in modal before adding exercise (exploring options)
- 40%+ use "Find Sweet Spot" button at least once
- 60%+ add exercises via modal vs manual entry

**Feedback:**
- User testing: 4+ users find optimal exercise in <1 minute without instruction
- Positive feedback on "seeing all muscles" visualization
- No complaints about locked-target volume being confusing

---

## References

### Internal
- **Brainstorming Session:** `docs/plans/2025-10-28-muscle-deep-dive-modal.md` (Superpowers plan)
- **Related OpenSpec:** `openspec/changes/2025-10-27-implement-muscle-deep-dive-modal` (original proposal, different design)
- **Workout Planner:** `components/WorkoutPlannerModal.tsx`
- **Types:** `types.ts` (PlannedExercise, ForecastedMuscleState)

### External
- **Muscle Fatigue Science:** Progressive overload and volume-based fatigue modeling
- **Exercise Efficiency:** Isolation vs compound movement trade-offs

---

## Approval

**Product Owner:** Approved - Interactive forecasting is a killer feature
**Technical Lead:** Approved - Scope is reasonable, design is simple
**Design Lead:** Approved - Progressive disclosure matches design system

---

*This proposal replaces the original 2025-10-27 muscle-deep-dive-modal proposal with a refined, interactive design validated through Socratic brainstorming.*
