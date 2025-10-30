# exercise-history-api Specification

## Purpose
TBD - created by archiving change enhance-quick-builder-smart-generation. Update Purpose after archive.
## Requirements
### Requirement: Exercise History API Endpoint

The system SHALL provide an API endpoint that retrieves last performance data for a specific exercise.

**Rationale:** Frontend needs historical data to calculate smart defaults and show comparisons.

#### Scenario: Fetch last performance for exercise with history

**Given:** User has performed "Bench Press" 3 times in past 2 weeks
**And:** Last session was 2025-10-28 with sets: 135×10, 135×10, 135×8
**When:** Frontend calls `GET /api/exercise-history/bench-press/latest`
**Then:** Response status is 200 OK
**And:** Response body contains:
```json
{
  "exerciseId": "bench-press",
  "lastPerformed": "2025-10-28T18:30:00.000Z",
  "sets": [
    { "weight": 135, "reps": 10 },
    { "weight": 135, "reps": 10 },
    { "weight": 135, "reps": 8 }
  ],
  "totalVolume": 3780,
  "personalRecord": { "weight": 185, "reps": 5 }
}
```

#### Scenario: Fetch history for exercise never performed

**Given:** User has never logged "Dumbbell Curl"
**When:** Frontend calls `GET /api/exercise-history/dumbbell-curl/latest`
**Then:** Response status is 200 OK
**And:** Response body contains:
```json
{
  "exerciseId": "dumbbell-curl",
  "lastPerformed": null,
  "sets": [],
  "totalVolume": 0,
  "personalRecord": null
}
```

---

### Requirement: Total Volume Calculation

The system SHALL calculate total volume from the last session by summing weight × reps across all sets from the most recent workout.

**Rationale:** Volume is the key metric for progressive overload calculations.

#### Scenario: Calculate volume for multi-set exercise

**Given:** User's last "Squat" session had sets: 225×10, 225×10, 225×8, 185×12
**When:** API calculates totalVolume
**Then:** totalVolume = (225×10) + (225×10) + (225×8) + (185×12) = 8,870
**And:** Response includes totalVolume: 8870

---

### Requirement: Personal Record Identification

The system SHALL identify personal records by finding the highest weight × reps product across all historical performances of the exercise.

**Rationale:** Personal records inform progressive overload targets and user motivation.

#### Scenario: Find PR from workout history

**Given:** User's "Bench Press" history contains:
- 2025-10-20: 135×10 (1,350), 135×10, 135×8
- 2025-10-25: 145×8 (1,160), 145×8, 140×10 (1,400)
- 2025-10-28: 150×6 (900), 150×6, 150×6
**When:** API identifies personal record
**Then:** personalRecord = { weight: 140, reps: 10 } (highest volume single set: 1,400)

---

### Requirement: History Query Limits

The system SHALL limit history queries to the last 10 sets to optimize performance.

**Rationale:** Full history not needed for defaults, limiting prevents slow queries.

#### Scenario: User with extensive history

**Given:** User has logged "Pull-ups" 50 times over 6 months
**When:** API queries history
**Then:** Database query includes `LIMIT 10`
**And:** Only most recent 10 sets are processed
**And:** Response time is <200ms

---

### Requirement: API Performance Budget

The system SHALL respond to exercise history requests within 200ms.

**Rationale:** Real-time UI interaction requires fast response.

#### Scenario: Performance benchmark

**Given:** Database contains 1,000 workout sessions
**When:** Frontend calls `/api/exercise-history/:id/latest`
**Then:** Response completes in <200ms (95th percentile)
**And:** Database query uses index on (user_id, exercise_id, completed_at)

---

