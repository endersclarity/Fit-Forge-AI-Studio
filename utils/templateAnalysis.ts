import { WorkoutTemplate, Exercise, Muscle, ExerciseCategory } from '../types';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface TemplateAnalysis {
  muscleEngagements: Record<Muscle, number>;
  coverage: number;       // 0-100%
  balance: number;        // 0-100%
  gaps: Muscle[];         // Under-targeted muscles
  overlaps: Muscle[];     // Over-targeted muscles
}

export interface VariationComparison {
  complementarity: number;  // 0-100%
  differences: Record<Muscle, number>;
  summary: string;
}

// ============================================
// CATEGORY MUSCLE MAPPING
// ============================================

const CATEGORY_MUSCLES: Record<ExerciseCategory, Muscle[]> = {
  Push: [Muscle.Pectoralis, Muscle.Triceps, Muscle.Deltoids, Muscle.Core],
  Pull: [Muscle.Lats, Muscle.Biceps, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Glutes, Muscle.Hamstrings, Muscle.Calves, Muscle.Core],
  Core: [Muscle.Core]
};

// ============================================
// CORE ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyze a workout template's muscle engagement patterns
 */
export function analyzeTemplate(
  template: WorkoutTemplate,
  exercises: Exercise[]
): TemplateAnalysis {
  const muscleEngagements: Record<Muscle, number> = {} as Record<Muscle, number>;

  // Sum muscle engagement percentages across all exercises in template
  for (const exerciseId of template.exerciseIds) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      console.warn(`Exercise ${exerciseId} not found in EXERCISE_LIBRARY`);
      continue;
    }

    for (const { muscle, percentage } of exercise.muscleEngagements) {
      muscleEngagements[muscle] = (muscleEngagements[muscle] || 0) + percentage;
    }
  }

  // Calculate coverage score
  const coverage = scoreTemplateCoverage(muscleEngagements, template.category);

  // Calculate balance score
  const balance = scoreTemplateBalance(muscleEngagements);

  // Identify gaps and overlaps
  const gaps = identifyGaps(muscleEngagements, template.category);
  const overlaps = identifyOverlaps(muscleEngagements);

  return {
    muscleEngagements,
    coverage,
    balance,
    gaps,
    overlaps
  };
}

/**
 * Score how well a template covers relevant muscles for its category
 */
export function scoreTemplateCoverage(
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

  return Math.round((adequatelyCovered / relevantMuscles.length) * 100);
}

/**
 * Score how balanced muscle engagement is (lower standard deviation = better)
 */
export function scoreTemplateBalance(
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

/**
 * Compare two template variations (A vs B)
 */
export function compareVariations(
  templateA: WorkoutTemplate,
  templateB: WorkoutTemplate,
  exercises: Exercise[]
): VariationComparison {
  const analysisA = analyzeTemplate(templateA, exercises);
  const analysisB = analyzeTemplate(templateB, exercises);

  const engagementsA = analysisA.muscleEngagements;
  const engagementsB = analysisB.muscleEngagements;

  // Get all muscles engaged by either template
  const allMuscles = new Set<Muscle>([
    ...Object.keys(engagementsA) as Muscle[],
    ...Object.keys(engagementsB) as Muscle[]
  ]);

  // Calculate absolute differences
  const differences: Record<Muscle, number> = {} as Record<Muscle, number>;
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

  const complementarity = Math.min(100, Math.round((avgDiff / avgEngagement) * 100));

  // Generate summary
  let summary: string;
  if (complementarity >= 80) {
    summary = 'Excellent variation - provides very different training stimuli';
  } else if (complementarity >= 60) {
    summary = 'Good variation - notable differences in muscle engagement';
  } else if (complementarity >= 40) {
    summary = 'Moderate variation - some differences but could be more distinct';
  } else {
    summary = 'Low variation - templates are very similar, consider diversifying';
  }

  return { complementarity, differences, summary };
}

/**
 * Generate recommendations for improving a template
 */
export function generateRecommendations(
  template: WorkoutTemplate,
  analysis: TemplateAnalysis,
  exercises: Exercise[]
): string[] {
  const recommendations: string[] = [];

  // Generate gap recommendations
  for (const muscle of analysis.gaps) {
    // Find exercises that heavily engage this muscle
    const suggestions = exercises
      .filter(ex =>
        ex.category === template.category &&
        ex.muscleEngagements.some(
          me => me.muscle === muscle && me.percentage >= 70
        )
      )
      .slice(0, 2); // Top 2 suggestions

    if (suggestions.length > 0) {
      const exerciseNames = suggestions.map(ex => ex.name).join(' or ');
      const currentEngagement = analysis.muscleEngagements[muscle] || 0;
      recommendations.push(
        `${muscle} under-targeted (${currentEngagement}%). Consider adding: ${exerciseNames}`
      );
    }
  }

  // Generate overlap warnings
  for (const muscle of analysis.overlaps) {
    const engagement = analysis.muscleEngagements[muscle];
    recommendations.push(
      `${muscle} over-targeted (${engagement}%). Risk of overtraining - consider reducing volume`
    );
  }

  // Coverage recommendations
  if (analysis.coverage < 75) {
    recommendations.push(
      `Low coverage score (${analysis.coverage}%). Template should target more relevant muscle groups`
    );
  }

  // Balance recommendations
  if (analysis.balance < 60) {
    recommendations.push(
      `Low balance score (${analysis.balance}%). Muscle engagement is unevenly distributed`
    );
  }

  return recommendations;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Identify muscles below minimum engagement threshold
 */
function identifyGaps(
  muscleEngagements: Record<Muscle, number>,
  category: ExerciseCategory,
  threshold: number = 100
): Muscle[] {
  const relevantMuscles = CATEGORY_MUSCLES[category];
  const gaps: Muscle[] = [];

  for (const muscle of relevantMuscles) {
    if ((muscleEngagements[muscle] || 0) < threshold) {
      gaps.push(muscle);
    }
  }

  return gaps;
}

/**
 * Identify muscles above maximum engagement threshold (overtraining risk)
 */
function identifyOverlaps(
  muscleEngagements: Record<Muscle, number>,
  threshold: number = 300
): Muscle[] {
  const overlaps: Muscle[] = [];

  for (const [muscle, engagement] of Object.entries(muscleEngagements)) {
    if (engagement > threshold) {
      overlaps.push(muscle as Muscle);
    }
  }

  return overlaps;
}
