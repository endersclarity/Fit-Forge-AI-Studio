# Proposal: Enhance Quick Builder with Smart Generation

**Change ID:** `enhance-quick-builder-smart-generation`
**Type:** Feature Enhancement
**Status:** Draft
**Created:** 2025-10-29
**Priority:** Medium
**Estimated Effort:** 3-5 days

## Why

Quick Builder successfully provides forecasted muscle fatigue visualization, but requires manual weight/reps configuration for every set. Users want intelligent automation:

**Current Pain Points:**
- Must manually enter weight/reps for each set (tedious)
- No guidance on optimal volume to hit muscle targets
- Personal records not leveraged for progressive overload suggestions

**User Value:**
- Work backward from desired fatigue outcomes → auto-generated workout
- Volume slider replaces manual set configuration
- Smart defaults from exercise history + 3% progressive overload

## What Changes

This change introduces three new capabilities:

1. **`volume-slider-ui`** (NEW) - Slider-based volume selection with real-time set/rep/weight breakdown
2. **`exercise-history-api`** (NEW) - API endpoint to query last performance and personal records per exercise
3. **`target-driven-workout-generation`** (NEW) - Set muscle fatigue targets, system recommends exercises + volume

### Modified

- **`quick-builder-workout-planning`** - Enhanced with volume slider and smart defaults

## Capabilities

See `specs/` directory for detailed requirements with scenarios.

## Dependencies

**Requires:**
- Quick Builder (implemented in commit `e7782e0`)
- `calculateForecastedMuscleStates()` function
- `workout_exercises` table for exercise history
- `muscle_baselines` table for volume calculations

**Blocks:** None (purely additive)

## Success Criteria

- Users configure complete workout in <30 seconds (vs current 2-3 minutes)
- 70%+ users prefer volume slider over manual input
- Target mode generates valid workouts 95%+ of the time
- Exercise history API responds in <200ms

## Risks

1. **Volume slider confuses users** - Mitigation: Show concrete breakdown "3×10@135", add tooltip, user testing
2. **Algorithm produces poor recommendations** - Mitigation: Greedy algorithm (simple), manual override, extensive testing
3. **History API slow** - Mitigation: LIMIT 10, proper indexing, caching
