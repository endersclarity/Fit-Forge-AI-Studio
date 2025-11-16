import React, { useState, useMemo } from 'react';
import { PersonalBests, ExerciseCategory, Exercise, ExerciseMaxes } from '../types';
import { EXERCISE_LIBRARY } from '../constants';
import { ArrowLeftIcon, TrophyIcon } from './Icons';
import { Button } from '@/src/design-system/components/primitives';
import { Card } from '@/src/design-system/components/primitives';
import { Badge } from '@/src/design-system/components/primitives';
import { EmptyState } from './common/EmptyState';

interface PersonalBestsProps {
    personalBests: PersonalBests;
    onBack: () => void;
}

const PersonalBestsComponent: React.FC<PersonalBestsProps> = ({ personalBests, onBack }) => {
    const [filter, setFilter] = useState<ExerciseCategory | 'All'>('All');

    const records = useMemo(() => {
        return Object.entries(personalBests)
            .map(([exerciseId, pb]) => {
                const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
                if (!exercise) return null;
                const pbData = pb as ExerciseMaxes;
                return { ...exercise, ...pbData } as Exercise & ExerciseMaxes;
            })
            .filter((record): record is (Exercise & ExerciseMaxes) => record !== null)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [personalBests]);

    const filteredRecords = useMemo(() => {
        if (filter === 'All') return records;
        return records.filter(r => r.category === filter);
    }, [records, filter]);

    return (
        <div className="p-4 md:p-6 min-h-screen bg-brand-dark flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-brand-surface min-w-[60px] min-h-[60px]"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="w-6 h-6"/>
                </Button>
                <h1 className="text-xl font-bold">Personal Records</h1>
                <div className="w-10">
                    <TrophyIcon className="w-7 h-7 text-yellow-400" />
                </div>
            </header>

            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
                    <Button
                        key={cat}
                        variant={filter === cat ? 'primary' : 'secondary'}
                        size="md"
                        onClick={() => setFilter(cat)}
                        className="whitespace-nowrap min-w-[60px] min-h-[60px]"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <main className="flex-grow overflow-y-auto space-y-3">
                {filteredRecords.length === 0 ? (
                    <EmptyState
                        illustration={
                            <TrophyIcon className="w-16 h-16" />
                        }
                        title="No Personal Records Yet"
                        body="Complete workouts to start tracking your personal bests. Every rep counts towards your next PR!"
                        ctaText="Back to Dashboard"
                        onCtaClick={onBack}
                        className="h-full"
                    />
                ) : (
                    filteredRecords.map(record => (
                        <Card key={record.id} variant="glass" className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{record.name}</h3>
                                <Badge variant="info" size="sm">
                                    {record.category}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.bestSingleSet?.toLocaleString() ?? '0'} lbs</p>
                                    <p className="text-xs text-slate-400">Best Set</p>
                                </div>
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.bestSessionVolume?.toLocaleString() ?? '0'} lbs</p>
                                    <p className="text-xs text-slate-400">Best Session</p>
                                </div>
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.rollingAverageMax?.toFixed(0).toLocaleString() ?? '0'} lbs</p>
                                    <p className="text-xs text-slate-400">Rolling Avg.</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
};

export default PersonalBestsComponent;
