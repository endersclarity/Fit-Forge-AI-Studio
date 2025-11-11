# Group Sets by Exercise in WorkoutBuilder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the WorkoutBuilder to group sets by exercise, showing each exercise as a header with its sets nested within, instead of a flat list of individual set cards.

**Architecture:** Create a new `ExerciseGroup` component that takes all sets for a single exercise and renders them in a collapsible group. Modify `WorkoutBuilder` to group sets by `exerciseId` before rendering. Update set operations (duplicate, add) to maintain insertion at the correct position within the exercise group.

**Tech Stack:** React/TypeScript, Tailwind CSS

---

## Task 1: Create ExerciseGroup Component

**Files:**
- Create: `components/ExerciseGroup.tsx`

**Step 1: Create the ExerciseGroup component file**

Create a new component that displays an exercise header with nested sets:

```typescript
import React, { useState } from 'react';
import { BuilderSet } from '../types';
import SetCard from './SetCard';

interface ExerciseGroupProps {
  exerciseName: string;
  sets: BuilderSet[];
  startingSetNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
}

const ExerciseGroup: React.FC<ExerciseGroupProps> = ({
  exerciseName,
  sets,
  startingSetNumber,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-brand-dark rounded-lg overflow-hidden">
      {/* Exercise Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-brand-muted px-4 py-3 flex items-center justify-between hover:bg-brand-dark transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <h5 className="font-semibold text-white">{exerciseName}</h5>
        </div>
        <div className="text-sm text-slate-400">
          {sets.length} {sets.length === 1 ? 'set' : 'sets'}
        </div>
      </button>

      {/* Sets List */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {sets.map((set, idx) => (
            <SetCard
              key={set.id}
              set={set}
              setNumber={startingSetNumber + idx}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseGroup;
```

**Step 2: Verify file compiles**

Run: Check that TypeScript compiles without errors
Expected: No compilation errors

**Step 3: Commit**

```bash
git add components/ExerciseGroup.tsx
git commit -m "feat: create ExerciseGroup component for set grouping

Adds a new component that displays an exercise header with nested sets.
- Collapsible/expandable groups
- Shows set count in header
- Passes through edit/delete/duplicate handlers to SetCard

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Add Set Grouping Utility Function

**Files:**
- Modify: `components/WorkoutBuilder.tsx` (add utility function near top of file, after imports)

**Step 1: Add utility function to group sets by exercise**

Add this function after the interface definitions, before the WorkoutBuilder component:

```typescript
/**
 * Group sets by exercise, preserving order of first appearance
 */
function groupSetsByExercise(sets: BuilderSet[]): Array<{
  exerciseId: string;
  exerciseName: string;
  sets: BuilderSet[];
  startingSetNumber: number;
}> {
  const groups: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: BuilderSet[];
    startingSetNumber: number;
  }> = [];

  const exerciseMap = new Map<string, number>(); // exerciseId -> group index

  sets.forEach((set, globalIndex) => {
    if (!exerciseMap.has(set.exerciseId)) {
      // First time seeing this exercise - create new group
      exerciseMap.set(set.exerciseId, groups.length);
      groups.push({
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        sets: [set],
        startingSetNumber: globalIndex + 1,
      });
    } else {
      // Add to existing group
      const groupIndex = exerciseMap.get(set.exerciseId)!;
      groups[groupIndex].sets.push(set);
    }
  });

  return groups;
}
```

**Step 2: Verify file compiles**

Run: Check TypeScript compilation
Expected: No errors

**Step 3: Commit**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "feat: add groupSetsByExercise utility function

Adds a utility to group sets by exerciseId while preserving order.
Returns array of groups with exerciseName, sets, and starting set number.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Update WorkoutBuilder to Use ExerciseGroup

**Files:**
- Modify: `components/WorkoutBuilder.tsx:1-13` (add import)
- Modify: `components/WorkoutBuilder.tsx:843-857` (replace set rendering)

**Step 1: Add import for ExerciseGroup**

At the top of WorkoutBuilder.tsx, add to imports:

```typescript
import ExerciseGroup from './ExerciseGroup';
```

**Step 2: Replace flat set list with grouped rendering**

Find the section around line 843-857 that renders the set cards:

```typescript
{workout.sets.length > 0 ? (
  <>
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold mb-2">Planned Sets ({workout.sets.length})</h4>
      {workout.sets.map((set, idx) => (
        <SetCard
          key={set.id}
          set={set}
          setNumber={idx + 1}
          onEdit={handleEditSet}
          onDelete={handleDeleteSet}
          onDuplicate={handleDuplicateSet}
        />
      ))}
    </div>
```

Replace with:

```typescript
{workout.sets.length > 0 ? (
  <>
    <div className="mt-4 space-y-3">
      <h4 className="font-semibold mb-2">Planned Sets ({workout.sets.length})</h4>
      {groupSetsByExercise(workout.sets).map((group) => (
        <ExerciseGroup
          key={group.exerciseId}
          exerciseName={group.exerciseName}
          sets={group.sets}
          startingSetNumber={group.startingSetNumber}
          onEdit={handleEditSet}
          onDelete={handleDeleteSet}
          onDuplicate={handleDuplicateSet}
        />
      ))}
    </div>
```

**Step 3: Test in browser**

Manual test:
1. Run: `docker-compose up -d` (if not running)
2. Navigate to http://localhost:3000
3. Click "Plan Workout"
4. Add 3 sets of "Dumbbell Bench Press"
5. Add 2 sets of "Tricep Extension"
6. Verify exercises appear as separate groups with collapsible headers
7. Verify sets are numbered correctly (1, 2, 3 for first exercise, 4, 5 for second)

Expected:
- Two exercise groups visible
- "Dumbbell Bench Press" shows "3 sets"
- "Tricep Extension" shows "2 sets"
- Clicking header collapses/expands sets
- Set numbers run sequentially across all exercises

**Step 4: Commit**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "feat: use ExerciseGroup for grouped set display

Replaces flat set list with grouped display using ExerciseGroup component.
Sets are now grouped by exercise with collapsible headers.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Fix Duplicate Behavior to Add Within Group

**Files:**
- Modify: `components/WorkoutBuilder.tsx:263-273` (update handleDuplicateSet)

**Step 1: Update handleDuplicateSet to insert after current set**

Currently `handleDuplicateSet` adds to the end of the list. Change it to insert right after the duplicated set:

Replace:

```typescript
const handleDuplicateSet = (set: BuilderSet) => {
  const newSet: BuilderSet = {
    ...set,
    id: `${Date.now()}-${Math.random()}`,
  };
  setWorkout(prev => ({
    ...prev,
    sets: [...prev.sets, newSet],
  }));
  onToast('Set duplicated', 'info');
};
```

With:

```typescript
const handleDuplicateSet = (set: BuilderSet) => {
  const newSet: BuilderSet = {
    ...set,
    id: `${Date.now()}-${Math.random()}`,
  };
  setWorkout(prev => {
    // Find the index of the set being duplicated
    const currentIndex = prev.sets.findIndex(s => s.id === set.id);
    if (currentIndex === -1) {
      // If not found, add to end
      return { ...prev, sets: [...prev.sets, newSet] };
    }
    // Insert right after the current set
    const newSets = [...prev.sets];
    newSets.splice(currentIndex + 1, 0, newSet);
    return { ...prev, sets: newSets };
  });
  onToast('Set duplicated', 'info');
};
```

**Step 2: Test duplicate behavior**

Manual test:
1. Navigate to http://localhost:3000
2. Click "Plan Workout"
3. Add 2 sets of "Dumbbell Bench Press"
4. Add 1 set of "Tricep Extension"
5. Click "Dup" on the first Dumbbell Bench Press set
6. Verify new set appears as Set 2 within the Dumbbell Bench Press group
7. Verify Tricep Extension is now Set 4 (not Set 3)

Expected:
- Duplicated set appears immediately after the original
- Set numbers update correctly
- New set stays within the same exercise group

**Step 3: Commit**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "fix: duplicate sets insert within exercise group

Changed handleDuplicateSet to insert duplicated set right after
the original instead of appending to the end. This keeps duplicates
within the same exercise group.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Verify Add Another Set Still Works Correctly

**Files:**
- Review: `components/WorkoutBuilder.tsx:301-328` (handleAddSetFromModal)

**Step 1: Review existing handleAddSetFromModal implementation**

The existing implementation already inserts after the current set (line 322-324):

```typescript
const newSets = [...prev.sets];
newSets.splice(currentIndex + 1, 0, newSet);
return { ...prev, sets: newSets };
```

This is correct - it will keep the new set within the exercise group.

**Step 2: Test "Add Another Set" from SetEditModal**

Manual test:
1. Navigate to http://localhost:3000
2. Click "Plan Workout"
3. Add 2 sets of "Dumbbell Bench Press"
4. Add 1 set of "Tricep Extension"
5. Click "Edit" on the second Dumbbell Bench Press
6. Click "Add Another Set" in the modal
7. Verify new set appears as Set 3 within Dumbbell Bench Press group
8. Verify Tricep Extension is now Set 4

Expected:
- New set added within same exercise group
- Set numbering updates correctly

**Step 3: Document verification**

No code changes needed - existing logic already correct.

Add comment to document the behavior:

```typescript
const handleAddSetFromModal = (newSetValues: { weight: number; reps: number; restTimerSeconds: number }) => {
  if (!editingSet) return;

  // Create a new set with the same exercise but new values
  const newSet: BuilderSet = {
    id: `${Date.now()}-${Math.random()}`,
    exerciseId: editingSet.exerciseId,
    exerciseName: editingSet.exerciseName,
    weight: newSetValues.weight,
    reps: newSetValues.reps,
    restTimerSeconds: newSetValues.restTimerSeconds,
  };

  // Find the index of the current set and insert the new set right after it
  // This ensures the new set stays within the same exercise group
  setWorkout(prev => {
    const currentIndex = prev.sets.findIndex(s => s.id === editingSet.id);
    if (currentIndex === -1) {
      // If not found, add to end
      return { ...prev, sets: [...prev.sets, newSet] };
    }
    // Insert after the current set
    const newSets = [...prev.sets];
    newSets.splice(currentIndex + 1, 0, newSet);
    return { ...prev, sets: newSets };
  });

  onToast('Set added', 'success');
};
```

**Step 4: Commit**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "docs: add comment explaining set insertion behavior

Added comment to handleAddSetFromModal explaining that inserting
after the current set keeps new sets within the same exercise group.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md` (prepend entry)

**Step 1: Add changelog entry**

Prepend this to CHANGELOG.md:

```markdown
## [Unreleased] - 2025-11-07

### Changed
- **WorkoutBuilder Set Grouping** - Sets now grouped by exercise instead of flat list
  - File: `components/ExerciseGroup.tsx` (new)
  - File: `components/WorkoutBuilder.tsx:843-857`
  - Change: Created ExerciseGroup component with collapsible headers
  - Change: Added groupSetsByExercise utility function
  - Change: Duplicate and "Add Another Set" now insert within same exercise group
  - Impact: Cleaner UI, easier to see sets per exercise, better organization
  - UX: Each exercise shows as expandable group with set count

```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add changelog entry for exercise grouping feature

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Push to GitHub and Verify Deployment

**Files:**
- N/A

**Step 1: Push all commits**

```bash
git push origin main
```

Expected: All commits pushed successfully

**Step 2: Wait for Railway deployment**

Wait 2-3 minutes for automatic deployment

**Step 3: Test in production**

Manual test on Railway:
1. Navigate to https://fit-forge-ai-studio-production-6b5b.up.railway.app/
2. Click "Plan Workout"
3. Add 3 sets of different weights for "Dumbbell Bench Press"
4. Add 2 sets for "Tricep Extension"
5. Verify both exercises appear as separate collapsible groups
6. Click group headers to collapse/expand
7. Test "Dup" button - verify duplicates appear within group
8. Edit a set and use "Add Another Set" - verify it stays in group
9. Verify set numbers are sequential across all exercises

Expected:
- Clean grouped UI
- Collapsible exercise headers showing set count
- Duplicate/add operations keep sets in correct group
- Set numbering correct

---

## Summary

**Total Tasks:** 7
**Estimated Time:** 45-60 minutes
**Risk Level:** Low (UI refactor, existing logic mostly unchanged)

**Testing Strategy:**
- Manual browser testing after each major change
- Test grouping, collapsing, duplicate, and add operations
- Verify in both local and production environments

**Key Changes:**
1. New `ExerciseGroup` component for grouped display
2. `groupSetsByExercise` utility for organizing sets
3. Updated duplicate behavior to insert within group
4. All existing set operations still work correctly

**Rollback Plan:**
If issues arise, revert commits with:
```bash
git revert HEAD~7..HEAD
git push origin main
```
