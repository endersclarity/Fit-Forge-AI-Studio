# Proposal: Apply EMG Research Corrections to Exercise Library

**Change ID:** `apply-emg-research-corrections`
**Status:** Draft
**Created:** 2025-10-27
**Priority:** High (Improves accuracy of core system intelligence)

---

## Executive Summary

Apply peer-reviewed EMG research findings to correct muscle engagement percentages in the exercise library (constants.ts). This updates default values based on 189 scientific citations, improving the accuracy of FitForge's recommendation engine and fatigue tracking system.

**Problem:** FitForge's exercise library contains muscle engagement percentages that were initially estimated without comprehensive research validation. Recent EMG research sprint (docs/emg-research-reference.md, docs/research-findings.md) identified significant discrepancies:

- **Pull-up biceps:** Currently 30% → Should be 78-96% MVIC
- **Push-up triceps:** Currently 50% → Should be 70-80% MVIC
- **Push-up deltoids:** Currently 40% → Should be 25-35% MVIC
- **Push-up core:** Currently 20% → Should be 30-40% MVIC
- **Box Step-ups:** Missing glute data → Should be 169% MVIC (highest of all exercises)

With inaccurate defaults, the system gives suboptimal recommendations and fatigue estimates don't match users' actual recovery needs.

**Solution:** Systematically update all 40 exercises in constants.ts with research-validated engagement percentages. This is a pure data correction - no new features, no architectural changes. Simply replacing estimates with peer-reviewed science.

**Impact:**
- More accurate exercise recommendations
- Better fatigue tracking and recovery estimates
- Improved baseline learning convergence (garbage in, garbage out problem)
- Scientific credibility for future features
- Better defaults before users apply personal calibration

---

## Why

### Current State

**What Exists:**
- ✅ 48 exercises in EXERCISE_LIBRARY (constants.ts)
- ✅ Muscle engagement percentages for each exercise
- ✅ Recommendation algorithm using these percentages
- ✅ Fatigue tracking based on engagement values
- ✅ Comprehensive EMG research documentation (189 citations)

**What's Wrong:**
- ❌ Many engagement percentages are estimates, not research-backed
- ❌ 5 major discrepancies identified (see Executive Summary)
- ❌ 38/40 exercises now have specific % MVIC data available
- ❌ Using outdated values undermines system intelligence
- ❌ Baseline learning works with inaccurate inputs

**Critical Context:**

From research proposal (archived):
> Lines 507-528: "V1 Philosophy: Ship imperfect, iterate with real data. The heat map uses rough approximations initially - this is acceptable and provides value while we research the underlying model."

We shipped V1 with approximations. Research phase is complete. Time to apply findings.

From CHANGELOG.md (2025-10-27 entry):
> "Research Coverage: 40/40 exercises from FitForge database researched with EMG data. 38/40 exercises (95%) have specific % MVIC values from peer-reviewed studies."

### Value Proposition

**For System Accuracy:**
- **Recommendations improve** - Correct engagement = better exercise selection
- **Fatigue tracking improves** - Accurate engagement = realistic recovery estimates
- **Baseline learning improves** - Better inputs → better learned capacities
- **Scientific credibility** - Can claim "research-backed" legitimately
- **Future-proofing** - Personal calibration starts from better defaults

**For Users (Indirect):**
- **Better recommendations** - System suggests exercises that actually match their fatigue state
- **Accurate recovery** - Fatigue percentages align with how they actually feel
- **Trust** - Transparent that system is based on peer-reviewed research
- **Calibration baseline** - When users customize, they start from accurate defaults

**Strategic Context:**

This is a prerequisite for the `implement-personal-engagement-calibration` proposal. Users should calibrate FROM accurate defaults, not FROM rough estimates. Applying research corrections first ensures the baseline is solid.

---

## What Changes

### Modified Capabilities

- **`exercise-library`** (constants.ts) - Update muscle engagement percentages for 40 exercises
- **`exercise-recommendation-algorithm`** - Inherits improved accuracy (no code changes)
- **`muscle-fatigue-tracking`** - Inherits improved accuracy (no code changes)

### Specific Changes

**Major Corrections (5 exercises):**

1. **Pull-up (ex06)** - Biceps: 30% → 87% (midpoint of 78-96% range)
2. **Push-up (ex03)** - Triceps: 50% → 75%, Deltoids: 40% → 30%, Core: 20% → 35%
3. **Box Step-ups (ex47)** - Add Glutes: 169% (currently missing), update quads/hamstrings
4. **Wide Grip Pull-ups (ex42)** - Add Trapezius: 60% (currently missing or underspecified)
5. **Kettlebell Swings (ex37)** - Update Hamstrings to 90% (currently may be lower)

**Comprehensive Updates (35 remaining exercises):**

Update all exercises where research provides specific % MVIC values. See `docs/emg-research-reference.md` for complete data (lines 11-296).

**No Changes Required:**
- Exercise names, IDs, categories
- Equipment requirements
- Difficulty levels
- Variations (A/B/Both)
- Database schema
- API endpoints
- UI components

This is purely a data correction in one file: constants.ts

---

## Scope

### In Scope

✅ **Update constants.ts**
- Modify muscle engagement percentages for all 40 researched exercises
- Use midpoint values where research gives ranges (e.g., 70-80% → 75%)
- Add missing muscle groups where research identifies them
- Ensure percentages reflect % MVIC findings

✅ **Data Validation**
- Cross-reference every change with `docs/emg-research-reference.md`
- Verify no typos or transposition errors
- Ensure Muscle enum values match (Pectoralis, Triceps, etc.)
- Confirm exercise IDs match (ex03, ex06, etc.)

✅ **Documentation**
- Update CHANGELOG.md with summary of corrections
- Reference research documents in commit message
- Note major corrections in changelog entry

✅ **Testing**
- Manual verification: Load app, check recommendations still work
- Verify no TypeScript errors
- Confirm fatigue tracking still functions
- Spot-check: Do new percentages affect recommendations as expected?

### Out of Scope (Future Work)

❌ Inline code comments citing research sources (user doesn't want this)
❌ Adding new exercises not in current library (5 extras from research)
❌ UI changes to display research confidence levels
❌ Implementing personal calibration system (separate proposal)
❌ Muscle-specific recovery rates (future enhancement)
❌ Auto-calibration based on research findings

### Dependencies

**Required (Already Exists):**
- ✅ EMG research reference document (docs/emg-research-reference.md)
- ✅ Detailed research findings (docs/research-findings.md)
- ✅ EXERCISE_LIBRARY structure in constants.ts
- ✅ Muscle enum in types.ts

**No New Dependencies**

**Blocks:**
- `implement-personal-engagement-calibration` - Should calibrate from accurate defaults
- Future research applications (periodization, deload, etc.)

---

## Success Metrics

### Immediate (On Deployment)

- ✅ All 40 exercises updated with research-backed percentages
- ✅ TypeScript compiles without errors
- ✅ App loads and functions normally
- ✅ Recommendations still generate (no crashes)
- ✅ Fatigue tracking still calculates
- ✅ Major corrections applied (5 key exercises verified)

### Short-term (2-4 weeks post-deployment)

- 📈 Recommendations feel more accurate to user
- 📈 Fatigue percentages align better with actual recovery
- 📈 Baseline learning converges faster (better inputs)
- 📈 No regression bugs reported
- 📈 User trust in system intelligence increases

### Long-term (8+ weeks)

- 📈 System maintains accuracy as user performs more workouts
- 📈 Personal calibration (when implemented) starts from solid baseline
- 📈 Can credibly market as "research-backed" system
- 📈 Community contributions cite research docs
- 📈 Future features build on accurate foundation

---

## Risks & Mitigation

### Risk: Breaking Changes to Recommendations

**Scenario:** Updated percentages drastically change which exercises are recommended
**Impact:** User confused why recommendations suddenly different
**Mitigation:**
- This is expected and desired (more accurate recommendations)
- Changes are gradual (not 0% → 100%, but 30% → 87%)
- No code changes, just data corrections
- User can always override with personal calibration (future)
- Document in changelog: "Recommendations may change due to improved accuracy"

### Risk: Data Entry Errors

**Scenario:** Typo in percentage (75% becomes 7.5% or 750%)
**Impact:** Broken recommendations, invalid fatigue calculations
**Mitigation:**
- Careful cross-referencing with research docs
- TypeScript type checking (percentage must be number)
- Manual testing after each batch of changes
- Code review of constants.ts diff
- Spot-check: Do values look reasonable? (0-200% range)

### Risk: Research Uncertainty

**Scenario:** Some exercises have ranges (70-80%) or limited data
**Impact:** Choosing wrong midpoint or estimate
**Mitigation:**
- Use midpoint for ranges (70-80% → 75%)
- Prefer conservative estimates where data is limited
- Document confidence levels in research doc (already done)
- Can adjust later if better research emerges
- Personal calibration allows user overrides

### Risk: Muscle Enum Mismatches

**Scenario:** Research refers to "Anterior Deltoid" but enum is "Deltoids"
**Impact:** Adding wrong muscle group or typo
**Mitigation:**
- Stick to existing Muscle enum values (no new muscle groups)
- Map research terminology to enum (e.g., "Pectoralis major" → Muscle.Pectoralis)
- Verify enum values: Pectoralis, Deltoids, Triceps, Biceps, Lats, Rhomboids, Trapezius, Forearms, Quadriceps, Hamstrings, Glutes, Calves, Core

### Risk: Total Engagement Exceeds 100%

**Scenario:** Research shows values >100% MVIC (TRX Push-ups = 121% pecs)
**Impact:** System assumes total should be ~100%, may confuse users
**Mitigation:**
- This is scientifically valid (dynamic > isometric MVIC)
- System doesn't enforce total = 100% constraint
- Research doc explains why >100% is possible (lines 330-331)
- Future: Add tooltip explaining MVIC if needed
- For now: Apply research values as-is

---

## Alternatives Considered

### Alternative 1: Apply Corrections Gradually Over Time

**Pros:**
- Less risk of sudden changes
- Can monitor impact per correction

**Cons:**
- Delays accuracy improvements
- Inconsistent data (some exercises accurate, others not)
- More commits, more tracking overhead

**Decision:** Rejected. Apply all at once for consistency.

---

### Alternative 2: Create New "Research-Backed" Exercise Library

**Pros:**
- Preserves old data
- Users can choose old vs new

**Cons:**
- Unnecessary complexity
- Old data was estimates, not validated
- Doubles maintenance burden
- Confuses users ("Which library should I use?")

**Decision:** Rejected. Update in-place, old data had no value.

---

### Alternative 3: Wait for Personal Calibration Feature First

**Pros:**
- Users can override anyway
- Less urgent if calibration exists

**Cons:**
- Calibration should start from accurate defaults
- Delays improvements for all future features
- Bad defaults undermine baseline learning
- Research is done, no reason to wait

**Decision:** Rejected. Apply research first, THEN enable calibration.

---

### Alternative 4: Use Conservative Estimates Where Research Uncertain

**Pros:**
- Avoids overcommitting to uncertain data

**Cons:**
- Research covers 38/40 exercises (95%)
- Uncertainty is minimal for most exercises
- Conservative = inaccurate if research is clear

**Decision:** Partial accept. Use midpoints for ranges, but trust research where specific.

---

## Implementation Phases

### Phase 1: Preparation & Major Corrections (1-2 hours)

**Tasks:**
1. Create working branch (if needed)
2. Open constants.ts and docs/emg-research-reference.md side-by-side
3. Apply 5 major corrections first (Pull-up, Push-up, Box Step-ups, Wide Pull-ups, KB Swings)
4. Verify TypeScript compiles
5. Spot-check: Do changes look reasonable?

**Acceptance Criteria:**
- 5 major corrections applied
- TypeScript compiles
- Values in reasonable ranges (0-200%)

---

### Phase 2: Comprehensive Updates - Push Exercises (1-2 hours)

**Tasks:**
1. Update all Push category exercises (lines 11-94 in research doc)
   - Dumbbell Bench Press (ex02)
   - Single Arm Bench Press (ex38)
   - Incline variations (ex32, ex39)
   - Shoulder Presses (ex05, ex34)
   - TRX variations (ex31, ex29)
   - Tricep exercises (ex30, ex40)
   - Dips (ex33)
2. Cross-reference each change with research doc
3. Test TypeScript compilation after batch

**Acceptance Criteria:**
- All Push exercises updated
- TypeScript compiles
- No obvious errors in percentages

---

### Phase 3: Comprehensive Updates - Pull Exercises (1-2 hours)

**Tasks:**
1. Update all Pull category exercises (lines 97-196 in research doc)
   - Pull-up variations (ex06, ex42, ex20, ex26, ex41)
   - Rows (ex09, ex28)
   - Bicep curls (ex07, ex19, ex22, ex25)
   - Upright Row (ex18)
   - Face Pull (ex21)
   - Shoulder Shrugs (ex23)
   - Dumbbell Pullover (ex48)
2. Cross-reference each change
3. Test compilation

**Acceptance Criteria:**
- All Pull exercises updated
- TypeScript compiles
- Biceps correction verified (30% → 87%)

---

### Phase 4: Comprehensive Updates - Legs & Core (1-2 hours)

**Tasks:**
1. Update Legs category (lines 199-256 in research doc)
   - Goblet Squats (ex12, ex43)
   - Deadlift variations (ex13, ex36)
   - Box Step-ups (ex47)
   - Calf Raises (ex15)
   - Glute Bridges (ex35)
   - Kettlebell Swings (ex37)
2. Update Core category (lines 260-296 in research doc)
   - Plank (ex16)
   - Bench Sit-ups (ex17)
   - Spider Planks (ex44)
   - TRX Mountain Climbers (ex45)
   - Hanging Leg Raises (ex46)
3. Cross-reference all changes
4. Test compilation

**Acceptance Criteria:**
- All Legs and Core exercises updated
- Box Step-ups glutes correction verified (169%)
- TypeScript compiles

---

### Phase 5: Validation & Testing (1 hour)

**Tasks:**
1. Full TypeScript compilation check
2. Run app locally (npm run dev or Docker)
3. Navigate to Workout screen
4. Select exercises from each category (Push, Pull, Legs, Core)
5. Verify recommendations still generate
6. Check Dashboard for fatigue tracking
7. Spot-check: Do Pull-ups now show higher biceps fatigue?
8. Spot-check: Do Push-ups show lower deltoid fatigue?
9. Review constants.ts diff for any typos
10. Verify all 40 exercises touched

**Acceptance Criteria:**
- App loads without errors
- Recommendations generate correctly
- Fatigue tracking calculates
- Spot-checks confirm changes applied
- Diff review shows no obvious errors
- All 40 exercises updated

---

### Phase 6: Documentation & Commit (30 min)

**Tasks:**
1. Update CHANGELOG.md
   - Add entry: "Applied EMG research corrections to exercise library"
   - Note major corrections (5 key exercises)
   - Reference research documents
2. Write commit message
   - Type: "fix" (correcting inaccurate data)
   - Format: "fix: apply EMG research corrections to exercise engagement percentages"
   - Body: Mention 40 exercises, 189 citations, 5 major corrections
3. Commit changes
4. Mark proposal tasks as complete

**Acceptance Criteria:**
- CHANGELOG.md updated
- Commit created with clear message
- Tasks marked complete
- Ready for archive

---

**Total Estimate:** 5-8 hours (1 day of focused work)

**Note:** Can batch changes by category for incremental commits if preferred. Or single commit with all changes (simpler).

---

## Related Documentation

### Research Foundation
- `docs/emg-research-reference.md` - Condensed research reference (all 40 exercises with % MVIC)
- `docs/research-findings.md` - Detailed research analysis (189 citations, 1,250+ lines)
- `CHANGELOG.md` - Line 1 (2025-10-27 research completion entry)

### Technical References
- `constants.ts` - EXERCISE_LIBRARY to be updated
- `types.ts` - Muscle enum and Exercise interface
- `utils/exerciseRecommendations.ts` - Uses engagement percentages (no changes needed)

### Related OpenSpec Changes

**Foundation (Archived):**
- `research-muscle-fatigue-model-validation` - Research that informs these corrections

**Complements:**
- `implement-personal-engagement-calibration` (draft) - Users calibrate FROM these improved defaults

**Enables Future Work:**
- Muscle-specific recovery rates
- Advanced periodization
- Deload recommendations
- Any feature relying on accurate engagement data

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Research documents cross-referenced (emg-research-reference.md)
- [ ] Major corrections identified (5 key exercises)
- [ ] Scope confirmed: Pure data correction, no feature changes
- [ ] tasks.md created with phased implementation
- [ ] Validation passes: `openspec validate apply-emg-research-corrections --strict`
- [ ] Risk assessment complete
- [ ] Dependencies confirmed (research docs exist)
- [ ] Alignment with workflow: Proposal → Apply → Archive

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create `tasks.md` with detailed task breakdown
3. ⏭️ Validate proposal: `openspec validate apply-emg-research-corrections --strict`
4. ⏭️ Get approval to proceed
5. ⏭️ Begin Phase 1: Major Corrections
6. ⏭️ Complete all 6 phases systematically
7. ⏭️ Commit and archive proposal

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply apply-emg-research-corrections` (after approval and validation)

**Note:** This is a data correction proposal, not a feature proposal. No new capabilities, no UI changes, no API changes. Simply replacing estimates with peer-reviewed science in a single file.
