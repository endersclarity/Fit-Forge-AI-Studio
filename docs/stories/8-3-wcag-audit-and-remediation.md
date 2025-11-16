# Story 8.3: WCAG 2.1 AA+ Audit & Remediation

## Status
In Progress

## Story
**As an** accessibility specialist,\
**I want** to audit and remediate the redesigned FitForge UI for WCAG 2.1 AA+ compliance,\
**so that** keyboard, screen-reader, and touch users can rely on the experience before launch.

## Acceptance Criteria
1. Integrate `@axe-core/react` (dev-only) and run axe + Lighthouse Accessibility audits for dashboard, WorkoutBuilder, analytics, and modal flows scoring ≥90 `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 3: WCAG 2.1 AA+ Compliance Audit]`.  
2. Perform full keyboard-only navigation coverage across all interactive elements, ensuring logical tab order, visible focus indicators, working ESC/backdrop dismissals, and focus-return to triggers.  
3. Conduct screen reader tests (NVDA on Windows, VoiceOver on macOS) verifying descriptive labels, announcements for dynamic regions, and modal dialog semantics.  
4. Re-verify color contrast (WebAIM) for text, icons, and buttons in light/dark themes, along with touch-target measurement ≥60×60px `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.  
5. Document findings and fixes in `docs/testing/accessibility/epic-8-wcag-report.md`, leaving no open blocking issues.

## Tasks / Subtasks
- [ ] **Task 1: Automation Harness (AC #1)**  
  - [ ] Add `@axe-core/react` lazy import in `App.tsx` when `NODE_ENV === 'development'`.  
  - [ ] Create `npm run audit:accessibility` script invoking Lighthouse CLI against key routes; store HTML/JSON artifacts.  
- [ ] **Task 2: Keyboard Validation (AC #2)**  
  - [ ] Tab through dashboard, WorkoutBuilder sheet, modals, recommendations, analytics; fix focus order or missing outlines.  
  - [ ] Confirm ESC/backdrop close returns focus to invoking button (FAB, nav, etc.).  
- [ ] **Task 3: Screen Reader Pass (AC #3)**  
  - [ ] Run NVDA + VoiceOver sessions capturing notes for buttons, toggles, charts, and live regions (recommendations, analytics updates).  
  - [ ] Add `aria-live` attributes or announcements where data changes without navigation.  
- [ ] **Task 4: Contrast & Touch Targets (AC #4)**  
  - [ ] Use WebAIM contrast checker for primary/secondary text, buttons, and dark-mode tokens defined in Day 4 plan.  
  - [ ] Measure touch targets (Chrome DevTools ruler) ensuring ≥60×60px after recent glass/motion updates.  
- [ ] **Task 5: Reporting & Regression Controls (AC #5)**  
  - [ ] Write `docs/testing/accessibility/epic-8-wcag-report.md` summarizing audits, fixes, and residual risks.  
  - [ ] Update PR checklist/README to require Lighthouse ≥90 + zero axe violations before merge.

## Dev Notes
### Previous Story Insights
- Glass token work (Story 8.2) impacts contrast; verify new opacity/border values still meet WCAG before finalizing `[Source: docs/stories/8-2-glass-morphism-refinement.md#Dev Notes]`.

### Component Specifications
- Day 3 plan lists axe integration, Lighthouse runs, keyboard flows, screen reader focus areas, contrast ratios, and touch-target verification `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 3: WCAG 2.1 AA+ Compliance Audit]`.
- PRD Epic 8 acceptance criteria require Lighthouse Accessibility ≥90, 60×60px touch targets, and clear guidance for empty states `[Source: docs/prd-ui-redesign-2025-11-12.md#Epic 8: Polish & Accessibility]`.

### File Locations
- Accessibility scripts/config live alongside app root (`App.tsx`, `package.json` scripts) per project structure `[Source: docs/architecture.md#Project Structure]`.
- Documentation for audits stored under `docs/testing/` as referenced in architecture/testing sections `[Source: docs/architecture.md#Documentation]`.

### Technical Constraints
- Do not ship axe in production builds; guard imports with environment checks `[Source: docs/architecture-ui-redesign-2025-11-12.md#Day 3: WCAG 2.1 AA+ Compliance Audit]`.
- Maintain existing modal focus-trap patterns from Vaul sheets (Story 6.1) to avoid regressions `[Source: docs/stories/6-1-bottom-sheet-navigation-component.md#Dev Notes]`.

### Testing Requirements
- Automated: `npm run audit:accessibility` (Lighthouse) + jest-axe for key components.  
- Manual: keyboard traversal scripts, NVDA/VoiceOver recordings, touch-target measurements.  
- Evidence: attach Lighthouse/axe outputs plus accessibility report to repo for future audits.

### Project Structure Notes
- Ensure new report folder `docs/testing/accessibility/` matches docs hierarchy; create if missing `[Source: docs/architecture.md#Documentation]`.

## Testing
- Lighthouse CLI (desktop + mobile emulation) capturing ≥90 Accessibility, storing HTML/JSON artifacts.  
- axe/react integration smoke tests within dev server.  
- Manual keyboard, NVDA, VoiceOver passes with documented results and screenshots.  
- WebAIM contrast + touch-target measurement logs.

## Dev Agent Record
(To be completed during implementation.)

## QA Results
(To be completed during QA review.)

## Change Log
| Date       | Version | Description                             | Author |
|------------|---------|-----------------------------------------|--------|
| 2025-11-13 | v0.1    | Story drafted from Epic 8 requirements  | SM     |
