# Story 8.5: Empty States & Skeleton Screens

## Status
Draft

## Story
**As a** new or returning FitForge user,\
**I want** clear empty states and graceful skeleton loaders across the app,\
**so that** I know what to do next even when data is missing or still loading.

## Acceptance Criteria
1. Create reusable `EmptyState` component (illustration slot, title, body, CTA) and apply it to Dashboard, WorkoutTemplates, PersonalBests, and Analytics views `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 5: Empty States & Performance]`.  
2. Replace spinner loaders with skeleton components that mirror real layouts (cards, lists, analytics panels) using shimmer animations (~1.5s cycle).  
3. Ensure empty states + skeletons adapt to light/dark themes, glass surfaces, and typography tokens defined in prior stories.  
4. Provide contextual guidance + action button for each empty state (e.g., “Log Workout”, “Create Template”) aligned with UX copy.  
5. Document patterns in Storybook and `docs/design-system.md`, including accessibility notes (aria-hidden skeletons, focus handling).

## Tasks / Subtasks
- [ ] **Task 1: Component Foundations (AC #1, #2)**  
  - [ ] Build `components/common/EmptyState.tsx` with props for illustration, title, body, CTA handler `[Source: docs/architecture.md#Project Structure]`.  
  - [ ] Build `components/common/SkeletonBlock.tsx` supporting shape variants (card, list-row, chart) plus shimmer animation at 1.5s cycle.  
- [ ] **Task 2: Apply Empty States (AC #1, #4)**  
  - [ ] Dashboard: show illustration + “Log Workout” CTA when no workouts exist.  
  - [ ] WorkoutTemplates: offer “Create Template” CTA; PersonalBests: “Add PR”; Analytics: “Log workouts to unlock insights.”  
- [ ] **Task 3: Skeleton Sweep (AC #2, #3)**  
  - [ ] Replace spinner placeholders in Dashboard metrics, WorkoutBuilder tables, analytics charts, and recommendations panels with skeleton components.  
  - [ ] Wire skeleton theme variants to glass/dark tokens from Stories 8.2/8.4.  
- [ ] **Task 4: Accessibility & Reduced Motion (AC #3, #5)**  
  - [ ] Mark skeletons `aria-hidden`; ensure shimmer disables when reduced-motion or `VITE_ANIMATIONS_ENABLED=false` `[Source: docs/stories/8-1-framer-motion-animation-system.md#Dev Notes]`.  
  - [ ] Confirm empty-state CTAs meet 60×60 touch-target rule `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.  
- [ ] **Task 5: Documentation (AC #5)**  
  - [ ] Add Storybook stories for each empty/skeleton pattern with light/dark toggles.  
  - [ ] Update `docs/design-system.md` with usage guidance, copy checklist, and screenshots.

## Dev Notes
### Previous Story Insights
- Motion (8.1) and dark mode (8.4) stories introduce feature flags + theme tokens; skeleton shimmer must respect motion flag and dark palette `[Source: docs/stories/8-1-framer-motion-animation-system.md#Dev Notes][Source: docs/stories/8-4-dark-mode-support.md#Dev Notes]`.  
- Glass token story (8.2) ensures readability on translucent surfaces; reuse tokens for empty panels `[Source: docs/stories/8-2-glass-morphism-refinement.md#Dev Notes]`.

### Component Specifications
- Day 5 plan outlines EmptyState layout, skeleton code snippet, and CTA requirements `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 5: Empty States & Performance]`.  
- PRD states empty states must include illustrations + helpful copy, replacing spinners with shimmering skeletons `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.

### File Locations
- Follow project structure: `components/dashboard/*`, `components/workout/*`, `components/analytics/*`, `components/common/*.tsx` `[Source: docs/architecture.md#Project Structure]`.  
- Assets for illustrations stored under `src/assets/` per design docs (reuse existing SVG set).

### Technical Constraints
- Skeleton shimmer must use transform/opacity animations (no expensive layout) to maintain 60fps `[Source: docs/architecture-ui-redesign-2025-11-12.md#Risk 3: Performance Degradation from Animations]`.  
- Empty states should not shift layout drastically; maintain consistent card dimensions to avoid CLS.

### Testing Requirements
- Jest/RTL snapshot tests for EmptyState and SkeletonBlock (light/dark, motion toggle).  
- Integration tests verifying Dashboard/WorkoutBuilder show skeletons while loading and swap to content.  
- Manual QA for copy accuracy, CTA behavior, reduced-motion fallback, and accessibility (aria-hidden skeletons, focusable CTAs only).

### Project Structure Notes
- If `components/common` folder missing, create it per architecture; ensure exports available via barrel for reuse `[Source: docs/architecture.md#Project Structure]`.

## Testing
- Automated: Jest snapshot/behavior tests; Playwright scenario verifying skeleton→content transitions.  
- Visual: Percy/Chromatic to compare empty states + skeletons in light/dark mode.  
- Accessibility: manual verification of aria-hidden skeletons, focus management, CTA touch targets, and reduced-motion compliance.

## Dev Agent Record
(To be completed during implementation.)

## QA Results
(To be completed during QA review.)

## Change Log
| Date       | Version | Description                             | Author |
|------------|---------|-----------------------------------------|--------|
| 2025-11-13 | v0.1    | Story drafted from Epic 8 requirements  | SM     |
