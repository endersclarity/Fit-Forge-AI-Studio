# FitForge Design System - Implementation Roadmap

Step-by-step guide to migrate FitForge from the current design to the new Stitch-inspired design system.

---

## Overview

**Goal:** Transform FitForge from a "tech startup" aesthetic to a "premium fitness brand" aesthetic.

**Approach:** Incremental migration, one screen/component at a time, with rollback capability.

**Timeline:** Estimated 2-3 weeks for full migration (depending on team size).

---

## Phase 0: Preparation (Day 1)

### Setup Design System Foundation

**Tasks:**
- ✅ Review design system documentation
- [ ] Install font packages
- [ ] Update Tailwind config
- [ ] Create feature flag for new design
- [ ] Setup Storybook for component showcase

**Commands:**
```bash
# Install fonts
npm install @fontsource/cinzel @fontsource/lato

# Install Material Symbols (if not already installed)
npm install @material-symbols/font-outlined
```

**Files to modify:**
- `tailwind.config.js` - Add new colors, fonts, shadows
- `index.tsx` or main entry - Import fonts
- `.env` - Add feature flag `VITE_NEW_DESIGN=false`

**Deliverables:**
- [ ] Fonts loading correctly
- [ ] New Tailwind tokens available
- [ ] Feature flag working

**Time:** 2-4 hours

---

## Phase 1: Core Components (Days 2-4)

### 1.1 Button Component

**File:** `components/ui/Button.tsx`

**Current state:**
```tsx
bg-primary (cyan) / bg-secondary / bg-ghost
rounded-lg
```

**New state:**
```tsx
bg-primary (blue #758AC6)
rounded-full for primary/secondary
shadow-button-primary for primary
text-sm font-bold tracking-wide
```

**Migration strategy:**
1. Create `Button.v2.tsx` alongside existing
2. Implement new styles
3. Create Storybook story
4. Test in isolation
5. Add feature flag wrapper
6. Replace in one screen as pilot

**Tasks:**
- [ ] Create `Button.v2.tsx`
- [ ] Update button variants (primary, secondary, ghost)
- [ ] Add Storybook story
- [ ] Test accessibility (focus states, keyboard nav)
- [ ] Document props

**Time:** 4 hours

---

### 1.2 Card Component

**File:** `components/ui/Card.tsx`

**Current state:**
```tsx
bg-card-background (solid)
rounded-lg
shadow-md
```

**New state:**
```tsx
bg-white/50
backdrop-blur-sm
rounded-xl
border border-gray-300/50
shadow-sm
```

**Migration strategy:**
1. Create `Card.v2.tsx`
2. Implement glass morphism
3. Test against various backgrounds (marble, gradients, solid)
4. Create Storybook story with background options
5. Ensure sufficient contrast for content

**Tasks:**
- [ ] Create `Card.v2.tsx`
- [ ] Implement glass morphism pattern
- [ ] Test readability with different content
- [ ] Add elevation variants (if needed)
- [ ] Create Storybook story

**Time:** 4 hours

---

### 1.3 Badge Component

**File:** `components/ui/Badge.tsx`

**Current state:**
```tsx
Various colors
rounded-full or rounded-md
```

**New state:**
```tsx
Equipment badges: bg-badge-bg, border-badge-border, text-badge-text, rounded-md
Category pills: rounded-full, selected/unselected states
```

**Migration strategy:**
1. Create `Badge.v2.tsx`
2. Separate into variants: equipment, pill-selected, pill-unselected
3. Implement shadow for selected state
4. Create Storybook story

**Tasks:**
- [ ] Create `Badge.v2.tsx`
- [ ] Equipment badge variant
- [ ] Category pill variants (selected/unselected)
- [ ] Add Storybook story
- [ ] Document usage guidelines

**Time:** 3 hours

---

### 1.4 Input/Search Component

**File:** `components/ui/Input.tsx` or create new

**Current state:**
- Standard input styling

**New state:**
```tsx
Glass background (white/50)
Inner shadow
Rounded-xl
Icon integration
Focus ring (primary color)
```

**Migration strategy:**
1. Create `SearchInput.v2.tsx`
2. Implement glass effect
3. Add icon support (Material Symbols)
4. Test focus states
5. Create Storybook story

**Tasks:**
- [ ] Create `SearchInput.v2.tsx`
- [ ] Glass morphism styling
- [ ] Icon integration
- [ ] Focus/blur states
- [ ] Placeholder styling
- [ ] Add Storybook story

**Time:** 4 hours

---

### Phase 1 Deliverables:
- [ ] Button.v2.tsx complete
- [ ] Card.v2.tsx complete
- [ ] Badge.v2.tsx complete
- [ ] SearchInput.v2.tsx complete
- [ ] All components in Storybook
- [ ] Feature flag integration ready

**Total Time:** 15 hours (2 days)

---

## Phase 2: Typography & Layout (Days 5-6)

### 2.1 Typography System

**Files:**
- Create `components/ui/Typography.tsx`
- Update all heading components

**Tasks:**
- [ ] Create Typography component with variants:
  - `DisplayXL` (Cinzel, 32px)
  - `DisplayLG` (Cinzel, 24px)
  - `DisplayMD` (Cinzel, 18px)
  - `Body` (Lato, 16px)
  - `BodySM` (Lato, 14px)
  - `BodyXS` (Lato, 12px)
- [ ] Add letter-spacing classes
- [ ] Create Storybook story showing all variants
- [ ] Document when to use Cinzel vs Lato

**Time:** 4 hours

---

### 2.2 Page Layouts

**Files:**
- `App.tsx`
- Create `components/layout/PageContainer.tsx`

**Tasks:**
- [ ] Create `PageContainer.v2.tsx` with heavenly gradient
- [ ] Add marble background support (optional)
- [ ] Update max-width constraints
- [ ] Test on various screen sizes
- [ ] Create Storybook story

**Time:** 3 hours

---

### 2.3 Modal/Drawer Component

**File:** Create `components/ui/Drawer.tsx`

**New component based on Stitch:**
```tsx
Bottom sheet with:
- 85% height
- Rounded top (24px)
- Heavenly gradient background
- Drag handle
- Border-top highlight
- Upward shadow
```

**Tasks:**
- [ ] Create `Drawer.tsx`
- [ ] Implement drag handle
- [ ] Add animation (slide up)
- [ ] Test on mobile
- [ ] Create Storybook story

**Time:** 6 hours

---

### Phase 2 Deliverables:
- [ ] Typography component complete
- [ ] PageContainer.v2.tsx complete
- [ ] Drawer component complete
- [ ] All in Storybook

**Total Time:** 13 hours (1.5 days)

---

## Phase 3: Fitness Components (Days 7-9)

### 3.1 Exercise Card

**File:** `components/fitness/ExerciseCard.tsx`

**Based on Stitch pattern:**
```tsx
Glass card with:
- Exercise name (Cinzel, 18px)
- Equipment badge
- Muscle tags
- Action icon
```

**Tasks:**
- [ ] Create `ExerciseCard.v2.tsx`
- [ ] Implement glass morphism
- [ ] Add equipment badge
- [ ] Add muscle tags
- [ ] Add action button
- [ ] Create Storybook story with variants

**Time:** 5 hours

---

### 3.2 Muscle Card

**File:** `components/fitness/MuscleCard.tsx`

**Tasks:**
- [ ] Update to glass morphism
- [ ] Update typography (Cinzel for muscle names?)
- [ ] Update colors to new palette
- [ ] Test with different fatigue levels
- [ ] Update Storybook story

**Time:** 3 hours

---

### 3.3 Status Badge / Progressive Overload Chip

**Files:**
- `components/fitness/StatusBadge.tsx`
- `components/fitness/ProgressiveOverloadChip.tsx`

**Tasks:**
- [ ] Update to new badge styling
- [ ] Use new color palette
- [ ] Ensure accessibility
- [ ] Update Storybook stories

**Time:** 3 hours

---

### 3.4 Category Pills

**File:** Create `components/ui/CategoryPills.tsx`

**Based on Stitch pattern:**
```tsx
Horizontal scrollable pill list
Selected: primary bg, white text, shadow
Unselected: white/60 bg, medium blue text, border
```

**Tasks:**
- [ ] Create `CategoryPills.tsx`
- [ ] Implement selected/unselected states
- [ ] Add horizontal scroll
- [ ] Test touch interactions
- [ ] Create Storybook story

**Time:** 4 hours

---

### Phase 3 Deliverables:
- [ ] ExerciseCard.v2.tsx complete
- [ ] MuscleCard updated
- [ ] StatusBadge/ProgressiveOverloadChip updated
- [ ] CategoryPills component complete
- [ ] All updated in Storybook

**Total Time:** 15 hours (2 days)

---

## Phase 4: Screen Migration (Days 10-14)

### 4.1 Exercise Picker Screen (Pilot)

**File:** `components/ExercisePicker.tsx`

**Rationale:** Start with this screen since it matches Stitch design exactly.

**Tasks:**
- [ ] Update to drawer component
- [ ] Use new SearchInput
- [ ] Use CategoryPills
- [ ] Use ExerciseCard.v2
- [ ] Add heavenly gradient
- [ ] Test full user flow
- [ ] Get team feedback

**Time:** 6 hours

---

### 4.2 Dashboard

**File:** `components/Dashboard.tsx`

**Tasks:**
- [ ] Update page container to use gradient
- [ ] Update all cards to glass morphism
- [ ] Update buttons to new style
- [ ] Update typography (titles to Cinzel)
- [ ] Test with real data
- [ ] Ensure muscle heatmap still works well

**Time:** 8 hours

---

### 4.3 Workout Tracker

**File:** `components/Workout.tsx`

**Tasks:**
- [ ] Update exercise cards
- [ ] Update action buttons
- [ ] Update set input fields to glass style
- [ ] Update typography
- [ ] Test full workout flow
- [ ] Ensure performance is good

**Time:** 8 hours

---

### 4.4 Profile Screen

**File:** `components/Profile.tsx`

**Tasks:**
- [ ] Update to glass cards
- [ ] Update form inputs
- [ ] Update buttons
- [ ] Update typography
- [ ] Test edit flows

**Time:** 4 hours

---

### 4.5 Analytics Screen

**File:** `components/Analytics.tsx`

**Tasks:**
- [ ] Update cards
- [ ] Ensure charts work with glass backgrounds
- [ ] Update typography
- [ ] Test with various data sets

**Time:** 4 hours

---

### 4.6 Personal Bests Screen

**File:** `components/PersonalBests.tsx`

**Tasks:**
- [ ] Update cards
- [ ] Update badges
- [ ] Update typography
- [ ] Test with real data

**Time:** 4 hours

---

### 4.7 Workout Templates

**File:** `components/WorkoutTemplates.tsx`

**Tasks:**
- [ ] Update template cards
- [ ] Update action buttons
- [ ] Update typography
- [ ] Test create/edit flows

**Time:** 4 hours

---

### Phase 4 Deliverables:
- [ ] All screens migrated to new design
- [ ] Feature flag controls design toggle
- [ ] All flows tested end-to-end
- [ ] Team feedback incorporated

**Total Time:** 38 hours (5 days)

---

## Phase 5: Polish & Optimization (Days 15-16)

### 5.1 Animation & Transitions

**Tasks:**
- [ ] Add smooth transitions for drawer
- [ ] Add hover states for all interactive elements
- [ ] Add focus indicators
- [ ] Test on various devices
- [ ] Optimize for 60fps

**Time:** 6 hours

---

### 5.2 Responsive Design

**Tasks:**
- [ ] Test on mobile (320px - 480px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Fix any layout issues
- [ ] Ensure touch targets are 44x44px minimum

**Time:** 6 hours

---

### 5.3 Accessibility Audit

**Tasks:**
- [ ] Run WAVE tool on all screens
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Fix any issues found

**Time:** 4 hours

---

### 5.4 Performance Optimization

**Tasks:**
- [ ] Audit bundle size (ensure fonts don't bloat)
- [ ] Lazy load heavy components
- [ ] Optimize backdrop-blur usage
- [ ] Test on low-end devices
- [ ] Profile React renders

**Time:** 4 hours

---

### 5.5 Documentation

**Tasks:**
- [ ] Update README with design system info
- [ ] Document component usage in Storybook
- [ ] Create migration guide for future developers
- [ ] Add screenshots to docs
- [ ] Update CHANGELOG

**Time:** 4 hours

---

### Phase 5 Deliverables:
- [ ] Smooth animations throughout
- [ ] Responsive across all devices
- [ ] WCAG AA compliant
- [ ] Performance optimized
- [ ] Documentation complete

**Total Time:** 24 hours (3 days)

---

## Phase 6: Launch (Day 17)

### 6.1 QA Testing

**Tasks:**
- [ ] Full regression test
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on Desktop Chrome/Firefox/Safari
- [ ] Test offline functionality
- [ ] Test PWA install

**Time:** 4 hours

---

### 6.2 Feature Flag Rollout

**Strategy:**
1. Deploy with flag OFF (old design)
2. Enable for internal team (1 day)
3. Enable for 10% of users (2 days)
4. Enable for 50% of users (2 days)
5. Enable for 100% of users
6. Remove old components after 1 week

**Tasks:**
- [ ] Configure feature flag system
- [ ] Set up analytics tracking
- [ ] Create rollback plan
- [ ] Monitor error rates
- [ ] Collect user feedback

**Time:** 2 hours (plus monitoring)

---

### 6.3 Marketing Materials

**Tasks:**
- [ ] Update screenshots on landing page
- [ ] Create "New Look" announcement
- [ ] Update App Store screenshots (if applicable)
- [ ] Create social media posts
- [ ] Update demo video

**Time:** 4 hours (marketing team)

---

### Phase 6 Deliverables:
- [ ] New design live for all users
- [ ] No critical bugs
- [ ] Positive user feedback
- [ ] Analytics showing engagement

**Total Time:** 6 hours

---

## Rollback Plan

If critical issues arise:

1. **Immediate Rollback** (< 5 minutes)
   ```bash
   # Set feature flag to false
   VITE_NEW_DESIGN=false
   # Redeploy
   ```

2. **Identify Issue**
   - Check error logs
   - Review user reports
   - Identify affected component

3. **Fix Forward or Rollback**
   - If quick fix possible: deploy fix
   - If complex issue: rollback and investigate

4. **Communication**
   - Notify users if widespread issue
   - Post status updates
   - Set timeline for fix

---

## Risk Mitigation

### Potential Risks:

1. **Glass morphism performance on low-end devices**
   - **Mitigation:** Feature detection, fallback to solid backgrounds
   - **Test:** Early on old Android devices

2. **Font loading delay (FOIT/FOUT)**
   - **Mitigation:** Use `font-display: swap`, preload critical fonts
   - **Test:** Throttle network in DevTools

3. **Contrast issues with glass backgrounds**
   - **Mitigation:** Always use semi-transparent borders, test thoroughly
   - **Test:** Automated contrast checks

4. **Breaking existing user flows**
   - **Mitigation:** Comprehensive E2E tests before launch
   - **Test:** Full regression suite

5. **User confusion with new UI**
   - **Mitigation:** Add subtle tooltips/onboarding if needed
   - **Test:** User testing with 3-5 users

---

## Success Metrics

**Track these metrics before/after launch:**

- [ ] User session duration (should increase)
- [ ] Workout completion rate (should stay same or increase)
- [ ] Error rate (should not increase)
- [ ] Page load time (should stay under 3s)
- [ ] User satisfaction score (survey)
- [ ] Net Promoter Score (NPS)

**Target:** No degradation in core metrics, 10%+ improvement in satisfaction.

---

## Team Checklist

### Design Team
- [ ] Review extracted design system
- [ ] Approve color palette
- [ ] Approve typography choices
- [ ] Review Storybook components
- [ ] Provide feedback on pilot screen

### Frontend Team
- [ ] Complete Phase 1 (core components)
- [ ] Complete Phase 2 (typography & layout)
- [ ] Complete Phase 3 (fitness components)
- [ ] Complete Phase 4 (screen migration)
- [ ] Complete Phase 5 (polish)

### QA Team
- [ ] Test each component in isolation
- [ ] Test each screen after migration
- [ ] Accessibility audit
- [ ] Device compatibility testing
- [ ] Performance testing

### Product Team
- [ ] Define feature flag strategy
- [ ] Plan rollout timeline
- [ ] Prepare user communications
- [ ] Monitor analytics
- [ ] Collect feedback

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 0: Preparation** | 1 day | Fonts installed, Tailwind configured |
| **Phase 1: Core Components** | 2 days | Button, Card, Badge, Input |
| **Phase 2: Typography & Layout** | 1.5 days | Typography system, PageContainer, Drawer |
| **Phase 3: Fitness Components** | 2 days | ExerciseCard, MuscleCard, CategoryPills |
| **Phase 4: Screen Migration** | 5 days | All screens migrated |
| **Phase 5: Polish** | 3 days | Animations, responsive, a11y, perf |
| **Phase 6: Launch** | 1 day | QA, rollout, marketing |
| **Total** | **15.5 days** | **Full design system migration** |

**With 2-person team:** ~3 weeks (accounting for overlap and parallel work)
**With 1-person team:** ~4 weeks

---

## Quick Wins (Can Do First)

If you want to see immediate impact:

1. **Update primary color** (1 hour)
   - Change `brand-cyan` to new blue in Tailwind config
   - See instant brand transformation

2. **Add Cinzel to headlines** (2 hours)
   - Install font
   - Update all `<h1>`, `<h2>`, `<h3>` to use Cinzel
   - Instant premium feel

3. **Migrate one card to glass** (1 hour)
   - Pick highest-visibility card
   - Apply glass morphism
   - Show to team for feedback

4. **Update button styling** (2 hours)
   - Change to rounded-full
   - Add new shadow
   - Instant visual upgrade

---

## Resources

- **Design System Docs:** `docs/design-system.md`
- **Quick Reference:** `docs/design-system-quick-reference.md`
- **Color Palette:** `docs/design-system-colors.md`
- **Stitch Reference:** `docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/`

---

**Questions?** Reference the design system docs or reach out to the design team.

**Ready to start?** Begin with Phase 0: Preparation!
