import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import ALL_MUSCLES from constants instead of types
import { UserProfile, WeightEntry, Equipment, EquipmentItem, EquipmentIncrement, MuscleBaselines, Muscle, Difficulty, MuscleDetailSettings } from '../types';
import { ALL_MUSCLES } from '../constants';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, EditIcon, PlusIcon, SaveIcon, TrashIcon, XIcon } from './Icons';

interface ProfileProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    muscleBaselines: MuscleBaselines;
    setMuscleBaselines: React.Dispatch<React.SetStateAction<MuscleBaselines>>;
    onBack: () => void;
}

const WeightChart: React.FC<{ data: WeightEntry[] }> = ({ data }) => {
    const chartHeight = 100;
    const chartWidth = 300; // a fixed width is fine for this simple chart

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const chartData = data
        .filter(entry => entry.date >= thirtyDaysAgo)
        .sort((a, b) => a.date - b.date);

    if (chartData.length < 2) {
        return <div className="h-[100px] flex items-center justify-center text-slate-500 text-sm">Not enough data for chart.</div>;
    }

    const minWeight = Math.min(...chartData.map(d => d.weight));
    const maxWeight = Math.max(...chartData.map(d => d.weight));
    const minDate = chartData[0].date;
    const maxDate = chartData[chartData.length - 1].date;
    
    const weightRange = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;
    const dateRange = maxDate - minDate === 0 ? 1 : maxDate - minDate;

    const points = chartData.map(d => {
        const x = ((d.date - minDate) / dateRange) * chartWidth;
        const y = chartHeight - ((d.weight - minWeight) / weightRange) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <div className="mt-4 flex justify-center">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                <polyline
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        </div>
    );
};


const EquipmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: EquipmentItem) => void;
    initialData?: EquipmentItem | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [item, setItem] = useState<Omit<EquipmentItem, 'id'>>({
        type: 'Dumbbells',
        weightRange: { min: 5, max: 50 },
        quantity: 2,
        increment: 5,
    });

    React.useEffect(() => {
        if (initialData) {
            setItem(initialData);
        } else {
             setItem({ type: 'Dumbbells', weightRange: { min: 5, max: 50 }, quantity: 2, increment: 5 });
        }
    }, [initialData, isOpen]);
    
    if (!isOpen) return null;

    const handleSave = () => {
        const finalItem: EquipmentItem = {
            ...item,
            id: initialData?.id || `eq-${Date.now()}`,
        };
        onSave(finalItem);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-brand-surface rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit' : 'Add'} Equipment</h2>
                <div className="space-y-4">
                    {/* Form fields */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select value={item.type} onChange={e => setItem({...item, type: e.target.value as Equipment})} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2">
                            {['Barbell', 'Dumbbells', 'Kettlebell', 'Pull-up Bar', 'TRX', 'Resistance Bands'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1">Min Weight (lbs)</label>
                           <input type="number" value={item.weightRange.min} onChange={e => setItem({...item, weightRange: {...item.weightRange, min: parseInt(e.target.value) || 0}})} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1">Max Weight (lbs)</label>
                           <input type="number" value={item.weightRange.max} onChange={e => setItem({...item, weightRange: {...item.weightRange, max: parseInt(e.target.value) || 0}})} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                           <select value={item.quantity} onChange={e => setItem({...item, quantity: parseInt(e.target.value) as 1|2})} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2">
                               <option value={1}>1</option>
                               <option value={2}>2</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1">Increment</label>
                           <select value={item.increment} onChange={e => setItem({...item, increment: parseFloat(e.target.value) as EquipmentIncrement})} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2">
                               <option value={2.5}>2.5 lbs</option>
                               <option value={5}>5 lbs</option>
                               <option value={10}>10 lbs</option>
                           </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    )
}

const getMuscleBaselinePlaceholder = (muscle: Muscle): string => {
    switch (muscle) {
        case Muscle.Pectoralis:
        case Muscle.Lats:
        case Muscle.Quadriceps:
            return "e.g., 8,000-12,000 lbs";
        case Muscle.Deltoids:
        case Muscle.Glutes:
        case Muscle.Hamstrings:
            return "e.g., 5,000-8,000 lbs";
        case Muscle.Biceps:
        case Muscle.Triceps:
        case Muscle.Calves:
            return "e.g., 3,000-5,000 lbs";
        case Muscle.Core:
            return "e.g., 4,000-6,000 lbs";
        default:
            return "e.g., 3,000-6,000 lbs";
    }
};


const Profile: React.FC<ProfileProps> = ({ profile, setProfile, muscleBaselines, setMuscleBaselines, onBack }) => {
    const [isBaselinesExpanded, setBaselinesExpanded] = useState(false);
    const [isEquipmentModalOpen, setEquipmentModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
    const [editingWeight, setEditingWeight] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [currentName, setCurrentName] = useState(profile.name);

    // Muscle detail level setting (persisted to localStorage)
    const [muscleDetailLevel, setMuscleDetailLevel] = useState<'simple' | 'detailed'>(() => {
        const saved = localStorage.getItem('muscleDetailLevel');
        return (saved === 'simple' || saved === 'detailed') ? saved : 'simple';
    });

    // Persist muscle detail level to localStorage
    useEffect(() => {
        localStorage.setItem('muscleDetailLevel', muscleDetailLevel);
    }, [muscleDetailLevel]);

    const latestWeightEntry = useMemo(() => {
        if (!profile.bodyweightHistory || profile.bodyweightHistory.length === 0) {
            return { weight: 150, date: Date.now() };
        }
        return [...profile.bodyweightHistory].sort((a,b) => b.date - a.date)[0];
    }, [profile.bodyweightHistory]);

    const [currentWeight, setCurrentWeight] = useState(latestWeightEntry.weight);

    const handleProfileChange = (field: keyof UserProfile, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleNameSave = () => {
        handleProfileChange('name', currentName);
        setEditingName(false);
    };

    const handleWeightSave = () => {
        const newHistory = [...(profile.bodyweightHistory || [])];
        // If last entry was today, update it. Otherwise, add new.
        const today = new Date().setHours(0,0,0,0);
        const lastEntryDate = latestWeightEntry ? new Date(latestWeightEntry.date).setHours(0,0,0,0) : 0;

        if (today === lastEntryDate) {
            newHistory[0] = { ...newHistory[0], weight: currentWeight };
        } else {
            newHistory.push({ date: Date.now(), weight: currentWeight });
        }
        
        handleProfileChange('bodyweightHistory', newHistory.sort((a,b) => b.date - a.date));
        setEditingWeight(false);
    };

    const handleEquipmentSave = (item: EquipmentItem) => {
        const equipment = profile.equipment || [];
        const existingIndex = equipment.findIndex(e => e.id === item.id);
        if (existingIndex > -1) {
            const newEquipment = [...equipment];
            newEquipment[existingIndex] = item;
            handleProfileChange('equipment', newEquipment);
        } else {
            handleProfileChange('equipment', [...equipment, item]);
        }
        setEquipmentModalOpen(false);
        setEditingEquipment(null);
    };

    const handleEquipmentDelete = (id: string) => {
        const newEquipment = (profile.equipment || []).filter(e => e.id !== id);
        handleProfileChange('equipment', newEquipment);
    };

    const handleBaselineChange = (muscle: Muscle, value: string) => {
        setMuscleBaselines(prev => ({
            ...prev,
            [muscle]: { ...prev[muscle], userOverride: value === '' ? null : parseInt(value) || 0 }
        }));
    };
    
    return (
        <div className="p-4 md:p-6 min-h-screen bg-brand-dark space-y-6">
            <header className="flex justify-between items-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-brand-surface">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <h1 className="text-xl font-bold">Profile</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="space-y-6 pb-8">
                {/* Personal Metrics */}
                <section className="bg-brand-surface p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Personal Metrics</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Name</label>
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                <input type="text" value={currentName} onChange={e => setCurrentName(e.target.value)} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2 text-lg font-bold" />
                                <button onClick={handleNameSave} className="p-2 bg-brand-cyan rounded-md"><SaveIcon className="w-5 h-5 text-brand-dark"/></button>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setEditingName(true)}>
                                    <p className="text-2xl font-bold">{profile.name}</p>
                                    <EditIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-1">Experience Level</label>
                            <select
                                id="experience"
                                value={profile.experience}
                                onChange={e => handleProfileChange('experience', e.target.value as Difficulty)}
                                className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2"
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>

                        {/* Muscle Detail Level Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Muscle Detail Level</label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 bg-brand-dark rounded-md cursor-pointer hover:bg-opacity-80 border border-brand-muted">
                                    <input
                                        type="radio"
                                        name="muscleDetailLevel"
                                        value="simple"
                                        checked={muscleDetailLevel === 'simple'}
                                        onChange={(e) => setMuscleDetailLevel(e.target.value as 'simple' | 'detailed')}
                                        className="mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">Simple (13 muscle groups)</div>
                                        <div className="text-xs text-slate-400 mt-1">Clean dashboard view with major muscle groups</div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 bg-brand-dark rounded-md cursor-pointer hover:bg-opacity-80 border border-brand-muted">
                                    <input
                                        type="radio"
                                        name="muscleDetailLevel"
                                        value="detailed"
                                        checked={muscleDetailLevel === 'detailed'}
                                        onChange={(e) => setMuscleDetailLevel(e.target.value as 'simple' | 'detailed')}
                                        className="mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">Detailed (43 specific muscles)</div>
                                        <div className="text-xs text-slate-400 mt-1">Show muscle subdivisions, rotator cuff, and stabilizers</div>
                                    </div>
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Detailed view shows specific muscle fatigue for advanced training insights
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Current Bodyweight (lbs)</label>
                            {editingWeight ? (
                                <div className="flex items-center gap-2">
                                <input type="number" value={currentWeight} onChange={e => setCurrentWeight(parseFloat(e.target.value) || 0)} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2 text-lg font-bold" />
                                <button onClick={handleWeightSave} className="p-2 bg-brand-cyan rounded-md"><SaveIcon className="w-5 h-5 text-brand-dark"/></button>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setEditingWeight(true)}>
                                    <p className="text-2xl font-bold text-brand-cyan">{latestWeightEntry.weight}</p>
                                    <EditIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            )}
                             <p className="text-xs text-slate-500 mt-1">Last updated: {new Date(latestWeightEntry.date).toLocaleDateString()}</p>
                        </div>

                       <WeightChart data={profile.bodyweightHistory || []} />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-1">Height (inches)</label>
                                <input type="number" id="height" value={profile.height || ''} onChange={e => handleProfileChange('height', parseInt(e.target.value))} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1">Age (years)</label>
                                <input type="number" id="age" value={profile.age || ''} onChange={e => handleProfileChange('age', parseInt(e.target.value))} className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recovery Settings */}
                <section className="bg-brand-surface p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Recovery Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="recoveryDays" className="block text-sm font-medium text-slate-300 mb-2">
                                Recovery Speed
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    id="recoveryDays"
                                    min="3"
                                    max="10"
                                    step="1"
                                    value={profile.recoveryDaysToFull || 5}
                                    onChange={e => handleProfileChange('recoveryDaysToFull', parseInt(e.target.value))}
                                    className="flex-grow h-2 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                                />
                                <span className="text-2xl font-bold text-brand-cyan min-w-[3rem] text-right">
                                    {profile.recoveryDaysToFull || 5}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                Days to recover from 100% muscle fatigue to 0%. Faster recovery (3-5 days) suits experienced lifters with good recovery habits. Slower recovery (7-10 days) is more conservative.
                            </p>
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Faster (3 days)</span>
                                <span>Default (5 days)</span>
                                <span>Slower (10 days)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Equipment Inventory */}
                <section className="bg-brand-surface p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Equipment Inventory</h2>
                        <button onClick={() => { setEditingEquipment(null); setEquipmentModalOpen(true); }} className="flex items-center gap-1 text-brand-cyan text-sm font-semibold">
                            <PlusIcon className="w-4 h-4"/> Add
                        </button>
                    </div>
                     <div className="space-y-2">
                        {(profile.equipment || []).length === 0 ? (
                            <p className="text-slate-400 text-center py-4">No equipment added yet.</p>
                        ) : (profile.equipment || []).map(item => (
                            <div key={item.id} className="bg-brand-muted p-3 rounded-md flex items-center">
                               <div className="flex-grow">
                                  <p className="font-semibold">{item.type}</p>
                                  <p className="text-xs text-slate-400">{item.weightRange.min}-{item.weightRange.max} lbs, Qty: {item.quantity}, Inc: {item.increment}lb</p>
                               </div>
                               <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingEquipment(item); setEquipmentModalOpen(true); }} className="text-slate-400 hover:text-brand-cyan"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleEquipmentDelete(item.id)} className="text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                               </div>
                            </div>
                        ))}
                     </div>
                </section>
                
                 {/* Muscle Baselines */}
                <section className="bg-brand-surface p-4 rounded-lg">
                    <button onClick={() => setBaselinesExpanded(!isBaselinesExpanded)} className="w-full flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Set Muscle Capacity Baselines</h2>
                        {isBaselinesExpanded ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                    </button>
                    {isBaselinesExpanded && (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-slate-400">Estimate the maximum volume a muscle can handle in one session. The system will learn and adjust from your workouts.</p>
                            <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
                                {ALL_MUSCLES.map(muscle => {
                                    const baseline = muscleBaselines[muscle];
                                    return (
                                        <div key={muscle}>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">{muscle}</label>
                                            <input
                                                type="number"
                                                placeholder={getMuscleBaselinePlaceholder(muscle)}
                                                value={baseline.userOverride ?? ''}
                                                onChange={(e) => handleBaselineChange(muscle, e.target.value)}
                                                className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2"
                                            />
                                             {baseline.systemLearnedMax > 0 && (
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-slate-500">System learned: {baseline.systemLearnedMax} lbs</p>
                                                    <button onClick={() => handleBaselineChange(muscle, String(baseline.systemLearnedMax))} className="text-xs text-brand-cyan hover:underline">Use</button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </main>
            
            <EquipmentModal 
                isOpen={isEquipmentModalOpen} 
                onClose={() => setEquipmentModalOpen(false)}
                onSave={handleEquipmentSave}
                initialData={editingEquipment}
            />
        </div>
    );
};

export default Profile;