# Profile Page Refinements - Design Document

**Date:** 2025-01-17
**Feature:** Clean up Profile page and restore Muscle Heat Map to Dashboard
**Approach:** UI refinements + verification task

---

## Problem Statement

The Profile page has accumulated some unused/unclear fields, and the Muscle Heat Map component (which users expect on the Dashboard) was removed during the "progressive disclosure" refactor (commit 5ab9ae3).

**User Pain Points:**
1. Muscle Heat Map missing from Dashboard (was there in earlier builds)
2. Profile page has confusing/unused fields cluttering the UI
3. Uncertainty about whether bodyweight field is actually connected to exercise tracking

---

## Solution: Three Focused Tasks

### Task 1: Re-add Muscle Heat Map to Dashboard ✅
**Goal:** Import and display the MuscleHeatMap component on Dashboard

**Approach:**
- Component already exists at `components/fitness/MuscleHeatMap.tsx`
- Import into Dashboard.tsx
- Place in aesthetically pleasing location (agent's choice)
- Match existing Dashboard styling patterns
- User will request changes if placement needs adjustment

**Data Requirements:**
- MuscleHeatMap needs muscle state data (likely passed as props)
- Dashboard already fetches muscle states via useAPIState
- Should integrate seamlessly with existing data flow

---

### Task 2: Investigate Bodyweight Linkage 🔍
**Goal:** Verify that Profile bodyweight field connects to exercise "bodyweight" dropdown

**Investigation Steps:**
1. Find where exercise weight dropdown gets its "bodyweight" value
2. Trace data flow from Profile.bodyweightHistory to exercise components
3. Document findings (either "works correctly" or "needs fix")
4. If broken, fix the linkage

**Expected Outcome:**
- Clear understanding of how bodyweight data flows through the app
- Either confirmation it works OR a fix if it doesn't

---

### Task 3: Remove Unused Profile Fields 🧹
**Goal:** Simplify Profile UI by removing fields that aren't used

**Fields to Remove (UI only):**
- Experience Level (Beginner/Intermediate/Advanced dropdown)
- Muscle Detail Level settings
- Recovery Settings slider

**Fields to Keep:**
- Equipment Inventory (future feature)
- Height & Age (confirmed in use)
- Bodyweight tracking (core feature)
- Muscle Baselines (links to Dashboard feature)

**Scope:**
- Remove from Profile.tsx UI only
- Leave backend/types intact (may be used elsewhere or for future features)
- Clean removal - no orphaned state or broken references

---

## Architecture Considerations

### Data Flow Patterns
```
Dashboard
  ├── MuscleHeatMap (needs muscleStates prop)
  └── Existing muscle state data (from useAPIState)

Profile.tsx
  ├── bodyweightHistory → ??? → Exercise weight dropdown
  └── UI fields (some unused, some essential)
```

### Component Dependencies
- **MuscleHeatMap.tsx** - Standalone component, needs muscle state data
- **Dashboard.tsx** - Already has muscle state data, just needs import
- **Profile.tsx** - Large component, careful removal of unused fields

---

## File Changes

### Files to Modify
- `components/Dashboard.tsx` - Import and render MuscleHeatMap
- `components/Profile.tsx` - Remove unused field UI elements

### Files to Investigate
- `components/fitness/MuscleHeatMap.tsx` - Understand props/requirements
- Exercise weight dropdown component (find location via Serena)
- Bodyweight data flow (trace with Serena tools)

### Files NOT to Modify
- `types.ts` - Keep all type definitions (backend may use them)
- `api.ts` - Keep all API fields (don't break backend contracts)

---

## Implementation Strategy

### Phase 1: Serena Investigation
Use Serena tools to understand before coding:
1. `get_symbols_overview` on Dashboard.tsx and Profile.tsx
2. `find_symbol` for MuscleHeatMap to see props interface
3. `search_for_pattern` for "bodyweight" to find weight dropdown usage
4. `find_referencing_symbols` to trace bodyweight data flow

### Phase 2: Execute Changes
1. Add MuscleHeatMap to Dashboard (match styling patterns)
2. Investigate and document bodyweight linkage
3. Remove unused Profile fields (preserve layout structure)

### Phase 3: Verification
- Visual check: MuscleHeatMap displays correctly on Dashboard
- Functional check: Bodyweight linkage works end-to-end
- UI check: Profile page cleaner without broken elements

---

## Success Criteria

- ✅ Muscle Heat Map visible on Dashboard
- ✅ MuscleHeatMap styled consistently with Dashboard aesthetic
- ✅ Bodyweight linkage documented (and fixed if broken)
- ✅ Profile UI cleaner without Experience/Detail/Recovery fields
- ✅ No console errors or broken references
- ✅ Existing functionality unchanged

---

## Edge Cases & Risks

| Risk | Mitigation |
|------|------------|
| MuscleHeatMap requires specific prop structure | Use Serena to read component interface before integration |
| Bodyweight data flow broken or complex | Use Serena to trace references systematically |
| Profile field removal breaks other components | Use `find_referencing_symbols` to check dependencies |
| Styling mismatch on Dashboard | Match existing patterns (glass morphism, Tailwind dark mode) |

---

## Testing Plan

### Manual Testing Checklist
1. **Dashboard:**
   - [ ] MuscleHeatMap renders without errors
   - [ ] Heat map displays muscle state data correctly
   - [ ] Styling matches Dashboard aesthetic (glass, dark mode)
   - [ ] Responsive layout works on mobile/desktop

2. **Bodyweight Linkage:**
   - [ ] Change bodyweight in Profile, save
   - [ ] Navigate to exercise with "bodyweight" option
   - [ ] Verify correct weight appears in dropdown
   - [ ] Document data flow in Serena memory

3. **Profile Page:**
   - [ ] Unused fields removed from UI
   - [ ] No console errors
   - [ ] Remaining fields still functional
   - [ ] Layout remains clean and organized

---

## Notes

- User preference: "Put [MuscleHeatMap] wherever you think is the prettiest"
- Backend fields: Keep intact, only remove UI elements
- Bodyweight investigation: Unknown if fix needed, discover during implementation
