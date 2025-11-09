# Pre-Workout Forecast & Interactive Planning

**Purpose:** Features that provide real-time analysis and manipulation of a workout BEFORE it's executed, allowing users to optimize muscle targeting and prevent imbalances.

**Core Concept:** Run the same post-workout analysis logic in real-time as the user builds their workout, then provide interactive tools to adjust the plan.

---

## 🎯 Core Feature: Real-Time Workout Forecast

### What It Shows

As user adds exercises/sets/reps/weights to a planned workout, display:

```
┌──────────────────────────────────────────┐
│ WORKOUT FORECAST                         │
├──────────────────────────────────────────┤
│                                          │
│ Predicted Muscle Fatigue:               │
│                                          │
│ Hamstrings    ████████████ 113% ⚠️      │
│ Lower Back    ███████████  94%  ⚠️      │
│ Glutes        ███████      31%          │
│ Quadriceps    ███          14%  ⚠️ LOW  │
│ Core          ██           12%          │
│                                          │
│ ⚠️ WARNINGS:                             │
│ • Hamstrings will exceed baseline       │
│ • Quads undertrained (75% posterior)    │
│                                          │
│ 💡 SUGGESTIONS:                          │
│ • Add quad exercise                     │
│ • Reduce deadlift volume                │
└──────────────────────────────────────────┘
```

### Calculation Logic (Same as Post-Workout)

```javascript
// Real-time as user builds workout
function calculateWorkoutForecast(plannedExercises) {
  const muscleVolumes = {};

  // For each planned exercise
  plannedExercises.forEach(ex => {
    const exerciseData = EXERCISE_LIBRARY[ex.exerciseId];

    // Calculate total volume for this exercise
    const totalVolume = ex.sets.reduce((sum, set) => {
      return sum + (set.weight * set.reps);
    }, 0);

    // Distribute volume across muscles
    exerciseData.muscles.forEach(muscle => {
      const muscleVolume = totalVolume * (muscle.percentage / 100);

      if (!muscleVolumes[muscle.muscle]) {
        muscleVolumes[muscle.muscle] = 0;
      }
      muscleVolumes[muscle.muscle] += muscleVolume;
    });
  });

  // Calculate predicted fatigue
  const fatigueForecast = {};
  Object.keys(muscleVolumes).forEach(muscle => {
    const baseline = BASELINES[muscle];
    const fatiguePercent = (muscleVolumes[muscle] / baseline) * 100;

    fatigueForecast[muscle] = {
      volume: muscleVolumes[muscle],
      baseline: baseline,
      predictedFatigue: fatiguePercent,
      willExceed: fatiguePercent > 100,
      isUnderworked: fatiguePercent < 20
    };
  });

  return fatigueForecast;
}
```

### Update Triggers

Recalculate forecast when user:
- Adds/removes exercise
- Changes sets/reps/weight
- Reorders exercises
- Uses the slider (see below)

**Performance:** Debounce rapid changes (recalculate 300ms after user stops typing)

---

## 🎯 Interactive Feature #1: Click Muscle to Add Exercise

**Scenario:** Forecast shows "Quadriceps: 14% ⚠️ LOW"

**User Action:** Click on Quadriceps card

**Result:** Modal opens with exercise suggestions

```
┌────────────────────────────────────────────┐
│ ADD EXERCISE TO TARGET QUADRICEPS          │
├────────────────────────────────────────────┤
│                                            │
│ Current: 14% (1,200 lbs / 8,400 baseline) │
│ Target: 50% (4,200 lbs needed)            │
│                                            │
│ Recommended Exercises:                    │
│                                            │
│ 1. Bulgarian Split Squats ⭐ BEST         │
│    Quad: 65% | Would add: +36% fatigue   │
│    ✅ No bottleneck conflicts             │
│    [+] Add to Workout                     │
│                                            │
│ 2. Leg Extensions                         │
│    Quad: 85% | Would add: +48% fatigue   │
│    ✅ No bottleneck conflicts             │
│    [+] Add to Workout                     │
│                                            │
│ 3. Barbell Back Squats                    │
│    Quad: 72% | Would add: +42% fatigue   │
│    ⚠️ Would push Lower Back to 112%       │
│    ❌ Not recommended                     │
│                                            │
└────────────────────────────────────────────┘
```

**Logic:**
1. Calculate volume needed to reach target % (e.g., 50%)
2. For each exercise in library that targets muscle:
   - Calculate predicted volume contribution (based on user's typical sets/reps)
   - Check if adding it would exceed any baselines
   - Rank by efficiency and safety
3. User clicks "+Add" → Exercise added with default sets/reps/weight
4. Forecast updates in real-time

---

## 🎯 Interactive Feature #2: Dynamic Volume Slider 🔥🔥🔥

**This is the WILD one!**

### Concept

User wants more quad activation without manually adjusting sets/reps/weights.

**UI:**
- Click on Quadriceps card
- Slider appears: "Target Fatigue: 14% ──●────────── 50%"
- Choose mode: [Increase Weight] or [Increase Reps]
- Drag slider right
- **Entire workout auto-adjusts** to hit that target
- **Cascade effects** shown on other muscles

### The Formula

Let's break down the math:

#### Current State
```
Workout has: Goblet Squat (40 lbs × 20 reps × 3 sets)
Total volume: 2,400 lbs
Quad engagement: 50%
Quad volume: 1,200 lbs
Quad fatigue: 14% (1,200 / 8,400)
```

#### User drags slider to 50%
```
Target quad fatigue: 50%
Target quad volume: 8,400 × 0.50 = 4,200 lbs
Volume increase needed: 4,200 - 1,200 = 3,000 lbs
```

#### Calculate new exercise volume
```
Goblet Squat quad engagement: 50%
Total volume increase needed: 3,000 / 0.50 = 6,000 lbs
New total volume for Goblet Squat: 2,400 + 6,000 = 8,400 lbs
```

#### Mode 1: Increase Weight (keep reps same)
```
Current: 40 lbs × 20 reps × 3 sets = 2,400 lbs
Needed: 8,400 lbs total
Formula: 8,400 / (20 reps × 3 sets) = 140 lbs per set

New plan:
  Set 1: 140 lbs × 20 reps
  Set 2: 140 lbs × 20 reps
  Set 3: 140 lbs × 20 reps
```

#### Mode 2: Increase Reps (keep weight same)
```
Current: 40 lbs × 20 reps × 3 sets = 2,400 lbs
Needed: 8,400 lbs total
Formula: 8,400 / (40 lbs × 3 sets) = 70 reps per set

New plan:
  Set 1: 40 lbs × 70 reps
  Set 2: 40 lbs × 70 reps
  Set 3: 40 lbs × 70 reps
```

#### Cascade Effect: Update OTHER muscles

Goblet Squat also hits:
- Glutes: 30%
- Hamstrings: 12%
- Core: 8%

With new volume (8,400 lbs):
```
Glutes:     30% × 8,400 = 2,520 lbs (was 720)   → +1,800 lbs
Hamstrings: 12% × 8,400 = 1,008 lbs (was 288)   → +720 lbs
Core:        8% × 8,400 =   672 lbs (was 192)   → +480 lbs
```

**Check for bottlenecks:**
```
Hamstrings: 3,258 + 720 = 3,978 lbs
Fatigue: 3,978 / 2,880 = 138% ⚠️ EXCEEDED!
```

**Show warning:**
```
⚠️ WARNING: Increasing Quads to 50% would push Hamstrings to 138%
💡 Suggestion: Reduce hamstring volume elsewhere first
```

---

## 🧮 Algorithm: Multi-Exercise Volume Distribution

**Challenge:** What if multiple exercises in workout target quads?

```
Workout contains:
1. Goblet Squat (50% quads) - 2,400 lbs total
2. Bulgarian Split Squat (65% quads) - 3,000 lbs total

Current quad volume:
- From Goblet: 2,400 × 0.50 = 1,200 lbs
- From Bulgarian: 3,000 × 0.65 = 1,950 lbs
- Total: 3,150 lbs

User drags slider to 50% → Need 4,200 lbs total → +1,050 lbs needed
```

**How to distribute the +1,050 lbs across TWO exercises?**

### Option A: Proportional Distribution
```
Goblet contributes:     1,200 / 3,150 = 38% of current quad volume
Bulgarian contributes:  1,950 / 3,150 = 62% of current quad volume

Increase Goblet by:     1,050 × 0.38 = 399 lbs
Increase Bulgarian by:  1,050 × 0.62 = 651 lbs
```

### Option B: Max Efficiency (Highest Engagement First)
```
Bulgarian has 65% quad engagement (higher than Goblet's 50%)
Increase Bulgarian first until reasonable limit
Then increase Goblet if needed
```

### Option C: User Choice
```
┌────────────────────────────────────────┐
│ Distribute +1,050 lbs across:          │
├────────────────────────────────────────┤
│ ☑ Goblet Squat        [●────] 40%     │
│ ☑ Bulgarian Split     [──────●] 60%   │
│                                        │
│ Preview:                               │
│ Goblet: 40 → 52 lbs (13 lb increase)  │
│ Bulgarian: 50 → 65 lbs (15 lb increase)│
└────────────────────────────────────────┘
```

**I think Option C (User Choice) is best for MVP** - gives control, shows exactly what will change

---

## 🎨 UI/UX Design

### Muscle Card (Normal State)
```
┌────────────────────────┐
│ Quadriceps             │
│ ███          14%       │
│ 1,200 / 8,400 lbs     │
│                        │
│ ⚠️ Undertrained        │
│ [Add Exercise]         │
└────────────────────────┘
```

### Muscle Card (Slider Mode)
```
┌────────────────────────────────────┐
│ Quadriceps                    [×]  │
├────────────────────────────────────┤
│                                    │
│ Current: 14% (1,200 lbs)          │
│ Target:  ──●────────── 50%        │
│          14%          100%         │
│                                    │
│ Mode:                              │
│ ⚪ Increase Weight (keep reps)     │
│ ⚫ Increase Reps (keep weight)     │
│                                    │
│ Changes to:                        │
│ • Goblet Squat: 40→140 lbs        │
│                                    │
│ Cascade Effects:                   │
│ • Glutes: 31% → 54% (+23%)        │
│ • Hamstrings: 113% → 138% ⚠️      │
│ • Core: 12% → 19% (+7%)           │
│                                    │
│ ⚠️ WARNING:                        │
│ Hamstrings would exceed baseline   │
│                                    │
│ [Cancel]        [Apply Changes]   │
└────────────────────────────────────┘
```

---

## 🚨 Safety Features

### 1. Bottleneck Prevention
```javascript
function checkBottlenecks(newForecast) {
  const warnings = [];

  Object.keys(newForecast).forEach(muscle => {
    if (newForecast[muscle].willExceed) {
      warnings.push({
        muscle: muscle,
        currentFatigue: newForecast[muscle].predictedFatigue,
        message: `${muscle} would exceed baseline (${newForecast[muscle].predictedFatigue}%)`
      });
    }
  });

  return warnings;
}
```

### 2. Practical Limits
```javascript
const MAX_WEIGHT_INCREASE = 1.5; // Max 50% increase per slider adjustment
const MAX_REPS_INCREASE = 2.0;   // Max 100% increase (double reps)

function capIncrease(currentValue, newValue, mode) {
  const maxAllowed = mode === 'weight'
    ? currentValue * MAX_WEIGHT_INCREASE
    : currentValue * MAX_REPS_INCREASE;

  return Math.min(newValue, maxAllowed);
}
```

### 3. Undo/Reset
```
[Reset to Original] button to revert all slider changes
```

---

## 📋 Implementation Checklist

### Phase 1: Real-Time Forecast (Foundation)
- [ ] Calculate muscle volumes as user builds workout
- [ ] Display predicted fatigue percentages
- [ ] Show warnings for bottlenecks
- [ ] Flag underworked muscles (<20%)
- [ ] Show workout balance (% posterior vs anterior, etc.)

### Phase 2: Click-to-Add Exercise
- [ ] Click underworked muscle → show exercise suggestions
- [ ] Rank by efficiency & safety (no bottlenecks)
- [ ] Add exercise with default sets/reps
- [ ] Recalculate forecast in real-time

### Phase 3: Dynamic Volume Slider (Advanced)
- [ ] Add slider UI to muscle cards
- [ ] Implement "Increase Weight" mode
- [ ] Implement "Increase Reps" mode
- [ ] Calculate volume distribution across exercises
- [ ] Show cascade effects on other muscles
- [ ] Bottleneck warnings in real-time
- [ ] Apply changes to workout plan

### Phase 4: Multi-Exercise Distribution
- [ ] Proportional distribution algorithm
- [ ] User-controlled distribution sliders
- [ ] Preview changes before applying

---

## 🤔 Open Questions / Need to Brainstorm

### 1. Which exercises to adjust?
If workout has 3 exercises that hit quads, which ones should the slider adjust?
- All of them proportionally?
- Only the primary quad exercises?
- Let user choose?

### 2. Practical weight increments
Gym equipment comes in specific increments (2.5, 5, 10 lb plates)
- Should we round to nearest practical weight?
- Example: Calculated 142 lbs → Round to 140 lbs?

### 3. Rep limits
Is there a max rep limit we should enforce?
- Strength: 1-6 reps
- Hypertrophy: 6-12 reps
- Endurance: 12-20 reps
- Don't let slider push reps beyond 30?

### 4. Performance optimization
Recalculating entire workout on every slider drag might be slow
- Debounce slider (only calculate on release)?
- Optimize calculation with caching?
- Background worker thread?

### 5. Mobile UX
Sliders on mobile can be tricky
- Touch targets big enough?
- Alternative: +/- buttons instead of slider?
- Haptic feedback on drag?

---

## 💡 Future Enhancements

### Smart Auto-Balance
```
[Auto-Balance Workout] button
→ System automatically distributes volume to hit 50% all muscles
→ Shows preview of all changes
→ User approves or tweaks
```

### Workout Templates with Target Percentages
```
Save workout template with target muscle percentages:
"Leg Day: Quads 60%, Hamstrings 60%, Glutes 50%, Calves 30%"

When loading template, system auto-adjusts to hit those targets
```

### AI Exercise Swapping
```
"This exercise will exceed baseline. Try this instead?"
→ Suggests exercise with similar pattern but lower intensity
```

---

## 🎯 Interactive Feature #3: AI Workout Optimizer 🔥🔥🔥

**This is the KILLER feature!**

### Concept

User provides constraints, AI builds an optimized workout that maximizes muscle fatigue while respecting limitations.

**UI:**
```
┌────────────────────────────────────────────┐
│ 🤖 AI WORKOUT OPTIMIZER                    │
├────────────────────────────────────────────┤
│                                            │
│ Workout Type: [Legs ▼]                    │
│                                            │
│ Constraints:                               │
│ ☑ Max Exercises:     [4]                  │
│ ☑ Sets per Exercise: [3]                  │
│ ☑ Rep Range:         [6] - [12]           │
│ ☑ Available Equipment:                    │
│   ☑ Dumbbells  ☑ Kettlebells  ☑ TRX      │
│   ☑ Bodyweight ☐ Barbell                 │
│                                            │
│ Optimization Goal:                         │
│ ⚫ Max Intensity (push to limits)          │
│ ⚪ Balanced (leave headroom)               │
│ ⚪ Focus Specific Muscle: [____]           │
│                                            │
│ Recovery State:                            │
│ ☑ Use current muscle fatigue              │
│                                            │
│ [Generate 3 Workout Options]              │
└────────────────────────────────────────────┘
```

### Algorithm Logic

**Step 1: Score All Eligible Exercises**

```javascript
function scoreExercise(exercise, constraints, currentFatigue, goal) {
  let score = 0;

  // 1. Equipment check (hard constraint)
  if (!userHasEquipment(exercise.equipment)) return -Infinity;

  // 2. Muscle coverage score (fill gaps)
  const targetMuscles = getMusclesForCategory(constraints.category);
  const coverageScore = calculateCoverageScore(exercise, targetMuscles);
  score += coverageScore * 30; // 30% weight

  // 3. Efficiency score (high engagement %)
  const avgEngagement = getAverageEngagement(exercise);
  score += avgEngagement * 20; // 20% weight

  // 4. Recovery state score (target fresh muscles)
  const recoveryScore = calculateRecoveryScore(exercise, currentFatigue);
  score += recoveryScore * 25; // 25% weight

  // 5. Movement variety score (different patterns)
  const varietyScore = calculateMovementVariety(exercise, selectedExercises);
  score += varietyScore * 15; // 15% weight

  // 6. Goal-specific bonus
  if (goal.type === 'focusMuscle') {
    const focusBonus = exercise.muscles[goal.muscle] || 0;
    score += focusBonus * 10; // 10% weight
  }

  return score;
}
```

**Step 2: Select Optimal Exercise Combination**

```javascript
function selectExercises(constraints, goal) {
  const allExercises = EXERCISE_LIBRARY.filter(e =>
    e.category === constraints.category
  );

  // Score each exercise
  const scoredExercises = allExercises.map(ex => ({
    exercise: ex,
    score: scoreExercise(ex, constraints, currentFatigue, goal)
  })).sort((a, b) => b.score - a.score);

  // Greedy selection with diversity
  const selected = [];
  const targetedMuscles = new Set();

  while (selected.length < constraints.maxExercises) {
    for (const {exercise} of scoredExercises) {
      // Skip if already selected
      if (selected.includes(exercise)) continue;

      // Check if adds new muscle coverage
      const newMuscles = Object.keys(exercise.muscles)
        .filter(m => !targetedMuscles.has(m));

      if (newMuscles.length > 0 || selected.length === 0) {
        selected.push(exercise);
        Object.keys(exercise.muscles).forEach(m => targetedMuscles.add(m));
        break;
      }
    }
  }

  return selected;
}
```

**Step 3: Optimize Volume for Target Fatigue**

```javascript
function optimizeVolume(exercises, goal, baselines) {
  const targetFatigue = goal.intensity === 'max' ? 0.90 : 0.65;

  // Start with baseline volume (mid-range reps)
  exercises.forEach(ex => {
    ex.sets = constraints.setsPerExercise;
    ex.reps = Math.floor((constraints.repRange.min + constraints.repRange.max) / 2);
    ex.weight = estimateWeight(ex.reps, userHistory);
  });

  // Iteratively adjust to hit target
  let iterations = 0;
  while (iterations < 100) {
    const forecast = calculateWorkoutForecast(exercises);
    const bottleneck = findBottleneck(forecast);

    if (bottleneck && bottleneck.fatigue > 1.0) {
      // Reduce volume on exercises hitting bottleneck
      reduceVolume(exercises, bottleneck.muscle);
    } else {
      // Find muscle furthest from target
      const underworked = findUnderworkedMuscle(forecast, targetFatigue);
      if (!underworked) break; // All at target

      // Increase volume on exercise that hits this muscle
      increaseVolume(exercises, underworked.muscle);
    }

    iterations++;
  }

  return exercises;
}
```

**Step 4: Generate Multiple Options**

```javascript
function generateOptions(constraints, goal) {
  return [
    {
      name: "Option A: Max Intensity",
      description: "Push all muscles near 100%, bottleneck limiting factor",
      exercises: optimize({...constraints, intensity: 'max'}),
      avgFatigue: 87,
      bottleneck: "Lower Back (94%)"
    },
    {
      name: "Option B: Balanced",
      description: "All muscles 70-85%, room to add exercises",
      exercises: optimize({...constraints, intensity: 'balanced'}),
      avgFatigue: 76,
      bottleneck: "None"
    },
    {
      name: "Option C: Quad Focus",
      description: "Extra quad emphasis, 95% quad fatigue",
      exercises: optimize({...constraints, focusMuscle: 'quads'}),
      avgFatigue: 72,
      bottleneck: "None"
    }
  ];
}
```

### UI Flow

**User clicks "Generate 3 Workout Options":**

```
┌────────────────────────────────────────────┐
│ 🤖 GENERATED WORKOUTS                      │
├────────────────────────────────────────────┤
│                                            │
│ ┌─ OPTION A: MAX INTENSITY ──────────┐   │
│ │ Avg Fatigue: 87%                    │   │
│ │ Bottleneck: Lower Back (94%)        │   │
│ │                                      │   │
│ │ 1. Box Step-ups                     │   │
│ │    3×10 @ 95 lbs                    │   │
│ │ 2. Stiff Leg Deadlift               │   │
│ │    3×8 @ 120 lbs                    │   │
│ │ 3. Goblet Squat                     │   │
│ │    3×12 @ 55 lbs                    │   │
│ │ 4. Calf Raises                      │   │
│ │    3×12 @ 250 lbs                   │   │
│ │                                      │   │
│ │ [View Forecast] [Select This]       │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌─ OPTION B: BALANCED ────────────────┐   │
│ │ Avg Fatigue: 76%                    │   │
│ │ Bottleneck: None                    │   │
│ │ ... (similar structure)             │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌─ OPTION C: QUAD FOCUS ──────────────┐   │
│ │ Avg Fatigue: 72%                    │   │
│ │ Bottleneck: None                    │   │
│ │ ... (similar structure)             │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ [Regenerate Options]                       │
└────────────────────────────────────────────┘
```

**Click "View Forecast" on any option:**
- Shows full workout forecast (same as pre-workout forecast feature)
- Can make manual adjustments with sliders
- Can save or start workout

---

## Implementation Priority

**Phase 1: Basic Optimizer**
- [ ] Exercise selection algorithm
- [ ] Simple volume optimization (hit 70% target)
- [ ] Single option generation
- [ ] Basic constraint inputs

**Phase 2: Advanced Optimization**
- [ ] Multi-objective optimization (max intensity, balanced, focus)
- [ ] Bottleneck detection and handling
- [ ] 3 option generation
- [ ] Recovery state integration

**Phase 3: ML Enhancements**
- [ ] Learn from user's historical preferences
- [ ] Personalized weight recommendations
- [ ] Adaptive difficulty based on success rate
- [ ] "Feels like" similarity matching

---

## Open Questions

### 1. How to handle conflicting constraints?
Example: User wants max intensity BUT only 2 exercises
- Show warning: "Cannot reach 80%+ fatigue with only 2 exercises"
- Offer to relax constraint: "Add 1 more exercise?"

### 2. Should we allow users to "lock" specific exercises?
```
☑ Must Include: Goblet Squats
```
Then optimize around that?

### 3. Real-time re-optimization?
If user manually changes one exercise in generated workout, should we:
- A. Leave other exercises as-is
- B. Re-optimize remaining exercises
- C. Ask user which approach they want

### 4. Difficulty calibration
First-time users won't have baselines or history. How to estimate?
- Use experience level (Beginner/Intermediate/Advanced)
- Start conservative (60% target), learn from first workout
- Ask calibration questions: "Can you do 10 push-ups?"

---

## Future Enhancements

### Smart Workout Sequences
```
Generate workout plan for the week:
- Monday: AI-optimized Push Day
- Wednesday: AI-optimized Pull Day
- Friday: AI-optimized Legs Day

Ensures cumulative fatigue balanced over week
```

### Progressive Auto-Adjustment
```
Workout completed → Update baselines → Next workout auto-increases 3%
"You beat your baselines! Next Legs Day will be 5% harder"
```

### "Feels Like" Matching
```
User: "I loved the workout from 3 weeks ago, build me something similar"
AI: Finds workout, matches movement patterns, generates similar workout
```

---

*Document created: 2025-11-08*
*Last updated: 2025-11-08 - Added AI Workout Optimizer*
*Status: BRAINSTORMING - Need to validate feasibility*
