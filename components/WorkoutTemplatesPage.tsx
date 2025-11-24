import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesAPI } from '../api';
import { WorkoutTemplate, UserProfile } from '../types';
import { PlannedExercise } from '../types/savedWorkouts';
import { EXERCISE_LIBRARY } from '../constants';

interface WorkoutTemplatesPageProps {
  profile: UserProfile;
}

const WorkoutTemplatesPage: React.FC<WorkoutTemplatesPageProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // UI state
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Get exercise names for a template
  const getExerciseNames = (template: WorkoutTemplate): string[] => {
    return template.exerciseIds.map(id => {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
      return exercise ? exercise.name : 'Unknown';
    });
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    // Category filter
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false;
    }

    // Search by exercise name
    if (searchTerm) {
      const exerciseNames = getExerciseNames(template);
      const hasMatch = exerciseNames.some(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeletingId(id);
    try {
      await templatesAPI.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
      if (expandedTemplate === id) setExpandedTemplate(null);
    } catch (err) {
      alert('Failed to delete template: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (template: WorkoutTemplate) => {
    navigate('/workout/builder', { state: { template } });
  };

  const handleBeginWorkout = (template: WorkoutTemplate) => {
    let exercises: PlannedExercise[];

    // Use saved exercises if available (new format), otherwise fall back to exerciseIds (legacy)
    if (template.exercises && template.exercises.length > 0) {
      // New format: use saved exercise details with weights, reps, rest times
      exercises = template.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          restSeconds: s.restSeconds,
        })),
      }));
    } else {
      // Legacy format: convert exerciseIds to PlannedExercise[] with defaults
      exercises = template.exerciseIds.map(id => {
        const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
        if (!exercise) throw new Error(`Exercise ${id} not found`);

        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: [
            { weight: 0, reps: 10, restSeconds: 90 },
            { weight: 0, reps: 10, restSeconds: 90 },
            { weight: 0, reps: 10, restSeconds: 90 },
          ],
        };
      });
    }

    // Extract current bodyweight from profile (same as WorkoutBuilderPage)
    const currentBodyweight = profile?.bodyweightHistory
      ?.sort((a, b) => b.date - a.date)[0]?.weight || 0;

    navigate('/workout/active', { state: { exercises, currentBodyweight } });
  };

  // Empty state
  if (!loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-brand-surface rounded-lg p-8 border border-slate-200 dark:border-brand-muted text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No Saved Workouts Yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create custom workout templates to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-6 text-slate-600 dark:text-slate-400">
              <li>⚡ Start workouts faster</li>
              <li>🎯 Maintain consistent training splits</li>
              <li>📝 Save your favorite exercise combinations</li>
              <li>🔄 Reuse proven workout structures</li>
            </ul>
            <button
              onClick={() => navigate('/workout/builder')}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-button-primary"
            >
              Create Your First Template
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
              Saved Workouts
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              <option value="Push">Push</option>
              <option value="Pull">Pull</option>
              <option value="Legs">Legs</option>
              <option value="Core">Core</option>
            </select>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            Loading templates...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            No templates match your filters. Try adjusting your search criteria.
          </div>
        )}

        {!loading && !error && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const isExpanded = expandedTemplate === template.id;
              const exerciseNames = getExerciseNames(template);

              return (
                <div
                  key={template.id}
                  className="bg-white dark:bg-brand-surface rounded-lg border border-slate-200 dark:border-brand-muted overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary dark:text-primary-light">
                        {template.category}
                      </span>
                      {template.isFavorite && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{exerciseNames.length} exercises</span>
                      <span>•</span>
                      <span>Used {template.timesUsed} times</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-brand-muted">
                      <div className="space-y-2 mt-3">
                        {exerciseNames.map((name, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {idx + 1}. {name}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(template);
                          }}
                          className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                        >
                          Edit Template
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBeginWorkout(template);
                          }}
                          className="w-full px-4 py-2 bg-accent hover:bg-accent-dark text-brand-dark dark:text-white font-medium rounded-lg transition-colors"
                        >
                          Begin Workout
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                          disabled={deletingId === template.id}
                          className="w-full text-red-500 hover:text-red-600 text-sm py-2 border-t border-slate-200 dark:border-brand-muted disabled:opacity-50"
                        >
                          {deletingId === template.id ? 'Deleting...' : 'Delete Template'}
                        </button>
                      </div>
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

export default WorkoutTemplatesPage;
