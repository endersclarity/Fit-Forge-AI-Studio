import React, { useState } from 'react';
import { BuilderSet } from '../types';
import HorizontalSetInput from './HorizontalSetInput';

interface ExerciseGroupProps {
  exerciseName: string;
  sets: BuilderSet[];
  startingSetNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
  onWeightChange?: (setId: string, weight: number) => void;
  onRepsChange?: (setId: string, reps: number) => void;
}

const ExerciseGroup: React.FC<ExerciseGroupProps> = ({
  exerciseName,
  sets,
  startingSetNumber,
  onEdit,
  onDelete,
  onDuplicate,
  onWeightChange,
  onRepsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-brand-dark rounded-lg overflow-hidden">
      {/* Exercise Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-brand-muted px-4 py-3 flex items-center justify-between hover:bg-brand-dark transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <h5 className="font-semibold text-white">{exerciseName}</h5>
        </div>
        <div className="text-sm text-slate-400">
          {sets.length} {sets.length === 1 ? 'set' : 'sets'}
        </div>
      </button>

      {/* Sets List */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {sets.map((set, idx) => (
            <div key={set.id} className="bg-brand-muted p-3 rounded-lg">
              <HorizontalSetInput
                setNumber={startingSetNumber + idx}
                exerciseName={set.exerciseName}
                weight={set.weight}
                reps={set.reps}
                restTimerSeconds={set.restTimerSeconds}
                isLogged={false}
                isActive={false}
                onWeightChange={(weight) => onWeightChange && onWeightChange(set.id, weight)}
                onRepsChange={(reps) => onRepsChange && onRepsChange(set.id, reps)}
                onLog={() => {}}
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => onEdit(set)}
                  className="text-xs text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDuplicate(set)}
                  className="text-xs text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1"
                >
                  Dup
                </button>
                <button
                  onClick={() => onDelete(set.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseGroup;
