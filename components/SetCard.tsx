import React from 'react';
import { BuilderSet } from '../types';

interface SetCardProps {
  set: BuilderSet;
  setNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
}

const SetCard: React.FC<SetCardProps> = ({
  set,
  setNumber,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div className="bg-brand-muted p-3 rounded-lg flex items-center gap-3">
      <div className="flex-1">
        <div className="font-semibold">{set.exerciseName}</div>
        <div className="text-sm text-slate-400">
          Set {setNumber}: {set.reps} reps @ {set.weight} lbs • {set.restTimerSeconds}s rest
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(set)}
          className="bg-brand-dark text-slate-300 hover:text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
          title="Edit set"
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(set)}
          className="bg-brand-dark text-brand-cyan hover:text-cyan-400 px-3 py-1 rounded text-sm font-semibold transition-colors"
          title="Duplicate set"
        >
          Dup
        </button>
        <button
          onClick={() => onDelete(set.id)}
          className="bg-brand-dark text-red-500 hover:text-red-400 px-3 py-1 rounded text-sm font-semibold transition-colors"
          title="Delete set"
        >
          Del
        </button>
      </div>
    </div>
  );
};

export default SetCard;
