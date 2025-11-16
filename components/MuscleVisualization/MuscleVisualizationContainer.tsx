import React, { useCallback } from 'react';
import { MuscleStatesResponse, Muscle } from '../../types';
import { useMuscleVisualization } from './useMuscleVisualization';
import { MuscleVisualizationDual } from '../MuscleVisualization';

export interface MuscleVisualizationContainerProps {
  muscleStates: MuscleStatesResponse;
  onRefresh?: () => Promise<void>;
  onMuscleClick?: (muscle: Muscle) => void;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

/**
 * Top-level container for muscle visualization
 * Manages all visualization state and coordinates child components
 */
const MuscleVisualizationContainerComponent: React.FC<MuscleVisualizationContainerProps> = ({
  muscleStates,
  onRefresh,
  onMuscleClick,
  loading = false,
  error = null,
  className = ''
}) => {
  const {
    viewMode,
    isCollapsed,
    showCalibrationIndicators,
    setViewMode,
    toggleCollapsed,
    toggleCalibrationIndicators
  } = useMuscleVisualization();

  // Memoize event handler to prevent recreation on each render
  const handleMuscleClick = useCallback((muscle: Muscle) => {
    if (onMuscleClick) {
      onMuscleClick(muscle);
    }
  }, [onMuscleClick]);

  // Loading state
  if (loading) {
    return (
      <div className={`muscle-viz-loading ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" role="status" aria-label="Loading muscle data">
            <span className="sr-only">Loading muscle data...</span>
          </div>
          <p className="mt-4 text-slate-400">Loading muscle states...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`muscle-viz-error ${className}`} role="alert">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Unable to load muscle data</h3>
          <p className="text-slate-300 mb-4">{error.message}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state (no data)
  if (!muscleStates || Object.keys(muscleStates).length === 0) {
    return (
      <div className={`muscle-viz-empty ${className}`}>
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No muscle data available</h3>
          <p className="text-slate-400 mb-4">Complete your first workout to see muscle fatigue visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`muscle-viz-container ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Muscle Recovery Status</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Refresh muscle states"
              title="Refresh muscle states"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4">
        <p className="text-slate-400 text-center text-sm">
          <span className="inline-flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: '#6bcf7f'}}></span>
              <span className="text-xs">Ready</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: '#fdd835'}}></span>
              <span className="text-xs">Moderate</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: '#ff6b6b'}}></span>
              <span className="text-xs">Fatigued</span>
            </span>
          </span>
        </p>
        <p className="text-slate-500 text-center text-xs mt-1">
          Click muscles to view deep-dive modal
        </p>
      </div>

      {/* Visualization */}
      <div className="muscle-viz-display">
        {viewMode === 'dual' ? (
          <MuscleVisualizationDual
            muscleStates={muscleStates}
            onMuscleClick={handleMuscleClick}
          />
        ) : (
          <div>Single view not yet implemented</div>
        )}
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders when parent state changes
export const MuscleVisualizationContainer = React.memo(MuscleVisualizationContainerComponent);
