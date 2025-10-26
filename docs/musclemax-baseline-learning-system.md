# MuscleMax Baseline Learning System - Implementation Plan

**Date:** 2025-10-25
**Author:** Kaelen + Claude
**Status:** Design Complete - Ready for Implementation

---

## Executive Summary

This document defines the complete architecture and implementation plan for the **MuscleMax Baseline Learning System** - replacing the hardcoded 10,000 baseline with an intelligent learning system that:

1. **Automatically learns** muscle capacity from actual performance data ("to failure" sets)
2. **Allows manual override** for user control and calibration
3. **Uses conservative estimation** to ensure safe, progressive training recommendations
4. **Provides full transparency** into how baselines are calculated and updated

**Key Insight:** We use a conservative "max observed volume" approach for MVP - simple, safe, and progressively accurate. Future versions can implement advanced triangulation algorithms.

---

## Problem Statement

### Current State
- All 13 muscle groups have `system_learned_max = 10,000` (hardcoded)
- This value is arbitrary and meaningless for fatigue calculations
- No distinction between submaximal work and true capacity testing
- No way for users to calibrate based on their actual strength

### Consequences
- Fatigue percentages are inaccurate
- Recovery recommendations are unreliable
- Progressive overload suggestions lack personalization
- User loses trust in the system's intelligence

### Solution
Implement a hybrid learning model with:
- **Automatic learning** from "to failure" sets
- **Manual override** option for user control
- **Transparent UI** showing both system-learned and user-set values
- **Progressive accuracy** - gets smarter with each workout

---

## System Architecture

### Core Algorithm: Conservative Max Observed Volume

**Principle:** If a muscle handled X volume when trained to failure, it can handle **at least** X volume.

**Formula:**
```typescript
muscle_volume = total_set_volume × muscle_engagement_percentage
total_set_volume = weight × reps

Example:
Push-ups: 30 reps @ 200lbs, to_failure = true
- Pectoralis (70%): 30 × 200 × 0.70 = 4,200 units
- Triceps (50%): 30 × 200 × 0.50 = 3,000 units
- Deltoids (40%): 30 × 200 × 0.40 = 2,400 units
- Core (20%): 30 × 200 × 0.20 = 1,200 units

If current baselines are all 10,000:
- No updates (observed < current)

If current pec baseline is 3,500:
- UPDATE Pectoralis baseline to 4,200
```

**Why This Works:**
- **Conservative:** May underestimate capacity (if non-limiting muscle)
- **Safe:** Leads to conservative fatigue estimates (prevents overtraining)
- **Progressive:** Converges to accuracy with more data
- **Simple:** No complex constraint solving needed for MVP

### Effective Baseline Calculation

**Priority Order:**
```typescript
effective_max = user_override ?? system_learned_max ?? 10000
```

**Separation of Concerns:**
- `system_learned_max`: Automatically updated, never manually touched
- `user_override`: Manually set, never automatically updated
- Both stored independently for transparency

---

## Database Schema

### Current State ✅
The schema **already supports** everything we need!

```sql
-- exercise_sets table (line 56 of schema.sql)
CREATE TABLE exercise_sets (
  ...
  to_failure INTEGER DEFAULT 1,  -- ✅ Already exists!
  ...
);

-- muscle_baselines table (line 88 of schema.sql)
CREATE TABLE muscle_baselines (
  ...
  system_learned_max REAL NOT NULL DEFAULT 10000,  -- ✅ Already exists!
  user_override REAL,  -- ✅ Already exists!
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ✅ Already exists!
  ...
);
```

### Optional Enhancement
Add `update_count` to track confidence:

```sql
ALTER TABLE muscle_baselines
ADD COLUMN update_count INTEGER DEFAULT 0;
```

This allows UI to show: "Updated 15 times" as confidence indicator.

---

## Data Flow Architecture

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER COMPLETES WORKOUT                                │
│    - Frontend: WorkoutSession component                  │
│    - User marks sets with "to_failure" toggle            │
│    - Clicks "Finish Workout"                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. FRONTEND → BACKEND: POST /api/workouts               │
│    Body: {                                               │
│      date, category, variation, durationSeconds,         │
│      exercises: [                                        │
│        { exercise, sets: [{ weight, reps, to_failure }] }│
│      ]                                                   │
│    }                                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. BACKEND: saveWorkout() - database.ts:198             │
│    Transaction:                                          │
│    - INSERT INTO workouts                                │
│    - INSERT INTO exercise_sets (with to_failure values)  │
│    - **NEW** Call: updateMuscleBaselines(workoutId)     │
│    - Commit                                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. NEW FUNCTION: updateMuscleBaselines(workoutId)       │
│    For each set where to_failure = 1:                   │
│      - Get exercise muscle engagements from constants    │
│      - Calculate muscle_volume for each muscle           │
│      - IF muscle_volume > current system_learned_max:    │
│          UPDATE muscle_baselines                         │
│          SET system_learned_max = muscle_volume          │
│          WHERE muscle_name = X                           │
│    Return: updated_muscles[] (muscle_name, old, new)    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. BACKEND RESPONSE                                      │
│    {                                                     │
│      workout: {...},                                     │
│      updated_baselines: [                                │
│        { muscle: "Pectoralis", old: 3500, new: 4200 },  │
│        { muscle: "Triceps", old: 2800, new: 3000 }      │
│      ]                                                   │
│    }                                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. FRONTEND: Show Notification (if significant updates)  │
│    Toast: "💪 Updated baselines for 2 muscles!"         │
│    Optional: Tap to view details                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Backend Foundation (Priority: HIGH)

#### File: `backend/database/database.ts`

**1.1 Add `updateMuscleBaselines()` function**

Location: After `saveWorkout()` function (~line 265)

```typescript
/**
 * Update muscle baselines based on "to failure" sets from a workout
 *
 * Algorithm: Conservative max observed volume
 * - Only updates from sets with to_failure = 1
 * - Updates baseline if observed volume > current baseline
 * - Uses ratchet model (baselines only increase)
 *
 * @param workoutId - ID of completed workout
 * @returns Array of updated muscles with old/new values
 */
function updateMuscleBaselines(workoutId: number): Array<{
  muscle: string;
  oldMax: number;
  newMax: number;
}> {
  // Import exercise library to get muscle engagements
  const { getExerciseByName } = require('../constants');

  // Get all "to failure" sets from this workout
  const failureSets = db.prepare(`
    SELECT exercise_name, weight, reps
    FROM exercise_sets
    WHERE workout_id = ? AND to_failure = 1
  `).all(workoutId) as Array<{
    exercise_name: string;
    weight: number;
    reps: number;
  }>;

  if (failureSets.length === 0) {
    return []; // No failure sets, no updates
  }

  // Calculate muscle volumes for each failure set
  const muscleVolumes: Record<string, number> = {};

  for (const set of failureSets) {
    const exercise = getExerciseByName(set.exercise_name);
    if (!exercise) continue;

    const totalVolume = set.weight * set.reps;

    for (const engagement of exercise.muscleEngagements) {
      const muscleVolume = totalVolume * (engagement.percentage / 100);
      const muscleName = engagement.muscle;

      // Track max volume observed for each muscle
      if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
        muscleVolumes[muscleName] = muscleVolume;
      }
    }
  }

  // Update baselines where observed volume exceeds current baseline
  const updates: Array<{ muscle: string; oldMax: number; newMax: number }> = [];

  const getBaseline = db.prepare(`
    SELECT system_learned_max
    FROM muscle_baselines
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateBaseline = db.prepare(`
    UPDATE muscle_baselines
    SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  for (const [muscleName, observedVolume] of Object.entries(muscleVolumes)) {
    const baseline = getBaseline.get(muscleName) as { system_learned_max: number } | undefined;

    if (!baseline) continue; // Muscle not in database (shouldn't happen)

    if (observedVolume > baseline.system_learned_max) {
      updateBaseline.run(observedVolume, muscleName);
      updates.push({
        muscle: muscleName,
        oldMax: baseline.system_learned_max,
        newMax: observedVolume
      });
    }
  }

  return updates;
}
```

**1.2 Modify `saveWorkout()` to call baseline update**

Location: Inside `saveTransaction()` function, after set insertion (~line 228)

```typescript
const saveTransaction = db.transaction(() => {
  // ... existing workout and set insertion code ...

  return workoutId;
});

const workoutId = saveTransaction();

// **NEW:** Update muscle baselines based on failure sets
const updatedBaselines = updateMuscleBaselines(workoutId);

// Return the saved workout WITH baseline updates
const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId) as WorkoutRow;
// ... rest of existing code ...

return {
  id: savedWorkout.id,
  date: savedWorkout.date,
  category: savedWorkout.category,
  variation: savedWorkout.variation,
  progression_method: savedWorkout.progression_method,
  duration_seconds: savedWorkout.duration_seconds,
  exercises: Object.values(exercisesMap),
  created_at: savedWorkout.created_at,
  updated_baselines: updatedBaselines  // **NEW**
};
```

**1.3 Update TypeScript types**

File: `backend/types.ts`

```typescript
export interface WorkoutResponse {
  id: number;
  date: string;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  exercises: WorkoutExercise[];
  created_at: string;
  updated_baselines?: Array<{  // **NEW - optional for backward compatibility**
    muscle: string;
    oldMax: number;
    newMax: number;
  }>;
}
```

**1.4 Export function**

Add to exports at bottom of `database.ts`:

```typescript
export {
  db,
  getProfile,
  updateProfile,
  getWorkouts,
  getLastWorkoutByCategory,
  saveWorkout,
  getMuscleStates,
  updateMuscleStates,
  getPersonalBests,
  updatePersonalBests,
  getMuscleBaselines,
  updateMuscleBaselines,  // This already exists for manual updates
  // ... other exports ...
};
```

---

### Phase 2: Manual Override UI (Priority: MEDIUM)

#### New Page: Settings → Personal Metrics → Muscle Baselines

**Location:** `src/pages/SettingsPage.tsx` (or create `MuscleBaselinesPage.tsx`)

**UI Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ ← Back                    Muscle Baselines              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Your muscle capacity baselines are used to calculate     │
│ fatigue and recovery time. The system learns from your   │
│ "to failure" sets.                                        │
│                                                           │
│ 🤖 System Learned: Auto-updated from performance         │
│ ✏️ Your Override: Manual adjustment (optional)          │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ UPPER BODY                                                │
│                                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Pectoralis (Chest)                                 │   │
│ │ 🤖 System: 8,500 lbs (Updated 2 days ago)         │   │
│ │ ✏️ Override: [__________] (Optional)               │   │
│ │ ✅ Using: 8,500 lbs                                │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Triceps                                            │   │
│ │ 🤖 System: 3,200 lbs (Updated 5 days ago)         │   │
│ │ ✏️ Override: [5,000] ←  User entered              │   │
│ │ ✅ Using: 5,000 lbs (Your override)                │   │
│ │ ⚠️ Your recent workout hit 4,800 lbs!             │   │
│ │    [Update Override to 4,800]                      │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ ... (Deltoids, Lats, Biceps, etc.)                       │
│                                                           │
│ LOWER BODY                                                │
│ ... (Quadriceps, Hamstrings, Glutes, Calves)             │
│                                                           │
│ CORE                                                      │
│ ... (Core)                                                │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ [Reset All to System Defaults] (Danger button)           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Component Structure:**

```tsx
interface MuscleBaselineCardProps {
  muscle: string;
  systemMax: number;
  userOverride: number | null;
  lastUpdated: string;
  onOverrideChange: (value: number | null) => void;
}

function MuscleBaselineCard({ muscle, systemMax, userOverride, lastUpdated, onOverrideChange }: MuscleBaselineCardProps) {
  const [editValue, setEditValue] = useState(userOverride?.toString() || '');
  const effectiveMax = userOverride ?? systemMax;

  const timeSince = formatDistanceToNow(new Date(lastUpdated));

  return (
    <Card>
      <CardHeader>
        <h3>{muscle}</h3>
      </CardHeader>
      <CardContent>
        <div>
          <Label>🤖 System Learned</Label>
          <p>{systemMax.toLocaleString()} lbs</p>
          <p className="text-sm text-gray-500">Updated {timeSince} ago</p>
        </div>

        <div>
          <Label>✏️ Your Override (Optional)</Label>
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              const val = parseFloat(editValue);
              if (!isNaN(val) && val >= 100 && val <= 1000000) {
                onOverrideChange(val);
              } else if (editValue === '') {
                onOverrideChange(null);
              }
            }}
            placeholder="Leave empty to use system value"
          />
        </div>

        <div>
          <Label>✅ Currently Using</Label>
          <p className="font-bold">{effectiveMax.toLocaleString()} lbs</p>
          {userOverride && <span className="text-sm">(Your override)</span>}
        </div>

        {userOverride && systemMax > userOverride && (
          <Alert variant="warning">
            <AlertTitle>⚠️ System learned higher value!</AlertTitle>
            <AlertDescription>
              Your recent workouts indicate capacity of {systemMax.toLocaleString()} lbs.
              <Button onClick={() => onOverrideChange(systemMax)}>
                Update Override to {systemMax.toLocaleString()}
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

**API Integration:**

```typescript
// Fetch baselines
const baselines = await fetch('/api/muscle-baselines').then(r => r.json());

// Update override
await fetch('/api/muscle-baselines', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updates: [
      { muscle: 'Pectoralis', user_override: 5000 }
    ]
  })
});
```

---

### Phase 3: Workout UI Enhancement (Priority: MEDIUM)

#### Modify Set Recording to Include "To Failure" Toggle

**Location:** `src/components/WorkoutSession.tsx` (or wherever sets are recorded)

**UI Addition:**

```tsx
<SetCard>
  <Input type="number" label="Weight (lbs)" value={weight} onChange={...} />
  <Input type="number" label="Reps" value={reps} onChange={...} />

  {/* NEW: To Failure Toggle */}
  <div className="flex items-center gap-2">
    <Switch
      checked={toFailure}
      onCheckedChange={setToFailure}
      id={`to-failure-${setIndex}`}
    />
    <Label htmlFor={`to-failure-${setIndex}`}>
      To Failure
      {isLastSet && <Badge variant="default">Auto (last set)</Badge>}
    </Label>
  </div>
</SetCard>
```

**Logic:**

```typescript
// Auto-mark last set as "to failure" by default
useEffect(() => {
  const lastSetIndex = sets.length - 1;
  if (currentSetIndex === lastSetIndex) {
    setToFailure(true);
  }
}, [currentSetIndex, sets.length]);

// User can toggle off if it wasn't actually to failure
```

**Data Structure:**

```typescript
interface ExerciseSet {
  weight: number;
  reps: number;
  to_failure?: boolean;  // NEW - defaults to true for last set
}
```

---

### Phase 4: Notification System (Priority: LOW)

#### Show Toast When Baselines Update

**Location:** After workout save completes

```tsx
// In WorkoutSession.tsx or wherever workout is saved
const handleFinishWorkout = async () => {
  const response = await fetch('/api/workouts', {
    method: 'POST',
    body: JSON.stringify(workoutData)
  });

  const result = await response.json();

  // NEW: Show notification if baselines updated
  if (result.updated_baselines && result.updated_baselines.length > 0) {
    const count = result.updated_baselines.length;
    const muscles = result.updated_baselines.map(u => u.muscle).join(', ');

    toast.success(`💪 Updated baselines for ${count} muscle${count > 1 ? 's' : ''}!`, {
      description: muscles,
      action: {
        label: 'View',
        onClick: () => navigate('/settings/muscle-baselines')
      }
    });
  }

  navigate('/home');
};
```

---

## Edge Cases & Validation

### 1. User Override Validation

**Rules:**
- Must be positive number
- Min: 100 (reasonable lower bound)
- Max: 1,000,000 (sanity check)
- Empty = clear override (use system value)

**Backend Validation:**

```typescript
function updateMuscleBaselines(updates: MuscleBaselinesUpdateRequest): MuscleBaselinesResponse {
  for (const update of updates.updates) {
    if (update.user_override !== undefined && update.user_override !== null) {
      if (update.user_override < 100 || update.user_override > 1000000) {
        throw new Error(`Invalid override value for ${update.muscle}: must be between 100 and 1,000,000`);
      }
    }
  }
  // ... rest of update logic
}
```

### 2. No Failure Sets (Greasing the Groove)

**Scenario:** User does submaximal workout (all sets to_failure = false)

**Behavior:** No baseline updates triggered. This is correct - we only learn from quality data.

### 3. First-Time User (No Data Yet)

**Initial State:** All baselines = 10,000

**After First Failure Workout:** Baselines update to observed volumes

**UI Messaging:**
- "System: 10,000 lbs (Default - train to failure to calibrate)"
- After update: "System: 4,200 lbs (Updated today)"

### 4. System Learns Higher Than Override

**Scenario:**
- User sets override: 5,000
- User completes set: 6,000 observed
- System updates system_learned_max to 6,000
- Override stays at 5,000

**UI Response:**
- Show warning: "⚠️ Your recent workout hit 6,000 lbs!"
- Offer button: "Update Override to 6,000"
- Respect user's choice if they decline

### 5. Detraining / Reset

**Future Enhancement:**
- Add "Reset Baseline" button per muscle
- Add "Reset All" button (with confirmation)
- Resets system_learned_max to 10,000
- Clears user_override

---

## Testing Strategy

### Unit Tests

**File:** `backend/database/database.test.ts`

```typescript
describe('updateMuscleBaselines', () => {
  it('should update baseline when observed volume exceeds current', () => {
    // Setup: baseline at 3000
    // Workout: Push-ups to failure, 30 reps @ 200lbs
    // Expected: Pectoralis baseline updated to 4200
  });

  it('should not update baseline when observed volume is lower', () => {
    // Setup: baseline at 10000
    // Workout: Light push-ups, 10 reps @ 100lbs
    // Expected: No baseline update
  });

  it('should only update from to_failure sets', () => {
    // Setup: 2 sets - one failure, one not
    // Expected: Only failure set contributes to baseline
  });

  it('should handle multiple muscles from compound exercises', () => {
    // Setup: Bench press to failure
    // Expected: Updates for Pecs, Triceps, Deltoids
  });
});
```

### Integration Tests

1. **Full Workout Flow:**
   - Create workout with mixed failure/non-failure sets
   - Verify correct baselines updated
   - Verify API response includes updated_baselines

2. **Manual Override:**
   - Set user override
   - Complete workout that exceeds override
   - Verify system_learned_max updates but user_override unchanged

3. **Fatigue Calculation:**
   - Update baselines
   - Verify fatigue percentages recalculate correctly
   - Verify recovery recommendations adjust

---

## Success Metrics

### Immediate (Phase 1 Complete)

- ✅ Baselines auto-update from failure sets
- ✅ API response includes baseline changes
- ✅ All 13 muscles tracked independently
- ✅ No breaking changes to existing functionality

### Short-term (Phases 1-3 Complete)

- ✅ Users can manually override baselines
- ✅ "To failure" toggle visible and functional
- ✅ Settings page shows system vs. override values
- ✅ Notifications appear when baselines update

### Long-term (After Real Usage)

- 📈 Baseline accuracy improves over 4+ weeks of use
- 📈 Fatigue estimates align with user's perceived recovery
- 📈 Progressive overload suggestions become personalized
- 📈 User trust in system intelligence increases

---

## Future Enhancements (Post-MVP)

### 1. Triangulation Algorithm (Phase 2 Research Sprint)

**Goal:** Use constraint satisfaction to infer individual muscle capacities from compound exercises.

**Example:**
- Push-ups to failure: Pecs, Triceps, Deltoids all hit capacity
- Tricep extensions to failure: Triceps at 100%
- Solve: What are individual muscle baselines that satisfy both failure points?

**Requirements:**
- Research mathematical formulation
- Validate against exercise science
- Implement optimization solver

### 2. Muscle-Specific Recovery Rates

**Goal:** Different muscles recover at different rates (biceps faster than glutes).

**Implementation:**
- Add `recovery_rate_multiplier` to muscle_baselines table
- Research: Actual recovery rates per muscle group
- Apply in fatigue calculation

### 3. Baseline History Tracking

**Goal:** Show charts of "Pectoralis capacity over time"

**Schema:**
```sql
CREATE TABLE muscle_baseline_history (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  muscle_name TEXT,
  baseline_value REAL,
  source TEXT, -- 'system' or 'user'
  recorded_at TIMESTAMP
);
```

**UI:** Line chart showing progressive strength gains.

### 4. Confidence Scoring

**Goal:** Show how confident the system is in each baseline.

**Factors:**
- Number of updates (more = higher confidence)
- Recency of updates (recent = higher confidence)
- Variance in observed volumes (low variance = higher confidence)

**UI:** Badge: "Confidence: High (15 workouts)" or "Confidence: Low (1 workout)"

### 5. Detraining Detection

**Goal:** Automatically reduce baselines if user takes extended break.

**Logic:**
- If no training for 30+ days → flag baseline as "stale"
- Optionally reduce baseline by X% per week of inactivity
- Or require "recalibration workout" before trusting old baselines

---

## Appendix A: Code Reference

### Key Files to Modify

1. **backend/database/database.ts**
   - Add `updateMuscleBaselines()` function (~100 lines)
   - Modify `saveWorkout()` to call it (~5 lines)

2. **backend/types.ts**
   - Add `updated_baselines` to `WorkoutResponse` (~5 lines)

3. **src/pages/SettingsPage.tsx** OR **src/pages/MuscleBaselinesPage.tsx** (new)
   - Full UI for manual override (~200 lines)

4. **src/components/WorkoutSession.tsx**
   - Add "to failure" toggle to set recording (~20 lines)

5. **src/components/Notifications.tsx** (if exists)
   - Add baseline update toast (~10 lines)

### Estimated LOC Changes

- Backend: ~120 lines
- Frontend: ~240 lines
- **Total: ~360 lines of new/modified code**

### Estimated Dev Time

- **Backend (Phase 1):** 4-6 hours
- **Frontend UI (Phase 2):** 6-8 hours
- **Workout Toggle (Phase 3):** 2-3 hours
- **Notifications (Phase 4):** 1-2 hours
- **Testing:** 3-4 hours
- **Total: 16-23 hours (2-3 days)**

---

## Appendix B: Example Scenarios

### Scenario 1: New User First Workout

**Initial State:**
```
All baselines: 10,000 (default)
```

**User does:**
- Push-ups: 30 reps @ 200lbs (to failure)
- Dumbbell Row: 12 reps @ 50lbs (to failure)

**Calculations:**
```
Push-ups: 30 × 200 = 6,000 total
- Pectoralis (70%): 4,200
- Triceps (50%): 3,000
- Deltoids (40%): 2,400
- Core (20%): 1,200

Dumbbell Row: 12 × 50 = 600 total
- Lats (75%): 450
- Biceps (20%): 120
- Rhomboids (35%): 210
```

**Updates:**
```
All observed < 10,000 → No updates yet
```

**After 5 more workouts with progressive overload:**
```
Pectoralis: 12,500 (surpassed 10k)
Triceps: 8,200 (not yet)
Lats: 11,800 (surpassed 10k)
... etc.
```

### Scenario 2: User Manual Override

**Current State:**
```
Triceps:
- system_learned_max: 3,200
- user_override: NULL
- effective_max: 3,200
```

**User knows they're stronger:**
```
User sets override: 5,000
```

**New State:**
```
Triceps:
- system_learned_max: 3,200 (unchanged)
- user_override: 5,000
- effective_max: 5,000
```

**User does workout:**
```
Tricep Extensions: 15 reps @ 40lbs = 600 total
- Triceps (95%): 570
```

**Updates:**
```
570 < 3,200 → No system update
user_override stays at 5,000 (manual never auto-updates)
```

**If user does heavier workout:**
```
Tricep Extensions: 20 reps @ 60lbs = 1,200 total
- Triceps (95%): 1,140
```

**Updates:**
```
1,140 < 3,200 → No system update
user_override stays at 5,000

BUT if user does:
Tricep Extensions: 50 reps @ 100lbs = 5,000 total
- Triceps (95%): 4,750

4,750 > 3,200 → system_learned_max updated to 4,750
user_override stays at 5,000
effective_max still 5,000 (override takes priority)

UI shows warning: "System learned 4,750 but using your override of 5,000"
```

---

## Conclusion

This system provides:
1. **Automatic intelligence** - learns from real performance
2. **User control** - manual override when needed
3. **Progressive accuracy** - gets smarter over time
4. **Transparent operation** - shows what it knows and why
5. **Safe defaults** - conservative estimates prevent overtraining

Ready for implementation when approved! 🚀
