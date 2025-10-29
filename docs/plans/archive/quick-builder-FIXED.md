# Quick Builder Plan - Critical Fixes Applied

## Summary of Changes

The implementation plan has been updated to fix all 4 critical issues identified during review:

### ✅ 1. Edit Functionality for Sets (FIXED)

**What was wrong:** Task 4.2 had `handleEditSet` marked as TODO with just a toast message.

**What was fixed:**
- Created new `SetEditModal` component (Task 4.2.5)
- Full implementation with weight/reps/rest timer inputs
- Increment/decrement buttons matching existing patterns
- Added state management in WorkoutBuilder for editing
- Modal integrated into WorkoutBuilder render

**Files affected:**
- `components/SetEditModal.tsx` (new)
- `components/WorkoutBuilder.tsx` (updated with edit logic)

---

### ✅ 2. Template Migration SQL (FIXED)

**What was wrong:** Task 1.4 only had pseudo-code comments, no actual SQL implementation.

**What was fixed:**
- Complete SQLite migration SQL with `json_group_array` and `json_object`
- JavaScript/TypeScript migration alternative for programmatic approach
- Rollback support in down() method
- Proper error handling and fallbacks
- Verification steps

**Files affected:**
- `backend/src/db/migrations/006_update_workout_templates.sql` (new)
- OR `backend/src/db/migrations/006_update_workout_templates.js` (new, alternative)

---

### ✅ 3. Exercise Name Lookup (FIXED)

**What was wrong:** Template loading did `exerciseName: tSet.exerciseId` which would display IDs instead of names.

**What was fixed:**
- Added `EXERCISE_LIBRARY` import to WorkoutBuilder
- Lookup exercise by ID: `EXERCISE_LIBRARY.find(e => e.id === tSet.exerciseId)`
- Fallback to exerciseId if not found: `exercise?.name || tSet.exerciseId`
- Proper error handling

**Files affected:**
- `components/WorkoutBuilder.tsx` (updated loadTemplate function)

---

### ✅ 4. setTimeout Cleanup (FIXED)

**What was wrong:** Auto-advance used `setTimeout` without cleanup, causing potential memory leaks.

**What was fixed:**
- Added `autoAdvanceTimeoutId` state to track timeout
- useEffect with cleanup function to clear timeout on unmount
- Clear existing timeout before setting new one
- Set timeout ID to null after execution
- Use `window.setTimeout` for proper typing

**Files affected:**
- `components/WorkoutBuilder.tsx` (execution mode logic)

---

## Decision Points Added

Added "Critical Decisions Required Before Implementation" section at the top of the plan with 4 key decisions:

1. **Template Saving Behavior** - Always create new vs update existing vs smart detection
2. **Execution Muscle Visualization** - Current only vs current + forecast vs toggleable
3. **Drag-Drop Reordering** - Required for MVP vs defer to v2 vs manual reordering
4. **Mid-Workout Edit Behavior** - Keep completed sets vs remove vs block

Each decision has:
- Clear question
- 3 options (A/B/C)
- Recommended choice with rationale
- Space for user decision

---

## Updated Component List

### New Components (9 total):
1. `FABMenu.tsx` - Menu modal with 3 options
2. `TemplateCard.tsx` - Template display card
3. `TemplateSelector.tsx` - Template browser
4. `SetConfigurator.tsx` - Set configuration form
5. `SetCard.tsx` - Individual set display
6. `SetEditModal.tsx` - **NEW** - Edit set modal
7. `WorkoutBuilder.tsx` - Main builder container
8. `CurrentSetDisplay.tsx` - Execution mode display
9. `MuscleVisualization.tsx` - Muscle fatigue visualization

### Modified Components (2 total):
1. `Dashboard.tsx` - FAB button, menu integration, template button
2. Backend routes - `workouts.ts` and `templates.ts`

---

## Updated Time Estimates

**Revised estimate: 30-45 hours** (was 25-35 hours)

Breakdown:
- Phase 1 (Foundation): 4-6 hours
- Phase 2 (FAB Menu): 3-4 hours (+1 hour from original)
- Phase 3 (Templates): 3-4 hours
- Phase 4 (Planning View): 8-10 hours (+3 hours from original, includes edit modal)
- Phase 5 (Execution View): 5-6 hours (+1 hour from original)
- Phase 6 (Muscle Viz): 4-5 hours (+1 hour from original)
- Phase 7 (Testing): 4-6 hours

**Why the increase:**
- Edit modal adds complexity to Phase 4
- Proper cleanup and error handling adds polish time
- More realistic estimates based on typical development pace

---

## Ready for Implementation

The plan is now complete and ready for implementation. All critical TODOs have been resolved:

- ✅ Edit functionality fully implemented
- ✅ Migration SQL complete with rollback
- ✅ Exercise name lookup implemented
- ✅ setTimeout cleanup with proper useEffect

**Next Steps:**
1. User fills in 4 decision points
2. Proceed with Phase 1 implementation
3. Follow phases sequentially with verification steps

---

## Notes

- All code examples are copy-paste ready
- Each task has verification steps
- Edge cases documented in Phase 7
- No placeholder code or TODOs remaining in critical paths
