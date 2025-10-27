# Design: To-Failure Tracking UI

**Change ID:** `implement-to-failure-tracking-ui`
**Status:** Partially Implemented
**Created:** 2025-10-26

---

## Overview

This document details the UI/UX design for the "to failure" tracking feature in the Workout screen. The feature allows users to mark which sets were taken to muscular failure, providing critical data for the baseline learning algorithm.

---

## Architecture

### Component Hierarchy

```
WorkoutTracker (components/Workout.tsx)
├── ExerciseSelector (modal for adding exercises)
├── RestTimer (bottom sheet)
├── WorkoutSummaryModal (summary screen)
└── Exercise Rows (collapsible)
    └── Set Rows
        ├── Failure Checkbox (NEW)
        ├── Set Number
        ├── Weight Input
        ├── Reps Input
        └── Actions (Timer, Remove)
```

### State Management

**Component State:**
```typescript
// In WorkoutTracker component
const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([...]);

// LoggedExercise structure
interface LoggedExercise {
  id: string;
  exerciseId: string;
  sets: LoggedSet[];
}

// LoggedSet structure (types.ts)
interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  bodyweightAtTime?: number;
  to_failure?: boolean; // ✅ Already exists
}
```

**Smart Default Logic:**
- When a new exercise is added: Last set defaults to `to_failure: true`, others `false`
- When a new set is added: Previous last set becomes `to_failure: false`, new last set becomes `to_failure: true`
- User can manually toggle any set on/off

---

## UI Components

### 1. Failure Checkbox (Primary Component)

**Location:** First column in set row (left of set number)

**Visual Design:**
```
[ ✓ ]  Set 1   150 lbs   12 reps   [🕐] [✕]
```

**States:**
- **Checked (to_failure: true)**:
  - Background: `bg-brand-cyan` (#00D9FF)
  - Border: `border-brand-cyan`
  - Checkmark: White ✓ on cyan background
  - Title: "Taken to failure"

- **Unchecked (to_failure: false)**:
  - Background: Transparent
  - Border: `border-slate-400` (gray)
  - Title: "Not to failure"

**Interaction:**
- Click/tap toggles state
- Minimum touch target: 44x44px (Apple HIG standard)
- Visual feedback on press (scale slightly)

**Implementation Status:** ✅ **DONE** (lines 696-708 in Workout.tsx)

---

### 2. Tooltip/Educational Overlay (MISSING)

**Trigger:** Info icon (ⓘ) next to "Set" column header

**Content:**
```
┌─────────────────────────────────────┐
│ What is "To Failure"?               │
│                                     │
│ Mark a set if you couldn't do one  │
│ more rep with good form.            │
│                                     │
│ Why it matters:                     │
│ Helps FitForge learn your true     │
│ muscle capacity for personalized   │
│ recommendations.                    │
│                                     │
│ Default: Last set = failure        │
│         [Got it]                    │
└─────────────────────────────────────┘
```

**Style:**
- Modal/popover overlay
- Semi-transparent backdrop
- Centered on screen (mobile) or anchored to info icon (desktop)
- Dismissible by clicking backdrop or "Got it" button

**Implementation Status:** ❌ **MISSING**

---

### 3. Visual Distinction (Optional Enhancement)

**Failure Set Styling:**
- Current: Same as other sets
- Proposed (Optional):
  - Slightly bolder text for failure sets
  - Subtle glow or border highlight
  - Small flame icon 🔥 next to checkmark (only when checked)

**Implementation Status:** 🔄 **Optional** (not required for MVP)

---

## Data Flow

### 1. Adding a New Exercise

```typescript
// In addExercise function (lines 386-399)
const newLoggedExercise: LoggedExercise = {
  id: `${exercise.id}-${Date.now()}`,
  exerciseId: exercise.id,
  sets: [
    { id: `set-1-${Date.now()}`, reps: 8, weight: 100 },        // ❌ Missing to_failure
    { id: `set-2-${Date.now()}`, reps: 8, weight: 100 },        // ❌ Missing to_failure
    { id: `set-3-${Date.now()}`, reps: 8, weight: 100 }         // ❌ Missing to_failure
  ],
};
```

**Issue:** Manually added exercises don't get `to_failure` defaults.

**Fix Needed:**
```typescript
sets: [
  { id: `set-1-${Date.now()}`, reps: 8, weight: 100, to_failure: false },
  { id: `set-2-${Date.now()}`, reps: 8, weight: 100, to_failure: false },
  { id: `set-3-${Date.now()}`, reps: 8, weight: 100, to_failure: true }  // ✅ Last set
],
```

### 2. Adding a New Set

```typescript
// In addSet function (lines 401-420)
// ✅ CORRECTLY IMPLEMENTED
const addSet = (exerciseId: string) => {
  setLoggedExercises(prev => prev.map(ex => {
    if (ex.id !== exerciseId) return ex;

    // Unmark previous last set
    const updatedSets = ex.sets.map((s, idx) =>
      idx === ex.sets.length - 1 ? { ...s, to_failure: false } : s
    );

    // Add new set marked as failure
    const newSet: LoggedSet = {
      id: `set-${Date.now()}`,
      reps: 8,
      weight: 100,
      to_failure: true  // ✅ Smart default
    };

    return { ...ex, sets: [...updatedSets, newSet] };
  }));
};
```

### 3. Toggling Failure Status

```typescript
// In toggleSetFailure function (lines 436-443)
// ✅ CORRECTLY IMPLEMENTED
const toggleSetFailure = (exerciseId: string, setId: string) => {
  setLoggedExercises(prev => prev.map(ex =>
    ex.id === exerciseId ? {
      ...ex,
      sets: ex.sets.map(s => s.id === setId ? { ...s, to_failure: !s.to_failure } : s)
    } : ex
  ));
};
```

### 4. Saving Workout (API Integration)

**Current Flow:**
```
handleOpenSummary() → setFinalWorkoutSession(session) → WorkoutSummaryModal → onFinishWorkout()
```

**Payload Structure:**
```typescript
interface WorkoutExerciseSet {
  weight: number;
  reps: number;
  to_failure?: boolean;  // ✅ Already in types.ts
}
```

**Backend Endpoint:** `POST /api/workouts`

**Implementation Status:** ✅ **DONE** (types already match backend expectations)

---

## Smart Defaults Algorithm

### Initial Exercise Load (from template/recommendation)

```typescript
// When initialData is provided (lines 213-222)
initialData.suggestedExercises.map(ex => ({
  id: `${ex.id}-${Date.now()}`,
  exerciseId: ex.id,
  sets: [
    { id: `set-1`, reps: 8, weight: X, to_failure: false },  // ✅ Already implemented
    { id: `set-2`, reps: 8, weight: X, to_failure: false },
    { id: `set-3`, reps: 8, weight: X, to_failure: true }    // ✅ Last set
  ]
}))
```

### Manual Exercise Addition

```typescript
// FIX NEEDED: addExercise function should match template pattern
sets: [
  { id: `set-1`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: false },
  { id: `set-2`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: false },
  { id: `set-3`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: true }
]
```

### Set Addition

✅ Already correctly implemented (see Data Flow section 2 above)

### Edge Cases

**Case 1: Single set exercise**
```typescript
sets: [
  { id: `set-1`, reps: 8, weight: 100, to_failure: true }  // ✅ Only set = failure
]
```

**Case 2: Removing the last set**
- When removing a set that is NOT the last set: No change
- When removing the last set: Second-to-last becomes the new last, but DON'T auto-mark as failure (user's choice)

**Case 3: Loading from historical data**
- If `to_failure` is undefined: Treat as `false` (conservative default)
- Render: `const toFailure = s.to_failure !== undefined ? s.to_failure : isLastSet;` (line 697)

---

## Mobile Responsiveness

### Touch Target Guidelines

**Minimum Size:** 44x44px (Apple HIG)
**Current Implementation:** 20x20px (too small)

**Fix Needed:**
```typescript
// Current (line 703)
<button className="w-5 h-5 ...">  // 20x20px

// Recommended
<button className="w-11 h-11 p-2 ...">  // 44x44px outer, 20x20px inner checkbox
  <div className="w-5 h-5 rounded border-2 ...">  // Visual checkbox
    {toFailure && <span>✓</span>}
  </div>
</button>
```

### Grid Layout Adjustments

**Current Grid:**
```typescript
grid-cols-[auto_1fr_4fr_2fr_3fr]
//         [✓]  [#] [Weight] [Reps] [Actions]
```

**Recommendation:** Increase first column width to accommodate larger touch target.

```typescript
grid-cols-[3rem_2rem_4fr_2fr_3fr]  // Fixed widths for checkbox and set number
```

---

## Accessibility

### Keyboard Navigation

- **Tab Order:** Checkbox → Weight → Reps → Timer → Remove → Next Set
- **Enter/Space:** Toggle checkbox (already supported by button element)

### Screen Reader Support

```typescript
<button
  aria-label={toFailure ? "Set taken to failure" : "Set not to failure"}
  aria-pressed={toFailure}
  role="switch"
  ...
>
```

**Implementation Status:** ❌ **MISSING** (no ARIA labels)

---

## Visual Design Specifications

### Color Palette

| Element | State | Color | Hex |
|---------|-------|-------|-----|
| Checkbox - Checked | Background | `brand-cyan` | #00D9FF |
| Checkbox - Unchecked | Border | `slate-400` | #94A3B8 |
| Checkmark | Icon | `brand-dark` | #0F172A |
| Info Icon | Normal | `slate-400` | #94A3B8 |
| Info Icon | Hover | `brand-cyan` | #00D9FF |

### Typography

- Set Number: `font-bold text-slate-300`
- Inputs: `text-center bg-brand-dark`
- Labels: `text-xs text-slate-400 font-semibold`

### Spacing

- Between columns: `gap-2` (0.5rem)
- Between rows: `mb-2` (0.5rem)
- Padding: `p-4` for exercise card

---

## Animation & Feedback

### Checkbox Toggle

```css
/* Current: transition-colors */
transition-colors duration-200 ease-in-out

/* Recommended: Add scale feedback */
active:scale-95
```

### Tooltip/Modal

```css
/* Fade in backdrop */
backdrop: opacity-0 → opacity-100 (200ms)

/* Slide up modal */
modal: translateY(20px) → translateY(0) (300ms ease-out)
```

---

## Testing Checklist

### Functional Tests

- [ ] Last set of new exercise defaults to `to_failure: true`
- [ ] Other sets default to `to_failure: false`
- [ ] Clicking checkbox toggles state correctly
- [ ] Adding a set: Old last set becomes `false`, new last set becomes `true`
- [ ] Removing a set: No auto-change to remaining sets
- [ ] Saving workout: `to_failure` flag sent to API correctly
- [ ] Loading workout: `to_failure` state restored correctly

### UI/UX Tests

- [ ] Checkbox visible on all screen sizes
- [ ] Touch target >= 44x44px on mobile
- [ ] Tooltip opens and closes correctly
- [ ] Info icon visible and clickable
- [ ] Visual distinction between checked/unchecked is clear
- [ ] No layout shift when toggling checkbox

### Edge Cases

- [ ] Single set exercise: Last set = failure
- [ ] Zero sets: No crash
- [ ] 10+ sets: All checkboxes render correctly
- [ ] Rapid toggling: No state corruption
- [ ] Offline: State persists during connection loss

### Accessibility Tests

- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces "To failure" / "Not to failure"
- [ ] ARIA labels present and correct
- [ ] Focus visible on checkbox

---

## Implementation Priority

### Phase 1: Critical Fixes (1-2 hours)
1. ✅ **DONE:** Toggle UI and smart defaults (already implemented)
2. ❌ **TODO:** Fix `addExercise` to include `to_failure` defaults
3. ❌ **TODO:** Increase touch target size to 44x44px
4. ✅ **DONE:** API integration (types already correct)

### Phase 2: User Education (1-2 hours)
5. ❌ **TODO:** Add info icon next to "Set" header
6. ❌ **TODO:** Implement tooltip/modal explaining "to failure"
7. ❌ **TODO:** Add ARIA labels for screen readers

### Phase 3: Polish (1 hour)
8. 🔄 **OPTIONAL:** Visual distinction for failure sets (flame icon, glow)
9. ❌ **TODO:** Add scale animation on checkbox press
10. ❌ **TODO:** Cross-browser and mobile testing

---

## Related Files

**Frontend:**
- `components/Workout.tsx` - Main component (lines 386-443, 696-708)
- `types.ts` - Type definitions (lines 38-44, 191-195)
- `api.ts` - API client (workouts endpoint)

**Backend:**
- `backend/database/schema.sql` - `to_failure` column
- `backend/database/migrations/001_add_to_failure_column.sql` - Migration
- `backend/routes/workouts.js` - Workout save endpoint

**Documentation:**
- `openspec/changes/2025-10-26-implement-to-failure-tracking-ui/proposal.md`
- `openspec/changes/2025-10-26-implement-to-failure-tracking-ui/tasks.md` (to be created)

---

## Open Questions

1. **Should we show a warning if user marks a set with < 70% of PB as failure?**
   - Proposal suggests this, but might be annoying
   - Alternative: Backend validation only

2. **Should we add a flame icon 🔥 next to checked sets?**
   - Pro: More visual distinction
   - Con: Adds clutter, may look unprofessional

3. **Should we persist tooltip dismissal?**
   - "Don't show again" checkbox in tooltip?
   - LocalStorage flag?

4. **Should we backfill historical workouts?**
   - Assume last set = failure for old workouts?
   - Or leave as undefined and ignore in baseline learning?

---

**Status:** Design complete, partial implementation exists, remaining work identified.
