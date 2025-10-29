# Proposal: Implement Dual-Layer Muscle Tracking

## Overview

**Change ID:** `2025-10-29-implement-dual-layer-muscle-tracking`
**Status:** Draft
**Created:** 2025-10-29
**Priority:** High
**Estimated Effort:** 16-20 hours

## Problem Statement

The current muscle tracking system only tracks 13 visualization muscle groups, but EMG research (`docs/emg-research-reference.md`) shows that exercises engage 40+ specific muscles including:

- **Rotator cuff muscles** (infraspinatus, supraspinatus, teres minor, subscapularis)
- **Scapular stabilizers** (serratus anterior, levator scapulae)
- **Core subdivisions** (rectus abdominis, external/internal obliques, erector spinae)
- **Muscle head divisions** (triceps long/lateral/medial heads)
- **Regional divisions** (upper/middle/lower trapezius, glute max/medius/minimus, etc.)

This lack of granularity leads to:

1. **Inaccurate recuperation tracking** - Missing stabilizer fatigue (e.g., serratus anterior at 45% MVIC in push-ups)
2. **Suboptimal recommendations** - Cannot recommend posterior delt work when only anterior delt is fatigued
3. **Incomplete recovery calculations** - System doesn't know rotator cuff is fatigued even when "deltoids" look fine
4. **Lost research fidelity** - Cannot leverage detailed EMG data already collected

## Proposed Solution

Implement a **dual-layer muscle tracking architecture**:

- **Layer 1 (Visualization):** 13 muscle groups - simple UI, unchanged
- **Layer 2 (Detailed):** 40+ specific muscles - accurate backend tracking

### Key Design Principles

1. **Smart but Invisible** - Better recommendations without UI complexity
2. **Conservative Safety** - When in doubt, protect from overtraining
3. **On-Demand Detail** - Advanced view available via settings toggle
4. **Accuracy First** - Track all muscles, display aggregated view

### User Experience Impact

**For typical users:**
- No UI changes - still see 13 clean muscle cards
- Better recommendations that "feel right"
- Smarter workout suggestions (e.g., "try posterior delt exercises" when anterior is fatigued)

**For power users:**
- Optional "Detailed View" toggle in settings
- See breakdown of 40+ muscles with fatigue percentages
- Understand exactly which stabilizers are limiting performance

## Capabilities Delivered

This change introduces three new capabilities:

1. **`detailed-muscle-tracking`** - Backend tracking of 40+ muscles with role-based categorization
2. **`muscle-specific-recommendations`** - Exercise recommendations based on detailed muscle state
3. **`advanced-muscle-visualization`** - Optional UI toggle for power users to see detailed breakdown

## Success Criteria

### Quantitative Metrics
- ✅ All 40 exercises updated with detailed muscle engagements from EMG research
- ✅ Database tracks 40+ detailed muscles per user
- ✅ <5% performance degradation on dashboard load
- ✅ Aggregation maintains backward compatibility with existing visualization

### Qualitative Outcomes
- ✅ Recommendations target fresh muscles within muscle groups
- ✅ Users report recommendations "feel smarter"
- ✅ Power users can explore detailed muscle data
- ✅ System learns more accurate baselines over time

## Non-Goals

- **Not** changing the existing 13-muscle visualization for typical users
- **Not** requiring users to manually calibrate 40+ baselines
- **Not** forcing advanced view on anyone
- **Not** modifying existing recuperation formulas (just use better data)

## Dependencies

### Technical
- EMG research data in `docs/emg-research-reference.md`
- Existing muscle tracking infrastructure
- Database migration capability

### Sequential
- Must complete before: Baseline learning algorithm improvements
- Blocks: None (can run in parallel with other features)

## Risks & Mitigation

### Risk: Performance Impact
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Use separate table for detailed tracking
- Index by visualization muscle for fast aggregation
- Benchmark dashboard load times before/after

### Risk: Baseline Calibration Complexity
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- All detailed muscles inherit full baseline (conservative)
- System learns actual capacities over time
- Users never see calibration complexity

### Risk: User Confusion
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Hide detail by default
- Advanced toggle clearly labeled "Advanced Users"
- Provide educational tooltips in detailed view

## Timeline

### Phase 1: Foundation (Week 1, 4-6 hours)
- Add `DetailedMuscle` enum with 40+ muscles
- Create `detailed_muscle_states` table
- Implement mapping functions
- Initialize detailed baselines from existing data

### Phase 2: Data Population (Week 1-2, 4-6 hours)
- Update all 40 exercises with detailed muscle engagements
- Validate against EMG research
- Create migration script for existing users

### Phase 3: Smart Recommendations (Week 2, 4-6 hours)
- Refactor recommendation engine
- Add muscle-specific logic
- Generate smart explanations

### Phase 4: Advanced UI (Week 2-3, 4-6 hours)
- Add settings toggle
- Create DetailedMuscleCard component
- User testing with power users

**Total Estimated:** 16-24 hours across 2-3 weeks

## Alternatives Considered

### Alternative 1: Keep 13 muscles, add "notes" field
**Rejected because:** Loses all benefits of granular tracking, can't improve recommendations

### Alternative 2: Expand to 40 muscles everywhere
**Rejected because:** Overwhelming UI complexity, breaks mental model

### Alternative 3: Manual calibration of all 40 muscles
**Rejected because:** User burden too high, nobody would use it

## Open Questions

1. **Auto-learn baselines?** Should system automatically adjust detailed baselines based on performance data?
   - **Decision needed by:** Phase 3 implementation
   - **Recommendation:** Yes, with confidence scoring

2. **Asymmetry tracking?** Track left vs right side separately for unilateral exercises?
   - **Decision needed by:** Future enhancement
   - **Recommendation:** Defer to v2

3. **Export capability?** Allow power users to export detailed muscle data?
   - **Decision needed by:** Phase 4 UI
   - **Recommendation:** Yes, as JSON download

## References

- **EMG Research:** `docs/emg-research-reference.md`
- **Design Document:** `docs/dual-layer-muscle-tracking-REFINED.md`
- **Personal Records:** `personal-records.json`
- **Existing Muscle Enum:** `types.ts:2-16`
- **Exercise Library:** `constants.ts:6-527`

## Approval

**Proposed by:** Development Team
**Date:** 2025-10-29
**Status:** Awaiting Review

---

*Next Steps: Create `design.md`, spec deltas, and `tasks.md`*
