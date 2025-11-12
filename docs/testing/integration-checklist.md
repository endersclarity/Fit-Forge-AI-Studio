# Integration Testing Checklist

## Purpose

This document provides a manual testing checklist for end-to-end integration testing of FitForge in the local Docker environment. Use this checklist to validate complete user workflows before production deployment.

## Environment Setup

Before running any test scenarios, verify the Docker Compose environment is running correctly.

### Prerequisites

- [ ] Docker Desktop installed and running
- [ ] Project cloned to local machine
- [ ] Terminal/command prompt open at project root

### Start Environment

```bash
# Navigate to project root
cd /path/to/FitForge-Local

# Start Docker Compose services
docker-compose up -d

# Wait 10-15 seconds for services to initialize
```

### Verify Services

- [ ] Run `docker-compose ps` and verify output shows:
  - `fitforge-frontend` status: `Up (healthy)` on port `3000`
  - `fitforge-backend` status: `Up (healthy)` on port `3001`

### Verify Backend Health

```bash
# Test backend health endpoint
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

- [ ] Backend health endpoint returns `{"status":"ok","timestamp":"..."}`

### Verify Frontend Loads

- [ ] Open browser and navigate to `http://localhost:3000`
- [ ] Frontend application loads without errors
- [ ] No console errors in browser DevTools (F12)

---

## Test Scenario 1: Workout Completion

**Goal**: Verify that completing a workout calculates accurate fatigue percentages and saves muscle states.

### Setup

- [ ] Navigate to WorkoutBuilder page (`http://localhost:3000/workout`)
- [ ] Clear any existing workout data (refresh page if needed)

### Test Steps

1. **Log Baseline Workout**

   - [ ] Add Exercise: Goblet Squat
     - [ ] Set 1: 10 reps @ 70 lbs
     - [ ] Set 2: 10 reps @ 70 lbs
     - [ ] Set 3: 10 reps @ 70 lbs
   - [ ] Add Exercise: Romanian Deadlift (RDL)
     - [ ] Set 1: 10 reps @ 100 lbs
     - [ ] Set 2: 10 reps @ 100 lbs
     - [ ] Set 3: 10 reps @ 100 lbs

2. **Complete Workout**

   - [ ] Click "Save Workout" button
   - [ ] Observe loading state appears
   - [ ] Wait for completion confirmation

3. **Verify Fatigue Display**

   - [ ] Navigate to Recovery Dashboard (`http://localhost:3000/recovery`)
   - [ ] Verify fatigue percentages displayed:
     - [ ] Quadriceps: ~15%
     - [ ] Glutes: ~26%
     - [ ] Hamstrings: ~31%
     - [ ] Core: ~21%
     - [ ] Lower Back: ~5%

4. **Verify Database Update**
   ```bash
   # Check muscle_states table
   docker exec fitforge-backend sqlite3 /data/fitforge.db "SELECT muscle_name, fatigue_percent FROM muscle_states WHERE fatigue_percent > 0;"
   ```
   - [ ] Database query returns rows with correct fatigue values

### Expected Results

- [ ] Workout saves successfully
- [ ] Fatigue calculations match expected values (±2% tolerance)
- [ ] Recovery Dashboard displays updated muscle states
- [ ] No errors in browser console or backend logs

---

## Test Scenario 2: Baseline Exceeded

**Goal**: Verify that exceeding muscle baseline volume triggers baseline update modal.

### Setup

- [ ] Navigate to WorkoutBuilder page (`http://localhost:3000/workout`)
- [ ] Clear any existing workout data (refresh database if needed)

### Test Steps

1. **Log Extreme Workout (Exceeds Hamstrings Baseline)**

   - [ ] Add Exercise: Romanian Deadlift (RDL)
     - [ ] Set 1: 15 reps @ 300 lbs
     - [ ] Set 2: 15 reps @ 300 lbs
     - [ ] Set 3: 15 reps @ 300 lbs

2. **Complete Workout**

   - [ ] Click "Save Workout" button
   - [ ] Observe loading state appears

3. **Verify Baseline Update Modal**

   - [ ] Modal appears with title "Update Baseline?"
   - [ ] Modal shows Hamstrings muscle
   - [ ] Current baseline displayed: 5,200
   - [ ] Suggested baseline displayed: > 5,200
   - [ ] Volume achieved displayed: ~6,075

4. **Test Modal Actions**
   - [ ] Click "Accept" button
   - [ ] Verify baseline updated in database
   - [ ] OR Click "Dismiss" button
   - [ ] Verify baseline unchanged

### Expected Results

- [ ] Baseline update modal triggers when baseline exceeded
- [ ] Modal displays correct muscle, current baseline, and suggested baseline
- [ ] Accept button updates baseline correctly
- [ ] Dismiss button keeps baseline unchanged

---

## Test Scenario 3: Recovery Timeline

**Goal**: Verify that recovery timeline displays current state and accurate projections.

### Setup

- [ ] Complete Test Scenario 1 (Workout Completion) to generate fatigue
- [ ] Navigate to Recovery Dashboard (`http://localhost:3000/recovery`)

### Test Steps

1. **View Current Recovery State**

   - [ ] Recovery Dashboard displays current fatigue for all muscles
   - [ ] Muscles with fatigue > 0 are highlighted or marked
   - [ ] Fatigue percentages match expected values from workout

2. **Verify 24h Projection**

   - [ ] Navigate to or view "24 Hours" projection section
   - [ ] Verify projected fatigue values:
     - [ ] Hamstrings: ~16% (31% - 15% recovery)
     - [ ] Glutes: ~11% (26% - 15% recovery)
     - [ ] Quadriceps: ~0% (fully recovered in 24h)

3. **Verify 48h Projection**

   - [ ] Navigate to or view "48 Hours" projection section
   - [ ] Verify projected fatigue values:
     - [ ] Hamstrings: ~1% (31% - 30% recovery)
     - [ ] Glutes: ~0% (fully recovered in 48h)
     - [ ] Quadriceps: 0%

4. **Verify 72h Projection**
   - [ ] Navigate to or view "72 Hours" projection section
   - [ ] Verify all muscles show 0% fatigue (fully recovered)

### Expected Results

- [ ] Current state matches workout completion fatigue
- [ ] 24h projection shows 15% recovery
- [ ] 48h projection shows 30% total recovery
- [ ] 72h projection shows full recovery (0% fatigue)
- [ ] Recovery rate is accurate (15% per day)

---

## Test Scenario 4: Exercise Recommendations

**Goal**: Verify that exercise recommendations are ranked correctly based on fatigue state.

### Setup

- [ ] Complete a workout targeting chest and shoulders (create specific fatigue)
- [ ] Navigate to Exercise Recommendations page (`http://localhost:3000/recommendations`)

### Test Steps

1. **Select Target Muscle**

   - [ ] Select "Quadriceps" from target muscle dropdown
   - [ ] (Quadriceps should be fresh after chest/shoulders workout)

2. **Filter by Equipment**

   - [ ] Select available equipment: "Dumbbells"
   - [ ] Optionally select "Bodyweight"

3. **View Recommendations**

   - [ ] Recommendations list appears
   - [ ] Exercises are ranked by score (0-100)
   - [ ] Top recommendations target Quadriceps
   - [ ] Each recommendation displays:
     - [ ] Exercise name
     - [ ] Total score
     - [ ] Target match score
     - [ ] Freshness score
     - [ ] Equipment availability score
     - [ ] Synergy score
     - [ ] Bottleneck penalty score

4. **Verify Ranking Logic**
   - [ ] Fresh muscles (Quadriceps) have high freshness scores (>70)
   - [ ] Fatigued muscles (Chest/Shoulders) have low freshness scores (<30)
   - [ ] Exercises matching target muscle have high target match scores (>50)

### Expected Results

- [ ] Recommendations are returned and displayed
- [ ] Ranking prioritizes fresh muscles and target match
- [ ] 5-factor scoring structure is visible
- [ ] Top recommendations make sense given fatigue state
- [ ] No bottleneck warnings for fresh muscle groups

---

## Test Scenario 5: Workout Forecast

**Goal**: Verify that planned workouts show real-time fatigue forecasts.

### Setup

- [ ] Navigate to WorkoutBuilder page (`http://localhost:3000/workout`)
- [ ] Ensure "Planning Mode" is enabled (toggle switch)

### Test Steps

1. **Plan First Exercise**

   - [ ] Add Exercise: Dumbbell Bench Press
     - [ ] Set 1: 10 reps @ 50 lbs
     - [ ] Set 2: 10 reps @ 50 lbs
     - [ ] Set 3: 10 reps @ 50 lbs

2. **View Real-Time Forecast**

   - [ ] Observe forecast panel updates automatically
   - [ ] Forecast shows predicted fatigue:
     - [ ] Pectoralis: ~25.5%
     - [ ] Anterior Deltoid: ~15%
     - [ ] Triceps: ~10%

3. **Add Second Exercise**

   - [ ] Add Exercise: Pull-ups
     - [ ] Set 1: 8 reps @ 180 lbs (bodyweight)
     - [ ] Set 2: 8 reps @ 180 lbs
     - [ ] Set 3: 8 reps @ 180 lbs

4. **Verify Cumulative Forecast**

   - [ ] Forecast updates to show combined fatigue
   - [ ] Forecast shows:
     - [ ] Pectoralis: ~25.5% (from bench)
     - [ ] Lats: ~19.8% (from pull-ups)
     - [ ] Biceps: ~8% (from pull-ups)

5. **Test Forecast Responsiveness**
   - [ ] Change weight or reps on any exercise
   - [ ] Observe forecast updates within 500ms (debounced)
   - [ ] Verify forecast recalculates correctly

### Expected Results

- [ ] Forecast updates in real-time as exercises are added/modified
- [ ] Predicted fatigue percentages are accurate (±5% tolerance)
- [ ] Volume added is displayed for each muscle
- [ ] Forecast helps user plan balanced workouts
- [ ] No performance issues or lag during updates

---

## Environment Teardown

After completing all test scenarios, stop the Docker Compose environment.

```bash
# Stop services but keep data
docker-compose down

# OR stop services and remove volumes (clean slate)
docker-compose down -v
```

---

## Test Results Summary

### Overall Status

- [ ] All test scenarios passed
- [ ] Some scenarios failed (document below)
- [ ] Environment issues encountered (document below)

### Failures/Issues

Document any failures, errors, or unexpected behavior:

```
[Write notes here]
```

### Notes

Additional observations or recommendations:

```
[Write notes here]
```

---

## Automated Integration Tests

These manual scenarios have corresponding automated integration tests:

- `backend/__tests__/integration/workout-completion.test.ts`
- `backend/__tests__/integration/recovery-timeline.test.ts`
- `backend/__tests__/integration/exercise-recommendations.test.ts`
- `backend/__tests__/integration/workout-forecast.test.ts`

Run automated tests with:

```bash
npm test
```
