# Proposal: Enable Progressive Overload System

**Change ID:** `enable-progressive-overload-system`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** High (Original Priority 1 from brainstorming)

---

## Executive Summary

Transform FitForge from a passive workout tracker into an intelligent coach by implementing a progressive overload guidance system. This change enables users to see exactly what they did last time and provides smart +3% suggestions for both weight and reps, with intelligent alternating recommendations to prevent plateaus.

**Problem:** Users must manually remember previous performance and calculate progressive overload percentages, leading to guesswork and inconsistent progression.

**Solution:** Two-button progressive overload UI that:
1. Shows last performance with clear context
2. Calculates both +3% weight AND +3% reps options
3. Recommends alternating between methods intelligently
4. Allows user choice based on how they feel
5. Auto-fills selected option for quick workout start

**Impact:** Completes the "intelligent coach" vision - users never manually calculate progression again, system guides optimal stimulus variation, workouts start faster.

---

## Why

### Current Pain Points

1. **Manual Progression Calculation**
   - Users must remember what weight/reps they used last time
   - Must manually calculate +3% for progressive overload
   - Prone to errors and guesswork
   - Slows down workout flow

2. **No Alternating Stimulus**
   - Users tend to always add weight OR always add reps
   - Single approach leads to plateaus
   - Miss benefits of varying stimulus
   - Joints stressed by constant weight increases

3. **No Performance Context**
   - Can't easily see "what did I do last time?"
   - No visibility into recent progression pattern
   - Miss opportunities to break personal records
   - Lose track of which variation (A/B) was used

4. **Workflow Friction**
   - Every workout starts with empty fields
   - Must look up previous performance manually
   - Increases time from "open app" to "start workout"
   - Reduces motivation to train consistently

### Value Proposition

**For Users:**
- Instant access to last performance
- Smart +3% calculations (no mental math)
- Guided alternating between weight and reps
- Flexibility to choose based on daily energy
- Faster workout starts (one-tap pre-fill)
- Visible progress over time

**For System:**
- Foundation for A/B workout intelligence
- Tracks progression method for smarter recommendations
- Enables progressive overload analytics (future)
- Builds trust through visible intelligence
- Increases user engagement and retention

---

## What Changes

### New Capabilities

1. **`progressive-overload-calculation`**
   - Fetches last two performances for each exercise
   - Calculates +3% for both weight and reps
   - Detects which method was used last time
   - Returns smart recommendation (alternate method)

2. **`workout-variation-tracking`**
   - Tracks which variation (A/B) was used in last workout per category
   - Suggests opposite variation for balanced training
   - Displays "Last time: Push A → Today: Push B" context

3. **`progressive-suggestion-ui`**
   - Two-button interface (+Weight / +Reps)
   - Visual indicator for recommended option
   - One-tap auto-fill for quick starts
   - Manual override still available
   - Shows last performance context

### Modified Capabilities

- **`workout-logging`**: Workout start now shows progressive suggestions with auto-fill
- **`template-loading`**: Templates now display progressive context when loaded

---

## Scope

### In Scope

✅ **Progressive Overload Calculation Engine**
- Fetch last performance (first set from most recent workout)
- Fetch previous performance (for method detection)
- Calculate +3% weight suggestion (round to nearest lb/kg)
- Calculate +3% reps suggestion (round up to whole number)
- Determine last method used (weight up, reps up, or none)
- Suggest opposite method for alternating stimulus

✅ **Two-Button Progressive UI**
- Display last performance with date
- Show both options (+Weight / +Reps) as tappable buttons
- Visual indicator on recommended option
- One-tap auto-fill of weight and reps fields
- Manual entry still available below buttons
- Works for each exercise in workout

✅ **A/B Variation Intelligence**
- Detect last variation used per category (Push/Pull/Legs/Core)
- Suggest opposite variation when starting workout
- Display context: "Last time: Push A (3 days ago)"
- Track variation in workout save

✅ **API Integration**
- New endpoint: `GET /api/progressive-suggestions?exercise=name`
- Enhanced endpoint: `GET /api/last-workout?category=Push`
- Workout save includes variation tracking

### Out of Scope (Future Enhancements)

❌ Custom progression percentages (always 3%)
❌ Deload week detection and suggestions
❌ Progression charts and analytics
❌ Micro-loading suggestions (< 1lb increments)
❌ Exercise-specific progression rates
❌ Body weight progression calculations

### Dependencies

**Required (Already Exists):**
- ✅ `exercise_sets` table with weight, reps, set_number
- ✅ `workouts` table with category, variation fields
- ✅ Exercise history in database
- ✅ Workout templates with A/B variations

**Blocked By:** None

**Blocks:** Future analytics dashboard, progression tracking features

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Progressive suggestions display correctly
- ✅ Both +weight and +reps options calculated accurately
- ✅ Tap button → auto-fills weight/reps fields
- ✅ Manual entry still works
- ✅ No breaking changes to existing workout flow

### Short-term (2-4 weeks post-deployment)

- 📈 90%+ of workouts use progressive suggestions (not manual entry)
- 📈 Users alternate between weight and reps methods
- 📈 Average time from "start workout" to "log first set" decreases
- 📈 Workout completion rate increases
- 📈 User feedback confirms reduced friction

### Long-term (8+ weeks)

- 📈 Consistent progressive overload across all exercises
- 📈 Users breaking personal records more frequently
- 📈 Plateau incidents decrease
- 📈 Foundation ready for analytics dashboard
- 📈 Data shows balanced weight vs reps progression

---

## Risks & Mitigation

### Risk: First-time Exercise Has No History

**Scenario:** User tries a new exercise with no previous performance
**Impact:** Cannot calculate progressive suggestions
**Mitigation:**
- Show "No history" message
- Encourage user to establish baseline
- After first performance, suggestions work normally

### Risk: User Did Custom Progression Last Time

**Scenario:** User increased both weight AND reps, or decreased
**Impact:** System can't determine "last method used"
**Mitigation:**
- Default to recommending +reps (safer, easier)
- Still show both options
- User choice remains flexible

### Risk: Rounding Errors on Small Weights

**Scenario:** +3% of 10lbs = 10.3lbs, but only 5lb plates available
**Impact:** Suggestion not achievable with available equipment
**Mitigation:**
- Round to nearest whole pound/kg
- User can adjust manually if needed
- Future: Equipment-aware rounding

### Risk: Suggestion Assumes Same Equipment

**Scenario:** Last time used dumbbells, today using barbell
**Impact:** Suggested weight might not translate
**Mitigation:**
- Exercise names include equipment (already implemented)
- "Dumbbell Row" vs "Barbell Row" are separate exercises
- Each tracks independently

### Risk: UI Complexity Slows Workout

**Scenario:** Two buttons + context text clutters interface
**Impact:** Paradoxically increases time to start
**Mitigation:**
- Keep UI clean and scannable
- Buttons are OPTIONAL (manual entry still quick)
- Progressive disclosure (collapse details if needed)

---

## Alternatives Considered

### Alternative 1: Auto-Fill Last Performance (No Progression)

**Rejected:** Doesn't guide progressive overload, just saves memory

### Alternative 2: Automatic Alternating (No User Choice)

**Rejected:** Removes user agency, feels rigid, ignores daily energy levels

### Alternative 3: Single +3% Suggestion (System Picks One)

**Rejected:** Hides the choice, user doesn't learn the alternating pattern

### Alternative 4: Progressive Overload Percentage Slider

**Rejected:** Over-complicates, 3% is scientifically validated standard

### Alternative 5: Show Last 3 Performances (History List)

**Rejected:** Too much information, analysis paralysis, slows decisions

---

## Implementation Phases

### Phase 1: Backend Progressive Calculation (3-4 hours)

- Add `getLastPerformanceForExercise()` function
- Add `getProgressiveSuggestions()` function
- Implement +3% calculation logic
- Implement method detection algorithm
- Create API endpoint `/api/progressive-suggestions`
- Return both options with smart recommendation

### Phase 2: Two-Button UI Component (4-5 hours)

- Create `ProgressiveSuggestionButtons` component
- Display last performance context
- Render +Weight and +Reps buttons
- Visual indicator for recommended option
- Handle button tap → auto-fill weight/reps
- Styling and responsive design

### Phase 3: Variation Intelligence (2-3 hours)

- Add `getLastWorkoutByCategory()` function
- Detect last variation (A or B)
- Suggest opposite variation
- Display "Last time: Push A" context
- API endpoint enhancement

### Phase 4: Integration & Testing (2-3 hours)

- Integrate buttons into workout flow
- Connect to template loading
- Handle edge cases (no history, custom progression)
- Manual testing across all exercise types
- Cross-browser verification

**Total Estimate:** 11-15 hours (1.5-2 days)

---

## Related Documentation

- `docs/brainstorming-session-results.md` - Original Priority 1 feature ideation
- `backend/database/schema.sql` - Workouts and exercise_sets tables
- `components/Workout.tsx` - Current workout logging UI
- Sequential thinking analysis (2025-10-26) - UI/UX design decisions

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Design.md created for UI/UX patterns
- [ ] Spec deltas written for all three capabilities
- [ ] Tasks.md breaks down implementation
- [ ] Validation passes: `openspec validate enable-progressive-overload-system --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available

---

## Next Steps

1. Review this proposal
2. Create `design.md` for algorithm details and UI patterns
3. Write spec deltas for three capabilities
4. Create `tasks.md` implementation plan
5. Validate and get approval
6. Begin Phase 1 implementation
