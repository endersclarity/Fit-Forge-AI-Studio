import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { saveExerciseCalibrations, deleteExerciseCalibrations } from '../api';
import { ExerciseCalibrationData, ExerciseEngagement } from '../types';

interface CalibrationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ExerciseCalibrationData;
  onSave?: () => void;
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

/**
 * Component for editing muscle engagement percentages with sliders
 *
 * Features:
 * - Slider for each muscle (0-100%)
 * - Real-time total percentage display
 * - Warnings for unreasonable totals or large deviations
 * - Reset to default functionality
 * - Save/Cancel actions
 */
export const CalibrationEditor: React.FC<CalibrationEditorProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  // State for slider values (muscle name -> percentage)
  const [calibrations, setCalibrations] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize calibrations from initial data
  useEffect(() => {
    if (!initialData) return;

    const initialCalibrations: Record<string, number> = {};
    initialData.engagements.forEach(eng => {
      initialCalibrations[eng.muscle] = eng.percentage;
    });
    setCalibrations(initialCalibrations);
  }, [initialData]);

  // Get default values for comparison
  const defaults = useMemo(() => {
    const defaultValues: Record<string, number> = {};
    initialData.engagements.forEach(eng => {
      // If not calibrated, this IS the default value
      if (!eng.isCalibrated) {
        defaultValues[eng.muscle] = eng.percentage;
      } else {
        // For calibrated values, we don't have the original default readily available
        // In a production app, you'd fetch this from the EXERCISE_LIBRARY
        // For now, we'll use the current value as a placeholder
        defaultValues[eng.muscle] = eng.percentage;
      }
    });
    return defaultValues;
  }, [initialData]);

  /**
   * Calculate total engagement percentage
   */
  const totalEngagement = useMemo(() => {
    return Object.values(calibrations).reduce((sum, val) => sum + val, 0);
  }, [calibrations]);

  /**
   * Validate calibrations and return warnings
   */
  const validation = useMemo((): ValidationResult => {
    const warnings: string[] = [];

    // Check reasonable range
    if (totalEngagement < 100) {
      warnings.push('Total engagement is unusually low (<100%). This may affect recommendations.');
    }
    if (totalEngagement > 300) {
      warnings.push('Total engagement is very high (>300%). Consider reducing some muscles.');
    }

    // Check large deviations
    for (const [muscle, percentage] of Object.entries(calibrations)) {
      const defaultValue = defaults[muscle] ?? 0;
      if (defaultValue === 0) continue; // Skip if no default

      const deviation = Math.abs(percentage - defaultValue);
      const percentChange = (deviation / defaultValue) * 100;

      if (percentChange > 50) {
        warnings.push(
          `${muscle} differs by ${Math.round(percentChange)}% from default. Are you sure this is correct?`
        );
      }
    }

    return {
      valid: warnings.length === 0 || totalEngagement >= 50,
      warnings
    };
  }, [calibrations, defaults, totalEngagement]);

  /**
   * Handle slider change
   */
  const handleSliderChange = (muscle: string, value: number) => {
    setCalibrations(prev => ({
      ...prev,
      [muscle]: Math.max(0, Math.min(100, value))
    }));
  };

  /**
   * Handle increment/decrement buttons
   */
  const handleIncrement = (muscle: string, delta: number) => {
    const currentValue = calibrations[muscle] ?? 0;
    const newValue = Math.max(0, Math.min(100, currentValue + delta));
    handleSliderChange(muscle, newValue);
  };

  /**
   * Reset to defaults
   */
  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);
      await deleteExerciseCalibrations(initialData.exerciseId);
      setShowResetConfirm(false);
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset calibrations');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save calibrations
   */
  const handleSave = async () => {
    if (!validation.valid) {
      setError('Total engagement must be at least 50%. Please adjust your calibrations.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await saveExerciseCalibrations(initialData.exerciseId, calibrations);
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save calibrations');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Get color for deviation indicator
   */
  const getDeviationColor = (muscle: string): string => {
    const current = calibrations[muscle] ?? 0;
    const defaultValue = defaults[muscle] ?? 0;
    const diff = current - defaultValue;

    if (Math.abs(diff) < 5) return 'text-gray-400';
    if (diff > 0) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Calibrate ${initialData.exerciseName} Engagement`}
      className="max-w-2xl"
    >
      {showResetConfirm ? (
        // Reset confirmation dialog
        <div className="text-center py-4">
          <p className="text-white mb-6">
            Are you sure you want to reset this exercise to default engagement percentages?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={saving}
            >
              {saving ? 'Resetting...' : 'Reset to Default'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Sliders for each muscle */}
          <div className="space-y-6 mb-6">
            {initialData.engagements.map(engagement => {
              const currentValue = calibrations[engagement.muscle] ?? engagement.percentage;
              const defaultValue = defaults[engagement.muscle] ?? engagement.percentage;
              const diff = currentValue - defaultValue;

              return (
                <div key={engagement.muscle} className="space-y-2">
                  {/* Muscle name and current value */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {engagement.muscle}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {currentValue.toFixed(0)}%
                    </span>
                  </div>

                  {/* Slider with increment/decrement buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(engagement.muscle, -5)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Decrease ${engagement.muscle} by 5%`}
                    >
                      −
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentValue}
                      onChange={(e) => handleSliderChange(engagement.muscle, Number(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      style={{
                        background: `linear-gradient(to right, rgb(var(--color-primary)) 0%, rgb(var(--color-primary)) ${currentValue}%, rgba(255,255,255,0.1) ${currentValue}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />

                    <button
                      onClick={() => handleIncrement(engagement.muscle, 5)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Increase ${engagement.muscle} by 5%`}
                    >
                      +
                    </button>
                  </div>

                  {/* Default comparison */}
                  <div className={`text-xs ${getDeviationColor(engagement.muscle)}`}>
                    Default: {defaultValue.toFixed(0)}%
                    {diff !== 0 && ` (${diff > 0 ? '+' : ''}${diff.toFixed(0)}%)`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total engagement display */}
          <div className={`p-4 rounded-lg mb-6 ${
            totalEngagement < 100 || totalEngagement > 300
              ? 'bg-yellow-900/20 border border-yellow-500'
              : 'bg-green-900/20 border border-green-500'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Total Engagement:</span>
              <span className="text-xl font-bold text-white">{totalEngagement.toFixed(0)}%</span>
            </div>
            {(totalEngagement < 100 || totalEngagement > 300) && (
              <p className="text-xs text-yellow-400 mt-1">
                Typical range: 100-300%
              </p>
            )}
          </div>

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6 space-y-2">
              {validation.warnings.map((warning, idx) => (
                <p key={idx} className="text-xs text-yellow-400">⚠️ {warning}</p>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              disabled={saving}
            >
              Reset to Default
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || !validation.valid}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Help text */}
          <p className="mt-4 text-xs text-gray-400 text-center">
            💡 Tip: Start with small adjustments (±10-20%) and test how recommendations change.
          </p>
        </>
      )}
    </Modal>
  );
};

export default CalibrationEditor;
