# Profile Page Refinements - Implementation Plan

**Date:** 2025-01-17
**Design Doc:** [2025-01-17-profile-page-refinements.md](./2025-01-17-profile-page-refinements.md)

---

## Pre-Implementation: Serena Investigation

Before executing any tasks, use Serena tools to understand the codebase:

1. **Dashboard Structure:**
   ```typescript
   mcp__serena__get_symbols_overview("components/Dashboard.tsx")
   mcp__serena__find_symbol(name_path="Dashboard", relative_path="components/Dashboard.tsx", include_body=false, depth=1)
   ```

2. **MuscleHeatMap Interface:**
   ```typescript
   mcp__serena__get_symbols_overview("components/fitness/MuscleHeatMap.tsx")
   mcp__serena__find_symbol(name_path="MuscleHeatMap", relative_path="components/fitness/MuscleHeatMap.tsx", include_body=true)
   ```

3. **Profile Component:**
   ```typescript
   mcp__serena__get_symbols_overview("components/Profile.tsx")
   ```

4. **Bodyweight Data Flow:**
   ```typescript
   mcp__serena__search_for_pattern(substring_pattern="bodyweight.*weight", restrict_search_to_code_files=true)
   mcp__serena__search_for_pattern(substring_pattern="bodyweightHistory", restrict_search_to_code_files=true)
   ```

---

## Task Breakdown

### **Task 1: Add MuscleHeatMap to Dashboard** ⏱️ 5-7 min

**Objective:** Import and render MuscleHeatMap component on Dashboard

**Steps:**
1. Use Serena to understand MuscleHeatMap props interface
2. Identify where Dashboard fetches muscle state data
3. Import MuscleHeatMap into Dashboard.tsx
4. Add component to JSX with appropriate props
5. Place in aesthetically pleasing location (after stats cards, before bottom sections)
6. Match Tailwind dark mode styling patterns

**Expected Code (Dashboard.tsx):**
```typescript
// Add import at top
import MuscleHeatMap from './fitness/MuscleHeatMap';

// Inside Dashboard component JSX (after stats section, before bottom cards)
{/* Muscle Heat Map Section */}
<div className="mb-6">
  <h2 className="text-2xl font-display font-bold text-brand-dark dark:text-slate-100 mb-4">
    Muscle Recovery Status
  </h2>
  <div className="bg-white dark:bg-brand-surface rounded-xl border border-slate-200 dark:border-brand-muted p-6">
    <MuscleHeatMap
      muscleStates={muscleStates}
      onMuscleClick={(muscle) => {
        // Optional: Add interaction if needed
        console.log('Clicked muscle:', muscle);
      }}
    />
  </div>
</div>
```

**Verification:**
- [ ] MuscleHeatMap renders on Dashboard without errors
- [ ] Component displays in dark mode correctly
- [ ] No TypeScript errors
- [ ] Visual placement looks clean

**Files Modified:**
- `components/Dashboard.tsx`

---

### **Task 2: Investigate Bodyweight Linkage** ⏱️ 10-12 min

**Objective:** Trace and document bodyweight data flow from Profile to exercise weight dropdown

**Investigation Steps:**

1. **Find Exercise Weight Dropdown Component:**
   ```typescript
   mcp__serena__search_for_pattern(
     substring_pattern="bodyweight.*option|select.*bodyweight",
     restrict_search_to_code_files=true
   )
   ```

2. **Trace Bodyweight Data Source:**
   ```typescript
   mcp__serena__find_referencing_symbols(
     name_path="bodyweightHistory",
     relative_path="types.ts"
   )
   ```

3. **Check Active Workout Implementation:**
   ```typescript
   mcp__serena__get_symbols_overview("components/active-workout/ActiveWorkoutPage.tsx")
   mcp__serena__search_for_pattern(
     substring_pattern="weight.*bodyweight|bodyweight.*weight",
     relative_path="components/active-workout"
   )
   ```

4. **Document Findings:**
   - Where does exercise weight dropdown get "bodyweight" value?
   - Does it read from Profile.bodyweightHistory?
   - Is it hardcoded or dynamic?
   - Does it use latest entry or default value?

**Expected Outcomes:**

**Scenario A: Working Correctly**
```markdown
## Bodyweight Linkage - WORKING ✅

**Data Flow:**
Profile.bodyweightHistory (latest entry)
  → profileAPI.get()
  → App.tsx state
  → Passed to ActiveWorkoutPage
  → Used in weight dropdown when "bodyweight" selected

**Verification:**
- Changed bodyweight to 200lbs in Profile
- Saved successfully
- Navigated to ActiveWorkout
- Selected exercise with bodyweight option
- Dropdown shows "200 lbs" correctly
```

**Scenario B: Needs Fix**
```markdown
## Bodyweight Linkage - BROKEN ❌

**Issue:** Exercise weight dropdown uses hardcoded "bodyweight" string, doesn't read from Profile

**Fix Required:**
1. Pass user's actual bodyweight to ActiveWorkoutPage
2. Update weight dropdown to display actual weight value
3. Ensure Profile.bodyweightHistory[latest] is accessible

**Implementation:** [code to fix the issue]
```

**Verification:**
- [ ] Data flow documented in Serena memory
- [ ] Either confirmed working OR fix implemented
- [ ] Manual test: Profile bodyweight → Exercise dropdown

**Files Investigated:**
- `components/Profile.tsx`
- `components/active-workout/ActiveWorkoutPage.tsx`
- Exercise weight dropdown component (TBD via search)
- `types.ts` (UserProfile interface)

**Serena Memory Update:**
```typescript
mcp__serena__write_memory(
  memory_file_name="bodyweight_data_flow",
  content="# Bodyweight Data Flow\n\n[findings from investigation]"
)
```

---

### **Task 3: Remove Unused Profile Fields** ⏱️ 5-7 min

**Objective:** Clean up Profile UI by removing Experience, Muscle Detail, and Recovery fields

**Steps:**
1. Use Serena to get Profile.tsx symbols overview
2. Find and remove Experience Level dropdown section
3. Find and remove Muscle Detail Level section
4. Find and remove Recovery Settings slider section
5. Verify no orphaned state variables
6. Test Profile page renders correctly

**Expected Code Changes (Profile.tsx):**

**Remove Experience Level Section (~lines TBD):**
```typescript
// DELETE THIS SECTION:
<div className="mb-4">
  <label className="block text-sm font-medium font-body text-gray-700 dark:text-slate-300 mb-1">
    Experience Level
  </label>
  <select
    value={profile.experience || ''}
    onChange={e => handleProfileChange('experience', e.target.value)}
    className="..."
  >
    <option value="">Select experience</option>
    <option value="Beginner">Beginner</option>
    <option value="Intermediate">Intermediate</option>
    <option value="Advanced">Advanced</option>
  </select>
</div>
```

**Remove Muscle Detail Settings Section:**
```typescript
// DELETE muscleDetailSettings UI section
```

**Remove Recovery Settings Section:**
```typescript
// DELETE Recovery Days slider section
```

**Verification:**
- [ ] Profile page renders without removed fields
- [ ] No console errors
- [ ] Remaining fields (height, age, bodyweight, equipment) still work
- [ ] Save button still functional
- [ ] Layout remains clean and organized

**Files Modified:**
- `components/Profile.tsx`

---

## Post-Implementation: Knowledge Capture

After completing all tasks, create Serena memory:

```typescript
mcp__serena__write_memory(
  memory_file_name="profile_page_refinements_implementation",
  content=`# Profile Page Refinements - Implementation Summary

## What Was Changed

### 1. MuscleHeatMap Added to Dashboard
- Component: components/fitness/MuscleHeatMap.tsx
- Integration point: components/Dashboard.tsx
- Props passed: muscleStates (from useAPIState)
- Placement: [describe final placement]
- Styling: Matches glass morphism + Tailwind dark mode patterns

### 2. Bodyweight Linkage Investigation
[Document findings from Task 2 - either "works correctly" or "fixed with [solution]"]

**Data Flow:**
[Profile → API → App.tsx → ActiveWorkout → Weight Dropdown]

### 3. Profile UI Cleanup
**Removed Fields:**
- Experience Level dropdown (lines X-Y in Profile.tsx)
- Muscle Detail Level settings (lines X-Y)
- Recovery Settings slider (lines X-Y)

**Kept Fields:**
- Height & Age (core user metrics)
- Bodyweight tracking (essential for exercise tracking)
- Equipment Inventory (future feature)
- Muscle Baselines (links to Dashboard)

## Lessons Learned
- [Any bugs discovered and fixed]
- [Code patterns that worked well]
- [Things to watch out for in future Profile changes]

## Files Modified
- components/Dashboard.tsx (added MuscleHeatMap)
- components/Profile.tsx (removed unused fields)
- [Any other files if bodyweight linkage needed fixes]
`
)
```

---

## Testing Checklist

### Dashboard - MuscleHeatMap
- [ ] Component renders without errors
- [ ] Heat map displays muscle state data correctly
- [ ] Styling matches Dashboard aesthetic (glass morphism)
- [ ] Dark mode works correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] No TypeScript errors

### Bodyweight Linkage
- [ ] Change bodyweight in Profile (e.g., to 200 lbs)
- [ ] Click Save in Profile
- [ ] Navigate to workout/active route
- [ ] Select exercise with bodyweight option
- [ ] Verify correct weight appears (200 lbs or "bodyweight")
- [ ] Data flow documented in Serena memory

### Profile UI Cleanup
- [ ] Experience Level field removed
- [ ] Muscle Detail settings removed
- [ ] Recovery slider removed
- [ ] Height field still present and works
- [ ] Age field still present and works
- [ ] Bodyweight tracking still present and works
- [ ] Equipment section still present (even if not fully functional)
- [ ] Save button works correctly
- [ ] No console errors
- [ ] Layout still organized and clean

---

## Commit Message

```
feat: restore muscle heat map to dashboard and clean up profile UI

- Add MuscleHeatMap component to Dashboard with muscle state data
- Remove unused Profile fields (Experience, Muscle Detail, Recovery)
- Document bodyweight data flow from Profile to exercise tracking
- Match existing Tailwind dark mode styling patterns

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Notes

- User requested aesthetic placement decision for MuscleHeatMap ("wherever you think is prettiest")
- Bodyweight linkage investigation may reveal working system or require fixes
- Backend types/API left intact - only UI elements removed
- Follow Serena-First approach: understand structure before modifying
