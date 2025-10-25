# Spec: Backend Muscle State Calculation

**Capability:** `backend-muscle-state-calculation`
**Status:** Proposed (New Capability)
**Change:** refactor-backend-driven-muscle-states

---

## Overview

Backend SHALL be the authoritative calculation engine for all time-based muscle state computations. The backend reads immutable historical facts from the database and calculates current state using recovery formulas, returning computed values ready for display.

---

## ADDED Requirements

### Requirement: Calculate Current Fatigue with Time Decay

**Description:** Backend SHALL calculate current fatigue percentage using linear decay formula based on days elapsed since workout.

**Formula:**
```
recoveryDays = 1 + (initialFatigue / 100) * 6
currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
currentFatigue = max(0, min(100, currentFatigue))
```

**Acceptance Criteria:**
- Calculation happens on every GET `/api/muscle-states` request
- Never-trained muscles (null `last_trained`) return `currentFatigue = 0`
- Fully recovered muscles (`daysElapsed >= recoveryDays`) return `currentFatigue = 0`
- Freshly trained muscles (`daysElapsed = 0`) return `currentFatigue = initialFatigue`
- All values bounded to 0-100 range
- Values rounded to 1 decimal place for display

#### Scenario: Never-trained muscle returns zero fatigue

**Given:** Muscle "Pectoralis" has never been trained
**And:** `last_trained` is null in database
**When:** Backend calculates muscle states
**Then:** `currentFatiguePercent` is 0
**And:** `daysElapsed` is null
**And:** `recoveryStatus` is "ready"

#### Scenario: Freshly trained muscle returns initial fatigue

**Given:** Muscle "Triceps" was trained today with `initial_fatigue_percent = 51`
**And:** `last_trained` is current timestamp (daysElapsed = 0)
**When:** Backend calculates muscle states
**Then:** `currentFatiguePercent` is 51.0
**And:** `daysElapsed` is 0.0
**And:** `estimatedRecoveryDays` is 4.1 (1 + 51/100 * 6)
**And:** `daysUntilRecovered` is 4.1
**And:** `recoveryStatus` is "recovering"

#### Scenario: Partially recovered muscle applies linear decay

**Given:** Muscle "Deltoids" was trained 2 days ago with `initial_fatigue_percent = 50`
**And:** Recovery time is 4 days (1 + 50/100 * 6)
**When:** Backend calculates muscle states
**Then:** `currentFatiguePercent` is 25.0 (50 * (1 - 2/4))
**And:** `daysElapsed` is 2.0
**And:** `daysUntilRecovered` is 2.0
**And:** `recoveryStatus` is "ready" (25% <= 33%)

#### Scenario: Fully recovered muscle returns zero

**Given:** Muscle "Lats" was trained 7 days ago with `initial_fatigue_percent = 100`
**And:** Recovery time is 7 days (1 + 100/100 * 6)
**When:** Backend calculates muscle states
**Then:** `currentFatiguePercent` is 0.0 (100 * (1 - 7/7))
**And:** `daysElapsed` is 7.0
**And:** `daysUntilRecovered` is 0.0
**And:** `recoveryStatus` is "ready"

---

### Requirement: Determine Recovery Status from Fatigue Thresholds

**Description:** Backend SHALL categorize muscle recovery status into three states based on current fatigue percentage.

**Thresholds:**
- `ready`: currentFatigue <= 33%
- `recovering`: 33% < currentFatigue <= 66%
- `fatigued`: currentFatigue > 66%

**Acceptance Criteria:**
- Status determination happens after fatigue calculation
- Status is enum type with exactly 3 values
- Threshold checks use inclusive <= operator
- Never-trained muscles always return "ready"

#### Scenario: Low fatigue muscle is ready

**Given:** Muscle "Biceps" has `currentFatiguePercent = 25.5`
**When:** Backend determines recovery status
**Then:** `recoveryStatus` is "ready"

#### Scenario: Moderate fatigue muscle is recovering

**Given:** Muscle "Quadriceps" has `currentFatiguePercent = 42.3`
**When:** Backend determines recovery status
**Then:** `recoveryStatus` is "recovering"

#### Scenario: High fatigue muscle is fatigued

**Given:** Muscle "Pectoralis" has `currentFatiguePercent = 75.8`
**When:** Backend determines recovery status
**Then:** `recoveryStatus` is "fatigued"

#### Scenario: Boundary case at 33% exactly is ready

**Given:** Muscle "Core" has `currentFatiguePercent = 33.0`
**When:** Backend determines recovery status
**Then:** `recoveryStatus` is "ready" (boundary is inclusive)

#### Scenario: Boundary case at 66% exactly is recovering

**Given:** Muscle "Glutes" has `currentFatiguePercent = 66.0`
**When:** Backend determines recovery status
**Then:** `recoveryStatus` is "recovering" (boundary is inclusive)

---

### Requirement: Calculate Days Elapsed Since Workout

**Description:** Backend SHALL calculate the number of days elapsed between last workout and current time using UTC timestamps.

**Acceptance Criteria:**
- Calculation uses `(now - lastTrained) / (1000 * 60 * 60 * 24)`
- Always uses UTC timestamps to prevent timezone bugs
- Null `last_trained` returns `daysElapsed = null` (not 0, not Infinity)
- Values rounded to 1 decimal place
- Never negative (validation check)

#### Scenario: Calculate days elapsed from UTC timestamps

**Given:** Current time is "2025-10-25T12:00:00.000Z"
**And:** Muscle last trained at "2025-10-24T06:00:00.000Z"
**When:** Backend calculates days elapsed
**Then:** `daysElapsed` is 1.3 (30 hours / 24)

#### Scenario: Never-trained muscle returns null

**Given:** Muscle "Hamstrings" has `last_trained = null`
**When:** Backend calculates days elapsed
**Then:** `daysElapsed` is null (not 0, not Infinity)

#### Scenario: Just-trained muscle returns zero

**Given:** Current time is "2025-10-25T12:00:00.000Z"
**And:** Muscle last trained at "2025-10-25T12:00:00.000Z"
**When:** Backend calculates days elapsed
**Then:** `daysElapsed` is 0.0

---

### Requirement: Calculate Estimated Recovery Time

**Description:** Backend SHALL calculate total recovery time needed based on initial fatigue percentage using recovery formula.

**Formula:**
```
recoveryDays = 1 + (initialFatigue / 100) * 6
```

**Examples:**
- 0% fatigue → 1.0 days
- 50% fatigue → 4.0 days
- 100% fatigue → 7.0 days

**Acceptance Criteria:**
- Calculation uses initial fatigue (from database), not current fatigue
- Never-trained muscles default to 1.0 day (base recovery)
- Values rounded to 1 decimal place
- Always >= 1.0 (base recovery time)

#### Scenario: Zero fatigue workout has minimum recovery

**Given:** Muscle "Forearms" has `initial_fatigue_percent = 0`
**When:** Backend calculates recovery time
**Then:** `estimatedRecoveryDays` is 1.0 (base recovery)

#### Scenario: Moderate fatigue workout has proportional recovery

**Given:** Muscle "Triceps" has `initial_fatigue_percent = 50`
**When:** Backend calculates recovery time
**Then:** `estimatedRecoveryDays` is 4.0 (1 + 50/100 * 6)

#### Scenario: Maximum fatigue workout has longest recovery

**Given:** Muscle "Quadriceps" has `initial_fatigue_percent = 100`
**When:** Backend calculates recovery time
**Then:** `estimatedRecoveryDays` is 7.0 (1 + 100/100 * 6)

---

### Requirement: Calculate Days Until Full Recovery

**Description:** Backend SHALL calculate remaining days until muscle is fully recovered.

**Formula:**
```
daysUntilRecovered = max(0, recoveryDays - daysElapsed)
```

**Acceptance Criteria:**
- Calculation uses `recoveryDays - daysElapsed`
- Never negative (clamped to 0 minimum)
- Fully recovered muscles return 0.0
- Never-trained muscles return 0.0 (immediately ready)
- Values rounded to 1 decimal place

#### Scenario: Partially recovered muscle has remaining time

**Given:** Muscle "Deltoids" needs 4.0 days recovery
**And:** 1.5 days have elapsed since workout
**When:** Backend calculates days until recovered
**Then:** `daysUntilRecovered` is 2.5 (4.0 - 1.5)

#### Scenario: Fully recovered muscle returns zero

**Given:** Muscle "Lats" needed 5.0 days recovery
**And:** 6.0 days have elapsed
**When:** Backend calculates days until recovered
**Then:** `daysUntilRecovered` is 0.0 (clamped, not negative)

#### Scenario: Never-trained muscle returns zero

**Given:** Muscle "Calves" has never been trained
**When:** Backend calculates days until recovered
**Then:** `daysUntilRecovered` is 0.0 (immediately ready)

---

### Requirement: Return Complete Calculated State for All Muscles

**Description:** Backend GET `/api/muscle-states` SHALL return calculated current state for all 13 muscle groups in a single response.

**Response Schema:**
```typescript
{
  [muscleName: string]: {
    // Calculated fields
    currentFatiguePercent: number;
    daysElapsed: number | null;
    estimatedRecoveryDays: number;
    daysUntilRecovered: number;
    recoveryStatus: 'ready' | 'recovering' | 'fatigued';

    // Stored fields
    initialFatiguePercent: number;
    lastTrained: string | null;
  }
}
```

**Acceptance Criteria:**
- Response includes all 13 predefined muscle groups
- Each muscle has all 7 fields populated
- All calculated fields use formulas specified in requirements above
- Response time < 50ms (local API benchmark)
- No database writes during GET (read-only operation)

#### Scenario: Backend returns complete state for all muscles

**Given:** Database has 13 muscle state records
**When:** Client calls GET `/api/muscle-states`
**Then:** Response contains all 13 muscle names
**And:** Each muscle has 7 fields: currentFatiguePercent, initialFatiguePercent, lastTrained, daysElapsed, estimatedRecoveryDays, daysUntilRecovered, recoveryStatus
**And:** Response time is less than 50ms

#### Scenario: Mixed muscle states return correctly

**Given:** "Triceps" trained 1 day ago with 51% fatigue
**And:** "Pectoralis" never trained
**And:** "Lats" fully recovered (7 days ago)
**When:** Client calls GET `/api/muscle-states`
**Then:** Triceps returns calculated partial recovery state
**And:** Pectoralis returns never-trained state (all zeros/nulls)
**And:** Lats returns fully recovered state (0% current fatigue)

---

### Requirement: Validate and Clamp All Calculated Values

**Description:** Backend SHALL validate and clamp all calculated numeric values to prevent invalid states.

**Validation Rules:**
- `currentFatiguePercent`: 0.0 to 100.0
- `daysElapsed`: >= 0.0 or null
- `estimatedRecoveryDays`: >= 1.0
- `daysUntilRecovered`: >= 0.0
- All values: round to 1 decimal place

**Acceptance Criteria:**
- Bounds checking applied after calculation
- Floating point errors prevented by rounding
- Invalid values logged as warnings (but not returned)
- Negative values impossible in response

#### Scenario: Floating point error is rounded

**Given:** Calculation produces `currentFatiguePercent = 25.499999999`
**When:** Backend applies rounding
**Then:** Response contains `currentFatiguePercent = 25.5`

#### Scenario: Over-recovery is clamped to zero

**Given:** Calculation produces `daysUntilRecovered = -0.5` (more time passed than needed)
**When:** Backend applies clamping
**Then:** Response contains `daysUntilRecovered = 0.0`

#### Scenario: Extreme fatigue is clamped to 100

**Given:** Calculation produces `currentFatiguePercent = 105.3` (data error)
**When:** Backend applies clamping
**Then:** Response contains `currentFatiguePercent = 100.0`
**And:** Warning logged to console

---

## Implementation Notes

**Performance:**
- All calculations are arithmetic only (no I/O, no DB queries after initial SELECT)
- 13 muscles × ~8 operations each = ~100 operations total
- Estimated time: <1ms on modern hardware

**Testing:**
```bash
# Test GET endpoint
curl http://localhost:3001/api/muscle-states | jq

# Expected: All 13 muscles with calculated values
```

**Files to Modify:**
- `backend/server.ts` - Update GET /api/muscle-states handler
- `backend/database/database.ts` - Update getMuscleStates() function

---

*Spec version 1.0 - 2025-10-25*
