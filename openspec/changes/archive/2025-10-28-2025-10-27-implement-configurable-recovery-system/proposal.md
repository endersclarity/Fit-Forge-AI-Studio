# Proposal: Implement Configurable Recovery System

**Change ID:** `implement-configurable-recovery-system`
**Created:** 2025-10-27
**Status:** Draft
**Priority:** Medium
**Estimated Effort:** 3-4 hours

---

## Problem Statement

Based on user feedback (USER_FEEDBACK.md, 2025-10-27), the current recovery system uses a fixed 7-day recovery period, but the user wants 5 days:

**User Quote:**
> "Current system: 7 days to full recovery. **Should change to: 5 days to 100% recovery** (starting from 100% fatigue)"

**Current Implementation:**
- Hardcoded 7-day recovery period
- Linear fatigue decay: `currentFatigue = initialFatigue * (1 - daysElapsed / 7)`
- Not configurable per user or per muscle

**Issues:**
1. Recovery rate is hardcoded, not user-configurable
2. User has specific training schedule requiring faster recovery model
3. No ability to customize recovery based on personal experience or muscle type

---

## Goals

### Primary Goal
Make recovery period configurable via user settings, defaulting to 5 days (user preference).

### Success Criteria
1. ✅ User can set recovery days in profile settings
2. ✅ Default recovery period is 5 days (changed from 7)
3. ✅ Recovery calculations use user-configured value
4. ✅ Existing muscle states recalculate correctly with new recovery rate
5. ✅ UI displays correct "days until recovered" based on setting

---

## Proposed Solution

### Database Schema Addition

Add `recovery_days_to_full` column to `users` table:

```sql
ALTER TABLE users ADD COLUMN recovery_days_to_full INTEGER DEFAULT 5;
```

**Rationale:**
- User-level setting (not muscle-specific)
- Default to 5 days (user preference)
- Allows future per-muscle customization if needed

### Recovery Calculation Update

**Current formula (hardcoded 7):**
```typescript
const currentFatigue = initialFatigue * (1 - daysElapsed / 7);
```

**New formula (dynamic):**
```typescript
const recoveryDays = user.recovery_days_to_full || 5;
const currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays);
```

### UI Updates

1. **Profile Settings:**
   - Add "Recovery Speed" slider or input
   - Range: 3-10 days (reasonable bounds)
   - Default: 5 days
   - Help text: "Days to recover from 100% fatigue to 0%"

2. **Muscle Visualization:**
   - No change needed (already calculates based on backend data)

3. **Recovery Timeline:**
   - Update "days until recovered" based on user setting
   - Example: "Pectoralis: 3 days until recovered (5-day recovery model)"

---

## Capabilities

This change introduces/modifies:

1. **`user-settings`** (ADDED)
   - Recovery rate configuration
   - Persistence to database
   - API endpoint for updating settings

2. **`recovery-calculation`** (MODIFIED)
   - Dynamic recovery rate instead of hardcoded 7
   - Uses user preference from database
   - Backward compatible (defaults to 5 if not set)

---

## Implementation Phases

### Phase 1: Database Schema (30 min)
- Add `recovery_days_to_full` column to users table
- Create migration script
- Set default value to 5 days
- Update existing user record with default

### Phase 2: Backend API (1 hour)
- Update `GET /api/profile` to include `recovery_days_to_full`
- Update `PUT /api/profile` to accept `recovery_days_to_full`
- Update muscle state calculation to use user's recovery days
- Update types in `backend/types.ts`

### Phase 3: Frontend Settings UI (1-1.5 hours)
- Add "Recovery Speed" setting to Profile component
- Slider or number input (3-10 days range)
- Display current value with help text
- Save button updates profile via API

### Phase 4: Recovery Display Updates (30 min)
- Update any "days until recovered" displays
- Ensure muscle viz recalculates correctly
- Test with different recovery day values

### Phase 5: Testing & Validation (30 min)
- Test recovery calculation with 3, 5, 7, 10 days
- Verify muscle states update correctly
- Test profile settings save and load
- Verify backward compatibility

---

## Out of Scope

1. **Per-muscle recovery rates** - Future enhancement
2. **Non-linear recovery curves** - Future research
3. **Auto-adjustment based on performance** - Future ML feature
4. **Recovery rate recommendations** - Future coaching feature

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users set unrealistic values (1 day or 30 days) | Medium | Enforce range: 3-10 days |
| Existing muscle states break with new calculation | High | Test with various scenarios, ensure backward compatibility |
| Recovery rate doesn't match user's actual physiology | Medium | Add help text explaining this is a model, not reality |

---

## Dependencies

- ✅ Users table exists
- ✅ Profile API endpoints exist (`GET/PUT /api/profile`)
- ✅ Muscle state calculation in backend
- ⚠️  Database migration capability (need to verify)

---

## Testing Plan

### Manual Testing Checklist
- [ ] Set recovery days to 5 → muscle states recalculate correctly
- [ ] Set recovery days to 3 → faster recovery, states update
- [ ] Set recovery days to 10 → slower recovery, states update
- [ ] Save setting → reload app → setting persists
- [ ] Edge case: Set to 0 or negative → validation prevents
- [ ] Edge case: Set to >10 → validation prevents or warns

### Calculation Validation
- [ ] 100% fatigue, 0 days elapsed → 100% current fatigue
- [ ] 100% fatigue, 2.5 days elapsed, 5-day recovery → 50% current fatigue
- [ ] 100% fatigue, 5 days elapsed, 5-day recovery → 0% current fatigue
- [ ] 100% fatigue, 10 days elapsed, 5-day recovery → 0% current fatigue (clamped)

---

## Rollback Plan

If changes cause issues:
1. Git revert to previous version
2. Database rollback: Remove `recovery_days_to_full` column
3. Restore hardcoded 7-day recovery (or 5-day if that's better default)

---

## Related

- **User Feedback:** USER_FEEDBACK.md (2025-10-27 entry)
- **Future Enhancements:**
  - Per-muscle recovery rates (e.g., core recovers faster than legs)
  - Non-linear recovery curves (80% recovery in first 2 days, 20% in last 3)
  - ML-based recovery rate adjustment based on performance

---

## Notes

**User-Requested Change:**
- Current: 7 days to full recovery
- Requested: 5 days to full recovery
- Solution: Make it configurable, default to 5

**Design Decision:**
Using linear recovery for V1 simplicity. Research shows recovery is actually non-linear (faster initially), but linear model is "good enough" and easier to reason about. Can enhance later with research-backed curves.
