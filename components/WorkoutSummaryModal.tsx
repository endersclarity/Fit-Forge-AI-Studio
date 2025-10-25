
import React, { useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants';
import { WorkoutSession, PersonalBests, MuscleBaselines, Muscle, Exercise, ExerciseMaxes } from '../types';
import { calculateVolume, formatDuration, findPreviousWorkout } from '../utils/helpers';
import { TrophyIcon, TrendingUpIcon } from './Icons';

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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4 transition-opacity duration-300">
            <div className="bg-brand-surface rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-cyan">Workout Complete!</h2>
                    <p className="text-slate-400">{session.name}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-8">
                    <div>
                        <p className="text-xl font-bold">{formatDuration(summaryData.duration)}</p>
                        <p className="text-sm text-slate-400">Duration</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{summaryData.totalVolume.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">Total Volume (lbs)</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{summaryData.exercisesCompleted}</p>
                        <p className="text-sm text-slate-400">Exercises</p>
                    </div>
                </div>

                {summaryData.progressiveOverload && (
                     <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-brand-cyan"/> Progressive Overload
                        </h3>
                        <div className="bg-brand-muted p-3 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Volume vs. Last {session.type} ({session.variation})</span>
                                <span className={`font-bold text-lg ${summaryData.progressiveOverload.percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {summaryData.progressiveOverload.percentageChange >= 0 ? '+' : ''}
                                    {summaryData.progressiveOverload.percentageChange.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {getOverloadMessage(summaryData.progressiveOverload.percentageChange)}
                            </p>
                        </div>
                    </div>
                )}

                {summaryData.musclesWorked.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Muscles Worked Today</h3>
                        <div className="space-y-2">
                            {summaryData.musclesWorked.map(({ muscle, fatiguePercent, recoveryDays }) => (
                                <div key={muscle} className="bg-brand-muted p-3 rounded-md text-sm">
                                    <span className="font-semibold">{muscle}:</span> {fatiguePercent.toFixed(0)}% fatigued -
                                    <span className="text-slate-300"> Ready in {recoveryDays.toFixed(1)} days</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {summaryData.smartSuggestions.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Smart Suggestions</h3>
                        {summaryData.smartSuggestions.map(({ muscle, suggestedExercises }) => (
                            <div key={muscle} className="bg-brand-muted p-3 rounded-md mb-2">
                                <p className="text-sm font-semibold mb-1">Your <span className="text-yellow-400">{muscle}</span> still has capacity!</p>
                                <p className="text-xs text-slate-400">Consider adding: {suggestedExercises.map(e => e.name).join(', ')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {summaryData.newRecords.length > 0 && (
                     <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-yellow-400"/> New Personal Records!</h3>
                         <div className="space-y-2">
                            {summaryData.newRecords.map((record, index) => (
                                <div key={index} className="bg-brand-muted p-3 rounded-md text-sm">
                                    <p className="font-semibold">{record.exerciseName}</p>
                                    {record.newBestSingleSet && <p className="text-xs text-slate-300">New Best Single Set PR</p>}
                                    {record.newSessionVolume && <p className="text-xs text-slate-300">New Session Volume PR</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <button onClick={onClose} className="w-full bg-brand-cyan text-brand-dark py-4 rounded-lg font-bold mt-4">
                    Done
                </button>
            </div>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default WorkoutSummaryModal;