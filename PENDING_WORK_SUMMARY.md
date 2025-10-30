# FitForge - Pending Work Summary
**Generated:** 2025-10-29
**Purpose:** Rehydrate context after losing track of conversation

---

## 🎯 Current Status Overview

You recently completed:
1. ✅ **Dual-Layer Muscle Tracking** (commit `68ffc51`) - Database schema created but **INCOMPLETE IMPLEMENTATION**
2. ✅ **Quick Builder Smart Generation** (commit `951ad7e`) - Enhanced with volume slider and smart defaults
3. ✅ **Comprehensive Documentation Audit** (commit `6567b1b`) - Updated UI-ELEMENTS.md and data-model.md

---

## 🚨 CRITICAL INCOMPLETE FEATURES

### 1. Dual-Layer Muscle Tracking (⚠️ PARTIALLY IMPLEMENTED)

**What exists:**
- ✅ Database table `detailed_muscle_states` with 42 specific muscles
- ✅ Migration 007 successfully applied
- ✅ API endpoint `GET /api/muscle-states/detailed` exists
- ✅ Design document: `docs/dual-layer-muscle-tracking-REFINED.md`

**What's missing:**
- ❌ Detailed muscle states **NEVER UPDATED** after workouts
- ❌ No aggregation from 42 muscles → 13 visualization muscles
- ❌ No baseline learning for detailed muscles
- ❌ No confidence scoring implementation
- ❌ `detailedMuscleEngagements` not added to Exercise Library
- ❌ Recommendation engine doesn't use detailed muscles yet

**Impact:** System tracks 42 muscles in database but never populates them. The table exists but is essentially dead code.

**Reference:**
- Proposal: `openspec/changes/archive/2025-10-29-implement-dual-layer-muscle-tracking/`
- Design: `docs/dual-layer-muscle-tracking-REFINED.md`
- Test Report: `TEST_REPORT_DUAL_LAYER_MUSCLE_TRACKING.md`

---

### 2. Template Category/Variation Hardcoded (🐛 BUG)

**Location:** `components/WorkoutBuilder.tsx:234-235`

**Issue:**
```typescript
category: 'Push', // TODO: Auto-detect or ask user
variation: 'A', // TODO: Auto-detect or ask user
```

**Impact:** All saved templates are marked as "Push A" regardless of actual exercises

**Fix Required:** Add UI to ask user for category/variation when saving template

**Status:** Documented in UI-ELEMENTS.md as Critical Issue #3

---

### 3. Muscle Deep Dive "Add to Workout" Non-Functional (🐛 BUG)

**Location:** `components/Dashboard.tsx:516`

**Issue:**
```typescript
// TODO: Integration with WorkoutPlannerModal
const handleAddToWorkout = (planned: PlannedExercise) => {
  console.log('Add to workout:', planned);
};
```

**Impact:** Users cannot add exercises from muscle deep dive modal to their workout

**Fix Required:** Implement proper integration with Workout Planner or Workout Tracker

**Status:** Documented in UI-ELEMENTS.md as Critical Issue #1

---

### 4. Analytics Page Missing Back Button (🐛 BUG)

**Location:** `components/Analytics.tsx:73`

**Impact:** Users must use browser back or click Analytics icon again to return to dashboard

**Fix Required:** Add back button to Analytics header (like other pages have)

**Status:** Documented in UI-ELEMENTS.md as Critical Issue #2

---

## 📋 UI-ELEMENTS.md RECOMMENDATIONS

### High Priority (✅ = Implemented, ⚙️ = Pending)

1. ✅ **Fix Analytics back button**
2. ✅ **Implement "Add to Workout" in Muscle Deep Dive**
3. ✅ **Fix template category/variation**
4. ✅ **Add muscle detail level toggle**

### Medium Priority

5. ⚙️ **Implement modal auto-save** - Save Workout Builder/Planner state to localStorage
6. ⚙️ **Add edit/delete to Personal Records** - Full CRUD for PRs
7. ⚙️ **Remove or implement BottomNav** - Clean up unused component

### Low Priority

8. 📝 **Add breadcrumb navigation** - Improve navigation hierarchy visibility
9. 📝 **Simplify workout entry flows** - Consider unifying multiple paths
10. 📝 **Improve exercise selector UX** - Better close button labeling

---

## 📊 DATA MODEL INCOMPLETE FEATURES

From `docs/data-model.md`:

### 1. Unused `workout_templates.sets` Column
**Issue:** Migration 006 added `sets` column but code still uses `exercise_ids`

**Impact:**
- New column is unused in application code
- Existing templates were set to empty array '[]'
- No migration to convert old format to new format

**Status:** ⚠️ INCOMPLETE MIGRATION

---

### 2. Detailed Muscle States Never Updated
**Issue:** `detailed_muscle_states` table exists but is never populated after workouts

**Impact:**
- GET /api/muscle-states/detailed returns empty/stale data
- Dual-layer tracking architecture incomplete
- No baseline learning for detailed muscles
- 42 specific muscles tracked in schema but not in practice

**Missing Implementation:**
- Workout save logic doesn't update detailed_muscle_states
- No aggregation from detailed → visualization muscles
- No baseline capacity learning
- No confidence scoring

**Status:** ⚠️ INCOMPLETE FEATURE (duplicate of Critical #1 above)

---

### 3. Exercise Calibrations Never Auto-Learned
**Issue:** `user_exercise_calibrations` table exists but only supports manual entry

**Impact:**
- Calibrations are used in baseline learning calculations
- But system never learns/suggests calibrations automatically
- User must manually override every muscle engagement

**Missing Implementation:**
- No ML/statistical analysis to suggest calibrations
- No "suggested calibrations" based on workout history
- No confidence scoring for user overrides

**Status:** ⚠️ MANUAL ONLY

---

### 4. Workout Rotation State Manual Management
**Issue:** `workout_rotation_state` requires manual API calls to update

**Impact:**
- State can become out of sync with actual workouts
- No automatic progression after workout completion
- Rest day tracking is manual

**Workaround:** Frontend must call rotation API after saving workouts

**Status:** ⚠️ REQUIRES MANUAL SYNC

---

## 🔍 ACTIVE TODOs IN CODEBASE

From grep search results:

### Dashboard.tsx
```typescript
// TODO: Integration with WorkoutPlannerModal
const handleAddToWorkout = (planned: PlannedExercise) => {
  console.log('Add to workout:', planned);
};
```

### RecoveryDashboard.tsx
```typescript
// TODO: Navigate to workout screen
// TODO: Show muscle detail modal
// TODO: Show exercise detail modal
```

### Workout.tsx
```typescript
// TODO: Load template exercises from templatesAPI
```

### WorkoutBuilder.tsx
```typescript
category: 'Push', // TODO: Auto-detect or ask user
variation: 'A', // TODO: Auto-detect or ask user
```

---

## 📚 ACTIVE OPENSPEC PROPOSALS

From `openspec/changes/README.md`:

### Medium Priority

#### Personal Muscle Engagement Calibration
**Change ID:** `implement-personal-engagement-calibration`
**Status:** Draft - Ready for Review
**Priority:** Medium
**Estimated:** 21-27 hours (2.5-3.5 days)

**Description:** Enable users to override default muscle engagement percentages for exercises based on personal biomechanics.

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

## 🎯 RECOMMENDED NEXT STEPS

### Option 1: Complete Dual-Layer Muscle Tracking
**Why:** Database schema exists, design is complete, but feature is 50% done

**Tasks:**
1. Add `detailedMuscleEngagements` to all 50+ exercises in constants.ts
2. Update workout save logic to populate `detailed_muscle_states`
3. Implement aggregation logic (42 detailed → 13 visualization)
4. Add baseline learning for detailed muscles
5. Update recommendation engine to use detailed tracking
6. Test muscle-specific recommendations

**Effort:** 2-3 days
**Impact:** HIGH - Makes tracking significantly more accurate

---

### Option 2: Fix Critical UI Bugs
**Why:** Quick wins, immediate user experience improvements

**Tasks:**
1. Fix Analytics back button (15 min)
2. Implement "Add to Workout" from Muscle Deep Dive (1-2 hours)
3. Fix template category/variation hardcoding (1 hour)
4. Add muscle detail level toggle in settings (1 hour)

**Effort:** 4-5 hours
**Impact:** MEDIUM - Removes frustrating UX issues

---

### Option 3: Implement Personal Engagement Calibration
**Why:** New feature that completes the personalization story

**Tasks:**
1. Review OpenSpec proposal
2. Create database schema
3. Build calibration UI modal
4. Implement merge logic (user override > default)
5. Add "Calibrated" badges to exercises

**Effort:** 2.5-3.5 days
**Impact:** HIGH - Enables true personalization

---

## 📖 KEY DOCUMENTS TO REVIEW

1. **UI-ELEMENTS.md** - Complete UI inventory with all known issues
2. **docs/data-model.md** - Database schema and incomplete features
3. **docs/dual-layer-muscle-tracking-REFINED.md** - Design for incomplete feature
4. **USER_FEEDBACK.md** - Raw user experience log
5. **CHANGELOG.md** - Recent changes and what was implemented

---

## 🤔 OPEN QUESTIONS FROM DESIGN DOC

From `docs/dual-layer-muscle-tracking-REFINED.md`:

1. **Auto-learn baselines?** Should system automatically adjust detailed muscle baselines based on observed performance, or wait for user input?

2. **Show confidence?** In detailed view, should we show baseline confidence (low/medium/high) to help users understand what system knows?

3. **Asymmetry tracking?** Should we track left vs right side separately for unilateral exercises?

4. **Export data?** Should power users be able to export detailed muscle data for their own analysis?

---

## 💡 CONVERSATION CONTEXT

You said:
> "I recently updated the data model and did a whole breakdown of UI elements, and I can see that there are some recommendations at the end of UI elements. I don't know if there were any recommendations for data model. I've totally lost track of the whole fucking conversation."

**What happened:**
1. You worked on dual-layer muscle tracking implementation
2. Created database schema but didn't complete the feature
3. Did comprehensive documentation audit (UI-ELEMENTS.md, data-model.md)
4. Identified multiple TODOs and incomplete features
5. Created OpenSpec proposal for engagement calibration
6. Lost track of what needs to be done next

**This document is your roadmap back.**

---

## ✅ NEXT ACTION: YOUR CHOICE

Pick one:

A. **Complete Dual-Layer Tracking** - Finish what you started (2-3 days)
B. **Fix Critical Bugs** - Quick wins for UX (4-5 hours)
C. **Build Calibration Feature** - New capability (2.5-3.5 days)
D. **Something else** - Tell me what you want to focus on

---

**End of Summary**
