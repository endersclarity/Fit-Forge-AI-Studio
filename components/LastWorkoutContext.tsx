import React, { useState, useEffect } from 'react';
import { WorkoutResponse } from '../types';

interface LastWorkoutContextProps {
  // No props needed - self-contained component
}

interface LastWorkoutData {
  id: number;
  date: string;
  category: string;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  days_ago: number;
}

type WorkoutCategory = 'Push' | 'Pull' | 'Legs' | 'Core';

const CATEGORIES: WorkoutCategory[] = ['Push', 'Pull', 'Legs', 'Core'];

const CATEGORY_ICONS: Record<WorkoutCategory, string> = {
  Push: '💪',
  Pull: '🏋️',
  Legs: '🦵',
  Core: '🧘'
};

export default function LastWorkoutContext({}: LastWorkoutContextProps) {
  const [lastWorkouts, setLastWorkouts] = useState<Record<string, LastWorkoutData | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLastWorkouts();
  }, []);

  const fetchLastWorkouts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch last workout for all 4 categories in parallel
      const promises = CATEGORIES.map(async (category) => {
        try {
          const response = await fetch(`http://localhost:3001/api/workouts/last?category=${category}`);

          if (response.status === 404) {
            // No workouts for this category
            return { category, workout: null };
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch ${category} workout`);
          }

          const workout: WorkoutResponse = await response.json();

          // Calculate days ago
          const workoutDate = new Date(workout.date);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
          const days_ago = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          return {
            category,
            workout: {
              id: workout.id,
              date: workout.date,
              category: workout.category || category,
              variation: workout.variation,
              progression_method: workout.progression_method,
              duration_seconds: workout.duration_seconds,
              days_ago
            }
          };
        } catch (err) {
          console.error(`Error fetching ${category} workout:`, err);
          return { category, workout: null };
        }
      });

      const results = await Promise.all(promises);

      const workoutsMap: Record<string, LastWorkoutData | null> = {};
      results.forEach(({ category, workout }) => {
        workoutsMap[category] = workout;
      });

      setLastWorkouts(workoutsMap);
    } catch (err) {
      console.error('Error fetching last workouts:', err);
      setError('Unable to load workout history');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedVariation = (lastVariation: string | null): string => {
    if (lastVariation === 'A') return 'B';
    if (lastVariation === 'B') return 'A';
    return 'A'; // Default for 'Both' or first-time
  };

  const formatDaysAgo = (days: number): string => {
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Last Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="bg-brand-surface p-4 rounded-lg animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Last Workouts</h2>
        <div className="bg-brand-surface p-4 rounded-lg border border-red-500/20">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchLastWorkouts}
            className="mt-2 text-brand-cyan hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Last Workouts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const workout = lastWorkouts[category];
          const icon = CATEGORY_ICONS[category];

          if (!workout) {
            // First workout ever
            return (
              <div
                key={category}
                className="bg-brand-surface p-4 rounded-lg border border-slate-700 hover:border-brand-cyan/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="text-lg font-semibold">{category}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-1">First workout!</p>
                <p className="text-brand-cyan text-sm font-medium">
                  → Start with: <span className="font-bold">{category} A</span>
                </p>
              </div>
            );
          }

          const suggestedVariation = getSuggestedVariation(workout.variation);
          const displayVariation = workout.variation || 'Both';

          return (
            <div
              key={category}
              className="bg-brand-surface p-4 rounded-lg border border-slate-700 hover:border-brand-cyan/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
              <p className="text-slate-300 text-sm mb-1">
                Last: <span className="font-semibold">{category} {displayVariation}</span>
              </p>
              <p className="text-slate-400 text-xs mb-2">
                {formatDaysAgo(workout.days_ago)}
              </p>
              <p className="text-brand-cyan text-sm font-medium">
                → Ready for: <span className="font-bold">{category} {suggestedVariation}</span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
