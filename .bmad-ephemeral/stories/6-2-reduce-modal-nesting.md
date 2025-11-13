# Story 6-2: Reduce Modal Nesting

## Epic Context
Epic 6: Core Interaction Redesign

## Story Description
Refactor Dashboard → FABMenu → QuickAdd → ExercisePicker flow from 4 levels to 2 levels max using bottom sheets.

## Acceptance Criteria
- [ ] AC1: FABMenu converted to floating button menu (not modal)
- [ ] AC2: QuickAdd opens as bottom sheet (60% height)
- [ ] AC3: ExercisePicker replaces QuickAdd content (same level)
- [ ] AC4: Exercise detail opens as Level 2 full-screen
- [ ] AC5: Audit confirms no path allows 3+ nested modals

## Technical Approach
Convert FABMenu from modal to floating menu. Make QuickAdd use BottomSheet. ExercisePicker content swaps within same sheet level.

**Reference:** PRD Epic 6 Story 2, UX Audit Story 1.4, Architecture Section 5 (Epic 6 Week 2-3)

## Files to Modify
- `components/FABMenu.tsx` (convert to floating menu)
- `components/QuickAdd.tsx` (use BottomSheet)
- `components/ExercisePicker.tsx` (integrate into QuickAdd)
- `components/Dashboard.tsx` (update usage)

## Dependencies
**Depends On:** 6-1 (BottomSheet component)
**Blocks:** None

## Estimated Effort
**2 days**

## Definition of Done
- [ ] Max 2 modal depth enforced
- [ ] All dismiss methods work
- [ ] Flow tested end-to-end
- [ ] No regressions in existing workflows
- [ ] Merged to main branch
