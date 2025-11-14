
import React, { useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants';
import { WorkoutSession, PersonalBests, MuscleBaselines, Muscle, Exercise, ExerciseMaxes } from '../types';
import { calculateVolume, formatDuration, findPreviousWorkout } from '../utils/helpers';
import { TrophyIcon, TrendingUpIcon } from './Icons';
import { Sheet, Card, Button } from '../src/design-system/components/primitives';

interface WorkoutSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: WorkoutSession;
    personalBests: PersonalBests;
    muscleBaselines: MuscleBaselines;
    allWorkouts: WorkoutSession[];
}

const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({ isOpen, onClose, session, personalBests, muscleBaselines, allWorkouts }) => {
    const summaryData = useMemo(() => {
        if (!session) return null;

        const totalVolume = session.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0);
        const duration = session.endTime - session.startTime;
        const exercisesCompleted = session.loggedExercises.length;

        // Muscle fatigue calculation
        const workoutMuscleVolumes: Partial<Record<Muscle, number>> = {};
        session.loggedExercises.forEach(loggedEx => {
            const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === loggedEx.exerciseId);
            if (!exerciseInfo) return;
            const exerciseVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
            exerciseInfo.muscleEngagements.forEach(engagement => {
                workoutMuscleVolumes[engagement.muscle] = (workoutMuscleVolumes[engagement.muscle] || 0) + exerciseVolume * (engagement.percentage / 100);
            });
        });

        const musclesWorked = Object.entries(workoutMuscleVolumes)
            .map(([muscleStr, volume]) => {
                const muscle = muscleStr as Muscle;
                const baselineData = muscleBaselines[muscle];
                const baseline = baselineData?.userOverride || baselineData?.systemLearnedMax || 10000;
                const fatiguePercent = Math.min((volume / baseline) * 100, 100);
                const recoveryDays = 1 + (fatiguePercent / 100) * 6;
                return { muscle, fatiguePercent, recoveryDays, volume };
            })
            .filter(m => m.volume > 0)
            .sort((a, b) => b.fatiguePercent - a.fatiguePercent);

        // Smart suggestions for muscles worked but under-fatigued
        const smartSuggestions = musclesWorked
            .filter(({ fatiguePercent }) => fatiguePercent < 30 && fatiguePercent > 0)
            .map(({ muscle }) => {
                const suggestedExercises = EXERCISE_LIBRARY
                    .filter(ex => ex.category === session.type && ex.muscleEngagements.some(me => me.muscle === muscle))
                    .slice(0, 3);
                return { muscle, suggestedExercises };
            }).filter(suggestion => suggestion.suggestedExercises.length > 0);

        // Personal records
        const newRecords = session.loggedExercises.map(loggedEx => {
            const pb = personalBests[loggedEx.exerciseId] || { bestSingleSet: 0, bestSessionVolume: 0, rollingAverageMax: 0 };
            const sessionVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
            const bestSetInSession = Math.max(...loggedEx.sets.map(s => calculateVolume(s.reps, s.weight)), 0);

            const newBestSingleSet = bestSetInSession > pb.bestSingleSet;
            const newSessionVolume = sessionVolume > pb.bestSessionVolume;
            
            if (newBestSingleSet || newSessionVolume) {
                const exerciseName = EXERCISE_LIBRARY.find(e => e.id === loggedEx.exerciseId)?.name || 'Unknown';
                return { exerciseName, newBestSingleSet, newSessionVolume };
            }
            return null;
        }).filter((record): record is { exerciseName: string; newBestSingleSet: boolean; newSessionVolume: boolean; } => record !== null);

        // Progressive Overload
        const previousWorkout = findPreviousWorkout(session, allWorkouts);
        let progressiveOverload = null;
        if (previousWorkout) {
            const previousVolume = previousWorkout.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0);
            if (previousVolume > 0) {
                const percentageChange = ((totalVolume - previousVolume) / previousVolume) * 100;
                progressiveOverload = {
                    previousVolume,
                    percentageChange,
                };
            }
        }

        return {
            totalVolume,
            duration,
            exercisesCompleted,
            musclesWorked,
            smartSuggestions,
            newRecords,
            progressiveOverload,
        };

    }, [session, personalBests, muscleBaselines, allWorkouts]);

    if (!isOpen || !session || !summaryData) return null;

    const getOverloadMessage = (percentage: number) => {
        if (percentage >= 3) return "Fantastic! You've hit the progressive overload target. Keep this momentum!";
        if (percentage > 0) return "Good work! You're making progress. Next time, try adding a rep to a few sets or a small amount of weight.";
        return `Every session is a win. For your next ${session.type} day, focus on matching or slightly beating today's numbers.`;
    };

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => { if (!open) onClose(); }}
            height="lg"
            title="Workout Complete!"
            description={session.name}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                        <p className="text-xl font-bold font-display text-foreground">{formatDuration(summaryData.duration)}</p>
                        <p className="text-sm text-gray-600 font-body">Duration</p>
                    </Card>
                    <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                        <p className="text-xl font-bold font-display text-foreground">{summaryData.totalVolume.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 font-body">Total Volume (lbs)</p>
                    </Card>
                    <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                        <p className="text-xl font-bold font-display text-foreground">{summaryData.exercisesCompleted}</p>
                        <p className="text-sm text-gray-600 font-body">Exercises</p>
                    </Card>
                </div>

                {summaryData.progressiveOverload && (
                    <div>
                        <h3 className="text-lg font-semibold font-display text-foreground mb-3 flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-primary"/> Progressive Overload
                        </h3>
                        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold font-body text-foreground">Volume vs. Last {session.type} ({session.variation})</span>
                                <span className={`font-bold text-lg font-display ${summaryData.progressiveOverload.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {summaryData.progressiveOverload.percentageChange >= 0 ? '+' : ''}
                                    {summaryData.progressiveOverload.percentageChange.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 font-body mt-2">
                                {getOverloadMessage(summaryData.progressiveOverload.percentageChange)}
                            </p>
                        </Card>
                    </div>
                )}

                {summaryData.musclesWorked.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold font-display text-foreground mb-3">Muscles Worked Today</h3>
                        <div className="space-y-2">
                            {summaryData.musclesWorked.map(({ muscle, fatiguePercent, recoveryDays }) => (
                                <Card key={muscle} variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                                    <p className="text-sm font-body text-foreground">
                                        <span className="font-semibold">{muscle}:</span> {fatiguePercent.toFixed(0)}% fatigued -
                                        <span className="text-gray-700"> Ready in {recoveryDays.toFixed(1)} days</span>
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {summaryData.smartSuggestions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold font-display text-foreground mb-3">Smart Suggestions</h3>
                        <div className="space-y-2">
                            {summaryData.smartSuggestions.map(({ muscle, suggestedExercises }) => (
                                <Card key={muscle} variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                                    <p className="text-sm font-semibold font-body text-foreground mb-1">
                                        Your <span className="text-yellow-600">{muscle}</span> still has capacity!
                                    </p>
                                    <p className="text-xs text-gray-600 font-body">
                                        Consider adding: {suggestedExercises.map(e => e.name).join(', ')}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {summaryData.newRecords.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold font-display text-foreground mb-3 flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-yellow-600"/> New Personal Records!
                        </h3>
                        <div className="space-y-2">
                            {summaryData.newRecords.map((record, index) => (
                                <Card key={index} variant="elevated" className="bg-white/50 backdrop-blur-lg p-3">
                                    <p className="font-semibold font-display text-foreground">{record.exerciseName}</p>
                                    {record.newBestSingleSet && <p className="text-xs text-gray-700 font-body">New Best Single Set PR</p>}
                                    {record.newSessionVolume && <p className="text-xs text-gray-700 font-body">New Session Volume PR</p>}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    onClick={onClose}
                    variant="primary"
                    size="lg"
                    className="w-full min-h-[60px] font-bold"
                >
                    Done
                </Button>
            </div>
        </Sheet>
    );
};

export default WorkoutSummaryModal;