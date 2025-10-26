import React, { useState, useEffect } from 'react';
import { MuscleBaselinesResponse, MuscleBaselineData, Muscle } from '../types';
import { API_BASE_URL } from '../api';
import MuscleBaselineCard from './MuscleBaselineCard';
import Toast from './Toast';

const MUSCLE_GROUPS = {
  'Upper Body': [
    Muscle.Pectoralis,
    Muscle.Deltoids,
    Muscle.Trapezius,
    Muscle.Lats,
    Muscle.Rhomboids,
    Muscle.Biceps,
    Muscle.Triceps,
    Muscle.Forearms
  ],
  'Lower Body': [
    Muscle.Quadriceps,
    Muscle.Hamstrings,
    Muscle.Glutes,
    Muscle.Calves
  ],
  'Core': [
    Muscle.Core
  ]
};

const MuscleBaselinesPage: React.FC = () => {
  const [baselines, setBaselines] = useState<MuscleBaselinesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(() => {
    // Check if user has dismissed the info banner before
    return localStorage.getItem('muscleBaselines_infoBannerDismissed') !== 'true';
  });

  // Fetch baselines on mount
  useEffect(() => {
    fetchBaselines();
  }, []);

  const fetchBaselines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/muscle-baselines`);

      if (!response.ok) {
        throw new Error('Failed to fetch muscle baselines');
      }

      const data: MuscleBaselinesResponse = await response.json();
      setBaselines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setToast({ message: 'Failed to load baselines', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (muscleName: string, userOverride: number | null) => {
    if (!baselines) return;

    try {
      setSaving(true);
      const updatePayload = {
        [muscleName]: {
          systemLearnedMax: baselines[muscleName].systemLearnedMax,
          userOverride
        }
      };

      const response = await fetch(`${API_BASE_URL}/muscle-baselines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        throw new Error('Failed to update baseline');
      }

      const updatedBaselines: MuscleBaselinesResponse = await response.json();
      setBaselines(updatedBaselines);
      setToast({
        message: userOverride === null
          ? `Cleared override for ${muscleName}`
          : `Updated override for ${muscleName} to ${userOverride.toLocaleString()} lbs`,
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: `Failed to update ${muscleName}`,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset all baselines to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);

      // Reset all baselines: system_learned_max = 10000, user_override = null
      const resetPayload: Record<string, { systemLearnedMax: number; userOverride: null }> = {};
      Object.keys(baselines || {}).forEach(muscleName => {
        resetPayload[muscleName] = {
          systemLearnedMax: 10000,
          userOverride: null
        };
      });

      const response = await fetch(`${API_BASE_URL}/muscle-baselines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resetPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to reset baselines');
      }

      const updatedBaselines: MuscleBaselinesResponse = await response.json();
      setBaselines(updatedBaselines);
      setToast({
        message: 'All baselines have been reset to defaults',
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: 'Failed to reset baselines',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const dismissInfoBanner = () => {
    setShowInfoBanner(false);
    localStorage.setItem('muscleBaselines_infoBannerDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading muscle baselines...</div>
        </div>
      </div>
    );
  }

  if (error || !baselines) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 font-semibold">Error Loading Baselines</p>
          <p className="text-red-300 text-sm mt-2">{error || 'Unknown error'}</p>
          <button
            onClick={fetchBaselines}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Muscle Capacity Baselines</h1>
            <p className="text-slate-400 mt-1">
              View and manage your muscle capacity estimates
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-brand-surface border border-brand-muted text-slate-300 rounded hover:bg-brand-muted transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Info Banner */}
        {showInfoBanner && (
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-blue-400 font-semibold">ℹ️ How Muscle Baselines Work</p>
                <p className="text-blue-300 text-sm">
                  Your muscle capacity baselines are used to calculate fatigue and recovery recommendations.
                  The system automatically learns from your "to failure" sets to estimate each muscle's capacity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                    <p className="font-semibold text-blue-300">🤖 System Learned</p>
                    <p className="text-blue-200 mt-1">Auto-updated from your performance data</p>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                    <p className="font-semibold text-blue-300">✏️ Your Override</p>
                    <p className="text-blue-200 mt-1">Manual adjustment (optional)</p>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                    <p className="font-semibold text-blue-300">✅ Currently Using</p>
                    <p className="text-blue-200 mt-1">Effective value for calculations</p>
                  </div>
                </div>
              </div>
              <button
                onClick={dismissInfoBanner}
                className="text-blue-400 hover:text-blue-300 text-xl leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Muscle Groups */}
        {Object.entries(MUSCLE_GROUPS).map(([groupName, muscles]) => (
          <div key={groupName} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200 border-b border-brand-muted pb-2">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {muscles.map(muscle => {
                const baseline = baselines[muscle];
                if (!baseline) return null;

                return (
                  <MuscleBaselineCard
                    key={muscle}
                    muscleName={muscle}
                    baseline={baseline}
                    onUpdate={handleUpdate}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Reset All Button */}
        <div className="border-t border-brand-muted pt-6">
          <button
            onClick={handleResetAll}
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 bg-red-900/30 text-red-400 border border-red-500/50 rounded hover:bg-red-900/50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚠️ Reset All Baselines to Defaults
          </button>
          <p className="text-xs text-slate-500 mt-2">
            This will reset all system-learned values to 10,000 and clear all user overrides.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
            <p className="text-slate-300">Saving changes...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuscleBaselinesPage;
