# Issue #7: [Enhancement] Implement Detailed Muscle Fatigue Tracking (42 Specific Muscles)

**Status:** 🔴 Open
**Labels:** enhancement
**Created:** 10/31/2025
**Updated:** 10/31/2025

---

# [Enhancement] Implement Detailed Muscle Fatigue Tracking (42 Specific Muscles)

## Summary

Extend the muscle fatigue tracking system to calculate and update fatigue for all 42 detailed muscles (Triceps Long Head, Anterior Deltoid, stabilizers, etc.), not just the 13 visualization muscle groups.

## Current State

✅ **Working**: 13 visualization muscles (Pectoralis, Triceps, Deltoids, etc.)
- Fatigue calculated and displayed
- Recovery tracking functional
- Baseline learning working

❌ **Not Connected**: 42 detailed muscles
- Infrastructure exists (`detailed_muscle_states` table, API endpoints)
- Exercise library has detailed engagements in `backend/constants.ts`
- But `calculateWorkoutMetrics()` doesn't process them

## Problem

After fixing the core muscle fatigue bug (commit 561bc1e), the system now tracks major muscle groups correctly. However, minor muscle groups and stabilizers are not being updated:

**Example from Workout ID 60 (Push workout):**
- ✅ Pectoralis: 62% fatigued
- ✅ Triceps: 34% fatigued
- ❌ Triceps Long Head: 0% fatigued (should be calculated)
- ❌ Anterior Deltoid: 0% fatigued (should be calculated)
- ❌ Serratus Anterior: 0% fatigued (should be calculated)

## Technical Details

### What Exists
1. **Database Table**: `detailed_muscle_states` (42 detailed muscles)
2. **Exercise Data**: `backend/constants.ts` has `detailedMuscleEngagements` for each exercise
3. **API Endpoint**: `GET /api/muscle-states/detailed` returns detailed muscle data
4. **Mappings**: `backend/database/mappings.ts` maps 42 detailed → 13 visualization muscles
5. **Schema**: Complete dual-layer architecture documented

### What's Missing
1. **Shared Library**: `shared/exercise-library.ts` doesn't have `detailedMuscleEngagements` (only in `backend/constants.ts`)
2. **Calculation Logic**: `calculateWorkoutMetrics()` only processes `muscleEngagements`, not `detailedMuscleEngagements`
3. **Database Updates**: `detailed_muscle_states` table not being updated during workout processing

### Example Exercise Data Structure

**Current (shared/exercise-library.ts)**:
```typescript
{
  id: "ex32",
  name: "Incline Dumbbell Bench Press",
  muscleEngagements: [
    { muscle: Muscle.Pectoralis, percentage: 85 },
    { muscle: Muscle.Triceps, percentage: 45 },
    { muscle: Muscle.Deltoids, percentage: 40 }
  ]
}
```

**Needed (backend/constants.ts already has this)**:
```typescript
{
  id: "ex32",
  name: "Incline Dumbbell Bench Press",
  muscleEngagements: [...], // 13 visualization muscles
  detailedMuscleEngagements: [
    { muscle: DetailedMuscle.PectoralisMajorClavicular, percentage: 30, role: 'primary' },
    { muscle: DetailedMuscle.PectoralisMajorSternal, percentage: 70, role: 'primary' },
    { muscle: DetailedMuscle.AnteriorDeltoid, percentage: 33, role: 'secondary' },
    { muscle: DetailedMuscle.TricepsLongHead, percentage: 15, role: 'secondary' },
    { muscle: DetailedMuscle.TricepsLateralHead, percentage: 15, role: 'secondary' },
    { muscle: DetailedMuscle.TricepsMedialHead, percentage: 15, role: 'secondary' }
  ]
}
```

## Proposed Solution

### Phase 1: Sync Exercise Libraries
1. Copy `detailedMuscleEngagements` from `backend/constants.ts` to `shared/exercise-library.ts`
2. Ensure all 48 exercises have detailed muscle data
3. Update TypeScript types in `types.ts` if needed

### Phase 2: Extend Calculation Function
Modify `backend/database/analytics.ts:calculateWorkoutMetrics()`:
```typescript
// After existing muscle volume calculation...

// NEW: Calculate detailed muscle volumes
const detailedMuscleVolumes: Record<string, number> = {};

Object.entries(exercisesByName).forEach(([exerciseName, sets]) => {
  const exerciseInfo = EXERCISE_LIBRARY.find(e => e.name === exerciseName);
  if (!exerciseInfo?.detailedMuscleEngagements) return;

  const exerciseVolume = sets.reduce((total, set) =>
    total + (set.weight * set.reps), 0);

  exerciseInfo.detailedMuscleEngagements.forEach(engagement => {
    const muscleVolume = exerciseVolume * (engagement.percentage / 100);
    detailedMuscleVolumes[engagement.muscle] =
      (detailedMuscleVolumes[engagement.muscle] || 0) + muscleVolume;
  });
});

// Update detailed_muscle_states table
Object.entries(detailedMuscleVolumes).forEach(([muscle, volume]) => {
  // Get baseline for this detailed muscle (or inherit from viz muscle)
  const baseline = getDetailedMuscleBaseline(muscle);
  const fatiguePercent = Math.min((volume / baseline) * 100, 100);

  db.prepare(`
    UPDATE detailed_muscle_states
    SET fatigue_percent = ?,
        volume_today = ?,
        last_trained = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND detailed_muscle_name = ?
  `).run(fatiguePercent, volume, workoutDate, muscle);
});
```

### Phase 3: Testing
1. Test with Workout ID 60
2. Verify detailed muscle states API returns non-zero values
3. Verify aggregation to visualization muscles still works
4. Test import scripts

## Acceptance Criteria

- [ ] All 48 exercises in `shared/exercise-library.ts` have `detailedMuscleEngagements`
- [ ] `calculateWorkoutMetrics()` processes detailed muscle engagements
- [ ] `detailed_muscle_states` table updated after workout calculation
- [ ] API `GET /api/muscle-states/detailed` returns accurate fatigue for all 42 muscles
- [ ] Workout ID 60 shows non-zero fatigue for detailed push muscles:
  - Triceps Long Head > 0%
  - Triceps Lateral Head > 0%
  - Anterior Deltoid > 0%
  - Pectoralis Major Clavicular > 0%
  - Pectoralis Major Sternal > 0%
- [ ] Import scripts automatically calculate detailed muscle fatigue
- [ ] Tests pass for detailed muscle calculations

## Benefits

- More accurate recovery tracking (individual triceps heads recover at different rates)
- Better injury prevention (detect overworked stabilizers)
- Foundation for future features:
  - Detailed muscle heat maps
  - Stabilizer fatigue warnings
  - More granular workout recommendations
  - Advanced exercise selection based on specific muscle recovery

## Related Files

- `backend/database/analytics.ts` - Core calculation function
- `shared/exercise-library.ts` - Needs detailed engagements added
- `backend/constants.ts` - Source of detailed engagement data
- `backend/database/mappings.ts` - Detailed ↔ visualization mappings
- `backend/database/database.ts` - Has getDetailedMuscleStates() function
- `backend/database/schema.sql` - detailed_muscle_states table definition

## Estimated Effort

**4-6 hours** total:
- Phase 1: 1-2 hours (copy detailed engagements to shared library)
- Phase 2: 2-3 hours (extend calculateWorkoutMetrics function)
- Phase 3: 1 hour (testing and verification)

## Related Issues/PRs

- Fixed in commit 561bc1e: Core muscle fatigue bug (visualization muscles now working)
- Investigation docs: `docs/investigations/muscle-fatigue-investigation-plan.md`
- Resolution summary: `docs/implementations/MUSCLE-FATIGUE-RESOLUTION.md`

## Priority

**P2** - Enhancement (not blocking, but high value for accuracy)

Core functionality works (13 visualization muscles). This enhancement adds precision for advanced users and injury prevention.

---

**Questions/Discussion Welcome!**


---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/7
