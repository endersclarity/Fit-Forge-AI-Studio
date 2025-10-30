# baseline-learning-accuracy Specification

## Purpose

Corrects the muscle baseline learning algorithm to accurately measure muscle capacity by processing ALL logged sets, not just those marked as "to failure". This ensures the system learns from actual performance data rather than ignoring evidence of capacity.

---

## MODIFIED Requirements

### Requirement: Auto-Update Baselines from ALL Logged Sets

**Description:** System SHALL automatically update `muscle_baselines.system_learned_max` when ANY logged set demonstrates higher capacity than currently recorded, regardless of `to_failure` flag value.

**Changes from baseline-learning-engine:**
- **REMOVED**: "Only processes sets with `to_failure = 1`" criterion
- **ADDED**: Process all sets with valid weight and reps data

**Acceptance Criteria:**
- Baseline update triggered after workout save
- Processes ALL sets in workout (both `to_failure = 0` and `to_failure = 1`)
- Updates occur within same transaction as workout save
- Returns list of updated muscles in API response
- Updates timestamp in `muscle_baselines.updated_at`

#### Scenario: User performs submaximal workout that still exceeds baseline

**Given:** Pectoralis baseline is currently 1,500 units
**And:** User logs Bench Press: 100 lbs × 10 reps with `to_failure = 0`
**And:** User logs Bench Press: 100 lbs × 10 reps with `to_failure = 0`
**And:** User logs Bench Press: 100 lbs × 10 reps with `to_failure = 0`
**And:** Bench Press muscle engagement: Pectoralis 85%
**When:** Workout is saved
**Then:** System calculates total volume per set: 100 × 10 = 1,000 lbs
**And:** Pectoralis volume per set: 1,000 × 0.85 = 850 units
**And:** Total session Pectoralis volume: 850 × 3 sets = 2,550 units
**And:** Compares 2,550 > 1,500 (current baseline)
**And:** Updates `muscle_baselines.system_learned_max` to 2,550 for Pectoralis
**And:** Returns `updated_baselines: [{muscle: "Pectoralis", oldMax: 1500, newMax: 2550}]`

#### Scenario: Mixed failure and non-failure sets in same workout

**Given:** Triceps baseline is currently 800 units
**When:** User logs workout:
- Tricep Extension: 40 lbs × 15 reps (`to_failure = 0`)
- Tricep Extension: 40 lbs × 12 reps (`to_failure = 0`)
- Tricep Extension: 40 lbs × 10 reps (`to_failure = 1`)
**And:** Tricep Extension engagement: Triceps 95%
**Then:** System calculates volumes:
- Set 1: 40 × 15 × 0.95 = 570 units
- Set 2: 40 × 12 × 0.95 = 456 units
- Set 3: 40 × 10 × 0.95 = 380 units
**And:** Total session volume: 570 + 456 + 380 = 1,406 units
**And:** Compares 1,406 > 800 (current baseline)
**And:** Updates baseline to 1,406
**And:** Both failure and non-failure sets contributed to total

#### Scenario: All sets below baseline (no update needed)

**Given:** Pectoralis baseline is 5,000 units
**When:** User logs Push-ups: 200 lbs × 10 reps (`to_failure = 0`)
**And:** Push-up engagement: Pectoralis 70%
**Then:** System calculates: 200 × 10 × 0.70 = 1,400 units
**And:** Compares 1,400 < 5,000 (current baseline)
**And:** No update performed (not a new maximum)
**And:** Baseline remains 5,000
**And:** Same behavior regardless of `to_failure` flag

---

### Requirement: Calculate Session Volume from All Sets

**Description:** System SHALL calculate total session volume per muscle by summing the volume contribution of EVERY set in the workout, regardless of `to_failure` status.

**Changes from baseline-learning-engine:**
- **REMOVED**: "Only failure sets" filtering logic
- **ADDED**: Sum ALL sets for total session volume per muscle

**Acceptance Criteria:**
- Processes every set logged in workout
- Sums volumes across all sets for each muscle
- Uses highest total session volume for baseline comparison
- Ignores `to_failure` flag when calculating volumes

#### Scenario: Multiple sets build session volume

**Given:** User logs workout with 4 sets of Bench Press:
- Set 1: 100 lbs × 10 reps (`to_failure = 0`)
- Set 2: 100 lbs × 9 reps (`to_failure = 0`)
- Set 3: 100 lbs × 8 reps (`to_failure = 0`)
- Set 4: 95 lbs × 10 reps (`to_failure = 1`)
**And:** Bench Press engagement: Pectoralis 85%, Triceps 35%, Deltoids 25%
**When:** Baseline learning processes workout
**Then:** Calculates per-set volumes:
- Set 1: 1,000 lbs → Pec: 850, Tri: 350, Delt: 250
- Set 2: 900 lbs → Pec: 765, Tri: 315, Delt: 225
- Set 3: 800 lbs → Pec: 680, Tri: 280, Delt: 200
- Set 4: 950 lbs → Pec: 807.5, Tri: 332.5, Delt: 237.5
**And:** Calculates total session volumes:
- Pectoralis: 850 + 765 + 680 + 807.5 = 3,102.5 units
- Triceps: 350 + 315 + 280 + 332.5 = 1,277.5 units
- Deltoids: 250 + 225 + 200 + 237.5 = 912.5 units
**And:** Compares each total against respective baselines
**And:** Updates any muscle where session total exceeds current baseline

#### Scenario: Warm-up and working sets both count

**Given:** User logs progressive loading workout:
- Warm-up: 50 lbs × 15 reps (`to_failure = 0`)
- Working set: 100 lbs × 10 reps (`to_failure = 0`)
- Working set: 100 lbs × 10 reps (`to_failure = 1`)
**And:** Pectoralis engagement: 85%
**When:** Baseline learning processes workout
**Then:** All three sets contribute to session volume:
- Warm-up: 50 × 15 × 0.85 = 637.5 units
- Working 1: 100 × 10 × 0.85 = 850 units
- Working 2: 100 × 10 × 0.85 = 850 units
**And:** Total session: 2,337.5 units
**And:** Uses 2,337.5 for baseline comparison
**Note:** Warm-up sets counting is intentional - they prove capacity too

---

### Requirement: Preserve "To Failure" Flag for Future Features

**Description:** System SHALL continue tracking `to_failure` flag on sets but SHALL NOT use it as a filter for baseline learning. The flag remains available for other features (PR detection, progression recommendations, etc.).

**Acceptance Criteria:**
- `to_failure` column remains in database schema
- Flag is stored with each set as logged by user
- Flag available for queries and future feature use
- Flag explicitly NOT used in baseline learning logic
- Code comments clarify flag purpose vs. baseline learning

#### Scenario: To-failure flag preserved for PR detection

**Given:** User logs set: Bench Press 150 lbs × 8 reps (`to_failure = 1`)
**When:** Workout is saved
**Then:** Set data includes `to_failure = 1` in database
**And:** Baseline learning processes set (uses volume for learning)
**And:** PR detection system can query `to_failure = 1` sets separately
**And:** Both features use same set data for different purposes
**And:** Baseline learning doesn't filter on flag, PR detection does

#### Scenario: Code documentation clarifies flag purpose

**Given:** Developer reviews `updateMuscleBaselinesFromWorkout()` function
**When:** Reading code comments
**Then:** Comments explicitly state: "Process ALL sets regardless of to_failure flag"
**And:** Comments explain: "to_failure flag preserved for PR detection and progression features"
**And:** No conditional logic filters sets based on `to_failure` value
**And:** Clear separation between capacity measurement (all sets) and training strategy (failure sets)

---

## REMOVED Requirements

### ~~Requirement: Auto-Update Baselines from Failure Sets~~ (DELETED)

**Reason for Removal:** This requirement contained the fundamental logical flaw. Replaced with "Auto-Update Baselines from ALL Logged Sets" above.

**What Changed:**
- Old: "Only processes sets with `to_failure = 1`"
- New: "Processes ALL sets in workout"

---

## Implementation Notes

### Code Changes Required

**File:** `backend/database/database.ts`
**Function:** `updateMuscleBaselinesFromWorkout()`

**Current (broken) logic:**
```typescript
// Only process failure sets
const failureSets = db.prepare(`
  SELECT ... FROM exercise_sets
  WHERE workout_id = ? AND to_failure = 1
`).all(workoutId);
```

**Corrected logic:**
```typescript
// Process ALL sets to measure actual capacity
const allSets = db.prepare(`
  SELECT ... FROM exercise_sets
  WHERE workout_id = ?
`).all(workoutId);
// Comment: to_failure flag preserved for PR detection, not used for baseline learning
```

### Test Updates Required

**Remove these test cases:**
- "User does submaximal workout (no baseline updates)" - This behavior is WRONG
- "Baseline update triggered by failure set only" - This requirement is WRONG

**Add these test cases:**
- "User does submaximal workout that exceeds baseline (baseline updates)"
- "Mixed failure and non-failure sets both contribute to session volume"
- "Baseline updates from non-failure sets when volume exceeds current baseline"

### Data Migration (Optional)

After deploying this fix, consider rebuilding baselines from historical data:

```sql
-- Option: Rebuild all baselines from complete workout history
-- This would give users accurate baselines reflecting all their logged work
-- Call rebuildMuscleBaselines() function after deployment
```

---

## Validation Checklist

- [ ] All sets in workout contribute to muscle volume calculation
- [ ] `to_failure` flag not used as filter in baseline learning
- [ ] Baseline updates when non-failure sets exceed current baseline
- [ ] Test case: 3 non-failure sets totaling 2,500 units updates 1,000 baseline to 2,500
- [ ] Test case: Mixed failure/non-failure sets both count toward session volume
- [ ] Test case: Warm-up + working sets = accurate total session volume
- [ ] Code comments clarify `to_failure` flag purpose vs. baseline learning
- [ ] No regression in PR detection or other features using `to_failure` flag

---

## Related Specifications

**Relationship:** This spec MODIFIES `baseline-learning-engine`

**Related (unchanged):**
- `pr-detection-and-celebration` - Still uses `to_failure` flag for PR detection
- `failure-status-tracking` - Still tracks and stores flag value
- `manual-baseline-override` - User override logic unchanged
