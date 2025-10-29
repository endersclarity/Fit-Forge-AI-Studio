/**
 * Compare Personal Records with Exercise Library
 *
 * Shows which exercises from the app's library are not in your personal records
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PersonalRecordExercise {
  exercise: string;
  category: string;
  protocol: string;
  totalVolume: number | null;
  volumeUnit: string;
  muscles: string[];
  notes: string;
  adaptation: string;
}

interface PersonalRecordsData {
  version: string;
  lastUpdated: string;
  muscleBaselines: PersonalRecordExercise[];
  sessionSummary: any;
}

interface AppExercise {
  id: string;
  name: string;
  category: string;
  equipment: string | string[];
  difficulty: string;
  muscleEngagements: Array<{
    muscle: string;
    percentage: number;
  }>;
  variation: string;
}

// Read personal records
const recordsPath = path.join(__dirname, '..', 'personal-records.json');
const recordsData: PersonalRecordsData = JSON.parse(
  fs.readFileSync(recordsPath, 'utf-8')
);

// Read exercise library from constants.ts
const constantsPath = path.join(__dirname, '..', 'constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

// Extract exercise names from EXERCISE_LIBRARY
const exerciseNameRegex = /name:\s*"([^"]+)"/g;
const appExerciseNames: string[] = [];
let match;

while ((match = exerciseNameRegex.exec(constantsContent)) !== null) {
  appExerciseNames.push(match[1]);
}

// Get personal record exercise names
const prExerciseNames = new Set(
  recordsData.muscleBaselines.map(ex => ex.exercise.toLowerCase().trim())
);

console.log('🔍 Exercise Comparison Report\n');
console.log(`📊 App Exercise Library: ${appExerciseNames.length} exercises`);
console.log(`📝 Personal Records: ${recordsData.muscleBaselines.length} exercises\n`);

// Find exercises in app but not in personal records
const missingFromPR: string[] = [];

for (const appExercise of appExerciseNames) {
  const normalized = appExercise.toLowerCase().trim();

  // Check for exact match or similar match
  let found = false;
  for (const prName of prExerciseNames) {
    if (prName === normalized ||
        prName.includes(normalized) ||
        normalized.includes(prName)) {
      found = true;
      break;
    }
  }

  if (!found) {
    missingFromPR.push(appExercise);
  }
}

// Categorize missing exercises
const categorized: Record<string, string[]> = {
  Push: [],
  Pull: [],
  Legs: [],
  Core: []
};

// Re-parse to get categories
const categoryRegex = /{\s*id:\s*"[^"]+",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)"/gs;
let categoryMatch;

while ((categoryMatch = categoryRegex.exec(constantsContent)) !== null) {
  const name = categoryMatch[1];
  const category = categoryMatch[2];

  if (missingFromPR.includes(name)) {
    if (categorized[category]) {
      categorized[category].push(name);
    }
  }
}

console.log('❌ Exercises in App Library but NOT in your Personal Records:\n');

let totalMissing = 0;
for (const [category, exercises] of Object.entries(categorized)) {
  if (exercises.length > 0) {
    console.log(`\n${category.toUpperCase()}:`);
    exercises.sort().forEach(ex => {
      console.log(`  - ${ex}`);
    });
    totalMissing += exercises.length;
  }
}

console.log(`\n📈 Total Missing: ${totalMissing} exercises`);

// Find exercises in personal records that might not be in app
console.log('\n\n🔄 Exercises in Personal Records that might need adding to app:\n');

const appExercisesLower = new Set(appExerciseNames.map(n => n.toLowerCase().trim()));
const prOnlyExercises: string[] = [];

for (const prEx of recordsData.muscleBaselines) {
  const normalized = prEx.exercise.toLowerCase().trim();

  let found = false;
  for (const appName of appExercisesLower) {
    if (appName === normalized ||
        appName.includes(normalized) ||
        normalized.includes(appName)) {
      found = true;
      break;
    }
  }

  if (!found) {
    prOnlyExercises.push(prEx.exercise);
  }
}

if (prOnlyExercises.length > 0) {
  prOnlyExercises.forEach(ex => {
    console.log(`  - ${ex}`);
  });
} else {
  console.log('  ✅ All your personal record exercises are in the app library!');
}

console.log('\n✨ Comparison complete!');
