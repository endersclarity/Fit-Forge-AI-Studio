# Story 2.4: Implement Workout Forecast Endpoint

Status: review

## Story

As a **frontend application**,
I want **to preview fatigue impact before starting a workout**,
So that **users can plan workouts without creating bottlenecks**.

## Acceptance Criteria

1. **Given** a planned workout with exercises and estimated sets
   **When** POST request sent to `/api/forecast/workout`
   **Then** the endpoint fetches current recovery states

2. **And** it calculates predicted fatigue using fatigue calculator (without saving)

3. **And** it combines current fatigue + predicted additional fatigue

4. **And** it identifies bottleneck risks (muscles that would exceed safe thresholds)

5. **And** it returns forecast without modifying database

## Tasks / Subtasks

- [x] Task 1: Create POST endpoint structure (AC: 1)
  - [x] Subtask 1.1: Add route definition `POST /api/forecast/workout` in `backend/server.ts`
  - [x] Subtask 1.2: Define TypeScript request interface: `WorkoutForecastRequest` with plannedExercises array (exercise, sets, reps, weight)
  - [x] Subtask 1.3: Define TypeScript response interface: `WorkoutForecastResponse` with current/predicted fatigue, bottlenecks, warnings
  - [x] Subtask 1.4: Add error handling middleware pattern matching existing endpoints
  - [x] Subtask 1.5: Validate required field: plannedExercises must be provided and non-empty

- [x] Task 2: Fetch current recovery states (AC: 1)
  - [x] Subtask 2.1: Query database for latest `muscle_states` record for all 15 muscles using `database.js`
  - [x] Subtask 2.2: Get current timestamp for recovery calculations
  - [x] Subtask 2.3: Call `recoveryCalculator.calculateRecovery()` service for each muscle (from Story 1.2)
  - [x] Subtask 2.4: Build muscle recovery states array with currentFatigue for each muscle
  - [x] Subtask 2.5: Handle edge case where no workout history exists (all muscles at 0% fatigue)

- [x] Task 3: Calculate predicted fatigue without saving (AC: 2, 3)
  - [x] Subtask 3.1: Import `fatigueCalculator.calculateMuscleFatigue()` service (from Story 1.1)
  - [x] Subtask 3.2: Convert request plannedExercises into workout structure expected by fatigue calculator
  - [x] Subtask 3.3: Load exercise library from `docs/logic-sandbox/exercises.json` (corrected percentages)
  - [x] Subtask 3.4: Load muscle baselines from database using `getMuscleBaselines()`
  - [x] Subtask 3.5: Call fatigue calculator with planned workout (no database save)
  - [x] Subtask 3.6: Extract predicted fatigue deltas by muscle
  - [x] Subtask 3.7: Combine current fatigue + predicted deltas to get projected total fatigue
  - [x] Subtask 3.8: Handle service errors and return 500 on calculation failure

- [x] Task 4: Identify bottleneck risks (AC: 4)
  - [x] Subtask 4.1: For each muscle, compare projected total fatigue against safe threshold (from baselines)
  - [x] Subtask 4.2: Flag muscles that would exceed 100% fatigue as critical bottlenecks
  - [x] Subtask 4.3: Flag muscles between 80-100% as warning bottlenecks
  - [x] Subtask 4.4: Create warnings array with muscle name, currentFatigue, projectedFatigue, threshold, severity
  - [x] Subtask 4.5: Sort bottlenecks by severity (critical first, then warnings)

- [x] Task 5: Format and return response without database modification (AC: 5)
  - [x] Subtask 5.1: Build response with current muscle states (from recovery calculation)
  - [x] Subtask 5.2: Include predicted fatigue deltas by muscle
  - [x] Subtask 5.3: Include projected total fatigue by muscle (current + predicted)
  - [x] Subtask 5.4: Include bottleneck warnings array
  - [x] Subtask 5.5: Include isSafe boolean (true if no critical bottlenecks)
  - [x] Subtask 5.6: Return 200 status with complete WorkoutForecastResponse
  - [x] Subtask 5.7: VERIFY no database writes occur during forecast

- [x] Task 6: Add comprehensive endpoint tests (Testing)
  - [x] Subtask 6.1: Test successful forecast with planned workout
  - [x] Subtask 6.2: Test recovery service integration (current fatigue calculated correctly)
  - [x] Subtask 6.3: Test fatigue calculator integration (predicted fatigue calculated correctly)
  - [x] Subtask 6.4: Test fatigue combination (current + predicted = projected)
  - [x] Subtask 6.5: Test bottleneck identification (muscles exceeding thresholds flagged)
  - [x] Subtask 6.6: Test critical vs warning severity levels
  - [x] Subtask 6.7: Test edge case: no workout history (all muscles fresh, no bottlenecks)
  - [x] Subtask 6.8: Test edge case: empty plannedExercises array (400 error)
  - [x] Subtask 6.9: Test edge case: invalid exercise in plan (400 error)
  - [x] Subtask 6.10: Test edge case: all muscles already maxed (critical bottlenecks for all)
  - [x] Subtask 6.11: Test 500 error when fatigue calculator fails
  - [x] Subtask 6.12: VERIFY no database writes occur (mock db.save methods)

## Dev Notes

### Learnings from Previous Story

**From Story 2-3-implement-exercise-recommendation-endpoint (Status: done)**

- **Endpoint Pattern Established**: POST `/api/recommendations/exercises` (server.ts:1240-1365)
  - TypeScript interfaces inline (ExerciseRecommendationRequest, ExerciseRecommendationResponse)
  - Recovery service integration: `import { calculateRecovery } from './services/recoveryCalculator.js'`
  - Fatigue calculator import: `const { calculateMuscleFatigue } = require('./services/fatigueCalculator.js')`
  - Error handling: try/catch with 500 status on service failure
  - Edge case handling: No workout history returns all 15 muscles at 0% fatigue
  - Response format: Direct JSON response (no wrapper)

- **Epic 1 Services Available**:
  - `calculateMuscleFatigue()` from `backend/services/fatigueCalculator.js` (Story 1.1) ✅
  - `calculateRecovery()` from `backend/services/recoveryCalculator.js` (Story 1.2) ✅
  - Both services tested and production-ready

- **Database Pattern**:
  - Query muscle_states: `db.getMuscleStates()` returns array of MuscleStateData
  - Use `fatiguePercent` property (NOT `initialFatiguePercent`) per database.js contract
  - Query baselines: `db.getMuscleBaselines()` returns muscle baseline data
  - Handle missing data gracefully (no workout history = 0% fatigue)

- **Recovery Service Integration Pattern** (CRITICAL - from Story 2.3 bug fix):
  - Recovery calculator expects: `calculateRecovery(muscleStatesArray, workoutTimestamp, currentTime)`
  - Must build array with `{muscle: string, fatiguePercent: number}` for ALL 15 muscles
  - Call ONCE with full array (NOT per-muscle calls)
  - Handle edge case: Empty muscle states → skip recovery calculation, use 0% fatigue for all

- **Module Pattern**:
  - ES6 imports for TypeScript: `import { calculateRecovery } from './services/recoveryCalculator.js'`
  - CommonJS for JS services: `const { calculateMuscleFatigue } = require('./services/fatigueCalculator.js')`
  - Use `@ts-ignore` for JS modules without TypeScript definitions
  - Services are pure functions (no DB access inside services)

- **15 Muscle Groups** (all services handle consistently):
  Pectoralis, Lats, AnteriorDeltoids, PosteriorDeltoids, Trapezius, Rhomboids, LowerBack, Core, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

- **Test Framework**: Vitest with comprehensive coverage
  - Epic 1 service tests: 100% passing
  - Endpoint tests: Created in `backend/__tests__/` directory
  - Test pattern: Mock services and database for unit tests
  - Story 2.3 has 40+ test cases covering all ACs and edge scenarios

**Key Interfaces to Reuse**:
- Recovery calculator: `calculateRecovery(muscleStatesArray, workoutTimestamp, currentTime)` returns recovery data with currentFatigue
- Fatigue calculator: `calculateMuscleFatigue(workout, exercises, baselines)` returns fatigue deltas by muscle
- Database operations: `db.getMuscleStates()`, `db.getMuscleBaselines()`

**Technical Decisions Applied**:
- Early input validation (validate plannedExercises required field)
- Comprehensive error handling with descriptive messages
- TypeScript type safety for request/response
- Direct JSON responses (no wrapper)
- NO database writes for forecast (read-only operation)

[Source: .bmad-ephemeral/stories/2-3-implement-exercise-recommendation-endpoint.md#Dev-Agent-Record]

### Architecture Patterns

**API Endpoint Structure** (from architecture.md and existing server.ts):
- Location: `backend/server.ts` (existing file - add new endpoint)
- URL Pattern: `/api/forecast/workout` (RESTful resource endpoint)
- Method: POST (requires body with plannedExercises array)
- TypeScript: Full type definitions for Request and Response interfaces
- Error Format: `{ error: "message" }` with appropriate HTTP status codes

**Existing Endpoints Reference** (from server.ts):
- Line 1017: `app.post('/api/workouts/:id/complete', ...)` - POST endpoint pattern with request body
- Line 1150: `app.get('/api/recovery/timeline', ...)` - Recovery service integration pattern
- Line 1240: `app.post('/api/recommendations/exercises', ...)` - Recovery + service composition pattern
- All use try/catch error handling and TypeScript interfaces

**Request/Response Type Definitions**:
- Define interfaces in `backend/server.ts` inline (following Story 2.1/2.2/2.3 pattern)
- Request body: plannedExercises (required array with exercise, sets, reps, weight)
- Response body: { currentFatigue: {}, predictedFatigue: {}, projectedFatigue: {}, bottlenecks: [], isSafe: boolean }
- Error responses: HTTP status + `{ error: string }` type

**Database Access Pattern** (from architecture.md):
- Import: `import db from './database/database.js'`
- Query latest muscle_states for all 15 muscles (READ ONLY)
- Query muscle baselines for safe thresholds (READ ONLY)
- Handle missing data gracefully (no workout history = 0% fatigue)
- **NO WRITES** - This is a forecast endpoint (preview only)

**Service Integration Pattern**:
- Services are pure functions (no DB access inside services)
- Route orchestrates: validate input → query DB → calculate current recovery → calculate predicted fatigue → combine → identify bottlenecks → format response
- Services throw errors for invalid inputs (caught by try/catch in route)
- Route controls HTTP status codes based on service outcomes
- **Forecast must NOT trigger database saves** - dry run only

**Error Handling** (from existing endpoints):
- 400: Invalid input (missing plannedExercises, empty array, invalid exercise)
- 500: Calculation failure or database error
- Try/catch blocks wrap service calls
- Return descriptive error messages in JSON format

### Data Flow

**Request Flow**:
1. Frontend sends POST to `/api/forecast/workout` with plannedExercises array
2. Validate plannedExercises is provided and non-empty (400 if invalid)
3. Query database for latest muscle_states for all 15 muscles (READ ONLY)
4. For each muscle, call `calculateRecovery()` to get current fatigue (ONCE with full array)
5. Convert plannedExercises to workout structure for fatigue calculator
6. Load exercise library from `docs/logic-sandbox/exercises.json`
7. Query muscle baselines from database (READ ONLY)
8. Call `calculateMuscleFatigue()` with planned workout (NO DATABASE SAVE)
9. Extract predicted fatigue deltas from service response
10. Combine current fatigue + predicted deltas = projected total fatigue
11. Compare projected fatigue against baselines to identify bottlenecks
12. Return 200 status with forecast (current, predicted, projected, bottlenecks, isSafe)

**Request Body Structure**:
```typescript
{
  plannedExercises: [
    {
      exercise: "Barbell Squats",
      sets: 3,
      reps: 10,
      weight: 135
    },
    {
      exercise: "Lunges",
      sets: 3,
      reps: 12,
      weight: 25
    }
  ]
}
```

**Response Structure**:
```typescript
{
  currentFatigue: {
    Quadriceps: 42.5,
    Hamstrings: 28.3,
    Glutes: 35.0,
    // ... all 15 muscles
  },
  predictedFatigue: {
    Quadriceps: 38.2,
    Hamstrings: 22.1,
    Glutes: 15.3,
    // ... all 15 muscles (delta from planned workout)
  },
  projectedFatigue: {
    Quadriceps: 80.7,
    Hamstrings: 50.4,
    Glutes: 50.3,
    // ... all 15 muscles (current + predicted)
  },
  bottlenecks: [
    {
      muscle: "Quadriceps",
      currentFatigue: 42.5,
      predictedDelta: 38.2,
      projectedFatigue: 80.7,
      threshold: 100.0,
      severity: "warning",
      message: "Quadriceps approaching safe limit (80.7% of 100%)"
    }
  ],
  isSafe: true
}
```

**Database Schema** (from architecture.md):
- Table: `muscle_states` (already exists) - READ ONLY for forecast
- Query: Get latest record per muscle (ORDER BY timestamp DESC LIMIT 1 per muscle)
- Fields used: muscle, fatiguePercent, lastTrained, recoveredAt
- Table: `muscle_baselines` (already exists) - READ ONLY for safe thresholds

**Service Interfaces**:
- Recovery: `calculateRecovery(muscleStatesArray, workoutTimestamp, currentTime)` → recovery data with currentFatigue
- Fatigue: `calculateMuscleFatigue(workout, exercises, baselines)` → fatigue deltas by muscle

### Testing Standards

**Test Framework**: Vitest (established in Epic 1)

**Test Location**: `backend/__tests__/workoutForecast.test.ts`

**Test Cases Required**:
1. **Happy Path**: Valid plannedExercises → forecast returned with all fatigue projections
2. **Current Fatigue**: Verify recovery calculator called correctly and current fatigue extracted
3. **Predicted Fatigue**: Verify fatigue calculator called with planned workout (NO DB SAVE)
4. **Projected Fatigue**: Verify current + predicted = projected for all muscles
5. **Bottleneck Identification**: Over-threshold muscles flagged with severity (critical/warning)
6. **Safe Workout**: No bottlenecks → isSafe=true
7. **Unsafe Workout**: Critical bottlenecks → isSafe=false, warnings provided
8. **No Workout History**: New user → all muscles fresh, no bottlenecks
9. **Empty Planned Exercises**: Empty array → 400 error
10. **Invalid Exercise**: Exercise not in library → 400 error
11. **All Muscles Maxed**: Already at 100% → critical bottlenecks for all
12. **Fatigue Calculator Failure**: Service throws error → 500 error handled gracefully
13. **Database Query Failure**: DB error → 500 error with descriptive message
14. **NO DATABASE WRITES**: VERIFY no save methods called during forecast

**Mock Strategy**:
- Mock `calculateMuscleFatigue()` service for controlled test scenarios
- Mock `calculateRecovery()` service for current recovery states
- Mock `database.js` muscle_states and baselines queries
- Mock database write methods and verify they are NOT called
- Use real services in integration tests to verify end-to-end flow

**Test Data**:
- Use validated 15 muscle groups from project constants
- Mock muscle_states with known fatigue values
- Mock planned workouts with known exercise compositions
- Verify fatigue combination math: current + predicted = projected

### Project Structure Notes

**File Locations**:
- Endpoint: `backend/server.ts` (EXISTING FILE - add new endpoint)
- Services:
  - `backend/services/fatigueCalculator.js` (EXISTING - from Story 1.1)
  - `backend/services/recoveryCalculator.js` (EXISTING - from Story 1.2)
- Exercise Library: `docs/logic-sandbox/exercises.json` (EXISTING - corrected percentages)
- Database: `backend/database/database.js` (EXISTING - use muscle_states and baselines queries)
- Tests: `backend/__tests__/` (EXISTING directory)

**Dependencies**:
- Story 1.1: Fatigue calculation service (COMPLETE ✅)
- Story 1.2: Recovery calculator service (COMPLETE ✅)
- Story 2.3: Exercise recommendation endpoint (COMPLETE ✅ - establishes recovery + service composition pattern)
- Existing infrastructure: Express server, database layer, muscle_states and baselines tables

**Integration Points**:
- Frontend WorkoutBuilder component will call this endpoint (Epic 3 Story 3.4) for real-time preview
- Response format must match frontend expectations (defined in epics.md)
- Database operations through centralized `database.js` layer (READ ONLY)
- **CRITICAL**: This endpoint does NOT save workout data (forecast only, no side effects)

**No Conflicts Expected**:
- New endpoint in existing server.ts (additive change)
- Uses existing fatigue and recovery services from Epic 1
- No modifications to existing endpoints
- POST endpoint but READ ONLY (no database writes)

### References

**Primary Sources**:
- [Source: docs/epics.md#Story-2.4] - Acceptance criteria and technical notes
- [Source: docs/architecture.md] - API patterns, error handling, database access patterns
- [Source: backend/server.ts] - Existing endpoint patterns (lines 1017, 1150, 1240)
- [Source: .bmad-ephemeral/stories/2-3-implement-exercise-recommendation-endpoint.md] - Service integration pattern
- [Source: .bmad-ephemeral/stories/1-1-implement-fatigue-calculation-service.md] - Fatigue calculator interface
- [Source: .bmad-ephemeral/stories/1-2-implement-recovery-calculation-service.md] - Recovery calculator interface

**Endpoint Implementation Pattern**:
```typescript
// backend/server.ts

// Add TypeScript interfaces for request/response
interface PlannedExercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutForecastRequest {
  plannedExercises: PlannedExercise[];
}

interface Bottleneck {
  muscle: string;
  currentFatigue: number;
  predictedDelta: number;
  projectedFatigue: number;
  threshold: number;
  severity: 'critical' | 'warning';
  message: string;
}

interface WorkoutForecastResponse {
  currentFatigue: Record<string, number>;
  predictedFatigue: Record<string, number>;
  projectedFatigue: Record<string, number>;
  bottlenecks: Bottleneck[];
  isSafe: boolean;
}

// Import services from Epic 1
// @ts-ignore
const { calculateMuscleFatigue } = require('./services/fatigueCalculator.js');
import { calculateRecovery } from './services/recoveryCalculator.js';

// Load exercise library
const fs = require('fs');
const path = require('path');
const exerciseLibraryPath = path.join(__dirname, '../docs/logic-sandbox/exercises.json');
const exerciseLibrary = JSON.parse(fs.readFileSync(exerciseLibraryPath, 'utf8'));

// Add endpoint
app.post('/api/forecast/workout', async (req: Request, res: Response) => {
  try {
    const { plannedExercises } = req.body;

    // Validate required field
    if (!plannedExercises || !Array.isArray(plannedExercises) || plannedExercises.length === 0) {
      return res.status(400).json({ error: 'plannedExercises array is required and must not be empty' });
    }

    // Get current timestamp
    const currentTime = new Date();

    // Query latest muscle states for all 15 muscles (READ ONLY)
    const muscleStates = db.getMuscleStates(); // Returns MuscleStateData[]

    // Calculate current recovery for each muscle to get current fatigue
    let currentFatigue: Record<string, number> = {};

    if (!muscleStates || muscleStates.length === 0) {
      // No workout history - all muscles at 0% fatigue
      const ALL_MUSCLES = [
        'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
        'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
        'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
      ];

      ALL_MUSCLES.forEach(muscle => {
        currentFatigue[muscle] = 0;
      });
    } else {
      // Calculate recovery for each muscle (ONCE with full array)
      const workoutTimestamp = new Date(muscleStates[0].timestamp);
      const recoveryData = calculateRecovery(muscleStates, workoutTimestamp, currentTime);

      recoveryData.forEach((state: any) => {
        currentFatigue[state.muscle] = state.currentFatigue;
      });
    }

    // Convert plannedExercises to workout structure for fatigue calculator
    const plannedWorkout = {
      id: 'forecast',
      exercises: plannedExercises,
      timestamp: currentTime.toISOString()
    };

    // Load muscle baselines (READ ONLY)
    const baselines = db.getMuscleBaselines();

    // Call fatigue calculator with planned workout (NO DATABASE SAVE)
    const fatigueResult = calculateMuscleFatigue(plannedWorkout, exerciseLibrary, baselines);

    // Extract predicted fatigue deltas by muscle
    const predictedFatigue: Record<string, number> = {};
    fatigueResult.muscleStates.forEach((state: any) => {
      predictedFatigue[state.muscle] = state.fatiguePercent;
    });

    // Combine current fatigue + predicted deltas = projected total fatigue
    const projectedFatigue: Record<string, number> = {};
    const bottlenecks: Bottleneck[] = [];

    Object.keys(currentFatigue).forEach(muscle => {
      const current = currentFatigue[muscle];
      const predicted = predictedFatigue[muscle] || 0;
      const projected = current + predicted;

      projectedFatigue[muscle] = projected;

      // Identify bottleneck risks
      const baseline = baselines[muscle] || { maxFatigue: 100 };
      const threshold = baseline.maxFatigue;

      if (projected >= threshold) {
        // Critical bottleneck
        bottlenecks.push({
          muscle,
          currentFatigue: current,
          predictedDelta: predicted,
          projectedFatigue: projected,
          threshold,
          severity: 'critical',
          message: `${muscle} would exceed safe fatigue threshold (${projected.toFixed(1)}% of ${threshold}%)`
        });
      } else if (projected >= threshold * 0.8) {
        // Warning bottleneck (80-100%)
        bottlenecks.push({
          muscle,
          currentFatigue: current,
          predictedDelta: predicted,
          projectedFatigue: projected,
          threshold,
          severity: 'warning',
          message: `${muscle} approaching safe limit (${projected.toFixed(1)}% of ${threshold}%)`
        });
      }
    });

    // Sort bottlenecks by severity (critical first, then warnings)
    bottlenecks.sort((a, b) => {
      if (a.severity === 'critical' && b.severity === 'warning') return -1;
      if (a.severity === 'warning' && b.severity === 'critical') return 1;
      return b.projectedFatigue - a.projectedFatigue;
    });

    // Determine if workout is safe
    const isSafe = !bottlenecks.some(b => b.severity === 'critical');

    // Format and return response
    const response: WorkoutForecastResponse = {
      currentFatigue,
      predictedFatigue,
      projectedFatigue,
      bottlenecks,
      isSafe
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Workout forecast error:', error);
    res.status(500).json({ error: 'Failed to generate workout forecast' });
  }
});
```

**Key Implementation Notes**:
- Use TypeScript for type safety (matches existing server.ts pattern)
- Import fatigue and recovery services from Epic 1 (already implemented and tested)
- Load exercise library from `docs/logic-sandbox/exercises.json` (corrected percentages)
- Use existing `database.js` operations for muscle_states and baselines queries (READ ONLY)
- Follow error handling pattern from existing endpoints
- Wrap in try/catch for graceful error handling
- Handle edge case: no workout history (all muscles at 0% fatigue)
- Validate required field: plannedExercises must be non-empty array
- **CRITICAL**: NO database writes - this is a forecast endpoint (preview only)
- Return direct JSON response (no wrapper)

**Testing Approach**:
- Unit tests: Mock recovery and fatigue services, test endpoint logic
- Integration tests: Real services, verify end-to-end flow
- Edge cases: No workout history, empty plannedExercises, invalid exercise, service failures
- **CRITICAL TEST**: Verify no database writes occur during forecast
- Verify response format matches frontend expectations

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/2-4-implement-workout-forecast-endpoint.context.xml` (Generated: 2025-11-11)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Validation (2025-11-11)**

Discovered endpoint already implemented at `backend/server.ts:1368-1461`. Performed comprehensive validation against all acceptance criteria and found **CRITICAL BUGS** requiring fixes:

**Issues Found in Original Implementation:**
1. **AC1 Violation - Recovery Calculator Integration Bug**: Lines 1390-1394 called recovery calculator per-muscle instead of ONCE with full muscleStatesArray (violates Story 2.3 pattern). Used wrong signature: `calculateRecovery(fatiguePercent, timestamp, timestamp)` instead of correct `calculateRecovery(muscleStatesArray, workoutTimestamp, currentTime)`.
2. **AC1 Violation - Wrong Property**: Line 1391 used `state.initialFatiguePercent` but correct property per database.js contract is `state.fatiguePercent`.
3. **AC4 Violation - Incorrect Response Format**: Lines 1437-1441 returned simple string warnings array instead of structured bottleneck objects with {muscle, currentFatigue, predictedDelta, projectedFatigue, threshold, severity, message}.
4. **AC5 Violation - Missing Fields**: Response returned {currentFatigue, predictedFatigue, finalFatigue, warnings} but required format is {currentFatigue, predictedFatigue, projectedFatigue, bottlenecks, isSafe}.
5. **Request Body Mismatch**: Expected `exercises` field but story specifies `plannedExercises`.

**Fixes Applied:**
1. ✅ Rewrote recovery integration to call `calculateRecovery()` ONCE with full muscleStatesArray (server.ts:1404-1424)
2. ✅ Fixed property usage from `initialFatiguePercent` to `fatiguePercent` (server.ts:1411)
3. ✅ Implemented structured bottleneck objects with all required fields (server.ts:1461-1513)
4. ✅ Added bottleneck severity classification (critical >= 100%, warning 80-100%)
5. ✅ Implemented bottleneck sorting by severity (critical first, then by projected fatigue descending)
6. ✅ Added `isSafe` boolean field calculation (server.ts:1516)
7. ✅ Renamed response fields to match spec: `finalFatigue` → `projectedFatigue`, `warnings` → `bottlenecks`
8. ✅ Changed request body field from `exercises` to `plannedExercises` (server.ts:1370)
9. ✅ Added validation for empty plannedExercises array (server.ts:1373-1375)
10. ✅ Added comments mapping each section to acceptance criteria

**Verification:**
- All 5 acceptance criteria now satisfied
- No database writes occur (READ ONLY operation verified)
- Matches Story 2.3 pattern for recovery calculator integration
- Response format exactly matches WorkoutForecastResponse interface from story spec

### Completion Notes List

**Story 2.4 Implementation Complete (2025-11-11)**

Successfully validated and fixed existing endpoint implementation at `backend/server.ts:1368-1534` to meet all acceptance criteria.

**Implementation Summary:**
- **Endpoint**: POST `/api/forecast/workout` (lines 1368-1534)
- **Request Format**: `{ plannedExercises: [{exercise, sets, reps, weight}] }`
- **Response Format**: `{ currentFatigue, predictedFatigue, projectedFatigue, bottlenecks, isSafe }`
- **Service Integrations**:
  - `calculateRecovery()` from recoveryCalculator.js (Story 1.2) ✅
  - `calculateMuscleFatigue()` from fatigueCalculator.js (Story 1.1) ✅
  - `loadExerciseLibrary()` from dataLoaders.js ✅
- **Database Access**: READ ONLY (getMuscleStates, getMuscleBaselines) - NO WRITES ✅
- **Error Handling**: 400 for invalid input, 500 for service failures ✅
- **Edge Cases**: No workout history (all muscles at 0% fatigue) ✅

**Test Coverage:**
Created comprehensive test suite at `backend/__tests__/workoutForecast.test.ts` with 20+ test cases covering:
- AC1: Database and recovery service integration (3 tests)
- AC2: Fatigue calculation without database writes (3 tests)
- AC3: Fatigue combination math (2 tests)
- AC4: Bottleneck identification and severity classification (3 tests)
- AC5: Response format and database safety (3 tests)
- Input validation (3 tests)
- Edge cases: no workout history, all muscles maxed, safe workout (3 tests)

**Critical Implementation Decisions:**
1. Fixed recovery calculator integration to follow Story 2.3 pattern (ONCE with full array, not per-muscle calls)
2. Used correct database property `fatiguePercent` (not `initialFatiguePercent`)
3. Implemented structured bottleneck objects with severity classification (critical/warning)
4. Added `isSafe` boolean field for frontend decision-making
5. Sorted bottlenecks by severity (critical first) for optimal UX
6. Maintained READ ONLY operation (no database writes)
7. Followed existing endpoint patterns from Stories 2.1, 2.2, 2.3

**Ready for Frontend Integration (Epic 3 Story 3.4):**
- Endpoint matches frontend expectations from architecture.md
- Response structure optimized for WorkoutBuilder real-time preview
- Bottleneck warnings provide actionable feedback to users
- isSafe boolean enables simple UI state management

### File List

**Modified Files:**
- `backend/server.ts` (lines 1368-1534) - Fixed endpoint implementation to match all ACs

**Created Files:**
- `backend/__tests__/workoutForecast.test.ts` - Comprehensive unit test suite (20+ tests)

**Dependencies (Existing):**
- `backend/services/fatigueCalculator.js` (Story 1.1) ✅
- `backend/services/recoveryCalculator.js` (Story 1.2) ✅
- `backend/services/dataLoaders.js` ✅
- `backend/database/database.js` ✅
- `docs/logic-sandbox/exercises.json` ✅

## Change Log

- **2025-11-11**: Story 2.4 drafted - Workout Forecast Endpoint specification created
- **2025-11-11**: Implementation validated and fixed - Corrected critical bugs in existing endpoint, added comprehensive tests, all ACs satisfied
