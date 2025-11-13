# FitForge-Local - Epic Breakdown

**Author:** Kaelen
**Date:** 2025-11-10
**Project Level:** Level 3 (Brownfield Enhancement)
**Target Scale:** MVP Completion (11-17 hours estimated)

---

## Overview

This document provides the complete epic and story breakdown for FitForge-Local, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Epic Summary

FitForge-Local is 80% complete with working infrastructure (database, REST API, React UI, Docker, Railway deployment). This epic breakdown focuses on integrating the validated muscle intelligence algorithms from logic-sandbox into the existing application.

**4 Epics - Horizontal Integration Approach:**

1. **Muscle Intelligence Services** - Implement calculation layer (fatigue, recovery, recommendations)
2. **API Integration Layer** - Expose intelligence through 4 new REST endpoints
3. **Frontend Intelligence Integration** - Connect existing UI components to new APIs
4. **Integration Testing & MVP Launch** - Validate features and deploy to production

**Why Horizontal Slicing?** Validated algorithms + existing infrastructure = low risk. Building by layer enables pattern consistency, faster delivery, and comprehensive testing of the calculation layer before exposing it.

**Implementation Path**: Each epic enables the next, delivering incremental value while maintaining system integrity.

---

## Epic 1: Muscle Intelligence Services

**Goal**: Implement the core calculation layer that powers FitForge's muscle-aware training logic. Port validated algorithms from logic-sandbox into production-ready backend services.

**Value**: Enables accurate fatigue tracking, recovery projections, and intelligent exercise recommendations based on biomechanics research.

**Prerequisites**: Logic-sandbox algorithms validated ✅, database schema exists ✅, backend service folder structure exists ✅

---

### Story 1.1: Implement Fatigue Calculation Service

As a **backend service**,
I want **to calculate muscle-specific fatigue from workout data**,
So that **the app can accurately track how much each muscle group was worked**.

**Acceptance Criteria:**

**Given** a completed workout with sets (reps, weight, exercise)
**When** the fatigue calculation service processes the workout
**Then** it calculates total volume per muscle using the formula: `(reps × weight × muscleEngagement%) summed across all sets`

**And** it calculates fatigue percentage as: `(totalMuscleVolume / baseline) × 100`

**And** it returns fatigue data for all 15 muscle groups

**And** it tracks when muscles exceed baseline capacity (fatigue > 100%)

**Prerequisites:** None (first story in epic)

**Technical Notes:**
- Port logic from `logic-sandbox/scripts/calculate-workout-fatigue.mjs`
- Create `backend/services/fatigueCalculator.js`
- Use exercise data from `logic-sandbox/exercises.json` (48 validated exercises)
- Reference baseline data from database `muscle_baselines` table
- Formula validated in logic-sandbox with Legs Day A workout
- Must handle 15 muscle groups: Pectoralis, Latissimus Dorsi, Deltoids (Anterior), Deltoids (Posterior), Trapezius, Rhomboids, Erector Spinae, Obliques, Rectus Abdominis, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves

---

### Story 1.2: Implement Recovery Calculation Service

As a **backend service**,
I want **to calculate current recovery state for each muscle**,
So that **the app can show users when muscles will be ready for training**.

**Acceptance Criteria:**

**Given** a muscle with known fatigue percentage and workout timestamp
**When** the recovery calculation service is called with current time
**Then** it calculates hours elapsed since workout

**And** it applies linear recovery model: `recoveredPercentage = (hoursElapsed / 24) × 15%`

**And** it returns current fatigue as: `max(0, initialFatigue - recoveredPercentage)`

**And** it projects recovery at 24h, 48h, and 72h intervals

**And** it identifies when muscle will be fully recovered (fatigue = 0%)

**Prerequisites:** Story 1.1 (needs fatigue data structure)

**Technical Notes:**
- Port logic from `logic-sandbox/scripts/calculate-recovery.mjs`
- Create `backend/services/recoveryCalculator.js`
- Use 15% daily recovery rate (validated in logic-sandbox)
- Formula: Linear recovery model (MVP - simple and predictable)
- Must handle edge cases: muscles already recovered, muscles worked multiple days
- Return projections for dashboard visualization

---

### Story 1.3: Implement Exercise Recommendation Scoring Engine

As a **backend service**,
I want **to score and rank exercises based on multiple factors**,
So that **users get intelligent exercise suggestions that maximize efficiency and safety**.

**Acceptance Criteria:**

**Given** a target muscle group and current muscle recovery states
**When** the recommendation engine scores all available exercises
**Then** it applies 5-factor scoring algorithm:
- Target Muscle Match (40%): Higher score if exercise works the target muscle
- Muscle Freshness (25%): Higher score if supporting muscles are recovered
- Variety (15%): Higher score for exercises not recently performed
- User Preference (10%): Higher score for user's favorite exercises
- Primary/Secondary Balance (10%): Prefer exercises where target is primary

**And** it filters out exercises that would create bottlenecks (over-fatigued supporting muscles)

**And** it returns ranked list with scores and safety warnings

**And** it respects equipment availability filters

**Prerequisites:** Story 1.2 (needs recovery state data)

**Technical Notes:**
- Design documented in `logic-sandbox/workout-builder-recommendations.md`
- Create `backend/services/exerciseRecommender.js`
- Use 5-factor scoring with configurable weights
- Bottleneck detection: Warn if supporting muscle >80% fatigued
- Variety tracking: Query workout history for recent exercise usage
- Return top 10-15 ranked exercises with scores and warnings

---

### Story 1.4: Implement Baseline Update Trigger Logic

As a **backend service**,
I want **to detect when a user exceeds their muscle baseline capacity**,
So that **the app can prompt them to update their baseline and adapt to improved strength**.

**Acceptance Criteria:**

**Given** a completed workout with calculated muscle volumes
**When** the service compares muscle volumes to current baselines
**Then** it identifies any muscles where `muscleVolume > baseline`

**And** it calculates suggested new baseline as: `actualVolume achieved`

**And** it returns a list of baseline update suggestions

**And** it includes the date and workout context for the suggestion

**Prerequisites:** Story 1.1 (needs fatigue calculation with baseline comparison)

**Technical Notes:**
- Simple comparison logic (not an algorithm requiring sandbox validation)
- Implement in `backend/services/baselineUpdater.js`
- Trigger on workout completion
- Return suggestions in workout completion API response
- Frontend will display `BaselineUpdateModal` component (already exists)
- Track baseline history in `muscle_baselines` table

---

## Epic 2: API Integration Layer

**Goal**: Expose muscle intelligence services through clean REST endpoints that frontend can consume.

**Value**: Makes calculation services accessible to the UI, enabling real-time fatigue tracking, recovery visualization, exercise recommendations, and workout forecasting.

**Prerequisites**: Epic 1 complete (all 4 calculation services implemented) ✅

---

### Story 2.1: Implement Workout Completion Endpoint

As a **frontend application**,
I want **to submit a completed workout and receive fatigue calculations**,
So that **users can see how much each muscle was worked**.

**Acceptance Criteria:**

**Given** a completed workout with exercise sets data
**When** POST request sent to `/api/workouts/:id/complete`
**Then** the endpoint calls fatigue calculation service

**And** it calls baseline update trigger to check for exceeded baselines

**And** it stores muscle fatigue states in `muscle_states` table

**And** it returns response with:
- Fatigue percentages for all 15 muscles
- Baseline update suggestions (if any)
- Workout summary (total volume, PRs achieved)

**And** it returns 200 status on success or appropriate error status

**Prerequisites:** Epic 1 Stories 1.1, 1.4 (fatigue calculator and baseline trigger)

**Technical Notes:**
- Add endpoint to `backend/server.js`
- Request body: `{ workoutId, exercises: [{ exerciseId, sets: [{ reps, weight, toFailure }] }] }`
- Validate workout exists and belongs to user (future: auth check)
- Transaction: calculate fatigue → store states → check baselines → return
- Response format: `{ fatigue: {muscle: percentage}, baselineSuggestions: [], summary: {} }`
- Error handling: 404 if workout not found, 500 if calculation fails

---

### Story 2.2: Implement Recovery Timeline Endpoint

As a **frontend application**,
I want **to fetch current recovery state for all muscles**,
So that **users can see recovery progress and predictions**.

**Acceptance Criteria:**

**Given** a user with workout history
**When** GET request sent to `/api/recovery/timeline`
**Then** the endpoint queries latest muscle states from database

**And** it calls recovery calculation service for each muscle

**And** it returns current fatigue levels

**And** it returns recovery projections at 24h, 48h, 72h

**And** it identifies when each muscle will be fully recovered

**Prerequisites:** Epic 1 Story 1.2 (recovery calculator)

**Technical Notes:**
- Add endpoint to `backend/server.js`
- Query: Get latest `muscle_states` record for each of 15 muscles
- Call recovery service with current timestamp
- Response format: `{ muscles: [{ name, currentFatigue, projections: { 24h, 48h, 72h }, fullyRecoveredAt }] }`
- Handle edge case: No workout history (return all muscles at 0% fatigue)
- Cache considerations: Recovery state changes over time, keep cache short (<5 min)

---

### Story 2.3: Implement Exercise Recommendation Endpoint

As a **frontend application**,
I want **to request exercise recommendations for a target muscle**,
So that **users get intelligent suggestions based on recovery state**.

**Acceptance Criteria:**

**Given** a target muscle group and optional filters
**When** POST request sent to `/api/recommendations/exercises`
**Then** the endpoint fetches current recovery states for all muscles

**And** it calls exercise recommendation scoring engine

**And** it applies filters (equipment, exercise type)

**And** it returns top 10-15 ranked exercises with scores

**And** it includes safety warnings for bottleneck risks

**Prerequisites:** Epic 1 Story 1.3 (exercise recommender), Story 2.2 (recovery data)

**Technical Notes:**
- Add endpoint to `backend/server.js`
- Request body: `{ targetMuscle, filters: { equipment: [], excludeExercises: [] } }`
- Get current recovery state (call recovery calculator)
- Call recommendation engine with recovery data
- Response format: `{ recommendations: [{ exerciseId, name, score, factors: {}, warnings: [] }] }`
- Sort by score descending, limit to top 15
- Include breakdown of 5 scoring factors for transparency

---

### Story 2.4: Implement Workout Forecast Endpoint

As a **frontend application**,
I want **to preview fatigue impact before starting a workout**,
So that **users can plan workouts without creating bottlenecks**.

**Acceptance Criteria:**

**Given** a planned workout with exercises and estimated sets
**When** POST request sent to `/api/forecast/workout`
**Then** the endpoint fetches current recovery states

**And** it calculates predicted fatigue using fatigue calculator (without saving)

**And** it combines current fatigue + predicted additional fatigue

**And** it identifies bottleneck risks (muscles that would exceed safe thresholds)

**And** it returns forecast without modifying database

**Prerequisites:** Epic 1 Stories 1.1, 1.2 (fatigue + recovery calculators)

**Technical Notes:**
- Add endpoint to `backend/server.js`
- Request body: `{ exercises: [{ exerciseId, estimatedSets: [{ reps, weight }] }] }`
- Read-only operation (no database writes)
- Get current muscle states → calculate additional fatigue from planned workout
- Response format: `{ forecast: { muscle: projectedFatigue }, warnings: [], bottlenecks: [] }`
- Flag bottlenecks: muscles that would go >100% fatigue
- Real-time use case: Update as user adds/removes exercises in WorkoutBuilder

---

## Epic 3: Frontend Intelligence Integration

**Goal**: Connect existing UI components to new muscle intelligence APIs, making features visible and interactive.

**Value**: Users experience the muscle-aware intelligence through intuitive visualizations and real-time feedback.

**Prerequisites**: Epic 2 complete (all 4 API endpoints working) ✅

---

### Story 3.1: Connect WorkoutBuilder to Workout Completion API

As a **user**,
I want **to see muscle fatigue immediately after completing a workout**,
So that **I understand the impact of my training session**.

**Acceptance Criteria:**

**Given** user finishes logging sets in WorkoutBuilder
**When** user clicks "Complete Workout" button (existing `handleFinishWorkout()` function at [WorkoutBuilder.tsx:587](components/WorkoutBuilder.tsx#L587))
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

**And** it displays loading state using existing `isCompleting` state variable ([WorkoutBuilder.tsx:78](components/WorkoutBuilder.tsx#L78))

**And** it receives API response matching `WorkoutCompletionResponse` interface from [api.ts](api.ts):
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

**And** if `baselineSuggestions.length > 0`, it:
- Sets `baselineSuggestions` state ([WorkoutBuilder.tsx:104](components/WorkoutBuilder.tsx#L104))
- Sets `savedWorkoutId` state ([WorkoutBuilder.tsx:105](components/WorkoutBuilder.tsx#L105))
- Opens `BaselineUpdateModal` by setting `showBaselineModal` to true ([WorkoutBuilder.tsx:106](components/WorkoutBuilder.tsx#L106))
- Modal component already exists at [WorkoutBuilder.tsx:1142-1152](components/WorkoutBuilder.tsx#L1142-L1152) with correct props wiring

**And** it updates muscleStates by triggering parent component refresh (already handled by existing `refreshMuscleStates()` callback prop or page navigation)

**And** it navigates to `/dashboard` using router after successful completion

**And** it handles errors with specific user-friendly messages:
- Network error: "Unable to complete workout. Check your connection."
- 404 error: "Workout not found. Please try again."
- 500 error: "Calculation failed. Please contact support."
- Display errors using existing error display pattern in component

**Prerequisites:** Epic 2 Story 2.1 (completion endpoint exists and working)

**Technical Notes:**

**File to modify**: [components/WorkoutBuilder.tsx](components/WorkoutBuilder.tsx)

**Existing state variables** (already declared, just use them):
- `isCompleting` ([line 78](components/WorkoutBuilder.tsx#L78)) - set true during API call
- `showBaselineModal` ([line 103](components/WorkoutBuilder.tsx#L103)) - controls modal visibility
- `baselineSuggestions` ([line 104](components/WorkoutBuilder.tsx#L104)) - stores suggestions
- `savedWorkoutId` ([line 105](components/WorkoutBuilder.tsx#L105)) - tracks completed workout ID

**Function to modify**: `handleFinishWorkout()` starting at [line 587](components/WorkoutBuilder.tsx#L587)
- Already has partial implementation with `completeWorkout()` API call at [line 587](components/WorkoutBuilder.tsx#L587)
- Need to add baseline suggestion handling after existing success logic (around [line 606](components/WorkoutBuilder.tsx#L606))

**Existing components to integrate**:
- `BaselineUpdateModal` already imported and rendered at [lines 1142-1152](components/WorkoutBuilder.tsx#L1142-L1152)
- Props already wired: `isOpen={showBaselineModal}`, `updates={baselineSuggestions}`, `onConfirm`, `onDecline`
- Modal component implementation at [components/BaselineUpdateModal.tsx](components/BaselineUpdateModal.tsx)

**State management pattern**: Uses `useState` hooks throughout component, NO Context/Redux
- All state is component-local
- Communication with dashboard via navigation (not shared state)

**API integration**:
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

**Error handling pattern**:
- Wrap API call in try/catch
- Set error state variable or display toast notification
- Keep existing error patterns in component

**Navigation flow**:
1. Complete workout → API call → Success
2. IF baseline suggestions exist → Show modal → User chooses
3. ELSE → Navigate to dashboard immediately
4. Modal closed → Navigate to dashboard

**Data structures from actual API response** (refer to Epic 2 Story 2.1 for exact format):
- `fatigue`: Object with 15 muscle names as keys, percentages as values
- `baselineSuggestions`: Array matching `BaselineUpdate` interface from [BaselineUpdateModal.tsx:4-9](components/BaselineUpdateModal.tsx#L4-L9)

---

### Story 3.2: Connect RecoveryDashboard to Recovery Timeline API

As a **user**,
I want **to see real-time recovery progress for all muscles**,
So that **I know which muscles are ready for training**.

**Acceptance Criteria:**

**Given** user navigates to dashboard page
**When** RecoveryDashboard component mounts
**Then** it calls GET `/api/recovery/timeline` using fetch or axios

**And** it displays loading state with skeleton UI while fetching (create skeleton component or use existing loading pattern)

**And** it receives API response structure:
```typescript
{
  muscles: Array<{
    name: Muscle,
    currentFatigue: number,
    projections: {
      '24h': number,
      '48h': number,
      '72h': number
    },
    fullyRecoveredAt: Date | null
  }>
}
```

**And** it passes response data to `RecoveryTimelineView` component with required props:
- `muscleStates`: Transform API response into `MuscleStatesResponse` format
- `onMuscleClick`: Callback that displays detailed muscle info modal or panel

**And** it displays current fatigue levels in heat map with color scale:
- 0-30% fatigue = green (ready)
- 31-60% fatigue = yellow (recovering)
- 61-100% fatigue = red (needs rest)

**And** it implements auto-refresh using `setInterval` with 60-second interval

**And** it cleans up interval on component unmount using useEffect cleanup function

**And** when user clicks a muscle in RecoveryTimelineView, it shows:
- Current fatigue percentage
- Recovery projections (24h/48h/72h)
- Estimated time to full recovery
- Last workout date for that muscle

**Prerequisites:** Epic 2 Story 2.2 (recovery timeline endpoint exists and working)

**Technical Notes:**

**File to modify**: `components/RecoveryDashboard.tsx` (or create if doesn't exist at this exact path)

**RecoveryTimelineView integration** (existing component at [components/RecoveryTimelineView.tsx](components/RecoveryTimelineView.tsx)):
- **Required props** (from [RecoveryTimelineView.tsx:6-9](components/RecoveryTimelineView.tsx#L6-L9)):
  ```typescript
  interface RecoveryTimelineViewProps {
    muscleStates: MuscleStatesResponse;
    onMuscleClick?: (muscleName: string) => void;
  }
  ```
- Component already handles grouping muscles by recovery status using `groupMusclesByRecovery` utility ([line 17](components/RecoveryTimelineView.tsx#L17))
- Component has built-in expand/collapse functionality with localStorage persistence ([line 15](components/RecoveryTimelineView.tsx#L15))
- Displays 3 groups: READY NOW (green), RECOVERING SOON (yellow), STILL FATIGUED (red)

**Data fetching implementation**:
```typescript
// Add to RecoveryDashboard component:
const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchRecoveryData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recovery/timeline');
      if (!response.ok) throw new Error('Failed to fetch recovery data');
      const data = await response.json();

      // Transform API response to MuscleStatesResponse format
      setMuscleStates(transformToMuscleStates(data));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchRecoveryData();

  // Auto-refresh every 60 seconds
  const intervalId = setInterval(fetchRecoveryData, 60000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, []);
```

**Data transformation helper**:
```typescript
// Transform API response to match MuscleStatesResponse type
function transformToMuscleStates(apiData: RecoveryTimelineResponse): MuscleStatesResponse {
  // Convert API format to format expected by RecoveryTimelineView
  // Refer to existing MuscleStatesResponse type definition
}
```

**Muscle click handler**:
```typescript
const handleMuscleClick = (muscleName: string) => {
  // Find muscle data from muscleStates
  const muscleData = muscleStates?.muscles?.find(m => m.name === muscleName);

  // Show modal or side panel with detailed info:
  // - Current fatigue: muscleData.currentFatigue
  // - Projections: muscleData.projections
  // - Recovery estimate: muscleData.fullyRecoveredAt

  // Options: Use existing modal pattern or create new detail panel
};
```

**Loading states**:
- While `isLoading === true`: Display skeleton UI (animated placeholder matching layout)
- Skeleton pattern: Gray boxes matching heat map and timeline layout
- Use existing loading pattern from other components if available

**Error handling**:
- Network error: "Unable to load recovery data. Check your connection."
- 500 error: "Server error. Please try again later."
- Display error in place of content with retry button

**Auto-refresh behavior**:
- Updates every 60 seconds to show recovery progress
- User sees fatigue percentages gradually decrease
- No jarring UI changes (smooth data updates)
- Cleanup interval on unmount to prevent memory leaks

**Component structure**:
```typescript
<RecoveryDashboard>
  {isLoading ? (
    <SkeletonLoader />
  ) : error ? (
    <ErrorDisplay message={error} onRetry={refetch} />
  ) : (
    <>
      <HeatMap muscleStates={muscleStates} />
      <RecoveryTimelineView
        muscleStates={muscleStates}
        onMuscleClick={handleMuscleClick}
      />
    </>
  )}
</RecoveryDashboard>
```

**Type definitions needed** (refer to existing types in [types.ts](types.ts) or similar):
- `MuscleStatesResponse` - expected by RecoveryTimelineView
- `RecoveryTimelineResponse` - returned by API endpoint
- `Muscle` - enum or union type of 15 muscle names

**Integration with existing UI**:
- RecoveryTimelineView already exists and handles rendering
- Just needs correct data format via props
- Muscle click interaction enables drill-down to details

---

### Story 3.3: Connect ExerciseRecommendations to Recommendation API

As a **user**,
I want **to get smart exercise suggestions when building workouts**,
So that **I train efficiently without overworking fatigued muscles**.

**Acceptance Criteria:**

**Given** user is planning a workout in WorkoutBuilder
**When** user clicks "Get Recommendations" or selects target muscle
**Then** frontend calls POST `/api/recommendations/exercises` with request body:
```typescript
{
  targetMuscle: Muscle, // One of 15 muscle names
  filters: {
    equipment: string[], // Available equipment IDs
    excludeExercises: string[] // Recently used exercise IDs to exclude
  }
}
```

**And** it receives API response structure:
```typescript
{
  recommendations: Array<{
    exerciseId: string,
    name: string,
    score: number, // 0-100 composite score
    factors: {
      targetMatch: number, // 40% weight
      freshness: number, // 25% weight
      variety: number, // 15% weight
      preference: number, // 10% weight
      primarySecondary: number // 10% weight
    },
    warnings: string[] // e.g. ["Bottleneck: Hamstrings at 85%"]
  }>
}
```

**And** it displays ranked exercise list (top 10-15) with score badges

**And** it shows safety warnings with red badges for bottleneck risks (when supporting muscles >80% fatigued)

**And** it displays score breakdown tooltip when hovering over score showing all 5 factors

**And** user can click exercise to add it to workout (triggers `onAddToWorkout` callback prop)

**And** it filters by available equipment from user's equipment list

**Prerequisites:** Epic 2 Story 2.3 (recommendation endpoint exists and working)

**Technical Notes:**

**File to modify**: [components/ExerciseRecommendations.tsx](components/ExerciseRecommendations.tsx)

**Existing component props** (from [ExerciseRecommendations.tsx:19-24](components/ExerciseRecommendations.tsx#L19-L24)):
```typescript
interface ExerciseRecommendationsProps {
  muscleStates: MuscleStatesResponse;
  equipment: EquipmentItem[];
  selectedMuscles?: Muscle[];
  onAddToWorkout: (exercise: Exercise) => void;
}
```

**Component communication with WorkoutBuilder**:
- Component receives `onAddToWorkout` callback prop from parent
- When user clicks "Add to Workout" button on recommendation card, call: `onAddToWorkout(exercise)`
- WorkoutBuilder handles adding exercise to planned workout list
- This is existing pattern already used in component ([line 213](components/ExerciseRecommendations.tsx#L213), [line 236](components/ExerciseRecommendations.tsx#L236))
- **⚠️ CRITICAL INTEGRATION DEPENDENCY**: The `onAddToWorkout` callback MUST update WorkoutBuilder's `workout.sets` state. This triggers Story 3.4's useEffect (line 933 in 3.4) which calls the forecast API. If this state update doesn't happen, real-time forecast will NOT work.

**Existing recommendation calculation** (already implemented at [line 51](components/ExerciseRecommendations.tsx#L51)):
```typescript
const allRecommendations = useMemo(
  () => calculateRecommendations(muscleStates, equipment, selectedCategory || undefined, calibrations),
  [muscleStates, equipment, selectedCategory, calibrations]
);
```
- **Replace this** with API call to `/api/recommendations/exercises`
- Keep same useMemo pattern for performance
- Dependencies: `[selectedCategory, equipment, selectedMuscles, muscleStates]`

**Target muscle selection UI**:
- Add dropdown to select target muscle (15 options)
- Options: Pectoralis, Latissimus Dorsi, Deltoids (Anterior), Deltoids (Posterior), Trapezius, Rhomboids, Erector Spinae, Obliques, Rectus Abdominis, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves
- When muscle selected, trigger API call with that muscle as `targetMuscle`
- OR use existing `selectedMuscles` prop (already passed from parent at [line 29](components/ExerciseRecommendations.tsx#L29))

**API integration**:
```typescript
const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!selectedMuscles || selectedMuscles.length === 0) {
    setRecommendations([]);
    return;
  }

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recommendations/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMuscle: selectedMuscles[0], // Primary target
          filters: {
            equipment: equipment.map(e => e.id),
            excludeExercises: [] // TODO: Track recently used
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data.recommendations);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchRecommendations();
}, [selectedMuscles, equipment]);
```

**Recommendation display structure** (already exists at [lines 198-218](components/ExerciseRecommendations.tsx#L198-L218)):
- Component already renders `RecommendationCard` for each recommendation
- Props: `exercise`, `status`, `primaryMuscles`, `limitingFactors`, `explanation`, `equipmentAvailable`, `onAdd`, `isCalibrated`, `onViewEngagement`
- **CRITICAL MAPPING**: API response to RecommendationCard props:
  ```typescript
  // Map API recommendations to RecommendationCard format
  const mappedRecommendations = data.recommendations.map(rec => {
    // Fetch full Exercise object from EXERCISE_LIBRARY using rec.exerciseId
    const exercise = EXERCISE_LIBRARY.find(e => e.id === rec.exerciseId);
    if (!exercise) return null; // Skip if exercise not found

    // Map score to status
    const status = rec.score >= 80 ? 'excellent'
                 : rec.score >= 60 ? 'good'
                 : rec.score >= 40 ? 'suboptimal'
                 : 'not-recommended';

    // Extract primary muscles from exercise.muscleEngagements (engagement > 30%)
    const primaryMuscles = exercise.muscleEngagements
      .filter(e => e.percentage > 30)
      .map(e => e.muscle);

    // Use warnings as limiting factors
    const limitingFactors = rec.warnings;

    // Build explanation from score factors
    const explanation = `Score: ${rec.score} (Target: ${rec.factors.targetMatch}%, Fresh: ${rec.factors.freshness}%)`;

    return {
      exercise,
      status,
      primaryMuscles,
      limitingFactors,
      explanation,
      equipmentAvailable: true, // Already filtered by backend
      isCalibrated: false, // Check calibrations map if needed
    };
  }).filter(Boolean); // Remove nulls
  ```

**Score badge and tooltip**:
```typescript
<div className="relative group">
  <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">
    {Math.round(recommendation.score)}
  </span>

  {/* Tooltip on hover */}
  <div className="absolute hidden group-hover:block bg-gray-900 text-white p-3 rounded shadow-lg z-10 w-64">
    <div className="text-sm">
      <div>Target Match: {recommendation.factors.targetMatch}%</div>
      <div>Muscle Freshness: {recommendation.factors.freshness}%</div>
      <div>Variety: {recommendation.factors.variety}%</div>
      <div>Preference: {recommendation.factors.preference}%</div>
      <div>Primary/Secondary: {recommendation.factors.primarySecondary}%</div>
    </div>
  </div>
</div>
```

**Warning badges** (for bottleneck risks):
```typescript
{recommendation.warnings.length > 0 && (
  <div className="flex gap-2 mt-2">
    {recommendation.warnings.map((warning, idx) => (
      <span key={idx} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
        ⚠️ {warning}
      </span>
    ))}
  </div>
)}
```

**Equipment filtering**:
- Component already receives `equipment` prop (user's available equipment)
- Send equipment IDs in API request filters
- Backend will only return exercises that can be performed with available equipment

**Filter controls** (optional enhancement):
- Add checkbox "Exclude recent exercises" → Tracks last 7 days of workout history
- Add equipment type filter (if user has multiple types)
- Already has category tabs at [lines 191-195](components/ExerciseRecommendations.tsx#L191-L195) (Push/Pull/Legs/Core)

**Integration with existing UI patterns**:
- Component already has category tabs ([CategoryTabs component, line 191](components/ExerciseRecommendations.tsx#L191))
- Component already groups by status: excellent, good, suboptimal, not-recommended ([lines 90-93](components/ExerciseRecommendations.tsx#L90-L93))
- Use same grouping for API recommendations based on score thresholds:
  - 80-100 score = "excellent"
  - 60-79 score = "good"
  - 40-59 score = "suboptimal"
  - 0-39 score = "not-recommended"

**Error states**:
- Network error: "Unable to load recommendations. Check your connection."
- No recommendations: "No exercises match your criteria. Try different muscle or equipment."
- Display error using existing empty state pattern ([lines 157-166](components/ExerciseRecommendations.tsx#L157-L166))

**Loading states**:
- Show skeleton cards while `isLoading === true`
- Use existing empty state pattern or create skeleton placeholder

**Data flow**:
1. User selects target muscle (dropdown or prop from parent)
2. Component calls API with muscle + equipment filters
3. API returns ranked recommendations with scores/warnings
4. Component displays recommendations grouped by status
5. User clicks "Add to Workout" → `onAddToWorkout(exercise)` → WorkoutBuilder handles it

---

### Story 3.4: Connect WorkoutBuilder to Forecast API (Real-Time Preview)

As a **user**,
I want **to see predicted muscle fatigue as I add exercises**,
So that **I can plan balanced workouts without trial and error**.

**Acceptance Criteria:**

**Given** user is building a workout in WorkoutBuilder planning mode
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

**And** it receives API response structure:
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

**And** it displays predicted fatigue percentages next to each muscle in forecast panel

**And** it highlights bottleneck warnings (muscles that would exceed 100% fatigue) in red

**And** it updates forecast in real-time with debounced API calls (500ms delay after last change)

**And** it shows color-coded preview:
- Green (0-60%): Safe training zone
- Yellow (61-90%): Moderate intensity
- Red (91-100%): High intensity, approaching limit
- Dark red (>100%): Bottleneck - overtraining risk

**And** it displays critical bottleneck alerts with specific messaging: "⚠️ Hamstrings would reach 115% - risk of overtraining"

**Prerequisites:** Epic 2 Story 2.4 (forecast endpoint exists and working)

**Technical Notes:**

**File to modify**: [components/WorkoutBuilder.tsx](components/WorkoutBuilder.tsx)

**Existing planning mode infrastructure** (already implemented):
- **Mode state** at [line 24](components/WorkoutBuilder.tsx#L24): `type BuilderMode = 'planning' | 'executing';`
- **Mode state variable** at [line 73](components/WorkoutBuilder.tsx#L73): `const [mode, setMode] = useState<BuilderMode>('planning');`
- **Planning mode types** at [line 25](components/WorkoutBuilder.tsx#L25): `type PlanningMode = 'forward' | 'target';`
- **Planning mode state** at [line 74](components/WorkoutBuilder.tsx#L74): `const [planningMode, setPlanningMode] = useState<PlanningMode>('forward');`
- Planning mode UI exists - just needs forecast integration
- **⚠️ CRITICAL**: This story depends on Story 3.3's `onAddToWorkout` callback properly updating `workout.sets`. The useEffect at line 933 below watches `workout.sets` - if that state doesn't change when exercises are added, forecast won't update.

**Existing forecast calculation** (local, needs API replacement):
- **Function exists** at [line 253](components/WorkoutBuilder.tsx#L253): `calculateForecastedMuscleStates()`
- Currently calculates forecast locally using client-side logic
- **Replace with API call** to `/api/forecast/workout` for server-side calculation
- Keep same integration pattern with component state

**API integration with debouncing**:
```typescript
import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash/debounce'; // or implement custom debounce

// Add state for forecast
const [forecastData, setForecastData] = useState<WorkoutForecastResponse | null>(null);
const [isForecastLoading, setIsForecastLoading] = useState(false);

// Debounced API call
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
    } catch (err) {
      console.error('Forecast error:', err);
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

**Data formatting helper**:
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

**Forecast display panel** (add to planning mode UI):
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

**Color coding helper**:
```typescript
function getFatigueColorClass(fatigue: number): string {
  if (fatigue > 100) return 'bg-red-900 text-white'; // Dark red - bottleneck
  if (fatigue > 90) return 'bg-red-700 text-white'; // Red - high intensity
  if (fatigue > 60) return 'bg-yellow-600 text-white'; // Yellow - moderate
  return 'bg-green-600 text-white'; // Green - safe zone
}
```

**Bottleneck threshold**:
- Critical bottleneck: >100% fatigue (exceeds baseline capacity)
- Warning zone: 91-100% (approaching limit)
- Display specific message from API: `bottleneck.message`

**UI placement**:
- Add forecast panel ABOVE exercise list in planning mode
- Makes forecast visible as user builds workout
- Position: Between mode selector and exercise recommendations
- Collapsible panel (optional enhancement)

**Real-time update behavior**:
- User adds exercise → 500ms debounce → API call → Update forecast
- User changes reps/weight → 500ms debounce → API call → Update forecast
- User removes exercise → 500ms debounce → API call → Update forecast
- Multiple rapid changes only trigger one API call after last change

**Performance considerations**:
- Use React Query for caching (optional but recommended)
- Debounce prevents API spam
- Read-only operation (no database writes)
- Cancel pending requests if component unmounts

**Optional enhancements** (not required for MVP):
- Disable "Start Workout" button if critical bottlenecks detected
- Show comparison: current forecast vs last workout
- Visual heat map instead of bar chart
- Export forecast as workout preview

**Integration with existing forecast function**:
- Remove or comment out `calculateForecastedMuscleStates()` at [line 253](components/WorkoutBuilder.tsx#L253)
- Or keep for offline fallback, but prioritize API forecast
- API forecast uses server-side algorithms (more accurate)

**Type definitions** (add to types.ts or api.ts):
```typescript
interface WorkoutForecastResponse {
  forecast: Record<Muscle, number>;
  warnings: string[];
  bottlenecks: Array<{
    muscle: Muscle;
    projectedFatigue: number;
    message: string;
  }>;
}

interface ForecastRequest {
  exercises: Array<{
    exerciseId: string;
    estimatedSets: Array<{
      reps: number;
      weight: number;
    }>;
  }>;
}
```

**Error handling**:
- Network error: Show "Unable to calculate forecast" message, allow user to continue
- Invalid data: Log error, show generic error message
- Don't block workout planning if forecast fails

**Data flow**:
1. User in planning mode adds/modifies exercises
2. Debounced function triggers after 500ms of inactivity
3. Format workout data for API
4. POST to `/api/forecast/workout`
5. Receive predicted fatigue for all muscles
6. Display forecast with color-coded UI
7. Highlight bottlenecks in red with warnings
8. User adjusts workout based on forecast

---

## Epic 4: Integration Testing & MVP Launch

**Goal**: Validate that all muscle intelligence features work end-to-end and deploy to production.

**Value**: Ensures MVP is reliable, performant, and ready for real users. Confirms all 6 functional requirements work as specified.

**Prerequisites**: Epic 3 complete (all frontend integrations working) ✅

---

### Story 4.1: End-to-End Integration Testing (Local Docker)

As a **QA engineer**,
I want **to test complete user workflows in local environment**,
So that **we catch integration issues before production deployment**.

**Acceptance Criteria:**

**Given** FitForge running in Docker Compose at `http://localhost:3000` (frontend) and `http://localhost:3001` (backend)
**When** tester executes integration test scenarios
**Then** all test scenarios pass validation:

**Test Setup (Docker Compose)**:
```bash
# Start environment (from project root)
docker-compose up -d

# Verify services healthy
docker-compose ps
# Expected: fitforge-frontend (port 3000), fitforge-backend (port 3001), both "Up (healthy)"

# Check backend health endpoint
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Test Framework**: Vitest (configured at `vitest.config.ts:1-18`)
- Environment: jsdom
- Setup file: `.storybook/vitest.setup.ts`
- Run tests: `npm test` (runs vitest)
- Coverage: `npm run test:coverage`

**Test Data Fixtures** (create in `backend/__tests__/fixtures/`):

```typescript
// integration-test-data.ts
export const TEST_USER_ID = 1;

export const BASELINE_WORKOUT = {
  date: new Date().toISOString(),
  category: 'Legs',
  exercises: [
    {
      exercise: 'Goblet Squat',
      sets: [
        { weight: 70, reps: 10, to_failure: true },
        { weight: 70, reps: 10, to_failure: true },
        { weight: 70, reps: 10, to_failure: true }
      ]
    },
    {
      exercise: 'Romanian Deadlift',
      sets: [
        { weight: 100, reps: 10, to_failure: true },
        { weight: 100, reps: 10, to_failure: true },
        { weight: 100, reps: 10, to_failure: true }
      ]
    }
  ]
};

// Expected fatigue after BASELINE_WORKOUT (from logic-sandbox validation)
export const EXPECTED_FATIGUE = {
  Quadriceps: 15,    // 1050 / 7000 = 15%
  Glutes: 26,        // 1680 / 6500 = 25.8%
  Hamstrings: 31,    // 1602 / 5200 = 30.8%
  Core: 21,          // 618 / 3000 = 20.6%
  LowerBack: 5       // 150 / 2800 = 5.4%
};

// Workout that exceeds baseline (for baseline update modal test)
export const BASELINE_EXCEEDING_WORKOUT = {
  date: new Date().toISOString(),
  category: 'Legs',
  exercises: [
    {
      exercise: 'Romanian Deadlift',
      sets: [
        { weight: 300, reps: 15, to_failure: true },
        { weight: 300, reps: 15, to_failure: true },
        { weight: 300, reps: 15, to_failure: true }
      ]
    }
  ]
};
// Expected: Hamstrings exceeds (6075 > 5200 baseline)
```

**Integration Test 1: Workout Completion Flow** (create `backend/__tests__/integration/workout-completion.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { saveWorkout } from '../../database/database';
import { calculateFatigue } from '../../services/fatigueCalculator';
import { BASELINE_WORKOUT, EXPECTED_FATIGUE, BASELINE_EXCEEDING_WORKOUT } from '../fixtures/integration-test-data';

describe('Integration: Workout Completion Flow', () => {
  beforeEach(() => {
    // Reset database to clean state
    db.exec('DELETE FROM workouts');
    db.exec('DELETE FROM exercise_sets');
    db.exec('DELETE FROM muscle_states');
  });

  it('calculates accurate fatigue percentages matching logic-sandbox', async () => {
    // Save workout
    const saved = saveWorkout(BASELINE_WORKOUT);
    expect(saved.id).toBeDefined();

    // Call completion endpoint (POST /api/workouts/:id/complete)
    const response = await fetch(`http://localhost:3001/api/workouts/${saved.id}/complete`, {
      method: 'POST'
    });
    const completion = await response.json();

    // Verify fatigue matches logic-sandbox calculations (±2% tolerance)
    expect(completion.muscleStates.Quadriceps.fatiguePercent).toBeCloseTo(EXPECTED_FATIGUE.Quadriceps, 0);
    expect(completion.muscleStates.Glutes.fatiguePercent).toBeCloseTo(EXPECTED_FATIGUE.Glutes, 0);
    expect(completion.muscleStates.Hamstrings.fatiguePercent).toBeCloseTo(EXPECTED_FATIGUE.Hamstrings, 0);
  });

  it('triggers baseline update modal when baseline exceeded', async () => {
    const saved = saveWorkout(BASELINE_EXCEEDING_WORKOUT);

    const response = await fetch(`http://localhost:3001/api/workouts/${saved.id}/complete`, {
      method: 'POST'
    });
    const completion = await response.json();

    // Verify baseline suggestions present
    expect(completion.baselineSuggestions).toBeDefined();
    expect(completion.baselineSuggestions.length).toBeGreaterThan(0);

    const hamstringSuggestion = completion.baselineSuggestions.find(s => s.muscle === 'Hamstrings');
    expect(hamstringSuggestion).toBeDefined();
    expect(hamstringSuggestion.currentBaseline).toBe(5200);
    expect(hamstringSuggestion.suggestedBaseline).toBeGreaterThan(5200);
    expect(hamstringSuggestion.volumeAchieved).toBeCloseTo(6075, -1);
  });
});
```

**Integration Test 2: Recovery Timeline Flow** (create `backend/__tests__/integration/recovery-timeline.test.ts`):

```typescript
describe('Integration: Recovery Timeline', () => {
  it('returns current recovery state with 24h/48h/72h projections', async () => {
    // Setup: complete workout to create fatigue
    const saved = saveWorkout(BASELINE_WORKOUT);
    await fetch(`http://localhost:3001/api/workouts/${saved.id}/complete`, { method: 'POST' });

    // Fetch recovery timeline (GET /api/recovery/timeline)
    const response = await fetch('http://localhost:3001/api/recovery/timeline');
    const timeline = await response.json();

    // Verify current state
    expect(timeline.current.Hamstrings.fatiguePercent).toBeCloseTo(31, 0);

    // Verify 24h projection (15% daily recovery = 31% - 15% = 16%)
    expect(timeline.projections['24h'].Hamstrings.fatiguePercent).toBeCloseTo(16, 0);

    // Verify 48h projection (31% - 30% = 1%)
    expect(timeline.projections['48h'].Hamstrings.fatiguePercent).toBeCloseTo(1, 0);

    // Verify 72h projection (fully recovered)
    expect(timeline.projections['72h'].Hamstrings.fatiguePercent).toBe(0);
  });
});
```

**Integration Test 3: Exercise Recommendations Flow** (create `backend/__tests__/integration/exercise-recommendations.test.ts`):

```typescript
describe('Integration: Exercise Recommendations', () => {
  it('returns ranked recommendations with bottleneck warnings', async () => {
    // Setup: Fatigue chest/shoulders, leave legs fresh
    // ... setup code ...

    // Request recommendations for fresh muscle (POST /api/recommendations/exercises)
    const response = await fetch('http://localhost:3001/api/recommendations/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMuscle: 'Quadriceps', equipmentAvailable: ['Dumbbells'] })
    });
    const recs = await response.json();

    // Verify recommendations returned
    expect(recs.recommendations).toBeDefined();
    expect(recs.recommendations.length).toBeGreaterThan(0);

    // Verify 5-factor scoring structure
    const topRec = recs.recommendations[0];
    expect(topRec.exerciseId).toBeDefined();
    expect(topRec.score).toBeGreaterThanOrEqual(0);
    expect(topRec.score).toBeLessThanOrEqual(100);
    expect(topRec.factors).toBeDefined();
    expect(topRec.factors.targetMatch).toBeDefined(); // 40% weight
    expect(topRec.factors.freshness).toBeDefined();   // 25% weight
  });
});
```

**Integration Test 4: Workout Forecast Flow** (create `backend/__tests__/integration/workout-forecast.test.ts`):

```typescript
describe('Integration: Workout Forecast', () => {
  it('predicts fatigue for planned exercises in real-time', async () => {
    const plannedWorkout = {
      exercises: [
        { exerciseId: 'ex02', sets: 3, reps: 10, weight: 50 }, // Dumbbell Bench
        { exerciseId: 'ex04', sets: 3, reps: 8, weight: 180 }  // Pull-ups
      ]
    };

    // POST /api/forecast/workout
    const response = await fetch('http://localhost:3001/api/forecast/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plannedWorkout)
    });
    const forecast = await response.json();

    // Verify forecast structure
    expect(forecast.Pectoralis).toBeDefined();
    expect(forecast.Pectoralis.forecastedFatiguePercent).toBeCloseTo(25.5, 1);
    expect(forecast.Pectoralis.volumeAdded).toBe(1275);
  });
});
```

**Manual Testing Checklist** (create `docs/testing/integration-checklist.md`):

```markdown
# Integration Testing Checklist

## Environment Setup
- [ ] Docker Compose running: `docker-compose ps` shows both services healthy
- [ ] Backend health check passes: `curl localhost:3001/api/health`
- [ ] Frontend loads: Open `http://localhost:3000`

## Test Scenario 1: Workout Completion
- [ ] Log workout (Goblet Squat 3x10@70, RDL 3x10@100)
- [ ] Click "Complete Workout"
- [ ] Verify fatigue displays: Hamstrings ~31%, Glutes ~26%, Quads ~15%
- [ ] Check database: `SELECT * FROM muscle_states` shows updated values

## Test Scenario 2: Baseline Exceeded
- [ ] Log extreme workout (RDL 3x15@300)
- [ ] Complete workout
- [ ] Baseline update modal appears
- [ ] Modal shows Hamstrings: Current 5200 → Suggested 6075+

## Test Scenario 3: Recovery Timeline
- [ ] Complete workout to create fatigue
- [ ] Navigate to Dashboard
- [ ] RecoveryTimelineView shows current states
- [ ] Verify 24h/48h/72h projections present
- [ ] Wait 1 hour, refresh, verify fatigue decreased

## Test Scenario 4: Exercise Recommendations
- [ ] Navigate to Recommendations
- [ ] Select target muscle (e.g., "Quadriceps")
- [ ] Verify ranked list appears
- [ ] Check bottleneck warnings for fatigued muscles
- [ ] Verify equipment filtering works

## Test Scenario 5: Workout Forecast
- [ ] Open WorkoutBuilder in planning mode
- [ ] Add exercise to plan
- [ ] Forecast panel updates immediately (<500ms)
- [ ] Add high-volume exercise
- [ ] Bottleneck warning appears
- [ ] Remove exercise, warning clears
```

**Prerequisites:** Epic 3 complete (all frontend integrations working)

**Technical Notes:**

**Test Environment Setup**:
- Docker Compose config: `docker-compose.yml:1-64`
- Frontend container: `fitforge-frontend` on port 3000 (Dockerfile.dev:1-24)
- Backend container: `fitforge-backend` on port 3001 (backend/Dockerfile.dev:1-23)
- Database volume: `./data:/data` (persists between runs)

**Vitest Configuration**: `vitest.config.ts:1-18`
- Test command: `npm test` (package.json:14)
- UI mode: `npm run test:ui` (package.json:15)
- Coverage: `npm run test:coverage` (package.json:17)

**Existing Test Examples** (use as templates):
- Database tests: `backend/__tests__/database.test.ts:1-102` (shows transaction patterns)
- Unit tests: `utils/workoutPlanner.test.ts:1-417` (shows calculation validation)
- Service tests: `backend/services/fatigueCalculator.test.js:1-208` (shows expected values from logic-sandbox)

**Test Data Reference**: All expected values come from `docs/logic-sandbox/` validated calculations

**Docker Commands**:
```bash
# Start environment
docker-compose up -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop environment
docker-compose down

# Rebuild after dependency changes
docker-compose up -d --build
```

**Success Criteria**:
- All Vitest tests pass: `npm test` exits 0
- All manual checklist items pass
- No console errors in browser DevTools
- No 500 errors in backend logs
- Calculations match logic-sandbox reference within ±2%

---

### Story 4.2: Performance Validation & Optimization

As a **backend engineer**,
I want **to measure and optimize API response times**,
So that **muscle intelligence features feel instant to users**.

**Acceptance Criteria:**

**Given** FitForge running with production-like data (50+ workouts logged)
**When** performance profiling executes
**Then** all API endpoints meet performance targets:

- POST `/api/workouts/:id/complete` - <500ms
- GET `/api/recovery/timeline` - <200ms
- POST `/api/recommendations/exercises` - <300ms
- POST `/api/forecast/workout` - <250ms

**And** database queries execute efficiently (<50ms each)

**And** no N+1 query issues exist

**And** frontend initial page load <2s

**Performance Profiling Code** (add to `backend/server.ts` or create `backend/middleware/performance.ts`):

```typescript
// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    const path = req.path;
    const method = req.method;

    // Log slow requests (>200ms)
    if (duration > 200) {
      console.warn(`[SLOW] ${method} ${path} took ${duration.toFixed(2)}ms`);
    }

    // Track endpoint performance
    console.log(`[PERF] ${method} ${path}: ${duration.toFixed(2)}ms`);
  });

  next();
};

// Usage in server.ts
app.use(performanceMiddleware);
```

**API Endpoint Performance Tests** (create `backend/__tests__/performance/api-performance.test.ts`):

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { performance } from 'perf_hooks';

describe('API Performance Tests', () => {
  let testWorkoutId: number;

  beforeAll(async () => {
    // Seed database with 50+ workouts for realistic testing
    for (let i = 0; i < 50; i++) {
      const workout = {
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Legs',
        exercises: [
          { exercise: 'Goblet Squat', sets: [{ weight: 70, reps: 10, to_failure: true }] }
        ]
      };
      const response = await fetch('http://localhost:3001/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout)
      });
      if (i === 0) {
        const data = await response.json();
        testWorkoutId = data.id;
      }
    }
  });

  it('POST /api/workouts/:id/complete responds in <500ms', async () => {
    const start = performance.now();

    const response = await fetch(`http://localhost:3001/api/workouts/${testWorkoutId}/complete`, {
      method: 'POST'
    });

    const duration = performance.now() - start;

    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(500);
    console.log(`Completion endpoint: ${duration.toFixed(2)}ms`);
  });

  it('GET /api/recovery/timeline responds in <200ms', async () => {
    const start = performance.now();

    const response = await fetch('http://localhost:3001/api/recovery/timeline');

    const duration = performance.now() - start;

    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(200);
    console.log(`Recovery timeline: ${duration.toFixed(2)}ms`);
  });

  it('POST /api/recommendations/exercises responds in <300ms', async () => {
    const start = performance.now();

    const response = await fetch('http://localhost:3001/api/recommendations/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMuscle: 'Quadriceps', equipmentAvailable: ['Dumbbells'] })
    });

    const duration = performance.now() - start;

    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(300);
    console.log(`Recommendations: ${duration.toFixed(2)}ms`);
  });

  it('POST /api/forecast/workout responds in <250ms', async () => {
    const start = performance.now();

    const response = await fetch('http://localhost:3001/api/forecast/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercises: [
          { exerciseId: 'ex02', sets: 3, reps: 10, weight: 50 }
        ]
      })
    });

    const duration = performance.now() - start;

    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(250);
    console.log(`Forecast: ${duration.toFixed(2)}ms`);
  });
});
```

**Database Query Profiling** (check existing indexes and add EXPLAIN analysis):

**Current Indexes** (from `backend/database/schema.sql:165-179`):
```sql
-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_bests_user ON personal_bests(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_user ON muscle_baselines(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_updated ON muscle_baselines(updated_at);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user ON detailed_muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz ON detailed_muscle_states(visualization_muscle_name);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_role ON detailed_muscle_states(role);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_updated ON detailed_muscle_states(updated_at);
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_calibrations_user_exercise ON user_exercise_calibrations(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_calibrations_user ON user_exercise_calibrations(user_id);
```

**Query Performance Analysis** (create `backend/scripts/profile-queries.js`):

```javascript
// Run with: node backend/scripts/profile-queries.js
const Database = require('better-sqlite3');
const db = new Database('./data/fitforge.db');

console.log('=== Query Performance Analysis ===\n');

// Enable query timing
db.pragma('timer = ON');

// Test critical queries
const queries = [
  {
    name: 'Fetch muscle states for user',
    sql: 'SELECT * FROM muscle_states WHERE user_id = 1'
  },
  {
    name: 'Fetch workout with sets',
    sql: `SELECT w.*,
            json_group_array(
              json_object('exercise', s.exercise_name, 'weight', s.weight, 'reps', s.reps)
            ) as sets
          FROM workouts w
          LEFT JOIN exercise_sets s ON w.id = s.workout_id
          WHERE w.user_id = 1
          GROUP BY w.id
          ORDER BY w.date DESC
          LIMIT 10`
  },
  {
    name: 'Fetch muscle baselines',
    sql: 'SELECT * FROM muscle_baselines WHERE user_id = 1'
  },
  {
    name: 'Recent workouts (30 days)',
    sql: `SELECT * FROM workouts
          WHERE user_id = 1
          AND date >= date('now', '-30 days')
          ORDER BY date DESC`
  }
];

queries.forEach(({ name, sql }) => {
  console.log(`\n--- ${name} ---`);
  console.log(`SQL: ${sql}\n`);

  // Get execution plan
  const plan = db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all();
  console.log('Execution Plan:');
  plan.forEach(row => {
    console.log(`  ${row.detail}`);
  });

  // Measure execution time
  const start = performance.now();
  const stmt = db.prepare(sql);
  const rows = stmt.all();
  const duration = performance.now() - start;

  console.log(`\nRows returned: ${rows.length}`);
  console.log(`Execution time: ${duration.toFixed(3)}ms`);
  console.log(duration < 50 ? '✓ PASS' : '✗ SLOW (>50ms)');
});

console.log('\n=== Index Usage Summary ===\n');

// Check if indexes are being used
const indexUsage = db.prepare(`
  SELECT name, tbl_name
  FROM sqlite_master
  WHERE type = 'index'
  AND name LIKE 'idx_%'
`).all();

console.log('Available indexes:', indexUsage.length);
indexUsage.forEach(idx => {
  console.log(`  - ${idx.name} on ${idx.tbl_name}`);
});

db.close();
```

**N+1 Query Detection**:

```typescript
// Add to database wrapper (backend/database/database.ts)
let queryCount = 0;
let queryLog: string[] = [];

export const enableQueryLogging = () => {
  queryCount = 0;
  queryLog = [];

  // Wrap db.prepare to log queries
  const originalPrepare = db.prepare.bind(db);
  db.prepare = (sql: string) => {
    queryCount++;
    queryLog.push(sql);
    if (queryCount > 10) {
      console.warn(`[N+1 WARNING] ${queryCount} queries executed. Recent queries:`, queryLog.slice(-5));
    }
    return originalPrepare(sql);
  };
};

export const getQueryStats = () => ({
  count: queryCount,
  log: queryLog
});

// Usage in endpoints
app.get('/api/workouts', (req, res) => {
  enableQueryLogging();

  // ... endpoint logic ...

  const stats = getQueryStats();
  console.log(`GET /api/workouts executed ${stats.count} queries`);
  if (stats.count > 3) {
    console.warn('Possible N+1 issue');
  }
});
```

**Frontend Performance Profiling**:

**React DevTools Profiler** (add to `App.tsx` for development):

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`[SLOW RENDER] ${id} took ${actualDuration.toFixed(2)}ms (${phase})`);
  }
};

// Wrap expensive components
<Profiler id="WorkoutBuilder" onRender={onRenderCallback}>
  <WorkoutBuilder />
</Profiler>
```

**Lighthouse Performance Audit** (create `docs/testing/lighthouse-audit.md`):

```markdown
# Lighthouse Performance Audit

## Run Audit
1. Open Chrome DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Performance" category
4. Click "Analyze page load"

## Performance Budget
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Total Blocking Time: <200ms
- Cumulative Layout Shift: <0.1

## Run from CLI
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --only-categories=performance --output=html --output-path=./lighthouse-report.html
```
```

**Prerequisites:** Story 4.1 (integration testing complete)

**Technical Notes:**

**Performance Testing Setup**:
- Run tests: `npm run test -- backend/__tests__/performance/`
- Profile queries: `node backend/scripts/profile-queries.js`
- Frontend profiling: React DevTools Profiler tab
- Lighthouse: Chrome DevTools or CLI

**Existing Database Indexes**: `backend/database/schema.sql:165-179` (all critical indexes present)
- Workouts: `user_id, date` (composite), `date` (single)
- Exercise sets: `workout_id`, `to_failure`
- Muscle states: `user_id`
- Baselines: `user_id`, `updated_at`

**Query Optimization Checklist**:
- [ ] All queries use existing indexes (verify with EXPLAIN QUERY PLAN)
- [ ] No table scans on large tables (>1000 rows)
- [ ] JOIN operations use indexed columns
- [ ] No N+1 queries (max 3 queries per request)
- [ ] Aggregate queries use indexes
- [ ] Date range queries use index

**Frontend Optimization Checklist**:
- [ ] React.memo() for expensive components
- [ ] useMemo() for expensive calculations
- [ ] useCallback() for event handlers passed to children
- [ ] Code splitting for large bundles (if needed)
- [ ] Image optimization (WebP format, lazy loading)
- [ ] Virtual scrolling for long lists (if >100 items)

**Performance Regression Prevention**:
```typescript
// Add to CI/CD (future enhancement)
// backend/__tests__/performance/regression.test.ts
it('ensures no performance regression', async () => {
  const baseline = {
    completion: 450,
    timeline: 180,
    recommendations: 280,
    forecast: 230
  };

  // Run tests and compare to baseline
  // Fail if >10% slower than baseline
});
```

**Documentation**: Record results in `CHANGELOG.md`:
```markdown
## Performance Validation - 2025-11-11

### API Response Times (Measured)
- POST /api/workouts/:id/complete: 342ms ✓
- GET /api/recovery/timeline: 156ms ✓
- POST /api/recommendations/exercises: 243ms ✓
- POST /api/forecast/workout: 189ms ✓

### Database Query Performance
- Average query time: 12ms ✓
- Slowest query: 38ms (workout + sets JOIN) ✓
- No N+1 queries detected ✓

### Frontend Performance
- Initial load: 1.8s ✓
- Largest Contentful Paint: 2.2s ✓
- Time to Interactive: 2.9s ✓
```

---

### Story 4.3: Production Deployment to Railway

As a **DevOps engineer**,
I want **to deploy FitForge MVP to Railway production environment**,
So that **real users can access the muscle intelligence features**.

**Acceptance Criteria:**

**Given** all tests passing in local environment (`npm test` exits 0)
**When** code pushed to GitHub main branch
**Then** Railway automatically triggers deployment via GitHub integration

**And** production build succeeds without errors (both frontend and backend)

**And** production environment health check returns 200 OK

**And** all 4 new API endpoints are accessible at production URL

**And** frontend loads successfully at production URL

**Railway Service Topology**:

Railway project has **TWO services** configured:
1. **Frontend Service**: Builds from `Dockerfile`, serves static files on port 3000
2. **Backend Service**: Builds from `backend/Dockerfile`, runs API on port 3001

**Service Communication**:
- Frontend is assigned a Railway public URL: `https://fit-forge-ai-studio-production-6b5b.up.railway.app/`
- Backend is assigned a Railway private URL: `backend.railway.internal:3001` (internal networking)
- Frontend's `VITE_API_URL` build arg must point to backend's internal URL OR backend's public URL
- Railway provides internal DNS for service-to-service communication

**IMPORTANT**: Verify Railway configuration in dashboard:
- Frontend service: Environment variable `VITE_API_URL` set to backend service URL
- Backend service: Environment variables `NODE_ENV=production`, `DB_PATH=/data/fitforge.db`
- Both services: Connected to same Railway project for internal networking

**Railway Configuration** (per-service, `railway.json:1-12` shows pattern):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"  // Frontend: "Dockerfile", Backend: "backend/Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Production Build Process**:

**Frontend Build** (`Dockerfile:1-38`):
```dockerfile
# Multi-stage build for production
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build argument for API URL
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=${VITE_API_URL}

# Build React app
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Backend Build** (`backend/Dockerfile:1-43`):
```dockerfile
FROM node:20-slim

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Set working directory to project root
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy shared code and types
WORKDIR /app
COPY shared/ ./shared/
COPY types.ts ./types.ts

# Copy backend source
COPY backend/ ./backend/

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Remove devDependencies
RUN npm prune --production

EXPOSE 3001

# Set database path
ENV DB_PATH=/data/fitforge.db

# Start server from compiled output
CMD ["node", "dist/backend/server.js"]
```

**Deployment Steps**:

**1. Pre-Deployment Checklist**:
```bash
# Run all tests locally
npm test
# Expected: All tests pass

# Build production locally to verify
npm run build
# Expected: Build succeeds, dist/ folder created

# Check for TypeScript errors
cd backend && npm run build
# Expected: No compilation errors
```

**2. Commit and Push to GitHub**:
```bash
git add .
git commit -m "Deploy MVP: All features complete and tested

- Epic 1: Muscle intelligence services ✓
- Epic 2: API integration layer ✓
- Epic 3: Frontend integration ✓
- Epic 4: Integration testing ✓
- Performance validated ✓

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

**3. Railway Auto-Deploy Triggers**:
- Railway detects push to `main` branch
- Pulls latest code from GitHub
- Builds using `Dockerfile` (frontend) and `backend/Dockerfile` (backend)
- Creates production containers
- Starts services with environment variables
- Runs health checks

**4. Monitor Deployment**:

**Railway CLI** (install if not present):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Watch logs during deployment
railway logs --follow

# Check deployment status
railway status
```

**Railway Web Dashboard**:
- Navigate to https://railway.app/dashboard
- Select FitForge project
- View deployment logs in real-time
- Check build status (Building → Deploying → Active)

**5. Verify Deployment**:

**Health Check**:
```bash
curl https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/health
# Expected: {"status":"ok","timestamp":"2025-11-11T..."}
```

**API Endpoints Verification**:
```bash
# Test completion endpoint (POST requires workout ID - verify in Story 4.4)
curl -X POST https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/workouts/1/complete

# Test recovery timeline
curl https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/recovery/timeline

# Test recommendations endpoint
curl -X POST https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/recommendations/exercises \
  -H "Content-Type: application/json" \
  -d '{"targetMuscle":"Quadriceps","equipmentAvailable":["Dumbbells"]}'

# Test forecast endpoint
curl -X POST https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/forecast/workout \
  -H "Content-Type: application/json" \
  -d '{"exercises":[{"exerciseId":"ex02","sets":3,"reps":10,"weight":50}]}'
```

**Frontend Verification**:
```bash
# Check frontend loads
curl -I https://fit-forge-ai-studio-production-6b5b.up.railway.app/
# Expected: HTTP/2 200, content-type: text/html
```

**Environment Variables** (set in Railway dashboard per service):

**Frontend Service Variables**:
- `VITE_API_URL` (build arg): Set to backend service URL (either public backend URL or use Railway's service references)
  - Example: `https://backend-service.railway.app/api` OR
  - Use Railway reference: `https://${{RAILWAY_STATIC_URL}}/api` if backend is public

**Backend Service Variables**:
- `NODE_ENV=production`
- `PORT=3001`
- `DB_PATH=/data/fitforge.db`

**Verify Variables**:
```bash
# List environment variables for backend service
railway variables --service backend

# Expected output:
# NODE_ENV=production
# PORT=3001
# DB_PATH=/data/fitforge.db

# List environment variables for frontend service
railway variables --service frontend

# Expected output:
# VITE_API_URL=https://[backend-url]/api
```

**Note**: Railway assigns each service a unique URL. Frontend calls backend via the backend service's Railway URL. Verify these are correctly configured in Railway dashboard before deployment.

**Production URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Rollback Procedure** (if deployment fails):

```bash
# Via Railway CLI
railway rollback

# Or via Railway Dashboard:
# 1. Navigate to Deployments tab
# 2. Find last successful deployment
# 3. Click "Redeploy"
```

**Common Deployment Issues**:

**Issue: Build fails with "Module not found"**
- Solution: Ensure `package.json` includes all dependencies
- Check: `npm install` runs without errors locally

**Issue: Backend fails to start**
- Solution: Check Railway logs for startup errors
- Verify: `DB_PATH` environment variable set correctly
- Check: TypeScript compiled successfully (`npm run build`)

**Issue: Frontend 404 errors**
- Solution: Verify `serve` serving from correct directory (`dist/`)
- Check: `npm run build` created `dist/` folder locally

**Issue: API endpoints return 502**
- Solution: Backend service not running or crashed
- Check Railway logs: `railway logs --service backend`
- Verify: Health check endpoint accessible

**Prerequisites:** Story 4.2 (performance validated)

**Technical Notes:**

**Railway Configuration**:
- Auto-deploy: Enabled (GitHub integration)
- Build method: Dockerfile (multi-stage)
- Deployment region: US West (default)
- Health checks: Enabled (port 3001)
- Restart policy: ON_FAILURE with max 10 retries

**Production Build Differences** (vs Development):
- Frontend: Static files served via `serve`, not Vite dev server
- Backend: Compiled TypeScript (`dist/`), no source maps
- Environment: `NODE_ENV=production`
- Database: Persistent volume at `/data/fitforge.db`
- Logging: Production-level (errors only, no debug)

**No Code Changes Required**:
- Dockerfiles already configured for production
- `railway.json` already present
- Environment variables set in Railway dashboard
- GitHub integration already connected

**Deployment Timeline**:
- Build time: ~5-8 minutes (both services)
- Deploy time: ~2 minutes
- Health check: ~30 seconds
- Total: ~10 minutes from push to live

---

### Story 4.4: Production Smoke Testing & Monitoring

As a **product owner**,
I want **to verify MVP works in production and monitor for errors**,
So that **we can confidently launch to users**.

**Acceptance Criteria:**

**Given** FitForge deployed to Railway at https://fit-forge-ai-studio-production-6b5b.up.railway.app/
**When** smoke tests execute on production URL
**Then** all critical paths work correctly:

1. ✅ Home page loads in <2s
2. ✅ Complete workout → Fatigue displays with correct percentages
3. ✅ Dashboard shows recovery timeline with 24h/48h/72h projections
4. ✅ Exercise recommendations return ranked results
5. ✅ Workout forecast updates in real-time when adding exercises

**And** no console errors in browser DevTools

**And** no 500 errors in Railway logs

**And** API response times meet targets (<500ms)

**And** monitoring is enabled for error tracking

**Production Smoke Test Script** (create `docs/testing/production-smoke-test.md`):

```markdown
# Production Smoke Test Checklist

**Production URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Date**: 2025-11-11
**Tester**: Kaelen
**Environment**: Production (Railway)

---

## Pre-Test Setup

### 1. Open Browser DevTools
- Press F12 (Chrome/Edge) or Cmd+Option+I (Mac)
- Navigate to Console tab (check for errors)
- Navigate to Network tab (monitor API calls)

### 2. Clear Browser Data (Optional)
- Clear cache and cookies for fresh test
- Use Incognito/Private mode for clean session

---

## Test 1: Home Page Load & Performance

**Action**: Navigate to https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Expected Results**:
- [ ] Page loads in <2s (check Network tab: DOMContentLoaded time)
- [ ] No console errors in DevTools
- [ ] All images/assets load correctly
- [ ] Navigation menu displays correctly

**Performance Check**:
```
Network Tab → Check timing:
- DOMContentLoaded: <1.5s
- Load: <2s
- No failed requests (all 200/304 status)
```

**If Failed**: Check Railway logs for startup errors

---

## Test 2: Workout Completion Flow

**Action**: Log and complete a workout

**Steps**:
1. Click "New Workout" or navigate to Workout Builder
2. Add exercise: Goblet Squat (3 sets × 10 reps @ 70 lbs)
3. Add exercise: Romanian Deadlift (3 sets × 10 reps @ 100 lbs)
4. Click "Complete Workout"

**Expected Results**:
- [ ] Workout saves successfully (no errors)
- [ ] Fatigue percentages display:
  - Hamstrings: ~31%
  - Glutes: ~26%
  - Quadriceps: ~15%
  - Core: ~21%
- [ ] POST `/api/workouts/:id/complete` returns in <500ms (Network tab)
- [ ] No console errors

**API Verification** (via DevTools Network tab):
```json
// POST /api/workouts/:id/complete response
{
  "muscleStates": {
    "Hamstrings": { "fatiguePercent": 31, "volume": 1602 },
    "Glutes": { "fatiguePercent": 26, "volume": 1680 },
    "Quadriceps": { "fatiguePercent": 15, "volume": 1050 }
  },
  "baselineSuggestions": []  // or array if baseline exceeded
}
```

**If Failed**:
- Check Railway logs: `railway logs --service backend`
- Verify API endpoint: `curl -X POST https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/workouts/1/complete`

---

## Test 3: Recovery Timeline

**Action**: Navigate to Dashboard after completing workout

**Steps**:
1. Click "Dashboard" in navigation
2. View Recovery Timeline section

**Expected Results**:
- [ ] RecoveryTimelineView displays muscle groups
- [ ] Current fatigue percentages match workout completion (Test 2)
- [ ] 24h projection shows ~15% less fatigue (Hamstrings: 31% → 16%)
- [ ] 48h projection shows ~30% less fatigue (Hamstrings: 31% → 1%)
- [ ] 72h projection shows full recovery (Hamstrings: 0%)
- [ ] GET `/api/recovery/timeline` responds in <200ms
- [ ] No console errors

**API Verification**:
```json
// GET /api/recovery/timeline response
{
  "current": {
    "Hamstrings": { "fatiguePercent": 31, "lastTrained": "2025-11-11T..." }
  },
  "projections": {
    "24h": { "Hamstrings": { "fatiguePercent": 16 } },
    "48h": { "Hamstrings": { "fatiguePercent": 1 } },
    "72h": { "Hamstrings": { "fatiguePercent": 0 } }
  }
}
```

**If Failed**: Check recovery calculation in backend logs

---

## Test 4: Exercise Recommendations

**Action**: Request exercise recommendations for fresh muscle

**Steps**:
1. Navigate to Recommendations page
2. Select target muscle: "Quadriceps" (should be fresh if only did Legs once)
3. Verify equipment filter: "Dumbbells"

**Expected Results**:
- [ ] Ranked recommendation list appears
- [ ] Top recommendations show high scores (>70)
- [ ] Each recommendation shows:
  - Exercise name
  - Score badge
  - Primary muscles engaged
  - Bottleneck warnings (if any)
- [ ] POST `/api/recommendations/exercises` responds in <300ms
- [ ] No console errors

**API Verification**:
```json
// POST /api/recommendations/exercises response
{
  "recommendations": [
    {
      "exerciseId": "ex18",
      "name": "Goblet Squat",
      "score": 85,
      "factors": {
        "targetMatch": 85,    // 40% weight
        "freshness": 92,      // 25% weight
        "variety": 10,        // 15% weight
        "preference": 0,      // 10% weight
        "primarySecondary": 8 // 10% weight
      },
      "warnings": []
    }
  ]
}
```

**If Failed**: Verify recommendation algorithm in backend

---

## Test 5: Real-Time Workout Forecast

**Action**: Add exercises to workout plan and observe forecast

**Steps**:
1. Navigate to Workout Builder
2. Switch to "Planning" mode (if separate from execution)
3. Add exercise: Dumbbell Bench Press (3 sets × 10 reps @ 50 lbs)
4. Observe forecast panel update
5. Add another exercise: Pull-ups (3 sets × 8 reps @ bodyweight 180 lbs)
6. Observe forecast update again

**Expected Results**:
- [ ] Forecast panel displays predicted fatigue
- [ ] After Bench Press: Pectoralis ~25%, Triceps ~17%, Deltoids ~17%
- [ ] After Pull-ups: Lats ~54%, Biceps ~63% (or capped at 100%)
- [ ] Forecast updates in <250ms after each add (no visible lag)
- [ ] POST `/api/forecast/workout` responds in <250ms
- [ ] No console errors

**API Verification**:
```json
// POST /api/forecast/workout response
{
  "Pectoralis": {
    "forecastedFatiguePercent": 25.5,
    "volumeAdded": 1275,
    "currentFatiguePercent": 0
  },
  "Triceps": {
    "forecastedFatiguePercent": 17.5,
    "volumeAdded": 525,
    "currentFatiguePercent": 0
  }
}
```

**If Failed**: Check forecast calculation and debounce logic

---

## Test 6: Cross-Device Testing

**Action**: Test on multiple devices/browsers

**Devices to Test**:
- [ ] Desktop Chrome (primary)
- [ ] Desktop Firefox
- [ ] Mobile Chrome (Android/iOS)
- [ ] Mobile Safari (iOS)

**Expected Results**:
- [ ] All features work on all devices
- [ ] Responsive layout (no horizontal scroll, elements visible)
- [ ] Touch interactions work on mobile
- [ ] API calls succeed on all devices

---

## Test 7: Database Persistence

**Action**: Verify data persists between sessions

**Steps**:
1. Complete workout (Test 2)
2. Close browser
3. Reopen browser, navigate to app
4. Check Dashboard for previous workout data

**Expected Results**:
- [ ] Previous workout appears in history
- [ ] Muscle fatigue states persist
- [ ] Recovery timeline shows data from previous session
- [ ] No data loss

**If Failed**: Check Railway database volume configuration

---

## Test 8: Performance Monitoring

**Action**: Verify all API response times

**Steps**:
1. Open DevTools Network tab
2. Execute all smoke tests above
3. Record API response times

**Expected Response Times**:
- [ ] POST `/api/workouts/:id/complete`: <500ms
- [ ] GET `/api/recovery/timeline`: <200ms
- [ ] POST `/api/recommendations/exercises`: <300ms
- [ ] POST `/api/forecast/workout`: <250ms
- [ ] All other endpoints: <500ms

**If Slow**: Run performance profiling (Story 4.2)

---

## Test 9: Error Monitoring

**Action**: Check Railway logs for errors

**Railway CLI**:
```bash
# View recent logs
railway logs --tail 100

# Watch logs in real-time
railway logs --follow

# Filter for errors
railway logs | grep -i error
```

**Expected Results**:
- [ ] No 500 errors in logs
- [ ] No uncaught exceptions
- [ ] No database connection errors
- [ ] Only expected INFO/DEBUG logs

**Common Errors to Watch For**:
- Database locked errors
- Timeout errors
- Module not found errors
- Type errors

---

## Test 10: Console Error Check

**Action**: Review browser console for client-side errors

**Steps**:
1. Keep DevTools Console open during all tests
2. Note any warnings or errors

**Expected Results**:
- [ ] No red errors in console
- [ ] No React warnings (keys, hooks, etc.)
- [ ] No network errors (failed requests)
- [ ] No CORS errors

**Acceptable Warnings** (can ignore):
- Third-party library warnings
- Development-only warnings (if any leaked)

---

## Post-Test Documentation

### Document Results in CHANGELOG.md

```markdown
## MVP Launch - 2025-11-11

### Production Deployment
- Deployed to Railway: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
- Build time: 7 minutes
- All smoke tests passed ✓

### Features Verified
- ✅ Workout completion with accurate fatigue calculation
- ✅ Recovery timeline with 24h/48h/72h projections
- ✅ Exercise recommendations with 5-factor scoring
- ✅ Real-time workout forecast
- ✅ Adaptive baseline system

### Performance (Production)
- API response times: All <500ms ✓
- Page load time: 1.8s ✓
- No errors in logs ✓

### Known Issues
- None identified

### Next Steps
- Monitor production for 24 hours
- Gather user feedback
- Plan Epic 5 (post-MVP features)
```

---

## Rollback Criteria

If any of these occur, execute rollback (Story 4.3):

- [ ] 3+ critical smoke tests fail
- [ ] 500 errors in production logs
- [ ] Data loss detected
- [ ] API response times >2x target
- [ ] Security vulnerability discovered

**Rollback Command**: `railway rollback`
```

**Automated Smoke Test** (create `backend/__tests__/production/smoke-test.ts`):

```typescript
import { describe, it, expect } from 'vitest';

const PROD_URL = 'https://fit-forge-ai-studio-production-6b5b.up.railway.app';

describe('Production Smoke Tests', () => {
  it('home page loads successfully', async () => {
    const response = await fetch(PROD_URL);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });

  it('health check endpoint responds', async () => {
    const response = await fetch(`${PROD_URL}/api/health`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });

  it('recovery timeline endpoint responds', async () => {
    const response = await fetch(`${PROD_URL}/api/recovery/timeline`);
    expect(response.status).toBe(200);
  });

  it('recommendations endpoint responds', async () => {
    const response = await fetch(`${PROD_URL}/api/recommendations/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMuscle: 'Quadriceps', equipmentAvailable: ['Dumbbells'] })
    });
    expect(response.status).toBe(200);
  });

  it('forecast endpoint responds', async () => {
    const response = await fetch(`${PROD_URL}/api/forecast/workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercises: [{ exerciseId: 'ex02', sets: 3, reps: 10, weight: 50 }] })
    });
    expect(response.status).toBe(200);
  });
});
```

**Run Automated Smoke Test**:
```bash
# Run production smoke tests
npm run test -- backend/__tests__/production/smoke-test.ts

# Expected: All tests pass
```

**Prerequisites:** Story 4.3 (production deployment complete)

**Technical Notes:**

**Smoke Testing Setup**:
- Manual checklist: `docs/testing/production-smoke-test.md`
- Automated tests: `backend/__tests__/production/smoke-test.ts`
- Browser DevTools: Console + Network tabs
- Railway logs: `railway logs --follow`

**Monitoring Tools**:
- Railway Dashboard: https://railway.app/dashboard
- Browser DevTools: F12 (Console, Network, Performance tabs)
- Railway CLI: `railway logs`, `railway status`

**Success Criteria**:
- All 10 manual smoke tests pass
- All 5 automated smoke tests pass
- No console errors
- No Railway log errors
- Performance targets met
- Cross-device compatibility verified

**MVP Launch Documentation**:
- Update `CHANGELOG.md` with launch date and verified features
- Record performance metrics
- Note any known issues
- Document rollback procedure (if needed)

**Post-Launch Monitoring** (24-hour watch):
```bash
# Monitor logs continuously
railway logs --follow

# Check error rate hourly
railway logs --tail 1000 | grep -i error | wc -l

# Verify uptime
curl -f https://fit-forge-ai-studio-production-6b5b.up.railway.app/api/health || echo "DOWN"
```

**Production URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

---

## Epic Breakdown Summary

### Totals
- **4 Epics** across the implementation lifecycle
- **16 Stories** total (bite-sized for single-session completion)
- **Estimated Time**: 13-21 hours (3-4 days for full MVP)

### Story Distribution
- **Epic 1** (Muscle Intelligence Services): 4 stories (~4-6 hours)
- **Epic 2** (API Integration Layer): 4 stories (~3-4 hours)
- **Epic 3** (Frontend Intelligence Integration): 4 stories (~3-4 hours)
- **Epic 4** (Integration Testing & MVP Launch): 4 stories (~3-7 hours)

### Requirements Coverage

All 6 functional requirements from PRD are addressed:

| Requirement | Epic 1 | Epic 2 | Epic 3 | Status |
|-------------|--------|--------|--------|--------|
| FR-2: Muscle Fatigue Tracking | Story 1.1 | Story 2.1 | Story 3.1 | ✅ Complete |
| FR-3: Recovery Timeline | Story 1.2 | Story 2.2 | Story 3.2 | ✅ Complete |
| FR-4: Exercise Recommendations | Story 1.3 | Story 2.3 | Story 3.3 | ✅ Complete |
| FR-5: Adaptive Baselines | Story 1.4 | Story 2.1 | Story 3.1 | ✅ Complete |
| FR-6: Real-Time Workout Forecast | Story 1.1 | Story 2.4 | Story 3.4 | ✅ Complete |
| FR-1: Workout Logging | - | - | - | ✅ Already Exists |

### Implementation Readiness

**All prerequisites met for immediate start:**
- ✅ Logic-sandbox algorithms validated (Phases 1-2 complete)
- ✅ Database schema exists (7 tables)
- ✅ REST API skeleton exists (20+ endpoints)
- ✅ React UI components exist (10+ components)
- ✅ Docker Compose configured (local dev with HMR)
- ✅ Railway deployment configured (auto-deploy from GitHub)
- ✅ Exercise data validated (48 exercises, all 100% sum)

**Ready to execute:** Start with Epic 1, Story 1.1

---

## Epic 6: Core Interaction Redesign

**Epic Goal**: Redesign core workout interactions using the new design system primitives (bottom sheets, modal patterns) for better UX and consistency.

**Status**: IN PROGRESS
**Priority**: HIGH
**Estimated Time**: 6-8 hours (4 stories)

### Background

Epic 5 established the design system foundation (Button, Card, Input, Sheet primitives). Epic 6 applies these components to existing workout flows, replacing legacy modals and interactions with the new bottom-sheet patterns and glass morphism styling.

### Stories

#### Story 6.1: Workout Builder Modal Redesign
- Replace legacy workout builder modal with Sheet component (bottom drawer)
- Apply glass morphism styling from design tokens
- Integrate Button primitives for all actions
- Ensure mobile-first responsive behavior

#### Story 6.2: Exercise Selection Modal Redesign
- Replace exercise picker with Sheet component
- Apply Card primitives for exercise list items
- Add Input primitive for exercise search/filter
- Maintain exercise recommendation integration

#### Story 6.3: Recovery Dashboard Interaction Redesign
- Replace muscle detail modals with Sheet component
- Apply Card primitives for recovery timeline display
- Integrate typography scale (Cinzel headers, Lato body)
- Add progressive disclosure patterns

#### Story 6.4: Baseline Update Modal Redesign
- Replace baseline update modal with Sheet component
- Apply Input primitives for baseline value editing
- Add validation feedback using design tokens
- Ensure smooth animations with Sheet height variants

### Acceptance Criteria (Epic Level)
- [ ] All 4 modal interactions use Sheet component
- [ ] All buttons use Button primitive (consistent styling)
- [ ] All form inputs use Input primitive
- [ ] All cards use Card primitive
- [ ] Glass morphism applied consistently
- [ ] Typography scale applied (Cinzel + Lato)
- [ ] Mobile-first responsive on all interactions
- [ ] No visual regressions on existing features
- [ ] All existing tests still passing
- [ ] New interaction tests added

### Technical Notes
- Use existing Sheet component from Epic 5 ([src/design-system/components/primitives/Sheet.tsx](src/design-system/components/primitives/Sheet.tsx))
- Reference design tokens in [tailwind.config.js](tailwind.config.js)
- Known issues from Epic 5 (fonts, storybook) will be fixed as they arise
- Fix issues just-in-time, not speculatively

### Dependencies
- Epic 5 (Design System Foundation) ✅ COMPLETE

---

## Epic 6.5: Design System Rollout

**Epic Goal**: Complete the design system integration started in Epic 6 by migrating all remaining components and establishing 100% design system adoption across the codebase.

**Status**: READY TO START
**Priority**: CRITICAL (Blocks Epic 7)
**Estimated Time**: 48-64 hours (5 stories)

### Background

Epic 6 successfully integrated the design system into 4 core workflow components (WorkoutBuilder, QuickAdd, CalibrationEditor, EngagementViewer), proving the patterns work. However, **73 components (~13,431 lines of code) still use legacy inline JSX** instead of design system primitives. Production verification revealed that Railway deployment doesn't reflect Epic 6 changes, and the codebase has duplicate components (e.g., `components/ui/Card.tsx` vs `src/design-system/components/primitives/Card.tsx`).

Epic 7 (Intelligence Shortcuts) stories were drafted assuming the pre-6.5 architecture. Completing Epic 6.5 first ensures Epic 7 builds on a unified design system foundation.

### Problem Statement

**Current State:**
- 4 components integrated ✅ (WorkoutBuilder, QuickAdd, CalibrationEditor, EngagementViewer)
- 73 components still use legacy code ❌
- Duplicate components exist (ui/Card, layout/FAB, etc.)
- Railway production shows 0% design system adoption
- Epic 7 stories reference components that will change

**Desired State:**
- 100% design system adoption across all 77 components
- Zero duplicate components
- Railway production fully deployed with Epic 6 changes
- Epic 7 stories reviewed for architectural alignment

### Stories

#### Story 6.5.1: Railway Deployment & Missing Primitives (6-8 hours)
- **Part A: Railway Deployment Verification** (2-3 hours)
  - Investigate Railway dashboard for deployment status
  - Review build logs for errors or failures
  - Fix any deployment blockers (missing env vars, build config, etc.)
  - Verify Epic 6 changes deploy successfully
  - Test fonts, glass morphism, Sheet components in production
- **Part B: Create Missing Design System Primitives** (4-5 hours)
  - Create Badge primitive (variant-based: success/warning/error/info)
  - Create ProgressBar primitive (with animation support)
  - Create Select/Dropdown primitive (for filters, pickers)
  - Add comprehensive tests for each (15+ tests per primitive)
  - Document in Storybook with accessibility examples

**Acceptance Criteria:**
- [ ] Railway production shows Epic 6 components (Sheet, glass morphism, fonts)
- [ ] Build logs show no errors
- [ ] Badge primitive created with 4+ variants
- [ ] ProgressBar primitive created with smooth animations
- [ ] Select primitive created with keyboard navigation
- [ ] 45+ new tests passing (15 per primitive)
- [ ] Storybook stories for all new primitives

#### Story 6.5.2: Design System Patterns & Core Pages (18-22 hours)
- **Part A: Create Missing Patterns** (4-6 hours)
  - Create Toast/Notification pattern (success/error/info/loading)
  - Create CollapsibleSection pattern (accordion-style)
  - Confirm Modal → Sheet migration strategy (document when to use Sheet vs Modal)
  - Add tests and Storybook documentation
- **Part B: Migrate Core Pages** (14-16 hours)
  - Dashboard.tsx (912 lines) - main dashboard with visualizations
  - Workout.tsx (904 lines) - active workout tracking
  - Profile.tsx (518 lines) - user profile management
  - ExerciseRecommendations.tsx (500 lines) - recommendation engine UI
  - screens/RecoveryDashboard.tsx (366 lines) - recovery tracking
  - Analytics.tsx (230 lines) - charts and progression
  - PersonalBests.tsx (91 lines) - personal records
  - WorkoutTemplates.tsx (226 lines) - template management

**Acceptance Criteria:**
- [ ] Toast pattern created with 4 variants
- [ ] CollapsibleSection pattern created (expand/collapse animation)
- [ ] Modal vs Sheet usage documented
- [ ] All 8 core pages import from design-system
- [ ] All pages use design tokens for colors/spacing
- [ ] Existing tests updated for new imports
- [ ] No visual regressions (screenshots match)
- [ ] Touch targets remain 60x60px minimum

#### Story 6.5.3: Modals & Major Features (12-16 hours)
- **Modal Components** (6-8 hours):
  - WorkoutPlannerModal.tsx (545 lines)
  - MuscleDeepDiveModal.tsx (317 lines)
  - modals/MuscleDetailModal.tsx (221 lines)
  - WorkoutSummaryModal.tsx (208 lines)
  - SetEditModal.tsx (263 lines)
  - BaselineUpdateModal.tsx (77 lines)
- **Complex Components** (6-8 hours):
  - MuscleVisualization.tsx (379 lines)
  - MuscleBaselinesPage.tsx (299 lines)
  - SetConfigurator.tsx (291 lines)
  - ExercisePicker.tsx (275 lines)
  - RecommendationCard.tsx (215 lines)
  - TargetModePanel.tsx (215 lines)
  - ExerciseCard.tsx (209 lines)
- **Onboarding Flow** (2 hours):
  - onboarding/EquipmentStep.tsx (223 lines)
  - onboarding/ProfileWizard.tsx (143 lines)

**Acceptance Criteria:**
- [ ] All 15 components migrated to design system
- [ ] Modals use Sheet component (bottom drawer pattern)
- [ ] All cards use Card primitive with glass morphism
- [ ] All buttons use Button primitive
- [ ] All form inputs use Input primitive
- [ ] Existing functionality preserved (no behavior changes)
- [ ] Tests updated for new component structure

#### Story 6.5.4: Utility Components & Subdirectories (16-20 hours)
- **Charts & Analytics** (4-5 hours):
  - WorkoutHistorySummary, ActivityCalendarHeatmap, ExerciseProgressionChart, MuscleCapacityChart, VolumeTrendsChart (5 components, ~991 lines)
- **Form Components** (3-4 hours):
  - QuickAddForm, HorizontalSetInput, VolumeSlider, CurrentSetDisplay (4 components, ~677 lines)
- **Supporting Components** (5-6 hours):
  - RecoveryTimelineView, PlannedExerciseList, ProgressiveSuggestionButtons, FABMenu, DashboardQuickStart, TemplateCard, LastWorkoutSummary, QuickTrainingStats, TemplateSelector, ExerciseGroup, PRNotification (11 components, ~1,581 lines)
- **Small Utilities** (2-3 hours):
  - Toast, CollapsibleCard, CollapsibleSection, CategoryTabs, CalibrationBadge, SimpleMuscleVisualization, LastWorkoutContext, MuscleBaselineCard, onboarding/ExperienceStep, onboarding/NameStep (10 components, ~1,032 lines)
- **Subdirectory Components** (2-3 hours):
  - fitness/ (6 components): DetailedMuscleCard, ExerciseRecommendationCard, MuscleCard, MuscleHeatMap, StatusBadge, ProgressiveOverloadChip
  - layout/ (3 components): CollapsibleSection, TopNav, FAB
  - loading/ (3 components): SkeletonScreen, ErrorBanner, OfflineBanner

**Acceptance Criteria:**
- [ ] All 45 utility/supporting components migrated
- [ ] All subdirectory components use design system
- [ ] Charts use design tokens for colors
- [ ] Forms use Input/Button primitives
- [ ] Badges use Badge primitive
- [ ] Progress bars use ProgressBar primitive
- [ ] All tests passing (no regressions)

#### Story 6.5.5: Legacy Cleanup & Epic 7 Preparation (4-6 hours)
- **Remove Duplicate Components** (2-3 hours):
  - Delete components/ui/Card.tsx (use design-system Card)
  - Delete components/ui/Button.tsx (use design-system Button)
  - Delete components/ui/Modal.tsx (migrated to Sheet)
  - Delete components/layout/FAB.tsx (use design-system FAB)
  - Delete components/ui/Badge.tsx (use design-system Badge)
  - Delete components/ui/ProgressBar.tsx (use design-system ProgressBar)
  - Consolidate CollapsibleSection variants
- **Update Import Paths** (1 hour):
  - Global find/replace for old component paths
  - Update barrel exports (index.ts files)
  - Verify no broken imports remain
- **Epic 7 Story Review** (2-3 hours):
  - Read all 5 Epic 7 story files
  - Check for references to refactored components
  - Update import paths and component APIs as needed
  - Verify Epic 7 stories build on post-6.5 architecture
  - Document any architectural notes for Epic 7 execution

**Acceptance Criteria:**
- [ ] Zero duplicate components remain in codebase
- [ ] All old component files deleted
- [ ] All imports updated to design-system paths
- [ ] No broken imports (build succeeds)
- [ ] Epic 7 stories reviewed and updated
- [ ] Epic 7 architectural notes documented
- [ ] Full test suite passing (476+ tests)
- [ ] Railway production verified (100% design system adoption)

### Acceptance Criteria (Epic Level)

**Technical:**
- [ ] 100% design system adoption (77/77 components)
- [ ] Zero duplicate components remain
- [ ] All components use design tokens (colors, spacing, typography)
- [ ] Railway production shows Epic 6 + 6.5 changes
- [ ] Fonts loading correctly in production
- [ ] Glass morphism visible on all cards/sheets

**Quality:**
- [ ] All existing tests still passing (476+ tests minimum)
- [ ] No visual regressions (screenshots match)
- [ ] Touch targets remain 60x60px minimum (WCAG AA)
- [ ] No behavior changes (feature parity maintained)
- [ ] Build succeeds with no warnings

**Documentation:**
- [ ] Epic 7 stories reviewed for architectural alignment
- [ ] Component migration guide documented
- [ ] Storybook updated with all new primitives/patterns
- [ ] Architectural notes for Epic 7 created

### Technical Notes

- Use design-system barrel exports: `import { Button, Card, Sheet } from '@/src/design-system/components/primitives'`
- Reference design tokens: `bg-primary`, `text-secondary`, `spacing-md`
- Maintain existing component APIs where possible (minimize breaking changes)
- Test in Railway production after each story (ensure deployments work)
- Document breaking changes for Epic 7 story updates

### Dependencies

- Epic 5 (Design System Foundation) ✅ COMPLETE
- Epic 6 (Core Interaction Redesign) ✅ COMPLETE (4 components integrated)

### Impact on Epic 7

Epic 7 stories reference components like WorkoutBuilder, QuickAdd, Dashboard, ExercisePicker, etc. Epic 6.5 will refactor these components to use design system primitives, potentially changing:
- Import paths (`components/ui/Card` → `@/src/design-system/components/primitives/Card`)
- Component APIs (props, event handlers)
- Component structure (children, composition patterns)

**Story 6.5.5 includes Epic 7 story review** to ensure alignment with post-6.5 architecture.

---

## Epic 7: Intelligence Shortcuts

**Epic Goal**: Implement productivity-focused shortcuts that make workout logging faster and more intelligent, leveraging the design system foundation and new interaction patterns.

**Status**: READY TO START
**Priority**: HIGH
**Estimated Time**: 6-8 hours (5 stories)

### Background

Epics 1-4 delivered the muscle intelligence core (calculation services, APIs, frontend integration). Epic 5 built the design system foundation (bottom sheets, inline pickers, touch compliance). Epic 6 redesigned core interactions using those primitives. Epic 7 delivers user-facing smart features that reduce logging friction by 50%+.

### User Value

- **Set Logging Time**: Reduce from 15-20 seconds → 5-8 seconds per set (60% improvement)
- **Cognitive Load**: Collapse advanced options by default, progressive disclosure
- **Equipment Context**: Only suggest exercises user can actually perform
- **Rest Management**: Automatic rest timer eliminates manual timer management

### Stories

#### Story 7.1: Auto-Starting Rest Timer
- Create `RestTimerBanner` component (fixed position at top)
- Auto-start when user logs a set with haptic feedback
- Show skip button and progress bar
- Auto-dismiss when timer completes
- **Benefit**: Users don't need to manually start rest timers

#### Story 7.2: "Log All Sets?" Smart Shortcut
- Detect pattern: 2-3 sets logged with matching weight/reps
- Show bottom sheet modal: "Log all remaining sets at 135 lbs, 8 reps?"
- One-tap confirmation to fill all remaining sets
- **Benefit**: Reduces set logging from 4-6 clicks per set → 1 tap for all remaining

#### Story 7.3: One-Tap Set Duplication
- Add "Copy Previous Set" button next to weight/reps inputs
- Copies weight, reps, and to-failure flag from prior set
- Include haptic feedback
- **Benefit**: Cuts logging time when doing multiple sets of same weight/reps

#### Story 7.4: Equipment Filtering
- Update ExercisePicker to filter by user's available equipment
- Add toggle for "Show All" (bypass filter)
- Persist filter preference to localStorage
- Display active filter count badge
- **Benefit**: Eliminates suggestions for exercises user can't perform

#### Story 7.5: Progressive Disclosure
- Collapse advanced options (rest time, notes, to-failure) by default
- Show/hide toggle on workout and dashboard forms
- Keep primary inputs (weight, reps, log) always visible
- Persist collapsed/expanded state to localStorage
- **Benefit**: Reduces cognitive load for casual loggers

### Acceptance Criteria (Epic Level)

- [ ] Auto rest timer starts correctly after set logged
- [ ] "Log All Sets?" appears after 2-3 matching sets
- [ ] Copy Previous Set button works on all set logging forms
- [ ] Equipment filter persists between sessions
- [ ] Progressive disclosure state persists
- [ ] All new components maintain 60x60px touch targets (WCAG AA)
- [ ] Haptic feedback on all shortcuts (where supported)
- [ ] No regressions on existing features
- [ ] All existing tests still passing (476+ tests)
- [ ] New interaction tests added for all shortcuts

### Technical Notes

- Use Sheet component from Epic 5 for "Log All Sets?" modal
- Use InlineNumberPicker patterns from Epic 6
- RestTimerBanner uses fixed positioning (z-index below Sheet)
- Equipment filter requires localStorage integration
- All shortcuts should be discoverable but not intrusive

### Dependencies

- Epic 5 (Design System Foundation) ✅ COMPLETE
- Epic 6 (Core Interaction Redesign) ✅ COMPLETE
- Muscle Intelligence APIs (Epics 1-4) ✅ COMPLETE

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_Next Steps: Run `/bmad:bmm:workflows:architecture` to design technical architecture before implementation, or proceed directly to `/bmad:bmm:workflows:create-story` for Story 1.1 if architecture already documented._

