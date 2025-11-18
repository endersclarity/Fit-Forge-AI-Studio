import React, { useState, useEffect } from 'react';
import { PlannedExercise } from '../../types/savedWorkouts';
import { CompletedSet } from '../../types/activeWorkout';

interface SetLoggerPanelProps {
  exercise: PlannedExercise;
  completedSets: CompletedSet[];
  currentSetInfo: {
    setNumber: number;
    totalSets: number;
    suggestedWeight: number | 'bodyweight';
    suggestedReps: number;
    suggestedRest: number;
  };
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  onLogSet: (weight: number | 'bodyweight', reps: number, rest: number) => void;
  onSkipRest: () => void;
}

const WEIGHT_OPTIONS: (number | 'bodyweight')[] = [
  'bodyweight',
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  110, 120, 130, 140, 150, 175, 200, 225, 250,
];

const SetLoggerPanel: React.FC<SetLoggerPanelProps> = ({
  exercise,
  completedSets,
  currentSetInfo,
  isRestTimerActive,
  restTimeRemaining,
  onLogSet,
  onSkipRest,
}) => {
  const [weight, setWeight] = useState<number | 'bodyweight'>(currentSetInfo.suggestedWeight);
  const [reps, setReps] = useState(currentSetInfo.suggestedReps);
  const [restSeconds, setRestSeconds] = useState(currentSetInfo.suggestedRest);

  // Update defaults when switching exercises or completing sets
  useEffect(() => {
    setWeight(currentSetInfo.suggestedWeight);
    setReps(currentSetInfo.suggestedReps);
    setRestSeconds(currentSetInfo.suggestedRest);
  }, [currentSetInfo.suggestedWeight, currentSetInfo.suggestedReps, currentSetInfo.suggestedRest]);

  const handleLogSet = () => {
    onLogSet(weight, reps, restSeconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get remaining planned sets (after completed ones)
  const remainingSets = exercise.sets.slice(completedSets.length + 1);

  return (
    <div className="w-3/5 p-6 flex flex-col overflow-y-auto">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {exercise.exerciseName}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Target: {exercise.sets.length} sets
      </p>

      {/* Rest Timer Overlay */}
      {isRestTimerActive && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-500">
          <div className="text-center">
            <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              REST TIME
            </div>
            <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300 mb-3">
              {formatTime(restTimeRemaining)}
            </div>
            <button
              onClick={onSkipRest}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg"
            >
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* Completed Sets */}
      {completedSets.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            COMPLETED SETS
          </h4>
          <div className="space-y-2">
            {completedSets.map((set, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    Set {i + 1}
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {set.weight === 'bodyweight' ? 'BW' : `${set.weight} lbs`} × {set.reps} reps
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Set to Log */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
          CURRENT SET ({currentSetInfo.setNumber} of {currentSetInfo.totalSets})
        </h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500 space-y-4">
          {/* Weight Input */}
          <div className="flex items-center gap-4">
            <label className="w-20 flex-shrink-0 text-slate-600 dark:text-slate-400">Weight</label>
            <select
              value={weight}
              onChange={(e) => {
                const val = e.target.value;
                setWeight(val === 'bodyweight' ? 'bodyweight' : parseInt(val));
              }}
              className="flex-1 min-w-0 text-xl font-bold text-center py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            >
              {WEIGHT_OPTIONS.map(w => (
                <option key={w} value={w}>
                  {w === 'bodyweight' ? 'Bodyweight' : `${w} lbs`}
                </option>
              ))}
            </select>
          </div>

          {/* Reps Input */}
          <div className="flex items-center gap-4">
            <label className="w-20 flex-shrink-0 text-slate-600 dark:text-slate-400">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              min={1}
              className="flex-1 min-w-0 text-xl font-bold text-center py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Rest Timer Setting */}
          <div className="flex items-center gap-4">
            <label className="w-20 flex-shrink-0 text-slate-600 dark:text-slate-400">Rest</label>
            <div className="flex-1 flex items-center justify-center gap-4">
              <button
                onClick={() => setRestSeconds(Math.max(0, restSeconds - 15))}
                className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg hover:bg-slate-300 dark:hover:bg-brand-muted/80"
              >
                -
              </button>
              <span className="text-xl font-semibold text-slate-900 dark:text-slate-100 min-w-[80px] text-center">
                {restSeconds}s
              </span>
              <button
                onClick={() => setRestSeconds(restSeconds + 15)}
                className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg hover:bg-slate-300 dark:hover:bg-brand-muted/80"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleLogSet}
            disabled={isRestTimerActive}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-lg shadow-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Log Set & Start Rest Timer
          </button>
        </div>
      </div>

      {/* Remaining Sets Preview */}
      {remainingSets.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            REMAINING
          </h4>
          <div className="space-y-2">
            {remainingSets.map((set, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-brand-dark p-3 rounded-lg border border-slate-200 dark:border-brand-muted opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    Set {completedSets.length + 2 + i}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {set.weight === 'bodyweight' ? 'BW' : `${set.weight} lbs`} × {set.reps} reps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="mt-4 w-full py-2 text-primary hover:text-primary-dark border border-dashed border-primary/50 rounded-lg">
        + Add Another Set
      </button>
    </div>
  );
};

export default SetLoggerPanel;
