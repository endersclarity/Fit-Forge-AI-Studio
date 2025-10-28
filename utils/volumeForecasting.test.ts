import { forecastMuscleFatigueForExercise } from './volumeForecasting';
import { Muscle } from '../types';

describe('forecastMuscleFatigueForExercise', () => {
  it('should calculate forecasted fatigue for all engaged muscles', () => {
    const muscleEngagements = [
      { muscle: Muscle.Triceps, percentage: 90 },
      { muscle: Muscle.Forearms, percentage: 10 },
    ];

    const muscleStates = {
      [Muscle.Triceps]: { currentFatiguePercent: 40, baseline: 10000 },
      [Muscle.Forearms]: { currentFatiguePercent: 30, baseline: 8000 },
    };

    const plannedVolume = 3000; // lbs

    const forecast = forecastMuscleFatigueForExercise(
      muscleEngagements,
      plannedVolume,
      muscleStates
    );

    expect(forecast[Muscle.Triceps].forecastedFatiguePercent).toBeGreaterThan(40);
    expect(forecast[Muscle.Forearms].forecastedFatiguePercent).toBeGreaterThan(30);
    expect(forecast[Muscle.Triceps].volumeAdded).toBe(2700); // 90% of 3000
  });
});
