# Capability: Muscle-Specific Recommendations

## Overview

Enhance exercise recommendation engine to suggest exercises targeting fresh muscles even within the same muscle group, using detailed muscle tracking data.

**Related Capabilities:**
- `detailed-muscle-tracking` - Provides granular muscle state data
- `exercise-recommendation-algorithm` - Base algorithm being enhanced

---

## ADDED Requirements

### Requirement: System SHALL recommend exercises targeting fresh detailed muscles

When primary movers of one region are fatigued, system must identify and recommend exercises targeting fresh muscles within the same visualization group.

**Rationale:** Optimizes training by working fresh posterior deltoid when anterior deltoid is fatigued, rather than avoiding all deltoid exercises.

#### Scenario: Recommend posterior delt work when anterior is fatigued

**Given:** User completed heavy bench press + shoulder press yesterday
**And:** Detailed muscle states:
- `AnteriorDeltoid`: 85% fatigued
- `MedialDeltoid`: 40% fatigued
- `PosteriorDeltoid`: 20% fatigued
**When:** System generates exercise recommendations
**Then:** System recommends:
- ✅ Face Pulls (targets `PosteriorDeltoid`)
- ✅ TRX Reverse Flys (targets `PosteriorDeltoid`)
**And:** System avoids:
- ❌ Shoulder Press (targets `AnteriorDeltoid`)
- ❌ Incline Bench (targets `AnteriorDeltoid`)

#### Scenario: Work different triceps heads

**Given:** `TricepsLongHead`: 75% fatigued (from overhead work)
**And:** `TricepsLateralHead`: 25% fatigued
**When:** System recommends triceps exercises
**Then:** Prioritizes exercises emphasizing lateral head
**And:** De-prioritizes overhead extensions (hit long head)

---

### Requirement: System SHALL generate detailed explanations

Exercise recommendations must include specific muscle reasoning showing which detailed muscles are fresh vs fatigued.

#### Scenario: Explain fresh muscle targeting

**Given:** Exercise recommendation for Face Pulls
**And:** `PosteriorDeltoid`: 20% fatigued
**And:** `AnteriorDeltoid`: 85% fatigued
**When:** System generates explanation
**Then:** Reason states: "Targets fresh muscles: Posterior Deltoid (20% fatigued)"
**And:** User understands WHY this exercise is recommended

#### Scenario: Explain limiting factors

**Given:** Exercise recommendation for Bench Press
**And:** `PectoralisMajorSternal`: 90% fatigued
**When:** System generates explanation
**Then:** Reason states: "May overtrain: Pectoralis Major (Sternal) already fatigued at 90%"
**And:** User sees specific limiting muscle

---

## MODIFIED Requirements

### Requirement: Exercise scoring SHALL use detailed muscle fatigue

*Modifies existing requirement in `exercise-recommendation-algorithm`*

Opportunity score calculation must aggregate fatigue across all detailed muscles engaged by exercise, weighted by engagement percentage and role.

#### Scenario: Score considers all engaged detailed muscles

**Given:** Exercise engages:
- `LatissimusDorsi`: 60% engagement, 40% fatigued
- `BicepsBrachii`: 87% engagement, 70% fatigued
- `Infraspinatus`: 75% engagement, 80% fatigued (stabilizer)
**When:** System calculates opportunity score
**Then:** Total fatigue load = (0.60 × 0.40) + (0.87 × 0.70) + (0.75 × 0.80)
**And:** Score reflects detailed muscle states, not just visualization groups

---

## REMOVED Requirements

_(None)_

---

*Spec Version: 1.0*
