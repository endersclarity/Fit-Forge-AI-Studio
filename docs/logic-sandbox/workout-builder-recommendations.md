# Workout Builder: Exercise Recommendation Algorithm

**Purpose**: Define the logic for ranking and recommending exercises to users while building workouts, ensuring safety (no bottlenecks) and effectiveness (target desired muscles).

**Context**: This algorithm powers two critical features:
1. **Click-to-Add**: User clicks underworked muscle → get ranked exercise suggestions
2. **Smart Fill**: User wants to max out a muscle without manually selecting exercises

---

## 🎯 Core Requirements

### 1. Safety First (Bottleneck Prevention)
- **Never recommend exercises that would push any muscle over 100% baseline**
- Even if exercise targets desired muscle well, if it causes bottleneck → filter it out

### 2. Muscle Targeting (Efficiency)
- Prioritize exercises with **high engagement** of target muscle
- Example: If targeting quads, rank Bulgarian Split Squats (65% quads) over Goblet Squats (50% quads)

### 3. Equipment Availability
- Only show exercises user has equipment for
- If user doesn't have barbell → don't recommend barbell exercises

### 4. Recovery State Awareness
- Prefer exercises that use fresh muscles
- If user's pecs are 80% fatigued, don't recommend bench press variations

### 5. Movement Variety
- Avoid recommending duplicate movement patterns
- If workout already has 3 squat variations → deprioritize more squats

---

## 🧮 Recommendation Algorithm

### Input Parameters

```javascript
{
  targetMuscle: "Quadriceps",           // Which muscle to target
  currentWorkout: [...],                 // Exercises already in workout
  currentFatigue: {...},                 // Current muscle fatigue state
  availableEquipment: [...],             // Equipment user has access to
  userPreferences: {
    avoidExercises: [...],               // Exercises user dislikes
    preferExercises: [...]               // Exercises user loves
  }
}
```

### Step 1: Filter Eligible Exercises

```javascript
function filterEligibleExercises(allExercises, params) {
  return allExercises.filter(exercise => {
    // 1. Must have required equipment
    if (!params.availableEquipment.includes(exercise.equipment)) {
      return false;
    }

    // 2. Must not be in user's "avoid" list
    if (params.userPreferences.avoidExercises.includes(exercise.id)) {
      return false;
    }

    // 3. Must not be already in current workout (no duplicates)
    if (params.currentWorkout.some(ex => ex.exerciseId === exercise.id)) {
      return false;
    }

    // 4. Must actually target the desired muscle
    const targetEngagement = exercise.muscles.find(m => m.muscle === params.targetMuscle);
    if (!targetEngagement || targetEngagement.percentage < 5) {
      return false; // Less than 5% engagement = not worth it
    }

    return true;
  });
}
```

### Step 2: Check Bottleneck Safety

```javascript
function checkBottleneckSafety(exercise, params, estimatedSets = 3, estimatedReps = 10, estimatedWeight) {
  const warnings = [];

  // Estimate volume for this exercise
  const estimatedVolume = estimatedSets * estimatedReps * estimatedWeight;

  // Check impact on each muscle
  exercise.muscles.forEach(muscle => {
    const muscleVolume = estimatedVolume * (muscle.percentage / 100);
    const currentFatigue = params.currentFatigue[muscle.muscle] || 0;
    const baseline = BASELINES[muscle.muscle];

    // Calculate new fatigue if exercise is added
    const newFatigue = ((params.currentMuscleVolumes[muscle.muscle] || 0) + muscleVolume) / baseline * 100;

    if (newFatigue > 100) {
      warnings.push({
        muscle: muscle.muscle,
        currentFatigue: currentFatigue,
        newFatigue: newFatigue,
        overage: newFatigue - 100
      });
    }
  });

  return {
    isSafe: warnings.length === 0,
    warnings: warnings
  };
}
```

### Step 3: Score Each Exercise

```javascript
function scoreExercise(exercise, params) {
  let score = 0;

  // Factor 1: Target Muscle Engagement (40% weight)
  const targetEngagement = exercise.muscles.find(m => m.muscle === params.targetMuscle);
  score += (targetEngagement.percentage / 100) * 40;

  // Factor 2: Muscle Freshness (25% weight)
  // Average fatigue of all muscles involved
  const avgFatigue = exercise.muscles.reduce((sum, m) => {
    return sum + (params.currentFatigue[m.muscle] || 0);
  }, 0) / exercise.muscles.length;

  const freshnessScore = Math.max(0, 100 - avgFatigue) / 100;
  score += freshnessScore * 25;

  // Factor 3: Movement Variety (15% weight)
  const movementPattern = exercise.category; // push, pull, legs, etc.
  const samePatternCount = params.currentWorkout.filter(ex => {
    const exData = EXERCISES.find(e => e.id === ex.exerciseId);
    return exData.category === movementPattern;
  }).length;

  const varietyScore = Math.max(0, 1 - (samePatternCount / 5)); // Diminish if >5 same pattern
  score += varietyScore * 15;

  // Factor 4: User Preference (10% weight)
  if (params.userPreferences.preferExercises.includes(exercise.id)) {
    score += 10; // Full 10 points if user loves this exercise
  }

  // Factor 5: Primary vs Secondary Engagement (10% weight)
  if (targetEngagement.primary) {
    score += 10; // Bonus if target muscle is PRIMARY
  } else {
    score += 5; // Half bonus if secondary
  }

  return score;
}
```

### Step 4: Rank and Return Recommendations

```javascript
function recommendExercises(params) {
  // Step 1: Filter eligible exercises
  const eligibleExercises = filterEligibleExercises(ALL_EXERCISES, params);

  // Step 2: Score each exercise
  const scoredExercises = eligibleExercises.map(exercise => {
    // Estimate weight for bottleneck check
    const estimatedWeight = estimateWeightForUser(exercise, params.userHistory);

    // Check safety
    const safetyCheck = checkBottleneckSafety(exercise, params, 3, 10, estimatedWeight);

    // Calculate score (only if safe)
    const score = safetyCheck.isSafe ? scoreExercise(exercise, params) : 0;

    return {
      exercise: exercise,
      score: score,
      isSafe: safetyCheck.isSafe,
      warnings: safetyCheck.warnings,
      estimatedWeight: estimatedWeight,
      targetEngagement: exercise.muscles.find(m => m.muscle === params.targetMuscle).percentage
    };
  });

  // Step 3: Sort by score (descending)
  const sortedExercises = scoredExercises.sort((a, b) => b.score - a.score);

  // Step 4: Separate safe vs unsafe
  const safeRecommendations = sortedExercises.filter(ex => ex.isSafe);
  const unsafeRecommendations = sortedExercises.filter(ex => !ex.isSafe);

  return {
    recommended: safeRecommendations.slice(0, 5), // Top 5 safe options
    notRecommended: unsafeRecommendations,
    totalFiltered: eligibleExercises.length
  };
}
```

---

## 🎨 UI Display Format

```javascript
// User clicks "Quadriceps (14%)" in workout builder forecast

Modal: "Add Exercise to Target Quadriceps"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Quad Fatigue: 14% (1,200 / 8,400 lbs baseline)
Target: 50% (need 3,000 lbs additional volume)

Recommended Exercises (Ranked):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Bulgarian Split Squats ⭐ BEST MATCH (Score: 87/100)
   Quad Engagement: 65% (PRIMARY)
   Estimated Volume: 2,700 lbs (3 × 10 @ 90 lbs)
   Would bring Quads to: 46% (+32%)
   ✅ Safe: No bottleneck conflicts
   💪 Fresh muscles: Avg 18% fatigue
   [+] Add to Workout

2. Leg Extensions (Score: 82/100)
   Quad Engagement: 85% (PRIMARY)
   Estimated Volume: 2,400 lbs (3 × 10 @ 80 lbs)
   Would bring Quads to: 52% (+38%)
   ✅ Safe: No bottleneck conflicts
   💪 Fresh muscles: Avg 12% fatigue
   [+] Add to Workout

3. Dumbbell Lunges (Score: 75/100)
   Quad Engagement: 55% (PRIMARY)
   Estimated Volume: 3,000 lbs (3 × 10 @ 100 lbs)
   Would bring Quads to: 48% (+34%)
   ✅ Safe: No bottleneck conflicts
   💪 Fresh muscles: Avg 22% fatigue
   [+] Add to Workout

4. Box Step-Ups (Score: 68/100)
   Quad Engagement: 50% (PRIMARY)
   Estimated Volume: 2,850 lbs (3 × 10 @ 95 lbs)
   Would bring Quads to: 45% (+31%)
   ✅ Safe: No bottleneck conflicts
   💪 Fresh muscles: Avg 25% fatigue
   [+] Add to Workout

5. Goblet Squat (Score: 60/100)
   Quad Engagement: 50% (PRIMARY)
   Estimated Volume: 2,400 lbs (3 × 10 @ 80 lbs)
   Would bring Quads to: 43% (+29%)
   ✅ Safe: No bottleneck conflicts
   💪 Moderate fatigue: Avg 31% fatigue
   ⚠️ Note: Similar to Kettlebell Squat (already in workout)
   [+] Add to Workout

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NOT RECOMMENDED (Would cause bottlenecks):

Barbell Back Squats
   Quad Engagement: 72% (PRIMARY)
   Would bring Quads to: 68% (+54%)
   ❌ UNSAFE: Would push Lower Back to 112% (currently 94%)
   🚨 Risk of injury

Front Squats
   Quad Engagement: 70% (PRIMARY)
   Would bring Quads to: 65% (+51%)
   ❌ UNSAFE: Would push Lower Back to 108% (currently 94%)
   🚨 Risk of injury

[Show All Unsafe Options (2 more)]
```

---

## 📊 Example Scoring Breakdown

**Exercise**: Bulgarian Split Squats
**Target Muscle**: Quadriceps

| Factor | Weight | Calculation | Score |
|--------|--------|-------------|-------|
| Target Engagement | 40% | 65% engagement × 40 | 26.0 |
| Muscle Freshness | 25% | Avg 18% fatigue → 82% fresh × 25 | 20.5 |
| Movement Variety | 15% | 1 similar exercise / 5 × 15 | 12.0 |
| User Preference | 10% | Not in favorites | 0.0 |
| Primary Muscle | 10% | Is primary muscle | 10.0 |
| **Total** | **100%** | | **68.5** |

**Rounded Score**: 69/100 (or 87/100 with different fatigue state)

---

## 🧪 Edge Cases to Handle

### 1. No Safe Exercises Available
**Scenario**: All exercises targeting muscle would cause bottlenecks

**UI Response**:
```
⚠️ No Safe Exercises Available

All quad exercises would exceed baseline limits for other muscles.
Consider reducing volume on existing exercises first.

Options:
• [Reduce Volume] on Stiff Leg Deadlifts (frees Lower Back)
• [Remove Exercise] Kettlebell Swings (frees Lower Back)
• [Try Anyway] Show unsafe options (not recommended)
```

### 2. User Has Minimal Equipment
**Scenario**: Only "bodyweight" equipment available

**UI Response**:
```
🏠 Limited Equipment Detected

Based on your equipment (Bodyweight only), here are options:
1. Bulgarian Split Squats (Bodyweight)
2. Lunges (Bodyweight)
3. Pistol Squats (Bodyweight)

💡 Tip: Add equipment to your profile for more options
[Manage Equipment]
```

### 3. Target Muscle Already Maxed
**Scenario**: Quadriceps already at 98% fatigue

**UI Response**:
```
⚠️ Quadriceps Nearly Maxed (98% fatigue)

You're already close to your baseline limit for this muscle.
Adding more quad work risks overtraining.

Recommendation: Focus on other muscle groups or reduce volume.

Still want to add quad work?
[Show Light Exercises] (low volume options)
```

### 4. All Muscles in Workout Are Fresh
**Scenario**: Just started workout, all muscles at 0%

**Behavior**: Freshness factor doesn't differentiate, rely more heavily on target engagement % and user preferences

---

## 🎯 Implementation Checklist

### Phase 1: Basic Filtering & Ranking
- [ ] Filter by equipment availability
- [ ] Filter by target muscle engagement (>5%)
- [ ] Remove duplicates (already in workout)
- [ ] Score by target engagement only (simple MVP)
- [ ] Return top 5 ranked exercises

### Phase 2: Safety Checks
- [ ] Calculate estimated volume for each exercise
- [ ] Check bottleneck conflicts across all muscles
- [ ] Separate safe vs unsafe recommendations
- [ ] Display warnings for unsafe exercises

### Phase 3: Advanced Scoring
- [ ] Add muscle freshness factor
- [ ] Add movement variety factor
- [ ] Add user preference factor
- [ ] Add primary vs secondary muscle factor
- [ ] Tune weights for each factor

### Phase 4: Smart Estimations
- [ ] Estimate weight based on user history
- [ ] Estimate sets/reps based on workout context
- [ ] Adjust estimates for beginner vs advanced users

### Phase 5: UI Polish
- [ ] Visual score indicators (87/100)
- [ ] "Would bring to X%" predictions
- [ ] Color-coded safety badges (✅ ❌)
- [ ] Expandable "why this score?" details
- [ ] Quick-add buttons with default sets/reps

---

## 🤔 Open Questions

### 1. How to estimate weight for user?
**Options**:
- A. Use average weight from past workouts for this exercise
- B. Use percentage of body weight (e.g., bodyweight lunges = user weight)
- C. Let user specify estimated weight in advanced settings
- **Recommendation**: Use A (historical average) with fallback to B for new exercises

### 2. Should we allow "unsafe" recommendations?
**Options**:
- A. Never show unsafe exercises (hide them completely)
- B. Show but mark as ❌ NOT RECOMMENDED with clear warnings
- C. Let user toggle "Show unsafe options" in settings
- **Recommendation**: Use B (show with warnings) - gives user full information

### 3. How to handle "similar" exercises?
**Example**: Kettlebell Goblet Squat vs Dumbbell Goblet Squat

**Options**:
- A. Flag as "Similar to [Exercise]" in UI
- B. Penalize score for similarity
- C. Ignore similarity, let user decide
- **Recommendation**: Use A (flag in UI) + B (small penalty) - educate user without blocking

### 4. Should freshness factor use average or weighted average?
**Example**: Exercise uses 65% quads (50% fatigued) + 20% glutes (10% fatigued)

**Options**:
- A. Simple average: (50 + 10) / 2 = 30% avg fatigue
- B. Weighted by engagement: (65% × 50) + (20% × 10) = 34.5% weighted avg
- **Recommendation**: Use B (weighted average) - more accurate representation

---

## 📚 Reference Data Structures

### Exercise Object
```javascript
{
  id: "ex12",
  name: "Bulgarian Split Squats",
  equipment: "dumbbell",
  category: "legs",
  muscles: [
    { muscle: "Quadriceps", percentage: 65, primary: true },
    { muscle: "Glutes", percentage: 20, primary: false },
    { muscle: "Hamstrings", percentage: 10, primary: false },
    { muscle: "Core", percentage: 5, primary: false }
  ]
}
```

### Baseline Object
```javascript
{
  muscle: "Quadriceps",
  baselineCapacity: 8400,
  unit: "lbs",
  lastUpdated: "2025-11-08"
}
```

### User Preferences Object
```javascript
{
  availableEquipment: ["dumbbell", "kettlebell", "bodyweight", "trx"],
  avoidExercises: ["ex23"], // Dislikes burpees
  preferExercises: ["ex12", "ex36"], // Loves Bulgarian splits and deadlifts
  experienceLevel: "intermediate" // beginner, intermediate, advanced
}
```

---

## 🚀 Next Steps

1. ✅ Algorithm logic documented
2. 🧪 Test with sample workout data (validate scoring)
3. 📝 Design API endpoint schema (GET /api/recommendations)
4. 🎨 Create UI mockup for recommendation modal
5. 💾 Database schema for user preferences and exercise history
6. 🔧 Implement in backend (Node.js)
7. 🎨 Implement in frontend (React component)
8. ✅ Test edge cases

---

**Status**: 📝 Algorithm design complete, ready for implementation
**Last Updated**: 2025-11-08
