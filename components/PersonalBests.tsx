
import React, { useState, useMemo } from 'react';
import { PersonalBests, ExerciseCategory, Exercise, ExerciseMaxes } from '../types';
import { EXERCISE_LIBRARY } from '../constants';
import { ArrowLeftIcon, TrophyIcon } from './Icons';

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
                return { ...exercise, ...pb };
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
                <button onClick={onBack} className="p-2 rounded-full hover:bg-brand-surface">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <h1 className="text-xl font-bold">Personal Records</h1>
                <div className="w-10">
                    <TrophyIcon className="w-7 h-7 text-yellow-400" />
                </div>
            </header>

            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setFilter(cat)} 
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === cat ? 'bg-brand-cyan text-brand-dark' : 'bg-brand-surface'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <main className="flex-grow overflow-y-auto space-y-3">
                {filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                        <TrophyIcon className="w-16 h-16 mb-4 text-brand-muted" />
                        <p className="font-semibold">No personal records yet.</p>
                        <p className="text-sm">Complete some workouts to start tracking your PBs!</p>
                    </div>
                ) : (
                    filteredRecords.map(record => (
                        <div key={record.id} className="bg-brand-surface p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{record.name}</h3>
                                <span className="text-xs bg-brand-muted px-2 py-1 rounded-full">{record.category}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.bestSingleSet.toLocaleString()} lbs</p>
                                    <p className="text-xs text-slate-400">Best Set</p>
                                </div>
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.bestSessionVolume.toLocaleString()} lbs</p>
                                    <p className="text-xs text-slate-400">Best Session</p>
                                </div>
                                <div>
                                    <p className="text-brand-cyan text-lg font-bold">{record.rollingAverageMax.toFixed(0).toLocaleString()} lbs</p>
                                    <p className="text-xs text-slate-400">Rolling Avg.</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default PersonalBestsComponent;