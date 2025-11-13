import React, { useState, useEffect } from 'react';
import Sheet from '../src/design-system/components/primitives/Sheet';
import { getExerciseCalibrations } from '../api';
import { ExerciseCalibrationData, ExerciseEngagement } from '../types';

interface EngagementViewerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  onEdit?: () => void;
}

/**
 * Component to display muscle engagement breakdown for an exercise
 *
 * Features:
 * - Shows horizontal bars for each muscle
 * - Color-coded by percentage (red=high, yellow=medium, blue=low)
 * - Indicates whether engagement is default or calibrated by user
 * - Allows entering calibration edit mode
 */
export const EngagementViewer: React.FC<EngagementViewerProps> = ({
  isOpen,
  onClose,
  exerciseId,
  onEdit
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExerciseCalibrationData | null>(null);

  useEffect(() => {
    if (!isOpen || !exerciseId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getExerciseCalibrations(exerciseId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load engagement data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen, exerciseId]);

  /**
   * Get color class based on engagement percentage
   * Red = high (>= 60%), Yellow = medium (30-59%), Blue = low (< 30%)
   */
  const getColorClass = (percentage: number): string => {
    if (percentage >= 60) return 'bg-red-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  /**
   * Render engagement bar with percentage
   */
  const renderEngagementBar = (engagement: ExerciseEngagement) => {
    const colorClass = getColorClass(engagement.percentage);

    return (
      <div key={engagement.muscle} className="mb-4">
        {/* Muscle name and label */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900">
            {engagement.muscle}
          </span>
          <span className="text-xs text-gray-600">
            {engagement.isCalibrated ? 'Calibrated by you' : 'Default'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200/50 rounded-full h-6 overflow-hidden">
            <div
              className={`${colorClass} h-full transition-all duration-300 flex items-center justify-end pr-2`}
              style={{ width: `${engagement.percentage}%` }}
            >
              {engagement.percentage > 10 && (
                <span className="text-xs font-bold text-white">
                  {engagement.percentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          {engagement.percentage <= 10 && (
            <span className="text-xs font-medium text-gray-700 min-w-[40px]">
              {engagement.percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleSheetOpenChange}
      height="lg"
      title={data ? `${data.exerciseName} Muscle Engagement` : 'Muscle Engagement'}
      description="View and edit muscle engagement percentages"
    >
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          <p className="mt-2 text-gray-600">Loading engagement data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Engagement bars */}
          <div className="mb-6">
            {data.engagements.map(engagement => renderEngagementBar(engagement))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High (&ge;60%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium (30-59%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Low (&lt;30%)</span>
            </div>
          </div>

          {/* Edit button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Edit Calibration
            </button>
          )}

          {/* Info text */}
          <p className="mt-4 text-xs text-gray-600 text-center">
            Adjust engagement if exercises feel different to you based on your biomechanics and form.
          </p>
        </>
      )}
    </Sheet>
  );
};

export default EngagementViewer;
