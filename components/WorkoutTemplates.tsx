import React, { useState, useEffect } from 'react';
import { WorkoutTemplate, Exercise, WorkoutResponse } from '../types';
import { templatesAPI, workoutsAPI } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import { ChevronDownIcon } from './Icons';
import { Card, Button, Badge } from '@/src/design-system/components/primitives';

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
      console.log('Templates loaded:', data);
      console.log('Templates type:', Array.isArray(data) ? 'array' : typeof data);
      if (data) {
        data.forEach((t, i) => {
          console.log(`Template ${i}:`, t.name, 'exerciseIds:', t.exerciseIds);
        });
      }
      setTemplates(data || []);
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

  const getExerciseNames = (exerciseIds: string[] | undefined): string[] => {
    if (!exerciseIds || !Array.isArray(exerciseIds)) return [];
    return exerciseIds
      .map(id => EXERCISE_LIBRARY.find(ex => ex.id === id)?.name || id)
      .filter(Boolean);
  };

  const getRequiredEquipment = (exerciseIds: string[] | undefined): string[] => {
    if (!exerciseIds || !Array.isArray(exerciseIds)) return [];
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
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={loadTemplates}
            variant="primary"
            className="mt-4"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="min-w-[60px] min-h-[60px] rounded-full"
          ariaLabel="Go back"
        >
          <ChevronDownIcon className="w-6 h-6 rotate-90" />
        </Button>
        <h1 className="text-2xl font-display font-bold text-primary-dark">Workout Templates</h1>
        <div className="w-[60px]" /> {/* Spacer for alignment */}
      </div>

      {/* Templates List */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]: [string, WorkoutTemplate[]]) => (
          <div key={category}>
            <h2 className="text-lg font-display font-semibold text-primary mb-3">
              {category} Workouts
            </h2>
            <div className="space-y-3">
              {categoryTemplates.map(template => {
                const exerciseNames = getExerciseNames(template.exerciseIds);
                const equipment = getRequiredEquipment(template.exerciseIds);
                const suggestion = suggestions[category];
                const isRecommended = suggestion && template.variation === suggestion.suggestedVariation;

                return (
                  <Card
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    variant={isRecommended ? 'elevated' : 'default'}
                    className={`w-full p-4 min-h-[60px] transition-all ${
                      isRecommended
                        ? 'border-2 border-primary shadow-lg shadow-primary/20'
                        : 'border-2 border-transparent opacity-70 hover:opacity-90'
                    }`}
                    role="button"
                    ariaLabel={`Select ${template.name} template`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-body font-semibold text-primary-dark">
                            {template.name}
                          </h3>
                          {isRecommended && (
                            <Badge variant="info" size="sm">
                              RECOMMENDED
                            </Badge>
                          )}
                          {template.isFavorite && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Variation {template.variation} • {template.exerciseIds?.length || 0} exercises
                          {template.timesUsed > 0 && ` • Used ${template.timesUsed}x`}
                        </p>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        {exerciseNames.join(' • ')}
                      </p>
                    </div>

                    {/* Equipment Tags */}
                    {equipment.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {equipment.map(eq => (
                          <Badge
                            key={eq}
                            variant="primary"
                            size="sm"
                          >
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No workout templates available</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
