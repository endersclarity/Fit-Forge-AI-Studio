# Fix Critical App Crashes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 identified bugs that cause app crashes or broken functionality, prioritizing critical and high-severity issues first.

**Architecture:** Apply defensive programming patterns, proper null checks, consistent API configuration, and runtime validation to prevent crashes from malformed data or missing properties.

**Tech Stack:** React, TypeScript, Axios (via api.ts), Express backend on port 3001

---

## Background

Recent investigation found 6 issues ranging from critical (app crashes) to medium severity (technical debt):

**Critical:**
1. PersonalBests.tsx - Null access crashes (lines 72, 76, 80)
2. DashboardQuickStart.tsx - Wrong API port (line 33)

**High Priority:**
3. LastWorkoutContext.tsx - Hardcoded localhost (line 46)
4. DashboardQuickStart.tsx - Missing error checks (line 33-34)

**Medium Priority:**
5. WorkoutBuilder.tsx - Missing runtime validation (line 161)
6. TemplateCard.tsx - Unsafe .map() call (line 21)

---

## Task 1: Fix PersonalBests Null Access Crashes

**Files:**
- Modify: `components/PersonalBests.tsx:72-80`

**Step 1: Read the current PersonalBests component**

Run: Read `components/PersonalBests.tsx`
Look for: Lines 72, 76, 80 where `.toLocaleString()` and `.toFixed()` are called

**Step 2: Add null checks and fallback values**

Replace lines 72-80 with defensive checks:

```typescript
<p className="text-brand-cyan text-lg font-bold">
  {record.bestSingleSet?.toLocaleString() ?? '0'} lbs
</p>
```

```typescript
<p className="text-brand-cyan text-lg font-bold">
  {record.bestSessionVolume?.toLocaleString() ?? '0'} lbs
</p>
```

```typescript
<p className="text-brand-cyan text-lg font-bold">
  {record.rollingAverageMax?.toFixed(0).toLocaleString() ?? '0'} lbs
</p>
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build` (or check if running dev server shows no errors)
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add components/PersonalBests.tsx
git commit -m "fix: add null checks to prevent PersonalBests crashes

- Add optional chaining and nullish coalescing to PR data
- Prevents 'Cannot read property of null' errors
- Displays '0' as fallback for missing PR data"
```

---

## Task 2: Fix DashboardQuickStart Wrong Port and Error Handling

**Files:**
- Modify: `components/DashboardQuickStart.tsx:33-40`
- Reference: `api.ts` for API_BASE_URL pattern

**Step 1: Read api.ts to understand API configuration**

Run: Read `api.ts`
Look for: `API_BASE_URL` constant and how other API calls are structured

**Step 2: Read DashboardQuickStart to understand current implementation**

Run: Read `components/DashboardQuickStart.tsx`
Look for: Lines 33-40 with the fetch call

**Step 3: Fix the API endpoint and add error handling**

Replace the fetch call (around lines 33-40):

```typescript
// OLD (WRONG):
const response = await fetch('http://localhost:3002/api/rotation/next');
const data = await response.json();

// NEW (CORRECT):
const response = await fetch(`${API_BASE_URL}/api/rotation/next`);
if (!response.ok) {
  throw new Error(`Failed to fetch rotation: ${response.status}`);
}
const data = await response.json();
```

**Step 4: Add API_BASE_URL import at top of file**

Add to imports section:

```typescript
import { API_BASE_URL } from '../api';
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 6: Check if /api/rotation/next endpoint exists**

Run: Read `server/index.ts` or search for "rotation/next"
Look for: Whether this endpoint is actually implemented

**Step 7: If endpoint doesn't exist, comment out the feature with TODO**

If the endpoint is not found, wrap the fetch in a comment explaining:

```typescript
// TODO: Implement /api/rotation/next endpoint on backend
// For now, skip fetching rotation data
// const response = await fetch(`${API_BASE_URL}/api/rotation/next`);
// ...
```

**Step 8: Commit**

```bash
git add components/DashboardQuickStart.tsx
git commit -m "fix: correct API port and add error handling in DashboardQuickStart

- Change from port 3002 to correct API_BASE_URL
- Add response.ok check before parsing JSON
- Import API_BASE_URL from api.ts for consistency
- Prevent 404 errors and improve error messages"
```

---

## Task 3: Fix LastWorkoutContext Hardcoded Localhost

**Files:**
- Modify: `components/LastWorkoutContext.tsx:46`
- Reference: `api.ts` for API_BASE_URL

**Step 1: Read LastWorkoutContext**

Run: Read `components/LastWorkoutContext.tsx`
Look for: Line 46 with hardcoded localhost URL

**Step 2: Replace hardcoded URL with API_BASE_URL**

Change line 46 from:
```typescript
const response = await fetch(`http://localhost:3001/api/workouts/last?category=${category}`);
```

To:
```typescript
const response = await fetch(`${API_BASE_URL}/api/workouts/last?category=${category}`);
```

**Step 3: Add API_BASE_URL import**

Add to imports section at top of file:

```typescript
import { API_BASE_URL } from '../api';
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add components/LastWorkoutContext.tsx
git commit -m "fix: replace hardcoded localhost with API_BASE_URL

- Use API_BASE_URL from api.ts instead of hardcoded localhost
- Ensures feature works in production (Railway deployment)
- Consistent with other API calls in codebase"
```

---

## Task 4: Add Runtime Validation in WorkoutBuilder

**Files:**
- Modify: `components/WorkoutBuilder.tsx:161-165`

**Step 1: Read WorkoutBuilder loadTemplate function**

Run: Read `components/WorkoutBuilder.tsx` lines 155-200
Look for: The `loadTemplate` function and where it iterates `template.exerciseIds`

**Step 2: Add validation before iteration**

Add validation check before the for loop (around line 161):

```typescript
const loadTemplate = async (template: WorkoutTemplate) => {
  const sets: BuilderSet[] = [];

  // Validate exerciseIds exists and is an array
  if (!template.exerciseIds || !Array.isArray(template.exerciseIds)) {
    console.error('Invalid template: exerciseIds is not an array', template);
    onToast('Failed to load template: Invalid exercise data', 'error');
    return;
  }

  for (let idx = 0; idx < template.exerciseIds.length; idx++) {
    const exerciseId = template.exerciseIds[idx];
    // ... rest of the loop
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "fix: add runtime validation for template exerciseIds

- Check exerciseIds is array before iteration
- Prevents crash if API returns malformed data
- Shows error toast instead of silent failure"
```

---

## Task 5: Add Guard Clause in TemplateCard

**Files:**
- Modify: `components/TemplateCard.tsx:21-23`

**Step 1: Read TemplateCard component**

Run: Read `components/TemplateCard.tsx` lines 10-30
Look for: Where `template.exerciseIds.map()` is called

**Step 2: Add guard clause before map**

Wrap the exerciseNames mapping with a safety check:

```typescript
// Get exercise names for the expanded view
const exerciseNames = (template.exerciseIds && Array.isArray(template.exerciseIds))
  ? template.exerciseIds.map(id => {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
      return exercise ? exercise.name : 'Unknown Exercise';
    })
  : [];
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add components/TemplateCard.tsx
git commit -m "fix: add guard clause before mapping exerciseIds

- Check exerciseIds exists and is array before .map()
- Prevents crash on malformed template data
- Returns empty array as safe fallback"
```

---

## Task 6: Final Verification and Build

**Files:**
- All modified files

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Check git status**

Run: `git status`
Expected: All changes committed, working tree clean

**Step 3: Push all commits**

Run: `git push`
Expected: All commits pushed to remote

**Step 4: Document fixes in CHANGELOG**

If CHANGELOG.md exists, add entry:

```markdown
## [Unreleased]

### Fixed
- PersonalBests crash when PR data is null
- DashboardQuickStart using wrong API port (3002 instead of 3001)
- LastWorkoutContext hardcoded localhost preventing production deployment
- Missing error handling in DashboardQuickStart API calls
- WorkoutBuilder crash on malformed template data
- TemplateCard crash when exerciseIds is undefined
```

**Step 5: Final commit for CHANGELOG**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG with crash fixes"
git push
```

---

## Testing Recommendations

After implementation, manually test these flows:

1. **PersonalBests:** Navigate to Personal Bests page, verify it doesn't crash with empty/null data
2. **DashboardQuickStart:** Check if workout recommendations load without 404 errors
3. **LastWorkoutContext:** Verify last workout info displays correctly
4. **WorkoutBuilder:** Load a template and verify it doesn't crash
5. **TemplateCard:** Open "Saved Workouts" and verify templates display properly

---

## Success Criteria

- ✅ All 6 identified issues fixed
- ✅ TypeScript compiles without errors
- ✅ All commits pushed to remote
- ✅ No new crashes when navigating critical user flows
- ✅ Production deployment (Railway) works correctly with API_BASE_URL changes
