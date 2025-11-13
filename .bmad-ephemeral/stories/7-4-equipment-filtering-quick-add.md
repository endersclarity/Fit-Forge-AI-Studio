# Story 7-4: Equipment Filtering in Quick Add

## Epic Context
Epic 7: Intelligence Shortcuts

## Story Description
Filter exercise picker by user's available equipment with "Show All" toggle and active filter badge.

## Acceptance Criteria
- [ ] AC1: ExercisePicker filters by userProfile.equipment
- [ ] AC2: Bodyweight exercises always shown
- [ ] AC3: "Show All" toggle to bypass filter
- [ ] AC4: Badge shows active filter count
- [ ] AC5: Prevents selection of unusable exercises

## Files to Modify
- `components/ExercisePicker.tsx` (add filtering logic)
- `components/QuickAdd.tsx` (pass equipment prop)

## Dependencies
**Depends On:** 6-1, 6-2 (bottom sheet navigation)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Filtering works correctly
- [ ] "Show All" toggle functional
- [ ] Badge displays filter count
- [ ] Prevents frustration (tested)
- [ ] Merged to main branch
