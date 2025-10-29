import React, { useState } from 'react';
import { Exercise } from '../types';
import ExercisePicker from './ExercisePicker';

interface SetConfiguratorProps {
  onAddSet: (config: {
    exercise: Exercise;
    weight: number;
    reps: number;
    restTimerSeconds: number;
  }) => void;
  defaultWeight?: number;
  defaultReps?: number;
  defaultRestTimer?: number;
}

const SetConfigurator: React.FC<SetConfiguratorProps> = ({
  onAddSet,
  defaultWeight = 0,
  defaultReps = 10,
  defaultRestTimer = 90,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [restTimer, setRestTimer] = useState(defaultRestTimer);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowPicker(false);
  };

  const handleAdd = () => {
    if (!selectedExercise) return;
    onAddSet({ exercise: selectedExercise, weight, reps, restTimerSeconds: restTimer });
    // Reset for next set
    setSelectedExercise(null);
    setWeight(defaultWeight);
    setReps(defaultReps);
    setRestTimer(defaultRestTimer);
  };

  return (
    <div className="bg-brand-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Add Set</h4>

      {!selectedExercise ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full bg-brand-dark text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-surface transition-colors"
        >
          Select Exercise
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-brand-dark p-3 rounded-lg">
            <div className="font-semibold">{selectedExercise.name}</div>
            <div className="text-sm text-slate-400">{selectedExercise.category}</div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-sm text-brand-cyan hover:underline mt-1"
            >
              Change exercise
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Weight Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Weight (lbs)</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWeight(Math.max(0, weight - 5))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setWeight(weight + 5)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Reps Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reps</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReps(Math.max(1, reps - 1))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setReps(reps + 1)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Rest Timer Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Rest (sec)</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRestTimer(Math.max(15, restTimer - 15))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -15
                </button>
                <input
                  type="number"
                  value={restTimer}
                  onChange={(e) => setRestTimer(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setRestTimer(restTimer + 15)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +15
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Add Set
          </button>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Exercise</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </header>
            <ExercisePicker onSelect={handleExerciseSelect} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SetConfigurator;
