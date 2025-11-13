# Story 7-5: Progressive Disclosure Patterns

## Epic Context
Epic 7: Intelligence Shortcuts

## Story Description
Implement 80/20 progressive disclosure: show primary actions, hide advanced options with smooth expand/collapse.

## Acceptance Criteria
- [ ] AC1: Advanced options collapsed by default (to-failure, notes, rest time)
- [ ] AC2: "Show More" / "Show Less" toggle
- [ ] AC3: Smooth expand/collapse animation
- [ ] AC4: State persists to localStorage
- [ ] AC5: Never hide critical information

## Files to Modify
- `components/Workout.tsx` (collapsible sections)
- `components/Dashboard.tsx` (collapsible analytics)

## Dependencies
**Depends On:** 7-1, 7-2, 7-3 (shortcuts implemented first)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Advanced options collapsible
- [ ] Smooth animations
- [ ] State persists
- [ ] Reduced cognitive load verified
- [ ] Merged to main branch
