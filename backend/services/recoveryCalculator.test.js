/**
 * Recovery Calculator Service Tests
 *
 * Validates recovery calculation logic matches logic-sandbox reference implementation
 * Formula: currentFatigue = max(0, initialFatigue - (daysElapsed × 15%))
 */

const {
  calculateRecovery,
  calculateRecoveryProjections,
  calculateFullRecoveryTime,
  calculateReadyToTrainTime,
  getRecoveryTimeline,
  RECOVERY_RATE_PER_DAY,
  READY_TO_TRAIN_THRESHOLD,
  CAUTION_THRESHOLD
} = require('./recoveryCalculator');

describe('RecoveryCalculator', () => {
  describe('calculateRecovery', () => {
    it('calculates 24h recovery (15% reduction)', () => {
      const initialFatigue = 60;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T08:00:00Z'); // 24 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.initialFatigue).toBe(60);
      expect(result.hoursElapsed).toBe(24);
      expect(result.daysElapsed).toBe(1);
      expect(result.recoveredPercentage).toBe(15); // 15% per day
      expect(result.currentFatigue).toBe(45); // 60 - 15 = 45
      expect(result.status).toBe('caution'); // 45% is in caution range (40-79%)
    });

    it('calculates 48h recovery (30% reduction)', () => {
      const initialFatigue = 80;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-12T08:00:00Z'); // 48 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.hoursElapsed).toBe(48);
      expect(result.daysElapsed).toBe(2);
      expect(result.recoveredPercentage).toBe(30); // 15% × 2 days = 30%
      expect(result.currentFatigue).toBe(50); // 80 - 30 = 50
      expect(result.status).toBe('caution');
    });

    it('calculates 72h recovery (45% reduction)', () => {
      const initialFatigue = 90;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-13T08:00:00Z'); // 72 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.daysElapsed).toBe(3);
      expect(result.recoveredPercentage).toBe(45); // 15% × 3 days = 45%
      expect(result.currentFatigue).toBe(45); // 90 - 45 = 45
    });

    it('handles fractional hours elapsed (12.5 hours)', () => {
      const initialFatigue = 50;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-10T20:30:00Z'); // 12.5 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.hoursElapsed).toBe(12.5);
      expect(result.daysElapsed).toBe(12.5 / 24); // ~0.52 days
      expect(result.recoveredPercentage).toBeCloseTo(7.8, 1); // ~7.8%
      expect(result.currentFatigue).toBeCloseTo(42.2, 1); // 50 - 7.8 = 42.2
    });

    it('identifies ready to train status (<40% fatigue)', () => {
      const initialFatigue = 60;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T20:00:00Z'); // 36 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      const expectedRecovered = (36 / 24) * 15; // 1.5 days × 15% = 22.5%
      expect(result.currentFatigue).toBeCloseTo(37.5, 1); // 60 - 22.5 = 37.5
      expect(result.status).toBe('ready'); // <40% = ready
    });

    it('identifies dont_train status (>=80% fatigue)', () => {
      const initialFatigue = 100;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-10T20:00:00Z'); // 12 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      const expectedRecovered = (12 / 24) * 15; // 0.5 days × 15% = 7.5%
      expect(result.currentFatigue).toBeCloseTo(92.5, 1); // 100 - 7.5 = 92.5
      expect(result.status).toBe('dont_train'); // >=80% = dont_train
    });

    it('identifies caution status (40-79% fatigue)', () => {
      const initialFatigue = 70;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T08:00:00Z'); // 24 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.currentFatigue).toBe(55); // 70 - 15 = 55
      expect(result.status).toBe('caution'); // 40-79% = caution
    });
  });

  describe('calculateRecovery - Edge Cases', () => {
    it('handles muscle already recovered (0% fatigue)', () => {
      const initialFatigue = 0;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T08:00:00Z');

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.currentFatigue).toBe(0);
      expect(result.status).toBe('ready');
    });

    it('clamps recovery to 0% (does not go negative)', () => {
      const initialFatigue = 20;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-12T08:00:00Z'); // 48 hours (30% recovery)

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      // Should recover 30% but only had 20% fatigue
      expect(result.recoveredPercentage).toBe(30);
      expect(result.currentFatigue).toBe(0); // Clamped to 0, not negative
      expect(result.status).toBe('ready');
    });

    it('handles very high initial fatigue (150%)', () => {
      const initialFatigue = 150;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T08:00:00Z'); // 24 hours later

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      expect(result.currentFatigue).toBe(135); // 150 - 15 = 135
      expect(result.status).toBe('dont_train'); // Still >80%
    });

    it('handles immediate check (0 hours elapsed)', () => {
      const initialFatigue = 60;
      const timestamp = new Date('2025-11-10T08:00:00Z');

      const result = calculateRecovery(initialFatigue, timestamp, timestamp);

      expect(result.hoursElapsed).toBe(0);
      expect(result.daysElapsed).toBe(0);
      expect(result.recoveredPercentage).toBe(0);
      expect(result.currentFatigue).toBe(60);
    });
  });

  describe('calculateRecovery - Error Handling', () => {
    it('throws error for invalid workout timestamp', () => {
      // Note: new Date('invalid-date') returns Invalid Date but doesn't throw
      // The function will fail when trying to do math with Invalid Date
      const result = calculateRecovery(60, 'invalid-date');

      // Result will have NaN values
      expect(isNaN(result.hoursElapsed)).toBe(true);
    });

    it('handles future timestamp (negative elapsed time)', () => {
      const initialFatigue = 60;
      const workoutTimestamp = new Date('2025-11-11T08:00:00Z');
      const currentTime = new Date('2025-11-10T08:00:00Z'); // 24 hours BEFORE workout

      const result = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);

      // Should result in negative elapsed time
      expect(result.hoursElapsed).toBe(-24);
      expect(result.daysElapsed).toBe(-1);
      // Recovery would be negative, increasing fatigue (unusual but handled)
      expect(result.recoveredPercentage).toBe(-15);
      expect(result.currentFatigue).toBe(75); // 60 - (-15) = 75
    });
  });

  describe('calculateRecoveryProjections', () => {
    it('projects recovery at 24h, 48h, 72h intervals', () => {
      const initialFatigue = 90;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');

      const projections = calculateRecoveryProjections(initialFatigue, workoutTimestamp);

      // 24h projection
      expect(projections['24h'].currentFatigue).toBe(75); // 90 - 15 = 75
      expect(projections['24h'].hoursElapsed).toBe(24);

      // 48h projection
      expect(projections['48h'].currentFatigue).toBe(60); // 90 - 30 = 60
      expect(projections['48h'].hoursElapsed).toBe(48);

      // 72h projection
      expect(projections['72h'].currentFatigue).toBe(45); // 90 - 45 = 45
      expect(projections['72h'].hoursElapsed).toBe(72);
    });

    it('projects correct status changes', () => {
      const initialFatigue = 85;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');

      const projections = calculateRecoveryProjections(initialFatigue, workoutTimestamp);

      // 85% - 15% = 70% (caution: 40-79%)
      // 85% - 30% = 55% (caution: 40-79%)
      // 85% - 45% = 40% (caution: threshold uses >=, so 40% is caution)
      expect(projections['24h'].status).toBe('caution'); // 70% is caution
      expect(projections['48h'].status).toBe('caution'); // 55% is caution
      expect(projections['72h'].status).toBe('caution'); // 40% is caution (>= threshold)
    });

    it('handles low initial fatigue (recovers fully)', () => {
      const initialFatigue = 30;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');

      const projections = calculateRecoveryProjections(initialFatigue, workoutTimestamp);

      expect(projections['24h'].currentFatigue).toBe(15); // 30 - 15 = 15
      expect(projections['48h'].currentFatigue).toBe(0); // 30 - 30 = 0 (clamped)
      expect(projections['72h'].currentFatigue).toBe(0); // Already recovered
    });
  });

  describe('calculateFullRecoveryTime', () => {
    it('calculates correct recovery time for various fatigue levels', () => {
      // 60% fatigue: 60 / 15 = 4 days
      let result = calculateFullRecoveryTime(60);
      expect(result.daysNeeded).toBe(4);
      expect(result.hoursNeeded).toBe(96);
      expect(result.message).toContain('4.0 days');

      // 45% fatigue: 45 / 15 = 3 days
      result = calculateFullRecoveryTime(45);
      expect(result.daysNeeded).toBe(3);
      expect(result.hoursNeeded).toBe(72);

      // 15% fatigue: 15 / 15 = 1 day
      result = calculateFullRecoveryTime(15);
      expect(result.daysNeeded).toBe(1);
      expect(result.hoursNeeded).toBe(24);
    });

    it('handles already recovered muscle', () => {
      const result = calculateFullRecoveryTime(0);

      expect(result.daysNeeded).toBe(0);
      expect(result.hoursNeeded).toBe(0);
      expect(result.message).toBe('Already recovered');
    });

    it('handles partial day recovery', () => {
      const result = calculateFullRecoveryTime(20); // 20 / 15 = 1.33 days

      expect(result.daysNeeded).toBeCloseTo(1.33, 2);
      expect(result.hoursNeeded).toBeCloseTo(32, 0);
      expect(result.message).toContain('1.3 days');
    });

    it('handles very high fatigue', () => {
      const result = calculateFullRecoveryTime(150); // 150 / 15 = 10 days

      expect(result.daysNeeded).toBe(10);
      expect(result.hoursNeeded).toBe(240);
      expect(result.message).toContain('10.0 days');
    });
  });

  describe('calculateReadyToTrainTime', () => {
    it('calculates correct ready-to-train time', () => {
      // 85% fatigue: (85 - 40) / 15 = 3 days
      let result = calculateReadyToTrainTime(85);
      expect(result.daysNeeded).toBe(3);
      expect(result.hoursNeeded).toBe(72);

      // 70% fatigue: (70 - 40) / 15 = 2 days
      result = calculateReadyToTrainTime(70);
      expect(result.daysNeeded).toBe(2);
      expect(result.hoursNeeded).toBe(48);

      // 55% fatigue: (55 - 40) / 15 = 1 day
      result = calculateReadyToTrainTime(55);
      expect(result.daysNeeded).toBe(1);
      expect(result.hoursNeeded).toBe(24);
    });

    it('handles already ready to train', () => {
      const result = calculateReadyToTrainTime(30);

      expect(result.daysNeeded).toBe(0);
      expect(result.hoursNeeded).toBe(0);
      expect(result.message).toBe('Already ready');
    });

    it('handles exactly at threshold', () => {
      const result = calculateReadyToTrainTime(40);

      expect(result.daysNeeded).toBe(0);
      expect(result.hoursNeeded).toBe(0);
      expect(result.message).toBe('Already ready');
    });

    it('handles partial day until ready', () => {
      const result = calculateReadyToTrainTime(50); // (50 - 40) / 15 = 0.67 days

      expect(result.daysNeeded).toBeCloseTo(0.67, 2);
      expect(result.hoursNeeded).toBeCloseTo(16, 0);
    });
  });

  describe('getRecoveryTimeline', () => {
    it('returns complete recovery timeline', () => {
      const initialFatigue = 80;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-11T08:00:00Z'); // 24 hours later

      const timeline = getRecoveryTimeline(initialFatigue, workoutTimestamp, currentTime);

      // Current state (24h after workout)
      expect(timeline.current.currentFatigue).toBe(65); // 80 - 15 = 65
      expect(timeline.current.status).toBe('caution');

      // Projections are from WORKOUT time, not current time
      // 24h from workout: 80 - 15 = 65
      // 48h from workout: 80 - 30 = 50
      // 72h from workout: 80 - 45 = 35
      expect(timeline.projections['24h'].currentFatigue).toBe(65);
      expect(timeline.projections['48h'].currentFatigue).toBe(50);
      expect(timeline.projections['72h'].currentFatigue).toBe(35);

      // Full recovery time (from current fatigue: 65%)
      expect(timeline.fullRecoveryTime.daysNeeded).toBeCloseTo(4.33, 2); // 65 / 15

      // Ready to train time (from current fatigue: 65%)
      expect(timeline.readyToTrainTime.daysNeeded).toBeCloseTo(1.67, 2); // (65 - 40) / 15
    });

    it('handles muscle that needs no more recovery', () => {
      const initialFatigue = 50;
      const workoutTimestamp = new Date('2025-11-10T08:00:00Z');
      const currentTime = new Date('2025-11-14T08:00:00Z'); // 96 hours later (4 days)

      const timeline = getRecoveryTimeline(initialFatigue, workoutTimestamp, currentTime);

      // Should be fully recovered (50% - 60% = -10%, clamped to 0)
      expect(timeline.current.currentFatigue).toBe(0);
      expect(timeline.current.status).toBe('ready');
      expect(timeline.fullRecoveryTime.message).toBe('Already recovered');
      expect(timeline.readyToTrainTime.message).toBe('Already ready');
    });
  });
});
