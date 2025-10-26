# Proposal: Enable MuscleMax Baseline Learning

**Change ID:** `enable-musclemax-baseline-learning`
**Status:** Draft
**Created:** 2025-10-25
**Priority:** High (Priority 3 from brainstorming roadmap)

---

## Executive Summary

Replace the hardcoded 10,000-unit muscle baseline with an intelligent learning system that automatically calibrates muscle capacity from actual performance data. This change enables accurate fatigue calculations, personalized recovery recommendations, and progressive overload suggestions tailored to individual user strength.

**Problem:** Current system uses arbitrary 10,000 baseline for all 13 muscles, making fatigue percentages meaningless.

**Solution:** Hybrid learning model that:
1. Auto-learns from "to failure" sets (conservative max observed volume)
2. Allows manual user override for calibration control
3. Provides full transparency into learned vs. user-set values

**Impact:** Foundation for intelligent muscle capacity tracking - enables accurate fatigue estimates and personalized training recommendations.

---

## Motivation

### Current Pain Points

1. **Meaningless Fatigue Data**
   - All 13 muscles start at 10,000 baseline (arbitrary)
   - Fatigue percentages don't reflect actual capacity
   - Recovery recommendations are unreliable

2. **No Personalization**
   - Everyone has same baselines regardless of strength
   - No way to calibrate based on actual performance
   - System never gets smarter with use

3. **Missed Learning Opportunity**
   - Already tracking "to failure" sets (schema has `to_failure` column)
   - Rich performance data not being used
   - User loses trust in system intelligence

### Value Proposition

**For Users:**
- Accurate fatigue tracking that reflects YOUR strength
- Progressively better recommendations as you train
- Control via manual override when needed
- Transparency into what system has learned

**For System:**
- Foundation for future advanced features (triangulation, calibration)
- Progressive accuracy without complex algorithms (MVP approach)
- Safe, conservative estimates prevent overtraining
- Builds trust through visible intelligence

---

## Scope

### In Scope

✅ **Baseline Learning Engine**
- Auto-update baselines from "to failure" sets
- Conservative max observed volume algorithm
- Ratchet model (baselines only increase)
- Per-muscle tracking for all 13 muscle groups

✅ **Manual Override System**
- User can set custom baseline per muscle
- Override takes priority over system learned value
- Both values stored independently
- Smart notifications when override exceeded

✅ **Transparency & UI**
- Settings page showing system vs. override vs. effective baseline
- Last updated timestamps
- Toast notifications on baseline updates
- Clear indicators of data source (system/user)

### Out of Scope (Future Enhancements)

❌ Triangulation algorithm (constraint satisfaction solving)
❌ Baseline history tracking & charts
❌ Muscle-specific recovery rates
❌ Detraining detection & auto-decay
❌ Confidence scoring based on update count

### Dependencies

**Required (Already Exists):**
- `to_failure` column in `exercise_sets` table ✅
- `muscle_baselines` table with `system_learned_max` and `user_override` ✅
- Exercise muscle engagement percentages in constants ✅

**Blocked By:** None

**Blocks:** Future advanced analytics, personal calibration features

---

## Capabilities Affected

### New Capabilities

1. **`baseline-learning-engine`**
   - Automatically learns muscle capacity from failure sets
   - Updates `muscle_baselines.system_learned_max`
   - Returns updated baselines in workout save response

2. **`manual-baseline-override`**
   - User interface for viewing/editing baselines
   - Validation and persistence of user overrides
   - Smart warnings when system learns higher values

### Modified Capabilities

- **`workout-logging`**: Workout save now triggers baseline learning
- **`muscle-fatigue-tracking`**: Uses effective baseline (override ?? learned ?? default)

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Baselines auto-update from failure sets
- ✅ API includes baseline changes in response
- ✅ Manual override UI functional
- ✅ No breaking changes to existing features

### Short-term (2-4 weeks post-deployment)

- 📈 90%+ of active muscles have learned baselines (not default 10,000)
- 📈 Fatigue percentages align with user perception
- 📈 Progressive overload suggestions become more accurate
- 📈 User engagement with settings/baseline page

### Long-term (8+ weeks)

- 📈 Baseline convergence to stable values
- 📈 Improved recovery recommendation accuracy
- 📈 User trust in system intelligence increases
- 📈 Foundation ready for advanced features (Phase 2)

---

## Technical Approach

### Algorithm: Conservative Max Observed Volume

**Core Principle:** If muscle handled X volume when trained to failure, it can handle **at least** X.

```typescript
muscle_volume = weight × reps × (muscle_engagement_percentage / 100)

For each to_failure set:
  For each muscle in exercise:
    observed_volume = total_volume × engagement
    if observed_volume > current_baseline:
      UPDATE baseline to observed_volume
```

**Why Conservative:**
- Compound exercises involve multiple muscles
- We don't know which muscle failed first
- Under-estimating capacity → conservative fatigue estimates → prevents overtraining
- Progressive accuracy as more data collected

### Effective Baseline Calculation

```typescript
effective_max = user_override ?? system_learned_max ?? 10000
```

**Separation of Concerns:**
- `system_learned_max`: Auto-updated, never manually touched
- `user_override`: Manual only, never auto-updated
- Both stored for full transparency

---

## Risks & Mitigation

### Risk: Under-estimation of Capacity

**Scenario:** Triceps fail first on push-ups, pectoralis baseline under-estimated
**Impact:** Conservative fatigue estimates, longer recovery recommendations
**Mitigation:**
- Acceptable for MVP (safe > accurate)
- Future: Triangulation algorithm for precision
- User can override if too conservative

### Risk: User Override Confusion

**Scenario:** User sets override, system learns higher, confusion about which is used
**Impact:** Loss of trust in system
**Mitigation:**
- Clear UI showing all three values (system/override/effective)
- Smart warnings when discrepancy detected
- Documentation in settings page

### Risk: Rapid Baseline Changes for New Users

**Scenario:** First few workouts cause large baseline jumps
**Impact:** Fatigue calculations fluctuate dramatically
**Mitigation:**
- Expected behavior (system learning)
- Communicate in UI: "Calibrating..." for first few workouts
- Stabilizes after 5-10 workouts

---

## Alternatives Considered

### Alternative 1: Start at Zero, Learn Everything

**Rejected:** Division by zero errors, requires special handling

### Alternative 2: Triangulation from Day 1

**Rejected:** Complex algorithm, requires research validation, over-engineering for MVP

### Alternative 3: User Sets All Baselines Manually

**Rejected:** High friction, most users don't know their muscle capacities

### Alternative 4: Estimate from Bodyweight + Experience

**Rejected:** Population averages don't reflect individual variance

---

## Implementation Phases

### Phase 1: Backend Foundation (4-6 hours)

- Add `updateMuscleBaselines()` function
- Integrate into workout save flow
- Return baseline updates in API response

### Phase 2: Manual Override UI (6-8 hours)

- Settings page for baseline management
- Show system/override/effective values
- Validation and persistence

### Phase 3: Notifications (1-2 hours)

- Toast on baseline updates
- Smart warnings on override exceeded

### Phase 4: Testing & Validation (3-4 hours)

- Unit tests for learning algorithm
- Integration tests for workflow
- Manual testing with real workouts

**Total Estimate:** 14-20 hours (2-3 days)

---

## Related Documentation

- `docs/musclemax-baseline-learning-system.md` - Complete implementation plan
- `docs/brainstorming-session-results.md` - Original feature ideation
- `docs/data-model.md` - Database schema reference
- `backend/database/schema.sql` - Table definitions

---

## Approval Checklist

- [ ] Proposal reviewed by product owner (Kaelen)
- [ ] Design.md created for architectural decisions
- [ ] Spec deltas written for both capabilities
- [ ] Tasks.md breaks down implementation
- [ ] Validation passes: `openspec validate enable-musclemax-baseline-learning --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available

---

## Next Steps

1. Review this proposal
2. Create `design.md` for algorithm details
3. Write spec deltas for capabilities
4. Create `tasks.md` implementation plan
5. Validate and get approval
6. Begin Phase 1 implementation
