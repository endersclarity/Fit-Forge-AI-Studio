# Proposal: Implement A/B Variation Intelligence

**Change ID:** `implement-ab-variation-intelligence`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** High (Completes Priority 1 from brainstorming vision)

---

## Executive Summary

Add intelligent workout variation tracking and suggestions that guide users to alternate between A and B variations of workout templates. The system will remember which variation was performed last and proactively suggest the opposite variation, while also tracking whether the last workout focused on weight or reps progression to recommend alternating progressive overload methods.

**Problem:** FitForge has 8 workout templates (Push A/B, Pull A/B, Legs A/B, Core A/B) designed for intelligent muscle rotation, but the app doesn't guide users to alternate between variations. Users must manually remember "Did I do Push A or Push B last time?" and track their progression method. This defeats the purpose of the A/B system.

**Solution:** Implement variation intelligence that:
1. Tracks which variation (A or B) was used in the last workout of each category
2. Displays "Last workout: Push A (3 days ago)" context on the dashboard
3. Suggests opposite variation: "Ready for: Push B"
4. Tracks progression method (weight vs reps) from last session
5. Recommends alternating methods: "Last time: +3% weight → Today: +3% reps"
6. Shows this intelligence in multiple places: Dashboard, Workout Templates screen, Workout screen

**Impact:** Completes the Priority 1 vision from brainstorming. Users get intelligent workout guidance that prevents adaptation plateaus through systematic variation. The app becomes a true training coach, not just a logger.

---

## Why

### Current State

**What Exists:**
- ✅ Database: `workouts` table has `variation` field (TEXT: 'A', 'B', or 'Both')
- ✅ Database: `workouts` table has `progression_method` field (TEXT: 'weight' or 'reps')
- ✅ Templates: 8 workout templates with A/B variations defined
- ✅ Progressive Overload: Backend calculates +3% suggestions
- ✅ Workout History: `/api/workouts` returns all past workouts with variations

**What's Missing:**
- ❌ UI: No "Last workout: Push A" display anywhere
- ❌ Logic: No suggestion of opposite variation
- ❌ Tracking: `progression_method` field exists but isn't populated
- ❌ Recommendation: No alternating method suggestions
- ❌ Context: Dashboard doesn't show last workout per category
- ❌ Intelligence: User must manually remember variations

**Critical Gap:**
From brainstorming document (Priority 1, lines 221-227):
> **1. A/B Workout Intelligence** 🎯 MVP
> - Show "Last time you did Push B" → suggest Push A
> - Auto-populate previous workout's weights/reps
> - Show 3% progressive overload suggestions
> - **ALTERNATE overload method based on last session**

Lines 186-214 explain the alternating overload philosophy:
> **Example Timeline:**
> Push A - Week 1: Bench Press: 8 reps @ 100 lbs (baseline)
> Push B - Week 1: Bench Press: 8 reps @ 103 lbs (+3% WEIGHT, same reps)
> Push A - Week 2: Bench Press: 9 reps @ 100 lbs (+3% REPS, same weight)
> Push B - Week 2: Bench Press: 9 reps @ 103 lbs (+3% WEIGHT again)
>
> **Why This Works:**
> - Attacks adaptation from multiple angles
> - Prevents plateau by varying stimulus
> - Builds both strength (weight) and endurance (reps)

### Value Proposition

**For Users:**
- **No mental overhead** - App remembers last variation and suggests next
- **Systematic progression** - Alternating methods prevents plateaus
- **Visual context** - See at a glance: "You did Push A 3 days ago, do Push B today"
- **Confidence** - Trust the system is guiding optimal training
- **Adherence** - Clear guidance increases workout consistency
- **Science-backed** - Variation is proven to prevent adaptation

**For System:**
- **Completes Priority 1** - Fulfills original brainstorming vision
- **Data quality** - Tracking progression method enables better analysis
- **Future analytics** - Can visualize weight vs reps progression over time
- **Progressive enhancement** - Foundation for periodization features
- **User trust** - Demonstrates app intelligence, not just logging

**Strategic Context:**
This is the #1 priority from the brainstorming session. It was identified as the most impactful, straightforward feature that leverages existing infrastructure (templates, workout history) to provide immediate value.

---

## What Changes

### New Capabilities

1. **`variation-tracking`**
   - Track which variation (A or B) was used in each workout
   - Query last workout by category (Push/Pull/Legs/Core)
   - Store variation in database (already exists, just needs to be populated)
   - API endpoint: `GET /api/workouts/last?category=Push` returns last Push workout

2. **`variation-suggestion`**
   - Dashboard shows last workout context per category
   - Visual card: "Last workout: Push A (3 days ago) → Ready for: Push B"
   - Workout Templates screen highlights suggested variation
   - When starting a workout, suggest opposite variation from last time
   - Clear visual hierarchy: Suggested variation is prominent, alternative is available but muted

3. **`progression-method-tracking`**
   - Track whether last workout used weight or reps progression
   - Store in `workouts.progression_method` field (already exists)
   - Default logic: If weight increased → "weight", if reps increased → "reps"
   - Manual override: User can select method when starting workout

4. **`alternating-overload-suggestions`**
   - Display: "Last time: +3% weight → Try today: +3% reps"
   - Progressive overload component shows recommended method
   - Visual indicator: "⚖️ Weight Focus" vs "🔁 Reps Focus"
   - Explanation tooltip: "Alternating methods prevents plateaus"

### Modified Capabilities

- **`dashboard`**: Add "Last Workout Context" section showing last workout per category with variation and days since
- **`workout-templates`**: Highlight recommended variation (e.g., Push B is bright, Push A is muted)
- **`workout-logging`**: Populate `variation` and `progression_method` fields when saving workout
- **`progressive-overload`**: Display recommended method based on last workout's method

---

## Scope

### In Scope

✅ **Last Workout Context (Dashboard)**
- Card showing last workout per category: "Last workout: Push A (3 days ago)"
- Suggestion: "Ready for: Push B"
- Works for all 4 categories (Push/Pull/Legs/Core)
- Shows days since last workout
- If never done category, shows: "Ready for your first Push workout!"

✅ **Variation Tracking (Database)**
- Populate `workouts.variation` field when saving workout
- Logic: Match workout template's variation (A, B, or Both)
- If user creates custom workout, default to 'Both'
- API: `GET /api/workouts/last?category=Push` endpoint (may already exist)

✅ **Progression Method Tracking**
- Populate `workouts.progression_method` field when saving workout
- Logic: Compare to last workout of same category
  - If average weight increased by 2%+: "weight"
  - If average reps increased by 2%+: "reps"
  - If both or neither: Use opposite of last method (alternate)
- Manual override: Dropdown when starting workout (optional)

✅ **Variation Suggestion UI**
- Dashboard card with last workout + suggestion
- Workout Templates screen: Suggested variation highlighted
- Visual indicators: Icons or badges showing "Recommended" vs "Alternative"
- Responsive design (mobile-friendly)

✅ **Alternating Method Recommendation**
- Progressive overload component shows method badge
- Tooltip: "Last time you focused on weight. Try reps today for varied stimulus."
- Simple visual: "⚖️ Weight" or "🔁 Reps" icon
- Not mandatory (user can ignore and do what they want)

✅ **API Enhancements**
- Ensure `GET /api/workouts/last?category={category}` returns variation and progression_method
- Update workout save to populate both fields
- TypeScript types updated for method tracking

### Out of Scope (Future Enhancements)

❌ Periodization (e.g., "Do 3 weeks of weight focus, then 3 weeks reps focus")
❌ Forced variation (user can always override suggestion)
❌ Analytics charts showing weight vs reps progression over time
❌ Template editing based on variation (e.g., "Push A should have more volume")
❌ Variation suggestions based on recovery (e.g., "Pull is ready, but Push A needs rest")
❌ Historical data migration (old workouts won't have progression_method populated)

### Dependencies

**Required (Already Exists):**
- ✅ Database: `workouts.variation` and `workouts.progression_method` fields
- ✅ Workout Templates: A/B variations defined
- ✅ Progressive Overload: Backend +3% calculations
- ✅ Workout History API: `/api/workouts` endpoint

**Blocked By:** None

**Blocks:**
- Periodization features (future)
- Volume analysis by variation (future)
- Template optimization based on actual usage patterns (future)

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Dashboard shows last workout context for all 4 categories
- ✅ Variation suggestion is clear and prominent
- ✅ Workout Templates screen highlights recommended variation
- ✅ `variation` field correctly populated in database
- ✅ `progression_method` field correctly populated in database
- ✅ Progressive overload component shows method badge
- ✅ No breaking changes to existing workout flow
- ✅ Mobile-responsive design

### Short-term (2-4 weeks post-deployment)

- 📈 80%+ of users follow variation suggestions (do opposite of last time)
- 📈 Users report feeling guided by the app (qualitative feedback)
- 📈 Workout initiation time decreases (less decision paralysis)
- 📈 Progression method alternates regularly (not stuck on weight or reps)
- 📈 Zero user confusion about A vs B variations
- 📈 Increased workout consistency (app removes mental barriers)

### Long-term (8+ weeks)

- 📈 Users hit fewer plateaus (self-reported)
- 📈 Progressive overload adherence increases
- 📈 Variation becomes second nature (users trust the system)
- 📈 Data quality enables advanced analytics (weight vs reps trends)
- 📈 Foundation for periodization features validated

---

## Risks & Mitigation

### Risk: User Ignores Suggestions

**Scenario:** User sees "Suggested: Push B" but does Push A anyway
**Impact:** System intelligence is wasted, user doesn't benefit
**Mitigation:**
- Suggestion is prominent but not mandatory
- User can always override (freedom preserved)
- Track adherence rate to validate value
- If low adherence, investigate why (confusing UI? Bad suggestions?)

### Risk: Suggestion Algorithm is Wrong

**Scenario:** System suggests Push B, but user just did Pull and needs rest
**Impact:** User gets bad recommendations, loses trust
**Mitigation:**
- Phase 1: Simple alternation (just track variation, suggest opposite)
- Phase 2: Integrate with muscle recovery (future, out of scope)
- User can always override
- Clear explanation: "Based on variation alternation, not recovery"

### Risk: Progression Method Detection is Inaccurate

**Scenario:** User added both weight AND reps, system can't decide method
**Impact:** Incorrect method tracking, bad alternating suggestions
**Mitigation:**
- Default to "alternate from last" if ambiguous
- Manual override option (user selects method when starting workout)
- Track confidence level (high/medium/low) for analytics
- Over time, user patterns emerge (some users always do weight)

### Risk: Dashboard Clutter

**Scenario:** Last workout context cards take too much space
**Impact:** Dashboard feels overwhelming, core info buried
**Mitigation:**
- Collapsible section: "Last Workouts" (can hide if not needed)
- Compact card design (one line per category)
- Only show categories with recent activity (< 14 days)
- Progressive disclosure: Basic info visible, details on tap

### Risk: Backward Compatibility

**Scenario:** Old workouts don't have `progression_method` populated
**Impact:** System can't suggest alternating method for first new workout
**Mitigation:**
- Accept limitation (only track going forward)
- Default to "weight" for first workout after deployment
- Optional: Backfill script analyzes old workouts to infer method
- Document in migration notes

---

## Alternatives Considered

### Alternative 1: Auto-Force Variation (No Override)

**Example:** If last workout was Push A, only allow Push B to be started

**Pros:**
- Guarantees variation alternation
- Users can't "mess up" the pattern

**Cons:**
- Takes away user agency
- What if user needs to repeat A due to bad performance?
- Annoying if user has a specific goal

**Decision:** Rejected. Suggestion is better than forcing. Users need flexibility.

---

### Alternative 2: Calendar-Based Variation

**Example:** Week 1 = A variations, Week 2 = B variations

**Pros:**
- Structured periodization
- Clear, predictable pattern

**Cons:**
- Too rigid (what if user misses a day?)
- Doesn't account for recovery needs
- Conflicts with muscle recovery intelligence

**Decision:** Rejected. Session-based alternation is more flexible and aligns with recovery-driven training.

---

### Alternative 3: AI-Suggested Variation Based on Recovery

**Example:** System recommends Push B because pecs are 80% recovered, but Push A exercises hit triceps which are only 50% recovered

**Pros:**
- Most intelligent recommendation
- Truly personalized

**Cons:**
- Much more complex algorithm
- Requires deep integration with muscle recovery system
- Harder to explain to users ("Why Push B today?")

**Decision:** Deferred to future. Phase 1 is simple alternation, Phase 2 integrates recovery intelligence.

---

### Alternative 4: No Method Tracking, Just Variation

**Example:** Only track A/B variation, ignore weight vs reps progression

**Pros:**
- Simpler implementation
- Less data to manage

**Cons:**
- Misses key insight from brainstorming (alternating methods)
- Database field already exists, why not use it?
- Users miss out on plateau prevention strategy

**Decision:** Rejected. Method tracking is core to the vision and relatively easy to implement.

---

## Implementation Phases

### Phase 1: Backend - Last Workout Query (2-3 hours)

**Tasks:**
- Create or verify `GET /api/workouts/last?category={category}` endpoint
- Query database for most recent workout matching category
- Return workout with `variation` and `progression_method` fields
- Handle edge case: No workouts in category (return null)
- Add TypeScript types for response
- Write unit tests for query logic

**Acceptance Criteria:**
- API returns last Push/Pull/Legs/Core workout correctly
- Response includes `variation` ('A', 'B', 'Both')
- Response includes `progression_method` ('weight', 'reps', null)
- Returns null if no workouts in category
- TypeScript types defined

---

### Phase 2: Dashboard - Last Workout Context (4-5 hours)

**Tasks:**
- Create "Last Workout Context" section on Dashboard
- Fetch last workout for each category on component mount
- Display cards showing: "Last workout: {category} {variation} ({days} ago)"
- Show suggestion: "Ready for: {opposite_variation}"
- Handle loading state (skeleton cards)
- Handle error state (offline banner)
- Style cards with clear hierarchy (suggested variation prominent)
- Make collapsible (optional, if dashboard gets cluttered)
- Mobile-responsive design

**Acceptance Criteria:**
- Cards display for all 4 categories
- Days calculation is accurate
- Opposite variation suggested correctly (A ↔ B)
- If last was 'Both', suggest 'A' by default
- Loading and error states handled
- Mobile-friendly layout

---

### Phase 3: Variation Tracking - Populate on Save (3-4 hours)

**Tasks:**
- Update workout save flow to populate `variation` field
- Logic: Match template's variation if workout created from template
- Logic: Default to 'Both' if custom workout
- Update API payload to include `variation`
- Test database persistence
- Ensure backward compatibility (old API calls still work)
- Add `variation` to workout summary modal

**Acceptance Criteria:**
- `variation` correctly saved to database
- Template-based workouts inherit template variation
- Custom workouts default to 'Both'
- No breaking changes
- Workout summary shows variation

---

### Phase 4: Progression Method Tracking (4-5 hours)

**Tasks:**
- Implement progression method detection algorithm
  - Compare current workout to last workout of same category
  - Calculate average weight change across all exercises
  - Calculate average reps change across all exercises
  - Determine primary method (weight, reps, or alternate)
- Update workout save flow to populate `progression_method` field
- Add manual override dropdown (optional) when starting workout
- Display method badge in progressive overload component
- Add tooltip explaining alternating methods
- Test various scenarios (weight up, reps up, both, neither)

**Acceptance Criteria:**
- Method correctly detected for typical progressions
- Edge cases handled (both up, neither up, new exercise)
- Manual override works if implemented
- `progression_method` saved to database
- Progressive overload component shows method badge

---

### Phase 5: UI Enhancements - Templates & Recommendations (3-4 hours)

**Tasks:**
- Update Workout Templates screen to highlight suggested variation
  - Fetch last workout for selected category
  - Determine opposite variation
  - Style suggested template with "Recommended" badge
  - Mute alternative variation (still accessible)
- Add method recommendation to progressive overload UI
  - Display: "Last time: ⚖️ Weight → Try today: 🔁 Reps"
  - Tooltip explanation
  - Visual icon for weight vs reps
- Test user flow: Dashboard → Templates → Workout
- Ensure consistency across screens

**Acceptance Criteria:**
- Suggested template visually distinct on Templates screen
- Method recommendation clear in progressive overload UI
- Icons/badges are intuitive
- Flow feels natural (Dashboard guides to right template)

---

### Phase 6: Testing & Refinement (2-3 hours)

**Tasks:**
- Test complete user journey: Dashboard → Last workout context → Select suggested template → Start workout → Progressive overload shows alternating method → Save workout → Variation and method saved → Return to dashboard → See updated context
- Edge case testing: First workout ever, custom workouts, mixed progressions
- Cross-browser testing
- Mobile responsiveness
- Accessibility (keyboard navigation, screen readers)
- Performance (dashboard load time with API calls)

**Acceptance Criteria:**
- End-to-end flow works smoothly
- Edge cases handled gracefully
- Works on all browsers
- Mobile-friendly
- Accessible
- No performance degradation

---

**Total Estimate:** 18-24 hours (2-3 days)

---

## Related Documentation

### Brainstorming Vision
- `docs/brainstorming-session-results.md` - Lines 221-227 (Priority 1: A/B Workout Intelligence)
- `docs/brainstorming-session-results.md` - Lines 186-214 (Alternating Progressive Overload philosophy)
- `docs/brainstorming-session-results.md` - Lines 562-587 (Priority 1 detailed breakdown)

### Technical References
- `backend/database/schema.sql` - Lines 181, 182 (`variation` and `progression_method` fields in workouts table)
- `docs/data-model.md` - Lines 174-190 (workouts table documentation)
- `constants.ts` - EXERCISE_LIBRARY with variation assignments

### Related OpenSpec Changes

**Already Implemented (Foundation):**
- `enable-progressive-overload-system` (archived) - Backend +3% calculations
- `implement-recovery-dashboard-components` (recent) - Dashboard UI framework

**Complements:**
- `implement-to-failure-tracking-ui` (proposal) - Failure data improves progressive overload accuracy
- `implement-smart-exercise-recommendations` (archived) - Recommendations can factor in variation

**Future Enhancements:**
- `implement-periodization-system` (future) - Multi-week variation cycles
- `implement-recovery-aware-variation-suggestions` (future) - Integrate muscle recovery into variation logic

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Design.md created for last workout context UI and method detection logic
- [ ] Spec delta written for `variation-tracking` and `variation-suggestion` capabilities
- [ ] Tasks.md breaks down implementation by phase
- [ ] Validation passes: `openspec validate implement-ab-variation-intelligence --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available
- [ ] Brainstorming doc aligned (Priority 1)
- [ ] API endpoint design reviewed

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create `design.md` for last workout context UI and method detection algorithm
3. ⏭️ Write spec deltas for `variation-tracking`, `variation-suggestion`, `progression-method-tracking`, `alternating-overload-suggestions` capabilities
4. ⏭️ Create `tasks.md` with detailed task breakdown
5. ⏭️ Mock up "Last Workout Context" card design
6. ⏭️ Validate and get approval
7. ⏭️ Begin Phase 1: Backend Last Workout Query

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply implement-ab-variation-intelligence` (after approval)
