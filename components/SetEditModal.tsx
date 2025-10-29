import React, { useState, useEffect } from 'react';
import { BuilderSet } from '../types';

interface SetEditModalProps {
  set: BuilderSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSet: BuilderSet) => void;
}

const SetEditModal: React.FC<SetEditModalProps> = ({ set, isOpen, onClose, onSave }) => {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [restTimer, setRestTimer] = useState(90);

  // Initialize form values when set changes
  useEffect(() => {
    if (set) {
      setWeight(set.weight);
      setReps(set.reps);
      setRestTimer(set.restTimerSeconds);
    }
  }, [set]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (!set) return;

    const updatedSet: BuilderSet = {
      ...set,
      weight,
      reps,
      restTimerSeconds: restTimer,
    };

    onSave(updatedSet);
    onClose();
  };

  if (!isOpen || !set) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Set</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </header>

        <div className="mb-4">
          <div className="font-semibold mb-2">{set.exerciseName}</div>
        </div>

        <div className="space-y-4">
          {/* Weight Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Weight (lbs)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeight(Math.max(0, weight - 5))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -5
              </button>
              <button
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -2.5
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setWeight(weight + 2.5)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +2.5
              </button>
              <button
                onClick={() => setWeight(weight + 5)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +5
              </button>
            </div>
          </div>

          {/* Reps Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Reps</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -1
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setReps(reps + 1)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +1
              </button>
            </div>
          </div>

          {/* Rest Timer Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Rest Time (seconds)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestTimer(Math.max(15, restTimer - 15))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -15
              </button>
              <input
                type="number"
                value={restTimer}
                onChange={(e) => setRestTimer(Math.max(15, Number(e.target.value)))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setRestTimer(restTimer + 15)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +15
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetEditModal;
