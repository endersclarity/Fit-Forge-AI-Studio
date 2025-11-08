import React, { useState } from 'react';

interface HorizontalSetInputProps {
  setNumber: number;
  exerciseName: string;
  weight: number;
  reps: number;
  restTimerSeconds: number;
  isLogged: boolean;
  isActive: boolean;
  restTimeRemaining?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onLog: () => void;
}

const HorizontalSetInput: React.FC<HorizontalSetInputProps> = ({
  setNumber,
  exerciseName,
  weight,
  reps,
  restTimerSeconds,
  isLogged,
  isActive,
  restTimeRemaining,
  onWeightChange,
  onRepsChange,
  onLog,
}) => {
  const [editingField, setEditingField] = useState<'weight' | 'reps' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleFieldClick = (field: 'weight' | 'reps') => {
    if (isLogged) return; // Can't edit logged sets
    setEditingField(field);
    setTempValue(String(field === 'weight' ? weight : reps));
  };

  const handleSave = () => {
    const numValue = parseInt(tempValue) || 0;
    if (editingField === 'weight') {
      onWeightChange(numValue);
    } else if (editingField === 'reps') {
      onRepsChange(numValue);
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  return (
    <div className={`py-3 ${isActive ? 'bg-brand-dark' : ''}`}>
      {/* Main horizontal layout */}
      <div className="flex items-center gap-3">
        {/* Set number indicator */}
        <div className={`w-8 h-8 flex items-center justify-center rounded-md ${
          isLogged
            ? 'bg-green-600 text-white'
            : 'bg-brand-muted text-slate-400 border border-slate-600'
        }`}>
          {isLogged ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="font-bold">{setNumber}</span>
          )}
        </div>

        {/* Reps */}
        <button
          onClick={() => handleFieldClick('reps')}
          disabled={isLogged}
          className={`text-2xl font-bold ${
            isLogged ? 'text-slate-500' : 'text-white hover:text-brand-cyan'
          } transition-colors`}
        >
          {reps}
        </button>
        <span className="text-sm text-slate-400 uppercase">reps</span>

        <span className="text-slate-600">/</span>

        {/* Weight */}
        <button
          onClick={() => handleFieldClick('weight')}
          disabled={isLogged}
          className={`text-2xl font-bold ${
            isLogged ? 'text-slate-500' : 'text-white hover:text-brand-cyan'
          } transition-colors`}
        >
          {weight}
        </button>
        <span className="text-sm text-slate-400 uppercase">pounds</span>
      </div>

      {/* Rest timer (shown after logging) */}
      {isLogged && restTimeRemaining !== undefined && restTimeRemaining > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{Math.floor(restTimeRemaining / 60)}:{String(restTimeRemaining % 60).padStart(2, '0')} REST</span>
        </div>
      )}

      {/* Numeric input modal (bottom sheet style) */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-brand-muted w-full max-w-md rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Edit {editingField === 'weight' ? 'Weight' : 'Reps'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
              className="w-full bg-brand-dark text-white text-3xl font-bold text-center py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            />

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => setTempValue(prev => prev + String(num))}
                  className="bg-brand-dark text-white text-xl font-semibold py-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setTempValue(prev => prev.slice(0, -1))}
                className="bg-brand-dark text-white py-4 rounded-lg hover:bg-slate-700 transition-colors"
              >
                ←
              </button>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-brand-cyan text-brand-dark font-bold py-4 rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalSetInput;
