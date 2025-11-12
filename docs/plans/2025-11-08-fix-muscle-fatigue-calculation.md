# Fix Muscle Fatigue Calculation Bug Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Debug and fix muscle fatigue calculation showing 80% instead of expected 4.6% after one set of exercise

**Architecture:** Add comprehensive logging to trace workout completion flow, verify baseline retrieval, validate fatigue calculation logic, and ensure frontend displays correct values from backend

**Tech Stack:** TypeScript, Express.js backend, React frontend, better-sqlite3 database

**Reference:** Investigation found in triage session 2025-11-08

---

## Task 1: Add Debug Logging to Workout Completion Endpoint

**Files:**
- Modify: `backend/server.ts` (locate workout POST endpoint)
- Modify: `backend/database/analytics.ts:647-889`

**Step 1: Find the workout completion endpoint**

Search for the endpoint that handles workout completion:

```bash
grep -n "POST.*workout" backend/server.ts
```

Expected: Line number of workout POST endpoint

**Step 2: Add logging at workout save**

In `backend/server.ts`, add logging right after workout is saved:

```typescript
// After workout save succeeds
console.log('[DEBUG] Workout saved:', {
  workoutId: savedWorkout.id,
  date: savedWorkout.date,
  exerciseCount: workout.exercises.length
});
```

**Step 3: Add logging in calculateWorkoutMetrics function**

In `backend/database/analytics.ts:647`, add logging at the start:

```typescript
export function calculateWorkoutMetrics(workoutId: number): CalculatedMetricsResponse {
  console.log('[DEBUG] calculateWorkoutMetrics called:', { workoutId });

  // Existing code...
  const workout = db.prepare(`...`).get(workoutId) as any;

  console.log('[DEBUG] Workout fetched:', {
    id: workout?.id,
    date: workout?.date,
    found: !!workout
  });
```

**Step 4: Add logging in volume calculation**

In `backend/database/analytics.ts:692-704`, add logging after volume calculation:

```typescript
Object.entries(exercisesByName).forEach(([exerciseName, sets]) => {
  const exerciseInfo = SHARED_EXERCISE_LIBRARY.find(e => e.name === exerciseName);
  if (!exerciseInfo) {
    console.warn(`Exercise not found in library: ${exerciseName}`);
    return;
  }

  const exerciseVolume = sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);

  console.log('[DEBUG] Exercise volume calculated:', {
    exercise: exerciseName,
    totalVolume: exerciseVolume,
    sets: sets.length,
    muscleEngagements: exerciseInfo.muscleEngagements.map(e => `${e.muscle}:${e.percentage}%`)
  });

  exerciseInfo.muscleEngagements.forEach(engagement => {
    const volumeApplied = exerciseVolume * (engagement.percentage / 100);
    workoutMuscleVolumes[engagement.muscle] += volumeApplied;

    console.log('[DEBUG] Volume applied to muscle:', {
      muscle: engagement.muscle,
      engagement: engagement.percentage,
      volumeApplied,
      runningTotal: workoutMuscleVolumes[engagement.muscle]
    });
  });
});
```

**Step 5: Add logging in fatigue calculation**

In `backend/database/analytics.ts:728-733`, add detailed logging:

```typescript
Object.entries(workoutMuscleVolumes).forEach(([muscle, volume]) => {
  if (volume <= 0) return;

  const baseline = baselineMap[muscle]?.userOverride || baselineMap[muscle]?.systemLearnedMax || 10000;
  const fatiguePercent = Math.min((volume / baseline) * 100, 100);
  muscleFatigue[muscle] = fatiguePercent;

  console.log('[DEBUG] Fatigue calculated:', {
    muscle,
    volume,
    baseline,
    baselineSource: baselineMap[muscle]?.userOverride ? 'userOverride' : 'systemLearnedMax',
    fatiguePercent,
    formula: `(${volume} / ${baseline}) * 100 = ${fatiguePercent}`
  });
```

**Step 6: Commit logging additions**

```bash
git add backend/server.ts backend/database/analytics.ts
git commit -m "debug: add comprehensive logging to workout metrics calculation

Added debug logs to trace:
- Workout save confirmation
- Exercise volume calculation
- Muscle engagement application
- Baseline retrieval
- Fatigue percentage calculation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Test Workout Completion with Logging

**Files:**
- Manual testing only

**Step 1: Restart backend to pick up logging**

```bash
docker-compose restart fitforge-backend
```

Expected: Backend restarts successfully

**Step 2: Watch backend logs**

```bash
docker logs -f fitforge-backend
```

Expected: Log stream starts

**Step 3: Complete a test workout via frontend**

Manual steps:
1. Open http://localhost:3000
2. Click "Plan Workout"
3. Add 1 set: Dumbbell Bench Press, 8 reps, 100 lbs
4. Click "Start Workout"
5. Click "LOG SET"
6. Click "Finish Workout"

**Step 4: Capture log output**

Expected logs to appear:
- `[DEBUG] Workout saved: { workoutId: X, ... }`
- `[DEBUG] calculateWorkoutMetrics called: { workoutId: X }`
- `[DEBUG] Exercise volume calculated: { exercise: 'Dumbbell Bench Press', totalVolume: 800, ... }`
- `[DEBUG] Volume applied to muscle: { muscle: 'Pectoralis', engagement: 86, volumeApplied: 688, ... }`
- `[DEBUG] Fatigue calculated: { muscle: 'Pectoralis', volume: 688, baseline: ???, fatiguePercent: ??? }`

**Step 5: Document actual values**

Create a file with the actual log output:

```bash
# Save to temporary file for analysis
cat > /tmp/fatigue-debug-output.txt << 'EOF'
[paste actual log output here]
EOF
```

**Step 6: Analyze the baseline value**

Look at the `[DEBUG] Fatigue calculated` log for Pectoralis:
- What is the `baseline` value?
- What is the `baselineSource`?
- What is the `fatiguePercent`?

Expected: This will reveal whether baseline is 15000 (correct) or ~860 (buggy)

---

## Task 3: Verify Baseline Initialization

**Files:**
- Check: `backend/database/database.ts` (baseline initialization)
- Check: `backend/server.ts` (muscle baselines endpoint)

**Step 1: Check baseline initialization code**

```bash
grep -A 20 "CREATE TABLE.*muscle_baselines" backend/database/database.ts
```

Expected: Table schema and any default initialization

**Step 2: Check if baselines are initialized on first run**

Search for baseline initialization logic:

```bash
grep -n "INSERT INTO muscle_baselines" backend/database/database.ts
```

Expected: Location of baseline initialization or confirmation it doesn't exist

**Step 3: Query actual database values**

Add a test endpoint to verify database state:

In `backend/server.ts`, add temporary debug endpoint:

```typescript
app.get('/api/debug/baselines', (req, res) => {
  try {
    const baselines = db.prepare(`
      SELECT muscle_name, system_learned_max, user_override, updated_at
      FROM muscle_baselines
      WHERE user_id = 1
      ORDER BY muscle_name
    `).all();

    res.json({
      count: baselines.length,
      baselines,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**Step 4: Restart backend and query debug endpoint**

```bash
docker-compose restart fitforge-backend
curl http://localhost:3001/api/debug/baselines | python -m json.tool
```

Expected: Full list of baselines with actual database values

**Step 5: Compare API response to database**

Compare the output of:
- `/api/debug/baselines` (raw database)
- `/api/muscle-baselines` (through API)

Expected: Should match exactly

**Step 6: Commit debug endpoint**

```bash
git add backend/server.ts
git commit -m "debug: add temporary endpoint to inspect baseline database state

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Check Frontend Fatigue Calculation

**Files:**
- Check: `components/Dashboard.tsx` (or wherever muscle cards are rendered)

**Step 1: Find muscle card rendering code**

```bash
grep -r "Pectoralis\|muscle.*fatigue\|baseline" components/ --include="*.tsx" -n
```

Expected: File(s) that render muscle fatigue cards

**Step 2: Read the Dashboard component**

Read the file to understand how it fetches and displays muscle data:

```bash
cat components/Dashboard.tsx | head -200
```

Expected: Understanding of data flow

**Step 3: Check if frontend calculates fatigue**

Search for fatigue calculation in frontend:

```bash
grep -r "fatiguePercent\|/ baseline\|\* 100" components/ --include="*.tsx" -n
```

Expected: Location of any frontend fatigue calculations

**Step 4: Verify data source**

Look for API calls to muscle-states or muscle-baselines:

```bash
grep -r "muscle-states\|muscle-baselines" components/ --include="*.tsx" -A 5
```

Expected: How dashboard fetches muscle data

**Step 5: Add console logging to frontend**

In the Dashboard component where muscle data is fetched/displayed, add:

```typescript
useEffect(() => {
  // After fetching muscle data
  console.log('[FRONTEND DEBUG] Muscle data received:', {
    muscleStates,
    muscleBaselines,
    timestamp: new Date().toISOString()
  });
}, [muscleStates, muscleBaselines]);
```

**Step 6: Commit frontend logging**

```bash
git add components/Dashboard.tsx
git commit -m "debug: add frontend logging for muscle data

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Test Complete Flow with Both Logs

**Files:**
- Manual testing only

**Step 1: Restart both frontend and backend**

```bash
docker-compose restart
```

Expected: Both containers restart

**Step 2: Open browser console and backend logs**

Terminal 1:
```bash
docker logs -f fitforge-backend
```

Browser: Open DevTools Console (F12)

**Step 3: Complete test workout again**

1. Navigate to http://localhost:3000
2. Open browser console (F12)
3. Plan and complete 1 set of Dumbbell Bench Press (8 reps × 100 lbs)
4. Finish workout
5. Navigate to Dashboard

**Step 4: Capture both log streams**

Backend logs should show:
- Workout save
- Volume calculation
- Baseline retrieval
- Fatigue calculation

Frontend logs should show:
- Muscle data received
- Values being displayed

**Step 5: Compare backend calculation to frontend display**

Look for discrepancies:
- Backend calculates: `fatiguePercent: X`
- Frontend displays: `Y% fatigued`
- Do X and Y match?

**Step 6: Document findings**

Create analysis document:

```bash
cat > docs/analysis/muscle-fatigue-bug-analysis.md << 'EOF'
# Muscle Fatigue Bug Analysis

## Test Scenario
- Exercise: Dumbbell Bench Press
- Sets: 1 × 8 reps × 100 lbs = 800 lbs total
- Expected Pectoralis volume: 800 × 0.86 = 688 lbs

## Backend Logs
[paste backend logs]

## Frontend Logs
[paste frontend logs]

## Discrepancies Found
[list any mismatches]

## Root Cause
[identified issue]

## Fix Required
[what needs to change]
EOF
```

---

## Task 6: Implement the Fix

**Files:**
- TBD based on findings from Task 5

**Note:** This task's implementation depends on what the root cause is. Common scenarios:

**Scenario A: Baseline not initialized properly**
- Fix: Initialize baselines to 10000 on first user creation
- File: `backend/database/database.ts`

**Scenario B: Fatigue calculation using wrong baseline**
- Fix: Ensure baseline retrieval logic is correct
- File: `backend/database/analytics.ts:731`

**Scenario C: Frontend calculating fatigue incorrectly**
- Fix: Use backend-provided fatigue percentage directly
- File: `components/Dashboard.tsx`

**Scenario D: Race condition - workout saved but metrics not calculated**
- Fix: Ensure calculateWorkoutMetrics is called synchronously after workout save
- File: `backend/server.ts` (workout POST endpoint)

**Step 1: Identify root cause from analysis**

Review `docs/analysis/muscle-fatigue-bug-analysis.md`

**Step 2: Implement targeted fix**

[Specific fix based on root cause - will be determined during execution]

**Step 3: Test the fix**

Complete workout again and verify:
- Backend logs show correct calculation
- Frontend displays correct percentage
- Math checks out: (688 / 15000) × 100 ≈ 4.6%

**Step 4: Commit the fix**

```bash
git add [affected files]
git commit -m "fix: muscle fatigue calculation showing incorrect percentage

Root cause: [describe what was wrong]
Fix: [describe what changed]

Verified with test workout:
- Exercise: Dumbbell Bench Press (8 reps × 100 lbs)
- Expected: 4.6% fatigue
- Actual: 4.6% fatigue ✓

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Remove Debug Logging

**Files:**
- Modify: `backend/server.ts`
- Modify: `backend/database/analytics.ts`
- Modify: `components/Dashboard.tsx`

**Step 1: Remove backend debug logging**

Remove all `console.log('[DEBUG]` statements added in Task 1:

In `backend/server.ts`:
- Remove workout save logging

In `backend/database/analytics.ts`:
- Remove calculateWorkoutMetrics logging
- Remove volume calculation logging
- Remove fatigue calculation logging

**Step 2: Remove debug endpoint**

In `backend/server.ts`, remove the `/api/debug/baselines` endpoint

**Step 3: Remove frontend debug logging**

In `components/Dashboard.tsx`, remove the console.log statements

**Step 4: Test without debug logs**

```bash
docker-compose restart
```

Complete a test workout and verify:
- No debug logs appear
- Fatigue still calculates correctly
- Dashboard displays correctly

**Step 5: Commit cleanup**

```bash
git add backend/server.ts backend/database/analytics.ts components/Dashboard.tsx
git commit -m "chore: remove debug logging for muscle fatigue

Debug session complete. Issue resolved.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add changelog entry**

Prepend to CHANGELOG.md:

```markdown
## [Unreleased] - 2025-11-08

### Fixed
- **Muscle Fatigue Calculation Bug** - Fixed incorrect fatigue percentage display
  - File: [will be determined during execution based on root cause]
  - Issue: After 1 set of Dumbbell Bench Press (8 reps × 100 lbs), showed 80% fatigue instead of 4.6%
  - Root cause: [describe based on findings]
  - Fix: [describe the fix]
  - Impact: Users now see accurate muscle fatigue percentages
  - Calculation: (volume / baseline) × 100 = fatigue%
  - Test case: 688 lbs / 15,000 lbs × 100 = 4.6% ✓

---

```

**Step 2: Commit changelog**

```bash
git add CHANGELOG.md
git commit -m "docs: add changelog entry for muscle fatigue fix

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Push to Production

**Files:**
- N/A

**Step 1: Push all commits**

```bash
git push origin main
```

Expected: All commits pushed to GitHub

**Step 2: Wait for Railway deployment**

Wait 2-3 minutes for automatic deployment

**Step 3: Test in production**

1. Navigate to production URL
2. Complete test workout: 1 set Dumbbell Bench Press (8 reps × 100 lbs)
3. Check Dashboard
4. Verify Pectoralis shows ~4.6% fatigue (not 80%)

**Step 4: Verify fix in production**

Expected:
- Fatigue calculation is correct
- No debug logs in production
- Dashboard displays accurate percentages

---

## Summary

**Total Tasks:** 9
**Estimated Time:** 2-3 hours
**Risk Level:** Low (debugging and targeted fix)

**Testing Strategy:**
- Add comprehensive debug logging
- Trace complete workout flow
- Compare backend calculation to frontend display
- Identify root cause
- Implement targeted fix
- Verify with test workouts
- Remove debug logging
- Test in production

**Key Investigation Points:**
1. Is baseline initialized correctly? (should be 10,000-15,000)
2. Is fatigue calculation using correct baseline? (check retrieval)
3. Is frontend calculating or just displaying? (should only display)
4. Is there a race condition? (metrics calculated after workout save?)

**Rollback Plan:**
If issues arise:
```bash
git revert HEAD~N  # where N is number of commits to revert
git push origin main
```

**Success Criteria:**
- [ ] Backend logs show correct volume calculation (800 lbs → 688 lbs for Pectoralis)
- [ ] Backend logs show correct baseline (15,000 lbs)
- [ ] Backend logs show correct fatigue (4.6%)
- [ ] Frontend displays correct fatigue (4.6%)
- [ ] Math verified: (688 / 15000) × 100 = 4.58% ≈ 4.6%
- [ ] Production deployment shows correct values
