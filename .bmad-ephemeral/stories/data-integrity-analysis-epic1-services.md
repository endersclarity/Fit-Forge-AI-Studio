# Data Integrity Analysis: Epic 1 Backend Services Integration

**Analysis Date:** 2025-11-11
**Scope:** Data contract validation for 4 Epic 1 backend services
**Severity:** CRITICAL issues found - requires fixes before Epic 2 API integration

---

## Executive Summary

**INTEGRATION READINESS: BLOCKED - Critical data contract mismatches found**

The 4 Epic 1 services have **incompatible data contracts** that will cause integration failures when connected via API endpoints in Epic 2. Two critical issues must be resolved:

1. **CRITICAL:** Exercise identifier inconsistency (exerciseId vs exercise name)
2. **MODERATE:** Property name mismatch between recoveryCalculator output and exerciseRecommender input
3. **MODERATE:** Missing validation for muscle name consistency across exercise library and baseline data

---

## Services Analyzed

1. `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\fatigueCalculator.js`
2. `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\recoveryCalculator.js`
3. `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\exerciseRecommender.js`
4. `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\baselineUpdater.js`

---

## Data Flow Architecture

```
User Workout
    ↓
[1] fatigueCalculator(workout, exercises, baselines)
    ↓ outputs: { muscleStates[], warnings[], timestamp }
    ↓
[2] recoveryCalculator(muscleStates, workoutTimestamp, currentTime)
    ↓ outputs: { muscles[], timestamp }
    ↓
[3] exerciseRecommender(targetMuscle, muscleStates, options)
    ↓ outputs: { safe[], unsafe[], totalFiltered }
    ↓
User completes workout
    ↓
[4] baselineUpdater(workoutExercises, workoutDate)
    ↓ outputs: baseline suggestions[]
```

---

## CRITICAL ISSUE 1: Exercise Identifier Inconsistency

### Problem

**fatigueCalculator** and **baselineUpdater** expect different exercise identifier formats:

**fatigueCalculator** (line 85):
```javascript
const exerciseData = exerciseMap[workoutEx.exerciseId];
// Expects: { exerciseId: "ex02", totalVolume: 2000 }
```

**baselineUpdater** (line 107):
```javascript
const exercise = exerciseLibrary.find(e => e.name === workoutEx.exercise);
// Expects: { exercise: "Dumbbell Bench Press", sets: [...] }
```

### Data Integrity Risk

**SEVERE: Data loss and service failures**

When API endpoints accept workout data in Epic 2:
- If using `exerciseId` format → baselineUpdater cannot find exercises (fails silently, skips unknown exercises)
- If using `exercise` name format → fatigueCalculator cannot find exercises (warns and skips)
- **Cannot satisfy both services with same workout data structure**

### Example Failure Scenario

```javascript
// API receives workout from client
const workout = {
  exercises: [
    { exerciseId: "ex02", totalVolume: 2000 }  // Works for fatigueCalculator
  ]
};

// Passed to baselineUpdater
baselineUpdater(workout.exercises, date);
// FAILS: exerciseLibrary.find(e => e.name === "ex02") returns undefined
// Result: No baseline updates suggested even if user exceeded capacity
```

### Required Fix

**Option A (Recommended):** Standardize on exerciseId
- Modify baselineUpdater to use `exerciseId` instead of exercise name
- Change line 107 from `e.name === workoutEx.exercise` to `e.id === workoutEx.exerciseId`
- Update all references to `workoutEx.exercise` to `workoutEx.exerciseId`

**Option B:** Accept both formats
- Add normalization layer in both services to accept either ID or name
- Higher complexity, more error-prone

**Option C:** API layer transformation
- API endpoint transforms data format for each service
- Violates single source of truth principle
- Increases API complexity and error risk

---

## MODERATE ISSUE 2: Property Name Mismatch

### Problem

**recoveryCalculator** outputs a `muscles` array, but **exerciseRecommender** parameter is named `muscleStates`:

**recoveryCalculator output** (line 227):
```javascript
return {
  muscles: recoveryStates,  // ← Property named "muscles"
  timestamp: currentTime
};
```

**exerciseRecommender input** (line 379):
```javascript
export function recommendExercises(targetMuscle, muscleStates, options = {}) {
  // Expects muscleStates parameter (array)
```

### Data Integrity Risk

**MODERATE: Integration complexity, potential for null reference errors**

At the API layer:
```javascript
// GET /recommendations endpoint
const recovery = calculateRecovery(muscleStates, workoutTime, currentTime);
// recovery = { muscles: [...], timestamp: "..." }

// Must extract muscles array before passing to recommender
const recommendations = recommendExercises("Quadriceps", recovery.muscles, options);
//                                                        ^^^^^^^^^^^^^^^^
//                                                        Must unwrap property
```

**Risk:** If developer forgets to extract `.muscles`, exerciseRecommender receives:
```javascript
muscleStates = { muscles: [...], timestamp: "..." }
```

This passes validation (it's an array-like object) but causes runtime errors when attempting array operations.

### Required Fix

**Option A (Recommended):** Rename recoveryCalculator output property
```javascript
// In recoveryCalculator.js line 227
return {
  muscleStates: recoveryStates,  // Changed from "muscles"
  timestamp: currentTime
};
```
- **Impact:** Must update recoveryCalculator tests
- **File:** `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\__tests__\recoveryCalculator.test.js`
- **Changes needed:** All references to `result.muscles` → `result.muscleStates`

**Option B:** Rename exerciseRecommender parameter
- Less preferred because "muscleStates" is used consistently across other services

---

## MODERATE ISSUE 3: Missing Muscle Name Validation

### Problem

**No validation ensures muscle names in exercise library exist in baseline data**

Current behavior:
- fatigueCalculator: Warns if muscle not found in baselines (line 130), continues processing
- exerciseRecommender: Has defensive MUSCLE_NAME_MAP but assumes mappings exist
- baselineUpdater: Has defensive MUSCLE_NAME_MAP, skips unknown muscles silently (line 217)

```javascript
// fatigueCalculator.js line 130
if (baseline === undefined || baseline === null) {
  console.warn(`Warning: No baseline found for muscle ${muscle}`);
  return;  // Skips this muscle entirely
}
```

### Data Integrity Risk

**MODERATE: Silent data degradation**

Scenario:
1. Exercise library contains muscle "Serratus" (not in baseline data)
2. User performs exercise targeting Serratus
3. fatigueCalculator skips Serratus (warns only)
4. Muscle states array missing Serratus data
5. User sees incomplete fatigue information
6. Recovery calculations ignore Serratus
7. Recommendations don't account for Serratus fatigue

**Result:** User could be recommended exercises that over-fatigue an untracked muscle.

### Current Muscle Name Consistency Status

**VERIFIED: Exercise library and baseline data are currently consistent**

Verified via grep search:
- Exercise library does NOT contain: "Deltoids (Anterior)", "Latissimus Dorsi", "Erector Spinae", "Rectus Abdominis", "Obliques"
- Exercise library DOES use standardized names: "AnteriorDeltoids", "PosteriorDeltoids", "Lats", "LowerBack", "Core"

**MUSCLE_NAME_MAP in exerciseRecommender/baselineUpdater is currently unused but provides defensive safety.**

### Required Fix

**Option A (Recommended):** Add startup validation
```javascript
// In each service initialization
function validateMuscleNames(exercises, baselines) {
  const baselineMuscles = new Set(baselines.map(b => b.muscle));
  const exerciseMuscles = new Set();

  exercises.forEach(ex => {
    ex.muscles.forEach(m => {
      const normalized = MUSCLE_NAME_MAP[m.muscle] || m.muscle;
      exerciseMuscles.add(normalized);
    });
  });

  const missing = [...exerciseMuscles].filter(m => !baselineMuscles.has(m));

  if (missing.length > 0) {
    throw new Error(
      `Data integrity error: Exercise library references muscles not in baseline data: ${missing.join(', ')}\n` +
      `This will cause incomplete fatigue tracking. Update baselines.json to include these muscles.`
    );
  }
}
```

**Option B:** Add runtime transformation
- Apply MUSCLE_NAME_MAP in fatigueCalculator before baseline lookup
- Less safe because it allows data inconsistency to persist

---

## Data Contract Specifications

### 1. fatigueCalculator

**Input Contract:**
```javascript
workout: {
  exercises: [
    {
      exerciseId: string,           // Must match exercise library ID
      totalVolume?: number,          // Optional pre-calculated volume
      sets?: [                       // Required if totalVolume not provided
        {
          weight: number,            // Weight in lbs
          reps: number               // Number of repetitions
        }
      ]
    }
  ]
}

exercises: {
  exercises: [
    {
      id: string,
      muscles: [
        {
          muscle: string,            // Must match baseline data muscle names
          percentage: number         // 0-100
        }
      ]
    }
  ]
} | Array  // Can be array or object with exercises property

baselines: {
  [muscleName: string]: number     // Muscle name → baseline capacity in lbs
}
```

**Output Contract:**
```javascript
{
  muscleStates: [
    {
      muscle: string,                // Muscle group name
      volume: number,                // Total volume in lbs (1 decimal)
      baseline: number,              // Baseline capacity in lbs
      fatiguePercent: number,        // Actual fatigue % (can exceed 100, 1 decimal)
      displayFatigue: number,        // Display fatigue capped at 100% (1 decimal)
      exceededBaseline: boolean      // True if fatiguePercent > 100
    }
  ],
  warnings: string[],                // Warning messages for >80% or >100%
  timestamp: string                  // ISO 8601 timestamp
}
```

### 2. recoveryCalculator

**Input Contract:**
```javascript
muscleStates: [
  {
    muscle: string,                  // Muscle group name
    fatiguePercent: number           // Initial fatigue percentage (≥0)
  }
]

workoutTimestamp: string             // ISO 8601 format
currentTime: string                  // ISO 8601 format
```

**Output Contract:**
```javascript
{
  muscles: [                         // ⚠️ ISSUE: Should be "muscleStates"
    {
      muscle: string,                // Muscle group name
      currentFatigue: number,        // Current fatigue % (1 decimal)
      projections: {
        "24h": number,               // Fatigue 24h from now (1 decimal)
        "48h": number,               // Fatigue 48h from now (1 decimal)
        "72h": number                // Fatigue 72h from now (1 decimal)
      },
      fullyRecoveredAt: string|null  // ISO 8601 timestamp or null if recovered
    }
  ],
  timestamp: string                  // ISO 8601 timestamp (same as currentTime)
}
```

### 3. exerciseRecommender

**Input Contract:**
```javascript
targetMuscle: string                 // Muscle group to target

muscleStates: [                      // Accepts output from either service
  {
    muscle: string,
    currentFatigue?: number,         // From recoveryCalculator
    fatiguePercent?: number          // From fatigueCalculator
    // At least one fatigue field required
  }
]

options: {
  availableEquipment?: string[],     // e.g., ["dumbbell", "trx"]
  workoutHistory?: string[],         // Recent exercise IDs or names
  userPreferences?: {
    favorites?: string[],            // Exercise IDs
    avoid?: string[]                 // Exercise IDs
  },
  estimatedSets?: number,            // Default: 3
  estimatedReps?: number,            // Default: 10
  estimatedWeight?: number           // Default: 100 lbs
}
```

**Output Contract:**
```javascript
{
  safe: [                            // Safe recommendations sorted by score
    {
      exercise: object,              // Full exercise object from library
      score: number,                 // 0-100 total score
      isSafe: true,
      warnings: [],                  // Empty for safe exercises
      factors: {
        targetMatch: number,         // 0-40 points
        freshness: number,           // 0-25 points
        variety: number,             // 0-15 points
        preference: number,          // 0-10 points
        primary: number,             // 0-10 points
        total: number                // Sum of above
      }
    }
  ],
  unsafe: [                          // Unsafe recommendations (would exceed baseline)
    {
      exercise: object,
      score: 0,
      isSafe: false,
      warnings: [
        {
          muscle: string,
          currentFatigue: number,
          projectedFatigue: number,
          overage: number,           // Amount over 100%
          engagement: number,        // Muscle engagement %
          addedVolume: number,       // Volume this exercise would add
          baseline: number,
          message: string
        }
      ],
      factors: object
    }
  ],
  totalFiltered: number              // Total eligible exercises before scoring
}
```

### 4. baselineUpdater

**Input Contract:**
```javascript
workoutExercises: [
  {
    exercise: string,                // ⚠️ ISSUE: Exercise NAME not ID
    sets: [
      {
        weight: number,              // Weight in lbs
        reps: number,                // Number of reps
        toFailure: boolean           // Only "to failure" sets are analyzed
      }
    ]
  }
]

workoutDate: string                  // ISO date (e.g., "2025-11-11")
```

**Output Contract:**
```javascript
[
  {
    muscle: string,                  // Muscle group name
    currentBaseline: number,         // Current baseline capacity
    suggestedBaseline: number,       // Suggested new baseline (= achievedVolume)
    achievedVolume: number,          // Maximum volume achieved
    exercise: string,                // Exercise name that triggered suggestion
    date: string,                    // Workout date
    percentIncrease: number          // Percent increase (1 decimal)
  }
]
```

---

## Integration Testing Requirements

Before Epic 2 API development, these integration scenarios MUST pass:

### Test 1: fatigueCalculator → recoveryCalculator
```javascript
const workout = {
  exercises: [
    { exerciseId: "ex02", totalVolume: 3000 }
  ]
};

const fatigue = calculateMuscleFatigue(workout, exerciseLibrary, baselines);
// fatigue.muscleStates must be valid input for recoveryCalculator

const recovery = calculateRecovery(
  fatigue.muscleStates,
  "2025-11-11T08:00:00Z",
  "2025-11-12T08:00:00Z"
);

// Should succeed without transformation
expect(recovery.muscles).toBeDefined();
expect(recovery.muscles.length).toBe(fatigue.muscleStates.length);
```

**Current Status:** PASSES (compatible)

### Test 2: recoveryCalculator → exerciseRecommender
```javascript
const recovery = calculateRecovery(muscleStates, workoutTime, currentTime);

// ⚠️ FAILS: Must extract .muscles property
const recommendations = recommendExercises("Quadriceps", recovery.muscles, options);

// Should succeed without manual property extraction
expect(recommendations.safe).toBeDefined();
```

**Current Status:** FAILS - requires property extraction

### Test 3: Workout data → fatigueCalculator + baselineUpdater
```javascript
const workoutData = {
  exercises: [
    { exerciseId: "ex02", sets: [{ weight: 135, reps: 10, toFailure: true }] }
  ]
};

// ⚠️ FAILS: Cannot use same data for both services
const fatigue = calculateMuscleFatigue(workoutData, exercises, baselines);
const baselineUpdates = checkForBaselineUpdates(workoutData.exercises, "2025-11-11");

// baselineUpdater expects exercise NAME not ID
// Must transform data structure
```

**Current Status:** FAILS - incompatible workout data formats

### Test 4: Muscle name consistency
```javascript
// Add exercise with unmapped muscle to library
const testExercise = {
  id: "test01",
  muscles: [{ muscle: "Serratus", percentage: 50 }]
};

const workout = { exercises: [{ exerciseId: "test01", totalVolume: 1000 }] };

// Should throw validation error, not silently skip
expect(() => calculateMuscleFatigue(workout, [testExercise], baselines))
  .toThrow(/muscle.*not found.*baseline/i);
```

**Current Status:** FAILS - warns but continues (silent degradation)

---

## Recommended Fix Priority

### PRIORITY 1 (BLOCKER): Exercise Identifier Standardization
**Timeline:** Must fix before Epic 2 Story 1 (POST /workouts endpoint)

1. Standardize baselineUpdater to use `exerciseId` instead of exercise name
2. Update baselineUpdater tests
3. Add integration test for workout data compatibility

**Files to modify:**
- `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\baselineUpdater.js`
  - Line 107: Change `e.name === workoutEx.exercise` to `e.id === workoutEx.exerciseId`
  - Line 230: Update exerciseContext property access if needed
- `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\__tests__\baselineUpdater.test.js`
  - Update all test data from `{ exercise: "name" }` to `{ exerciseId: "id" }`

### PRIORITY 2 (HIGH): Property Name Consistency
**Timeline:** Should fix before Epic 2 Story 3 (GET /recommendations endpoint)

1. Rename recoveryCalculator output property from `muscles` to `muscleStates`
2. Update recoveryCalculator tests
3. Add integration test for recoveryCalculator → exerciseRecommender flow

**Files to modify:**
- `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\recoveryCalculator.js`
  - Line 227: Change `muscles: recoveryStates` to `muscleStates: recoveryStates`
  - Update JSDoc comments to reflect property name
- `c:\Users\ender\.claude\projects\FitForge-Local\backend\services\__tests__\recoveryCalculator.test.js`
  - Change all `result.muscles` to `result.muscleStates`

### PRIORITY 3 (MEDIUM): Muscle Name Validation
**Timeline:** Should add before production deployment

1. Add startup validation function to each service
2. Throw descriptive errors if exercise library references unmapped muscles
3. Add validation tests

**Files to modify:**
- All four service files: Add validateMuscleNames() function and call at module load
- Add validation test suite

---

## API Layer Implications for Epic 2

### POST /workouts Endpoint
```javascript
// BEFORE fixes: Must transform data for each service
router.post('/workouts', async (req, res) => {
  const workoutData = req.body;

  // Transform for fatigueCalculator (expects exerciseId)
  const fatigueInput = {
    exercises: workoutData.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets
    }))
  };

  // Transform for baselineUpdater (expects exercise name)
  const baselineInput = workoutData.exercises.map(ex => ({
    exercise: getExerciseName(ex.exerciseId),  // ⚠️ Requires lookup
    sets: ex.sets
  }));

  const fatigue = calculateMuscleFatigue(fatigueInput, exercises, baselines);
  const updates = checkForBaselineUpdates(baselineInput, date);
});

// AFTER fixes: Single data format works for both
router.post('/workouts', async (req, res) => {
  const workoutData = req.body;  // Uses exerciseId consistently

  const fatigue = calculateMuscleFatigue(workoutData, exercises, baselines);
  const updates = checkForBaselineUpdates(workoutData.exercises, date);
  // No transformation needed
});
```

### GET /recommendations Endpoint
```javascript
// BEFORE fix: Must unwrap property
router.get('/recommendations/:muscle', async (req, res) => {
  const recovery = calculateRecovery(muscleStates, workoutTime, currentTime);
  const recommendations = recommendExercises(
    req.params.muscle,
    recovery.muscles,  // ⚠️ Must extract property
    options
  );
});

// AFTER fix: Direct pass-through
router.get('/recommendations/:muscle', async (req, res) => {
  const recovery = calculateRecovery(muscleStates, workoutTime, currentTime);
  const recommendations = recommendExercises(
    req.params.muscle,
    recovery.muscleStates,  // Consistent property name
    options
  );
});
```

---

## Conclusion

**The 4 Epic 1 services are NOT integration-ready without fixes.**

Critical issues:
1. Exercise identifier mismatch will cause silent failures in baselineUpdater
2. Property name mismatch requires manual data extraction at API layer
3. Missing validation allows silent data degradation

**All issues are fixable with targeted code changes. Recommended to fix Priority 1 and Priority 2 issues before beginning Epic 2 API development.**

---

## Appendix: Verified Data Consistency

### Muscle Names in Exercise Library
All exercises use standardized names matching baseline data:
- Pectoralis ✓
- Triceps ✓
- AnteriorDeltoids ✓
- PosteriorDeltoids ✓
- Lats ✓
- Biceps ✓
- Rhomboids ✓
- Trapezius ✓
- Forearms ✓
- Quadriceps ✓
- Glutes ✓
- Hamstrings ✓
- Calves ✓
- Core ✓
- LowerBack ✓

### Muscle Names in Baseline Data
Baseline data contains all 15 muscle groups (verified in baselines.json).

### MUSCLE_NAME_MAP Status
Currently unused but provides defensive safety. Maps:
- "Deltoids (Anterior)" → "AnteriorDeltoids"
- "Deltoids (Posterior)" → "PosteriorDeltoids"
- "Latissimus Dorsi" → "Lats"
- "Erector Spinae" → "LowerBack"
- "Rectus Abdominis" → "Core"
- "Obliques" → "Core"

These alternative names are NOT currently in the exercise library.
