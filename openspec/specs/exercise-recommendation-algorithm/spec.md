# exercise-recommendation-algorithm Specification

## Purpose
This specification defines the algorithm for calculating exercise recommendations based on current muscle fatigue states, equipment availability, and user preferences.
## Requirements
### Requirement: System SHALL calculate opportunity scores for exercises
**ID:** REC-ALG-001

The system SHALL calculate an opportunity score for each exercise based on current muscle fatigue states, defined as:

```
opportunityScore = avgFreshness - (maxFatigue × 0.5)

Where:
- avgFreshness = average recovery percentage of PRIMARY muscles (engagement >= 50%)
- maxFatigue = highest fatigue percentage among ALL engaged muscles
- Recovery percentage = 100 - currentFatiguePercent
```

#### Scenario: Fresh muscles, no limiting factors

**Given:**
- Exercise: Pull-ups
- Lats: 85% engagement, 10% fatigued (90% recovery)
- Biceps: 30% engagement, 5% fatigued (95% recovery)
- Rhomboids: 20% engagement, 15% fatigued (85% recovery)

**When:** Opportunity score is calculated

**Then:**
- Primary muscles identified: Lats only (85% >= 50%)
- avgFreshness = 90%
- maxFatigue = 15%
- opportunityScore = 90 - (15 × 0.5) = 82.5
- Status: "excellent"

---

#### Scenario: Multiple limiting factors detected

**Given:**
- Exercise: Dumbbell Pullover
- Pecs: 65% engagement, 85% fatigued (15% recovery) ← PRIMARY + LIMITING
- Lats: 60% engagement, 10% fatigued (90% recovery) ← PRIMARY
- Deltoids: 50% engagement, 78% fatigued (22% recovery) ← PRIMARY + LIMITING
- Triceps: 25% engagement, 90% fatigued (10% recovery) ← LIMITING

**When:** Opportunity score is calculated

**Then:**
- Primary muscles: Pecs, Lats, Deltoids
- avgFreshness = (15 + 90 + 22) / 3 = 42.3%
- maxFatigue = 90%
- opportunityScore = 42.3 - (90 × 0.5) = -2.7
- Limiting factors detected: Pecs (85%), Deltoids (78%), Triceps (90%)
- Status: "suboptimal"

---

#### Scenario: No primary muscles (isolation exercise with low engagement)

**Given:**
- Exercise: Forearm Curl
- Forearms: 45% engagement, 20% fatigued

**When:** Opportunity score is calculated

**Then:**
- Primary muscles: None (45% < 50%)
- avgFreshness = 0 (no primary muscles)
- opportunityScore = 0 - (20 × 0.5) = -10
- Status: "not-recommended"

---

### Requirement: System SHALL detect limiting factors
**ID:** REC-ALG-002

The system SHALL identify limiting factors as any muscle where:
- The muscle is engaged in the exercise (engagement > 0%)
- The muscle's current fatigue is > 66%

#### Scenario: Single limiting factor

**Given:**
- Exercise: Bench Press
- Pecs: 85% engagement, 85% fatigued ← LIMITING
- Triceps: 35% engagement, 40% fatigued
- Deltoids: 30% engagement, 30% fatigued

**When:** Limiting factors are detected

**Then:**
- Limiting factors: [Pecs]
- Explanation includes: "Pecs are 85% fatigued and may limit performance"

---

#### Scenario: No limiting factors

**Given:**
- Exercise: Pull-ups
- All engaged muscles have fatigue <= 66%

**When:** Limiting factors are detected

**Then:**
- Limiting factors: []
- No limiting factor warning shown

---

### Requirement: System SHALL filter by equipment availability
**ID:** REC-ALG-003

The system SHALL only recommend exercises where:
- ALL required equipment types are available in user's equipment inventory
- Equipment quantity > 0

#### Scenario: Single equipment requirement met

**Given:**
- Exercise: Pull-ups (requires Pull-up Bar)
- User equipment: [{ type: Pull-up Bar, quantity: 1 }]

**When:** Equipment availability is checked

**Then:**
- equipmentAvailable = true
- Exercise included in recommendations

---

#### Scenario: Multiple equipment requirements (all met)

**Given:**
- Exercise: Dumbbell Bench Press (requires [Dumbbells, Bench])
- User equipment: [{ type: Dumbbells, quantity: 2 }, { type: Bench, quantity: 1 }]

**When:** Equipment availability is checked

**Then:**
- equipmentAvailable = true
- Exercise included in recommendations

---

#### Scenario: Equipment missing

**Given:**
- Exercise: Dumbbell Row (requires Dumbbells)
- User equipment: [{ type: Bodyweight, quantity: 1 }]

**When:** Equipment availability is checked

**Then:**
- equipmentAvailable = false
- Exercise excluded from recommendations

---

#### Scenario: Equipment quantity is zero

**Given:**
- Exercise: Pull-ups (requires Pull-up Bar)
- User equipment: [{ type: Pull-up Bar, quantity: 0 }]

**When:** Equipment availability is checked

**Then:**
- equipmentAvailable = false
- Exercise excluded from recommendations

---

### Requirement: System SHALL determine recommendation status
**ID:** REC-ALG-004

The system SHALL categorize each exercise recommendation with one of four statuses:

- **"excellent"** - No limiting factors (all muscles < 66% fatigued) AND avgFreshness >= 90%
- **"good"** - No limiting factors AND avgFreshness >= 70%
- **"suboptimal"** - Has limiting factors (any muscle > 66% fatigued) BUT avgFreshness >= 50%
- **"not-recommended"** - avgFreshness < 50%

#### Scenario: Excellent opportunity

**Given:**
- avgFreshness = 92%
- Limiting factors: []

**When:** Status is determined

**Then:**
- Status = "excellent"

---

#### Scenario: Good opportunity

**Given:**
- avgFreshness = 75%
- Limiting factors: []

**When:** Status is determined

**Then:**
- Status = "good"

---

#### Scenario: Suboptimal (has limiting factors)

**Given:**
- avgFreshness = 60%
- Limiting factors: [Pecs (85% fatigued)]

**When:** Status is determined

**Then:**
- Status = "suboptimal"

---

#### Scenario: Not recommended (primary muscles too fatigued)

**Given:**
- avgFreshness = 30%
- Limiting factors: [Pecs (85%), Triceps (90%)]

**When:** Status is determined

**Then:**
- Status = "not-recommended"

---

### Requirement: System SHALL generate human-readable explanations
**ID:** REC-ALG-005

The system SHALL generate a concise explanation for each recommendation that describes WHY it received its status.

#### Scenario: Excellent status explanation

**Given:**
- Status: "excellent"
- All muscles < 33% fatigued

**When:** Explanation is generated

**Then:**
- Explanation = "All muscles fully recovered - maximum training potential"

---

#### Scenario: Suboptimal status explanation (single limiting factor)

**Given:**
- Status: "suboptimal"
- Limiting factors: [Pecs (85% fatigued)]

**When:** Explanation is generated

**Then:**
- Explanation = "Pecs are 85% fatigued and may limit performance"

---

#### Scenario: Suboptimal status explanation (multiple limiting factors)

**Given:**
- Status: "suboptimal"
- Limiting factors: [Pecs (85%), Triceps (90%), Deltoids (70%)]

**When:** Explanation is generated

**Then:**
- Explanation = "Pecs are 85% fatigued and may limit performance" (shows most fatigued)

---

#### Scenario: Not recommended explanation

**Given:**
- Status: "not-recommended"
- avgFreshness = 25%

**When:** Explanation is generated

**Then:**
- Explanation = "Primary muscles need more recovery time"

---

### Requirement: System SHALL sort recommendations by opportunity score
**ID:** REC-ALG-006

The system SHALL sort recommendations in DESCENDING order by opportunity score (highest score first).

#### Scenario: Multiple recommendations with varying scores

**Given:**
- Exercise A: opportunityScore = 85
- Exercise B: opportunityScore = 45
- Exercise C: opportunityScore = 92
- Exercise D: opportunityScore = -5

**When:** Recommendations are sorted

**Then:**
- Order: [C (92), A (85), B (45), D (-5)]

---

### Requirement: System SHALL filter by exercise category
**ID:** REC-ALG-007

The system SHALL support filtering recommendations by ExerciseCategory (Push/Pull/Legs/Core) when category parameter is provided.

#### Scenario: Filter by Pull category

**Given:**
- Category filter: "Pull"
- Exercise library contains 48 exercises across all categories

**When:** Recommendations are calculated with category filter

**Then:**
- Only exercises with category = "Pull" are analyzed
- Push/Legs/Core exercises are excluded

---

#### Scenario: No category filter (show all)

**Given:**
- Category filter: null

**When:** Recommendations are calculated

**Then:**
- All 48 exercises are analyzed
- No category filtering applied

---

### Requirement: System SHALL handle edge cases gracefully
**ID:** REC-ALG-008

The system SHALL handle edge cases without crashing:

#### Scenario: Muscle state data missing for a muscle

**Given:**
- Exercise engages "Biceps"
- muscleStates object does not have "Biceps" key

**When:** Recommendation is calculated

**Then:**
- Assume Biceps recovery = 100% (fully recovered)
- Log warning: "Muscle state missing for Biceps"
- Continue calculation

---

#### Scenario: Exercise has no muscle engagements

**Given:**
- Exercise with muscleEngagements = []

**When:** Recommendation is calculated

**Then:**
- Skip exercise (do not include in recommendations)
- Log warning: "Exercise has no muscle engagements"

---

#### Scenario: All exercises filtered out by equipment

**Given:**
- User equipment: [Bodyweight only]
- All exercises require equipment user doesn't have

**When:** Recommendations are calculated

**Then:**
- Return empty array []
- UI should show: "No exercises available with your equipment"

---

### Requirement: System SHALL perform optimization
**ID:** REC-ALG-009

The system SHALL calculate recommendations efficiently to avoid UI lag:

- Calculation complexity: O(E × M) where E = number of exercises, M = average muscles per exercise
- Maximum execution time: < 100ms for 48 exercises
- Recommendations SHALL be memoized to avoid recalculation on every render

#### Scenario: Performance test

**Given:**
- 48 exercises in library
- Average 4 muscles per exercise
- Total calculations: 48 × 4 = 192

**When:** calculateRecommendations() is called

**Then:**
- Execution time < 100ms
- Result is cached until dependencies change

---

