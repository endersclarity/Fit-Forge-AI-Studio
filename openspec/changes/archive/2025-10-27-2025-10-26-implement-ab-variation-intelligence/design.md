# Design Document: A/B Variation Intelligence

**Change ID:** `implement-ab-variation-intelligence`
**Created:** 2025-10-26

---

## Overview

This document defines the UI/UX design and technical architecture for the A/B Variation Intelligence feature. The system tracks which workout variation (A or B) users performed last and intelligently suggests alternating between variations and progression methods.

---

## UI/UX Design

### 1. Dashboard - Last Workout Context Section

**Location:** Dashboard screen, below muscle recovery heat map

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Last Workouts                              │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ 💪 Push          │  │ 💪 Pull          │ │
│  │ Last: Push A     │  │ Last: Pull B     │ │
│  │ 3 days ago       │  │ 5 days ago       │ │
│  │ → Ready for: B   │  │ → Ready for: A   │ │
│  └──────────────────┘  └──────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ 🦵 Legs          │  │ 🧘 Core          │ │
│  │ Last: Legs A     │  │ First workout!   │ │
│  │ 7 days ago       │  │ → Start with: A  │ │
│  │ → Ready for: B   │  │                  │ │
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
```

**Visual Hierarchy:**
- **Section Title:** "Last Workouts" - bold, 18px
- **Category Cards:** 4 cards in 2x2 grid (desktop), stacked (mobile)
- **Category Icon + Name:** Emoji + category name, 16px bold
- **Last Workout Info:** "Last: {variation}" - 14px regular
- **Days Ago:** Muted gray, 12px
- **Suggestion:** "→ Ready for: {variation}" - brand-cyan, 14px bold

**States:**
- **Has History:** Show last variation and days ago
- **No History:** Show "First workout! → Start with: A"
- **Loading:** Skeleton cards with shimmer animation
- **Error:** Gray card with "Unable to load" message

**Interaction:**
- Cards are clickable → navigate to Workout Templates screen with category pre-selected
- Tapping card highlights suggested template

**Responsive Design:**
- **Desktop (≥768px):** 2x2 grid
- **Tablet (≥640px):** 2x2 grid, smaller cards
- **Mobile (<640px):** Stacked vertically, full width

---

### 2. Workout Templates Screen - Variation Highlighting

**Location:** Workout Templates screen, template selection grid

**Visual Design:**
```
Selected Category: Push

┌─────────────────────────────────────────────┐
│  ┏━━━━━━━━━━━━━━━┓  ┌──────────────────┐   │
│  ┃ 🌟 Push B     ┃  │ Push A           │   │
│  ┃ RECOMMENDED   ┃  │                  │   │
│  ┃ ⚖️ Weight Focus┃  │ 🔁 Reps Focus    │   │
│  ┗━━━━━━━━━━━━━━━┛  └──────────────────┘   │
└─────────────────────────────────────────────┘
```

**Suggested Template (Push B):**
- **Border:** 2px solid brand-cyan
- **Background:** Subtle gradient (cyan-50 → transparent)
- **Badge:** "RECOMMENDED" chip in top-right, brand-cyan background
- **Shadow:** Elevated shadow (shadow-lg)
- **Method Indicator:** Icon showing recommended method (⚖️ or 🔁)

**Alternative Template (Push A):**
- **Border:** 1px solid gray-300
- **Background:** White
- **Opacity:** 70% (muted but still clickable)
- **Method Indicator:** Muted icon showing previous method

**Interaction:**
- Suggested template pulses subtly on page load (1 pulse)
- Tapping either template works (suggestion not mandatory)
- Method badge has tooltip on hover

---

### 3. Progressive Overload UI - Method Recommendation

**Location:** Workout screen, exercise card, below exercise name

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Bench Press                                │
│  Last time: ⚖️ Weight → Try: 🔁 Reps ℹ️      │
│  ┌─────┬────────┬──────┬────────────┐      │
│  │  ✓  │ Set    │ Reps │ Weight     │      │
│  └─────┴────────┴──────┴────────────┘      │
└─────────────────────────────────────────────┘
```

**Method Recommendation Row:**
- **Text:** "Last time: {icon} {method} → Try: {icon} {method}"
- **Icons:** ⚖️ for weight, 🔁 for reps
- **Styling:** 12px, muted gray with cyan highlight on suggested method
- **Info Icon:** Clickable ℹ️ that shows tooltip

**Tooltip Content:**
```
Why Alternate Methods?

Changing between weight and reps progression
prevents adaptation plateaus. This keeps your
muscles adapting and growing.

Example:
Session 1: 100 lbs × 8 reps
Session 2: 103 lbs × 8 reps (weight ⚖️)
Session 3: 103 lbs × 9 reps (reps 🔁)
```

**States:**
- **First Workout:** "Establishing baseline ⚖️"
- **Weight Suggested:** "Last time: 🔁 Reps → Try: ⚖️ Weight ℹ️"
- **Reps Suggested:** "Last time: ⚖️ Weight → Try: 🔁 Reps ℹ️"
- **Unknown/Ambiguous:** "Try: ⚖️ Weight ℹ️" (default to weight)

---

### 4. Workout Summary Modal - Variation Display

**Location:** Post-workout summary modal, below workout name

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Workout Complete! 🎉                       │
│                                             │
│  Push Workout B                             │
│  Variation: B | Method: ⚖️ Weight            │
│                                             │
│  • 3 exercises completed                    │
│  • 9 sets total                             │
│  • 45 minutes                               │
│                                             │
│  [View Details]  [Done]                     │
└─────────────────────────────────────────────┘
```

**Variation Display:**
- **Format:** "Variation: {A|B|Both} | Method: {icon} {method}"
- **Styling:** 12px, muted gray
- **Purpose:** Confirm what was tracked for user awareness

---

## Component Architecture

### New Components

#### 1. `LastWorkoutContext.tsx`
```typescript
interface LastWorkout {
  id: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Core';
  variation: 'A' | 'B' | 'Both';
  progression_method: 'weight' | 'reps' | null;
  completed_at: string; // ISO timestamp
  days_ago: number;
}

interface LastWorkoutContextProps {
  // No props, self-contained component
}

export function LastWorkoutContext() {
  const [lastWorkouts, setLastWorkouts] = useState<Record<string, LastWorkout | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch last workout for each category
    fetchLastWorkouts();
  }, []);

  const fetchLastWorkouts = async () => {
    // Call GET /api/workouts/last?category={cat} for each category
  };

  const getSuggestedVariation = (lastVariation: string): string => {
    if (lastVariation === 'A') return 'B';
    if (lastVariation === 'B') return 'A';
    return 'A'; // Default for 'Both' or first-time
  };

  return (
    <div className="last-workout-context">
      {/* Render cards for each category */}
    </div>
  );
}
```

#### 2. `MethodBadge.tsx`
```typescript
interface MethodBadgeProps {
  lastMethod: 'weight' | 'reps' | null;
  suggestedMethod: 'weight' | 'reps';
  showTooltip?: boolean;
}

export function MethodBadge({ lastMethod, suggestedMethod, showTooltip }: MethodBadgeProps) {
  const getIcon = (method: 'weight' | 'reps') => {
    return method === 'weight' ? '⚖️' : '🔁';
  };

  return (
    <div className="method-badge">
      {lastMethod && (
        <span>Last time: {getIcon(lastMethod)} {lastMethod}</span>
      )}
      <span className="arrow">→</span>
      <span className="suggested">Try: {getIcon(suggestedMethod)} {suggestedMethod}</span>
      {showTooltip && <InfoIcon onClick={() => showMethodTooltip()} />}
    </div>
  );
}
```

### Modified Components

#### 1. `Dashboard.tsx`
- **Change:** Import and render `<LastWorkoutContext />` component
- **Location:** Below muscle recovery section, above exercise recommendations
- **File:** `components/Dashboard.tsx`

#### 2. `WorkoutTemplates.tsx`
- **Change:** Add highlighting logic for suggested template
- **Data Needed:** Fetch last workout for selected category
- **Logic:** Determine opposite variation, apply "recommended" styling
- **File:** `components/WorkoutTemplates.tsx`

#### 3. `Workout.tsx`
- **Change 1:** Add `variation` to workout save payload
- **Change 2:** Add `progression_method` to workout save payload
- **Change 3:** Implement method detection algorithm
- **Change 4:** Display `MethodBadge` component in progressive overload section
- **File:** `components/Workout.tsx`

---

## Data Flow

### 1. Fetching Last Workout

```
Dashboard Component Mount
    ↓
LastWorkoutContext.tsx: useEffect()
    ↓
For each category ['Push', 'Pull', 'Legs', 'Core']:
    ↓
GET /api/workouts/last?category={category}
    ↓
Backend queries database:
SELECT * FROM workouts
WHERE category = '{category}'
ORDER BY completed_at DESC
LIMIT 1
    ↓
Return { id, category, variation, progression_method, completed_at }
    ↓
Calculate days_ago = (now - completed_at) in days
    ↓
Store in lastWorkouts state
    ↓
Render cards with last workout info and suggestion
```

### 2. Saving Workout with Variation

```
User completes workout → Clicks "Finish Workout"
    ↓
Workout.tsx: saveWorkout()
    ↓
Determine variation:
  - If workout from template: variation = template.variation
  - If custom workout: variation = 'Both'
    ↓
Detect progression method:
  - Fetch last workout of same category
  - Compare avg weight: (current_avg - last_avg) / last_avg
  - Compare avg reps: (current_avg - last_avg) / last_avg
  - If weight_change ≥ 2%: method = 'weight'
  - If reps_change ≥ 2%: method = 'reps'
  - Else: method = opposite of last method (alternate)
    ↓
POST /api/workouts
{
  ...existing fields,
  variation: 'A' | 'B' | 'Both',
  progression_method: 'weight' | 'reps'
}
    ↓
Backend saves to database
    ↓
Return to Dashboard → LastWorkoutContext refetches
```

---

## Progression Method Detection Algorithm

### Input
- **Current Workout:** List of exercises with sets (weight, reps)
- **Last Workout:** Last workout in same category

### Logic

```typescript
function detectProgressionMethod(
  currentWorkout: Workout,
  lastWorkout: Workout | null
): 'weight' | 'reps' {
  if (!lastWorkout) {
    return 'weight'; // Default for first workout
  }

  // Build map of exercise_id → avg_weight, avg_reps for both workouts
  const currentAvg = calculateAverages(currentWorkout);
  const lastAvg = calculateAverages(lastWorkout);

  let totalWeightChange = 0;
  let totalRepsChange = 0;
  let commonExercises = 0;

  // Compare only common exercises
  for (const exerciseId in currentAvg) {
    if (lastAvg[exerciseId]) {
      const weightChange = (currentAvg[exerciseId].weight - lastAvg[exerciseId].weight) / lastAvg[exerciseId].weight;
      const repsChange = (currentAvg[exerciseId].reps - lastAvg[exerciseId].reps) / lastAvg[exerciseId].reps;

      totalWeightChange += weightChange;
      totalRepsChange += repsChange;
      commonExercises++;
    }
  }

  if (commonExercises === 0) {
    // No common exercises, alternate from last method
    return lastWorkout.progression_method === 'weight' ? 'reps' : 'weight';
  }

  const avgWeightChange = totalWeightChange / commonExercises;
  const avgRepsChange = totalRepsChange / commonExercises;

  // Threshold: 2% change
  const THRESHOLD = 0.02;

  if (avgWeightChange >= THRESHOLD && avgWeightChange > avgRepsChange) {
    return 'weight';
  } else if (avgRepsChange >= THRESHOLD && avgRepsChange > avgWeightChange) {
    return 'reps';
  } else {
    // Ambiguous or both increased, alternate from last
    return lastWorkout.progression_method === 'weight' ? 'reps' : 'weight';
  }
}

function calculateAverages(workout: Workout): Record<string, { weight: number; reps: number }> {
  const averages: Record<string, { weight: number; reps: number }> = {};

  for (const exercise of workout.exercises) {
    const totalWeight = exercise.sets.reduce((sum, set) => sum + set.weight, 0);
    const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
    const setCount = exercise.sets.length;

    averages[exercise.exercise_id] = {
      weight: totalWeight / setCount,
      reps: totalReps / setCount
    };
  }

  return averages;
}
```

### Edge Cases

1. **New Exercise Added:** Ignore exercises not in last workout
2. **Exercise Removed:** Only compare common exercises
3. **Both Weight and Reps Increased Significantly:** Favor larger percentage change
4. **Neither Increased:** Alternate from last method
5. **First Workout Ever:** Default to 'weight'

---

## API Endpoints

### 1. GET /api/workouts/last

**Query Parameters:**
- `category` (required): 'Push' | 'Pull' | 'Legs' | 'Core'

**Response:**
```json
{
  "id": "workout-uuid",
  "user_id": "user-uuid",
  "category": "Push",
  "variation": "A",
  "progression_method": "weight",
  "completed_at": "2025-10-23T14:30:00Z",
  "exercises": [...]
}
```

**Response (No History):**
```json
null
```

**Error Handling:**
- 400: Missing or invalid category parameter
- 401: Unauthorized (no auth token)
- 500: Server error

---

## Database Schema

**Table:** `workouts`

**Existing Fields:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `category` (TEXT: 'Push', 'Pull', 'Legs', 'Core')
- `completed_at` (TIMESTAMP)
- ... other fields ...

**Fields to Populate (Already Exist):**
- `variation` (TEXT: 'A', 'B', 'Both') - **Already exists, just needs population**
- `progression_method` (TEXT: 'weight', 'reps', null) - **Already exists, just needs population**

**No Schema Changes Required** ✅

---

## TypeScript Types

### New Types

```typescript
// types.ts or equivalent

export type WorkoutVariation = 'A' | 'B' | 'Both';
export type ProgressionMethod = 'weight' | 'reps';

export interface LastWorkoutResponse {
  id: string;
  user_id: string;
  category: WorkoutCategory;
  variation: WorkoutVariation;
  progression_method: ProgressionMethod | null;
  completed_at: string; // ISO 8601 timestamp
  exercises: LoggedExercise[];
}

export interface WorkoutSavePayload {
  // ... existing fields
  variation: WorkoutVariation;
  progression_method: ProgressionMethod;
}
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

1. **Keyboard Navigation**
   - All cards and badges tabbable
   - Enter/Space activates clickable elements
   - Tooltip accessible via keyboard

2. **Screen Readers**
   - ARIA labels on all cards: `aria-label="Last Push workout: Push A, 3 days ago. Ready for Push B."`
   - Method badge: `aria-label="Last workout focused on weight. Try reps today for varied stimulus."`
   - Recommended badge: `aria-label="Recommended template based on last workout"`

3. **Color Contrast**
   - Brand-cyan text: Ensure 4.5:1 contrast ratio
   - Muted alternative templates: Ensure still readable (3:1 minimum)

4. **Focus Indicators**
   - Visible focus ring on all interactive elements
   - 2px outline with offset

---

## Performance Considerations

### API Call Optimization

- **Dashboard:** Fetch all 4 categories in parallel (Promise.all)
- **Caching:** Cache last workout data for 60 seconds (avoid redundant calls)
- **Lazy Loading:** Load LastWorkoutContext only when dashboard visible

### Render Optimization

- **Memoization:** Use `useMemo` for variation calculation
- **Lazy Tooltips:** Only render tooltip modal when opened
- **Skeleton Loading:** Instant skeleton cards, avoid layout shift

---

## Mobile-Specific Design

### Touch Targets
- All cards: Minimum 44×44px touch target
- Info icons: 44×44px touch area
- Method badges: Entire badge clickable (not just icon)

### Responsive Breakpoints
- **Mobile (<640px):** Stack cards vertically, full width
- **Tablet (640-1024px):** 2×2 grid, medium cards
- **Desktop (≥1024px):** 2×2 grid, large cards

### Gestures
- Swipe left/right on cards to navigate between templates (future enhancement)
- Long-press on method badge to show tooltip (mobile alternative to hover)

---

## Error Handling

### API Errors

1. **Network Offline:**
   - Display gray card: "Unable to load. Check connection."
   - Retry button

2. **Backend Error (500):**
   - Display: "Something went wrong. Try again."
   - Log error to console

3. **No Workouts (Empty State):**
   - Display: "Ready for your first {category} workout!"
   - Not an error, graceful handling

### Edge Cases

1. **Workout with No Common Exercises:**
   - Default to alternate method
   - Log warning (not user-facing)

2. **Workout with Only New Exercises:**
   - Default to 'weight' method
   - Show "Establishing baseline" message

---

## Testing Strategy

### Unit Tests
- Variation suggestion logic (A ↔ B, Both → A)
- Days ago calculation
- Method detection algorithm
- Average weight/reps calculation

### Integration Tests
- API endpoint returns correct last workout
- Workout save includes variation and method
- Dashboard displays last workout context

### E2E Tests
- User completes workout → Dashboard updates
- User follows suggested variation → Template highlights correctly
- Method alternates correctly over multiple workouts

---

## Future Enhancements (Out of Scope)

1. **Recovery-Aware Suggestions:** Integrate muscle recovery to suggest variation based on ready muscles
2. **Periodization:** "Do 3 weeks of weight focus, then switch to reps"
3. **Analytics Charts:** Visualize weight vs reps progression over time
4. **Manual Override:** Dropdown to select method before starting workout
5. **Historical Migration:** Backfill old workouts with inferred method

---

**Status:** Design complete, ready for implementation
**Next Step:** Begin Phase 1 (Backend API Endpoint)
