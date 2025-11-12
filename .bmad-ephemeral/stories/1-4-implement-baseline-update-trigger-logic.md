# Story 1.4: Implement Baseline Update Trigger Logic

Status: review

## Story

As a **backend service**,
I want **to detect when a user exceeds their muscle baseline capacity**,
So that **the app can prompt them to update their baseline and adapt to improved strength**.

## Acceptance Criteria

1. **Given** a completed workout with calculated muscle volumes
   **When** the service compares muscle volumes to current baselines
   **Then** it identifies any muscles where `muscleVolume > baseline`

2. **And** it calculates suggested new baseline as: `actualVolume achieved`

3. **And** it returns a list of baseline update suggestions

4. **And** it includes the date and workout context for the suggestion

## Tasks / Subtasks

- [x] Task 1: Create baseline updater service structure (AC: 1, 2, 3, 4)
  - [x] Subtask 1.1: Create `backend/services/baselineUpdater.js` file
  - [x] Subtask 1.2: Set up ES6 module exports with proper JSDoc documentation
  - [x] Subtask 1.3: Import exercise library from `docs/logic-sandbox/exercises.json`
  - [x] Subtask 1.4: Import baseline data from `docs/logic-sandbox/baselines.json`

- [x] Task 2: Implement muscle volume calculation from workout data (AC: 1)
  - [x] Subtask 2.1: Accept workout exercises with sets data (weight, reps, toFailure)
  - [x] Subtask 2.2: For each exercise, get muscle engagement percentages from exercise library
  - [x] Subtask 2.3: Calculate total volume per set: `weight × reps`
  - [x] Subtask 2.4: Calculate muscle-specific volume: `totalVolume × (engagement / 100)`
  - [x] Subtask 2.5: Track maximum volume achieved per muscle across all sets in workout

- [x] Task 3: Implement baseline comparison logic (AC: 1, 2)
  - [x] Subtask 3.1: Load current baselines for all 15 muscles
  - [x] Subtask 3.2: Compare achieved muscle volume to current baseline
  - [x] Subtask 3.3: Identify muscles where `achievedVolume > currentBaseline`
  - [x] Subtask 3.4: Calculate suggested new baseline as the actual volume achieved
  - [x] Subtask 3.5: Only trigger suggestions for "to failure" sets (quality data)

- [x] Task 4: Generate baseline update suggestions (AC: 3, 4)
  - [x] Subtask 4.1: Create suggestion object structure: `{ muscle, currentBaseline, suggestedBaseline, achievedVolume, exercise, date }`
  - [x] Subtask 4.2: Include workout context (which exercise triggered the suggestion)
  - [x] Subtask 4.3: Include date/timestamp of achievement
  - [x] Subtask 4.4: Calculate percentage increase for user-friendly display
  - [x] Subtask 4.5: Return array of all muscles that exceeded baselines

- [x] Task 5: Add input validation and error handling (Testing)
  - [x] Subtask 5.1: Validate workout data structure (exercises array with sets)
  - [x] Subtask 5.2: Validate each set has required fields (weight, reps)
  - [x] Subtask 5.3: Handle missing exercise data gracefully (skip unknown exercises)
  - [x] Subtask 5.4: Throw descriptive errors for invalid inputs

- [x] Task 6: Create comprehensive test suite (Testing)
  - [x] Subtask 6.1: Test baseline exceeded detection with known workout data
  - [x] Subtask 6.2: Test multiple muscles exceeded in single workout (compound exercise)
  - [x] Subtask 6.3: Test no suggestions when volume below baseline
  - [x] Subtask 6.4: Test "to failure" filtering (only learn from quality sets)
  - [x] Subtask 6.5: Test edge cases (first-time user, zero baseline, invalid exercise)
  - [x] Subtask 6.6: Test suggestion object structure and completeness

- [x] Task 7: Export service with ES6 module pattern (Testing)
  - [x] Subtask 7.1: Export `checkForBaselineUpdates` function with ES6 `export`
  - [x] Subtask 7.2: Add comprehensive JSDoc comments with parameter types
  - [x] Subtask 7.3: Follow camelCase naming convention established in Epic 1
  - [x] Subtask 7.4: Document algorithm and return structure in comments

## Dev Notes

### Learnings from Previous Story

**From Story 1-3-implement-exercise-recommendation-scoring-engine (Status: done)**

- **New Service Created**: `backend/services/exerciseRecommender.js` - 5-factor exercise scoring with bottleneck detection
- **Test Suite Pattern**: `backend/services/__tests__/exerciseRecommender.test.js` - 44 comprehensive tests (100% pass rate)
- **Module Pattern Confirmed**: Project uses ES6 modules (`export` not CommonJS) - `package.json` has `"type": "module"`
- **Exercise Data Source**: `docs/logic-sandbox/exercises.json` - 48 validated exercises with corrected percentages
- **Baseline Data Source**: `docs/logic-sandbox/baselines.json` - 15 muscle baselines with validated capacities
- **Input Validation Pattern**: Throw descriptive errors with specific messages for invalid inputs
- **Data Structure**: Services accept muscle states in `{ muscle, fatiguePercent }` or `{ muscle, currentFatigue }` format
- **JSDoc Standards**: Comprehensive documentation with @param, @returns, @throws, @example tags
- **Helper Functions**: Well-factored code with separate functions for distinct calculations
- **15 Muscle Groups**: All services handle the same 15 muscles consistently
- **Volume Calculation**: `totalVolume = sets × reps × weight`, then `muscleVolume = totalVolume × (percentage / 100)`

**Key Interfaces to Reuse**:
- Exercise library loading pattern from `exerciseRecommender.js` (cached loading with `fs.readFileSync`)
- Baseline data structure: `{ muscle, baselineCapacity, unit, lastUpdated, source, notes }`
- Volume calculation formula: `weight × reps × (engagement / 100)` per muscle
- Input validation pattern: Check required fields, throw descriptive errors
- Test data sources: `docs/logic-sandbox/exercises.json`, `docs/logic-sandbox/baselines.json`

**Review Enhancement Suggestions** (non-blocking, from Story 1.3):
- Validate inputs early before processing
- Extract repeated logic to helper functions for DRY principle
- Add comprehensive JSDoc with examples

**Pending Review Items**: None - Story 1.3 fully approved and complete

[Source: .bmad-ephemeral/stories/1-3-implement-exercise-recommendation-scoring-engine.md#Dev-Agent-Record]

### Architecture Patterns

**Service Structure** (from architecture.md and previous stories):
- Location: `backend/services/baselineUpdater.js` (NEW FILE)
- Export pattern: ES6 modules with `export` keyword (project uses "type": "module")
- Input validation: Throw errors for invalid data (caught by API routes in Epic 2)
- Pure functions: No direct DB access (services receive data from routes)
- Data loading: Use `fs.readFileSync()` for JSON files with caching

**Algorithm Design** (from epics.md and musclemax-baseline-learning-system.md):
- Simple comparison logic: `achievedVolume > currentBaseline`
- Conservative approach: Only update from "to failure" sets (quality data)
- Ratchet model: Baselines only increase, never decrease automatically
- Transparency: Return full context (exercise, date, old/new values)

**Data Sources**:
- **Exercise Library**: `docs/logic-sandbox/exercises.json` (muscle engagement percentages)
- **Baseline Data**: `docs/logic-sandbox/baselines.json` (current capacity values)
- **Workout Data**: Passed as parameter (exercises with sets: weight, reps, toFailure)

**15 Muscle Groups** (must handle all):
Pectoralis, Lats, AnteriorDeltoids, PosteriorDeltoids, Trapezius, Rhomboids, LowerBack, Core, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

**Muscle Name Mapping** (important from Story 1.3):
- Exercise data uses: "Deltoids (Anterior)", "Deltoids (Posterior)"
- Baseline data uses: "AnteriorDeltoids", "PosteriorDeltoids"
- Need mapping like Story 1.3's `MUSCLE_NAME_MAP` for compatibility

### Data Sources

**Input Data**:
- Workout exercises array: `[{ exercise, sets: [{ weight, reps, toFailure }] }]`
- Exercise library for muscle engagement percentages
- Current baseline values for comparison

**Output Data**:
- Suggestions array: `[{ muscle, currentBaseline, suggestedBaseline, achievedVolume, exercise, date, percentIncrease }]`
- Empty array if no baselines exceeded

**Volume Calculation Formula** (from musclemax-baseline-learning-system.md):
```
total_set_volume = weight × reps
muscle_volume = total_set_volume × (muscle_engagement_percentage / 100)

Example:
Push-ups: 30 reps @ 200lbs
- Pectoralis (70%): 30 × 200 × 0.70 = 4,200 units
- Triceps (50%): 30 × 200 × 0.50 = 3,000 units
- AnteriorDeltoids (40%): 30 × 200 × 0.40 = 2,400 units
```

### Testing Standards

**Test Framework**: Vitest (established in Stories 1.1, 1.2, 1.3)

**Test Cases Required**:
1. Baseline exceeded detection → Correct suggestion generated
2. Multiple muscles exceeded → All suggestions returned
3. Volume below baseline → No suggestions (empty array)
4. "To failure" filtering → Only failure sets trigger suggestions
5. Compound exercise → Multiple muscle suggestions from single exercise
6. Edge case: First-time user (no baseline data) → Handle gracefully
7. Edge case: Unknown exercise → Skip and continue processing
8. Edge case: Invalid workout data → Throw descriptive error
9. Suggestion object structure → Contains all required fields
10. Percentage increase calculation → Correct math

**Test Data**:
- Use validated exercises from `docs/logic-sandbox/exercises.json`
- Use baseline values from `docs/logic-sandbox/baselines.json`
- Mock workout data with known volumes to verify calculations

**Test Location**: `backend/services/__tests__/baselineUpdater.test.js`

### Project Structure Notes

**Folder Structure**:
- `backend/services/` already exists (created in Story 1.1)
- Follow same patterns as previous Epic 1 services
- Test file in `backend/services/__tests__/` subdirectory

**Dependencies**:
- Story 1.1 fatigue calculator (volume calculation pattern)
- Exercise library from logic-sandbox (muscle engagements)
- Baseline data from logic-sandbox (comparison values)

**No Conflicts Expected**:
- New service (no existing code to modify)
- Integrates with existing data sources
- Will be consumed by Epic 2 API endpoints (Story 2.1)

### References

**Primary Sources**:
- [Source: docs/epics.md#Story-1.4] - Acceptance criteria and technical notes
- [Source: docs/musclemax-baseline-learning-system.md] - Complete baseline learning architecture and algorithm
- [Source: docs/logic-sandbox/baselines.json] - 15 muscle baseline values (3,744 for Pectoralis, 2,520 for Triceps, etc.)
- [Source: docs/logic-sandbox/exercises.json] - 48 validated exercises with muscle engagement percentages
- [Source: .bmad-ephemeral/stories/1-3-implement-exercise-recommendation-scoring-engine.md] - Exercise library loading pattern and volume calculations

**Algorithm Overview** (from musclemax-baseline-learning-system.md):

The baseline update trigger follows a simple comparison process:

1. **Calculate Muscle Volumes from Workout**:
   - For each exercise in completed workout
   - Get muscle engagement percentages from exercise library
   - Calculate: `muscleVolume = weight × reps × (engagement / 100)`
   - Track maximum volume per muscle across all sets

2. **Compare to Current Baselines**:
   - Load current baseline values for all 15 muscles
   - For each muscle with volume data:
     - IF `achievedVolume > currentBaseline`
     - THEN create suggestion with new baseline = achievedVolume

3. **Filter by Quality**:
   - Only process sets marked as "to failure" (quality data)
   - Skip submaximal sets (not representative of true capacity)

4. **Return Suggestions**:
   - Array of muscles that exceeded baselines
   - Include context: exercise name, date, old/new values
   - Calculate percentage increase for UI display

**Implementation Example**:
```javascript
// backend/services/baselineUpdater.js

/**
 * Check for baseline updates based on completed workout
 *
 * Algorithm: Conservative max observed volume
 * - Only analyzes sets marked as "to failure" (quality data)
 * - Compares achieved volume to current baseline
 * - Suggests baseline update if volume exceeded
 *
 * @param {Array<Object>} workoutExercises - Completed workout exercises
 * @param {string} workoutDate - ISO date string of workout
 * @returns {Array<Object>} Baseline update suggestions
 * @throws {Error} If workout data is invalid
 *
 * @example
 * const suggestions = checkForBaselineUpdates([
 *   {
 *     exercise: "Push-ups",
 *     sets: [
 *       { weight: 200, reps: 30, toFailure: true }
 *     ]
 *   }
 * ], "2025-11-11");
 * // Returns: [
 * //   {
 * //     muscle: "Pectoralis",
 * //     currentBaseline: 3744,
 * //     suggestedBaseline: 4200,
 * //     achievedVolume: 4200,
 * //     exercise: "Push-ups",
 * //     date: "2025-11-11",
 * //     percentIncrease: 12.2
 * //   }
 * // ]
 *
 * Source: docs/musclemax-baseline-learning-system.md
 */
export function checkForBaselineUpdates(workoutExercises, workoutDate) {
  // Input validation
  if (!Array.isArray(workoutExercises)) {
    throw new Error("Workout exercises must be an array");
  }
  if (!workoutDate) {
    throw new Error("Workout date is required");
  }

  // Load data sources
  const exercises = loadExerciseLibrary(); // from docs/logic-sandbox/exercises.json
  const baselines = loadBaselines(); // from docs/logic-sandbox/baselines.json

  // Calculate muscle volumes from workout
  const muscleVolumes = calculateMuscleVolumes(workoutExercises, exercises);

  // Compare to baselines and generate suggestions
  const suggestions = [];

  for (const [muscleName, achievedVolume] of Object.entries(muscleVolumes)) {
    const baseline = baselines.find(b => normalizeMuscle(b.muscle) === muscleName);

    if (!baseline) continue; // Unknown muscle, skip

    if (achievedVolume > baseline.baselineCapacity) {
      const percentIncrease = ((achievedVolume - baseline.baselineCapacity) / baseline.baselineCapacity) * 100;

      suggestions.push({
        muscle: muscleName,
        currentBaseline: baseline.baselineCapacity,
        suggestedBaseline: achievedVolume,
        achievedVolume: achievedVolume,
        exercise: findExerciseThatTriggered(workoutExercises, muscleName, achievedVolume),
        date: workoutDate,
        percentIncrease: parseFloat(percentIncrease.toFixed(1))
      });
    }
  }

  return suggestions;
}

function calculateMuscleVolumes(workoutExercises, exerciseLibrary) {
  const muscleVolumes = {};

  for (const workoutEx of workoutExercises) {
    const exercise = exerciseLibrary.find(e => e.name === workoutEx.exercise);
    if (!exercise) continue; // Unknown exercise, skip

    for (const set of workoutEx.sets) {
      // Only process "to failure" sets (quality data)
      if (!set.toFailure) continue;

      const totalVolume = set.weight * set.reps;

      for (const muscleData of exercise.muscles) {
        const muscleVolume = totalVolume * (muscleData.percentage / 100);
        const muscleName = normalizeMuscle(muscleData.muscle);

        // Track max volume per muscle
        if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
          muscleVolumes[muscleName] = muscleVolume;
        }
      }
    }
  }

  return muscleVolumes;
}

function normalizeMuscle(muscleName) {
  // Handle name format differences between exercise data and baseline data
  const map = {
    'Deltoids (Anterior)': 'AnteriorDeltoids',
    'Deltoids (Posterior)': 'PosteriorDeltoids',
    'Latissimus Dorsi': 'Lats',
    'Erector Spinae': 'LowerBack',
    'Rectus Abdominis': 'Core',
    'Obliques': 'Core'
  };

  return map[muscleName] || muscleName;
}
```

**Key Implementation Notes**:
- Load exercise data from `docs/logic-sandbox/exercises.json` (validated source)
- Load baseline data from `docs/logic-sandbox/baselines.json` (validated capacities)
- Use ES6 module export pattern established in Stories 1.1, 1.2, 1.3
- Only process sets marked as `toFailure: true` (quality data for learning)
- Conservative approach: Suggest actual volume achieved (may underestimate if muscle not limiting factor)
- Track maximum volume per muscle across all sets in workout
- Return empty array if no baselines exceeded
- Follow input validation pattern from previous stories

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/1-4-implement-baseline-update-trigger-logic.context.xml` - Story context with documentation artifacts, code references, constraints, interfaces, and test standards

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

Implementation completed in single session with systematic approach following established patterns from Stories 1.1, 1.2, and 1.3.

### Completion Notes List

**Implementation Summary** (2025-11-11):
- Created baseline updater service following conservative max observed volume algorithm
- Implemented muscle volume calculation from workout data with "to failure" filtering
- Built baseline comparison logic detecting when achieved volume exceeds current baseline
- Generated suggestions with full context (muscle, exercise, date, percentage increase)
- Added comprehensive input validation with descriptive error messages
- Followed ES6 module pattern and camelCase naming conventions consistently
- Created 35 comprehensive tests covering all acceptance criteria and edge cases
- All tests passing (100% pass rate) with no regressions in existing services

**Key Technical Decisions**:
- Used cached loading for exercise and baseline data (consistent with Story 1.3 pattern)
- Implemented muscle name normalization to handle format differences between data sources
- Tracked maximum volume per muscle (not sum) across sets for conservative estimates
- Only processed sets marked as `toFailure: true` for quality learning data
- Suggested baseline equals actual volume achieved (conservative approach)

**Algorithm Implementation** (from musclemax-baseline-learning-system.md):
- Formula: `muscleVolume = weight × reps × (muscleEngagement / 100)`
- Quality filtering: Only "to failure" sets used for learning
- Comparison logic: `if (achievedVolume > currentBaseline)` then suggest update
- Conservative approach: Baselines only increase, never decrease automatically

**Test Coverage**:
- 11 input validation tests (invalid data structures, missing fields, type errors)
- 14 functional tests (baseline detection, volume calculation, multiple muscles)
- 10 edge case tests (unknown exercises, zero values, empty workouts, real-world scenarios)

**Pattern Consistency**:
- Matched exerciseRecommender.js patterns for data loading and caching
- Followed fatigueCalculator.js volume calculation formulas
- Used Vitest testing framework consistent with Epic 1 services
- Applied muscle name mapping pattern from Story 1.3

### File List

- `backend/services/baselineUpdater.js` - NEW: Baseline update trigger service (239 lines)
- `backend/services/__tests__/baselineUpdater.test.js` - NEW: Comprehensive test suite (35 tests, 586 lines)

## Change Log

- **2025-11-11**: Story 1.4 drafted by create-story workflow
  - Extracted requirements from epics.md Story 1.4
  - Incorporated learnings from Story 1.3 (exercise recommender service)
  - Referenced musclemax-baseline-learning-system.md for algorithm design
  - Created 7 tasks with 27 subtasks mapped to acceptance criteria
  - Story ready for context generation and development

- **2025-11-11**: Story 1.4 implementation completed by dev-story workflow
  - Implemented baselineUpdater service with checkForBaselineUpdates function
  - Created 35 comprehensive tests with 100% pass rate
  - Followed conservative max observed volume algorithm from musclemax-baseline-learning-system.md
  - Only processes "to failure" sets for quality learning data
  - Returns suggestions with full context: muscle, exercise, date, percentage increase
  - All acceptance criteria satisfied and validated with tests
  - Status updated: in-progress → review
