# Corrected Muscle Baselines - Isolation vs Compound Exercise Principle

## Key Insight
**Small muscles should use ISOLATION exercise volumes, not compound movements where they're assisted by larger muscles.**

## Problem Example: TRICEPS

### Original (Incorrect) Calculation:
- Regular Dips: 4,200 lb × 88% = **3,696 lb**
- Database claims dips are 88% tricep engagement

### Reality Check Using Isolation:
- TRX Tricep Extensions: 1,080 lb × 60% = **648 lb**
- Dumbbell Tricep Extension: 750 lb × 77% = **578 lb**

**Issue**: Dips showing 3,696 lb is **5.7x** the isolation capacity. This is unrealistic because:
1. Dips are primarily a PECTORAL movement
2. Triceps are assistors, not prime movers
3. The database shows 88% tricep + 80% pec = 168% total engagement (impossible)

### Cross-Validation with Other Compounds:
- DB Bench Press: 3,150 lb × 15% tricep = 473 lb ✓ (less than isolation max - makes sense)
- TRX Pushups: 2,340 lb × 42% = 983 lb (higher, but still compound assistance)

**CORRECTED TRICEP BASELINE: 650 lb (TRX Tricep Extensions)**

---

## Problem Example: BICEPS

### Original (Incorrect):
- Chin-Ups: 5,400 lb × 87% = **4,698 lb**

### Reality Check Using Isolation:
- DB Bicep Curl: 1,800 lb × 72% = **1,296 lb**
- Concentration Curl: 825 lb × 85% = 701 lb
- TRX Bicep Curl: 945 lb × 65% = 614 lb

**Issue**: Chin-ups showing 4,698 lb is **3.6x** the isolation capacity.

In chin-ups, the LATS are the prime mover (large muscle). Biceps assist but don't handle the full load. The 87% "engagement" measures activation level, not actual load on the biceps.

**CORRECTED BICEP BASELINE: 1,296 lb (DB Bicep Curl)**

---

## Corrected Baselines by Muscle Size

### SMALL MUSCLES (Use Isolation Exercises)

#### Triceps
- ✅ **TRX Tricep Extension**: 1,080 lb × 60% = **648 lb**
- ❌ Regular Dips: 4,200 lb × 88% = 3,696 lb (unrealistic - pecs are prime mover)
- **BASELINE: 650 lb**

#### Biceps
- ✅ **DB Bicep Curl**: 1,800 lb × 72% = **1,296 lb**
- ❌ Chin-Ups: 5,400 lb × 87% = 4,698 lb (unrealistic - lats are prime mover)
- **BASELINE: 1,300 lb**

#### Forearms
- **TRX Pull-ups**: 1,800 lb × 35% = 630 lb (no isolation available)
- **BASELINE: 600 lb**

---

### MEDIUM MUSCLES (Use Most Specific Exercise)

#### Deltoids
- ✅ **DB Shoulder Press**: 2,400 lb × 63% = **1,512 lb** (delts are prime mover)
- ❌ Dips: 4,200 lb × 40% = 1,680 lb (pec-dominant movement)
- **BASELINE: 1,500 lb**

#### Rhomboids
- **DB Row**: 2,400 lb × 50% = 1,200 lb (stabilizer/retractor role)
- **BASELINE: 1,200 lb**

#### Trapezius
- **Shoulder Shrugs**: 3,150 lb × 75% = 2,363 lb (isolation for traps)
- **BASELINE: 2,400 lb**

#### Calves
- **Calf Raises**: 10,800 lb × 51% = 5,508 lb (isolation)
- **BASELINE: 5,500 lb**

---

### LARGE MUSCLES (Compound Exercises OK - They're Prime Movers)

#### Pectoralis
- **Push-ups**: 4,500 lb × 75% = **3,375 lb**
- DB Bench: 3,150 lb × 86% = 2,709 lb
- Dips: 4,200 lb × 80% = 3,360 lb
- All consistent (2,700-3,400 lb range)
- **BASELINE: 3,400 lb**

#### Lats
- **Chin-Ups**: 5,400 lb × 120% = **6,480 lb** (lats are prime mover)
- **BASELINE: 6,500 lb**

#### Quadriceps
- **Box Step-ups**: 7,200 lb × 67% = 4,824 lb (quads are prime mover)
- **BASELINE: 4,800 lb**

#### Glutes
- **Stiff-Leg Deadlift**: 6,300 lb × 70% = 4,410 lb (glutes are prime mover)
- **BASELINE: 4,400 lb**

#### Hamstrings
- **Romanian Deadlift**: 6,300 lb × 75% = 4,725 lb (hamstrings are prime mover)
- **BASELINE: 4,700 lb**

#### Core
- **Stiff-Leg Deadlift**: 6,300 lb × 50% = 3,150 lb (heavy stabilizer load)
- **BASELINE: 3,200 lb**

---

## FINAL CORRECTED BASELINES

```
Pectoralis:   3,400 lb  (Push-ups)
Triceps:        650 lb  (TRX Tricep Extension) ⬇️ DOWN 82% from 3,700
Deltoids:     1,500 lb  (DB Shoulder Press) ⬇️ DOWN 12% from 1,700
Lats:         6,500 lb  (Chin-Ups)
Biceps:       1,300 lb  (DB Bicep Curl) ⬇️ DOWN 72% from 4,700
Rhomboids:    1,200 lb  (DB Row)
Trapezius:    2,400 lb  (Shoulder Shrugs)
Forearms:       600 lb  (TRX Pull-ups)
Quadriceps:   4,800 lb  (Box Step-ups)
Glutes:       4,400 lb  (Stiff-Leg Deadlift)
Hamstrings:   4,700 lb  (Romanian Deadlift)
Calves:       5,500 lb  (Calf Raises)
Core:         3,200 lb  (Stiff-Leg Deadlift)
```

## Major Corrections
- **Triceps**: Reduced by 82% (3,700 → 650 lb) - using isolation instead of dips
- **Biceps**: Reduced by 72% (4,700 → 1,300 lb) - using isolation instead of chin-ups
- **Deltoids**: Reduced by 12% (1,700 → 1,500 lb) - using shoulder press instead of dips

## Validation Principle
For each muscle baseline, ask:
1. Is this muscle the PRIMARY MOVER in the exercise? → Use compound volume
2. Is this muscle an ASSISTOR? → Use isolation exercise volume only
3. Does the baseline align with isolation capacity? → If not, it's probably wrong

These corrected baselines are much more realistic and will prevent the app from underestimating muscle fatigue during workouts.
