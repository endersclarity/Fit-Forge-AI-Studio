# Implementation Tasks: Fix Critical UI Bugs and Missing Features

**Change ID:** `fix-critical-ui-bugs`
**Total Estimated Time:** 7-11 hours (revised after investigation)

**Breakdown:**
- Critical bugs (Tasks 1-3): 30 minutes - 2 hours (Task 2 is trivial!)
- Medium priority (Tasks 4-6): 4-7 hours (Task 5 increased complexity)
- Testing & docs (Task 7-8): 2 hours 15 minutes

---

## Task 1: Fix Analytics Back Button (15 min)

**File:** `components/Analytics.tsx`

### Steps:
1. [ ] Import `useNavigate` from react-router-dom
2. [ ] Import `ArrowLeft` icon from lucide-react
3. [ ] Replace header section with back button structure
4. [ ] Copy exact styling from Profile.tsx or PersonalBests.tsx
5. [ ] Test navigation to Dashboard

**Acceptance Criteria:**
- Back button appears in Analytics header
- Clicking back button navigates to `/`
- Styling matches other pages with back buttons

---

## Task 2: Fix "Add to Workout" from Muscle Deep Dive (5 minutes)

**File:** `components/Dashboard.tsx`

**CRITICAL DISCOVERY:** All infrastructure already exists! This is a trivial 1-line fix.

### Steps:
1. [ ] Locate `handleAddToWorkout` function (line 515-519)
2. [ ] Add call to existing `onStartPlannedWorkout` prop
3. [ ] Test with no active workout
4. [ ] Test - user navigates to /workout and exercise appears

**Implementation:**

**Current (broken):**
```typescript
const handleAddToWorkout = (planned: PlannedExercise) => {
  // TODO: Integration with WorkoutPlannerModal
  console.log('Add to workout:', planned);
  setDeepDiveModalOpen(false);
};
```

**Fixed (add 3 lines):**
```typescript
const handleAddToWorkout = (planned: PlannedExercise) => {
  if (onStartPlannedWorkout) {
    onStartPlannedWorkout([planned]);  // ← Use existing prop!
  }
  setDeepDiveModalOpen(false);
};
```

**Why This Works:**
- `onStartPlannedWorkout` prop already exists on Dashboard (line 28)
- App.tsx already has `handleStartPlannedWorkout` that handles the navigation (lines 191-195)
- WorkoutTracker already handles `plannedExercises` prop and converts to workout format (lines 261-272)
- **NO new code needed** - just wire up existing infrastructure!

**Acceptance Criteria:**
- Clicking "Add to Workout" in Muscle Deep Dive modal navigates to /workout
- Exercise appears in workout with correct sets/reps/weight from configuration
- Modal closes after clicking button

---

## Task 3: Fix Template Category/Variation (1-2 hours)

**File:** `components/WorkoutBuilder.tsx`

### Steps:
1. [ ] Add state for category and variation selection
2. [ ] Create UI for user to select category (Push/Pull/Legs/Core)
3. [ ] Create UI for user to select variation (A/B/Both)
4. [ ] Show selection UI before saving template
5. [ ] Replace hardcoded values with user selections
6. [ ] Test template saves with correct metadata
7. [ ] Verify saved templates display correct labels

**Implementation Details:**

**Add state:**
```typescript
const [templateCategory, setTemplateCategory] = useState<ExerciseCategory>('Push');
const [templateVariation, setTemplateVariation] = useState<'A' | 'B' | 'Both'>('A');
const [showSaveDialog, setShowSaveDialog] = useState(false);
```

**Save dialog component:**
```typescript
{showSaveDialog && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Save Template</h3>

      <label className="block mb-4">
        <span className="block text-sm mb-2">Workout Category</span>
        <select
          value={templateCategory}
          onChange={(e) => setTemplateCategory(e.target.value as ExerciseCategory)}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
          <option value="Core">Core</option>
        </select>
      </label>

      <label className="block mb-4">
        <span className="block text-sm mb-2">Variation</span>
        <select
          value={templateVariation}
          onChange={(e) => setTemplateVariation(e.target.value as 'A' | 'B' | 'Both')}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="Both">Both</option>
        </select>
      </label>

      <div className="flex gap-2">
        <button onClick={handleConfirmSave} className="...">Save Template</button>
        <button onClick={() => setShowSaveDialog(false)} className="...">Cancel</button>
      </div>
    </div>
  </div>
)}
```

**Update handleSaveAsTemplate:**
```typescript
const handleSaveAsTemplate = () => {
  setShowSaveDialog(true);
};

const handleConfirmSave = async () => {
  // Use templateCategory and templateVariation instead of hardcoded values
  const template = {
    name: templateName,
    category: templateCategory,  // User-selected
    variation: templateVariation, // User-selected
    exerciseIds: sets.map(s => s.exerciseId),
  };

  await api.createTemplate(template);
  setShowSaveDialog(false);
};
```

**Acceptance Criteria:**
- Clicking "Save Template" shows dialog to select category/variation
- User can select category from dropdown (Push/Pull/Legs/Core)
- User can select variation from dropdown (A/B/Both)
- Template saves with correct category and variation
- Saved templates display correct metadata in template list

---

## Task 4: Add Muscle Detail Level Toggle (1-2 hours)

**File:** `components/Dashboard.tsx`

### Steps:
1. [ ] Add state for muscle detail level toggle
2. [ ] Create toggle button component in muscle heat map section header
3. [ ] Implement toggle handler that updates localStorage
4. [ ] Update muscle rendering logic to respect detail level
5. [ ] Test toggling between simple (13 muscles) and detailed (42 muscles) view
6. [ ] Verify setting persists across page reloads

**Implementation Details:**

**Add state and handlers:**
```typescript
const [muscleDetailLevel, setMuscleDetailLevel] = useState<'simple' | 'detailed'>(
  () => (localStorage.getItem('muscleDetailLevel') as 'simple' | 'detailed') || 'simple'
);

const toggleMuscleDetail = () => {
  const newLevel = muscleDetailLevel === 'simple' ? 'detailed' : 'simple';
  setMuscleDetailLevel(newLevel);
  localStorage.setItem('muscleDetailLevel', newLevel);
};
```

**Add toggle button in header:**
```typescript
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold">Muscle Recovery</h2>
  <button
    onClick={toggleMuscleDetail}
    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
  >
    {muscleDetailLevel === 'simple'
      ? 'Show Detailed (42 muscles)'
      : 'Show Simple (13 muscles)'}
  </button>
</div>
```

**Acceptance Criteria:**
- Toggle button appears in muscle heat map section
- Clicking toggle switches between simple and detailed view
- Setting persists in localStorage across page reloads
- Muscle visualization updates correctly for each level

---

## Task 5: Implement Modal Auto-Save (3-5 hours)

**Files:** `components/WorkoutBuilder.tsx`, `components/WorkoutPlannerModal.tsx`

### Steps:
1. [ ] Add auto-save logic to WorkoutBuilder
2. [ ] Add auto-save logic to WorkoutPlanner
3. [ ] Implement restoration logic on modal open
4. [ ] Add "Resume planning?" toast notification
5. [ ] Clear saved data on successful save/submit
6. [ ] Test data persists across modal close/reopen

**Implementation Details:**

**CORRECTED Auto-save pattern (using refs to avoid interval recreation):**

```typescript
// 1. Create refs to track current state
const setsRef = useRef(sets);
const templateNameRef = useRef(templateName);

// 2. Update refs when state changes (no interval recreation)
useEffect(() => {
  setsRef.current = sets;
  templateNameRef.current = templateName;
}, [sets, templateName]);

// 3. Auto-save every 5 seconds (interval created ONCE)
useEffect(() => {
  const interval = setInterval(() => {
    if (setsRef.current.length > 0) {
      localStorage.setItem('workoutBuilder_draft', JSON.stringify({
        sets: setsRef.current,
        templateName: templateNameRef.current,
        timestamp: Date.now()
      }));
    }
  }, 5000);

  return () => clearInterval(interval);
}, []); // Empty deps array - interval only created once!
```

**Restore on mount with USER CHOICE (not automatic):**
```typescript
const [showRestoreDialog, setShowRestoreDialog] = useState(false);
const [pendingDraft, setPendingDraft] = useState(null);

useEffect(() => {
  const draft = localStorage.getItem('workoutBuilder_draft');
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);

      if (parsed.timestamp > dayAgo) {
        // Show dialog, don't auto-restore
        setShowRestoreDialog(true);
        setPendingDraft(parsed);
      } else {
        // Clear old draft
        localStorage.removeItem('workoutBuilder_draft');
      }
    } catch (e) {
      console.error('Failed to restore draft:', e);
    }
  }
}, []);

// User choice handlers
const handleRestoreDraft = () => {
  if (pendingDraft) {
    setSets(pendingDraft.sets);
    setTemplateName(pendingDraft.templateName);
  }
  setShowRestoreDialog(false);
};

const handleStartFresh = () => {
  localStorage.removeItem('workoutBuilder_draft');
  setPendingDraft(null);
  setShowRestoreDialog(false);
};
```

**Restore confirmation dialog:**
```typescript
{showRestoreDialog && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-brand-surface p-6 rounded-lg max-w-md">
      <h3 className="text-xl font-bold mb-2">Resume Planning?</h3>
      <p className="text-sm text-slate-300 mb-4">
        You have unsaved work from earlier. Would you like to resume or start fresh?
      </p>
      <div className="flex gap-2">
        <button onClick={handleRestoreDraft} className="flex-1 bg-brand-accent text-brand-dark py-2 rounded-lg font-semibold">
          Resume
        </button>
        <button onClick={handleStartFresh} className="flex-1 bg-brand-muted py-2 rounded-lg font-semibold">
          Start Fresh
        </button>
      </div>
    </div>
  </div>
)}
```

**Clear on successful save:**
```typescript
const handleSaveTemplate = async () => {
  // ... save logic ...
  localStorage.removeItem('workoutBuilder_draft');
};
```

**WorkoutBuilder State to Save:**
- ✅ Save: `workout.sets`, `mode`, `planningMode` (core planning data)
- ❌ Don't save: `recommendations`, `restTimerEndTime`, `completedSets`, `executionMuscleStates` (derived/runtime)

**Apply same pattern to WorkoutPlannerModal** with key `workoutPlanner_draft` - save only `plannedExercises` and `workoutVariation`.

**Acceptance Criteria:**
- WorkoutBuilder auto-saves every 5 seconds when data exists
- WorkoutPlanner auto-saves every 5 seconds when data exists
- When draft exists (< 24 hours old), user sees confirmation dialog
- User can choose "Resume" or "Start Fresh"
- Choosing "Resume" restores draft data
- Choosing "Start Fresh" clears draft from localStorage
- Drafts are cleared after successful save/submit
- Old drafts (> 24 hours) are automatically deleted on modal open
- Auto-save doesn't cause UI lag or performance issues

---

## Task 6: Remove BottomNav Component (15 min)

**Files:** `components/layout/BottomNav.tsx`, `components/layout/index.ts`

### Steps:
1. [ ] Verify BottomNav is not imported anywhere in the codebase
2. [ ] Delete `components/layout/BottomNav.tsx`
3. [ ] Remove export from `components/layout/index.ts`
4. [ ] Run `npm run build` to verify no broken imports
5. [ ] Commit deletion

**Verification command:**
```bash
# Check for any imports
grep -r "BottomNav" --include="*.tsx" --include="*.ts" . --exclude-dir=node_modules

# Should only return the file itself and index.ts export
```

**Acceptance Criteria:**
- BottomNav.tsx file deleted
- Export removed from layout/index.ts
- No broken imports in codebase
- Build completes successfully

---

## Task 7: Testing & Verification (2 hours)

### Manual Testing:

**Critical Bugs:**
1. [ ] Test Analytics back button navigates to Dashboard
2. [ ] Test "Add to Workout" with no active workout
3. [ ] Test "Add to Workout" with existing active workout
4. [ ] Test template save dialog appears
5. [ ] Test template saves with Push/A
6. [ ] Test template saves with Pull/B
7. [ ] Test template saves with Legs/Both

**Medium Priority:**
8. [ ] Test muscle detail toggle appears on Dashboard
9. [ ] Test toggling between simple (13) and detailed (42) muscle view
10. [ ] Test muscle detail setting persists across page reload
11. [ ] Test WorkoutBuilder auto-saves planning data
12. [ ] Test WorkoutBuilder restores draft on reopen
13. [ ] Test WorkoutPlanner auto-saves planning data
14. [ ] Test WorkoutPlanner restores draft on reopen
15. [ ] Verify BottomNav file is deleted
16. [ ] Verify no broken imports after BottomNav deletion

### Regression Testing:
- [ ] Dashboard still loads correctly
- [ ] Muscle Deep Dive modal still opens and displays correctly
- [ ] Workout Planner still works
- [ ] Template Selector still works
- [ ] Existing templates still load correctly
- [ ] All other navigation still works (Profile, Bests, Baselines)
- [ ] **NEW:** WorkoutTracker normal flow (start workout WITHOUT preloaded exercises)
- [ ] **NEW:** Performance - no UI lag with auto-save running
- [ ] **NEW:** Multi-tab scenario - open same modal in 2 tabs, verify no localStorage corruption

---

## Task 8: Update Documentation (15 min)

### Files to update:
1. [ ] `UI-ELEMENTS.md` - Mark bugs #1-6 as ✅ fixed
2. [ ] `CHANGELOG.md` - Add entry for bug fixes
3. [ ] `COMPREHENSIVE_BUG_AUDIT.md` - Update with fixes

**CHANGELOG entry:**
```markdown
### 2025-10-29 - Critical UI Bugs Fixed + UX Improvements

**Critical Bug Fixes:**
- Fixed "Add to Workout" button in Muscle Deep Dive modal (Dashboard.tsx:516)
- Added back button to Analytics page header
- Fixed template category/variation hardcoding - now asks user during save

**UX Improvements:**
- Added muscle detail level toggle (simple 13 vs detailed 42 muscles)
- Implemented auto-save for workout planning modals (prevents data loss)
- Removed unused BottomNav component (code cleanup)

**Impact:**
- Users can now add exercises from Muscle Deep Dive to their workouts
- Analytics page navigation no longer requires browser back button
- Templates save with correct category/variation metadata
- Users can switch between muscle detail levels
- Planning data automatically saved every 5 seconds
- Cleaner codebase with less dead code

**Related:** OpenSpec proposal `fix-critical-ui-bugs`
```

---

## Deployment Checklist

- [ ] All tasks completed
- [ ] Manual testing passed
- [ ] Regression testing passed
- [ ] Documentation updated
- [ ] Changes committed with clear message
- [ ] Tested in Docker container
- [ ] Ready for user testing

---

## Time Tracking

| Task | Original Estimate | Revised Estimate | Actual |
|------|-------------------|------------------|--------|
| Task 1: Analytics Back Button | 15 min | 15 min | ___ |
| Task 2: Add to Workout | 1-2 hours | **5 min** ⚡ | ___ |
| Task 3: Template Category/Variation | 1-2 hours | 1-2 hours | ___ |
| Task 4: Muscle Detail Toggle | 1-2 hours | 1-2 hours | ___ |
| Task 5: Modal Auto-Save | 2-3 hours | **3-5 hours** ⚠️ | ___ |
| Task 6: Remove BottomNav | 15 min | 15 min | ___ |
| Task 7: Testing | 1 hour | **2 hours** | ___ |
| Task 8: Documentation | 15 min | 15 min | ___ |
| **Total** | **8-10 hours** | **7-11 hours** | ___ |

---

## Notes

- All fixes are isolated - no dependencies between tasks
- Can be implemented in any order
- **Recommended order:**
  1. Task 1 (Analytics back button) - Quickest win (15 min)
  2. Task 6 (Remove BottomNav) - Another quick win (15 min)
  3. Tasks 2-5 - Tackle in any order based on priority
  4. Task 7-8 - Testing and docs at the end
- Tasks 2, 3, 4, and 5 can be done in parallel if working with multiple devs
