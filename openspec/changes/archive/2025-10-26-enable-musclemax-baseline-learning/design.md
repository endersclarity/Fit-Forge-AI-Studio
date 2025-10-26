# Design: MuscleMax Baseline Learning System

**Change ID:** `enable-musclemax-baseline-learning`
**Status:** Draft
**Created:** 2025-10-25

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│ Frontend: Workout Session                               │
│  - User logs sets with to_failure flag                  │
│  - Receives baseline updates in response                │
└────────────────┬────────────────────────────────────────┘
                 │ POST /api/workouts
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: server.ts                                       │
│  - Receives workout data                                 │
│  - Calls saveWorkout()                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: database.ts → saveWorkout()                    │
│  1. INSERT workout + sets (transaction)                  │
│  2. Call updateMuscleBaselines(workoutId) *NEW*         │
│  3. Return workout + updated_baselines                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: database.ts → updateMuscleBaselines() *NEW*    │
│  1. Query to_failure sets for workout                    │
│  2. Calculate muscle volumes from exercises              │
│  3. Compare to current baselines                         │
│  4. UPDATE where observed > current                      │
│  5. Return list of updated muscles                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Database: muscle_baselines table                        │
│  - system_learned_max (auto-updated)                    │
│  - user_override (manual only)                          │
│  - updated_at (timestamp)                               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

**Happy Path:**
1. User completes workout with 3 sets to failure
2. Frontend sends workout data with `to_failure` flags
3. Backend saves workout + sets to database
4. Backend calculates muscle volumes for failure sets
5. Backend updates baselines where new max observed
6. Backend returns workout + `updated_baselines: [...]`
7. Frontend shows toast: "Updated baselines for 2 muscles"

---

## Algorithm Design

### Conservative Max Observed Volume

**Inputs:**
- `workoutId`: ID of completed workout
- Exercise library: Muscle engagement percentages
- Current baselines: From `muscle_baselines` table

**Process:**

```typescript
1. Query all sets with to_failure = 1 for this workout
   SELECT exercise_name, weight, reps
   FROM exercise_sets
   WHERE workout_id = ? AND to_failure = 1

2. For each failure set:
   a. Get exercise from constants (muscle engagements)
   b. Calculate total_volume = weight × reps
   c. For each muscle in exercise:
      - muscle_volume = total_volume × (percentage / 100)
      - Track max_volume_per_muscle[muscle] = max(observed)

3. For each muscle with observed volume:
   a. Get current system_learned_max
   b. If observed > current:
      - UPDATE muscle_baselines
        SET system_learned_max = observed, updated_at = NOW()
      - Track update for response

4. Return array of {muscle, oldMax, newMax}
```

**Example:**

```
Input: Push-ups to failure (30 reps @ 200lbs)
Muscles: Pectoralis(70%), Triceps(50%), Deltoids(40%), Core(20%)

Calculations:
- Total volume: 30 × 200 = 6,000
- Pectoralis: 6,000 × 0.70 = 4,200
- Triceps: 6,000 × 0.50 = 3,000
- Deltoids: 6,000 × 0.40 = 2,400
- Core: 6,000 × 0.20 = 1,200

Current baselines (example):
- Pectoralis: 3,500 → UPDATE to 4,200
- Triceps: 5,000 → NO UPDATE (3,000 < 5,000)
- Deltoids: 2,000 → UPDATE to 2,400
- Core: 1,000 → UPDATE to 1,200

Return: [
  {muscle: "Pectoralis", oldMax: 3500, newMax: 4200},
  {muscle: "Deltoids", oldMax: 2000, newMax: 2400},
  {muscle: "Core", oldMax: 1000, newMax: 1200}
]
```

---

## Database Design

### Schema (Already Exists ✅)

```sql
-- exercise_sets table
CREATE TABLE exercise_sets (
  id INTEGER PRIMARY KEY,
  workout_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  to_failure INTEGER DEFAULT 1,  -- ✅ Already exists!
  ...
);

-- muscle_baselines table
CREATE TABLE muscle_baselines (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  system_learned_max REAL NOT NULL DEFAULT 10000,  -- ✅
  user_override REAL,  -- ✅ NULL = use system value
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ✅
  ...
);
```

**No schema changes required!** 🎉

### Queries

**1. Get failure sets:**
```sql
SELECT exercise_name, weight, reps
FROM exercise_sets
WHERE workout_id = ? AND to_failure = 1
```

**2. Get current baseline:**
```sql
SELECT system_learned_max
FROM muscle_baselines
WHERE user_id = 1 AND muscle_name = ?
```

**3. Update baseline:**
```sql
UPDATE muscle_baselines
SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1 AND muscle_name = ?
```

**4. Get effective baseline (for fatigue calc):**
```sql
SELECT
  COALESCE(user_override, system_learned_max, 10000) as effective_max
FROM muscle_baselines
WHERE user_id = 1 AND muscle_name = ?
```

---

## API Design

### Modified Endpoint: POST /api/workouts

**Request (unchanged):**
```json
{
  "date": "2025-10-25",
  "category": "Push",
  "variation": "A",
  "durationSeconds": 1200,
  "exercises": [
    {
      "exercise": "Push-up",
      "sets": [
        {"weight": 200, "reps": 30, "to_failure": true},
        {"weight": 200, "reps": 25, "to_failure": true}
      ]
    }
  ]
}
```

**Response (enhanced):**
```json
{
  "id": 123,
  "date": "2025-10-25",
  "category": "Push",
  "exercises": [...],
  "updated_baselines": [  // ← NEW
    {
      "muscle": "Pectoralis",
      "oldMax": 3500,
      "newMax": 4200
    },
    {
      "muscle": "Deltoids",
      "oldMax": 2000,
      "newMax": 2400
    }
  ]
}
```

### New Endpoint (Optional): GET /api/muscle-baselines/effective

**Purpose:** Get effective baselines for fatigue calculations

**Response:**
```json
{
  "Pectoralis": {
    "systemLearnedMax": 8500,
    "userOverride": null,
    "effectiveMax": 8500,
    "lastUpdated": "2025-10-23T14:30:00Z"
  },
  "Triceps": {
    "systemLearnedMax": 3200,
    "userOverride": 5000,
    "effectiveMax": 5000,
    "lastUpdated": "2025-10-22T10:15:00Z"
  }
}
```

---

## UI Design

### Settings Page: Muscle Baselines

**Location:** Settings → Personal Metrics → Muscle Baselines

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ ← Back                    Muscle Baselines              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ℹ️ Your muscle capacity baselines are used to calculate │
│   fatigue and recovery. The system learns from your     │
│   "to failure" sets.                                     │
│                                                           │
│ 🤖 System Learned: Auto-updated from performance         │
│ ✏️ Your Override: Manual adjustment (optional)          │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ UPPER BODY                                                │
│                                                           │
│ ┌─ Pectoralis (Chest) ─────────────────────────────┐   │
│ │ 🤖 System: 8,500 lbs (Updated 2 days ago)         │   │
│ │ ✏️ Override: [__________] Clear                   │   │
│ │ ✅ Using: 8,500 lbs                                │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─ Triceps ─────────────────────────────────────────┐   │
│ │ 🤖 System: 3,200 lbs (Updated 5 days ago)         │   │
│ │ ✏️ Override: [5,000____] Clear                    │   │
│ │ ✅ Using: 5,000 lbs (Your override)                │   │
│ │ ⚠️ Recent workout: 4,800 lbs                      │   │
│ │    [Update Override to 4,800]                      │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ ... (11 more muscles)                                    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│ [Reset All to Defaults] ⚠️                               │
└─────────────────────────────────────────────────────────┘
```

**Components:**

1. **MuscleBaselineCard**
   - Shows all three values (system/override/effective)
   - Input field for override (number, optional)
   - Clear button to remove override
   - Last updated timestamp
   - Warning when system > override

2. **Validation Rules**
   - Override must be positive number
   - Min: 100, Max: 1,000,000
   - Empty input = clear override

3. **Reset Functionality**
   - Confirm dialog before reset
   - Resets system_learned_max to 10,000
   - Clears all user_override values

---

## Edge Cases & Handling

### 1. No Failure Sets in Workout

**Scenario:** User does greasing-the-groove workout (all sets submaximal)

**Handling:**
- `updateMuscleBaselines()` returns empty array
- No updates to database
- No notification shown
- Correct behavior (we only learn from quality data)

### 2. First-Time Exercise

**Scenario:** User logs "Dumbbell Curl" for first time ever

**Handling:**
- No previous baseline for involved muscles? Use 10,000 default
- Calculate observed volume
- Update baseline if > 10,000 (likely won't be)
- Correctly initializes learning for new exercises

### 3. User Override Lower Than System

**Scenario:**
- System learned: 8,000
- User sets override: 5,000
- User does workout: 6,000 observed

**Handling:**
- System updates system_learned_max to 6,000 (if > previous)
- User override stays at 5,000 (never auto-updated)
- Effective max: 5,000 (override priority)
- UI shows warning: "System learned 6,000 but using your override"
- Offer button to update override

### 4. Multiple Failure Sets Same Exercise

**Scenario:** User does 3 sets of push-ups to failure in one workout

**Handling:**
- Calculate volume for all 3 sets
- Take MAX observed volume per muscle
- Single update per muscle (to highest observed)
- Prevents multiple small updates

### 5. Concurrent Updates (Future Concern)

**Scenario:** Multiple tabs/devices (not current use case, but defensive)

**Handling:**
- Use database transactions for updates
- Last-write-wins for now (single user)
- Future: Add version/timestamp conflict detection

---

## Performance Considerations

### Query Optimization

**Current:**
- ~3 queries per muscle update (get, compare, update)
- For workout with 5 failure sets, 5 muscles each = ~75 queries

**Optimization:**
- Batch all baseline queries into single call
- Use prepared statements (already done via better-sqlite3)
- Consider single UPDATE with CASE for all muscles

**Expected Load:**
- Single user, ~10-20 failure sets per workout
- ~40-100 queries per workout save
- SQLite easily handles this (<1ms per query)

### Memory Footprint

**Data Structures:**
- `muscleVolumes`: Map<string, number> (~13 entries max)
- `updates`: Array<{muscle, old, new}> (~13 entries max)
- Total: <1KB memory overhead

---

## Security & Validation

### Input Validation

**Exercise Sets:**
- `to_failure`: Boolean (0 or 1) ✅ Database constraint
- `weight`: Positive number ✅ Existing validation
- `reps`: Positive integer ✅ Existing validation

**User Override:**
- Type: Number
- Min: 100
- Max: 1,000,000
- Null: Clear override

### SQL Injection Prevention

**All queries use parameterized statements:**
```typescript
db.prepare('UPDATE muscle_baselines SET system_learned_max = ? WHERE muscle_name = ?')
  .run(newValue, muscleName)
```

✅ No string concatenation
✅ Better-sqlite3 handles escaping

---

## Testing Strategy

### Unit Tests

**File:** `backend/database/database.test.ts`

```typescript
describe('updateMuscleBaselines', () => {
  test('updates baseline when observed > current', () => {
    // Setup baseline at 3000
    // Log failure set: 30 reps × 200lbs with 70% pec engagement = 4200
    // Assert: Pectoralis baseline updated to 4200
  });

  test('does not update when observed < current', () => {
    // Setup baseline at 10000
    // Log light set: 10 reps × 100lbs = 1000 total
    // Assert: No baseline update
  });

  test('only processes to_failure sets', () => {
    // Log 2 sets: one failure, one not
    // Assert: Only failure set used for update
  });

  test('handles multiple muscles from compound exercise', () => {
    // Log bench press to failure
    // Assert: Updates for Pecs, Triceps, Deltoids
  });
});
```

### Integration Tests

1. **Full Workflow:**
   - Create workout with mixed failure/non-failure sets
   - Verify baseline updates in response
   - Verify database reflects changes

2. **Manual Override:**
   - Set user override via API
   - Log workout exceeding override
   - Verify system updates, override unchanged

3. **Effective Baseline:**
   - Set override
   - Query muscle states
   - Verify fatigue uses override value

---

## Migration Path

**Database:** ✅ No migration needed (schema already supports)

**Existing Data:**
- All muscles start at 10,000 (current state)
- First failure workout starts learning
- Progressive improvement over 5-10 workouts

**Backward Compatibility:**
- `updated_baselines` in response is optional
- Old clients ignore new field
- No breaking changes

---

## Rollback Plan

**If Issues Arise:**

1. **Remove baseline learning call:**
   ```typescript
   // In saveWorkout(), comment out:
   // const updatedBaselines = updateMuscleBaselines(workoutId);
   ```

2. **Reset baselines to default:**
   ```sql
   UPDATE muscle_baselines
   SET system_learned_max = 10000, user_override = NULL
   WHERE user_id = 1;
   ```

3. **No data loss** - workout history preserved

---

## Future Enhancements

### Phase 2: Triangulation Algorithm

**Goal:** Solve for individual muscle capacities using constraint satisfaction

**Example:**
```
Push-ups to failure: Pecs, Triceps, Deltoids all involved
Tricep extensions to failure: Triceps at 100%

Constraint system:
- At least ONE of {Pecs, Triceps, Deltoids} = 100% in push-ups
- Triceps = 100% in extensions
- Solve for individual muscle max capacities
```

**Requirements:**
- Research: Mathematical formulation
- Validation: Exercise science alignment
- Implementation: Optimization solver (scipy-like)

### Phase 3: Baseline History

**Goal:** Track progression over time

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

**UI:** Line chart showing "Pectoralis capacity over 12 weeks"

---

## Decision Log

### Decision 1: Conservative vs. Aggressive Learning

**Options:**
- Conservative: Use max observed (may underestimate)
- Aggressive: Estimate full capacity via triangulation

**Chosen:** Conservative

**Rationale:**
- Simpler to implement and validate
- Safe (prevents overtraining recommendations)
- Progressive accuracy without complex math
- Triangulation is future enhancement

### Decision 2: Ratchet vs. Decay Model

**Options:**
- Ratchet: Baselines only increase
- Decay: Reduce baseline after inactivity

**Chosen:** Ratchet (MVP), Decay (future)

**Rationale:**
- Muscle capacity doesn't disappear instantly
- Detraining is gradual (weeks/months)
- User can manually reset if needed
- Decay requires research on rates per muscle

### Decision 3: Auto vs. Manual Only

**Options:**
- Auto-only: System always in control
- Manual-only: User sets everything
- Hybrid: System learns, user can override

**Chosen:** Hybrid

**Rationale:**
- Best of both worlds
- User feels in control
- System progressively improves
- Transparency builds trust

---

## Conclusion

This design provides a solid foundation for intelligent muscle capacity learning with:
- ✅ Simple, safe algorithm
- ✅ No schema changes required
- ✅ Clear separation of system vs. user control
- ✅ Progressive accuracy without complexity
- ✅ Foundation for future advanced features

Ready for spec delta creation and implementation.
