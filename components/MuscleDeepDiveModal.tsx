import React, { useState } from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselinesResponse, PlannedExercise } from '../types';
import { XIcon } from './Icons';

interface MuscleDeepDiveModalProps {
  isOpen: boolean;
  muscle: Muscle;
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselinesResponse;
  onClose: () => void;
  onAddToWorkout: (exercise: PlannedExercise) => void;
}

type TabType = 'recommended' | 'all' | 'history';

export const MuscleDeepDiveModal: React.FC<MuscleDeepDiveModalProps> = ({
  isOpen,
  muscle,
  muscleStates,
  muscleBaselines,
  onClose,
  onAddToWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  if (!isOpen) return null;

  const muscleState = muscleStates[muscle];
  const fatiguePercent = muscleState?.currentFatiguePercent ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-brand-muted">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{muscle}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-brand-muted">{fatiguePercent}% fatigued</span>
              <div className="w-32 bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    fatiguePercent < 33 ? 'bg-green-500' :
                    fatiguePercent < 66 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fatiguePercent}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-brand-muted">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            All Exercises
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recommended' && <div>Recommended exercises coming soon...</div>}
          {activeTab === 'all' && <div>All exercises coming soon...</div>}
          {activeTab === 'history' && <div>Exercise history coming soon...</div>}
        </div>
      </div>
    </div>
  );
};
