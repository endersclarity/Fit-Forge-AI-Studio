# Horizontal Inline Set Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor set logging UI from vertical dropdowns to horizontal inline tap-to-edit pattern inspired by FitBod

**Architecture:** Replace multi-line dropdown inputs with single-line horizontal layout where numbers are tappable and bring up native-style number input. Maintain all existing functionality (weight, reps, rest timer) but present it in a more compact, scannable format.

**Tech Stack:** React/TypeScript, Tailwind CSS, existing WorkoutBuilder state management

**Reference:** FitBod flow screenshots in `flows/workout/routine-options/starting-workout/logging-a-set/`

---

## Task 1: Create HorizontalSetInput Component

**Files:**
- Create: `components/HorizontalSetInput.tsx`

**Step 1: Create the component file**

Create a new component for the horizontal inline set input:

```typescript
import React, { useState } from 'react';

interface HorizontalSetInputProps {
  setNumber: number;
  exerciseName: string;
  weight: number;
  reps: number;
  restTimerSeconds: number;
  isLogged: boolean;
  isActive: boolean;
  restTimeRemaining?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onLog: () => void;
}

const HorizontalSetInput: React.FC<HorizontalSetInputProps> = ({
  setNumber,
  exerciseName,
  weight,
  reps,
  restTimerSeconds,
  isLogged,
  isActive,
  restTimeRemaining,
  onWeightChange,
  onRepsChange,
  onLog,
}) => {
  const [editingField, setEditingField] = useState<'weight' | 'reps' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleFieldClick = (field: 'weight' | 'reps') => {
    if (isLogged) return; // Can't edit logged sets
    setEditingField(field);
    setTempValue(String(field === 'weight' ? weight : reps));
  };

  const handleSave = () => {
    const numValue = parseInt(tempValue) || 0;
    if (editingField === 'weight') {
      onWeightChange(numValue);
    } else if (editingField === 'reps') {
      onRepsChange(numValue);
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  return (
    <div className={`py-3 ${isActive ? 'bg-brand-dark' : ''}`}>
      {/* Main horizontal layout */}
      <div className="flex items-center gap-3">
        {/* Set number indicator */}
        <div className={`w-8 h-8 flex items-center justify-center rounded-md ${
          isLogged
            ? 'bg-green-600 text-white'
            : 'bg-brand-muted text-slate-400 border border-slate-600'
        }`}>
          {isLogged ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="font-bold">{setNumber}</span>
          )}
        </div>

        {/* Reps */}
        <button
          onClick={() => handleFieldClick('reps')}
          disabled={isLogged}
          className={`text-2xl font-bold ${
            isLogged ? 'text-slate-500' : 'text-white hover:text-brand-cyan'
          } transition-colors`}
        >
          {reps}
        </button>
        <span className="text-sm text-slate-400 uppercase">reps</span>

        <span className="text-slate-600">/</span>

        {/* Weight */}
        <button
          onClick={() => handleFieldClick('weight')}
          disabled={isLogged}
          className={`text-2xl font-bold ${
            isLogged ? 'text-slate-500' : 'text-white hover:text-brand-cyan'
          } transition-colors`}
        >
          {weight}
        </button>
        <span className="text-sm text-slate-400 uppercase">pounds</span>
      </div>

      {/* Rest timer (shown after logging) */}
      {isLogged && restTimeRemaining !== undefined && restTimeRemaining > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{Math.floor(restTimeRemaining / 60)}:{String(restTimeRemaining % 60).padStart(2, '0')} REST</span>
        </div>
      )}

      {/* Numeric input modal (bottom sheet style) */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-brand-muted w-full max-w-md rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Edit {editingField === 'weight' ? 'Weight' : 'Reps'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
              className="w-full bg-brand-dark text-white text-3xl font-bold text-center py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            />

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => setTempValue(prev => prev + String(num))}
                  className="bg-brand-dark text-white text-xl font-semibold py-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setTempValue(prev => prev.slice(0, -1))}
                className="bg-brand-dark text-white py-4 rounded-lg hover:bg-slate-700 transition-colors"
              >
                ←
              </button>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-brand-cyan text-brand-dark font-bold py-4 rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalSetInput;
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add components/HorizontalSetInput.tsx
git commit -m "feat: create HorizontalSetInput component with inline editing

Adds new component for horizontal set logging UI pattern:
- Single-line layout: [Set#] [Reps] REPS / [Weight] POUNDS
- Tap-to-edit numbers with bottom sheet numeric input
- Visual states for logged/unlogged sets
- Inline rest timer display

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Update CurrentSetDisplay to Use Horizontal Layout

**Files:**
- Modify: `components/CurrentSetDisplay.tsx:42-84`

**Step 1: Import the new component**

Add import at top of file:

```typescript
import HorizontalSetInput from './HorizontalSetInput';
```

**Step 2: Replace the display section with horizontal layout**

Replace the entire return statement (lines 42-84) with:

```typescript
  const isResting = restTimerEndTime && timeRemaining > 0;

  return (
    <div className="bg-brand-muted p-6 rounded-lg">
      {/* Exercise header */}
      <div className="text-center mb-6">
        <div className="text-sm text-slate-400 mb-1">
          Set {setNumber} of {totalSets}
        </div>
        <h3 className="text-2xl font-bold mb-4">{set.exerciseName}</h3>
      </div>

      {/* Horizontal set input */}
      <div className="mb-6">
        <HorizontalSetInput
          setNumber={setNumber}
          exerciseName={set.exerciseName}
          weight={set.weight}
          reps={set.reps}
          restTimerSeconds={set.restTimerSeconds}
          isLogged={false}
          isActive={true}
          onWeightChange={() => {}} // Read-only in execution mode
          onRepsChange={() => {}} // Read-only in execution mode
          onLog={onComplete}
        />
      </div>

      {/* Rest timer or action buttons */}
      {isResting ? (
        <div className="text-center">
          <div className="text-4xl font-bold text-brand-cyan mb-2">{timeRemaining}s</div>
          <div className="text-sm text-slate-400 mb-4">Rest time remaining</div>
          <div className="w-full bg-brand-dark rounded-full h-2 mb-4">
            <div
              className="bg-brand-cyan h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${((set.restTimerSeconds - timeRemaining) / set.restTimerSeconds) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onComplete}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg hover:bg-cyan-400 transition-colors text-lg"
          >
            LOG SET
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-brand-muted text-slate-400 font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Skip Set
          </button>
        </div>
      )}
    </div>
  );
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: No compilation errors

**Step 4: Commit**

```bash
git add components/CurrentSetDisplay.tsx
git commit -m "refactor: use horizontal layout in CurrentSetDisplay

Replaced vertical weight/reps display with HorizontalSetInput component
for cleaner, more compact set logging interface.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Add Editable Horizontal Set List to Planning Mode

**Files:**
- Modify: `components/WorkoutBuilder.tsx` (find where sets are displayed in planning mode)

**Step 1: Import HorizontalSetInput**

Add to imports at top of file:

```typescript
import HorizontalSetInput from './HorizontalSetInput';
```

**Step 2: Add state for editing set values**

Find the state declarations in WorkoutBuilder (around line 34-50) and add:

```typescript
const [editingSetValues, setEditingSetValues] = useState<{[setId: string]: {weight: number; reps: number}}>({});
```

**Step 3: Add handlers for set editing**

Add these functions after the existing set handlers (around line 375):

```typescript
const handleSetWeightChange = (setId: string, weight: number) => {
  setWorkout(prev => ({
    ...prev,
    sets: prev.sets.map(s => s.id === setId ? { ...s, weight } : s),
  }));
};

const handleSetRepsChange = (setId: string, reps: number) => {
  setWorkout(prev => ({
    ...prev,
    sets: prev.sets.map(s => s.id === setId ? { ...s, reps } : s),
  }));
};
```

**Step 4: Update ExerciseGroup to use HorizontalSetInput**

Modify the ExerciseGroup component call to pass the horizontal input component. Find where ExerciseGroup maps over sets and replace the SetCard with HorizontalSetInput:

In `components/ExerciseGroup.tsx:76-85`, replace:

```typescript
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
```

With:

```typescript
{sets.map((set, idx) => (
  <div key={set.id} className="bg-brand-muted p-3 rounded-lg">
    <HorizontalSetInput
      setNumber={startingSetNumber + idx}
      exerciseName={set.exerciseName}
      weight={set.weight}
      reps={set.reps}
      restTimerSeconds={set.restTimerSeconds}
      isLogged={false}
      isActive={false}
      onWeightChange={(weight) => onWeightChange && onWeightChange(set.id, weight)}
      onRepsChange={(reps) => onRepsChange && onRepsChange(set.id, reps)}
      onLog={() => {}}
    />
    <div className="flex items-center justify-end gap-2 mt-2">
      <button
        onClick={() => onEdit(set)}
        className="text-xs text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1"
      >
        Edit
      </button>
      <button
        onClick={() => onDuplicate(set)}
        className="text-xs text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1"
      >
        Dup
      </button>
      <button
        onClick={() => onDelete(set.id)}
        className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1"
      >
        Del
      </button>
    </div>
  </div>
))}
```

**Step 5: Update ExerciseGroup interface**

Modify `components/ExerciseGroup.tsx:27-34` interface to include the new handlers:

```typescript
interface ExerciseGroupProps {
  exerciseName: string;
  sets: BuilderSet[];
  startingSetNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
  onWeightChange?: (setId: string, weight: number) => void;
  onRepsChange?: (setId: string, reps: number) => void;
}
```

**Step 6: Update WorkoutBuilder to pass handlers to ExerciseGroup**

Find where ExerciseGroup is rendered in WorkoutBuilder (around line 886-896) and add the new props:

```typescript
{groupSetsByExercise(workout.sets).map((group) => (
  <ExerciseGroup
    key={group.exerciseId}
    exerciseName={group.exerciseName}
    sets={group.sets}
    startingSetNumber={group.startingSetNumber}
    onEdit={handleEditSet}
    onDelete={handleDeleteSet}
    onDuplicate={handleDuplicateSet}
    onWeightChange={handleSetWeightChange}
    onRepsChange={handleSetRepsChange}
  />
))}
```

**Step 7: Build and verify**

Run: `npm run build`
Expected: No compilation errors

**Step 8: Commit**

```bash
git add components/WorkoutBuilder.tsx components/ExerciseGroup.tsx
git commit -m "feat: add inline editing to planned sets with horizontal layout

Added ability to tap weight/reps values directly in the set list
to edit them inline with numeric input modal. Maintains Edit/Dup/Del
buttons for additional actions.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Remove SetCard Component (Cleanup)

**Files:**
- Delete: `components/SetCard.tsx` (if no longer used)

**Step 1: Verify SetCard is not used elsewhere**

Run: `grep -r "SetCard" components/ --include="*.tsx" --include="*.ts"`
Expected: Only should appear in import statements we already replaced

**Step 2: Remove the file if unused**

```bash
git rm components/SetCard.tsx
git commit -m "refactor: remove SetCard component

Replaced with HorizontalSetInput component for more compact UI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If SetCard is still used elsewhere, skip this task and leave it for later cleanup.

---

## Task 5: Test in Browser

**Files:**
- Manual testing only

**Step 1: Start Docker containers**

Run: `docker-compose up -d`
Expected: Frontend on port 3000, backend on port 3001

**Step 2: Test planning mode**

Manual test:
1. Navigate to http://localhost:3000
2. Click "Plan Workout"
3. Add 3 sets of "Dumbbell Bench Press"
4. Tap on the weight "0" on first set
5. Verify numeric input modal appears
6. Change weight to 50
7. Tap "Done"
8. Verify weight updates to 50
9. Tap on reps "8"
10. Change to 12
11. Verify reps update to 12

Expected:
- Single horizontal line per set: `[1] [12] REPS / [50] POUNDS`
- Tapping numbers brings up bottom sheet with numeric input
- Changes save and display correctly
- Edit/Dup/Del buttons still work

**Step 3: Test execution mode**

Manual test:
1. Click "Start Workout" on a planned workout
2. Verify current set shows horizontal layout
3. Verify "LOG SET" button is prominent
4. Click "LOG SET"
5. Verify rest timer appears below the logged set
6. Wait for timer to count down
7. Verify next set becomes active

Expected:
- Clean horizontal layout during workout
- Rest timer shows inline below logged sets
- "LOG SET" button is clear and prominent

**Step 4: Document any issues**

If issues found, create follow-up tasks in this plan or file bugs.

---

## Task 6: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md` (prepend entry)

**Step 1: Add changelog entry**

Prepend this to CHANGELOG.md:

```markdown
## [Unreleased] - 2025-11-08

### Changed
- **Horizontal Inline Set Logging** - Refactored set input UI to single-line horizontal layout
  - File: `components/HorizontalSetInput.tsx` (new)
  - File: `components/CurrentSetDisplay.tsx:42-84`
  - File: `components/ExerciseGroup.tsx:76-85`
  - Change: Replaced vertical dropdowns with horizontal tap-to-edit pattern
  - Change: Numbers are tappable and bring up native-style numeric input
  - Impact: More compact UI, faster to scan, easier to edit
  - UX Pattern: Inspired by FitBod iOS app
  - Reference: `flows/workout/routine-options/starting-workout/logging-a-set/`

```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add changelog entry for horizontal set logging

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Push to GitHub and Verify Production

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
2. Test planning mode set editing
3. Test execution mode set logging
4. Verify horizontal layout works on mobile viewport
5. Test numeric input keyboard on touch devices (if available)

Expected:
- All functionality works in production
- Horizontal layout is clean and readable
- Touch interactions work smoothly

---

## Summary

**Total Tasks:** 7
**Estimated Time:** 2-3 hours
**Risk Level:** Medium (UI refactor, behavior should stay the same)

**Testing Strategy:**
- Manual browser testing after each UI change
- Test both planning and execution modes
- Verify on desktop and mobile viewports
- Test in both local and production environments

**Key Changes:**
1. New `HorizontalSetInput` component with inline tap-to-edit
2. Updated `CurrentSetDisplay` to use horizontal layout
3. Updated `ExerciseGroup` to use horizontal layout with inline editing
4. Added weight/reps change handlers to WorkoutBuilder
5. Cleaner, more compact UI inspired by FitBod

**Rollback Plan:**
If issues arise, revert commits with:
```bash
git revert HEAD~7..HEAD
git push origin main
```

**Future Enhancements:**
- Add haptic feedback on tap (mobile)
- Add quick +/- buttons for weight adjustment
- Add plate calculator for barbell exercises
- Consider animated transitions for rest timer
