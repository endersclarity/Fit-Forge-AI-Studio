# Story 1.1: Implement Fatigue Calculation Service

Status: done

## Story

As a **backend service**,
I want **to calculate muscle-specific fatigue from workout data**,
So that **the app can accurately track how much each muscle group was worked**.

## Acceptance Criteria

1. **Given** a completed workout with sets (reps, weight, exercise)
   **When** the fatigue calculation service processes the workout
   **Then** it calculates total volume per muscle using the formula: `(reps × weight × muscleEngagement%) summed across all sets`

2. **And** it calculates fatigue percentage as: `(totalMuscleVolume / baseline) × 100`

3. **And** it returns fatigue data for all 15 muscle groups

4. **And** it tracks when muscles exceed baseline capacity (fatigue > 100%)

## Tasks / Subtasks

- [x] Task 1: Create backend/services/ folder structure (AC: All)
  - [x] Subtask 1.1: Create `backend/services/` directory if it doesn't exist
  - [x] Subtask 1.2: Verify folder is in correct location relative to backend/server.ts

- [x] Task 2: Port exercise data loader from logic-sandbox (AC: 1)
  - [x] Subtask 2.1: Read `docs/logic-sandbox/exercises.json` (48 validated exercises)
  - [x] Subtask 2.2: Create function to load and parse exercise data
  - [x] Subtask 2.3: Validate all muscle engagement percentages sum to 100%

- [x] Task 3: Implement volume calculation logic (AC: 1)
  - [x] Subtask 3.1: Port logic from `docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs`
  - [x] Subtask 3.2: Calculate volume per set: `reps × weight × muscleEngagement%`
  - [x] Subtask 3.3: Sum volume across all sets for each of 15 muscle groups
  - [x] Subtask 3.4: Handle edge case: exercises with missing engagement data

- [x] Task 4: Implement fatigue percentage calculation (AC: 2)
  - [x] Subtask 4.1: Load muscle baselines from database or parameter
  - [x] Subtask 4.2: Calculate fatigue: `(totalMuscleVolume / baseline) × 100`
  - [x] Subtask 4.3: Round to 1 decimal place for display
  - [x] Subtask 4.4: Handle edge case: baseline = 0 (throw error)

- [x] Task 5: Implement return data structure (AC: 3, 4)
  - [x] Subtask 5.1: Create response object with all 15 muscle groups
  - [x] Subtask 5.2: Include fatigue percentages, total volumes, and timestamp
  - [x] Subtask 5.3: Flag muscles that exceed baseline (fatigue > 100%)
  - [x] Subtask 5.4: Add warnings array for muscles approaching capacity (>80%)

- [x] Task 6: Add input validation and error handling (Testing)
  - [x] Subtask 6.1: Validate workout object structure (required fields)
  - [x] Subtask 6.2: Validate exercises array is not empty
  - [x] Subtask 6.3: Validate baselines object has all 15 muscle groups
  - [x] Subtask 6.4: Throw descriptive errors for invalid inputs

- [x] Task 7: Export service with ES6 module pattern (Testing)
  - [x] Subtask 7.1: Export `calculateMuscleFatigue` function with ES6 `export`
  - [x] Subtask 7.2: Add JSDoc comments with parameter types and return type
  - [x] Subtask 7.3: Follow camelCase naming convention (matches existing backend)

## Dev Notes

### Architecture Patterns

**Service Structure** (from [docs/architecture.md](docs/architecture.md)):
- Location: `backend/services/fatigueCalculator.js` (NEW FILE)
- Export pattern: CommonJS `module.exports` (matches database.js)
- Input validation: Throw errors for invalid data (caught by routes)
- Pure functions: No direct DB access (services receive data from routes)

**Formula Validation** (from logic-sandbox):
- Primary source: `docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs`
- Validated with "Legs Day A" workout in sandbox
- Exercise data: `docs/logic-sandbox/exercises.json` (CRITICAL: percentages corrected to 100%)

**15 Muscle Groups** (must handle all):
Pectoralis, Latissimus Dorsi, Deltoids (Anterior), Deltoids (Posterior), Trapezius, Rhomboids, Erector Spinae, Obliques, Rectus Abdominis, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

### Data Sources

**Exercise Library**:
- **✅ USE**: `docs/logic-sandbox/exercises.json` (corrected percentages = 100%)
- **❌ DO NOT USE**: `backend/constants.ts` or `shared/exercise-library.ts` (incorrect percentages >100%)
- See ADR-005 in architecture document for rationale

**Baseline Data**:
- Source: Function parameter (passed from database by route handler)
- Table: `muscle_baselines` (existing schema)
- Format: `{ "Quadriceps": 2880, "Hamstrings": 2880, ... }`

### Testing Standards

**Test Framework**: Node.js built-in test runner or Jest (check package.json)

**Test Cases Required**:
1. Valid workout with multiple exercises → Correct fatigue calculations
2. Single-exercise workout → Isolated muscle fatigue
3. Workout exceeding baseline → Fatigue >100% flagged
4. Invalid inputs (null workout, empty exercises, missing baselines) → Throws errors
5. Edge case: Zero baseline → Throws descriptive error

**Test Data**: Use "Legs Day A" workout from logic-sandbox for validation

**Test Location**: `backend/services/__tests__/fatigueCalculator.test.js`

### Project Structure Notes

**Folder Creation**:
- `backend/services/` does NOT exist yet - create it first
- Verify relative import paths from `backend/server.ts`

**No Conflicts Expected**:
- This is a new service (no existing code to modify)
- Clean integration point for Epic 2 (API endpoints)

### References

**Primary Sources**:
- [Source: docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs] - Validated algorithm
- [Source: docs/logic-sandbox/exercises.json] - Exercise data (48 exercises, corrected)
- [Source: docs/architecture.md#Pattern-1-Backend-Service-Structure] - Service implementation pattern
- [Source: docs/PRD.md#FR-2-Muscle-Fatigue-Tracking] - Feature requirements
- [Source: docs/epics.md#Story-1.1] - Acceptance criteria

**Implementation Example** (from architecture):
```javascript
// backend/services/fatigueCalculator.js

/**
 * Calculate muscle fatigue from workout data
 * @param {Object} workout - Workout with exercises and sets
 * @param {Array} exercises - Exercise library with muscle engagement
 * @param {Object} baselines - Muscle baseline capacities
 * @returns {Object} Fatigue data by muscle
 */
function calculateMuscleFatigue(workout, exercises, baselines) {
  if (!workout) throw new Error("Workout is required");
  if (!exercises) throw new Error("Exercise library is required");
  if (!baselines) throw new Error("Baselines are required");

  // ... calculation logic (port from logic-sandbox)

  return {
    muscleStates: [...],
    warnings: [...],
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  calculateMuscleFatigue
};
```

**Key Implementation Notes**:
- Keep formulas EXACTLY as validated in logic-sandbox
- Load exercise data from JSON file using `require()` or `fs.readFileSync()`
- Convert JSON format as needed (JSON has `"primary": true/false`)
- Maintain exact calculation precision (no premature rounding)

## Dev Agent Record

### Context Reference

- [Story Context XML](.bmad-ephemeral/stories/1-1-implement-fatigue-calculation-service.context.xml) - Generated 2025-11-11

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

<!-- Will be filled by dev agent -->

### Completion Notes List

**Completed:** 2025-11-11

**Implementation Summary:**
- Created `backend/services/fatigueCalculator.js` service with complete fatigue calculation logic
- Ported algorithm from validated logic-sandbox scripts (calculate-workout-fatigue.mjs)
- Implemented volume calculation: (reps × weight × muscleEngagement%) summed across sets
- Implemented fatigue calculation: (totalMuscleVolume / baseline) × 100
- Added comprehensive input validation and error handling
- Handles 15 muscle groups with proper engagement percentage distribution
- Warns when muscles approach (>80%) or exceed (>100%) baseline capacity
- Used ES6 module export pattern (project uses "type": "module")

**Tests:**
- Created comprehensive test suite: `backend/services/__tests__/fatigueCalculator.test.js`
- All 4 tests passing (volume calculation, baseline exceed detection, error handling, return structure)
- Tests use validated exercise data from logic-sandbox (exercises.json, baselines.json)

**Key Decisions:**
- Used ES6 modules instead of CommonJS (project configuration requires it)
- Handles both array and nested object formats for exercise library
- Gracefully skips exercises with missing data (warns but continues)
- Rounds fatigue percentages to 1 decimal place for display
- Caps displayFatigue at 100% while tracking actual fatiguePercent for exceeded baseline detection

### File List

**New Files Created:**
- [backend/services/fatigueCalculator.js](backend/services/fatigueCalculator.js) - Fatigue calculation service (ES6 module)
- [backend/services/__tests__/fatigueCalculator.test.js](backend/services/__tests__/fatigueCalculator.test.js) - Test suite (Vitest)

**Modified Files:**
- None (this is a new service with no dependencies on existing code)

---

## Code Review Resolution

**Review Date:** 2025-11-11
**Status:** All findings addressed and verified

### Finding 1: Incomplete Muscle Group Coverage (CRITICAL - AC3)

**Issue:** Implementation only returned muscles that received volume, not all 15 muscle groups.

**Resolution:** Added code after line 121 to ensure all muscles from baselines are included:
```javascript
// Ensure all muscles from baselines are included (even with 0 fatigue)
Object.keys(baselines).forEach(muscle => {
  if (!muscleStates.find(m => m.muscle === muscle)) {
    muscleStates.push({
      muscle,
      volume: 0,
      baseline: baselines[muscle],
      fatiguePercent: 0,
      displayFatigue: 0,
      exceededBaseline: false
    });
  }
});
```

**Verification:** Added test case "should return fatigue data for all 15 muscle groups even if not worked" - PASSING

### Finding 2: Enhanced JSDoc Documentation

**Resolution:** Completely rewrote JSDoc with:
- Detailed parameter documentation with nested property descriptions
- Complete return type documentation with all properties
- Algorithm source citation (docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs)
- Usage example demonstrating expected behavior
- Explicit @throws documentation

**File:** c:\Users\ender\.claude\projects\FitForge-Local\backend\services\fatigueCalculator.js (lines 1-47)

### Finding 3: Expanded Test Coverage

**Resolution:** Added 6 new test cases to comprehensive test suite:

1. **Zero baseline edge case** - Verifies error thrown when baseline = 0 (PASSING)
2. **Missing exercise in library** - Verifies graceful handling, returns all muscles with 0 fatigue (PASSING)
3. **Exercise with no muscle data** - Verifies no crash, completes successfully (PASSING)
4. **Volume calculation from sets array** - Verifies correct volume calculation from sets (PASSING)
5. **Warnings content validation** - Verifies warning messages are properly formatted (PASSING)
6. **All 15 muscle groups returned** - Verifies AC3 compliance with unused muscles (PASSING)

**Test Results:** 10/10 tests passing
**File:** c:\Users\ender\.claude\projects\FitForge-Local\backend\services\__tests__\fatigueCalculator.test.js

### Additional Fix: Zero Baseline Check

**Issue Discovered:** The baseline check `if (!baseline)` was treating `0` as falsy, preventing the zero baseline error from throwing.

**Resolution:** Changed line 129 to explicitly check for undefined/null:
```javascript
if (baseline === undefined || baseline === null) {
```

This ensures the zero baseline check on line 134 is reached when baseline = 0.

### Verification Summary

All code review findings have been addressed:
- AC3 compliance verified: All 15 muscle groups returned
- JSDoc documentation enhanced with full API details
- Test coverage expanded from 4 to 10 comprehensive tests
- All tests passing (10/10)
- Zero baseline edge case properly handled
