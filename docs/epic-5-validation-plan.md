# Epic 5: Design System Foundation - Validation Test Plan

**Date**: 2025-11-13
**Epic**: Epic 5 - Design System Foundation
**Status**: Code Review Complete, Ready for Functional Validation
**Tester**: AI Agent (Claude Code)

---

## Executive Summary

Epic 5 delivered the foundational design system for FitForge's premium UI redesign. This validation plan ensures all deliverables are functionally verified before Epic 6 begins building on this foundation.

### Deliverables to Validate

1. **Tailwind PostCSS Migration** - CDN → PostCSS with custom config
2. **Design Tokens** - Colors, typography, spacing, shadows
3. **Primitive Components** - Button, Card, Input, Sheet (4 components)
4. **Font Integration** - Cinzel (display) + Lato (body)
5. **Storybook Documentation** - v9.1.15 with a11y addon

### Success Criteria

- ✅ All 4 primitive components render correctly in Storybook
- ✅ No accessibility violations (WCAG 2.1 Level AA)
- ✅ Design tokens apply correctly (colors, fonts, spacing)
- ✅ 123 unit tests pass
- ✅ No visual regressions in main app
- ✅ Font files load correctly (Cinzel + Lato)

---

## Test Plan Overview

### Phase 1: Storybook Component Validation
**Goal**: Verify isolated component functionality and accessibility

**Test Cases**:
1. **Button Component** (9 combinations: 3 variants × 3 sizes)
   - Primary/Secondary/Ghost variants
   - Small/Medium/Large sizes
   - Disabled states
   - Hover/Focus/Active states
   - Accessibility (keyboard navigation, ARIA labels)

2. **Card Component** (2 variants)
   - Glass morphism styling
   - Shadow application
   - Content rendering

3. **Input Component** (3 sizes)
   - Glass background
   - Focus ring behavior
   - Small/Medium/Large sizes
   - Placeholder text

4. **Sheet Component** (Bottom Drawer)
   - Open/close animations
   - Vaul integration
   - Backdrop handling

**Validation Method**:
- Visual inspection in Storybook UI
- Accessibility tab scan (no violations)
- Interactive controls testing
- Browser DevTools inspection

---

### Phase 2: Integration Testing (Local Dev Environment)
**Goal**: Verify components work in production context

**Test Cases**:
1. **Font Loading**
   - Cinzel loads for display text
   - Lato loads for body text
   - Network tab: Check `.woff2` files load
   - No FOUT (Flash of Unstyled Text)

2. **Design Token Application**
   - Primary color (#758AC6) used correctly
   - Tailwind classes not purged incorrectly
   - Shadows render on buttons/cards
   - Spacing system consistent

3. **Component Integration**
   - Check if any existing screens use new primitives
   - No styling conflicts with legacy code
   - Responsive behavior (mobile/tablet/desktop)

4. **Build Process**
   - Tailwind PostCSS compiles correctly
   - No build errors or warnings
   - CSS bundle size reasonable

**Validation Method**:
- Start docker-compose environment
- Navigate through main app screens
- Chrome DevTools inspection
- Test responsive viewports

---

### Phase 3: Unit Test Suite Validation
**Goal**: Verify automated test coverage

**Test Cases**:
1. **Component Tests** (123 tests total)
   - Button.test.tsx
   - Card tests
   - Input tests
   - Sheet tests

2. **Test Quality**
   - All tests pass
   - No flaky tests
   - Meaningful assertions
   - Edge case coverage

**Validation Method**:
```bash
npm run test:run
npm test -- components/ui
```

---

### Phase 4: Regression Testing
**Goal**: Ensure no existing functionality broken

**Test Cases**:
1. **Visual Regression**
   - Dashboard still renders
   - Workout screens functional
   - No broken layouts
   - Legacy components unaffected

2. **Functional Regression**
   - Click through critical user flows
   - Check console for errors
   - Verify data persistence

---

## Test Execution Strategy

### Execution Order
1. ✅ **Storybook First** - Fastest feedback, isolated validation
2. ✅ **Unit Tests Second** - Automated verification
3. ✅ **Integration Third** - Real-world context
4. ✅ **Regression Last** - Ensure no breakage

### Tools Required
- Chrome DevTools (Accessibility, Network, Console tabs)
- Storybook (localhost:6006)
- Docker Compose (localhost:3000)
- Vitest test runner

### Risk Areas
- ⚠️ Font loading path issues
- ⚠️ Tailwind purge config removing needed classes
- ⚠️ CSS specificity conflicts with legacy styles
- ⚠️ Accessibility violations in component interactions
- ⚠️ Mobile viewport rendering issues

---

## Reporting Format

### Finding Template
```markdown
### Finding #X: [Title]
**Severity**: Critical | High | Medium | Low | Cosmetic
**Component**: Button | Card | Input | Sheet | Other
**Category**: Accessibility | Visual | Functional | Performance

**Description**:
What is wrong?

**Steps to Reproduce**:
1. Step one
2. Step two
3. Observed behavior

**Expected Behavior**:
What should happen instead?

**Actual Behavior**:
What currently happens?

**Impact**:
How does this affect users or Epic 6?

**Recommendation**:
How to fix it?

**Screenshots/Evidence**:
DevTools output, screenshots, etc.
```

---

## Deliverable: Test Report

Final deliverable will be: `docs/epic-5-validation-report.md`

**Contents**:
1. Executive Summary (Pass/Fail + Critical Findings)
2. Test Results by Phase
3. Detailed Findings (if any)
4. Screenshots/Evidence
5. Recommendations
6. Epic 6 Readiness Assessment

---

## Success Metrics

**Epic 5 is production-ready if**:
- [ ] All Storybook components render without errors
- [ ] Zero critical accessibility violations
- [ ] 123/123 unit tests pass
- [ ] Fonts load correctly (< 2s)
- [ ] No console errors in main app
- [ ] No visual regressions in existing screens
- [ ] Design tokens apply correctly throughout

**Block Epic 6 if**:
- ❌ Critical accessibility violations (keyboard traps, no ARIA)
- ❌ Components crash or fail to render
- ❌ Fonts don't load (fallback fonts used)
- ❌ Tailwind PostCSS build fails
- ❌ Major visual regressions

---

## Next Steps After Testing

1. **All Pass**: Document findings, mark Epic 5 validated, proceed to Epic 6
2. **Minor Issues**: Document as tech debt, proceed to Epic 6 with caveats
3. **Critical Issues**: Create fix tasks, block Epic 6 until resolved

---

## Notes

- This is a **functional validation**, not a security audit
- Focus on **user-facing behavior** and **Epic 6 blockers**
- Document everything for future reference
- Use Chrome DevTools extensively for evidence collection
