# FitForge OpenSpec Change Proposals

This directory contains all active and archived OpenSpec change proposals for FitForge.

---

## Active Proposals (2025-10-26)

### Critical Priority

#### 1. To Failure Tracking UI
**Change ID:** `implement-to-failure-tracking-ui`
**Location:** `2025-10-26-implement-to-failure-tracking-ui/`
**Status:** Draft - Ready for Review
**Priority:** Critical
**Estimated:** 9-14 hours (1-2 days)

Add UI toggle for marking sets as "taken to failure" to unlock accurate baseline learning.

**Key Deliverables:**
- Toggle button on each set in Workout screen
- Auto-mark last set as failure (smart default)
- Visual distinction between failure and submaximal sets
- Pass `to_failure` flag to backend API

**Why Critical:** The baseline learning algorithm (already implemented) cannot accurately learn muscle capacity without knowing which sets were max-effort vs warmup.

**Next Steps:**
1. Review proposal
2. Create design.md and spec deltas
3. Create tasks.md
4. Begin Phase 1: Core Toggle UI

---

### High Priority

#### 2. A/B Variation Intelligence
**Change ID:** `implement-ab-variation-intelligence`
**Location:** `2025-10-26-implement-ab-variation-intelligence/`
**Status:** Draft - Ready for Review
**Priority:** High
**Estimated:** 18-24 hours (2-3 days)

Intelligent workout variation tracking and suggestions to guide users to alternate between A/B templates and weight/reps progression methods.

**Key Deliverables:**
- Dashboard shows "Last workout: Push A (3 days ago) → Ready for: Push B"
- Track variation and progression method per workout
- Suggest opposite variation and alternating method
- Highlight recommended templates

**Why High Priority:** Completes Priority 1 from brainstorming vision. Anti-plateau design philosophy.

**Next Steps:**
1. Review proposal
2. Create design.md for UI and method detection
3. Create spec deltas for capabilities
4. Begin Phase 1: Backend Last Workout Query

---

### Medium Priority

#### 3. Research & Validate Muscle Fatigue Model
**Change ID:** `research-muscle-fatigue-model-validation`
**Location:** `2025-10-26-research-muscle-fatigue-model-validation/`
**Status:** Draft - Ready for Review
**Priority:** Medium
**Estimated:** 12-17 hours (1.5-2 days)

Formal research sprint to validate scientific foundation of muscle fatigue models.

**Key Deliverables:**
- `docs/research-findings.md` document
- Literature review on muscle engagement (EMG studies)
- Recovery curve validation
- Baseline learning mathematical specification
- Confidence assessment (High/Med/Low) for each model

**Why Important:** De-risks advanced features by ensuring scientific foundation is solid.

**Next Steps:**
1. Review proposal
2. Create research findings document outline
3. Begin Phase 1: Muscle Engagement Literature Review

**Note:** This is a research proposal (documentation deliverable), not a coding proposal.

---

#### 4. Personal Muscle Engagement Calibration
**Change ID:** `implement-personal-engagement-calibration`
**Location:** `2025-10-26-implement-personal-engagement-calibration/`
**Status:** Draft - Ready for Review
**Priority:** Medium
**Estimated:** 21-27 hours (2.5-3.5 days)

Enable users to override default muscle engagement percentages for exercises based on personal biomechanics.

**Key Deliverables:**
- Modal showing engagement breakdown for each exercise
- Sliders to adjust percentages per muscle
- Database storage for user calibration overrides
- Visual "Calibrated" badge on adjusted exercises
- Merge logic: User override > Default

**Why Valuable:** Transforms FitForge from one-size-fits-all to truly personalized training coach.

**Next Steps:**
1. Review proposal
2. Design database schema for calibrations
3. Create design.md for UI and merge logic
4. Begin Phase 1: Database Schema & API

---

## Recently Implemented (2025-10-25)

### Recovery Dashboard Components
**Change ID:** `implement-recovery-dashboard-components`
**Location:** `2025-10-25-implement-recovery-dashboard-components/`
**Status:** ✅ Implemented and Deployed
**Completed:** 2025-10-25

Converted HTML prototype into production React component library for Recovery Dashboard.

**Delivered:**
- Complete component library (Button, Card, Badge, ProgressBar, Modal)
- Fitness-specific components (MuscleCard, StatusBadge, ExerciseRecommendationCard)
- Recovery Dashboard screen with muscle heat map
- Smart exercise recommendations with status badges
- Progressive overload UI integration
- WCAG AAA accessibility compliance

---

## Archived Proposals

See `archive/` directory for completed and deployed proposals:
- `enable-progressive-overload-system` - Backend +3% calculations
- `enable-smart-exercise-recommendations` - Recommendation algorithm
- `enable-muscle-fatigue-heat-map` - Muscle state tracking
- `refactor-backend-driven-muscle-states` - Backend API endpoints
- `enable-template-based-workouts` - Template system
- `fix-deployment-blockers` - Type safety and reliability

---

## Proposal Creation Workflow

To create a new proposal:

1. Create directory: `openspec/changes/YYYY-MM-DD-{change-id}/`
2. Write `proposal.md` (required)
3. Create `design.md` (if complex architecture)
4. Write spec deltas in `specs/{capability}/spec.md`
5. Create `tasks.md` (detailed implementation breakdown)
6. Validate: `openspec validate {change-id} --strict`
7. Get approval from product owner
8. Apply: `openspec:apply {change-id}`

---

## Related Documentation

- **Brainstorming Vision:** `docs/brainstorming-session-results.md`
- **Gap Analysis:** `docs/gap-analysis-and-proposals-summary.md`
- **Data Model:** `docs/data-model.md`
- **Project Overview:** `openspec/project.md`
- **Architecture:** `docs/ARCHITECTURE.md`

---

## Status Legend

- ✅ **Implemented** - Deployed to production
- 🚧 **In Progress** - Active development
- 📋 **Draft** - Ready for review
- 🔍 **Research** - Investigation phase
- 📦 **Archived** - Completed and documented

---

**Last Updated:** 2025-10-26
**Active Proposals:** 4
**Recently Completed:** 1
**Archived:** 6+
