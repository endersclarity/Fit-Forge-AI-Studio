import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutsAPI } from '../api';
import { WorkoutResponse } from '../types';
import { formatRelativeDate } from '../utils/statsHelpers';

const WorkoutHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [sortBy, setSortBy] = useState<string>('recent');

  // UI state
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch workouts
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workoutsAPI.getAllRaw();
      setWorkouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  // Filter workouts
  const filteredWorkouts = workouts
    .filter(workout => {
      // Date range filter
      const workoutDate = new Date(workout.date);
      const daysAgo = Math.floor((Date.now() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dateRange !== 'all' && daysAgo > parseInt(dateRange)) return false;

      // Type filter
      if (typeFilter !== 'all' && workout.category !== typeFilter) return false;

      // Exercise name search
      if (searchTerm) {
        const hasExercise = workout.exercises.some(ex =>
          ex.exercise.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!hasExercise) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'longest':
          return (b.duration_seconds || 0) - (a.duration_seconds || 0);
        case 'shortest':
          return (a.duration_seconds || 0) - (b.duration_seconds || 0);
        case 'highest-volume':
          const volA = a.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
          const volB = b.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
          return volB - volA;
        case 'lowest-volume':
          const vA = a.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
          const vB = b.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
          return vA - vB;
        default:
          return 0;
      }
    });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    setDeletingId(id);
    try {
      await workoutsAPI.delete(id);
      setWorkouts(workouts.filter(w => w.id !== id));
      if (expandedWorkout === id) setExpandedWorkout(null);
    } catch (err) {
      alert('Failed to delete workout: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const calculateVolume = (workout: WorkoutResponse): number => {
    return workout.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
  };

  // Empty state
  if (!loading && workouts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-brand-surface rounded-lg p-8 border border-slate-200 dark:border-brand-muted text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No Workout History Yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your workout journey starts here! Track your sets, reps, and weights to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-6 text-slate-600 dark:text-slate-400">
              <li>📈 Monitor progress over time</li>
              <li>🏆 Celebrate personal records</li>
              <li>💪 Identify strength trends</li>
              <li>📅 Review training frequency</li>
            </ul>
            <button
              onClick={() => navigate('/workout/builder')}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-button-primary"
            >
              Start Your First Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-brand-surface rounded-lg p-6 border border-slate-200 dark:border-brand-muted">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Workout History
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-primary dark:text-primary-light hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by exercise name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[250px] px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="Push">Push</option>
              <option value="Pull">Pull</option>
              <option value="Legs">Legs</option>
              <option value="Core">Core</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="longest">Longest Duration</option>
              <option value="shortest">Shortest Duration</option>
              <option value="highest-volume">Highest Volume</option>
              <option value="lowest-volume">Lowest Volume</option>
            </select>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            Loading workouts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && filteredWorkouts.length === 0 && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            No workouts match your filters. Try adjusting your search criteria.
          </div>
        )}

        {!loading && !error && filteredWorkouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkouts.map((workout) => {
              const isExpanded = expandedWorkout === workout.id;
              const volume = calculateVolume(workout);
              const hasPR = workout.prs && workout.prs.some(pr => pr.isPR);

              return (
                <div
                  key={workout.id}
                  className="bg-white dark:bg-brand-dark rounded-lg border border-slate-200 dark:border-brand-muted overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatRelativeDate(workout.date)}
                      </span>
                      {hasPR && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                          🎉 PR
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {workout.category} Day {workout.variation}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{formatDuration(workout.duration_seconds)}</span>
                      <span>•</span>
                      <span>{volume.toLocaleString()} lbs</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-brand-muted">
                      <div className="space-y-2 mt-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                              {exercise.exercise}
                            </div>
                            <div className="space-y-1 ml-2">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="text-slate-600 dark:text-slate-400">
                                  Set {setIdx + 1}: {set.weight === 0 ? 'BW' : `${set.weight} lbs`} × {set.reps} reps
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(workout.id);
                        }}
                        disabled={deletingId === workout.id}
                        className="mt-3 w-full text-red-500 hover:text-red-600 text-sm py-2 border-t border-slate-200 dark:border-brand-muted disabled:opacity-50"
                      >
                        {deletingId === workout.id ? 'Deleting...' : 'Delete Workout'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryPage;
