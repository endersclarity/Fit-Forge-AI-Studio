# Fix Workout Template Save Bug Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the WorkoutBuilder template save functionality to correctly store exercise IDs instead of sending undefined sets array.

**Architecture:** The frontend WorkoutBuilder currently sends a `sets` array to the backend, but the backend expects an `exerciseIds` array. We need to extract unique exercise IDs from the sets before sending to the template creation API.

**Tech Stack:** React/TypeScript (Frontend), Node.js/Express (Backend), SQLite (Database)

---

## Task 1: Extract Exercise IDs Before Template Save

**Files:**
- Modify: `components/WorkoutBuilder.tsx:353-373`

**Step 1: Write the fix to extract exerciseIds from sets**

In `components/WorkoutBuilder.tsx`, modify the `handleConfirmSaveTemplate` function:

```typescript
const handleConfirmSaveTemplate = async () => {
  if (!templateName.trim()) {
    onToast('Please enter a template name', 'error');
    return;
  }

  try {
    // Extract unique exercise IDs from sets
    const exerciseIds = [...new Set(workout.sets.map(s => s.exerciseId))];

    await templatesAPI.create({
      name: templateName,
      category: templateCategory,
      variation: templateVariation,
      exerciseIds: exerciseIds,  // Send exerciseIds instead of sets
      isFavorite: false,
    });

    onToast('Template saved!', 'success');
    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateCategory('Push');
    setTemplateVariation('A');
    // Clear draft after successful save
    localStorage.removeItem('workoutBuilder_draft');
  } catch (error) {
    console.error('Failed to save template:', error);
    onToast('Failed to save template', 'error');
  }
};
```

**Step 2: Verify the fix compiles**

Run: `docker-compose up -d` (if not already running)
Expected: No TypeScript compilation errors

**Step 3: Test template creation manually**

Manual test steps:
1. Navigate to http://localhost:3000
2. Click "📊 Plan Workout"
3. Click "Add Set" and select "Dumbbell Bench Press"
4. Click "Add Set" and select "Tricep Extension"
5. Click "Save as Template"
6. Enter name "Test Fix Template", select Push/A
7. Click "Save Template"
8. Verify toast shows "Template saved!"
9. Click "📋 Saved Workouts"
10. Verify "Test Fix Template" shows "2 exercises • 0 sets" (exercises now saved)

**Step 4: Clean up test template**

Navigate to Saved Workouts and delete "Test Fix Template"

**Step 5: Commit the fix**

```bash
git add components/WorkoutBuilder.tsx
git commit -m "fix: extract exerciseIds from sets when saving templates

The WorkoutBuilder was sending a 'sets' array to templatesAPI.create(),
but the backend expects 'exerciseIds' array. Now we extract unique
exercise IDs from the sets before saving.

This fixes templates showing '0 exercises' after saving.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Verify Template Loading Still Works

**Files:**
- Review: `components/WorkoutBuilder.tsx:158-207`

**Step 1: Review template loading logic**

Check that `loadTemplate` function in WorkoutBuilder.tsx:158-207 correctly handles the exerciseIds array from templates.

Expected code pattern:
```typescript
for (let idx = 0; idx < template.exerciseIds.length; idx++) {
  const exerciseId = template.exerciseIds[idx];
  // ... creates sets from exerciseId
}
```

**Step 2: Test template loading manually**

Manual test steps:
1. Navigate to http://localhost:3000
2. Click "📋 Saved Workouts"
3. Click "Load" on "Push Day A" template
4. Verify it opens WorkoutBuilder with 6 sets (one per exercise)
5. Verify each set shows the correct exercise name
6. Click X to close without saving

**Step 3: Document verification**

No code changes needed - just verification that existing logic works correctly.

---

## Task 3: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md` (prepend to file)

**Step 1: Add changelog entry**

Prepend this entry to CHANGELOG.md:

```markdown
## [Unreleased] - 2025-11-07

### Fixed
- **WorkoutBuilder Template Save Bug** - Fixed templates saving with 0 exercises
  - File: `components/WorkoutBuilder.tsx:360`
  - Issue: Frontend was sending `sets` array, backend expected `exerciseIds` array
  - Fix: Extract unique exercise IDs from sets before calling `templatesAPI.create()`
  - Impact: Templates now correctly save exercise lists
  - Related: Template loading already worked correctly, no changes needed

```

**Step 2: Commit changelog**

```bash
git add CHANGELOG.md
git commit -m "docs: add changelog entry for template save bug fix

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Push to GitHub and Verify Railway Deployment

**Files:**
- N/A

**Step 1: Push commits to GitHub**

```bash
git push origin main
```

Expected: Both commits pushed successfully

**Step 2: Monitor Railway deployment**

1. Wait 2-3 minutes for Railway auto-deploy
2. Navigate to https://fit-forge-ai-studio-production-6b5b.up.railway.app/
3. Check Railway dashboard for deployment status

**Step 3: Verify fix in production**

Manual test on Railway production:
1. Click "📊 Plan Workout"
2. Add 2 different exercises
3. Save as template "Production Test"
4. Click "📋 Saved Workouts"
5. Verify "Production Test" shows "2 exercises • 0 sets"
6. Delete "Production Test" template

**Step 4: Clean up old broken templates**

In "📋 Saved Workouts", delete any templates showing "0 exercises • 0 sets" that were created during testing (e.g., "Test Template", "Test")

---

## Summary

**Total Tasks:** 4
**Estimated Time:** 15-20 minutes
**Risk Level:** Low (single-line fix, existing loading logic unchanged)

**Testing Strategy:**
- Manual testing in local environment
- Manual testing in production
- No automated tests needed (UI interaction flow)

**Rollback Plan:**
If issues arise, revert commit with:
```bash
git revert HEAD~2..HEAD
git push origin main
```
