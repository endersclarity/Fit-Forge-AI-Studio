import React from 'react';
import { PlannedExercise, MuscleBaselinesResponse } from '../types';
import { formatMuscleImpact } from '../utils/workoutPlanner';
import { XIcon } from './Icons';

interface PlannedExerciseListProps {
  exercises: PlannedExercise[];
  onUpdate: (index: number, updated: PlannedExercise) => void;
  onRemove: (index: number) => void;
  muscleBaselines: MuscleBaselinesResponse;
}

const PlannedExerciseList: React.FC<PlannedExerciseListProps> = ({
  exercises,
  onUpdate,
  onRemove,
  muscleBaselines
}) => {
  const handleInputChange = (
    index: number,
    field: 'sets' | 'reps' | 'weight',
    value: string
  ) => {
    const numValue = Math.max(1, parseInt(value) || 1); // Minimum 1, default to 1 if invalid
    const updated = { ...exercises[index], [field]: numValue };
    onUpdate(index, updated);
  };

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-brand-surface rounded-lg border border-brand-muted">
        <p className="text-brand-muted text-center mb-2">No exercises planned yet</p>
        <p className="text-sm text-brand-muted/60 text-center">
          Click "Add Exercise" below to start building your workout
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((planned, index) => {
        const impacts = formatMuscleImpact(
          planned.exercise,
          planned.sets,
          planned.reps,
          planned.weight,
          muscleBaselines
        );

        return (
          <div
            key={`${planned.exercise.id}-${index}`}
            className="bg-brand-surface rounded-lg border border-brand-muted p-4 hover:border-brand-accent/30 transition-colors"
          >
            {/* Header: Exercise name and remove button */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-brand-text font-medium mb-1">
                  {index + 1}. {planned.exercise.name}
                </h3>
                <p className="text-xs text-brand-muted">
                  {planned.exercise.category} • {planned.exercise.difficulty}
                </p>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                aria-label={`Remove ${planned.exercise.name}`}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs: Sets, Reps, Weight */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label
                  htmlFor={`sets-${index}`}
                  className="block text-xs text-brand-muted mb-1"
                >
                  Sets
                </label>
                <input
                  id={`sets-${index}`}
                  type="number"
                  min="1"
                  value={planned.sets}
                  onChange={(e) => handleInputChange(index, 'sets', e.target.value)}
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-muted rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor={`reps-${index}`}
                  className="block text-xs text-brand-muted mb-1"
                >
                  Reps
                </label>
                <input
                  id={`reps-${index}`}
                  type="number"
                  min="1"
                  value={planned.reps}
                  onChange={(e) => handleInputChange(index, 'reps', e.target.value)}
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-muted rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor={`weight-${index}`}
                  className="block text-xs text-brand-muted mb-1"
                >
                  Weight (lbs)
                </label>
                <input
                  id={`weight-${index}`}
                  type="number"
                  min="1"
                  value={planned.weight}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-muted rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Muscle Impact Display */}
            {impacts.length > 0 && (
              <div className="pt-3 border-t border-brand-muted/30">
                <p className="text-xs text-brand-muted/60 mb-1">Impact:</p>
                <div className="flex flex-wrap gap-2">
                  {impacts.map((impact, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-xs rounded-md font-medium"
                    >
                      {impact}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlannedExerciseList;
