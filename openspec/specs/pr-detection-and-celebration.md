# Spec: PR Detection and Celebration

**Capability:** `pr-detection-and-celebration`
**Status:** Active

---

## Overview

This capability automatically detects when a user breaks a personal record (PR) and celebrates the achievement with a notification. PRs are volume-based (weight × reps) and only detected for sets marked as "to failure".

---

## Requirements

### Requirement: Detect Volume-Based PRs

**Description:** System SHALL automatically detect when a set's volume (weight × reps) exceeds the previous best for that exercise.

**Acceptance Criteria:**
- PR detection runs when set is logged (real-time)
- Only checks sets with `to_failure = 1`
- Compares current volume against `personal_bests.best_single_set`
- Detects both first-time exercise and improvement over previous best

#### Scenario: User breaks PR with heavier weight
**Given:** User's previous best for "Bench Press" is 100 lbs × 10 reps (1000 volume)
**When:** User logs 105 lbs × 10 reps (1050 volume) with `to_failure = 1`
**Then:** System detects PR (1050 > 1000)
**And:** `personal_bests` table updated with new best_single_set = 1050
**And:** User sees celebration notification

#### Scenario: User breaks PR with more reps
**Given:** User's previous best for "Pull-ups" is 200 lbs × 10 reps (2000 volume)
**When:** User logs 200 lbs × 11 reps (2200 volume) with `to_failure = 1`
**Then:** System detects PR (2200 > 2000)
**And:** `personal_bests` updated
**And:** Notification shows: "NEW PR! Pull-ups: 200 lbs × 11 reps (+200 volume)"

#### Scenario: User logs first time doing an exercise
**Given:** User has never logged "Dumbbell Curl" before
**When:** User logs 25 lbs × 12 reps (300 volume) with `to_failure = 1`
**Then:** System creates new `personal_bests` entry with best_single_set = 300
**And:** Notification shows: "First time logged! Dumbbell Curl: 25 lbs × 12 reps"

---

### Requirement: Ignore Non-Failure Sets for PR Detection

**Description:** System SHALL NOT trigger PR detection for sets marked as not to failure (warm-ups, deloads, submaximal work).

**Acceptance Criteria:**
- PR detection skipped if `to_failure = 0`
- `personal_bests` not updated from non-failure sets
- No PR notification shown

#### Scenario: User does warm-up set above previous PR
**Given:** User's PR for "Squat" is 135 lbs × 8 reps (1080 volume)
**When:** User logs warm-up set: 140 lbs × 8 reps (1120 volume) with `to_failure = 0`
**Then:** PR detection is skipped
**And:** `personal_bests` remains unchanged (still 1080)
**And:** No PR notification shown

#### Scenario: User does deload week
**Given:** User is intentionally lifting lighter weights
**When:** User marks all sets as `to_failure = 0`
**Then:** No PR detection occurs for any set
**And:** Personal bests remain unchanged
**And:** Training data preserved without polluting PRs

---

### Requirement: Update Personal Bests Table

**Description:** When PR detected, `personal_bests` table SHALL be updated automatically.

**Acceptance Criteria:**
- New exercise → INSERT new row
- Breaking PR → UPDATE `best_single_set` and `updated_at`
- Tie (same volume) → No update (not a new record)

#### Scenario: User breaks single-set PR
**Given:** Existing record: `best_single_set = 800` for "Bench Press"
**When:** User logs 840 volume set
**Then:** Database updated:
```sql
UPDATE personal_bests
SET best_single_set = 840,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1 AND exercise_name = 'Bench Press';
```

#### Scenario: User matches previous PR (tie)
**Given:** Existing record: `best_single_set = 1000`
**When:** User logs 1000 volume set
**Then:** No update to `best_single_set` (not a new record)
**But:** `updated_at` timestamp can be updated to show recent achievement
**And:** No PR notification shown

---

### Requirement: Display PR Celebration Notification

**Description:** When PR detected, System SHALL display a clear, motivating notification to the user.

**Acceptance Criteria:**
- Notification appears immediately after set is logged
- Shows exercise name, new weight/reps, and improvement
- Auto-dismisses after 5 seconds
- User can manually dismiss by tapping
- Non-modal (doesn't block workout logging)

#### Scenario: User sees PR celebration
**Given:** User just broke PR for "Dumbbell Row"
**When:** PR detected (120 lbs × 10 reps, previous: 115 lbs × 10 reps)
**Then:** Notification displays:
```
🎉 NEW PR!
Dumbbell Row: 120 lbs × 10 reps
Previous best: 115 lbs × 10 reps (+50 volume)
```
**And:** Notification appears at top-center of screen
**And:** Notification fades out after 5 seconds
**And:** User can tap to dismiss immediately

#### Scenario: Multiple PRs in one workout
**Given:** User breaks PRs on 3 different exercises
**When:** Each PR set is logged
**Then:** Three separate notifications appear sequentially
**And:** Each notification displays for 5 seconds
**And:** Notifications don't overlap (queue if necessary)

---

### Requirement: Handle Session Volume PRs

**Description:** System SHALL track best total volume across all sets in a single workout (session volume).

**Acceptance Criteria:**
- Sum all sets' volumes for an exercise in current workout
- Compare to `personal_bests.best_session_volume`
- Update if new total exceeds previous best
- Separate from single-set PR (can break one without the other)

#### Scenario: User breaks session volume PR but not single-set PR
**Given:** Previous best single set: 1000 volume
**And:** Previous best session volume: 2500 volume (3 sets: 1000, 900, 600)
**When:** User logs workout: 800, 900, 950 (total: 2650)
**Then:** best_session_volume updated to 2650
**But:** best_single_set remains 1000 (no single set exceeded it)
**And:** Notification shows session volume PR (optional for V1)

---

### Requirement: Workout Save Response Includes PR Info

**Description:** System SHALL include PR detection results in API response for frontend notification.

**Schema:**
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
      percentIncrease: number,
      isFirstTime: boolean
    }
  ]
}
```

#### Scenario: Backend returns PR info to frontend
**Given:** User logs workout with 2 PRs
**When:** Backend detects PRs for "Bench Press" and "Pull-ups"
**Then:** Response includes PR array with detection results
**And:** Frontend displays celebration notifications

---

## Edge Cases

### Edge Case 1: User Edits Historical Workout
**Given:** User changes a historical set's weight/reps
**Then:** PR detection re-runs for affected exercise
**And:** Personal bests updated if necessary
**And:** No notification shown (historical data, not live workout)

### Edge Case 2: Very Old PR (years ago)
**Given:** User's PR for "Squat" was 3 years ago
**When:** User breaks that PR today
**Then:** PR detected normally
**And:** Notification can show date: "NEW PR! (Previous: 3 years ago)"

### Edge Case 3: Bodyweight Exercise
**Given:** Exercise uses bodyweight (e.g., Pull-ups)
**When:** User's bodyweight changes over time
**Then:** Volume calculation uses actual bodyweight at time of set
**And:** PRs compare volume fairly across weight changes

---

## Implementation Notes

**Algorithm:**
- Use simple comparison: `currentVolume > previousBest`
- Store volume as REAL in database (supports decimal weights)
- Round volume to 2 decimal places for display

**Performance:**
- PR detection is O(1) lookup (indexed by exercise_name)
- Single query per exercise to get previous best
- Batch update personal_bests at end of workout (or per-set)

**Testing:**
- Test volume calculation with various weight/rep combinations
- Test first-time exercise scenario
- Test PR detection with and without `to_failure` flag
- Test notification display and auto-dismiss
- Test tie scenario (no PR)

---

*Last updated: 2025-10-25*
*Change: enable-failure-tracking-and-pr-detection*
