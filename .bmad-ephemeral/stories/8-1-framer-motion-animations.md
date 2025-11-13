# Story 8-1: Framer Motion Animations

## Epic Context
Epic 8: Polish & Accessibility

## Story Description
Add spring animations to bottom sheets, buttons, and page transitions with 60fps performance target.

## Acceptance Criteria
- [ ] AC1: Spring config (stiffness 300, damping 30, mass 0.8)
- [ ] AC2: Bottom sheet slide-up/down animations
- [ ] AC3: Button scale animations (whileTap: 0.95, whileHover: 1.05)
- [ ] AC4: Page transitions (slide from right, iOS standard)
- [ ] AC5: All animations run at 60fps (Chrome DevTools verified)
- [ ] AC6: Respects prefers-reduced-motion

## Files to Modify
- All bottom sheet components
- All button components
- `App.tsx` (page transitions)

## Dependencies
**Depends On:** 5-3 (primitives), 6-1 (bottom sheets)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Animations added to key components
- [ ] 60fps verified
- [ ] prefers-reduced-motion honored
- [ ] Performance budget met
- [ ] Merged to main branch
