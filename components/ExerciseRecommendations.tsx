import React, { useState, useMemo, useEffect } from 'react';
import {
  Exercise,
  ExerciseCategory,
  EquipmentItem,
  MuscleStatesResponse,
  CalibrationMap,
  ExerciseCalibrationData,
  Muscle,
  ExerciseRecommendation
} from '../types';
import { getUserCalibrations, getExerciseCalibrations, API_BASE_URL } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import CategoryTabs from './CategoryTabs';
import RecommendationCard from './RecommendationCard';
import CollapsibleSection from './CollapsibleSection';
import { EngagementViewer } from './EngagementViewer';
import { CalibrationEditor } from './CalibrationEditor';

// API types for exercise recommendations
interface ApiRecommendationFactors {
  targetMatch: number;
  freshness: number;
  variety: number;
  preference: number;
  primarySecondary: number;
  total: number;
}

interface ApiRecommendation {
  exercise: any; // Exercise from backend
  score: number;
  isSafe: boolean;
  warnings: string[];
  factors: ApiRecommendationFactors;
}

interface ApiRecommendationResponse {
  safe: ApiRecommendation[];
  unsafe: ApiRecommendation[];
  totalFiltered: number;
}

interface ExerciseRecommendationsProps {
  muscleStates: MuscleStatesResponse;
  equipment: EquipmentItem[];
  selectedMuscles?: Muscle[];
  onAddToWorkout: (exercise: Exercise) => void;
}

const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({
  muscleStates,
  equipment,
  selectedMuscles = [],
  onAddToWorkout
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  // API state
  const [allRecommendations, setAllRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calibration state
  const [calibrations, setCalibrations] = useState<CalibrationMap>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedExerciseData, setSelectedExerciseData] = useState<ExerciseCalibrationData | null>(null);

  // Fetch calibrations on mount
  useEffect(() => {
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to load calibrations:', err));
  }, []);

  // Fetch recommendations from API when selectedMuscles or equipment changes
  useEffect(() => {
    // If no target muscle selected, clear recommendations
    if (!selectedMuscles || selectedMuscles.length === 0) {
      setAllRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build request body
        const requestBody = {
          targetMuscle: selectedMuscles[0], // Use first selected muscle as primary target
          filters: {
            equipment: equipment.map(e => e.type), // Map EquipmentItem to equipment type strings
            excludeExercises: [] // TODO: Future enhancement - track recently used exercises
          }
        };

        // Call API
        const response = await fetch(`${API_BASE_URL}/recommendations/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
        }

        const data: ApiRecommendationResponse = await response.json();

        // Transform API response to ExerciseRecommendation format
        const transformedRecommendations: ExerciseRecommendation[] = data.safe
          .map(rec => {
            // Find full Exercise object from EXERCISE_LIBRARY using exerciseId
            const exercise = EXERCISE_LIBRARY.find(e => e.id === rec.exercise.id);
            if (!exercise) {
              console.warn(`Exercise ${rec.exercise.id} not found in EXERCISE_LIBRARY`);
              return null;
            }

            // Map score to status
            const status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended' =
              rec.score >= 80 ? 'excellent'
              : rec.score >= 60 ? 'good'
              : rec.score >= 40 ? 'suboptimal'
              : 'not-recommended';

            // Extract primary muscles (engagement > 30%)
            const primaryMuscles = exercise.muscleEngagements
              .filter(e => e.percentage > 30)
              .map(e => {
                const muscleState = muscleStates[e.muscle];
                return {
                  muscle: e.muscle,
                  readiness: muscleState ? 100 - muscleState.currentFatiguePercent : 100,
                  fatigue: muscleState ? muscleState.currentFatiguePercent : 0,
                  recoveredAt: muscleState?.recoveredAt || null
                };
              });

            // Use warnings as limiting factors
            const limitingFactors = rec.warnings.map(warning => {
              // Parse warning like "Bottleneck: Hamstrings at 85%"
              const match = warning.match(/Bottleneck:\s*(\w+)\s*at\s*(\d+)%/);
              if (match) {
                const muscle = match[1] as Muscle;
                const fatigue = parseInt(match[2]);
                return {
                  muscle,
                  readiness: 100 - fatigue,
                  fatigue,
                  recoveredAt: null
                };
              }
              return null;
            }).filter((lf): lf is any => lf !== null);

            // Build explanation from score factors
            const explanation = `Score: ${Math.round(rec.score)} (Target: ${rec.factors.targetMatch}%, Freshness: ${rec.factors.freshness}%, Variety: ${rec.factors.variety}%)`;

            return {
              exercise,
              opportunityScore: rec.score,
              status,
              primaryMuscles,
              limitingFactors,
              explanation,
              equipmentAvailable: true, // Already filtered by backend
              // Store API factors for tooltip display
              _apiFactors: rec.factors,
              _apiWarnings: rec.warnings
            } as any; // Type assertion needed for custom fields
          })
          .filter((rec): rec is ExerciseRecommendation => rec !== null);

        setAllRecommendations(transformedRecommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
        setAllRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedMuscles, equipment, muscleStates]);

  // Filter recommendations by selected muscles (if any)
  const recommendations = useMemo(() => {
    if (selectedMuscles.length === 0) return allRecommendations;

    // Filter exercises that target ANY of the selected muscles (OR logic)
    return allRecommendations
      .filter(rec => {
        const exercise = rec.exercise;
        // Check if exercise targets any of the selected muscles
        return selectedMuscles.some(muscle => {
          const engagementObj = exercise.muscleEngagements.find(e => e.muscle === muscle);
          return engagementObj && engagementObj.percentage > 0;
        });
      })
      .sort((a, b) => {
        // Sort by total engagement of selected muscles (descending)
        const aTotal = selectedMuscles.reduce(
          (sum, muscle) => {
            const engagementObj = a.exercise.muscleEngagements.find(e => e.muscle === muscle);
            return sum + (engagementObj?.percentage || 0);
          },
          0
        );
        const bTotal = selectedMuscles.reduce(
          (sum, muscle) => {
            const engagementObj = b.exercise.muscleEngagements.find(e => e.muscle === muscle);
            return sum + (engagementObj?.percentage || 0);
          },
          0
        );
        return bTotal - aTotal;
      });
  }, [allRecommendations, selectedMuscles]);

  // Group recommendations by status
  const excellent = recommendations.filter(r => r.status === 'excellent');
  const good = recommendations.filter(r => r.status === 'good');
  const suboptimal = recommendations.filter(r => r.status === 'suboptimal');
  const notRecommended = recommendations.filter(r => r.status === 'not-recommended');

  // Calculate category counts for tabs
  // Use filtered recommendations if muscles are selected, otherwise use all
  const categoryCounts = useMemo(() => {
    const counts: Record<ExerciseCategory, number> = {
      Push: 0,
      Pull: 0,
      Legs: 0,
      Core: 0
    };

    const recsToCount = selectedMuscles.length > 0 ? recommendations : allRecommendations;
    recsToCount.forEach(rec => {
      counts[rec.exercise.category]++;
    });

    return counts;
  }, [allRecommendations, recommendations, selectedMuscles]);

  // Handlers for calibration modals
  const handleViewEngagement = async (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    try {
      const data = await getExerciseCalibrations(exerciseId);
      setSelectedExerciseData(data);
      setViewerOpen(true);
    } catch (error) {
      console.error('Failed to load exercise calibrations:', error);
    }
  };

  const handleEditCalibration = () => {
    setViewerOpen(false);
    setEditorOpen(true);
  };

  const handleCalibrationSaved = () => {
    // Refresh calibrations
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to reload calibrations:', err));
  };

  const categories = [
    { label: 'All', value: null, count: recommendations.length },
    { label: 'Push', value: 'Push' as ExerciseCategory, count: categoryCounts.Push },
    { label: 'Pull', value: 'Pull' as ExerciseCategory, count: categoryCounts.Pull },
    { label: 'Legs', value: 'Legs' as ExerciseCategory, count: categoryCounts.Legs },
    { label: 'Core', value: 'Core' as ExerciseCategory, count: categoryCounts.Core }
  ];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-brand-cyan border-t-transparent rounded-full"></div>
          <p className="text-lg font-semibold text-brand-cyan">Loading Recommendations...</p>
          <p className="text-sm text-slate-400">Analyzing muscle fatigue and exercise options</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-red-400 mb-2">⚠️ Error Loading Recommendations</p>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => {
            // Retry by triggering useEffect
            setError(null);
            setIsLoading(true);
          }}
          className="bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle empty states
  if (!equipment || equipment.length === 0) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-yellow-400 mb-2">⚙️ No Equipment Configured</p>
        <p className="text-slate-400">
          Add equipment to your profile to see personalized exercise recommendations.
        </p>
      </div>
    );
  }

  if (selectedMuscles.length === 0) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-blue-400 mb-2">🎯 Select a Muscle to Get Started</p>
        <p className="text-slate-400">
          Click on a muscle in the body map above to see personalized exercise recommendations.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0 && !isLoading) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-blue-400 mb-2">🛌 No Exercises Available</p>
        <p className="text-slate-400">
          No exercises match your criteria. Try selecting a different muscle or adjusting your equipment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {selectedMuscles.length > 0 ? (
            <>
              Exercises for{' '}
              <span className="text-brand-primary">
                {selectedMuscles.join(', ')}
              </span>
            </>
          ) : (
            'Recommended Exercises'
          )}
        </h3>
        {selectedMuscles.length > 0 && (
          <span className="text-sm text-slate-400">
            {recommendations.length} exercises found
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Excellent Opportunities */}
      {excellent.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-emerald-400">⭐ Excellent Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {excellent.slice(0, 6).map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
                score={(rec as any)._apiFactors?.total || rec.opportunityScore}
                factors={(rec as any)._apiFactors}
                warnings={(rec as any)._apiWarnings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Good Options */}
      {good.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-blue-400">✅ Good Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {good.slice(0, 6).map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
                score={(rec as any)._apiFactors?.total || rec.opportunityScore}
                factors={(rec as any)._apiFactors}
                warnings={(rec as any)._apiWarnings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suboptimal (Collapsed by default) */}
      {suboptimal.length > 0 && (
        <CollapsibleSection title={`⚠️ Suboptimal (${suboptimal.length} exercises - Limiting Factors Detected)`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suboptimal.map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
                score={(rec as any)._apiFactors?.total || rec.opportunityScore}
                factors={(rec as any)._apiFactors}
                warnings={(rec as any)._apiWarnings}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Not Recommended (Collapsed by default) */}
      {notRecommended.length > 0 && (
        <CollapsibleSection title={`❌ Not Recommended (${notRecommended.length} exercises - Needs Recovery)`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notRecommended.map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
                score={(rec as any)._apiFactors?.total || rec.opportunityScore}
                factors={(rec as any)._apiFactors}
                warnings={(rec as any)._apiWarnings}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Engagement Viewer Modal */}
      <EngagementViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        exerciseId={selectedExerciseId}
        onEdit={handleEditCalibration}
      />

      {/* Calibration Editor Modal */}
      {selectedExerciseData && (
        <CalibrationEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialData={selectedExerciseData}
          onSave={handleCalibrationSaved}
        />
      )}
    </div>
  );
};

export default ExerciseRecommendations;
