# Proposal: Implement "To Failure" Tracking UI

**Change ID:** `implement-to-failure-tracking-ui`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** Critical (Unblocks baseline learning accuracy)

---

## Executive Summary

Add user interface controls to mark exercise sets as "taken to failure" or submaximal work. This unlocks the full potential of the existing intelligent muscle baseline learning system by providing the critical data point needed to differentiate maximum-effort sets from greasing-the-groove or warmup work.

**Problem:** The database already has a `to_failure` column (migration 001), and the backend baseline learning algorithm exists, but users have no way to indicate which sets were performed to muscular failure. Without this distinction, the system cannot accurately learn individual muscle capacity thresholds.

**Solution:** Add intuitive UI controls in the Workout screen that:
1. Auto-mark the last set of each exercise as "to failure" (smart default)
2. Allow users to toggle the failure marker on/off for any set
3. Visually distinguish failure sets from submaximal sets
4. Pass the `to_failure` flag to the backend when saving workouts
5. Enable "Greasing the Groove" mode for intentional submaximal training

**Impact:** Transforms rough baseline approximations into personalized, data-driven muscle capacity learning. The baseline learning algorithm can now accurately triangulate which muscle failed first during compound exercises, enabling true progressive overload intelligence.

---

## Why

### Current State

**What Exists:**
- ✅ Database: `to_failure` column in `exercise_sets` table (boolean, default 1)
- ✅ Backend: Baseline learning algorithm that uses failure data
- ✅ API: `/api/workouts` accepts `to_failure` field in workout save requests
- ✅ Types: `WorkoutExerciseSet` interface has optional `to_failure?: boolean`

**What's Missing:**
- ❌ UI: No toggle or indicator in Workout.tsx component
- ❌ Logic: No auto-marking of last set as failure
- ❌ Visual: No distinction between failure and submaximal sets
- ❌ Mode: No "Greasing the Groove" workflow for intentional submaximal work
- ❌ Feedback: No explanation of why this matters to users

**Critical Gap:**
From the brainstorming document (Priority 3, line 244):
> **5. "To Failure" Toggle** 🎯 MVP
> - Last set auto-marked as "to failure"
> - Optional toggle to unmark (greasing the groove days)
> - Can mark earlier sets if failure happened before last set
> - **Required for baseline learning algorithm**

Without this UI, the baseline learning system operates on incomplete data, treating all sets as maximum effort when many are warmups or submaximal work.

### Value Proposition

**For Users:**
- **Accurate progression tracking** - System knows your true capacity, not inflated by warmup sets
- **Smart progressive overload** - Recommendations based on actual failure points, not guesses
- **Greasing the groove support** - Can log submaximal work without confusing the learning algorithm
- **Transparent intelligence** - Understand why the system makes recommendations
- **Zero manual calibration** - System learns from actual performance data

**For System:**
- **Constraint satisfaction solver enabled** - Algorithm can triangulate muscle capacity from failure points
- **Personalized baselines** - Each user's unique physiology learned over time
- **Reduced noise** - Warmup sets don't pollute capacity calculations
- **Scientific foundation** - "To failure" is the objective measure in exercise science
- **Future-proof** - Enables advanced features like fatigue prediction and deload recommendations

**Technical Context:**
From brainstorming (lines 119-151), the baseline learning algorithm works via triangulation:
```
Push-ups to failure: 30 reps @ 200lbs
  → At least ONE of: Pecs (70%), Triceps (50%), Deltoids (40%), Core (20%) hit 100%

Tricep Extensions to failure: 15 reps @ 40lbs
  → Triceps (95%) definitely hit 100%

Constraint satisfaction: Solve for muscle baselines that satisfy all observed failure points
```

This ONLY works if the system knows which sets were actually to failure.

---

## What Changes

### New Capabilities

1. **`to-failure-tracking`**
   - Toggle button on each set row in Workout.tsx to mark/unmark failure status
   - Visual indicator showing which sets are marked as failure (e.g., flame icon 🔥 or checkmark ✓)
   - Auto-marking: Last set of each exercise defaults to "to failure" (can be toggled off)
   - Smart detection: If set volume is significantly below personal best, show warning: "Was this really to failure?"
   - Clear visual distinction between failure sets (bold, highlighted) and submaximal sets (muted)
   - Tooltip explanation: "Mark if you couldn't do one more rep. Helps system learn your true capacity."

2. **`greasing-mode`** (Optional enhancement)
   - Workout-level toggle: "Greasing the Groove Mode"
   - When enabled: All sets default to NOT failure, UI shows 🌱 icon
   - Explanation: "Submaximal work for skill practice. Won't update muscle baselines."
   - Use case: High-frequency, low-intensity training without fatiguing muscles

### Modified Capabilities

- **`workout-logging`**: Workout.tsx now includes failure tracking controls for each set
- **`baseline-learning`**: Backend can now distinguish max-effort from submaximal data
- **`progressive-overload`**: Suggestions become more accurate as baselines learn from failure data

---

## Scope

### In Scope

✅ **To Failure Toggle UI**
- Checkbox or toggle button on each set row in Workout.tsx
- Default state: Last set = checked, earlier sets = unchecked
- Can toggle any set on/off
- Visual indicator (icon or styling) showing failure status
- Responsive design (works on mobile)

✅ **Visual Distinction**
- Failure sets: Bold text, highlighted background, or 🔥 icon
- Submaximal sets: Normal styling, muted text
- Clear visual hierarchy (failure sets stand out)

✅ **API Integration**
- Pass `to_failure: boolean` field when saving workouts
- Update TypeScript types if needed
- Ensure backend receives and stores the flag correctly

✅ **Smart Defaults**
- Auto-check last set of each exercise as "to failure"
- User can uncheck if needed (e.g., stopped early due to form breakdown)

✅ **User Education**
- Tooltip or info icon explaining what "to failure" means
- Brief explanation of why it matters (helps system learn)
- Accessible to beginners (no jargon)

✅ **Validation & Warnings** (Optional but recommended)
- If set volume < 70% of personal best but marked as failure, show gentle warning
- "This is below your usual capacity. Was it really to failure?"
- Helps catch mistakes (forgot to update weight, injury, etc.)

### Out of Scope (Future Enhancements)

❌ Greasing the Groove mode (can be separate proposal if desired)
❌ Historical data migration (existing workouts remain unmarked)
❌ Analytics on failure rate (e.g., "80% of your sets go to failure")
❌ Advanced failure types (technical failure vs muscular failure)
❌ RIR (Reps in Reserve) tracking instead of binary failure
❌ Video recording for form analysis

### Dependencies

**Required (Already Exists):**
- ✅ Database: `to_failure` column in `exercise_sets` table
- ✅ Backend: API accepts `to_failure` in workout save requests
- ✅ Frontend: Workout.tsx component exists
- ✅ TypeScript: `WorkoutExerciseSet` interface

**Blocked By:** None

**Blocks:**
- Accurate baseline learning and capacity calibration
- Advanced progressive overload intelligence
- Deload week recommendations (future)
- Fatigue prediction improvements (future)

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Toggle appears on every set row in Workout.tsx
- ✅ Last set auto-marked as failure by default
- ✅ User can toggle failure status on/off
- ✅ Visual distinction between failure and submaximal sets is clear
- ✅ `to_failure` flag correctly saved to database
- ✅ No breaking changes to existing workout logging flow
- ✅ Mobile-responsive (toggle works on touch screens)
- ✅ Tooltip explains what "to failure" means

### Short-term (2-4 weeks post-deployment)

- 📈 90%+ of users use default (last set = failure)
- 📈 Baseline learning algorithm shows improved accuracy (fewer outliers)
- 📈 Progressive overload suggestions become more personalized
- 📈 Users report feeling confident system understands their capacity
- 📈 Zero user confusion about what "to failure" means
- 📈 Muscle baselines start diverging from default 10,000 units

### Long-term (8+ weeks)

- 📈 Baseline learning converges on stable muscle capacity values
- 📈 Progressive overload suggestions lead to measurable strength gains
- 📈 Users can distinguish between failure and submaximal training
- 📈 Greasing the Groove mode becomes requested feature (validates need)
- 📈 System intelligence is validated by user trust and adherence

---

## Risks & Mitigation

### Risk: User Confusion - "What does 'to failure' mean?"

**Scenario:** Beginners don't understand technical term "muscular failure"
**Impact:** Users mark incorrectly, pollutes baseline data
**Mitigation:**
- Plain language tooltip: "Couldn't do one more rep with good form"
- Info icon with detailed explanation
- Link to help article with video examples
- Default behavior works for 90% of cases (last set = failure)

### Risk: Click Fatigue - Too many toggles

**Scenario:** Users annoyed by marking every set
**Impact:** Users abandon feature or ignore it
**Mitigation:**
- Smart default handles 90% of cases automatically
- Only need to toggle if default is wrong
- Bulk actions: "Mark all sets as failure" button (if needed)
- Greasing mode flips defaults for entire workout

### Risk: Data Quality - Users mark incorrectly

**Scenario:** User marks warmup sets as failure, skewing baseline learning
**Impact:** System learns inflated muscle capacities
**Mitigation:**
- Validation warning if volume < 70% of personal best
- Backend algorithm can filter outliers (already implemented)
- Baselines only increase, never decrease (prevents poisoning)
- Over time, correct data outweighs mistakes

### Risk: Mobile UX - Toggle too small on phones

**Scenario:** Toggle button hard to tap on small screens
**Impact:** Frustration, accidental taps
**Mitigation:**
- Minimum touch target: 44x44px (Apple HIG standard)
- Test on iPhone SE (smallest modern screen)
- Consider swipe gesture as alternative
- Ensure spacing between toggle and other buttons

### Risk: Backward Compatibility - Existing workouts

**Scenario:** Old workouts don't have `to_failure` data
**Impact:** Baseline learning ignores historical data
**Mitigation:**
- Accept this limitation (not critical - system learns going forward)
- Optional: Backfill script assumes last set = failure for old workouts
- Document in migration notes
- Future: Allow editing past workouts to mark failure sets

---

## Alternatives Considered

### Alternative 1: RIR (Reps in Reserve) Scale Instead of Binary

**Example:** User selects 0, 1, 2, or 3 reps left in the tank

**Pros:**
- More granular data for baseline learning
- Matches RPE scales used in powerlifting

**Cons:**
- Harder for beginners to estimate accurately
- More UI complexity (dropdown vs toggle)
- Binary failure is simpler and sufficient for V1

**Decision:** Rejected for V1. Binary failure is easier to understand and implement. RIR can be future enhancement.

---

### Alternative 2: Auto-Detect Failure via Volume Drop

**Example:** If set 3 has 30% less volume than set 2, assume set 2 was failure

**Pros:**
- No user input required
- Works retroactively on historical data

**Cons:**
- Many false positives (intentional drop sets, fatigue accumulation)
- Misses failure on first set of new exercise
- Users lose control over data accuracy

**Decision:** Rejected. User input is more reliable. Auto-detection can be used as validation warning, not primary method.

---

### Alternative 3: Always Assume Last Set is Failure (No UI)

**Example:** Backend hardcodes `to_failure = true` for last set, `false` for others

**Pros:**
- Zero UI complexity
- Works for 90% of cases

**Cons:**
- No support for greasing the groove
- Can't handle failure on earlier sets (e.g., first set of new max attempt)
- Users lose agency over their data

**Decision:** Rejected. Too inflexible. Smart default + toggle gives best of both worlds.

---

### Alternative 4: Separate "Greasing" Workout Type

**Example:** User selects "Greasing Workout" at start, all sets marked as NOT failure

**Pros:**
- Clear intent separation
- Cleaner UX than per-set toggles

**Cons:**
- Requires workout-level mode selection
- Can't mix failure and greasing sets in same workout
- More complex to implement

**Decision:** Consider for V2. Start with per-set toggles, add workout mode if user feedback demands it.

---

## Implementation Phases

### Phase 1: Core Toggle UI (4-6 hours)

**Tasks:**
- Add toggle button/checkbox to each set row in Workout.tsx
- Implement auto-marking of last set as failure
- Add state management for `to_failure` flag per set
- Style failure vs submaximal sets (visual distinction)
- Test on desktop and mobile

**Acceptance Criteria:**
- Toggle appears on every set
- Last set defaults to checked
- User can toggle on/off
- Visual difference is clear
- No console errors

---

### Phase 2: API Integration (2-3 hours)

**Tasks:**
- Update workout save payload to include `to_failure` per set
- Verify TypeScript types match backend expectations
- Test data persistence (check database after save)
- Handle API errors gracefully
- Ensure backward compatibility (old API calls still work)

**Acceptance Criteria:**
- `to_failure` flag correctly sent to backend
- Database confirms flag is saved
- Backend baseline learning receives correct data
- No breaking changes to existing flows

---

### Phase 3: User Education & Polish (2-3 hours)

**Tasks:**
- Add tooltip to toggle: "Couldn't do one more rep with good form"
- Create info icon with detailed explanation modal
- Add validation warning if volume << personal best
- Write user documentation (help article)
- Test with non-technical users for clarity

**Acceptance Criteria:**
- Tooltip is clear and concise
- Info modal provides helpful context
- Warning appears when appropriate
- Documentation is beginner-friendly
- Test users understand the feature

---

### Phase 4: Testing & Refinement (1-2 hours)

**Tasks:**
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness testing (iPhone SE, Pixel 5, iPad)
- Accessibility check (keyboard navigation, screen readers)
- Performance test (no lag when toggling)
- Edge cases (0 sets, 10+ sets, rapid toggling)

**Acceptance Criteria:**
- Works on all major browsers
- Mobile touch targets are adequate (44x44px)
- Keyboard accessible (Tab, Enter, Space)
- No performance issues
- Edge cases handled gracefully

---

**Total Estimate:** 9-14 hours (1-2 days)

---

## Related Documentation

### Brainstorming Vision
- `docs/brainstorming-session-results.md` - Lines 244-248 (Priority 3: "To Failure" Toggle)
- `docs/brainstorming-session-results.md` - Lines 119-151 (Triangulation-based baseline learning)
- `docs/brainstorming-session-results.md` - Lines 291-296 (Greasing the Groove mode)

### Technical References
- `backend/database/schema.sql` - Line 70 (`to_failure INTEGER DEFAULT 1`)
- `backend/database/migrations/001_add_to_failure_column.sql` - Migration adding the column
- `backend/types.ts` - `WorkoutExerciseSet` interface with `to_failure?: boolean`
- `docs/data-model.md` - Lines 206, 212 (exercise_sets table documentation)

### Related OpenSpec Changes

**Already Implemented (Backend):**
- `enable-muscle-baseline-learning` (archived) - Baseline learning algorithm exists, needs accurate failure data
- `refactor-backend-driven-muscle-states` (archived) - Backend muscle state calculations

**Future Enhancements:**
- `implement-greasing-mode` (future) - Full workout-level greasing the groove support
- `implement-rir-tracking` (future) - Reps in Reserve as alternative to binary failure
- `implement-deload-recommendations` (future) - Requires failure tracking to detect overtraining

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Design.md created for UI components and state management
- [ ] Spec delta written for `to-failure-tracking` capability
- [ ] Tasks.md breaks down implementation by phase
- [ ] Validation passes: `openspec validate implement-to-failure-tracking-ui --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available
- [ ] Brainstorming doc aligned (Priority 3)
- [ ] User education content drafted

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create `design.md` for toggle component and state management
3. ⏭️ Write spec delta for `to-failure-tracking` capability
4. ⏭️ Create `tasks.md` with detailed task breakdown
5. ⏭️ Mock up toggle UI design (Figma or code prototype)
6. ⏭️ Validate and get approval
7. ⏭️ Begin Phase 1: Core Toggle UI

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply implement-to-failure-tracking-ui` (after approval)
