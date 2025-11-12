# Deltoid Differentiation & Exercise Corrections Plan

**Date**: 2025-11-08
**Status**: 🚧 Planning

---

## Problem Statement

1. **Deltoids are not differentiated** - "Deltoids" is too broad. We have:
   - Anterior Deltoids (front) - used in PUSH movements
   - Posterior Deltoids (rear) - used in PULL movements
   - Lateral Deltoids (side) - used in LATERAL movements

2. **Push-ups overestimated** - Using 200 lbs (full BW), but research shows only ~65% BW is moved

3. **Isometric exercises unmeasured** - Plank, Mountain Climbers have no volume calculation

---

## Proposed Changes

### 1. Deltoid Muscle Split

Replace all "Deltoids" entries with specific deltoid heads:

#### PUSH Exercises → AnteriorDeltoids
- ex02: Dumbbell Bench Press
- ex38: Single Arm Dumbbell Bench Press
- ex03: Push-up
- ex05: Dumbbell Shoulder Press ⭐ (PRIMARY)
- ex30: Dumbbell Tricep Extension
- ex40: TRX Tricep Extension
- ex31: TRX Pushup
- ex32: Incline Dumbbell Bench Press
- ex39: Single Arm Incline Dumbbell Bench Press
- ex33: Dips
- ex34: Kettlebell Press ⭐ (PRIMARY)

#### PULL Exercises → PosteriorDeltoids
- ex29: TRX Reverse Flys ⭐ (PRIMARY)
- ex09: Dumbbell Row
- ex21: Face Pull ⭐ (PRIMARY)

#### MIXED → Anterior + Lateral
- ex18: Dumbbell Upright Row (45% Trapezius, 35% mix of Anterior+Lateral Deltoids)
  - Suggested split: 20% AnteriorDeltoids, 15% LateralDeltoids

#### CORE/STABILIZATION → Keep generic or split?
- ex16: Plank (18% Deltoids - stabilization, all three heads engaged)
  - Suggested: Keep as "Deltoids" or split evenly across all three
- ex44: Spider Planks (12% Deltoids)
- ex45: TRX Mountain Climbers (30% Deltoids)

---

### 2. Push-up Weight Correction

**Current**: 3×17 @ 200 lbs = 10,200 lb total
**Corrected**: 3×17 @ 130 lbs (65% BW) = 6,630 lb total

**Impact on baselines:**
- Pectoralis: 5,100 → **3,315 lbs** (35% decrease)
- Triceps: 3,570 → **2,320 lbs** (35% decrease)

---

### 3. Isometric/Time-Based Exercise Calculations

#### Plank (ex16)
**Performance**: 2 min hold
**Calculation**: 120 seconds × 70% bodyweight (140 lbs) = **16,800 lb-seconds**

Or for consistency with rep-based exercises:
- Treat 1 second = 1 "rep"
- Volume = 1 set × 120 reps × 140 lbs = **16,800 lbs**

**Muscle breakdown** (Core 80%, Deltoids 18%, Glutes 2%):
- Core: 13,440 lbs (may exceed current baseline of 5,850!)
- Deltoids: 3,024 lbs (split across all three heads?)
- Glutes: 336 lbs

#### TRX Mountain Climbers (ex45)
**Performance**: 30 seconds
**Calculation**: Estimate ~2 climbers/second × 30 sec = 60 reps × 70% BW

Volume = 3 sets × 60 reps × 140 lbs = **25,200 lbs** (if doing 3 sets)

OR just: 30 seconds × 140 lbs = **4,200 lb-seconds** (for 1 set)

**User said**: "30 seconds" total, not 3 sets. So:
- Volume = 30 seconds × 140 lbs = **4,200 lbs**

**Muscle breakdown** (Core 70%, Deltoids 30%):
- Core: 2,940 lbs
- Deltoids: 1,260 lbs

---

## Questions for User

1. **Deltoid split approach**: Should we split ALL "Deltoids" references, or keep some exercises (like planks) as generic "Deltoids"?

2. **Upright Rows**: Currently 35% Deltoids - how should we split this between Anterior and Lateral?

3. **Plank calculation**: Use 70% BW or 80% BW? Research says 70-80%.

4. **Mountain Climbers**: You said "30 seconds" - is that:
   - 3 sets of 30 seconds each? (total 90 sec)
   - OR 30 seconds total (1 set)?

5. **Push-up percentage**: Use 65% BW (130 lbs) or 70% BW (140 lbs)?

---

## Execution Plan

Once approved:
1. Create backup of exercises.json
2. Go through all 48 exercises and replace "Deltoids" with specific heads
3. Update calculation script with corrected push-up weight
4. Add plank and mountain climbers to performance data
5. Recalculate all baselines
6. Review and validate results

---

**Estimated Impact:**
- AnteriorDeltoids baseline: ~600-800 lbs (from shoulder press)
- PosteriorDeltoids baseline: ~1,200-1,400 lbs (from face pull)
- LateralDeltoids baseline: TBD (from upright row mix)
- Core baseline: Could increase dramatically if plank calculation is included
