import React, { useState } from 'react';
import { WorkoutTemplate } from '../types';
import { EXERCISE_LIBRARY } from '../constants';

interface TemplateCardProps {
  template: WorkoutTemplate;
  onLoad: (template: WorkoutTemplate) => void;
  onDelete: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const exerciseCount = template.exerciseIds && Array.isArray(template.exerciseIds)
    ? template.exerciseIds.length
    : 0;
  // Default to 3 sets per exercise (standard pattern in this app)
  const setCount = exerciseCount * 3;

  // Get exercise names for the expanded view
  const exerciseNames = template.exerciseIds.map(id => {
    const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
    return exercise ? exercise.name : 'Unknown Exercise';
  });

  // Format last used date
  const getLastUsedText = () => {
    if (template.timesUsed === 0) {
      return 'Never used';
    }
    // Use updatedAt as a proxy for last used
    // This is when the template was last modified, which typically happens when used
    const lastUsedDate = new Date(template.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUsedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Last used: Today';
    } else if (diffDays === 1) {
      return 'Last used: Yesterday';
    } else if (diffDays < 7) {
      return `Last used: ${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Last used: ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return `Last used: ${lastUsedDate.toLocaleDateString()}`;
    }
  };

  return (
    <div className="bg-brand-muted rounded-lg">
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left mb-3"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-lg">{template.name}</h4>
              <p className="text-sm text-slate-400">
                {template.category} • {template.variation}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="text-sm text-slate-300 mb-2">
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} • {setCount} sets • Used {template.timesUsed} {template.timesUsed === 1 ? 'time' : 'times'}
          </div>

          <div className="text-xs text-slate-400">
            {getLastUsedText()}
          </div>
        </button>

        {/* Expandable exercise list */}
        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="pb-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase mb-2">Exercises:</h5>
              <ul className="space-y-1">
                {exerciseNames.map((name, index) => (
                  <li key={index} className="text-sm text-slate-300 pl-2">
                    • {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
    </div>
  );
};

export default TemplateCard;
