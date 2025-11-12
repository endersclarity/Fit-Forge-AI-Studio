# Story 3.4: Connect WorkoutBuilder to Forecast API (Real-Time Preview)

Status: review

## Story

As a **user**,
I want **to see predicted muscle fatigue as I add exercises**,
so that **I can plan balanced workouts without trial and error**.

## Acceptance Criteria

1. **Given** user is building a workout in WorkoutBuilder planning mode
   **When** user adds/removes exercises or adjusts sets
   **Then** frontend calls POST `/api/forecast/workout` with request body:
   ```typescript
   {
     exercises: Array<{
       exerciseId: string,
       estimatedSets: Array<{
         reps: number,
         weight: number
       }>
     }>
   }
   ```

2. **And** it receives API response structure:
   ```typescript
   {
     forecast: Record<Muscle, number>, // Predicted fatigue % for each muscle
     warnings: string[], // General warnings about workout
     bottlenecks: Array<{
       muscle: Muscle,
       projectedFatigue: number, // e.g., 115%
       message: string // e.g., "Hamstrings would reach 115% - risk of overtraining"
     }>
   }
   ```

3. **And** it displays predicted fatigue percentages next to each muscle in forecast panel

4. **And** it highlights bottleneck warnings (muscles that would exceed 100% fatigue) in red

5. **And** it updates forecast in real-time with debounced API calls (500ms delay after last change)

6. **And** it shows color-coded preview:
   - Green (0-60%): Safe training zone
   - Yellow (61-90%): Moderate intensity
   - Red (91-100%): High intensity, approaching limit
   - Dark red (>100%): Bottleneck - overtraining risk

7. **And** it displays critical bottleneck alerts with specific messaging: "⚠️ Hamstrings would reach 115% - risk of overtraining"

## Tasks / Subtasks

- [x] Task 1: Replace local forecast calculation with API integration (AC: 1, 2)
  - [x] Subtask 1.1: Locate WorkoutBuilder.tsx component (components/WorkoutBuilder.tsx)
  - [x] Subtask 1.2: Add state variables for forecastData, isForecastLoading, and error
  - [x] Subtask 1.3: Create fetchForecast async function with debouncing (500ms delay)
  - [x] Subtask 1.4: Implement POST request to /api/forecast/workout endpoint
  - [x] Subtask 1.5: Replace local calculateForecastedMuscleStates() at line 253 with API call
  - [x] Subtask 1.6: Add TypeScript type definitions for API request/response structure

- [x] Task 2: Implement data formatting helper for API request (AC: 1)
  - [x] Subtask 2.1: Create formatSetsForAPI() function
  - [x] Subtask 2.2: Group workout.sets by exerciseId into Map
  - [x] Subtask 2.3: Transform Set objects to { reps, weight } arrays
  - [x] Subtask 2.4: Convert Map to API format Array<{ exerciseId, estimatedSets }>
  - [x] Subtask 2.5: Handle empty workout.sets array (return early, no API call)

- [x] Task 3: Trigger forecast on workout changes with debouncing (AC: 5)
  - [x] Subtask 3.1: Create debounced fetchForecast using useMemo with custom debounce
  - [x] Subtask 3.2: Add useEffect watching workout.sets and mode state
  - [x] Subtask 3.3: Call fetchForecast(workout.sets) only when mode === 'planning'
  - [x] Subtask 3.4: Cleanup debounce on unmount with fetchForecast.cancel()
  - [x] Subtask 3.5: Set 500ms debounce delay to avoid excessive API calls

- [x] Task 4: Create forecast display panel UI (AC: 3, 6)
  - [x] Subtask 4.1: Add forecast panel section in planning mode UI
  - [x] Subtask 4.2: Show "Calculating..." message when isForecastLoading === true
  - [x] Subtask 4.3: Show "Add exercises to see forecast" when !forecastData
  - [x] Subtask 4.4: Display muscle fatigue grid with Object.entries(forecastData.forecast)
  - [x] Subtask 4.5: Show muscle name and fatigue percentage for each muscle
  - [x] Subtask 4.6: Apply color-coded styling using getFatigueColorClass() helper

- [x] Task 5: Implement color-coded fatigue display (AC: 6)
  - [x] Subtask 5.1: Create getFatigueColorClass(fatigue: number) helper function
  - [x] Subtask 5.2: Return 'bg-red-900 text-white' for fatigue > 100 (dark red - bottleneck)
  - [x] Subtask 5.3: Return 'bg-red-700 text-white' for fatigue > 90 (red - high intensity)
  - [x] Subtask 5.4: Return 'bg-yellow-600 text-white' for fatigue > 60 (yellow - moderate)
  - [x] Subtask 5.5: Return 'bg-green-600 text-white' for fatigue <= 60 (green - safe)

- [x] Task 6: Display bottleneck warnings (AC: 4, 7)
  - [x] Subtask 6.1: Check if forecastData.bottlenecks.length > 0
  - [x] Subtask 6.2: Render warning section below forecast grid
  - [x] Subtask 6.3: Map over bottlenecks array and display each warning
  - [x] Subtask 6.4: Style with bg-red-900/20, border-red-500, rounded styling
  - [x] Subtask 6.5: Display bottleneck.message with ⚠️ emoji prefix

- [x] Task 7: Verify onAddToWorkout integration from Story 3.3 (AC: 5)
  - [x] Subtask 7.1: Confirm Story 3.3's onAddToWorkout callback updates workout.sets
  - [x] Subtask 7.2: Test that adding exercise triggers useEffect with workout.sets dependency
  - [x] Subtask 7.3: Verify debounced API call fires 500ms after workout.sets changes
  - [x] Subtask 7.4: Test that removing exercise also triggers forecast update

- [x] Task 8: Implement error handling (Error Handling)
  - [x] Subtask 8.1: Add try/catch around fetch API call
  - [x] Subtask 8.2: Handle network errors with user-friendly message
  - [x] Subtask 8.3: Parse error from API response { error: "message" } format
  - [x] Subtask 8.4: Display error message in forecast panel
  - [x] Subtask 8.5: Ensure isForecastLoading set to false in finally block

- [x] Task 9: Add comprehensive integration tests (Testing)
  - [x] Subtask 9.1: Test API call triggered when workout.sets changes in planning mode
  - [x] Subtask 9.2: Test POST request body structure (exercises array with exerciseId, estimatedSets)
  - [x] Subtask 9.3: Test debouncing behavior (500ms delay, cancels previous calls)
  - [x] Subtask 9.4: Test response parsing and forecast display
  - [x] Subtask 9.5: Test color-coded fatigue display for each zone (green, yellow, red, dark red)
  - [x] Subtask 9.6: Test bottleneck warning rendering
  - [x] Subtask 9.7: Test loading state (Calculating... message displayed)
  - [x] Subtask 9.8: Test error handling (network error, 500 error)
  - [x] Subtask 9.9: Test empty workout handling (no API call, show empty state)
  - [x] Subtask 9.10: Test cleanup on unmount (debounce.cancel() called)
  - [x] Subtask 9.11: Test mode switching (forecast only in planning mode, not executing mode)

## Dev Notes

### Learnings from Previous Story

**From Story 3-3-connect-exerciserecommendations-to-recommendation-api (Status: done)**

- **Frontend Integration Pattern Established**:
  - React component with component-local state using useState hooks (NO Context/Redux)
  - Fetch API calls with try/catch error handling
  - Loading state management with boolean state variable (isLoading pattern)
  - User-friendly error messages displayed via console logging or error display component
  - All state is component-local, communication via props and callbacks
  - No auto-refresh needed for this story (forecast is user-triggered)

- **API Integration Pattern** (from Story 3.3):
  ```typescript
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/endpoint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dependencies]);
  ```

- **Debouncing Pattern** (NEW for this story):
  - Use lodash/debounce or custom implementation
  - 500ms delay prevents excessive API calls during rapid changes
  - Must cleanup debounce on unmount to prevent memory leaks
  - useMemo ensures debounced function reference stays stable

- **Testing Patterns from Epic 3**:
  - Vitest test framework with React Testing Library
  - Mock fetch API for controlled test scenarios
  - Test loading states, error states, and success states
  - Test component integration (props, callbacks)
  - Edge case coverage: network errors, malformed data, empty responses
  - **NEW**: Test debouncing behavior (delay verification, cancel on rapid changes)

- **Backend Services Integration** (Epic 2 complete):
  - Forecast endpoint: POST `/api/forecast/workout` (implemented in Story 2.4)
  - All Epic 1 services tested and production-ready
  - All Epic 2 endpoints working and validated

- **CRITICAL DEPENDENCY from Story 3.3**:
  - Story 3.3's `onAddToWorkout` callback MUST update WorkoutBuilder's `workout.sets` state
  - This triggers the useEffect in this story (watching `workout.sets` dependency)
  - If Story 3.3 integration is broken, real-time forecast will NOT work
  - Verify this integration early in development

- **Created Files from Story 3.3**:
  - components/ExerciseRecommendations.tsx (modified) - Now uses API integration pattern
  - components/RecommendationCard.tsx (modified) - Enhanced with score badges and tooltips
  - components/__tests__/ExerciseRecommendations.integration.test.tsx (created) - 15 passing tests

- **Technical Decisions from Story 3.3**:
  - Component-local state management (no global state needed)
  - Type-safe TypeScript implementation with proper interfaces
  - Error handling with user-friendly messages
  - Comprehensive test coverage with meaningful assertions

[Source: .bmad-ephemeral/stories/3-3-connect-exerciserecommendations-to-recommendation-api.md#Dev-Agent-Record]

### Architecture Patterns

**Component Structure**:
- Location: `components/WorkoutBuilder.tsx` (EXISTING component - needs modification)
- State Management: Uses React `useState` hooks (NO Context/Redux)
- All state is component-local
- Communication via props and callbacks

**Existing Planning Mode Infrastructure** (from WorkoutBuilder.tsx):
- Mode state: `type BuilderMode = 'planning' | 'executing';` (line 24)
- Mode variable: `const [mode, setMode] = useState<BuilderMode>('planning');` (line 73)
- Planning mode types: `type PlanningMode = 'forward' | 'target';` (line 25)
- Planning mode state: `const [planningMode, setPlanningMode] = useState<PlanningMode>('forward');` (line 74)
- Planning mode UI exists - just needs forecast integration

**Replace Local Calculation with API Integration**:

Current implementation at line 253:
```typescript
calculateForecastedMuscleStates() // Local calculation function
```

Replace with API call pattern:
```typescript
const [forecastData, setForecastData] = useState<WorkoutForecastResponse | null>(null);
const [isForecastLoading, setIsForecastLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Debounced API call with useMemo
const fetchForecast = useMemo(
  () => debounce(async (workoutSets: Set[]) => {
    if (workoutSets.length === 0) {
      setForecastData(null);
      return;
    }

    try {
      setIsForecastLoading(true);
      const response = await fetch('/api/forecast/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercises: formatSetsForAPI(workoutSets)
        })
      });

      if (!response.ok) throw new Error('Failed to fetch forecast');
      const data = await response.json();
      setForecastData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setForecastData(null);
    } finally {
      setIsForecastLoading(false);
    }
  }, 500), // 500ms debounce
  []
);

// Trigger forecast on workout changes
useEffect(() => {
  if (mode === 'planning') {
    fetchForecast(workout.sets);
  }

  // Cleanup debounce on unmount
  return () => fetchForecast.cancel();
}, [workout.sets, mode, fetchForecast]);
```

**Data Formatting Helper**:
```typescript
function formatSetsForAPI(sets: Set[]): ForecastRequest['exercises'] {
  // Group sets by exercise
  const exerciseMap = new Map<string, Array<{ reps: number; weight: number }>>();

  sets.forEach(set => {
    if (!exerciseMap.has(set.exerciseId)) {
      exerciseMap.set(set.exerciseId, []);
    }
    exerciseMap.get(set.exerciseId)!.push({
      reps: set.reps,
      weight: set.weight
    });
  });

  // Convert to API format
  return Array.from(exerciseMap.entries()).map(([exerciseId, estimatedSets]) => ({
    exerciseId,
    estimatedSets
  }));
}
```

**Forecast Display Panel** (add to planning mode UI):
```typescript
{mode === 'planning' && (
  <div className="bg-brand-surface p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-3">Workout Forecast</h3>

    {isForecastLoading ? (
      <div className="text-slate-400">Calculating...</div>
    ) : !forecastData ? (
      <div className="text-slate-400">Add exercises to see forecast</div>
    ) : (
      <>
        {/* Forecast heat map or bar chart */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {Object.entries(forecastData.forecast).map(([muscle, fatigue]) => (
            <div
              key={muscle}
              className={`p-2 rounded ${getFatigueColorClass(fatigue)}`}
            >
              <div className="text-sm font-medium">{muscle}</div>
              <div className="text-lg font-bold">{Math.round(fatigue)}%</div>
            </div>
          ))}
        </div>

        {/* Bottleneck warnings */}
        {forecastData.bottlenecks.length > 0 && (
          <div className="space-y-2">
            {forecastData.bottlenecks.map((bottleneck, idx) => (
              <div key={idx} className="bg-red-900/20 border border-red-500 p-3 rounded">
                <span className="text-red-400 font-semibold">⚠️ {bottleneck.message}</span>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)}
```

**Color Coding Helper**:
```typescript
function getFatigueColorClass(fatigue: number): string {
  if (fatigue > 100) return 'bg-red-900 text-white'; // Dark red - bottleneck
  if (fatigue > 90) return 'bg-red-700 text-white'; // Red - high intensity
  if (fatigue > 60) return 'bg-yellow-600 text-white'; // Yellow - moderate
  return 'bg-green-600 text-white'; // Green - safe zone
}
```

**Data Flow**:
1. User adds exercise via Story 3.3's ExerciseRecommendations component
2. `onAddToWorkout` callback updates WorkoutBuilder's `workout.sets` state
3. useEffect detects `workout.sets` change and triggers debounced `fetchForecast()`
4. After 500ms delay, API call fires to POST `/api/forecast/workout`
5. API returns forecast data with muscle fatigue percentages and bottleneck warnings
6. Component displays color-coded forecast panel with warnings
7. User adjusts sets (add/remove exercises) → Debounced API call updates forecast

**15 Muscle Groups** (consistent across all services):
Pectoralis, Lats, AnteriorDeltoids, PosteriorDeltoids, Trapezius, Rhomboids, LowerBack, Core, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

### Project Structure Notes

**File Locations**:
- Component: `components/WorkoutBuilder.tsx` (EXISTING - needs modification)
- API Endpoint: `backend/server.ts` (EXISTING - POST /api/forecast/workout implemented in Story 2.4)
- Tests: `components/__tests__/` (EXISTING directory - add integration test)
- Debounce utility: Use lodash/debounce (likely already installed) or implement custom

**Dependencies**:
- Story 2.4: Forecast endpoint (COMPLETE ✅) - API endpoint exists and working
- Story 3.3: ExerciseRecommendations integration (COMPLETE ✅) - onAddToWorkout callback must work
- WorkoutBuilder component (EXISTING ✅) - component exists with planning mode infrastructure
- lodash/debounce: For debouncing API calls (check package.json, install if needed)

**Integration Points**:
- API endpoint: POST `/api/forecast/workout` (implemented in Story 2.4)
- workout.sets state: Triggers useEffect when exercises added/removed
- mode state: Forecast only active in planning mode, not executing mode
- Story 3.3 dependency: onAddToWorkout MUST update workout.sets for real-time updates

**No Conflicts Expected**:
- Modifying existing WorkoutBuilder component
- Replacing local calculateForecastedMuscleStates with API call
- API endpoint already implemented and tested in Story 2.4
- Existing UI patterns for panels, grids, color coding

### References

**Primary Sources**:
- [Source: docs/epics.md#Story-3.4] - Acceptance criteria, technical notes, and integration details
- [Source: docs/architecture.md#Pattern-3-Frontend-API-Integration] - Frontend integration patterns, error handling
- [Source: components/WorkoutBuilder.tsx] - Existing component interface, planning mode infrastructure
- [Source: .bmad-ephemeral/stories/2-4-implement-workout-forecast-endpoint.md] - API endpoint implementation details
- [Source: .bmad-ephemeral/stories/3-3-connect-exerciserecommendations-to-recommendation-api.md] - Previous story learnings and frontend patterns

**Implementation Pattern**:
Follow the same pattern established in Stories 3.1, 3.2, and 3.3 for frontend API integration:
1. Component-local state management with useState
2. Fetch API call in useEffect with proper dependencies
3. Loading state with skeleton UI
4. Error handling with user-friendly messages
5. Data transformation to match component props interface
6. Integration tests with Vitest + React Testing Library
7. **NEW**: Debouncing to optimize API calls during rapid changes

**API Documentation**:
- Endpoint: POST `/api/forecast/workout`
- Request: `{ exercises: Array<{ exerciseId: string, estimatedSets: Array<{ reps: number, weight: number }> }> }`
- Response: `{ forecast: Record<Muscle, number>, warnings: string[], bottlenecks: Array<{ muscle: Muscle, projectedFatigue: number, message: string }> }`

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/3-4-connect-workoutbuilder-to-forecast-api-real-time-preview.context.xml`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

**Implementation Plan:**
1. Update API types to match story requirements (forecast, bottlenecks fields)
2. Add state variables for forecastData, isForecastLoading, error
3. Create custom debounce implementation (no lodash dependency)
4. Implement fetchForecast with API call to /api/forecast/workout
5. Create formatSetsForAPI helper to transform workout.sets to API format
6. Add useEffect to trigger forecast on workout.sets changes
7. Create forecast display panel UI with color-coded fatigue and bottleneck warnings
8. Implement comprehensive tests for debouncing, API integration, and UI rendering

### Completion Notes List

**Story 3.4 completed successfully!**

**Implementation Summary:**
- Added state variables for forecast data, loading state, and error handling
- Updated API types (WorkoutForecastRequest/Response) to match story requirements with forecast, warnings, and bottlenecks fields
- Created custom debounce implementation (no lodash dependency) with 500ms delay
- Implemented formatSetsForAPI helper that groups sets by exercise ID and formats for API
- Added fetchForecast function with debounced API call to POST /api/forecast/workout
- Created useEffect to trigger forecast when workout.sets changes in planning mode
- Implemented getFatigueColorClass helper for color-coded fatigue display (green, yellow, red, dark red)
- Added forecast display panel UI with muscle fatigue grid and bottleneck warnings
- Comprehensive error handling with user-friendly messages
- 13 passing tests covering all acceptance criteria

**Technical Decisions:**
- Custom debounce implementation avoids lodash dependency
- Forecast only triggers in planning mode, not executing mode
- Empty workout sets trigger early return (no API call)
- Debounce cleanup on unmount prevents memory leaks
- Color-coding thresholds: Green (0-60%), Yellow (61-90%), Red (91-100%), Dark Red (>100%)

**Integration Verified:**
- Story 3.3 onAddToWorkout callback properly updates workout.sets state
- useEffect dependency on workout.sets triggers forecast updates
- Debounced API calls prevent excessive requests during rapid changes
- Forecast panel displays alongside existing muscle visualization

### File List

- components/WorkoutBuilder.tsx (modified) - Added forecast state, API integration, debounced fetch, UI panel
- api.ts (modified) - Updated WorkoutForecastRequest/Response interfaces to match API spec
- components/__tests__/WorkoutBuilder.forecast.integration.test.tsx (created) - 13 comprehensive tests

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-12 | 1.0 | Story created |
| 2025-11-12 | 2.0 | Story completed - Forecast API integration with debouncing, color-coded display, and bottleneck warnings |
