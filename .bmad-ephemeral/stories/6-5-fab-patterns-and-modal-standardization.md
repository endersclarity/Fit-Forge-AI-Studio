# Story 6-5: FAB Patterns and Modal Standardization

## Epic Context
Epic 6: Core Interaction Redesign

## Story Description
Create FAB component (64x64px, bottom-right) and standardize modal dismiss methods (swipe/tap/X/ESC).

## Acceptance Criteria
- [ ] AC1: FAB component (64x64px, primary color, bottom-right position)
- [ ] AC2: Shadow: 0 4px 16px rgba(117,138,198,0.4)
- [ ] AC3: Entrance animation (spring physics)
- [ ] AC4: All modals support 4 dismiss methods
- [ ] AC5: Focus trap and keyboard navigation verified

## Files to Create
- `src/design-system/components/patterns/FAB.tsx`

## Dependencies
**Depends On:** 5-3 (Button primitive), 6-1 (BottomSheet)

## Estimated Effort
**2 days**

## Definition of Done
- [ ] FAB component created
- [ ] All modals use standardized wrapper
- [ ] Accessibility verified
- [ ] Merged to main branch
