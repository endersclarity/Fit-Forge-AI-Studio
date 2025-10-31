# Investigation: Muscle Fatigue Not Reflecting Logged Workouts

**Date**: October 31, 2025
**Status**: ✅ RESOLVED
**Resolution Date**: October 31, 2025
**Severity**: High - Core feature not functioning (NOW FIXED)

## Summary

The muscle fatigue visualization system is not integrating with logged workout data. Despite having a Push workout logged in the database from October 29, 2025, all muscle groups are showing 0% fatigue and "Never trained" status.

## Evidence

### 1. Workout Data Exists in Database

**API Endpoint**: `GET http://localhost:3001/api/workouts`

**Response Data**:
```json
[{
  "id": 60,
  "date": "2025-10-29T00:00:00.000Z",
  "category": "Push",
  "variation": null,
  "progression_method": null,
  "duration_seconds": null,
  "exercises": [
    {
      "exercise": "Incline Dumbbell Bench Press",
      "sets": [
        {"weight": 50, "reps": 12},
        {"weight": 90, "reps": 10},
        {"weight": 90, "reps": 10},
        {"weight": 90, "reps": 8}
      ]
    },
    {
      "exercise": "Push-up",
      "sets": [
        {"weight": 200, "reps": 10},
        {"weight": 200, "reps": 7},
        {"weight": 200, "reps": 6}
      ]
    },
    {
      "exercise": "TRX Pushup",
      "sets": [
        {"weight": 200, "reps": 19},
        {"weight": 200, "reps": 13},
        {"weight": 200, "reps": 11}
      ]
    },
    {
      "exercise": "TRX Tricep Extension",
      "sets": [
        {"weight": 0, "reps": 8},
        {"weight": 0, "reps": 7},
        {"weight": 0, "reps": 4}
      ]
    }
  ],
  "created_at": "2025-10-31 02:15:53"
}]
```

**Workout Details**:
- Date: October 29, 2025 (2 days ago)
- Category: Push
- Exercises targeting: Pectoralis, Triceps, Deltoids
- Total volume: Significant training load across multiple push muscles

### 2. Muscle States Show No Training History

**API Endpoint**: `GET http://localhost:3001/api/muscle-states`

**Sample Response Data** (Push muscles that should be fatigued):
```json
{
  "Pectoralis": {
    "currentFatiguePercent": 0,
    "daysElapsed": null,
    "estimatedRecoveryDays": 1,
    "daysUntilRecovered": 0,
    "recoveryStatus": "ready",
    "initialFatiguePercent": 0,
    "lastTrained": null
  },
  "Triceps": {
    "currentFatiguePercent": 0,
    "daysElapsed": null,
    "estimatedRecoveryDays": 1,
    "daysUntilRecovered": 0,
    "recoveryStatus": "ready",
    "initialFatiguePercent": 0,
    "lastTrained": null
  },
  "Deltoids": {
    "currentFatiguePercent": 0,
    "daysElapsed": null,
    "estimatedRecoveryDays": 1,
    "daysUntilRecovered": 0,
    "recoveryStatus": "ready",
    "initialFatiguePercent": 0,
    "lastTrained": null
  }
}
```

**Key Issues**:
- `lastTrained`: null (should be "2025-10-29")
- `currentFatiguePercent`: 0 (should be >0 after 2 days)
- `daysElapsed`: null (should be 2)

### 3. Detailed Muscle States Also Show No Training

**API Endpoint**: `GET http://localhost:3001/api/muscle-states/detailed`

All detailed muscles (Pectoralis Major Clavicular, Pectoralis Major Sternal, Triceps Brachii, etc.) show:
```json
{
  "currentFatiguePercent": 0,
  "volumeToday": 0,
  "lastTrained": null
}
```

### 4. UI Correctly Displays API Data

The frontend visualization correctly shows the data it receives from the API:
- All muscles showing "0% fatigued"
- All muscles showing "Never trained"
- Recent workout IS displayed in the "Recent Workouts" section showing "2 days ago Push -"

This confirms the issue is in the backend, not the frontend.

## Root Cause Analysis

The disconnect occurs in the backend muscle state calculation logic. The system has:

1. **Workout data** - Successfully stored and retrieved
2. **Muscle state API** - Successfully responding
3. **Missing link** - The muscle state calculation is not reading/processing the workout history

## Expected Behavior

After logging a Push workout on October 29, 2025, the muscle states API should return:

**For Pectoralis**:
- `lastTrained`: "2025-10-29T00:00:00.000Z"
- `daysElapsed`: 2
- `currentFatiguePercent`: ~40-60% (depending on fatigue model)
- `initialFatiguePercent`: 100
- `recoveryStatus`: "moderate" or "ready" (depending on recovery curve)

**For Triceps**:
- Similar values reflecting the tricep work from Push-ups and TRX Tricep Extensions

**For Deltoids**:
- Similar values reflecting deltoid involvement in pressing movements

## Impact

**User-facing issues**:
1. Muscle fatigue visualization shows incorrect data
2. Workout recommendations are not based on actual recovery status
3. Users cannot track muscle-specific recovery
4. The core value proposition of muscle-aware training is non-functional

**Affected Features**:
- Muscle Recovery Status visualization
- Muscle Heat Map
- Workout Recommendations (may recommend training fatigued muscles)
- Historical tracking accuracy

## Investigation Next Steps

To fix this issue, we need to investigate:

1. **Backend muscle state calculation logic**:
   - File: `backend/database/analytics.ts` (likely location)
   - Function: Muscle state calculation/aggregation
   - Check if workout history is being queried
   - Check if exercise-to-muscle mapping is applied
   - Check if fatigue calculations are performed

2. **Database queries**:
   - Verify workout data is accessible to muscle state endpoints
   - Check if there are any date/time conversion issues
   - Verify exercise names match the exercise database

3. **Data flow**:
   - Trace from workout save → database → muscle state calculation → API response
   - Identify where the connection breaks

4. **Exercise mapping**:
   - Verify "Incline Dumbbell Bench Press", "Push-up", "TRX Pushup", "TRX Tricep Extension" are mapped to muscles
   - Check if exercise database has these exercises
   - Verify muscle involvement data exists

## Recommended Fix Priority

**Priority**: P0 - Critical
**Reason**: This is a core feature that affects the entire value proposition of FitForge

The system should:
1. Read workout history when calculating muscle states
2. Map exercises to affected muscles
3. Calculate volume per muscle
4. Apply fatigue model
5. Track recovery over time
6. Return accurate muscle state data

## Test Case for Verification

Once fixed, verify with:
1. Query existing workout (ID 60) from database
2. Check muscle states API returns non-zero fatigue for Pectoralis, Triceps, Deltoids
3. Verify `lastTrained` matches workout date
4. Verify `daysElapsed` = 2 (or current day difference)
5. Verify UI displays colored muscles in visualization
6. Verify workout recommendation considers fatigued muscles
