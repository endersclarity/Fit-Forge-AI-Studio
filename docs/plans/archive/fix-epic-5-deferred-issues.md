# Implementation Plan: Fix Epic 5 Deferred Issues

**Created**: 2025-11-13
**Status**: Ready for execution
**Priority**: HIGH (blocks production deployment)
**Context**: Epic 5 and Epic 6 completed with 2 known issues deferred. Must fix before Epic 7.

## Problem Statement

Epic 5 validation identified 2 configuration issues that were documented but never fixed:

1. **Fonts Not Loading** - Cinzel and Lato fonts not loading (0 .woff2 requests)
2. **Storybook Stories Missing** - Design system component stories not appearing in Storybook

Epic 6 proceeded without fixing these, adding MORE Storybook stories that also won't load. We now have 10+ story files that cannot be viewed in Storybook, and typography that falls back to system fonts.

**Why This Matters**:
- Production deployment requires proper fonts (Epic 5 Story 5.4 acceptance criteria)
- Developers cannot reference component variants in Storybook
- Every epic since Epic 5 has built on broken foundations

## Source of Truth

**Epic 5 Prerequisites Document**: `docs/epic-6-prerequisites.md`
- Lines 17-112: Issue #1 (Fonts Not Loading)
- Lines 116-220: Issue #2 (Storybook Stories Not Loading)

**Evidence Files**:
- `.storybook/main.ts` - Missing design-system path
- `src/index.css` - Font imports present but not loading
- Story files exist but not visible in Storybook UI

## Implementation Plan

### Phase 1: Investigate Root Causes (30-60 min)

**Task 1.1: Test Production Build for Fonts**
```bash
npm run build
npm run preview
# Open http://localhost:4173 in browser
# DevTools → Network tab → Filter: woff2
# DevTools → Console: document.fonts.length
```

**Expected Outcomes**:
- **If fonts load in prod**: Dev-only Vite issue, lower severity
- **If fonts missing in prod**: Deeper configuration problem, critical

**Task 1.2: Verify Storybook Stories Exist**
```bash
ls src/design-system/components/primitives/*.stories.tsx
ls src/design-system/components/patterns/*.stories.tsx
```

**Expected**: Should find 6-8 .stories.tsx files (Button, Card, Input, Sheet, FAB, InlineNumberPicker, etc.)

**Task 1.3: Read Current Storybook Config**
```bash
cat .storybook/main.ts
```

**Expected**: Should see only `../stories/**/*.stories.*` path (missing design-system)

---

### Phase 2: Fix Storybook Configuration (15-30 min)

**Task 2.1: Update .storybook/main.ts**

Add design-system path to stories array:

```typescript
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/design-system/**/*.stories.@(js|jsx|mjs|ts|tsx)",  // ADD THIS LINE
  ],
  // ... rest of config
};
```

**Acceptance Criteria**:
- [ ] Config includes design-system path
- [ ] Syntax is valid TypeScript
- [ ] No duplicate story IDs

**Task 2.2: Restart Storybook and Verify**

```bash
# Kill existing Storybook process if running
npm run storybook
```

**Verification Steps**:
1. Wait for Storybook to start (usually http://localhost:6006)
2. Check sidebar for "Design System" section
3. Verify component stories appear (Button, Card, Input, Sheet)
4. Click through 3-4 stories to ensure they render
5. Check for console errors

**Acceptance Criteria**:
- [ ] Sidebar shows "Design System" section
- [ ] All 6-8 component stories visible
- [ ] Stories render without errors
- [ ] Accessibility addon works
- [ ] No duplicate story warnings

**Rollback Plan**:
- If stories fail to load, check for story ID conflicts
- Revert config change if breaking Storybook entirely
- Check Storybook terminal output for specific errors

---

### Phase 3: Fix Font Loading (30-120 min, variable)

**Decision Tree Based on Phase 1 Results**:

#### Path A: If Fonts Load in Production (30 min)
→ Dev-only issue, document as "works in prod" and deprioritize

**Task 3.1A: Document Production Success**
- Add note to `docs/epic-6-prerequisites.md`: "Fonts load correctly in production build"
- Update severity from CRITICAL to LOW
- Skip further investigation

#### Path B: If Fonts Missing in Production (60-120 min)
→ Critical issue, requires fix

**Task 3.1B: Try Direct Import in main.tsx**

Option 1 - Import fonts in TypeScript instead of CSS:

```typescript
// src/main.tsx - ADD THESE LINES BEFORE OTHER IMPORTS
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';

// ... rest of main.tsx
```

**Verification**:
```bash
npm run dev
# Browser → Network tab → Filter: woff2
# Should see 8-14 .woff2 files loading
# Console: document.fonts.length (should be >= 4)
```

**Acceptance Criteria**:
- [ ] Network tab shows 4+ .woff2 files
- [ ] `document.fonts.length >= 4`
- [ ] Computed styles on h1 show "Cinzel, serif"
- [ ] Computed styles on body show "Lato, sans-serif"
- [ ] No font loading errors in console

**If This Works**: Stop here, commit solution
**If This Fails**: Proceed to Task 3.2B

**Task 3.2B: Check Vite Configuration**

```typescript
// vite.config.ts - verify this exists
export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },
  // Check if we need assetsInclude for fonts
});
```

**Possible Issues**:
- PostCSS not processing @import statements
- Vite not resolving node_modules CSS files
- Missing CSS preprocessor plugins

**Investigation Commands**:
```bash
# Check PostCSS config
cat postcss.config.js

# Check for CSS-related Vite plugins
grep -i "css\|postcss" vite.config.ts

# Look for font-related errors in dev server output
npm run dev 2>&1 | grep -i "font\|woff"
```

**Task 3.3B: Nuclear Option - Self-Host Fonts**

Only if all else fails:

1. Download font files from @fontsource packages:
```bash
# Find the .woff2 files
ls node_modules/@fontsource/cinzel/files/
ls node_modules/@fontsource/lato/files/
```

2. Copy to public/fonts/:
```bash
mkdir -p public/fonts
cp node_modules/@fontsource/cinzel/files/*.woff2 public/fonts/
cp node_modules/@fontsource/lato/files/*.woff2 public/fonts/
```

3. Update CSS to use relative paths:
```css
/* src/index.css */
@font-face {
  font-family: 'Cinzel';
  src: url('/fonts/cinzel-latin-400-normal.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
/* ... repeat for other weights/fonts */
```

**Only do this if**:
- Vite config investigation reveals complex issue
- Time constraint requires quick solution
- @fontsource package approach definitively broken

---

### Phase 4: Verification & Testing (30 min)

**Task 4.1: Browser Testing Checklist**

**Storybook Verification**:
- [ ] Start Storybook: `npm run storybook`
- [ ] All design system stories visible in sidebar
- [ ] Button component: 18 variants render correctly
- [ ] Card component: Glass morphism visible
- [ ] Input component: Focus states work
- [ ] Sheet component: Drag handle visible
- [ ] FAB component: Animations work
- [ ] InlineNumberPicker: Tap-to-edit opens sheet
- [ ] No console errors across all stories
- [ ] Accessibility addon shows 0 violations

**Font Verification**:
- [ ] Start dev server: `npm run dev`
- [ ] Open DevTools Network tab, filter: woff2
- [ ] See 4+ .woff2 files loading (< 2s each)
- [ ] DevTools Console: `document.fonts.length` returns >= 4
- [ ] Inspect h1 element → Computed styles → font-family: "Cinzel, serif"
- [ ] Inspect body element → Computed styles → font-family: "Lato, sans-serif"
- [ ] No font fallback to ui-sans-serif or system-ui

**Production Build Verification**:
- [ ] Build: `npm run build`
- [ ] Preview: `npm run preview`
- [ ] Open http://localhost:4173
- [ ] Repeat font verification steps above
- [ ] Fonts should load identically in production

**Task 4.2: Automated Test Verification**

```bash
# Run full test suite to check for regressions
npm test

# Specifically check design system tests
npm test src/design-system/
```

**Expected**: All tests that passed before should still pass

**Task 4.3: Visual Regression Check**

Open these pages and verify no layout shifts or visual breaks:
- [ ] Workout Builder (should use Cinzel headers)
- [ ] Recovery Dashboard (should use Lato body text)
- [ ] Exercise Recommendations (proper typography hierarchy)
- [ ] Any page with Button, Card, Input, or Sheet components

---

### Phase 5: Documentation & Commit (15 min)

**Task 5.1: Update Epic 6 Prerequisites Doc**

Edit `docs/epic-6-prerequisites.md`:

```markdown
## Issue #1: Fonts Not Loading 🔴 → ✅ FIXED

**Status**: FIXED on 2025-11-13
**Solution**: [Document what actually worked]
**Verification**: Network tab shows 4+ .woff2 files, document.fonts.length >= 4

## Issue #2: Storybook Stories Not Loading 🟡 → ✅ FIXED

**Status**: FIXED on 2025-11-13
**Solution**: Added `../src/design-system/**/*.stories.*` to .storybook/main.ts
**Verification**: All 6-8 design system stories visible in Storybook sidebar
```

**Task 5.2: Create Git Commits**

```bash
# Commit 1: Storybook fix
git add .storybook/main.ts
git commit -m "fix: add design-system stories to Storybook config

Fixed Issue #2 from Epic 5 prerequisites. Design system component stories
now visible in Storybook sidebar (Button, Card, Input, Sheet, FAB, etc.).

- Added ../src/design-system/**/*.stories.* path to stories array
- Verified 6-8 component stories now load
- No story ID conflicts

Fixes Epic 5 validation finding from docs/epic-6-prerequisites.md"

# Commit 2: Font fix (content varies based on solution)
git add [affected files]
git commit -m "fix: resolve font loading issue (Cinzel, Lato)

Fixed Issue #1 from Epic 5 prerequisites. Fonts now load correctly in
both dev and production builds.

Solution: [describe what actually worked]
- Network tab shows 4+ .woff2 files loading
- document.fonts.length returns 4
- Computed styles confirm Cinzel/Lato in use

Fixes Epic 5 validation finding from docs/epic-6-prerequisites.md"

# Commit 3: Documentation update
git add docs/epic-6-prerequisites.md
git commit -m "docs: mark Epic 5 issues as fixed in prerequisites doc

Both deferred issues from Epic 5 validation now resolved:
- Issue #1 (Fonts): Fixed and verified
- Issue #2 (Storybook): Fixed and verified

Updated status from 'Documented, not fixed' to 'FIXED'"
```

**Task 5.3: Push to GitHub**

```bash
git push origin main
```

---

## Success Criteria

**Issue #1 (Fonts) is FIXED when**:
- [ ] Network tab shows 4+ .woff2 files loading
- [ ] `document.fonts.length >= 4`
- [ ] h1 elements use Cinzel font family
- [ ] body elements use Lato font family
- [ ] Works in both dev (`npm run dev`) and prod (`npm run preview`)
- [ ] No console errors related to fonts

**Issue #2 (Storybook) is FIXED when**:
- [ ] Storybook sidebar shows "Design System" section
- [ ] All component stories visible (Button, Card, Input, Sheet, FAB, pickers)
- [ ] Stories render without errors
- [ ] Accessibility addon functional
- [ ] No duplicate story ID warnings

**Both issues VERIFIED when**:
- [ ] All automated tests still pass (no regressions)
- [ ] Visual inspection confirms proper typography
- [ ] Storybook usable for component reference
- [ ] Documentation updated to reflect fixes
- [ ] Commits pushed to GitHub

---

## Risk Assessment & Rollback

**LOW RISK**:
- Storybook config change (easily reverted if breaking)
- Font imports in main.tsx (easily commented out)

**MEDIUM RISK**:
- Vite config changes (could affect build process)
- Self-hosting fonts (increases bundle size)

**Rollback Commands**:
```bash
# Revert Storybook config
git checkout HEAD -- .storybook/main.ts

# Revert font changes (if in main.tsx)
git checkout HEAD -- src/main.tsx

# Full rollback of all changes
git reset --hard HEAD~3  # (if you made 3 commits)
```

**Red Flags to Stop and Reassess**:
- Storybook completely breaks (won't start)
- Build process fails after changes
- Test suite pass rate drops significantly
- Fonts load but break layout (line-height issues, etc.)
- More than 2 hours spent on font investigation without progress

---

## Time Estimates

- **Phase 1** (Investigation): 30-60 min
- **Phase 2** (Storybook): 15-30 min
- **Phase 3** (Fonts): 30-120 min (variable based on root cause)
- **Phase 4** (Verification): 30 min
- **Phase 5** (Documentation): 15 min

**Total**: 2-3.5 hours
**Best Case**: 1.5 hours (if production build already works)
**Worst Case**: 4 hours (if deep Vite investigation needed)

---

## Notes

- **Why These Weren't Fixed Earlier**: Epic 6 prerequisites doc recommended "fix when blocking" approach
- **Why Fix Now**: Epic 6 added more Storybook stories that don't load, compounding the problem
- **Why Before Epic 7**: Each epic builds on these foundations - must be solid
- **Lessons Learned**: Document in Epic 6 retrospective as "technical debt accumulation risk"

---

**Plan Created**: 2025-11-13
**Ready for Execution**: Yes
**Execution Command**: `/superpowers:execute-plan`
