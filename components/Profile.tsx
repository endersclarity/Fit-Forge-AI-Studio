import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import ALL_MUSCLES from constants instead of types
import { UserProfile, WeightEntry, Equipment, EquipmentItem, EquipmentIncrement, MuscleBaselines, Muscle, Difficulty, MuscleDetailSettings } from '../types';
import { ALL_MUSCLES } from '../constants';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, EditIcon, PlusIcon, SaveIcon, TrashIcon, XIcon } from './Icons';
import { Card, Button, Input, Select, type SelectOption } from '@/src/design-system/components/primitives';

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
        return <div className="h-[100px] flex items-center justify-center text-gray-500 text-sm">Not enough data for chart.</div>;
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
                    stroke="currentColor"
                    className="text-primary"
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

    const equipmentTypeOptions: SelectOption[] = [
        { label: 'Barbell', value: 'Barbell' },
        { label: 'Dumbbells', value: 'Dumbbells' },
        { label: 'Kettlebell', value: 'Kettlebell' },
        { label: 'Pull-up Bar', value: 'Pull-up Bar' },
        { label: 'TRX', value: 'TRX' },
        { label: 'Resistance Bands', value: 'Resistance Bands' },
    ];

    const quantityOptions: SelectOption[] = [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
    ];

    const incrementOptions: SelectOption[] = [
        { label: '2.5 lbs', value: '2.5' },
        { label: '5 lbs', value: '5' },
        { label: '10 lbs', value: '10' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-6 w-full max-w-md relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-foreground min-w-[40px] min-h-[40px]"
                    aria-label="Close modal"
                >
                    <XIcon className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold font-display mb-4">{initialData ? 'Edit' : 'Add'} Equipment</h2>
                <div className="space-y-4">
                    {/* Form fields */}
                    <div>
                        <label className="block text-sm font-medium font-body text-gray-700 mb-1">Type</label>
                        <Select
                            options={equipmentTypeOptions}
                            value={item.type}
                            onChange={(value) => setItem({...item, type: value as Equipment})}
                            aria-label="Equipment type"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium font-body text-gray-700 mb-1">Min Weight (lbs)</label>
                           <Input
                               type="number"
                               value={String(item.weightRange.min)}
                               onChange={e => setItem({...item, weightRange: {...item.weightRange, min: parseInt(e.target.value) || 0}})}
                               variant="default"
                               size="md"
                               className="min-w-[60px] min-h-[60px]"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium font-body text-gray-700 mb-1">Max Weight (lbs)</label>
                           <Input
                               type="number"
                               value={String(item.weightRange.max)}
                               onChange={e => setItem({...item, weightRange: {...item.weightRange, max: parseInt(e.target.value) || 0}})}
                               variant="default"
                               size="md"
                               className="min-w-[60px] min-h-[60px]"
                           />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium font-body text-gray-700 mb-1">Quantity</label>
                           <Select
                               options={quantityOptions}
                               value={String(item.quantity)}
                               onChange={(value) => setItem({...item, quantity: parseInt(value) as 1|2})}
                               aria-label="Equipment quantity"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium font-body text-gray-700 mb-1">Increment</label>
                           <Select
                               options={incrementOptions}
                               value={String(item.increment)}
                               onChange={(value) => setItem({...item, increment: parseFloat(value) as EquipmentIncrement})}
                               aria-label="Weight increment"
                           />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSave}
                        className="min-w-[60px] min-h-[60px]"
                    >
                        Save
                    </Button>
                </div>
            </Card>
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

    // Pending baseline changes (not saved until user clicks Save button)
    const [pendingBaselineChanges, setPendingBaselineChanges] = useState<
        Partial<Record<Muscle, number | null>>
    >({});
    const [isSavingBaselines, setIsSavingBaselines] = useState(false);

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

        // Check if there's actually an entry in the history (not just the default)
        const hasHistory = profile.bodyweightHistory && profile.bodyweightHistory.length > 0;
        const lastEntryDate = hasHistory ? new Date(latestWeightEntry.date).setHours(0,0,0,0) : 0;

        if (hasHistory && today === lastEntryDate) {
            // Find and update the entry for today
            const todayIndex = newHistory.findIndex(entry => new Date(entry.date).setHours(0,0,0,0) === today);
            if (todayIndex >= 0) {
                newHistory[todayIndex] = { ...newHistory[todayIndex], weight: currentWeight };
            } else {
                newHistory.push({ date: Date.now(), weight: currentWeight });
            }
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
        const numValue = value === '' ? null : parseInt(value) || 0;
        setPendingBaselineChanges(prev => ({
            ...prev,
            [muscle]: numValue
        }));
    };

    const handleSaveBaselines = async () => {
        setIsSavingBaselines(true);
        try {
            const newBaselines = { ...muscleBaselines };

            Object.entries(pendingBaselineChanges).forEach(([muscle, override]) => {
                newBaselines[muscle as Muscle] = {
                    ...newBaselines[muscle as Muscle],
                    userOverride: override
                };
            });

            await setMuscleBaselines(newBaselines);
            setPendingBaselineChanges({});
            // Success - baselines saved
        } catch (error) {
            console.error('Failed to save baselines:', error);
            // Could show error toast here if desired
        } finally {
            setIsSavingBaselines(false);
        }
    };

    const experienceOptions: SelectOption[] = [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
    ];

    return (
        <div className="p-4 md:p-6 min-h-screen bg-background space-y-6">
            <header className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="md"
                    onClick={onBack}
                    className="rounded-full min-w-[60px] min-h-[60px]"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="w-6 h-6"/>
                </Button>
                <h1 className="text-xl font-bold font-display">Profile</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="space-y-6 pb-8">
                {/* Personal Metrics */}
                <Card variant="default" className="bg-white/50 backdrop-blur-lg p-4">
                    <h2 className="text-lg font-semibold font-display mb-4">Personal Metrics</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium font-body text-gray-700">Name</label>
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={currentName}
                                    onChange={e => setCurrentName(e.target.value)}
                                    variant="default"
                                    size="lg"
                                    className="flex-1 text-lg font-bold font-display min-w-[60px] min-h-[60px]"
                                />
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleNameSave}
                                    className="min-w-[60px] min-h-[60px]"
                                    aria-label="Save name"
                                >
                                    <SaveIcon className="w-5 h-5"/>
                                </Button>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setEditingName(true)}>
                                    <p className="text-2xl font-bold font-display">{profile.name}</p>
                                    <EditIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium font-body text-gray-700 mb-1">Experience Level</label>
                            <Select
                                options={experienceOptions}
                                value={profile.experience}
                                onChange={(value) => handleProfileChange('experience', value as Difficulty)}
                                aria-label="Experience level"
                            />
                        </div>

                        {/* Muscle Detail Level Toggle */}
                        <div>
                            <label className="block text-sm font-medium font-body text-gray-700 mb-2">Muscle Detail Level</label>
                            <div className="space-y-2">
                                <Card variant="flat" className="bg-white/30 backdrop-blur-sm">
                                    <label className="flex items-center p-3 cursor-pointer hover:bg-white/10 border border-gray-300/50">
                                        <input
                                            type="radio"
                                            name="muscleDetailLevel"
                                            value="simple"
                                            checked={muscleDetailLevel === 'simple'}
                                            onChange={(e) => setMuscleDetailLevel(e.target.value as 'simple' | 'detailed')}
                                            className="mr-3 min-w-[20px] min-h-[20px]"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium font-body">Simple (13 muscle groups)</div>
                                            <div className="text-xs text-gray-500 mt-1">Clean dashboard view with major muscle groups</div>
                                        </div>
                                    </label>
                                </Card>
                                <Card variant="flat" className="bg-white/30 backdrop-blur-sm">
                                    <label className="flex items-center p-3 cursor-pointer hover:bg-white/10 border border-gray-300/50">
                                        <input
                                            type="radio"
                                            name="muscleDetailLevel"
                                            value="detailed"
                                            checked={muscleDetailLevel === 'detailed'}
                                            onChange={(e) => setMuscleDetailLevel(e.target.value as 'simple' | 'detailed')}
                                            className="mr-3 min-w-[20px] min-h-[20px]"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium font-body">Detailed (43 specific muscles)</div>
                                            <div className="text-xs text-gray-500 mt-1">Show muscle subdivisions, rotator cuff, and stabilizers</div>
                                        </div>
                                    </label>
                                </Card>
                            </div>
                            <Card variant="flat" className="mt-3 bg-primary/10 backdrop-blur-sm border border-primary/20">
                                <div className="p-3">
                                    <p className="text-xs text-primary font-medium font-body mb-1">💡 View Dashboard to see changes</p>
                                    <p className="text-xs text-gray-600">
                                        This setting controls muscle detail on the Dashboard. Change it, then navigate to Dashboard to see the effect on your muscle fatigue heatmap.
                                    </p>
                                </div>
                            </Card>
                        </div>
                        <div>
                            <label className="block text-sm font-medium font-body text-gray-700">Current Bodyweight (lbs)</label>
                            {editingWeight ? (
                                <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={String(currentWeight)}
                                    onChange={e => setCurrentWeight(parseFloat(e.target.value) || 0)}
                                    variant="default"
                                    size="lg"
                                    className="text-lg font-bold font-display min-w-[60px] min-h-[60px]"
                                />
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleWeightSave}
                                    className="min-w-[60px] min-h-[60px]"
                                    aria-label="Save weight"
                                >
                                    <SaveIcon className="w-5 h-5"/>
                                </Button>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setEditingWeight(true)}>
                                    <p className="text-2xl font-bold font-display text-primary">{latestWeightEntry.weight}</p>
                                    <EditIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                             <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(latestWeightEntry.date).toLocaleDateString()}</p>
                        </div>

                       <WeightChart data={profile.bodyweightHistory || []} />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="height" className="block text-sm font-medium font-body text-gray-700 mb-1">Height (inches)</label>
                                <Input
                                    type="number"
                                    id="height"
                                    value={String(profile.height || '')}
                                    onChange={e => handleProfileChange('height', parseInt(e.target.value))}
                                    variant="default"
                                    size="md"
                                    className="min-w-[60px] min-h-[60px]"
                                />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium font-body text-gray-700 mb-1">Age (years)</label>
                                <Input
                                    type="number"
                                    id="age"
                                    value={String(profile.age || '')}
                                    onChange={e => handleProfileChange('age', parseInt(e.target.value))}
                                    variant="default"
                                    size="md"
                                    className="min-w-[60px] min-h-[60px]"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Recovery Settings */}
                <Card variant="default" className="bg-white/50 backdrop-blur-lg p-4">
                    <h2 className="text-lg font-semibold font-display mb-4">Recovery Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="recoveryDays" className="block text-sm font-medium font-body text-gray-700 mb-2">
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
                                    className="flex-grow h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-2xl font-bold font-display text-primary min-w-[3rem] text-right">
                                    {profile.recoveryDaysToFull || 5}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Days to recover from 100% muscle fatigue to 0%. Faster recovery (3-5 days) suits experienced lifters with good recovery habits. Slower recovery (7-10 days) is more conservative.
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Faster (3 days)</span>
                                <span>Default (5 days)</span>
                                <span>Slower (10 days)</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Equipment Inventory */}
                <Card variant="default" className="bg-white/50 backdrop-blur-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold font-display">Equipment Inventory</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingEquipment(null); setEquipmentModalOpen(true); }}
                            className="flex items-center gap-1 text-primary text-sm font-semibold font-body min-w-[60px] min-h-[60px]"
                        >
                            <PlusIcon className="w-4 h-4"/> Add
                        </Button>
                    </div>
                     <div className="space-y-2">
                        {(profile.equipment || []).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No equipment added yet.</p>
                        ) : (profile.equipment || []).map(item => (
                            <Card key={item.id} variant="flat" className="bg-white/30 backdrop-blur-sm p-3 flex items-center">
                               <div className="flex-grow">
                                  <p className="font-semibold font-display">{item.type}</p>
                                  <p className="text-xs text-gray-600">{item.weightRange.min}-{item.weightRange.max} lbs, Qty: {item.quantity}, Inc: {item.increment}lb</p>
                               </div>
                               <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setEditingEquipment(item); setEquipmentModalOpen(true); }}
                                        className="text-gray-400 hover:text-primary min-w-[40px] min-h-[40px]"
                                        aria-label="Edit equipment"
                                    >
                                        <EditIcon className="w-5 h-5"/>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEquipmentDelete(item.id)}
                                        className="text-gray-400 hover:text-red-500 min-w-[40px] min-h-[40px]"
                                        aria-label="Delete equipment"
                                    >
                                        <TrashIcon className="w-5 h-5"/>
                                    </Button>
                               </div>
                            </Card>
                        ))}
                     </div>
                </Card>

                 {/* Muscle Baselines */}
                <Card variant="default" className="bg-white/50 backdrop-blur-lg p-4">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setBaselinesExpanded(!isBaselinesExpanded)}
                        className="w-full flex justify-between items-center min-w-[60px] min-h-[60px]"
                    >
                        <h2 className="text-lg font-semibold font-display">Set Muscle Capacity Baselines</h2>
                        {isBaselinesExpanded ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                    </Button>
                    {isBaselinesExpanded && (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-gray-600">Estimate the maximum volume a muscle can handle in one session. The system will learn and adjust from your workouts.</p>
                            <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
                                {ALL_MUSCLES.map(muscle => {
                                    const baseline = muscleBaselines[muscle];
                                    const pendingValue = pendingBaselineChanges[muscle];
                                    const displayValue = pendingValue !== undefined ? pendingValue : baseline.userOverride;
                                    const hasChanges = pendingValue !== undefined;

                                    return (
                                        <div key={muscle}>
                                            <label className="block text-sm font-medium font-body text-gray-700 mb-1">
                                                {muscle}
                                                {hasChanges && <span className="ml-2 text-xs text-yellow-500">*</span>}
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder={getMuscleBaselinePlaceholder(muscle)}
                                                value={displayValue !== null ? String(displayValue) : ''}
                                                onChange={(e) => handleBaselineChange(muscle, e.target.value)}
                                                variant={hasChanges ? 'error' : 'default'}
                                                size="md"
                                                className={`min-w-[60px] min-h-[60px] ${hasChanges ? 'border-yellow-400' : ''}`}
                                            />
                                             {baseline.systemLearnedMax > 0 && (
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-500">System learned: {baseline.systemLearnedMax} lbs</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleBaselineChange(muscle, String(baseline.systemLearnedMax))}
                                                        className="text-xs text-primary hover:underline min-w-[40px] min-h-[40px]"
                                                    >
                                                        Use
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSaveBaselines}
                                disabled={Object.keys(pendingBaselineChanges).length === 0 || isSavingBaselines}
                                className="mt-4 w-full min-w-[60px] min-h-[60px]"
                            >
                                {isSavingBaselines ? 'Saving...' : `Save Baselines${Object.keys(pendingBaselineChanges).length > 0 ? ` (${Object.keys(pendingBaselineChanges).length} changed)` : ''}`}
                            </Button>
                        </div>
                    )}
                </Card>
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
