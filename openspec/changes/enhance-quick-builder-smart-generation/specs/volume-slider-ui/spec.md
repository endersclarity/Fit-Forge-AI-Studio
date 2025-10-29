# Capability: Volume Slider UI

## Overview

Replace manual weight/reps input with slider-based volume selection that automatically calculates optimal set/rep/weight breakdown.

**Related Capabilities:**
- `exercise-history-api` - Provides last performance data for smart defaults
- `target-driven-workout-generation` - Uses volume calculations for recommendations

---

## ADDED Requirements

### Requirement: Volume Slider for Exercise Configuration

The system SHALL provide a volume slider that allows users to adjust total exercise volume instead of manually entering weight/reps for each set.

**Rationale:** Reduces friction in workout planning. Users think in outcomes ("how hard should I push this muscle?") not set math ("3×10@135 = 4,050 lbs").

#### Scenario: User selects exercise and sees pre-populated volume slider

**Given:** User has selected "Bench Press" in Quick Builder planning mode
**And:** User's last bench press session was 3 sets × 10 reps @ 130 lbs (3,900 lbs total)
**When:** Exercise selection completes
**Then:** System displays volume slider pre-populated to 4,017 lbs (last volume × 1.03 progressive overload)
**And:** Slider range is 0-10,000 lbs
**And:** Slider shows current value: "4,017 lbs"

#### Scenario: User adjusts slider and sees real-time set breakdown

**Given:** Volume slider is set to 4,050 lbs for Bench Press
**And:** Last performance was 3×10@130
**When:** User drags slider to 4,500 lbs
**Then:** System recalculates and displays: "3 sets × 10 reps @ 150 lbs"
**And:** Breakdown updates in <50ms (smooth 60fps)
**And:** Forecasted muscle impact updates simultaneously

#### Scenario: User with no exercise history sees sensible defaults

**Given:** User selects "Dumbbell Curl" (never performed before)
**When:** Exercise selection completes
**Then:** Slider defaults to 3,000 lbs (conservative starting volume)
**And:** System displays: "3 sets × 10 reps @ 100 lbs"
**And:** User can adjust from this baseline

---

### Requirement: Optimal Set/Rep/Weight Breakdown Calculation

The system SHALL calculate optimal set/rep/weight breakdown from target volume and last performance, generating a feasible combination that maintains total volume.

**Rationale:** Automates tedious math while respecting progressive overload principles.

#### Scenario: Calculate breakdown with 3% progressive overload

**Given:** Target volume is 4,050 lbs
**And:** Last performance: 3×10@130 lbs
**When:** System calculates breakdown
**Then:** Suggested weight = 135 lbs (130 × 1.03, rounded to nearest 5)
**And:** Reps per set = 10 (target / (3 sets × 135) = 10)
**And:** Sets = 3 (default)
**And:** Total = 4,050 lbs (3 × 10 × 135)

#### Scenario: Clamp reps to reasonable range

**Given:** Target volume is 2,000 lbs
**And:** Last performance: 3×10@100 lbs
**When:** System calculates breakdown
**Then:** Suggested weight = 105 lbs (100 × 1.03)
**And:** Calculated reps = 6.3 → clamped to 6 (min 5, max 15)
**And:** Sets adjusted to 3 (to approximate volume)
**And:** Actual total = 1,890 lbs (close to target)

#### Scenario: Round weight to nearest 5 lbs

**Given:** Calculated weight is 142 lbs
**When:** System generates breakdown
**Then:** Weight displayed as 140 lbs (rounded to nearest 5)
**And:** Reps adjusted to maintain volume

---

### Requirement: Performance Comparison Display

The system SHALL display comparison to last performance when exercise has history, showing progress.

**Rationale:** Builds user confidence and reinforces progressive overload concept.

#### Scenario: Display side-by-side comparison

**Given:** Current configuration: 3×10@135
**And:** Last session: 3×10@130
**When:** Breakdown is calculated
**Then:** UI displays: "Last time: 3×10@130 lbs, Today: 3×10@135 lbs (+3%)"
**And:** Increase percentage is highlighted in green

#### Scenario: Show volume increase for different rep scheme

**Given:** Current: 4×8@150 (4,800 lbs)
**And:** Last: 3×10@130 (3,900 lbs)
**When:** Comparison is rendered
**Then:** UI shows: "Last time: 3,900 lbs, Today: 4,800 lbs (+23%)"
**And:** Notes different rep scheme

---

### Requirement: Fine-Tune Manual Override

The system SHALL provide a fine-tune escape hatch that allows users to manually override generated breakdown when needed.

**Rationale:** Edge cases (injuries, equipment constraints, testing maxes) require manual control.

#### Scenario: User opens manual editor

**Given:** Volume slider shows "3×10@135"
**When:** User clicks "Fine-tune" button
**Then:** Manual set editor modal opens
**And:** Fields pre-populated with: sets=3, reps=10, weight=135
**And:** User can adjust any value
**And:** Saving closes modal and adds set to workout

---

## MODIFIED Requirements

_None - This is a new capability_

---

## REMOVED Requirements

_None_

---

*Spec Version: 1.0*
*Status: Draft*
