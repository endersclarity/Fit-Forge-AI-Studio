/**
 * Analyze Muscle Recuperation Responsibilities
 *
 * Categorizes each muscle's role in each exercise as:
 * - MAJOR (>50% engagement): Primary mover, high recuperation demand
 * - MODERATE (30-50% engagement): Significant contributor, moderate recuperation
 * - MINOR (<30% engagement): Stabilizer/assistant, low recuperation demand
 */

import { EXERCISE_LIBRARY } from '../constants.js';
import { Muscle } from '../types.js';

type ResponsibilityLevel = 'MAJOR' | 'MODERATE' | 'MINOR';

interface MuscleResponsibility {
  muscle: string;
  level: ResponsibilityLevel;
  percentage: number;
}

interface ExerciseAnalysis {
  exercise: string;
  category: string;
  responsibilities: MuscleResponsibility[];
}

function categorizeMuscleRole(percentage: number): ResponsibilityLevel {
  if (percentage >= 50) return 'MAJOR';
  if (percentage >= 30) return 'MODERATE';
  return 'MINOR';
}

console.log(`📊 Analyzed ${EXERCISE_LIBRARY.length} exercises from library\n`);

const analyses: ExerciseAnalysis[] = EXERCISE_LIBRARY.map(ex => ({
  exercise: ex.name,
  category: ex.category,
  responsibilities: ex.muscleEngagements.map(eng => ({
    muscle: eng.muscle,
    level: categorizeMuscleRole(eng.percentage),
    percentage: eng.percentage
  })).sort((a, b) => b.percentage - a.percentage)
}));

// Generate report
console.log('='.repeat(80));
console.log('MUSCLE RECUPERATION RESPONSIBILITIES BY EXERCISE');
console.log('='.repeat(80));
console.log('\nLegend:');
console.log('  🔴 MAJOR (≥50%): Primary mover, HIGH recuperation demand');
console.log('  🟡 MODERATE (30-49%): Significant contributor, MODERATE recuperation');
console.log('  🟢 MINOR (<30%): Stabilizer/assistant, LOW recuperation demand\n');

// Group by category
const byCategory: Record<string, ExerciseAnalysis[]> = {};
for (const analysis of analyses) {
  if (!byCategory[analysis.category]) {
    byCategory[analysis.category] = [];
  }
  byCategory[analysis.category].push(analysis);
}

for (const [category, categoryExercises] of Object.entries(byCategory)) {
  console.log('\n' + '='.repeat(80));
  console.log(`${category.toUpperCase()} EXERCISES`);
  console.log('='.repeat(80));

  for (const analysis of categoryExercises) {
    console.log(`\n📋 ${analysis.exercise}`);

    const major = analysis.responsibilities.filter(r => r.level === 'MAJOR');
    const moderate = analysis.responsibilities.filter(r => r.level === 'MODERATE');
    const minor = analysis.responsibilities.filter(r => r.level === 'MINOR');

    if (major.length > 0) {
      console.log('  🔴 MAJOR:');
      major.forEach(r => console.log(`     • ${r.muscle}: ${r.percentage}%`));
    }

    if (moderate.length > 0) {
      console.log('  🟡 MODERATE:');
      moderate.forEach(r => console.log(`     • ${r.muscle}: ${r.percentage}%`));
    }

    if (minor.length > 0) {
      console.log('  🟢 MINOR:');
      minor.forEach(r => console.log(`     • ${r.muscle}: ${r.percentage}%`));
    }
  }
}

// Generate muscle-centric view
console.log('\n\n' + '='.repeat(80));
console.log('MUSCLE-CENTRIC VIEW: Where Each Muscle Has MAJOR Responsibility');
console.log('='.repeat(80));

const muscleToMajorExercises: Record<string, string[]> = {};
for (const analysis of analyses) {
  for (const resp of analysis.responsibilities) {
    if (resp.level === 'MAJOR') {
      if (!muscleToMajorExercises[resp.muscle]) {
        muscleToMajorExercises[resp.muscle] = [];
      }
      muscleToMajorExercises[resp.muscle].push(`${analysis.exercise} (${resp.percentage}%)`);
    }
  }
}

for (const [muscle, exercises] of Object.entries(muscleToMajorExercises).sort()) {
  console.log(`\n💪 ${muscle.toUpperCase()}`);
  console.log(`   Serves as MAJOR mover in ${exercises.length} exercise(s):`);
  exercises.forEach(ex => console.log(`   • ${ex}`));
}

// Generate recuperation overlap analysis
console.log('\n\n' + '='.repeat(80));
console.log('RECUPERATION OVERLAP ANALYSIS');
console.log('='.repeat(80));
console.log('\nExercises that heavily tax the same major muscle groups:');

const muscleToExerciseCount: Record<string, number> = {};
for (const muscle of Object.keys(muscleToMajorExercises)) {
  muscleToExerciseCount[muscle] = muscleToMajorExercises[muscle].length;
}

const sortedMuscles = Object.entries(muscleToExerciseCount)
  .sort((a, b) => b[1] - a[1]);

console.log('\nMuscles with highest exercise load (as MAJOR mover):');
sortedMuscles.forEach(([muscle, count]) => {
  console.log(`  ${muscle}: ${count} exercises`);
});

console.log('\n✨ Analysis complete!');
