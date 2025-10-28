# Spec: Collateral Fatigue Calculation

**Capability ID:** `collateral-fatigue-calculation`
**Type:** Core Algorithm
**Related Change:** `implement-muscle-deep-dive-modal`
**Status:** Draft

---

## Overview

Implement an algorithm that calculates the "collateral fatigue risk" for exercises - a score representing how likely an exercise is to push supporting muscles into an overtrained state when the user's goal is to target a specific primary muscle.

This is the key differentiating feature that enables intelligent exercise recommendations based on full-body muscle state awareness.

---

## ADDED Requirements

### Requirement: Collateral Risk Score Calculation

The system must calculate a risk score (0-100) for each exercise representing the likelihood that performing the exercise will overtrain supporting muscles while targeting the primary muscle.

#### Scenario: Calculate risk for isolation exercise with fresh supporting muscles

**Given** user clicks on Triceps (current fatigue: 45%)
**And** Forearms are at 20% fatigue
**When** calculating collateral risk for "Tricep Pushdowns" exercise
**Then** the system identifies engaged muscles: Triceps (90%), Forearms (10%)
**And** the system skips Triceps (target muscle) in risk calculation
**And** the system calculates risk contribution for Forearms: (20% fatigue × 10% engagement) × weight
**And** the system returns collateral risk score of approximately 10-15 (Low)

#### Scenario: Calculate risk for compound exercise with fatigued supporting muscles

**Given** user clicks on Triceps (current fatigue: 45%)
**And** Pectoralis is at 80% fatigue (near overfatigue threshold)
**When** calculating collateral risk for "Bench Press" exercise
**Then** the system identifies engaged muscles: Pectoralis (70%), Triceps (75%), Deltoids (30%)
**And** the system skips Triceps (target muscle) in risk calculation
**And** the system calculates risk for Pectoralis with overfatigue multiplier (2.0x)
**And** the system calculates risk for Deltoids with normal weighting
**And** the system returns collateral risk score of approximately 60-70 (Medium-High)

#### Scenario: Calculate risk when all supporting muscles are fresh

**Given** user clicks on Pectoralis (current fatigue: 30%)
**And** all other muscles are at 15-25% fatigue (fresh)
**When** calculating collateral risk for "Bench Press" exercise
**Then** the system calculates low risk contributions for all supporting muscles
**And** the system returns collateral risk score of approximately 15-25 (Low)

#### Scenario: Calculate risk when multiple supporting muscles are highly fatigued

**Given** user clicks on Quadriceps (current fatigue: 40%)
**And** Glutes are at 75% fatigue
**And** Hamstrings are at 70% fatigue
**When** calculating collateral risk for "Squats" exercise
**Then** the system applies overfatigue multiplier to both Glutes and Hamstrings
**And** the system returns collateral risk score of approximately 70-85 (High)

---

### Requirement: Risk Level Categorization

The system must categorize collateral risk scores into user-friendly risk levels for display.

#### Scenario: Low risk score maps to Low risk level

**Given** a calculated collateral risk score of 25
**When** determining the risk level
**Then** the system returns risk level "Low"
**And** UI displays with green indicator
**And** tooltip text says "Low risk of tiring other muscles"

#### Scenario: Medium risk score maps to Medium risk level

**Given** a calculated collateral risk score of 50
**When** determining the risk level
**Then** the system returns risk level "Medium"
**And** UI displays with yellow indicator
**And** tooltip text says "Moderate impact on other muscles"

#### Scenario: High risk score maps to High risk level

**Given** a calculated collateral risk score of 75
**When** determining the risk level
**Then** the system returns risk level "High"
**And** UI displays with red indicator
**And** tooltip text says "High risk - may overtrain supporting muscles"

---

### Requirement: Overfatigue Threshold Detection

The system must apply a risk multiplier when supporting muscles are already near the overfatigue threshold (70%+).

#### Scenario: Supporting muscle below overfatigue threshold

**Given** a supporting muscle (Forearms) at 50% fatigue
**When** calculating risk contribution for this muscle
**Then** the system applies standard weighting (multiplier: 1.0x)

#### Scenario: Supporting muscle at or above overfatigue threshold

**Given** a supporting muscle (Pectoralis) at 75% fatigue
**When** calculating risk contribution for this muscle
**Then** the system applies overfatigue multiplier (2.0x)
**And** the risk contribution is doubled

---

### Requirement: Muscle Weighting by Engagement Level

The system must weight risk contributions differently based on whether a muscle is a major or minor contributor to the exercise.

#### Scenario: Major muscle group engaged (≥30%)

**Given** an exercise engages Pectoralis at 70% MVIC
**When** calculating risk contribution
**Then** the system applies major muscle weight (1.0x)

#### Scenario: Minor muscle group engaged (<30%)

**Given** an exercise engages Forearms at 15% MVIC
**When** calculating risk contribution
**Then** the system applies minor muscle weight (0.5x)
**And** the risk contribution is reduced by half

---

### Requirement: Edge Case Handling

The system must handle edge cases gracefully without errors or invalid scores.

#### Scenario: Missing muscle state data

**Given** an exercise engages a muscle
**And** that muscle has no current fatigue data in muscleStates
**When** calculating collateral risk
**Then** the system assumes 0% fatigue for the missing muscle
**And** continues calculation without errors

#### Scenario: Zero engagement percentage

**Given** an exercise has 0% engagement for a muscle
**When** calculating risk contribution
**Then** the system skips this muscle (contributes 0 to risk)
**And** does not cause division by zero errors

#### Scenario: Exercise engages only target muscle (pure isolation)

**Given** user clicks on Biceps
**And** exercise "Bicep Curls" engages only Biceps at 95%
**When** calculating collateral risk
**Then** the system finds no supporting muscles to calculate risk for
**And** returns collateral risk score of 0 (no collateral impact)

#### Scenario: Exercise does not engage target muscle

**Given** user clicks on Biceps
**And** exercise "Squats" does not engage Biceps at all
**When** calculating collateral risk
**Then** the system should not be called for this exercise
**And** exercise should be filtered out before calculation
*(This is a filtering requirement, not a calculator requirement)*

---

## Technical Implementation

### Algorithm Formula

```typescript
function calculateCollateralRisk(
  exercise: Exercise,
  targetMuscle: Muscle,
  muscleStates: MuscleStatesResponse
): number {
  const OVERFATIGUE_THRESHOLD = 70;
  const WEIGHT_MAJOR = 1.0;
  const WEIGHT_MINOR = 0.5;

  let totalRisk = 0;
  let totalWeight = 0;

  // Iterate through all engaged muscles
  for (const [muscle, engagement] of Object.entries(exercise.engagement)) {
    // Skip target muscle
    if (muscle === targetMuscle) continue;

    // Get current fatigue (default to 0 if missing)
    const currentFatigue = muscleStates[muscle]?.currentFatiguePercent ?? 0;

    // Determine weight based on engagement level
    const weight = engagement >= 30 ? WEIGHT_MAJOR : WEIGHT_MINOR;

    // Calculate base risk: current fatigue × engagement
    const muscleRisk = (currentFatigue / 100) * (engagement / 100);

    // Apply overfatigue multiplier if muscle near threshold
    const multiplier = currentFatigue > OVERFATIGUE_THRESHOLD ? 2.0 : 1.0;

    totalRisk += muscleRisk * weight * multiplier;
    totalWeight += weight;
  }

  // Normalize to 0-100 scale
  if (totalWeight === 0) return 0; // Pure isolation exercise

  const normalizedRisk = (totalRisk / totalWeight) * 100;

  return Math.min(100, Math.max(0, Math.round(normalizedRisk)));
}
```

### Risk Level Mapping

```typescript
function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore < 30) return 'low';
  if (riskScore < 60) return 'medium';
  return 'high';
}

function getRiskLevelDisplay(riskLevel: string): {
  color: string;
  text: string;
  icon: string;
} {
  switch (riskLevel) {
    case 'low':
      return {
        color: 'green',
        text: 'Low risk of tiring other muscles',
        icon: '✓'
      };
    case 'medium':
      return {
        color: 'yellow',
        text: 'Moderate impact on other muscles',
        icon: '⚠'
      };
    case 'high':
      return {
        color: 'red',
        text: 'High risk - may overtrain supporting muscles',
        icon: '⚠'
      };
  }
}
```

---

## Test Coverage

### Unit Tests Required

**Test File:** `utils/collateralFatigueCalculator.test.ts`

**Test Cases:**
1. Isolation exercise with fresh muscles → Low risk (0-15)
2. Isolation exercise with fatigued minor muscle → Low risk (10-25)
3. Compound exercise with all fresh muscles → Low-Medium risk (15-35)
4. Compound exercise with one fatigued major muscle → Medium risk (40-60)
5. Compound exercise with multiple fatigued muscles → High risk (60-85)
6. Compound exercise with overfatigued muscles (>70%) → High risk with multiplier (70-95)
7. Edge case: Missing muscle state data → Handles gracefully, assumes 0%
8. Edge case: Zero engagement → Skips muscle, no errors
9. Edge case: Pure isolation (only target muscle) → Returns 0
10. Normalization: Total risk >100 → Clamped to 100
11. Normalization: Total risk <0 → Clamped to 0

### Integration Tests

**Test:** Calculate risk for all exercises in EXERCISE_LIBRARY
- Verify no errors for any exercise
- Verify all scores are 0-100
- Verify risk levels map correctly

**Test:** Calculate risk with real workout data
- Use actual muscle states from database
- Verify scores are reasonable and consistent
- Compare manual calculation vs algorithm output

---

## Performance Requirements

**Calculation Speed:**
- Single exercise: <0.5ms
- All exercises for one muscle (typical: 20 exercises): <10ms
- Full library scan (150+ exercises): <50ms

**Memory:**
- No persistent state required
- Pure function with no side effects
- Minimal memory allocation

---

## Validation & Tuning

**Algorithm Validation:**
1. Manual review by exercise physiologist
2. Test with known "safe" and "risky" exercise scenarios
3. Compare with user intuition (does high risk feel right?)
4. Iterate on weighting factors if needed

**Tuning Parameters:**
- `OVERFATIGUE_THRESHOLD`: Currently 70%, may adjust based on user feedback
- `WEIGHT_MAJOR`: Currently 1.0x
- `WEIGHT_MINOR`: Currently 0.5x, may adjust to 0.3x or 0.7x
- `Overfatigue Multiplier`: Currently 2.0x, may adjust to 1.5x or 2.5x

**Success Criteria:**
- Users report recommendations "make sense"
- Low risk exercises don't cause overtraining complaints
- High risk exercises correlate with user-reported soreness/fatigue

---

## Related Specs

- **smart-exercise-recommendations** (uses collateral risk in ranking)
- **muscle-deep-dive-modal-ui** (displays risk indicators)

---

## References

- **Exercise Science Research:** MVIC engagement percentages
- **Overtraining Literature:** Fatigue thresholds and recovery markers
- **Design Document:** `design.md` (Algorithm Specifications section)
- **Brainstorming Session:** `docs/brainstorming-session-results-2025-10-27.md` (Branch 2: Collateral Fatigue Awareness)
