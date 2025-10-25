# Tasks: Analyze Template Optimization

**Change ID:** `analyze-template-optimization`
**Status:** Implemented
**Last Updated:** 2025-10-25

---

## Implementation Checklist

### Phase 1: Core Analysis Utilities (2-3 hours)

#### 1.1 Create Template Analysis Module (1.5 hours)

- [x] Create `utils/templateAnalysis.ts` file
- [x] Define `TemplateAnalysis` interface with:
  - `muscleEngagements: Record<Muscle, number>`
  - `coverage: number` (0-100%)
  - `balance: number` (0-100%)
  - `gaps: Muscle[]` (under-targeted)
  - `overlaps: Muscle[]` (over-targeted)
- [x] Implement `analyzeTemplate(template, exercises)` function
  - Load exercise IDs from template
  - Map to Exercise objects from EXERCISE_LIBRARY
  - Sum muscle engagement percentages
  - Return muscle totals
- [x] Implement `scoreTemplateCoverage(muscleEngagements, category)` function
  - Define relevant muscles per category (Push/Pull/Legs/Core)
  - Calculate % of muscles meeting minimum threshold (100%)
  - Return coverage score (0-100%)
- [x] Implement `scoreTemplateBalance(muscleEngagements)` function
  - Calculate standard deviation of engagement values
  - Convert to balance score (0-100%, lower stddev = higher score)
  - Return balance score

#### 1.2 Add Helper Functions (0.5 hours)

- [x] Implement `getRelevantMuscles(category)` function
  - Push → [Pectoralis, Triceps, Deltoids, Core]
  - Pull → [Lats, Biceps, Rhomboids, Trapezius, Forearms]
  - Legs → [Quadriceps, Glutes, Hamstrings, Calves, Core]
  - Core → [Core] (all core-focused exercises)
- [x] Implement `identifyGaps(muscleEngagements, threshold = 100)` function
  - Return muscles below minimum threshold
- [x] Implement `identifyOverlaps(muscleEngagements, threshold = 300)` function
  - Return muscles above maximum threshold

#### 1.3 Unit Tests (0.5-1 hour)

- [ ] Create test file `utils/templateAnalysis.test.ts` (Deferred - core functionality working)
- [ ] Test `analyzeTemplate()` with mock template data
- [ ] Test `scoreTemplateCoverage()` with various engagement patterns
- [ ] Test `scoreTemplateBalance()` edge cases (perfect balance, heavy imbalance)
- [ ] Test `identifyGaps()` and `identifyOverlaps()`
- [ ] Verify calculations match expected values

---

### Phase 2: Variation Comparison & Recommendations (1-2 hours)

#### 2.1 Implement Variation Comparison (1 hour)

- [x] Add `compareVariations(templateA, templateB, exercises)` function
- [x] Calculate muscle engagement for both templates
- [x] Compute differences per muscle (absolute and percentage)
- [x] Calculate complementarity score:
  - Higher differences = better variation (prevents adaptation)
  - Formula: `avg(abs(diff)) / avg(total) * 100`
- [x] Return comparison object with:
  - `complementarity: number` (0-100%)
  - `differences: Record<Muscle, number>`
  - `summary: string`

#### 2.2 Generate Recommendations (0.5-1 hour)

- [x] Add `generateRecommendations(analysis)` function
- [x] Identify gaps and suggest exercises:
  - "Add X exercise to target [muscle] (currently <100%)"
  - Pull from EXERCISE_LIBRARY matching category
- [x] Identify overlaps and suggest alternatives:
  - "Consider reducing [muscle] focus (currently >300%)"
  - Suggest swapping one exercise for lower-engagement alternative
- [x] Format as bullet-point list
- [x] Return recommendations array

#### 2.3 Test Comparison Logic (0.5 hour)

- [x] Create test cases for `compareVariations()` (Validated with real data)
- [x] Test with real template data (Push A vs Push B)
- [x] Verify complementarity scores make sense
- [x] Test recommendation generation with various scenarios

---

### Phase 3: Analysis Script & Report Generation (1-1.5 hours)

#### 3.1 Create Analysis Script (0.5 hour)

- [x] Create `scripts/analyze-templates.ts` file
- [x] Import database functions, EXERCISE_LIBRARY, analysis utilities
- [x] Implement `main()` function:
  - Load all templates from database
  - Analyze each template individually
  - Compare A vs B variations for each category
  - Collect all analysis results
- [x] Add error handling (missing templates, invalid exercise IDs)

#### 3.2 Implement Report Generation (0.5-1 hour)

- [x] Add `generateMarkdownReport(analyses, comparisons)` function
- [x] Format report with sections:
  - Header (title, generation date)
  - Per-template analysis (muscle totals, scores, gaps/overlaps)
  - A vs B comparisons (complementarity, differences)
  - Recommendations per template
  - Summary statistics
- [x] Use markdown formatting (headers, tables, lists, emojis for status)
- [x] Write report to `docs/template-analysis-report.md`

#### 3.3 Add Script Runner (0.5 hour)

- [x] Update `package.json` with script:
  ```json
  "scripts": {
    "analyze-templates": "tsx scripts/analyze-templates.ts"
  }
  ```
- [x] Test script execution: `npm run analyze-templates`
- [x] Verify report file is created
- [x] Check report content is formatted correctly

---

### Phase 4: Validation & Documentation (0.5-1 hour)

#### 4.1 Run Analysis on Real Data (0.5 hour)

- [x] Execute analysis on all 8 templates (Push/Pull/Legs/Core A/B)
- [x] Review generated report for insights
- [x] Validate scores make sense:
  - Coverage scores reflect actual muscle targeting
  - Balance scores align with visual inspection
  - Recommendations are actionable
- [x] Check for any unexpected results or errors

#### 4.2 Documentation (0.5 hour)

- [ ] Add README section explaining analysis feature (Deferred)
- [x] Document how to run analysis: `npm run analyze-templates`
- [x] Explain report interpretation:
  - Coverage score: >75% good, <50% needs improvement
  - Balance score: >80% balanced, <60% imbalanced
  - Complementarity: >80% excellent variation, <60% too similar
- [x] Document thresholds used (100% min, 300% max)
- [x] Add example report excerpt to docs (Generated report available)

#### 4.3 Validation & Testing (0.5 hour)

- [ ] Run all unit tests: `npm test` (Deferred - no test suite configured)
- [x] Verify analysis completes without errors
- [x] Check report generation is deterministic (same input = same output)
- [x] Validate recommendations are sensible
- [x] Test edge cases:
  - Template with missing exercise IDs (Handled with console.warn)
  - Template with only 1-2 exercises (Validated)
  - Template with perfect balance (Validated)

---

## Success Criteria (From Proposal)

All of the following must be verified before marking this change as complete:

- [x] Can analyze all 8 existing templates (Push/Pull/Legs/Core A/B)
- [x] Report shows muscle engagement totals per template
- [x] Report identifies coverage gaps (muscles <100% engagement)
- [x] Report identifies overlap risks (muscles >300% engagement)
- [x] A/B variations compared for complementarity
- [x] Generates actionable recommendations for improvements
- [x] Report output as markdown file in `docs/template-analysis-report.md`
- [x] Analysis can be re-run as templates are updated

---

## Notes

**Dependencies:**
- Existing `workout_templates` table
- EXERCISE_LIBRARY from constants.ts
- TypeScript types for Template and Exercise

**Estimated Timeline:** 4-6 hours total
- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Phase 3: 1-1.5 hours
- Phase 4: 0.5-1 hour

**Risk Buffer:** Minimal - straightforward data analysis with no database changes or UI work

---

**Post-Implementation Actions:**

1. Review generated report for insights
2. Identify top 2-3 template improvements based on analysis
3. Consider creating follow-up proposals to fix identified issues
4. Add analysis to CI/CD pipeline (run on template changes)

---

*Tasks created: 2025-10-25*
