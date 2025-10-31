import React, { useState } from 'react';
import { WorkoutResponse, PersonalBestsResponse } from '../types';
import { formatRelativeDate } from '../utils/statsHelpers';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WorkoutHistorySummaryProps {
  workouts: WorkoutResponse[];
  personalBests: PersonalBestsResponse;
  maxDisplay?: number;
}

const WorkoutHistorySummary: React.FC<WorkoutHistorySummaryProps> = ({
  workouts,
  personalBests,
  maxDisplay = 5
}) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('dashboard-history-expanded', true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutResponse | null>(null);

  // Get most recent workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => {
      const dateA = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
      const dateB = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, maxDisplay);

  // Helper to check if workout contains PRs
  const hasPR = (workout: WorkoutResponse): boolean => {
    return workout.prs ? workout.prs.some(pr => pr.isPR) : false;
  };

  // Helper to check if workout is today
  const isToday = (dateValue: string | number): boolean => {
    const workoutDate = typeof dateValue === 'number' ? new Date(dateValue) : new Date(dateValue);
    const today = new Date();
    return (
      workoutDate.getDate() === today.getDate() &&
      workoutDate.getMonth() === today.getMonth() &&
      workoutDate.getFullYear() === today.getFullYear()
    );
  };

  // Format duration in minutes
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (workouts.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <div className="text-center">
          <div className="text-slate-400 mb-4">
            No workouts yet. Start your first workout to see history here!
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors">
            Start Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-semibold text-slate-200">Recent Workouts</h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          {recentWorkouts.map((workout) => {
            const today = isToday(workout.date);
            const pr = hasPR(workout);

            return (
              <div
                key={workout.id}
                className={`flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-750 transition-colors cursor-pointer ${
                  today ? 'bg-green-900/10 border-l-4 border-l-green-400' : ''
                }`}
                onClick={() => setSelectedWorkout(workout)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedWorkout(workout);
                  }
                }}
              >
                {/* Date */}
                <div className="flex-shrink-0 w-24 text-sm text-slate-400">
                  {formatRelativeDate(workout.date)}
                </div>

                {/* Category & Variation */}
                <div className="flex-1 mx-4">
                  <span className="text-slate-200 font-medium">
                    {workout.category} {workout.variation}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 w-16 text-sm text-slate-400 text-right">
                  {formatDuration(workout.duration_seconds)}
                </div>

                {/* PR Badge */}
                {pr && (
                  <div className="flex-shrink-0 ml-3 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                    🎉 PR
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-200">
                  {selectedWorkout.category} {selectedWorkout.variation}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {formatRelativeDate(selectedWorkout.date)} • {formatDuration(selectedWorkout.duration_seconds)}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* PRs Section */}
              {selectedWorkout.prs && selectedWorkout.prs.length > 0 && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    🎉 Personal Records
                  </h4>
                  <div className="space-y-2">
                    {selectedWorkout.prs.map((pr, idx) => (
                      <div key={idx} className="text-sm text-slate-300">
                        <span className="font-medium">{pr.exercise}</span>
                        <span className="text-slate-400"> - </span>
                        <span className="text-green-400">+{pr.improvement.toFixed(1)}%</span>
                        <span className="text-slate-400"> ({pr.previousVolume.toLocaleString()} → {pr.newVolume.toLocaleString()} lbs)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises Section */}
              <div>
                <h4 className="text-slate-200 font-semibold mb-3">Exercises</h4>
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-slate-750 rounded-lg p-3">
                      <div className="font-medium text-slate-200 mb-2">{exercise.exercise}</div>
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="text-slate-500 w-6">#{setIdx + 1}</span>
                            <span className="text-slate-200">{set.weight} lbs</span>
                            <span>×</span>
                            <span className="text-slate-200">{set.reps} reps</span>
                            {set.to_failure && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded">
                                To Failure
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baseline Updates Section */}
              {selectedWorkout.updated_baselines && selectedWorkout.updated_baselines.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">📈 Baseline Updates</h4>
                  <div className="space-y-1">
                    {selectedWorkout.updated_baselines.map((update, idx) => (
                      <div key={idx} className="text-sm text-slate-300">
                        <span className="font-medium">{update.muscle}</span>
                        <span className="text-slate-400"> baseline updated to </span>
                        <span className="text-blue-400">{update.newBaseline.toLocaleString()} lbs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistorySummary;
