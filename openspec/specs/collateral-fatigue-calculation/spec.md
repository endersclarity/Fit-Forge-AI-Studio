# collateral-fatigue-calculation Specification

## Purpose
TBD - created by archiving change 2025-10-27-implement-muscle-deep-dive-modal. Update Purpose after archive.
## Requirements
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

