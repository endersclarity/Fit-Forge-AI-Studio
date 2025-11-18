# Workout Templates Modernization - Design Document

**Date:** 2025-01-17
**Feature:** Modernize Saved Workouts (Templates) UX
**Approach:** Full Page with Clean Break from localStorage

---

## Problem Statement

The current "Saved Workouts" experience has several issues:
1. **Inconsistent styling** - Old modal doesn't match modern Tailwind dark mode patterns
2. **Dual save systems** - localStorage (`useSavedWorkouts`) vs backend database (`templatesAPI`)
3. **Confusing flow** - Modal → Builder modal → unclear next steps
4. **Navigation inconsistency** - Other Dashboard buttons navigate to pages, this opens modal

## Solution: Full Page with Backend-Only Architecture

### Design Decision: Option A - Clean Break
- Delete localStorage system entirely
- Use ONLY backend database as single source of truth
- Full page approach at `/workout/templates` (consistent with other nav buttons)
- Match WorkoutHistoryPage styling patterns

**Trade-off accepted:** Lose localStorage "Push Day Test" workout (user confirmed easy to recreate)

---

## Architecture

### Data Flow

```
Dashboard "📋 Saved Workouts" button
  ↓ navigate('/workout/templates')

WorkoutTemplatesPage
  ↓ Fetches templatesAPI.getAll()
  ↓ Displays cards with search/filter

User Actions:
  1. Edit → navigate('/workout/builder', { state: { template } })
  2. Begin Workout → Convert template → navigate('/workout/active', { state: { exercises } })
  3. Delete → templatesAPI.delete(id) → Refresh list

WorkoutBuilder "Save Template" button
  ↓ templatesAPI.create({ name, category, variation, exerciseIds })
```

### Data Structure

**WorkoutTemplate (backend):**
```typescript
{
  id: string;
  name: string;
  category: ExerciseCategory; // 'Push' | 'Pull' | 'Legs' | 'Core'
  variation: 'A' | 'B';
  exerciseIds: string[];      // IDs only
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}
```

**PlannedExercise (ActiveWorkout needs):**
```typescript
{
  exercise: Exercise;  // Full object from EXERCISE_LIBRARY
  sets: number;
  reps: number;
  weight: number;
}
```

**Conversion function:**
```typescript
const convertTemplateToPlan = (template: WorkoutTemplate): PlannedExercise[] => {
  return template.exerciseIds.map(id => {
    const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
    if (!exercise) throw new Error(`Exercise ${id} not found`);

    return {
      exercise,
      sets: 3,      // Default
      reps: 10,     // Default
      weight: 0,    // User adjusts in ActiveWorkout
    };
  });
};
```

---

## File Changes

### Files to Create
- `components/WorkoutTemplatesPage.tsx` - New full page component

### Files to Modify
- `components/Dashboard.tsx` - Update button click handler to navigate
- `components/workout-builder/WorkoutBuilderPage.tsx` - Replace localStorage save with backend API
- `App.tsx` - Add `/workout/templates` route

### Files to Delete
- `hooks/useSavedWorkouts.ts` - localStorage hook (no longer needed)
- `components/TemplateSelector.tsx` - Old modal (replaced by full page)
- `components/TemplateCard.tsx` - Old card component (replaced by new inline design)
- Dashboard localStorage section (lines 878-919 in Dashboard.tsx)

---

## Component Design: WorkoutTemplatesPage

### Pattern: WorkoutHistoryPage Clone

**State:**
```typescript
const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState<string>('all');
const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
```

**Features:**
- Search by exercise name (lookup exerciseIds in EXERCISE_LIBRARY)
- Category filter dropdown: All/Push/Pull/Legs/Core
- Cards/Grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
- Inline expansion to view full exercise list
- Action buttons per template:
  - **Edit** (primary blue) → Load into builder
  - **Begin Workout** (accent orange) → Go directly to active
  - **Delete** (red) → Remove from database

**Styling:**
- Match WorkoutHistoryPage patterns exactly
- `bg-slate-50 dark:bg-brand-dark` page background
- `bg-white dark:bg-brand-surface` cards
- `border-slate-200 dark:border-brand-muted` borders
- `text-slate-900 dark:text-slate-100` headings

---

## WorkoutBuilder Integration

### Current Implementation (localStorage):
```typescript
const { saveWorkout } = useSavedWorkouts();

handleSaveTemplate = () => {
  saveWorkout({
    name: workoutName,
    exercises: selectedExercises,  // PlannedExercise[]
  });
};
```

### New Implementation (backend):
```typescript
handleSaveTemplate = async () => {
  // Determine category from first exercise
  const category = selectedExercises[0].exercise.category;

  await templatesAPI.create({
    name: workoutName,
    category,
    variation: 'A',  // Default or let user choose
    exerciseIds: selectedExercises.map(e => e.exercise.id),
    isFavorite: false,
  });

  // Show success message
  setSaveMessage('Template saved!');
};
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| No templates exist | Show empty state: "No templates yet. Create one from Workout Builder!" |
| Template fetch fails | Display error message with retry button |
| Exercise ID not in library | Skip silently (defensive programming) |
| Delete confirmation | Use `window.confirm()` like WorkoutHistoryPage |
| API errors | Display error message, allow retry |

---

## Testing Plan

### Manual Testing Checklist
1. **WorkoutTemplatesPage:**
   - [ ] Page loads at `/workout/templates`
   - [ ] Templates fetch from backend
   - [ ] Search filters by exercise name
   - [ ] Category filter works
   - [ ] Card expansion shows full exercise list
   - [ ] "Edit" navigates to builder with template loaded
   - [ ] "Begin Workout" navigates to active workout
   - [ ] "Delete" removes template after confirmation

2. **WorkoutBuilder:**
   - [ ] "Save Template" creates backend template
   - [ ] Success message displays
   - [ ] Template appears in templates page

3. **Dashboard:**
   - [ ] "📋 Saved Workouts" button navigates to `/workout/templates`
   - [ ] localStorage section removed (no longer renders)

4. **Integration:**
   - [ ] Edit template → Builder pre-populates correctly
   - [ ] Begin Workout → Active page receives PlannedExercise[]
   - [ ] Docker restart not needed (existing directories)

---

## Success Criteria

- ✅ Single source of truth (backend database only)
- ✅ Modern Tailwind dark mode styling
- ✅ Consistent navigation (full page like other buttons)
- ✅ Search + filter functionality
- ✅ Inline expansion for exercise details
- ✅ Edit, Begin, Delete actions all working
- ✅ WorkoutBuilder saves to backend
- ✅ No localStorage code remaining

---

## Implementation Notes

### Data Format Caveat
**WorkoutTemplate.exerciseIds** are just strings - we need to look up the full Exercise objects from EXERCISE_LIBRARY when:
- Displaying exercise names in the templates page
- Converting to PlannedExercise[] for ActiveWorkout
- Pre-populating WorkoutBuilder for editing

### Category/Variation Determination
When saving from WorkoutBuilder, we need to determine:
- **Category:** Use first exercise's category (all exercises in a template should be same category anyway)
- **Variation:** Default to 'A' for now (could add UI later to let user choose A/B)

### Docker HMR
No new directories created, so Docker restart should NOT be needed. Just `docker-compose restart frontend` if route doesn't load.
