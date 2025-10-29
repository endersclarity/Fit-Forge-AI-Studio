# Archived Superpowers Plans

This directory contains completed implementation plans created by the Superpowers workflow.

## Archive Policy

Plans are moved here when:
1. ✅ Implementation is complete
2. ✅ Code has been committed to main branch
3. ✅ Feature is verified working

## Archived Plans

### Quick Builder + Execution Mode
**Archived:** 2025-10-29
**Implemented:** Commit `e7782e0` (2025-10-28)
**Files:**
- `quick-builder-execution-mode-plan.md` - Complete implementation plan (83KB)
- `READY_TO_IMPLEMENT.md` - Summary with decisions and verification checklist
- `quick-builder-FIXED.md` - Patch notes for fixes during implementation

**What was delivered:**
- WorkoutBuilder component with planning + execution modes
- Template system with save/load
- Guided timer with auto-advance
- Real-time muscle fatigue visualization (current + forecast)
- 7 new components, 2 backend endpoints, 1 database migration

**Related OpenSpec:** Partially implemented the archived `2025-10-27-implement-forecasted-fatigue-workout-builder` OpenSpec proposal

---

### Muscle Deep Dive Modal
**Archived:** 2025-10-29
**Implemented:** Commits `da0d3b5` through `d0bc1b3` (2025-10-28)
**Files:**
- `2025-10-28-muscle-deep-dive-modal.md` - Brainstorming and refined design

**What was delivered:**
- MuscleDeepDiveModal with 3 tabs (Recommended/All/History)
- ExerciseCard with volume slider and set builder
- Exercise efficiency ranking algorithm
- Integration with Dashboard

**Related OpenSpec:** Superseded `2025-10-27-implement-muscle-deep-dive-modal`, implemented as `2025-10-28-implement-interactive-muscle-deep-dive`

---

## Workflow

When a Superpowers plan is implemented:

1. Verify implementation is complete via git commits
2. Move plan files to `docs/plans/archive/`
3. Update this README with:
   - Archive date
   - Implementation commit(s)
   - What was delivered
   - Related OpenSpec proposals (if any)

## Active Plans

See parent directory (`docs/plans/`) for plans currently being implemented.
