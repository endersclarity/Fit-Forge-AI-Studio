# Epic 8: Polish & Accessibility - Brownfield Enhancement

## Epic Goal
Deliver premium-feeling UI polish (motion, glass morphism, empty states) while closing accessibility gaps (WCAG 2.1 AA+, dark mode, touch targets) so the redesigned workout experience feels trustworthy and inclusive ahead of production release.

## Epic Description

**Existing System Context**
- Current relevant functionality: New workout logging flows, recovery dashboard, recommendation widgets, and modal/bottom-sheet interactions from Epics 5-7 are feature-complete but visually unfinished.
- Technology stack: React + TypeScript (Vite), Tailwind CSS, Framer Motion (planned), Vaul bottom sheets, REST APIs already wired to mock data.
- Integration points: Dashboard glass cards, WorkoutBuilder bottom sheets, modal system, skeleton loading placeholders, theme/tokens, performance budgets tracked via Lighthouse.

**Enhancement Details**
- What's being added/changed: Production-ready motion system, glass morphism refinement, WCAG audit fixes, dark-mode theme, empty states & skeleton loaders, bundle/perf optimizations.
- How it integrates: Reuses existing components (WorkoutBuilder, Dashboard, BaselineModal, etc.) by layering animation wrappers, shared theme tokens, and new utility components.
- Success criteria: 60fps motion, Lighthouse Accessibility ≥90, touch targets 60×60px, dark mode persists to localStorage, actionable empty states, Lighthouse Performance ≥90 with TTI <3s/FCP <1.5s.

## Stories
1. **Framer Motion Animation System** – Install/configure Framer Motion, add page transitions, button tap feedback, bottom-sheet springs, list stagger animations, and skeleton shimmer states.
2. **Glass Morphism Refinement** – Standardize glass surfaces (blur strength, opacity, borders) across dashboard cards, modals, and quick actions with light/dark variants; verify cross-browser support.
3. **WCAG 2.1 AA+ Compliance Audit** – Integrate axe-core in dev, run Lighthouse audits, perform keyboard-only + screen-reader testing, fix all identified issues, reconfirm touch target sizing.
4. **Dark Mode Support** – Define dark-mode tokens in Tailwind, implement gradient + surface pairings, add persisted theme toggle, regression-test every screen/component.
5. **Empty States & Skeleton Screens** – Introduce reusable `EmptyState` + skeleton components; replace spinners in dashboard, workout templates, analytics, personal bests with shimmering placeholders.
6. **Performance Optimization & Bundle Hygiene** – Memoize heavy components, add React.lazy boundaries, remove unused deps/assets, re-run Lighthouse to ensure Performance ≥90.

## Compatibility Requirements
- [x] Existing APIs remain unchanged (no backend updates needed).
- [x] Database schema untouched; only UI/theme layers change.
- [x] UI changes follow Tailwind + component architecture patterns defined in Epics 5-7.
- [x] Performance impact is net-positive (bundle size stable or smaller).

## Risk Mitigation
- **Primary Risk:** Motion/blur effects reduce FPS on lower-end devices.
  - **Mitigation:** Constrain animations to transform/opacity, profile with Chrome Performance, and keep feature flag (`VITE_ANIMATIONS_ENABLED`) ready.
  - **Rollback Plan:** Toggle feature flag to disable advanced motion/glass while retaining base UI.

- **Secondary Risk:** Dark mode misses component variants causing unreadable text.
  - **Mitigation:** Dedicated dark-mode QA day, Percy/Chromatic diff review, enforce design tokens.
  - **Rollback Plan:** Temporarily hide dark-mode toggle and keep class off until issues resolved.

## Definition of Done
- [ ] All six stories implemented with acceptance criteria satisfied.
- [ ] Accessibility + performance targets validated via Lighthouse/axe/manual testing.
- [ ] Dark mode + empty states verified across dashboard, WorkoutBuilder, templates, analytics, and modal flows.
- [ ] Documentation updated (design specs, README release notes, testing summary).
- [ ] Feature flags cleaned up or documented for later removal.

## Validation Checklist
**Scope Validation**
- [x] Epic scoped to six tightly-related UI polish stories.
- [x] Integration complexity manageable (UI-layer only).
- [x] Follows existing component architecture (Tailwind, Vaul, Storybook patterns).
- [x] No backend/services dependencies.

**Risk Assessment**
- [x] Risks documented with mitigation + rollback.
- [x] Testing plan covers accessibility, performance, and UI regressions.
- [x] Team has prior context from Epics 5-7 to implement safely.

**Completeness Check**
- [x] Epic goal + success criteria are measurable.
- [x] Stories sequenced to unlock QA (animations → accessibility → dark mode → polish).
- [x] Dependencies on earlier epics noted (work waits for Epics 5-7 completion).

## Story Manager Handoff
"Please develop detailed user stories for this brownfield epic. Key considerations:

- Enhancement targets the redesigned React UI (Vite + Tailwind + Vaul + soon Framer Motion).
- Integration points: Dashboard glass cards, WorkoutBuilder bottom sheets, Recovery dashboard, Baseline modal, analytics screens.
- Existing patterns: Tailwind utility classes, shared `GlassCard`, `BottomSheet`, `Modal` wrappers, BEM-inspired component folders.
- Critical compatibility requirements: Maintain 60×60 touch targets, no new API contracts, preserve current navigation flows, keep bundle size within 1 MB compressed.
- Each story must verify accessibility + performance budgets across both light and dark themes."
