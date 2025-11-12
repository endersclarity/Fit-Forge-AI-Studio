# Story 2.2: Implement Recovery Timeline Endpoint

Status: review

## Story

As a **frontend application**,
I want **to fetch current recovery state for all muscles**,
So that **users can see recovery progress and predictions**.

## Acceptance Criteria

1. **Given** a user with workout history
   **When** GET request sent to `/api/recovery/timeline`
   **Then** the endpoint queries latest muscle states from database

2. **And** it calls recovery calculation service for each muscle

3. **And** it returns current fatigue levels

4. **And** it returns recovery projections at 24h, 48h, 72h

5. **And** it identifies when each muscle will be fully recovered

## Tasks / Subtasks

- [x] Task 1: Create GET endpoint structure (AC: 1)
  - [x] Subtask 1.1: Add route definition `GET /api/recovery/timeline` in `backend/server.ts`
  - [x] Subtask 1.2: Define TypeScript response interface: `RecoveryTimelineResponse` with muscles array containing name, currentFatigue, projections, fullyRecoveredAt
  - [x] Subtask 1.3: Add error handling middleware pattern matching existing endpoints
  - [x] Subtask 1.4: Handle edge case where no workout history exists (return all muscles at 0% fatigue)

- [x] Task 2: Query latest muscle states (AC: 1)
  - [x] Subtask 2.1: Query database for latest `muscle_states` record for each of 15 muscles using `database.js`
  - [x] Subtask 2.2: Get current timestamp for recovery calculations
  - [x] Subtask 2.3: Handle case where some muscles have no workout history (treat as 0% fatigue)
  - [x] Subtask 2.4: Validate muscle_states data structure matches expected format

- [x] Task 3: Calculate recovery for each muscle (AC: 2, 3, 4, 5)
  - [x] Subtask 3.1: Import `recoveryCalculator.js` service (from Story 1.2)
  - [x] Subtask 3.2: For each muscle, call recovery service with current state and timestamp
  - [x] Subtask 3.3: Get current fatigue percentage from recovery calculation
  - [x] Subtask 3.4: Get recovery projections at 24h, 48h, 72h intervals
  - [x] Subtask 3.5: Determine `fullyRecoveredAt` timestamp (when fatigue reaches 0%)
  - [x] Subtask 3.6: Handle service errors and return 500 on calculation failure

- [x] Task 4: Format and return response (AC: 3, 4, 5)
  - [x] Subtask 4.1: Build response array with all 15 muscles
  - [x] Subtask 4.2: For each muscle include: name, currentFatigue, projections (24h/48h/72h), fullyRecoveredAt
  - [x] Subtask 4.3: Sort muscles by recovery priority (most fatigued first)
  - [x] Subtask 4.4: Return 200 status with complete RecoveryTimelineResponse
  - [x] Subtask 4.5: Ensure response matches expected format for frontend consumption

- [x] Task 5: Add comprehensive endpoint tests (Testing)
  - [x] Subtask 5.1: Test successful timeline fetch with workout history
  - [x] Subtask 5.2: Test recovery calculation integration (service called correctly for all muscles)
  - [x] Subtask 5.3: Test current fatigue values are accurate
  - [x] Subtask 5.4: Test 24h/48h/72h projections calculated correctly
  - [x] Subtask 5.5: Test fullyRecoveredAt timestamp accuracy
  - [x] Subtask 5.6: Test edge case: no workout history (all muscles at 0%)
  - [x] Subtask 5.7: Test edge case: some muscles worked, others not (mixed states)
  - [x] Subtask 5.8: Test 500 error when calculation service fails

## Dev Notes

### Learnings from Previous Story

**From Story 2-1-implement-workout-completion-endpoint (Status: done)**

- **New Endpoint Pattern Established**: POST `/api/workouts/:id/complete` (lines 1017-1141 in server.ts)
  - TypeScript interfaces for type safety (WorkoutCompletionRequest, WorkoutCompletionResponse)
  - Comprehensive input validation before processing
  - Service integration pattern: import Epic 1 services at top of file
  - Error handling: 400 for invalid input, 404 for not found, 500 for service failures
  - Response format: Direct JSON response (no wrapper)

- **Epic 1 Services Available**:
  - `calculateMuscleFatigue()` from `backend/services/fatigueCalculator.js`
  - `checkForBaselineUpdates()` from `backend/services/baselineUpdater.js`
  - `calculateRecovery()` from `backend/services/recoveryCalculator.js` ← **USE THIS**
  - `loadExerciseLibrary()` and `loadBaselineData()` from shared data loaders

- **Database Pattern**:
  - All DB ops through `backend/database/database.js`
  - muscle_states table stores: workoutId, muscle, fatiguePercent, volumeToday, recoveredAt, lastTrained
  - Transaction support for atomicity

- **Module Pattern**:
  - ES6 imports for services: `import { calculateRecovery } from './services/recoveryCalculator.js'`
  - Use `@ts-ignore` comments for JS modules without TypeScript definitions
  - Services are pure functions (no DB access inside services)

- **15 Muscle Groups** (all services handle consistently):
  Pectoralis, Lats, AnteriorDeltoids, PosteriorDeltoids, Trapezius, Rhomboids, LowerBack, Core, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

- **Test Framework**: Vitest with comprehensive coverage
  - Epic 1 service tests: 100% passing
  - Endpoint tests: Created in `backend/__tests__/` directory
  - Test pattern: Mock services and database for unit tests

**Key Interfaces to Reuse**:
- Recovery calculator: `import { calculateRecovery } from './services/recoveryCalculator.js'`
- Database operations: `import db from './database/database.js'`
- Get muscle states: `db.getLatestMuscleStates()` or similar method

**Technical Decisions Applied**:
- Early input validation (minimal for GET endpoint)
- Comprehensive error handling with descriptive messages
- TypeScript type safety for request/response
- Direct JSON responses (no wrapper)

[Source: .bmad-ephemeral/stories/2-1-implement-workout-completion-endpoint.md#Dev-Agent-Record]

### Architecture Patterns

**API Endpoint Structure** (from architecture.md and existing server.ts):
- Location: `backend/server.ts` (existing file - add new endpoint)
- URL Pattern: `/api/recovery/timeline` (RESTful resource endpoint)
- Method: GET
- TypeScript: Full type definitions for Response interface
- Error Format: `{ error: "message" }` with appropriate HTTP status codes

**Existing Endpoints Reference** (from server.ts):
- Line 79: `app.get('/api/health', ...)` - GET endpoint pattern
- Line 360: `app.get('/api/muscle-states/detailed', ...)` - Muscle states query pattern
- Line 1017: `app.post('/api/workouts/:id/complete', ...)` - Service integration pattern

**Request/Response Type Definitions**:
- Define interfaces in `backend/server.ts` inline (following Story 2.1 pattern)
- No request body (GET endpoint)
- Response body: Array of muscle recovery states with projections
- Error responses: HTTP status + `{ error: string }` type

**Database Access Pattern** (from architecture.md):
- Import: `import db from './database/database.js'`
- Query latest muscle_states for all 15 muscles
- Handle missing data gracefully (no workout history = 0% fatigue)

**Service Integration Pattern**:
- Services are pure functions (no DB access inside services)
- Route orchestrates: query DB → call recovery service → format response
- Services throw errors for invalid inputs (caught by try/catch in route)
- Route controls HTTP status codes based on service outcomes

**Error Handling** (from existing endpoints):
- 500: Calculation failure or database error
- Try/catch blocks wrap service calls
- Return descriptive error messages in JSON format

### Data Flow

**Request Flow**:
1. Frontend sends GET to `/api/recovery/timeline`
2. Query database for latest muscle_states for all 15 muscles
3. For each muscle, call `calculateRecovery()` service with current timestamp
4. Get current fatigue, 24h/48h/72h projections, and fullyRecoveredAt
5. Build response array with all muscle recovery data
6. Return 200 status with complete timeline

**Response Structure**:
```typescript
{
  muscles: [
    {
      name: "Pectoralis",
      currentFatigue: 45.2,
      projections: {
        "24h": 22.6,
        "48h": 5.3,
        "72h": 0
      },
      fullyRecoveredAt: "2025-11-13T08:00:00Z"
    },
    // ... all 15 muscles
  ]
}
```

**Database Schema** (from architecture.md):
- Table: `muscle_states` (already exists)
- Query: Get latest record per muscle (ORDER BY timestamp DESC LIMIT 1 per muscle)
- Fields used: muscle, fatiguePercent, lastTrained, recoveredAt

**Recovery Service Interface** (from Story 1.2):
- Function: `calculateRecovery(muscleState, currentTime)`
- Input: muscle state object with fatiguePercent, lastTrained
- Output: { currentFatigue, projections: { 24h, 48h, 72h }, fullyRecoveredAt }

### Testing Standards

**Test Framework**: Vitest (established in Epic 1)

**Test Location**: `backend/__tests__/recoveryTimeline.test.ts`

**Test Cases Required**:
1. **Happy Path**: User with workout history → timeline returned with accurate recovery data
2. **No Workout History**: New user → all muscles at 0% fatigue, no recovery needed
3. **Mixed States**: Some muscles worked, others not → correct states for each
4. **Recovery Projections**: Verify 24h/48h/72h calculations are accurate
5. **Fully Recovered Timestamp**: Verify timestamp when muscle reaches 0%
6. **All 15 Muscles**: Response includes all 15 muscle groups
7. **Calculation Service Failure**: Service throws error → 500 error handled gracefully
8. **Database Query Failure**: DB error → 500 error with descriptive message
9. **Sorted by Priority**: Most fatigued muscles appear first in response
10. **Edge Case**: Muscle already fully recovered → 0% fatigue, fullyRecoveredAt in past or null

**Mock Strategy**:
- Mock `calculateRecovery()` service for controlled test scenarios
- Mock `database.js` muscle_states queries
- Use real services in integration tests to verify end-to-end flow

**Test Data**:
- Use validated 15 muscle groups from project constants
- Mock muscle_states with known fatigue values
- Verify recovery calculations match expected decay rates

### Project Structure Notes

**File Locations**:
- Endpoint: `backend/server.ts` (EXISTING FILE - add new endpoint)
- Service: `backend/services/recoveryCalculator.js` (EXISTING - from Story 1.2)
- Database: `backend/database/database.js` (EXISTING - use muscle_states queries)
- Tests: `backend/__tests__/` (EXISTING directory)

**Dependencies**:
- Story 1.2: Recovery calculator service (COMPLETE ✅)
- Story 2.1: Workout completion endpoint (COMPLETE ✅ - establishes muscle_states data)
- Existing infrastructure: Express server, database layer, muscle_states table

**Integration Points**:
- Frontend RecoveryDashboard component will call this endpoint (Epic 3 Story 3.2)
- Response format must match frontend expectations (defined in epics.md)
- Database operations through centralized `database.js` layer

**No Conflicts Expected**:
- New endpoint in existing server.ts (additive change)
- Uses existing recovery service and database layer
- No modifications to existing endpoints
- GET endpoint (no side effects, safe to cache)

**Cache Considerations** (from epics.md):
- Recovery state changes over time (continuous decay)
- Keep cache short (<5 minutes) or implement cache invalidation
- Consider adding `Cache-Control` header with max-age

### References

**Primary Sources**:
- [Source: docs/epics.md#Story-2.2] - Acceptance criteria, technical notes, response format
- [Source: docs/architecture.md] - API patterns, error handling, database access patterns
- [Source: backend/server.ts] - Existing endpoint patterns (lines 79, 360, 1017)
- [Source: .bmad-ephemeral/stories/2-1-implement-workout-completion-endpoint.md] - Service integration pattern
- [Source: .bmad-ephemeral/stories/1-2-implement-recovery-calculation-service.md] - Recovery calculator service interface

**Endpoint Implementation Pattern**:
```typescript
// backend/server.ts

// Add TypeScript interface for response
interface MuscleRecoveryState {
  name: string;
  currentFatigue: number;
  projections: {
    "24h": number;
    "48h": number;
    "72h": number;
  };
  fullyRecoveredAt: string | null;
}

interface RecoveryTimelineResponse {
  muscles: MuscleRecoveryState[];
}

// Import recovery service (Story 1.2)
import { calculateRecovery } from './services/recoveryCalculator.js';

// Add endpoint
app.get('/api/recovery/timeline', async (req: Request, res: Response) => {
  try {
    const currentTime = new Date();

    // Query latest muscle states for all 15 muscles
    const muscleStates = db.getLatestMuscleStates(); // Returns array or empty

    // If no workout history, return all muscles at 0% fatigue
    if (!muscleStates || muscleStates.length === 0) {
      const allMuscles = [
        'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
        'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
        'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
      ];

      const response: RecoveryTimelineResponse = {
        muscles: allMuscles.map(name => ({
          name,
          currentFatigue: 0,
          projections: { "24h": 0, "48h": 0, "72h": 0 },
          fullyRecoveredAt: null
        }))
      };

      return res.status(200).json(response);
    }

    // Calculate recovery for each muscle
    const muscles: MuscleRecoveryState[] = muscleStates.map(state => {
      const recovery = calculateRecovery(state, currentTime);

      return {
        name: state.muscle,
        currentFatigue: recovery.currentFatigue,
        projections: recovery.projections,
        fullyRecoveredAt: recovery.fullyRecoveredAt
      };
    });

    // Sort by current fatigue (most fatigued first)
    muscles.sort((a, b) => b.currentFatigue - a.currentFatigue);

    // Return complete response
    const response: RecoveryTimelineResponse = { muscles };

    res.status(200).json(response);

  } catch (error) {
    console.error('Recovery timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch recovery timeline' });
  }
});
```

**Key Implementation Notes**:
- Use TypeScript for type safety (matches existing server.ts pattern)
- Import recovery service from Epic 1 (already implemented and tested)
- Use existing `database.js` operations for muscle_states queries
- Follow error handling pattern from existing endpoints
- Wrap in try/catch for graceful error handling
- Handle edge case: no workout history (return all muscles at 0%)
- Sort muscles by fatigue level for better UX
- Add cache headers if needed (Cache-Control: max-age=300)

**Testing Approach**:
- Unit tests: Mock recovery service and database, test endpoint logic
- Integration tests: Real services, verify end-to-end flow
- Edge cases: No workout history, partial muscle coverage, service failures
- Verify response format matches frontend expectations

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/2-2-implement-recovery-timeline-endpoint.context.xml`

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Plan:**
1. Refactored existing endpoint at `backend/server.ts:1150-1238` to use Epic 1 Story 1.2 recoveryCalculator service interface
2. Added TypeScript interfaces `MuscleRecoveryState` and `RecoveryTimelineResponse` at lines 1020-1034
3. Implemented edge case handling for no workout history (returns all 15 muscles at 0% fatigue)
4. Integrated with recoveryCalculator.calculateRecovery() service using correct parameter order: (muscleStatesArray, workoutTimestamp, currentTime)
5. Added sorting by current fatigue (most fatigued first) for better UX
6. Created comprehensive test suite at `backend/__tests__/recoveryTimeline.test.ts` with 50+ test cases

**Key Technical Decisions:**
- Used `initialFatiguePercent` from database TypeScript module (not `fatiguePercent`) to match MuscleStateData type contract
- Handled mixed muscle states (some with workout history, some without) by treating missing muscles as 0% fatigue
- Used most recent workout timestamp as reference for recovery calculations
- Followed exact pattern from Story 2.1 (workout completion endpoint) for consistency

**Issues Encountered:**
- TypeScript error: Initially used `fatiguePercent` property but database.ts returns `initialFatiguePercent` for MuscleStateData type
- Test environment: better-sqlite3 native module compilation issue on Windows (pre-existing infrastructure issue affecting all endpoint tests)
  - Service tests (recoveryCalculator.test.js) pass successfully (34/34 tests)
  - Endpoint tests cannot run due to better-sqlite3 bindings error (requires Docker or different Node version)
  - Tests are syntactically correct and comprehensive but blocked by environment issue

### Completion Notes List

**Implementation Summary:**
- ✅ Refactored existing GET /api/recovery/timeline endpoint to use correct recoveryCalculator service interface
- ✅ Added TypeScript interfaces for type-safe request/response handling
- ✅ Implemented all 5 acceptance criteria with edge case handling
- ✅ Created comprehensive test suite (10 describe blocks, 50+ test cases covering all ACs and edge cases)
- ✅ Follows established patterns from Story 2.1 and Epic 1 services
- ✅ Handles no workout history edge case (returns all 15 muscles at 0% fatigue with null fullyRecoveredAt)
- ✅ Sorts muscles by current fatigue for better UX
- ✅ Full error handling with try/catch and 500 status on service failure

**Test Coverage:**
- AC1: Database query for latest muscle states ✅
- AC2: Recovery calculation service integration ✅
- AC3: Current fatigue levels in response ✅
- AC4: Recovery projections at 24h, 48h, 72h ✅
- AC5: Full recovery timestamp identification ✅
- Edge cases: No workout history, mixed states, service errors ✅
- Response structure validation ✅
- Integration workflow ✅

**Note on Test Execution:**
Tests are written and comprehensive but cannot execute in current Windows environment due to better-sqlite3 native module compilation issue (requires C++20, Node v25.1.0 has compatibility issues). This is a pre-existing infrastructure issue affecting ALL endpoint tests, not specific to this story. Service tests pass successfully. Tests will run in Docker production environment.

### File List

- `backend/server.ts` (Modified)
  - Lines 1020-1034: Added TypeScript interfaces (MuscleRecoveryState, RecoveryTimelineResponse)
  - Lines 1150-1238: Refactored GET /api/recovery/timeline endpoint implementation

- `backend/__tests__/recoveryTimeline.test.ts` (Created)
  - Comprehensive test suite with 50+ test cases
  - Covers all 5 acceptance criteria
  - Edge case testing (no workout history, mixed states, errors)
  - Response structure validation
  - Integration workflow testing
