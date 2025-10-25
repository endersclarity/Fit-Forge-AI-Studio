import React from 'react';
import { MuscleStatesResponse } from '../types';
import { groupMusclesByRecovery } from '../utils/statsHelpers';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RecoveryTimelineViewProps {
  muscleStates: MuscleStatesResponse;
  onMuscleClick?: (muscleName: string) => void;
}

const RecoveryTimelineView: React.FC<RecoveryTimelineViewProps> = ({
  muscleStates,
  onMuscleClick
}) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('dashboard-timeline-expanded', true);

  const groups = groupMusclesByRecovery(muscleStates);

  const handleMuscleClick = (muscleName: string) => {
    if (onMuscleClick) {
      onMuscleClick(muscleName);
    }
  };

  // Check if all muscles are ready
  const allRecovered = groups.recovering.length === 0 && groups.fatigued.length === 0;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-semibold text-slate-200">Recovery Timeline</h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-700 p-4">
          {allRecovered ? (
            <div className="text-center py-6">
              <div className="text-green-400 text-lg mb-2">✅ All muscle groups fully recovered!</div>
              <div className="text-slate-400 text-sm">Ready for any workout type</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ready Now Group */}
              {groups.ready.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-green-400 font-semibold">
                      ✅ READY NOW
                    </span>
                    <span className="ml-2 text-slate-500 text-sm">
                      ({groups.ready.length} muscle{groups.ready.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {groups.ready.map(({ muscle }) => (
                      <button
                        key={muscle}
                        onClick={() => handleMuscleClick(muscle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleMuscleClick(muscle);
                          }
                        }}
                        className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        tabIndex={0}
                      >
                        {muscle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recovering Soon Group */}
              {groups.recovering.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-400 font-semibold">
                      ⏳ RECOVERING SOON
                    </span>
                    <span className="ml-2 text-slate-500 text-sm">
                      ({groups.recovering.length} muscle{groups.recovering.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {groups.recovering.map(({ muscle, daysUntil }) => (
                      <button
                        key={muscle}
                        onClick={() => handleMuscleClick(muscle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleMuscleClick(muscle);
                          }
                        }}
                        className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between">
                          <span>{muscle}</span>
                          <span className="text-yellow-400 text-xs ml-2">
                            {daysUntil}d
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Still Fatigued Group */}
              {groups.fatigued.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-red-400 font-semibold">
                      🔴 STILL FATIGUED
                    </span>
                    <span className="ml-2 text-slate-500 text-sm">
                      ({groups.fatigued.length} muscle{groups.fatigued.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {groups.fatigued.map(({ muscle, daysUntil }) => (
                      <button
                        key={muscle}
                        onClick={() => handleMuscleClick(muscle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleMuscleClick(muscle);
                          }
                        }}
                        className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between">
                          <span>{muscle}</span>
                          <span className="text-red-400 text-xs ml-2">
                            {daysUntil}d
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecoveryTimelineView;
