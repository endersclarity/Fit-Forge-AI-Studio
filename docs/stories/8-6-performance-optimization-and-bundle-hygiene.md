# Story 8.6: Performance Optimization & Bundle Hygiene

## Status
Verified

## Story
**As a** FitForge maintainer,\
**I want** the redesigned UI to stay fast and lightweight,\
**so that** users experience <3s TTI / <1.5s FCP and we have headroom for future features.

## Acceptance Criteria
1. Profile the React app (Profiler + Chrome DevTools) to identify expensive re-renders (MuscleVisualization, ExerciseCard, analytics charts, modal stacks) and memoize/split components until redundant renders are removed `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 5: Empty States & Performance]`.  
2. Introduce `React.lazy` + `Suspense` for heavy screens (analytics, Storybook-only bundles, modal stacks) keeping initial bundle ≤1 MB compressed `[Source: docs/architecture-ui-redesign-2025-11-12.md#Risk 3: Performance Degradation from Animations]`.  
3. Remove unused dependencies/assets discovered after Epics 5-7 (legacy icons, CSS, experimental libs) and document reduction (bundle analyzer before/after).  
4. Run Lighthouse Performance on desktop + mid-tier mobile emulation achieving ≥90 with TTI <3s and FCP <1.5s.  
5. Capture metrics (bundle analyzer screenshot, Lighthouse HTML/JSON) in `docs/testing/performance/epic-8-report.md` along with summary of optimizations.

## Tasks / Subtasks
- [ ] **Task 1: Profiling & Memoization (AC #1)**  
  - [ ] Run React Profiler + Chrome Performance to locate rerender hotspots.  
  - [ ] Apply `React.memo`, `useMemo`, `useCallback`, or virtualization on `MuscleVisualization`, `ExerciseCard`, analytics charts, and modal content as needed.  
- [ ] **Task 2: Code Splitting (AC #2)**  
  - [ ] Add `React.lazy` boundaries for analytics route, Storybook-only UI bundles, and rarely used modals; ensure Suspense fallback uses new skeleton components `[Source: docs/stories/8-5-empty-states-and-skeleton-screens.md#Dev Notes]`.  
  - [ ] Verify lazy chunks respect theme/motion providers and feature flags.  
- [ ] **Task 3: Dependency/Bloat Cleanup (AC #3)**  
  - [ ] Remove unused packages/assets, update `package-lock.json`, run `npm prune`.  
  - [ ] Compress large images and delete duplicate SVGs where safe.  
- [ ] **Task 4: Performance Validation (AC #4, #5)**  
  - [ ] Execute Lighthouse (desktop/mobile) after optimizations; attach artifacts plus metric summary to `docs/testing/performance/epic-8-report.md`.  
  - [ ] Update README or release notes with performance results and any new scripts (`npm run analyze`).  

## Dev Notes
### Previous Story Insights
- Motion (8.1) adds feature flag + animation load; ensure performance work respects `VITE_ANIMATIONS_ENABLED` fallback `[Source: docs/stories/8-1-framer-motion-animation-system.md#Dev Notes]`.  
- Empty state/skeleton story (8.5) introduces shimmer components used as Suspense fallbacks; align code splitting with those patterns `[Source: docs/stories/8-5-empty-states-and-skeleton-screens.md#Dev Notes]`.

### Component Specifications
- Day 5 architecture instructions call for optimizing MuscleVisualization, ExerciseCard, analytics charts, and running Lighthouse to hit ≥90 with TTI <3s / FCP <1.5s `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 5: Empty States & Performance]`.  
- Risk section defines budget (<1 MB bundle, 60fps animations, ability to disable features via flags) `[Source: docs/architecture-ui-redesign-2025-11-12.md#Risk 3: Performance Degradation from Animations]`.

### File Locations
- Components reside under `components/dashboard/`, `components/workout/`, `components/analytics/`, `components/modals/` per architecture `[Source: docs/architecture.md#Project Structure]`.  
- Performance docs belong to `docs/testing/performance/` as referenced by architecture/testing guidance.

### Technical Constraints
- Keep Suspense fallbacks lightweight (skeletons) to avoid layout shift.  
- Ensure lazy-loaded chunks still honor dark mode + motion providers (wrap within provider tree or lazy-load children only).  
- Maintain test coverage for dynamic imports; update Vite config if analyzer plugin required.

### Testing Requirements
- Automated: `npm run analyze` (bundle visualizer) + `npm run build && npm run preview` with Lighthouse CLI.  
- Manual: React Profiler sessions verifying reduced renders, Chrome CPU throttling tests to confirm budgets.  
- Documentation: attach analyzer screenshot + Lighthouse HTML/JSON to `docs/testing/performance/epic-8-report.md` plus summary table.

### Project Structure Notes
- If `docs/testing/performance/` folder does not exist, create it per documentation standards `[Source: docs/architecture.md#Documentation]`.

## Testing
- Lighthouse (desktop + mobile) verifying ≥90 Performance, TTI <3s, FCP <1.5s.  
- React Profiler traces saved as evidence.  
- Bundle analyzer screenshot + summary (before vs after).  
- Optional Playwright smoke to ensure lazy-loaded routes mount correctly.

## Dev Agent Record
(To be completed during implementation.)

## QA Results
(To be completed during QA review.)

## Change Log
| Date       | Version | Description                             | Author |
|------------|---------|-----------------------------------------|--------|
| 2025-11-13 | v0.1    | Story drafted from Epic 8 requirements  | SM     |
