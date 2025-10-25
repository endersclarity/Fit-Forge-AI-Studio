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

  // Get most recent workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxDisplay);

  // Helper to check if workout contains PRs
  const hasPR = (workout: WorkoutResponse): boolean => {
    return workout.prs ? workout.prs.some(pr => pr.isPR) : false;
  };

  // Helper to check if workout is today
  const isToday = (dateString: string): boolean => {
    const workoutDate = new Date(dateString);
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
                className={`flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-750 transition-colors ${
                  today ? 'bg-green-900/10 border-l-4 border-l-green-400' : ''
                }`}
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
    </div>
  );
};

export default WorkoutHistorySummary;
