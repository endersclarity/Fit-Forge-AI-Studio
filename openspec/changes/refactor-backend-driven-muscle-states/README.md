# Backend-Driven Muscle State Calculations - OpenSpec Proposal

**Change ID:** `refactor-backend-driven-muscle-states`
**Status:** Draft (Ready for Review)
**Created:** 2025-10-25
**Estimated Effort:** 8-12 hours

---

## 📋 Quick Summary

Transition FitForge from hybrid frontend/backend muscle fatigue calculations to **backend-driven single source of truth** architecture. Fixes critical bug where API-created workouts show 0% fatigue, reduces frontend code by ~100 lines, and establishes clean separation of concerns.

---

## 🎯 What's Changing

### Database
- **Rename:** `fatigue_percent` → `initial_fatigue_percent` (semantic clarity)
- **Remove:** `recovered_at` field (dead code)
- **Fix:** UNIQUE constraint from `muscle_name` to `(user_id, muscle_name)` (multi-user bug)

### Backend
- **Add:** Calculation engine with recovery formulas
- **Return:** 7 calculated fields per muscle (was 4 basic fields)
- **Calculate:** currentFatigue, daysElapsed, recoveryDays, daysUntilRecovered, status

### Frontend
- **Remove:** ~100 lines of calculation logic
- **Add:** Auto-refresh on mount + manual refresh button
- **Display:** Backend values directly (zero calculation logic)

---

## 📁 Proposal Structure

```
openspec/changes/refactor-backend-driven-muscle-states/
├── README.md (this file)
├── proposal.md (executive summary, problem/solution, phases)
├── design.md (architectural patterns, formulas, trade-offs)
├── tasks.md (21 detailed implementation tasks across 5 phases)
└── specs/
    ├── backend-muscle-state-calculation/
    │   └── spec.md (7 requirements, 22 scenarios)
    ├── muscle-state-storage/
    │   └── spec.md (5 requirements, database schema changes)
    └── muscle-state-presentation/
        └── spec.md (7 requirements, frontend refactor)
```

---

## 📊 Capabilities

| Capability | Type | Requirements | Impact |
|------------|------|--------------|--------|
| `backend-muscle-state-calculation` | NEW | 7 requirements | Backend becomes calculation engine |
| `muscle-state-storage` | MODIFIED | 5 requirements | Database schema cleanup + bug fix |
| `muscle-state-presentation` | MODIFIED | 7 requirements | Frontend becomes pure presentation |

**Total:** 19 requirements, 40+ scenarios

---

## 🚀 Implementation Plan

### Phase 1: Backend Foundation (3-4 hours)
- Create database migration
- Implement calculation engine
- Update API endpoints
- Test with curl

**Checkpoint:** Commit backend changes

### Phase 2: Frontend Types (30 minutes)
- Add `MuscleStateResponse` type
- Mark old `MuscleState` as deprecated
- No breaking changes yet

**Checkpoint:** Commit type changes

### Phase 3: Frontend Display (2-3 hours)
- Update Dashboard to use API values
- Add refresh button
- Add loading/error states
- Remove calculation calls (keep functions)

**Checkpoint:** Commit Dashboard changes

### Phase 4: Workout Integration (2 hours)
- Update workout save to use `initial_fatigue_percent`
- Refetch states after workout
- Test end-to-end workflow

**Checkpoint:** Commit workout changes

### Phase 5: Cleanup & Polish (1-2 hours)
- Remove deprecated calculation functions
- Remove old TypeScript types
- Update documentation
- Full end-to-end testing

**Checkpoint:** Final commit

---

## ✅ Success Metrics

### Code Quality
- ✅ -100 lines frontend code
- ✅ Single source of truth
- ✅ Zero duplicate logic

### Bug Fixes
- ✅ API workouts show correct fatigue (fixes 0% bug)
- ✅ Multi-user constraint fixed
- ✅ No race conditions

### Developer Experience
- ✅ Easier debugging (one calculation point)
- ✅ Easier to modify formulas
- ✅ TypeScript prevents API mismatches

### User Experience
- ✅ Accurate heat map always
- ✅ Manual refresh control
- ✅ Fast (<50ms responses)

---

## 🧪 Testing Strategy

### Backend Tests (Phase 1)
```bash
curl http://localhost:3001/api/muscle-states | jq
# Expected: 13 muscles, 7 fields each

curl -X PUT http://localhost:3001/api/muscle-states \
  -H "Content-Type: application/json" \
  -d '{"Triceps": {"initial_fatigue_percent": 51, "last_trained": "2025-10-25T12:00:00Z"}}' | jq
# Expected: Returns all muscles with Triceps updated
```

### Frontend Tests (Phase 3-4)
- Navigate to Dashboard → auto-refresh works
- Never-trained muscle → displays "Never trained"
- Partially recovered → shows correct %
- Fully recovered → shows "Ready now"
- Click refresh → data updates
- Log workout → heat map updates
- PRs still work

### Edge Cases
- Empty database (all "Never trained")
- Boundary conditions (33%, 66% exactly)
- Very high/low fatigue
- Multiple workouts same day
- Network errors

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Null handling bugs | High | Explicit null checks, ternary operators |
| Timezone bugs | High | Always use UTC (`toISOString()`) |
| Incomplete migration | High | Systematic component list, grep searches |
| Docker caching | Medium | `docker-compose down -v && build --no-cache` |
| Floating point errors | Low | Round to 1 decimal place |

---

## 🔙 Rollback Plan

### Quick Rollback (Any Phase)
```bash
git log --oneline
git reset --hard <last-good-commit>
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Phase-Specific Rollback
- Phase 1 → `git revert <backend-commit>`
- Phase 3 → `git revert <dashboard-commit>`
- Phase 4 → `git revert <workout-commit>`

---

## 📖 Reading Order

1. **Start Here:** `proposal.md` - High-level overview
2. **Deep Dive:** `design.md` - Architectural patterns and trade-offs
3. **Implementation:** `tasks.md` - Step-by-step tasks
4. **Specs:** `specs/*/spec.md` - Detailed requirements

---

## 🔗 Related Documents

- **Architecture Doc:** `docs/ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md` (v1.1)
- **Current ERD:** `DATA_MODEL_ERD.md`
- **Post-Refactor ERD:** `DATA_MODEL_ERD_POST_REFACTOR.md`
- **Project Spec:** `openspec/project.md`

---

## ✋ Review Checklist

Before starting implementation:

- [ ] Architecture reviewed and approved
- [ ] Migration strategy approved (data wipe acceptable?)
- [ ] Phase breakdown makes sense
- [ ] Risk mitigation adequate
- [ ] Rollback plan clear
- [ ] All open questions in proposal.md resolved
- [ ] Estimated time reasonable (8-12 hours)

---

## 📝 Next Steps

1. **Review** this proposal with stakeholder
2. **Approve** migration strategy (data wipe vs preserve)
3. **Begin** Phase 1 implementation
4. **Checkpoint** after each phase
5. **Test** thoroughly before moving to next phase

---

## 🏆 Expected Outcome

After completion:

- ✅ Bug fixed (API workouts display correct fatigue)
- ✅ Codebase simplified (~100 lines removed)
- ✅ Architecture improved (clean separation of concerns)
- ✅ Maintainability enhanced (one place to change formulas)
- ✅ Foundation set for future enhancements (V2 non-linear curves)

---

*Proposal Ready for Review - 2025-10-25*

**Questions?** See `proposal.md` section "Open Questions"
**Details?** Read `design.md` for architectural deep dive
**Ready to Code?** Follow `tasks.md` step-by-step
