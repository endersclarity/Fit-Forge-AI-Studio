# Epic Technical Specification: Muscle Intelligence Services

Date: 2025-11-11
Author: Kaelen
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 implements the core calculation layer that powers FitForge's muscle-aware training intelligence. This epic ports three validated algorithms from the logic-sandbox into production-ready backend services: fatigue calculation, recovery projection, and exercise recommendation scoring.

**Context**: FitForge is 80% complete with working infrastructure (database, REST API, React UI). The algorithms have been validated in `docs/logic-sandbox/` with test data proving accuracy. This epic integrates those algorithms into the existing Express backend, creating the intelligence layer that subsequent epics will expose through APIs and UI.

**Value Proposition**: Enables accurate muscle-specific fatigue tracking (15 muscle groups), recovery timeline projections (24h/48h/72h), intelligent exercise recommendations (5-factor scoring), and adaptive baseline learning—the core differentiators that make FitForge unique in the fitness app market.

## Objectives and Scope

### In Scope

**Service Implementations** (4 services in `backend/services/`):
- ✅ **Fatigue Calculator** (`fatigueCalculator.js`) - Calculate muscle volume and fatigue percentage
- ✅ **Recovery Calculator** (`recoveryCalculator.js`) - Project recovery state with linear model
- ✅ **Exercise Recommender** (`exerciseRecommender.js`) - 5-factor scoring algorithm
- ✅ **Baseline Updater** (`baselineUpdater.js`) - Detect baseline capacity exceeded

**Data Integration**:
- ✅ Port algorithms from logic-sandbox scripts (maintain formulas exactly)
- ✅ Load corrected exercise data from `logic-sandbox/exercises.json` (percentages sum to 100%)
- ✅ Query baseline data from existing `muscle_baselines` table
- ✅ Return structured data for API layer (Epic 2)

**Validation**:
- ✅ Unit tests for each service with logic-sandbox test data
- ✅ Verify calculations match sandbox validation results
- ✅ Error handling for invalid inputs (missing data, malformed workout)

### Out of Scope

**Not in This Epic** (deferred to Epic 2, 3, 4):
- ❌ API endpoint implementation (Epic 2)
- ❌ Frontend integration (Epic 3)
- ❌ Database schema changes (schema already complete)
- ❌ Advanced recovery models (HRV, sleep tracking - post-MVP)
- ❌ Adaptive baseline learning automation (post-MVP - Story 1.4 only detects, doesn't auto-update)

**Explicitly Excluded**:
- UI components (already exist, need wiring only)
- Authentication/authorization (post-MVP)
- Multi-user support (post-MVP)

## System Architecture Alignment

**Integration Points with Existing Architecture**:

1. **Database Layer** (`backend/database/database.js`):
   - Services will query using existing functions: `getMuscleBaselines()`, `getMuscleStates()`, `getWorkouts()`, `getLastWorkoutByCategory()`
   - Services will NOT directly modify database (read-only for Epic 1)
   - API layer (Epic 2) handles writes after service calculations

2. **Exercise Data Source** (CRITICAL):
   - **Source**: `docs/logic-sandbox/exercises.json` (48 exercises, corrected percentages)
   - **Why**: Existing `backend/constants.ts` and `shared/exercise-library.ts` have incorrect muscle percentages (sum >100%)
   - **ADR-005**: Services MUST load from logic-sandbox to ensure accurate calculations
   - **Format Conversion**: Logic-sandbox uses array format with `{muscle, percentage, primary}` objects. Services must transform to flat object map like `{ "Pectoralis": 65, "Triceps": 22 }` for calculation efficiency

3. **Module Pattern** (Consistency):
   - Services use CommonJS `module.exports` (matches `database.js` pattern)
   - Pure functions with validation (throw on invalid input)
   - No direct Express dependencies (testable in isolation)

4. **Error Propagation**:
   - Services throw descriptive errors
   - API routes (Epic 2) will catch and return HTTP status codes
   - Follows existing pattern in `backend/server.ts`

5. **File Structure**:
   - Create new folder: `backend/services/` (does not exist yet)
   - Follows standard Express layered architecture
   - Separates business logic from data access and routing

**Constraints from Architecture**:
- Maintain <500ms response times (existing baseline for API endpoints)
- Use synchronous SQLite operations (better-sqlite3 library)
- Keep formulas exactly as validated in logic-sandbox (no modifications)
- Follow camelCase naming convention for files and functions

## Detailed Design

### Services and Modules

| Service | File | Responsibilities | Inputs | Outputs | Owner |
|---------|------|------------------|--------|---------|-------|
| **Fatigue Calculator** | `backend/services/fatigueCalculator.js` | Calculate muscle volume and fatigue percentage for each muscle group | Workout data (exercises, sets, reps, weight), Exercise library, Baselines | `{ muscleStates: Array<{muscle, volume, fatigue, baseline}>, warnings: Array }` | Story 1.1 |
| **Recovery Calculator** | `backend/services/recoveryCalculator.js` | Calculate current recovery state and project future recovery | Muscle states with timestamps, Current time | `{ current: Object, projections: {24h, 48h, 72h}, readyMuscles: Array }` | Story 1.2 |
| **Exercise Recommender** | `backend/services/exerciseRecommender.js` | Score and rank exercises using 5-factor algorithm | Target muscle, Current fatigue states, Exercise library, User preferences, Filters | `{ recommendations: Array<{exercise, score, factors, warnings}> }` | Story 1.3 |
| **Baseline Updater** | `backend/services/baselineUpdater.js` | Detect when muscle volume exceeds baseline capacity | Calculated muscle volumes, Current baselines | `{ suggestions: Array<{muscle, currentBaseline, achievedVolume, exceedPercent}> }` | Story 1.4 |

**Service Initialization Pattern**:
```javascript
// All services follow this structure
const fs = require('fs');
const path = require('path');

// Load exercise data once at module load
const EXERCISE_LIBRARY = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'docs/logic-sandbox/exercises.json'), 'utf8')
);

function serviceFunction(inputs) {
  // Validate inputs
  if (!inputs.required) throw new Error("Required input missing");

  // Perform calculation
  const result = calculate(inputs);

  // Return structured output
  return result;
}

module.exports = { serviceFunction };
```

### Data Models and Contracts

**Input Models** (from existing database schema):

```javascript
// Workout (from database)
{
  id: number,
  user_id: number,
  created_at: string (ISO 8601),
  exercises: Array<{
    exercise_id: string,
    exercise_name: string,
    sets: Array<{
      reps: number,
      weight: number,
      to_failure: boolean,
      rpe?: number
    }>
  }>
}

// Exercise Library Entry (from logic-sandbox/exercises.json)
{
  id: string,
  name: string,
  equipment: string,
  primary: boolean,
  muscles: {
    "Pectoralis": number,      // percentage (0-100)
    "Latissimus Dorsi": number,
    "Deltoids (Anterior)": number,
    "Deltoids (Posterior)": number,
    "Trapezius": number,
    "Rhomboids": number,
    "Erector Spinae": number,
    "Obliques": number,
    "Rectus Abdominis": number,
    "Biceps": number,
    "Triceps": number,
    "Forearms": number,
    "Quadriceps": number,
    "Hamstrings": number,
    "Glutes": number,
    "Calves": number
  }
}

// Muscle Baseline (from database)
{
  muscle_name: string,
  baseline_volume: number,
  updated_at: string (ISO 8601)
}
```

**Output Models** (service return values):

```javascript
// Fatigue Calculation Output
{
  muscleStates: Array<{
    muscle: string,              // e.g., "Hamstrings"
    volume: number,              // total volume (reps × weight × engagement%)
    fatigue: number,             // percentage (0-100+)
    baseline: number,            // baseline capacity
    percentOfBaseline: number    // volume / baseline × 100
  }>,
  warnings: Array<{
    muscle: string,
    message: string,             // e.g., "Approaching baseline (94%)"
    severity: "info" | "warning" | "critical"
  }>,
  timestamp: string              // ISO 8601
}

// Recovery Calculation Output
{
  current: Object<string, number>,     // { "Hamstrings": 85.2, "Quadriceps": 14 }
  projections: {
    "24h": Object<string, number>,
    "48h": Object<string, number>,
    "72h": Object<string, number>
  },
  readyMuscles: Array<string>,         // muscles at 0% fatigue
  fullyRecoveredAt: Object<string, string>  // { "Hamstrings": "2025-11-13T10:30:00Z" }
}

// Exercise Recommendation Output
{
  recommendations: Array<{
    exerciseId: string,
    exerciseName: string,
    score: number,               // 0-100
    factors: {
      targetMatch: number,       // 0-40 (40% weight)
      freshness: number,         // 0-25 (25% weight)
      variety: number,           // 0-15 (15% weight)
      preference: number,        // 0-10 (10% weight)
      primaryBalance: number     // 0-10 (10% weight)
    },
    predictedFatigue: Object<string, number>,  // fatigue after exercise
    warnings: Array<string>,     // bottleneck risks
    safe: boolean                // no muscles >80% fatigued
  }>
}

// Baseline Update Suggestions Output
{
  suggestions: Array<{
    muscle: string,
    currentBaseline: number,
    achievedVolume: number,
    exceedPercent: number,       // (achieved - baseline) / baseline × 100
    workoutDate: string,         // ISO 8601
    workoutId: number
  }>
}
```

**Database Entities** (read-only for Epic 1):

- `muscle_baselines` - Stores learned capacity per muscle (15 rows)
- `muscle_states` - Time-series fatigue tracking (append-only)
- `workout_exercises` - Exercises in a workout session
- `exercise_sets` - Individual sets with weight/reps/RPE
- `workouts` - Workout session metadata

### APIs and Interfaces

**Service Function Signatures**:

```javascript
// fatigueCalculator.js
/**
 * Calculate muscle fatigue from workout data
 * @param {Object} workout - Workout with exercises and sets
 * @param {Array} exerciseLibrary - Exercise definitions with muscle engagement
 * @param {Object} baselines - Muscle baseline capacities { "Hamstrings": 2880, ... }
 * @returns {Object} Fatigue data with muscle states and warnings
 * @throws {Error} If workout, exerciseLibrary, or baselines are missing/invalid
 */
function calculateMuscleFatigue(workout, exerciseLibrary, baselines)

// recoveryCalculator.js
/**
 * Calculate recovery state and future projections
 * @param {Array} muscleStates - Current fatigue states with timestamps
 * @param {Date} currentTime - Time to calculate recovery for (default: now)
 * @returns {Object} Current fatigue and 24h/48h/72h projections
 * @throws {Error} If muscleStates is missing or invalid
 */
function calculateRecoveryTimeline(muscleStates, currentTime = new Date())

// exerciseRecommender.js
/**
 * Score and rank exercises based on multiple factors
 * @param {string} targetMuscle - Primary muscle to target (e.g., "Quadriceps")
 * @param {Object} currentFatigue - Current fatigue per muscle { "Hamstrings": 85.2 }
 * @param {Array} exerciseLibrary - Available exercises
 * @param {Object} options - Filters and preferences
 * @param {Array} options.equipmentAvailable - Equipment filter (optional)
 * @param {Array} options.recentExercises - Recently performed exercises (for variety)
 * @param {Object} options.userPreferences - User's favorite exercises (optional)
 * @returns {Object} Ranked recommendations with scores and warnings
 * @throws {Error} If targetMuscle or currentFatigue are missing
 */
function recommendExercises(targetMuscle, currentFatigue, exerciseLibrary, options = {})

// baselineUpdater.js
/**
 * Detect muscles that exceeded baseline capacity
 * @param {Array} muscleStates - Calculated volumes and fatigue
 * @param {Object} baselines - Current baseline capacities
 * @param {number} workoutId - Workout ID for reference
 * @returns {Object} Baseline update suggestions
 * @throws {Error} If muscleStates or baselines are missing
 */
function detectBaselineExceeded(muscleStates, baselines, workoutId)
```

**Error Handling Contract**:
- All services validate inputs and throw `Error` with descriptive messages
- Services do NOT catch their own errors (let caller handle)
- API routes (Epic 2) will catch and map to HTTP status codes
- Standard error messages: `"[ServiceName]: [specific problem]"`

### Workflows and Sequencing

**Story 1.1: Fatigue Calculation Flow**
```
1. Receive: workout object with exercises and sets
2. Load: Exercise library from logic-sandbox/exercises.json
3. Load: Baselines from database (via database.js)
4. For each exercise in workout:
   a. Look up muscle engagement percentages
   b. For each set:
      - Calculate set volume: reps × weight
      - Distribute to muscles: setVolume × muscleEngagement%
   c. Sum volumes per muscle across all sets
5. Calculate fatigue per muscle: (totalVolume / baseline) × 100
6. Generate warnings for muscles >80% fatigued
7. Return: muscleStates array with fatigue data
```

**Story 1.2: Recovery Calculation Flow**
```
1. Receive: muscle states with initial fatigue and timestamps
2. Receive: current time (or use Date.now())
3. For each muscle:
   a. Calculate hours elapsed: (currentTime - workoutTime) / 3600000
   b. Calculate recovery: (hoursElapsed / 24) × 15%
   c. Current fatigue: max(0, initialFatigue - recovery)
   d. Project 24h: max(0, currentFatigue - 15%)
   e. Project 48h: max(0, currentFatigue - 30%)
   f. Project 72h: max(0, currentFatigue - 45%)
   g. Calculate fully recovered time: currentTime + (currentFatigue / 15% × 24h)
4. Identify ready muscles (fatigue = 0%)
5. Return: current state, projections, ready list
```

**Story 1.3: Exercise Recommendation Flow**
```
1. Receive: target muscle, current fatigue states, exercise library, options
2. Filter exercises by equipment availability (if specified)
3. For each exercise:
   a. Factor 1 (40%): Target muscle engagement score
      - Primary muscle match: 40 points if target is primary
      - Secondary match: 20 points if target is secondary
   b. Factor 2 (25%): Muscle freshness score
      - Average freshness of all engaged muscles (100 - fatigue%)
   c. Factor 3 (15%): Variety score
      - 15 points if NOT in recent exercises list
      - 0 points if performed recently
   d. Factor 4 (10%): User preference score
      - 10 points if in user's favorites
   e. Factor 5 (10%): Primary/secondary balance
      - 10 points if target muscle is primary in exercise
   f. Total score: sum of all factors (0-100)
4. Check bottleneck risks:
   - If any supporting muscle >80% fatigued: add warning
   - Mark exercise as unsafe if bottleneck detected
5. Sort by score descending
6. Return: top 15 exercises with scores and warnings
```

**Story 1.4: Baseline Detection Flow**
```
1. Receive: muscle states with calculated volumes, current baselines, workout ID
2. For each muscle state:
   a. Compare: achievedVolume vs currentBaseline
   b. If achievedVolume > currentBaseline:
      - Calculate exceed percent: (achieved - baseline) / baseline × 100
      - Create suggestion object with all details
3. Return: array of suggestions (empty if none exceeded)
```

**Service Interaction Sequence** (within Epic 1):
```
Story 1.1 (Fatigue) → Standalone, no dependencies
Story 1.2 (Recovery) → Uses output format from Story 1.1
Story 1.3 (Recommender) → Uses recovery output from Story 1.2
Story 1.4 (Baseline) → Uses fatigue output from Story 1.1
```

**Cross-Epic Integration** (Epic 2 will orchestrate):
```
API Endpoint (Epic 2) →
  Call fatigueCalculator (Story 1.1) →
  Call baselineUpdater (Story 1.4) →
  Write to database →
  Return combined response
```

## Non-Functional Requirements

### Performance

**Target Response Times**:
- Fatigue calculation: <100ms for typical workout (5-10 exercises, 15-30 sets)
- Recovery calculation: <50ms (simple linear model, 15 muscles)
- Exercise recommendation: <200ms (scoring 48 exercises)
- Baseline detection: <20ms (simple comparison logic)
- **Overall Epic 1 budget**: <500ms (maintains existing API baseline)

**Complexity Analysis**:
- Fatigue Calculator: O(n × m) where n = sets, m = muscles (typically 30 × 15 = 450 operations)
- Recovery Calculator: O(m) where m = muscles (15 operations)
- Exercise Recommender: O(e × m) where e = exercises, m = muscles (48 × 15 = 720 operations)
- Baseline Updater: O(m) where m = muscles (15 operations)

**Optimization Strategies**:
- Load exercise library once at module initialization (not per request)
- Use synchronous SQLite operations (better-sqlite3 is faster than async for small datasets)
- Pre-compute muscle lists (avoid dynamic lookups in tight loops)
- Limit recommendation output to top 15 exercises (avoid sorting full list)

**Performance Validation**:
- Unit tests must complete in <1 second total
- Use logic-sandbox test data (Legs Day A workout) as performance baseline
- Profile with Node.js built-in profiler if services exceed targets

**Scalability Notes**:
- Services are stateless and CPU-bound (no I/O bottlenecks)
- Calculations scale linearly with workout size
- 48-exercise library is fixed size (no growth concerns for MVP)
- Database queries limited to baseline lookups (indexed, <10ms)

### Security

**Input Validation** (CRITICAL):
- Validate all numeric inputs: reps > 0, weight > 0, fatigue 0-100
- Reject malformed workout objects (missing required fields)
- Sanitize exercise IDs (prevent injection via object keys)
- Validate baseline values are positive numbers
- Throw descriptive errors for validation failures

**Data Handling**:
- Services read-only for Epic 1 (no writes = no data corruption risk)
- Exercise data loaded from filesystem (trusted source, not user input)
- No user authentication in services (handled at API layer in Epic 2)
- No sensitive data stored (workout data is non-PII for MVP)

**Error Messages**:
- Do NOT expose internal implementation details in errors
- Generic messages for invalid input: "Invalid workout data"
- Specific messages for debugging (logged, not returned): "Baseline missing for muscle: Hamstrings"
- No stack traces in production (Epic 2 handles error sanitization)

**Dependency Security**:
- Use Node.js built-in modules only (fs, path)
- No external npm packages in services (zero attack surface)
- Exercise data validated during development (percentages sum to 100%)
- Database access through existing `database.js` (centralized security)

**Post-MVP Security** (out of scope for Epic 1):
- Input sanitization middleware (express-validator)
- Rate limiting on API endpoints
- User authentication (bcrypt + JWT)
- HTTPS enforcement

### Reliability/Availability

**Error Handling Strategy**:
- All services validate inputs and throw on invalid data
- Services throw descriptive `Error` objects (not strings)
- No silent failures (all errors propagate to caller)
- Caller (API routes in Epic 2) decides HTTP status codes

**Graceful Degradation**:
- Missing baseline: Throw error (no fallback - baselines must be present in database)
- Missing exercise data: Skip exercise with warning
- Malformed workout: Reject entire request (don't process partial data)
- Recovery calculation: If no workout history, return all muscles at 0% fatigue

**Data Integrity**:
- Services do NOT modify database (read-only eliminates corruption risk)
- Return immutable data structures (plain objects, not classes)
- Validate calculations against logic-sandbox expected results
- Unit tests verify output format consistency

**Failure Modes**:
- Exercise library file missing: Service initialization fails (fail-fast at startup)
- Invalid workout data: Throw error immediately (don't attempt calculation)
- Baseline lookup failure: Throw error immediately (no fallback)
- Calculation overflow: JavaScript handles large numbers gracefully (no overflow risk)

**Monitoring Hooks** (for Epic 2):
- Services throw errors with specific prefixes: `[FatigueCalculator]`, `[RecoveryCalculator]`
- Warnings array in output (client can log/display)
- Timestamps in all outputs (correlate with API logs)
- No logging within services (keep pure, let caller log)

### Observability

**Logging Strategy** (for Epic 2 integration):
- Services do NOT log directly (no console.log/console.error)
- Caller (API routes) logs service inputs and outputs
- Error messages include context: service name, operation, specific issue
- Warnings in output provide user-facing diagnostics

**Diagnostic Information**:
- All outputs include timestamps (ISO 8601 format)
- Fatigue output includes warnings array (high fatigue, approaching baseline)
- Recommendation output includes factor breakdown (transparency for debugging)
- Baseline suggestions include exceed percentage (quantify how much exceeded)

**Testing Observability**:
- Unit tests log expected vs actual values on failure
- Test names describe scenario: `"calculates fatigue for Legs Day A workout"`
- Assert on specific output fields (not just truthy checks)
- Use logic-sandbox data as ground truth

**Metrics to Track** (Epic 2 implementation):
- Service call duration (per function)
- Error rate by service (% of calls that throw)
- Warning frequency (which muscles trigger warnings most)
- Recommendation score distribution (validate scoring algorithm)

**Debug Mode** (future enhancement):
- Optional verbose output with intermediate calculations
- Trace which exercises contributed to each muscle's fatigue
- Log scoring factors for each recommendation
- Not implemented in Epic 1 (YAGNI principle)

## Dependencies and Integrations

**Node.js Runtime Dependencies**:
- **Node.js**: v18+ (LTS) - Required for modern JavaScript features
- **Built-in Modules**:
  - `fs` - File system operations (load exercise library JSON)
  - `path` - Path resolution (construct relative paths to logic-sandbox)
  - No external npm packages required in services

**Backend Package Dependencies** (from `backend/package.json`):
- **better-sqlite3**: ^9.2.2 - SQLite database access (via `database.js`)
- **express**: ^4.18.2 - HTTP server (Epic 2 will integrate services)
- **typescript**: ^5.3.3 - Type definitions (devDependency)
- **ts-node**: ^10.9.2 - Development server (devDependency)

**Data Dependencies**:
- **Exercise Library**: `docs/logic-sandbox/exercises.json` (48 exercises, 16 muscle groups)
  - Version: Corrected percentages (all sum to 100%)
  - Format: JSON with `id`, `name`, `equipment`, `primary`, `muscles` object
  - **CRITICAL**: Must use this file, not `backend/constants.ts` or `shared/exercise-library.ts`
- **Baseline Data**: `muscle_baselines` table in SQLite database
  - Accessed via `database.js` functions
  - 15 muscle groups with baseline volumes
- **Muscle States**: `muscle_states` table (for recovery calculations)
  - Time-series data with fatigue percentages and timestamps

**External Integration Points**:

1. **Database Layer** (`backend/database/database.js`):
   - Services call existing CRUD functions:
     - `getMuscleBaselines()` - Returns all baseline capacities as object map
     - `getMuscleStates()` - Returns current fatigue states as object map
     - `getWorkouts()` - Returns all workouts with exercises and sets
     - `getLastWorkoutByCategory(category)` - Returns most recent workout for category
   - Services do NOT call write functions (read-only for Epic 1)

2. **Logic-Sandbox Scripts** (source algorithms):
   - `docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs` → Port to `fatigueCalculator.js`
   - `docs/logic-sandbox/scripts/calculate-recovery.mjs` → Port to `recoveryCalculator.js`
   - Maintain formulas exactly as validated

3. **Future API Integration** (Epic 2):
   - Services will be imported into `backend/server.ts`
   - API routes will call service functions and handle responses
   - No changes to service signatures required

**Version Constraints**:
- Node.js: >=18.0.0 (for modern ES modules support)
- better-sqlite3: ^9.2.2 (synchronous API, no breaking changes expected)
- Exercise library: Static file (no versioning concerns)
- Database schema: v1.0 (stable, no migrations planned for MVP)

**Build Dependencies** (Epic 1 only):
- TypeScript compiler not required (services use plain JavaScript)
- No build step for services (loaded directly by Node.js)
- Tests will use Node.js test runner or Jest (TBD in implementation)

**Development Tools**:
- `nodemon`: Auto-restart backend on file changes (existing in `backend/package.json`)
- `ts-node`: TypeScript execution for `server.ts` (existing)
- Unit test framework: TBD (Jest or Node.js built-in test runner)

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria** (all stories must meet these):

1. **AC-E1.1**: All 4 services created in `backend/services/` folder
   - Files exist: `fatigueCalculator.js`, `recoveryCalculator.js`, `exerciseRecommender.js`, `baselineUpdater.js`
   - All services use CommonJS `module.exports` pattern
   - All services load exercise data from `logic-sandbox/exercises.json`

2. **AC-E1.2**: All services validate inputs and throw descriptive errors
   - Invalid workout data: Throws error with message
   - Missing baselines: Throws error or uses fallback
   - Malformed exercise data: Throws error with exercise ID

3. **AC-E1.3**: All calculation formulas match logic-sandbox validation
   - Fatigue calculation matches `calculate-workout-fatigue.mjs` results
   - Recovery calculation matches `calculate-recovery.mjs` results
   - No deviations from validated algorithms

4. **AC-E1.4**: All services return structured output with timestamps
   - Fatigue: Returns `{ muscleStates, warnings, timestamp }`
   - Recovery: Returns `{ current, projections, readyMuscles, fullyRecoveredAt }`
   - Recommender: Returns `{ recommendations }` with scores and factors
   - Baseline: Returns `{ suggestions }` with exceed percentages

5. **AC-E1.5**: Unit tests exist for all services with logic-sandbox test data
   - Each service has at least 3 test cases (happy path, edge cases, errors)
   - Tests use Legs Day A workout from logic-sandbox as reference
   - All tests pass with validated expected results

**Story-Level Acceptance Criteria**:

### Story 1.1: Fatigue Calculator

**AC-1.1.1**: Calculate muscle volume correctly
- **Given** a workout with 3 sets of Bulgarian Split Squats (40kg, 20 reps each)
- **When** fatigue calculator processes the workout
- **Then** Hamstrings volume = 20 × 40 × 0.65 × 3 = 1560 (correct formula)
- **And** All 15 muscle groups have calculated volumes

**AC-1.1.2**: Calculate fatigue percentage correctly
- **Given** Hamstrings volume = 3258, baseline = 2880
- **When** fatigue percentage is calculated
- **Then** Fatigue = (3258 / 2880) × 100 = 113.1% (exceeds baseline)

**AC-1.1.3**: Generate warnings for high fatigue
- **Given** Hamstrings fatigue = 94%
- **When** fatigue exceeds 80%
- **Then** Warning added: `{ muscle: "Hamstrings", message: "Approaching baseline (94%)", severity: "warning" }`

**AC-1.1.4**: Load exercise data from logic-sandbox
- **Given** service initializes
- **When** EXERCISE_LIBRARY is loaded
- **Then** 48 exercises loaded from `docs/logic-sandbox/exercises.json`
- **And** All muscle percentages sum to 100% (validated data)

### Story 1.2: Recovery Calculator

**AC-1.2.1**: Calculate current recovery state
- **Given** Hamstrings fatigue = 85.2% at 2025-11-10T10:00:00Z
- **When** current time = 2025-11-11T10:00:00Z (24h later)
- **Then** Current fatigue = max(0, 85.2 - 15) = 70.2%

**AC-1.2.2**: Project recovery at 24h/48h/72h intervals
- **Given** Current fatigue = 70.2%
- **When** projections are calculated
- **Then** 24h = max(0, 70.2 - 15) = 55.2%
- **And** 48h = max(0, 70.2 - 30) = 40.2%
- **And** 72h = max(0, 70.2 - 45) = 25.2%

**AC-1.2.3**: Calculate fully recovered time
- **Given** Current fatigue = 70.2%, recovery rate = 15% per 24h
- **When** fully recovered time is calculated
- **Then** Days to recover = 70.2 / 15 = 4.68 days
- **And** Recovered at = currentTime + 4.68 days

**AC-1.2.4**: Identify ready muscles
- **Given** Quadriceps fatigue = 0%, Hamstrings fatigue = 70.2%
- **When** ready muscles are identified
- **Then** readyMuscles = ["Quadriceps"] (only muscles at 0%)

### Story 1.3: Exercise Recommender

**AC-1.3.1**: Score exercises using 5-factor algorithm
- **Given** Target muscle = "Quadriceps", current fatigue states
- **When** exercises are scored
- **Then** Each exercise has score with factor breakdown
- **And** Total score = targetMatch + freshness + variety + preference + primaryBalance

**AC-1.3.2**: Rank exercises by score descending
- **Given** 48 exercises with calculated scores
- **When** recommendations are generated
- **Then** Top 15 exercises returned sorted by score (highest first)

**AC-1.3.3**: Detect bottleneck risks
- **Given** Bulgarian Split Squats engage Lower Back (secondary)
- **When** Lower Back fatigue = 94% (>80%)
- **Then** Warning added: "Lower Back is highly fatigued (94%)"
- **And** Exercise marked as `safe: false`

**AC-1.3.4**: Filter by equipment availability
- **Given** Available equipment = ["Dumbbells", "Kettlebell"]
- **When** recommendations are generated
- **Then** Only exercises requiring Dumbbells or Kettlebell are included

### Story 1.4: Baseline Updater

**AC-1.4.1**: Detect muscles exceeding baseline
- **Given** Hamstrings volume = 3258, baseline = 2880
- **When** baseline updater is called
- **Then** Suggestion created: `{ muscle: "Hamstrings", currentBaseline: 2880, achievedVolume: 3258 }`

**AC-1.4.2**: Calculate exceed percentage
- **Given** Achieved = 3258, baseline = 2880
- **When** exceed percentage is calculated
- **Then** exceedPercent = ((3258 - 2880) / 2880) × 100 = 13.1%

**AC-1.4.3**: Return empty array if no muscles exceeded
- **Given** All muscle volumes < baselines
- **When** baseline updater is called
- **Then** suggestions = [] (empty array)

**AC-1.4.4**: Include workout context in suggestions
- **Given** Workout ID = 123, date = 2025-11-10T10:00:00Z
- **When** suggestion is created
- **Then** Suggestion includes `workoutId: 123` and `workoutDate: "2025-11-10T10:00:00Z"`

## Traceability Mapping

| Acceptance Criteria | Tech Spec Section | Component/Function | Test Idea |
|---------------------|-------------------|-------------------|-----------|
| **AC-E1.1**: Services created | Services and Modules | `backend/services/` folder | Verify files exist with correct names |
| **AC-E1.2**: Input validation | APIs and Interfaces, Security | All service functions | Test with invalid inputs, assert error thrown |
| **AC-E1.3**: Formula accuracy | Workflows and Sequencing | Calculation logic | Compare results with logic-sandbox outputs |
| **AC-E1.4**: Structured output | Data Models and Contracts | Return values | Assert output structure matches models |
| **AC-E1.5**: Unit tests exist | Test Strategy Summary | Test files | Verify test coverage for all services |
| **AC-1.1.1**: Volume calculation | Story 1.1 Fatigue Flow | `calculateMuscleFatigue()` | Test with Bulgarian Split Squats, verify volume |
| **AC-1.1.2**: Fatigue percentage | Story 1.1 Fatigue Flow | `calculateMuscleFatigue()` | Test with known baseline, verify percentage |
| **AC-1.1.3**: High fatigue warnings | Story 1.1 Fatigue Flow | `calculateMuscleFatigue()` | Test with 94% fatigue, assert warning exists |
| **AC-1.1.4**: Load exercise library | Services and Modules | Module initialization | Test exercise count = 48, percentages sum to 100% |
| **AC-1.2.1**: Current recovery | Story 1.2 Recovery Flow | `calculateRecoveryTimeline()` | Test 24h elapsed, verify 15% recovery applied |
| **AC-1.2.2**: Recovery projections | Story 1.2 Recovery Flow | `calculateRecoveryTimeline()` | Test projections match linear model |
| **AC-1.2.3**: Fully recovered time | Story 1.2 Recovery Flow | `calculateRecoveryTimeline()` | Test calculation matches formula |
| **AC-1.2.4**: Ready muscles | Story 1.2 Recovery Flow | `calculateRecoveryTimeline()` | Test only 0% fatigue muscles included |
| **AC-1.3.1**: 5-factor scoring | Story 1.3 Recommendation Flow | `recommendExercises()` | Test score breakdown sums correctly |
| **AC-1.3.2**: Rank by score | Story 1.3 Recommendation Flow | `recommendExercises()` | Test top 15 returned in descending order |
| **AC-1.3.3**: Bottleneck detection | Story 1.3 Recommendation Flow | `recommendExercises()` | Test with >80% muscle fatigue, verify warning |
| **AC-1.3.4**: Equipment filter | Story 1.3 Recommendation Flow | `recommendExercises()` | Test only specified equipment exercises returned |
| **AC-1.4.1**: Detect exceeded | Story 1.4 Baseline Flow | `detectBaselineExceeded()` | Test volume > baseline, verify suggestion created |
| **AC-1.4.2**: Exceed percentage | Story 1.4 Baseline Flow | `detectBaselineExceeded()` | Test calculation matches formula |
| **AC-1.4.3**: Empty array | Story 1.4 Baseline Flow | `detectBaselineExceeded()` | Test all volumes < baseline, verify empty array |
| **AC-1.4.4**: Workout context | Story 1.4 Baseline Flow | `detectBaselineExceeded()` | Test suggestion includes workoutId and date |

## Risks, Assumptions, Open Questions

### Risks

**Risk 1: Exercise Data Format Mismatch** (Medium)
- **Description**: Logic-sandbox JSON format may differ from database expectations
- **Impact**: Service initialization failures or incorrect calculations
- **Mitigation**: Write data adapter layer to normalize formats during initialization
- **Owner**: Story 1.1

**Risk 2: Database Function Signatures Unknown** (Low)
- **Description**: Assumed `database.js` has functions like `getMuscleBaselines()` but not verified
- **Impact**: May need to write custom queries or adapter functions
- **Mitigation**: Inspect `database.js` during implementation, add wrapper functions if needed
- **Owner**: Story 1.1

**Risk 3: Performance Degradation with Large Workouts** (Low)
- **Description**: Calculations may exceed 500ms target for very large workouts (50+ sets)
- **Impact**: User experience degradation on edge cases
- **Mitigation**: Profile with large test data, optimize hotspots if needed
- **Owner**: Story 1.1, 1.3

**Risk 4: Floating Point Precision** (Low)
- **Description**: JavaScript floating point math may cause rounding errors in calculations
- **Impact**: Fatigue percentages may differ slightly from logic-sandbox (e.g., 85.199999%)
- **Mitigation**: Round display values to 1 decimal place using `Math.round(value * 10) / 10`. Test tolerance: ±0.1 absolute percentage points (e.g., 85.2% vs 85.3% is acceptable). NOT percent-of-percent (e.g., NOT "0.1% of 85% = 0.085%")
- **Owner**: All stories

### Assumptions

**Assumption 1: Logic-Sandbox Algorithms Are Correct**
- Assumes validation in logic-sandbox is comprehensive and accurate
- If false: Would need to re-validate formulas with biomechanics research
- Validation: Unit tests will compare service output with sandbox expected results

**Assumption 2: 15% Daily Recovery Rate Is Adequate for MVP**
- Assumes linear recovery model is "good enough" for initial release
- If false: Would need to implement more complex recovery curves (HRV, sleep)
- Validation: User feedback post-MVP, compare with actual recovery observations

**Assumption 3: Database Schema Is Stable**
- Assumes no schema changes needed for Epic 1
- If false: Would need migration scripts and updated queries
- Validation: Review `backend/database/schema.sql` during Story 1.1

**Assumption 4: 48 Exercises Cover User Needs**
- Assumes exercise library is comprehensive enough for MVP
- If false: Would need to add more exercises to JSON file
- Validation: User feedback, track "exercise not found" complaints

**Assumption 5: Services Don't Need Authentication**
- Assumes API layer (Epic 2) handles all auth concerns
- If false: Would need to add user context to service function signatures
- Validation: Review security requirements during Epic 2 planning

### Open Questions

**Q1: Should services accept `database.js` instance as dependency injection?**
- **Current Approach**: Services directly require and call `database.js`
- **Alternative**: Pass database instance to service functions (better testability)
- **Decision Needed By**: Story 1.1 start
- **Impact**: Affects service initialization pattern and test strategy

**Q2: What test framework should we use?**
- **Options**: Jest (most popular), Vitest (Vite ecosystem), Node.js built-in test runner
- **Consideration**: Project already uses Vitest for frontend (`package.json`)
- **Recommendation**: Use Vitest for consistency, supports TypeScript
- **Decision Needed By**: Before writing first test

**Q3: Should we create TypeScript type definitions for service outputs?**
- **Current Approach**: Plain JavaScript with JSDoc comments
- **Alternative**: Create `.d.ts` files for better IDE support
- **Trade-off**: Additional work vs improved developer experience
- **Recommendation**: Skip for Epic 1 (YAGNI), add in Epic 2 if needed

**Q4: How should we handle muscles not in workout?**
- **Current Approach**: Return 0 volume/fatigue for unused muscles
- **Alternative**: Only return muscles that were worked
- **Consideration**: Recovery dashboard expects all 15 muscles
- **Decision**: Return all 15 muscles, UI filters as needed

**Q5: Should baseline suggestions be sorted by exceed percentage?**
- **Current Approach**: Unsorted array
- **Alternative**: Sort by highest exceed percentage first
- **User Impact**: Prioritizes most significant baseline updates
- **Recommendation**: Add sorting (simple, improves UX)

## Test Strategy Summary

### Testing Approach

**Test Pyramid for Epic 1**:
- **Unit Tests** (70%): Test each service function in isolation
- **Integration Tests** (20%): Test service + database interactions (Epic 2)
- **E2E Tests** (10%): Test full API → service → database flow (Epic 4)
- Epic 1 focus: Unit tests only (no API endpoints yet)

**Test Framework**: Vitest (consistent with frontend, supports TypeScript)

**Test Data Source**: `docs/logic-sandbox/` (Legs Day A workout as reference)

**Coverage Target**: 90%+ line coverage for all services

### Unit Test Strategy

**Story 1.1: Fatigue Calculator Tests**

1. **Happy Path Tests**:
   - Test with Legs Day A workout (Bulgarian Split Squats, Goblet Squats, RDLs)
   - Verify volume calculations match logic-sandbox expected results
   - Verify fatigue percentages match expected values
   - Verify warnings generated for high fatigue (>80%)

2. **Edge Case Tests**:
   - Empty workout (no exercises)
   - Single set workout
   - Exercise with 0% engagement in a muscle
   - Muscle volume exactly at baseline (100%)
   - Muscle volume exceeding baseline (>100%)

3. **Error Handling Tests**:
   - Missing workout object → throws error
   - Invalid exercise ID (not in library) → throws error
   - Missing baseline for muscle → throws error or uses fallback
   - Invalid set data (negative reps/weight) → throws error

**Story 1.2: Recovery Calculator Tests**

1. **Happy Path Tests**:
   - Test 24h elapsed recovery (15% reduction)
   - Test 48h elapsed recovery (30% reduction)
   - Test recovery projections at 24h/48h/72h intervals
   - Test fully recovered time calculation
   - Test ready muscles identification (0% fatigue)

2. **Edge Case Tests**:
   - Muscle already recovered (0% fatigue)
   - Recovery would go negative (clamp to 0%)
   - Very high initial fatigue (150%)
   - Fractional hours elapsed (e.g., 12.5 hours)

3. **Error Handling Tests**:
   - Missing muscle states → throws error
   - Invalid timestamp format → throws error
   - Future timestamp (negative elapsed time) → throws error

**Story 1.3: Exercise Recommender Tests**

1. **Happy Path Tests**:
   - Test 5-factor scoring with known inputs
   - Verify score breakdown sums to total
   - Test ranking (top 15 exercises by score)
   - Test bottleneck detection (>80% muscle fatigue)
   - Test equipment filtering

2. **Edge Case Tests**:
   - All muscles at 0% fatigue (maximum freshness)
   - All muscles at 100% fatigue (minimum freshness)
   - No equipment specified (return all exercises)
   - Target muscle not primary in any exercise
   - Recent exercises list contains all exercises (variety = 0)

3. **Error Handling Tests**:
   - Missing target muscle → throws error
   - Invalid target muscle name → throws error
   - Missing fatigue states → throws error

**Story 1.4: Baseline Updater Tests**

1. **Happy Path Tests**:
   - Test volume exceeds baseline (suggestion created)
   - Test exceed percentage calculation
   - Test workout context included in suggestion
   - Test multiple muscles exceeding baselines

2. **Edge Case Tests**:
   - No muscles exceed baseline (empty array)
   - Volume exactly equals baseline (no suggestion)
   - Volume slightly exceeds baseline (<5%)
   - All muscles exceed baselines (15 suggestions)

3. **Error Handling Tests**:
   - Missing muscle states → throws error
   - Missing baselines → throws error
   - Invalid workout ID → handled gracefully

### Test Organization

**Directory Structure**:
```
backend/
├── services/
│   ├── fatigueCalculator.js
│   ├── recoveryCalculator.js
│   ├── exerciseRecommender.js
│   └── baselineUpdater.js
└── __tests__/
    ├── fatigueCalculator.test.js
    ├── recoveryCalculator.test.js
    ├── exerciseRecommender.test.js
    ├── baselineUpdater.test.js
    └── fixtures/
        ├── legs-day-a-workout.json       (from logic-sandbox)
        ├── expected-fatigue.json         (from logic-sandbox)
        ├── sample-baselines.json
        └── sample-muscle-states.json
```

**Test Naming Convention**:
- File: `[serviceName].test.js`
- Describe block: Service function name
- Test: `should [expected behavior] when [condition]`
- Example: `should calculate correct volume when given Bulgarian Split Squats`

### Validation Criteria

**Service Tests Pass** when:
- All unit tests pass (green)
- Code coverage >90% for service files
- No linter warnings or errors
- Test execution time <1 second total
- Calculations match logic-sandbox expected results (within ±0.1 absolute percentage points tolerance, e.g., 85.2% vs 85.3% acceptable)

**Epic 1 Complete** when:
- All 4 services implemented with tests
- All acceptance criteria verified
- Sprint status updated: `epic-1: contexted`
- Ready for Epic 2 (API endpoint integration)

### Continuous Integration

**Pre-commit Checks** (Epic 4 will set up):
- Run all unit tests
- Verify code coverage threshold
- Run ESLint/Prettier
- Block commit if tests fail

**CI Pipeline** (Epic 4 will implement):
- Run tests on push to main
- Generate coverage report
- Fail build if coverage drops below 90%

### Test Maintenance

**When to Update Tests**:
- Formula changes in logic-sandbox (rare, requires validation)
- Service function signatures change
- New edge cases discovered during implementation
- Bug fixes (add regression test first)

**Test Data Refresh**:
- Keep `fixtures/` in sync with logic-sandbox
- Update expected results if formulas change
- Document any deviations from sandbox in test comments
