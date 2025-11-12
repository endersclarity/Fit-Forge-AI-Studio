// Script to split "Deltoids" into AnteriorDeltoids and PosteriorDeltoids
// Based on exercise category

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load exercises database
const exercisesPath = path.join(__dirname, '../exercises.json');
const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

// Backup original
fs.writeFileSync(
  path.join(__dirname, '../exercises-backup.json'),
  JSON.stringify(exercisesData, null, 2)
);

console.log('Created backup: exercises-backup.json\n');

// Fix TRX Reverse Flys category first
const reverseFlysExercise = exercisesData.exercises.find(ex => ex.id === 'ex29');
if (reverseFlysExercise) {
  console.log(`Fixing TRX Reverse Flys category: ${reverseFlysExercise.category} → pull`);
  reverseFlysExercise.category = 'pull';
}

// Process each exercise
exercisesData.exercises.forEach(exercise => {
  const { id, name, category, muscles } = exercise;

  // Check if this exercise has "Deltoids"
  const deltoidMuscle = muscles.find(m => m.muscle === 'Deltoids');

  if (deltoidMuscle) {
    // Determine new muscle name based on category
    let newMuscleName;

    if (category === 'push' || category === 'core') {
      newMuscleName = 'AnteriorDeltoids';
    } else if (category === 'pull') {
      newMuscleName = 'PosteriorDeltoids';
    } else {
      console.warn(`⚠️  Unknown category "${category}" for ${name} (${id})`);
      return;
    }

    // Update the muscle name
    deltoidMuscle.muscle = newMuscleName;

    console.log(`✓ ${id}: ${name} [${category}] → ${newMuscleName} (${deltoidMuscle.percentage}%)`);
  }
});

// Save updated exercises
fs.writeFileSync(
  exercisesPath,
  JSON.stringify(exercisesData, null, 2)
);

console.log('\n✅ Updated exercises.json with split deltoids!');
console.log('Backup saved as exercises-backup.json');
