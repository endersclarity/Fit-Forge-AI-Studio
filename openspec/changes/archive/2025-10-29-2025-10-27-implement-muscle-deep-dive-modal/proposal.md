# Proposal: Implement Muscle Detail Deep-Dive Modal

**Change ID:** `implement-muscle-deep-dive-modal`
**Type:** Feature Enhancement
**Status:** Draft
**Created:** 2025-10-27
**Priority:** Medium (Progressive disclosure Level 3)
**Depends On:**
- `implement-muscle-visualization-feature` (Phase 1, 2, 4 complete)
- `fix-muscle-hover-tooltip-wiring` (recommended, not blocking)

---

## Executive Summary

Implement progressive disclosure Level 3 for the muscle visualization feature: a detailed modal that appears when users click on a muscle region, providing comprehensive information about that muscle's status, history, and smart exercise recommendations ranked by "collateral fatigue cost."

**Problem:** Users can see at-a-glance fatigue status (colors) and hover for exact percentages, but cannot access detailed muscle history, exercise recommendations, or understand why certain exercises are better choices given their current muscle state across ALL muscle groups.

**Solution:** Create a modal that opens on muscle click, displaying:
- **Muscle Overview:** Name, exact fatigue %, last trained date, volume capacity
- **Exercise History:** Recent exercises targeting this muscle, with volume data
- **Smart Recommendations:** Exercises ranked by efficiency formula:
  - (Target muscle engagement %) ÷ (Risk of over-fatiguing other muscles)
  - Shows "collateral fatigue cost" for each recommended exercise
  - Highlights best exercises to bring target muscle to 100% without overtaxing others
- **Calibration Link:** Quick access to personal engagement calibration for this muscle

**Impact:**
- **Intelligent workout planning:** Users understand WHY certain exercises are recommended
- **Collateral fatigue awareness:** Prevents accidental overtraining of supporting muscles
- **Data-driven decisions:** See actual volume capacity vs current fatigue
- **Foundation for forecasting:** Sets up UI patterns for forecasted fatigue builder feature
- **Completes progressive disclosure:** Glance → Hover → Deep-dive workflow fully implemented

---

## Why

### Current State

**What Exists:**
- ✅ Level 1 (Glance): Color-coded muscle visualization
- ✅ Level 2 (Hover): Tooltip with name + fatigue % (pending wiring fix)
- ✅ Click handler infrastructure in MuscleVisualization component
- ✅ Muscle states API with fatigue, last trained, recovery data
- ✅ Exercise library with muscle engagement percentages
- ✅ Exercise recommendation algorithm (basic filtering)

**What's Missing:**
- ❌ Modal UI component for deep-dive view
- ❌ "Collateral fatigue cost" calculation for exercise ranking
- ❌ Exercise history display (last 5 exercises targeting muscle)
- ❌ Volume capacity vs current fatigue visualization
- ❌ Smart ranking algorithm that considers ALL muscle states
- ❌ Link to calibration modal from muscle detail view
- ❌ Mobile-optimized modal layout

### Value Proposition

**For Users:**
- **Smarter exercise selection:** Understand WHY tricep pushdowns are better than bench press right now
- **Avoid overtraining:** See which exercises have high collateral fatigue cost
- **Historical context:** "When did I last train this muscle? What exercise did I use?"
- **Confidence in choices:** Data-driven recommendations, not guesswork
- **Learn body mechanics:** Understand how exercises engage multiple muscles

**For System:**
- **Differentiation:** No other fitness app shows "collateral fatigue cost"
- **Foundation for forecasting:** UI patterns reusable for forecasted fatigue builder
- **Data collection:** Track which exercises users choose for different fatigue states
- **User education:** Teach users about muscle engagement and compound movements
- **Reduced support:** Self-service muscle information reduces "what should I do?" questions

**Evidence from Brainstorming Document:**
> **Level 3: Click (Deep dive modal)**
> - Click muscle → Detailed panel opens
> - Shows: Muscle name, exact fatigue %, last workout date, last exercise, volume applied, max volume capacity
> - **SMART EXERCISE RECOMMENDATIONS** - Ranked by collateral fatigue awareness
>
> **The Killer Insight - Collateral Fatigue Awareness:**
> Recommendations aren't just "exercises that use this muscle" - they're RANKED BY INTELLIGENCE:
> 1. Primary target efficiency: How much does this exercise engage the selected muscle?
> 2. Collateral fatigue cost: How much will this exercise push OTHER muscles toward overfatigue?

---

## What Changes

### New Capabilities

1. **`muscle-deep-dive-modal-ui`**
   - Modal component that opens on muscle click
   - Responsive layout (full screen on mobile, centered modal on desktop)
   - Close button, ESC key support, click-outside-to-close
   - Smooth open/close animations
   - Keyboard navigation and focus trap

2. **`muscle-detail-overview-display`**
   - Muscle name with icon/illustration
   - Current fatigue percentage with visual bar
   - Last trained date (relative format: "2 days ago")
   - Days until recovered (based on fatigue %)
   - Volume capacity: current vs max (from baselines)
   - Recovery progress timeline visualization

3. **`muscle-exercise-history`**
   - Last 5 exercises that targeted this muscle
   - Exercise name, date performed, volume applied
   - Sortable by date or volume
   - Link to full workout session details
   - "No history" state for untrained muscles

4. **`smart-exercise-recommendations`**
   - Ranked list of exercises by "smart score"
   - Smart score formula: (Target engagement %) ÷ (Collateral fatigue risk)
   - Display for each exercise:
     - Exercise name
     - Target muscle engagement % (calibrated if available)
     - Secondary muscle engagement breakdown
     - Collateral fatigue cost indicator (Low/Medium/High)
     - Current fatigue of all engaged muscles
     - "Forecasted fatigue" if exercise completed (future enhancement)
   - Filter options: Show all / Show only low-collateral / Show isolation exercises
   - Sort options: By smart score / By target engagement / By name

5. **`collateral-fatigue-calculation`**
   - Algorithm to calculate collateral fatigue risk
   - Inputs: Exercise engagement data, current muscle states for ALL muscles
   - Output: Risk score (0-100) representing "how close will other muscles get to overfatigue"
   - Consider both major and minor muscle groups
   - Weighted by current fatigue state (muscle at 90% = high risk, 20% = low risk)

6. **`muscle-calibration-integration`**
   - Link to calibration modal from muscle detail view
   - Show calibration status (default vs calibrated)
   - Visual indicator if using calibrated engagement percentages
   - Quick "Calibrate this muscle" button

### Modified Capabilities

**`muscle-visualization-interactions`**
- MODIFIED: Click behavior now opens deep-dive modal instead of just selection
- MODIFIED: Add modal open state management
- MODIFIED: Pass clicked muscle to modal component

**`recommendation-ui-display`**
- MODIFIED: Reuse smart ranking algorithm in modal
- MODIFIED: Add collateral fatigue cost indicators to exercise cards
- MODIFIED: Highlight exercises shown in modal when muscle selected

### Removed Capabilities

**None** - This is additive only.

---

## Design

See `design.md` for detailed architectural decisions, component structure, and algorithm specifications.

---

## Implementation Phases

### Phase 1: Modal UI Infrastructure (1-2 days)
- Create MuscleDetailModal component
- Implement open/close state management
- Add responsive layout (mobile vs desktop)
- Implement keyboard navigation and focus trap
- Add animations and transitions

### Phase 2: Muscle Overview Display (1 day)
- Display muscle name, fatigue %, recovery status
- Show last trained date and days until recovered
- Visualize volume capacity (current vs max)
- Add recovery progress timeline

### Phase 3: Exercise History Integration (1 day)
- Query workout history for exercises targeting muscle
- Display last 5 exercises with volume data
- Add sorting and filtering
- Link to full workout session details

### Phase 4: Collateral Fatigue Algorithm (2-3 days)
- Define collateral fatigue risk calculation formula
- Implement algorithm using exercise engagement data + muscle states
- Test with various muscle state scenarios
- Tune weighting factors for accuracy

### Phase 5: Smart Exercise Recommendations (1-2 days)
- Integrate collateral fatigue calculation into ranking
- Display smart score and breakdown for each exercise
- Add filter options (all / low-collateral / isolation)
- Implement sort options

### Phase 6: Calibration Integration (1 day)
- Add calibration status indicator
- Link to calibration modal
- Show difference between default and calibrated engagement
- Add "Calibrate this muscle" CTA

### Phase 7: Polish & Testing (1-2 days)
- Mobile optimization and touch interactions
- Accessibility testing (screen readers, keyboard nav)
- Edge case handling (no history, no exercises, loading states)
- Performance profiling
- User testing with 3+ users

**Total Estimated Time:** 8-12 days (1.5-2.5 weeks)

---

## Acceptance Criteria

This feature is considered complete when:

1. **Modal Behavior:**
   - Clicking muscle opens modal with correct muscle data
   - Modal closes via X button, ESC key, or click outside
   - Modal traps focus and supports keyboard navigation
   - Smooth animations on open/close

2. **Muscle Overview:**
   - Displays muscle name, fatigue %, last trained date
   - Shows volume capacity (current vs max from baselines)
   - Recovery timeline visualization is accurate

3. **Exercise History:**
   - Shows last 5 exercises targeting muscle
   - Data is correct and sorted by date (recent first)
   - Links to workout session details work
   - "No history" state displays for untrained muscles

4. **Smart Recommendations:**
   - Exercises ranked by smart score (target engagement ÷ collateral risk)
   - Collateral fatigue cost displayed accurately
   - Shows current fatigue of all engaged muscles
   - Filter and sort options work correctly

5. **Collateral Fatigue Algorithm:**
   - Algorithm produces reasonable risk scores (validated by manual testing)
   - Prefers isolation exercises when supporting muscles highly fatigued
   - Ranks compound exercises higher when all muscles fresh
   - Edge cases handled (no baseline data, zero engagement, etc.)

6. **Calibration Integration:**
   - Calibration status indicator shows correct state
   - Link to calibration modal works
   - Uses calibrated engagement percentages when available

7. **Performance & Accessibility:**
   - Modal opens in <200ms
   - WCAG 2.1 AA compliance (automated tests pass)
   - Works on mobile (iOS Safari, Android Chrome)
   - Screen reader testing successful

8. **User Testing:**
   - 3 users can successfully use modal without instruction
   - Users understand collateral fatigue cost concept
   - Feedback confirms feature is useful for workout planning

---

## Risks & Mitigation

### Risk: Collateral fatigue algorithm is too complex for users to understand
**Likelihood:** Medium
**Impact:** High (users ignore feature if confusing)
**Mitigation:**
- Use simple language: "Low risk of tiring other muscles" vs "collateral fatigue cost: 0.23"
- Add tooltip explaining concept on first use
- Visual indicators (color coding: green=low, yellow=medium, red=high)
- User testing to validate understandability

### Risk: Modal contains too much information (overwhelming)
**Likelihood:** Medium
**Impact:** Medium (cognitive overload)
**Mitigation:**
- Use tabs or accordion to group information
- Progressive disclosure within modal (show details on expand)
- Clear visual hierarchy with prominent CTAs
- Mobile-first design forces simplification

### Risk: Collateral fatigue calculation is inaccurate
**Likelihood:** Low (algorithm can be validated)
**Impact:** High (bad recommendations damage trust)
**Mitigation:**
- Extensive testing with real workout data
- Validate algorithm with exercise science research
- Add feedback mechanism "Was this recommendation helpful?"
- Start conservative (prefer isolation exercises initially)

### Risk: Performance issues with complex calculations on modal open
**Likelihood:** Low
**Impact:** Medium (modal feels sluggish)
**Mitigation:**
- Memoize calculation results
- Pre-calculate smart scores when muscle states update
- Use web workers for heavy computation if needed
- Performance budget: <200ms to open modal

### Risk: Implementation takes longer than estimated
**Likelihood:** Medium (algorithm complexity unknown)
**Impact:** Medium (delays other features)
**Mitigation:**
- Start with simple formula, iterate based on testing
- Phase 4 (algorithm) is parallelizable with Phase 2-3
- Can launch with basic ranking first, add collateral logic later
- Build minimum viable algorithm (MVP), enhance over time

---

## Dependencies

**Requires:**
- ✅ Muscle visualization feature Phase 1, 2, 4 complete
- ✅ Muscle states API with fatigue and last trained data
- ✅ Exercise library with muscle engagement percentages
- ✅ Muscle baselines API (for volume capacity display)
- ⏳ Personal engagement calibration (can launch without, integrate later)
- ⏳ Hover tooltip wiring fix (recommended for complete progressive disclosure)

**Blocks:**
- Forecasted fatigue workout builder (reuses modal UI patterns)
- Historical muscle state visualization (reuses detail display components)

**Related:**
- Exercise recommendation algorithm (smart ranking integration)
- Calibration modal (deep-linking integration)
- Workout history display (exercise history component)

---

## Success Metrics

**User Engagement:**
- 60%+ of users open muscle detail modal in first session
- Average 2+ modal opens per dashboard visit
- 40%+ of workouts include exercises chosen from modal recommendations

**Algorithm Accuracy:**
- Smart score rankings validated by expert review (exercise physiologist)
- User feedback: 80%+ find recommendations "helpful" or "very helpful"
- Low complaint rate about "bad recommendations"

**Performance:**
- Modal open time <200ms (95th percentile)
- Smart score calculation <50ms per exercise
- 60 FPS maintained during modal animations

**Qualitative:**
- User feedback mentions "smart recommendations" and "avoid overtraining"
- Support requests about exercise selection decrease
- Users report discovering new exercises through recommendations

---

## Open Questions

1. **Smart score formula:** What weighting should we use for collateral fatigue risk vs target engagement?
   - **Proposal:** Start with 50/50 weighting, tune based on user feedback
   - **Formula:** `smart_score = (target_engagement_% / 100) × 0.5 + (1 - collateral_risk / 100) × 0.5`

2. **Collateral fatigue threshold:** At what fatigue percentage is a muscle considered "at risk of overtraining"?
   - **Proposal:** 70% or higher = high risk, 40-70% = medium risk, <40% = low risk
   - **Rationale:** Aligns with existing color zones (green/yellow/red)

3. **Exercise history limit:** Show last 5 exercises, or allow pagination for more?
   - **Proposal:** Last 5 for MVP, add "View all" link if users request it
   - **Rationale:** Keep modal simple, avoid information overload

4. **Modal size on desktop:** Full screen, large centered modal, or side panel?
   - **Proposal:** Large centered modal (60% viewport width, max 800px)
   - **Rationale:** Balances information density with context visibility

5. **Forecasted fatigue preview:** Should modal show "predicted fatigue after exercise"?
   - **Proposal:** No for MVP, add in forecasted fatigue builder feature later
   - **Rationale:** Avoid scope creep, establish UI patterns first

---

## References

### Internal Documentation
- **Muscle Viz Implementation:** `openspec/changes/2025-10-27-implement-muscle-visualization-feature/`
- **Brainstorming Session:** `docs/brainstorming-session-results-2025-10-27.md` (Branch 2: Smart Exercise Recommendation Logic)
- **Exercise Library:** `constants/index.ts` (EXERCISE_LIBRARY with engagement data)
- **Calibration Feature:** `openspec/changes/2025-10-26-implement-personal-engagement-calibration/`

### External Resources
- **Exercise Science - MVIC:** Research on maximal voluntary isometric contraction for engagement percentages
- **Compound Movement Fatigue:** Studies on fatigue transfer between muscle groups
- **Modal Accessibility:** ARIA Authoring Practices Guide - Modal Dialog Pattern

---

## Stakeholder Sign-Off

**Product Owner (Kaelen Jennings):** Approved - "The collateral fatigue awareness is the killer feature. This is what separates FitForge from every other tracker."

**Technical Lead:** Pending - Need to validate algorithm complexity and performance impact

**Design Lead:** Pending - Need mockups for modal layout and information hierarchy

---

*This proposal documents the implementation of progressive disclosure Level 3 for muscle visualization, enabling intelligent exercise recommendations based on collateral fatigue awareness.*
