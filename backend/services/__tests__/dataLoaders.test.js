import { describe, test, expect } from 'vitest';
import {
  loadExerciseLibrary,
  loadBaselineData,
  normalizeMuscle,
  MUSCLE_NAME_MAP
} from '../dataLoaders.js';

describe('loadExerciseLibrary', () => {
  test('returns array of exercises with muscle engagement data', () => {
    const exercises = loadExerciseLibrary();

    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises[0]).toHaveProperty('name');
    expect(exercises[0]).toHaveProperty('muscles');
    expect(Array.isArray(exercises[0].muscles)).toBe(true);
  });

  test('caches exercise library on subsequent calls', () => {
    const first = loadExerciseLibrary();
    const second = loadExerciseLibrary();

    expect(first).toBe(second); // Same reference = cached
  });
});

describe('loadBaselineData', () => {
  test('returns array of muscle baselines', () => {
    const baselines = loadBaselineData();

    expect(Array.isArray(baselines)).toBe(true);
    expect(baselines.length).toBe(15); // 15 muscle groups
    expect(baselines[0]).toHaveProperty('muscle');
    expect(baselines[0]).toHaveProperty('baselineCapacity');
  });

  test('caches baseline data on subsequent calls', () => {
    const first = loadBaselineData();
    const second = loadBaselineData();

    expect(first).toBe(second); // Same reference = cached
  });
});

describe('normalizeMuscle', () => {
  test('maps exercise muscle names to baseline muscle names', () => {
    expect(normalizeMuscle('Deltoids (Anterior)')).toBe('AnteriorDeltoids');
    expect(normalizeMuscle('Deltoids (Posterior)')).toBe('PosteriorDeltoids');
    expect(normalizeMuscle('Latissimus Dorsi')).toBe('Lats');
    expect(normalizeMuscle('Erector Spinae')).toBe('LowerBack');
    expect(normalizeMuscle('Rectus Abdominis')).toBe('Core');
    expect(normalizeMuscle('Obliques')).toBe('Core');
  });

  test('returns original name if no mapping exists', () => {
    expect(normalizeMuscle('Pectoralis')).toBe('Pectoralis');
    expect(normalizeMuscle('Quadriceps')).toBe('Quadriceps');
  });
});

describe('MUSCLE_NAME_MAP', () => {
  test('contains all necessary muscle name mappings', () => {
    expect(MUSCLE_NAME_MAP).toHaveProperty('Deltoids (Anterior)');
    expect(MUSCLE_NAME_MAP).toHaveProperty('Deltoids (Posterior)');
    expect(MUSCLE_NAME_MAP).toHaveProperty('Latissimus Dorsi');
    expect(MUSCLE_NAME_MAP).toHaveProperty('Erector Spinae');
    expect(MUSCLE_NAME_MAP).toHaveProperty('Rectus Abdominis');
    expect(MUSCLE_NAME_MAP).toHaveProperty('Obliques');
  });
});
