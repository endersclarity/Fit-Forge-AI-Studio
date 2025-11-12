# Fix TemplateCard Crash (My Templates Button) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the crash when clicking "My Templates" button on Dashboard caused by accessing undefined `template.sets` property

**Architecture:** The API returns templates with `exerciseIds: string[]` but TemplateCard component expects `sets: TemplateSet[]`. The type definition was changed but the API and database schema were not updated. We'll fix TemplateCard to work with the actual API response format.

**Tech Stack:** React, TypeScript

---

## Root Cause

**Location:** `components/TemplateCard.tsx:11`

**Error:** `Cannot read properties of undefined (reading 'map')`

**Problem:** TemplateCard accesses `template.sets.map()` but templates from API have `exerciseIds` array instead

**Evidence:**
- `backend/database/database.ts:1816` returns `exerciseIds: JSON.parse(t.exercise_ids)`
- `types.ts:241` shows comment "CHANGED from exerciseIds" but only frontend type was changed
- API contract still uses `exerciseIds` format

---

## Task 1: Fix TemplateCard to use exerciseIds

**Files:**
- Modify: `components/TemplateCard.tsx:11-12`

**Step 1: Update exerciseCount calculation**

Current code (line 11):
```typescript
const exerciseCount = new Set(template.sets.map(s => s.exerciseId)).size;
```

Change to:
```typescript
const exerciseCount = template.exerciseIds ? template.exerciseIds.length : 0;
```

**Step 2: Update setCount calculation**

Current code (line 12):
```typescript
const setCount = template.sets.length;
```

Change to:
```typescript
// Default to 3 sets per exercise (standard pattern in this app)
const setCount = exerciseCount * 3;
```

**Step 3: Verify changes**

Open file and confirm:
```typescript
const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, onDelete }) => {
  const exerciseCount = template.exerciseIds ? template.exerciseIds.length : 0;
  const setCount = exerciseCount * 3;
  // ... rest of component
};
```

**Step 4: Test the fix**

Run: Navigate to production app in Chrome DevTools
```bash
# Using Chrome DevTools MCP
navigate to: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
click: "My Templates" button
```

Expected: Modal opens showing template cards without crash

**Step 5: Commit**

```bash
git add components/TemplateCard.tsx
git commit -m "fix: use exerciseIds instead of sets in TemplateCard

TemplateCard was accessing template.sets which doesn't exist in API response.
API returns exerciseIds array instead. Updated component to match actual data structure.

Fixes: Dashboard 'My Templates' button crash (Issue #1, P0)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Verify WorkoutTemplates page still works

**Files:**
- Test: `components/WorkoutTemplates.tsx`

**Step 1: Check if WorkoutTemplates uses the same pattern**

```bash
grep -n "template.sets" components/WorkoutTemplates.tsx
```

Expected: Should find similar usage if it exists

**Step 2: If found, apply same fix**

If WorkoutTemplates also accesses `template.sets`, update it to use `template.exerciseIds`

**Step 3: Test both flows**

Navigate to both:
1. Dashboard → "My Templates" button → Modal
2. Direct URL → `/templates` page

Both should display templates correctly

**Step 4: Commit if changes made**

```bash
git add components/WorkoutTemplates.tsx
git commit -m "fix: use exerciseIds in WorkoutTemplates if needed"
```

---

## Task 3: Add defensive null check (optional safety)

**Files:**
- Modify: `components/TemplateCard.tsx:11`

**Step 1: Add null safety**

Current (after Task 1):
```typescript
const exerciseCount = template.exerciseIds ? template.exerciseIds.length : 0;
```

Enhanced safety:
```typescript
const exerciseCount = template.exerciseIds && Array.isArray(template.exerciseIds)
  ? template.exerciseIds.length
  : 0;
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors related to TemplateCard

**Step 3: Test edge cases**

Test with:
- Template with 0 exercises (exerciseCount = 0)
- Template with undefined exerciseIds (exerciseCount = 0)
- Template with normal exerciseIds (exerciseCount = actual length)

**Step 4: Commit**

```bash
git add components/TemplateCard.tsx
git commit -m "refactor: add defensive null check to TemplateCard

Add Array.isArray check for extra safety against malformed data.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Steps

**Manual Testing:**
1. Navigate to Dashboard
2. Click "My Templates" button
3. Verify modal opens without crash
4. Verify all 8 templates display with correct exercise counts
5. Click "Load" on a template
6. Verify WorkoutBuilder opens with exercises

**Regression Testing:**
1. Navigate to `/templates` URL directly
2. Verify templates page still works
3. Click a template card
4. Verify navigation to workout page works

---

## Expected Outcomes

**After Task 1:**
- ✅ "My Templates" button opens modal without crash
- ✅ Templates display with correct exercise count
- ✅ Set count shows as (exerciseCount × 3)

**After Task 2:**
- ✅ WorkoutTemplates page continues working
- ✅ No regressions in template display

**After Task 3:**
- ✅ Extra safety against malformed API data
- ✅ No TypeScript errors

---

## Alternative Solution (Not Recommended)

**Option B: Update API to return `sets` array**

This would require:
1. Database migration to add sets table
2. Update seed data to include sets
3. Update API serialization
4. More complex changes across backend

**Why Option A is better:**
- Minimal change (2 lines of code)
- No database migration needed
- No API changes needed
- Maintains backward compatibility
- Fixes issue immediately

---

## Notes

- The comment in `types.ts:241` suggests someone intended to migrate to `sets` format but only updated the type, not the implementation
- Consider creating a follow-up task to align types with actual API contract
- Current fix maintains existing API contract and updates frontend to match reality
