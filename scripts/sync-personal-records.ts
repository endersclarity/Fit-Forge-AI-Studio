/**
 * Sync Personal Records to Database
 *
 * Reads personal-records.json and populates muscle_baselines table
 * with user's baseline capacity data.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Muscle name mapping from personal records to database enum
const MUSCLE_MAP: Record<string, string> = {
  'pectoralis major': 'Pectoralis',
  'upper pectorals': 'Pectoralis',
  'chest': 'Pectoralis',
  'anterior deltoid': 'Deltoids',
  'deltoids': 'Deltoids',
  'rear delts': 'Deltoids',
  'shoulders': 'Deltoids',
  'triceps brachii': 'Triceps',
  'triceps': 'Triceps',
  'latissimus dorsi': 'Lats',
  'lats': 'Lats',
  'rhomboids': 'Rhomboids',
  'posterior deltoid': 'Deltoids',
  'biceps': 'Biceps',
  'biceps brachii': 'Biceps',
  'brachialis': 'Biceps',
  'trapezius': 'Trapezius',
  'upper traps': 'Trapezius',
  'forearms': 'Forearms',
  'grip': 'Forearms',
  'quadriceps': 'Quadriceps',
  'quads': 'Quadriceps',
  'glutes': 'Glutes',
  'hamstrings': 'Hamstrings',
  'calves': 'Calves',
  'gastrocnemius': 'Calves',
  'soleus': 'Calves',
  'core': 'Core',
  'rectus abdominis': 'Core',
  'obliques': 'Core',
  'lower abs': 'Core',
  'hip flexors': 'Core',
  'core stabilizers': 'Core',
  'serratus anterior': 'Core',
  'spinal erectors': 'Core',
};

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
  sessionSummary: {
    totalLoadedVolume: number;
    volumeUnit: string;
    avgTempo: string;
    restIntervals: string;
    focus: string;
    coreLoad: string;
  };
}

function normalizeMuscle(muscleName: string): string {
  const normalized = muscleName.toLowerCase().trim();
  return MUSCLE_MAP[normalized] || null;
}

function calculateMuscleVolumes(exercises: PersonalRecordExercise[]): Map<string, number> {
  const muscleVolumes = new Map<string, number>();

  for (const exercise of exercises) {
    if (exercise.totalVolume === null) continue; // Skip bodyweight exercises without volume

    const volume = exercise.totalVolume;
    const muscleCount = exercise.muscles.length;

    // Distribute volume equally across all muscles
    // This is a simplification - in reality, primary movers get more volume
    const volumePerMuscle = volume / muscleCount;

    for (const muscleName of exercise.muscles) {
      const dbMuscle = normalizeMuscle(muscleName);
      if (dbMuscle) {
        const current = muscleVolumes.get(dbMuscle) || 0;
        muscleVolumes.set(dbMuscle, current + volumePerMuscle);
      }
    }
  }

  return muscleVolumes;
}

async function syncPersonalRecords() {
  console.log('🔄 Starting personal records sync...\n');

  // Read personal records
  const recordsPath = path.join(__dirname, '..', 'personal-records.json');
  const recordsData: PersonalRecordsData = JSON.parse(
    fs.readFileSync(recordsPath, 'utf-8')
  );

  console.log(`📖 Loaded ${recordsData.muscleBaselines.length} exercises from personal-records.json`);
  console.log(`📅 Last updated: ${recordsData.lastUpdated}\n`);

  // Calculate muscle volumes
  const muscleVolumes = calculateMuscleVolumes(recordsData.muscleBaselines);

  console.log('💪 Calculated muscle baseline volumes:');
  for (const [muscle, volume] of muscleVolumes.entries()) {
    console.log(`   ${muscle}: ${Math.round(volume).toLocaleString()} lb`);
  }
  console.log('');

  // Connect to database
  const dbPath = path.join(__dirname, '..', 'data', 'fitforge.db');
  const db = new Database(dbPath);
  console.log(`📂 Database path: ${dbPath}\n`);

  try {
    // Get user ID (should be 1 for local single-user setup)
    const user = db.prepare('SELECT id FROM users LIMIT 1').get() as { id: number } | undefined;

    if (!user) {
      console.error('❌ No user found in database. Please complete onboarding first.');
      process.exit(1);
    }

    const userId = user.id;
    console.log(`👤 Syncing baselines for user ID: ${userId}\n`);

    // Begin transaction
    try {
      db.prepare('BEGIN TRANSACTION').run();
    } catch (beginError) {
      console.error('Error starting transaction:', beginError);
      throw beginError;
    }

    // Upsert muscle baselines
    const upsertStmt = db.prepare(`
      INSERT INTO muscle_baselines (user_id, muscle_name, user_override, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, muscle_name)
      DO UPDATE SET
        user_override = excluded.user_override,
        updated_at = CURRENT_TIMESTAMP
    `);

    let updatedCount = 0;
    for (const [muscle, volume] of muscleVolumes.entries()) {
      upsertStmt.run(userId, muscle, Math.round(volume));
      updatedCount++;
    }

    // Commit transaction
    db.prepare('COMMIT').run();

    console.log(`✅ Successfully synced ${updatedCount} muscle baselines to database\n`);

    // Verify the data
    console.log('🔍 Verification - Current database values:');
    const baselines = db.prepare(`
      SELECT muscle_name, system_learned_max, user_override, updated_at
      FROM muscle_baselines
      WHERE user_id = ?
      ORDER BY muscle_name
    `).all(userId) as Array<{
      muscle_name: string;
      system_learned_max: number;
      user_override: number | null;
      updated_at: string;
    }>;

    for (const baseline of baselines) {
      const value = baseline.user_override ?? baseline.system_learned_max;
      console.log(`   ${baseline.muscle_name}: ${value.toLocaleString()} lb`);
    }

    console.log('\n✨ Sync complete!');

  } catch (error) {
    try {
      db.prepare('ROLLBACK').run();
    } catch (rollbackError) {
      // Ignore rollback errors if no transaction is active
    }
    console.error('❌ Error syncing personal records:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the sync
syncPersonalRecords().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
