import React, { useEffect, useState } from 'react';
import { ExerciseCategory } from '../types';
import { ChevronDownIcon } from './Icons';
import { RecommendedWorkoutData } from '../App';

interface WorkoutRecommendation {
  isRestDay: boolean;
  reason?: string;
  category?: ExerciseCategory;
  variation?: 'A' | 'B';
  phase?: number;
  lastWorkout?: {
    category: ExerciseCategory;
    variation: 'A' | 'B';
    date: string;
    daysAgo: number;
  };
}

interface DashboardQuickStartProps {
  onStartRecommendedWorkout: (data: RecommendedWorkoutData) => void;
}

const DashboardQuickStart: React.FC<DashboardQuickStartProps> = ({
  onStartRecommendedWorkout
}) => {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/rotation/next');
        const data = await response.json();
        setRecommendation(data);
      } catch (error) {
        console.error('Error fetching workout recommendation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  const handleStartWorkout = () => {
    if (recommendation && !recommendation.isRestDay && recommendation.category && recommendation.variation) {
      onStartRecommendedWorkout({
        category: recommendation.category,
        variation: recommendation.variation,
        exercises: []
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Start</h2>
        <div className="bg-brand-surface rounded-lg p-6 text-center">
          <p className="text-slate-400">Loading recommendation...</p>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Start</h2>
        <div className="bg-brand-surface rounded-lg p-6 text-center">
          <p className="text-slate-400">Unable to load workout recommendation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Quick Start</h2>
      </div>

      {recommendation.isRestDay ? (
        <div className="bg-brand-surface rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">😴</div>
          <h3 className="text-xl font-bold text-white mb-2">Rest Day</h3>
          <p className="text-slate-400 text-sm mb-4">{recommendation.reason}</p>
          {recommendation.lastWorkout && (
            <p className="text-xs text-slate-500">
              Last: {recommendation.lastWorkout.category} {recommendation.lastWorkout.variation} • {recommendation.lastWorkout.daysAgo} {recommendation.lastWorkout.daysAgo === 1 ? 'day' : 'days'} ago
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleStartWorkout}
          className="w-full bg-brand-surface rounded-lg p-6 hover:bg-opacity-80 transition-colors text-left active:scale-98"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-white">
                  {recommendation.category} Day {recommendation.variation}
                </h3>
              </div>
              <p className="text-brand-cyan font-semibold text-sm">
                Ready to Train!
              </p>
            </div>
            <ChevronDownIcon className="w-6 h-6 text-brand-cyan flex-shrink-0 -rotate-90 mt-1" />
          </div>

          {recommendation.lastWorkout && (
            <div className="text-xs text-slate-400 bg-brand-dark bg-opacity-50 rounded px-3 py-2">
              Last: {recommendation.lastWorkout.category} {recommendation.lastWorkout.variation} • {recommendation.lastWorkout.daysAgo} {recommendation.lastWorkout.daysAgo === 1 ? 'day' : 'days'} ago
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default DashboardQuickStart;
