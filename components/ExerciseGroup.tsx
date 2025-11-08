import React, { useState } from 'react';
import { BuilderSet } from '../types';
import SetCard from './SetCard';

interface ExerciseGroupProps {
  exerciseName: string;
  sets: BuilderSet[];
  startingSetNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
}

const ExerciseGroup: React.FC<ExerciseGroupProps> = ({
  exerciseName,
  sets,
  startingSetNumber,
  onEdit,
  onDelete,
  onDuplicate,
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
            <SetCard
              key={set.id}
              set={set}
              setNumber={startingSetNumber + idx}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseGroup;
