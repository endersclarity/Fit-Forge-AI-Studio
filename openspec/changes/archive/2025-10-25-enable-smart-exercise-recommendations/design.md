# Design: Enable Smart Exercise Recommendations

**Change ID:** `enable-smart-exercise-recommendations`
**Status:** Proposed
**Created:** 2025-10-25

---

## Architecture Overview

This feature adds an **intelligent recommendation layer** between the muscle fatigue data and exercise selection, transforming FitForge from a passive tracker into an active training assistant.

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                             │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │  Muscle Heat Map   │  │  Exercise Recommendations  │    │
│  │  (Existing P2)     │  │  (New - This Proposal)     │    │
│  └────────┬───────────┘  └──────────┬─────────────────┘    │
│           │                         │                        │
└───────────┼─────────────────────────┼────────────────────────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐        ┌─────────────────────┐
    │ Muscle States │        │ Recommendation      │
    │ API           │──────▶ │ Engine              │
    │ (backend)     │        │ (utils/             │
    │               │        │  recommendations.ts)│
    └───────────────┘        └──────────┬──────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Exercise Library      │
                            │ (constants.ts)        │
                            │ 48 exercises          │
                            └───────────────────────┘
```

---

## Core Components

### 1. Recommendation Engine (`utils/exerciseRecommendations.ts`)

**Responsibilities:**
- Calculate opportunity scores for all exercises
- Detect limiting factors (fatigued muscles)
- Filter by equipment availability
- Rank and sort recommendations
- Generate human-readable explanations

**Key Functions:**

```typescript
// Main entry point
export function calculateRecommendations(
  muscleStates: MuscleStatesResponse,
  equipment: EquipmentItem[],
  category?: ExerciseCategory
): ExerciseRecommendation[]

// Opportunity scoring
function calculateOpportunityScore(
  exercise: Exercise,
  muscleStates: MuscleStatesResponse
): {
  score: number;
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
}

// Status determination
function determineStatus(
  avgFreshness: number,
  limitingFactors: MuscleReadiness[]
): 'excellent' | 'good' | 'suboptimal' | 'not-recommended'

// Equipment filtering
function checkEquipmentAvailable(
  requiredEquipment: Equipment | Equipment[],
  userEquipment: EquipmentItem[]
): boolean

// Explanation generation
function generateExplanation(
  status: string,
  primaryMuscles: MuscleReadiness[],
  limitingFactors: MuscleReadiness[]
): string
```

---

## Algorithm Specification

### Opportunity Score Formula

```
opportunityScore = avgFreshness - (maxFatigue × 0.5)

Where:
- avgFreshness = average recovery % of PRIMARY muscles (engagement >= 50%)
- maxFatigue = highest fatigue % among ALL engaged muscles
- 0.5 weight = limiting factor penalty (penalize exercises with any fatigued muscle)
```

**Example Calculation:**

```typescript
Exercise: Pull-ups
Muscle Engagements:
  - Lats: 85% engagement, 10% fatigued (90% recovery)
  - Biceps: 30% engagement, 5% fatigued (95% recovery)
  - Rhomboids: 20% engagement, 15% fatigued (85% recovery)
  - Forearms: 25% engagement, 0% fatigued (100% recovery)

Step 1: Identify primary muscles (engagement >= 50%)
  Primary: Lats (85% engagement)

Step 2: Calculate avgFreshness
  avgFreshness = 90% (only Lats is primary)

Step 3: Find maxFatigue
  maxFatigue = max(10%, 5%, 15%, 0%) = 15%

Step 4: Calculate opportunityScore
  opportunityScore = 90 - (15 × 0.5) = 90 - 7.5 = 82.5

Status: excellent (no muscle > 66% fatigued, avgFreshness >= 90)
```

**Counter-Example (Suboptimal):**

```typescript
Exercise: Dumbbell Pullover
Muscle Engagements:
  - Pecs: 65% engagement, 85% fatigued (15% recovery) ❌
  - Lats: 60% engagement, 10% fatigued (90% recovery)
  - Deltoids: 50% engagement, 78% fatigued (22% recovery) ⚠️
  - Triceps: 25% engagement, 90% fatigued (10% recovery)

Step 1: Identify primary muscles
  Primary: Pecs (65%), Lats (60%), Deltoids (50%)

Step 2: Calculate avgFreshness
  avgFreshness = (15 + 90 + 22) / 3 = 42.3%

Step 3: Find maxFatigue
  maxFatigue = 90% (Triceps)

Step 4: Calculate opportunityScore
  opportunityScore = 42.3 - (90 × 0.5) = 42.3 - 45 = -2.7 (very low!)

Step 5: Detect limiting factors
  Limiting factors: Pecs (85% fatigued), Deltoids (78% fatigued), Triceps (90% fatigued)

Status: suboptimal (multiple limiting factors detected)
Explanation: "Pecs are 85% fatigued and may limit performance"
```

---

## Status Classification Rules

```typescript
function determineStatus(
  avgFreshness: number,
  limitingFactors: MuscleReadiness[]
): Status {
  const limitingCount = limitingFactors.length;

  // Excellent: All muscles fresh, high primary freshness
  if (limitingCount === 0 && avgFreshness >= 90) {
    return 'excellent';
  }

  // Good: No limiting factors, decent primary freshness
  if (limitingCount === 0 && avgFreshness >= 70) {
    return 'good';
  }

  // Suboptimal: Has limiting factors BUT primary muscles still somewhat fresh
  if (limitingCount > 0 && avgFreshness >= 50) {
    return 'suboptimal';
  }

  // Not recommended: Primary muscles too fatigued
  return 'not-recommended';
}
```

**Limiting Factor Definition:**
A muscle is a limiting factor if:
- It's engaged in the exercise (any % engagement > 0)
- Its current fatigue is > 66% (in "red zone" on heat map)

---

## Data Structures

### Core Types

```typescript
// Recommendation engine output
export interface ExerciseRecommendation {
  exercise: Exercise;
  opportunityScore: number;
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended';
  explanation: string;
  equipmentAvailable: boolean;
}

// Internal calculation type
interface MuscleReadiness {
  muscle: Muscle;
  recovery: number;      // 0-100% (100 = fully recovered)
  fatigue: number;       // 0-100% (0 = fully recovered)
  engagement: number;    // 0-100% (how much this exercise works this muscle)
  isPrimary: boolean;    // engagement >= 50%
}
```

### Equipment Filtering

```typescript
// User equipment (from profile)
interface EquipmentItem {
  id: string;
  type: Equipment;
  weightRange?: { min: number; max: number; increment: number };
  quantity: number;
}

// Exercise requirements (from constants.ts)
interface Exercise {
  // ... other fields
  equipment: Equipment | Equipment[];  // Can require single or multiple equipment types
}

// Matching logic
function checkEquipmentAvailable(
  requiredEquipment: Equipment | Equipment[],
  userEquipment: EquipmentItem[]
): boolean {
  const required = Array.isArray(requiredEquipment) ? requiredEquipment : [requiredEquipment];

  // Exercise is available if user has ALL required equipment types
  return required.every(reqType =>
    userEquipment.some(userEq => userEq.type === reqType && userEq.quantity > 0)
  );
}

// Example:
// Exercise: Dumbbell Bench Press
// requiredEquipment: [Equipment.Dumbbells, Equipment.Bench]
// User has: [{ type: Equipment.Dumbbells, quantity: 2 }, { type: Equipment.Bench, quantity: 1 }]
// Result: ✅ Available (user has both dumbbells and bench)
```

---

## UI Component Architecture

### Component Hierarchy

```
Dashboard.tsx
  └─ ExerciseRecommendations.tsx (new)
       ├─ CategoryTabs (Push/Pull/Legs/Core/All)
       ├─ RecommendationSection (excellent group)
       │    └─ RecommendationCard[] (individual exercises)
       │         ├─ ExerciseInfo (name, muscle engagements)
       │         ├─ StatusBadge (⭐ ✅ ⚠️ ❌)
       │         ├─ ExplanationText
       │         └─ AddToWorkoutButton
       ├─ RecommendationSection (good group)
       ├─ CollapsibleSection (suboptimal group)
       └─ CollapsibleSection (not-recommended group)
```

### Props Flow

```typescript
// Dashboard passes to ExerciseRecommendations
<ExerciseRecommendations
  muscleStates={muscleStates}              // From GET /api/muscle-states
  equipment={profile.equipment}            // From user profile
  category={selectedCategory}              // Optional filter (Push/Pull/Legs/Core)
  onAddToWorkout={handleAddExerciseToWorkout}
/>

// ExerciseRecommendations calculates and passes to RecommendationCard
<RecommendationCard
  recommendation={recommendation}
  onAdd={() => onAddToWorkout(recommendation.exercise)}
/>
```

---

## Integration Points

### 1. Dashboard Integration

**Where:** `components/Dashboard.tsx`

**Changes:**
- Add new section below muscle heat map: "Recommended Exercises"
- Fetch muscle states (already exists)
- Pass to `<ExerciseRecommendations />` component
- Wire up "Add to Workout" callback to navigate to Workout screen with pre-selected exercise

**Code Addition:**
```typescript
// In Dashboard component
const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

return (
  <div className="dashboard">
    {/* Existing muscle heat map */}
    <MuscleHeatMap muscleStates={muscleStates} />

    {/* NEW: Exercise recommendations */}
    <ExerciseRecommendations
      muscleStates={muscleStates}
      equipment={profile.equipment}
      category={selectedCategory}
      onAddToWorkout={handleAddExerciseToWorkout}
    />
  </div>
);

function handleAddExerciseToWorkout(exercise: Exercise) {
  // Navigate to Workout screen with exercise pre-selected
  onStartWorkout();  // Opens workout screen
  // Pass exercise ID via context/state
  // Workout component auto-adds exercise to current session
}
```

### 2. Workout Screen Integration

**Where:** `components/Workout.tsx`

**Changes:**
- Accept optional `preSelectedExercises?: Exercise[]` prop
- If provided, auto-add to workout on mount
- Apply progressive overload if exercise was done before (leverage Priority 1 feature)

**Code Addition:**
```typescript
interface WorkoutProps {
  // ... existing props
  preSelectedExercises?: Exercise[];
}

useEffect(() => {
  if (preSelectedExercises && preSelectedExercises.length > 0) {
    preSelectedExercises.forEach(exercise => {
      addExerciseToWorkout(exercise);
      // If exercise was done before, auto-populate progressive overload
      const lastPerformance = getLastPerformance(exercise.name);
      if (lastPerformance) {
        applyProgressiveOverload(exercise, lastPerformance);
      }
    });
  }
}, [preSelectedExercises]);
```

---

## Performance Considerations

### Memoization Strategy

**Problem:** Calculating recommendations for 48 exercises on every render is expensive.

**Solution:** Memoize recommendations calculation

```typescript
const recommendations = useMemo(
  () => calculateRecommendations(muscleStates, equipment, category),
  [muscleStates, equipment, category]
);
```

**Recalculation Triggers:**
- Muscle states change (after workout logged)
- Equipment changes (user updates profile)
- Category filter changes (user switches tabs)

**Estimated Complexity:**
- 48 exercises × 13 muscles = 624 muscle engagement calculations
- O(n × m) where n = exercises, m = muscles per exercise
- With memoization: Negligible impact on UI

### Lazy Loading

For future optimization (if exercise library grows to 100+):
- Only calculate recommendations for visible category
- Load "suboptimal" and "not-recommended" only when user expands sections

---

## Error Handling

### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| No muscle states data (API fails) | Show error: "Cannot load recommendations. Muscle data unavailable." |
| No equipment in profile | Show all exercises with warning: "Equipment filter disabled. Update profile to customize." |
| All muscles fatigued (no "excellent" or "good" recommendations) | Show rest day message: "All muscles need recovery. Consider a rest day or light mobility work." |
| Invalid muscle state values (null/undefined) | Treat as 0% fatigued (100% recovered), log warning |
| Exercise with no muscle engagements | Skip exercise (shouldn't happen with proper data) |
| Category with no exercises | Show empty state: "No exercises in this category" |

---

## Testing Strategy

### Unit Tests (`utils/exerciseRecommendations.test.ts`)

```typescript
describe('calculateRecommendations', () => {
  test('recommends fresh muscle exercises as excellent', () => {
    const muscleStates = {
      Lats: { currentFatiguePercent: 10, ... },
      Biceps: { currentFatiguePercent: 5, ... },
    };
    const equipment = [{ type: Equipment.PullUpBar, quantity: 1 }];

    const recommendations = calculateRecommendations(muscleStates, equipment);
    const pullUps = recommendations.find(r => r.exercise.name === 'Pull-ups');

    expect(pullUps?.status).toBe('excellent');
  });

  test('detects limiting factors correctly', () => {
    const muscleStates = {
      Pecs: { currentFatiguePercent: 85, ... },
      Lats: { currentFatiguePercent: 10, ... },
    };

    const pullover = findRecommendation(muscleStates, 'Dumbbell Pullover');
    expect(pullover.status).toBe('suboptimal');
    expect(pullover.limitingFactors).toContainEqual(
      expect.objectContaining({ muscle: Muscle.Pecs })
    );
  });

  test('filters by equipment availability', () => {
    const equipment = [{ type: Equipment.Bodyweight, quantity: 1 }];
    const recommendations = calculateRecommendations(muscleStates, equipment);

    // Should only show bodyweight exercises
    recommendations.forEach(rec => {
      expect(rec.equipmentAvailable).toBe(true);
    });
  });
});
```

### Integration Tests

1. **Dashboard displays recommendations** - Verify recommendations section renders
2. **Category filtering works** - Toggle tabs, verify exercises filtered correctly
3. **Add to workout navigation** - Tap "Add to Workout", verify workout screen opens with exercise
4. **Real-time updates** - Log workout, verify recommendations refresh
5. **Mobile responsive** - Test on small screens, verify scrolling works

---

## Migration Plan

**No database changes required** - This is a pure UI/logic feature.

**Steps:**
1. Create `utils/exerciseRecommendations.ts`
2. Write unit tests
3. Create `components/ExerciseRecommendations.tsx`
4. Create `components/RecommendationCard.tsx`
5. Integrate into Dashboard
6. Wire up Workout screen pre-selection
7. Test end-to-end flow
8. Deploy

**Rollback Plan:**
- Remove `<ExerciseRecommendations />` from Dashboard
- No database rollback needed

---

## Future Enhancements

### V2: User Preference Learning
- Track which recommendations user follows vs ignores
- Adjust opportunity score based on historical acceptance rate
- Example: "You usually prefer compound exercises, prioritizing Pull-ups over Bicep Curls"

### V3: AI-Generated Explanations
- Integrate Claude Code to generate personalized, context-aware explanations
- Example: "Your triceps are 90% fatigued from yesterday's Push workout. Lats are fresh and ready for maximum growth stimulus."

### V4: Progressive Difficulty Recommendations
- Consider user's experience level (beginner/intermediate/advanced)
- Recommend progressions: "Ready to try weighted pull-ups? You've mastered bodyweight."

### V5: Form Cues & Video Integration
- Add "How to perform" links to exercise recommendations
- Video demonstrations for unfamiliar exercises

---

## Accessibility Considerations

- **Color blindness:** Don't rely solely on color for status (use icons: ⭐ ✅ ⚠️ ❌)
- **Screen readers:** Provide aria-labels for status badges
- **Keyboard navigation:** Make "Add to Workout" buttons keyboard accessible
- **Touch targets:** Ensure buttons are large enough for mobile (min 44×44px)

---

## Success Metrics (Future Analytics)

Track:
- **Recommendation acceptance rate** - % of "Add to Workout" clicks
- **Status distribution** - How often users see excellent vs suboptimal
- **Category preferences** - Which categories get most engagement
- **Equipment impact** - Do users with more equipment see better recommendations?

---

*This design provides a solid foundation for intelligent exercise guidance while maintaining simplicity and performance. The algorithm is deterministic and explainable, avoiding "black box" ML complexity for V1.*
