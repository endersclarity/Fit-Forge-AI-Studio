# Verification Gates Checklist

## Pre-Completion Gate (MANDATORY)

Before updating any story status to "Verified" or "Done", ALL of the following must be true:

### Gate 1: Build Success
```bash
npm run build
```
**Expected:** `✓ built in X.XXs` with no errors
**Acceptable:** Warnings about chunk size (can be addressed in Story 8.6)
**NOT Acceptable:** Any build errors, type errors, or syntax errors

### Gate 2: Test Success
```bash
npm run test:run -- <files-related-to-story>
```
**Expected:** All tests pass
**Acceptable:** Pre-existing failures documented in story notes
**NOT Acceptable:** New test failures introduced by story changes

### Gate 3: No Console Errors
Run the app locally and check browser console
**Expected:** No new errors or warnings
**Acceptable:** Pre-existing warnings (document them)

### Gate 4: Acceptance Criteria Met
Review each AC in story file:
- [ ] AC #1 satisfied
- [ ] AC #2 satisfied
- [ ] etc.

**Each AC must be demonstrably met, not assumed.**

---

## Common Gate Failures and Resolutions

### Build Fails with Type Errors
```
Solution: Fix type errors in the indicated files
Do NOT: Ignore them and mark story done
```

### Tests Timeout
```
Solution: Check for async issues, missing awaits, or infinite loops
Consider: Is this a pre-existing issue? Check git blame.
```

### Framer Motion Test Issues
```
Common: [object Object] rendering in tests
Solution: Add animation props to mock exclusion list in vitest.setup.ts
Reference: See global setup file for pattern
```

### Pre-existing Failures
```
If failure existed before story work:
1. Document in story's Dev Notes section
2. Note the file/test name and issue
3. Can proceed with story completion
4. Create tech debt ticket if important
```

---

## Evidence Requirements

When marking a story as Verified/Done, include:

1. **Build output** showing success
2. **Test results** showing pass (or documented pre-existing failures)
3. **AC checklist** confirming each criterion met
4. **Commit hash** of verification moment

---

## Red Flags That Block Completion

- "I think the code is right" without running tests
- "Tests were passing earlier" without re-running now
- "Build should work" without actually building
- Large changeset (40+ files) not incrementally committed
- Status updated without evidence
- Skipping verification "to save time"

---

## Verification Frequency

- After each task: Quick sanity check (does app still load?)
- After story implementation: Full verification gate
- Before any status update to Verified/Done: MANDATORY full gate
- Before committing: At minimum, build passes

---

## FitForge-Specific Gates

### Epic 8 Stories Additional Checks

**Story 8.1 (Framer Motion):**
- Animation feature flag toggles correctly
- Reduced motion preference respected
- 60fps maintained (Chrome Performance tab)

**Story 8.2 (Glass Morphism):**
- Glass tokens render correctly in light/dark
- Contrast ratios meet WCAG AA
- backdrop-filter fallback works

**Story 8.3 (WCAG Audit):**
- Lighthouse Accessibility score ≥90
- axe-core reports no violations
- Keyboard navigation works

**Story 8.4 (Dark Mode):**
- Theme persists to localStorage
- All components have dark variants
- No unreadable text

**Story 8.5 (Empty States):**
- Skeleton loaders appear during fetch
- Empty states have clear CTAs
- Proper ARIA attributes

**Story 8.6 (Performance):**
- Lighthouse Performance ≥90
- Bundle size stable or smaller
- No unused dependencies
