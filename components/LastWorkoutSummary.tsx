import { ExerciseCategory } from '../types';
import { WorkoutResponse } from '../backend/types';
import { getSuggestedVariation, formatRelativeDate, getDaysSinceWorkout } from '../utils/progressiveOverload';

interface LastWorkoutSummaryProps {
  lastWorkout: WorkoutResponse | null;
  category: ExerciseCategory;
  onLoadTemplate: (variation: 'A' | 'B') => void;
  loading?: boolean;
}

/**
 * Component that displays a summary of the last workout for a category
 * and provides a button to load the suggested template
 */
export function LastWorkoutSummary({
  lastWorkout,
  category,
  onLoadTemplate,
  loading = false
}: LastWorkoutSummaryProps) {
  // If no last workout, show first-time message
  if (!lastWorkout) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-4">
        <h2 className="text-2xl font-bold mb-2">Start Your First {category} Workout!</h2>
        <p className="mb-4">
          This is your first {category} workout. Let's build a strong foundation.
        </p>
        <button
          onClick={() => onLoadTemplate('A')}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Load {category} A Template
        </button>
      </div>
    );
  }

  const suggestedVariation = getSuggestedVariation((lastWorkout.variation as 'A' | 'B') || null);
  const daysSince = getDaysSinceWorkout(lastWorkout.date);
  const relativeDate = formatRelativeDate(lastWorkout.date);
  const isStale = daysSince > 7;

  return (
    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg shadow-lg mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Continue from Last {category} Workout</h2>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {category} {lastWorkout.variation || 'A'}
            </span>
            <span className="text-white/80">•</span>
            <span className={`text-lg ${isStale ? 'text-yellow-300' : 'text-white/90'}`}>
              {isStale && '⚠️ '}{relativeDate}
            </span>
          </div>
          {isStale && (
            <p className="text-sm text-yellow-200 mt-1">
              It's been a while - you may need to adjust weights
            </p>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Last Workout Summary:</h3>
        <div className="space-y-1 text-sm">
          {lastWorkout.exercises.slice(0, 3).map((exercise, idx) => {
            const bestSet = exercise.sets.reduce((max, set) =>
              (set.weight * set.reps > max.weight * max.reps) ? set : max
            );
            return (
              <div key={idx} className="flex justify-between">
                <span>{exercise.exercise}</span>
                <span className="font-mono">
                  {bestSet.reps} reps @ {bestSet.weight} lbs
                </span>
              </div>
            );
          })}
          {lastWorkout.exercises.length > 3 && (
            <div className="text-white/70 text-xs">
              +{lastWorkout.exercises.length - 3} more exercises
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1">Suggested next workout:</p>
          <p className="text-xl font-bold">
            Try {category} {suggestedVariation} today
          </p>
        </div>
        <button
          onClick={() => onLoadTemplate(suggestedVariation)}
          disabled={loading}
          className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : `Load ${category} ${suggestedVariation} Template`}
        </button>
      </div>
    </div>
  );
}
