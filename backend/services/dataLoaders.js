import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caches for loaded data
let exerciseLibraryCache = null;
let baselineDataCache = null;

/**
 * Load exercise library from docs/logic-sandbox/exercises.json
 *
 * @returns {Array<Object>} Array of 48 validated exercises
 * @throws {Error} If exercise library cannot be loaded
 */
export function loadExerciseLibrary() {
  if (exerciseLibraryCache) {
    return exerciseLibraryCache;
  }

  try {
    const exercisePath = join(__dirname, '../../docs/logic-sandbox/exercises.json');
    const exerciseData = JSON.parse(readFileSync(exercisePath, 'utf8'));
    exerciseLibraryCache = exerciseData.exercises;
    return exerciseLibraryCache;
  } catch (error) {
    throw new Error(`Failed to load exercise library: ${error.message}`);
  }
}

/**
 * Load baseline data from docs/logic-sandbox/baselines.json
 *
 * @returns {Array<Object>} Array of muscle baseline capacities
 * @throws {Error} If baseline data cannot be loaded
 */
export function loadBaselineData() {
  if (baselineDataCache) {
    return baselineDataCache;
  }

  try {
    const baselinePath = join(__dirname, '../../docs/logic-sandbox/baselines.json');
    const baselineData = JSON.parse(readFileSync(baselinePath, 'utf8'));
    baselineDataCache = baselineData.baselines;
    return baselineDataCache;
  } catch (error) {
    throw new Error(`Failed to load baseline data: ${error.message}`);
  }
}

// Muscle name mapping: Exercise data format → Baseline data format
export const MUSCLE_NAME_MAP = {
  'Deltoids (Anterior)': 'AnteriorDeltoids',
  'Deltoids (Posterior)': 'PosteriorDeltoids',
  'Latissimus Dorsi': 'Lats',
  'Erector Spinae': 'LowerBack',
  'Rectus Abdominis': 'Core',
  'Obliques': 'Core'
};

/**
 * Normalize muscle name from exercise format to baseline format
 *
 * @param {string} muscleName - Muscle name from exercise data
 * @returns {string} Normalized muscle name
 */
export function normalizeMuscle(muscleName) {
  return MUSCLE_NAME_MAP[muscleName] || muscleName;
}
