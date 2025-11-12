import React, { useState, useEffect } from 'react';
import { useMuscleStates } from '../../hooks/useMuscleStates';
import { useExerciseRecommendations, MuscleCategory } from '../../hooks/useExerciseRecommendations';
import { MuscleStatesResponse } from '../../types';

// Layout components
import { TopNav } from '../layout/TopNav';
import { FAB } from '../layout/FAB';

// Fitness components
import { MuscleHeatMap } from '../fitness/MuscleHeatMap';
import { ExerciseRecommendationCard } from '../fitness/ExerciseRecommendationCard';

// Loading components
import { SkeletonScreen } from '../loading/SkeletonScreen';
import { OfflineBanner } from '../loading/OfflineBanner';
import { ErrorBanner } from '../loading/ErrorBanner';

// Recovery components
import RecoveryTimelineView from '../RecoveryTimelineView';
import { MuscleDetailModal } from '../modals/MuscleDetailModal';

export interface RecoveryDashboardProps {
  className?: string;
}

type NavRoute = 'dashboard' | 'workouts' | 'profile' | 'settings';

/**
 * RecoveryDashboard - Main screen showing muscle recovery states and exercise recommendations
 *
 * Features:
 * - Real-time muscle fatigue heat map
 * - Personalized exercise recommendations
 * - Category filtering for exercises
 * - Loading and error states
 * - Full navigation system
 * - Accessibility compliant (WCAG AAA)
 */
export const RecoveryDashboard: React.FC<RecoveryDashboardProps> = ({ className = '' }) => {
  // State
  const [activeNav, setActiveNav] = useState<NavRoute>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory>('ALL');
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [muscleStatesData, setMuscleStatesData] = useState<MuscleStatesResponse | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data hooks
  const { muscles, loading: musclesLoading, error: musclesError, refetch: refetchMuscles } = useMuscleStates();
  const { recommendations, loading: recsLoading, error: recsError, refetch: refetchRecs } = useExerciseRecommendations(selectedCategory);

  // Fetch recovery timeline data for RecoveryTimelineView (AC 1, 3)
  useEffect(() => {
    let isMounted = true;

    async function fetchRecoveryData() {
      try {
        const response = await fetch('/api/recovery/timeline');
        if (!response.ok) {
          throw new Error('Failed to fetch recovery data');
        }
        const data = await response.json();

        // Also fetch muscle states to get lastTrained timestamps
        const muscleStatesResponse = await fetch('/api/muscle-states');
        const muscleStates = muscleStatesResponse.ok ? await muscleStatesResponse.json() : {};

        // Transform API response to MuscleStatesResponse format (AC 4)
        const transformedData: MuscleStatesResponse = {};
        data.muscles.forEach((muscle: any) => {
          // Calculate days until recovered from fullyRecoveredAt
          let daysUntilRecovered = 0;
          if (muscle.fullyRecoveredAt) {
            const recoveredDate = new Date(muscle.fullyRecoveredAt);
            const now = new Date();
            const diffMs = recoveredDate.getTime() - now.getTime();
            daysUntilRecovered = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
          }

          // Determine recovery status based on fatigue percentage (AC 5)
          let recoveryStatus: 'ready' | 'recovering' | 'fatigued' = 'ready';
          if (muscle.currentFatigue > 60) {
            recoveryStatus = 'fatigued';
          } else if (muscle.currentFatigue > 30) {
            recoveryStatus = 'recovering';
          }

          transformedData[muscle.name] = {
            currentFatiguePercent: muscle.currentFatigue,
            daysElapsed: null, // Not used by RecoveryTimelineView
            estimatedRecoveryDays: daysUntilRecovered,
            daysUntilRecovered,
            recoveryStatus,
            initialFatiguePercent: muscle.currentFatigue,
            lastTrained: muscleStates[muscle.name]?.lastTrained || null,
            // Store projections for modal (AC 8)
            projections: muscle.projections
          } as any; // Type assertion to allow extra projections field
        });

        if (isMounted) {
          setMuscleStatesData(transformedData);
        }
      } catch (err) {
        console.error('Error fetching recovery data:', err);
      }
    }

    fetchRecoveryData();

    // Auto-refresh every 60 seconds (AC 6)
    const intervalId = setInterval(fetchRecoveryData, 60000);

    // Cleanup on unmount (AC 7)
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Derived state
  const isLoading = musclesLoading || recsLoading;
  const hasError = musclesError || recsError;
  const isOffline = hasError && (musclesError?.message.includes('Failed to fetch') || recsError?.message.includes('Failed to fetch'));

  // Event handlers
  const handleSettingsClick = () => {
    console.log('Settings clicked');
    setActiveNav('settings');
  };

  const handleNavigation = (route: NavRoute) => {
    console.log(`Navigate to: ${route}`);
    setActiveNav(route);
  };

  const handleStartWorkout = () => {
    console.log('Start workout clicked');
    // TODO: Navigate to workout screen
  };

  const handleMuscleClick = (muscleName: string) => {
    console.log(`Muscle clicked: ${muscleName}`);
    setSelectedMuscle(muscleName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMuscle(null);
  };

  const handleExerciseClick = (exerciseName: string) => {
    console.log(`Exercise clicked: ${exerciseName}`);
    // TODO: Show exercise detail modal
  };

  const handleRetry = () => {
    setErrorDismissed(false);
    refetchMuscles();
    refetchRecs();
  };

  const handleErrorDismiss = () => {
    setErrorDismissed(true);
  };

  // Show skeleton screen during initial load
  if (isLoading && muscles.length === 0 && recommendations.length === 0) {
    return <SkeletonScreen />;
  }

  // Category tabs for filtering
  const categories: MuscleCategory[] = ['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE'];

  // Calculate optimal workout suggestion
  const getWorkoutRecommendation = () => {
    if (muscles.length === 0) return 'Loading workout recommendation...';

    // Find muscle group with lowest average fatigue
    const categoryAverages = muscles.reduce((acc, muscle) => {
      if (!acc[muscle.category]) {
        acc[muscle.category] = { total: 0, count: 0 };
      }
      acc[muscle.category].total += muscle.fatiguePercent;
      acc[muscle.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const categoryWithLowestFatigue = Object.entries(categoryAverages)
      .map(([category, { total, count }]) => ({
        category,
        average: total / count,
      }))
      .sort((a, b) => a.average - b.average)[0];

    if (!categoryWithLowestFatigue) return 'Rest day recommended';

    const avgFatigue = categoryWithLowestFatigue.average;
    if (avgFatigue < 30) {
      return `${categoryWithLowestFatigue.category} workout highly recommended - muscles are well recovered!`;
    } else if (avgFatigue < 60) {
      return `${categoryWithLowestFatigue.category} workout available - moderate recovery state`;
    } else {
      return 'Active recovery or rest day recommended - muscles need more time';
    }
  };

  return (
    <div className={`min-h-screen bg-background text-white ${className}`}>
      {/* Offline/Error banners */}
      {isOffline && !errorDismissed && (
        <OfflineBanner onRetry={handleRetry} />
      )}
      {hasError && !isOffline && !errorDismissed && (
        <ErrorBanner
          message={musclesError?.message || recsError?.message || 'Unknown error occurred'}
          onRetry={handleRetry}
          onDismiss={handleErrorDismiss}
        />
      )}

      {/* Top Navigation */}
      <TopNav onSettingsClick={handleSettingsClick} />

      {/* Main Content */}
      <main className="px-6 py-6 pb-32" role="main">
        {/* Hero Section - Workout Recommendation */}
        <section className="mb-8" aria-labelledby="workout-recommendation-heading">
          <h2 id="workout-recommendation-heading" className="text-2xl font-bold mb-3">
            Today's Recommendation
          </h2>
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-brand-cyan/20 border border-primary/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">
                auto_awesome
              </span>
              <h3 className="text-lg font-bold text-white">Smart Workout Plan</h3>
            </div>
            <p className="text-gray-200">{getWorkoutRecommendation()}</p>
          </div>
        </section>

        {/* Muscle Heat Map Section */}
        <section className="mb-8" aria-labelledby="muscle-recovery-heading">
          <h2 id="muscle-recovery-heading" className="text-2xl font-bold mb-4">
            Muscle Recovery Status
          </h2>
          {musclesLoading && muscles.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : muscles.length > 0 ? (
            <MuscleHeatMap muscles={muscles} onMuscleClick={handleMuscleClick} />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <span className="material-symbols-outlined text-6xl mb-2" aria-hidden="true">
                fitness_center
              </span>
              <p>No muscle data available. Start your first workout!</p>
            </div>
          )}
        </section>

        {/* Recovery Timeline Section (AC 4) */}
        {muscleStatesData && (
          <RecoveryTimelineView
            muscleStates={muscleStatesData}
            onMuscleClick={handleMuscleClick}
          />
        )}

        {/* Smart Recommendations Section */}
        <section aria-labelledby="exercise-recommendations-heading">
          <h2 id="exercise-recommendations-heading" className="text-2xl font-bold mb-4">
            Smart Exercise Recommendations
          </h2>

          {/* Category Filter Tabs */}
          <div
            className="flex gap-2 mb-4 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Exercise category filters"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                role="tab"
                aria-selected={selectedCategory === category}
                aria-controls={`recommendations-${category}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Recommendations Grid */}
          <div
            id={`recommendations-${selectedCategory}`}
            role="tabpanel"
            aria-labelledby={`tab-${selectedCategory}`}
          >
            {recsLoading && recommendations.length === 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((rec) => (
                  <ExerciseRecommendationCard
                    key={rec.exerciseName}
                    exerciseName={rec.exerciseName}
                    status={rec.status}
                    muscleEngagements={rec.muscleEngagements}
                    lastPerformance={rec.lastPerformance}
                    progressiveOverload={rec.progressiveOverload}
                    equipment={rec.equipment}
                    explanation={rec.explanation}
                    onClick={() => handleExerciseClick(rec.exerciseName)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-2" aria-hidden="true">
                  search_off
                </span>
                <p>No recommendations available for {selectedCategory}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <FAB
        icon="play_arrow"
        label="Start Workout"
        onClick={handleStartWorkout}
        disabled={muscles.length === 0}
      />

      {/* Muscle Detail Modal (AC 8) */}
      {isModalOpen && selectedMuscle && muscleStatesData && muscleStatesData[selectedMuscle] && (
        <MuscleDetailModal
          muscleName={selectedMuscle}
          muscleData={muscleStatesData[selectedMuscle]}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RecoveryDashboard;
