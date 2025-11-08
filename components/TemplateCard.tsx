import React from 'react';
import { WorkoutTemplate } from '../types';

interface TemplateCardProps {
  template: WorkoutTemplate;
  onLoad: (template: WorkoutTemplate) => void;
  onDelete: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, onDelete }) => {
  const exerciseCount = template.exerciseIds ? template.exerciseIds.length : 0;
  // Default to 3 sets per exercise (standard pattern in this app)
  const setCount = exerciseCount * 3;

  return (
    <div className="bg-brand-muted p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg">{template.name}</h4>
          <p className="text-sm text-slate-400">
            {template.category} • {template.variation}
          </p>
        </div>
        {template.isFavorite && <span className="text-xl">⭐</span>}
      </div>

      <div className="text-sm text-slate-300 mb-3">
        {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} • {setCount} sets
      </div>

      <div className="text-xs text-slate-400 mb-3">
        Used {template.timesUsed} {template.timesUsed === 1 ? 'time' : 'times'}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoad(template)}
          className="flex-1 bg-brand-cyan text-brand-dark font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Load
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
