# Proposal: Fix Database Architecture Integrity

**Change ID:** `fix-database-architecture-integrity`
**Status:** Draft
**Created:** 2025-10-29
**Priority:** Critical (P0)

---

## Problem Statement

A comprehensive architectural audit revealed **4 critical data integrity risks** that could lead to corrupted or inconsistent workout data:

1. **Redundant `volume_today` field** - Stored separately but never validated against exercise sets, creating desync risk
2. **No workout deletion cascade logic** - Deleting workouts leaves muscle states, baselines, and PRs stale
3. **Missing bounds validation** - Database accepts invalid fatigue percentages without constraint enforcement
4. **Personal records never rebuilt** - PRs are incrementally updated but never verified against actual workout history

These issues prevent users from safely trusting the database with real workout data, as data could silently become inconsistent over time.

### User Impact

**Before this change:**
- ❌ Workout data could desync from calculated states
- ❌ Deleting a workout leaves orphaned/stale data
- ❌ Invalid data could accumulate silently
- ❌ No way to verify data integrity
- ❌ Users cannot trust database for production use

**After this change:**
- ✅ All data is validated and constrained at database level
- ✅ Workout deletions properly recalculate dependent state
- ✅ Data integrity can be verified and audited
- ✅ Users can confidently use database for real workouts

---

## Solution Overview

This change implements a **4-phase data integrity hardening strategy**:

### Phase 1: Schema Constraints (Database-Level Validation)
- Add CHECK constraints for fatigue percentages (0-100 range)
- Add validation for weight/reps ranges
- Remove redundant `volume_today` column
- Add NOT NULL constraints where appropriate

### Phase 2: State Recalculation Functions
- Implement `rebuildMuscleBaselines()` - Recalculate from all failure sets
- Implement `rebuildPersonalBests()` - Recalculate from all workout history
- Implement `resetMuscleStatesForDate()` - Clear stale muscle states
- Add validation functions to verify state consistency

### Phase 3: Workout Deletion Handling
- Add `DELETE /api/workouts/:id` endpoint
- Wrap deletion + recalculation in transaction
- Return summary of affected data
- Add audit logging for deletions

### Phase 4: Transaction Boundaries
- Expand `saveWorkout()` transaction to include baseline learning
- Expand to include PR detection
- Add rollback on any step failure
- Ensure atomic all-or-nothing behavior

---

## Capabilities

This proposal adds three new capabilities to the system:

1. **`database-integrity-constraints`** - Database-level validation rules preventing invalid data
2. **`state-recalculation-engine`** - Functions to rebuild derived state from source data
3. **`workout-deletion-cascade`** - Safe workout deletion with dependent state updates

---

## Dependencies

- Requires existing database schema (backend/database/schema.sql)
- Requires existing database operations (backend/database/database.ts)
- Requires existing API server (backend/server.ts)

No breaking changes to existing functionality.

---

## Non-Goals

This proposal does NOT include:
- Detailed muscle tracking implementation (separate effort)
- Workout rotation validation (design concern, not critical)
- Analytics query optimization (performance, not integrity)
- Caching of user settings (optimization, not critical)

---

## Success Criteria

### Functional Requirements
- ✅ Database rejects invalid fatigue percentages (< 0 or > 100)
- ✅ `volume_today` removed or recalculated from source
- ✅ Workout deletion recalculates baselines and PRs
- ✅ `saveWorkout()` transaction includes all state updates
- ✅ All tests pass with new constraints

### Data Integrity Tests
- ✅ Inserting workout with invalid data throws error
- ✅ Deleting workout updates all dependent state
- ✅ Rebuilding PRs matches actual workout history
- ✅ Rebuilding baselines matches actual failure sets
- ✅ Failed transaction leaves no partial data

### Performance Requirements
- Rebuild functions complete in < 5 seconds for 1000 workouts
- Deletion with recalculation completes in < 2 seconds
- No impact on normal workout save performance

---

## Implementation Phases

### Phase 1: Schema Constraints (2-3 hours)
1. Add CHECK constraints to schema.sql
2. Test constraints with invalid data
3. Migration script for existing data validation

### Phase 2: Recalculation Functions (3-4 hours)
4. Implement `rebuildMuscleBaselines()`
5. Implement `rebuildPersonalBests()`
6. Implement `resetMuscleStatesForDate()`
7. Add validation functions
8. Unit tests for recalculation accuracy

### Phase 3: Deletion Handling (2-3 hours)
9. Implement `DELETE /api/workouts/:id` endpoint
10. Transaction wrapper for deletion + recalc
11. Frontend UI for workout deletion (optional)
12. Integration tests for deletion flow

### Phase 4: Transaction Expansion (1-2 hours)
13. Expand `saveWorkout()` transaction boundaries
14. Add rollback error handling
15. Integration tests for atomicity

**Total Estimated Time:** 8-12 hours

---

## Risks & Mitigations

### Risk: Breaking Existing Data
**Mitigation:**
- Add migration script to clean existing data before applying constraints
- Test on backup database first
- Provide rollback script

### Risk: Performance Degradation
**Mitigation:**
- Rebuild functions only run on deletion (rare operation)
- Transaction expansion has negligible overhead
- Benchmark before/after on large datasets

### Risk: User Workflow Disruption
**Mitigation:**
- No changes to normal workout logging flow
- Deletion is optional feature, not required
- All changes are backend-only, no UI changes required

---

## Validation Plan

### Unit Tests
- Constraint validation (invalid data rejected)
- Recalculation accuracy (matches manual calculation)
- Transaction rollback (no partial writes)

### Integration Tests
- Full workout lifecycle (create → delete → verify cleanup)
- Concurrent operations (race condition testing)
- Large dataset performance (1000+ workouts)

### Manual Testing
- Test with real workout data from JSON backup
- Verify all muscle states recalculate correctly
- Test deletion of workout with PRs

---

## Rollback Plan

If issues arise after deployment:

1. Revert schema changes (remove CHECK constraints)
2. Restore `volume_today` column if removed
3. Disable deletion endpoint
4. Revert `saveWorkout()` transaction changes

All changes are additive and can be safely reverted without data loss.

---

## Future Enhancements

After this change is complete, future work could include:

- **Audit Trail Table** - Track all state changes with timestamps
- **Data Integrity Dashboard** - UI to view consistency reports
- **Automated Integrity Checks** - Cron job to validate state consistency
- **Backup/Restore Functions** - Export/import workout data with validation

---

## References

- **Architecture Audit Report** - Full analysis of integrity issues
- **Database Schema** - backend/database/schema.sql
- **Database Operations** - backend/database/database.ts
- **API Server** - backend/server.ts

---

## Approval

- [ ] Architecture review complete
- [ ] Risk assessment approved
- [ ] Implementation plan validated
- [ ] Ready to proceed with tasks.md

---

*Proposal created: 2025-10-29*
*Last updated: 2025-10-29*
