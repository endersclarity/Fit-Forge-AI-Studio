import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const ExerciseCardComponent: React.FC<ExerciseCardProps> = ({
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

  // Memoize expensive calculations
  const targetEngagement = useMemo(
    () => exercise.muscleEngagements.find(e => e.muscle === targetMuscle),
    [exercise.muscleEngagements, targetMuscle]
  );

  const forecast = useMemo(
    () => forecastMuscleFatigueForExercise(exercise.muscleEngagements, volume, muscleStates),
    [exercise.muscleEngagements, volume, muscleStates]
  );

  // Memoize event handlers to prevent child re-renders
  const handleFindSweetSpot = useCallback(() => {
    const optimal = findOptimalVolume(targetMuscle, exercise.muscleEngagements, muscleStates);
    setVolume(optimal);
  }, [targetMuscle, exercise.muscleEngagements, muscleStates]);

  const handleBuildSets = useCallback(() => {
    setSetConfig(calculateSetsRepsWeight(volume));
    setShowSetBuilder(true);
  }, [volume]);

  const handleAddToWorkout = useCallback(() => {
    onAddToWorkout({
      exercise,
      sets: setConfig.sets,
      reps: setConfig.reps,
      weight: setConfig.weight,
    });
  }, [onAddToWorkout, exercise, setConfig]);

  useEffect(() => {
    setSetConfig(calculateSetsRepsWeight(volume));
  }, [volume]);

  // Memoize badge color computation
  const badgeColor = useMemo(() => ({
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  }[efficiencyBadge.color]), [efficiencyBadge.color]);

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

// Wrap with React.memo to prevent unnecessary re-renders when props haven't changed
// This is beneficial because ExerciseCard is rendered in lists and receives complex props
export const ExerciseCard = React.memo(ExerciseCardComponent);
