# Proposal: Implement Personal Muscle Engagement Calibration

**Change ID:** `implement-personal-engagement-calibration`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** Medium (Enables true personalization after core features)

---

## Executive Summary

Enable users to override default muscle engagement percentages for exercises based on their personal biomechanics, form variations, and subjective experience. This transforms FitForge from a one-size-fits-all system into a truly personalized training coach that learns each user's unique body mechanics.

**Problem:** FitForge uses default muscle engagement percentages for all users (e.g., push-ups = Pectoralis 70%, Triceps 50%, Deltoids 40%, Core 20%). These are based on exercise science averages, but every person's body is different:
- Different leverages (long arms vs short arms)
- Different form cues (elbows in vs elbows out)
- Different mind-muscle connection (some people "feel" triceps more in push-ups)
- Different anatomical variations (pec insertion points, bone lengths)

Without calibration, the system gives generic recommendations that may not match the user's actual experience.

**Solution:** Add a calibration interface that allows users to:
1. View and adjust muscle engagement percentages for any exercise
2. Use intuitive sliders (0-100%) for each muscle group
3. See real-time preview of how changes affect exercise recommendations
4. Reset to defaults if they over-adjust
5. Mark exercises as "Calibrated" vs "Default" for transparency
6. Store overrides in a separate layer (database already supports this)

**Impact:** Transforms FitForge into a personalized system that respects individual differences. Users who "feel" exercises differently can teach the system their unique patterns. Recommendations become more accurate as the system learns each person's biomechanics.

---

## Why

### Current State

**What Exists:**
- ✅ Default engagement percentages in EXERCISE_LIBRARY (constants.ts)
  - Example: Push-ups = Pectoralis 70%, Triceps 50%, Deltoids 40%, Core 20%
  - 48 exercises, 13 muscle groups, ~150 engagement values total
- ✅ Recommendation algorithm uses engagement percentages
- ✅ Fatigue calculations based on engagement percentages
- ✅ Database structure for overrides (conceptually - may need schema changes)

**What's Missing:**
- ❌ UI for viewing engagement percentages
- ❌ UI for adjusting percentages (sliders, inputs)
- ❌ Override storage in database (field exists in concept, may need table)
- ❌ Override layer merging with defaults
- ❌ Visual indication of calibrated vs default exercises
- ❌ User education on when/how to calibrate

**Critical Context:**
From brainstorming document (Future Innovation #9, lines 269-279):
> **9. Personal Muscle Engagement Calibration**
> - Allow override of default muscle engagement percentages
> - "For ME, push-ups work triceps harder than average"
> - System learns from your notes + performance patterns
> - **Database structure:** Default + personal override layers

Lines 306-316 (Insight 2):
> **Insight 2: Baselines Are Personal**
> - 10,000 default baseline is meaningless
> - Every person's body is different
> - Muscle engagement percentages vary by individual anatomy
> - System must learn from YOUR performance, not population averages

### Value Proposition

**For Users:**
- **Personalization** - App matches YOUR body, not generic averages
- **Accuracy** - Recommendations reflect how exercises actually feel to you
- **Empowerment** - Control over system intelligence (not a black box)
- **Experimentation** - Try different form cues, see how it affects engagement
- **Learning** - Discover which muscles you engage in exercises
- **Trust** - Transparent system that adapts to individual differences

**For System:**
- **Differentiation** - Most apps use static engagement data
- **Retention** - Personalized systems increase user investment
- **Data quality** - User calibration improves recommendation accuracy
- **Future ML** - Calibration data can inform population models
- **Flexibility** - Handles edge cases (injuries, imbalances, form variations)

**Use Cases:**
1. **Long-armed user:** "Push-ups don't hit my chest as much. I feel it 80% in triceps."
2. **Form variation:** "I do wide-grip pull-ups, so my lats are engaged more than biceps."
3. **Injury adaptation:** "I have a shoulder injury, so overhead presses mostly hit my traps now."
4. **Mind-muscle connection:** "After practicing, I can really activate my glutes in squats now."
5. **Anatomical variation:** "My triceps are naturally dominant in pressing movements."

---

## What Changes

### New Capabilities

1. **`exercise-engagement-viewer`**
   - Modal or dedicated screen showing engagement breakdown for each exercise
   - Visual: Horizontal bars for each muscle (0-100%)
   - Indication: "Default" vs "Calibrated by you"
   - Accessible from Exercise Library or Recommendations screen
   - Searchable/filterable by exercise or muscle group

2. **`engagement-calibration-ui`**
   - Sliders for adjusting each muscle's engagement percentage
   - Real-time total percentage displayed (must sum to reasonable range, e.g., 100-300%)
   - "Reset to Default" button per exercise
   - "Reset All" button (with confirmation)
   - Preview: "If you adjust this, recommendations will change like this..."
   - Save/Cancel actions

3. **`calibration-storage`**
   - Database table: `user_exercise_calibrations` (or similar)
     - user_id, exercise_id, muscle_name, engagement_percentage
   - API: `GET /api/calibrations` returns user's overrides
   - API: `PUT /api/calibrations` saves adjustments
   - Merge logic: User override > Default (on backend or frontend)

4. **`calibrated-exercise-indicator`**
   - Badge or icon showing "Calibrated" on exercises with overrides
   - Tooltip: "You've customized this exercise's muscle engagement"
   - Helps user remember which exercises they've adjusted
   - Visual distinction in Exercise Library and Recommendations

5. **`calibration-education`**
   - Onboarding: "Adjust engagement if exercises feel different to you"
   - Help article: "When and How to Calibrate Muscle Engagement"
   - Tooltips: "This is based on exercise science. Adjust if it doesn't match your experience."
   - Warning: "Major changes may affect recommendations. Start small."

### Modified Capabilities

- **`exercise-recommendations`**: Use calibrated percentages instead of defaults
- **`muscle-fatigue-tracking`**: Calculate fatigue using calibrated engagement
- **`exercise-library`**: Show calibration status on each exercise
- **`baseline-learning`**: Potentially use calibration data to improve learning (advanced)

---

## Scope

### In Scope

✅ **Engagement Viewer**
- Modal showing engagement breakdown for selected exercise
- Horizontal bars for each muscle (color-coded by percentage)
- "Default" label on uncalibrated exercises
- "You calibrated this" indicator on adjusted exercises
- Accessible from multiple entry points (Library, Recommendations)

✅ **Calibration Sliders**
- Edit mode in engagement viewer
- Sliders for each muscle (0-100%)
- Real-time percentage update as user adjusts
- Validation: Total engagement in reasonable range (100-300%)
- "Reset to Default" button per exercise
- Save/Cancel buttons

✅ **Database Storage**
- Create `user_exercise_calibrations` table (or add to existing table)
- Fields: user_id, exercise_id, muscle_name, engagement_percentage
- Foreign keys to users and exercises (via exercise_id string match)
- Unique constraint: (user_id, exercise_id, muscle_name)

✅ **API Endpoints**
- `GET /api/calibrations` - Fetch user's calibration overrides
- `GET /api/calibrations/:exerciseId` - Fetch for specific exercise
- `PUT /api/calibrations/:exerciseId` - Save adjustments for exercise
- `DELETE /api/calibrations/:exerciseId` - Reset exercise to default
- TypeScript types for requests/responses

✅ **Merge Logic**
- Backend or frontend merges user overrides with defaults
- Logic: If user override exists, use it; else use default
- Return merged engagement data to frontend
- Ensure all recommendation/fatigue calculations use merged data

✅ **Visual Indicators**
- "Calibrated" badge or icon on exercises with overrides
- Different styling in Exercise Library (subtle highlight)
- Tooltip explaining customization
- Count: "3 exercises calibrated" on settings/profile

✅ **User Education**
- Tooltip in calibration UI: "Adjust if this exercise feels different to you"
- Help article explaining when/how to calibrate
- Warning if user makes extreme changes (>50% deviation)
- Suggestion: "Try small adjustments first, test recommendations"

### Out of Scope (Future Enhancements)

❌ Auto-calibration based on performance data (ML/AI)
❌ Suggested calibrations from workout notes analysis
❌ Community calibration data (sharing calibrations)
❌ Calibration import/export (backup user overrides)
❌ Historical tracking of calibration changes over time
❌ Form variation presets (e.g., "Wide-grip pull-up" template)
❌ Video analysis to detect form and suggest calibrations

### Dependencies

**Required (Already Exists):**
- ✅ EXERCISE_LIBRARY with default engagement percentages
- ✅ Recommendation algorithm that uses engagement percentages
- ✅ Exercise Library UI (can add calibration button)
- ✅ Database with users table

**Needs to be Created:**
- ⚠️ Database table for user calibrations
- ⚠️ API endpoints for calibration CRUD
- ⚠️ Merge logic for overrides

**Blocked By:** None

**Blocks:**
- Auto-calibration via ML (future)
- Form variation tracking (future)
- Community calibration sharing (future)

---

## Success Metrics

### Immediate (On Deployment)

- ✅ Calibration UI renders correctly
- ✅ Sliders adjust engagement percentages accurately
- ✅ User calibrations saved to database
- ✅ Recommendations use calibrated values
- ✅ "Calibrated" indicator appears on adjusted exercises
- ✅ Reset to default works correctly
- ✅ No breaking changes to existing recommendation logic

### Short-term (2-4 weeks post-deployment)

- 📈 10-20% of users calibrate at least one exercise
- 📈 Most calibrations are minor adjustments (±10-20%)
- 📈 Calibrated exercises appear in user's top 10 most performed
- 📈 Users report recommendations feel more accurate
- 📈 No extreme calibrations (>50% deviation) without understanding
- 📈 Help article on calibration gets traffic

### Long-term (8+ weeks)

- 📈 Calibration correlates with user retention (personalized = invested)
- 📈 Calibration data informs population model improvements
- 📈 Users experiment with form variations and track via calibration
- 📈 Advanced users become "calibration power users" (5+ exercises)
- 📈 Feature requests for auto-calibration or community data

---

## Risks & Mitigation

### Risk: Users Break Recommendations with Bad Calibrations

**Scenario:** User sets all engagements to 0% or makes nonsensical adjustments
**Impact:** Recommendations become useless, fatigue tracking broken
**Mitigation:**
- Validation: Total engagement must be >0% and <500%
- Warning: If >50% deviation, show "Are you sure?"
- Easy reset: "Reset to Default" button always visible
- Education: Explain impact of calibration in help article
- Backend safeguards: Ignore invalid calibrations

### Risk: UI Complexity - Too Many Sliders

**Scenario:** Adjusting 4-5 muscles per exercise is tedious
**Impact:** Users abandon feature, calibration rate is low
**Mitigation:**
- Progressive disclosure: Only show sliders in edit mode
- Quick adjustments: ±5%, ±10% buttons next to sliders
- Templates: "Tricep-dominant" or "Wide-grip" presets (future)
- Focus: Most users calibrate 1-2 muscles, not all

### Risk: Calibration Conflicts with Baseline Learning

**Scenario:** User adjusts engagement, baseline learning gives different signals
**Impact:** System gets confused, recommendations inconsistent
**Mitigation:**
- Layered approach: Calibration affects engagement, baseline learning affects capacity
- Clear separation: Engagement = "How much muscle is used", Baseline = "How much capacity"
- Documentation: Explain interaction in help article
- Future: Use calibration to inform baseline learning (advanced)

### Risk: Mobile UX - Sliders are Fiddly

**Scenario:** Hard to adjust sliders precisely on small screens
**Impact:** Frustration, accidental changes
**Mitigation:**
- Large touch targets: Slider handles are ≥44px
- Numeric input: Allow typing exact value
- Increment buttons: +1%, +5%, +10% for precision
- Test on iPhone SE (smallest modern screen)

### Risk: Data Migration - Existing Users Have No Calibrations

**Scenario:** All existing users start with empty calibration table
**Impact:** No immediate benefit on launch
**Mitigation:**
- This is expected (feature didn't exist before)
- Gradual adoption is fine (users calibrate over time)
- Marketing: "New feature - Personalize your exercises"
- No migration needed (empty is valid state)

---

## Alternatives Considered

### Alternative 1: Auto-Calibrate via Performance Analysis

**Example:** System detects "User's triceps always fail first in push-ups" and auto-adjusts engagement

**Pros:**
- Zero user effort
- More accurate (based on actual data)
- Scalable (ML can learn patterns)

**Cons:**
- Very complex algorithm
- Requires lots of workout data (to failure)
- Hard to explain to users ("Why did the app change this?")
- May be wrong (correlation ≠ causation)

**Decision:** Deferred to future. Manual calibration is simpler for V1, auto-calibration can enhance later.

---

### Alternative 2: Form Variation Presets

**Example:** User selects "Wide-grip pull-up" vs "Narrow-grip pull-up", app uses different engagement percentages

**Pros:**
- Matches common form variations
- Easier than manual sliders (pick from list)
- Educational (teaches effect of form)

**Cons:**
- Requires defining presets for many exercises
- Still doesn't handle individual biomechanics
- More complex UI (dropdown + sliders?)

**Decision:** Future enhancement. Manual calibration first, presets can complement later.

---

### Alternative 3: Community Calibration Data

**Example:** Users can see and adopt calibrations from similar users (height, weight, experience)

**Pros:**
- Wisdom of crowds (better than population average)
- Social proof (see what others use)

**Cons:**
- Requires multi-user system (FitForge is single-user local)
- Privacy concerns (sharing training data)
- May not match individual differences

**Decision:** Not applicable (single-user app). If FitForge goes multi-user, reconsider.

---

### Alternative 4: No Calibration, Trust Defaults

**Example:** Assume exercise science averages are "good enough"

**Pros:**
- Zero implementation cost
- Simpler system

**Cons:**
- Misses individual differences (long arms, injuries, etc.)
- Generic recommendations (not personalized)
- User complaints: "This doesn't match how I feel"

**Decision:** Rejected. Brainstorming explicitly calls for personal calibration (Innovation #9).

---

## Implementation Phases

### Phase 1: Database Schema & API (4-5 hours)

**Tasks:**
- Design `user_exercise_calibrations` table
  - user_id, exercise_id, muscle_name, engagement_percentage
  - Unique constraint, foreign keys
- Create migration script
- Implement API endpoints
  - GET /api/calibrations
  - GET /api/calibrations/:exerciseId
  - PUT /api/calibrations/:exerciseId
  - DELETE /api/calibrations/:exerciseId
- Add TypeScript types for calibration data
- Test CRUD operations (Postman or curl)

**Acceptance Criteria:**
- Table created in database
- API endpoints return correct data
- Calibrations persist across restarts
- TypeScript types match backend

---

### Phase 2: Merge Logic & Integration (3-4 hours)

**Tasks:**
- Implement merge logic (user override > default)
- Decide: Backend merge (preferred) or frontend merge
- Update recommendation algorithm to use merged data
- Update fatigue calculation to use merged data
- Test that calibrations affect recommendations
- Ensure default exercises still work (backward compatible)

**Acceptance Criteria:**
- Calibrated exercises use user percentages
- Default exercises use EXERCISE_LIBRARY percentages
- Recommendations change when calibration is adjusted
- Fatigue calculations reflect calibrations
- No breaking changes

---

### Phase 3: Engagement Viewer UI (4-5 hours)

**Tasks:**
- Create modal/screen showing engagement breakdown
- Horizontal bars for each muscle (color-coded)
- Show percentage labels (e.g., "Pectoralis: 70%")
- "Default" vs "Calibrated" indicator
- "Edit" button to enter calibration mode
- Accessible from Exercise Library and Recommendations
- Responsive design (mobile-friendly)

**Acceptance Criteria:**
- Modal renders correctly
- Engagement bars display accurate percentages
- Calibrated indicator shows when appropriate
- "Edit" button transitions to calibration mode
- Works on desktop and mobile

---

### Phase 4: Calibration Sliders UI (5-6 hours)

**Tasks:**
- Edit mode with sliders for each muscle
- Slider range: 0-100% (configurable)
- Real-time total engagement display
- Validation: Total in reasonable range (100-300%)
- Warning if extreme adjustments (>50% deviation)
- "Reset to Default" button
- Save/Cancel buttons
- Numeric input option (type exact value)
- Test on mobile (slider touch targets)

**Acceptance Criteria:**
- Sliders adjust percentages smoothly
- Total engagement updates in real-time
- Validation prevents invalid inputs
- Warning appears for extreme changes
- Reset works correctly
- Save/Cancel commit or discard changes
- Mobile-friendly (44px touch targets)

---

### Phase 5: Visual Indicators & Education (3-4 hours)

**Tasks:**
- Add "Calibrated" badge to exercises with overrides
- Style calibrated exercises subtly in Exercise Library
- Tooltip: "You've customized this exercise"
- Count calibrated exercises in settings
- Help article: "When and How to Calibrate"
- Tooltips in calibration UI
- Onboarding mention (if applicable)
- Test user understanding (non-technical testers)

**Acceptance Criteria:**
- Badge appears on calibrated exercises
- Tooltip explains calibration
- Help article is clear and actionable
- Non-technical users understand feature
- No confusion about "Default" vs "Calibrated"

---

### Phase 6: Testing & Refinement (2-3 hours)

**Tasks:**
- End-to-end test: Calibrate → See recommendations change → Reset
- Edge case testing: 0%, 100%, invalid inputs
- Cross-browser testing
- Mobile responsiveness testing
- Accessibility (keyboard navigation, screen readers)
- Performance (does merge logic slow down recommendations?)
- Data integrity (calibrations survive logout/restart)

**Acceptance Criteria:**
- Complete flow works smoothly
- Edge cases handled gracefully
- Works on all browsers
- Mobile-friendly
- Accessible
- No performance degradation
- Data persists correctly

---

**Total Estimate:** 21-27 hours (2.5-3.5 days)

---

## Related Documentation

### Brainstorming Vision
- `docs/brainstorming-session-results.md` - Lines 269-279 (Future Innovation #9: Personal Calibration)
- `docs/brainstorming-session-results.md` - Lines 306-316 (Insight 2: Baselines Are Personal)
- `docs/brainstorming-session-results.md` - Lines 665-672 (Research Question #2: Muscle Engagement Percentages)

### Technical References
- `constants.ts` - EXERCISE_LIBRARY with default engagement percentages
- `utils/exerciseRecommendations.ts` - Recommendation algorithm using engagement data
- `docs/data-model.md` - Lines 520-533 (MuscleEngagement and Exercise interfaces)

### Related OpenSpec Changes

**Already Implemented (Uses Engagement Data):**
- `enable-smart-exercise-recommendations` (archived) - Uses engagement percentages for recommendations
- `enable-muscle-fatigue-heat-map` (archived) - Uses engagement for fatigue calculations

**Complements:**
- `research-muscle-fatigue-model-validation` (proposal) - Research identifies which engagements need calibration
- `implement-to-failure-tracking-ui` (proposal) - Failure data can inform calibration suggestions (future)

**Future Enhancements:**
- `implement-auto-calibration-ml` (future) - ML auto-adjusts engagements based on performance
- `implement-form-variation-presets` (future) - Quick-select presets for common form variations

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Database schema designed for calibration storage
- [ ] Design.md created for UI components and merge logic
- [ ] Spec delta written for `exercise-engagement-viewer` and `engagement-calibration-ui` capabilities
- [ ] Tasks.md breaks down implementation by phase
- [ ] Validation passes: `openspec validate implement-personal-engagement-calibration --strict`
- [ ] No blockers identified
- [ ] Dependencies confirmed available
- [ ] Brainstorming doc aligned (Future Innovation #9)
- [ ] User education content drafted

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create `design.md` for calibration UI and database schema
3. ⏭️ Write spec deltas for calibration capabilities
4. ⏭️ Create `tasks.md` with detailed task breakdown
5. ⏭️ Design database schema (migration script)
6. ⏭️ Mock up calibration UI (sliders, viewer)
7. ⏭️ Validate and get approval
8. ⏭️ Begin Phase 1: Database Schema & API

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply implement-personal-engagement-calibration` (after approval)
