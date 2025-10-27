import React, { useState, useMemo, useEffect } from 'react';
import {
  Exercise,
  ExerciseCategory,
  EquipmentItem,
  MuscleStatesResponse,
  CalibrationMap,
  ExerciseCalibrationData
} from '../types';
import { calculateRecommendations } from '../utils/exerciseRecommendations';
import { getUserCalibrations, getExerciseCalibrations } from '../api';
import CategoryTabs from './CategoryTabs';
import RecommendationCard from './RecommendationCard';
import CollapsibleSection from './CollapsibleSection';
import { EngagementViewer } from './EngagementViewer';
import { CalibrationEditor } from './CalibrationEditor';

interface ExerciseRecommendationsProps {
  muscleStates: MuscleStatesResponse;
  equipment: EquipmentItem[];
  onAddToWorkout: (exercise: Exercise) => void;
}

const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({
  muscleStates,
  equipment,
  onAddToWorkout
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  // Calibration state
  const [calibrations, setCalibrations] = useState<CalibrationMap>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedExerciseData, setSelectedExerciseData] = useState<ExerciseCalibrationData | null>(null);

  // Fetch calibrations on mount
  useEffect(() => {
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to load calibrations:', err));
  }, []);

  // Calculate recommendations (memoized to avoid recalculation on every render)
  // Now includes calibrations in the calculation
  const recommendations = useMemo(
    () => calculateRecommendations(muscleStates, equipment, selectedCategory || undefined, calibrations),
    [muscleStates, equipment, selectedCategory, calibrations]
  );

  // Group recommendations by status
  const excellent = recommendations.filter(r => r.status === 'excellent');
  const good = recommendations.filter(r => r.status === 'good');
  const suboptimal = recommendations.filter(r => r.status === 'suboptimal');
  const notRecommended = recommendations.filter(r => r.status === 'not-recommended');

  // Calculate category counts for tabs (also needs calibrations)
  const categoryCounts = useMemo(() => {
    const allRecs = calculateRecommendations(muscleStates, equipment, undefined, calibrations);
    const counts: Record<ExerciseCategory, number> = {
      Push: 0,
      Pull: 0,
      Legs: 0,
      Core: 0
    };

    allRecs.forEach(rec => {
      counts[rec.exercise.category]++;
    });

    return counts;
  }, [muscleStates, equipment, calibrations]);

  // Handlers for calibration modals
  const handleViewEngagement = async (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    try {
      const data = await getExerciseCalibrations(exerciseId);
      setSelectedExerciseData(data);
      setViewerOpen(true);
    } catch (error) {
      console.error('Failed to load exercise calibrations:', error);
    }
  };

  const handleEditCalibration = () => {
    setViewerOpen(false);
    setEditorOpen(true);
  };

  const handleCalibrationSaved = () => {
    // Refresh calibrations
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to reload calibrations:', err));
  };

  const categories = [
    { label: 'All', value: null, count: recommendations.length },
    { label: 'Push', value: 'Push' as ExerciseCategory, count: categoryCounts.Push },
    { label: 'Pull', value: 'Pull' as ExerciseCategory, count: categoryCounts.Pull },
    { label: 'Legs', value: 'Legs' as ExerciseCategory, count: categoryCounts.Legs },
    { label: 'Core', value: 'Core' as ExerciseCategory, count: categoryCounts.Core }
  ];

  // Handle empty states
  if (!equipment || equipment.length === 0) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-yellow-400 mb-2">⚙️ No Equipment Configured</p>
        <p className="text-slate-400">
          Add equipment to your profile to see personalized exercise recommendations.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-brand-surface p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-blue-400 mb-2">🛌 Rest Day Recommended</p>
        <p className="text-slate-400">
          All muscles need recovery. Take a rest day or do light mobility work.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface p-4 rounded-lg space-y-4">
      <h3 className="text-xl font-semibold">Recommended Exercises</h3>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Excellent Opportunities */}
      {excellent.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-emerald-400">⭐ Excellent Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {excellent.slice(0, 6).map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
              />
            ))}
          </div>
        </div>
      )}

      {/* Good Options */}
      {good.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-blue-400">✅ Good Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {good.slice(0, 6).map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suboptimal (Collapsed by default) */}
      {suboptimal.length > 0 && (
        <CollapsibleSection title={`⚠️ Suboptimal (${suboptimal.length} exercises - Limiting Factors Detected)`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suboptimal.map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Not Recommended (Collapsed by default) */}
      {notRecommended.length > 0 && (
        <CollapsibleSection title={`❌ Not Recommended (${notRecommended.length} exercises - Needs Recovery)`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notRecommended.map(rec => (
              <RecommendationCard
                key={rec.exercise.id}
                exercise={rec.exercise}
                status={rec.status}
                primaryMuscles={rec.primaryMuscles}
                limitingFactors={rec.limitingFactors}
                explanation={rec.explanation}
                equipmentAvailable={rec.equipmentAvailable}
                onAdd={onAddToWorkout}
                isCalibrated={!!calibrations[rec.exercise.id]}
                onViewEngagement={handleViewEngagement}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Engagement Viewer Modal */}
      <EngagementViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        exerciseId={selectedExerciseId}
        onEdit={handleEditCalibration}
      />

      {/* Calibration Editor Modal */}
      {selectedExerciseData && (
        <CalibrationEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialData={selectedExerciseData}
          onSave={handleCalibrationSaved}
        />
      )}
    </div>
  );
};

export default ExerciseRecommendations;
