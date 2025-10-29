/**
 * Analyze Muscle Recuperation Responsibilities
 *
 * Categorizes each muscle's role in each exercise as:
 * - MAJOR (>50% engagement): Primary mover, high recuperation demand
 * - MODERATE (30-50% engagement): Significant contributor, moderate recuperation
 * - MINOR (<30% engagement): Stabilizer/assistant, low recuperation demand
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MuscleEngagement {
  muscle: string;
  percentage: number;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string | string[];
  difficulty: string;
  muscleEngagements: MuscleEngagement[];
  variation: string;
}

// Read and parse constants.ts to extract EXERCISE_LIBRARY
const constantsPath = path.join(__dirname, '..', 'constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

// Extract the EXERCISE_LIBRARY array
const libraryMatch = constantsContent.match(/export const EXERCISE_LIBRARY: Exercise\[\] = \[([\s\S]*?)\];/);
if (!libraryMatch) {
  console.error('Could not find EXERCISE_LIBRARY in constants.ts');
  process.exit(1);
}

// Parse exercises using regex
const exerciseRegex = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*equipment:\s*(\[[^\]]+\]|"[^"]+"),\s*difficulty:\s*"([^"]+)",\s*muscleEngagements:\s*\[([\s\S]*?)\],\s*variation:\s*"([^"]+)"\s*}/g;

const exercises: Exercise[] = [];
let match;

while ((match = exerciseRegex.exec(libraryMatch[1])) !== null) {
  const [, id, name, category, equipment, difficulty, engagementsStr, variation] = match;

  // Parse muscle engagements
  const engagementRegex = /{\s*muscle:\s*Muscle\.(\w+),\s*percentage:\s*(\d+)\s*}/g;
  const muscleEngagements: MuscleEngagement[] = [];
  let engMatch;

  while ((engMatch = engagementRegex.exec(engagementsStr)) !== null) {
    muscleEngagements.push({
      muscle: engMatch[1],
      percentage: parseInt(engMatch[2])
    });
  }

  exercises.push({
    id,
    name,
    category,
    equipment: equipment.replace(/"/g, ''),
    difficulty,
    muscleEngagements,
    variation
  });
}

console.log(`📊 Analyzed ${exercises.length} exercises from library\n`);

// Categorize muscle responsibilities
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

const analyses: ExerciseAnalysis[] = exercises.map(ex => ({
  exercise: ex.name,
  category: ex.category,
  responsibilities: ex.muscleEngagements.map(eng => ({
    muscle: eng.muscle,
    level: categorizeMuscleRole(eng.percentage),
    percentage: eng.percentage
  })).sort((a, b) => b.percentage - a.percentage) // Sort by percentage descending
}));

// Generate report
console.log('=' .repeat(80));
console.log('MUSCLE RECUPERATION RESPONSIBILITIES BY EXERCISE');
console.log('=' .repeat(80));
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

console.log('\nMuscles with highest exercise load:');
sortedMuscles.forEach(([muscle, count]) => {
  console.log(`  ${muscle}: ${count} exercises as MAJOR mover`);
});

console.log('\n✨ Analysis complete!');
