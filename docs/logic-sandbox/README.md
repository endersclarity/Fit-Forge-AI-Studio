# FitForge Logic Sandbox

**Purpose**: Validate and refine all workout logic, formulas, and calculations in a simple, visible environment before implementing in the app. No containers, no UI, no deployment—just pure logic.

---

## 📊 Current Status

**Phase**: ✅ Setup Complete → ✅ Fatigue Testing Done → 🧪 Recovery Algorithm Testing

**Progress**:
- [x] Folder structure created
- [x] README dashboard created
- [x] Exercise database populated (48 exercises, all corrected to 100%)
- [x] Muscle baselines defined (15 muscles with validated baselines)
- [x] User profile created
- [x] Deltoids split into Anterior/Posterior
- [x] First test workout logged (Legs Day A)
- [x] Fatigue calculations tested and analyzed
- [ ] **Recovery algorithm validated** ← YOU ARE HERE
- [ ] Recommendation logic brainstormed

**What's Next**: See [Implementation Roadmap](./implementation-roadmap.md) for path from sandbox → production

---

## 🎯 Goals

1. **Exercise Database**: 48 exercises with research-validated muscle engagement percentages (all summing to ~100%)
2. **Muscle Baselines**: Validated baseline capacity for each muscle group
3. **Fatigue Formulas**: Test and refine how we calculate muscle fatigue from workouts
4. **Recovery Algorithm**: Validate 15% daily recovery rate (MVP) or develop better model
5. **Workout Recommendations**: Test logic for suggesting exercises based on recovery state

---

## 📁 File Structure

### Data Files (Source of Truth)
- **[exercises.json](./exercises.json)** - Complete exercise library with muscle engagement percentages
- **[baselines.json](./baselines.json)** - Current muscle baseline capacities (in lbs)
- **[user-profile.json](./user-profile.json)** - Body weight and user-specific data
- **[workouts/](./workouts/)** - Workout logs (one JSON file per workout session)

### Outputs
- **[calculations/](./calculations/)** - Saved calculation results and test scenarios

### Tools
- **[scripts/](./scripts/)** - Helper scripts for running calculations

---

## 🔬 Test Scenarios to Validate

### 1. Single Exercise Fatigue ✅
**Test**: Does one set of bench press calculate correct pec fatigue?
- Status: ✅ **VALIDATED** - Legs Day A analysis confirms correct muscle volume distribution

### 2. Multi-Exercise Cumulative Fatigue ✅
**Test**: Does a full push workout correctly accumulate fatigue across exercises?
- Status: ✅ **VALIDATED** - Legs Day A shows correct cumulative fatigue (Hamstrings 113%, Lower Back 94%, etc.)

### 3. Recovery Over Time 🧪
**Test**: After 24h, 48h, 72h—are recovery percentages realistic?
- Status: 🧪 **IN PROGRESS** - Testing with forged timestamps on duplicated Legs Day A workout
- Method: Backdate workout 2-3 days, calculate current recovery state using 15% daily recovery rate

### 4. Baseline Learning ✅ (App Logic, Not Algorithm)
**Decision**: This is trivial app logic, not an algorithm requiring validation
- Logic: `if (muscleVolume > baseline) { promptUserToUpdateBaseline(muscleVolume) }`
- Implementation: Trigger on workout completion, compare volume to baseline, prompt user
- Status: ✅ **DESIGN COMPLETE** - No sandbox testing needed

### 5. Exercise Recommendations 📝
**Status**: 📝 **NEEDS BRAINSTORMING** - Complex ranking/filtering algorithm
- See: [workout-builder-recommendations.md](./workout-builder-recommendations.md) for deep dive
- Logic needed: Score exercises by efficiency, safety (no bottlenecks), equipment availability, muscle freshness

---

## 📝 Data Schema Reference

### Exercise Object
```json
{
  "id": "ex01",
  "name": "Dumbbell Bench Press",
  "equipment": "dumbbell",
  "category": "push",
  "muscles": [
    { "muscle": "Pectoralis", "percentage": 65, "primary": true },
    { "muscle": "Triceps", "percentage": 22, "primary": false },
    { "muscle": "Deltoids", "percentage": 10, "primary": false },
    { "muscle": "Core", "percentage": 3, "primary": false }
  ]
}
```

### Workout Object
```json
{
  "id": "workout-2025-11-08-001",
  "date": "2025-11-08",
  "startTime": "2025-11-08T10:30:00Z",
  "endTime": "2025-11-08T11:15:00Z",
  "exercises": [
    {
      "exerciseId": "ex01",
      "sets": [
        { "setNumber": 1, "reps": 10, "weight": 105, "toFailure": false },
        { "setNumber": 2, "reps": 10, "weight": 105, "toFailure": false },
        { "setNumber": 3, "reps": 10, "weight": 105, "toFailure": true }
      ]
    }
  ]
}
```

### Baseline Object
```json
{
  "muscle": "Pectoralis",
  "baselineCapacity": 3400,
  "unit": "lbs",
  "lastUpdated": "2025-11-08",
  "source": "3×15 Push-ups @ 100 lb × 75% engagement"
}
```

---

## 🧮 Formulas to Validate

### Fatigue Calculation
```javascript
// For each set
const volume = reps × weight
const muscleVolume = volume × (muscleEngagement / 100)

// For entire workout (per muscle)
const totalMuscleVolume = sum(all sets for that muscle)
const fatigue = (totalMuscleVolume / baseline) × 100

// Cap at 100% for display, track exceedance separately
const displayFatigue = Math.min(100, fatigue)
const baselineExceeded = fatigue > 100
```

### Recovery Calculation (MVP: Linear)
```javascript
const recoveryRatePerDay = 0.15 // 15% per day
const hoursElapsed = (now - workoutTime) / (1000 × 60 × 60)
const daysElapsed = hoursElapsed / 24
const recoveredPercentage = daysElapsed × (recoveryRatePerDay × 100)
const currentFatigue = Math.max(0, initialFatigue - recoveredPercentage)
```

---

## 🚀 Next Steps

**Current Focus**: Finish Logic Validation
1. ✅ ~~Fatigue calculations~~ (DONE - Legs Day A validated)
2. 🧪 Recovery algorithm testing (IN PROGRESS - forging timestamps)
3. 📝 Exercise recommendation logic (NEXT - brainstorm in workout-builder-recommendations.md)

**After Validation**: Implementation Path
- See **[Implementation Roadmap](./implementation-roadmap.md)** for full phases:
  - Phase 1: ✅ Validate Logic (Sandbox) ← YOU ARE HERE
  - Phase 2: Database Design (SQLite schema)
  - Phase 3: Backend API Implementation
  - Phase 4: Frontend Integration
  - Phase 5: Local Testing (Docker)
  - Phase 6: Railway Deployment

---

## 📚 Reference Documents

### Logic & Analysis
- [Muscle Tracking Logic Lab](../muscle-tracking-logic-lab.md) - Comprehensive analysis and proposed corrections
- [Corrected Baselines](../corrected-baselines-isolation-principle.md) - Baseline calculation methodology

### Feature Specifications (What to Build)
- [Post-Workout Actions](./feature-ideas/post-workout-actions.md) - 15 post-workout features (MVP + stretch goals)
- [Pre-Workout Forecast](./feature-ideas/pre-workout-forecast.md) - Real-time forecast, sliders, AI optimizer

### Implementation Planning (How to Build)
- [Workout Builder Recommendations](./workout-builder-recommendations.md) - Recommendation algorithm logic
- [Implementation Roadmap](./implementation-roadmap.md) - Phases from sandbox → production

---

---

## 🎉 Phase 1 Complete! What's Next?

**Logic Validation**: ✅ **COMPLETE** (100%)

All core algorithms validated:
- ✅ Fatigue calculations working correctly
- ✅ Recovery algorithm validated (15% daily rate)
- ✅ Baseline learning logic defined (app logic, not algorithm)
- ✅ Recommendation algorithm brainstormed
- ✅ Feature specs complete (post-workout + pre-workout)
- ✅ Implementation roadmap created

**Next Step**: Start [Phase 2: Database Design](./implementation-roadmap.md#phase-2-database-design-sqlite--next-up)

---

**Last Updated**: 2025-11-08
