import { calculateSetsRepsWeight } from './setBuilder';

describe('calculateSetsRepsWeight', () => {
  it('should calculate 3 sets by default with reps in 8-12 range', () => {
    const targetVolume = 4200;
    const result = calculateSetsRepsWeight(targetVolume);

    expect(result.sets).toBe(3);
    expect(result.reps).toBeGreaterThanOrEqual(8);
    expect(result.reps).toBeLessThanOrEqual(12);
    expect(result.sets * result.reps * result.weight).toBeCloseTo(targetVolume, -1);
  });

  it('should recalculate weight when sets change', () => {
    const targetVolume = 4200;
    const result = calculateSetsRepsWeight(targetVolume, { sets: 4 });

    expect(result.sets).toBe(4);
    expect(result.sets * result.reps * result.weight).toBeCloseTo(targetVolume, -1);
  });
});
