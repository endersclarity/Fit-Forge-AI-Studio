import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { EXERCISE_LIBRARY } from '../constants.js';
import { WorkoutTemplate, ExerciseCategory } from '../types.js';
import {
  analyzeTemplate,
  compareVariations,
  generateRecommendations,
  TemplateAnalysis,
  VariationComparison
} from '../utils/templateAnalysis.js';

// ESM dirname/filename helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for better-sqlite3 (CJS module)
let Database: any;
let db: any;

async function initDatabase() {
  const betterSqlite3 = await import('better-sqlite3');
  Database = betterSqlite3.default;

  const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/fitforge.db');
  db = new Database(DB_PATH);
  console.log(`Connected to database at: ${DB_PATH}`);
}

interface WorkoutTemplateRow {
  id: number;
  user_id: number;
  name: string;
  category: string;
  variation: string;
  exercise_ids: string;
  is_favorite: number;
  times_used: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// DATA LOADING
// ============================================

function loadTemplates(): WorkoutTemplate[] {
  const templates = db.prepare(`
    SELECT * FROM workout_templates
    WHERE user_id = 1
    ORDER BY category, variation
  `).all() as WorkoutTemplateRow[];

  return templates.map(t => ({
    id: t.id.toString(),
    name: t.name,
    category: t.category as ExerciseCategory,
    variation: t.variation as 'A' | 'B',
    exerciseIds: JSON.parse(t.exercise_ids) as string[],
    isFavorite: Boolean(t.is_favorite),
    timesUsed: t.times_used,
    createdAt: new Date(t.created_at).getTime(),
    updatedAt: new Date(t.updated_at).getTime()
  }));
}

// ============================================
// ANALYSIS ORCHESTRATION
// ============================================

interface TemplateWithAnalysis {
  template: WorkoutTemplate;
  analysis: TemplateAnalysis;
  recommendations: string[];
}

interface CategoryComparison {
  category: ExerciseCategory;
  templateA: WorkoutTemplate;
  templateB: WorkoutTemplate;
  comparison: VariationComparison;
}

function analyzeAllTemplates(): {
  analyses: TemplateWithAnalysis[];
  comparisons: CategoryComparison[];
} {
  const templates = loadTemplates();

  if (templates.length === 0) {
    console.warn('No templates found in database');
    return { analyses: [], comparisons: [] };
  }

  console.log(`Loaded ${templates.length} templates from database`);

  // Analyze each template individually
  const analyses: TemplateWithAnalysis[] = templates.map(template => {
    const analysis = analyzeTemplate(template, EXERCISE_LIBRARY);
    const recommendations = generateRecommendations(template, analysis, EXERCISE_LIBRARY);

    return {
      template,
      analysis,
      recommendations
    };
  });

  // Compare A vs B variations for each category
  const comparisons: CategoryComparison[] = [];
  const categories: ExerciseCategory[] = ['Push', 'Pull', 'Legs', 'Core'];

  for (const category of categories) {
    const templateA = templates.find(t => t.category === category && t.variation === 'A');
    const templateB = templates.find(t => t.category === category && t.variation === 'B');

    if (templateA && templateB) {
      const comparison = compareVariations(templateA, templateB, EXERCISE_LIBRARY);
      comparisons.push({
        category,
        templateA,
        templateB,
        comparison
      });
    }
  }

  return { analyses, comparisons };
}

// ============================================
// MARKDOWN REPORT GENERATION
// ============================================

function generateMarkdownReport(
  analyses: TemplateWithAnalysis[],
  comparisons: CategoryComparison[]
): string {
  const now = new Date().toISOString().split('T')[0];
  let report = '';

  // Header
  report += `# Workout Template Analysis Report\n\n`;
  report += `**Generated:** ${now}\n`;
  report += `**Templates Analyzed:** ${analyses.length}\n\n`;
  report += `---\n\n`;

  // Summary statistics
  const avgCoverage = Math.round(
    analyses.reduce((sum, a) => sum + a.analysis.coverage, 0) / analyses.length
  );
  const avgBalance = Math.round(
    analyses.reduce((sum, a) => sum + a.analysis.balance, 0) / analyses.length
  );
  const avgComplementarity = comparisons.length > 0
    ? Math.round(
        comparisons.reduce((sum, c) => sum + c.comparison.complementarity, 0) / comparisons.length
      )
    : 0;

  report += `## Executive Summary\n\n`;
  report += `- **Average Coverage Score:** ${avgCoverage}%\n`;
  report += `- **Average Balance Score:** ${avgBalance}%\n`;
  report += `- **Average A/B Complementarity:** ${avgComplementarity}%\n\n`;
  report += `---\n\n`;

  // Individual template analyses
  report += `## Template Analysis\n\n`;

  for (const { template, analysis, recommendations } of analyses) {
    report += `### ${template.name}\n\n`;
    report += `**Category:** ${template.category} | **Variation:** ${template.variation}\n\n`;

    // Muscle engagement totals
    report += `**Muscle Engagement Totals:**\n\n`;
    const sortedMuscles = Object.entries(analysis.muscleEngagements)
      .sort(([, a], [, b]) => b - a);

    for (const [muscle, engagement] of sortedMuscles) {
      const status = engagement >= 100 ? '✅' : '⚠️';
      report += `- ${muscle}: ${Math.round(engagement)}% ${status}\n`;
    }

    // Scores
    report += `\n**Scores:**\n\n`;
    report += `- **Coverage:** ${analysis.coverage}% `;
    report += analysis.coverage >= 75 ? '✅ Good' : analysis.coverage >= 50 ? '⚠️ Fair' : '❌ Needs Improvement';
    report += `\n`;
    report += `- **Balance:** ${analysis.balance}% `;
    report += analysis.balance >= 80 ? '✅ Well-balanced' : analysis.balance >= 60 ? '⚠️ Moderate' : '❌ Imbalanced';
    report += `\n\n`;

    // Recommendations
    if (recommendations.length > 0) {
      report += `**Recommendations:**\n\n`;
      for (const rec of recommendations) {
        report += `- ⚠️ ${rec}\n`;
      }
      report += `\n`;
    } else {
      report += `**Recommendations:** None - template is well-designed! ✅\n\n`;
    }

    report += `---\n\n`;
  }

  // A vs B comparisons
  if (comparisons.length > 0) {
    report += `## A/B Variation Comparisons\n\n`;

    for (const { category, templateA, templateB, comparison } of comparisons) {
      report += `### ${category} A vs ${category} B\n\n`;
      report += `**Complementarity Score:** ${comparison.complementarity}% `;
      report += comparison.complementarity >= 80 ? '✅ Excellent' : comparison.complementarity >= 60 ? '✅ Good' : comparison.complementarity >= 40 ? '⚠️ Moderate' : '❌ Low';
      report += `\n\n`;
      report += `**Assessment:** ${comparison.summary}\n\n`;

      // Muscle differences
      report += `**Muscle Engagement Differences:**\n\n`;
      const analysisA = analyzeTemplate(templateA, EXERCISE_LIBRARY);
      const analysisB = analyzeTemplate(templateB, EXERCISE_LIBRARY);

      const allMuscles = new Set([
        ...Object.keys(analysisA.muscleEngagements),
        ...Object.keys(analysisB.muscleEngagements)
      ]);

      for (const muscle of allMuscles) {
        const engagementA = Math.round(analysisA.muscleEngagements[muscle as any] || 0);
        const engagementB = Math.round(analysisB.muscleEngagements[muscle as any] || 0);
        const diff = Math.abs(engagementA - engagementB);
        const diffStatus = diff >= 50 ? '✅ Good variety' : diff >= 20 ? '⚠️ Some variety' : '❌ Very similar';

        report += `- **${muscle}:** A (${engagementA}%) vs B (${engagementB}%) = ${diff}% difference ${diffStatus}\n`;
      }

      report += `\n---\n\n`;
    }
  }

  // Best and worst performers
  report += `## Summary\n\n`;

  const bestCoverage = analyses.reduce((best, curr) =>
    curr.analysis.coverage > best.analysis.coverage ? curr : best
  );
  const worstCoverage = analyses.reduce((worst, curr) =>
    curr.analysis.coverage < worst.analysis.coverage ? curr : worst
  );

  report += `**Best Coverage:** ${bestCoverage.template.name} (${bestCoverage.analysis.coverage}%)\n\n`;
  report += `**Needs Improvement:** ${worstCoverage.template.name} (${worstCoverage.analysis.coverage}%)\n\n`;

  if (comparisons.length > 0) {
    const bestPair = comparisons.reduce((best, curr) =>
      curr.comparison.complementarity > best.comparison.complementarity ? curr : best
    );
    report += `**Best A/B Pair:** ${bestPair.category} (${bestPair.comparison.complementarity}% complementarity)\n\n`;
  }

  return report;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🔍 Starting template analysis...\n');

  try {
    // Initialize database connection
    await initDatabase();

    // Run analysis
    const { analyses, comparisons } = analyzeAllTemplates();

    if (analyses.length === 0) {
      console.log('❌ No templates found to analyze');
      process.exit(1);
    }

    // Generate report
    const report = generateMarkdownReport(analyses, comparisons);

    // Write to file
    const reportPath = path.join(__dirname, '../docs/template-analysis-report.md');
    fs.writeFileSync(reportPath, report, 'utf8');

    console.log('✅ Analysis complete!');
    console.log(`📄 Report saved to: docs/template-analysis-report.md`);
    console.log(`📊 Analyzed ${analyses.length} templates`);
    console.log(`🔄 Compared ${comparisons.length} A/B pairs\n`);

    // Print summary to console
    const avgCoverage = Math.round(
      analyses.reduce((sum, a) => sum + a.analysis.coverage, 0) / analyses.length
    );
    const avgBalance = Math.round(
      analyses.reduce((sum, a) => sum + a.analysis.balance, 0) / analyses.length
    );

    console.log('Summary:');
    console.log(`  Average Coverage: ${avgCoverage}%`);
    console.log(`  Average Balance: ${avgBalance}%`);

    db.close();
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    if (db) db.close();
    process.exit(1);
  }
}

// Run the script
main();
