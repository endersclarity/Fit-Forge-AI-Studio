# target-driven-workout-generation Specification

## Purpose
TBD - created by archiving change enhance-quick-builder-smart-generation. Update Purpose after archive.
## Requirements
### Requirement: Muscle Fatigue Target Input

The system SHALL accept muscle fatigue targets as input, allowing users to specify target fatigue percentage for multiple muscles with optional constraints.

**Rationale:** Enables outcome-driven workout planning instead of exercise-first approach.

#### Scenario: User sets targets for push workout

**Given:** User is in Quick Builder Target Mode
**And:** Current muscle states: Pectoralis 45%, Triceps 30%, Deltoids 20%
**When:** User sets targets:
- Pectoralis: 80%
- Triceps: 60%
- Deltoids: max 40% (constraint to avoid overtraining)
**Then:** System stores targets as:
```typescript
[
  { muscle: 'Pectoralis', currentFatigue: 45, targetFatigue: 80, maxAllowed: null },
  { muscle: 'Triceps', currentFatigue: 30, targetFatigue: 60, maxAllowed: null },
  { muscle: 'Deltoids', currentFatigue: 20, targetFatigue: 100, maxAllowed: 40 }
]
```

---

### Requirement: Exercise Recommendation Generation

The system SHALL generate exercise recommendations to hit targets by selecting exercises and calculating volumes that efficiently achieve muscle targets without violating constraints.

**Rationale:** Automates intelligent workout design based on current muscle state.

#### Scenario: Generate workout for chest and triceps

**Given:** Targets: Pectoralis 45%→80% (+35%), Triceps 30%→60% (+30%)
**And:** Muscle baselines: Pectoralis 2,500 lbs, Triceps 1,800 lbs
**When:** System generates workout
**Then:** Recommendations include:
1. Bench Press (Pec 75%, Tri 40%, Delt 30% engagement)
   - Volume: 1,167 lbs → Pec +35%, Tri +26%
   - Suggested: 3×8@49 lbs
2. Tricep Pushdown (Tri 85%, Forearm 30%)
   - Volume: 85 lbs → Tri +4%
   - Suggested: 3×10@3 lbs
**And:** Projected results: Pec 80%, Tri 60% (targets met)

#### Scenario: Respect constraint limits

**Given:** Deltoids currently at 20%, max allowed 40%
**And:** Target requires exercises engaging deltoids
**When:** Algorithm selects exercises
**Then:** Total deltoid fatigue increase limited to +20%
**And:** Exercises with high deltoid engagement ranked lower
**And:** If target impossible without exceeding limit, show error: "Cannot reach chest 100% without exceeding shoulder limit of 40%"

---

### Requirement: Exercise Efficiency Scoring

The system SHALL calculate exercise efficiency scores by ranking exercises based on how effectively they hit target muscles without wasting capacity on constrained muscles.

**Rationale:** Greedy algorithm needs scoring function to pick best exercises first.

#### Scenario: Score exercise for target muscle

**Given:** Target muscle: Triceps (need +30% fatigue)
**And:** Candidate: Close-Grip Bench Press (Tri 65%, Pec 50%, Delt 25%)
**And:** Pectoralis has 10% headroom before constraint
**When:** System calculates efficiency score
**Then:** Target engagement contribution: 65
**And:** Collateral risk: (50/10) = 5 (high Pec engagement vs low headroom)
**And:** Efficiency score: 65 / (1 + 5) = 10.8

#### Scenario: Compare isolation vs compound for constrained scenario

**Given:** Target: Triceps +30%, Deltoids max 40% (20% headroom)
**And:** Option A: Overhead Tricep Extension (Tri 75%, Delt 40%)
**And:** Option B: Tricep Pushdown (Tri 85%, Forearm 30%, Delt 0%)
**When:** System scores both
**Then:** Option A score: 75 / (1 + 40/20) = 25
**And:** Option B score: 85 / (1 + 0) = 85
**And:** Option B ranked higher (isolation better when constrained)

---

### Requirement: Generation Performance Budget

The system SHALL complete workout generation in less than 500ms, returning recommendations within performance budget.

**Rationale:** Real-time UI interaction requires fast computation.

#### Scenario: Generate 3-exercise workout quickly

**Given:** 3 muscle targets specified
**And:** Exercise library contains 48 exercises
**When:** User clicks "Generate Workout"
**Then:** Algorithm completes in <500ms (95th percentile)
**And:** Returns 3-5 exercise recommendations

---

