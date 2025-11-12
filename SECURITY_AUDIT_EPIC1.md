# Security Audit Report - Epic 1 Calculation Services

**Audit Date:** 2025-11-10
**Auditor:** Application Security Specialist
**Scope:** Backend calculation services for FitForge AI workout tracking

---

## Executive Summary

**Overall Security Rating: ⚠️ VULNERABLE - Medium Risk**

Four backend calculation services were audited prior to API integration in Epic 2. While no **critical** vulnerabilities requiring immediate remediation were found, **multiple medium and low severity issues** exist that could be exploited once these services are exposed via REST API endpoints.

### Key Findings:
- **0 Critical** vulnerabilities (data breach, RCE, SQL injection)
- **3 High** severity issues (input validation, DoS, type coercion)
- **5 Medium** severity issues (error handling, logic flaws, data exposure)
- **4 Low** severity issues (dependency security, hardcoded values)

**Recommendation:** Address HIGH severity issues before Epic 2 API integration. Medium issues should be remediated before production deployment.

---

## Services Audited

1. `backend/services/fatigueCalculator.js` (176 lines)
2. `backend/services/recoveryCalculator.js` (172 lines)
3. `backend/services/exerciseRecommender.js` (363 lines)
4. `backend/services/baselineUpdater.js` (172 lines)

**Data Dependencies:**
- `docs/logic-sandbox/exercises.json` (1058 lines, 40 exercises)

---

## Detailed Findings

### 🔴 HIGH SEVERITY

#### H-1: Missing Input Validation - Resource Exhaustion (DoS)
**Location:** All services - no input validation on function parameters
**Files:**
- `fatigueCalculator.js:29` - `calculateFatigue(workout, baselines)`
- `recoveryCalculator.js:24` - `calculateRecovery(initialFatigue, workoutTimestamp, currentTime)`
- `exerciseRecommender.js:247` - `recommendExercises(params)`
- `baselineUpdater.js:19` - `checkBaselineUpdates(muscleVolumes, baselines, workoutDate, workoutId)`

**Vulnerability:**
None of the services validate input parameters before processing. Malicious or malformed inputs can cause:
- **Array/Object traversal attacks:** Extremely large workout arrays with thousands of exercises/sets
- **Memory exhaustion:** Processing massive volumes calculations
- **CPU exhaustion:** Nested loops with unbounded iteration

**Exploitation Scenario:**
```javascript
// Attack payload via API in Epic 2
const maliciousWorkout = {
  exercises: Array(100000).fill({
    exerciseId: 'ex02',
    sets: Array(1000).fill({ weight: 999999, reps: 999999 })
  })
};

// This would cause:
// 1. 100M+ loop iterations in fatigueCalculator
// 2. Numeric overflow in volume calculations
// 3. Server unresponsiveness/crash
```

**Impact:**
- Denial of Service (DoS)
- API endpoint becomes unresponsive
- Cascading failures affecting other users
- Resource exhaustion on shared infrastructure

**Remediation:**
```javascript
// Add input validation with limits
function calculateFatigue(workout, baselines) {
  // Validate workout structure
  if (!workout || typeof workout !== 'object') {
    throw new Error('Invalid workout object');
  }

  if (!Array.isArray(workout.exercises)) {
    throw new Error('Workout exercises must be an array');
  }

  // Enforce reasonable limits
  const MAX_EXERCISES = 50;
  const MAX_SETS_PER_EXERCISE = 20;

  if (workout.exercises.length > MAX_EXERCISES) {
    throw new Error(`Workout cannot exceed ${MAX_EXERCISES} exercises`);
  }

  workout.exercises.forEach((ex, idx) => {
    if (!Array.isArray(ex.sets)) {
      throw new Error(`Exercise ${idx} must have sets array`);
    }

    if (ex.sets.length > MAX_SETS_PER_EXERCISE) {
      throw new Error(`Exercise cannot exceed ${MAX_SETS_PER_EXERCISE} sets`);
    }

    ex.sets.forEach((set, setIdx) => {
      // Validate numeric ranges
      if (typeof set.weight !== 'number' || set.weight < 0 || set.weight > 10000) {
        throw new Error(`Invalid weight in exercise ${idx}, set ${setIdx}`);
      }
      if (typeof set.reps !== 'number' || set.reps < 0 || set.reps > 1000) {
        throw new Error(`Invalid reps in exercise ${idx}, set ${setIdx}`);
      }
    });
  });

  // Validate baselines object
  if (!baselines || typeof baselines !== 'object') {
    throw new Error('Invalid baselines object');
  }

  // Continue with calculation...
}
```

**Priority:** ⚠️ HIGH - Implement before Epic 2 API integration

---

#### H-2: Integer Overflow in Volume Calculations
**Location:** `fatigueCalculator.js:45` and `exerciseRecommender.js:86`

**Vulnerability:**
```javascript
// fatigueCalculator.js:45
workoutEx.sets.forEach(set => {
  exerciseVolume += set.weight * set.reps; // No overflow protection
});

// exerciseRecommender.js:86
const estimatedVolume = estimatedSets * estimatedReps * estimatedWeight;
```

JavaScript's `Number.MAX_SAFE_INTEGER` is `9007199254740991`. With malicious inputs:
- `weight: 999999, reps: 999999` → `999998000001` per set
- 10 sets → `9999980000010` → **exceeds safe integer range**
- Results in loss of precision, incorrect fatigue calculations

**Exploitation Scenario:**
```javascript
// Attacker provides extreme values
const attack = {
  exercises: [{
    exerciseId: 'ex02',
    sets: [
      { weight: 999999, reps: 999999 },
      { weight: 999999, reps: 999999 },
      // ... 10 sets
    ]
  }]
};

// Result: Integer overflow → incorrect fatigue → user overtrain injury risk
```

**Impact:**
- Incorrect fatigue calculations
- Physical safety risk (users may overtrain)
- Data integrity corruption

**Remediation:**
```javascript
const MAX_VOLUME_PER_SET = 100000; // 500 lbs × 200 reps = reasonable max

workoutEx.sets.forEach(set => {
  const setVolume = set.weight * set.reps;

  if (setVolume > MAX_VOLUME_PER_SET) {
    throw new Error(`Set volume exceeds maximum (${MAX_VOLUME_PER_SET})`);
  }

  if (!Number.isSafeInteger(exerciseVolume + setVolume)) {
    throw new Error('Volume calculation overflow detected');
  }

  exerciseVolume += setVolume;
});
```

**Priority:** ⚠️ HIGH - Physical safety concern

---

#### H-3: Type Coercion Vulnerabilities
**Location:** Multiple locations across all services

**Vulnerability:**
JavaScript's loose typing allows type coercion attacks:

```javascript
// fatigueCalculator.js:80
const fatiguePercent = (volume / baseline) * 100;
// If baseline = "100" (string), division still works but unexpected

// recoveryCalculator.js:27
const hoursElapsed = (currentTime - workoutTime) / (1000 * 60 * 60);
// If workoutTime is string "2025-01-01", Date coercion may fail silently

// exerciseRecommender.js:153
const engagementScore = (targetEngagement.percentage / 100) * SCORING_WEIGHTS.targetMatch;
// If percentage is "50" (string), still calculates but semantically wrong
```

**Exploitation Scenario:**
```javascript
// API sends string values instead of numbers
const payload = {
  initialFatigue: "80",      // String instead of number
  workoutTimestamp: "invalid-date",
  currentTime: null
};

// recoveryCalculator processes this:
// - Date coercion fails → NaN
// - Arithmetic with NaN propagates
// - Returns { currentFatigue: NaN, status: undefined }
```

**Impact:**
- Silent calculation failures
- NaN propagation through entire calculation chain
- Incorrect recommendations (safety risk)
- Unpredictable application behavior

**Remediation:**
Add strict type checking at function boundaries:

```javascript
function calculateRecovery(initialFatigue, workoutTimestamp, currentTime = new Date()) {
  // Strict type validation
  if (typeof initialFatigue !== 'number' || !Number.isFinite(initialFatigue)) {
    throw new TypeError('initialFatigue must be a finite number');
  }

  if (!(workoutTimestamp instanceof Date) && typeof workoutTimestamp !== 'string') {
    throw new TypeError('workoutTimestamp must be a Date or ISO string');
  }

  if (!(currentTime instanceof Date)) {
    throw new TypeError('currentTime must be a Date object');
  }

  // Validate date is valid
  const workoutTime = new Date(workoutTimestamp);
  if (isNaN(workoutTime.getTime())) {
    throw new Error('Invalid workoutTimestamp date');
  }

  // Continue with calculation...
}
```

**Priority:** ⚠️ HIGH - Data integrity and safety

---

### 🟡 MEDIUM SEVERITY

#### M-1: Insufficient Error Information Leakage Protection
**Location:** Multiple console.warn statements

**Files:**
- `fatigueCalculator.js:38` - `console.warn(\`Exercise ${workoutEx.exerciseId} not found\`)`
- `fatigueCalculator.js:68` - `console.warn(\`No baseline found for muscle: ${muscle}\`)`

**Vulnerability:**
While these are warnings (not exposed to client in current implementation), when API is integrated:
- Internal IDs and muscle names exposed in logs
- Stack traces may leak file paths and internal structure
- Error messages may reveal business logic

**Exploitation Scenario:**
```javascript
// Attacker probes with invalid IDs to map internal structure
fetch('/api/calculate-fatigue', {
  body: JSON.stringify({
    exercises: [{ exerciseId: 'DROP TABLE exercises;--' }]
  })
});

// Server logs: "Exercise DROP TABLE exercises;-- not found"
// Reveals: 1) ID format, 2) Logging behavior, 3) No input sanitization
```

**Impact:**
- Information disclosure
- Reconnaissance for further attacks
- Reveals internal implementation details

**Remediation:**
```javascript
// Use structured logging with sanitization
const logger = require('./utils/logger');

if (!exerciseData) {
  logger.warn('Exercise not found', {
    exerciseId: sanitizeForLogging(workoutEx.exerciseId),
    userId: req.userId,
    timestamp: new Date().toISOString()
  });

  // Return generic error to client
  throw new Error('Invalid exercise reference');
}

// Sanitization function
function sanitizeForLogging(value) {
  if (typeof value !== 'string') return '[non-string]';

  // Remove special characters, limit length
  return value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50);
}
```

**Priority:** 🟡 MEDIUM - Implement before Epic 2

---

#### M-2: Prototype Pollution via Object Manipulation
**Location:** `fatigueCalculator.js:53` and similar patterns

**Vulnerability:**
```javascript
// fatigueCalculator.js:53
if (!muscleVolumes[muscle.muscle]) {
  muscleVolumes[muscle.muscle] = 0;
}
muscleVolumes[muscle.muscle] += muscleVolume;
```

If `muscle.muscle` comes from untrusted data (exercises.json is loaded from file, not user input currently, but pattern is risky), keys like `__proto__`, `constructor`, `prototype` could pollute the object prototype.

**Exploitation Scenario:**
```javascript
// If exercises.json was compromised or user-provided:
{
  "muscle": "__proto__",
  "percentage": 100,
  "primary": true
}

// Results in:
muscleVolumes["__proto__"] = someValue;
// Pollutes Object.prototype
```

**Current Risk:** LOW (exercises.json is static)
**Future Risk:** HIGH if exercises become user-defined

**Remediation:**
```javascript
// Use Object.create(null) for data objects
const muscleVolumes = Object.create(null);

// Or use Map for key-value storage
const muscleVolumes = new Map();

// Or validate keys
const ALLOWED_MUSCLES = new Set([
  'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
  'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
  'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
]);

if (!ALLOWED_MUSCLES.has(muscle.muscle)) {
  throw new Error('Invalid muscle name');
}
```

**Priority:** 🟡 MEDIUM - Preventive measure

---

#### M-3: No Rate Limiting Consideration
**Location:** All services (architectural concern)

**Vulnerability:**
These calculation services have no built-in rate limiting or request throttling. While this is typically handled at API gateway level, expensive calculations should have internal protections.

**Exploitation Scenario:**
```javascript
// Attacker floods API with legitimate-looking requests
for (let i = 0; i < 10000; i++) {
  fetch('/api/recommend-exercises', {
    body: JSON.stringify({
      targetMuscle: 'Pectoralis',
      currentWorkout: [...50 exercises...],
      // Each request triggers scoring algorithm for 40 exercises
    })
  });
}

// Server processes 10,000 × 40 = 400,000 scoring calculations
```

**Impact:**
- Resource exhaustion
- Degraded performance for all users
- Increased infrastructure costs

**Remediation:**
```javascript
// Add internal request tracking
const requestCache = new Map();
const REQUEST_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function checkRateLimit(userId, operation) {
  const key = `${userId}:${operation}`;
  const now = Date.now();

  if (!requestCache.has(key)) {
    requestCache.set(key, []);
  }

  const requests = requestCache.get(key);

  // Remove old requests
  const recentRequests = requests.filter(ts => now - ts < REQUEST_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  recentRequests.push(now);
  requestCache.set(key, recentRequests);
}
```

**Priority:** 🟡 MEDIUM - Implement at API layer in Epic 2

---

#### M-4: Unbounded Recursion Risk in Exercise Scoring
**Location:** `exerciseRecommender.js:271-313`

**Vulnerability:**
While not directly recursive, the scoring algorithm processes:
- All eligible exercises (potentially all 40)
- All muscles per exercise (up to 8)
- All current workout exercises for variety scoring

With malicious input, this becomes O(n²) complexity.

**Exploitation Scenario:**
```javascript
// Attacker provides maximum complexity input
const attack = {
  targetMuscle: 'Pectoralis',
  currentWorkout: Array(50).fill({}), // 50 exercises
  availableEquipment: [], // No filter (all 40 exercises eligible)
};

// Results in:
// - 40 exercises scored
// - Each checks all 50 current workout exercises
// - 40 × 50 = 2000 comparisons per request
```

**Impact:**
- Slow response times
- CPU exhaustion
- Poor user experience

**Remediation:**
```javascript
// Add complexity limits
const MAX_CURRENT_WORKOUT_SIZE = 30;
const MAX_SCORED_EXERCISES = 20;

if (currentWorkout.length > MAX_CURRENT_WORKOUT_SIZE) {
  throw new Error(`Current workout size exceeds maximum (${MAX_CURRENT_WORKOUT_SIZE})`);
}

// Limit scoring to top candidates based on quick heuristic
const quickFiltered = eligibleExercises
  .filter(ex => hasHighTargetEngagement(ex, targetMuscle))
  .slice(0, MAX_SCORED_EXERCISES);
```

**Priority:** 🟡 MEDIUM - Performance optimization

---

#### M-5: Division by Zero Not Consistently Handled
**Location:** Multiple division operations

**Vulnerability:**
```javascript
// fatigueCalculator.js:80
const fatiguePercent = (volume / baseline) * 100;
// If baseline = 0, returns Infinity

// recoveryCalculator.js:102
const daysNeeded = initialFatigue / (RECOVERY_RATE_PER_DAY * 100);
// Safe because constant is non-zero, but pattern is risky

// exerciseRecommender.js:168
const avgWeightedFatigue = totalEngagement > 0 ? totalWeightedFatigue / totalEngagement : 0;
// Good - handles zero case
```

**Exploitation Scenario:**
```javascript
// User or database corruption sets baseline to 0
const baselines = { Pectoralis: 0 };

const result = calculateFatigue(workout, baselines);
// Returns { fatiguePercent: Infinity, exceededBaseline: true }

// This propagates through system:
// - Infinity values in database
// - JSON serialization issues
// - Frontend display errors
```

**Impact:**
- Data corruption
- Application errors
- Poor user experience

**Remediation:**
```javascript
// Validate baselines before calculation
Object.keys(baselines).forEach(muscle => {
  if (typeof baselines[muscle] !== 'number' || baselines[muscle] <= 0) {
    throw new Error(`Invalid baseline for ${muscle}: must be positive number`);
  }
});

// Add defensive check in calculation
if (!baseline || baseline <= 0) {
  console.error(`Invalid baseline for muscle: ${muscle}`);
  fatigueResults[muscle] = {
    volume,
    baseline: null,
    fatiguePercent: 0,
    displayFatigue: 0,
    exceededBaseline: false,
    error: 'Invalid baseline'
  };
  return;
}
```

**Priority:** 🟡 MEDIUM - Data integrity

---

### 🟢 LOW SEVERITY

#### L-1: No Dependency Security - exercises.json Trust
**Location:** `fatigueCalculator.js:12`, `exerciseRecommender.js:16`

**Vulnerability:**
Both services unconditionally trust `exercises.json`:
```javascript
const exercisesData = require('../../docs/logic-sandbox/exercises.json');
```

**Risk Factors:**
1. JSON file is in `docs/` directory (not `backend/data/`)
2. No integrity check (hash validation)
3. No schema validation
4. Loaded at module initialization (can't be updated without restart)

**Current Risk:** LOW - File is version-controlled and static
**Future Risk:** MEDIUM - If file becomes dynamic or user-modifiable

**Remediation:**
```javascript
// 1. Validate schema on load
const Joi = require('joi');

const exerciseSchema = Joi.object({
  exercises: Joi.array().items(
    Joi.object({
      id: Joi.string().pattern(/^ex\d+$/).required(),
      name: Joi.string().max(100).required(),
      equipment: Joi.string().valid(
        'barbell', 'dumbbell', 'kettlebell', 'cable-machine',
        'smith-machine', 'bodyweight', 'trx', 'resistance-band', 'pull-up-bar'
      ).required(),
      category: Joi.string().valid('push', 'pull', 'legs', 'core', 'cardio').required(),
      muscles: Joi.array().items(
        Joi.object({
          muscle: Joi.string().required(),
          percentage: Joi.number().min(0).max(100).required(),
          primary: Joi.boolean().required()
        })
      ).min(1).required()
    })
  ).required()
});

const exercisesData = require('../../docs/logic-sandbox/exercises.json');
const { error } = exerciseSchema.validate(exercisesData);

if (error) {
  throw new Error(`Invalid exercises.json schema: ${error.message}`);
}

// 2. Move to backend/data/ directory with access controls
// 3. Add integrity check
const crypto = require('crypto');
const fs = require('fs');

function loadExercisesWithIntegrity(filePath, expectedHash) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  if (hash !== expectedHash) {
    throw new Error('exercises.json integrity check failed');
  }

  return JSON.parse(content);
}
```

**Priority:** 🟢 LOW - Enhancement for production

---

#### L-2: Hardcoded Magic Numbers
**Location:** Multiple files

**Vulnerability:**
```javascript
// recoveryCalculator.js:12-14
const RECOVERY_RATE_PER_DAY = 0.15;
const READY_TO_TRAIN_THRESHOLD = 40;
const CAUTION_THRESHOLD = 80;

// exerciseRecommender.js:28-30
const MIN_ENGAGEMENT_THRESHOLD = 5;
const BOTTLENECK_WARNING_THRESHOLD = 80;
const BASELINE_EXCEEDANCE_THRESHOLD = 100;

// baselineUpdater.js:108
maxIncreasePercent = 50
```

While these are documented constants, they're hardcoded. This makes:
- A/B testing different recovery rates impossible
- Per-user customization difficult
- Scientific validation updates require code changes

**Impact:**
- Inflexibility
- Requires redeployment for tuning
- Limited personalization

**Remediation:**
```javascript
// Move to configuration file or database
const config = require('../config/calculation-params');

const RECOVERY_RATE_PER_DAY = config.get('recovery.ratePerDay', 0.15);
const READY_TO_TRAIN_THRESHOLD = config.get('recovery.readyThreshold', 40);

// Or allow per-user overrides
function calculateRecovery(initialFatigue, workoutTimestamp, currentTime, options = {}) {
  const recoveryRate = options.recoveryRate || RECOVERY_RATE_PER_DAY;
  // ...
}
```

**Priority:** 🟢 LOW - Future enhancement

---

#### L-3: No Input Sanitization for String Fields
**Location:** `baselineUpdater.js:46` and error messages

**Vulnerability:**
```javascript
// baselineUpdater.js:46
workoutId
// This is passed through without validation
```

While `workoutId` isn't used in calculations, it's returned in results. If this comes from user input in Epic 2:
- XSS risk if displayed in frontend without escaping
- Log injection if written to logs
- Database injection if stored without parameterization

**Current Risk:** LOW - Not yet exposed to user input
**Future Risk:** MEDIUM - When API accepts workoutId

**Remediation:**
```javascript
function validateWorkoutId(workoutId) {
  if (workoutId === null || workoutId === undefined) {
    return null;
  }

  if (typeof workoutId !== 'string') {
    throw new TypeError('workoutId must be a string');
  }

  // Validate format (UUID, numeric ID, etc.)
  if (!/^[a-zA-Z0-9-_]{1,50}$/.test(workoutId)) {
    throw new Error('Invalid workoutId format');
  }

  return workoutId;
}
```

**Priority:** 🟢 LOW - Implement in Epic 2 API layer

---

#### L-4: No Logging/Audit Trail for Security Events
**Location:** All services (architectural)

**Vulnerability:**
Services have no built-in security event logging:
- No tracking of invalid inputs
- No detection of repeated failures
- No audit trail for recommendations

**Impact:**
- Security incidents go undetected
- Difficult to identify attack patterns
- No forensic capability after breach

**Remediation:**
```javascript
const securityLogger = require('./utils/securityLogger');

function calculateFatigue(workout, baselines) {
  try {
    // Validation...
  } catch (error) {
    securityLogger.warn('Invalid input detected', {
      function: 'calculateFatigue',
      error: error.message,
      inputHash: hashInput(workout),
      timestamp: new Date().toISOString(),
      // Don't log actual input (PII/large data)
    });
    throw error;
  }
}

// Detect attack patterns
const anomalyDetector = require('./utils/anomalyDetector');
anomalyDetector.track('fatigue_calculation', {
  exerciseCount: workout.exercises.length,
  totalVolume: calculateTotalVolume(workout)
});
```

**Priority:** 🟢 LOW - Implement monitoring in Epic 2

---

## exercises.json Security Analysis

**File:** `docs/logic-sandbox/exercises.json` (1058 lines, 40 exercises)

**Structure:**
```json
{
  "exercises": [
    {
      "id": "ex02",
      "name": "Dumbbell Bench Press",
      "equipment": "dumbbell",
      "category": "push",
      "muscles": [
        {
          "muscle": "Pectoralis",
          "percentage": 65,
          "primary": true
        }
      ]
    }
  ]
}
```

**Security Assessment:**

✅ **Safe to Use Directly:**
- Static data (version-controlled)
- Simple JSON structure
- No executable code
- No user-generated content
- Validated structure

⚠️ **Potential Risks:**
1. **No schema validation** - Malformed data could crash services
2. **Loaded at startup** - Can't detect runtime corruption
3. **No integrity checking** - File modification undetected
4. **Doc directory** - Non-standard location for data

**Recommendation:** Safe for MVP, but add validation before production (see L-1 remediation).

---

## Dependency Analysis

**Direct Dependencies:**
```javascript
// All services
- No external dependencies
- Only require() for local JSON file

// No package.json dependencies analyzed
```

**Recommendations:**
1. Run `npm audit` regularly
2. Add dependency scanning to CI/CD
3. Use tools like Snyk or Dependabot
4. Pin dependency versions

---

## Attack Scenarios Summary

### Scenario 1: Resource Exhaustion DoS
**Attacker Goal:** Crash server or make unresponsive

**Attack Vector:**
```javascript
POST /api/calculate-fatigue
{
  "workout": {
    "exercises": Array(10000).fill({
      "exerciseId": "ex02",
      "sets": Array(1000).fill({ "weight": 999999, "reps": 999999 })
    })
  },
  "baselines": {...}
}
```

**Current Defense:** None
**Impact:** Critical - Server crash
**Remediation Priority:** HIGH

---

### Scenario 2: Type Confusion Attack
**Attacker Goal:** Cause calculation errors, bypass business logic

**Attack Vector:**
```javascript
POST /api/calculate-recovery
{
  "initialFatigue": "80",     // String instead of number
  "workoutTimestamp": null,   // Null instead of Date
  "currentTime": undefined
}
```

**Current Defense:** None
**Impact:** High - Incorrect recommendations
**Remediation Priority:** HIGH

---

### Scenario 3: Algorithmic Complexity Attack
**Attacker Goal:** Slow down server, waste resources

**Attack Vector:**
```javascript
POST /api/recommend-exercises
{
  "targetMuscle": "Pectoralis",
  "currentWorkout": Array(50).fill({ exerciseId: "ex" + Math.random() }),
  "availableEquipment": [], // Force scoring all 40 exercises
  "currentFatigue": {} // All muscles fresh
}
```

**Current Defense:** None
**Impact:** Medium - Slow response
**Remediation Priority:** MEDIUM

---

## Recommendations by Priority

### Before Epic 2 API Integration (HIGH)

1. **Add comprehensive input validation** (H-1)
   - Validate all function parameters
   - Enforce size limits (exercises, sets, arrays)
   - Validate numeric ranges (weight, reps, percentages)
   - Add type checking

2. **Implement overflow protection** (H-2)
   - Validate safe integer ranges
   - Add maximum volume limits
   - Check for calculation overflows

3. **Add strict type validation** (H-3)
   - No implicit type coercion
   - Validate Date objects
   - Check for NaN/Infinity propagation

4. **Sanitize error messages** (M-1)
   - Don't leak internal IDs
   - Use generic error messages for clients
   - Implement structured logging

5. **Add prototype pollution protection** (M-2)
   - Use `Object.create(null)` or `Map`
   - Whitelist muscle names
   - Validate all object keys

### Before Production Deployment (MEDIUM)

6. **Implement rate limiting** (M-3)
   - Add request throttling
   - Track expensive operations
   - Set usage quotas

7. **Optimize algorithm complexity** (M-4)
   - Add early termination
   - Limit scoring candidates
   - Implement caching

8. **Add division-by-zero protection** (M-5)
   - Validate baselines > 0
   - Handle edge cases gracefully
   - Return meaningful errors

### Post-MVP Enhancements (LOW)

9. **Validate exercises.json schema** (L-1)
   - Add Joi/Zod validation
   - Implement integrity checking
   - Move to secure location

10. **Externalize configuration** (L-2)
    - Move constants to config
    - Enable A/B testing
    - Allow per-user customization

11. **Add input sanitization** (L-3)
    - Validate string formats
    - Prevent injection attacks
    - Escape output

12. **Implement security logging** (L-4)
    - Log security events
    - Detect anomalies
    - Enable forensics

---

## Testing Recommendations

### Security Test Cases to Add:

```javascript
describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should reject workout with >50 exercises', () => {
      const malicious = { exercises: Array(51).fill({}) };
      expect(() => calculateFatigue(malicious, {})).toThrow();
    });

    it('should reject sets with >20 entries', () => {
      const malicious = {
        exercises: [{ exerciseId: 'ex02', sets: Array(21).fill({}) }]
      };
      expect(() => calculateFatigue(malicious, {})).toThrow();
    });

    it('should reject weight > 10000 lbs', () => {
      const malicious = {
        exercises: [{
          exerciseId: 'ex02',
          sets: [{ weight: 10001, reps: 10 }]
        }]
      };
      expect(() => calculateFatigue(malicious, {})).toThrow();
    });

    it('should reject reps > 1000', () => {
      const malicious = {
        exercises: [{
          exerciseId: 'ex02',
          sets: [{ weight: 100, reps: 1001 }]
        }]
      };
      expect(() => calculateFatigue(malicious, {})).toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should reject string fatigue value', () => {
      expect(() => calculateRecovery("80", new Date())).toThrow(TypeError);
    });

    it('should reject invalid date objects', () => {
      expect(() => calculateRecovery(80, "invalid-date")).toThrow();
    });

    it('should reject NaN inputs', () => {
      expect(() => calculateRecovery(NaN, new Date())).toThrow();
    });
  });

  describe('Overflow Protection', () => {
    it('should detect integer overflow in volume', () => {
      const overflow = {
        exercises: [{
          exerciseId: 'ex02',
          sets: Array(10).fill({ weight: 999999, reps: 999999 })
        }]
      };
      expect(() => calculateFatigue(overflow, {})).toThrow(/overflow/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle baseline = 0 gracefully', () => {
      const result = calculateFatigue(validWorkout, { Pectoralis: 0 });
      expect(result.Pectoralis.fatiguePercent).not.toBe(Infinity);
    });

    it('should handle empty workout', () => {
      const result = calculateFatigue({ exercises: [] }, {});
      expect(result).toEqual({});
    });
  });
});
```

---

## Conclusion

The four calculation services are **mathematically sound but lack defensive security measures**. The current implementation assumes trusted input, which is acceptable for internal functions but **dangerous for API endpoints**.

**Critical Path to Production:**
1. ✅ Implement HIGH severity fixes (input validation, overflow protection, type safety)
2. ⚠️ Add MEDIUM severity protections (rate limiting, error sanitization)
3. 🔄 Deploy security testing suite
4. 📊 Add monitoring and logging
5. 🚀 Safe for Epic 2 API integration

**Estimated Remediation Time:**
- HIGH fixes: 8-16 hours
- MEDIUM fixes: 4-8 hours
- Testing: 4-6 hours
- **Total: 16-30 hours**

---

**Next Steps:**
1. Review findings with development team
2. Prioritize HIGH severity remediations
3. Create implementation tasks
4. Add security test suite
5. Document secure API patterns for Epic 2
6. Schedule security review after Epic 2 implementation

---

**Audit Completed:** 2025-11-10
**Auditor Signature:** Application Security Specialist
**Status:** Ready for remediation planning
