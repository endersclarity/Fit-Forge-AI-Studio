# Implementation Plan: Fix Muscle Baseline Calculation & User Prompts

**Status:** Ready for Implementation
**Created:** 2025-11-08
**Priority:** High - Core feature affecting workout planning accuracy

---

## Problem Summary

### Issue 1: Flawed Learning Algorithm
**Current Behavior:** System uses **single-set volume** as baseline instead of **session volume**
- Example: Bench press 100 lbs × 8 reps = 800 lbs total volume
- Pectoralis (60% engaged) = 480 lbs attributed to pecs
- **Bug:** Baseline set to 480 lbs (single set) instead of full session volume
- **Result:** Baselines are artificially low, causing all forecasted fatigue to hit 100%

**Evidence:**
- Production baselines: Pectoralis = 15,969 lbs, Triceps = 6,052 lbs
- User has completed multiple push workouts with ~9,180 lbs total volume
- Single-set approach explains why values are so low

### Issue 2: No User Confirmation
**Current Behavior:** Baselines auto-update silently after workouts
- App.tsx:83-86 - Updates `systemLearnedMax` automatically
- Only shows toast notification: "New Pectoralis max: 15,969 lbs!"
- **No user prompt or approval required**

**User's Vision:** Prompt before updating baseline, especially for new records

### Issue 3: Manual Overrides Not Saved
**Current Behavior:** User entered detailed exercise breakdowns with volumes
- Profile page has UI for manual baseline entry
- All `userOverride` values in production = `null`
- **Evidence:** User provided detailed exercise breakdown but data never persisted

---

## Root Cause Analysis

### Algorithm Issue (backend/database/database.ts:526-585)

```typescript
// CURRENT (WRONG): Tracks highest SINGLE SET volume per muscle
for (const set of failureSets) {
  const totalVolume = set.weight * set.reps;  // Single set
  const calibrations = getExerciseCalibrations(exercise.id);

  for (const engagement of calibrations.engagements) {
    const muscleVolume = totalVolume * (engagement.percentage / 100);
    const muscleName = engagement.muscle;

    // BUG: Keeps only the HIGHEST SINGLE SET, not session total
    if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
      muscleVolumes[muscleName] = muscleVolume;
    }
  }
}
```

**Should Be:** Track highest **session volume** (sum of all sets per muscle per workout)

### User Prompt Issue (App.tsx:73-88)

```typescript
// CURRENT (NO PROMPT): Auto-updates silently
if (volume > (newBaselines[muscle]?.systemLearnedMax || 0)) {
  newBaselines[muscle].systemLearnedMax = Math.round(volume);
  setToastMessage(`New ${muscle} max: ${Math.round(volume).toLocaleString()} lbs!`);
}
await setMuscleBaselines(newBaselines);
```

**Should Be:** Collect updates, show modal, await user confirmation

---

## Implementation Tasks

### Task 1: Fix Baseline Learning Algorithm

**Objective:** Calculate baselines from **session volume** (all sets per muscle per workout), not single-set max

**File:** `backend/database/database.ts`
**Function:** `rebuildMuscleBaselines()` (lines 526-585)

**Current Logic:**
1. Query all to_failure sets
2. For each set, calculate muscle volume
3. Keep **highest single-set volume** per muscle

**New Logic:**
1. Query all workouts
2. For each workout, sum volume per muscle (session total)
3. Keep **highest session volume** per muscle

**Implementation:**

```typescript
function rebuildMuscleBaselines(): BaselineUpdate[] {
  const rebuildTransaction = db.transaction(() => {
    // 1. Query all workouts with their sets
    const workouts = db.prepare(`
      SELECT DISTINCT workout_id
      FROM exercise_sets
      WHERE to_failure = 1
    `).all() as Array<{ workout_id: number }>;

    // 2. Calculate session volume per muscle for each workout
    const muscleMaxSessionVolumes: Record<string, number> = {};

    for (const { workout_id } of workouts) {
      // Get all sets from this workout
      const sets = db.prepare(`
        SELECT exercise_name, weight, reps
        FROM exercise_sets
        WHERE workout_id = ? AND to_failure = 1
      `).all(workout_id) as Array<{
        exercise_name: string;
        weight: number;
        reps: number
      }>;

      // Calculate volume per muscle for THIS SESSION
      const sessionMuscleVolumes: Record<string, number> = {};

      for (const set of sets) {
        const exercise = EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);
        if (!exercise) {
          console.warn(`Exercise not found in library: ${set.exercise_name}`);
          continue;
        }

        const totalVolume = set.weight * set.reps;
        const calibrations = getExerciseCalibrations(exercise.id);

        for (const engagement of calibrations.engagements) {
          const muscleVolume = totalVolume * (engagement.percentage / 100);
          const muscleName = engagement.muscle;

          // SUM volume for this muscle in this session
          sessionMuscleVolumes[muscleName] =
            (sessionMuscleVolumes[muscleName] || 0) + muscleVolume;
        }
      }

      // Track the highest SESSION volume across all workouts
      for (const [muscleName, sessionVolume] of Object.entries(sessionMuscleVolumes)) {
        if (!muscleMaxSessionVolumes[muscleName] ||
            sessionVolume > muscleMaxSessionVolumes[muscleName]) {
          muscleMaxSessionVolumes[muscleName] = sessionVolume;
        }
      }
    }

    // 3. Update baselines to match highest observed session volumes
    const updates: BaselineUpdate[] = [];

    for (const [muscleName, newMax] of Object.entries(muscleMaxSessionVolumes)) {
      const current = db.prepare(`
        SELECT system_learned_max FROM muscle_baselines
        WHERE user_id = 1 AND muscle_name = ?
      `).get(muscleName) as { system_learned_max: number } | undefined;

      if (current && current.system_learned_max !== newMax) {
        db.prepare(`
          UPDATE muscle_baselines
          SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = 1 AND muscle_name = ?
        `).run(newMax, muscleName);

        updates.push({
          muscle: muscleName,
          oldMax: current.system_learned_max,
          newMax
        });
      }
    }

    return updates;
  });

  return rebuildTransaction();
}
```

**Testing:**
1. Create test workout with 3 sets bench press: 100 lbs × 8 reps
2. Calculate expected Pectoralis volume:
   - Set 1: 800 lbs × 60% = 480 lbs
   - Set 2: 800 lbs × 60% = 480 lbs
   - Set 3: 800 lbs × 60% = 480 lbs
   - **Session total: 1,440 lbs** (not 480!)
3. Verify baseline updates to 1,440 lbs
4. Run `rebuildMuscleBaselines()` on production data
5. Verify new baselines are realistic (20,000-40,000 lbs range)

---

### Task 2: Add User Confirmation for Baseline Updates

**Objective:** Prompt user before auto-updating baselines with new records

**File:** `App.tsx`
**Location:** Lines 73-88 (handleWorkoutSave function)

**Current Implementation:**
```typescript
if (volume > (newBaselines[muscle]?.systemLearnedMax || 0)) {
  newBaselines[muscle].systemLearnedMax = Math.round(volume);
  setToastMessage(`New ${muscle} max: ${Math.round(volume).toLocaleString()} lbs!`);
}
await setMuscleBaselines(newBaselines);
```

**New Implementation:**

**Step 2.1: Create BaselineUpdateModal Component**

**File:** `components/BaselineUpdateModal.tsx` (new file)

```typescript
import React from 'react';
import { Muscle } from '../types';

interface BaselineUpdate {
  muscle: Muscle;
  oldMax: number;
  newMax: number;
  sessionVolume: number;
}

interface BaselineUpdateModalProps {
  isOpen: boolean;
  updates: BaselineUpdate[];
  onConfirm: () => void;
  onDecline: () => void;
}

const BaselineUpdateModal: React.FC<BaselineUpdateModalProps> = ({
  isOpen,
  updates,
  onConfirm,
  onDecline,
}) => {
  if (!isOpen || updates.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brand-surface p-6 rounded-lg max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">New Muscle Capacity Records! 🎉</h2>

        <p className="text-slate-400 mb-4">
          You just achieved new maximum session volumes for the following muscles:
        </p>

        <div className="space-y-3 mb-6">
          {updates.map(({ muscle, oldMax, newMax, sessionVolume }) => (
            <div key={muscle} className="bg-brand-dark p-3 rounded">
              <div className="font-semibold text-brand-cyan">{muscle}</div>
              <div className="text-sm text-slate-400 mt-1">
                Session Volume: <span className="text-white">{sessionVolume.toLocaleString()} lbs</span>
              </div>
              <div className="text-sm text-slate-400">
                Previous Max: {oldMax.toLocaleString()} lbs →
                <span className="text-green-400 ml-1">New Max: {newMax.toLocaleString()} lbs</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Update your muscle capacity baselines to match your performance?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Keep Current Baselines
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-brand-cyan hover:bg-cyan-400 text-brand-dark px-4 py-2 rounded-lg font-semibold"
          >
            Update Baselines
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaselineUpdateModal;
```

**Step 2.2: Update App.tsx to Use Modal**

**File:** `App.tsx`
**Location:** Lines 73-88

```typescript
// Add state for baseline update modal
const [baselineUpdates, setBaselineUpdates] = useState<Array<{
  muscle: Muscle;
  oldMax: number;
  newMax: number;
  sessionVolume: number;
}>>([]);
const [showBaselineModal, setShowBaselineModal] = useState(false);

// Modified handleWorkoutSave
const handleWorkoutSave = useCallback(async (session: WorkoutSession) => {
  // ... existing workout save logic ...

  // 2. Calculate fatigue and collect potential baseline updates
  const muscleFatigue: Partial<Record<Muscle, number>> = {};
  const pendingUpdates: Array<{
    muscle: Muscle;
    oldMax: number;
    newMax: number;
    sessionVolume: number;
  }> = [];

  Object.entries(workoutMuscleVolumes).forEach(([muscleStr, volume]) => {
    if (volume <= 0) return;
    const muscle = muscleStr as Muscle;
    const baseline = muscleBaselines[muscle]?.userOverride ||
                    muscleBaselines[muscle]?.systemLearnedMax ||
                    10000;
    const fatiguePercent = Math.min((volume / baseline) * 100, 100);
    muscleFatigue[muscle] = fatiguePercent;

    // Check if this is a new record (session volume exceeds baseline)
    const currentMax = muscleBaselines[muscle]?.systemLearnedMax || 0;
    if (volume > currentMax) {
      pendingUpdates.push({
        muscle,
        oldMax: currentMax,
        newMax: Math.round(volume),
        sessionVolume: Math.round(volume),
      });
    }
  });

  // If there are new records, show modal instead of auto-updating
  if (pendingUpdates.length > 0) {
    setBaselineUpdates(pendingUpdates);
    setShowBaselineModal(true);
    // Continue with workout save, but don't update baselines yet
  }

  // Save muscle states
  const muscleUpdates: Record<string, {
    initial_fatigue_percent: number;
    last_trained: string
  }> = {};
  Object.entries(muscleFatigue).forEach(([muscleStr, fatigue]) => {
    const muscle = muscleStr as Muscle;
    muscleUpdates[muscle] = {
      initial_fatigue_percent: fatigue,
      last_trained: new Date(session.endTime).toISOString()
    };
  });

  await muscleStatesAPI.updateNew(muscleUpdates);

  // ... rest of workout save logic ...
}, [muscleBaselines, personalBests, workouts]);

// Add handler for baseline update confirmation
const handleBaselineUpdateConfirm = useCallback(async () => {
  const newBaselines = { ...muscleBaselines };

  baselineUpdates.forEach(({ muscle, newMax }) => {
    newBaselines[muscle].systemLearnedMax = newMax;
    setToastMessage(`New ${muscle} max: ${newMax.toLocaleString()} lbs!`);
  });

  await setMuscleBaselines(newBaselines);
  setShowBaselineModal(false);
  setBaselineUpdates([]);
}, [baselineUpdates, muscleBaselines, setMuscleBaselines, setToastMessage]);

const handleBaselineUpdateDecline = useCallback(() => {
  setShowBaselineModal(false);
  setBaselineUpdates([]);
}, []);
```

**Step 2.3: Add Modal to JSX**

```typescript
// In App.tsx return statement, add:
<BaselineUpdateModal
  isOpen={showBaselineModal}
  updates={baselineUpdates}
  onConfirm={handleBaselineUpdateConfirm}
  onDecline={handleBaselineUpdateDecline}
/>
```

**Testing:**
1. Complete a workout with high volume
2. Verify modal appears with new records
3. Click "Keep Current Baselines" - verify no update
4. Complete another workout with high volume
5. Click "Update Baselines" - verify baselines update
6. Verify toast messages show correctly

---

### Task 3: Investigate Manual Override Save Failure

**Objective:** Determine why user's manual baseline entries didn't persist

**File:** `components/Profile.tsx`
**Location:** Line 244-248 (handleBaselineChange)

**Current Implementation:**
```typescript
const handleBaselineChange = (muscle: Muscle, value: string) => {
  setMuscleBaselines(prev => ({
    ...prev,
    [muscle]: {
      ...prev[muscle],
      userOverride: value === '' ? null : parseInt(value) || 0
    }
  }));
};
```

**Investigation Steps:**

1. **Check if useAPIState auto-saves**
   - File: `hooks/useAPIState.ts` lines 50-69
   - Verify `updateState` function calls `updateFn` immediately
   - **Status:** ✅ Confirmed - auto-saves on every setState call

2. **Check if PUT /muscle-baselines works**
   - File: `backend/server.ts` (muscle baselines PUT endpoint)
   - Test endpoint directly with curl
   - Verify database update occurs

3. **Check for silent errors**
   - Add error handling to Profile.tsx baseline changes
   - Log errors to console
   - Check Railway logs for PUT failures

**Fix Implementation:**

**Option A: Add Explicit Save Button**
- Remove auto-save on every keystroke
- Add "Save Baselines" button to Profile page
- Show confirmation toast on successful save

**Option B: Add Error Handling & Retry**
- Keep auto-save behavior
- Add visible error messages if save fails
- Add retry logic

**Recommended: Option A (Explicit Save)**

```typescript
// Profile.tsx - Add state for pending changes
const [pendingBaselineChanges, setPendingBaselineChanges] = useState<
  Partial<Record<Muscle, number | null>>
>({});
const [isSaving, setIsSaving] = useState(false);

// Modified handleBaselineChange (local state only)
const handleBaselineChange = (muscle: Muscle, value: string) => {
  const numValue = value === '' ? null : parseInt(value) || 0;
  setPendingBaselineChanges(prev => ({
    ...prev,
    [muscle]: numValue
  }));
};

// New save handler
const handleSaveBaselines = async () => {
  setIsSaving(true);
  try {
    const newBaselines = { ...muscleBaselines };

    Object.entries(pendingBaselineChanges).forEach(([muscle, override]) => {
      newBaselines[muscle as Muscle] = {
        ...newBaselines[muscle as Muscle],
        userOverride: override
      };
    });

    await setMuscleBaselines(newBaselines);
    setPendingBaselineChanges({});
    // Show success toast
    console.log('Baselines saved successfully');
  } catch (error) {
    console.error('Failed to save baselines:', error);
    // Show error message to user
  } finally {
    setIsSaving(false);
  }
};

// JSX - Add save button
<button
  onClick={handleSaveBaselines}
  disabled={Object.keys(pendingBaselineChanges).length === 0 || isSaving}
  className="mt-4 bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
>
  {isSaving ? 'Saving...' : 'Save Baselines'}
</button>
```

**Testing:**
1. Navigate to Profile page
2. Enter manual baselines for 3 muscles
3. Click "Save Baselines"
4. Verify API PUT request succeeds
5. Refresh page - verify values persist
6. Check production database - verify `user_override` values set

---

### Task 4: Rebuild Production Baselines

**Objective:** Recalculate all baselines in production using fixed algorithm

**Prerequisites:**
- Task 1 completed and deployed
- Backend running new `rebuildMuscleBaselines()` logic

**Steps:**

1. **Deploy Fixed Algorithm**
   - Push Task 1 changes to production
   - Verify deployment successful

2. **Run Rebuild Command**
   - Create admin endpoint: `POST /api/admin/rebuild-baselines`
   - Call endpoint to trigger rebuild
   - Alternative: Run directly in Railway console

3. **Verify Results**
   - Query `/api/muscle-baselines`
   - Verify realistic values (20,000-50,000 lbs range)
   - Compare to user's exercise breakdown data

4. **User Re-Entry of Manual Overrides**
   - User navigates to Profile page
   - Enters manual baseline estimates from exercise breakdown
   - Saves baselines (using Task 3 fix)
   - Verify `userOverride` values persist

**Expected Production Baselines (After Rebuild):**

Based on user's exercise breakdown:
- **Pectoralis:** ~9,000 lbs/session (3 pressing exercises)
- **Triceps:** ~6,000 lbs/session
- **Deltoids:** ~7,000 lbs/session
- **Lats:** ~8,000 lbs/session (4 pulling exercises)
- **Biceps:** ~3,000 lbs/session
- **Quadriceps:** ~10,000 lbs/session (squats + RDLs)
- **Glutes:** ~14,000 lbs/session (RDLs + bridges)
- **Hamstrings:** ~12,000 lbs/session
- **Core:** ~2,000 lbs equivalent

---

## Deployment Plan

### Phase 1: Backend Algorithm Fix
1. Deploy Task 1 (rebuildMuscleBaselines fix)
2. Run rebuild on production database
3. Verify new baseline values

### Phase 2: Frontend User Prompts
1. Deploy Task 2 (BaselineUpdateModal)
2. Test with new workout completion
3. Verify modal appears and functions

### Phase 3: Manual Entry Fix
1. Deploy Task 3 (explicit save button)
2. User re-enters manual baselines
3. Verify persistence

### Phase 4: Verification
1. Complete test workout in production
2. Verify forecasted fatigue shows realistic percentages (not all 100%)
3. Verify baseline update prompt appears
4. Confirm/decline and verify behavior

---

## Success Criteria

✅ Baselines calculated from session volume, not single-set max
✅ Baseline updates require user confirmation
✅ Manual baseline entries persist correctly
✅ Forecasted fatigue shows realistic percentages (20-80% range)
✅ Production baselines match user's actual workout capacity
✅ Modal UI is clear and informative
✅ No silent failures or data loss

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `backend/database/database.ts` | Fix rebuildMuscleBaselines algorithm | 526-585 (~60 lines) |
| `App.tsx` | Add baseline update modal state & handlers | 73-88, +50 new |
| `components/BaselineUpdateModal.tsx` | New modal component | ~100 lines |
| `components/Profile.tsx` | Add explicit save button for baselines | 244-248, +30 new |
| `hooks/useAPIState.ts` | (Review only - no changes needed) | - |

**Total Estimated Changes:** ~240 lines across 4 files

---

## Rollback Plan

If issues occur:
1. Revert `rebuildMuscleBaselines()` to original logic
2. Remove BaselineUpdateModal from App.tsx
3. Restore auto-save behavior in Profile.tsx
4. Run database rollback script (backup baselines table first)

---

## Notes

- User's detailed exercise breakdown provides ground truth for validation
- Current production baselines (5,000-16,000 range) are clearly wrong
- After fix, expect baselines in 20,000-50,000 lbs range
- `userOverride` should take precedence over `systemLearnedMax` (already working correctly)
