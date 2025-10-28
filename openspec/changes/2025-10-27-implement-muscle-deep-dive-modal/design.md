# Design Document: Muscle Detail Deep-Dive Modal

**Change ID:** `implement-muscle-deep-dive-modal`
**Last Updated:** 2025-10-27

---

## Architecture Overview

The muscle detail modal is a complex component that integrates data from multiple sources (muscle states, exercise library, workout history, baselines) and applies intelligent ranking algorithms to provide personalized exercise recommendations.

```
┌────────────────────────────────────────────────────────────────┐
│                      MuscleDetailModal                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Modal Header                             │  │
│  │  - Muscle name + icon                                     │  │
│  │  - Close button (X)                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Muscle Overview Section                      │  │
│  │  ┌─────────────────┐  ┌──────────────────┐              │  │
│  │  │ Current Fatigue │  │ Volume Capacity   │              │  │
│  │  │  45.2%          │  │ 1200 / 2000      │              │  │
│  │  │  ████░░░░       │  │ ████████░░       │              │  │
│  │  └─────────────────┘  └──────────────────┘              │  │
│  │  ┌─────────────────────────────────────────┐             │  │
│  │  │ Last Trained: 2 days ago                │             │  │
│  │  │ Recovery: 3 days remaining              │             │  │
│  │  └─────────────────────────────────────────┘             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Exercise History Section                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Bench Press        Oct 25  800 lbs total volume    │  │  │
│  │  │ Push-ups           Oct 23  600 lbs total volume    │  │  │
│  │  │ Incline DB Press   Oct 21  1000 lbs total volume   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Smart Exercise Recommendations                    │  │
│  │  [Filter: All | Low Collateral | Isolation]              │  │
│  │  [Sort: Smart Score | Target % | Name]                   │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ ⭐ Tricep Pushdowns          Smart Score: 92       │  │  │
│  │  │ Target: 90% | Collateral Risk: Low                 │  │  │
│  │  │ Engaged: Triceps (90%), Forearms (10%)             │  │  │
│  │  │ Current fatigue: Triceps 45%, Forearms 20%         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Bench Press                  Smart Score: 65       │  │  │
│  │  │ Target: 75% | Collateral Risk: Medium              │  │  │
│  │  │ Engaged: Pectoralis (70%), Triceps (75%), ...      │  │  │
│  │  │ Current fatigue: Pectoralis 80% ⚠️                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Calibration Integration                        │  │
│  │  [Calibrate This Muscle] button                          │  │
│  │  Using: Calibrated engagement data ✓                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

Data Flow:
1. User clicks muscle → MuscleVisualization fires onClick with muscle name
2. Dashboard sets modalMuscle state and opens modal
3. Modal queries:
   - Muscle states API (fatigue, last trained, recovery)
   - Muscle baselines API (volume capacity)
   - Workout history API (exercises targeting muscle)
   - Exercise library (all exercises engaging muscle)
4. Modal calculates collateral fatigue risk for each exercise
5. Modal ranks exercises by smart score
6. Modal renders recommendations sorted by score
```

---

## Component Specifications

### 1. MuscleDetailModal.tsx

**Purpose:** Top-level modal container managing state and data fetching

**Props:**
```typescript
interface MuscleDetailModalProps {
  muscle: Muscle | null;                    // Which muscle to show (null = closed)
  muscleStates: MuscleStatesResponse;       // Current fatigue data for all muscles
  muscleBaselines: MuscleBaselines;         // Volume capacity data
  workoutHistory: WorkoutSession[];         // Historical workout data
  onClose: () => void;                      // Close modal callback
  onCalibrateClick?: (muscle: Muscle) => void; // Open calibration modal
  className?: string;
}
```

**State:**
```typescript
interface ModalState {
  loading: boolean;                         // Fetching data
  error: Error | null;                      // Error state
  exerciseHistory: ExerciseHistoryItem[];   // Filtered history for muscle
  recommendations: RankedExercise[];        // Smart-ranked exercises
  filterMode: 'all' | 'low-collateral' | 'isolation';
  sortMode: 'smart-score' | 'target-engagement' | 'name';
}
```

**Behavior:**
- Opens when `muscle` prop is not null
- Fetches exercise history for selected muscle
- Calculates smart scores for all exercises engaging muscle
- Applies filter and sort based on user selection
- Traps focus within modal when open
- Closes on ESC, X button, or outside click
- Restores focus to trigger element on close

---

### 2. MuscleOverviewSection.tsx

**Purpose:** Display current muscle status and capacity

**Props:**
```typescript
interface MuscleOverviewProps {
  muscle: Muscle;
  fatiguePercent: number;                   // Current fatigue (0-100)
  lastTrained: Date | null;                 // Last workout date
  daysUntilRecovered: number;               // Calculated recovery days
  volumeCapacity: {                         // From baselines
    current: number;                        // Recent volume applied
    max: number;                            // Learned or default max
    isCalibrated: boolean;                  // User override exists
  };
}
```

**Display:**
- Muscle name with anatomical icon
- Fatigue percentage with color-coded progress bar
- Last trained date (relative: "2 days ago")
- Recovery timeline ("3 days remaining" or "Fully recovered")
- Volume capacity bar (current / max)
- Calibration badge if using user-override baselines

---

### 3. ExerciseHistorySection.tsx

**Purpose:** Show recent exercises that targeted this muscle

**Props:**
```typescript
interface ExerciseHistoryProps {
  muscle: Muscle;
  workoutHistory: WorkoutSession[];
  limit?: number;                           // Default: 5
  onViewSession?: (sessionId: string) => void;
}
```

**Data Processing:**
```typescript
interface ExerciseHistoryItem {
  exerciseName: string;
  date: Date;
  totalVolume: number;                      // Sum of weight × reps across sets
  sets: number;
  engagement: number;                       // Muscle engagement % for this exercise
  sessionId: string;                        // Link to full workout
}

// Filter logic:
// 1. Get all logged exercises from workout history
// 2. Filter to exercises with muscle in engagement map (major or minor)
// 3. Sort by date (most recent first)
// 4. Take top N (limit)
```

**Display:**
- Table or card list of exercises
- Sortable by date or volume
- Click to view full workout session
- Empty state: "No exercises recorded for this muscle yet"

---

### 4. SmartRecommendationsSection.tsx

**Purpose:** Display exercise recommendations ranked by smart score

**Props:**
```typescript
interface SmartRecommendationsProps {
  muscle: Muscle;
  muscleStates: MuscleStatesResponse;       // All muscle fatigue data
  exercises: Exercise[];                    // From EXERCISE_LIBRARY
  filterMode: 'all' | 'low-collateral' | 'isolation';
  sortMode: 'smart-score' | 'target-engagement' | 'name';
  onFilterChange: (mode: FilterMode) => void;
  onSortChange: (mode: SortMode) => void;
  onExerciseSelect?: (exercise: Exercise) => void;
}
```

**Data Processing:**
```typescript
interface RankedExercise {
  exercise: Exercise;
  targetEngagement: number;                 // % engagement of selected muscle
  collateralRisk: number;                   // Risk score (0-100)
  smartScore: number;                       // Calculated ranking score
  engagedMuscles: {                         // All muscles engaged by exercise
    muscle: Muscle;
    engagement: number;
    currentFatigue: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high';     // Derived from collateralRisk
}

// Smart score calculation (see Algorithm section below)
```

**Display:**
- Filter tabs: All | Low Collateral | Isolation
- Sort dropdown: Smart Score | Target % | Name
- Exercise cards with:
  - Exercise name
  - Smart score badge (prominent)
  - Target engagement percentage
  - Collateral risk indicator (color-coded)
  - Engaged muscles breakdown (expandable)
  - Current fatigue for each engaged muscle
  - Warning icon if any engaged muscle >70% fatigue
- Click to add exercise to workout (future integration)

---

## Algorithm Specifications

### Collateral Fatigue Risk Calculation

**Purpose:** Calculate risk score (0-100) representing likelihood that performing this exercise will push other muscles into overfatigue.

**Inputs:**
- Exercise engagement data (muscle → engagement %)
- Current muscle states (all muscles → current fatigue %)
- Selected target muscle (the muscle user clicked on)

**Algorithm:**
```typescript
function calculateCollateralRisk(
  exercise: Exercise,
  targetMuscle: Muscle,
  muscleStates: MuscleStatesResponse
): number {
  const OVERFATIGUE_THRESHOLD = 70; // Fatigue % considered high risk
  const WEIGHT_MAJOR = 1.0;          // Weight for major muscle groups
  const WEIGHT_MINOR = 0.5;          // Weight for minor/stabilizer muscles

  let totalRisk = 0;
  let totalWeight = 0;

  // Iterate through all muscles engaged by exercise
  for (const [muscle, engagement] of Object.entries(exercise.engagement)) {
    // Skip the target muscle (we WANT to fatigue it)
    if (muscle === targetMuscle) continue;

    const currentFatigue = muscleStates[muscle]?.currentFatiguePercent ?? 0;
    const engagementPercent = engagement;

    // Determine weight (major vs minor muscle)
    const weight = engagement >= 30 ? WEIGHT_MAJOR : WEIGHT_MINOR;

    // Calculate risk contribution:
    // - High current fatigue + high engagement = high risk
    // - Low current fatigue + low engagement = low risk
    const muscleRisk = (currentFatigue / 100) * (engagementPercent / 100);

    // Apply overfatigue multiplier if muscle already near threshold
    const multiplier = currentFatigue > OVERFATIGUE_THRESHOLD ? 2.0 : 1.0;

    totalRisk += muscleRisk * weight * multiplier;
    totalWeight += weight;
  }

  // Normalize to 0-100 scale
  const normalizedRisk = (totalRisk / totalWeight) * 100;

  return Math.min(100, Math.max(0, normalizedRisk));
}
```

**Risk Level Mapping:**
- **Low (0-30):** Most supporting muscles are fresh, safe to perform
- **Medium (30-60):** Some supporting muscles moderately fatigued, proceed with caution
- **High (60-100):** Multiple supporting muscles highly fatigued, high risk of overtraining

---

### Smart Score Calculation

**Purpose:** Rank exercises by combination of target muscle efficiency and collateral fatigue safety.

**Algorithm:**
```typescript
function calculateSmartScore(
  exercise: Exercise,
  targetMuscle: Muscle,
  muscleStates: MuscleStatesResponse
): number {
  // Get target muscle engagement (how well does exercise target selected muscle)
  const targetEngagement = exercise.engagement[targetMuscle] ?? 0;

  // Calculate collateral risk
  const collateralRisk = calculateCollateralRisk(exercise, targetMuscle, muscleStates);

  // Smart score formula:
  // Balance between target efficiency and safety
  // Higher target engagement = better
  // Lower collateral risk = better

  const WEIGHT_TARGET = 0.5;      // 50% weight on target engagement
  const WEIGHT_SAFETY = 0.5;      // 50% weight on safety (inverse of risk)

  const targetScore = targetEngagement; // Already 0-100
  const safetyScore = 100 - collateralRisk; // Invert risk to safety score

  const smartScore = (targetScore * WEIGHT_TARGET) + (safetyScore * WEIGHT_SAFETY);

  return Math.round(smartScore);
}
```

**Interpretation:**
- **90-100:** Excellent choice - high target engagement, low collateral risk
- **70-89:** Good choice - decent target engagement, manageable collateral risk
- **50-69:** Fair choice - moderate target engagement or moderate collateral risk
- **0-49:** Poor choice - low target engagement or high collateral risk

**Example Scenarios:**

*Scenario 1: Triceps at 45% fatigue, Pectoralis at 80% fatigue*
- **Tricep Pushdowns** (Triceps 90%, Forearms 10%)
  - Target: 90, Collateral Risk: ~15 (forearms fresh), Smart Score: ~93
- **Bench Press** (Pectoralis 70%, Triceps 75%)
  - Target: 75, Collateral Risk: ~65 (pectoralis near overfatigue), Smart Score: ~55

Result: Tricep Pushdowns ranked much higher despite lower tricep engagement in Bench Press, because pectoralis collateral risk is too high.

*Scenario 2: All muscles fresh (20-30% fatigue)*
- **Bench Press** (Pectoralis 70%, Triceps 75%)
  - Target: 75, Collateral Risk: ~25 (all muscles fresh), Smart Score: ~75
- **Tricep Pushdowns** (Triceps 90%, Forearms 10%)
  - Target: 90, Collateral Risk: ~12, Smart Score: ~94

Result: Both exercises score well, but isolation exercise still preferred due to higher target engagement.

---

## Data Flow Architecture

### 1. Modal Open Sequence

```
User clicks muscle (e.g., "Triceps")
  ↓
MuscleVisualization.onClick → calls onMuscleClick(Muscle.Triceps)
  ↓
Dashboard.handleMuscleClick → sets state: { modalMuscle: Muscle.Triceps }
  ↓
MuscleDetailModal receives props: { muscle: Muscle.Triceps, ... }
  ↓
Modal.useEffect triggered (muscle prop changed)
  ↓
Modal fetches/processes data:
  - Filter workout history for exercises with Triceps engagement
  - Get exercises from EXERCISE_LIBRARY where Triceps in engagement map
  - Calculate smart scores for all matching exercises
  - Sort by smart score (descending)
  ↓
Modal renders with ranked recommendations
```

### 2. Data Dependencies

**Required APIs:**
- `GET /api/muscle-states` - Current fatigue for all muscles (already implemented)
- `GET /api/muscle-baselines` - Volume capacity data (already implemented)
- Workout history from props (already available in Dashboard)
- Exercise library from constants (already available)

**No new API endpoints required** - all data already available.

### 3. Performance Considerations

**Calculation Complexity:**
- Collateral risk: O(M × E) where M = muscles engaged, E = exercises
- For typical case: 4 muscles × 20 exercises = 80 calculations
- Each calculation is simple arithmetic (~0.1ms)
- **Total calculation time: ~8ms (well under 50ms budget)**

**Optimization Strategies:**
- Memoize smart scores when muscle states unchanged
- Pre-filter exercises to only those engaging target muscle (reduces E)
- Use useMemo for expensive calculations
- Calculate on modal open (not on every render)

---

## Responsive Design

### Desktop Layout (>768px)

- Centered modal: 60% viewport width, max 800px
- 3-column layout:
  - Left: Muscle overview + calibration
  - Center: Exercise recommendations (main focus)
  - Right: Exercise history
- Larger font sizes, more whitespace
- Hover states on exercise cards

### Tablet Layout (480-768px)

- Wider modal: 80% viewport width
- 2-column layout:
  - Top: Muscle overview + calibration (stacked)
  - Bottom: Tabs for Recommendations | History
- Medium font sizes
- Touch-optimized tap targets (44px min)

### Mobile Layout (<480px)

- Full screen modal (100% viewport)
- Single column, scrollable
- Sections in order:
  1. Muscle overview
  2. Recommendations (collapsed list, expand for details)
  3. History (collapsed, expand to view)
  4. Calibration (bottom)
- Large font sizes for readability
- Sticky header with close button

---

## Accessibility

### Keyboard Navigation

- **Tab:** Move between focusable elements
- **Shift+Tab:** Move backward
- **ESC:** Close modal
- **Enter/Space:** Activate buttons, expand sections
- **Arrow keys:** Navigate recommendation list (future enhancement)

### Focus Management

- **On open:** Focus trapped within modal
- **Initial focus:** Close button (X)
- **Tab order:** Header → Overview → Recommendations → History → Calibration → Close
- **On close:** Restore focus to trigger element (muscle that was clicked)

### Screen Reader Support

- Modal has `role="dialog"` and `aria-labelledby` (muscle name)
- Live region for status updates ("Calculating recommendations...")
- ARIA labels for all interactive elements
- Exercise cards have descriptive text for engagement breakdown
- Collateral risk level announced ("Low risk", "Medium risk", "High risk")

### Visual Accessibility

- High contrast text (WCAG AA minimum 4.5:1)
- Color-blind friendly indicators (not relying on color alone)
  - Risk levels use icons + color (green checkmark, yellow warning, red alert)
- Focus indicators clearly visible (2px outline)
- Font size minimum 14px (body text), 16px (headings)

---

## Edge Cases & Error Handling

### 1. No exercise history for muscle

**Scenario:** User clicks muscle that has never been trained
**Behavior:** Show empty state with encouraging message:
> "No exercises recorded yet for Triceps. Start by trying one of the recommended exercises below!"

### 2. No exercises in library engage muscle

**Scenario:** Muscle clicked but EXERCISE_LIBRARY has no matching exercises
**Behavior:** Show error state:
> "No exercises found for this muscle. Please contact support."
*This should never happen if exercise library is complete*

### 3. All exercises have high collateral risk

**Scenario:** User has overtrained many muscles, all exercises risky
**Behavior:**
- Show all exercises with warnings
- Display prominent rest day recommendation:
> "⚠️ Many muscles are highly fatigued. Consider taking a rest day."
- Smart scores will be low across the board

### 4. Muscle baseline data missing

**Scenario:** No baseline data exists for muscle (new user, untrained muscle)
**Behavior:**
- Show volume capacity as "Not yet established"
- Smart scores calculated with default engagement percentages
- Display message: "Train this muscle to establish volume capacity"

### 5. Modal open during workout completion

**Scenario:** User completes workout while modal is open
**Behavior:**
- Muscle states update via optimistic UI or refetch
- Modal recalculates smart scores automatically (useEffect on muscleStates)
- Toast notification: "Recommendations updated based on latest workout"

---

## Testing Strategy

### Unit Tests

**CollateralRiskCalculator.test.ts:**
- Test risk calculation with various fatigue states
- Verify overfatigue multiplier applies correctly
- Test edge cases (zero engagement, all muscles fresh, all muscles fatigued)

**SmartScoreCalculator.test.ts:**
- Test smart score formula with known inputs
- Verify ranking order matches expected priorities
- Test edge cases (zero target engagement, perfect scores)

### Integration Tests

**MuscleDetailModal.test.tsx:**
- Test modal opens and closes correctly
- Verify data fetching and processing
- Test filter and sort functionality
- Verify recommendations displayed in correct order

### Manual QA

- Test all 13 muscle groups
- Test with various muscle state scenarios:
  - All muscles fresh
  - Some muscles fatigued
  - Many muscles highly fatigued
  - Single muscle overtrained
- Verify smart scores make intuitive sense
- Test keyboard navigation and screen reader
- Test on mobile devices (iOS/Android)

---

## Future Enhancements

1. **Forecasted Fatigue Preview:**
   - Show predicted fatigue after performing recommended exercise
   - Visual "before/after" comparison

2. **Exercise Comparison:**
   - Select 2-3 exercises to compare smart scores side-by-side
   - Highlight differences in engagement and collateral risk

3. **Historical Trends:**
   - Chart showing muscle fatigue over time
   - Identify training patterns and gaps

4. **Smart Workout Builder Integration:**
   - "Add to workout" button on recommendation cards
   - Auto-populate workout with recommended exercises

5. **Personalized Risk Tolerance:**
   - User setting: Conservative vs Aggressive training style
   - Adjust collateral risk weighting based on preference

---

*This design document provides the complete technical specification for implementing the muscle detail deep-dive modal with intelligent exercise recommendations based on collateral fatigue awareness.*
