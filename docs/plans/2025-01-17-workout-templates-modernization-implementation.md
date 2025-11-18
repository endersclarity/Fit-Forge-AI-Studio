# Workout Templates Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Saved Workouts (Templates) UX with a full page view and unify to backend-only architecture

**Architecture:** Delete localStorage system, create `/workout/templates` page matching WorkoutHistoryPage patterns, update WorkoutBuilder to save to backend via templatesAPI

**Tech Stack:** React, TypeScript, Tailwind CSS, React Router, templatesAPI (backend)

---

## Task 1: Delete localStorage System

**Files:**
- Delete: `hooks/useSavedWorkouts.ts`
- Modify: `components/Dashboard.tsx` (remove lines 878-919 - localStorage section)
- Verify: `components/workout-builder/WorkoutBuilderPage.tsx` (check usage)

**Step 1: Delete useSavedWorkouts hook**

```bash
rm hooks/useSavedWorkouts.ts
```

**Step 2: Remove Dashboard localStorage section**

In `components/Dashboard.tsx`, delete lines 878-919 (the "Saved Workouts" section that checks `savedWorkouts.length > 0`).

Find this block:
```typescript
{/* Saved Workouts Section */}
{savedWorkouts.length > 0 && (
  <div className="bg-white dark:bg-brand-surface...">
    ...
  </div>
)}
```

Delete the entire block.

**Step 3: Remove useSavedWorkouts import from Dashboard**

In `components/Dashboard.tsx`, find and remove:
```typescript
const { savedWorkouts } = useSavedWorkouts();
```

And remove the import at the top:
```typescript
import { useSavedWorkouts } from '../hooks/useSavedWorkouts';
```

**Step 4: Verify no other files import useSavedWorkouts**

Run: `grep -r "useSavedWorkouts" --include="*.tsx" --include="*.ts"`

Expected: Only `components/workout-builder/WorkoutBuilderPage.tsx` (we'll fix in Task 3)

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove localStorage saved workouts system

- Delete hooks/useSavedWorkouts.ts
- Remove Dashboard localStorage section (lines 878-919)
- Clean up imports

Part of templates modernization - moving to backend-only"
```

---

## Task 2: Create WorkoutTemplatesPage Component

**Files:**
- Create: `components/WorkoutTemplatesPage.tsx`
- Reference: `components/WorkoutHistoryPage.tsx` (pattern to follow)

**Step 1: Create WorkoutTemplatesPage skeleton**

Create `components/WorkoutTemplatesPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesAPI } from '../api';
import { WorkoutTemplate, PlannedExercise, Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../constants';

const WorkoutTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // UI state
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add filtering, handlers, render

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Saved Workouts
        </h1>
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
      </div>
    </div>
  );
};

export default WorkoutTemplatesPage;
```

**Step 2: Add filter logic**

Add after `fetchTemplates`:

```typescript
// Get exercise names for a template
const getExerciseNames = (template: WorkoutTemplate): string[] => {
  return template.exerciseIds.map(id => {
    const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
    return exercise ? exercise.name : 'Unknown';
  });
};

// Filter templates
const filteredTemplates = templates.filter(template => {
  // Category filter
  if (categoryFilter !== 'all' && template.category !== categoryFilter) {
    return false;
  }

  // Search by exercise name
  if (searchTerm) {
    const exerciseNames = getExerciseNames(template);
    const hasMatch = exerciseNames.some(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!hasMatch) return false;
  }

  return true;
});
```

**Step 3: Add action handlers**

Add after filter logic:

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this template?')) return;

  setDeletingId(id);
  try {
    await templatesAPI.delete(id);
    setTemplates(templates.filter(t => t.id !== id));
    if (expandedTemplate === id) setExpandedTemplate(null);
  } catch (err) {
    alert('Failed to delete template: ' + (err instanceof Error ? err.message : 'Unknown error'));
  } finally {
    setDeletingId(null);
  }
};

const handleEdit = (template: WorkoutTemplate) => {
  navigate('/workout/builder', { state: { template } });
};

const handleBeginWorkout = (template: WorkoutTemplate) => {
  // Convert template to PlannedExercise[]
  const exercises: PlannedExercise[] = template.exerciseIds.map(id => {
    const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
    if (!exercise) throw new Error(`Exercise ${id} not found`);

    return {
      exercise,
      sets: 3,
      reps: 10,
      weight: 0,
    };
  });

  navigate('/workout/active', { state: { exercises } });
};
```

**Step 4: Add complete render (copying WorkoutHistoryPage pattern)**

Replace the TODO comment and return statement with the full render from WorkoutHistoryPage pattern (header, filters, cards grid).

Full code in file - match WorkoutHistoryPage exactly but adapted for templates.

**Step 5: Verify TypeScript compiles**

Run: `npm run typecheck` (or `tsc --noEmit`)
Expected: No errors

**Step 6: Commit**

```bash
git add components/WorkoutTemplatesPage.tsx
git commit -m "feat: create WorkoutTemplatesPage component

- Full page view matching WorkoutHistoryPage patterns
- Search by exercise name
- Category filter (All/Push/Pull/Legs/Core)
- Inline card expansion
- Edit, Begin Workout, Delete actions
- Template to PlannedExercise conversion"
```

---

## Task 3: Update WorkoutBuilder to Save to Backend

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Remove useSavedWorkouts import**

In `components/workout-builder/WorkoutBuilderPage.tsx`, remove:
```typescript
import { useSavedWorkouts } from '../../hooks/useSavedWorkouts';
```

And remove:
```typescript
const { saveWorkout } = useSavedWorkouts();
```

**Step 2: Add templatesAPI import**

Add to imports:
```typescript
import { templatesAPI } from '../../api';
```

**Step 3: Replace handleSaveTemplate implementation**

Find the `handleSaveTemplate` function and replace with:

```typescript
const handleSaveTemplate = async () => {
  if (!workoutName.trim()) {
    setSaveMessage('Please enter a workout name');
    setTimeout(() => setSaveMessage(''), 3000);
    return;
  }
  if (selectedExercises.length === 0) {
    setSaveMessage('Please add at least one exercise');
    setTimeout(() => setSaveMessage(''), 3000);
    return;
  }

  try {
    // Determine category from first exercise
    const category = selectedExercises[0].exercise.category;

    await templatesAPI.create({
      name: workoutName.trim(),
      category,
      variation: 'A', // Default
      exerciseIds: selectedExercises.map(e => e.exercise.id),
      isFavorite: false,
    });

    setSaveMessage('Template saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  } catch (err) {
    setSaveMessage('Failed to save template');
    setTimeout(() => setSaveMessage(''), 3000);
    console.error('Save template error:', err);
  }
};
```

**Step 4: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: update WorkoutBuilder to save to backend

- Replace useSavedWorkouts with templatesAPI.create()
- Extract exerciseIds from selectedExercises
- Determine category from first exercise
- Set variation to 'A' as default"
```

---

## Task 4: Update Dashboard Button

**Files:**
- Modify: `components/Dashboard.tsx`

**Step 1: Update button click handler**

In `components/Dashboard.tsx`, find the "📋 Saved Workouts" button (around line 848):

```typescript
<Button
  onClick={() => setIsTemplateSelectorOpen(true)}
  variant="secondary"
  size="lg"
  className="w-full min-h-[60px] text-lg font-display font-bold"
  aria-label="Saved Workouts"
>
  📋 Saved Workouts
</Button>
```

Replace `onClick` with:
```typescript
onClick={() => navigate('/workout/templates')}
```

**Step 2: Remove TemplateSelector modal state**

Remove these lines:
```typescript
const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
const [loadedTemplate, setLoadedTemplate] = useState<WorkoutTemplate | null>(null);
```

**Step 3: Remove TemplateSelector component**

Find and remove (around line 1136):
```typescript
{/* Template Selector Modal */}
<TemplateSelector
  isOpen={isTemplateSelectorOpen}
  onClose={() => setIsTemplateSelectorOpen(false)}
  onLoad={(template) => {
    setLoadedTemplate(template);
    setIsTemplateSelectorOpen(false);
    setIsBuilderOpen(true);
  }}
  onToast={handleToast}
/>
```

**Step 4: Remove TemplateSelector import**

Remove from top of file:
```typescript
import TemplateSelector from './TemplateSelector';
```

**Step 5: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 6: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "feat: update Dashboard Saved Workouts button to navigate

- Change onClick from modal to navigate('/workout/templates')
- Remove TemplateSelector modal state and component
- Remove TemplateSelector import"
```

---

## Task 5: Add Route to App.tsx

**Files:**
- Modify: `App.tsx`

**Step 1: Add WorkoutTemplatesPage import**

Add after the WorkoutHistoryPage import:
```typescript
import WorkoutTemplatesPage from './components/WorkoutTemplatesPage';
```

**Step 2: Add route**

Find the workout routes section (around line 556) and add:
```typescript
<Route path="/workout/templates" element={wrapPage(<WorkoutTemplatesPage />)} />
```

Place it after the `/workout/history` route for consistency.

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add App.tsx
git commit -m "feat: add /workout/templates route

- Import WorkoutTemplatesPage
- Add route with wrapPage wrapper"
```

---

## Task 6: Delete Old Modal Components

**Files:**
- Delete: `components/TemplateSelector.tsx`
- Delete: `components/TemplateCard.tsx`

**Step 1: Delete TemplateSelector**

```bash
rm components/TemplateSelector.tsx
```

**Step 2: Delete TemplateCard**

```bash
rm components/TemplateCard.tsx
```

**Step 3: Verify no remaining imports**

Run: `grep -r "TemplateSelector\|TemplateCard" --include="*.tsx" --include="*.ts"`
Expected: No matches (we already removed from Dashboard)

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: delete old template modal components

- Remove TemplateSelector.tsx
- Remove TemplateCard.tsx
- Replaced by WorkoutTemplatesPage full page view"
```

---

## Task 7: Test Full User Flow

**Files:**
- N/A (manual testing with Chrome DevTools)

**Step 1: Start development server**

Run: `docker-compose restart frontend` (if needed)

Navigate to: `http://localhost:3000`

**Step 2: Test WorkoutTemplatesPage**

1. Navigate to Dashboard
2. Click "📋 Saved Workouts" button
3. Verify: Navigates to `/workout/templates`
4. Verify: Page loads with templates (if backend has data)
5. Test search: Enter exercise name in search box
6. Test filter: Select category from dropdown
7. Test expansion: Click a template card to expand
8. Verify: See full exercise list when expanded

**Step 3: Test Edit flow**

1. Click "Edit" button on a template
2. Verify: Navigates to `/workout/builder`
3. Verify: Builder is pre-populated with template data
4. (Note: Builder pre-population requires additional implementation - see Task 8)

**Step 4: Test Begin Workout flow**

1. Return to `/workout/templates`
2. Click "Begin Workout" on a template
3. Verify: Navigates to `/workout/active`
4. Verify: Active workout page shows exercises from template
5. Verify: Default sets=3, reps=10, weight=0

**Step 5: Test Delete flow**

1. Return to `/workout/templates`
2. Click "Delete" on a template
3. Verify: Confirmation dialog appears
4. Click OK
5. Verify: Template removed from list
6. Verify: Backend updated (refresh page, template still gone)

**Step 6: Test WorkoutBuilder save**

1. Navigate to `/workout/builder`
2. Add exercises
3. Enter template name
4. Click "Save Template"
5. Verify: Success message appears
6. Navigate to `/workout/templates`
7. Verify: New template appears in list

**Step 7: Document any bugs found**

Create issues for any bugs discovered during testing.

**Step 8: Commit test notes**

```bash
git add -A
git commit -m "test: verify workout templates full user flow

Tested:
- Navigation from Dashboard
- Search and filter functionality
- Card expansion
- Delete with confirmation
- Begin Workout navigation
- WorkoutBuilder save to backend

Known issue: Edit flow needs builder pre-population (Task 8)"
```

---

## Task 8: WorkoutBuilder Pre-population (Edit Flow)

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Add location hook to get navigation state**

Add to imports:
```typescript
import { useLocation } from 'react-router-dom';
```

Add inside component:
```typescript
const location = useLocation();
const templateFromNav = location.state?.template as WorkoutTemplate | undefined;
```

**Step 2: Add useEffect to populate from template**

Add after state declarations:
```typescript
useEffect(() => {
  if (templateFromNav) {
    // Pre-populate from template
    setWorkoutName(templateFromNav.name);

    const exercises: PlannedExercise[] = templateFromNav.exerciseIds.map(id => {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
      if (!exercise) throw new Error(`Exercise ${id} not found`);

      return {
        exercise,
        sets: 3,
        reps: 10,
        weight: 0,
      };
    });

    setSelectedExercises(exercises);
  }
}, [templateFromNav]);
```

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Test edit flow**

1. Navigate to `/workout/templates`
2. Click "Edit" on a template
3. Verify: Builder pre-populated with template name and exercises
4. Make changes
5. Save template
6. Verify: Changes saved

**Step 5: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: add template pre-population to WorkoutBuilder

- Use location.state.template from navigation
- Convert exerciseIds to PlannedExercise[]
- Set workout name and exercises on mount
- Completes Edit flow from templates page"
```

---

## Task 9: Final Verification & Documentation

**Files:**
- Update: `docs/plans/2025-01-17-workout-templates-modernization.md`

**Step 1: Full regression test**

Test all flows end-to-end:
1. Dashboard → Templates page
2. Search/filter
3. Expansion
4. Edit (with pre-population)
5. Begin Workout
6. Delete
7. Builder save new template

**Step 2: Check for console errors**

Open Chrome DevTools console and test all flows.
Verify: No errors

**Step 3: Update design doc with lessons learned**

Add "Implementation Notes" section to design doc with any issues discovered or decisions made during implementation.

**Step 4: Commit design doc update**

```bash
git add docs/plans/2025-01-17-workout-templates-modernization.md
git commit -m "docs: update design doc with implementation notes"
```

**Step 5: Create Serena memory**

Document implementation patterns for future reference.

---

## Success Criteria

- [x] localStorage system completely removed
- [x] WorkoutTemplatesPage created with modern styling
- [x] Search and filter functionality working
- [x] Inline card expansion working
- [x] Edit flow navigates to builder with pre-population
- [x] Begin Workout converts to PlannedExercise[] correctly
- [x] Delete removes from backend database
- [x] WorkoutBuilder saves to backend via templatesAPI
- [x] Dashboard button navigates to full page
- [x] Old modal components deleted
- [x] No TypeScript errors
- [x] No console errors during testing
- [x] All routes working correctly

---

## Verification Commands

```bash
# TypeScript check
npm run typecheck

# Search for remaining localStorage references
grep -r "useSavedWorkouts" --include="*.tsx" --include="*.ts"
grep -r "TemplateSelector\|TemplateCard" --include="*.tsx" --include="*.ts"

# Verify deleted files
ls hooks/useSavedWorkouts.ts  # Should not exist
ls components/TemplateSelector.tsx  # Should not exist
ls components/TemplateCard.tsx  # Should not exist

# Verify new files
ls components/WorkoutTemplatesPage.tsx  # Should exist
```
