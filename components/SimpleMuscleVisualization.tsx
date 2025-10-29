import React from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselines } from '../types';

interface SimpleMuscleVisualizationProps {
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselines;
  opacity?: number;
}

const SimpleMuscleVisualization: React.FC<SimpleMuscleVisualizationProps> = ({
  muscleStates,
  muscleBaselines,
  opacity = 1.0,
}) => {
  // Filter to only show muscles with fatigue > 0
  const activeMuscles = Object.entries(muscleStates).filter(
    ([_, state]) => (state.currentFatiguePercent || 0) > 0
  );

  if (activeMuscles.length === 0) {
    return (
      <div className="bg-brand-muted p-4 rounded-lg text-center text-slate-400 text-sm">
        No muscle fatigue to display
      </div>
    );
  }

  // Calculate summary stats
  const highFatigueMuscles = activeMuscles.filter(([_, state]) => (state.currentFatiguePercent || 0) > 80).length;
  const mediumFatigueMuscles = activeMuscles.filter(([_, state]) => {
    const fatigue = state.currentFatiguePercent || 0;
    return fatigue > 50 && fatigue <= 80;
  }).length;

  return (
    <div className="bg-brand-muted p-4 rounded-lg" style={{ opacity }}>
      {/* Summary Stats */}
      <div className="flex gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-slate-400">{activeMuscles.length - highFatigueMuscles - mediumFatigueMuscles} low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span className="text-slate-400">{mediumFatigueMuscles} medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-400">{highFatigueMuscles} high</span>
        </div>
      </div>

      {/* Individual Muscle Bars */}
      <div className="space-y-2">
        {activeMuscles.map(([muscleName, state]) => {
          const fatiguePercent = state.currentFatiguePercent || 0;
          const cappedFatigue = Math.min(100, fatiguePercent); // Cap at 100%

          return (
            <div key={muscleName}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{muscleName}</span>
                <span className="text-slate-400">{Math.round(cappedFatigue)}%</span>
              </div>
              <div className="w-full bg-brand-dark rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    cappedFatigue > 80 ? 'bg-red-500' :
                    cappedFatigue > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${cappedFatigue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleMuscleVisualization;
