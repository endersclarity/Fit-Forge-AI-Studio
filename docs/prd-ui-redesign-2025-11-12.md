# FitForge UI/UX Redesign - Product Requirements Document

**Project:** FitForge UI/UX Transformation 2025
**Created:** 2025-11-12
**Version:** 1.0
**Type:** Major Enhancement - Design System Implementation
**Status:** Ready for Epic Creation

---

## 1. Executive Summary

### Vision Statement

Transform FitForge from a functional MVP with basic UI into a **premium fitness experience** that matches industry leaders (Fitbod, Strong) while showcasing our sophisticated muscle intelligence technology. Elegant design should amplify the power of our AI recommendations, not obscure them.

### Project Scope

**Transform** all 96 React components from basic UI → premium design system
**Implement** sophisticated blue palette, Cinzel/Lato typography, glass morphism patterns
**Reduce** interactions by 60% (8-12 clicks per set → 3-4 taps)
**Achieve** WCAG 2.1 AA+ accessibility compliance
**Deliver** in 4 epics over 3-4 sprints

### Unique Value Proposition

**Current State:** Brilliant muscle intelligence hidden behind basic UI
- MVP aesthetics (bright cyan, generic fonts, cluttered layouts)
- Accessibility failures (20×20px touch targets vs 44pt WCAG minimum)
- Excessive interactions (8-12 clicks per set vs Fitbod's 3-4 taps)
- Modal hell (3-4 levels deep vs industry standard 2 max)

**Future State:** Premium fitness experience showcasing intelligent features
- Sophisticated design (elegant blues, Cinzel serif, glass morphism)
- Accessibility compliant (WCAG 2.1 AA+ with 60×60px touch targets)
- Streamlined interactions (match Fitbod efficiency with smart shortcuts)
- Polished navigation (bottom sheets, inline editing, auto-timers)

**Competitive Positioning:**
- **vs Fitbod:** Match their UI quality while offering superior muscle intelligence
- **vs Strong:** Combine their simplicity with our advanced recovery tracking
- **Our Edge:** Beautiful design AMPLIFYING unique fatigue-aware AI recommendations

### Timeline & Success Metrics

**Duration:** 3-4 sprints (~4-6 weeks)

**Primary Success Metrics:**
- **60% interaction reduction** (8-12 → 3-4 taps per set)
- **<3s exercise selection time** (from current 8-12s)
- **90%+ touch target compliance** (60×60px minimum)
- **Lighthouse accessibility score:** 90+ (from current ~60)

**Brand Metrics:**
- **Net Promoter Score:** +15 points (measure premium perception)
- **"Beautiful" mentions in reviews:** 3x increase
- **30-day retention:** +15% (reduced friction)
- **App Store rating:** 4.5+ stars

---

## 2. Problem Statement

### Current UX Audit Findings

**Phase 1 Analysis** revealed **15 critical UX issues** across 96 components:

#### P0 Issues (Fix Immediately)
1. **Touch targets too small** (20×20px checkbox vs 44pt WCAG minimum)
   - Impact: Accessibility failure, frustrated users, WCAG 2.1 non-compliant
   - Component: `Workout.tsx:798-810` + all interactive elements

2. **Modal nesting 3-4 levels deep** (Dashboard → FABMenu → QuickAdd → ExercisePicker)
   - Impact: "Modal hell" - users get lost, unclear escape paths
   - Components: `Dashboard.tsx`, `FABMenu.tsx`, `QuickAdd.tsx`, `ExercisePicker.tsx`

3. **No equipment filtering in Quick Add**
   - Impact: Users select exercises they can't perform (frustration + wasted time)
   - Component: `ExercisePicker.tsx`

4. **Inconsistent modal dismiss methods**
   - Impact: User confusion, no standard escape patterns
   - Components: All 11 modals

#### P1 Issues (High Priority)
5. **Per-set interactions: 8-12 clicks** (vs Fitbod's 3-4 taps)
   - Impact: 2-3x more work than industry leader
   - Components: `Workout.tsx`, `QuickAddForm.tsx`

6. **Inconsistent weight/reps controls**
   - Quick Add has +/- buttons, Workout doesn't
   - Impact: Inconsistent UX, learning curve

7. **Rest timer covers actions**
   - Full-width timer obscures next exercise details
   - Impact: Can't see what's coming while resting

8. **Multiple workout entry points** (4 different paths with different setups)
   - Impact: Inconsistent experience, potential state bugs

#### Visual Design Issues (P2)
9. **Typography inconsistency** (no formal scale, mixed fonts/weights)
10. **Button style variations** (primary actions differ by component)
11. **Card pattern inconsistency** (rounded lg/md, shadow variations)
12. **Dashboard density too high** (overwhelming on first load)

### Comparative Analysis: FitForge vs Fitbod

**Phase 2 Analysis** extracted **50+ patterns** from Fitbod (industry leader):

| UX Area | Fitbod Pattern | FitForge Current | Gap Severity |
|---------|----------------|------------------|--------------|
| **Workout Logging** |
| Touch targets | 44-60pt minimum | 20×20px checkbox | **CRITICAL** |
| Per-set interactions | 3-4 taps | 8-12 clicks | **HIGH** |
| Font size (reps/weight) | 48-60pt (gym readable) | 14-16px (small) | **HIGH** |
| Rest timer | Auto-starts, compact | Manual, covers screen | MEDIUM |
| Smart shortcuts | "Log All Sets?" button | Not present | MEDIUM |
| **Exercise Selection** |
| Equipment filter | Everywhere, bottom sheet | Not in Quick Add | **CRITICAL** |
| Layout | Three-tab navigation | Category tabs only | MEDIUM |
| Card design | Thumbnail-first, visual | Text-first, compact | MEDIUM |
| **Modals & Navigation** |
| Max modal depth | 2 levels | 3-4 levels | **CRITICAL** |
| Dismiss methods | 4 ways (swipe/tap/X/ESC) | Inconsistent | **CRITICAL** |
| Bottom sheets | Primary pattern | Not used | HIGH |
| **Visual Design** |
| Typography | 7-level formal scale | Inconsistent inline | MEDIUM |
| Touch targets | 44pt WCAG minimum | Varies, mostly small | **CRITICAL** |
| Spacing | 8pt grid system | Tailwind 4pt (adequate) | LOW |

### Gap Analysis Summary

**Phase 3 Analysis** identified **23 gaps** prioritized by Impact × Effort:

**Top 6 Gaps (Score 5-6):**
1. Touch targets (Impact: High, Effort: Quick) → **Score: 6**
2. Equipment filtering (Impact: High, Effort: Quick) → **Score: 6**
3. Modal dismiss consistency (Impact: High, Effort: Quick) → **Score: 6**
4. Modal nesting reduction (Impact: High, Effort: Medium) → **Score: 5**
5. Per-set interaction reduction (Impact: High, Effort: Medium) → **Score: 5**
6. Inline number editing (Impact: High, Effort: Medium) → **Score: 5**

**Expected Impact:**
- **40-60% interaction reduction** per workout
- **WCAG 2.1 AA accessibility** compliance
- **+30-40% user satisfaction** improvement
- **4-6 weeks development effort** for P0+P1+P2

---

## 3. Solution Overview

### Design System Foundation

**New Visual Identity:**
- **Typography:** Cinzel serif (display) + Lato sans (body)
  - Cinzel conveys classical strength and timeless quality
  - Lato provides modern clarity for UI elements

- **Color Palette:** Sophisticated blues replace bright cyan
  - Primary: `#758AC6` (elegant blue vs current `#24aceb` bright cyan)
  - Text: `#344161` (dark blue vs generic grays)
  - Glass surfaces: `white/50` with backdrop blur

- **Glass Morphism:** Semi-transparent surfaces with depth
  - 50-60% white opacity + backdrop blur
  - Semi-transparent borders (50-70% opacity)
  - Heavenly gradient backgrounds

- **Border Radius:** Rounded-full pills, rounded-xl surfaces
  - Interactive elements: `rounded-full` (pills, buttons)
  - Surfaces: `rounded-xl` (24px for cards, inputs)
  - Drawers: `rounded-t-[24px]` (top corners only)

**Visual Design Principles:**
1. **Elegance meets strength** - Cinzel headlines convey power
2. **Premium fitness brand** - Sophisticated palette, glass effects
3. **Clarity and focus** - Clean layouts, generous whitespace
4. **Heavenly aesthetic** - Soft gradients evoke aspirational fitness

### UX Pattern Overhaul

**Bottom Sheet Navigation:**
- Replace full-screen modals with 40-60% height bottom sheets
- Reduce modal depth from 3-4 levels → 2 maximum
- Standard dismiss: swipe down + backdrop tap + X button + ESC key
- Drag handle affordance on all sheets

**Inline Number Editing:**
- Display reps/weight at 48-60pt font size (gym readable)
- Tap value → bottom sheet picker with +/- buttons
- Large touch targets (60×60px minimum)
- Keyboard entry fallback for exact values

**Smart Interaction Patterns:**
- **Auto-starting rest timer** (90s default, skip button)
- **"Log All Sets?" shortcut** (after 2/3 sets complete)
- **One-tap set duplication** (copy previous set values)
- **Progressive disclosure** (show advanced options on demand)

**Touch Target Compliance:**
- Enlarge ALL interactive elements to 60×60px minimum
- WCAG 2.1 AA compliance (44pt minimum, exceeding to 60pt)
- Adequate spacing between targets (8px minimum)
- Visual feedback on all interactions

### Interaction Philosophy

**Gym-First Design:**
- **Large targets:** Sweaty fingers, gloves, distance viewing
- **Readable fonts:** 48-60pt for primary values (reps/weight)
- **Zero mistakes:** Clear affordances, undo support
- **One-hand use:** Bottom-aligned actions, thumb-friendly

**Intelligence Shortcuts:**
- Auto-start rest timer (no manual activation)
- "Log All Sets?" after pattern detected
- Equipment filtering everywhere (prevent unusable suggestions)
- Real-time workout forecast (see fatigue before starting)

---

## 4. Market Context

### Competitive Landscape

**Industry Leaders:**
1. **Fitbod** (Premium Intelligence + Premium Design)
   - Strengths: Polished UI, smart recommendations, 48-60pt fonts
   - Weaknesses: Less transparent muscle fatigue tracking
   - Our opportunity: Match UI quality, exceed intelligence transparency

2. **Strong** (Simplicity Champion)
   - Strengths: Minimal interactions, clear hierarchy, fast logging
   - Weaknesses: No AI recommendations, basic analytics
   - Our opportunity: Combine simplicity with advanced intelligence

3. **JEFIT, StrongLifts, etc.** (Feature-Rich But Cluttered)
   - Strengths: Extensive features, large exercise databases
   - Weaknesses: Overwhelming UI, poor information architecture
   - Our opportunity: Advanced features with elegant simplicity

### Opportunity Gap

**Current Market:**
- **Fitbod:** Premium design + smart workouts (but opaque muscle tracking)
- **Strong:** Simple logging (but no intelligence)
- **Others:** Feature-rich (but cluttered interfaces)

**FitForge Position:**
- **Premium design** (match Fitbod's polish)
- **Advanced intelligence** (exceed with transparent muscle fatigue)
- **Elegant simplicity** (borrow Strong's interaction efficiency)

**Our Unique Value:** Beautiful design showcasing sophisticated muscle intelligence that competitors don't offer.

### Target Users

**Primary Personas:**

1. **Serious Lifter Sarah** (28, 3 years training)
   - Wants: Progressive overload tracking, intelligent recommendations
   - Pain: Overtrained certain muscles, plateaued on compound lifts
   - Benefit: Muscle-aware AI prevents imbalances, shows recovery timeline

2. **Comeback Chris** (35, returning after injury)
   - Wants: Safe progression, avoid re-injury, build confidence
   - Pain: Doesn't know when muscles are recovered enough to train
   - Benefit: Recovery tracking shows when it's safe to load muscles

3. **Efficient Emma** (42, busy professional)
   - Wants: Quick logging, minimal taps, smart workout planning
   - Pain: Wastes time in apps with too many clicks and menus
   - Benefit: 60% fewer interactions + auto-timer + smart shortcuts

**User Expectations (from Research):**
- "Should look as good as Fitbod" (visual polish)
- "Logging sets should be fast" (3-4 taps max)
- "I want to see my muscles recovering" (visual feedback)
- "Don't show me exercises I can't do" (equipment filtering)

---

## 5. Epic Breakdown

### Epic 5: Design System Foundation
**Goal:** Establish visual identity and core component library
**Duration:** 1 sprint (Week 1)
**Dependencies:** None

**Stories:**
1. **Integrate Cinzel/Lato fonts** (0.5 day)
   - Install `@fontsource/cinzel` and `@fontsource/lato`
   - Update Tailwind config with font families
   - Apply to headers (Cinzel) and body (Lato)

2. **Migrate Tailwind from CDN → PostCSS** (0.5 day)
   - Remove CDN link, install tailwindcss npm package
   - Configure `tailwind.config.js` with custom tokens
   - Add color palette, typography scale, shadows

3. **Implement color palette** (1 day)
   - Replace `brand-cyan` (#24aceb) with `primary` (#758AC6)
   - Update all button, pill, and accent colors
   - Add badge colors (#D9E1F8 background, #BFCBEE border)
   - Test color contrast for WCAG AA compliance

4. **Create glass morphism patterns** (1 day)
   - Define glass surface backgrounds (white/50, white/60)
   - Add backdrop blur utilities
   - Create semi-transparent border styles
   - Implement heavenly gradient background

5. **Build reusable component library** (2 days)
   - Button component (primary/secondary/tertiary variants)
   - Card component (glass surface, rounded-xl)
   - Pill/Badge component (selected/unselected states)
   - Input component (glass surface, focus rings)
   - Document in Storybook

**Acceptance Criteria:**
- ✅ Fonts load correctly, Cinzel for all headlines
- ✅ Tailwind config includes all design tokens
- ✅ Color palette passes WCAG AA contrast tests
- ✅ Glass effects work across light/dark backgrounds
- ✅ Component library documented with examples

---

### Epic 6: Core Interaction Redesign
**Goal:** Reduce per-set interactions from 8-12 → 3-4 taps
**Duration:** 1.5 sprints (Weeks 2-3)
**Dependencies:** Epic 5 (design system must exist)

**Stories:**
1. **Bottom sheet navigation component** (1 day)
   - Create `BottomSheet.tsx` with 40%/60%/80% height variants
   - Drag handle, swipe-to-dismiss, backdrop dismiss
   - Smooth slide-up/down animations (300ms)
   - Test on mobile devices

2. **Reduce modal nesting to 2 levels max** (3 days)
   - Convert FABMenu → floating button menu (not modal)
   - Make QuickAdd open as bottom sheet (60% height)
   - ExercisePicker replaces QuickAdd content (same level)
   - Exercise detail opens as Level 2 full-screen
   - Audit: Ensure no path allows 3+ nested modals

3. **Inline number pickers for reps/weight** (2 days)
   - Create `InlineNumberPicker.tsx` component
   - Display values at 60pt font (gym readable)
   - Tap → bottom sheet with +/- buttons + keyboard fallback
   - Replace inputs in `Workout.tsx` and `QuickAddForm.tsx`
   - Test with gloves, sweaty fingers

4. **Enlarge touch targets to 60×60px** (4 hours)
   - Audit all interactive elements (buttons, checkboxes, inputs)
   - Update to minimum 60×60px (exceeds WCAG 44pt)
   - Add "To Failure" text label next to checkbox
   - Ensure 8px spacing between adjacent targets
   - Mobile device testing

5. **FAB patterns for primary actions** (0.5 day)
   - Design floating action button for "Add Exercise"
   - Position bottom-right, above bottom nav
   - Menu slides up on tap (not modal)

6. **Standardize modal dismiss methods** (1 day)
   - Create `Modal.tsx` wrapper with standard dismissal
   - Swipe down + backdrop tap + X button + ESC key
   - Refactor all 11 modals to use wrapper
   - Keyboard navigation testing

**Acceptance Criteria:**
- ✅ Bottom sheets used for filters, quick actions, confirmations
- ✅ No workflow allows 3+ modal depth
- ✅ Inline pickers show 60pt font, tap to edit
- ✅ 90%+ of interactive elements at 60×60px minimum
- ✅ FAB accessible with thumb on 6.5" phone
- ✅ All modals dismissable 4 ways (swipe/tap/X/ESC)

---

### Epic 7: Intelligence Shortcuts
**Goal:** Leverage smart features to reduce friction
**Duration:** 1 sprint (Week 3-4)
**Dependencies:** Epic 6 (interaction patterns must exist)

**Stories:**
1. **Auto-starting rest timer** (0.5 day)
   - After logging set, timer auto-starts (90s default)
   - Compact design (top-right corner, doesn't cover content)
   - Skip button, +15s button, audio alert on completion
   - Modify `RestTimer.tsx` and `Workout.tsx`

2. **"Log All Sets?" smart shortcut** (1 day)
   - Detect pattern: 2/3 sets complete, same weight/reps
   - Show bottom sheet: "Log remaining sets with same values?"
   - Pre-fill remaining sets, mark as complete
   - Reduces 6-8 clicks → 2 taps

3. **One-tap set duplication** (0.5 day)
   - Add "Copy Previous Set" button after each set
   - Pre-fills weight/reps from last set
   - Saves 4-6 clicks per set

4. **Equipment filtering in Quick Add** (2 hours)
   - Pass `userProfile.equipment` to `ExercisePicker.tsx`
   - Filter exercise list by available equipment
   - "Show All" toggle to bypass filter
   - Badge shows active filter count

5. **Progressive disclosure patterns** (1 day)
   - Collapse advanced options (to-failure, notes, rest time)
   - "More Options" expands inline
   - Dashboard: Collapsible sections for analytics
   - State persists to localStorage

6. **Real-time workout forecast** (1 day)
   - Connect `WorkoutBuilder` to `/api/forecast/workout`
   - Show predicted muscle fatigue as exercises added
   - Update in real-time, warn before bottlenecks
   - Visual: Heat map preview in planning mode

**Acceptance Criteria:**
- ✅ Rest timer auto-starts, doesn't obstruct view
- ✅ "Log All Sets?" shortcut works after 2/3 sets
- ✅ Set duplication reduces logging time by 50%
- ✅ Equipment filtering prevents unusable suggestions
- ✅ Advanced options hidden by default, accessible on demand
- ✅ Forecast updates <500ms after adding exercise

---

### Epic 8: Polish & Accessibility
**Goal:** Premium animations, accessibility, dark mode
**Duration:** 0.5 sprint (Week 4)
**Dependencies:** Epics 5, 6, 7 (all features implemented)

**Stories:**
1. **Framer Motion animations** (1 day)
   - Install `framer-motion` package
   - Bottom sheet: Spring animations (60fps, 300ms)
   - Button press: Scale 0.95 on tap, bounce back
   - Page transitions: Slide from right (iOS standard)
   - Loading states: Skeleton screens with shimmer

2. **Glass morphism polish** (1 day)
   - Add backdrop-blur-sm to all glass surfaces
   - Test glass effects on various backgrounds
   - Ensure borders provide definition
   - Verify readability at 50-60% opacity

3. **WCAG 2.1 AA+ compliance audit** (1 day)
   - Run axe-core automated tests (Lighthouse)
   - Manual keyboard-only navigation test
   - Screen reader testing (NVDA/JAWS)
   - Color contrast verification (all pass AA)
   - Touch target size verification (100% at 60px)
   - Fix any failures

4. **Dark mode support** (1 day)
   - Define dark mode color tokens
   - Heavenly gradient (dark variant)
   - Glass surfaces: `white/10` on dark backgrounds
   - Test all components in light/dark modes
   - Persist preference to localStorage

5. **Empty states & skeleton screens** (1 day)
   - Design empty state illustrations + helpful text
   - Replace spinners with skeleton screens
   - Shimmer animation (1.5s cycle)
   - Match actual content layout

6. **Performance optimization** (0.5 day)
   - React.memo for expensive components
   - Code splitting with React.lazy
   - Optimize bundle size (remove unused deps)
   - Lighthouse performance audit (target: 90+)

**Acceptance Criteria:**
- ✅ Animations run at 60fps, feel responsive
- ✅ Glass effects look premium, readability maintained
- ✅ Lighthouse accessibility score: 90+
- ✅ Dark mode covers all screens, persists preference
- ✅ Empty states provide clear guidance
- ✅ Performance: TTI <3s, FCP <1.5s

---

## 6. Success Metrics & KPIs

### Primary Metrics

**Interaction Efficiency:**
- **Current:** 8-12 clicks per set (3 exercises × 3 sets = 28-38 clicks)
- **Target:** 3-4 taps per set (3 exercises × 3 sets = 14-18 taps)
- **Reduction:** 60% fewer interactions
- **Measurement:** Task completion time tracking

**Exercise Selection Speed:**
- **Current:** 8-12 seconds (4 clicks, scroll, search)
- **Target:** <3 seconds (1 tap on recommendation or 2 taps with filter)
- **Reduction:** 65% faster
- **Measurement:** Time from "Add Exercise" tap → exercise selected

**Touch Target Compliance:**
- **Current:** ~30% at 44pt minimum (most buttons adequate, checkboxes fail)
- **Target:** 90%+ at 60×60px minimum
- **Improvement:** WCAG 2.1 AA+ compliant
- **Measurement:** Automated audit + manual verification

**Accessibility Score:**
- **Current:** Lighthouse accessibility ~60 (estimated)
- **Target:** 90+ (industry best practice)
- **Improvement:** +30 points
- **Measurement:** Lighthouse CI audit on every PR

### Secondary Metrics

**User Satisfaction:**
- **Net Promoter Score:** +15 points
  - Current: ~35 (estimated MVP baseline)
  - Target: 50 (good product-market fit)
  - Measurement: Post-workout survey, monthly email

- **"Beautiful" mentions in reviews:** 3x increase
  - Current: Rare mentions of design quality
  - Target: 30% of reviews mention "beautiful," "polished," "premium"
  - Measurement: App Store review sentiment analysis

**User Engagement:**
- **Workout completion rate:** +10%
  - Current: 85% (users start but don't finish)
  - Target: 95% (reduced friction)
  - Measurement: Analytics event tracking

- **Time to complete workout:** -20%
  - Current: 45 minutes average
  - Target: 36 minutes (faster interactions)
  - Measurement: Timestamp: workout start → finish

**Retention:**
- **30-day retention:** +15%
  - Current: ~60% (estimated)
  - Target: 75% (reduced frustration)
  - Measurement: Cohort analysis, monthly active users

### Brand Metrics

**Premium Perception:**
- **App Store rating:** 4.5+ stars
  - Current: N/A (not yet launched)
  - Target: 4.5+ (top-tier fitness apps)
  - Measurement: App Store rating over time

- **"Premium" keyword mentions:** 5x increase
  - Current: None (MVP aesthetics)
  - Target: 50% of reviews mention "premium," "professional," "elegant"
  - Measurement: Review text analysis

- **Recommendation rate:** 70%+
  - Current: N/A
  - Target: 70% would recommend to friend
  - Measurement: NPS survey + word-of-mouth tracking

### Technical Performance Metrics

**Page Load Performance:**
- **Time to Interactive (TTI):** <3 seconds
- **First Contentful Paint (FCP):** <1.5 seconds
- **Largest Contentful Paint (LCP):** <2.5 seconds
- **Cumulative Layout Shift (CLS):** <0.1
- **Measurement:** Lighthouse CI, Real User Monitoring (RUM)

**Animation Performance:**
- **Frame rate:** 60fps for all animations
- **Modal transitions:** 300ms smooth (no jank)
- **Set logging latency:** <100ms (tap → visual feedback)
- **Measurement:** Chrome DevTools Performance panel

**API Response Times:**
- **Forecast API:** <500ms (maintain current baseline)
- **Timeline API:** <500ms
- **Recommendations API:** <500ms
- **Measurement:** Server-side monitoring, API logs

### Success Criteria Scorecard

**Launch Readiness (All Must Pass):**
- ✅ Interaction reduction: 60%+ achieved
- ✅ Accessibility score: 90+ on Lighthouse
- ✅ Touch target compliance: 90%+ at 60px
- ✅ No critical bugs in core workflows
- ✅ Performance: Lighthouse 90+ (all categories)

**Post-Launch Success (6 weeks after):**
- ✅ NPS: +15 points from baseline
- ✅ 30-day retention: +15% improvement
- ✅ "Beautiful" mentions: 3x increase
- ✅ Support tickets: -20% UX confusion issues
- ✅ App Store rating: 4.5+ stars (if launched)

---

## 7. Technical Requirements

### Technology Stack (No Changes)

**Frontend:**
- **React:** 19.2.0 (existing)
- **TypeScript:** 5.8.2 (existing)
- **Vite:** 6.2.0 (HMR dev server)
- **React Router DOM:** 6.30.1 (existing)
- **Tailwind CSS:** Migrate from CDN → PostCSS

**New Dependencies:**
- `framer-motion`: ~1MB (animations)
- `vaul`: ~15KB (bottom sheets)
- `@fontsource/cinzel`: ~200KB (display font)
- `@fontsource/lato`: ~300KB (body font)

**Development:**
- Docker Compose with HMR (existing)
- Vite dev server (frontend hot reload)
- nodemon (backend auto-restart)

**Deployment:**
- Railway auto-deploy (existing)
- Production URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/

### Integration Points

**Backend APIs (No Changes Required):**
- Existing 20+ REST endpoints continue working
- New forecast/timeline/recommendations APIs in Epics 2-4 (separate PRD)
- No backend changes required for UI redesign

**Frontend Components (80+ to Update):**
- `WorkoutBuilder.tsx` - Bottom sheets, inline pickers
- `RecoveryDashboard.tsx` - Glass cards, typography
- `ExerciseRecommendations.tsx` - Pills, badges
- `Dashboard.tsx` - Progressive disclosure, collapsible sections
- All other components - Design system migration

**Tailwind Configuration:**
```javascript
// tailwind.config.js additions
colors: {
  primary: {
    DEFAULT: '#758AC6',
    dark: '#344161',
    medium: '#566890',
    light: '#8997B8',
    pale: '#A8B6D5',
  },
  badge: {
    bg: '#D9E1F8',
    border: '#BFCBEE',
    text: '#566890',
  },
},
fontFamily: {
  cinzel: ['Cinzel', 'serif'],
  lato: ['Lato', 'sans-serif'],
},
fontSize: {
  'display-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0.05em' }],
  'display-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0.05em' }],
  'display-md': ['18px', { lineHeight: '1.4', letterSpacing: '0.025em' }],
},
boxShadow: {
  'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
  'drawer': '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',
},
backgroundImage: {
  'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
},
```

### Constraints

**Must Maintain:**
- Hot Module Reload (HMR) during development
- Existing Docker Compose setup
- Port configuration (3000 frontend, 3001 backend)
- All current functionality (zero breaking changes)

**Must NOT Break:**
- Backend API contracts
- Database schema
- Existing user workflows (can enhance, not break)
- Performance (<500ms API, <3s page load)

### Feature Flags

**Gradual Rollout Strategy:**
```typescript
const featureFlags = {
  'ui_redesign_enabled': boolean,          // Master toggle
  'ui.design_system': boolean,             // Fonts, colors, glass
  'ui.inline_pickers': boolean,            // Large number inputs
  'ui.bottom_sheets': boolean,             // Bottom sheet navigation
  'ui.auto_timer': boolean,                // Auto-starting rest timer
  'ui.smart_shortcuts': boolean,           // "Log All Sets?" button
};
```

**Rollout Plan:**
1. **Week 1:** Internal testing (staging)
2. **Week 2:** Beta users (10% with flags)
3. **Week 3:** Gradual rollout (50%)
4. **Week 4:** Full release (100%)

**Rollback Plan:**
- Toggle `ui_redesign_enabled` to revert entire redesign
- Individual flags for granular control
- Zero downtime rollback

---

## 8. Implementation Strategy

### Phase 1: Foundation (Sprint 1 - Week 1)

**Epic 5: Design System Foundation**

**Day 1-2:**
- Install fonts (`@fontsource/cinzel`, `@fontsource/lato`)
- Migrate Tailwind from CDN → PostCSS
- Update `tailwind.config.js` with design tokens
- Test font loading, color palette

**Day 3-4:**
- Implement glass morphism patterns
- Create heavenly gradient backgrounds
- Build Button component (3 variants)
- Build Card component (glass surface)
- Build Pill/Badge component

**Day 5:**
- Document components in Storybook
- Color contrast audit (WCAG AA)
- Test glass effects on various backgrounds

**Deliverables:**
- ✅ Design system installed and configured
- ✅ 5 core components documented
- ✅ WCAG color contrast verified

---

### Phase 2: Core Patterns (Sprint 2 - Weeks 2-3)

**Epic 6: Core Interaction Redesign**

**Week 2:**
- Day 1: Create `BottomSheet.tsx` component
- Day 2-3: Reduce modal nesting (FABMenu, QuickAdd refactor)
- Day 4: Enlarge touch targets audit
- Day 5: Standardize modal dismiss methods

**Week 3:**
- Day 1-2: Build `InlineNumberPicker.tsx`, integrate into Workout
- Day 3: FAB patterns for primary actions
- Day 4: Mobile device testing
- Day 5: Integration testing, bug fixes

**Deliverables:**
- ✅ Bottom sheets used for Level 1 modals
- ✅ Max 2 modal depth enforced
- ✅ 90%+ touch targets at 60px
- ✅ Inline pickers show 60pt fonts

---

### Phase 3: Intelligence (Sprint 2-3 - Week 3-4)

**Epic 7: Intelligence Shortcuts**

**Week 3 (overlap with Phase 2):**
- Day 1: Auto-starting rest timer
- Day 2: "Log All Sets?" smart shortcut
- Day 3: One-tap set duplication
- Day 4: Equipment filtering in Quick Add
- Day 5: Progressive disclosure patterns

**Week 4:**
- Day 1: Real-time workout forecast integration
- Day 2: Testing shortcuts in real workouts
- Day 3-5: User acceptance testing

**Deliverables:**
- ✅ Rest timer auto-starts, compact design
- ✅ Smart shortcuts reduce interactions by 60%
- ✅ Equipment filtering prevents frustration
- ✅ Forecast shows predicted fatigue

---

### Phase 4: Polish (Sprint 3 - Week 4)

**Epic 8: Polish & Accessibility**

**Day 1:**
- Install `framer-motion`
- Implement spring animations (bottom sheets, buttons)
- Page transitions (slide from right)

**Day 2:**
- Glass morphism polish (backdrop blur, borders)
- Test across light/dark backgrounds

**Day 3:**
- WCAG 2.1 AA+ compliance audit
  - Run axe-core automated tests
  - Manual keyboard navigation
  - Screen reader testing
- Fix any failures

**Day 4:**
- Dark mode implementation
- Define dark color tokens
- Test all components in dark mode

**Day 5:**
- Empty states, skeleton screens
- Performance optimization (React.memo, code splitting)
- Lighthouse audit (target: 90+ all categories)

**Deliverables:**
- ✅ Animations at 60fps, feel premium
- ✅ Lighthouse accessibility: 90+
- ✅ Dark mode fully supported
- ✅ Performance: TTI <3s, FCP <1.5s

---

### Rollout Strategy

**Phase 1: Internal Testing (Week 1)**
- Deploy to staging environment
- Internal team testing (2 days)
- Fix critical bugs
- Measure performance impact

**Phase 2: Beta Users (Week 2-3)**
- Deploy to 10% of users (feature flag)
- Collect feedback via in-app survey
- Monitor error rates and performance
- Iterate based on feedback

**Phase 3: Gradual Rollout (Week 3-4)**
- Deploy to 50% of users
- A/B test: New UI vs Old UI
- Compare metrics (NPS, retention, task completion)
- Address remaining issues

**Phase 4: Full Rollout (Week 4-5)**
- Deploy to 100% of users
- Monitor for 48 hours
- Prepare rollback if needed
- Celebrate success with team!

**Success Criteria for Each Phase:**
- Error rate increase <5%
- Performance degradation <10%
- Zero critical bugs in core workflows
- User satisfaction >4/5 stars

---

## 9. Risk Assessment

### High Risks

**Risk 1: User Confusion from Dramatic UI Change**
- **Probability:** High (major visual overhaul)
- **Impact:** Medium (temporary frustration, support tickets)
- **Mitigation:**
  - Onboarding tour highlighting new patterns
  - Gradual rollout with feature flags (10% → 50% → 100%)
  - In-app "What's New" guide with screenshots
  - Rollback plan ready (toggle flags to revert)
  - Feedback loop: In-app survey after 1 week

**Risk 2: Performance Degradation from Animations**
- **Probability:** Medium (glass morphism + animations)
- **Impact:** High (frustration, app feels slow)
- **Mitigation:**
  - 60fps target for all animations
  - Lighthouse CI monitoring on every PR
  - React.memo for expensive components
  - Code splitting to reduce bundle size
  - Profiling with Chrome DevTools before launch
  - Kill switch: Disable animations via feature flag

**Risk 3: Dark Mode Edge Cases**
- **Probability:** Medium (many components to update)
- **Impact:** Low (visual glitches, not blocking)
- **Mitigation:**
  - Dedicated dark mode testing phase
  - Test all components in both modes
  - Screenshot comparison (light vs dark)
  - User testing with dark mode preference
  - Post-launch: Monitor bug reports, iterate

### Medium Risks

**Risk 4: Tailwind Migration Complexity (CDN → PostCSS)**
- **Probability:** Medium (changing build system)
- **Impact:** Medium (build failures, styles broken)
- **Mitigation:**
  - Dedicated epic for Tailwind migration (Week 1)
  - Test build process locally and in CI
  - Verify all existing Tailwind classes still work
  - Gradual migration (add new tokens, keep old styles)
  - Rollback: Revert to CDN if PostCSS fails

**Risk 5: Inline Picker Adoption (Users Prefer Old Inputs)**
- **Probability:** Low (improved UX, backed by research)
- **Impact:** Medium (need to revert if users hate it)
- **Mitigation:**
  - A/B test: Inline pickers vs old inputs
  - Measure task completion time (expect 60% faster)
  - User feedback: Survey after 1 week
  - Feature flag: Can revert to old inputs
  - Alternative: Offer both options (settings toggle)

**Risk 6: Bottom Sheet Library (vaul) Has Bugs**
- **Probability:** Low (popular library, well-maintained)
- **Impact:** Medium (swipe gestures fail, poor UX)
- **Mitigation:**
  - Test vaul thoroughly in dev environment
  - Fallback: Build custom BottomSheet if needed
  - Monitor GitHub issues for vaul library
  - Test on iOS Safari, Android Chrome (primary devices)

### Low Risks

**Risk 7: Font Loading Performance Hit**
- **Probability:** Low (modern browsers handle fonts well)
- **Impact:** Low (FOUT/FOIT flash on first load)
- **Mitigation:**
  - Use `@fontsource` npm packages (self-hosted, fast)
  - Font-display: swap (show fallback, then swap)
  - Preload critical fonts in HTML
  - Monitor Lighthouse performance score

**Risk 8: Glass Morphism Browser Compatibility**
- **Probability:** Low (modern browsers support backdrop-filter)
- **Impact:** Low (fallback to solid backgrounds)
- **Mitigation:**
  - Check caniuse.com for backdrop-filter support
  - Fallback: Solid backgrounds on unsupported browsers
  - Test on Safari, Chrome, Firefox, Edge
  - Progressive enhancement (works without glass)

**Risk 9: Framer Motion Bundle Size**
- **Probability:** Low (~1MB gzipped)
- **Impact:** Low (slight page load increase)
- **Mitigation:**
  - Code splitting: Lazy load Framer Motion
  - Only use Motion on critical components
  - Monitor bundle size in CI (fail if >2MB)
  - Alternative: CSS animations (no JS needed)

---

## 10. Appendices

### Appendix A: UX Audit Reference

**Location:** `docs/ux-audit/`

**Contents:**
- `00-index.md` - Master overview (audit summary)
- `01-current-state-audit.md` - 15 critical issues identified
- `02-fitbod-pattern-analysis.md` - 50+ patterns extracted
- `03-gap-analysis.md` - 23 gaps prioritized
- `04-implementation-roadmap.md` - 15 user stories

**Key Findings:**
- 60% interaction reduction possible
- WCAG 2.1 AA compliance required
- Touch targets too small (20px → 60px needed)
- Modal nesting too deep (3-4 levels → 2 max)
- Equipment filtering missing (critical gap)

---

### Appendix B: Design System Reference

**Location:** `docs/design-system*.md`

**Contents:**
- `design-system.md` - Complete specification (950 lines)
- `design-system-quick-reference.md` - Copy-paste cheat sheet
- `design-system-colors.md` - Color palette reference
- `design-system-implementation-roadmap.md` - Migration guide

**Quick Reference:**
- **Primary Color:** `#758AC6` (replaces `#24aceb` cyan)
- **Fonts:** Cinzel (display), Lato (body)
- **Glass:** `white/50` + `backdrop-blur-sm` + `border-gray-300/50`
- **Border Radius:** `rounded-full` (pills), `rounded-xl` (cards)
- **Touch Targets:** 60×60px minimum (exceeds WCAG 44pt)

---

### Appendix C: Existing PRD

**Location:** `docs/PRD.md`

**Summary:**
- FitForge is 80% complete infrastructure
- Core innovation: Muscle-aware training logic
- MVP goal: Integrate validated calculation algorithms
- This UI redesign is parallel enhancement (Epic 5-8)
- No backend changes required for UI work

**Key Context:**
- Existing: 96 React components, 20+ API endpoints
- Database: SQLite with 7 tables (unchanged)
- Deployment: Railway auto-deploy (unchanged)
- Tech stack: React + TypeScript + Express (unchanged)

---

### Appendix D: Architecture

**Location:** `docs/architecture.md`

**Summary:**
- Frontend: React 19.2.0 + TypeScript + Vite
- Backend: Express + better-sqlite3
- Development: Docker Compose with HMR
- No architectural changes for UI redesign

**Integration Points:**
- Frontend ↔ Backend: REST API (existing)
- Design System ↔ Components: Tailwind classes
- Animations ↔ Components: Framer Motion

---

### Appendix E: Implementation Roadmap (Phase 4)

**Location:** `docs/ux-audit/04-implementation-roadmap.md`

**Summary:**
- 15 user stories across 3 sprints
- Story 1.1: Touch targets (4 hours)
- Story 1.2: Equipment filtering (2 hours)
- Story 1.3: Modal standardization (1 day)
- Story 1.4: Modal nesting (3 days)
- ... (11 more stories)

**Total Effort:** 4-6 weeks

---

### Appendix F: Competitor Analysis

**Fitbod UX Patterns:**
- 48-60pt font sizes (gym readable)
- 3-4 taps per set (vs our 8-12 clicks)
- Bottom sheets (40-60% height)
- Auto-starting rest timer (90s default)
- Three-tab exercise picker
- Max 2 modal depth (never 3+)

**Strong UX Patterns:**
- Minimal interactions (tap to edit)
- Clear visual hierarchy
- One-hand thumb-friendly use
- Fast logging (2-3 taps)

**Market Gap:**
- Premium design + Advanced intelligence = FitForge opportunity

---

### Appendix G: Success Metrics Dashboard

**Pre-Launch Baseline:**
- Per-set interactions: 8-12 clicks
- Exercise selection time: 8-12 seconds
- Touch target compliance: ~30% at 44pt
- Accessibility score: ~60 (estimated)

**Post-Launch Targets:**
- Per-set interactions: 3-4 taps (60% reduction)
- Exercise selection time: <3 seconds (75% faster)
- Touch target compliance: 90%+ at 60px
- Accessibility score: 90+ (Lighthouse)

**Measurement Tools:**
- Google Analytics (task completion time)
- Lighthouse CI (accessibility, performance)
- Hotjar (heatmaps, session recordings)
- In-app surveys (NPS, satisfaction)

---

### Appendix H: User Research Insights

**Source:** `docs/research-user-2025-11-09.md`

**Key Findings:**
- Users want "Fitbod-level polish" (visual quality)
- "Logging sets should be fast" (minimize taps)
- "Show me when muscles are recovered" (visual feedback)
- "Don't show exercises I can't do" (equipment filter)

**Retention Factors:**
- Elegant design increases trust in intelligence
- Fast interactions reduce workout friction
- Visual progress motivates consistency

---

## Summary

This PRD documents a comprehensive UI/UX redesign to transform FitForge from functional MVP → premium fitness experience. By implementing sophisticated design (Cinzel/Lato, blues, glass morphism), reducing interactions by 60%, and achieving WCAG 2.1 AA+ compliance, we'll match Fitbod's polish while showcasing our superior muscle intelligence.

**Next Step:** Run `/bmad:bmm:workflows:create-epics-and-stories` to generate bite-sized user stories for Epics 5-8.

---

**Document History:**
- **Version 1.0** (2025-11-12): Initial PRD created from UX audit + design system
- **Created by:** Claude (PM Agent in Autonomous Mode)
- **Sources:** 11 context documents (UX audit, design system, existing PRD/architecture)
