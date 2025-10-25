# Proposal: Analyze Template Optimization

**Change ID:** `analyze-template-optimization`
**Status:** Proposed
**Created:** 2025-10-25
**Author:** Development Team
**Priority:** 3 (Quality of Life - Training Intelligence)

---

## Why

FitForge has 8 pre-designed workout templates (Push A/B, Pull A/B, Legs A/B, Core A/B), but there's **no validation** that these templates are actually intelligently designed. Users trust the app to provide optimal workouts, but we have no analysis proving:

1. **Balanced muscle coverage** - Do templates hit all relevant muscles adequately?
2. **No counterproductive overlap** - Are we overtraining certain muscles?
3. **Optimal muscle pairing** - Are A/B variations truly complementary?
4. **Progressive variety** - Do alternating variations prevent adaptation plateaus?

**From Brainstorming Session (Item #10):**
> **Template Optimization Analysis (AI-Assisted)**
> - Analyze existing A/B workout templates
> - "Are these actually intelligently designed?"
> - Check for muscle overlap/gaps
> - Suggest improvements based on muscle engagement data
> - **Requires:** Deep analysis of muscle engagement patterns

**User Impact:**
- Users rely on templates for structured training
- Poor template design = suboptimal results
- No feedback loop to improve templates over time
- Templates were designed intuitively, not scientifically validated

---

## What Changes

Add a **Template Analysis Report** feature that provides data-driven insights into workout template quality and optimization opportunities.

### Capabilities Added

**1. Template Muscle Coverage Analysis**
- Calculate total muscle engagement per template
- Identify under-targeted muscles (<100% total engagement across all exercises)
- Identify over-targeted muscles (>300% total engagement)
- Compare A vs B variation coverage

**2. Template Balance Scoring**
- Score each template on:
  - **Coverage Score**: % of relevant muscles adequately targeted
  - **Balance Score**: Even distribution across muscle groups
  - **Variation Quality**: How well A/B complement each other
  - **Efficiency Score**: Minimal overlap, maximal coverage

**3. Template Comparison & Recommendations**
- Side-by-side comparison of A vs B variations
- Identify missing muscle groups in category
- Suggest exercise swaps to improve balance
- Flag potential overtraining risks

**4. Visual Report Generation**
- Generate markdown report with:
  - Muscle engagement heatmaps (per template)
  - Coverage gaps and overlaps
  - A/B variation comparison charts
  - Actionable recommendations

### Out of Scope (Future)

- **Auto-generation of templates** (requires AI/optimization algorithm)
- **User-customizable optimization goals** (e.g., "prioritize chest development")
- **Historical performance analysis** (which templates led to best PRs)
- **Real-time template suggestions during workout** (belongs in workout flow)

---

## Success Criteria

- [ ] Can analyze all 8 existing templates (Push/Pull/Legs/Core A/B)
- [ ] Report shows muscle engagement totals per template
- [ ] Report identifies coverage gaps (muscles <100% engagement)
- [ ] Report identifies overlap risks (muscles >300% engagement)
- [ ] A/B variations compared for complementarity
- [ ] Generates actionable recommendations for improvements
- [ ] Report output as markdown file in `docs/template-analysis-report.md`
- [ ] Analysis can be re-run as templates are updated

---

## User Experience

### Before (Current State)

```
User views templates in app
- Push A: 4 exercises listed
- Push B: 4 exercises listed
- Pull A: 4 exercises listed
- Pull B: 4 exercises listed
... etc

Questions users can't answer:
- "Is Push A actually well-designed?"
- "Am I overtraining my triceps with this template?"
- "Do Push A and B complement each other?"
- "Are there muscle gaps in my Legs templates?"
```

### After (Proposed State)

```
Developer/User runs analysis command
→ npx ts-node scripts/analyze-templates.ts

TEMPLATE ANALYSIS REPORT
Generated: 2025-10-25

==============================================
PUSH A - Coverage Analysis
==============================================

Muscle Engagement Totals:
  Pectoralis:  255%  ✅ Well-targeted
  Triceps:     185%  ✅ Well-targeted
  Deltoids:    160%  ✅ Well-targeted
  Core:         40%  ⚠️  Under-targeted

Coverage Score: 75% (3/4 relevant muscles)
Balance Score: 82% (good distribution)

==============================================
PUSH B - Coverage Analysis
==============================================

Muscle Engagement Totals:
  Pectoralis:  210%  ✅ Well-targeted
  Triceps:     200%  ✅ Well-targeted
  Deltoids:    240%  ✅ Well-targeted
  Core:         60%  ⚠️  Under-targeted

Coverage Score: 75% (3/4 relevant muscles)
Balance Score: 79% (good distribution)

==============================================
PUSH A vs PUSH B - Variation Quality
==============================================

Complementarity Score: 88% (excellent variation)

Differences:
  Pectoralis:  Push A (255%) vs B (210%) = 45% difference ✅
  Deltoids:    Push A (160%) vs B (240%) = 80% difference ✅ Great variety!

Recommendations:
  1. Add core-focused exercise to both Push A and B
  2. Consider "Plank" (Core 80%) or "Hanging Leg Raise" (Core 70%)
  3. Push B emphasizes shoulders more - good for alternating stimulus

==============================================

Report saved to: docs/template-analysis-report.md
```

---

## Implementation

### Files to Create

1. **scripts/analyze-templates.ts** (new analysis script)
   - Load all templates from database
   - Load EXERCISE_LIBRARY from constants.ts
   - Calculate muscle engagement totals per template
   - Generate analysis report
   - Write markdown report to docs/

2. **utils/templateAnalysis.ts** (new utility module)
   - `analyzeTemplate(template, exercises)` - Calculate muscle totals
   - `scoreTemplateCoverage(muscleEngagements)` - Coverage %
   - `scoreTemplateBalance(muscleEngagements)` - Balance %
   - `compareVariations(templateA, templateB)` - A vs B analysis
   - `generateRecommendations(analysis)` - Suggest improvements

3. **docs/template-analysis-report.md** (generated output)
   - Auto-generated markdown report
   - Updated whenever analysis is run
   - Version-controlled for tracking improvements

### Data Flow

```typescript
// 1. Load templates and exercises
const templates = getWorkoutTemplates(); // from database
const exercises = EXERCISE_LIBRARY;      // from constants.ts

// 2. Analyze each template
for (const template of templates) {
  const analysis = analyzeTemplate(template, exercises);

  // 3. Calculate metrics
  const coverage = scoreTemplateCoverage(analysis.muscleEngagements);
  const balance = scoreTemplateBalance(analysis.muscleEngagements);

  // 4. Generate insights
  const recommendations = generateRecommendations(analysis);
}

// 5. Compare A vs B variations
const pushA = templates.find(t => t.category === 'Push' && t.variation === 'A');
const pushB = templates.find(t => t.category === 'Push' && t.variation === 'B');
const comparison = compareVariations(pushA, pushB);

// 6. Write report
writeReport('docs/template-analysis-report.md', analysisData);
```

### Analysis Algorithms

**Muscle Engagement Calculation:**
```typescript
function analyzeTemplate(template: WorkoutTemplate, exercises: Exercise[]) {
  const muscleEngagements: Record<Muscle, number> = {};

  // Sum engagement percentages across all exercises
  for (const exerciseId of template.exerciseIds) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) continue;

    for (const engagement of exercise.muscleEngagements) {
      muscleEngagements[engagement.muscle] =
        (muscleEngagements[engagement.muscle] || 0) + engagement.percentage;
    }
  }

  return muscleEngagements;
}
```

**Coverage Scoring:**
```typescript
function scoreTemplateCoverage(muscleEngagements: Record<Muscle, number>, category: string) {
  const relevantMuscles = getRelevantMuscles(category); // Push = Pecs, Triceps, Delts, Core
  const minCoverage = 100; // 100% minimum per muscle

  let coveredCount = 0;
  for (const muscle of relevantMuscles) {
    if (muscleEngagements[muscle] >= minCoverage) {
      coveredCount++;
    }
  }

  return (coveredCount / relevantMuscles.length) * 100;
}
```

**Balance Scoring:**
```typescript
function scoreTemplateBalance(muscleEngagements: Record<Muscle, number>) {
  const values = Object.values(muscleEngagements);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = better balance
  // Convert to 0-100 score (100 = perfect balance)
  const maxStdDev = 100; // Arbitrary threshold
  return Math.max(0, 100 - (stdDev / maxStdDev * 100));
}
```

---

## Dependencies

**Requires:**
- ✅ `workout_templates` table (exists)
- ✅ `EXERCISE_LIBRARY` with muscle engagements (exists in constants.ts)
- ✅ Template API endpoints (exist)
- ✅ TypeScript types for Template and Exercise (exist)

**New Dependencies:**
- None (uses existing data)

**Enables:**
- Future: Auto-optimization of templates
- Future: User-customizable template generation
- Future: Template performance tracking (which templates lead to best results)

---

## Technical Design

### Script Structure

**Location:** `scripts/analyze-templates.ts`

```typescript
import { getDatabase } from '../backend/database/database';
import { EXERCISE_LIBRARY } from '../constants';
import { analyzeTemplate, scoreTemplateCoverage, compareVariations } from '../utils/templateAnalysis';
import * as fs from 'fs';

async function main() {
  const db = getDatabase();

  // 1. Load all templates
  const templates = db.prepare('SELECT * FROM workout_templates WHERE user_id = 1').all();

  // 2. Analyze each template
  const analyses = templates.map(template => ({
    template,
    muscleEngagements: analyzeTemplate(template, EXERCISE_LIBRARY),
    coverage: scoreTemplateCoverage(...),
    balance: scoreTemplateBalance(...)
  }));

  // 3. Compare A vs B variations
  const comparisons = compareAllVariations(analyses);

  // 4. Generate markdown report
  const report = generateMarkdownReport(analyses, comparisons);

  // 5. Write to file
  fs.writeFileSync('docs/template-analysis-report.md', report);

  console.log('✅ Analysis complete! Report saved to docs/template-analysis-report.md');
}

main();
```

### Utility Functions

**Location:** `utils/templateAnalysis.ts`

```typescript
export interface TemplateAnalysis {
  muscleEngagements: Record<Muscle, number>;
  coverage: number;       // 0-100%
  balance: number;        // 0-100%
  gaps: Muscle[];         // Under-targeted muscles
  overlaps: Muscle[];     // Over-targeted muscles
}

export function analyzeTemplate(
  template: WorkoutTemplate,
  exercises: Exercise[]
): TemplateAnalysis {
  // Implementation as shown above
}

export function compareVariations(
  templateA: WorkoutTemplate,
  templateB: WorkoutTemplate,
  exercises: Exercise[]
): {
  complementarity: number;  // 0-100%
  differences: Record<Muscle, number>;
  recommendations: string[];
} {
  // Compare muscle engagement patterns
  // Calculate how well they complement each other
  // Generate recommendations
}
```

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Templates are poorly designed (analysis reveals major flaws) | Medium | Good! This is why we're analyzing - identify and fix issues |
| Analysis criteria too strict (flags false positives) | Low | Use reasonable thresholds: 100% min, 300% max per muscle |
| Report becomes stale as templates change | Low | Re-run script after template updates, version-control report |
| Analysis doesn't account for user customizations | Low | V1 analyzes default templates only, future: custom analysis |
| Computational cost for large template sets | Very Low | 8 templates × 4 exercises avg = 32 calculations (instant) |

---

## Alternatives Considered

### Alternative 1: Manual Template Review
- **Rejected:** Time-consuming, subjective, not data-driven
- No systematic approach, prone to human bias

### Alternative 2: Real-Time Template Scoring in UI
- **Deferred:** Adds UI complexity, belongs in template editor feature
- V1: Generate report for developers/advanced users
- V2: Surface insights in app UI

### Alternative 3: Machine Learning Template Generator
- **Out of Scope:** Requires training data, optimization algorithm, research
- Analysis is prerequisite for understanding what "optimal" means

### Alternative 4: User Surveys ("How balanced does this template feel?")
- **Rejected:** Violates "Data Over Surveys" principle from brainstorming
- Objective muscle engagement data > subjective user feedback

---

## Open Questions

1. **What are acceptable muscle engagement thresholds?**
   - **Proposal:** Min 100% (adequate stimulus), Max 300% (avoid overtraining)
   - Validate against exercise science research

2. **Should analysis account for exercise order?**
   - **V1:** No - just analyze total engagement
   - **Future:** Yes - fatigue compounds, order matters

3. **How to weight muscle importance by category?**
   - **V1:** All relevant muscles equally important
   - **Future:** Push might prioritize pecs > core, etc.

4. **Should we analyze user-created templates?**
   - **V1:** Only default 8 templates
   - **Future:** Add flag `--all` to analyze custom templates

5. **Output format: markdown vs JSON vs both?**
   - **V1:** Markdown for human readability
   - **Future:** Add `--json` flag for programmatic use

---

## Related Changes

- **Depends on:** Nothing (uses existing template data)
- **Enables:**
  - Future: Auto-optimization of templates based on analysis insights
  - Future: Template quality scoring in UI
  - Future: "Optimize this template" feature
- **Related to:**
  - Smart Exercise Recommendations (uses similar muscle engagement logic)
  - Analytics Dashboard (could surface template performance metrics)

---

## Implementation Timeline

**Estimated Effort:** 4-6 hours

**Phase 1: Core Analysis Logic (2-3 hours)**
- Create `utils/templateAnalysis.ts`
- Implement `analyzeTemplate()`, `scoreTemplateCoverage()`, `scoreTemplateBalance()`
- Add unit tests for calculations

**Phase 2: Comparison & Recommendations (1-2 hours)**
- Implement `compareVariations()`
- Generate actionable recommendations
- Test with actual template data

**Phase 3: Report Generation (1 hour)**
- Create `scripts/analyze-templates.ts`
- Generate markdown report
- Format output for readability

**Phase 4: Documentation & Validation (0.5 hours)**
- Run analysis on all 8 templates
- Review report for insights
- Document how to run analysis

---

## Next Steps

### Immediate Actions

1. ⏭️ **Review and approve this proposal**
2. ⏭️ **Run preliminary manual analysis** to validate thresholds
3. ⏭️ **Create tasks.md** with detailed implementation checklist
4. ⏭️ **Implement core analysis functions** in `utils/templateAnalysis.ts`
5. ⏭️ **Generate first report** and review findings

### Success Metrics

- Report reveals at least 1-2 actionable improvements per template
- Coverage scores help prioritize template refinements
- A/B variations score >80% complementarity (showing good design)
- Zero critical gaps (all relevant muscles >50% engagement)

---

## Notes

This feature aligns with FitForge's core philosophy:
- **Data-driven** - Use objective muscle engagement data
- **Intelligence over tracking** - Analyze patterns to improve training
- **Personal calibration** - Validate that templates serve user needs

The analysis will provide concrete evidence of template quality and guide future optimizations. This is **science-backed validation** of our training recommendations.

**Key Insight from Brainstorming:**
> "Templates exist but system doesn't track which variation was used last" - FIXED in Smart Workout Continuation
> "No analysis of whether they're actually optimal" - THIS PROPOSAL addresses that gap

This is a **low-risk, high-value** feature that requires no new database schema or UI changes - pure analysis and reporting.
