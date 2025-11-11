import { describe, it, expect } from 'vitest';
import { calculateMuscleFatigue } from '../fatigueCalculator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exercisesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/logic-sandbox/exercises.json'), 'utf8'));
const baselinesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/logic-sandbox/baselines.json'), 'utf8'));
const baselines = {};
baselinesData.baselines.forEach(b => { baselines[b.muscle] = b.baselineCapacity; });

describe('FatigueCalculator', () => {
  it('should calculate volume correctly', () => {
    const workout = { exercises: [{ exerciseId: 'ex02', sets: [{ weight: 135, reps: 10 }] }] };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);
    expect(result.muscleStates.length).toBeGreaterThan(0);
  });

  it('should flag exceeded baselines', () => {
    const workout = { exercises: [{ exerciseId: 'ex02', totalVolume: 10000, sets: [] }] };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);
    const exceeded = result.muscleStates.filter(m => m.exceededBaseline);
    expect(exceeded.length).toBeGreaterThan(0);
  });

  it('should throw for invalid inputs', () => {
    expect(() => calculateMuscleFatigue(null, exercisesData, baselines)).toThrow();
  });

  it('should return correct structure', () => {
    const workout = { exercises: [{ exerciseId: 'ex02', totalVolume: 2000, sets: [] }] };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);
    expect(result).toHaveProperty('muscleStates');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('timestamp');
  });

  // NEW TEST: Zero baseline edge case
  it('should throw error for zero baseline', () => {
    // Use ex02 (Dumbbell Bench Press) which works Pectoralis muscle
    const workout = { exercises: [{ exerciseId: 'ex02', totalVolume: 1000, sets: [] }] };
    const zeroBaselines = { ...baselines, 'Pectoralis': 0 };
    expect(() => calculateMuscleFatigue(workout, exercisesData, zeroBaselines)).toThrow('Invalid baseline: Pectoralis baseline cannot be zero');
  });

  // NEW TEST: Missing exercise in library
  it('should handle missing exercise gracefully', () => {
    const workout = { exercises: [{ exerciseId: 'nonexistent-exercise', totalVolume: 1000, sets: [] }] };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);
    // Should return all muscle groups with 0 fatigue since no valid exercises processed
    expect(result.muscleStates.length).toBe(Object.keys(baselines).length);
    expect(result.muscleStates.every(m => m.fatiguePercent === 0)).toBe(true);
  });

  // NEW TEST: Exercise with no muscle data
  it('should handle exercise with no muscle data', () => {
    const exercisesWithEmpty = {
      exercises: [
        ...exercisesData.exercises,
        { id: 'empty-ex', name: 'Empty Exercise', muscles: [] }
      ]
    };
    const workout = { exercises: [{ exerciseId: 'empty-ex', totalVolume: 1000, sets: [] }] };
    const result = calculateMuscleFatigue(workout, exercisesWithEmpty, baselines);
    // Should complete without error and return all muscles with 0 fatigue
    expect(result.muscleStates.length).toBe(Object.keys(baselines).length);
  });

  // NEW TEST: Volume calculation from sets array
  it('should calculate volume from sets array correctly', () => {
    const workout = {
      exercises: [{
        exerciseId: 'ex12', // Kettlebell Goblet Squat
        sets: [
          { weight: 100, reps: 10 }, // 1000
          { weight: 120, reps: 8 },  // 960
          { weight: 140, reps: 6 }   // 840
        ]
        // Total volume: 2800
      }]
    };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);

    // Find Quadriceps muscle (primary in squats)
    const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
    expect(quads).toBeDefined();
    expect(quads.volume).toBeGreaterThan(0);

    // Verify calculation happened (volume should be percentage of total 2800)
    const ex12Data = exercisesData.exercises.find(ex => ex.id === 'ex12');
    const quadsEngagement = ex12Data.muscles.find(m => m.muscle === 'Quadriceps');
    const expectedVolume = 2800 * (quadsEngagement.percentage / 100);
    expect(quads.volume).toBeCloseTo(expectedVolume, 1);
  });

  // NEW TEST: Warnings content validation
  it('should generate appropriate warnings for muscles approaching or exceeding capacity', () => {
    const workout = { exercises: [{ exerciseId: 'ex02', totalVolume: 10000, sets: [] }] };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);

    // Should have warnings array
    expect(Array.isArray(result.warnings)).toBe(true);

    // Should have warnings for exceeded baselines
    const exceededMuscles = result.muscleStates.filter(m => m.exceededBaseline);
    if (exceededMuscles.length > 0) {
      // Check that warnings contain the muscle name and "EXCEEDED"
      const hasExceededWarnings = result.warnings.some(w => w.includes('EXCEEDED'));
      expect(hasExceededWarnings).toBe(true);
    }

    // Check warning format includes percentage and volume information
    if (result.warnings.length > 0) {
      const sampleWarning = result.warnings[0];
      expect(typeof sampleWarning).toBe('string');
      expect(sampleWarning.length).toBeGreaterThan(0);
    }
  });

  // NEW TEST: All 15 muscle groups returned (AC3)
  it('should return fatigue data for all 15 muscle groups even if not worked', () => {
    // Workout that only targets upper body (Dumbbell Bench Press)
    const workout = {
      exercises: [{
        exerciseId: 'ex02', // Dumbbell Bench Press (upper body only)
        totalVolume: 1000,
        sets: []
      }]
    };
    const result = calculateMuscleFatigue(workout, exercisesData, baselines);

    // Should return all muscles from baselines
    expect(result.muscleStates.length).toBe(Object.keys(baselines).length);

    // Should have some muscles with 0 fatigue (lower body muscles not worked)
    const unusedMuscles = result.muscleStates.filter(m => m.fatiguePercent === 0);
    expect(unusedMuscles.length).toBeGreaterThan(0);

    // All unused muscles should have correct structure
    unusedMuscles.forEach(muscle => {
      expect(muscle.volume).toBe(0);
      expect(muscle.fatiguePercent).toBe(0);
      expect(muscle.displayFatigue).toBe(0);
      expect(muscle.exceededBaseline).toBe(false);
      expect(muscle.baseline).toBe(baselines[muscle.muscle]);
    });
  });
});
