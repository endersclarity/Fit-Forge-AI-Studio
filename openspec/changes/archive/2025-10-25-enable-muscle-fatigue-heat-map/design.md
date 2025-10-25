# Design: Enable Muscle Fatigue Heat Map

**Change ID:** `enable-muscle-fatigue-heat-map`
**Created:** 2025-10-24

---

## Architecture Overview

This feature enhances the existing `MuscleRecoveryVisualizer` component on the Dashboard to provide a comprehensive visual "heat map" of muscle fatigue status. The enhancement focuses on:

1. **Categorized Display** - Group muscles by Push/Pull/Legs/Core categories
2. **Enhanced Visualization** - Color-coded progress bars with fatigue percentages
3. **Recovery Metadata** - Show "last trained", "days since", and "ready in X days"
4. **Interactive Exploration** - Tap muscles to see exercises that target them

**Key Design Principle:** Build on existing infrastructure. The data already exists - we're enhancing the visualization.

---

## Current State Analysis

### What Already Exists ✅

**Dashboard Component (Dashboard.tsx):**
- `MuscleRecoveryVisualizer` component displays muscle recovery
- Shows recovery percentage with progress bars
- Displays "last trained" and "days since" information
- Expandable details showing baseline capacity and session volumes
- Already sorted by recovery percentage

**Data Infrastructure:**
- `muscle_states` table with fatigue_percent, last_trained, volume_today
- GET /api/muscle-states endpoint
- Recovery calculation formula (5-day non-linear curve)
- All 13 muscle groups tracked in `Muscle` enum

**Helper Functions (utils/helpers.ts):**
- `calculateRecoveryPercentage()` - Computes recovery from days since
- `getDaysSince()` - Calculates days elapsed
- `getRecoveryColor()` - Returns color class based on recovery %

### What Needs Enhancement 🔨

**Categorization:**
- Current: Sorted by recovery percentage (least to most recovered)
- Proposed: Grouped by category (Push/Pull/Legs/Core) with visual headers

**Visual Clarity:**
- Current: Shows recovery percentage (0-100% recovered)
- Proposed: Show fatigue percentage (0-100% fatigued) with color coding
  - 🟢 Green: 0-33% fatigued (ready to train)
  - 🟡 Yellow: 34-66% fatigued (recovering)
  - 🔴 Red: 67-100% fatigued (needs rest)

**Recovery Time Estimates:**
- Current: Shows "Ready in: ~Xd" only when not fully recovered
- Proposed: Always show clear status: "Ready now" or "Ready in X days"

**Exercise Discovery:**
- Current: Expandable shows baseline/volume stats
- Proposed: Tappable shows exercises that target that muscle

---

## Component Design

### Enhanced MuscleRecoveryVisualizer Structure

```typescript
const MUSCLE_CATEGORIES = {
  Push: [Muscle.Pectoralis, Muscle.Deltoids, Muscle.Triceps],
  Pull: [Muscle.Lats, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Biceps, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Hamstrings, Muscle.Glutes, Muscle.Calves],
  Core: [Muscle.Core]
};

interface MuscleFatigueData {
  muscle: Muscle;
  fatiguePercent: number;  // 100 - recoveryPercent
  lastTrained: number | null;
  daysSince: number;
  daysUntilReady: number;
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';
}

interface ExerciseForMuscle {
  id: string;
  name: string;
  engagement: number;  // percentage (0-100)
  category: ExerciseCategory;
}
```

### Layout Structure

```
┌─ MUSCLE FATIGUE HEAT MAP ─────────────────────┐
│                                                │
│  PUSH MUSCLES                                  │
│  ┌─ Pectoralis ────────────────────────────┐  │
│  │ 85% fatigued | Last: 2d ago | Ready: 1d│  │
│  │ ████████████████▓▓▓▓▓▓░░░░░░░░░░ (🔴)   │  │
│  └─────────────────────────────────────────┘  │
│  ┌─ Deltoids ──────────────────────────────┐  │
│  │ 60% fatigued | Last: 3d ago | Ready now│  │
│  │ ██████████████░░░░░░░░░░░░░░░░░░ (🟡)   │  │
│  └─────────────────────────────────────────┘  │
│  ┌─ Triceps ───────────────────────────────┐  │
│  │ 30% fatigued | Last: 4d ago | Ready now│  │
│  │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (🟢)   │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  PULL MUSCLES                                  │
│  ┌─ Lats ──────────────────────────────────┐  │
│  │ 15% fatigued | Last: 5d ago | Ready now│  │
│  │ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (🟢)   │  │
│  │ [Tap to see exercises]                  │  │
│  └─────────────────────────────────────────┘  │
│  ...                                           │
│                                                │
│  LEGS MUSCLES                                  │
│  ...                                           │
│                                                │
│  CORE                                          │
│  ...                                           │
└────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Muscle Fatigue Calculation

**Input:** `MuscleStates` from API
```typescript
{
  [Muscle.Pectoralis]: {
    lastTrained: 1698192000000,  // timestamp
    fatiguePercentage: 85,
    recoveryDaysNeeded: 3
  },
  ...
}
```

**Transform:** Convert recovery % to fatigue %
```typescript
const fatiguePercent = 100 - recoveryPercent;
```

**Output:** Categorized muscle data
```typescript
{
  Push: [
    { muscle: Pectoralis, fatiguePercent: 85, daysSince: 2, ... },
    { muscle: Deltoids, fatiguePercent: 60, daysSince: 3, ... },
    ...
  ],
  Pull: [...],
  Legs: [...],
  Core: [...]
}
```

### 2. Color Coding Logic

```typescript
function getFatigueColor(fatiguePercent: number): string {
  if (fatiguePercent <= 33) return 'bg-green-500';  // Ready (🟢)
  if (fatiguePercent <= 66) return 'bg-yellow-500'; // Recovering (🟡)
  return 'bg-red-500';  // Fatigued (🔴)
}

function getRecoveryStatus(fatiguePercent: number): 'ready' | 'recovering' | 'fatigued' {
  if (fatiguePercent <= 33) return 'ready';
  if (fatiguePercent <= 66) return 'recovering';
  return 'fatigued';
}
```

### 3. Exercise Discovery

**When muscle tapped:**
1. Filter `EXERCISE_LIBRARY` for exercises that engage this muscle
2. Sort by engagement percentage (highest first)
3. Display in modal or expandable section

```typescript
function getExercisesForMuscle(muscle: Muscle): ExerciseForMuscle[] {
  return EXERCISE_LIBRARY
    .map(exercise => {
      const engagement = exercise.muscleEngagements.find(e => e.muscle === muscle);
      if (!engagement) return null;
      return {
        id: exercise.id,
        name: exercise.name,
        engagement: engagement.percentage,
        category: exercise.category
      };
    })
    .filter((ex): ex is ExerciseForMuscle => ex !== null)
    .sort((a, b) => b.engagement - a.engagement);
}
```

---

## UI/UX Design

### Category Headers

```tsx
<div className="mb-2">
  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
    Push Muscles
  </h4>
</div>
```

### Muscle Row (Enhanced)

```tsx
<div className="bg-brand-muted rounded-md p-3">
  {/* Header with muscle name and fatigue */}
  <div className="flex justify-between items-center mb-1">
    <span className="font-medium">{muscle}</span>
    <span className="text-slate-400 text-sm">
      {fatiguePercent}% fatigued
    </span>
  </div>

  {/* Progress bar - fills based on fatigue % */}
  <div className="w-full bg-slate-600 rounded-full h-2.5 mb-2">
    <div
      className={`${getFatigueColor(fatiguePercent)} h-2.5 rounded-full transition-all`}
      style={{ width: `${fatiguePercent}%` }}
    />
  </div>

  {/* Metadata row */}
  <div className="flex justify-between items-center text-xs text-slate-500">
    <span>
      {lastTrained ? `Last trained: ${daysSince}d ago` : 'Never trained'}
    </span>
    <span>
      {daysUntilReady === 0
        ? <span className="text-green-400 font-semibold">Ready now</span>
        : `Ready in ${daysUntilReady}d`
      }
    </span>
  </div>
</div>
```

### Exercise Modal (New)

```tsx
<div className="modal-overlay">
  <div className="modal-content">
    <h3>{muscle} Exercises</h3>
    <p className="text-sm text-slate-400">
      Exercises that target this muscle group:
    </p>

    <div className="space-y-2 mt-4">
      {exercises.map(ex => (
        <div key={ex.id} className="flex justify-between items-center p-2 bg-brand-surface rounded">
          <div>
            <p className="font-medium">{ex.name}</p>
            <p className="text-xs text-slate-400">{ex.category}</p>
          </div>
          <span className="text-brand-cyan font-semibold">
            {ex.engagement}%
          </span>
        </div>
      ))}
    </div>

    <button onClick={onClose}>Close</button>
  </div>
</div>
```

---

## Implementation Strategy

### Phase 1: Data Transformation (Backend - No Changes Needed ✅)
- All required data already exists in `muscle_states` table
- GET /api/muscle-states already returns all needed fields
- No database changes required

### Phase 2: Component Refactoring (Frontend)

**Step 1: Update Data Processing**
- Transform muscle states into categorized structure
- Convert recovery % to fatigue % (simple: `100 - recovery`)
- Calculate fatigue color based on new thresholds

**Step 2: Update UI Layout**
- Add category headers (Push/Pull/Legs/Core)
- Reorder muscles by category instead of recovery %
- Update color logic to show fatigue (not recovery)

**Step 3: Add Exercise Discovery**
- Create helper function to get exercises for muscle
- Add tap handler to muscle rows
- Create modal component for exercise list
- Display exercises sorted by engagement %

### Phase 3: Polish & Refinement

**Step 1: Visual Enhancements**
- Smooth transitions for color changes
- Loading states for muscle data
- Empty states for never-trained muscles

**Step 2: Accessibility**
- ARIA labels for progress bars
- Keyboard navigation for muscle rows
- Screen reader announcements for fatigue levels

**Step 3: Performance**
- Memoize categorized muscle data
- Lazy load exercise modal
- Optimize re-renders

---

## Edge Cases & Handling

### Edge Case 1: Never-Trained Muscle
**Scenario:** User has never trained a specific muscle
**Current State:** `lastTrained = null`
**Display:**
- Fatigue: 0% (fully recovered)
- Last trained: "Never trained"
- Status: 🟢 "Ready now"

### Edge Case 2: All Muscles Fatigued
**Scenario:** User just completed full-body workout
**Display:**
- All categories show 🔴 red bars
- Clear "Ready in X days" for each
- No "rest recommended" banner (user can still see progress)

### Edge Case 3: Muscle with No Exercises
**Scenario:** Muscle exists but no exercises in library target it (unlikely)
**Display:**
- Show muscle normally
- On tap: "No exercises found for this muscle"

### Edge Case 4: Recovery Percentage Calculation Error
**Scenario:** `recoveryDaysNeeded` is 0 or negative
**Fallback:**
- Assume fully recovered (0% fatigue)
- Log warning to console
- Still display muscle in list

---

## Testing Strategy

### Unit Tests (Component Logic)

1. **Data Transformation**
   - Test: Convert recovery % to fatigue % correctly
   - Test: Categorize muscles into correct groups
   - Test: Handle null/undefined lastTrained

2. **Color Coding**
   - Test: 0-33% fatigue → green
   - Test: 34-66% fatigue → yellow
   - Test: 67-100% fatigue → red
   - Test: Edge values (33%, 66%, 67%)

3. **Exercise Discovery**
   - Test: Find all exercises for a given muscle
   - Test: Sort exercises by engagement %
   - Test: Handle muscles with no exercises

### Integration Tests

1. **Full Heat Map Render**
   - Load Dashboard with muscle states
   - Verify all 13 muscles display
   - Verify correct categorization (Push: 3, Pull: 5, Legs: 4, Core: 1)
   - Verify progress bars render

2. **Interactive Behavior**
   - Click muscle row
   - Verify exercise modal opens
   - Verify exercises listed correctly
   - Close modal, verify UI returns to normal

3. **Real-Time Updates**
   - Log a workout affecting Pectoralis
   - Verify heat map updates fatigue %
   - Verify color changes if threshold crossed

---

## Performance Considerations

**Data Volume:**
- 13 muscles = minimal data
- Exercise library = 48 exercises (all client-side)
- No pagination needed

**Rendering Optimization:**
- Use `useMemo` for categorized muscle data
- Use `React.memo` for individual muscle rows
- Lazy load exercise modal component

**API Calls:**
- Single GET /api/muscle-states on mount
- No polling (data updates after workout save)
- No additional backend load

---

## Accessibility

**Keyboard Navigation:**
- Tab through muscle rows
- Enter/Space to open exercise modal
- Esc to close modal

**Screen Readers:**
- ARIA labels on progress bars: "Pectoralis: 85% fatigued"
- ARIA live region for status changes
- Semantic HTML (headers, buttons, lists)

**Color Blindness:**
- Don't rely solely on color (also use text: "Ready now", "Ready in Xd")
- High contrast between fatigue bar and background
- Text labels for all critical information

---

## Migration Plan

### No Database Changes Required ✅

All data already exists. This is purely a frontend enhancement.

### Deployment Strategy

**Step 1: Frontend Update**
- Deploy enhanced Dashboard component
- No feature flags needed (visual enhancement only)
- Backwards compatible (uses existing API)

**Step 2: Monitoring**
- Monitor console for any rendering errors
- Check performance metrics (should be negligible impact)
- Gather user feedback on new visualization

**Step 3: Iteration**
- Adjust color thresholds based on feedback
- Refine exercise discovery UX
- Add future enhancements (e.g., 3D model)

**Rollback Plan:**
- Simple: Revert Dashboard.tsx to previous version
- No data loss (no backend changes)
- No user-facing errors (graceful degradation)

---

## V1 Limitations (Acknowledged)

As noted in the proposal and brainstorming session:

**Limitation 1: Hardcoded Baselines**
- Uses 10,000 baseline for all muscles
- Not personalized to individual capacity
- Future: Baseline learning algorithm

**Limitation 2: Universal Recovery Curve**
- Same 5-day formula for all muscles
- Not muscle-specific (quads vs biceps might differ)
- Future: Research-backed muscle-specific rates

**Limitation 3: Approximate Fatigue**
- Rough approximation, not scientifically validated
- Still useful for relative comparisons
- Future: Validated physiological model

**Why V1 Is Still Valuable:**
- Provides immediate visual feedback
- Shows relative differences between muscles
- Guides training decisions (even with approximations)
- Collects data for future algorithm improvements

---

## Future Enhancements (Out of Scope)

1. **3D Body Model** - Interactive 3D muscle visualization (estimated 2-4 weeks additional)
2. **Custom Color Thresholds** - User-adjustable fatigue color ranges
3. **Historical Fatigue Trends** - Charts showing fatigue over time
4. **Manual Fatigue Adjustment** - Override automatic calculations
5. **Smart Workout Suggestions** - "Based on your heat map, we recommend..."
6. **Export Heat Map** - Share/save heat map as image

---

*This design builds on existing infrastructure to deliver immediate visual value while laying groundwork for future intelligent features. The focus is on clarity, usability, and actionable information.*
