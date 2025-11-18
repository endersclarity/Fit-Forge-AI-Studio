import React from 'react';
import { PlannedExercise } from '../../types/savedWorkouts';

interface ExerciseListPanelProps {
  exercises: PlannedExercise[];
  currentIndex: number;
  getProgress: (index: number) => { completed: number; total: number; isComplete: boolean };
  onSelectExercise: (index: number) => void;
  onFinishWorkout: () => void;
  isFinishing?: boolean;
}

const ExerciseListPanel: React.FC<ExerciseListPanelProps> = ({
  exercises,
  currentIndex,
  getProgress,
  onSelectExercise,
  onFinishWorkout,
  isFinishing = false,
}) => {
  return (
    <div className="w-2/5 border-r border-slate-200 dark:border-brand-muted p-4 overflow-y-auto flex flex-col">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
        EXERCISES
      </h3>
      <div className="space-y-2 flex-1">
        {exercises.map((ex, i) => {
          const progress = getProgress(i);
          const isActive = i === currentIndex;
          const isComplete = progress.isComplete;

          return (
            <div
              key={`${ex.exerciseId}-${i}`}
              onClick={() => onSelectExercise(i)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isComplete
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-slate-50 dark:bg-brand-dark border border-slate-200 dark:border-brand-muted hover:bg-slate-100 dark:hover:bg-brand-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {ex.exerciseName}
                </span>
                {isComplete ? (
                  <span className="text-green-600 dark:text-green-400">✓</span>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>
              {isActive && !isComplete && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Set {progress.completed + 1} of {progress.total}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onFinishWorkout}
        disabled={isFinishing}
        className="mt-4 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isFinishing ? 'Saving...' : 'Finish Workout'}
      </button>
    </div>
  );
};

export default ExerciseListPanel;
