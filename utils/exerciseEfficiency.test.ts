import { calculateEfficiencyScore } from './exerciseEfficiency';
import { Muscle } from '../types';

describe('calculateEfficiencyScore', () => {
  it('should rank isolation exercises higher when supporting muscles are fatigued', () => {
    const targetMuscle = Muscle.Triceps;
    const muscleStates = {
      [Muscle.Triceps]: { currentFatiguePercent: 40, baseline: 10000 },
      [Muscle.Pectoralis]: { currentFatiguePercent: 85, baseline: 12000 },
      [Muscle.Forearms]: { currentFatiguePercent: 30, baseline: 8000 },
    };

    // Tricep Pushdowns: 90% Triceps, 10% Forearms
    const isolationScore = calculateEfficiencyScore(
      targetMuscle,
      [{ muscle: Muscle.Triceps, percentage: 90 }, { muscle: Muscle.Forearms, percentage: 10 }],
      muscleStates
    );

    // Bench Press: 75% Triceps, 70% Pectoralis
    const compoundScore = calculateEfficiencyScore(
      targetMuscle,
      [{ muscle: Muscle.Triceps, percentage: 75 }, { muscle: Muscle.Pectoralis, percentage: 70 }],
      muscleStates
    );

    expect(isolationScore).toBeGreaterThan(compoundScore);
  });
});
