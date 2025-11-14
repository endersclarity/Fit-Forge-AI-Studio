import React, { useState } from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselinesResponse, PlannedExercise, WorkoutSession } from '../types';
import { XIcon } from './Icons';
import { EXERCISE_LIBRARY } from '../constants';
import { calculateEfficiencyScore, getEfficiencyBadge, findBottleneckMuscle } from '../utils/exerciseEfficiency';
import { ExerciseCard } from './ExerciseCard';
import { Sheet, Card, Button } from '../src/design-system/components/primitives';

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
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      height="lg"
      title={muscle}
      description={`${fatiguePercent}% fatigued`}
    >
      <div className="space-y-6">
        {/* Fatigue Progress Bar */}
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-body">{fatiguePercent}% fatigued</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  fatiguePercent < 33 ? 'bg-green-600' :
                  fatiguePercent < 66 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${fatiguePercent}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <Button
            onClick={() => setActiveTab('recommended')}
            variant="ghost"
            size="md"
            className={`px-6 py-3 rounded-none ${
              activeTab === 'recommended'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600'
            }`}
          >
            Recommended
          </Button>
          <Button
            onClick={() => setActiveTab('all')}
            variant="ghost"
            size="md"
            className={`px-6 py-3 rounded-none ${
              activeTab === 'all'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600'
            }`}
          >
            All Exercises
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant="ghost"
            size="md"
            className={`px-6 py-3 rounded-none ${
              activeTab === 'history'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600'
            }`}
          >
            History
          </Button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'recommended' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-body mb-4">
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
                <Button
                  onClick={() => setIsolationOnly(!isolationOnly)}
                  variant={isolationOnly ? 'primary' : 'secondary'}
                  size="sm"
                  className="min-h-[60px]"
                >
                  Isolation Only
                </Button>
                <Button
                  onClick={() => setCompoundOnly(!compoundOnly)}
                  variant={compoundOnly ? 'primary' : 'secondary'}
                  size="sm"
                  className="min-h-[60px]"
                >
                  Compound Only
                </Button>
                <Button
                  onClick={() => setHighEfficiencyOnly(!highEfficiencyOnly)}
                  variant={highEfficiencyOnly ? 'primary' : 'secondary'}
                  size="sm"
                  className="min-h-[60px]"
                >
                  High Efficiency
                </Button>
              </div>

              {/* Sort */}
              <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
                <label className="text-xs text-gray-600 font-body mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-foreground font-body"
                >
                  <option value="efficiency">Efficiency</option>
                  <option value="target">Target %</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </Card>

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
                <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-8">
                  <p className="text-center text-gray-600 font-body">
                    No training history for {muscle} yet
                  </p>
                </Card>
              ) : (
                exerciseHistory.map((item, idx) => {
                  if (!item) return null;
                  const daysAgo = Math.floor((Date.now() - item.date) / (1000 * 60 * 60 * 24));
                  return (
                    <Card key={idx} variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
                      <h3 className="font-medium text-foreground font-display">{item.exercise.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 font-body">
                        <span>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}</span>
                        <span>•</span>
                        <span>{item.totalVolume.toLocaleString()} lbs total</span>
                      </div>
                      <button className="text-xs text-accent hover:underline mt-2 font-body">
                        → View workout
                      </button>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
};

export default MuscleDeepDiveModal;
