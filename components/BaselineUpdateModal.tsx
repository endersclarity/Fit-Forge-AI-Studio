import React from 'react';
import { Muscle } from '../types';

interface BaselineUpdate {
  muscle: Muscle;
  oldMax: number;
  newMax: number;
  sessionVolume: number;
}

interface BaselineUpdateModalProps {
  isOpen: boolean;
  updates: BaselineUpdate[];
  onConfirm: () => void;
  onDecline: () => void;
}

const BaselineUpdateModal: React.FC<BaselineUpdateModalProps> = ({
  isOpen,
  updates,
  onConfirm,
  onDecline,
}) => {
  if (!isOpen || updates.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brand-surface p-6 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">New Muscle Capacity Records! 🎉</h2>

        <p className="text-slate-400 mb-4">
          You just achieved new maximum session volumes for the following muscles:
        </p>

        <div className="space-y-3 mb-6">
          {updates.map(({ muscle, oldMax, newMax, sessionVolume }) => (
            <div key={muscle} className="bg-brand-dark p-3 rounded">
              <div className="font-semibold text-brand-cyan">{muscle}</div>
              <div className="text-sm text-slate-400 mt-1">
                Session Volume: <span className="text-white">{sessionVolume.toLocaleString()} lbs</span>
              </div>
              <div className="text-sm text-slate-400">
                Previous Max: {oldMax.toLocaleString()} lbs →
                <span className="text-green-400 ml-1">New Max: {newMax.toLocaleString()} lbs</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                +{((newMax - oldMax) / oldMax * 100).toFixed(1)}% improvement
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Update your muscle capacity baselines to reflect this performance?
          This helps the system provide more accurate workout recommendations.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Keep Current
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-brand-cyan hover:bg-cyan-400 text-brand-dark px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Update Baselines
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaselineUpdateModal;
