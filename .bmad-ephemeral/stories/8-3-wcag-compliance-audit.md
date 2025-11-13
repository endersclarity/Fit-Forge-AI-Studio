# Story 8-3: WCAG 2.1 AA+ Compliance Audit

## Epic Context
Epic 8: Polish & Accessibility

## Story Description
Run comprehensive accessibility audit: axe-core automated tests, manual keyboard navigation, screen reader testing, color contrast verification.

## Acceptance Criteria
- [ ] AC1: Lighthouse accessibility score 90+ on all screens
- [ ] AC2: axe-core reports 0 violations
- [ ] AC3: Keyboard-only navigation works (Tab, ESC, Arrow keys)
- [ ] AC4: Screen reader testing (NVDA/VoiceOver) passes
- [ ] AC5: Color contrast verified (all pass WCAG AA)
- [ ] AC6: Touch target compliance: 100% at 60px
- [ ] AC7: All issues fixed before marking done

## Testing Approach
- Lighthouse audit on Dashboard, Workout, Exercise Picker
- axe-core automated scan
- Manual keyboard navigation test
- NVDA (Windows) + VoiceOver (Mac) screen reader test

## Dependencies
**Depends On:** 6-4 (touch targets), 8-1, 8-2 (all UI complete)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Lighthouse 90+ achieved
- [ ] 0 axe-core violations
- [ ] Keyboard nav works
- [ ] Screen reader announces correctly
- [ ] All issues documented and fixed
- [ ] Merged to main branch

---

## Story Split Recommendation

This story should be split into two separate stories for realistic timeline estimation:

### Story 8-3a: WCAG Compliance Audit (0.5 days)

**Scope:** Run all accessibility tests and document findings

**Acceptance Criteria:**
- [ ] AC1-AC6 (audit execution only)
- [ ] Lighthouse accessibility audit run in light mode (score documented)
- [ ] Lighthouse accessibility audit run in dark mode (score documented)
- [ ] axe-core violations documented with severity levels
- [ ] Manual keyboard navigation test results documented
- [ ] Screen reader testing notes (NVDA + VoiceOver)
- [ ] **Output:** Accessibility audit report (CSV or markdown)

**Estimated Effort:** 4 hours (0.5 days)

**Definition of Done:**
- All tests executed
- Findings documented in structured format
- Issues categorized by severity (critical/high/medium/low)
- Report shared with team for review

---

### Story 8-3b: WCAG Compliance Fixes (TBD)

**Scope:** Fix all issues identified in Story 8-3a

**Acceptance Criteria:**
- [ ] All CRITICAL issues fixed (blocking launch)
- [ ] All HIGH issues fixed (must fix before launch)
- [ ] All MEDIUM issues fixed (should fix, or documented as acceptable)
- [ ] All LOW issues triaged (fix, defer, or accept with justification)
- [ ] Re-run Lighthouse (target: 90+ in both modes)
- [ ] Re-run axe-core (target: 0 violations)
- [ ] Manual re-test of keyboard navigation
- [ ] Screen reader re-test of fixed components

**Estimated Effort:** 1-5 days (depends on findings from 8-3a)

**Dependencies:**
- Story 8-3a must complete first
- Effort estimate determined after audit findings reviewed

**Definition of Done:**
- Lighthouse score 90+ in light and dark mode
- 0 axe-core violations
- All keyboard navigation flows work correctly
- Screen reader announces all interactive elements
- Focus indicators visible in all states
- Color contrast meets WCAG AA (4.5:1 normal text, 3:1 large text)
