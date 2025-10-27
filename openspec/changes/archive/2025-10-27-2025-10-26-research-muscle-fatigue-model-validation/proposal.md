# Proposal: Research & Validate Muscle Fatigue Model

**Change ID:** `research-muscle-fatigue-model-validation`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** Medium (De-risks advanced features, not blocking immediate work)

---

## Executive Summary

Conduct a formal research sprint to validate the scientific foundation of FitForge's muscle fatigue model, recovery formulas, and baseline learning algorithms. Document findings, confidence levels, and identified gaps to inform future feature development and provide transparency to users about system intelligence.

**Problem:** FitForge has implemented an intelligent muscle capacity learning system with:
- 13 muscle groups tracked with fatigue percentages (0-100%)
- Non-linear recovery curve (Day 0: 10%, Day 1: 50%, Day 2: 75%, Day 3: 90%, Day 5: 100%)
- Muscle engagement percentages for 48 exercises (e.g., push-ups = Pecs 70%, Triceps 50%, Deltoids 40%, Core 20%)
- Baseline capacity thresholds (default 10,000 units, system learns over time)

However, there's no documented research validating these models against exercise science literature. The system works empirically but lacks scientific rigor.

**Solution:** Formal research sprint to:
1. Literature review on muscle engagement percentages (EMG studies, biomechanics)
2. Validate recovery curve against supercompensation theory and muscle-specific recovery rates
3. Document mathematical foundation for baseline learning (constraint satisfaction)
4. Assess confidence levels for each model component
5. Identify gaps where assumptions need validation or user calibration
6. Create comprehensive research findings document

**Impact:** De-risks future features by ensuring they're built on solid science. Provides transparency to users ("Why does the app recommend this?"). Identifies where the system should learn from user data vs rely on population averages. Establishes credibility for advanced features like periodization and deload recommendations.

---

## Why

### Current State

**What Exists (Implemented Models):**
- ✅ Muscle engagement percentages in EXERCISE_LIBRARY (constants.ts)
- ✅ Recovery curve formula in `calculateRecoveryPercentage()` (utils/helpers.ts)
- ✅ Baseline learning algorithm (backend muscle baselines system)
- ✅ 13 muscle groups with default 10,000 capacity baselines
- ✅ Fatigue calculation: `volume / baseline × 100`
- ✅ Non-linear recovery curve over 5 days

**What's Missing:**
- ❌ No research document validating engagement percentages
- ❌ No exercise science citations for recovery formulas
- ❌ No mathematical proof for constraint satisfaction approach
- ❌ No confidence assessment (which models are solid, which are estimates)
- ❌ No documentation of assumptions and limitations
- ❌ No plan for ongoing validation with user data

**Critical Context:**
From brainstorming document (Phase 2, lines 468-527):
> **Phase 2: Research Sprint** 🔬 (Week 4) - **REQUIRED BEFORE ADVANCED FEATURES**
> - Validate muscle engagement percentage model
> - Research recovery formulas (muscle-specific vs universal)
> - Determine if constraint satisfaction approach is mathematically solvable
> - Define technical specification for baseline learning
> - **Deliverable:** Research findings document + validated mathematical model

Lines 507-528 emphasize:
> **V1 Philosophy:** Ship imperfect, iterate with real data. The heat map uses rough approximations initially - this is acceptable and provides value while we research the underlying model.

FitForge has shipped V1 with acknowledged approximations. Now it's time to validate and refine.

### Value Proposition

**For Development:**
- **Risk mitigation** - Identify flawed assumptions before building on them
- **Prioritization** - Know which areas need user calibration vs population data
- **Credibility** - Scientific backing for app intelligence claims
- **Roadmap** - Research findings inform which features are viable
- **Documentation** - Future developers understand model foundations

**For Users (Indirect):**
- **Trust** - Transparent about what's proven vs estimated
- **Accuracy** - System improves as research validates or corrects models
- **Customization** - Research identifies where personal calibration is needed
- **Education** - Help articles can reference exercise science
- **Long-term value** - Ensures app won't lead users astray with bad science

**For Product:**
- **Differentiation** - Science-backed system vs "bro science" apps
- **Defensibility** - Can cite research when explaining recommendations
- **Marketing** - "Based on exercise science research" is a selling point
- **Liability** - Reduces risk of giving harmful advice
- **Community** - Can engage fitness science community for feedback

**Strategic Context:**
This is NOT a coding task - it's research and documentation. The deliverable is knowledge, not features. However, this knowledge is critical for informed decision-making on future features.

---

## What Changes

### New Capabilities

1. **`research-documentation`**
   - Comprehensive research findings document (`docs/research-findings.md`)
   - Literature review on muscle engagement percentages (EMG studies)
   - Recovery curve validation against supercompensation theory
   - Mathematical specification for baseline learning algorithm
   - Confidence assessment for each model component (High/Medium/Low)
   - Identified gaps and recommendations for validation
   - Future research questions and experiments

2. **`model-validation-framework`**
   - Criteria for assessing model accuracy (e.g., "Within 10% of EMG studies")
   - Process for ongoing validation with user data
   - Plan for A/B testing model improvements
   - Metrics for measuring model performance (e.g., baseline convergence rate)

3. **`user-transparency`**
   - Help article: "How FitForge Learns Your Muscle Capacity"
   - FAQ: "Why does the app recommend this exercise?"
   - Confidence indicators in UI (future): "High confidence" vs "Learning..."
   - Changelog: Document model improvements as research progresses

### Modified Capabilities

- **`baseline-learning`**: Document mathematical foundation and assumptions
- **`muscle-fatigue-tracking`**: Validate recovery formulas and identify muscle-specific variations
- **`exercise-recommendations`**: Confidence assessment for engagement percentages

---

## Scope

### In Scope

✅ **Literature Review - Muscle Engagement**
- Search PubMed, Google Scholar for EMG studies on common exercises
- Find biomechanics research on push-ups, pull-ups, squats, etc.
- Compare FitForge's engagement percentages to published data
- Identify exercises where data is strong vs estimates
- Document sources and citations

✅ **Recovery Formula Validation**
- Research supercompensation theory and recovery curves
- Find studies on muscle recovery timelines (24h, 48h, 72h)
- Assess if recovery varies by muscle group (biceps vs glutes)
- Validate non-linear curve shape (exponential vs linear)
- Identify if training age affects recovery (beginner vs advanced)

✅ **Baseline Learning Math Spec**
- Define constraint satisfaction problem formally
- Prove solvability (or identify conditions for solvability)
- Document algorithm limitations (under-constrained, over-constrained)
- Specify confidence thresholds for updating baselines
- Mathematical proof or simulation validation

✅ **Confidence Assessment**
- Rate each model component: High/Medium/Low confidence
- High: Backed by multiple peer-reviewed studies
- Medium: Reasonable estimate, some research support
- Low: Educated guess, needs validation
- Document assumptions explicitly

✅ **Gap Identification**
- List areas where FitForge makes assumptions without data
- Recommend: User calibration, A/B testing, or population defaults
- Prioritize gaps by impact (critical vs nice-to-have)
- Create future research backlog

✅ **Documentation Artifact**
- Comprehensive `docs/research-findings.md` document
- Executive summary for non-technical readers
- Detailed sections for each model component
- References and citations
- Recommendations for model improvements
- Future research questions

### Out of Scope (Future Work)

❌ Implementing model changes (research informs, doesn't change code)
❌ User studies or data collection (this is literature review)
❌ Building validation dashboards or metrics systems
❌ A/B testing framework implementation
❌ Rewriting exercise library based on findings (separate proposal)
❌ Implementing muscle-specific recovery rates (future enhancement)

### Dependencies

**Required:**
- ✅ Access to exercise science databases (PubMed, Google Scholar - free)
- ✅ Understanding of FitForge's current models (already documented)
- ✅ Time for literature review (8-12 hours estimated)

**Blocked By:** None (pure research task)

**Blocks:**
- Advanced feature proposals (should reference research findings)
- Model improvement proposals (need to know what's wrong first)
- User education content (can cite research)

---

## Success Metrics

### Immediate (On Completion)

- ✅ Research findings document created and committed
- ✅ At least 10 peer-reviewed sources cited
- ✅ All model components assessed for confidence
- ✅ Gaps identified and prioritized
- ✅ Future research questions documented
- ✅ Executive summary readable by non-scientists

### Short-term (1-2 months after publication)

- 📈 Future proposals reference research findings
- 📈 Model improvements prioritized based on gap analysis
- 📈 User education content cites research
- 📈 Development team understands model foundations
- 📈 Confidence assessment informs UI design (show uncertainty)

### Long-term (6+ months)

- 📈 FitForge models validated or improved based on research
- 📈 User trust increases (transparency about science)
- 📈 Community contributions cite research doc
- 📈 Research findings updated as new studies published
- 📈 Marketing can credibly claim "science-backed"

---

## Risks & Mitigation

### Risk: Research Contradicts Existing Models

**Scenario:** Literature shows FitForge's recovery curve is wrong
**Impact:** Need to refactor core algorithms, user data may be inaccurate
**Mitigation:**
- This is the GOAL - better to know now than later
- Document discrepancies clearly
- Prioritize fixes based on impact (critical vs minor)
- Incremental improvements (don't rewrite everything at once)
- A/B test changes before full deployment

### Risk: Insufficient Research Available

**Scenario:** No EMG studies found for some exercises
**Impact:** Can't validate engagement percentages
**Mitigation:**
- Document as "Low confidence, needs user calibration"
- Mark exercises in UI as "Learning your pattern..."
- Use closest proxy (e.g., dumbbell press ≈ barbell press)
- Prioritize user feedback and calibration features

### Risk: Research is Paywalled

**Scenario:** Key studies behind journal subscriptions
**Impact:** Can't access full methodology
**Mitigation:**
- Use abstracts and freely available summaries
- Check institutional access (if applicable)
- Use free databases (PubMed Central, preprints)
- Contact authors for PDFs (many provide upon request)
- Accept some gaps (not a comprehensive meta-analysis)

### Risk: Time Sink - Research is Endless

**Scenario:** Could spend months reading papers
**Impact:** Delays other work, diminishing returns
**Mitigation:**
- Time-box research: 8-12 hours max
- Focus on high-impact areas (recovery curve, key exercises)
- "Good enough" threshold (not perfect, just validated)
- Can always extend research later
- Document "further reading" for future

### Risk: Research Findings Too Complex

**Scenario:** Mathematical proofs intimidate developers
**Impact:** Document not used, research wasted
**Mitigation:**
- Executive summary in plain English
- Progressive disclosure (simple → detailed)
- Visual diagrams where possible
- "So what?" section for each finding (practical implications)
- Separate technical appendix from main findings

---

## Alternatives Considered

### Alternative 1: Skip Research, Just Ship Features

**Pros:**
- Faster feature development
- V1 already works empirically
- Users don't demand citations

**Cons:**
- Build on flawed foundations
- May give bad recommendations
- Hard to refactor later
- Misses opportunity for differentiation

**Decision:** Rejected. Brainstorming doc explicitly calls for research sprint. Worth the time investment.

---

### Alternative 2: Hire Exercise Science Consultant

**Pros:**
- Expert validation faster than DIY research
- Credibility boost (PhD endorsement)

**Cons:**
- Expensive ($500-$2000+)
- Not needed for basic literature review
- Still need to understand models ourselves

**Decision:** Deferred. DIY research first, consult expert if gaps remain.

---

### Alternative 3: Crowdsource Research from Users

**Pros:**
- Community engagement
- Real-world validation from diverse users

**Cons:**
- Anecdotal data, not scientific
- Small sample size (single-user app currently)
- Can't replace literature review

**Decision:** Complement, not replace. User data validates models, but research informs them.

---

### Alternative 4: Wait Until Model Breaks Before Researching

**Pros:**
- Only research when problems emerge
- Don't waste time on non-issues

**Cons:**
- Reactive, not proactive
- Harder to fix after users rely on it
- Misses prevention opportunities

**Decision:** Rejected. Brainstorming prioritizes research BEFORE advanced features.

---

## Implementation Phases

### Phase 1: Muscle Engagement Literature Review (3-4 hours)

**Tasks:**
- Search PubMed for "EMG" + "push-up", "pull-up", "squat", "deadlift", etc.
- Find 5-10 key studies on muscle activation patterns
- Compare FitForge's percentages to EMG data
- Document discrepancies (where we're off by >10%)
- Note exercises with strong vs weak data support
- Create engagement percentage confidence table

**Deliverable:** Section in research doc: "Muscle Engagement Validation"

---

### Phase 2: Recovery Curve Validation (2-3 hours)

**Tasks:**
- Research supercompensation theory (classic papers)
- Find studies on muscle recovery timelines (24-72h)
- Compare FitForge's curve to published recovery curves
- Investigate muscle-specific recovery (biceps vs glutes)
- Assess training age effects (beginner vs advanced)
- Note if current formula is within reasonable range

**Deliverable:** Section in research doc: "Recovery Formula Analysis"

---

### Phase 3: Baseline Learning Math Spec (3-4 hours)

**Tasks:**
- Formalize constraint satisfaction problem
- Define equations for triangulation algorithm
- Prove solvability conditions (or identify limits)
- Document edge cases (under/over-constrained)
- Specify confidence thresholds for baseline updates
- Create example walkthrough (push-ups + tricep extensions)

**Deliverable:** Section in research doc: "Baseline Learning Algorithm"

---

### Phase 4: Confidence Assessment & Gap Analysis (2-3 hours)

**Tasks:**
- Create confidence matrix (model component × High/Med/Low)
- Rate muscle engagement percentages by exercise
- Rate recovery curve components
- Rate baseline learning assumptions
- Identify top 5 gaps that need attention
- Prioritize by impact × feasibility

**Deliverable:** Section in research doc: "Confidence Assessment" + "Gap Analysis"

---

### Phase 5: Documentation & Executive Summary (2-3 hours)

**Tasks:**
- Write executive summary (1-2 pages, non-technical)
- Organize findings into clear sections
- Add visual diagrams where helpful
- List all references and citations
- Create "Recommendations" section with action items
- Define future research questions
- Proofread and format for readability

**Deliverable:** Complete `docs/research-findings.md` document

---

**Total Estimate:** 12-17 hours (1.5-2 days of focused research)

**Note:** Can be done in parallel with feature development (different person or time-boxed)

---

## Related Documentation

### Brainstorming Vision
- `docs/brainstorming-session-results.md` - Lines 468-527 (Phase 2: Research Sprint)
- `docs/brainstorming-session-results.md` - Lines 649-711 (Research Questions backlog)

### Current Model Documentation
- `utils/helpers.ts` - `calculateRecoveryPercentage()` function (lines 895-909 in data-model.md)
- `constants.ts` - EXERCISE_LIBRARY with muscle engagement percentages
- `docs/data-model.md` - Lines 220-248 (muscle_states table and recovery formula)
- `backend/database/database.ts` - Baseline learning implementation

### Related OpenSpec Changes

**Already Implemented (Models to Validate):**
- `enable-muscle-baseline-learning` (archived) - Baseline learning algorithm
- `refactor-backend-driven-muscle-states` (archived) - Recovery calculations
- `enable-smart-exercise-recommendations` (archived) - Uses engagement percentages

**Informs Future Proposals:**
- `implement-muscle-specific-recovery-rates` (future) - Research will determine if needed
- `implement-personal-engagement-calibration` (future) - Research identifies calibration needs
- `improve-baseline-learning-algorithm` (future) - Research finds mathematical improvements

---

## Approval Checklist

- [ ] Proposal reviewed by product owner
- [ ] Time budget approved (12-17 hours)
- [ ] Deliverable format agreed upon (research-findings.md structure)
- [ ] Research scope is clear (not endless literature review)
- [ ] Success criteria defined (what makes this "done")
- [ ] Validation passes: `openspec validate research-muscle-fatigue-model-validation --strict`
- [ ] Alignment with brainstorming Phase 2 confirmed
- [ ] Future research questions documented for backlog

---

## Next Steps

1. ✅ Review this proposal
2. ⏭️ Create research findings document outline (`docs/research-findings.md`)
3. ⏭️ Set up research tools (PubMed account, Google Scholar alerts)
4. ⏭️ Time-box research sprint (e.g., "Next Thursday, 9am-5pm")
5. ⏭️ Begin Phase 1: Muscle Engagement Literature Review
6. ⏭️ Document findings incrementally (don't wait until end)
7. ⏭️ Share draft with team for feedback before finalizing

---

**Status:** Ready for review and approval
**Next Command:** `/openspec:apply research-muscle-fatigue-model-validation` (after approval)

**Note:** This is a research proposal, not a coding proposal. The "implementation" is documentation, not features. However, it follows OpenSpec structure for consistency and tracking.
