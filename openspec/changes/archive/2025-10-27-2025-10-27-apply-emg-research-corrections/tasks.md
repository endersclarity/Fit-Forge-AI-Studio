# Tasks: Apply EMG Research Corrections

**Change ID:** `apply-emg-research-corrections`
**Estimate:** 5-8 hours
**Dependencies:** Research documents (emg-research-reference.md, research-findings.md)

---

## Overview

This change applies peer-reviewed EMG research findings to correct muscle engagement percentages in constants.ts. Work is organized by exercise category (Push, Pull, Legs, Core) for systematic verification.

**Key Constraint:** Data correction only - no code changes outside constants.ts

---

## Phase 1: Preparation & Major Corrections

**Estimate:** 1-2 hours

### Task 1.1: Setup Working Environment
- [ ] Open constants.ts in editor
- [ ] Open docs/emg-research-reference.md side-by-side
- [ ] Create feature branch: `fix/apply-emg-research-corrections` (optional)
- [ ] Ensure TypeScript environment running

**Validation:** Both files open and ready for cross-referencing

---

### Task 1.2: Apply Major Correction - Pull-up Biceps
- [ ] Locate Pull-up (ex06) in constants.ts
- [ ] Current: `{ muscle: Muscle.Biceps, percentage: 30 }`
- [ ] Update to: `{ muscle: Muscle.Biceps, percentage: 87 }` (midpoint of 78-96%)
- [ ] Reference: emg-research-reference.md lines 99-106
- [ ] Test: TypeScript compiles

**Validation:** Pull-up biceps = 87%

---

### Task 1.3: Apply Major Correction - Push-up Multi-Muscle
- [ ] Locate Push-up (ex03) in constants.ts (around line 36-48)
- [ ] Update Triceps: 50% → 75% (midpoint of 70-80%)
- [ ] Update Deltoids: 40% → 30% (midpoint of 25-35%)
- [ ] Update Core: 20% → 35% (midpoint of 30-40%)
- [ ] Keep Pectoralis: 70% (already accurate per 70-80% range)
- [ ] Reference: emg-research-reference.md lines 13-19
- [ ] Test: TypeScript compiles

**Validation:** Push-up = Pecs 70%, Triceps 75%, Deltoids 30%, Core 35%

---

### Task 1.4: Apply Major Correction - Box Step-ups Glutes
- [ ] Locate Box Step-ups (ex47) in constants.ts
- [ ] Add: `{ muscle: Muscle.Glutes, percentage: 169 }`
- [ ] Update Quadriceps to: 67% (midpoint of 62-72%)
- [ ] Update Hamstrings if present
- [ ] Reference: emg-research-reference.md lines 230-236
- [ ] Test: TypeScript compiles

**Validation:** Box Step-ups includes Glutes at 169%

---

### Task 1.5: Apply Major Correction - Wide Grip Pull-ups
- [ ] Locate Wide Grip Pull-ups (ex42) in constants.ts
- [ ] Add: `{ muscle: Muscle.Trapezius, percentage: 60 }`
- [ ] Verify Lats: ~120% (midpoint of 117-130%)
- [ ] Verify Biceps: Lower than standard pull-ups
- [ ] Reference: emg-research-reference.md lines 107-112
- [ ] Test: TypeScript compiles

**Validation:** Wide Grip Pull-ups includes Trapezius at 60%

---

### Task 1.6: Apply Major Correction - Kettlebell Swings
- [ ] Locate Kettlebell Swings (ex37) in constants.ts
- [ ] Update Hamstrings to: 90% (midpoint of 78.95% mean + 115% peak)
- [ ] Update Glutes to: 75% MVIC
- [ ] Reference: emg-research-reference.md lines 250-256
- [ ] Test: TypeScript compiles

**Validation:** Kettlebell Swings = Hamstrings 90%, Glutes 75%

---

### Task 1.7: Phase 1 Spot Check
- [ ] Review all 5 major corrections in constants.ts
- [ ] Verify TypeScript compiles with no errors
- [ ] Confirm values are in reasonable ranges (0-200%)
- [ ] Commit Phase 1 (optional): "fix: apply 5 major EMG research corrections"

**Validation:** 5 major corrections applied, TypeScript compiles

---

## Phase 2: Push Category Updates

**Estimate:** 1-2 hours

### Task 2.1: Update Dumbbell Bench Press (ex02)
- [ ] Current values (verify first)
- [ ] Update to: Pecs 86% (midpoint of 85.7%), Deltoids 24% (midpoint of 21-26%), Triceps 15%
- [ ] Reference: emg-research-reference.md lines 21-25
- [ ] Test: TypeScript compiles

---

### Task 2.2: Update Single Arm Dumbbell Bench Press (ex38)
- [ ] Update to: Pecs 85%, Deltoids 24%, Triceps 15%, Core 35% (anti-rotation)
- [ ] Reference: emg-research-reference.md lines 27-32
- [ ] Test: TypeScript compiles

---

### Task 2.3: Update Incline Dumbbell Bench Press (ex32)
- [ ] Update to: Pecs 29% (clavicular), Deltoids 32% (midpoint 30-33%), Triceps 15%
- [ ] Reference: emg-research-reference.md lines 34-39
- [ ] Test: TypeScript compiles

---

### Task 2.4: Update Single Arm Incline Bench Press (ex39)
- [ ] Update to: Pecs 29%, Deltoids 32%, Triceps 15%, Core 35%
- [ ] Reference: emg-research-reference.md lines 41-46
- [ ] Test: TypeScript compiles

---

### Task 2.5: Update Dumbbell Shoulder Press (ex05)
- [ ] Update to: Deltoids 63%, Pecs 30%, Triceps (moderate, use 40%)
- [ ] Reference: emg-research-reference.md lines 48-53
- [ ] Test: TypeScript compiles

---

### Task 2.6: Update Kettlebell Press (ex34)
- [ ] Update to: Deltoids 58%, Pecs 30%, Core (enhanced, use 25%)
- [ ] Reference: emg-research-reference.md lines 55-60
- [ ] Test: TypeScript compiles

---

### Task 2.7: Update TRX Pushup (ex31)
- [ ] Update to: Pecs 109% (midpoint of 96.3-121.2%), Triceps 42% (midpoint 37.4-47.1%), Deltoids 50%, Core 40%
- [ ] Reference: emg-research-reference.md lines 62-68
- [ ] Test: TypeScript compiles

---

### Task 2.8: Update TRX Reverse Flys (ex29)
- [ ] Update to: Deltoids 60% (posterior), Trapezius 40%, Rhomboids 40%
- [ ] Reference: emg-research-reference.md lines 70-74
- [ ] Note: Limited data, use moderate estimates
- [ ] Test: TypeScript compiles

---

### Task 2.9: Update Tricep Extension (ex30)
- [ ] Update to: Triceps 77% (midpoint of 72-81% long head)
- [ ] Reference: emg-research-reference.md lines 76-80
- [ ] Test: TypeScript compiles

---

### Task 2.10: Update TRX Tricep Extension (ex40)
- [ ] Update to: Triceps 60% (moderate-high, limited data), Core 25%
- [ ] Reference: emg-research-reference.md lines 82-86
- [ ] Test: TypeScript compiles

---

### Task 2.11: Update Dips (ex33)
- [ ] Update to: Triceps 88%, Pecs 80% (midpoint 73-86%), Deltoids 40%
- [ ] Reference: emg-research-reference.md lines 88-93
- [ ] Test: TypeScript compiles

---

### Task 2.12: Phase 2 Validation
- [ ] Review all Push category exercises updated
- [ ] TypeScript compiles with no errors
- [ ] Spot-check: TRX Pushup shows >100% pecs
- [ ] Commit Phase 2 (optional): "fix: apply EMG corrections to Push exercises"

**Validation:** All Push exercises updated (11 total)

---

## Phase 3: Pull Category Updates

**Estimate:** 1-2 hours

### Task 3.1: Update Pull-up (ex06) - Remaining Muscles
- [ ] Already updated Biceps in Phase 1 (87%)
- [ ] Update Lats: 120% (midpoint 117-130%)
- [ ] Verify Rhomboids: Keep or update to 50% (lower trap 45-56%)
- [ ] Update Forearms: 25% (already accurate per research)
- [ ] Reference: emg-research-reference.md lines 99-106

---

### Task 3.2: Update Chin-Ups (ex20)
- [ ] Update to: Lats 120%, Biceps 87% (higher than pull-ups), Pecs 51% (midpoint 44-57%)
- [ ] Reference: emg-research-reference.md lines 114-119
- [ ] Test: TypeScript compiles

---

### Task 3.3: Update Neutral Grip Pull-ups (ex26)
- [ ] Update to: Lats 120%, Biceps 87%, Trapezius 37%
- [ ] Reference: emg-research-reference.md lines 121-125
- [ ] Test: TypeScript compiles

---

### Task 3.4: Update TRX Pull-up (ex41)
- [ ] Update to: Lats 115% (estimated high), Biceps 87%, Core 30%, Forearms 35%
- [ ] Reference: emg-research-reference.md lines 127-132
- [ ] Note: Limited specific data
- [ ] Test: TypeScript compiles

---

### Task 3.5: Update Dumbbell Row (ex09)
- [ ] Update to: Lats 55% (midpoint 45-65%), Trapezius 50%, Rhomboids 50%, Biceps 30%
- [ ] Reference: emg-research-reference.md lines 134-139
- [ ] Test: TypeScript compiles

---

### Task 3.6: Update Renegade Rows (ex28)
- [ ] Update to: Lats 60%, Rhomboids 60%, Core 80% (high anti-rotation), Pecs 30% (isometric)
- [ ] Reference: emg-research-reference.md lines 141-147
- [ ] Note: Exceptional core activation
- [ ] Test: TypeScript compiles

---

### Task 3.7: Update Dumbbell Bicep Curl (ex07)
- [ ] Update to: Biceps 72% (midpoint 70-74%), Forearms 15%
- [ ] Reference: emg-research-reference.md lines 149-153
- [ ] Test: TypeScript compiles

---

### Task 3.8: Update TRX Bicep Curl (ex19)
- [ ] Update to: Biceps 65% (moderate-high), Core 25%
- [ ] Reference: emg-research-reference.md lines 155-158
- [ ] Note: Limited EMG data
- [ ] Test: TypeScript compiles

---

### Task 3.9: Update Concentration Curl (ex22)
- [ ] Update to: Biceps 85% (highest among curl variations)
- [ ] Reference: emg-research-reference.md lines 160-162
- [ ] Test: TypeScript compiles

---

### Task 3.10: Update Incline Hammer Curl (ex25)
- [ ] Update to: Biceps 70%, Forearms 30% (enhanced with hammer grip)
- [ ] Reference: emg-research-reference.md lines 164-168
- [ ] Test: TypeScript compiles

---

### Task 3.11: Update Dumbbell Upright Row (ex18)
- [ ] Update to: Deltoids 65%, Trapezius 70%, Biceps 30%
- [ ] Reference: emg-research-reference.md lines 170-175
- [ ] Test: TypeScript compiles

---

### Task 3.12: Update Face Pull (ex21)
- [ ] Update to: Deltoids 55% (posterior), Trapezius 55%, Rhomboids 55%
- [ ] Reference: emg-research-reference.md lines 177-182
- [ ] Note: Limited specific % MVIC
- [ ] Test: TypeScript compiles

---

### Task 3.13: Update Shoulder Shrugs (ex23)
- [ ] Update to: Trapezius 75% (>70% MVIC estimated)
- [ ] Reference: emg-research-reference.md lines 184-188
- [ ] Note: Limited specific data
- [ ] Test: TypeScript compiles

---

### Task 3.14: Update Dumbbell Pullover (ex48)
- [ ] Update to: Lats 60%, Pecs 40%, Triceps 35%
- [ ] Reference: emg-research-reference.md lines 190-195
- [ ] Note: Lat-focused variation
- [ ] Test: TypeScript compiles

---

### Task 3.15: Phase 3 Validation
- [ ] Review all Pull category exercises updated
- [ ] TypeScript compiles with no errors
- [ ] Spot-check: Concentration Curl shows highest biceps activation
- [ ] Commit Phase 3 (optional): "fix: apply EMG corrections to Pull exercises"

**Validation:** All Pull exercises updated (14 total including Phase 1 pull-up)

---

## Phase 4: Legs & Core Category Updates

**Estimate:** 1-2 hours

### Task 4.1: Update Kettlebell Goblet Squat (ex12)
- [ ] Update to: Quadriceps 72% (midpoint 67.8-76.4%), Glutes 65%, Hamstrings 35%, Core 30%
- [ ] Reference: emg-research-reference.md lines 201-207
- [ ] Test: TypeScript compiles

---

### Task 4.2: Update Dumbbell Goblet Squat (ex43)
- [ ] Update to: Quadriceps 72%, Glutes 65%, Hamstrings 35%, Core 30%
- [ ] Reference: emg-research-reference.md lines 209-214
- [ ] Note: Nearly identical to kettlebell
- [ ] Test: TypeScript compiles

---

### Task 4.3: Update Dumbbell Romanian Deadlift (ex13)
- [ ] Update to: Hamstrings 75% (semitendinosus higher), Glutes 55%, Core 40% (erector spinae)
- [ ] Reference: emg-research-reference.md lines 216-221
- [ ] Test: TypeScript compiles

---

### Task 4.4: Update Dumbbell Stiff Legged Deadlift (ex36)
- [ ] Update to: Glutes 70% (higher than RDL), Hamstrings 65%, Core 50% (high erector)
- [ ] Reference: emg-research-reference.md lines 223-228
- [ ] Test: TypeScript compiles

---

### Task 4.5: Update Box Step-ups (ex47) - Remaining Muscles
- [ ] Already updated Glutes in Phase 1 (169%)
- [ ] Verify Quadriceps: 67%
- [ ] Add Hamstrings: 51% (midpoint 40-63% rectus femoris)
- [ ] Reference: emg-research-reference.md lines 230-236

---

### Task 4.6: Update Calf Raises (ex15)
- [ ] Update to: Calves 51% (midpoint gastrocnemius 50-52% + soleus 50-51%)
- [ ] Reference: emg-research-reference.md lines 238-242
- [ ] Test: TypeScript compiles

---

### Task 4.7: Update Glute Bridges (ex35)
- [ ] Update to: Glutes 76% (midpoint 65-86% loaded), Hamstrings 23% (midpoint 16.5-29.8%)
- [ ] Reference: emg-research-reference.md lines 244-248
- [ ] Note: Use loaded values, not bodyweight
- [ ] Test: TypeScript compiles

---

### Task 4.8: Update Kettlebell Swings (ex37) - Verify
- [ ] Already updated in Phase 1 (Hamstrings 90%, Glutes 75%)
- [ ] Add Trapezius: 55% (gluteus medius)
- [ ] Reference: emg-research-reference.md lines 250-256

---

### Task 4.9: Update Plank (ex16)
- [ ] Update to: Core 77% (rectus 53.23% right, 26.40% left, but obliques 99-108%)
- [ ] Reference: emg-research-reference.md lines 262-268
- [ ] Note: External obliques are primary
- [ ] Test: TypeScript compiles

---

### Task 4.10: Update Bench Sit-ups (ex17)
- [ ] Update to: Core 70% (midpoint 60-80% estimated)
- [ ] Reference: emg-research-reference.md lines 270-274
- [ ] Note: Limited specific % MVIC
- [ ] Test: TypeScript compiles

---

### Task 4.11: Update Spider Planks (ex44)
- [ ] Update to: Core 90% (obliques >100% estimated)
- [ ] Reference: emg-research-reference.md lines 276-281
- [ ] Note: Limited specific EMG data
- [ ] Test: TypeScript compiles

---

### Task 4.12: Update TRX Mountain Climbers (ex45)
- [ ] Update to: Core 70%, Deltoids 30%
- [ ] Reference: emg-research-reference.md lines 283-289
- [ ] Note: Limited specific % MVIC
- [ ] Test: TypeScript compiles

---

### Task 4.13: Update Hanging Leg Raises (ex46)
- [ ] Update to: Core 75%
- [ ] Reference: emg-research-reference.md lines 291-296
- [ ] Note: Very high hip flexor activation (not tracked separately)
- [ ] Test: TypeScript compiles

---

### Task 4.14: Phase 4 Validation
- [ ] Review all Legs and Core exercises updated
- [ ] TypeScript compiles with no errors
- [ ] Spot-check: Box Step-ups shows 169% glutes
- [ ] Commit Phase 4 (optional): "fix: apply EMG corrections to Legs and Core exercises"

**Validation:** All Legs and Core exercises updated (13 total including Phase 1 step-ups/swings)

---

## Phase 5: Full Validation & Testing

**Estimate:** 1 hour

### Task 5.1: TypeScript Compilation
- [ ] Run: `npm run build` (frontend)
- [ ] Verify: No TypeScript errors
- [ ] Verify: No type mismatches on Muscle enum
- [ ] Verify: All percentage values are numbers

**Validation:** Clean TypeScript build

---

### Task 5.2: Application Launch
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Verify: App loads without console errors
- [ ] Verify: No 404s or failed API calls

**Validation:** App launches successfully

---

### Task 5.3: Workout Screen Testing
- [ ] Navigate to Workout screen
- [ ] Select "Pull-up" from exercise list
- [ ] Add 3 sets with weight/reps
- [ ] Verify: Exercise logs without errors
- [ ] Navigate to Dashboard
- [ ] Verify: Fatigue percentages calculate (should be higher biceps now)

**Validation:** Workout logging works

---

### Task 5.4: Recommendation Testing
- [ ] Navigate to Workout screen
- [ ] View exercise recommendations (if visible)
- [ ] Verify: Recommendations generate without errors
- [ ] Spot-check: Do recommendations seem reasonable?

**Validation:** Recommendations generate

---

### Task 5.5: Spot Check - Pull-up Biceps Impact
- [ ] Log a Pull-up workout (10 reps × 3 sets)
- [ ] Check Dashboard
- [ ] Verify: Biceps fatigue is significantly higher than before (30% → 87%)
- [ ] Compare to old behavior if data available

**Validation:** Pull-up biceps correction affects fatigue

---

### Task 5.6: Spot Check - Push-up Multi-Muscle Impact
- [ ] Log a Push-up workout (15 reps × 3 sets)
- [ ] Check Dashboard
- [ ] Verify: Triceps fatigue higher (50% → 75%)
- [ ] Verify: Deltoids fatigue lower (40% → 30%)
- [ ] Verify: Core fatigue higher (20% → 35%)

**Validation:** Push-up corrections affect fatigue distribution

---

### Task 5.7: Code Review - constants.ts Diff
- [ ] Open git diff for constants.ts
- [ ] Review all changed lines
- [ ] Verify: No typos (75% not 7.5% or 750%)
- [ ] Verify: Muscle enum values correct (Pectoralis, not Pectorals)
- [ ] Verify: Exercise IDs unchanged (ex03, ex06, etc.)
- [ ] Verify: No unintended changes (equipment, difficulty, variation)

**Validation:** Diff shows only muscle engagement percentage changes

---

### Task 5.8: Exercise Count Verification
- [ ] Count exercises in research doc: 40 exercises
- [ ] Count exercises updated in constants.ts: Should be 40
- [ ] Cross-reference: All exercises in research doc have been touched
- [ ] Verify: No exercises skipped

**Validation:** All 40 exercises updated

---

### Task 5.9: Value Range Sanity Check
- [ ] Scan constants.ts for percentage values
- [ ] Verify: All values between 0-200% (reasonable MVIC range)
- [ ] Flag: Any values outside this range (likely typo)
- [ ] Verify: No negative values
- [ ] Verify: No decimal errors (7.5 instead of 75)

**Validation:** All percentage values in reasonable range

---

### Task 5.10: Cross-Browser Testing (Optional)
- [ ] Test in Chrome/Edge
- [ ] Test in Firefox (if available)
- [ ] Verify: No browser-specific issues

**Validation:** Works across browsers

---

## Phase 6: Documentation & Finalization

**Estimate:** 30 minutes

### Task 6.1: Update CHANGELOG.md
- [ ] Add new entry at top:
```markdown
### 2025-10-27 - [Fix] Apply EMG Research Corrections to Exercise Library

**Files Changed**:
- constants.ts (muscle engagement percentages for 40 exercises)

**Summary**: Applied peer-reviewed EMG research findings to correct muscle
engagement percentages in exercise library. Based on 189 scientific citations
from comprehensive research sprint (see docs/emg-research-reference.md).

**Major Corrections**:
1. **Pull-up biceps:** 30% → 87% MVIC (2.9x increase)
2. **Push-up triceps:** 50% → 75% MVIC (1.5x increase)
3. **Push-up deltoids:** 40% → 30% MVIC (25% decrease)
4. **Push-up core:** 20% → 35% MVIC (1.75x increase)
5. **Box Step-ups glutes:** Added 169% MVIC (highest glute activation)

**Coverage**: 40/40 exercises updated with research-validated percentages

**Impact**: More accurate exercise recommendations, improved fatigue tracking,
better baseline learning convergence. Users may notice different recommendations
due to improved accuracy.

**Research Sources**:
- docs/emg-research-reference.md (condensed reference, 40 exercises)
- docs/research-findings.md (detailed analysis, 189 citations)

**Status**: Completed. Ready for user calibration (future enhancement).
```
- [ ] Save CHANGELOG.md

**Validation:** Changelog entry added

---

### Task 6.2: Write Commit Message
- [ ] Type: `fix` (correcting inaccurate data)
- [ ] Scope: `exercise-library`
- [ ] Message:
```
fix(exercise-library): apply EMG research corrections to engagement percentages

Applied peer-reviewed EMG research findings to correct muscle engagement
percentages for all 40 exercises in constants.ts. Based on 189 scientific
citations from comprehensive research sprint.

Major corrections:
- Pull-up biceps: 30% → 87% MVIC
- Push-up triceps: 50% → 75% MVIC
- Push-up deltoids: 40% → 30% MVIC
- Push-up core: 20% → 35% MVIC
- Box Step-ups glutes: Added 169% MVIC

Impact: More accurate recommendations and fatigue tracking.

Research sources:
- docs/emg-research-reference.md
- docs/research-findings.md
```

**Validation:** Commit message drafted

---

### Task 6.3: Create Commit
- [ ] Stage constants.ts
- [ ] Stage CHANGELOG.md
- [ ] Create commit with message from Task 6.2
- [ ] Verify: Commit created successfully
- [ ] Note commit hash for archive

**Validation:** Commit created

---

### Task 6.4: Mark Proposal Tasks Complete
- [ ] Update tasks.md: Mark all tasks complete
- [ ] Update proposal.md: Change status from "Draft" to "Implemented"
- [ ] Add commit hash to proposal.md

**Validation:** Proposal marked complete

---

### Task 6.5: Archive Proposal (Optional - via OpenSpec)
- [ ] Run: `npx openspec archive 2025-10-27-apply-emg-research-corrections --yes`
- [ ] Verify: Proposal moved to archive directory
- [ ] Validate: `npx openspec validate --all`

**Validation:** Proposal archived

---

## Summary

**Total Tasks:** 67 tasks across 6 phases
**Total Time:** 5-8 hours estimated
**Files Changed:** 2 (constants.ts, CHANGELOG.md)
**Exercises Updated:** 40
**Research Citations:** 189

**Critical Success Factors:**
1. ✅ All 40 exercises updated with research-backed values
2. ✅ TypeScript compiles without errors
3. ✅ App functions normally (workout logging, recommendations, fatigue)
4. ✅ Major corrections verified (Pull-up biceps, Push-up multi-muscle, Box Step-ups glutes)
5. ✅ No data entry errors (typos, wrong muscle groups, invalid percentages)
6. ✅ Documentation complete (CHANGELOG.md, commit message)

**Post-Implementation:**
- Personal calibration proposal can now proceed (better defaults)
- Baseline learning will converge faster (better inputs)
- System can credibly claim "research-backed"
- Future features build on accurate foundation
