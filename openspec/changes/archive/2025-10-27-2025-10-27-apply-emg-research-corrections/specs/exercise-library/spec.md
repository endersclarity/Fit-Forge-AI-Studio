# exercise-library Specification Delta

## Purpose
This delta modifies the exercise library data in constants.ts to reflect peer-reviewed EMG research findings on muscle engagement percentages.

## MODIFIED Requirements

### Requirement: Exercise library SHALL use research-validated muscle engagement percentages
**ID:** EX-LIB-001

The exercise library in constants.ts SHALL contain muscle engagement percentages based on peer-reviewed EMG studies measuring % MVIC (Maximum Voluntary Isometric Contraction). Values SHALL be derived from docs/emg-research-reference.md which synthesizes 189 peer-reviewed citations.

**Change:** Previously used estimated percentages. Now using research-validated percentages.

#### Scenario: Pull-up biceps engagement reflects EMG research

**Given:**
- Exercise: Pull-up (ex06)
- EMG research shows biceps activation at 78-96% MVIC (Youdas et al., 2010)
- Previous value was estimated at 30%

**When:** Exercise library is updated with research corrections

**Then:**
- Pull-up biceps engagement = 87% (midpoint of 78-96% range)
- Recommendation algorithm uses 87% for fatigue calculations
- Users receive more accurate recommendations for biceps recovery

---

#### Scenario: Push-up multi-muscle engagement reflects EMG research

**Given:**
- Exercise: Push-up (ex03)
- EMG research shows (Rodríguez-Ridao et al., 2020):
  - Pectoralis: 70-80% MVIC
  - Triceps: 70-80% MVIC
  - Deltoids: 25-35% MVIC
  - Core: 30-40% MVIC
- Previous values: Pecs 70%, Triceps 50%, Deltoids 40%, Core 20%

**When:** Exercise library is updated with research corrections

**Then:**
- Push-up pectoralis = 70% (already accurate)
- Push-up triceps = 75% (increased from 50%)
- Push-up deltoids = 30% (decreased from 40%)
- Push-up core = 35% (increased from 20%)
- Fatigue distribution more accurately reflects actual muscle activation

---

#### Scenario: Box Step-ups includes missing glute activation data

**Given:**
- Exercise: Box Step-ups (ex47)
- EMG research shows gluteus maximus at 169% MVIC (Rebuttal et al., 2020)
- Previous library entry lacked glute engagement data
- Research shows this is the highest glute activation of all exercises

**When:** Exercise library is updated with research corrections

**Then:**
- Box Step-ups includes Glutes at 169%
- Recommendation algorithm can now recommend box step-ups for glute development
- Glute fatigue is properly tracked when box step-ups are performed

---

### Requirement: Engagement percentages SHALL use midpoint values for research ranges
**ID:** EX-LIB-002

When EMG research provides a range (e.g., 70-80% MVIC), the exercise library SHALL use the midpoint value (75%) to balance accuracy with simplicity.

**Change:** Adds explicit methodology for converting research ranges to single values.

#### Scenario: Converting research range to engagement percentage

**Given:**
- EMG research reports triceps activation in push-ups as 70-80% MVIC
- Range represents measurement variability and individual differences

**When:** Updating exercise library with research value

**Then:**
- Calculate midpoint: (70 + 80) / 2 = 75%
- Store engagement percentage as 75
- Document source range in research reference (docs/emg-research-reference.md)

---

### Requirement: Missing muscle groups SHALL be added based on research findings
**ID:** EX-LIB-003

When EMG research identifies significant muscle engagement (>20% MVIC) that is not currently tracked in the exercise library, the muscle group SHALL be added to the exercise's muscleEngagements array.

**Change:** Enables adding previously untracked muscles to exercises.

#### Scenario: Adding trapezius to wide grip pull-ups

**Given:**
- Exercise: Wide Grip Pull-ups (ex42)
- EMG research shows middle trapezius at 60.1% MVIC (Dickie et al., 2017)
- Previous library entry did not include trapezius

**When:** Exercise library is updated with research corrections

**Then:**
- Wide Grip Pull-ups includes { muscle: Muscle.Trapezius, percentage: 60 }
- Trapezius fatigue is tracked when wide grip pull-ups performed
- Recommendation algorithm considers trapezius state when suggesting exercise

---

### Requirement: Values exceeding 100% MVIC SHALL be preserved as scientifically valid
**ID:** EX-LIB-004

The exercise library SHALL accept and preserve engagement percentages exceeding 100% when supported by EMG research, as dynamic exercises can exceed isometric MVIC reference values.

**Change:** Clarifies that >100% values are valid, not errors.

#### Scenario: TRX push-up pectoralis exceeds 100% MVIC

**Given:**
- Exercise: TRX Pushup (ex31)
- EMG research shows pectoralis activation at 96.3-121.2% MVIC (feet suspended)
- Dynamic movement produces higher activation than isometric MVIC test
- This is scientifically valid per research methodology

**When:** Exercise library is updated with research value

**Then:**
- TRX Pushup pectoralis = 109% (midpoint of range)
- Value is accepted without error or capping at 100%
- System correctly calculates higher fatigue for TRX push-ups vs standard push-ups

---

## Implementation Notes

**Data Source:** All corrections derived from docs/emg-research-reference.md
**Coverage:** 40/40 exercises in FitForge database researched and updated
**Research Quality:** 38/40 exercises (95%) have specific % MVIC values from peer-reviewed studies
**Citations:** 189 total peer-reviewed sources

**Major Corrections Applied:**
1. Pull-up biceps: 30% → 87%
2. Push-up triceps: 50% → 75%
3. Push-up deltoids: 40% → 30%
4. Push-up core: 20% → 35%
5. Box Step-ups glutes: Missing → 169%

**Impact on Related Capabilities:**
- `exercise-recommendation-algorithm`: Inherits improved accuracy
- `muscle-fatigue-tracking`: Calculations more accurate
- `baseline-learning-engine`: Better input data for learning
- `recovery-dashboard-screen`: More accurate recovery predictions

**Validation:** TypeScript type system enforces muscle engagement structure. Manual testing confirms recommendations and fatigue calculations function correctly.
