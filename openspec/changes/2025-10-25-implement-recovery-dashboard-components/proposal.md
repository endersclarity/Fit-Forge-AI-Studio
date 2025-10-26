# Proposal: Implement Recovery Dashboard React Components

**Change ID:** `implement-recovery-dashboard-components`
**Status:** Draft
**Created:** 2025-10-25
**Priority:** High (Foundation for primary user interface)

---

## Executive Summary

Convert the production-ready Recovery Dashboard HTML prototype into a fully functional React component library. This change transforms FitForge's primary interface from concept to reality, delivering the "what can I train RIGHT NOW?" experience with muscle recovery heat maps, smart exercise recommendations, and progressive overload guidance.

**Problem:** Recovery Dashboard exists only as static HTML prototype (9.7/10 quality). Users cannot access muscle recovery intelligence, smart recommendations, or progressive overload features in the actual app.

**Solution:** Implement complete React component library that:
1. Builds reusable base UI components (Button, Card, Badge, ProgressBar)
2. Creates fitness-specific components (MuscleCard, StatusBadge, ProgressiveOverloadChip)
3. Assembles layout components (Dashboard, CollapsibleSection, FAB)
4. Integrates with existing backend APIs for muscle states and recommendations
5. Achieves WCAG AAA accessibility compliance

**Impact:** Unlocks the core FitForge value proposition - users get instant, intelligent workout guidance the moment they open the app. Foundation for all future features.

---

## Why

### Current State

**What Exists:**
- ✅ Production-ready HTML prototype (`docs/ux-dashboard-prototype.html`)
- ✅ Comprehensive UX specification (`docs/ux-specification.md`)
- ✅ Detailed design spec (`docs/ux-dashboard-design-spec.md`)
- ✅ Backend APIs for muscle states and recommendations
- ✅ Database with muscle engagement percentages

**What's Missing:**
- ❌ React components (app uses placeholder UI)
- ❌ Integration with live muscle state data
- ❌ Smart exercise recommendations in production
- ❌ Progressive overload UI
- ❌ Collapsible muscle heat map
- ❌ Accessible, keyboard-navigable interface

### Value Proposition

**For Users:**
- Instant muscle recovery assessment on app open
- Visual heat map shows 13 muscle groups with color-coded fatigue levels
- Smart recommendations with EXCELLENT/GOOD/SUBOPTIMAL status badges
- Progressive overload suggestions (+3% weight or reps)
- Zero manual input required (data-driven intelligence)
- WCAG AAA accessibility (keyboard navigation, screen readers)

**For System:**
- Establishes design system foundation (reusable components)
- Proves React + TypeScript + Tailwind architecture
- Enables all planned features (PR detection, analytics, charts)
- Creates accessible, maintainable codebase
- Validates UX spec with real user testing

---

## What Changes

### New Capabilities

1. **`recovery-dashboard-screen`**
   - Primary home screen showing muscle recovery heat map with 13 muscle groups
   - Visual color-coded fatigue levels (green 0-33%, amber 34-66%, red 67-100%)
   - Collapsible muscle categories (Push/Pull/Legs/Core) with smooth animations
   - Smart exercise recommendations with EXCELLENT/GOOD/SUBOPTIMAL status badges
   - Progressive overload suggestions (+3% weight or reps) integrated from existing backend
   - Last workout context ("Last time: Pull Day A (3 days ago)")
   - Fully accessible interface (WCAG AAA) with keyboard navigation and screen readers
   - Loading states (skeleton screens) and error handling (offline banner)
   - Responsive design (mobile-first, works on all devices)

### Modified Capabilities

- **`app-navigation`**: Recovery Dashboard added as primary home screen (replacing placeholder UI)
- **`workout-flow`**: Dashboard now serves as intelligent entry point to workout selection

### Implementation Approach

This change requires building a complete React component library from scratch:
- **Base UI Components:** Button, Card, Badge, ProgressBar, Modal (reusable across app)
- **Fitness Components:** MuscleCard, StatusBadge, ExerciseRecommendationCard (domain-specific)
- **Layout Components:** Dashboard assembly, CollapsibleSection, Navigation (screen structure)
- **API Integration:** React hooks for muscle states and recommendations, TypeScript interfaces

---

## Scope

### In Scope

✅ **Recovery Dashboard Screen**
- Muscle recovery heat map with 13 muscle groups (Pectoralis, Deltoids, Triceps, Biceps, Lats, Rhomboids, Trapezius, Forearms, Core, Quads, Hamstrings, Glutes, Calves)
- Color-coded fatigue visualization (traffic light system)
- Collapsible muscle categories (PUSH, PULL, LEGS, CORE)
- Smooth expand/collapse animations (500ms ease-in-out)

✅ **Smart Exercise Recommendations**
- Status badges showing EXCELLENT/GOOD/SUBOPTIMAL exercise quality
- Muscle engagement pills (e.g., "Pectoralis 85%")
- Progressive overload chip displaying +3% suggestions
- Equipment icons (barbell, dumbbell, cable, bodyweight)
- Category filtering tabs (All/Push/Pull/Legs/Core)

✅ **Navigation & Interaction**
- Top navigation bar (logo, title, settings)
- Bottom navigation bar (Dashboard, Workout, History, Exercises, Settings)
- Floating Action Button (Start Workout CTA)
- Tap interactions on muscle cards (view exercises for that muscle)
- Tap interactions on recommendation cards (add to workout)

✅ **Accessibility & Performance**
- WCAG AAA compliance (keyboard navigation, screen readers, focus indicators)
- Semantic HTML (main, article, nav, details/summary)
- ARIA labels and roles for all interactive elements
- Respect `prefers-reduced-motion` for animations
- Dashboard loads in <1 second
- Works offline with cached data

✅ **API Integration**
- Connect to existing `/api/muscle-states` endpoint
- Connect to existing `/api/recommendations` endpoint
- Display loading states during data fetch
- Handle API errors gracefully (offline banner)
- TypeScript interfaces for type safety

### Out of Scope (Future Enhancements)

❌ Active Workout screen (separate change)
❌ Workout History screen (separate change)
❌ Exercise Library screen (separate change)
❌ Settings screen (separate change)
❌ Quick Add modal (already implemented separately)
❌ PR celebration animations (future enhancement)
❌ Analytics charts (future enhancement)
❌ 3D muscle model visualization (moonshot)

### Dependencies

**Required (Already Exists):**
- ✅ React 18+ with TypeScript
- ✅ Tailwind CSS v3+
- ✅ Material Symbols icons
- ✅ Backend API endpoints (`/api/muscle-states`, `/api/recommendations`)
- ✅ Database with muscle engagement data
- ✅ HTML prototype as reference

**Blocked By:** None

**Blocks:**
- Active Workout screen implementation
- Analytics dashboard
- PR celebration features
- User testing of primary interface

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Recovery Dashboard renders correctly on all screen sizes
- ✅ All 13 muscle groups display with accurate fatigue percentages
- ✅ Color coding matches spec (green 0-33%, amber 34-66%, red 67-100%)
- ✅ Smart recommendations show status badges correctly
- ✅ Progressive overload chips calculate +3% accurately
- ✅ Collapsible sections animate smoothly
- ✅ WCAG AAA compliance verified (WAVE, axe tools)
- ✅ Keyboard navigation works (Tab, Enter, ESC)
- ✅ Screen readers announce content correctly
- ✅ No breaking changes to existing app

### Short-term (2-4 weeks post-deployment)

- 📈 Dashboard loads in <1 second on average
- 📈 Users determine workout category within 3 seconds
- 📈 90%+ of workouts start from dashboard recommendations
- 📈 Zero accessibility violations reported
- 📈 Component reuse in other screens (Active Workout, History)
- 📈 User feedback confirms "instant assessment" value

### Long-term (8+ weeks)

- 📈 Dashboard is primary entry point (90%+ of sessions)
- 📈 Design system components reused across entire app
- 📈 Accessibility standards maintained in all new features
- 📈 User retention increases (easier to decide what to train)
- 📈 Foundation enables rapid feature development

---

## Risks & Mitigation

### Risk: HTML Prototype ≠ React Complexity

**Scenario:** Static HTML is simpler than stateful React components
**Impact:** Implementation takes longer than expected
**Mitigation:**
- HTML prototype serves as pixel-perfect reference
- Component interfaces already defined in UX spec
- Break into phases (base → fitness → layout)
- Use Storybook for isolated component development

### Risk: API Response Format Mismatch

**Scenario:** Backend API doesn't match expected TypeScript interfaces
**Impact:** Runtime errors, incorrect data display
**Mitigation:**
- Define TypeScript interfaces first (contract-driven)
- Add runtime validation with Zod or similar
- Graceful error handling with fallback states
- Mock data for development/testing

### Risk: Performance with 13 Muscle Cards

**Scenario:** Rendering many components causes lag
**Impact:** Dashboard load time exceeds 1 second goal
**Mitigation:**
- Use React.memo for muscle cards
- Virtualization if needed (unlikely with only 13 items)
- Optimize re-renders with proper key usage
- Profile with React DevTools

### Risk: Accessibility Gaps

**Scenario:** Miss WCAG AAA requirements
**Impact:** Excludes users with disabilities, legal risk
**Mitigation:**
- Automated testing (WAVE, axe, Lighthouse)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Follow UX spec accessibility section exactly

### Risk: Design System Inconsistency

**Scenario:** Components deviate from Tailwind conventions
**Impact:** Technical debt, hard to maintain
**Mitigation:**
- Strict adherence to Tailwind utility-first approach
- Reusable base components for all UI patterns
- Code review checklist for design system compliance
- Storybook as single source of truth

---

## Alternatives Considered

### Alternative 1: Use Pre-Built UI Library (Material UI, Ant Design)

**Rejected:**
- FitForge has unique fitness-specific needs (muscle heat maps)
- Pre-built libraries add bundle bloat
- Custom design differentiates product
- Tailwind gives better performance and flexibility

### Alternative 2: Implement All Screens at Once

**Rejected:**
- Too large a scope, increases risk
- Dashboard is highest priority (primary entry point)
- Phased approach allows user feedback earlier
- Foundation must be solid before building more

### Alternative 3: Skip Accessibility Features for V1

**Rejected:**
- Violates UX spec (WCAG AAA is requirement)
- Excludes users with disabilities
- Harder to retrofit later
- Legal/ethical obligation

### Alternative 4: Use Native `<details>` Element for Collapsible

**Accepted in Prototype, Reconsidered for React:**
- Prototype uses native `<details>` for simplicity
- React version can use controlled component for more features
- Decision: Start with `<details>`, migrate if needed
- Benefit: Progressive enhancement

---

## Implementation Phases

### Phase 1: Foundation - Base Component Library (8-10 hours)

Build reusable UI primitives that will be used throughout the app:
- Button, Card, Badge, ProgressBar, Modal components
- TypeScript interfaces and prop types
- Tailwind CSS styling following UX spec
- Storybook stories for documentation and testing

**Key Deliverable:** Functional base components ready for composition into fitness-specific components

---

### Phase 2: Domain Components - Fitness UI Library (10-12 hours)

Create fitness-specific components using base components:
- MuscleCard with color-coded fatigue states
- StatusBadge (EXCELLENT/GOOD/SUBOPTIMAL variants)
- ExerciseRecommendationCard with muscle pills and progressive overload chips
- MuscleHeatMap organizing 13 muscles into 4 categories

**Key Deliverable:** All domain components rendering correctly with mock data

---

### Phase 3: Integration - Dashboard Assembly & API (12-15 hours)

Assemble complete Recovery Dashboard and connect to backend:
- RecoveryDashboard screen composing all components
- CollapsibleSection with smooth animations
- Navigation components (TopNav, BottomNav, FAB)
- React hooks for muscle states and recommendations APIs
- Loading states (skeleton screens) and error handling (offline banner)

**Key Deliverable:** Functional dashboard displaying live data from backend APIs

---

### Phase 4: Production Ready - Accessibility & Polish (6-8 hours)

Ensure production-quality standards are met:
- WCAG AAA compliance verification (WAVE, axe, Lighthouse)
- Keyboard navigation and screen reader testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Performance optimization (<1 second load time)
- Mobile responsive testing (iPhone SE, Pixel 5)
- Respect `prefers-reduced-motion` for animations

**Key Deliverable:** Production-ready dashboard meeting all UX spec requirements

---

**Total Estimate:** 36-45 hours (4.5-5.5 days)

**Note:** Detailed task breakdown with specific acceptance criteria will be documented in `tasks.md`

---

## Related Documentation

### UX Specifications
- `docs/ux-specification.md` - Complete UX/UI specification (this document)
- `docs/ux-dashboard-design-spec.md` - Original detailed design (9.7/10 quality)
- `docs/ux-dashboard-prototype.html` - Production-ready HTML prototype
- `docs/brainstorming-session-results.md` - Vision and feature ideation

### Technical References
- `backend/types.ts` - TypeScript interfaces for API responses
- `docs/data-model.md` - Database schema and muscle engagement data
- `docs/ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md` - Backend-driven muscle states

### Related OpenSpec Changes (Already Implemented - Backend)

**Note:** These backend capabilities are already implemented and archived. This proposal implements the frontend React UI layer that integrates with these existing backend features.

- `enable-progressive-overload-system` (archived) - Backend calculates +3% suggestions; this proposal implements the UI chip component
- `enable-smart-exercise-recommendations` (archived) - Backend algorithm ranks exercises; this proposal implements the recommendation cards with status badges
- `enable-muscle-fatigue-heat-map` (archived) - Backend tracks muscle states; this proposal implements the visual heat map interface
- `refactor-backend-driven-muscle-states` (archived) - Backend API endpoints exist; this proposal consumes them via React hooks

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Design.md created for component architecture and patterns
- [ ] Spec delta written for recovery-dashboard-screen capability
- [ ] Tasks.md breaks down implementation by phase
- [ ] Validation passes: `openspec validate implement-recovery-dashboard-components --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available
- [ ] UX spec referenced and aligned
- [ ] Accessibility requirements clear

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create `design.md` for component architecture and API integration patterns
3. ⏭️ Write spec delta for `recovery-dashboard-screen` capability
4. ⏭️ Create `tasks.md` with detailed implementation breakdown by phase
5. ⏭️ Validate and get approval
6. ⏭️ Set up Storybook development environment
7. ⏭️ Begin Phase 1: Base Component Library

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply implement-recovery-dashboard-components` (after approval)
