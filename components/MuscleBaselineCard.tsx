import React, { useState } from 'react';
import { MuscleBaselineData } from '../types';

interface MuscleBaselineCardProps {
  muscleName: string;
  baseline: MuscleBaselineData;
  onUpdate: (muscleName: string, userOverride: number | null) => void;
}

const MuscleBaselineCard: React.FC<MuscleBaselineCardProps> = ({
  muscleName,
  baseline,
  onUpdate
}) => {
  const [overrideInput, setOverrideInput] = useState<string>(
    baseline.userOverride?.toString() || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  // Calculate effective max (override takes priority)
  const effectiveMax = baseline.userOverride ?? baseline.systemLearnedMax;

  // Check if system has learned a higher value than user override
  const systemExceedsOverride = baseline.userOverride !== null &&
    baseline.systemLearnedMax > baseline.userOverride;

  const handleSave = () => {
    const value = parseFloat(overrideInput);

    if (overrideInput === '' || isNaN(value)) {
      // Clear override
      onUpdate(muscleName, null);
      setOverrideInput('');
    } else if (value >= 100 && value <= 1000000) {
      // Valid override
      onUpdate(muscleName, value);
    }

    setIsEditing(false);
  };

  const handleClear = () => {
    setOverrideInput('');
    onUpdate(muscleName, null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setOverrideInput(baseline.userOverride?.toString() || '');
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-lg border border-brand-muted bg-brand-surface p-4 space-y-3">
      {/* Muscle Name Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-100">{muscleName}</h4>
        <div className="text-xs text-slate-400">
          {baseline.userOverride !== null ? '✏️ Override Active' : '🤖 System Learning'}
        </div>
      </div>

      {/* System Learned Max */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase">🤖 System Learned</p>
        <p className="text-sm text-slate-300">
          {baseline.systemLearnedMax.toLocaleString()} lbs
          {baseline.systemLearnedMax === 10000 && (
            <span className="ml-2 text-xs text-yellow-400">(Default - No data yet)</span>
          )}
        </p>
      </div>

      {/* User Override Input */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase">✏️ Your Override</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={overrideInput}
            onChange={(e) => setOverrideInput(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              // Don't blur if clicking Clear or Save buttons
              setTimeout(() => {
                if (isEditing) {
                  setIsEditing(false);
                }
              }, 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Optional"
            min="100"
            max="1000000"
            className="flex-1 bg-brand-dark border border-brand-muted rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none"
          />
          {overrideInput && (
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-red-900/30 text-red-400 border border-red-500/50 rounded hover:bg-red-900/50 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          )}
          {isEditing && overrideInput && (
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-brand-cyan text-brand-dark rounded hover:bg-cyan-400 transition-colors text-sm font-medium"
            >
              Save
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">Range: 100 - 1,000,000 lbs</p>
      </div>

      {/* Effective Max Display */}
      <div className="pt-3 border-t border-brand-muted space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase">✅ Currently Using</p>
        <p className="text-lg font-bold text-brand-cyan">
          {effectiveMax.toLocaleString()} lbs
        </p>
        {baseline.userOverride !== null && (
          <p className="text-xs text-slate-400">
            (Your override of {baseline.userOverride.toLocaleString()} lbs)
          </p>
        )}
      </div>

      {/* Warning when system exceeds override */}
      {systemExceedsOverride && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3 space-y-2">
          <p className="text-sm text-yellow-400 font-semibold">
            ⚠️ System learned a higher capacity
          </p>
          <p className="text-xs text-yellow-300">
            System observed {baseline.systemLearnedMax.toLocaleString()} lbs, but you're using override of{' '}
            {baseline.userOverride!.toLocaleString()} lbs. Consider updating your override.
          </p>
          <button
            onClick={() => {
              setOverrideInput(baseline.systemLearnedMax.toString());
              onUpdate(muscleName, baseline.systemLearnedMax);
            }}
            className="w-full py-2 px-4 bg-yellow-600/20 text-yellow-300 border border-yellow-500/50 rounded hover:bg-yellow-600/30 transition-colors text-sm font-medium"
          >
            Update Override to {baseline.systemLearnedMax.toLocaleString()} lbs
          </button>
        </div>
      )}
    </div>
  );
};

export default MuscleBaselineCard;
