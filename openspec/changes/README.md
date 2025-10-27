# FitForge OpenSpec Change Proposals

This directory contains all active and archived OpenSpec change proposals for FitForge.

---

## Active Proposals (2025-10-27)

### Medium Priority

#### 1. Research & Validate Muscle Fatigue Model
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

#### 2. Personal Muscle Engagement Calibration
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

## Recently Implemented (2025-10-27)

### A/B Variation Intelligence
**Change ID:** `implement-ab-variation-intelligence`
**Location:** `archive/2025-10-27-2025-10-26-implement-ab-variation-intelligence/`
**Status:** ✅ Implemented and Deployed
**Completed:** 2025-10-27

Intelligent workout variation tracking and suggestions to guide users to alternate between A/B templates and weight/reps progression methods.

**Delivered:**
- Dashboard "Last Workouts" section showing 4 category cards with variation suggestions
- Each card displays last variation and suggests opposite (e.g., "Last: Push A → Ready for: Push B")
- Template screen highlights recommended variation with "RECOMMENDED" badge
- Progression method tracking (weight vs reps) with intelligent alternation
- Variation and progression_method saved to database on workout complete
- First-time user experience with "First workout!" messaging
- Mobile-responsive 2×2 grid layout
- ~2 hours implementation time (most infrastructure already existed)

### To Failure Tracking UI
**Change ID:** `implement-to-failure-tracking-ui`
**Location:** `archive/2025-10-27-2025-10-26-implement-to-failure-tracking-ui/`
**Status:** ✅ Implemented and Deployed
**Completed:** 2025-10-26

Added UI toggle for marking sets as "taken to failure" to unlock accurate baseline learning.

**Delivered:**
- Toggle checkbox UI on each set with smart last-set defaults
- 44x44px touch target for mobile accessibility
- Educational tooltip modal with info icon
- ARIA labels and press animations
- Fixed bug where manually added exercises didn't get proper defaults
- ~3.5 hours implementation time

### Recovery Dashboard Components
**Change ID:** `implement-recovery-dashboard-components`
**Location:** `archive/2025-10-25-implement-recovery-dashboard-components/`
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

**Last Updated:** 2025-10-27
**Active Proposals:** 2
**Recently Completed:** 2
**Archived:** 8+
