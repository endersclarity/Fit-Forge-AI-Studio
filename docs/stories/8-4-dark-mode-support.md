# Story 8.4: Dark Mode Support

## Status
Draft

## Story
**As a** FitForge athlete training in low light,\
**I want** the entire application to offer a polished dark mode,\
**so that** I can log workouts and review analytics without visual glare.

## Acceptance Criteria
1. Enable class-based dark mode in Tailwind (`darkMode: 'class'`) and define dark theme tokens (primary backgrounds, gradients, text, borders) per architecture plan `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 4: Dark Mode Support]`.  
2. Apply dark variants to all major screens/components (dashboard, WorkoutBuilder, recommendations, templates, analytics, modals) ensuring typography, borders, and glass surfaces stay readable.  
3. Add a theme toggle (sun/moon icon) that persists user preference to `localStorage`, respects initial `prefers-color-scheme`, and updates `<html class="dark">`.  
4. Validate dark theme with glass morphism + motion features to ensure readability, 60×60 touch targets, and no accessibility regressions `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.  
5. Document dark-mode guidance in `docs/design-system.md` and Storybook, including QA checklist, screenshots, and troubleshooting notes.

## Tasks / Subtasks
- [ ] **Task 1: Token & Config Setup (AC #1)**  
  - [ ] Update `tailwind.config.js` to `darkMode: 'class'`, add dark gradient/background tokens, and extend `src/design-system/tokens/colors.ts`.  
  - [ ] Define shared glass tokens referencing dark-mode values from Story 8.2 for consistency.  
- [ ] **Task 2: Component Theme Sweep (AC #2)**  
  - [ ] Apply `dark:` classes to `GlassCard`, `BottomSheet`, `Modal`, dashboard widgets, WorkoutBuilder, analytics charts, and recommendations list `[Source: docs/architecture.md#Project Structure]`.  
  - [ ] Ensure charts/icons swap to high-contrast palettes and text remains AA compliant.  
- [ ] **Task 3: Theme Toggle (AC #3)**  
  - [ ] Build `components/common/ThemeToggle.tsx` storing preference (`ff-theme` or similar) and syncing with `<html>` class + context.  
  - [ ] Use effect to read OS preference on first load and allow manual override.  
- [ ] **Task 4: QA & Accessibility Validation (AC #4)**  
  - [ ] Conduct visual sweep (desktop + mobile) verifying glass, motion, and empty/skeleton states remain legible.  
  - [ ] Run Lighthouse/axe in dark theme to confirm Accessibility ≥90; re-check touch targets ≥60×60px.  
- [ ] **Task 5: Documentation & Evidence (AC #5)**  
  - [ ] Update Storybook stories with theme toggle controls for key components/screens.  
  - [ ] Add dark-mode section to `docs/design-system.md` covering tokens, toggle usage, QA checklist, and screenshot links.

## Dev Notes
### Previous Story Insights
- Glass token story (8.2) provides light/dark opacity guidance—reuse its tokens for consistency `[Source: docs/stories/8-2-glass-morphism-refinement.md#Dev Notes]`.
- Motion story (8.1) requires animations to work under dark mode without readability issues `[Source: docs/stories/8-1-framer-motion-animation-system.md#Dev Notes]`.

### Component Specifications
- Day 4 plan supplies Tailwind snippet for dark tokens, gradient definitions, and theme-toggle example `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 4: Dark Mode Support]`.
- PRD acceptance criteria demand dark-mode coverage for every screen with persistence and accessibility safeguards `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.

### File Locations
- `tailwind.config.js`, `src/design-system/tokens/colors.ts`, `App.tsx`, `components/dashboard/*`, `components/workout/*`, `components/modals/*`, `components/common/ThemeToggle.tsx` per project structure `[Source: docs/architecture.md#Project Structure]`.

### Technical Constraints
- Keep preference storage SSR-safe (guard `window`) and ensure toggle works with existing feature flags.  
- Maintain 60×60 touch targets even in dark theme; adjust spacing if new borders alter layout `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8]`.

### Testing Requirements
- Jest tests for ThemeToggle persistence + OS preference detection.  
- Visual regression (Percy/Chromatic) for critical screens in dark mode.  
- Lighthouse + axe runs executed in dark mode with evidence captured.  
- Manual device sweep (iOS, Android, desktop) checking gradients, glass, and skeleton shimmers.

### Project Structure Notes
- If `components/common` directory does not exist, create per unified structure; ensure toggle is imported at root layout `[Source: docs/architecture.md#Project Structure]`.

## Testing
- Automated: Jest unit tests for ThemeToggle, feature flags guard, and CSS class toggling.  
- Visual: Percy/Chromatic snapshots comparing light vs dark; manual screenshot log.  
- Accessibility: Lighthouse/axe dark-mode pass, touch-target validation, motion/glass readability checks.

## Dev Agent Record
(To be completed during implementation.)

## QA Results
(To be completed during QA review.)

## Change Log
| Date       | Version | Description                             | Author |
|------------|---------|-----------------------------------------|--------|
| 2025-11-13 | v0.1    | Story drafted from Epic 8 requirements  | SM     |
