# FitForge Muscle Tracking Logic Lab

**Purpose**: Validate, test, and fine-tune all muscle tracking calculations, fatigue models, recovery algorithms, and workout recommendations before implementing in the app.

---

## Table of Contents
1. [Exercise Database Validation](#exercise-database-validation)
2. [Muscle Engagement Percentages](#muscle-engagement-percentages)
3. [Baseline Calculations](#baseline-calculations)
4. [Fatigue Calculation Model](#fatigue-calculation-model)
5. [Recovery Algorithm](#recovery-algorithm)
6. [Workout Recommendations](#workout-recommendations)
7. [Simulation Testing](#simulation-testing)

---

## 1. Exercise Database Validation

### Current Exercise Count: 48 exercises

### Exercises by Category:
- **Push**: 11 exercises
- **Pull**: 15 exercises
- **Legs**: 6 exercises
- **Core**: 5 exercises

### Critical Questions to Answer:
1. Are muscle engagement percentages realistic?
2. Do compound exercises show proper distribution across muscles?
3. Are isolation exercises properly marked as high engagement for target muscle?
4. Do percentages reflect EMG research or are they arbitrary?

### Validation Approach:
For each exercise, verify:
- ✅ Primary muscles have highest engagement (>60%)
- ✅ Secondary muscles have moderate engagement (20-60%)
- ✅ Stabilizers have low engagement (<20%)
- ✅ Total engagement across all muscles makes physiological sense

---

## 2. Muscle Engagement Percentages

### Problem: Current Database Issues

#### Example: Dips (ex33)
```typescript
{
  id: "ex33",
  name: "Dips",
  muscleEngagements: [
    { muscle: Muscle.Triceps, percentage: 88 },      // ⚠️ Too high
    { muscle: Muscle.Pectoralis, percentage: 80 },   // ⚠️ Too high
    { muscle: Muscle.Deltoids, percentage: 40 },
  ],
}
```

**Issue**: 88% + 80% = 168% total engagement. Impossible.

**Reality**:
- Dips are primarily a CHEST exercise (pecs should be 70-80%)
- Triceps are secondary (30-40%)
- This should match what we see in push-ups and bench press ratios

### Proposed Correction Framework

**Question**: What does the percentage actually represent?

**Option A: Percentage of Total Load**
- All percentages must sum to ~100%
- Example: Bench Press = 60% pecs, 20% triceps, 15% delts, 5% core

**Option B: Percentage of Maximum Voluntary Contraction (MVC)**
- Based on EMG studies
- Muscles can exceed 100% in compound movements
- Example: Squats = Quads 85% MVC, Glutes 75% MVC, Hams 60% MVC

**Option C: Fatigue Factor**
- Represents how much this exercise fatigues that muscle
- Used to calculate muscle fatigue percentage
- Can exceed 100% for intensity multipliers

**Current App Behavior**: Appears to use Option C (Fatigue Factor)

### Validation Method

For each exercise, we'll verify engagement percentages by:
1. **Cross-referencing similar exercises**
   - Example: All pressing movements should have similar pec:tricep ratios

2. **Isolation exercise validation**
   - If DB Bicep Curl (isolation) = 72% bicep engagement
   - Then Chin-ups (compound) should NOT show biceps >72% unless intensity multiplier

3. **Prime mover principle**
   - The muscle doing the most work should have highest percentage
   - Dips: Pecs are prime mover, so pecs should be >triceps

---

## 3. Baseline Calculations

### Current Baseline Philosophy

**Definition**: Maximum single-session volume a muscle can handle

### Calculation Method: Isolation Principle

1. **Small muscles** (biceps, triceps, forearms): Use ISOLATION exercises
   - Reasoning: In compounds, they're assisted by larger muscles

2. **Large muscles** (pecs, lats, quads, glutes): Use COMPOUND exercises where they're prime mover
   - Reasoning: They can handle being the main driver

### Kaelen's Current Baselines

```
Pectoralis:   3,400 lb  (Push-ups - 3×15 @ 100 lb = 4,500 lb × 75%)
Triceps:        650 lb  (TRX Tricep Ext - 3×15 @ 60 lb = 1,080 lb × 60%)
Deltoids:     1,500 lb  (DB Shoulder Press - 3×10 @ 40 lb/hand = 2,400 lb × 63%)
Lats:         6,500 lb  (Chin-ups - 3×9 @ 200 lb = 5,400 lb × 120%)
Biceps:       1,300 lb  (DB Bicep Curl - 3×10 @ 30 lb/hand = 1,800 lb × 72%)
Rhomboids:    1,200 lb  (DB Row - 3×10 @ 40 lb/hand = 2,400 lb × 50%)
Trapezius:    2,400 lb  (Shoulder Shrugs - 3×10 @ 52.5 lb/hand = 3,150 lb × 75%)
Forearms:       600 lb  (TRX Pull-ups - 3×10 @ 180 lb = 1,800 lb × 35%)
Quadriceps:   4,800 lb  (Box Step-ups - 3×40 @ 180 lb = 7,200 lb × 67%)
Glutes:       4,400 lb  (Stiff-Leg DL - 3×20 @ 52.5 lb/hand = 6,300 lb × 70%)
Hamstrings:   4,700 lb  (RDL - 3×20 @ 52.5 lb/hand = 6,300 lb × 75%)
Calves:       5,500 lb  (Calf Raises - 3×60 @ 180 lb = 10,800 lb × 51%)
Core:         3,200 lb  (Stiff-Leg DL - 6,300 lb × 50%)
```

### Questions to Answer:
1. Are these baselines realistic for single-session capacity?
2. Should baselines represent:
   - Maximum volume in ONE exercise?
   - Maximum cumulative volume across multiple exercises in a session?
   - 70% of max for sustainable training?

---

## 4. Fatigue Calculation Model

### Current Formula (from WorkoutBuilder.tsx)

```typescript
const volume = plannedSets.reduce((sum, set) =>
  sum + (set.reps * set.weight), 0
);

const engagementFactor = exercise.muscleEngagements.find(
  m => m.muscle === muscle
)?.percentage || 0;

const muscleVolume = (volume * engagementFactor) / 100;
const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
const fatigue = (muscleVolume / effectiveMax) * 100;
```

### Simulation Test Cases

#### Test 1: Single Exercise Fatigue
**Scenario**: Kaelen does 3×10 Dumbbell Bench Press @ 52.5 lb/hand

**Calculation**:
- Total volume: 3 × 10 × 105 lb = 3,150 lb
- Pectoralis engagement: 86%
- Pec volume: 3,150 × 0.86 = 2,709 lb
- Pec baseline: 3,400 lb
- **Fatigue: 2,709 / 3,400 = 79.7%**

**Question**: After one exercise at 80% fatigue, can Kaelen do another chest exercise?

#### Test 2: Multiple Exercise Cumulative Fatigue
**Scenario**: Push day with 3 exercises
1. DB Bench: 3×10 @ 52.5 lb/hand → 2,709 lb pec volume (79.7% fatigue)
2. Incline DB Bench: 3×10 @ 45 lb/hand → 783 lb pec volume (+23% fatigue)
3. Push-ups: 3×15 @ 100 lb → 3,375 lb pec volume (+99.3% fatigue)

**Total Pec Fatigue**: 79.7% + 23% + 99.3% = **202%**

**Question**: Should fatigue be:
- **Additive** (79.7 + 23 + 99.3 = 202%)?
- **Cumulative with diminishing capacity** (each exercise fatigues based on remaining capacity)?
- **Capped at 100%** (can't exceed 100% in one session)?

### Proposed Cumulative Fatigue Model

```typescript
// Option A: Additive (current)
totalFatigue = exercise1Fatigue + exercise2Fatigue + exercise3Fatigue

// Option B: Diminishing Capacity
remainingCapacity = baseline
exercise1Volume = ...
remainingCapacity -= exercise1Volume
fatigue1 = (exercise1Volume / baseline) * 100

exercise2Volume = ...
fatigue2 = (exercise2Volume / remainingCapacity) * 100
remainingCapacity -= exercise2Volume

// Option C: Exponential Fatigue
fatigue = 1 - Math.exp(-totalVolume / baseline)
```

---

## 5. Recovery Algorithm

### Current Formula (from muscleRecovery.ts)

```typescript
const recoveryRate = 0.15; // 15% per day
const currentFatigue = muscleState.fatigue;
const hoursElapsed = (Date.now() - lastWorkoutTime) / (1000 * 60 * 60);
const daysElapsed = hoursElapsed / 24;
const recoveredPercentage = daysElapsed * (recoveryRate * 100);
const newFatigue = Math.max(0, currentFatigue - recoveredPercentage);
```

### Questions:
1. Is 15% flat rate realistic for all muscles?
2. Should small muscles (biceps) recover faster than large muscles (quads)?
3. Should recovery be:
   - **Linear**: 15% per day
   - **Exponential**: Fast at first, slower as you approach 0%
   - **Logarithmic**: Slow at first, faster later

### Proposed Exponential Recovery Model

```typescript
// Based on muscle glycogen replenishment research
const halfLife = 48; // hours (2 days to 50% recovery)
const hoursElapsed = ...
const recoveryFactor = 1 - Math.pow(0.5, hoursElapsed / halfLife);
const newFatigue = initialFatigue * (1 - recoveryFactor);
```

**Example**:
- Start: 100% fatigued
- After 24h: 100% × (1 - 0.293) = 70.7% fatigued (29.3% recovered)
- After 48h: 100% × (1 - 0.5) = 50% fatigued (50% recovered)
- After 72h: 100% × (1 - 0.648) = 35.2% fatigued (64.8% recovered)

---

## 6. Workout Recommendations

### Current Logic (from useWorkoutRecommendations.ts)

```typescript
// Muscle is considered recovered if fatigue < 30%
const recoveredMuscles = Object.entries(muscleStates)
  .filter(([_, state]) => state.fatigue < 30)
  .map(([muscle, _]) => muscle);

// Find exercises that target recovered muscles
const recommendedExercises = EXERCISE_LIBRARY.filter(ex =>
  ex.muscleEngagements.some(eng =>
    recoveredMuscles.includes(eng.muscle) && eng.percentage > 50
  )
);
```

### Questions:
1. Should threshold be 30% or variable based on training goals?
2. Should we recommend exercises targeting:
   - **Fully recovered** muscles (0-30% fatigue)?
   - **Partially recovered** muscles (30-50% fatigue)?
   - **Mixed training** (some fresh, some fatigued)?

### Intelligent Recommendation Algorithm

```typescript
// Categorize muscles by fatigue level
const fresh = fatigueLevel < 20;        // 0-20%
const recovered = fatigueLevel < 40;    // 20-40%
const partial = fatigueLevel < 60;      // 40-60%
const fatigued = fatigueLevel >= 60;    // 60%+

// Recommend based on training philosophy
if (goal === 'hypertrophy') {
  // Target partially recovered muscles (40-60%)
  // Allows for frequency without overtraining
}

if (goal === 'strength') {
  // Target fully fresh muscles (0-20%)
  // Maximum performance on heavy compounds
}

if (goal === 'endurance') {
  // Can train partially fatigued muscles (40-80%)
  // Builds work capacity
}
```

---

## 7. Simulation Testing

### Test Scenarios

#### Scenario 1: Push/Pull/Legs Split

**Day 1 - Push**:
- DB Bench Press: 3×10 @ 52.5 lb/hand
- Incline DB Bench: 3×10 @ 45 lb/hand
- DB Shoulder Press: 3×10 @ 40 lb/hand
- TRX Tricep Extensions: 3×15 @ 60 lb effective

**Expected Results**:
- Pectoralis: ~100% fatigued
- Deltoids: ~100% fatigued
- Triceps: ~100% fatigued

**Day 2 - Pull** (after 24h recovery):
- Expected pec fatigue: ~70%? (needs testing)
- Can we safely train lats/biceps? (should be fresh)

**Simulation Goal**: Verify recovery rates allow for 3-day PPL split

#### Scenario 2: Upper/Lower Split

**Day 1 - Upper**:
- Push exercises: Bench, Shoulder Press
- Pull exercises: Pull-ups, Rows

**Day 2 - Lower** (after 24h):
- Leg exercises: Squats, RDLs, Calf Raises

**Question**: Should upper body be fully recovered after 48h for Day 3 upper session?

#### Scenario 3: Full Body 3x/Week

**Monday - Full Body**:
- Bench Press
- Squats
- Pull-ups
- RDL

**Wednesday - Full Body** (after 48h):
- All muscles should be at ~50% fatigue
- Can we do same workout again?

---

## Next Steps

1. **Validate Exercise Database**
   - Review all 48 exercises
   - Correct muscle engagement percentages
   - Document reasoning for each percentage

2. **Test Fatigue Calculations**
   - Simulate single-exercise fatigue
   - Simulate multi-exercise cumulative fatigue
   - Determine if additive or diminishing model is more accurate

3. **Test Recovery Algorithm**
   - Simulate 24h, 48h, 72h recovery periods
   - Compare linear vs exponential models
   - Validate against real-world training experience

4. **Test Workout Recommendations**
   - Simulate 7-day training week
   - Verify recommendations align with recovery
   - Test different split routines (PPL, Upper/Lower, Full Body)

5. **Create Baseline Validation Tool**
   - Tool to estimate realistic baselines from exercise data
   - Cross-validation between similar exercises
   - Detection of unrealistic engagement percentages

---

## Testing Tools Needed

1. **Exercise Database Validator**
   - Input: Exercise with muscle engagements
   - Output: Validation report, suggested corrections

2. **Fatigue Calculator**
   - Input: Exercise, sets, reps, weight, baseline
   - Output: Muscle fatigue percentages

3. **Recovery Simulator**
   - Input: Initial fatigue, hours elapsed
   - Output: Current fatigue levels

4. **Workout Simulator**
   - Input: List of exercises for a day
   - Output: End-of-day muscle fatigue levels

5. **Weekly Training Simulator**
   - Input: 7-day workout plan
   - Output: Daily fatigue levels, recovery patterns, recommendations

---

## Success Criteria

Before implementing in the app, we must have:

✅ All exercise muscle engagements validated and documented
✅ Fatigue calculation model tested and proven accurate
✅ Recovery algorithm tested and aligned with real-world experience
✅ Workout recommendations tested across multiple training splits
✅ Baseline calculation method validated
✅ Simulation of full training week showing realistic fatigue/recovery patterns

Only after ALL criteria are met do we touch the codebase.
