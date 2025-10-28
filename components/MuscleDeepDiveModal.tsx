import React, { useState } from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselinesResponse, PlannedExercise, WorkoutSession } from '../types';
import { XIcon } from './Icons';
import { EXERCISE_LIBRARY } from '../constants';
import { calculateEfficiencyScore, getEfficiencyBadge, findBottleneckMuscle } from '../utils/exerciseEfficiency';
import { ExerciseCard } from './ExerciseCard';

interface MuscleDeepDiveModalProps {
  isOpen: boolean;
  muscle: Muscle;
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselinesResponse;
  workoutHistory: WorkoutSession[];
  onClose: () => void;
  onAddToWorkout: (exercise: PlannedExercise) => void;
}

type TabType = 'recommended' | 'all' | 'history';

export const MuscleDeepDiveModal: React.FC<MuscleDeepDiveModalProps> = ({
  isOpen,
  muscle,
  muscleStates,
  muscleBaselines,
  workoutHistory,
  onClose,
  onAddToWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommended');
  const [isolationOnly, setIsolationOnly] = useState(false);
  const [compoundOnly, setCompoundOnly] = useState(false);
  const [highEfficiencyOnly, setHighEfficiencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'efficiency' | 'target' | 'alphabetical'>('efficiency');

  if (!isOpen) return null;

  const muscleState = muscleStates[muscle];
  const fatiguePercent = muscleState?.currentFatiguePercent ?? 0;

  // Filter exercises for this muscle
  const exercisesForMuscle = EXERCISE_LIBRARY.filter(ex =>
    ex.muscleEngagements.some(e => e.muscle === muscle)
  );

  // Prepare muscle capacities object
  const muscleCapacities = Object.fromEntries(
    Object.entries(muscleStates).map(([m, state]) => [
      m,
      {
        currentFatiguePercent: state.currentFatiguePercent,
        baseline: muscleBaselines[m as Muscle] ?? 10000,
      },
    ])
  );

  // Rank exercises by efficiency
  const rankedExercises = exercisesForMuscle
    .map(ex => ({
      exercise: ex,
      efficiencyScore: calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities),
      efficiencyBadge: getEfficiencyBadge(calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities)),
      bottleneckMuscle: findBottleneckMuscle(muscle, ex.muscleEngagements, muscleCapacities),
    }))
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, 5);

  // All exercises with filters and sorting
  const allExercises = exercisesForMuscle
    .map(ex => ({
      exercise: ex,
      efficiencyScore: calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities),
      efficiencyBadge: getEfficiencyBadge(calculateEfficiencyScore(muscle, ex.muscleEngagements, muscleCapacities)),
      bottleneckMuscle: findBottleneckMuscle(muscle, ex.muscleEngagements, muscleCapacities),
    }))
    .filter(item => {
      if (isolationOnly) {
        const targetEngagement = item.exercise.muscleEngagements.find(e => e.muscle === muscle);
        const hasLowSupporting = item.exercise.muscleEngagements
          .filter(e => e.muscle !== muscle)
          .every(e => e.percentage < 30);
        if (!targetEngagement || targetEngagement.percentage < 70 || !hasLowSupporting) return false;
      }

      if (compoundOnly) {
        const multiMuscle = item.exercise.muscleEngagements.filter(e => e.percentage >= 30).length >= 2;
        if (!multiMuscle) return false;
      }

      if (highEfficiencyOnly) {
        if (item.efficiencyBadge.color !== 'green') return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'efficiency') return b.efficiencyScore - a.efficiencyScore;
      if (sortBy === 'target') {
        const aTarget = a.exercise.muscleEngagements.find(e => e.muscle === muscle)?.percentage ?? 0;
        const bTarget = b.exercise.muscleEngagements.find(e => e.muscle === muscle)?.percentage ?? 0;
        return bTarget - aTarget;
      }
      return a.exercise.name.localeCompare(b.exercise.name);
    });

  // Exercise history for this muscle
  const exerciseHistory = workoutHistory
    .flatMap(workout =>
      workout.loggedExercises.map(logged => {
        const exercise = EXERCISE_LIBRARY.find(ex => ex.id === logged.exerciseId);
        if (!exercise) return null;

        const engagesTargetMuscle = exercise.muscleEngagements.some(e => e.muscle === muscle);
        if (!engagesTargetMuscle) return null;

        const totalVolume = logged.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);

        return {
          exercise,
          workout,
          totalVolume,
          date: workout.endTime,
        };
      })
    )
    .filter(Boolean)
    .sort((a, b) => b!.date - a!.date)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-brand-muted">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{muscle}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-brand-muted">{fatiguePercent}% fatigued</span>
              <div className="w-32 bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    fatiguePercent < 33 ? 'bg-green-500' :
                    fatiguePercent < 66 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fatiguePercent}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-brand-muted">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            All Exercises
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recommended' && (
            <div className="space-y-3">
              <p className="text-sm text-brand-muted mb-4">
                Top 5 exercises ranked by efficiency for {muscle}
              </p>
              {rankedExercises.map(({ exercise, efficiencyScore, efficiencyBadge, bottleneckMuscle }) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  targetMuscle={muscle}
                  muscleStates={muscleCapacities}
                  efficiencyScore={efficiencyScore}
                  efficiencyBadge={efficiencyBadge}
                  bottleneckMuscle={bottleneckMuscle}
                  onAddToWorkout={onAddToWorkout}
                />
              ))}
            </div>
          )}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsolationOnly(!isolationOnly)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isolationOnly
                      ? 'bg-brand-accent text-brand-dark'
                      : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
                  }`}
                >
                  Isolation Only
                </button>
                <button
                  onClick={() => setCompoundOnly(!compoundOnly)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    compoundOnly
                      ? 'bg-brand-accent text-brand-dark'
                      : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
                  }`}
                >
                  Compound Only
                </button>
                <button
                  onClick={() => setHighEfficiencyOnly(!highEfficiencyOnly)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    highEfficiencyOnly
                      ? 'bg-brand-accent text-brand-dark'
                      : 'bg-brand-muted text-brand-text hover:bg-brand-surface'
                  }`}
                >
                  High Efficiency
                </button>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-brand-muted mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 bg-brand-surface border border-brand-muted rounded text-sm text-brand-text"
                >
                  <option value="efficiency">Efficiency</option>
                  <option value="target">Target %</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              {/* Exercise List */}
              <div className="space-y-3">
                {allExercises.map(({ exercise, efficiencyScore, efficiencyBadge, bottleneckMuscle }) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    targetMuscle={muscle}
                    muscleStates={muscleCapacities}
                    efficiencyScore={efficiencyScore}
                    efficiencyBadge={efficiencyBadge}
                    bottleneckMuscle={bottleneckMuscle}
                    onAddToWorkout={onAddToWorkout}
                  />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {exerciseHistory.length === 0 ? (
                <p className="text-center text-brand-muted py-8">
                  No training history for {muscle} yet
                </p>
              ) : (
                exerciseHistory.map((item, idx) => {
                  if (!item) return null;
                  const daysAgo = Math.floor((Date.now() - item.date) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="bg-brand-muted rounded-lg p-4">
                      <h3 className="font-medium text-brand-text">{item.exercise.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-brand-muted">
                        <span>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}</span>
                        <span>•</span>
                        <span>{item.totalVolume.toLocaleString()} lbs total</span>
                      </div>
                      <button className="text-xs text-brand-accent hover:underline mt-2">
                        → View workout
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
