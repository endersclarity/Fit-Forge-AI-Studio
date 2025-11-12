# Story 3.1: Connect WorkoutBuilder to Workout Completion API

Status: review

## Story

As a **user**,
I want **to see muscle fatigue immediately after completing a workout**,
So that **I understand the impact of my training session**.

## Acceptance Criteria

1. **Given** user finishes logging sets in WorkoutBuilder
   **When** user clicks "Complete Workout" button (existing `handleFinishWorkout()` function)
   **Then** frontend calls POST `/api/workouts/:id/complete` with request body structure:
   ```typescript
   {
     workoutId: number,
     exercises: Array<{
       exerciseId: string,
       sets: Array<{
         reps: number,
         weight: number,
         toFailure: boolean
       }>
     }>
   }
   ```

2. **And** it displays loading state using existing `isCompleting` state variable

3. **And** it receives API response matching `WorkoutCompletionResponse` interface:
   ```typescript
   {
     fatigue: Record<Muscle, number>, // 15 muscles with fatigue percentages
     baselineSuggestions: Array<{
       muscle: Muscle,
       oldMax: number,
       newMax: number,
       sessionVolume: number
     }>,
     summary: {
       totalVolume: number,
       prsAchieved: string[]
     }
   }
   ```

4. **And** if `baselineSuggestions.length > 0`, it:
   - Sets `baselineSuggestions` state
   - Sets `savedWorkoutId` state
   - Opens `BaselineUpdateModal` by setting `showBaselineModal` to true
   - Modal component already exists with correct props wiring

5. **And** it updates muscleStates by triggering parent component refresh (via `refreshMuscleStates()` callback or page navigation)

6. **And** it navigates to `/dashboard` using router after successful completion

7. **And** it handles errors with specific user-friendly messages:
   - Network error: "Unable to complete workout. Check your connection."
   - 404 error: "Workout not found. Please try again."
   - 500 error: "Calculation failed. Please contact support."
   - Display errors using existing error display pattern in component

## Tasks / Subtasks

- [x] Task 1: Update handleFinishWorkout() to call workout completion API (AC: 1)
  - [x] Subtask 1.1: Locate existing `handleFinishWorkout()` function in WorkoutBuilder.tsx (around line 587)
  - [x] Subtask 1.2: Identify existing `completeWorkout()` API call structure
  - [x] Subtask 1.3: Construct request body with workoutId and exercises array from component state
  - [x] Subtask 1.4: Ensure request structure matches API contract (exerciseId, sets with reps/weight/toFailure)
  - [x] Subtask 1.5: Add TypeScript type definitions for request body if not already defined

- [x] Task 2: Implement loading state management (AC: 2)
  - [x] Subtask 2.1: Verify `isCompleting` state variable exists (WorkoutBuilder.tsx line 78)
  - [x] Subtask 2.2: Set `isCompleting` to true before API call
  - [x] Subtask 2.3: Set `isCompleting` to false after completion (success or error)
  - [x] Subtask 2.4: Use `isCompleting` to disable Complete Workout button during API call
  - [x] Subtask 2.5: Display loading spinner or visual feedback in UI when isCompleting is true

- [x] Task 3: Handle API response and extract data (AC: 3)
  - [x] Subtask 3.1: Parse API response JSON to extract fatigue, baselineSuggestions, summary
  - [x] Subtask 3.2: Verify response structure matches WorkoutCompletionResponse interface
  - [x] Subtask 3.3: Extract fatigue data (Record<Muscle, number>) for 15 muscles
  - [x] Subtask 3.4: Extract baselineSuggestions array (may be empty if no suggestions)
  - [x] Subtask 3.5: Extract summary data (totalVolume, prsAchieved)

- [x] Task 4: Implement baseline suggestion modal flow (AC: 4)
  - [x] Subtask 4.1: Check if baselineSuggestions array length > 0 after API response
  - [x] Subtask 4.2: Call setBaselineSuggestions() with API response data
  - [x] Subtask 4.3: Call setSavedWorkoutId() with workout ID from response or state
  - [x] Subtask 4.4: Call setShowBaselineModal(true) to open modal
  - [x] Subtask 4.5: Verify BaselineUpdateModal component is already rendered (WorkoutBuilder.tsx lines 1142-1152)
  - [x] Subtask 4.6: Verify modal props wiring (isOpen, updates, onConfirm, onDecline)
  - [x] Subtask 4.7: Do NOT navigate to dashboard if modal is shown (wait for user action)

- [x] Task 5: Trigger muscle states refresh (AC: 5)
  - [x] Subtask 5.1: Check if parent component provides refreshMuscleStates() callback prop
  - [x] Subtask 5.2: Call refreshMuscleStates() after successful API completion if callback exists
  - [x] Subtask 5.3: Alternatively, rely on navigation to /dashboard to refresh muscle states
  - [x] Subtask 5.4: Verify muscle states update propagates to dashboard components

- [x] Task 6: Implement navigation after completion (AC: 6)
  - [x] Subtask 6.1: Import useRouter hook from next/router or react-router-dom
  - [x] Subtask 6.2: If baselineSuggestions.length === 0, navigate to /dashboard immediately
  - [x] Subtask 6.3: If baselineSuggestions.length > 0, delay navigation until modal closed
  - [x] Subtask 6.4: Ensure navigation happens in both modal onConfirm and onDecline callbacks
  - [x] Subtask 6.5: Test navigation preserves state (no loss of fatigue data)

- [x] Task 7: Implement comprehensive error handling (AC: 7)
  - [x] Subtask 7.1: Wrap API call in try/catch block
  - [x] Subtask 7.2: Check response.ok before parsing JSON
  - [x] Subtask 7.3: Handle network errors (fetch rejects) with "Unable to complete workout. Check your connection."
  - [x] Subtask 7.4: Handle 404 status with "Workout not found. Please try again."
  - [x] Subtask 7.5: Handle 500 status with "Calculation failed. Please contact support."
  - [x] Subtask 7.6: Display error messages using existing error display pattern (toast, alert, or inline)
  - [x] Subtask 7.7: Ensure isCompleting is set to false in finally block
  - [x] Subtask 7.8: Log errors to console for debugging

- [x] Task 8: Add comprehensive integration tests (Testing)
  - [x] Subtask 8.1: Test successful workout completion with no baseline suggestions
  - [x] Subtask 8.2: Test successful workout completion with baseline suggestions (modal shown)
  - [x] Subtask 8.3: Test loading state management (isCompleting true during API call)
  - [x] Subtask 8.4: Test API request body structure matches contract
  - [x] Subtask 8.5: Test response parsing extracts fatigue, baselineSuggestions, summary
  - [x] Subtask 8.6: Test navigation to /dashboard after successful completion (no modal)
  - [x] Subtask 8.7: Test navigation delayed when modal is shown
  - [x] Subtask 8.8: Test network error handling and message display
  - [x] Subtask 8.9: Test 404 error handling and message display
  - [x] Subtask 8.10: Test 500 error handling and message display
  - [x] Subtask 8.11: Test baseline modal props wiring (isOpen, updates, onConfirm, onDecline)
  - [x] Subtask 8.12: Test muscle states refresh after completion

## Dev Notes

### Learnings from Previous Story

**From Story 2-4-implement-workout-forecast-endpoint (Status: done)**

- **API Endpoint Pattern Established**: POST `/api/workouts/:id/complete` exists at server.ts:1017-1146
  - TypeScript interfaces inline for request/response
  - Error handling: try/catch with 400 (validation), 404 (not found), 500 (service failures)
  - Direct JSON responses (no wrapper)
  - Returns fatigue data, baseline suggestions, and summary

- **Backend Service Integration Complete**:
  - Fatigue calculator: `calculateMuscleFatigue()` from `backend/services/fatigueCalculator.js` (Story 1.1) ✅
  - Recovery calculator: `calculateRecovery()` from `backend/services/recoveryCalculator.js` (Story 1.2) ✅
  - Baseline update trigger: `checkBaselineUpdates()` from `backend/services/baselineCalculator.js` (Story 1.4) ✅
  - All services tested and production-ready

- **API Response Structure** (from Story 2.1):
  ```typescript
  {
    fatigue: {
      Pectoralis: 45.2,
      Quadriceps: 67.8,
      // ... all 15 muscles
    },
    baselineSuggestions: [
      {
        muscle: "Quadriceps",
        oldMax: 100,
        newMax: 120,
        sessionVolume: 2500
      }
    ],
    summary: {
      totalVolume: 12500,
      prsAchieved: ["Barbell Squats", "Bench Press"]
    }
  }
  ```

- **15 Muscle Groups** (consistent across all services):
  Pectoralis, Lats, AnteriorDeltoids, PosteriorDeltoids, Trapezius, Rhomboids, LowerBack, Core, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

- **Testing Patterns from Epic 2**:
  - Vitest test framework with comprehensive coverage
  - Mock API calls for unit tests
  - Integration tests with real API endpoints
  - Test all acceptance criteria with dedicated test cases
  - Edge case coverage: network errors, empty responses, malformed data

**Key Interfaces to Reuse**:
- Workout completion endpoint: POST `/api/workouts/:id/complete` (already implemented in Story 2.1)
- BaselineUpdateModal component: Already exists at `components/BaselineUpdateModal.tsx`
- State variables: `isCompleting`, `showBaselineModal`, `baselineSuggestions`, `savedWorkoutId` (already declared)

**Technical Decisions Applied**:
- Early input validation (validate workoutId and exercises array)
- Comprehensive error handling with user-friendly messages
- TypeScript type safety for API requests/responses
- Loading state management for better UX
- Navigation flow based on baseline suggestions presence

[Source: .bmad-ephemeral/stories/2-4-implement-workout-forecast-endpoint.md#Dev-Agent-Record]

### Architecture Patterns

**Frontend Component Structure** (from architecture.md and existing WorkoutBuilder.tsx):
- Location: `components/WorkoutBuilder.tsx` (existing file - modify existing function)
- Function: `handleFinishWorkout()` starting at line 587 (already has partial implementation)
- State Management: Uses React `useState` hooks (NO Context/Redux)
- All state is component-local
- Communication with dashboard via navigation (not shared state)

**Existing State Variables** (from WorkoutBuilder.tsx):
- `isCompleting` (line 78) - boolean for loading state during API call
- `showBaselineModal` (line 103) - boolean to control BaselineUpdateModal visibility
- `baselineSuggestions` (line 104) - array to store baseline update suggestions
- `savedWorkoutId` (line 105) - number to track completed workout ID

**Existing Component Integration**:
- `BaselineUpdateModal` component already imported and rendered (lines 1142-1152)
- Props already wired: `isOpen={showBaselineModal}`, `updates={baselineSuggestions}`, `onConfirm`, `onDecline`
- Modal implementation at `components/BaselineUpdateModal.tsx`

**API Integration Pattern** (from architecture.md):
```typescript
// Add after line 606 in handleFinishWorkout():
if (completionResponse.baselineSuggestions && completionResponse.baselineSuggestions.length > 0) {
  setBaselineSuggestions(completionResponse.baselineSuggestions);
  setSavedWorkoutId(saveResponse.workout_id);
  setShowBaselineModal(true);
  // Do NOT navigate yet - wait for user to confirm/decline baseline updates
} else {
  // No baseline suggestions, navigate immediately
  router.push('/dashboard');
}
```

**Error Handling Pattern**:
- Wrap API call in try/catch
- Check `response.ok` before parsing JSON
- Parse error from `{ error: "message" }` response format
- Display user-friendly messages using existing error display pattern
- Set `isCompleting` to false in finally block

**Navigation Flow**:
1. Complete workout → API call → Success
2. IF baseline suggestions exist → Show modal → User chooses
3. ELSE → Navigate to dashboard immediately
4. Modal closed (confirm or decline) → Navigate to dashboard

### Data Flow

**Request Flow**:
1. User clicks "Complete Workout" button in WorkoutBuilder
2. Set `isCompleting` to true (show loading state)
3. Construct request body from component state (workoutId, exercises with sets)
4. Call POST `/api/workouts/:id/complete` with request body
5. Backend processes workout completion (fatigue calculation, baseline checks)
6. Backend returns response with fatigue, baselineSuggestions, summary
7. Frontend parses response and extracts data
8. IF baselineSuggestions.length > 0:
   - Store suggestions in state
   - Open BaselineUpdateModal
   - Wait for user action (confirm or decline)
   - Navigate to /dashboard after modal closed
9. ELSE:
   - Navigate to /dashboard immediately
10. Set `isCompleting` to false (hide loading state)

**Request Body Structure**:
```typescript
{
  workoutId: 123,
  exercises: [
    {
      exerciseId: "bench-press",
      sets: [
        { reps: 10, weight: 185, toFailure: false },
        { reps: 8, weight: 195, toFailure: false },
        { reps: 6, weight: 205, toFailure: true }
      ]
    },
    {
      exerciseId: "barbell-squats",
      sets: [
        { reps: 12, weight: 225, toFailure: false },
        { reps: 10, weight: 245, toFailure: false },
        { reps: 8, weight: 265, toFailure: false }
      ]
    }
  ]
}
```

**Response Structure**:
```typescript
{
  fatigue: {
    Pectoralis: 45.2,
    Lats: 12.5,
    AnteriorDeltoids: 38.7,
    // ... all 15 muscles
  },
  baselineSuggestions: [
    {
      muscle: "Quadriceps",
      oldMax: 100,
      newMax: 120,
      sessionVolume: 2500
    },
    {
      muscle: "Pectoralis",
      oldMax: 95,
      newMax: 110,
      sessionVolume: 1800
    }
  ],
  summary: {
    totalVolume: 12500,
    prsAchieved: ["Barbell Squats", "Bench Press"]
  }
}
```

**Component State Updates**:
- `isCompleting`: true during API call, false after completion
- `baselineSuggestions`: populated from API response if suggestions exist
- `savedWorkoutId`: set to workout ID after successful completion
- `showBaselineModal`: true if baselineSuggestions.length > 0
- muscleStates: refreshed via callback or navigation to dashboard

### Testing Standards

**Test Framework**: React Testing Library with Vitest

**Test Location**: `components/__tests__/WorkoutBuilder.integration.test.tsx` or similar

**Test Cases Required**:
1. **Happy Path (No Baseline Suggestions)**: Valid workout → API call → Navigate to dashboard
2. **Happy Path (With Baseline Suggestions)**: Valid workout → API call → Modal shown → User confirms → Navigate to dashboard
3. **Loading State**: Verify `isCompleting` is true during API call and false after
4. **Request Body Structure**: Verify request body matches API contract (workoutId, exercises array)
5. **Response Parsing**: Verify fatigue, baselineSuggestions, summary extracted correctly
6. **Baseline Modal Flow**: Verify modal opens when suggestions exist, navigation delayed
7. **Baseline Modal Props**: Verify modal receives correct props (isOpen, updates, onConfirm, onDecline)
8. **Navigation (No Modal)**: Verify immediate navigation when no suggestions
9. **Navigation (With Modal)**: Verify delayed navigation after modal closed
10. **Network Error**: Verify error message "Unable to complete workout. Check your connection."
11. **404 Error**: Verify error message "Workout not found. Please try again."
12. **500 Error**: Verify error message "Calculation failed. Please contact support."
13. **Error State Management**: Verify `isCompleting` is false after error
14. **Muscle States Refresh**: Verify refreshMuscleStates() called or navigation triggers refresh

**Mock Strategy**:
- Mock `fetch()` or API client for controlled test scenarios
- Mock router navigation to verify route transitions
- Mock parent component callbacks (e.g., refreshMuscleStates)
- Test with real BaselineUpdateModal component to verify integration
- Mock API responses (success, errors, edge cases)

**Test Data**:
- Valid workout with multiple exercises and sets
- Empty baseline suggestions array
- Non-empty baseline suggestions array
- Network error response
- 404 response
- 500 response

### Project Structure Notes

**File Locations**:
- Component: `components/WorkoutBuilder.tsx` (EXISTING FILE - modify handleFinishWorkout function)
- Modal: `components/BaselineUpdateModal.tsx` (EXISTING - already integrated)
- API Endpoint: `backend/server.ts` (EXISTING - POST /api/workouts/:id/complete at lines 1017-1146)
- Tests: `components/__tests__/` (EXISTING directory - add integration test)

**Dependencies**:
- Story 2.1: Workout completion endpoint (COMPLETE ✅) - API endpoint exists and working
- BaselineUpdateModal component (COMPLETE ✅) - component exists and props wired
- State variables (COMPLETE ✅) - isCompleting, showBaselineModal, baselineSuggestions, savedWorkoutId declared
- Existing infrastructure: React components, router, state management

**Integration Points**:
- API endpoint: POST `/api/workouts/:id/complete` (implemented in Story 2.1)
- BaselineUpdateModal: Opens when baseline suggestions exist
- RecoveryDashboard: Receives updated muscle states after navigation
- Router: Navigates to /dashboard after completion

**No Conflicts Expected**:
- Modifying existing handleFinishWorkout() function (additive change to existing implementation)
- Uses existing state variables (no new state needed)
- Uses existing modal component (no modifications needed)
- API endpoint already implemented and tested

### References

**Primary Sources**:
- [Source: docs/epics.md#Story-3.1] - Acceptance criteria, technical notes, and integration details
- [Source: docs/architecture.md] - API patterns, error handling, frontend integration patterns
- [Source: components/WorkoutBuilder.tsx] - Existing component structure, state variables, handleFinishWorkout function
- [Source: components/BaselineUpdateModal.tsx] - Modal component interface and props
- [Source: .bmad-ephemeral/stories/2-1-implement-workout-completion-endpoint.md] - API endpoint implementation details
- [Source: .bmad-ephemeral/stories/2-4-implement-workout-forecast-endpoint.md] - Previous story learnings

**Implementation Pattern**:
```typescript
// components/WorkoutBuilder.tsx - Modify handleFinishWorkout() function

const handleFinishWorkout = async () => {
  // Set loading state
  setIsCompleting(true);
  setError(null);

  try {
    // Construct request body
    const requestBody = {
      workoutId: currentWorkout.id,
      exercises: currentWorkout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          toFailure: set.toFailure
        }))
      }))
    };

    // Call API endpoint
    const response = await fetch(`${API_BASE_URL}/api/workouts/${currentWorkout.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // Check for errors
    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 404) {
        throw new Error('Workout not found. Please try again.');
      } else if (response.status === 500) {
        throw new Error('Calculation failed. Please contact support.');
      } else {
        throw new Error(errorData.error || 'Failed to complete workout');
      }
    }

    // Parse response
    const completionResponse = await response.json();

    // Extract data
    const { fatigue, baselineSuggestions, summary } = completionResponse;

    // Handle baseline suggestions
    if (baselineSuggestions && baselineSuggestions.length > 0) {
      setBaselineSuggestions(baselineSuggestions);
      setSavedWorkoutId(currentWorkout.id);
      setShowBaselineModal(true);
      // Do NOT navigate yet - wait for user to confirm/decline baseline updates
    } else {
      // No baseline suggestions, navigate immediately
      router.push('/dashboard');
    }

    // Trigger muscle states refresh (if callback provided)
    if (refreshMuscleStates) {
      refreshMuscleStates();
    }

  } catch (error: any) {
    // Handle network errors
    if (error.message.includes('fetch')) {
      setError('Unable to complete workout. Check your connection.');
    } else {
      setError(error.message);
    }
    console.error('Workout completion error:', error);
  } finally {
    // Always clear loading state
    setIsCompleting(false);
  }
};

// Ensure modal callbacks navigate to dashboard
const handleBaselineConfirm = async (updates: BaselineUpdate[]) => {
  // ... existing confirm logic
  setShowBaselineModal(false);
  router.push('/dashboard');
};

const handleBaselineDecline = () => {
  setShowBaselineModal(false);
  router.push('/dashboard');
};
```

**Key Implementation Notes**:
- Modify existing `handleFinishWorkout()` function (don't recreate from scratch)
- Use existing state variables (isCompleting, showBaselineModal, baselineSuggestions, savedWorkoutId)
- Follow existing error handling pattern in component
- Ensure loading state is always cleared (use finally block)
- Navigate to /dashboard only after modal closed or if no suggestions
- Handle all 3 error types with specific messages
- Validate API response structure before accessing properties
- Use TypeScript for type safety

**Testing Approach**:
- Integration tests: Test full workflow from button click to navigation
- Mock API responses for success and error scenarios
- Test loading state transitions
- Test modal flow (open, confirm, decline, navigate)
- Test error handling and message display
- Verify request body structure
- Verify response parsing

## Dev Agent Record

### Context Reference

- .bmad-ephemeral/stories/3-1-connect-workoutbuilder-to-workout-completion-api.context.xml

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

Implementation Plan (2025-11-11):
1. Added useNavigate hook from react-router-dom to WorkoutBuilder component
2. Created isCompleting state variable for loading state management (AC2)
3. Updated handleFinishWorkout() to properly call completeWorkout API (AC1)
4. Implemented response parsing to extract fatigue, baselineSuggestions, and summary (AC3)
5. Added conditional logic for baseline modal display (AC4)
6. Implemented navigation to /dashboard based on baseline suggestions presence (AC6)
7. Enhanced error handling with specific user-friendly messages (AC7)
8. Updated button states to use isCompleting instead of loading
9. Modified modal handlers to navigate to dashboard after closing (AC6)
10. Created comprehensive integration tests covering all acceptance criteria

### Completion Notes List

**Story 3.1 Implementation Complete (2025-11-11)**

All tasks and acceptance criteria successfully implemented:

**AC1 - API Integration**: handleFinishWorkout() now properly calls POST /api/workouts/:id/complete after saving workout via builderAPI. Request structure matches backend contract.

**AC2 - Loading State**: Added isCompleting state variable that is set to true before API call and false in finally block. Both "Complete Workout" buttons now use isCompleting to disable during API call and show "Completing..." text.

**AC3 - Response Parsing**: Response destructuring extracts fatigue, baselineSuggestions, and summary objects from WorkoutCompletionResponse interface.

**AC4 - Baseline Modal Flow**: Conditional logic checks if baselineSuggestions.length > 0 and sets appropriate state variables (baselineSuggestions, savedWorkoutId, showBaselineModal) to trigger modal display. Navigation is delayed until modal is closed.

**AC5 - Muscle States Refresh**: Muscle states are refreshed via navigation to /dashboard, which triggers dashboard component remount and data fetch.

**AC6 - Navigation**: Implemented useNavigate hook from react-router-dom. Navigation to /dashboard occurs immediately if no baseline suggestions, or after modal closed (both confirm and decline handlers).

**AC7 - Error Handling**: Comprehensive try/catch with specific error messages:
- Network errors: "Unable to complete workout. Check your connection."
- 404 errors: "Workout not found. Please try again."
- 500 errors: "Calculation failed. Please contact support."
All errors logged to console for debugging.

**Testing**: Created comprehensive integration test suite (WorkoutBuilder.completion.test.tsx) with 15 tests covering all acceptance criteria, error handling, and integration workflows. All tests passing.

**Technical Decisions**:
- Used React Router's useNavigate instead of Next.js router (project uses React Router)
- Maintained existing BaselineUpdateModal integration (no changes to modal component)
- isCompleting state variable preferred over reusing loading state for clarity
- Error detection based on error message content (fetch, 404, 500)
- Navigation triggers muscle state refresh naturally via component lifecycle

### File List

**Modified:**
- components/WorkoutBuilder.tsx - Updated handleFinishWorkout(), added isCompleting state, implemented navigation

**Created:**
- components/WorkoutBuilder.completion.test.tsx - Comprehensive integration tests for Story 3.1
