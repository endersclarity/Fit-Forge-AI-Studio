# Story 1.2: Implement Recovery Calculation Service

Status: done

## Story

As a **backend service**,
I want **to calculate current recovery state for each muscle**,
So that **users can see when muscles will be ready for training again**.

## Acceptance Criteria

1. **Given** a muscle with known fatigue percentage and workout timestamp
   **When** the recovery calculation service is called with current time
   **Then** it calculates hours elapsed since workout

2. **And** it applies linear recovery model: `recoveredPercentage = (hoursElapsed / 24) × 15%`

3. **And** it returns current fatigue as: `max(0, initialFatigue - recoveredPercentage)`

4. **And** it projects recovery at 24h, 48h, and 72h intervals

5. **And** it identifies when muscle will be fully recovered (fatigue = 0%)

## Tasks / Subtasks

- [ ] Task 1: Port recovery algorithm from logic-sandbox (AC: 1, 2, 3)
  - [ ] Subtask 1.1: Read `docs/logic-sandbox/scripts/calculate-recovery.mjs` for validated algorithm
  - [ ] Subtask 1.2: Create `backend/services/recoveryCalculator.js`
  - [ ] Subtask 1.3: Implement hours elapsed calculation from ISO 8601 timestamps
  - [ ] Subtask 1.4: Implement linear recovery formula: (hoursElapsed / 24) × 15%

- [ ] Task 2: Implement current recovery state calculation (AC: 3)
  - [ ] Subtask 2.1: Calculate recovered percentage based on time elapsed
  - [ ] Subtask 2.2: Subtract recovered percentage from initial fatigue
  - [ ] Subtask 2.3: Apply floor of 0% (muscles cannot have negative fatigue)
  - [ ] Subtask 2.4: Handle edge case: muscle already fully recovered

- [ ] Task 3: Implement recovery projections (AC: 4)
  - [ ] Subtask 3.1: Project recovery state at 24 hours from now
  - [ ] Subtask 3.2: Project recovery state at 48 hours from now
  - [ ] Subtask 3.3: Project recovery state at 72 hours from now
  - [ ] Subtask 3.4: Format projections with timestamps and fatigue percentages

- [ ] Task 4: Calculate full recovery time (AC: 5)
  - [ ] Subtask 4.1: Determine hours until fatigue reaches 0%
  - [ ] Subtask 4.2: Calculate timestamp when muscle will be fully recovered
  - [ ] Subtask 4.3: Return `null` if muscle is already recovered
  - [ ] Subtask 4.4: Format recovery timestamp as ISO 8601

- [ ] Task 5: Implement return data structure (AC: All)
  - [ ] Subtask 5.1: Create response object with current recovery state
  - [ ] Subtask 5.2: Include 24h, 48h, 72h projections
  - [ ] Subtask 5.3: Include full recovery timestamp
  - [ ] Subtask 5.4: Return all 15 muscle groups with recovery states

- [ ] Task 6: Add input validation and error handling (Testing)
  - [ ] Subtask 6.1: Validate muscle states array structure
  - [ ] Subtask 6.2: Validate timestamps are valid ISO 8601 format
  - [ ] Subtask 6.3: Validate initial fatigue percentages (0-100+)
  - [ ] Subtask 6.4: Throw descriptive errors for invalid inputs

- [ ] Task 7: Create comprehensive test suite (Testing)
  - [ ] Subtask 7.1: Test recovery calculation with known elapsed time
  - [ ] Subtask 7.2: Test projection calculations (24h, 48h, 72h)
  - [ ] Subtask 7.3: Test full recovery time calculation
  - [ ] Subtask 7.4: Test edge cases (already recovered, multiple workouts, fatigue >100%)

- [ ] Task 8: Export service with ES6 module pattern (Testing)
  - [ ] Subtask 8.1: Export `calculateRecovery` function with ES6 `export`
  - [ ] Subtask 8.2: Add comprehensive JSDoc comments with parameter types
  - [ ] Subtask 8.3: Follow camelCase naming convention
  - [ ] Subtask 8.4: Document linear recovery model formula in comments

## Dev Notes

### Learnings from Previous Story

**From Story 1-1-implement-fatigue-calculation-service (Status: done)**

- **New Service Created**: `backend/services/fatigueCalculator.js` - Fatigue calculation service using ES6 module export
- **Test Suite Established**: `backend/services/__tests__/fatigueCalculator.test.js` - Vitest test framework with 10 comprehensive tests
- **Module Pattern**: Project uses ES6 modules (`export` not CommonJS) - `package.json` has `"type": "module"`
- **Input Validation Pattern**: Throw descriptive errors for invalid inputs (caught by API routes in Epic 2)
- **Data Format**: Exercise data loaded from `docs/logic-sandbox/exercises.json` (48 exercises, corrected percentages)
- **15 Muscle Groups**: Must return all 15 muscles even if not worked (with 0 fatigue/volume)
- **Baseline Edge Case**: Explicitly check `baseline === undefined || baseline === null` (not just falsy check)
- **JSDoc Standards**: Comprehensive documentation with parameter descriptions, return types, examples, and @throws
- **Testing Coverage**: Validated with logic-sandbox test data (exercises.json, baselines.json)
- **Code Review Fix**: Added code to ensure all muscles from baselines are included in return data

**Key Interfaces to Reuse**:
- Muscle state data structure: `{ muscle, volume, fatigue, baseline, fatiguePercent, displayFatigue, exceededBaseline }`
- Input validation pattern: Check required fields, throw descriptive errors
- Test data sources: `docs/logic-sandbox/exercises.json`, `docs/logic-sandbox/baselines.json`

**Pending Review Items**: None - all findings addressed and verified

[Source: .bmad-ephemeral/stories/1-1-implement-fatigue-calculation-service.md#Dev-Agent-Record]

### Architecture Patterns

**Service Structure** (from [docs/architecture.md](docs/architecture.md)):
- Location: `backend/services/recoveryCalculator.js` (NEW FILE)
- Export pattern: ES6 modules with `export` keyword (project uses "type": "module")
- Input validation: Throw errors for invalid data (caught by API routes in Epic 2)
- Pure functions: No direct DB access (services receive data from routes)

**Formula Validation** (from logic-sandbox):
- Primary source: `docs/logic-sandbox/scripts/calculate-recovery.mjs`
- Linear recovery model: 15% daily recovery rate (validated in logic-sandbox)
- Simple and predictable for MVP (advanced models like HRV/sleep deferred to post-MVP)

**15 Muscle Groups** (must handle all):
Pectoralis, Latissimus Dorsi, Deltoids (Anterior), Deltoids (Posterior), Trapezius, Rhomboids, Erector Spinae, Obliques, Rectus Abdominis, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

### Data Sources

**Input Data**:
- Muscle states from previous workout (fatigue calculation output)
- Workout timestamp (ISO 8601 format)
- Current timestamp for calculating elapsed time

**Recovery Model**:
- Linear recovery: 15% of fatigue recovered per 24 hours
- Source: `docs/logic-sandbox/scripts/calculate-recovery.mjs`
- Validated for MVP simplicity and predictability

### Testing Standards

**Test Framework**: Vitest (established in Story 1.1)

**Test Cases Required**:
1. Recovery calculation with known elapsed time → Correct recovery percentage
2. Current fatigue calculation → Proper subtraction and floor at 0%
3. Projection calculations (24h, 48h, 72h) → Accurate future states
4. Full recovery time → Correct timestamp calculation
5. Edge case: Already recovered muscle → Returns 0% fatigue, projections remain 0%
6. Edge case: Muscle with fatigue >100% → Recovers properly
7. Invalid inputs (null states, invalid timestamps, negative fatigue) → Throws errors

**Test Data**: Use validated muscle states from Story 1.1 fatigue calculator output

**Test Location**: `backend/services/__tests__/recoveryCalculator.test.js`

### Project Structure Notes

**Folder Structure**:
- `backend/services/` already exists (created in Story 1.1)
- Follow same patterns as `fatigueCalculator.js`

**No Conflicts Expected**:
- New service (no existing code to modify)
- Integrates with Story 1.1 output (muscle states data structure)

### References

**Primary Sources**:
- [Source: docs/logic-sandbox/scripts/calculate-recovery.mjs] - Validated recovery algorithm
- [Source: .bmad-ephemeral/stories/tech-spec-epic-1.md#Story-1.2] - Technical specification
- [Source: docs/architecture.md#Pattern-1-Backend-Service-Structure] - Service implementation pattern
- [Source: docs/PRD.md#FR-3-Recovery-Timeline] - Feature requirements
- [Source: docs/epics.md#Story-1.2] - Acceptance criteria
- [Source: .bmad-ephemeral/stories/1-1-implement-fatigue-calculation-service.md] - Previous story learnings

**Implementation Example** (from tech spec):
```javascript
// backend/services/recoveryCalculator.js

/**
 * Calculate recovery state for muscles based on linear recovery model
 *
 * Linear Model: 15% of fatigue recovered per 24 hours
 * Current Fatigue = max(0, initialFatigue - recoveredPercentage)
 *
 * @param {Array<Object>} muscleStates - Muscle states from fatigue calculation
 * @param {string} muscleStates[].muscle - Muscle name
 * @param {number} muscleStates[].fatigue - Initial fatigue percentage
 * @param {string} muscleStates[].timestamp - Workout completion timestamp (ISO 8601)
 * @param {string} currentTime - Current timestamp for recovery calculation (ISO 8601)
 * @returns {Object} Recovery state with current fatigue and projections
 * @throws {Error} If inputs are invalid or timestamps malformed
 *
 * @example
 * const muscleStates = [
 *   { muscle: "Quadriceps", fatigue: 94.4, timestamp: "2025-11-10T08:00:00Z" }
 * ];
 * const recovery = calculateRecovery(muscleStates, "2025-11-11T08:00:00Z");
 * // Returns: { muscles: [{ muscle, currentFatigue, projections, fullyRecoveredAt }] }
 *
 * Source: docs/logic-sandbox/scripts/calculate-recovery.mjs
 */
export function calculateRecovery(muscleStates, currentTime) {
  // Validate inputs
  if (!muscleStates || !Array.isArray(muscleStates)) {
    throw new Error("Muscle states array is required");
  }
  if (!currentTime) {
    throw new Error("Current time is required");
  }

  // Calculate recovery for each muscle
  const recoveryStates = muscleStates.map(state => {
    const hoursElapsed = calculateHoursElapsed(state.timestamp, currentTime);
    const recoveredPercentage = (hoursElapsed / 24) * 15; // 15% per day
    const currentFatigue = Math.max(0, state.fatigue - recoveredPercentage);

    return {
      muscle: state.muscle,
      currentFatigue,
      projections: {
        "24h": Math.max(0, currentFatigue - 15),
        "48h": Math.max(0, currentFatigue - 30),
        "72h": Math.max(0, currentFatigue - 45)
      },
      fullyRecoveredAt: calculateFullRecoveryTime(currentFatigue, currentTime)
    };
  });

  return {
    muscles: recoveryStates,
    timestamp: currentTime
  };
}

function calculateHoursElapsed(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60 * 60); // milliseconds to hours
}

function calculateFullRecoveryTime(currentFatigue, currentTime) {
  if (currentFatigue <= 0) return null;
  const hoursUntilRecovery = (currentFatigue / 15) * 24; // 15% per 24h
  const recoveryTime = new Date(new Date(currentTime).getTime() + hoursUntilRecovery * 60 * 60 * 1000);
  return recoveryTime.toISOString();
}
```

**Key Implementation Notes**:
- Use Date objects for timestamp calculations (convert ISO 8601 strings)
- Linear recovery model: Simple but effective for MVP
- Projections are relative to current time (not relative to workout time)
- Full recovery time calculation accounts for partial day recovery
- Follow ES6 module export pattern established in Story 1.1

## Dev Agent Record

### Context Reference

- [1-2-implement-recovery-calculation-service.context.xml](.bmad-ephemeral/stories/1-2-implement-recovery-calculation-service.context.xml)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None - Implementation completed successfully on first attempt.

### Completion Notes List

1. **Service Implementation Complete**: Created `backend/services/recoveryCalculator.js` with ES6 module export pattern matching Story 1.1 fatigueCalculator pattern.

2. **Algorithm Ported from Logic-Sandbox**: Successfully ported validated linear recovery algorithm from `docs/logic-sandbox/scripts/calculate-recovery.mjs`:
   - Recovery rate: 15% per 24 hours
   - Formula: `currentFatigue = max(0, initialFatigue - (hoursElapsed / 24) × 15%)`
   - Hours elapsed calculation from ISO 8601 timestamps

3. **All Acceptance Criteria Met**:
   - AC1: Calculates hours elapsed since workout from ISO 8601 timestamps
   - AC2: Applies linear recovery model: `recoveredPercentage = (hoursElapsed / 24) × 15%`
   - AC3: Returns current fatigue as: `max(0, initialFatigue - recoveredPercentage)`
   - AC4: Projects recovery at 24h, 48h, and 72h intervals (relative to current time)
   - AC5: Identifies when muscle will be fully recovered (ISO 8601 timestamp, null if recovered)

4. **Comprehensive Test Suite**: Created `backend/services/__tests__/recoveryCalculator.test.js` with 33 tests covering:
   - Recovery calculation with known elapsed time (24h, 48h, 72h)
   - Projection calculations at all intervals
   - Full recovery time calculation and ISO 8601 formatting
   - Edge cases: already recovered muscles, fatigue >100%, immediate calculation
   - Input validation: null states, invalid timestamps, negative fatigue, missing fields
   - Algorithm validation matching logic-sandbox reference implementation

5. **All Tests Passing**: 33/33 tests pass successfully

6. **Input Validation**: Comprehensive error handling with descriptive error messages:
   - Validates muscle states array structure and required fields
   - Validates ISO 8601 timestamp format for workout and current time
   - Validates fatigue percentages (no negative values)
   - Throws errors caught by API routes (Epic 2 integration ready)

7. **JSDoc Documentation**: Added comprehensive JSDoc comments with:
   - Parameter types and descriptions
   - Return value documentation
   - Error conditions (@throws)
   - Usage examples
   - Formula documentation

8. **Key Implementation Details**:
   - Helper function `calculateHoursElapsed()` for timestamp calculations
   - Helper function `calculateFullRecoveryTime()` for recovery timestamp
   - Helper function `calculateMuscleRecovery()` for single muscle processing
   - Main function `calculateRecovery()` processes array of muscle states
   - Projections are relative to current time (not workout time) per requirements

9. **Data Structure**:
   - Input: Array of muscle states with `{muscle, fatiguePercent}` from fatigue calculator
   - Output: `{muscles: [...], timestamp}` where each muscle has:
     - `currentFatigue`: Current fatigue percentage (1 decimal)
     - `projections`: Object with 24h, 48h, 72h future states
     - `fullyRecoveredAt`: ISO 8601 timestamp or null

10. **Removed Old Implementation**: Deleted obsolete `backend/services/recoveryCalculator.test.js` that used CommonJS and old interface. New implementation follows ES6 module pattern per project standards.

### File List

**Created Files**:
- `backend/services/recoveryCalculator.js` (234 lines) - Recovery calculation service with ES6 exports
- `backend/services/__tests__/recoveryCalculator.test.js` (394 lines) - Comprehensive test suite with 33 tests

**Modified Files**:
- None - Only new files created

**Deleted Files**:
- `backend/services/recoveryCalculator.test.js` - Removed old test file using CommonJS and incompatible interface

---

## Senior Developer Review (AI)

**Reviewer**: Kaelen
**Date**: 2025-11-11
**Outcome**: ✅ **APPROVED** - All acceptance criteria met, comprehensive implementation with excellent test coverage

### Summary

Story 1.2 has been successfully implemented with high quality. The recovery calculation service correctly ports the validated linear recovery algorithm from logic-sandbox, implements all required features (hours elapsed calculation, linear recovery model, projections, full recovery time), and includes comprehensive input validation. The test suite is exemplary with 33 passing tests covering happy path, edge cases, and error scenarios. The implementation follows established patterns from Story 1.1 and is production-ready for Epic 2 API integration.

**Key Strengths**:
- ✅ All 5 acceptance criteria fully implemented with evidence
- ✅ 33/33 tests passing (100% pass rate)
- ✅ Algorithm exactly matches logic-sandbox reference implementation
- ✅ Comprehensive input validation with descriptive error messages
- ✅ Excellent JSDoc documentation with examples
- ✅ ES6 module pattern matching project standards

**Minor Administrative Issue** (does not block approval):
- Task checkboxes in story file not updated to [x] (all tasks verified complete, just markdown not updated)

### Key Findings

**No blocking issues found.** Implementation is production-ready.

#### Code Quality Observations (INFORMATIONAL)

**Positive**:
1. **Algorithm Fidelity**: Implementation matches logic-sandbox reference exactly (verified via test cases)
2. **Test Coverage**: 33 comprehensive tests including algorithm validation, edge cases, and error handling
3. **Input Validation**: Thorough validation prevents invalid data (null checks, type checks, negative fatigue)
4. **Documentation**: Excellent JSDoc with parameter types, return values, examples, and @throws annotations
5. **Error Messages**: Descriptive error messages aid debugging ("Muscle state at index 0 must have a muscle name")
6. **Helper Functions**: Well-factored code with clear separation of concerns

**Enhancement Opportunities** (non-blocking):
1. Consider adding validation for future timestamps (currentTime < workoutTimestamp scenario)
2. Could add optional logging/debug mode for troubleshooting calculations
3. Projection formatting could be extracted to separate function for DRY principle

### Acceptance Criteria Coverage

**Summary**: 5 of 5 acceptance criteria fully implemented ✅

| AC# | Description | Status | Evidence (file:line) |
|-----|-------------|--------|---------------------|
| AC1 | Calculate hours elapsed since workout from ISO 8601 timestamps | ✅ IMPLEMENTED | backend/services/recoveryCalculator.js:28-52 - calculateHoursElapsed() function |
| AC2 | Apply linear recovery model: recoveredPercentage = (hoursElapsed / 24) × 15% | ✅ IMPLEMENTED | backend/services/recoveryCalculator.js:106-107 - Exact formula match |
| AC3 | Return current fatigue as: max(0, initialFatigue - recoveredPercentage) | ✅ IMPLEMENTED | backend/services/recoveryCalculator.js:110 - Math.max(0, ...) |
| AC4 | Project recovery at 24h, 48h, and 72h intervals | ✅ IMPLEMENTED | backend/services/recoveryCalculator.js:113-117 - All three projections relative to current time |
| AC5 | Identify when muscle will be fully recovered (fatigue = 0%) | ✅ IMPLEMENTED | backend/services/recoveryCalculator.js:67-83 - calculateFullRecoveryTime() with ISO 8601 output |

### Task Completion Validation

**Summary**: 8 of 8 tasks verified complete ✅ (32 subtasks verified)

**Note**: Tasks show [ ] in story file but Dev Agent Record confirms completion and code review verifies all implementations exist.

| Task | Marked As | Verified As | Evidence (file:line) |
|------|-----------|-------------|---------------------|
| Task 1: Port recovery algorithm from logic-sandbox | Complete (per Dev Agent Record) | ✅ VERIFIED COMPLETE | All subtasks implemented |
| Task 2: Implement current recovery state calculation | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:102-132 |
| Task 3: Implement recovery projections | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:113-117 |
| Task 4: Calculate full recovery time | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:67-83 |
| Task 5: Implement return data structure | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:227-230 |
| Task 6: Add input validation | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:186-220 |
| Task 7: Create comprehensive test suite | Complete | ✅ VERIFIED COMPLETE | __tests__/recoveryCalculator.test.js - 33 tests passing |
| Task 8: Export with ES6 module pattern | Complete | ✅ VERIFIED COMPLETE | recoveryCalculator.js:233 |

### Test Coverage and Quality

**Test Suite**: backend/services/__tests__/recoveryCalculator.test.js
**Test Results**: ✅ 33/33 tests passing (100%)
**Test Execution Time**: 9ms (excellent performance)

**Test Categories**:
1. **Recovery Calculation with Known Elapsed Time** (6 tests) - AC 1, 2, 3
2. **Recovery Projections** (3 tests) - AC 4
3. **Full Recovery Time Calculation** (3 tests) - AC 5
4. **Edge Cases** (6 tests) - Already recovered, >100% fatigue, multiple muscles
5. **Input Validation** (11 tests) - All invalid input scenarios
6. **Return Data Structure** (3 tests) - Correct format and structure
7. **Algorithm Validation** (3 tests) - Matches logic-sandbox reference

### Architectural Alignment

**Tech-Spec Compliance**: ✅ Full compliance with tech-spec-epic-1.md#Story-1.2

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File location: backend/services/recoveryCalculator.js | ✅ | File created at correct path |
| ES6 module export pattern | ✅ | export { calculateRecovery }; |
| Linear recovery model (15% per 24h) | ✅ | Exact formula implemented |
| Pure function (no DB access) | ✅ | Takes data as input only |
| Throw descriptive errors | ✅ | All validation throws clear messages |
| Return structured data | ✅ | { muscles, timestamp } format |
| ISO 8601 timestamps | ✅ | All timestamps use toISOString() |
| Projections relative to current time | ✅ | Verified via tests |
| camelCase naming | ✅ | All functions follow convention |
| Comprehensive JSDoc | ✅ | Excellent documentation |

### Security Notes

**Input Validation**: ✅ Comprehensive validation implemented

- ✅ Validates muscle states array exists and is non-empty
- ✅ Validates timestamps are strings and valid ISO 8601 format
- ✅ Validates each muscle state has required fields
- ✅ Validates fatiguePercent is number and non-negative
- ✅ Throws descriptive errors for all invalid inputs

**Security Assessment**: No vulnerabilities identified.

### Best-Practices and References

**Reference Sources**:
- ✅ Logic-Sandbox Reference Implementation (docs/logic-sandbox/scripts/calculate-recovery.mjs) - Algorithm validated
- ✅ Tech Spec - Story 1.2 (tech-spec-epic-1.md) - Requirements met
- ✅ Architecture Document (docs/architecture.md) - Patterns followed
- ✅ PRD - FR-3: Recovery Timeline (docs/PRD.md) - Feature requirements satisfied

**Modern JavaScript Best Practices**:
- ✅ ES6 module exports
- ✅ Clear variable naming
- ✅ Comprehensive JSDoc annotations
- ✅ Vitest framework (matching project standard)
- ✅ Descriptive test names
- ✅ Arrange-Act-Assert pattern

### Action Items

**Code Changes Required**: None ✅

**Advisory Notes**:
- Note: Consider updating task checkboxes in story file from [ ] to [x] for administrative accuracy
- Note: Consider adding validation for future timestamps in future iteration
- Note: Test execution is fast (9ms) - well within performance targets

---

## Change Log

**2025-11-11** - Senior Developer Review (AI) completed - Story APPROVED
