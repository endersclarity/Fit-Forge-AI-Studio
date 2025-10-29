import React, { useState } from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselines } from '../types';

interface MuscleTarget {
  targetFatigue: number;  // Target fatigue percentage (0-100)
  maxAllowed: number | null;  // Optional constraint: don't exceed this percentage
}

export type MuscleTargets = Partial<Record<Muscle, MuscleTarget>>;

interface TargetModePanelProps {
  currentMuscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselines;
  onGenerate: (targets: MuscleTargets) => void;
  isGenerating?: boolean;
}

const MUSCLES = Object.values(Muscle);

const TargetModePanel: React.FC<TargetModePanelProps> = ({
  currentMuscleStates,
  muscleBaselines,
  onGenerate,
  isGenerating = false,
}) => {
  const [targets, setTargets] = useState<MuscleTargets>(() => {
    // Initialize with empty targets
    const initial: MuscleTargets = {};
    MUSCLES.forEach(muscle => {
      initial[muscle] = {
        targetFatigue: 0,
        maxAllowed: null,
      };
    });
    return initial;
  });

  const handleTargetChange = (muscle: Muscle, targetFatigue: number) => {
    setTargets(prev => ({
      ...prev,
      [muscle]: {
        ...prev[muscle]!,
        targetFatigue,
      },
    }));
  };

  const handleMaxAllowedChange = (muscle: Muscle, maxAllowed: number | null) => {
    setTargets(prev => ({
      ...prev,
      [muscle]: {
        ...prev[muscle]!,
        maxAllowed,
      },
    }));
  };

  const getCurrentFatigue = (muscle: Muscle): number => {
    return currentMuscleStates[muscle]?.currentFatiguePercent || 0;
  };

  const handleGenerate = () => {
    // Filter out muscles with zero target
    const activeTargets: MuscleTargets = {};
    Object.entries(targets).forEach(([muscle, target]) => {
      if (target && target.targetFatigue > 0) {
        activeTargets[muscle as Muscle] = target;
      }
    });
    onGenerate(activeTargets);
  };

  const hasActiveTargets = Object.values(targets).some(t => t && t.targetFatigue > 0);

  return (
    <div className="space-y-4">
      <div className="bg-brand-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Set Your Targets</h4>
        <p className="text-sm text-slate-400 mb-4">
          Set target fatigue levels for each muscle. The system will recommend exercises to reach your goals.
        </p>

        <div className="space-y-4">
          {MUSCLES.map(muscle => {
            const currentFatigue = getCurrentFatigue(muscle);
            const target = targets[muscle];
            const fatigueGap = target ? target.targetFatigue - currentFatigue : 0;

            return (
              <div key={muscle} className="bg-brand-dark p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{muscle}</div>
                    <div className="text-xs text-slate-400">
                      Current: {currentFatigue.toFixed(1)}%
                      {fatigueGap > 0 && (
                        <span className="text-brand-cyan ml-2">
                          → Target: {target?.targetFatigue}% (+{fatigueGap.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Fatigue Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400">Target Fatigue</label>
                    <span className="text-xs font-medium text-white">
                      {target?.targetFatigue || 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={target?.targetFatigue || 0}
                    onChange={(e) => handleTargetChange(muscle, Number(e.target.value))}
                    className="w-full h-2 bg-brand-muted rounded-lg appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-3
                               [&::-webkit-slider-thumb]:h-3
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-brand-cyan
                               [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-moz-range-thumb]:w-3
                               [&::-moz-range-thumb]:h-3
                               [&::-moz-range-thumb]:rounded-full
                               [&::-moz-range-thumb]:bg-brand-cyan
                               [&::-moz-range-thumb]:border-0
                               [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>

                {/* Optional Max Allowed Constraint */}
                {target && target.targetFatigue > 0 && (
                  <div className="pt-2 border-t border-brand-muted">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`max-${muscle}`}
                        checked={target.maxAllowed !== null}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleMaxAllowedChange(muscle, target.targetFatigue);
                          } else {
                            handleMaxAllowedChange(muscle, null);
                          }
                        }}
                        className="rounded bg-brand-muted border-slate-600"
                      />
                      <label htmlFor={`max-${muscle}`} className="text-xs text-slate-400">
                        Set maximum limit
                      </label>
                    </div>
                    {target.maxAllowed !== null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-slate-400">Max Allowed</label>
                          <span className="text-xs font-medium text-white">
                            {target.maxAllowed}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={target.targetFatigue}
                          max="100"
                          step="5"
                          value={target.maxAllowed}
                          onChange={(e) => handleMaxAllowedChange(muscle, Number(e.target.value))}
                          className="w-full h-2 bg-brand-muted rounded-lg appearance-none cursor-pointer
                                     [&::-webkit-slider-thumb]:appearance-none
                                     [&::-webkit-slider-thumb]:w-3
                                     [&::-webkit-slider-thumb]:h-3
                                     [&::-webkit-slider-thumb]:rounded-full
                                     [&::-webkit-slider-thumb]:bg-yellow-500
                                     [&::-webkit-slider-thumb]:cursor-pointer
                                     [&::-moz-range-thumb]:w-3
                                     [&::-moz-range-thumb]:h-3
                                     [&::-moz-range-thumb]:rounded-full
                                     [&::-moz-range-thumb]:bg-yellow-500
                                     [&::-moz-range-thumb]:border-0
                                     [&::-moz-range-thumb]:cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!hasActiveTargets || isGenerating}
        className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg
                   hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating Workout...' : 'Generate Workout'}
      </button>

      {!hasActiveTargets && (
        <div className="text-sm text-slate-400 text-center">
          Set at least one target to generate a workout
        </div>
      )}
    </div>
  );
};

export default TargetModePanel;
