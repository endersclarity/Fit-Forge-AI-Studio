import React, { useMemo } from 'react';
import { WorkoutTemplate } from '../types';
import { ChevronDownIcon } from './Icons';

interface DashboardQuickStartProps {
  templates: WorkoutTemplate[];
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onViewAllTemplates: () => void;
}

const DashboardQuickStart: React.FC<DashboardQuickStartProps> = ({
  templates,
  onSelectTemplate,
  onViewAllTemplates
}) => {
  // Select 4 templates: favorites first, then by usage, then alphabetically
  const selectedTemplates = useMemo(() => {
    const sorted = [...templates].sort((a, b) => {
      // First: favorites (true before false)
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      // Second: times used (descending)
      if (a.timesUsed !== b.timesUsed) {
        return b.timesUsed - a.timesUsed;
      }
      // Third: alphabetically by name
      return a.name.localeCompare(b.name);
    });
    return sorted.slice(0, 4);
  }, [templates]);

  const getEquipmentString = (equipment: string[]): string => {
    if (equipment.length === 0) return 'Bodyweight';
    if (equipment.length === 1) return equipment[0];
    return equipment.slice(0, 2).join(', ');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Quick Start</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {selectedTemplates.map((template) => {
          // Calculate equipment needed for this template
          // (This would require accessing EXERCISE_LIBRARY from parent or prop)
          const equipment: string[] = [];

          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="bg-brand-surface rounded-lg p-4 hover:bg-opacity-80 transition-colors text-left active:scale-95"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">
                      {template.name}
                    </h3>
                    {template.isFavorite && (
                      <span className="text-xs text-yellow-400">⭐</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {template.exerciseIds.length} exercises
                  </p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-brand-cyan flex-shrink-0 -rotate-90" />
              </div>

              {template.timesUsed > 0 && (
                <p className="text-xs text-slate-500">
                  Used {template.timesUsed}x
                </p>
              )}
            </button>
          );
        })}
      </div>

      {templates.length > 4 && (
        <button
          onClick={onViewAllTemplates}
          className="mt-4 w-full text-center text-brand-cyan hover:text-brand-cyan text-sm font-semibold py-2 rounded-lg hover:bg-brand-surface transition-colors"
        >
          View All Templates →
        </button>
      )}
    </div>
  );
};

export default DashboardQuickStart;
