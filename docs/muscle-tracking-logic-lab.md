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

## 8. PROPOSED CORRECTIONS: Exercise Database Overhaul

### 🚨 CRITICAL ISSUE IDENTIFIED

**Current State**: 38 out of 40 exercises have muscle engagement percentages that DON'T add up to 100%.

**Root Cause**: Percentages were not properly calibrated to represent load distribution.

**Solution**: All muscle engagement percentages must represent the **distribution of total work** and sum to **~100%**.

---

### Proposed Corrections by Category

#### PUSH EXERCISES (11 total)

##### ex02: Dumbbell Bench Press
**Current**: 86% + 15% + 24% = **125% ❌**
```typescript
// CURRENT (WRONG)
{ Pectoralis: 86%, Triceps: 15%, Deltoids: 24% }

// PROPOSED (CORRECT)
{ Pectoralis: 65%, Triceps: 22%, Deltoids: 10%, Core: 3% }
```
**Reasoning**: Flat bench is primarily chest, with significant tricep involvement. Delts are stabilizers.

---

##### ex38: Single Arm Dumbbell Bench Press
**Current**: 85% + 15% + 24% + 35% = **159% ❌**
```typescript
// CURRENT (WRONG)
{ Pectoralis: 85%, Triceps: 15%, Deltoids: 24%, Core: 35% }

// PROPOSED (CORRECT)
{ Pectoralis: 55%, Triceps: 20%, Deltoids: 8%, Core: 17% }
```
**Reasoning**: Single-arm adds significant core stability demand, reduces pec percentage proportionally.

---

##### ex03: Push-up
**Current**: 75% + 75% + 30% + 35% = **215% ❌**
```typescript
// CURRENT (WRONG)
{ Pectoralis: 75%, Triceps: 75%, Deltoids: 30%, Core: 35% }

// PROPOSED (CORRECT)
{ Pectoralis: 50%, Triceps: 35%, Deltoids: 10%, Core: 5% }
```
**Reasoning**: Push-ups distribute load more evenly between pecs/triceps than bench press. More tricep emphasis than bench.

---

##### ex05: Dumbbell Shoulder Press
**Current**: 63% + 30% + 40% = **133% ❌**
```typescript
// CURRENT (WRONG)
{ Deltoids: 63%, Pectoralis: 30%, Triceps: 40% }

// PROPOSED (CORRECT)
{ Deltoids: 60%, Triceps: 25%, Pectoralis: 10%, Core: 5% }
```
**Reasoning**: Shoulder press is deltoid-dominant. Triceps are secondary movers. Pecs are minimal stabilizers.

---

##### ex29: TRX Reverse Flys
**Current**: 60% + 40% + 40% = **140% ❌**
```typescript
// CURRENT (WRONG)
{ Deltoids: 60%, Trapezius: 40%, Rhomboids: 40% }

// PROPOSED (CORRECT)
{ Deltoids: 45%, Rhomboids: 30%, Trapezius: 20%, Core: 5% }
```
**Reasoning**: Reverse flys target rear delts primarily, with upper back assisting.

---

##### ex30: Tricep Extension
**Current**: 77% = **77% ❌** (Missing stabilizers)
```typescript
// CURRENT (WRONG)
{ Triceps: 77% }

// PROPOSED (CORRECT)
{ Triceps: 90%, Deltoids: 7%, Core: 3% }
```
**Reasoning**: Isolation exercise, but shoulders stabilize and core engages minimally.

---

##### ex40: TRX Tricep Extension
**Current**: 60% + 25% = **85% ❌**
```typescript
// CURRENT (WRONG)
{ Triceps: 60%, Core: 25% }

// PROPOSED (CORRECT)
{ Triceps: 70%, Core: 25%, Deltoids: 5% }
```
**Reasoning**: TRX adds instability, increasing core demand. Close to correct, just needed small adjustment.

---

##### ex31: TRX Pushup
**Current**: 109% + 42% + 50% + 40% = **241% ❌**
```typescript
// CURRENT (WRONG)
{ Pectoralis: 109%, Triceps: 42%, Deltoids: 50%, Core: 40% }

// PROPOSED (CORRECT)
{ Pectoralis: 48%, Triceps: 32%, Core: 12%, Deltoids: 8% }
```
**Reasoning**: TRX instability increases difficulty but doesn't change muscle distribution drastically. Similar to regular push-ups with more core.

---

##### ex32: Incline Dumbbell Bench Press
**Current**: 29% + 15% + 32% = **76% ❌** (Way too low for pecs!)
```typescript
// CURRENT (WRONG)
{ Pectoralis: 29%, Triceps: 15%, Deltoids: 32% }

// PROPOSED (CORRECT)
{ Pectoralis: 55%, Deltoids: 25%, Triceps: 17%, Core: 3% }
```
**Reasoning**: Incline shifts emphasis to upper pecs and front delts. Still chest-dominant. Current 29% pecs is absurd.

---

##### ex39: Single Arm Incline Dumbbell Bench Press
**Current**: 29% + 15% + 32% + 35% = **111% ❌**
```typescript
// CURRENT (WRONG)
{ Pectoralis: 29%, Triceps: 15%, Deltoids: 32%, Core: 35% }

// PROPOSED (CORRECT)
{ Pectoralis: 45%, Deltoids: 22%, Core: 20%, Triceps: 13% }
```
**Reasoning**: Single-arm adds rotational stability demand. Still primarily chest/shoulder movement.

---

##### ex33: Dips
**Current**: 88% + 80% + 40% = **208% ❌** (Called out in doc!)
```typescript
// CURRENT (WRONG)
{ Triceps: 88%, Pectoralis: 80%, Deltoids: 40% }

// PROPOSED (CORRECT)
{ Pectoralis: 50%, Triceps: 35%, Deltoids: 13%, Core: 2% }
```
**Reasoning**: Dips are chest-dominant when torso leans forward. Triceps are heavily involved. Delts are stabilizers.

---

##### ex34: Kettlebell Press
**Current**: 58% + 30% + 25% = **113% ❌**
```typescript
// CURRENT (WRONG)
{ Deltoids: 58%, Pectoralis: 30%, Core: 25% }

// PROPOSED (CORRECT)
{ Deltoids: 58%, Triceps: 23%, Core: 12%, Pectoralis: 7% }
```
**Reasoning**: Similar to DB shoulder press, but kettlebell grip adds instability. Close to correct.

---

#### PULL EXERCISES (15 total)

##### ex06: Pull-up
**Current**: 120% + 87% + 50% + 25% = **282% ❌** (Lats over 100%!)
```typescript
// CURRENT (WRONG)
{ Lats: 120%, Biceps: 87%, Rhomboids: 50%, Forearms: 25% }

// PROPOSED (CORRECT)
{ Lats: 55%, Biceps: 25%, Rhomboids: 12%, Forearms: 8% }
```
**Reasoning**: Pull-ups are lat-dominant with significant bicep involvement. No single muscle can exceed 100%.

---

##### ex07: Dumbbell Bicep Curl
**Current**: 72% + 15% = **87% ❌**
```typescript
// CURRENT (WRONG)
{ Biceps: 72%, Forearms: 15% }

// PROPOSED (CORRECT)
{ Biceps: 85%, Forearms: 12%, Core: 3% }
```
**Reasoning**: Isolation exercise. Biceps do the vast majority of work.

---

##### ex09: Dumbbell Row
**Current**: 55% + 50% + 50% + 30% = **185% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 55%, Trapezius: 50%, Rhomboids: 50%, Biceps: 30% }

// PROPOSED (CORRECT)
{ Lats: 40%, Rhomboids: 25%, Trapezius: 20%, Biceps: 12%, Core: 3% }
```
**Reasoning**: Rows distribute work across entire back. Lats are primary, upper back assists, biceps secondary.

---

##### ex18: Dumbbell Upright Row
**Current**: 70% + 65% + 30% = **165% ❌**
```typescript
// CURRENT (WRONG)
{ Trapezius: 70%, Deltoids: 65%, Biceps: 30% }

// PROPOSED (CORRECT)
{ Trapezius: 45%, Deltoids: 35%, Biceps: 17%, Core: 3% }
```
**Reasoning**: Upright rows target traps and medial delts. Both heavily involved. Biceps assist.

---

##### ex19: TRX Bicep Curl
**Current**: 65% + 25% = **90% ❌**
```typescript
// CURRENT (WRONG)
{ Biceps: 65%, Core: 25% }

// PROPOSED (CORRECT)
{ Biceps: 70%, Core: 20%, Forearms: 7%, Lats: 3% }
```
**Reasoning**: TRX adds core stability. Close to correct.

---

##### ex20: Chin-Ups
**Current**: 120% + 87% + 51% = **258% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 120%, Biceps: 87%, Pectoralis: 51% }

// PROPOSED (CORRECT)
{ Lats: 50%, Biceps: 30%, Pectoralis: 12%, Rhomboids: 8% }
```
**Reasoning**: Chin-ups (underhand) shift more emphasis to biceps than pull-ups. Pecs engage more due to grip.

---

##### ex21: Face Pull
**Current**: 55% + 55% + 55% = **165% ❌**
```typescript
// CURRENT (WRONG)
{ Deltoids: 55%, Trapezius: 55%, Rhomboids: 55% }

// PROPOSED (CORRECT)
{ Deltoids: 40%, Rhomboids: 35%, Trapezius: 22%, Core: 3% }
```
**Reasoning**: Face pulls target rear delts and rhomboids. Upper traps engage less.

---

##### ex22: Concentration Curl
**Current**: 85% = **85% ❌**
```typescript
// CURRENT (WRONG)
{ Biceps: 85% }

// PROPOSED (CORRECT)
{ Biceps: 90%, Forearms: 8%, Core: 2% }
```
**Reasoning**: Pure isolation. Biceps do almost all the work. Braced position minimizes core.

---

##### ex23: Shoulder Shrugs
**Current**: 75% = **75% ❌**
```typescript
// CURRENT (WRONG)
{ Trapezius: 75% }

// PROPOSED (CORRECT)
{ Trapezius: 85%, Forearms: 10%, Core: 5% }
```
**Reasoning**: Isolation for traps. Forearms grip, core stabilizes.

---

##### ex25: Incline Hammer Curl
**Current**: 70% + 30% = **100% ✅** (ONE OF ONLY TWO CORRECT!)
```typescript
// CURRENT (CORRECT)
{ Biceps: 70%, Forearms: 30% }

// PROPOSED (KEEP AS-IS)
{ Biceps: 70%, Forearms: 30% }
```
**Reasoning**: Already correct! Hammer grip shifts some work to forearms/brachialis.

---

##### ex26: Neutral Grip Pull-ups
**Current**: 120% + 87% + 37% = **244% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 120%, Biceps: 87%, Trapezius: 37% }

// PROPOSED (CORRECT)
{ Lats: 52%, Biceps: 28%, Trapezius: 13%, Forearms: 7% }
```
**Reasoning**: Neutral grip is between pull-ups and chin-ups. Balanced lat/bicep involvement.

---

##### ex28: Renegade Rows
**Current**: 60% + 80% + 60% + 30% = **230% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 60%, Core: 80%, Rhomboids: 60%, Pectoralis: 30% }

// PROPOSED (CORRECT)
{ Core: 40%, Lats: 30%, Rhomboids: 18%, Pectoralis: 10%, Triceps: 2% }
```
**Reasoning**: Plank position makes this core-dominant. Rowing motion engages back secondarily.

---

##### ex41: TRX Pull-up
**Current**: 115% + 87% + 30% + 35% = **267% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 115%, Biceps: 87%, Core: 30%, Forearms: 35% }

// PROPOSED (CORRECT)
{ Lats: 50%, Biceps: 23%, Forearms: 15%, Core: 10%, Rhomboids: 2% }
```
**Reasoning**: TRX instability increases grip/forearm demand. Similar to regular pull-ups otherwise.

---

##### ex42: Wide Grip Pull-ups
**Current**: 124% + 78% + 60% + 20% = **282% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 124%, Biceps: 78%, Trapezius: 60%, Rhomboids: 20% }

// PROPOSED (CORRECT)
{ Lats: 60%, Biceps: 20%, Trapezius: 12%, Rhomboids: 8% }
```
**Reasoning**: Wide grip maximizes lat recruitment, reduces bicep involvement.

---

##### ex48: Dumbbell Pullover
**Current**: 60% + 40% + 35% = **135% ❌**
```typescript
// CURRENT (WRONG)
{ Lats: 60%, Pectoralis: 40%, Triceps: 35% }

// PROPOSED (CORRECT)
{ Lats: 50%, Pectoralis: 35%, Triceps: 12%, Core: 3% }
```
**Reasoning**: Pullovers work lats and pecs almost equally. Triceps stabilize.

---

#### LEG EXERCISES (9 total)

##### ex12: Kettlebell Goblet Squat
**Current**: 72% + 65% + 35% + 30% = **202% ❌**
```typescript
// CURRENT (WRONG)
{ Quadriceps: 72%, Glutes: 65%, Hamstrings: 35%, Core: 30% }

// PROPOSED (CORRECT)
{ Quadriceps: 50%, Glutes: 30%, Hamstrings: 12%, Core: 8% }
```
**Reasoning**: Squats are quad-dominant. Glutes/hams assist. Goblet position adds core demand.

---

##### ex13: Dumbbell Romanian Deadlift
**Current**: 75% + 55% + 40% = **170% ❌**
```typescript
// CURRENT (WRONG)
{ Hamstrings: 75%, Glutes: 55%, Core: 40% }

// PROPOSED (CORRECT)
{ Hamstrings: 45%, Glutes: 35%, Core: 15%, Lower Back: 5% }
```
**Reasoning**: RDLs target hamstrings primarily, with strong glute involvement. Core stabilizes heavy loads.

---

##### ex15: Calf Raises
**Current**: 51% = **51% ❌**
```typescript
// CURRENT (WRONG)
{ Calves: 51% }

// PROPOSED (CORRECT)
{ Calves: 95%, Core: 5% }
```
**Reasoning**: Pure isolation. Calves do virtually all the work.

---

##### ex35: Glute Bridges
**Current**: 76% + 23% = **99% ✅** (Close enough!)
```typescript
// CURRENT (ACCEPTABLE)
{ Glutes: 76%, Hamstrings: 23% }

// PROPOSED (MINOR ADJUSTMENT)
{ Glutes: 75%, Hamstrings: 22%, Core: 3% }
```
**Reasoning**: Very close to correct. Glutes are primary movers.

---

##### ex36: Dumbbell Stiff Legged Deadlift
**Current**: 70% + 65% + 50% = **185% ❌**
```typescript
// CURRENT (WRONG)
{ Glutes: 70%, Hamstrings: 65%, Core: 50% }

// PROPOSED (CORRECT)
{ Hamstrings: 42%, Glutes: 38%, Core: 15%, Lower Back: 5% }
```
**Reasoning**: Stiff-leg emphasizes hamstrings more than RDL. Glutes still heavily involved.

---

##### ex37: Kettlebell Swings
**Current**: 75% + 90% + 40% = **205% ❌**
```typescript
// CURRENT (WRONG)
{ Glutes: 75%, Hamstrings: 90%, Core: 40% }

// PROPOSED (CORRECT)
{ Hamstrings: 45%, Glutes: 40%, Core: 12%, Lower Back: 3% }
```
**Reasoning**: Explosive hip hinge. Hamstrings and glutes share the load. Core stabilizes.

---

##### ex43: Dumbbell Goblet Squat
**Current**: 72% + 65% + 35% + 30% = **202% ❌**
```typescript
// CURRENT (WRONG)
{ Quadriceps: 72%, Glutes: 65%, Hamstrings: 35%, Core: 30% }

// PROPOSED (CORRECT)
{ Quadriceps: 50%, Glutes: 30%, Hamstrings: 12%, Core: 8% }
```
**Reasoning**: Same as ex12 (Kettlebell Goblet Squat). Duplicate exercise.

---

##### ex47: Box Step-ups
**Current**: 67% + 169% + 51% + 20% + 15% = **322% ❌** (WORST OFFENDER!)
```typescript
// CURRENT (WRONG)
{ Quadriceps: 67%, Glutes: 169%, Hamstrings: 51%, Calves: 20%, Core: 15% }

// PROPOSED (CORRECT)
{ Glutes: 45%, Quadriceps: 35%, Hamstrings: 12%, Calves: 5%, Core: 3% }
```
**Reasoning**: Step-ups are glute-dominant unilateral movement. Quads assist. 169% glutes is physically impossible.

---

#### CORE EXERCISES (5 total)

##### ex16: Plank
**Current**: 77% + 20% = **97% ✅** (Close!)
```typescript
// CURRENT (ACCEPTABLE)
{ Core: 77%, Deltoids: 20% }

// PROPOSED (MINOR ADJUSTMENT)
{ Core: 80%, Deltoids: 18%, Glutes: 2% }
```
**Reasoning**: Very close. Shoulders stabilize plank position.

---

##### ex17: Bench Sit-ups
**Current**: 70% = **70% ❌**
```typescript
// CURRENT (WRONG)
{ Core: 70% }

// PROPOSED (CORRECT)
{ Core: 92%, Hip Flexors: 8% }
```
**Reasoning**: Sit-ups are core-dominant. Hip flexors assist in the movement. (Note: We may need to add Hip Flexors to muscle enum)

---

##### ex44: Spider Planks
**Current**: 90% + 20% = **110% ❌**
```typescript
// CURRENT (WRONG)
{ Core: 90%, Deltoids: 20% }

// PROPOSED (CORRECT)
{ Core: 85%, Deltoids: 12%, Glutes: 3% }
```
**Reasoning**: Dynamic plank variation. More core engagement than static plank.

---

##### ex45: TRX Mountain Climbers
**Current**: 70% + 30% = **100% ✅** (CORRECT!)
```typescript
// CURRENT (CORRECT)
{ Core: 70%, Deltoids: 30% }

// PROPOSED (KEEP AS-IS)
{ Core: 70%, Deltoids: 30% }
```
**Reasoning**: Already correct! One of only two exercises with proper percentages.

---

##### ex46: Hanging Leg Raises
**Current**: 75% + 15% = **90% ❌**
```typescript
// CURRENT (WRONG)
{ Core: 75%, Forearms: 15% }

// PROPOSED (CORRECT)
{ Core: 75%, Forearms: 20%, Lats: 5% }
```
**Reasoning**: Hanging adds significant grip demand. Lats stabilize hanging position.

---

### Summary of Corrections

**Total Exercises**: 40
- **Correct as-is**: 2 (5%)
- **Close enough (95-105%)**: 3 (7.5%)
- **Need minor adjustment (80-95% or 105-120%)**: 5 (12.5%)
- **Need major correction (>120% or <80%)**: 30 (75%)

**Action Required**:
✅ Implement all proposed corrections
✅ Verify all percentages sum to 100% ± 2%
✅ Re-test fatigue calculations with corrected data
✅ Update baseline calculations based on corrected engagements

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
