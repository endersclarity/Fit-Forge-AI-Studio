import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from '../constants';
import { Muscle, MuscleStatesResponse, DetailedMuscleStatesResponse, UserProfile, WorkoutSession, MuscleBaselines, LoggedExercise, ExerciseCategory, Exercise, WorkoutTemplate, WorkoutResponse, PersonalBestsResponse, PlannedExercise } from '../types';
import { formatDuration } from '../utils/helpers';
import { DumbbellIcon, UserIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon, BarChartIcon, ActivityIcon } from './Icons';
import { RecommendedWorkoutData } from '../App';
import ExerciseRecommendations from './ExerciseRecommendations';
import QuickTrainingStats from './QuickTrainingStats';
import WorkoutHistorySummary from './WorkoutHistorySummary';
import { calculateStreak, calculateWeeklyStats, findRecentPRs } from '../utils/statsHelpers';
import QuickAdd from './QuickAdd';
import Toast from './Toast';
import { MuscleVisualizationContainer } from './MuscleVisualization/MuscleVisualizationContainer';
import WorkoutPlannerModal from './WorkoutPlannerModal';
import CollapsibleCard from './CollapsibleCard';
import { MuscleDeepDiveModal } from './MuscleDeepDiveModal';
import FABMenu from './FABMenu';
import TemplateSelector from './TemplateSelector';
import WorkoutBuilder from './WorkoutBuilder';
import { DetailedMuscleCard } from './fitness/DetailedMuscleCard';
import { Card, Button, Badge, ProgressBar } from '../src/design-system/components/primitives';
import { useMotion } from '@/src/providers/MotionProvider';
import { listContainerVariants, listItemVariants, SPRING_TRANSITION } from '@/src/providers/motion-presets';

interface DashboardProps {
  profile: UserProfile;
  workouts: WorkoutSession[];
  muscleBaselines: MuscleBaselines;
  templates: WorkoutTemplate[];
  onStartWorkout: () => void;
  onStartPlannedWorkout?: (plannedExercises: PlannedExercise[]) => void;
  onStartRecommendedWorkout: (data: RecommendedWorkoutData) => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onNavigateToProfile: () => void;
  onNavigateToBests: () => void;
  onNavigateToTemplates: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToMuscleBaselines?: () => void;
}

const PRIMARY_MUSCLE_GROUPS: Record<string, Muscle[]> = {
  Push: [Muscle.Pectoralis, Muscle.Triceps, Muscle.Deltoids],
  Pull: [Muscle.Lats, Muscle.Biceps, Muscle.Rhomboids, Muscle.Trapezius],
  Legs: [Muscle.Quadriceps, Muscle.Glutes, Muscle.Hamstrings],
};

const WorkoutRecommender: React.FC<{
    muscleStates: MuscleStatesResponse;
    workouts: WorkoutSession[];
    muscleBaselines: MuscleBaselines;
    onStart: (data: RecommendedWorkoutData) => void;
    isLoading?: boolean;
}> = ({ muscleStates, workouts, muscleBaselines, onStart, isLoading = false }) => {

    const recommendation = useMemo(() => {
        const RECOVERY_THRESHOLD = 90;

        const recoveredMuscles = ALL_MUSCLES
            .map(muscle => {
                const state = muscleStates[muscle];
                if (!state || !state.lastTrained) return { muscle, recovery: 100 };
                // Use backend-calculated recovery: 100 - currentFatiguePercent
                const recovery = 100 - state.currentFatiguePercent;
                return { muscle, recovery };
            })
            .filter(m => m.recovery >= RECOVERY_THRESHOLD);

        const categoryScores: Record<string, { score: number; totalRecovery: number }> = { Push: { score: 0, totalRecovery: 0 }, Pull: { score: 0, totalRecovery: 0 }, Legs: { score: 0, totalRecovery: 0 } };
        const recoveredMusclesByCategory: Record<string, { muscle: Muscle; recovery: number }[]> = { Push: [], Pull: [], Legs: [] };

        recoveredMuscles.forEach(({ muscle, recovery }) => {
            for (const category in PRIMARY_MUSCLE_GROUPS) {
                if (PRIMARY_MUSCLE_GROUPS[category].includes(muscle)) {
                    categoryScores[category].score++;
                    categoryScores[category].totalRecovery += recovery;
                    recoveredMusclesByCategory[category].push({ muscle, recovery });
                }
            }
        });

        const sortedCategories = Object.entries(categoryScores).sort(([, a], [, b]) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.totalRecovery - a.totalRecovery;
        });

        const bestCategory = sortedCategories[0][0] as ExerciseCategory;

        if (categoryScores[bestCategory].score === 0) {
            return { type: 'rest' as const };
        }

        const lastWorkoutOfType = workouts
            .filter(w => w.type === bestCategory)
            .sort((a, b) => b.endTime - a.endTime)[0];
        const nextVariation = lastWorkoutOfType?.variation === 'A' ? ('B' as const) : ('A' as const);

        const suggestedExercises = EXERCISE_LIBRARY
            .filter(ex => ex.category === bestCategory && (ex.variation === 'Both' || ex.variation === nextVariation))
            .slice(0, 4);

        const targetMuscles = PRIMARY_MUSCLE_GROUPS[bestCategory];
        const targetVolumes = targetMuscles
            .filter(muscle => recoveredMuscles.some(rm => rm.muscle === muscle))
            .map(muscle => {
                const baseline = muscleBaselines[muscle]?.userOverride || muscleBaselines[muscle]?.systemLearnedMax || 0;
                if (baseline === 0) return null;
                return {
                    muscle,
                    low: Math.round(baseline * 0.7 / 100) * 100,
                    high: Math.round(baseline * 0.9 / 100) * 100
                };
            }).filter((v): v is { muscle: Muscle; low: number; high: number; } => v !== null && v.low > 0);

        return {
            type: 'workout' as const,
            category: bestCategory,
            variation: nextVariation,
            recoveredMuscles: recoveredMusclesByCategory[bestCategory].sort((a,b) => b.recovery - a.recovery),
            suggestedExercises,
            targetVolumes,
        };
    }, [muscleStates, workouts, muscleBaselines]);

    if (recommendation.type === 'rest') {
        return (
            <Card variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark text-center">
                <h3 className="text-lg font-display font-semibold mb-2 dark:text-dark-text-primary">Rest Day Recommended</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary text-sm font-body">Your muscles need more recovery time. Come back tomorrow!</p>
            </Card>
        );
    }

    return (
        <Card variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark">
            <h3 className="text-lg font-display font-semibold mb-1 dark:text-dark-text-primary">Workout Recommendation</h3>
            <p className="text-2xl font-display font-bold text-primary mb-2">Ready for: {recommendation.category} Day {recommendation.variation}</p>
            <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-body mb-4">
                {recommendation.recoveredMuscles.map(m => `${m.muscle} (${m.recovery.toFixed(0)}%)`).join(', ')}
            </p>

            <div className="mb-4">
                <h4 className="font-display font-semibold text-sm mb-2 dark:text-dark-text-primary">Suggested Exercises:</h4>
                <ul className="grid grid-cols-2 gap-2 text-xs font-body">
                    {recommendation.suggestedExercises.map(ex => (
                      <li key={ex.id}>
                        <Badge variant="info" size="sm" className="w-full">{ex.name}</Badge>
                      </li>
                    ))}
                </ul>
            </div>

            {recommendation.targetVolumes.length > 0 && (
                 <div className="mb-4">
                    <h4 className="font-display font-semibold text-sm mb-2 dark:text-dark-text-primary">Target Volume:</h4>
                    <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-body">
                        {recommendation.targetVolumes.map(v => `${v.muscle} ${v.low.toLocaleString()}-${v.high.toLocaleString()} lbs`).join(', ')}
                    </p>
                </div>
            )}

            <Button
                onClick={() => onStart({ type: recommendation.category, variation: recommendation.variation, suggestedExercises: recommendation.suggestedExercises })}
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full min-h-[60px]"
                aria-label="Start workout"
            >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting Workout...
                  </span>
                ) : 'Start This Workout'}
            </Button>
        </Card>
    );
};


// Muscle category groupings for heat map
const MUSCLE_CATEGORIES: Record<string, Muscle[]> = {
  Push: [Muscle.Pectoralis, Muscle.Deltoids, Muscle.Triceps],
  Pull: [Muscle.Lats, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Biceps, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Hamstrings, Muscle.Glutes, Muscle.Calves],
  Core: [Muscle.Core]
};

// Helper functions for fatigue visualization
const getFatigueColor = (fatiguePercent: number): string => {
  if (fatiguePercent <= 33) return 'bg-green-500';
  if (fatiguePercent <= 66) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getRecoveryStatus = (fatiguePercent: number): 'ready' | 'recovering' | 'fatigued' => {
  if (fatiguePercent <= 33) return 'ready';
  if (fatiguePercent <= 66) return 'recovering';
  return 'fatigued';
};

interface ExerciseForMuscle {
  id: string;
  name: string;
  engagement: number;
  category: ExerciseCategory;
}

const getExercisesForMuscle = (muscle: Muscle): ExerciseForMuscle[] => {
  return EXERCISE_LIBRARY
    .map(exercise => {
      const engagement = exercise.muscleEngagements.find(e => e.muscle === muscle);
      if (!engagement) return null;
      return {
        id: exercise.id,
        name: exercise.name,
        engagement: engagement.percentage,
        category: exercise.category
      };
    })
    .filter((ex): ex is ExerciseForMuscle => ex !== null)
    .sort((a, b) => b.engagement - a.engagement);
};

const MuscleFatigueHeatMap: React.FC<{
  muscleStates: MuscleStatesResponse;
  detailedMuscleStates: DetailedMuscleStatesResponse;
  workouts: WorkoutSession[];
  muscleBaselines: MuscleBaselines;
  muscleDetailLevel: 'simple' | 'detailed';
}> = ({ muscleStates, detailedMuscleStates, workouts, muscleBaselines, muscleDetailLevel }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform muscle states into categorized fatigue data (using backend-calculated values)
  const categorizedMuscleData = useMemo(() => {
    return Object.entries(MUSCLE_CATEGORIES).map(([category, muscles]) => ({
      category,
      muscles: muscles.map(muscle => {
        const status = muscleStates[muscle];
        if (!status || !status.lastTrained) {
          return {
            muscle,
            daysSince: null,
            fatiguePercent: 0,
            daysUntilRecovered: 0,
            lastTrained: null
          };
        }
        // Use backend-calculated values directly - no frontend calculation!
        return {
          muscle,
          daysSince: status.daysElapsed,
          fatiguePercent: Math.round(status.currentFatiguePercent),
          daysUntilRecovered: Math.ceil(status.daysUntilRecovered),
          lastTrained: status.lastTrained
        };
      })
    }));
  }, [muscleStates]);

  const handleMuscleClick = (muscle: Muscle) => {
    setSelectedMuscle(muscle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMuscle(null);
  };

  const exercisesForMuscle = selectedMuscle ? getExercisesForMuscle(selectedMuscle) : [];

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleModalClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Prevent body scroll when modal open
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  return (
    <>
      {(isMotionEnabled ? (
        <motion.div
          className="space-y-4"
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
        >
          {categorizedMuscleData.map(({ category, muscles }) => {
            const Wrapper: any = motion.div;
            return (
              <Wrapper
                key={category}
                variants={listItemVariants}
                transition={{ ...SPRING_TRANSITION, damping: 32 }}
              >
                {/* Category Header */}
                <div className="mb-2 mt-4 first:mt-0">
                  <h4 className="text-sm font-display font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wide">
                    {category} Muscles
                  </h4>
                </div>

                {/* Muscles in Category */}
                <div className="space-y-2">
                  {muscles.map(({ muscle, daysSince, fatiguePercent, daysUntilRecovered, lastTrained }) => {
                    const isReady = fatiguePercent <= 33;

                    // Get detailed muscle data for this visualization muscle
                    const detailedMuscles = Object.values(detailedMuscleStates).filter(
                      (dm) => dm.visualizationMuscleName === muscle
                    );

                    // Conditional rendering based on detail level
                    if (muscleDetailLevel === 'detailed' && detailedMuscles.length > 0) {
                      return (
                        <DetailedMuscleCard
                          key={muscle}
                          muscleName={muscle}
                          aggregateFatigue={fatiguePercent}
                          detailedMuscles={detailedMuscles}
                          lastTrained={lastTrained ? new Date(lastTrained) : null}
                          onClick={() => handleMuscleClick(muscle)}
                        />
                      );
                    }

                    // Default simple view
                    return (
                      <Card key={muscle} variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark">
                        <button
                          onClick={() => handleMuscleClick(muscle)}
                          className="w-full text-left p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-gray-100/20 dark:hover:bg-white/10 transition-colors cursor-pointer min-h-[60px] rounded-lg"
                          aria-label={`${muscle}: ${fatiguePercent}% fatigued${isReady ? ', ready now' : `, ready in ${daysUntilRecovered} days`}`}
                        >
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="font-display font-medium dark:text-dark-text-primary">{muscle}</span>
                            <Badge
                              variant={fatiguePercent === 0 ? 'success' : fatiguePercent <= 33 ? 'success' : fatiguePercent <= 66 ? 'warning' : 'error'}
                              size="sm"
                            >
                              {fatiguePercent === 0 ? 'Fully Recovered' : `${fatiguePercent}% fatigued`}
                            </Badge>
                          </div>
                          <ProgressBar
                            value={fatiguePercent}
                            variant={fatiguePercent <= 33 ? 'success' : fatiguePercent <= 66 ? 'warning' : 'error'}
                            size="md"
                            aria-label={`Fatigue level: ${fatiguePercent}%`}
                            className="mb-2"
                          />
                          <div className="flex justify-between items-center text-xs text-gray-700 dark:text-dark-text-secondary font-body">
                            <span>
                              {lastTrained ? `Last trained: ${daysSince !== null ? Math.floor(daysSince) : 0}d ago` : 'Never trained'}
                            </span>
                            {isReady ? (
                              <Badge variant="success" size="sm">Ready now</Badge>
                            ) : (
                              <span>Ready in {daysUntilRecovered}d</span>
                            )}
                          </div>
                        </button>
                      </Card>
                    );
                  })}
                </div>
              </Wrapper>
            );
          })}
        </motion.div>
      ) : (
        <div className="space-y-4">
        {categorizedMuscleData.map(({ category, muscles }) => (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-2 mt-4 first:mt-0">
              <h4 className="text-sm font-display font-semibold text-gray-600 uppercase tracking-wide">
                {category} Muscles
              </h4>
            </div>

            {/* Muscles in Category */}
            <div className="space-y-2">
              {muscles.map(({ muscle, daysSince, fatiguePercent, daysUntilRecovered, lastTrained }) => {
                const isReady = fatiguePercent <= 33;

                // Get detailed muscle data for this visualization muscle
                const detailedMuscles = Object.values(detailedMuscleStates).filter(
                  (dm) => dm.visualizationMuscleName === muscle
                );

                // Conditional rendering based on detail level
                if (muscleDetailLevel === 'detailed' && detailedMuscles.length > 0) {
                  return (
                    <DetailedMuscleCard
                      key={muscle}
                      muscleName={muscle}
                      aggregateFatigue={fatiguePercent}
                      detailedMuscles={detailedMuscles}
                      lastTrained={lastTrained ? new Date(lastTrained) : null}
                      onClick={() => handleMuscleClick(muscle)}
                    />
                  );
                }

                // Default simple view
                return (
                  <Card key={muscle} variant="default" className="bg-white/50 backdrop-blur-lg">
                    <button
                      onClick={() => handleMuscleClick(muscle)}
                      className="w-full text-left p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-gray-100/20 transition-colors cursor-pointer min-h-[60px] rounded-lg"
                      aria-label={`${muscle}: ${fatiguePercent}% fatigued${isReady ? ', ready now' : `, ready in ${daysUntilRecovered} days`}`}
                    >
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="font-display font-medium">{muscle}</span>
                        <Badge
                          variant={fatiguePercent === 0 ? 'success' : fatiguePercent <= 33 ? 'success' : fatiguePercent <= 66 ? 'warning' : 'error'}
                          size="sm"
                        >
                          {fatiguePercent === 0 ? 'Fully Recovered' : `${fatiguePercent}% fatigued`}
                        </Badge>
                      </div>
                      <ProgressBar
                        value={fatiguePercent}
                        variant={fatiguePercent <= 33 ? 'success' : fatiguePercent <= 66 ? 'warning' : 'error'}
                        size="md"
                        aria-label={`Fatigue level: ${fatiguePercent}%`}
                        className="mb-2"
                      />
                      <div className="flex justify-between items-center text-xs text-gray-700 font-body">
                        <span>
                          {lastTrained ? `Last trained: ${daysSince !== null ? Math.floor(daysSince) : 0}d ago` : 'Never trained'}
                        </span>
                        {isReady ? (
                          <Badge variant="success" size="sm">Ready now</Badge>
                        ) : (
                          <span>Ready in {daysUntilRecovered}d</span>
                        )}
                      </div>
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      ))}

      {/* Exercise Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={handleModalClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="muscle-exercises-title"
        >
          <Card
            variant="elevated"
            className="bg-white/95 backdrop-blur-lg dark:bg-dark-bg-secondary max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center mb-4">
              <h3 id="muscle-exercises-title" className="text-lg font-display font-semibold dark:text-dark-text-primary">Exercises for {selectedMuscle}</h3>
              <Button
                onClick={handleModalClose}
                variant="ghost"
                size="sm"
                className="min-w-[44px] min-h-[44px]"
                aria-label="Close dialog"
              >
                ×
              </Button>
            </header>

            <div className="space-y-2">
              {exercisesForMuscle.length === 0 ? (
                <p className="text-gray-600 dark:text-dark-text-secondary font-body text-center py-4">
                  No exercises found for this muscle.
                </p>
              ) : (
                exercisesForMuscle.map((ex) => (
                  <Card
                    key={ex.id}
                    variant="default"
                    className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark hover:bg-white/70 dark:hover:bg-glass-surface-darkElevated transition-colors"
                  >
                    <div className="flex justify-between items-center p-3">
                      <div>
                        <p className="font-display font-medium dark:text-dark-text-primary">{ex.name}</p>
                        <Badge variant="info" size="sm" className="mt-1">{ex.category}</Badge>
                      </div>
                      <Badge variant="primary" size="lg" className="text-lg">
                        {ex.engagement}%
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

const WorkoutHistory: React.FC<{ workouts: WorkoutSession[] }> = ({ workouts }) => {
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

    const getExerciseName = (id: string) => EXERCISE_LIBRARY.find(e => e.id === id)?.name || 'Unknown Exercise';

    if (workouts.length === 0) {
        return <p className="text-gray-600 dark:text-dark-text-secondary font-body text-center py-4">No workouts logged yet. Let's get started!</p>;
    }

    return (
        <div className="space-y-3">
            {workouts.slice().sort((a,b) => b.endTime - a.endTime).slice(0,5).map(workout => {
                const isExpanded = expandedWorkoutId === workout.id;
                return (
                    <Card key={workout.id} variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark">
                        <button
                          onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                          className="w-full text-left p-3 focus:outline-none min-h-[60px]"
                          aria-label={`${workout.name} workout details`}
                          aria-expanded={isExpanded}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-display font-semibold dark:text-dark-text-primary">{workout.name}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-dark-text-secondary font-body mt-1">
                                        <Badge variant="info" size="sm">
                                          {workout.type} Day {workout.variation && `(${workout.variation})`}
                                        </Badge>
                                        <span>&bull;</span>
                                        <p>{formatDuration(workout.endTime - workout.startTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <p className="text-sm text-gray-600 dark:text-dark-text-secondary font-body">{new Date(workout.endTime).toLocaleDateString()}</p>
                                    {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                                </div>
                            </div>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                                <div className="p-3 pt-2 border-t border-gray-200 dark:border-dark-border-DEFAULT text-xs font-body">
                                    {workout.loggedExercises.map((ex: LoggedExercise) => (
                                        <div key={ex.id} className="mb-2 last:mb-0">
                                            <p className="font-display font-semibold text-gray-800 dark:text-dark-text-primary">{getExerciseName(ex.exerciseId)}</p>
                                            <ul className="list-disc list-inside pl-2 text-gray-600 dark:text-dark-text-secondary">
                                                {ex.sets.map((set, i) => (
                                                    <li key={set.id}>
                                                        Set {i + 1}: {set.bodyweightAtTime
                                                            ? `Bodyweight (${set.weight} lbs)`
                                                            : `${set.weight} lbs`} x {set.reps} reps
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ profile, workouts, muscleBaselines, templates, onStartWorkout, onStartPlannedWorkout, onStartRecommendedWorkout, onSelectTemplate, onNavigateToProfile, onNavigateToBests, onNavigateToTemplates, onNavigateToAnalytics, onNavigateToMuscleBaselines }) => {

  // State management for fetching muscle states from API
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [detailedMuscleStates, setDetailedMuscleStates] = useState<DetailedMuscleStatesResponse>({});
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutResponse[]>([]);
  const [personalBests, setPersonalBests] = useState<PersonalBestsResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get muscle detail preference from localStorage
  const [muscleDetailLevel, setMuscleDetailLevel] = useState<'simple' | 'detailed'>(() => {
    const saved = localStorage.getItem('muscleDetailLevel');
    return (saved === 'simple' || saved === 'detailed') ? saved : 'simple';
  });

  // Muscle visualization selection state
  const [selectedMuscles, setSelectedMuscles] = useState<Muscle[]>([]);

  // Workout planner modal state
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  // QuickAdd modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Starting workout loading state
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);

  // FAB Menu and Builder state
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [loadedTemplate, setLoadedTemplate] = useState<WorkoutTemplate | null>(null);

  // Muscle deep dive modal state
  const [deepDiveModalOpen, setDeepDiveModalOpen] = useState(false);
  const [selectedMuscleForDeepDive, setSelectedMuscleForDeepDive] = useState<Muscle | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem('fitforge.showAdvancedAnalytics');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Get location for refresh detection
  const location = useLocation();
  const { isMotionEnabled } = useMotion();

  // Toast handler
  const handleToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Wrapper function for starting recommended workout with loading state
  const handleStartRecommendedWorkout = useCallback(async (data: RecommendedWorkoutData) => {
    setIsStartingWorkout(true);
    handleToast(`Starting ${data.type} Day ${data.variation} workout...`, 'info');

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    onStartRecommendedWorkout(data);
    setIsStartingWorkout(false);
  }, [onStartRecommendedWorkout]);

  // Muscle detail level toggle handler
  const toggleMuscleDetailLevel = () => {
    const newLevel = muscleDetailLevel === 'simple' ? 'detailed' : 'simple';
    setMuscleDetailLevel(newLevel);
    localStorage.setItem('muscleDetailLevel', newLevel);
  };

  // Muscle deep dive modal handlers
  const handleMuscleClickForDeepDive = (muscle: Muscle) => {
    setSelectedMuscleForDeepDive(muscle);
    setDeepDiveModalOpen(true);
  };

  const handleAddToWorkout = (planned: PlannedExercise) => {
    if (onStartPlannedWorkout) {
      onStartPlannedWorkout([planned]);
    }
    setDeepDiveModalOpen(false);
  };

  // Fetch muscle states, workouts, and personal bests from backend API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use API_BASE_URL from env to hit backend correctly
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      // Fetch all data in parallel
      const [muscleStatesRes, detailedMuscleStatesRes, workoutsRes, personalBestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/muscle-states`),
        fetch(`${API_BASE_URL}/muscle-states/detailed`),
        fetch(`${API_BASE_URL}/workouts`),
        fetch(`${API_BASE_URL}/personal-bests`)
      ]);

      if (!muscleStatesRes.ok) throw new Error('Failed to fetch muscle states');
      if (!detailedMuscleStatesRes.ok) throw new Error('Failed to fetch detailed muscle states');
      if (!workoutsRes.ok) throw new Error('Failed to fetch workouts');
      if (!personalBestsRes.ok) throw new Error('Failed to fetch personal bests');

      const [muscleStatesData, detailedMuscleStatesData, workoutsData, personalBestsData] = await Promise.all([
        muscleStatesRes.json(),
        detailedMuscleStatesRes.json(),
        workoutsRes.json(),
        personalBestsRes.json()
      ]);

      setMuscleStates(muscleStatesData);
      setDetailedMuscleStates(detailedMuscleStatesData);
      setWorkoutHistory(workoutsData);
      setPersonalBests(personalBestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on component mount AND when navigating back to dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('fitforge.showAdvancedAnalytics', JSON.stringify(showAdvancedAnalytics));
    } catch {
      /* noop */
    }
  }, [showAdvancedAnalytics]);

  // Calculate stats using useMemo for performance
  const streak = useMemo(() => calculateStreak(workoutHistory), [workoutHistory]);
  const weeklyStats = useMemo(() => calculateWeeklyStats(workoutHistory), [workoutHistory]);
  const recentPRs = useMemo(() => findRecentPRs(personalBests, workoutHistory), [personalBests, workoutHistory]);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-background dark:bg-dark-bg-primary space-y-6">
      <header className="flex justify-between items-center" role="banner">
        <div className="flex items-center gap-3">
            <DumbbellIcon className="w-8 h-8 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-display font-bold tracking-tight dark:text-dark-text-primary">FitForge</h1>
        </div>
        <div className="flex items-center gap-2">
            {onNavigateToAnalytics && (
              <Button
                onClick={onNavigateToAnalytics}
                variant="ghost"
                size="md"
                className="rounded-full min-w-[60px] min-h-[60px] flex items-center justify-center"
                title="Analytics"
                aria-label="Analytics"
              >
                <BarChartIcon className="w-6 h-6 text-purple-400"/>
              </Button>
            )}
            <Button
              onClick={onNavigateToBests}
              variant="ghost"
              size="md"
              className="rounded-full min-w-[60px] min-h-[60px] flex items-center justify-center"
              title="Personal Bests"
              aria-label="Personal Bests"
            >
                <TrophyIcon className="w-6 h-6 text-yellow-400"/>
            </Button>
            {onNavigateToMuscleBaselines && (
              <Button
                onClick={onNavigateToMuscleBaselines}
                variant="ghost"
                size="md"
                className="rounded-full min-w-[60px] min-h-[60px] flex items-center justify-center"
                title="Muscle Baselines"
                aria-label="Muscle Baselines"
              >
                <ActivityIcon className="w-6 h-6 text-primary"/>
              </Button>
            )}
            <Button
              onClick={onNavigateToProfile}
              variant="ghost"
              size="md"
              className="rounded-full min-w-[60px] min-h-[60px] flex items-center justify-center"
              title="Profile"
              aria-label="Profile"
            >
                <UserIcon className="w-6 h-6"/>
            </Button>
        </div>
      </header>

      <main id="main-content" className="space-y-8" role="main" tabIndex={-1}>
        <Card variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark">
          <h2 className="text-xl font-display font-semibold dark:text-dark-text-primary">Welcome, Kaelen</h2>
        </Card>

        {/* Muscle Visualization Hero Section */}
        {!loading && !error && Object.keys(muscleStates).length > 0 && (
          <Card variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark">
            <MuscleVisualizationContainer
              muscleStates={muscleStates}
              loading={loading}
              error={error ? new Error(error) : null}
              onMuscleClick={handleMuscleClickForDeepDive}
              onRefresh={async () => {
                await fetchDashboardData();
              }}
            />
          </Card>
        )}

        <CollapsibleCard title="Workout Recommendations" icon="💪" defaultExpanded={false}>
          <div aria-live="polite" aria-atomic="false">
            <WorkoutRecommender
              muscleStates={muscleStates}
              workouts={workouts}
              muscleBaselines={muscleBaselines}
              onStart={handleStartRecommendedWorkout}
              isLoading={isStartingWorkout}
            />
          </div>
        </CollapsibleCard>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
                onClick={() => setIsTemplateSelectorOpen(true)}
                variant="secondary"
                size="lg"
                className="w-full min-h-[60px] text-lg font-display font-bold"
                aria-label="Saved Workouts"
            >
                📋 Saved Workouts
            </Button>
            <Button
                onClick={() => setIsPlannerOpen(true)}
                variant="secondary"
                size="lg"
                className="w-full min-h-[60px] text-lg font-display font-bold bg-accent hover:bg-accent/90"
                aria-label="Plan Workout"
            >
                📊 Plan Workout
            </Button>
            <Button
                onClick={onStartWorkout}
                variant="primary"
                size="lg"
                className="w-full min-h-[60px] text-lg font-display font-bold"
                aria-label="Start Custom Workout"
            >
                ➕ Start Custom Workout
            </Button>
        </section>


        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          <p className="text-xs text-slate-500 dark:text-dark-text-muted">
            {showAdvancedAnalytics
              ? 'Advanced insights visible'
              : 'Advanced analytics hidden for faster scanning'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[40px]"
            onClick={() => setShowAdvancedAnalytics(prev => !prev)}
            aria-pressed={showAdvancedAnalytics}
          >
            {showAdvancedAnalytics ? 'Hide advanced analytics' : 'Show advanced analytics'}
          </Button>
        </div>

        <div
          className={
            'transition-all duration-500 ' +
            (showAdvancedAnalytics
              ? 'opacity-100 max-h-[5000px]'
              : 'opacity-0 max-h-0 overflow-hidden pointer-events-none')
          }
          aria-hidden={!showAdvancedAnalytics}
        >
          {!loading && !error && workoutHistory.length > 0 && (
            <CollapsibleCard title="Quick Stats" icon="📊" defaultExpanded={false}>
              <QuickTrainingStats
                streak={streak}
                weeklyStats={weeklyStats}
                recentPRs={recentPRs}
              />
            </CollapsibleCard>
          )}

          {!loading && !error && (
            <CollapsibleCard title="Recent Workouts" icon="📋" defaultExpanded={false}>
              <WorkoutHistorySummary
                workouts={workoutHistory}
                personalBests={personalBests}
              />
            </CollapsibleCard>
          )}

          {!loading && !error && Object.keys(muscleStates).length > 0 && (
            <CollapsibleCard title="Muscle Heat Map" icon="🔥" defaultExpanded={false}>
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  variant={loading ? 'ghost' : 'primary'}
                  size="sm"
                  className="min-h-[60px]"
                  aria-label="Refresh muscle data"
                >
                  {loading ? 'Loading...' : 'Refresh muscle data'}
                </Button>
                <Button
                  onClick={toggleMuscleDetailLevel}
                  variant="secondary"
                  size="sm"
                  className="min-h-[60px]"
                  aria-label="Toggle muscle detail level"
                >
                  {muscleDetailLevel === 'simple'
                    ? 'Show Detailed (42 muscles)'
                    : 'Show Simple (13 muscles)'}
                </Button>
              </div>
              <MuscleFatigueHeatMap
                muscleStates={muscleStates}
                detailedMuscleStates={detailedMuscleStates}
                workouts={workouts}
                muscleBaselines={muscleBaselines}
                muscleDetailLevel={muscleDetailLevel}
              />
            </CollapsibleCard>
          )}
        </div>

        {/* Exercise Recommendations Section */}
        {!loading && !error && Object.keys(muscleStates).length > 0 && (
          <CollapsibleCard title="Exercise Finder" icon="🎯" defaultExpanded={false}>
            {profile.equipment ? (
              <ExerciseRecommendations
                muscleStates={muscleStates}
                equipment={profile.equipment || []}
                selectedMuscles={selectedMuscles}
                onAddToWorkout={(exercise) => {
                  // Start a workout with the selected exercise
                  onStartRecommendedWorkout({
                    type: exercise.category,
                    variation: 'A', // Default to A variation
                    suggestedExercises: [exercise]
                  });
                }}
              />
            ) : (
              <Card variant="default" className="bg-white/50 backdrop-blur-lg dark:bg-glass-surface-dark text-center">
                <p className="text-gray-600 dark:text-dark-text-secondary font-body mb-2">Configure equipment in Profile to use Exercise Finder</p>
                <Button
                  onClick={onNavigateToProfile}
                  variant="primary"
                  size="md"
                  className="min-h-[60px]"
                  aria-label="Go to Profile"
                >
                  Go to Profile
                </Button>
              </Card>
            )}
          </CollapsibleCard>
        )}
      </main>

      {/* Floating Action Button for Quick Actions */}
      <Button
        onClick={() => setIsFABMenuOpen(true)}
        variant="primary"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:scale-110 flex items-center justify-center z-40 min-w-[60px] min-h-[60px]"
        aria-label="Quick Actions"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Button>

      {/* QuickAdd Modal */}
      <QuickAdd
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          // Refresh dashboard data after successful quick add
          fetchDashboardData();
        }}
        onToast={handleToast}
        availableEquipment={profile.equipment || []}
      />

      {/* Workout Planner Modal */}
      <WorkoutPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        onStartWorkout={(plannedExercises) => {
          if (onStartPlannedWorkout) {
            onStartPlannedWorkout(plannedExercises);
          } else {
            // Fallback to regular workout start if no handler provided
            onStartWorkout();
          }
        }}
      />

      {/* Muscle Deep Dive Modal */}
      {selectedMuscleForDeepDive && (
        <MuscleDeepDiveModal
          isOpen={deepDiveModalOpen}
          muscle={selectedMuscleForDeepDive}
          muscleStates={muscleStates}
          muscleBaselines={muscleBaselines}
          workoutHistory={workouts}
          onClose={() => setDeepDiveModalOpen(false)}
          onAddToWorkout={handleAddToWorkout}
        />
      )}

      {/* FAB Menu */}
      <FABMenu
        isOpen={isFABMenuOpen}
        onClose={() => setIsFABMenuOpen(false)}
        onLogWorkout={() => {
          setIsFABMenuOpen(false);
          setIsQuickAddOpen(true);
        }}
        onBuildWorkout={() => {
          setIsFABMenuOpen(false);
          setIsBuilderOpen(true);
        }}
        onLoadTemplate={() => {
          setIsFABMenuOpen(false);
          setIsTemplateSelectorOpen(true);
        }}
      />

      {/* Workout Builder Modal (placeholder for now) */}
      {/* Workout Builder */}
      <WorkoutBuilder
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setLoadedTemplate(null);
        }}
        onSuccess={() => {
          fetchDashboardData();
          setLoadedTemplate(null);
        }}
        onToast={handleToast}
        loadedTemplate={loadedTemplate}
        currentBodyweight={profile.bodyweightHistory && profile.bodyweightHistory.length > 0
          ? profile.bodyweightHistory.sort((a, b) => b.date - a.date)[0].weight
          : undefined}
      />

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onLoad={(template) => {
          setLoadedTemplate(template);
          setIsTemplateSelectorOpen(false);
          setIsBuilderOpen(true);
        }}
        onToast={handleToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default Dashboard;
