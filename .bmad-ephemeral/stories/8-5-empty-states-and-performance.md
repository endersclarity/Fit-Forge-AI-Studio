# Story 8-5: Empty States and Performance Optimization

## Epic Context
Epic 8: Polish & Accessibility

## Story Description
Add empty states for all views, implement skeleton loading screens, and optimize performance (React.memo, code splitting, bundle <1MB).

## Acceptance Criteria
- [ ] AC1: Empty states for Dashboard, Workout, Templates, Analytics
- [ ] AC2: Each empty state has illustration + CTA
- [ ] AC3: Skeleton screens replace spinners
- [ ] AC4: React.memo for expensive components (MuscleVisualization)
- [ ] AC5: Code splitting for Analytics, modals
- [ ] AC6: Bundle size <1MB (Lighthouse verified)
- [ ] AC7: Lighthouse 90+ all categories (Performance, Accessibility, Best Practices, SEO)

## Technical Approach
- Create `components/ui/EmptyState.tsx`
- Create `components/ui/Skeleton.tsx`
- Apply React.memo to expensive re-renders
- Use React.lazy for Analytics

## Dependencies
**Depends On:** 8-1, 8-2, 8-3, 8-4 (all polish complete)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Empty states added to all views
- [ ] Skeleton screens implemented
- [ ] Performance optimized
- [ ] Bundle <1MB
- [ ] Lighthouse 90+ all categories
- [ ] Merged to main branch
