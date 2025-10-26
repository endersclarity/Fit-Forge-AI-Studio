import React, { useState, useEffect } from 'react';
import { ProgressiveSuggestion, ProgressiveOption } from '../types';

interface ProgressiveSuggestionButtonsProps {
  exerciseName: string;
  onSelect: (weight: number, reps: number, method: 'weight' | 'reps') => void;
}

export function ProgressiveSuggestionButtons({
  exerciseName,
  onSelect
}: ProgressiveSuggestionButtonsProps) {
  const [suggestions, setSuggestions] = useState<ProgressiveSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/progressive-suggestions?exercise=${encodeURIComponent(exerciseName)}`
        );

        if (response.status === 404) {
          // No history for this exercise
          setSuggestions(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch progressive suggestions');
        }

        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching progressive suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [exerciseName]);

  if (loading) {
    return (
      <div className="progressive-suggestions loading">
        <p className="text-sm text-gray-500">Loading suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progressive-suggestions error">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="progressive-suggestions no-history">
        <p className="text-sm text-gray-600 italic">
          No history - establish your baseline
        </p>
      </div>
    );
  }

  const handleButtonClick = (option: ProgressiveOption) => {
    onSelect(option.weight, option.reps, option.method);
  };

  return (
    <div className="progressive-suggestions">
      {/* Last Performance Context */}
      <div className="last-performance mb-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Last: </span>
          {suggestions.lastPerformance.reps} reps @ {suggestions.lastPerformance.weight}lbs
          <span className="text-gray-500 ml-2">({suggestions.daysAgo} days ago)</span>
        </p>
        {suggestions.lastMethod !== 'none' && (
          <p className="text-xs text-gray-500">
            Used: +{suggestions.lastMethod.toUpperCase()} method
          </p>
        )}
      </div>

      {/* Progressive Options Buttons */}
      <div className="suggestion-buttons flex gap-3 mb-3">
        {/* Weight Option Button */}
        <button
          type="button"
          onClick={() => handleButtonClick(suggestions.weightOption)}
          className={`
            suggestion-btn flex-1 px-4 py-3 rounded-lg border-2 transition-all
            ${suggestions.suggested === 'weight'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
          `}
        >
          <div className="method-label text-sm font-semibold mb-1">
            {suggestions.suggested === 'weight' && '💪 '}
            +WEIGHT
            {suggestions.suggested === 'weight' && (
              <span className="text-xs text-blue-600 ml-1">(Recommended)</span>
            )}
          </div>
          <div className="values text-gray-700">
            {suggestions.weightOption.reps} reps @ {suggestions.weightOption.weight}lbs
          </div>
        </button>

        {/* Reps Option Button */}
        <button
          type="button"
          onClick={() => handleButtonClick(suggestions.repsOption)}
          className={`
            suggestion-btn flex-1 px-4 py-3 rounded-lg border-2 transition-all
            ${suggestions.suggested === 'reps'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
          `}
        >
          <div className="method-label text-sm font-semibold mb-1">
            {suggestions.suggested === 'reps' && '💪 '}
            +REPS
            {suggestions.suggested === 'reps' && (
              <span className="text-xs text-green-600 ml-1">(Recommended)</span>
            )}
          </div>
          <div className="values text-gray-700">
            {suggestions.repsOption.reps} reps @ {suggestions.repsOption.weight}lbs
          </div>
        </button>
      </div>

      {/* Manual Entry Label */}
      <p className="manual-entry-label text-xs text-gray-500 text-center">
        Or enter custom:
      </p>
    </div>
  );
}
