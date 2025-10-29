import React, { useState, useEffect, useMemo } from 'react';
import { generateSetsFromVolume, formatSetBreakdown, calculateProgressiveOverload, LastPerformance, SetBreakdown } from '../utils/setBuilder';

interface VolumeSliderProps {
  /** Current target volume in lbs */
  value: number;
  /** Callback when volume changes */
  onChange: (volume: number) => void;
  /** Last performance data for this exercise */
  lastPerformance?: LastPerformance & { sets?: number };
  /** Loading state while fetching history */
  isLoading?: boolean;
  /** Callback when user clicks fine-tune button */
  onFineTune?: (breakdown: SetBreakdown) => void;
  /** Maximum volume for slider */
  maxVolume?: number;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  lastPerformance,
  isLoading = false,
  onFineTune,
  maxVolume = 10000
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Calculate set breakdown (memoized to prevent recalculation on every render)
  const breakdown = useMemo(() => {
    return generateSetsFromVolume(localValue, lastPerformance);
  }, [localValue, lastPerformance]);

  // Calculate progressive overload if we have last performance
  const progressComparison = useMemo(() => {
    if (!lastPerformance) return null;
    return calculateProgressiveOverload(breakdown, lastPerformance);
  }, [breakdown, lastPerformance]);

  // Handle slider change with debouncing
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
  };

  // Commit change when user releases slider (debounce)
  const handleSliderRelease = () => {
    onChange(localValue);
  };

  return (
    <div className="space-y-3 p-4 bg-brand-dark rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          Target Volume
        </label>
        {isLoading && (
          <span className="text-xs text-slate-400">
            Loading history...
          </span>
        )}
      </div>

      {/* Volume display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-white">
          {localValue.toLocaleString()} lbs
        </div>
        <div className="text-lg text-slate-300 mt-1">
          {formatSetBreakdown(breakdown)}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max={maxVolume}
          step="50"
          value={localValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          disabled={isLoading}
          className="w-full h-2 bg-brand-muted rounded-lg appearance-none cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-brand-cyan
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-brand-cyan
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />
        {/* Range labels */}
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0</span>
          <span>{maxVolume.toLocaleString()} lbs</span>
        </div>
      </div>

      {/* Progressive overload comparison */}
      {lastPerformance && progressComparison && (
        <div className="flex items-center justify-between p-3 bg-brand-muted rounded">
          <div className="text-sm">
            <div className="text-slate-400">Last time:</div>
            <div className="font-medium text-white">
              {lastPerformance.sets || 3}×{lastPerformance.reps}@{lastPerformance.weight}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Today:</div>
            <div className="font-medium text-white">
              {formatSetBreakdown(breakdown)}
            </div>
          </div>
          <div className={`ml-3 px-2 py-1 rounded text-sm font-semibold ${
            progressComparison.percentage >= 0
              ? 'bg-green-900 text-green-300'
              : 'bg-red-900 text-red-300'
          }`}>
            {progressComparison.description}
          </div>
        </div>
      )}

      {/* No history message */}
      {!lastPerformance && !isLoading && (
        <div className="text-sm text-slate-400 text-center">
          No previous history for this exercise
        </div>
      )}

      {/* Fine-tune button */}
      {onFineTune && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => onFineTune(breakdown)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-brand-cyan
                       hover:bg-brand-muted rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Fine-tune manually
          </button>
        </div>
      )}
    </div>
  );
};

export default VolumeSlider;
