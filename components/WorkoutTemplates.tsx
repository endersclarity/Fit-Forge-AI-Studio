import React, { useState, useEffect } from 'react';
import { WorkoutTemplate, Exercise, WorkoutResponse } from '../types';
import { templatesAPI, workoutsAPI } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import { ChevronDownIcon } from './Icons';

interface WorkoutTemplatesProps {
  onBack: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
}

interface VariationSuggestion {
  category: string;
  suggestedVariation: 'A' | 'B';
}

const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({ onBack, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, VariationSuggestion>>({});

  useEffect(() => {
    loadTemplates();
    loadVariationSuggestions();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesAPI.getAll();
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load workout templates');
    } finally {
      setLoading(false);
    }
  };

  const loadVariationSuggestions = async () => {
    const categories = ['Push', 'Pull', 'Legs', 'Core'];
    const suggestionsMap: Record<string, VariationSuggestion> = {};

    for (const category of categories) {
      try {
        const lastWorkout: WorkoutResponse | null = await workoutsAPI.getLastByCategory(category);
        if (lastWorkout && lastWorkout.variation) {
          const suggestedVariation = lastWorkout.variation === 'A' ? 'B' : 'A';
          suggestionsMap[category] = { category, suggestedVariation: suggestedVariation as 'A' | 'B' };
        } else {
          // No previous workout - suggest A as default
          suggestionsMap[category] = { category, suggestedVariation: 'A' };
        }
      } catch (err) {
        // Default to A if error
        suggestionsMap[category] = { category, suggestedVariation: 'A' };
      }
    }

    setSuggestions(suggestionsMap);
  };

  const getExerciseNames = (exerciseIds: string[]): string[] => {
    return exerciseIds
      .map(id => EXERCISE_LIBRARY.find(ex => ex.id === id)?.name || id)
      .filter(Boolean);
  };

  const getRequiredEquipment = (exerciseIds: string[]): string[] => {
    const equipment = new Set<string>();
    exerciseIds.forEach(id => {
      const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
      if (exercise?.equipment) {
        if (Array.isArray(exercise.equipment)) {
          exercise.equipment.forEach(eq => equipment.add(eq));
        } else {
          equipment.add(exercise.equipment);
        }
      }
    });
    return Array.from(equipment);
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, WorkoutTemplate[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-4">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark p-4">
        <div className="bg-brand-surface p-6 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadTemplates}
            className="mt-4 bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-brand-surface"
        >
          <ChevronDownIcon className="w-6 h-6 text-slate-300 rotate-90" />
        </button>
        <h1 className="text-2xl font-bold text-white">Workout Templates</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Templates List */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]: [string, WorkoutTemplate[]]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-brand-cyan mb-3">
              {category} Workouts
            </h2>
            <div className="space-y-3">
              {categoryTemplates.map(template => {
                const exerciseNames = getExerciseNames(template.exerciseIds);
                const equipment = getRequiredEquipment(template.exerciseIds);
                const suggestion = suggestions[category];
                const isRecommended = suggestion && template.variation === suggestion.suggestedVariation;

                return (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className={`w-full p-4 rounded-lg transition-all text-left ${
                      isRecommended
                        ? 'bg-brand-surface border-2 border-brand-cyan shadow-lg shadow-brand-cyan/20'
                        : 'bg-brand-surface border-2 border-transparent opacity-70 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {template.name}
                          </h3>
                          {isRecommended && (
                            <span className="px-2 py-0.5 bg-brand-cyan text-brand-dark text-xs font-bold rounded">
                              RECOMMENDED
                            </span>
                          )}
                          {template.isFavorite && (
                            <span className="text-yellow-400">⭐</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          Variation {template.variation} • {template.exerciseIds.length} exercises
                          {template.timesUsed > 0 && ` • Used ${template.timesUsed}x`}
                        </p>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="mb-3">
                      <p className="text-sm text-slate-300">
                        {exerciseNames.join(' • ')}
                      </p>
                    </div>

                    {/* Equipment Tags */}
                    {equipment.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {equipment.map(eq => (
                          <span
                            key={eq}
                            className="px-2 py-1 bg-brand-dark rounded text-xs text-slate-400"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No workout templates available</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
