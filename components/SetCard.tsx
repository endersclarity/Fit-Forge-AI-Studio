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
          Set {setNumber}: {set.reps} reps @ {set.weight} lbs " {set.restTimerSeconds}s rest
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDuplicate(set)}
          className="text-brand-cyan hover:text-cyan-400 text-xl"
          title="Duplicate set"
        >
          +
        </button>
        <button
          onClick={() => onEdit(set)}
          className="text-slate-400 hover:text-white text-xl"
          title="Edit set"
        >
          
        </button>
        <button
          onClick={() => onDelete(set.id)}
          className="text-red-500 hover:text-red-400 text-xl"
          title="Delete set"
        >
          =Ñ
        </button>
      </div>
    </div>
  );
};

export default SetCard;
