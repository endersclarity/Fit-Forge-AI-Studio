# Capability: Detailed Muscle Tracking

## Overview

Track 40+ specific muscles behind the scenes for accurate recuperation calculations while maintaining simple 13-muscle visualization for users.

**Related Capabilities:**
- `muscle-specific-recommendations` - Uses this data for smarter exercise recommendations
- `advanced-muscle-visualization` - Displays this data to power users

---

## ADDED Requirements

### Requirement: System SHALL track 42 detailed muscles per user

System must store individual fatigue state for each of 42 specific muscles including rotator cuff, scapular stabilizers, core subdivisions, and muscle head divisions.

**Rationale:** EMG research shows exercises engage many muscles beyond the 13 visualization groups. Tracking these enables accurate recuperation and smarter recommendations.

#### Scenario: User logs push-up exercise

**Given:** User has completed 3 sets of 10 push-ups
**When:** System calculates muscle engagement
**Then:** System updates fatigue for:
- `PectoralisMajorSternal` (primary, 75% MVIC)
- `TricepsLongHead` (primary, 75% MVIC)
- `TricepsLateralHead` (primary, 75% MVIC)
- `AnteriorDeltoid` (secondary, 30% MVIC)
- `RectusAbdominis` (secondary, 35% MVIC)
- `SerratusAnterior` (stabilizer, 45% MVIC)
- `ExternalObliques` (stabilizer, 30% MVIC)
- `InternalObliques` (stabilizer, 25% MVIC)
- `ErectorSpinae` (stabilizer, 20% MVIC)
- `Infraspinatus` (stabilizer, 15% MVIC)

**And:** Visualization still shows aggregate fatigue for `Pectoralis`, `Triceps`, `Deltoids`, `Core`

#### Scenario: User logs pull-up exercise

**Given:** User completes 3 sets of 8 pull-ups
**When:** System processes detailed muscle engagements
**Then:** System tracks specific engagement for:
- `LatissimusDorsi` (primary, 120% MVIC)
- `BicepsBrachii` (primary, 87% MVIC)
- `Infraspinatus` (stabilizer, 75% MVIC)
- `LowerTrapezius` (secondary, 50% MVIC)
- `PectoralisMajorSternal` (secondary, 50% MVIC)

**And:** Dashboard aggregates to show `Lats`, `Biceps`, `Trapezius`, `Pectoralis`

---

### Requirement: System SHALL categorize muscles by role

Each detailed muscle engagement must be classified as `primary`, `secondary`, or `stabilizer` based on EMG research data.

**Rationale:** Role determines how muscle contributes to visualization aggregation and recommendation scoring.

#### Scenario: Primary mover identification

**Given:** Exercise has `BicepsBrachii` at 85% MVIC in Concentration Curl
**When:** System evaluates muscle role
**Then:** Muscle is categorized as `primary`
**And:** Fatigue heavily impacts visualization for `Biceps` group
**And:** Exercise is avoided when this muscle is fatigued

#### Scenario: Stabilizer identification

**Given:** Exercise has `SerratusAnterior` at 45% MVIC in Push-up
**When:** System evaluates muscle role
**Then:** Muscle is categorized as `stabilizer`
**And:** Fatigue is hidden from basic visualization
**And:** Fatigue still impacts detailed recommendations

#### Scenario: Secondary mover identification

**Given:** Exercise has `AnteriorDeltoid` at 32% MVIC in Incline Bench Press
**When:** System evaluates muscle role
**Then:** Muscle is categorized as `secondary`
**And:** Fatigue contributes moderately to visualization
**And:** Exercise may still be recommended if primary movers are fresh

---

### Requirement: System SHALL initialize detailed baselines conservatively

When creating detailed muscle records, all detailed muscles within a visualization group must inherit the full baseline capacity from that group.

**Rationale:** Conservative approach prevents overtraining during initial calibration. System learns actual capacities over time.

#### Scenario: Initialize detailed muscles from Deltoids baseline

**Given:** User has `Deltoids` baseline of 4,350 lb
**When:** System initializes detailed muscle tracking
**Then:** System creates records with inherited baselines:
- `AnteriorDeltoid`: 4,350 lb baseline
- `MedialDeltoid`: 4,350 lb baseline
- `PosteriorDeltoid`: 4,350 lb baseline
- `Infraspinatus`: 4,350 lb baseline
- `Supraspinatus`: 4,350 lb baseline
- `TeresMinor`: 4,350 lb baseline
- `Subscapularis`: 4,350 lb baseline

**And:** All have `baseline_source = 'inherited'`
**And:** All have `baseline_confidence = 'low'`

#### Scenario: Initialize from user's personal records

**Given:** User has following visualization baselines:
- `Pectoralis`: 2,500 lb
- `Biceps`: 4,325 lb
- `Core`: 6,740 lb
**When:** System runs detailed muscle initialization
**Then:** System creates 42 detailed muscle records
**And:** Each inherits full baseline from its visualization group
**And:** No detailed muscle has lower baseline than its parent group

---

### Requirement: System SHALL map detailed muscles to visualization groups

Every detailed muscle must have a defined mapping to exactly one visualization muscle for aggregation purposes.

**Rationale:** Enables rolling up detailed fatigue to simple 13-muscle display.

#### Scenario: Map rotator cuff to Deltoids

**Given:** Detailed muscles: `Infraspinatus`, `Supraspinatus`, `TeresMinor`, `Subscapularis`
**When:** System determines visualization mapping
**Then:** All four muscles map to `Deltoids` visualization group
**And:** Their fatigue contributes to Deltoids display (if primary/secondary role)

#### Scenario: Map core subdivisions

**Given:** Detailed muscles: `RectusAbdominis`, `ExternalObliques`, `InternalObliques`, `TransverseAbdominis`, `ErectorSpinae`, `Iliopsoas`
**When:** System determines visualization mapping
**Then:** All six muscles map to `Core` visualization group
**And:** Dashboard shows single "Core" card with aggregated fatigue

#### Scenario: Map triceps heads

**Given:** Detailed muscles: `TricepsLongHead`, `TricepsLateralHead`, `TricepsMedialHead`
**When:** System determines visualization mapping
**Then:** All three heads map to `Triceps` visualization group
**And:** User sees single "Triceps" fatigue percentage

---

### Requirement: System SHALL aggregate primary movers only for visualization

Visualization fatigue must be calculated from primary and secondary movers only, excluding stabilizers from the displayed percentage.

**Rationale:** Users think of "shoulder muscles" not "rotator cuff stabilizers". Keep mental model clean while tracking detailed data.

#### Scenario: Calculate Deltoids visualization fatigue

**Given:** Detailed muscle states:
- `AnteriorDeltoid`: 80% fatigued (primary)
- `MedialDeltoid`: 40% fatigued (primary)
- `PosteriorDeltoid`: 20% fatigued (primary)
- `Infraspinatus`: 60% fatigued (stabilizer)
- `Supraspinatus`: 45% fatigued (stabilizer)
**When:** System calculates visualization fatigue for Deltoids
**Then:** System averages primary movers only: (80 + 40 + 20) / 3 = 47%
**And:** Stabilizer fatigue (infraspinatus 60%, supraspinatus 45%) is NOT included
**And:** Dashboard displays "Deltoids: 47%"

#### Scenario: All muscles are stabilizers

**Given:** Visualization group has only stabilizer-role muscles
**When:** System calculates display fatigue
**Then:** System returns 0% (no primary movers)
**Or:** Falls back to weighted stabilizer average
**And:** Dashboard shows minimal fatigue

---

### Requirement: System SHALL apply uniform recovery within groups

All detailed muscles within the same visualization group must recover at the same rate, regardless of role or baseline.

**Rationale:** Simpler to reason about. Can add sophistication later if data shows need.

#### Scenario: Recover all Biceps muscles uniformly

**Given:** Biceps recovery rate is 5% per hour
**And:** Detailed muscles:
- `BicepsBrachii`: 80% fatigued
- `Brachialis`: 60% fatigued
- `Brachioradialis`: 40% fatigued (maps to Forearms but assume example)
**When:** 2 hours pass without training
**Then:** All recover by 10% (5% × 2 hours):
- `BicepsBrachii`: 70% fatigued
- `Brachialis`: 50% fatigued
- `Brachioradialis`: 30% fatigued

#### Scenario: Recovery respects visualization group boundaries

**Given:** `Deltoids` recovers at 4% per hour
**And:** `Core` recovers at 6% per hour
**When:** 3 hours pass
**Then:** `AnteriorDeltoid` (Deltoids group) recovers by 12%
**And:** `RectusAbdominis` (Core group) recovers by 18%
**And:** Recovery rates differ by visualization group, not by detailed muscle

---

### Requirement: System SHALL store baseline confidence level

Each detailed muscle baseline must track confidence level (`low`, `medium`, `high`) and source (`inherited`, `learned`, `user_override`).

**Rationale:** System can improve recommendations as it learns actual capacities over time.

#### Scenario: Initial inherited baseline has low confidence

**Given:** System initializes detailed muscles from visualization baseline
**When:** `AnteriorDeltoid` is created
**Then:** Record has:
- `baseline_capacity`: 4,350 (inherited value)
- `baseline_source`: 'inherited'
- `baseline_confidence`: 'low'

**And:** System knows this baseline is unvalidated

#### Scenario: System learns actual capacity over time

**Given:** User consistently hits 3,500 lb volume for `AnteriorDeltoid` without fatigue exceeding 80%
**And:** This pattern repeats over 5 sessions
**When:** System updates baseline
**Then:** Record changes to:
- `baseline_capacity`: 3,500 (learned from data)
- `baseline_source`: 'learned'
- `baseline_confidence`: 'medium'

**And:** Future recommendations use learned baseline

#### Scenario: User manually overrides baseline

**Given:** User sets `PosteriorDeltoid` baseline to 2,000 lb in settings
**When:** System saves override
**Then:** Record updates to:
- `baseline_capacity`: 2,000
- `baseline_source`: 'user_override'
- `baseline_confidence`: 'high'

**And:** System respects user's self-knowledge

---

### Requirement: System SHALL maintain backward compatibility

Existing `muscle_baselines` and `muscle_states` tables must remain unchanged and functional for visualization layer.

**Rationale:** No breaking changes to existing features. Dual-layer system coexists peacefully.

#### Scenario: Dashboard still uses 13-muscle visualization

**Given:** Detailed muscle tracking is enabled
**When:** User views dashboard
**Then:** Dashboard displays exactly 13 muscle cards
**And:** Each card shows aggregated fatigue from detailed muscles
**And:** No UI changes from user's perspective

#### Scenario: Existing API endpoints unchanged

**Given:** Frontend calls `/api/muscle-states`
**When:** Backend processes request
**Then:** Response contains 13 visualization muscle states
**And:** Detailed muscle data is used for calculation
**But:** Response format matches existing schema

#### Scenario: Legacy exercise data still works

**Given:** Exercise has only `muscleEngagements` (13 viz muscles)
**And:** Does NOT have `detailedMuscleEngagements`
**When:** System logs workout
**Then:** System uses existing logic with 13-muscle tracking
**And:** No errors or degradation
**And:** Detailed tracking gracefully skipped

---

## MODIFIED Requirements

_(None - This is a new capability with no modifications to existing specs)_

---

## REMOVED Requirements

_(None - No requirements are being removed)_

---

## Related Capabilities

- **`exercise-recommendation-algorithm`** - Will be enhanced to use detailed muscle data
- **`baseline-learning-engine`** - Future: Learn detailed baselines over time
- **`recovery-dashboard-screen`** - Uses aggregated data from detailed tracking

---

## Implementation Notes

### Database Migration

```sql
-- Add new table for detailed tracking
CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  detailed_muscle_name TEXT NOT NULL,
  visualization_muscle_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('primary', 'secondary', 'stabilizer')),
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  baseline_capacity REAL NOT NULL,
  baseline_source TEXT DEFAULT 'inherited' CHECK(
    baseline_source IN ('inherited', 'learned', 'user_override')
  ),
  baseline_confidence TEXT DEFAULT 'low' CHECK(
    baseline_confidence IN ('low', 'medium', 'high')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, visualization_muscle_name)
    REFERENCES muscle_baselines(user_id, muscle_name) ON DELETE CASCADE,
  UNIQUE(user_id, detailed_muscle_name)
);
```

### Type Safety

All detailed muscle enums must be type-checked at compile time. No string literals allowed for muscle names.

### Performance Target

Dashboard load time must not increase by more than 5% with detailed tracking enabled.

---

*Spec Version: 1.0*
*Status: Draft*
