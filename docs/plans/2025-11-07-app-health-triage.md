# FitForge App Health Triage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Systematically test the FitForge production app end-to-end using Chrome DevTools to identify all functional and UI issues, document current state, and create prioritized fix list.

**Architecture:** Manual QA testing approach using Chrome DevTools MCP integration to navigate, interact, and inspect the live Railway deployment. Each page will be tested for navigation, rendering, API calls, console errors, and interactive functionality. Results documented in structured markdown report with severity classification.

**Tech Stack:** Chrome DevTools MCP, Railway (production deployment), React Router (navigation), Express backend API

---

## Discovered App Structure

Based on codebase analysis (`App.tsx` routes):

**Primary Routes:**
- `/` - Dashboard (home page)
- `/templates` - Workout Templates browser
- `/workout` - Active Workout Tracker
- `/profile` - User Profile & Settings
- `/personal-bests` - Personal Records tracking
- `/analytics` - Workout Analytics & Charts
- `/muscle-baselines` - Muscle Baseline Management
- Onboarding flow (first-time users)

**Key Features Per Route:**
- Dashboard: Muscle visualization, workout recommendations, quick stats, recent workout summary
- Templates: Browse 8 default templates (Push/Pull/Legs/Core A/B), create custom templates
- Workout: Log exercises, track sets/reps/weight, progressive overload suggestions
- Profile: Edit name, experience, equipment, bodyweight tracking
- Personal Bests: Best single set, best session volume, rolling average max per exercise
- Analytics: Exercise progression charts, volume trends, muscle capacity, activity heatmap
- Muscle Baselines: View/edit recovery baselines for all 13 muscle groups

---

## Testing Methodology

### Test Criteria Per Page

For each route, verify:

1. **Navigation** - Can access page via URL/links
2. **Rendering** - Page loads without crashes/white screens
3. **API Calls** - Network requests succeed (200/304), no 404/500 errors
4. **Console** - No JavaScript errors or warnings
5. **UI Elements** - Buttons, links, forms visible and functional
6. **Data Display** - Information renders correctly, no "undefined" or missing data
7. **User Actions** - Clicks, form submissions, navigation work as expected

### Severity Classification

- **P0 (Critical)**: App crashes, data loss, core workflow blocked
- **P1 (High)**: Major features broken, poor UX, visible errors
- **P2 (Medium)**: Minor features broken, cosmetic issues
- **P3 (Low)**: Nice-to-haves, minor polish

---

## Task Breakdown

### Task 1: Setup & Discovery

**Files:**
- Create: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to production app root**

```typescript
// Using Chrome DevTools MCP
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/",
  timeout: 30000
})
```

**Step 2: Take initial snapshot and screenshot**

```typescript
// Document landing page state
mcp__chrome-devtools__take_snapshot()
mcp__chrome-devtools__take_screenshot({ format: "png" })
```

**Step 3: Identify all navigation elements**

```typescript
// Check snapshot output for:
// - Navigation menu/links
// - FAB (Floating Action Button)
// - Quick action buttons
// Document all discovered routes
```

**Step 4: Check initial console and network state**

```typescript
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests({ pageSize: 50 })
```

**Step 5: Document discovery findings**

Create initial report structure:

```markdown
# FitForge App Health Triage - 2025-11-07

## Summary
- Pages Tested: 0/8
- Issues Found: 0
- Critical (P0): 0
- High (P1): 0
- Medium (P2): 0
- Low (P3): 0

## Testing Started
[timestamp]

## Page Discovery
[List all found routes and navigation elements]

## Testing Methodology
[Brief description of approach]
```

---

### Task 2: Test Dashboard (/)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to dashboard**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/",
  timeout: 30000
})
```

**Step 2: Check page loaded successfully**

```typescript
// Take snapshot to verify elements
mcp__chrome-devtools__take_snapshot()
// Expected elements:
// - Muscle visualization
// - Workout recommendations
// - Quick stats
// - Navigation elements
```

**Step 3: Check console for errors**

```typescript
mcp__chrome-devtools__list_console_messages()
// Document any error or warning messages
// Expected: 0 errors for healthy page
```

**Step 4: Check network requests**

```typescript
mcp__chrome-devtools__list_network_requests({
  pageSize: 30,
  resourceTypes: ["fetch", "xhr"]
})
// Expected API calls:
// - GET /api/profile (200 or 304)
// - GET /api/workouts (200 or 304)
// - GET /api/muscle-states (200 or 304)
// - GET /api/muscle-baselines (200 or 304)
// - GET /api/templates (200 or 304)
// Document any failed requests (404, 500)
```

**Step 5: Test interactive elements**

```typescript
// From snapshot, identify clickable elements:
// 1. Profile button (should open profile modal/navigate)
// 2. Start Workout button (should navigate to /workout or show template selector)
// 3. View Templates link (should navigate to /templates)
// 4. Personal Bests link (should navigate to /personal-bests)
// 5. FAB menu (if present)

// Test each by clicking and verifying behavior
mcp__chrome-devtools__click({ uid: "[profile-button-uid]" })
// Wait and verify modal/navigation
// Repeat for each interactive element
```

**Step 6: Take screenshots for documentation**

```typescript
mcp__chrome-devtools__take_screenshot({
  format: "png",
  filePath: "docs/triage/screenshots/dashboard-main.png"
})
```

**Step 7: Document dashboard findings**

Add to `APP_HEALTH_TRIAGE.md`:

```markdown
### Dashboard (/)
**Status**: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
**Console Errors**: [count]
**Network Failures**: [count]

**API Calls Verified:**
- ✅ GET /api/profile (200)
- ✅ GET /api/workouts (304)
- [list all with status]

**Interactive Elements Tested:**
- ✅ Profile button → [result]
- ✅ Start Workout → [result]
- [list all with results]

**Issues Found:**
- [P0/P1/P2/P3] Description of issue
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshot: [path]

**Screenshots:**
- Main view: `docs/triage/screenshots/dashboard-main.png`
```

**Step 8: Update summary counts**

Update summary section with total pages tested and any issues found.

---

### Task 3: Test Workout Templates (/templates)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to templates page**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/templates",
  timeout: 30000
})
```

**Step 2: Verify templates loaded**

```typescript
mcp__chrome-devtools__take_snapshot()
// Expected: 8 template cards visible
// - Push Day A/B
// - Pull Day A/B
// - Legs Day A/B
// - Core Day A/B
// Each with exercise lists and equipment tags
```

**Step 3: Check console and network**

```typescript
mcp__chrome-devtools__list_console_messages()
mcp__chrome-devtools__list_network_requests({ pageSize: 20 })
// Expected: GET /api/templates (200 or 304)
```

**Step 4: Test template interactions**

```typescript
// Test clicking a template card
mcp__chrome-devtools__click({ uid: "[push-day-a-uid]" })
// Expected: Navigate to /workout with template pre-selected
// OR: Show template details modal
// Verify behavior matches expectation
```

**Step 5: Test create custom template (if button exists)**

```typescript
// Check snapshot for "Create Template" or "+" button
// Click and verify modal/form appears
// Test form interactions (add exercise, configure)
```

**Step 6: Screenshot templates page**

```typescript
mcp__chrome-devtools__take_screenshot({
  format: "png",
  filePath: "docs/triage/screenshots/templates-main.png"
})
```

**Step 7: Document templates findings**

Similar structure to Task 2, document in `APP_HEALTH_TRIAGE.md`:
- Status, console errors, network failures
- Template cards rendered correctly
- Interactive elements tested
- Issues found with severity
- Screenshots

**Step 8: Update summary**

Increment pages tested count, add any new issues.

---

### Task 4: Test Active Workout Tracker (/workout)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to workout page**

```typescript
// May need to start from dashboard and click "Start Workout"
// OR navigate directly (might show empty state)
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/workout",
  timeout: 30000
})
```

**Step 2: Check if workout is active or needs to be started**

```typescript
mcp__chrome-devtools__take_snapshot()
// Scenarios:
// A) Empty state: "Select template to start workout"
// B) Active workout: Exercise cards, set tracking UI
// C) Error: Page crash or missing data
```

**Step 3: Test starting a workout (if not active)**

```typescript
// If empty state, navigate back to templates and select one
mcp__chrome-devtools__navigate_page({
  type: "back"
})
// Click template to start workout
// Then return to /workout to test
```

**Step 4: Test workout UI elements**

```typescript
// From snapshot, identify and test:
// - Exercise cards/list
// - Add set button
// - Weight/reps input fields
// - Complete set button
// - Exercise navigation
// - Finish workout button
```

**Step 5: Test logging a set (if possible)**

```typescript
// Click "Add Set" or similar
// Fill in weight and reps
mcp__chrome-devtools__fill({ uid: "[weight-input-uid]", value: "135" })
mcp__chrome-devtools__fill({ uid: "[reps-input-uid]", value: "10" })
// Click "Log Set" or similar
// Verify set appears in UI
```

**Step 6: Check for errors during interaction**

```typescript
mcp__chrome-devtools__list_console_messages()
// Important: Check for any errors during set logging
// Common issues: calculation errors, state update issues
```

**Step 7: Screenshot workout states**

```typescript
// Screenshot empty state (if exists)
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/workout-empty.png"
})
// Screenshot active workout
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/workout-active.png"
})
```

**Step 8: Document workout tracker findings**

Document in `APP_HEALTH_TRIAGE.md`:
- Different states tested (empty, active)
- Set logging functionality
- Progressive overload suggestions (if visible)
- Exercise navigation
- Finish workout flow
- Issues with severity

**Step 9: Update summary**

---

### Task 5: Test Profile Page (/profile)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to profile**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/profile",
  timeout: 30000
})
```

**Step 2: Verify profile data displays**

```typescript
mcp__chrome-devtools__take_snapshot()
// Expected fields:
// - Name (editable)
// - Experience level (dropdown/selector)
// - Equipment list (checkboxes/tags)
// - Bodyweight tracking (if implemented)
// - Save/Cancel buttons
```

**Step 3: Test form interactions**

```typescript
// Test editing name
mcp__chrome-devtools__click({ uid: "[name-input-uid]" })
mcp__chrome-devtools__fill({ uid: "[name-input-uid]", value: "Test User" })

// Test changing experience
mcp__chrome-devtools__click({ uid: "[experience-dropdown-uid]" })
mcp__chrome-devtools__click({ uid: "[intermediate-option-uid]" })

// Test toggling equipment
mcp__chrome-devtools__click({ uid: "[dumbbell-checkbox-uid]" })
```

**Step 4: Test save functionality**

```typescript
// Click save button
mcp__chrome-devtools__click({ uid: "[save-button-uid]" })

// Check network for PUT /api/profile
mcp__chrome-devtools__list_network_requests({ pageSize: 10 })
// Expected: PUT /api/profile (200)

// Verify success message or redirect
```

**Step 5: Check console errors**

```typescript
mcp__chrome-devtools__list_console_messages()
```

**Step 6: Screenshot profile page**

```typescript
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/profile-main.png"
})
```

**Step 7: Document profile findings**

---

### Task 6: Test Personal Bests (/personal-bests)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to personal bests**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/personal-bests",
  timeout: 30000
})
```

**Step 2: Verify PB data displays**

```typescript
mcp__chrome-devtools__take_snapshot()
// Expected:
// - List of exercises with PB metrics
// - Best single set
// - Best session volume
// - Rolling average max
// May show "No data" if no workouts logged
```

**Step 3: Check API calls**

```typescript
mcp__chrome-devtools__list_network_requests({ pageSize: 10 })
// Expected: GET /api/personal-bests (200 or 304)
```

**Step 4: Test filtering/sorting (if available)**

```typescript
// Check snapshot for filter/sort controls
// Test if they work
```

**Step 5: Check console**

```typescript
mcp__chrome-devtools__list_console_messages()
```

**Step 6: Screenshot**

```typescript
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/personal-bests.png"
})
```

**Step 7: Document findings**

---

### Task 7: Test Analytics (/analytics)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to analytics**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/analytics",
  timeout: 30000
})
```

**Step 2: Verify charts render**

```typescript
mcp__chrome-devtools__take_snapshot()
// Expected charts (from codebase):
// - Exercise Progression Chart
// - Volume Trends Chart
// - Muscle Capacity Chart
// - Activity Calendar Heatmap
// Check if chart libraries loaded (console errors)
```

**Step 3: Check for chart rendering errors**

```typescript
mcp__chrome-devtools__list_console_messages()
// Common issues: Chart.js errors, data format issues
```

**Step 4: Check network**

```typescript
mcp__chrome-devtools__list_network_requests({ pageSize: 20 })
// May call multiple endpoints for chart data
```

**Step 5: Test chart interactions (if any)**

```typescript
// Hover, click data points, change date ranges
// Verify tooltips, legends work
```

**Step 6: Screenshot each chart**

```typescript
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/analytics-charts.png"
})
```

**Step 7: Document findings**

Focus on:
- Chart rendering success/failure
- Data accuracy (if visible)
- Interactive features
- Performance issues (slow loading)

---

### Task 8: Test Muscle Baselines (/muscle-baselines)

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Navigate to muscle baselines**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/muscle-baselines",
  timeout: 30000
})
```

**Step 2: Verify muscle baseline data**

```typescript
mcp__chrome-devtools__take_snapshot()
// Expected: 13 muscle groups with baselines
// - System learned max
// - User override (editable)
// - Current fatigue %
```

**Step 3: Test editing a baseline**

```typescript
// Click edit button for a muscle
mcp__chrome-devtools__click({ uid: "[edit-pectoralis-uid]" })
// Enter new baseline value
mcp__chrome-devtools__fill({ uid: "[baseline-input-uid]", value: "50000" })
// Save
mcp__chrome-devtools__click({ uid: "[save-baseline-uid]" })

// Check network for update
mcp__chrome-devtools__list_network_requests({ pageSize: 10 })
// Expected: PUT /api/muscle-baselines (200)
```

**Step 4: Check console**

```typescript
mcp__chrome-devtools__list_console_messages()
```

**Step 5: Screenshot**

```typescript
mcp__chrome-devtools__take_screenshot({
  filePath: "docs/triage/screenshots/muscle-baselines.png"
})
```

**Step 6: Document findings**

---

### Task 9: Test Critical User Flows

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**End-to-End Flow: Complete a Workout**

**Step 1: Start from dashboard**

```typescript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/",
  timeout: 30000
})
```

**Step 2: Navigate to templates**

```typescript
// Click "View Templates" or navigate directly
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://fit-forge-ai-studio-production-6b5b.up.railway.app/templates",
  timeout: 30000
})
```

**Step 3: Select a template**

```typescript
// Click "Push Day A" template
mcp__chrome-devtools__click({ uid: "[push-day-a-uid]" })
// Verify navigation to /workout
```

**Step 4: Log a complete set**

```typescript
// Fill in first exercise set
mcp__chrome-devtools__fill({ uid: "[weight-uid]", value: "135" })
mcp__chrome-devtools__fill({ uid: "[reps-uid]", value: "10" })
mcp__chrome-devtools__click({ uid: "[log-set-uid]" })

// Verify set appears in UI
mcp__chrome-devtools__take_snapshot()
```

**Step 5: Finish workout**

```typescript
// Click finish workout
mcp__chrome-devtools__click({ uid: "[finish-workout-uid]" })

// Check network for workout save
mcp__chrome-devtools__list_network_requests({ pageSize: 20 })
// Expected:
// - POST /api/workouts (201)
// - PUT /api/muscle-states (200)
// - PUT /api/personal-bests (200)
// - PUT /api/muscle-baselines (200)
```

**Step 6: Verify redirect to dashboard**

```typescript
// Should return to dashboard with updated stats
mcp__chrome-devtools__take_snapshot()
// Check for updated muscle states, last workout summary
```

**Step 7: Verify workout in history**

```typescript
// Navigate to dashboard, check "Recent Workouts"
// OR navigate to /analytics to see workout logged
```

**Step 8: Document flow results**

Add section to `APP_HEALTH_TRIAGE.md`:

```markdown
## Critical User Flows

### Flow 1: Complete Workout from Template
**Status**: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

**Steps:**
1. Dashboard → Templates → Select "Push Day A" ✅
2. Log set (135 lbs x 10 reps) ✅
3. Finish workout ✅
4. Workout saved to database ✅
5. Muscle states updated ✅
6. Personal bests updated ✅
7. Redirect to dashboard ✅

**Issues:**
- [P0/P1/P2/P3] Description if any failed

**Network Trace:**
[List all API calls made during flow]
```

---

### Task 10: Compile Final Report

**Files:**
- Modify: `docs/triage/APP_HEALTH_TRIAGE.md`

**Step 1: Review all section findings**

Go through each page section and extract issues.

**Step 2: Create issues summary table**

```markdown
## Issues Summary

| ID | Page | Severity | Issue | Status |
|----|------|----------|-------|--------|
| 1 | Dashboard | P1 | Profile button does not open modal | Open |
| 2 | Workout | P2 | Progressive overload suggestions not showing | Open |
| [etc] | | | | |
```

**Step 3: Create recommended actions section**

```markdown
## Recommended Actions

### Immediate (P0/P1)
1. **Fix:** [Issue description]
   - **Impact:** [User impact]
   - **Affected:** [Pages/features]
   - **Suggested fix:** [Technical solution]

### Short-term (P2)
[List medium priority issues]

### Future (P3)
[List low priority issues and enhancements]
```

**Step 4: Add statistics**

```markdown
## Final Summary

**Testing Completed:** 2025-11-07

**Pages Tested:** 8/8
- ✅ Dashboard
- ✅ Workout Templates
- ✅ Active Workout Tracker
- ✅ Profile
- ✅ Personal Bests
- ✅ Analytics
- ✅ Muscle Baselines

**Critical Flows Tested:** 1/1
- ✅ Complete workout from template

**Issues Found:** [total]
- Critical (P0): [count]
- High (P1): [count]
- Medium (P2): [count]
- Low (P3): [count]

**Overall Health:** [Excellent / Good / Fair / Poor]
```

**Step 5: Save final report**

Ensure `docs/triage/APP_HEALTH_TRIAGE.md` is complete and well-formatted.

**Step 6: Create issue tracking document (optional)**

```bash
# Create a separate file for tracking fixes
touch docs/triage/ISSUES_TRACKER.md
```

**Step 7: Commit triage results**

```bash
git add docs/triage/
git commit -m "docs: complete app health triage report

Full end-to-end testing of FitForge production app.
Tested all 8 major routes and critical user flows.
Documented [X] issues across [Y] pages.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Execution Notes

### Prerequisites
- Chrome DevTools MCP server running
- Railway production URL accessible
- User profile exists (or test onboarding flow separately)

### Estimated Time
- Discovery & Setup: 5 minutes
- Dashboard testing: 10 minutes
- Templates testing: 10 minutes
- Workout testing: 15 minutes (most complex)
- Profile testing: 10 minutes
- Personal Bests testing: 10 minutes
- Analytics testing: 15 minutes (multiple charts)
- Muscle Baselines testing: 10 minutes
- End-to-end flow: 15 minutes
- Final report compilation: 10 minutes

**Total:** ~2 hours

### Important Testing Notes

1. **304 Responses are OK**: Railway uses caching, 304 Not Modified is expected for unchanged data
2. **Console Debug Logs**: May see debug logging from development, focus on actual errors
3. **Onboarding Flow**: If testing with fresh user, onboarding wizard may intercept - test separately
4. **Data Persistence**: If testing forms/edits, may want to revert changes after testing
5. **Screenshots**: Save screenshots to `docs/triage/screenshots/` for documentation

### Success Criteria

Triage is complete when:
- ✅ All 8 routes tested
- ✅ At least 1 critical user flow tested end-to-end
- ✅ All console errors documented
- ✅ All network failures documented
- ✅ All interactive elements tested
- ✅ Issues categorized by severity
- ✅ Final report saved with recommendations
- ✅ Results committed to git

---

## Output Artifacts

**Primary:**
- `docs/triage/APP_HEALTH_TRIAGE.md` - Full triage report

**Supporting:**
- `docs/triage/screenshots/` - Visual documentation
- `docs/triage/ISSUES_TRACKER.md` - Optional issue tracking (if created)

**Git Commit:**
- Commit message documenting completion and high-level findings
