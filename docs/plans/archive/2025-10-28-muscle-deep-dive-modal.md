# Muscle Deep-Dive Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive muscle deep-dive modal that helps users discover optimal exercises for a target muscle by forecasting fatigue impact across all muscle groups with real-time volume sliders and smart set builders.

**Architecture:** Tab-based modal UI (Recommended/All Exercises/History) with interactive exercise cards that expand to show volume sliders, real-time muscle fatigue visualization, efficiency ranking algorithm, and locked-target set builder. Integrates with existing WorkoutPlannerModal by exporting PlannedExercise objects.

**Tech Stack:** React, TypeScript, existing FitForge types (PlannedExercise, ForecastedMuscleState, MuscleStatesResponse), existing utility functions (calculateForecastedFatigue)

---

## Task 1: Create Efficiency Algorithm Utility

**Files:**
- Create: `utils/exerciseEfficiency.ts`
- Test: `utils/exerciseEfficiency.test.ts` (create if doesn't exist)

**Step 1: Write the failing test**

Create `utils/exerciseEfficiency.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- exerciseEfficiency.test.ts`
Expected: FAIL with "calculateEfficiencyScore is not defined"

**Step 3: Write minimal implementation**

Create `utils/exerciseEfficiency.ts`:

```typescript
import { Muscle, MuscleEngagement } from '../types';

interface MuscleCapacity {
  currentFatiguePercent: number;
  baseline: number;
}

/**
 * Calculate efficiency score for an exercise targeting a specific muscle
 *
 * Algorithm:
 * 1. Calculate target muscle's remaining capacity %
 * 2. For each supporting muscle, calculate (engagement % × capacity remaining %)
 * 3. Find the lowest supporting muscle score (bottleneck)
 * 4. Efficiency = (target_engagement × target_capacity) ÷ bottleneck_capacity
 *
 * Higher scores = can push target muscle further before hitting bottleneck
 */
export function calculateEfficiencyScore(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): number {
  const targetEngagement = muscleEngagements.find(e => e.muscle === targetMuscle);
  if (!targetEngagement || !muscleStates[targetMuscle]) return 0;

  const targetCapacityRemaining = 100 - muscleStates[targetMuscle].currentFatiguePercent;
  const targetScore = (targetEngagement.percentage / 100) * targetCapacityRemaining;

  // Find bottleneck: supporting muscle with lowest capacity score
  let bottleneckScore = Infinity;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const score = (engagement.percentage / 100) * capacityRemaining;

    if (score < bottleneckScore) {
      bottleneckScore = score;
    }
  }

  // If no supporting muscles, return target score directly
  if (bottleneckScore === Infinity) return targetScore;

  return targetScore / bottleneckScore;
}

/**
 * Get efficiency badge label based on score
 */
export function getEfficiencyBadge(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (score > 5.0) return { label: 'Efficient', color: 'green' };
  if (score >= 2.0) return { label: 'Limited', color: 'yellow' };
  return { label: 'Poor choice', color: 'red' };
}

/**
 * Find bottleneck muscle for an exercise
 */
export function findBottleneckMuscle(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): Muscle | null {
  let bottleneckMuscle: Muscle | null = null;
  let lowestScore = Infinity;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const score = (engagement.percentage / 100) * capacityRemaining;

    if (score < lowestScore) {
      lowestScore = score;
      bottleneckMuscle = engagement.muscle;
    }
  }

  return bottleneckMuscle;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- exerciseEfficiency.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add utils/exerciseEfficiency.ts utils/exerciseEfficiency.test.ts
git commit -m "feat: add exercise efficiency ranking algorithm"
```

---

## Task 2: Create Volume Forecasting Utility

**Files:**
- Create: `utils/volumeForecasting.ts`
- Test: `utils/volumeForecasting.test.ts`

**Step 1: Write the failing test**

Create `utils/volumeForecasting.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- volumeForecasting.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `utils/volumeForecasting.ts`:

```typescript
import { Muscle, MuscleEngagement, ForecastedMuscleState } from '../types';

interface MuscleCapacity {
  currentFatiguePercent: number;
  baseline: number;
}

/**
 * Calculate forecasted muscle fatigue after performing an exercise with given volume
 */
export function forecastMuscleFatigueForExercise(
  muscleEngagements: MuscleEngagement[],
  totalVolume: number,
  muscleStates: Record<Muscle, MuscleCapacity>
): Record<Muscle, ForecastedMuscleState> {
  const forecast: Record<Muscle, ForecastedMuscleState> = {} as any;

  for (const engagement of muscleEngagements) {
    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const volumeAdded = (engagement.percentage / 100) * totalVolume;
    const volumePercent = (volumeAdded / muscleState.baseline) * 100;
    const forecastedFatiguePercent = Math.min(100, muscleState.currentFatiguePercent + volumePercent);

    forecast[engagement.muscle] = {
      muscle: engagement.muscle,
      currentFatiguePercent: muscleState.currentFatiguePercent,
      forecastedFatiguePercent,
      volumeAdded,
      baseline: muscleState.baseline,
    };
  }

  return forecast;
}

/**
 * Find the "sweet spot" volume where target muscle reaches 100% before any supporting muscle
 */
export function findOptimalVolume(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): number {
  const targetEngagement = muscleEngagements.find(e => e.muscle === targetMuscle);
  if (!targetEngagement || !muscleStates[targetMuscle]) return 0;

  const targetState = muscleStates[targetMuscle];
  const targetCapacityRemaining = 100 - targetState.currentFatiguePercent;
  const targetMaxVolume = (targetCapacityRemaining / 100) * targetState.baseline / (targetEngagement.percentage / 100);

  // Find limiting volume for each supporting muscle
  let limitingVolume = targetMaxVolume;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const maxVolumeForMuscle = (capacityRemaining / 100) * muscleState.baseline / (engagement.percentage / 100);

    if (maxVolumeForMuscle < limitingVolume) {
      limitingVolume = maxVolumeForMuscle;
    }
  }

  return Math.floor(limitingVolume);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- volumeForecasting.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add utils/volumeForecasting.ts utils/volumeForecasting.test.ts
git commit -m "feat: add volume forecasting utilities"
```

---

## Task 3: Create Set Builder Utility

**Files:**
- Create: `utils/setBuilder.ts`
- Test: `utils/setBuilder.test.ts`

**Step 1: Write the failing test**

Create `utils/setBuilder.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- setBuilder.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `utils/setBuilder.ts`:

```typescript
export interface SetConfiguration {
  sets: number;
  reps: number;
  weight: number;
}

interface SetBuilderOptions {
  sets?: number;
  reps?: number;
  weight?: number;
  preferredRepRange?: [number, number];
}

/**
 * Calculate sets/reps/weight to hit target volume
 *
 * Logic:
 * - Default to 3 sets
 * - Target rep range: 8-12 (or custom)
 * - Lock target volume - adjustments maintain total
 */
export function calculateSetsRepsWeight(
  targetVolume: number,
  options: SetBuilderOptions = {}
): SetConfiguration {
  const {
    sets = 3,
    reps,
    weight,
    preferredRepRange = [8, 12],
  } = options;

  // If all three are provided, just validate
  if (sets && reps && weight) {
    return { sets, reps, weight };
  }

  // Calculate volume per set
  const volumePerSet = targetVolume / sets;

  // If reps provided, calculate weight
  if (reps) {
    const calculatedWeight = Math.round(volumePerSet / reps / 5) * 5; // Round to nearest 5
    return { sets, reps, weight: calculatedWeight };
  }

  // If weight provided, calculate reps
  if (weight) {
    const calculatedReps = Math.round(volumePerSet / weight);
    return { sets, reps: calculatedReps, weight };
  }

  // Default: calculate both reps and weight targeting mid-range
  const targetReps = Math.floor((preferredRepRange[0] + preferredRepRange[1]) / 2);
  const calculatedWeight = Math.round(volumePerSet / targetReps / 5) * 5;

  return { sets, reps: targetReps, weight: calculatedWeight };
}

/**
 * Adjust set configuration while maintaining target volume
 */
export function adjustSetConfiguration(
  targetVolume: number,
  current: SetConfiguration,
  adjustment: Partial<SetConfiguration>
): SetConfiguration {
  const newSets = adjustment.sets ?? current.sets;
  const newReps = adjustment.reps ?? current.reps;
  const newWeight = adjustment.weight ?? current.weight;

  return calculateSetsRepsWeight(targetVolume, {
    sets: newSets,
    reps: newReps !== current.reps ? newReps : undefined,
    weight: newWeight !== current.weight ? newWeight : undefined,
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- setBuilder.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add utils/setBuilder.ts utils/setBuilder.test.ts
git commit -m "feat: add set builder with locked volume"
```

---

## Task 4: Create MuscleDeepDiveModal Component (Shell)

**Files:**
- Create: `components/MuscleDeepDiveModal.tsx`

**Step 1: Create basic modal structure**

Create `components/MuscleDeepDiveModal.tsx`:

```typescript
import React, { useState } from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselinesResponse, PlannedExercise } from '../types';
import { XIcon } from './Icons';

interface MuscleDeepDiveModalProps {
  isOpen: boolean;
  muscle: Muscle;
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselinesResponse;
  onClose: () => void;
  onAddToWorkout: (exercise: PlannedExercise) => void;
}

type TabType = 'recommended' | 'all' | 'history';

export const MuscleDeepDiveModal: React.FC<MuscleDeepDiveModalProps> = ({
  isOpen,
  muscle,
  muscleStates,
  muscleBaselines,
  onClose,
  onAddToWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  if (!isOpen) return null;

  const muscleState = muscleStates[muscle];
  const fatiguePercent = muscleState?.currentFatiguePercent ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-brand-muted">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{muscle}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-brand-muted">{fatiguePercent}% fatigued</span>
              <div className="w-32 bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    fatiguePercent < 33 ? 'bg-green-500' :
                    fatiguePercent < 66 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fatiguePercent}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-brand-muted">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            All Exercises
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recommended' && <div>Recommended exercises coming soon...</div>}
          {activeTab === 'all' && <div>All exercises coming soon...</div>}
          {activeTab === 'history' && <div>Exercise history coming soon...</div>}
        </div>
      </div>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add components/MuscleDeepDiveModal.tsx
git commit -m "feat: add MuscleDeepDiveModal shell with tabs"
```

---

## Task 5: Create ExerciseCard Component with Volume Slider

**Files:**
- Create: `components/ExerciseCard.tsx`

**Step 1: Create expandable exercise card**

Create `components/ExerciseCard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Exercise, Muscle, MuscleBaselinesResponse, PlannedExercise } from '../types';
import { forecastMuscleFatigueForExercise, findOptimalVolume } from '../utils/volumeForecasting';
import { calculateSetsRepsWeight, adjustSetConfiguration } from '../utils/setBuilder';

interface ExerciseCardProps {
  exercise: Exercise;
  targetMuscle: Muscle;
  muscleStates: Record<Muscle, { currentFatiguePercent: number; baseline: number }>;
  efficiencyScore: number;
  efficiencyBadge: { label: string; color: 'green' | 'yellow' | 'red' };
  bottleneckMuscle: Muscle | null;
  onAddToWorkout: (planned: PlannedExercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  targetMuscle,
  muscleStates,
  efficiencyScore,
  efficiencyBadge,
  bottleneckMuscle,
  onAddToWorkout,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(3000);
  const [showSetBuilder, setShowSetBuilder] = useState(false);
  const [setConfig, setSetConfig] = useState(() => calculateSetsRepsWeight(volume));

  const targetEngagement = exercise.muscleEngagements.find(e => e.muscle === targetMuscle);
  const forecast = forecastMuscleFatigueForExercise(exercise.muscleEngagements, volume, muscleStates);

  const handleFindSweetSpot = () => {
    const optimal = findOptimalVolume(targetMuscle, exercise.muscleEngagements, muscleStates);
    setVolume(optimal);
  };

  const handleBuildSets = () => {
    setSetConfig(calculateSetsRepsWeight(volume));
    setShowSetBuilder(true);
  };

  const handleAddToWorkout = () => {
    onAddToWorkout({
      exercise,
      sets: setConfig.sets,
      reps: setConfig.reps,
      weight: setConfig.weight,
    });
  };

  useEffect(() => {
    setSetConfig(calculateSetsRepsWeight(volume));
  }, [volume]);

  const badgeColor = {
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  }[efficiencyBadge.color];

  return (
    <div className="bg-brand-muted rounded-lg p-4 hover:bg-brand-surface transition-colors">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-start justify-between gap-3"
      >
        <div className="flex-1">
          <h3 className="font-medium text-brand-text">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-brand-muted">
              {targetMuscle}: {targetEngagement?.percentage}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
              {efficiencyBadge.label}
            </span>
          </div>
        </div>
        <span className="text-brand-muted">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Volume Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-brand-muted">Volume</label>
              <span className="text-brand-text font-medium">{volume.toLocaleString()} lbs</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
            />
            <button
              onClick={handleFindSweetSpot}
              className="mt-2 text-sm text-brand-accent hover:underline"
            >
              Find Sweet Spot
            </button>
          </div>

          {/* Muscle Impact */}
          <div>
            <h4 className="text-sm font-medium text-brand-muted mb-2">Muscle Impact</h4>
            <div className="space-y-2">
              {Object.values(forecast).map((state) => (
                <div key={state.muscle}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={state.muscle === targetMuscle ? 'text-brand-accent font-medium' : 'text-brand-muted'}>
                      {state.muscle}
                    </span>
                    <span className="text-brand-text">
                      {Math.round(state.currentFatiguePercent)}% → {Math.round(state.forecastedFatiguePercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        state.forecastedFatiguePercent > 100 ? 'bg-red-500' :
                        state.forecastedFatiguePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, state.forecastedFatiguePercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {bottleneckMuscle && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ {bottleneckMuscle} will limit this exercise
              </p>
            )}
          </div>

          {/* Set Builder */}
          {!showSetBuilder ? (
            <button
              onClick={handleBuildSets}
              className="w-full px-4 py-2 bg-brand-accent text-brand-dark font-medium rounded-lg hover:bg-brand-accent/90"
            >
              Build Sets
            </button>
          ) : (
            <div className="border border-brand-accent/30 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">🔒 Target:</span>
                <span className="text-brand-text font-medium">{volume.toLocaleString()} lbs</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-brand-muted mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={setConfig.sets}
                    onChange={(e) => setSetConfig(adjustSetConfiguration(volume, setConfig, { sets: Number(e.target.value) }))}
                    className="w-full px-2 py-1 bg-brand-surface border border-brand-muted rounded text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-muted mb-1">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={setConfig.reps}
                    onChange={(e) => setSetConfig(adjustSetConfiguration(volume, setConfig, { reps: Number(e.target.value) }))}
                    className="w-full px-2 py-1 bg-brand-surface border border-brand-muted rounded text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-muted mb-1">Weight</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={setConfig.weight}
                    onChange={(e) => setSetConfig(adjustSetConfiguration(volume, setConfig, { weight: Number(e.target.value) }))}
                    className="w-full px-2 py-1 bg-brand-surface border border-brand-muted rounded text-brand-text"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-brand-muted">
                {setConfig.sets} × {setConfig.reps} × {setConfig.weight} lbs = {setConfig.sets * setConfig.reps * setConfig.weight} lbs
              </div>

              <button
                onClick={handleAddToWorkout}
                className="w-full px-4 py-2 bg-brand-accent text-brand-dark font-medium rounded-lg hover:bg-brand-accent/90"
              >
                Add to Workout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add components/ExerciseCard.tsx
git commit -m "feat: add ExerciseCard with volume slider and set builder"
```

---

## Task 6: Implement Recommended Tab

**Files:**
- Modify: `components/MuscleDeepDiveModal.tsx`

**Step 1: Add recommended exercises logic**

Update the `MuscleDeepDiveModal.tsx` to replace recommended tab content:

```typescript
import { EXERCISE_LIBRARY } from '../constants';
import { calculateEfficiencyScore, getEfficiencyBadge, findBottleneckMuscle } from '../utils/exerciseEfficiency';
import { ExerciseCard } from './ExerciseCard';

// Inside component, before return:
const exercisesForMuscle = EXERCISE_LIBRARY.filter(ex =>
  ex.muscleEngagements.some(e => e.muscle === muscle)
);

const muscleCapacities = Object.fromEntries(
  Object.entries(muscleStates).map(([m, state]) => [
    m,
    {
      currentFatiguePercent: state.currentFatiguePercent,
      baseline: muscleBaselines[m as Muscle] ?? 10000,
    },
  ])
);

const rankedExercises = exercisesForMuscle
  .map(ex => ({
    exercise: ex,
    efficiencyScore: calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities),
    efficiencyBadge: getEfficiencyBadge(calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities)),
    bottleneckMuscle: findBottleneckMuscle(muscle, ex.muscleEngagements, muscleCapacities),
  }))
  .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
  .slice(0, 5);

// In return, replace recommended tab content:
{activeTab === 'recommended' && (
  <div className="space-y-3">
    <p className="text-sm text-brand-muted mb-4">
      Top 5 exercises ranked by efficiency for {muscle}
    </p>
    {rankedExercises.map(({ exercise, efficiencyScore, efficiencyBadge, bottleneckMuscle }) => (
      <ExerciseCard
        key={exercise.id}
        exercise={exercise}
        targetMuscle={muscle}
        muscleStates={muscleCapacities}
        efficiencyScore={efficiencyScore}
        efficiencyBadge={efficiencyBadge}
        bottleneckMuscle={bottleneckMuscle}
        onAddToWorkout={onAddToWorkout}
      />
    ))}
  </div>
)}
```

**Step 2: Commit**

```bash
git add components/MuscleDeepDiveModal.tsx
git commit -m "feat: implement recommended tab with efficiency ranking"
```

---

## Task 7: Implement All Exercises Tab with Filters

**Files:**
- Modify: `components/MuscleDeepDiveModal.tsx`

**Step 1: Add filter state and logic**

Add state and filters before return in `MuscleDeepDiveModal.tsx`:

```typescript
const [isolationOnly, setIsolationOnly] = useState(false);
const [compoundOnly, setCompoundOnly] = useState(false);
const [highEfficiencyOnly, setHighEfficiencyOnly] = useState(false);
const [sortBy, setSortBy] = useState<'efficiency' | 'target' | 'alphabetical'>('efficiency');

const allExercises = exercisesForMuscle
  .map(ex => ({
    exercise: ex,
    efficiencyScore: calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities),
    efficiencyBadge: getEfficiencyBadge(calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities)),
    bottleneckMuscle: findBottleneckMuscle(muscle, ex.muscleEngagements, muscleCapacities),
  }))
  .filter(item => {
    if (isolationOnly) {
      const targetEngagement = item.exercise.muscleEngagements.find(e => e.muscle === muscle);
      const hasLowSupporting = item.exercise.muscleEngagements
        .filter(e => e.muscle !== muscle)
        .every(e => e.percentage < 30);
      if (!targetEngagement || targetEngagement.percentage < 70 || !hasLowSupporting) return false;
    }

    if (compoundOnly) {
      const multiMuscle = item.exercise.muscleEngagements.filter(e => e.percentage >= 30).length >= 2;
      if (!multiMuscle) return false;
    }

    if (highEfficiencyOnly) {
      if (item.efficiencyBadge.color !== 'green') return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (sortBy === 'efficiency') return b.efficiencyScore - a.efficiencyScore;
    if (sortBy === 'target') {
      const aTarget = a.exercise.muscleEngagements.find(e => e.muscle === muscle)?.percentage ?? 0;
      const bTarget = b.exercise.muscleEngagements.find(e => e.muscle === muscle)?.percentage ?? 0;
      return bTarget - aTarget;
    }
    return a.exercise.name.localeCompare(b.exercise.name);
  });

// In return, replace all exercises tab:
{activeTab === 'all' && (
  <div className="space-y-4">
    {/* Filters */}
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setIsolationOnly(!isolationOnly)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          isolationOnly
            ? 'bg-brand-accent text-brand-dark'
            : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
        }`}
      >
        Isolation Only
      </button>
      <button
        onClick={() => setCompoundOnly(!compoundOnly)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          compoundOnly
            ? 'bg-brand-accent text-brand-dark'
            : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
        }`}
      >
        Compound Only
      </button>
      <button
        onClick={() => setHighEfficiencyOnly(!highEfficiencyOnly)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          highEfficiencyOnly
            ? 'bg-brand-accent text-brand-dark'
            : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
        }`}
      >
        High Efficiency
      </button>
    </div>

    {/* Sort */}
    <div>
      <label className="text-xs text-brand-muted mr-2">Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className="px-3 py-1 bg-brand-surface border border-brand-muted rounded text-sm text-brand-text"
      >
        <option value="efficiency">Efficiency</option>
        <option value="target">Target %</option>
        <option value="alphabetical">Alphabetical</option>
      </select>
    </div>

    {/* Exercise List */}
    <div className="space-y-3">
      {allExercises.map(({ exercise, efficiencyScore, efficiencyBadge, bottleneckMuscle }) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          targetMuscle={muscle}
          muscleStates={muscleCapacities}
          efficiencyScore={efficiencyScore}
          efficiencyBadge={efficiencyBadge}
          bottleneckMuscle={bottleneckMuscle}
          onAddToWorkout={onAddToWorkout}
        />
      ))}
    </div>
  </div>
)}
```

**Step 2: Commit**

```bash
git add components/MuscleDeepDiveModal.tsx
git commit -m "feat: implement all exercises tab with filters and sorting"
```

---

## Task 8: Implement History Tab

**Files:**
- Modify: `components/MuscleDeepDiveModal.tsx`

**Step 1: Add workout history prop and display**

Update props interface:

```typescript
interface MuscleDeepDiveModalProps {
  // ... existing props
  workoutHistory: WorkoutSession[];
}
```

Add history logic before return:

```typescript
const exerciseHistory = workoutHistory
  .flatMap(workout =>
    workout.loggedExercises.map(logged => {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.id === logged.exerciseId);
      if (!exercise) return null;

      const engagesTargetMuscle = exercise.muscleEngagements.some(e => e.muscle === muscle);
      if (!engagesTargetMuscle) return null;

      const totalVolume = logged.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);

      return {
        exercise,
        workout,
        totalVolume,
        date: workout.endTime,
      };
    })
  )
  .filter(Boolean)
  .sort((a, b) => b!.date - a!.date)
  .slice(0, 3);

// In return, replace history tab:
{activeTab === 'history' && (
  <div className="space-y-3">
    {exerciseHistory.length === 0 ? (
      <p className="text-center text-brand-muted py-8">
        No training history for {muscle} yet
      </p>
    ) : (
      exerciseHistory.map((item, idx) => {
        if (!item) return null;
        const daysAgo = Math.floor((Date.now() - item.date) / (1000 * 60 * 60 * 24));
        return (
          <div key={idx} className="bg-brand-muted rounded-lg p-4">
            <h3 className="font-medium text-brand-text">{item.exercise.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-brand-muted">
              <span>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}</span>
              <span>•</span>
              <span>{item.totalVolume.toLocaleString()} lbs total</span>
            </div>
            <button className="text-xs text-brand-accent hover:underline mt-2">
              → View workout
            </button>
          </div>
        );
      })
    )}
  </div>
)}
```

**Step 2: Commit**

```bash
git add components/MuscleDeepDiveModal.tsx
git commit -m "feat: implement history tab with last 3 exercises"
```

---

## Task 9: Update MuscleVisualizationContainer for Single-Click

**Files:**
- Modify: `components/MuscleVisualization/MuscleVisualizationContainer.tsx`

**Step 1: Replace onMuscleSelect with onMuscleClick**

Change the prop interface from multi-select to single-click:

```typescript
// Change this:
interface MuscleVisualizationContainerProps {
  // ... other props
  onMuscleSelect?: (muscles: Muscle[]) => void;
}

// To this:
interface MuscleVisualizationContainerProps {
  // ... other props
  onMuscleClick?: (muscle: Muscle) => void;
}
```

**Step 2: Update muscle click handler**

Replace the multi-select logic with single-click:

```typescript
// Remove selectedMuscles state:
// const [selectedMuscles, setSelectedMuscles] = useState<Set<Muscle>>(new Set());

// Replace handleMuscleClick:
const handleMuscleClick = (muscle: Muscle) => {
  if (onMuscleClick) {
    onMuscleClick(muscle);
  }
};

// Remove the useEffect that called onMuscleSelect
```

**Step 3: Update MuscleVisualization component calls**

Remove selectedMuscles prop from both anterior and posterior views:

```typescript
<MuscleVisualization
  muscleStates={muscleStates}
  type="anterior"
  // Remove: selectedMuscles={selectedMuscles}
  onMuscleClick={handleMuscleClick}
  onMuscleHover={handleMuscleHover}
  // ... other props
/>
```

**Step 4: Commit**

```bash
git add components/MuscleVisualization/MuscleVisualizationContainer.tsx
git commit -m "refactor: change muscle visualization from multi-select to single-click"
```

---

## Task 10: Integrate Modal with Dashboard

**Files:**
- Modify: `components/Dashboard.tsx`

**Step 1: Add modal state and handler**

In Dashboard component, add:

```typescript
import { MuscleDeepDiveModal } from './MuscleDeepDiveModal';

// Add state:
const [deepDiveModalOpen, setDeepDiveModalOpen] = useState(false);
const [selectedMuscleForDeepDive, setSelectedMuscleForDeepDive] = useState<Muscle | null>(null);

// Add handler:
const handleMuscleClickForDeepDive = (muscle: Muscle) => {
  setSelectedMuscleForDeepDive(muscle);
  setDeepDiveModalOpen(true);
};

const handleAddToWorkout = (planned: PlannedExercise) => {
  // TODO: Integration with WorkoutPlannerModal
  console.log('Add to workout:', planned);
  setDeepDiveModalOpen(false);
};

// In MuscleVisualizationContainer, replace onMuscleSelect with onMuscleClick:
<MuscleVisualizationContainer
  // ... other props
  onMuscleClick={handleMuscleClickForDeepDive}  // Changed from onMuscleSelect
/>

// Add modal before closing tag:
{selectedMuscleForDeepDive && (
  <MuscleDeepDiveModal
    isOpen={deepDiveModalOpen}
    muscle={selectedMuscleForDeepDive}
    muscleStates={muscleStates}
    muscleBaselines={muscleBaselines}
    workoutHistory={workouts}
    onClose={() => setDeepDiveModalOpen(false)}
    onAddToWorkout={handleAddToWorkout}
  />
)}
```

**Step 2: Test manually**

1. Run dev server: `npm run dev`
2. Navigate to dashboard
3. Click on a muscle in visualization
4. Verify modal opens with correct muscle data
5. Test all three tabs
6. Test volume slider and set builder
7. Verify "Add to Workout" logs to console

**Step 3: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "feat: integrate MuscleDeepDiveModal with Dashboard"
```

---

## Implementation Complete!

**What we built:**
✅ Efficiency ranking algorithm (targets muscle max before bottleneck)
✅ Volume forecasting (real-time muscle impact visualization)
✅ Set builder with locked target volume
✅ Tab-based modal (Recommended / All Exercises / History)
✅ Interactive exercise cards with volume sliders
✅ Filter and sort controls
✅ Integration with Dashboard

**Next steps (deferred):**
- Integration with WorkoutPlannerModal (replace console.log)
- Add entry point from "Add Exercise" button
- Polish animations and loading states
- Mobile responsiveness testing
- Accessibility audit (keyboard nav, screen readers)

**Total estimated time:** 6-8 hours for core implementation
