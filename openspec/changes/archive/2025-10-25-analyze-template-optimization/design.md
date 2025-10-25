# Design: Analyze Template Optimization

**Change ID:** `analyze-template-optimization`
**Status:** Proposed
**Created:** 2025-10-25

---

## Overview

This change adds a **command-line analysis tool** that evaluates workout template quality by analyzing muscle engagement patterns, identifying coverage gaps, and providing optimization recommendations.

**Key Principle:** This is a **developer/power-user tool**, not a UI feature. It generates a markdown report for manual review and template refinement.

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│              scripts/analyze-templates.ts                │
│                  (CLI Entry Point)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ├─> Database: Load templates
                       ├─> Constants: Load EXERCISE_LIBRARY
                       │
                       v
┌─────────────────────────────────────────────────────────┐
│           utils/templateAnalysis.ts                      │
│              (Analysis Engine)                           │
│                                                          │
│  - analyzeTemplate()         → muscle totals            │
│  - scoreTemplateCoverage()   → coverage %               │
│  - scoreTemplateBalance()    → balance %                │
│  - compareVariations()       → A vs B analysis          │
│  - generateRecommendations() → action items             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────────────┐
│         docs/template-analysis-report.md                 │
│           (Generated Output)                             │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Script Execution
   npm run analyze-templates

2. Load Data
   Templates ← database.getWorkoutTemplates()
   Exercises ← EXERCISE_LIBRARY (constants.ts)

3. Analyze Each Template
   For each template:
     - Map exercise IDs to Exercise objects
     - Sum muscle engagement percentages
     - Calculate coverage score
     - Calculate balance score
     - Identify gaps (<100%) and overlaps (>300%)

4. Compare A/B Variations
   For each category (Push/Pull/Legs/Core):
     - Analyze template A
     - Analyze template B
     - Calculate complementarity score
     - Identify engagement differences

5. Generate Recommendations
   For each template:
     - Suggest exercises to fill gaps
     - Warn about potential overtraining
     - Highlight A/B complementarity

6. Write Report
   Generate markdown with:
     - Header (date, summary)
     - Per-template sections
     - A/B comparison sections
     - Recommendations
   → Write to docs/template-analysis-report.md
```

---

## Analysis Algorithms

### 1. Muscle Engagement Calculation

**Purpose:** Sum total muscle engagement across all exercises in a template

**Algorithm:**
```typescript
function analyzeTemplate(
  template: WorkoutTemplate,
  exercises: Exercise[]
): Record<Muscle, number> {
  const muscleEngagements: Record<Muscle, number> = {};

  for (const exerciseId of template.exerciseIds) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      console.warn(`Exercise ${exerciseId} not found`);
      continue;
    }

    for (const { muscle, percentage } of exercise.muscleEngagements) {
      muscleEngagements[muscle] =
        (muscleEngagements[muscle] || 0) + percentage;
    }
  }

  return muscleEngagements;
}
```

**Example:**
```
Template: Push A
Exercises:
  - Dumbbell Bench Press: Pectoralis 85%, Triceps 35%, Deltoids 35%
  - Push-up: Pectoralis 70%, Triceps 50%, Deltoids 40%, Core 20%
  - Dumbbell Shoulder Press: Deltoids 80%, Triceps 40%, Trapezius 20%
  - Tricep Extension: Triceps 95%

Total Engagement:
  Pectoralis: 155%
  Triceps: 220%
  Deltoids: 155%
  Core: 20%
  Trapezius: 20%
```

---

### 2. Coverage Scoring

**Purpose:** Measure how well a template targets all relevant muscles for its category

**Relevant Muscles by Category:**
- **Push:** Pectoralis, Triceps, Deltoids, Core
- **Pull:** Lats, Biceps, Rhomboids, Trapezius, Forearms
- **Legs:** Quadriceps, Glutes, Hamstrings, Calves, Core
- **Core:** Core (primary focus)

**Algorithm:**
```typescript
const CATEGORY_MUSCLES = {
  Push: [Muscle.Pectoralis, Muscle.Triceps, Muscle.Deltoids, Muscle.Core],
  Pull: [Muscle.Lats, Muscle.Biceps, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Glutes, Muscle.Hamstrings, Muscle.Calves, Muscle.Core],
  Core: [Muscle.Core]
};

function scoreTemplateCoverage(
  muscleEngagements: Record<Muscle, number>,
  category: ExerciseCategory
): number {
  const relevantMuscles = CATEGORY_MUSCLES[category];
  const minEngagement = 100; // Minimum 100% per muscle

  let adequatelyCovered = 0;
  for (const muscle of relevantMuscles) {
    if ((muscleEngagements[muscle] || 0) >= minEngagement) {
      adequatelyCovered++;
    }
  }

  return (adequatelyCovered / relevantMuscles.length) * 100;
}
```

**Example:**
```
Push A: Pectoralis 155%, Triceps 220%, Deltoids 155%, Core 20%
  → 3/4 muscles meet 100% threshold
  → Coverage Score: 75%
```

---

### 3. Balance Scoring

**Purpose:** Measure how evenly distributed muscle engagement is (avoid overemphasis)

**Algorithm:**
```typescript
function scoreTemplateBalance(
  muscleEngagements: Record<Muscle, number>
): number {
  const values = Object.values(muscleEngagements);
  if (values.length === 0) return 0;

  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate standard deviation
  const variance = values.reduce(
    (sum, val) => sum + Math.pow(val - mean, 2),
    0
  ) / values.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower stdDev = higher balance)
  const maxStdDev = 100; // Threshold for "completely imbalanced"
  const balanceScore = Math.max(0, 100 - (stdDev / maxStdDev * 100));

  return Math.round(balanceScore);
}
```

**Example:**
```
Push A: Pectoralis 155%, Triceps 220%, Deltoids 155%, Core 20%, Trapezius 20%
  → Mean: 114%
  → StdDev: 81.5
  → Balance Score: 18.5% (low balance - wide variance)
```

---

### 4. Variation Comparison

**Purpose:** Measure how well A/B variations complement each other (prevent adaptation)

**Algorithm:**
```typescript
function compareVariations(
  templateA: WorkoutTemplate,
  templateB: WorkoutTemplate,
  exercises: Exercise[]
): {
  complementarity: number;
  differences: Record<Muscle, number>;
} {
  const engagementsA = analyzeTemplate(templateA, exercises);
  const engagementsB = analyzeTemplate(templateB, exercises);

  // Get all muscles engaged by either template
  const allMuscles = new Set([
    ...Object.keys(engagementsA),
    ...Object.keys(engagementsB)
  ]);

  // Calculate absolute differences
  const differences: Record<Muscle, number> = {};
  let totalDiff = 0;

  for (const muscle of allMuscles) {
    const diff = Math.abs(
      (engagementsA[muscle] || 0) - (engagementsB[muscle] || 0)
    );
    differences[muscle] = diff;
    totalDiff += diff;
  }

  // Higher differences = better variation (prevents adaptation)
  // Normalize to 0-100 scale
  const avgDiff = totalDiff / allMuscles.size;
  const avgEngagement = (
    Object.values(engagementsA).reduce((a, b) => a + b, 0) +
    Object.values(engagementsB).reduce((a, b) => a + b, 0)
  ) / (Object.keys(engagementsA).length + Object.keys(engagementsB).length);

  const complementarity = Math.min(100, (avgDiff / avgEngagement) * 100);

  return { complementarity: Math.round(complementarity), differences };
}
```

**Example:**
```
Push A: Pectoralis 155%, Deltoids 155%
Push B: Pectoralis 210%, Deltoids 240%

Differences:
  Pectoralis: 55%
  Deltoids: 85%

Complementarity: 35% (average difference relative to average engagement)
```

---

## Recommendation Generation

### Gap Recommendations

**Threshold:** <100% engagement for relevant muscle

**Logic:**
```typescript
function generateGapRecommendations(
  muscleEngagements: Record<Muscle, number>,
  category: ExerciseCategory,
  exercises: Exercise[]
): string[] {
  const recommendations: string[] = [];
  const relevantMuscles = CATEGORY_MUSCLES[category];

  for (const muscle of relevantMuscles) {
    const engagement = muscleEngagements[muscle] || 0;
    if (engagement < 100) {
      // Find exercises that heavily engage this muscle
      const suggestions = exercises
        .filter(ex =>
          ex.category === category &&
          ex.muscleEngagements.some(
            me => me.muscle === muscle && me.percentage >= 70
          )
        )
        .slice(0, 2); // Top 2 suggestions

      const exerciseNames = suggestions.map(ex => ex.name).join(' or ');
      recommendations.push(
        `⚠️  ${muscle} under-targeted (${engagement}%). Consider adding: ${exerciseNames}`
      );
    }
  }

  return recommendations;
}
```

### Overlap Warnings

**Threshold:** >300% engagement for any muscle

**Logic:**
```typescript
function generateOverlapWarnings(
  muscleEngagements: Record<Muscle, number>
): string[] {
  const warnings: string[] = [];

  for (const [muscle, engagement] of Object.entries(muscleEngagements)) {
    if (engagement > 300) {
      warnings.push(
        `⚠️  ${muscle} over-targeted (${engagement}%). Risk of overtraining - consider reducing volume.`
      );
    }
  }

  return warnings;
}
```

---

## Report Format

### Structure

```markdown
# Workout Template Analysis Report

**Generated:** 2025-10-25 10:30:00
**Templates Analyzed:** 8

---

## Push A - Analysis

**Muscle Engagement Totals:**
- Pectoralis: 155% ✅
- Triceps: 220% ✅
- Deltoids: 155% ✅
- Core: 20% ⚠️
- Trapezius: 20%

**Scores:**
- Coverage: 75% (3/4 relevant muscles)
- Balance: 18% (high variance)

**Recommendations:**
- ⚠️ Core under-targeted (20%). Consider adding: Plank or Hanging Leg Raise

---

## Push A vs Push B - Variation Quality

**Complementarity Score:** 35%

**Differences:**
- Pectoralis: A (155%) vs B (210%) = 55% difference
- Deltoids: A (155%) vs B (240%) = 85% difference ✅ Good variety!

**Assessment:** Moderate complementarity. Push B emphasizes shoulders more.

---

## Summary

**Best Templates:** Pull A (Coverage 100%, Balance 85%)
**Needs Improvement:** Core A (Coverage 50%)
**Best A/B Pair:** Legs A/B (Complementarity 88%)
```

---

## Technical Considerations

### Performance

- **8 templates × 4 exercises avg = 32 lookups:** Instant (<10ms)
- **No database writes:** Read-only analysis
- **Lightweight calculations:** Simple arithmetic, no complex algorithms

### Error Handling

- **Missing exercise IDs:** Warn and skip, continue analysis
- **Empty templates:** Return empty analysis, warn user
- **Invalid category:** Default to generic muscle list

### Extensibility

Future enhancements can add:
- **JSON output format** (`--json` flag)
- **Analyze user-created templates** (`--all` flag)
- **Historical comparison** (track improvements over time)
- **Auto-fix suggestions** (generate optimized template JSON)

---

## Security & Privacy

- **No network calls:** Pure offline analysis
- **No user data exposed:** Templates are local-only
- **No file system writes outside docs/:** Sandboxed to project directory

---

## Testing Strategy

### Unit Tests

```typescript
describe('analyzeTemplate', () => {
  it('should sum muscle engagements correctly', () => {
    const template = { exerciseIds: ['ex02', 'ex03'] };
    const result = analyzeTemplate(template, EXERCISE_LIBRARY);
    expect(result.Pectoralis).toBe(155); // 85 + 70
  });
});

describe('scoreTemplateCoverage', () => {
  it('should return 100% when all muscles meet threshold', () => {
    const engagements = {
      Pectoralis: 150,
      Triceps: 200,
      Deltoids: 180,
      Core: 100
    };
    expect(scoreTemplateCoverage(engagements, 'Push')).toBe(100);
  });

  it('should return 75% when 3/4 muscles meet threshold', () => {
    const engagements = {
      Pectoralis: 150,
      Triceps: 200,
      Deltoids: 180,
      Core: 50 // Below 100%
    };
    expect(scoreTemplateCoverage(engagements, 'Push')).toBe(75);
  });
});
```

### Integration Tests

- Run analysis on actual database templates
- Verify report file is created
- Validate markdown formatting
- Check recommendations are actionable

---

## Open Questions

1. **Should analysis account for exercise order?**
   - **Decision:** V1 = No, V2 = Yes (fatigue compounds)

2. **What if template has duplicate exercises?**
   - **Decision:** Count each instance separately (double engagement)

3. **Should we analyze historical performance data?**
   - **Decision:** Out of scope for V1, belongs in Analytics Dashboard

---

## Summary

This design provides a **simple, effective analysis tool** that:
- ✅ Uses existing data (no schema changes)
- ✅ Generates human-readable reports
- ✅ Provides actionable insights
- ✅ Runs offline and fast
- ✅ Extensible for future enhancements

The analysis will validate our template design and guide optimization efforts with **data-driven evidence**.
