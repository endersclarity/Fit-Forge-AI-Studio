# Quick Builder + Execution Mode - READY FOR IMPLEMENTATION ✅

## Status: All Critical Issues Resolved & Decisions Made

This plan is **100% complete** and ready for implementation. All TODOs have been resolved and user decisions have been confirmed.

---

## User Decisions (All Confirmed)

### ✅ Decision 1: Template Saving
**Choice:** Always create new templates (Option A)
- No complexity around updating existing templates
- Simpler UX, less confusion
- Can add "Update Template" feature in v2 if needed

### ✅ Decision 2: Execution Visualization
**Choice:** Show current + forecast (Option B)
- Current fatigue (full opacity) shows real-time progress
- Forecasted end state (60% opacity) shows where you'll finish
- Better user feedback during workout

### ✅ Decision 3: Drag-Drop Reordering
**Choice:** Defer to v2 (Option B)
- Not required for MVP
- Saves 4-6 hours of implementation time
- Users can delete/re-add sets for now
- `orderIndex` field removed from types

### ✅ Decision 4: Mid-Workout Edit Behavior
**Choice:** Keep completed sets counted (Option A)
- If user removes a set they already completed, it stays in `completedSets`
- Preserved in workout history
- Not shown in remaining sets list
- Maintains data integrity

---

## Implementation Summary

### Total Time Estimate: 30-45 hours

**Phase Breakdown:**
1. Foundation (Data Models & API) - 4-6 hours
2. FAB Menu & Navigation - 3-4 hours
3. Template System - 3-4 hours
4. Planning View (with edit modal) - 8-10 hours
5. Execution View - 5-6 hours
6. Muscle Visualization (dual view) - 4-5 hours
7. Testing & Polish - 4-6 hours

---

## Components to Create (9 new)

1. **FABMenu.tsx** - Modal menu with 3 options
2. **TemplateCard.tsx** - Template display card with Load/Delete
3. **TemplateSelector.tsx** - Template browser modal
4. **SetConfigurator.tsx** - Form to configure exercise/weight/reps/rest
5. **SetCard.tsx** - Individual set display with edit/duplicate/delete
6. **SetEditModal.tsx** - Modal for editing set parameters
7. **WorkoutBuilder.tsx** - Main container (planning + execution modes)
8. **CurrentSetDisplay.tsx** - Execution mode current set display
9. **MuscleVisualization.tsx** - Muscle fatigue bar visualization

---

## Components to Modify (2 existing)

1. **Dashboard.tsx**
   - Update FAB button to open menu
   - Add "My Templates" button
   - Integrate WorkoutBuilder and TemplateSelector

2. **Backend Routes**
   - Add `POST /api/builder-workout` endpoint
   - Update template endpoints to use `sets` instead of `exerciseIds`

---

## Database Changes

### Migration Required: `006_update_workout_templates.sql`

**Changes:**
- Add `sets` column (TEXT, JSON array)
- Migrate existing `exercise_ids` → `sets` with defaults
- Drop `exercise_ids` column (after verification)

**Default Values for Migration:**
- weight: 0
- reps: 10
- restTimerSeconds: 90

---

## Key Technical Decisions

### State Management
- Use `useState` for WorkoutBuilder (manageable complexity)
- Mode state machine: `'planning' | 'executing'`
- Separate `executionMuscleStates` from planning states

### Auto-Advance Implementation
- `setTimeout` with proper cleanup via `useEffect`
- Store timeout ID in state for cancellation
- Clear on unmount, mode switch, or new set

### Muscle Fatigue Calculation
- Real-time updates during execution
- Forecasted view uses same calculation function
- Visual distinction via opacity (current: 1.0, forecast: 0.6)

### Template Loading
- Lookup exercise names from `EXERCISE_LIBRARY`
- Fallback to `exerciseId` if exercise not found
- Maintains display integrity

---

## Implementation Order (Must Follow Sequentially)

### Phase 1: Foundation
- Update TypeScript types
- Add `builderAPI` to api.ts
- Create backend `POST /api/builder-workout` endpoint
- Run database migration
- Update template API endpoints

**Why First:** Need data layer before building UI

---

### Phase 2: FAB Menu
- Create `FABMenu` component
- Update Dashboard FAB button
- Add navigation state management

**Why Second:** Establishes navigation structure

---

### Phase 3: Templates
- Create `TemplateCard` component
- Create `TemplateSelector` component
- Add "My Templates" button to Dashboard
- Wire up template loading (loads into WorkoutBuilder)

**Why Third:** Can test template system end-to-end once builder exists

---

### Phase 4: Planning View
- Create `SetConfigurator` component
- Create `SetCard` component
- Create `SetEditModal` component
- Create `WorkoutBuilder` component (planning mode)
- Wire up to Dashboard

**Why Fourth:** Core functionality, enables testing of full flow

---

### Phase 5: Execution View
- Create `CurrentSetDisplay` component
- Add execution mode to `WorkoutBuilder`
- Implement auto-advance with cleanup
- Add mid-workout editing

**Why Fifth:** Builds on planning view foundation

---

### Phase 6: Muscle Visualization
- Extract/create `MuscleVisualization` component
- Add to planning view (forecasted)
- Add to execution view (current + forecast)
- Implement opacity prop

**Why Sixth:** Visual polish after core functionality works

---

### Phase 7: Testing & Polish
- End-to-end testing
- Edge case testing
- Performance testing
- UI polish (animations, loading states, accessibility)

**Why Last:** Verify everything works together

---

## Verification Checklist

After implementation, verify these scenarios:

### ✅ Basic Flow
- [ ] FAB button opens menu
- [ ] "Build Workout" opens WorkoutBuilder
- [ ] Can add sets with exercise/weight/reps/rest
- [ ] Can edit sets via edit button
- [ ] Can duplicate sets (creates copy below)
- [ ] Can delete sets
- [ ] Muscle visualization shows forecasted fatigue
- [ ] "Start Workout" enters execution mode

### ✅ Execution Mode
- [ ] Shows current set only
- [ ] Rest timer counts down
- [ ] Auto-advances to next set
- [ ] Can skip sets
- [ ] Muscle viz shows current + forecast
- [ ] "Edit Plan" switches to planning mode
- [ ] "Finish Workout" saves to backend

### ✅ Templates
- [ ] Can save workout as template
- [ ] Template appears in "My Templates"
- [ ] Can load template into builder
- [ ] Exercise names display correctly
- [ ] Can delete templates

### ✅ Edge Cases
- [ ] Empty workout shows error
- [ ] Mid-workout close confirms discard
- [ ] Skip all sets shows error on finish
- [ ] Network errors show toast
- [ ] Invalid exercise IDs handled gracefully

---

## Files to Reference During Implementation

### Main Implementation Plan
`docs/plans/quick-builder-execution-mode-plan.md` - Complete spec with all code examples

### Summary of Fixes
`docs/plans/quick-builder-FIXED.md` - What was fixed and why

### This Document
`docs/plans/READY_TO_IMPLEMENT.md` - Quick reference for starting implementation

---

## Next Steps

1. **Start with Phase 1** - Foundation (4-6 hours)
   - Begin with Task 1.1: Update TypeScript types
   - Follow tasks sequentially
   - Verify each task before moving on

2. **Track Progress** - Use verification steps after each task

3. **Report Issues** - If you encounter blockers, reference specific task numbers

4. **Stay Sequential** - Don't jump ahead, each phase builds on previous

---

## Support

If you need clarification on any task:
- Task numbers are in format: `Phase.Task` (e.g., Task 4.3)
- Each task has code examples you can copy-paste
- Each task has verification steps to confirm it works
- All critical TODOs have been resolved

**You're ready to build! 🚀**

Start with `Task 1.1: Update TypeScript Types` in the main plan document.
