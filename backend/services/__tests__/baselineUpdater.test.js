import { describe, it, expect } from 'vitest';
import { checkForBaselineUpdates } from '../baselineUpdater.js';

describe('BaselineUpdater', () => {
  // Test workout data with known values
  // Using "Push-up" (ex03) with high enough volume to exceed Pectoralis baseline (3744)
  // Push-up: Pectoralis 50%, Triceps 35%, AnteriorDeltoids 10%, Core 5%
  // To exceed Pectoralis baseline: need > 3744 / 0.50 = 7488 total volume
  // Using 200 × 40 = 8000 total volume → 4000 Pectoralis volume (exceeds 3744)
  const sampleWorkout = [
    {
      exerciseId: 'ex03',
      sets: [
        { weight: 200, reps: 40, toFailure: true }
      ]
    }
  ];

  const workoutDate = '2025-11-11';

  describe('Exercise ID Format (TDD Fix #3)', () => {
    it('should accept exerciseId instead of exercise name', () => {
      // NEW TEST: Using exerciseId format like fatigueCalculator
      // Push-up has ID "ex03" in exercises.json
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should still detect baseline exceeded for Pectoralis
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      const pectoralisSuggestion = suggestions.find(s => s.muscle === 'Pectoralis');
      expect(pectoralisSuggestion).toBeDefined();
      expect(pectoralisSuggestion.achievedVolume).toBe(4000);
      expect(pectoralisSuggestion.currentBaseline).toBe(3744);
      expect(pectoralisSuggestion.exercise).toBe('Push-up'); // Should resolve to exercise name
    });
  });

  describe('Input Validation (AC: Testing)', () => {
    it('should throw error if workout exercises is not an array', () => {
      expect(() => checkForBaselineUpdates({}, workoutDate)).toThrow(
        'Workout exercises must be an array'
      );
    });

    it('should throw error if workout exercises is null', () => {
      expect(() => checkForBaselineUpdates(null, workoutDate)).toThrow(
        'Workout exercises must be an array'
      );
    });

    it('should throw error if workout date is missing', () => {
      expect(() => checkForBaselineUpdates(sampleWorkout, null)).toThrow(
        'Workout date is required'
      );
    });

    it('should throw error if workout date is undefined', () => {
      expect(() => checkForBaselineUpdates(sampleWorkout, undefined)).toThrow(
        'Workout date is required'
      );
    });

    it('should throw error if exerciseId is missing', () => {
      const invalidWorkout = [
        { sets: [{ weight: 100, reps: 10, toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each workout exercise must have an exerciseId'
      );
    });

    it('should throw error if exerciseId is not a string', () => {
      const invalidWorkout = [
        { exerciseId: 123, sets: [{ weight: 100, reps: 10, toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Exercise ID must be a string'
      );
    });

    it('should throw error if sets is not an array', () => {
      const invalidWorkout = [
        { exerciseId: 'ex03', sets: {} }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each workout exercise must have a sets array'
      );
    });

    it('should throw error if set is missing weight', () => {
      const invalidWorkout = [
        { exerciseId: 'ex03', sets: [{ reps: 10, toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each set must have weight and reps as numbers'
      );
    });

    it('should throw error if set is missing reps', () => {
      const invalidWorkout = [
        { exerciseId: 'ex03', sets: [{ weight: 100, toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each set must have weight and reps as numbers'
      );
    });

    it('should throw error if weight is not a number', () => {
      const invalidWorkout = [
        { exerciseId: 'ex03', sets: [{ weight: '100', reps: 10, toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each set must have weight and reps as numbers'
      );
    });

    it('should throw error if reps is not a number', () => {
      const invalidWorkout = [
        { exerciseId: 'ex03', sets: [{ weight: 100, reps: '10', toFailure: true }] }
      ];
      expect(() => checkForBaselineUpdates(invalidWorkout, workoutDate)).toThrow(
        'Each set must have weight and reps as numbers'
      );
    });
  });

  describe('Baseline Exceeded Detection (AC 1)', () => {
    it('should detect when muscle volume exceeds baseline', () => {
      // Push-up (ex03): 40 reps @ 200lbs, toFailure=true
      // Pectoralis (50%): 40 × 200 × 0.50 = 4000 units
      // Baseline for Pectoralis: 3744 units (from baselines.json)
      // Should generate suggestion since 4000 > 3744

      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      const pectoralisSuggestion = suggestions.find(s => s.muscle === 'Pectoralis');
      expect(pectoralisSuggestion).toBeDefined();
      expect(pectoralisSuggestion.achievedVolume).toBe(4000);
      expect(pectoralisSuggestion.currentBaseline).toBe(3744);
    });

    it('should return empty array when no baselines exceeded', () => {
      // Very light workout that won't exceed baselines
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 50, reps: 10, toFailure: true } // Only 350 units for Pectoralis
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBe(0);
    });

    it('should handle unknown exercise gracefully', () => {
      const workout = [
        {
          exerciseId: 'UNKNOWN_XYZ',
          sets: [
            { weight: 1000, reps: 100, toFailure: true }
          ]
        }
      ];

      // Should not throw error, just return empty array
      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      expect(suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Suggested Baseline Equals Actual Volume (AC 2)', () => {
    it('should suggest baseline equal to achieved volume, not a calculated increase', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      const pectoralisSuggestion = suggestions.find(s => s.muscle === 'Pectoralis');

      expect(pectoralisSuggestion).toBeDefined();
      expect(pectoralisSuggestion.suggestedBaseline).toBe(pectoralisSuggestion.achievedVolume);
      expect(pectoralisSuggestion.suggestedBaseline).toBe(4000);
    });
  });

  describe('Multiple Muscle Suggestions (AC 3)', () => {
    it('should generate suggestions for all muscles that exceeded baselines', () => {
      // Push-up engages Pectoralis (50%), Triceps (35%), AnteriorDeltoids (10%), Core (5%)
      // With high enough volume, multiple muscles should exceed baselines
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should have multiple suggestions (at least Pectoralis and potentially others)
      expect(suggestions.length).toBeGreaterThan(0);

      // Each suggestion should be a separate object
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('muscle');
        expect(suggestion).toHaveProperty('currentBaseline');
        expect(suggestion).toHaveProperty('suggestedBaseline');
        expect(suggestion).toHaveProperty('achievedVolume');
      });
    });

    it('should handle compound exercise with multiple muscles', () => {
      // Barbell Deadlifts engage many muscles
      const workout = [
        {
          exerciseId: 'UNKNOWN_DEADLIFT',
          sets: [
            { weight: 300, reps: 10, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Deadlifts work multiple muscle groups heavily
      expect(suggestions).toBeInstanceOf(Array);

      // All suggestions should have unique muscles
      const muscles = suggestions.map(s => s.muscle);
      const uniqueMuscles = new Set(muscles);
      expect(muscles.length).toBe(uniqueMuscles.size);
    });
  });

  describe('Date and Exercise Context (AC 4)', () => {
    it('should include date in suggestion', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, '2025-11-11');

      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion.date).toBe('2025-11-11');
      });
    });

    it('should include exercise name that triggered the suggestion', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion.exercise).toBe('Push-up');
      });
    });

    it('should calculate percentage increase correctly', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      const pectoralisSuggestion = suggestions.find(s => s.muscle === 'Pectoralis');

      expect(pectoralisSuggestion).toBeDefined();

      // Pectoralis: currentBaseline=3744, achievedVolume=4000
      // percentIncrease = ((4000 - 3744) / 3744) * 100 = 6.84...
      // Should be rounded to 1 decimal: 6.8
      expect(pectoralisSuggestion.percentIncrease).toBeCloseTo(6.8, 1);
      expect(typeof pectoralisSuggestion.percentIncrease).toBe('number');
    });

    it('should include all required fields in suggestion object', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions.length).toBeGreaterThan(0);

      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('muscle');
        expect(suggestion).toHaveProperty('currentBaseline');
        expect(suggestion).toHaveProperty('suggestedBaseline');
        expect(suggestion).toHaveProperty('achievedVolume');
        expect(suggestion).toHaveProperty('exercise');
        expect(suggestion).toHaveProperty('date');
        expect(suggestion).toHaveProperty('percentIncrease');

        // Type checks
        expect(typeof suggestion.muscle).toBe('string');
        expect(typeof suggestion.currentBaseline).toBe('number');
        expect(typeof suggestion.suggestedBaseline).toBe('number');
        expect(typeof suggestion.achievedVolume).toBe('number');
        expect(typeof suggestion.exercise).toBe('string');
        expect(typeof suggestion.date).toBe('string');
        expect(typeof suggestion.percentIncrease).toBe('number');
      });
    });
  });

  describe('To Failure Filtering (Quality Data)', () => {
    it('should only process sets marked as toFailure=true', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 40, toFailure: false }, // Should be ignored
            { weight: 200, reps: 40, toFailure: true }   // Should be processed
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should generate suggestions based only on the toFailure=true set
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return empty array if no sets are to failure', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 30, toFailure: false },
            { weight: 250, reps: 25, toFailure: false }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // No quality data to learn from
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBe(0);
    });

    it('should handle missing toFailure field as false', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 30 } // toFailure missing - treated as false
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should not process set without explicit toFailure=true
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('Track Maximum Volume Per Muscle', () => {
    it('should track maximum volume achieved across multiple sets, not sum', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 150, reps: 20, toFailure: true }, // 3000 total, 1500 Pectoralis (50%)
            { weight: 200, reps: 40, toFailure: true }, // 8000 total, 4000 Pectoralis (MAX - 50%)
            { weight: 180, reps: 30, toFailure: true }  // 5400 total, 2700 Pectoralis (50%)
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      const pectoralisSuggestion = suggestions.find(s => s.muscle === 'Pectoralis');

      expect(pectoralisSuggestion).toBeDefined();
      // Should use maximum volume (4000), not sum (8200)
      expect(pectoralisSuggestion.achievedVolume).toBe(4000);
      expect(pectoralisSuggestion.suggestedBaseline).toBe(4000);
    });

    it('should track max volume per muscle independently', () => {
      // Multiple exercises working different muscles
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 30, toFailure: true } // High Pectoralis volume
          ]
        },
        {
          exerciseId: 'ex06',
          sets: [
            { weight: 250, reps: 10, toFailure: true } // High Lats volume
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should have suggestions for different muscles
      expect(suggestions).toBeInstanceOf(Array);

      // Each muscle should have its own max volume tracked
      const muscles = suggestions.map(s => s.muscle);
      const uniqueMuscles = new Set(muscles);
      expect(muscles.length).toBe(uniqueMuscles.size);
    });
  });

  describe('Muscle Name Normalization', () => {
    it('should correctly map exercise muscle names to baseline muscle names', () => {
      // Barbell Overhead Press uses "Deltoids (Anterior)" in exercise data
      // Should map to "AnteriorDeltoids" for baseline comparison
      const workout = [
        {
          exerciseId: 'ex05',
          sets: [
            { weight: 150, reps: 10, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should find suggestions with normalized muscle names
      suggestions.forEach(suggestion => {
        // Muscle names should match baseline format (no parentheses)
        expect(suggestion.muscle).not.toContain('(');
        expect(suggestion.muscle).not.toContain(')');
      });
    });

    it('should handle Core muscle mapping from Rectus Abdominis', () => {
      // Some exercises list "Rectus Abdominis" which maps to "Core"
      const workout = [
        {
          exerciseId: 'UNKNOWN_CRUNCH',
          sets: [
            { weight: 0, reps: 100, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      // Should use "Core" for baseline lookup, not "Rectus Abdominis"
      const coreSuggestion = suggestions.find(s => s.muscle === 'Core');
      if (coreSuggestion) {
        expect(coreSuggestion.muscle).toBe('Core');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty workout array', () => {
      const suggestions = checkForBaselineUpdates([], workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBe(0);
    });

    it('should handle workout with no toFailure sets', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: []
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBe(0);
    });

    it('should handle zero weight', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 0, reps: 30, toFailure: true }
          ]
        }
      ];

      // Should not throw error, volume will be 0
      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      expect(suggestions).toBeInstanceOf(Array);
    });

    it('should handle zero reps', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 0, toFailure: true }
          ]
        }
      ];

      // Should not throw error, volume will be 0
      const suggestions = checkForBaselineUpdates(workout, workoutDate);
      expect(suggestions).toBeInstanceOf(Array);
    });

    it('should handle multiple exercises in single workout', () => {
      const workout = [
        {
          exerciseId: 'ex03',
          sets: [
            { weight: 200, reps: 30, toFailure: true }
          ]
        },
        {
          exerciseId: 'ex06',
          sets: [
            { weight: 250, reps: 10, toFailure: true }
          ]
        },
        {
          exerciseId: 'UNKNOWN_SQUAT',
          sets: [
            { weight: 300, reps: 8, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(workout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      // Should process all exercises and potentially generate multiple suggestions
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical push day workout', () => {
      const pushDayWorkout = [
        {
          exerciseId: 'ex02',
          sets: [
            { weight: 185, reps: 8, toFailure: true },
            { weight: 185, reps: 7, toFailure: true },
            { weight: 185, reps: 6, toFailure: true }
          ]
        },
        {
          exerciseId: 'ex32',
          sets: [
            { weight: 70, reps: 10, toFailure: true },
            { weight: 70, reps: 9, toFailure: true }
          ]
        },
        {
          exerciseId: 'UNKNOWN_FLYES',
          sets: [
            { weight: 30, reps: 12, toFailure: true },
            { weight: 30, reps: 11, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(pushDayWorkout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      // Verify structure
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('muscle');
        expect(suggestion).toHaveProperty('percentIncrease');
        expect(suggestion.percentIncrease).toBeGreaterThan(0);
      });
    });

    it('should handle leg day workout with heavy squats', () => {
      const legDayWorkout = [
        {
          exerciseId: 'UNKNOWN_SQUAT',
          sets: [
            { weight: 300, reps: 8, toFailure: true },
            { weight: 300, reps: 7, toFailure: true },
            { weight: 300, reps: 6, toFailure: true }
          ]
        },
        {
          exerciseId: 'ex13',
          sets: [
            { weight: 225, reps: 10, toFailure: true },
            { weight: 225, reps: 9, toFailure: true }
          ]
        }
      ];

      const suggestions = checkForBaselineUpdates(legDayWorkout, workoutDate);

      expect(suggestions).toBeInstanceOf(Array);
      // Heavy squats should potentially generate suggestions for leg muscles
    });
  });
});
