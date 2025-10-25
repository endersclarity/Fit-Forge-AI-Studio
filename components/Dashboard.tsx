import React, { useState, useMemo, useEffect } from 'react';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from '../constants';
import { Muscle, MuscleStatesResponse, UserProfile, WorkoutSession, MuscleBaselines, LoggedExercise, ExerciseCategory, Exercise, WorkoutTemplate } from '../types';
import { getUserLevel, formatDuration } from '../utils/helpers';
import { DumbbellIcon, UserIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { RecommendedWorkoutData } from '../App';
import DashboardQuickStart from './DashboardQuickStart';

interface DashboardProps {
  profile: UserProfile;
  workouts: WorkoutSession[];
  muscleBaselines: MuscleBaselines;
  templates: WorkoutTemplate[];
  onStartWorkout: () => void;
  onStartRecommendedWorkout: (data: RecommendedWorkoutData) => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onNavigateToProfile: () => void;
  onNavigateToBests: () => void;
  onNavigateToTemplates: () => void;
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
}> = ({ muscleStates, workouts, muscleBaselines, onStart }) => {

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
            <div className="bg-brand-surface p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Rest Day Recommended</h3>
                <p className="text-slate-400 text-sm">Your muscles need more recovery time. Come back tomorrow!</p>
            </div>
        );
    }
    
    return (
        <div className="bg-brand-surface p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Workout Recommendation</h3>
            <p className="text-2xl font-bold text-brand-cyan mb-2">Ready for: {recommendation.category} Day {recommendation.variation}</p>
            <p className="text-xs text-slate-400 mb-4">
                {recommendation.recoveredMuscles.map(m => `${m.muscle} (${m.recovery.toFixed(0)}%)`).join(', ')}
            </p>

            <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Suggested Exercises:</h4>
                <ul className="grid grid-cols-2 gap-2 text-xs">
                    {recommendation.suggestedExercises.map(ex => <li key={ex.id} className="bg-brand-muted px-2 py-1 rounded">{ex.name}</li>)}
                </ul>
            </div>
            
            {recommendation.targetVolumes.length > 0 && (
                 <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Target Volume:</h4>
                    <p className="text-xs text-slate-400">
                        {recommendation.targetVolumes.map(v => `${v.muscle} ${v.low.toLocaleString()}-${v.high.toLocaleString()} lbs`).join(', ')}
                    </p>
                </div>
            )}
           
            <button
                onClick={() => onStart({ type: recommendation.category, variation: recommendation.variation, suggestedExercises: recommendation.suggestedExercises })}
                className="w-full bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg text-base hover:bg-cyan-500 transition-colors"
            >
                Start This Workout
            </button>
        </div>
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

const MuscleFatigueHeatMap: React.FC<{ muscleStates: MuscleStatesResponse, workouts: WorkoutSession[], muscleBaselines: MuscleBaselines }> = ({ muscleStates, workouts, muscleBaselines }) => {
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
      <div className="space-y-4">
        {categorizedMuscleData.map(({ category, muscles }) => (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-2 mt-4 first:mt-0">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                {category} Muscles
              </h4>
            </div>

            {/* Muscles in Category */}
            <div className="space-y-2">
              {muscles.map(({ muscle, daysSince, fatiguePercent, daysUntilRecovered, lastTrained }) => {
                const isReady = fatiguePercent <= 33;

                return (
                  <div key={muscle} className="bg-brand-muted rounded-md">
                    <button
                      onClick={() => handleMuscleClick(muscle)}
                      className="w-full text-left p-3 focus:outline-none hover:bg-brand-surface transition-colors cursor-pointer"
                      aria-label={`${muscle}: ${fatiguePercent}% fatigued${isReady ? ', ready now' : `, ready in ${daysUntilRecovered} days`}`}
                    >
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium">{muscle}</span>
                        <span className="text-slate-400">
                          {fatiguePercent === 0 ? 'Fully Recovered' : `${fatiguePercent}% fatigued`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2.5 mb-2">
                        <div
                          className={`${getFatigueColor(fatiguePercent)} h-2.5 rounded-full transition-all duration-300`}
                          style={{ width: `${fatiguePercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>
                          {lastTrained ? `Last trained: ${daysSince !== null ? Math.floor(daysSince) : 0}d ago` : 'Never trained'}
                        </span>
                        <span>
                          {isReady ? (
                            <span className="text-green-400 font-semibold">Ready now</span>
                          ) : (
                            `Ready in ${daysUntilRecovered}d`
                          )}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={handleModalClose}
        >
          <div
            className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Exercises for {selectedMuscle}</h3>
              <button
                onClick={handleModalClose}
                className="text-slate-400 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="space-y-2">
              {exercisesForMuscle.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  No exercises found for this muscle.
                </p>
              ) : (
                exercisesForMuscle.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex justify-between items-center p-3 bg-brand-muted rounded hover:bg-brand-dark transition-colors"
                  >
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-xs text-slate-400">{ex.category}</p>
                    </div>
                    <span className="text-brand-cyan font-semibold text-lg">
                      {ex.engagement}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const WorkoutHistory: React.FC<{ workouts: WorkoutSession[] }> = ({ workouts }) => {
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

    const getExerciseName = (id: string) => EXERCISE_LIBRARY.find(e => e.id === id)?.name || 'Unknown Exercise';

    if (workouts.length === 0) {
        return <p className="text-slate-400 text-center py-4">No workouts logged yet. Let's get started!</p>;
    }

    return (
        <div className="space-y-3">
            {workouts.slice().sort((a,b) => b.endTime - a.endTime).slice(0,5).map(workout => {
                const isExpanded = expandedWorkoutId === workout.id;
                return (
                    <div key={workout.id} className="bg-brand-muted rounded-md">
                        <button onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)} className="w-full text-left p-3 focus:outline-none">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{workout.name}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                                        <p>{workout.type} Day {workout.variation && `(${workout.variation})`}</p>
                                        <span>&bull;</span>
                                        <p>{formatDuration(workout.endTime - workout.startTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <p className="text-sm text-slate-400">{new Date(workout.endTime).toLocaleDateString()}</p>
                                    {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                                </div>
                            </div>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                                <div className="p-3 pt-2 border-t border-slate-600/50 text-xs">
                                    {workout.loggedExercises.map((ex: LoggedExercise) => (
                                        <div key={ex.id} className="mb-2 last:mb-0">
                                            <p className="font-semibold text-slate-300">{getExerciseName(ex.exerciseId)}</p>
                                            <ul className="list-disc list-inside pl-2 text-slate-400">
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
                    </div>
                );
            })}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ profile, workouts, muscleBaselines, templates, onStartWorkout, onStartRecommendedWorkout, onSelectTemplate, onNavigateToProfile, onNavigateToBests, onNavigateToTemplates }) => {
  const { level, progress, nextLevelWorkouts } = getUserLevel(workouts.length);

  // State management for fetching muscle states from API
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch muscle states from backend API
  const fetchMuscleStates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use API_BASE_URL from env to hit backend correctly
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/muscle-states`);
      if (!response.ok) throw new Error('Failed to fetch muscle states');
      const data = await response.json();
      setMuscleStates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching muscle states:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on component mount
  useEffect(() => {
    fetchMuscleStates();
  }, []);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-brand-dark space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <DumbbellIcon className="w-8 h-8 text-brand-cyan" />
            <h1 className="text-2xl font-bold tracking-tight">FitForge</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onNavigateToBests} className="p-2 rounded-full hover:bg-brand-surface">
                <TrophyIcon className="w-6 h-6 text-yellow-400"/>
            </button>
            <button onClick={onNavigateToProfile} className="p-2 rounded-full hover:bg-brand-surface">
                <UserIcon className="w-6 h-6"/>
            </button>
        </div>
      </header>

      <main className="space-y-8">
        <section className="bg-brand-surface p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-1">Welcome back, {profile.name || 'Athlete'}!</h2>
          <p className="text-slate-400 mb-4">You are Level {level}. Ready to forge your strength?</p>
          <div className="w-full bg-brand-muted rounded-full h-2.5">
            <div className="bg-brand-cyan h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">
            {level < 4 ? `${nextLevelWorkouts - workouts.length} workouts to Level ${level + 1}` : "Max level reached!"}
          </p>
        </section>

        <section>
            <WorkoutRecommender
                muscleStates={muscleStates}
                workouts={workouts}
                muscleBaselines={muscleBaselines}
                onStart={onStartRecommendedWorkout}
            />
        </section>

        <section>
            <DashboardQuickStart
                templates={templates}
                onSelectTemplate={onSelectTemplate}
                onViewAllTemplates={onNavigateToTemplates}
            />
        </section>

        <section className="space-y-3">
            <button
                onClick={onNavigateToTemplates}
                className="w-full bg-brand-surface text-white font-semibold py-4 px-4 rounded-lg text-lg hover:bg-opacity-80 transition-colors border border-brand-cyan"
            >
                📋 Browse Workout Templates
            </button>
            <button
                onClick={onStartWorkout}
                className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg text-lg hover:bg-cyan-400 transition-colors"
            >
                Start Custom Workout
            </button>
        </section>

        <section className="bg-brand-surface p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Muscle Fatigue Heat Map</h3>
              <button
                onClick={fetchMuscleStates}
                disabled={loading}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  loading
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
                }`}
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">Error: {error}</p>
                <button
                  onClick={fetchMuscleStates}
                  className="bg-brand-cyan text-brand-dark px-4 py-2 rounded hover:bg-cyan-400 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : loading && Object.keys(muscleStates).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Loading muscle states...</p>
              </div>
            ) : (
              <MuscleFatigueHeatMap muscleStates={muscleStates} workouts={workouts} muscleBaselines={muscleBaselines} />
            )}
        </section>

        <section className="bg-brand-surface p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Workout History</h3>
            <WorkoutHistory workouts={workouts} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;