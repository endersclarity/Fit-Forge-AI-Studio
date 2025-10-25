import React from 'react';
import { Exercise } from '../types';
import { SmartDefaults } from '../utils/smartDefaults';

interface QuickAddFormProps {
  exercise: Exercise;
  weight: number;
  reps: number;
  toFailure: boolean;
  smartDefaults: SmartDefaults | null;
  loading: boolean;
  error: string | null;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onToFailureChange: (toFailure: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({
  exercise,
  weight,
  reps,
  toFailure,
  smartDefaults,
  loading,
  error,
  onWeightChange,
  onRepsChange,
  onToFailureChange,
  onSubmit,
  onBack,
}) => {
  const handleWeightIncrement = (amount: number) => {
    onWeightChange(Math.max(0, weight + amount));
  };

  const handleRepsIncrement = (amount: number) => {
    onRepsChange(Math.max(0, reps + amount));
  };

  const equipmentText = Array.isArray(exercise.equipment)
    ? exercise.equipment.join(', ')
    : exercise.equipment;

  const canSubmit = weight > 0 && reps > 0 && !loading;

  return (
    <div className="space-y-4">
      {/* Exercise Card */}
      <div className="bg-brand-muted p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-lg">{exercise.name}</h4>
            <p className="text-xs text-slate-400">{equipmentText}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            exercise.difficulty === 'Beginner' ? 'bg-green-600' :
            exercise.difficulty === 'Intermediate' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {exercise.difficulty}
          </span>
        </div>

        {/* Muscle Engagements */}
        <div className="mt-2">
          <p className="text-xs text-slate-400 mb-1">Primary Muscles:</p>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleEngagements
              .filter(me => me.percentage >= 50)
              .map(me => (
                <span
                  key={me.muscle}
                  className="text-xs bg-brand-cyan bg-opacity-20 text-brand-cyan px-2 py-0.5 rounded"
                >
                  {me.muscle} ({me.percentage}%)
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Progressive Suggestion */}
      {smartDefaults && smartDefaults.lastPerformance && (
        <div className="bg-brand-dark p-3 rounded-lg border border-brand-cyan">
          <p className="text-xs text-slate-400 mb-1">Smart Suggestion</p>
          <p className="text-sm">
            Last: <span className="font-semibold">{smartDefaults.lastPerformance.weight} lbs × {smartDefaults.lastPerformance.reps} reps</span>
            {smartDefaults.daysAgo !== null && (
              <span className="text-slate-400 ml-2">
                ({smartDefaults.daysAgo === 0 ? 'today' : `${smartDefaults.daysAgo}d ago`})
              </span>
            )}
          </p>
          {smartDefaults.suggestedWeight && smartDefaults.suggestedReps && (
            <p className="text-xs text-brand-cyan mt-1">
              Try: {smartDefaults.suggestedWeight} lbs × {smartDefaults.suggestedReps} reps
              {' '}(↑{((smartDefaults.suggestedWeight * smartDefaults.suggestedReps - smartDefaults.lastPerformance.volume) / smartDefaults.lastPerformance.volume * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      )}

      {/* Weight Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWeightIncrement(-5)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            -5
          </button>
          <button
            onClick={() => handleWeightIncrement(-2.5)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            -2.5
          </button>
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            className="flex-1 px-4 py-2 bg-brand-muted rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            disabled={loading}
          />
          <button
            onClick={() => handleWeightIncrement(2.5)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            +2.5
          </button>
          <button
            onClick={() => handleWeightIncrement(5)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            +5
          </button>
        </div>
      </div>

      {/* Reps Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Reps</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRepsIncrement(-1)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            -1
          </button>
          <input
            type="number"
            value={reps}
            onChange={(e) => onRepsChange(Number(e.target.value))}
            className="flex-1 px-4 py-2 bg-brand-muted rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            disabled={loading}
          />
          <button
            onClick={() => handleRepsIncrement(1)}
            className="w-10 h-10 bg-brand-muted rounded-lg font-bold hover:bg-brand-dark transition-colors"
            disabled={loading}
          >
            +1
          </button>
        </div>
      </div>

      {/* To Failure Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="toFailure"
          checked={toFailure}
          onChange={(e) => onToFailureChange(e.target.checked)}
          className="w-4 h-4 rounded bg-brand-muted border-slate-600 text-brand-cyan focus:ring-brand-cyan focus:ring-2"
          disabled={loading}
        />
        <label htmlFor="toFailure" className="text-sm">
          Taken to failure
        </label>
      </div>

      {/* Volume Preview */}
      <div className="bg-brand-muted p-3 rounded-lg text-center">
        <p className="text-xs text-slate-400">Total Volume</p>
        <p className="text-2xl font-bold text-brand-cyan">{(weight * reps).toLocaleString()} lbs</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          disabled={loading}
        >
          Change Exercise
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors ${
            canSubmit
              ? 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Logging...' : 'Log It'}
        </button>
      </div>
    </div>
  );
};

export default QuickAddForm;
