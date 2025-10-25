# Design: Enable Failure Tracking and PR Detection

**Change ID:** `enable-failure-tracking-and-pr-detection`
**Created:** 2025-10-24

---

## Architecture Overview

This feature adds two independent but complementary capabilities:
1. **Failure Status Tracking** - Marks sets as "to failure" or not
2. **PR Detection & Celebration** - Automatically detects and celebrates personal records

**Key Design Principle:** Keep it simple. One boolean flag, one comparison algorithm, one notification.

---

## Database Design

### Schema Changes

**Add `to_failure` column to `exercise_sets` table:**

```sql
ALTER TABLE exercise_sets ADD COLUMN to_failure INTEGER DEFAULT 1;
```

**Rationale:**
- `INTEGER` instead of `BOOLEAN` (SQLite doesn't have native boolean)
- `DEFAULT 1` (TRUE) - Optimistic assumption: most sets are max effort
- Non-null - Every set has a defined failure status

**Migration Strategy:**
1. Add column with default value
2. Existing sets inherit `to_failure = 1` (assumes historical data was max effort)
3. Users can retroactively change if needed

**No changes to `personal_bests` table** - Already has all needed fields:
- `best_single_set` - Stores max volume (weight × reps)
- `best_session_volume` - Total volume across all sets
- `updated_at` - Timestamp of last PR

---

## PR Detection Algorithm

### Volume Calculation

**Formula:** `volume = weight × reps`

**Examples:**
- 100 lbs × 10 reps = 1000 volume
- 105 lbs × 9 reps = 945 volume (not a PR)
- 100 lbs × 11 reps = 1100 volume (PR! +100 volume)

**Why volume-based?**
- Objective, single metric
- Accounts for weight AND reps tradeoffs
- Simple to calculate and compare
- Industry standard for strength tracking

### PR Detection Logic

**Pseudocode:**
```typescript
function detectPR(exerciseName: string, weight: number, reps: number, toFailure: boolean): PRResult {
  // Only detect PRs for failure sets
  if (!toFailure) {
    return { isPR: false };
  }

  const currentVolume = weight * reps;
  const previousBest = getPersonalBest(exerciseName);

  // First time doing this exercise
  if (!previousBest) {
    return {
      isPR: true,
      isFirstTime: true,
      volume: currentVolume
    };
  }

  // Compare volumes
  if (currentVolume > previousBest.best_single_set) {
    const improvement = currentVolume - previousBest.best_single_set;
    const percentIncrease = (improvement / previousBest.best_single_set) * 100;

    return {
      isPR: true,
      previousVolume: previousBest.best_single_set,
      newVolume: currentVolume,
      improvement,
      percentIncrease
    };
  }

  return { isPR: false };
}
```

**Edge Cases:**
1. **Tie (same volume):** Not a PR, no notification
2. **First time exercise:** Count as PR, special message "First time logged!"
3. **Non-failure set:** Skip PR detection entirely
4. **Deload week:** User unmarks "to failure," PRs not affected

---

## Frontend Design

### Toggle UI Placement

**Location:** Within each set row in the workout tracking screen

**Layout:**
```
Set | Weight | Reps | [PR Icon] [Timer] [Delete]
 1  |  100   |  8   |    🏆         🕐      ❌
 2  |  100   |  8   |    [✓]        🕐      ❌  <- Toggle button
 3  |  100   |  8   |    [✓]        🕐      ❌
```

**Toggle States:**
- ✓ (Checkmark) - To failure (default for last set)
- Empty - Not to failure
- Tap to toggle

**Visual Feedback:**
- Checked sets have subtle highlight
- PR sets show gold/trophy icon
- Clear distinction between "to failure" and "not to failure"

### PR Celebration Notification

**Design:** Minimal, non-intrusive toast notification

**Components:**
- Icon: 🎉 or 🏆
- Message: "NEW PR! {Exercise}: {weight} lbs × {reps} reps"
- Subtext: "Previous best: {prev_weight} lbs × {prev_reps} reps (+{improvement})"
- Auto-dismiss: 5 seconds
- Dismissible: Tap to close immediately

**Position:** Top-center of screen (doesn't block workout logging)

**Animation:** Slide down from top, fade out on dismiss

**Timing:** Appears immediately after set is logged and PR detected

---

## Backend Design

### API Changes

**Modified Endpoint:** `POST /api/workouts`

**Updated Request Body:**
```typescript
{
  date: number,
  category: string,
  variation: string,
  progression_method: string,
  duration_seconds: number,
  exercises: [
    {
      exercise: string,
      sets: [
        {
          weight: number,
          reps: number,
          to_failure: boolean  // NEW
        }
      ]
    }
  ]
}
```

**Backend Logic Flow:**
1. Receive workout data
2. For each set:
   a. Insert into `exercise_sets` with `to_failure` flag
   b. If `to_failure === true`, check for PR
   c. If PR detected, update `personal_bests` table
   d. Return PR info in response (for frontend notification)
3. Return workout ID + PR results

**Response Format:**
```typescript
{
  id: number,
  date: number,
  category: string,
  variation: string,
  prs: [
    {
      exercise: string,
      newVolume: number,
      previousVolume: number,
      improvement: number,
      percentIncrease: number
    }
  ]
}
```

---

## Smart Defaults Strategy

### Last Set Auto-Mark Logic

**Rule:** When user adds a new set to an exercise, the new set becomes the "last set" and inherits `to_failure = true`.

**Implementation:**
```typescript
function addSet(exerciseId: string) {
  const sets = getExerciseSets(exerciseId);

  // Unmark previous last set
  if (sets.length > 0) {
    sets[sets.length - 1].to_failure = false;
  }

  // Add new set with to_failure = true
  const newSet = {
    weight: previousSetWeight || 100,
    reps: previousSetReps || 8,
    to_failure: true  // Always true for last set
  };

  sets.push(newSet);
}
```

**User Override:**
- User can manually unmark last set if doing submaximal work
- User can manually mark earlier sets if failure occurred before last set
- Toggle persists across saves

---

## Data Consistency

### Personal Bests Update Logic

**Rule:** Only update `personal_bests` from sets marked `to_failure = true`

**Scenarios:**

**Scenario 1: New Exercise**
```sql
-- No existing record for "Bench Press"
INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, updated_at)
VALUES (1, 'Bench Press', 800, 2400, CURRENT_TIMESTAMP);
```

**Scenario 2: Breaking PR**
```sql
-- Current best: 800, New set: 840
UPDATE personal_bests
SET best_single_set = 840,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1 AND exercise_name = 'Bench Press';
```

**Scenario 3: Session Volume PR (but not single-set PR)**
```sql
-- Current session total: 2800 (3 sets × 800, 900, 1100)
-- Previous best session: 2400
UPDATE personal_bests
SET best_session_volume = 2800,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1 AND exercise_name = 'Bench Press';
```

**Important:** `best_single_set` and `best_session_volume` are independent. Can break one without the other.

---

## Testing Strategy

### Unit Tests

1. **PR Detection Algorithm**
   - Test: First time exercise → should return isPR: true
   - Test: Higher volume → should return isPR: true with correct improvement
   - Test: Lower volume → should return isPR: false
   - Test: Same volume → should return isPR: false
   - Test: Non-failure set → should skip PR detection

2. **Smart Defaults**
   - Test: Adding first set → `to_failure` should be true
   - Test: Adding second set → first set becomes false, second becomes true
   - Test: Manual toggle → persists correctly

### Integration Tests

1. **End-to-End Workout**
   - Log workout with 3 sets
   - Verify last set has `to_failure = true`
   - Verify first 2 sets have `to_failure = false`
   - Verify personal_bests updated correctly

2. **PR Detection**
   - Log baseline workout (100 lbs × 8 reps)
   - Log improvement (105 lbs × 8 reps)
   - Verify PR detected and notification shown
   - Verify `personal_bests` table updated

---

## Performance Considerations

**Database:**
- Add index on `exercise_sets(to_failure)` for future queries filtering failure sets
- No performance impact expected (small dataset, simple queries)

**Frontend:**
- PR detection runs server-side (no client computation)
- Notification renders on demand (no constant polling)
- Minimal state management (boolean flag per set)

---

## Future Enhancements (Out of Scope)

1. **PR History Timeline** - Show all historical PRs with dates
2. **PR Leaderboard** - Compare against other users (multi-user feature)
3. **Volume-Based Analytics** - Chart volume progression over time
4. **Automatic Baseline Learning** - Use failure data for muscle capacity inference
5. **Effort Zones** - Track RPE (Rate of Perceived Exertion) alongside failure status

---

## Migration Plan

### Step 1: Database Migration
```sql
-- Add column (safe, non-breaking)
ALTER TABLE exercise_sets ADD COLUMN to_failure INTEGER DEFAULT 1;

-- Optional: Add index for future queries
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
```

### Step 2: Backend Deployment
- Deploy new backend with `to_failure` field support
- Backwards compatible: if `to_failure` not provided, defaults to 1 (true)

### Step 3: Frontend Deployment
- Deploy new frontend with toggle UI
- Users start seeing toggle on new workouts
- Historical workouts remain unchanged (all sets assumed to failure)

### Step 4: Validation
- Monitor PR detection accuracy
- Check for false positives
- Gather user feedback

**Rollback Plan:**
```sql
-- If issues arise, rollback is simple
ALTER TABLE exercise_sets DROP COLUMN to_failure;
```

---

## Security & Privacy

**No new security concerns:**
- Feature operates on existing user data
- No external API calls
- No new authentication requirements
- All data remains local (SQLite)

---

*This design ensures a simple, robust implementation of failure tracking and PR detection that provides immediate user value while laying groundwork for future intelligent features.*
