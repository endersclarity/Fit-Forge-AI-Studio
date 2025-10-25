# Spec: Template Analysis Engine

**Capability:** `template-analysis-engine`
**Status:** Proposed
**Owner:** Development Team

---

## ADDED Requirements

### Requirement: System SHALL analyze workout template muscle engagement patterns

The template analysis engine SHALL calculate total muscle engagement for each template by summing engagement percentages across all exercises.

#### Scenario: Calculate muscle engagement totals for a single template

**Given** a workout template with exercise IDs `["ex02", "ex03"]`
**And** Exercise "ex02" (Dumbbell Bench Press) has muscle engagements:
  - Pectoralis: 85%
  - Triceps: 35%
  - Deltoids: 35%
**And** Exercise "ex03" (Push-up) has muscle engagements:
  - Pectoralis: 70%
  - Triceps: 50%
  - Deltoids: 40%
  - Core: 20%
**When** the template is analyzed
**Then** the muscle engagement totals shall be:
  - Pectoralis: 155% (85 + 70)
  - Triceps: 85% (35 + 50)
  - Deltoids: 75% (35 + 40)
  - Core: 20%

#### Scenario: Handle missing exercise IDs gracefully

**Given** a workout template with exercise IDs `["ex02", "invalid-id", "ex03"]`
**And** "invalid-id" does not exist in EXERCISE_LIBRARY
**When** the template is analyzed
**Then** the system shall log a warning about the missing exercise
**And** the analysis shall continue with remaining valid exercises
**And** the muscle engagement totals shall only include ex02 and ex03

---

### Requirement: System SHALL score template coverage based on relevant muscles

The analysis engine SHALL calculate a coverage score indicating what percentage of category-relevant muscles meet minimum engagement thresholds.

#### Scenario: Calculate coverage for a Push template with all muscles covered

**Given** a Push template with muscle engagements:
  - Pectoralis: 150%
  - Triceps: 200%
  - Deltoids: 180%
  - Core: 100%
**And** the minimum engagement threshold is 100%
**And** Push category relevant muscles are: Pectoralis, Triceps, Deltoids, Core
**When** coverage is scored
**Then** the coverage score shall be 100% (4/4 muscles meet threshold)

#### Scenario: Calculate coverage for a Push template with gaps

**Given** a Push template with muscle engagements:
  - Pectoralis: 155%
  - Triceps: 220%
  - Deltoids: 155%
  - Core: 20%
**And** the minimum engagement threshold is 100%
**And** Push category relevant muscles are: Pectoralis, Triceps, Deltoids, Core
**When** coverage is scored
**Then** the coverage score shall be 75% (3/4 muscles meet threshold)
**And** Core shall be identified as a coverage gap

---

### Requirement: System SHALL score template balance based on engagement distribution

The analysis engine SHALL calculate a balance score indicating how evenly muscle engagement is distributed across the template.

#### Scenario: Calculate balance for evenly distributed engagement

**Given** a template with muscle engagements:
  - Pectoralis: 150%
  - Triceps: 150%
  - Deltoids: 150%
  - Core: 150%
**When** balance is scored
**Then** the balance score shall be 100% (perfect balance - zero variance)

#### Scenario: Calculate balance for highly imbalanced engagement

**Given** a template with muscle engagements:
  - Pectoralis: 50%
  - Triceps: 300%
  - Deltoids: 50%
  - Core: 50%
**When** balance is scored
**Then** the balance score shall be less than 50% (high variance)

---

### Requirement: System SHALL compare A/B template variations

The analysis engine SHALL calculate complementarity scores showing how well A/B variations provide different training stimuli.

#### Scenario: Compare variations with good complementarity

**Given** Push A template with muscle engagements:
  - Pectoralis: 150%
  - Deltoids: 120%
**And** Push B template with muscle engagements:
  - Pectoralis: 100%
  - Deltoids: 200%
**When** variations are compared
**Then** the complementarity score shall be greater than 60%
**And** the differences shall show:
  - Pectoralis: 50% difference
  - Deltoids: 80% difference
**And** the analysis shall note that Push B emphasizes shoulders more

#### Scenario: Compare variations with poor complementarity

**Given** Push A template with muscle engagements:
  - Pectoralis: 150%
  - Triceps: 200%
  - Deltoids: 180%
**And** Push B template with muscle engagements:
  - Pectoralis: 155%
  - Triceps: 195%
  - Deltoids: 175%
**When** variations are compared
**Then** the complementarity score shall be less than 20% (very similar)
**And** the analysis shall warn that variations are too similar

---

### Requirement: System SHALL generate actionable recommendations

The analysis engine SHALL provide specific, actionable recommendations for improving template quality.

#### Scenario: Recommend exercises to fill coverage gaps

**Given** a Push template with muscle engagements:
  - Pectoralis: 155%
  - Triceps: 220%
  - Deltoids: 155%
  - Core: 20%
**And** Core engagement is below 100% threshold
**And** EXERCISE_LIBRARY contains "Plank" with Core engagement 80%
**When** recommendations are generated
**Then** the system shall recommend:
  "⚠️ Core under-targeted (20%). Consider adding: Plank or Hanging Leg Raise"

#### Scenario: Warn about overtraining risk

**Given** a template with muscle engagements:
  - Triceps: 350%
**And** Triceps engagement exceeds 300% threshold
**When** recommendations are generated
**Then** the system shall warn:
  "⚠️ Triceps over-targeted (350%). Risk of overtraining - consider reducing volume."

---

### Requirement: System SHALL generate markdown analysis reports

The analysis engine SHALL produce human-readable markdown reports summarizing all template analyses.

#### Scenario: Generate report with all template analyses

**Given** 8 workout templates have been analyzed
**When** the report is generated
**Then** the report shall include:
  - Generation timestamp
  - Total templates analyzed count
  - Per-template sections with:
    - Muscle engagement totals
    - Coverage and balance scores
    - Identified gaps and overlaps
    - Recommendations
  - A/B comparison sections for each category
  - Summary statistics (best templates, needs improvement)
**And** the report shall be written to `docs/template-analysis-report.md`

#### Scenario: Report includes visual indicators

**Given** a template analysis report is being generated
**When** scores are formatted
**Then** coverage >=75% shall use ✅ emoji
**And** coverage <75% shall use ⚠️ emoji
**And** muscle engagement >=100% shall use ✅ emoji
**And** muscle engagement <100% shall use ⚠️ emoji

---

## Notes

**Category-Relevant Muscles:**
- Push: Pectoralis, Triceps, Deltoids, Core
- Pull: Lats, Biceps, Rhomboids, Trapezius, Forearms
- Legs: Quadriceps, Glutes, Hamstrings, Calves, Core
- Core: Core

**Thresholds:**
- Minimum engagement: 100% (adequate stimulus)
- Maximum engagement: 300% (overtraining risk)
- Good coverage: >=75% of relevant muscles
- Good balance: >=60% balance score
- Good complementarity: >=60% variation difference

**Dependencies:**
- Uses existing `workout_templates` table
- Uses existing `EXERCISE_LIBRARY` from constants.ts
- Uses existing TypeScript types

**Cross-References:**
- Related to `exercise-recommendation-algorithm` (similar muscle engagement logic)
- Related to `recommendation-ui-display` (could surface template quality in UI future)
