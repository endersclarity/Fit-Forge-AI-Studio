import React from 'react';

interface WorkoutSaveModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'coming-soon';
  message?: string;
  onClose: () => void;
  onDashboard?: () => void;
  onHistory?: () => void;
  onConfirm?: () => void;
}

const WorkoutSaveModal: React.FC<WorkoutSaveModalProps> = ({
  isOpen,
  type,
  message,
  onClose,
  onDashboard,
  onHistory,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-brand-surface rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        {type === 'success' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✓</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Workout Saved!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Your workout has been successfully logged.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={onDashboard}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onHistory}
                className="w-full py-3 border border-primary text-primary hover:bg-primary/10 font-medium rounded-lg"
              >
                View Workout History
              </button>
            </div>
          </>
        )}

        {type === 'error' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Save Failed
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {message || 'An error occurred while saving your workout.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-200 dark:bg-brand-muted text-slate-900 dark:text-slate-100 font-medium rounded-lg"
            >
              Close
            </button>
          </>
        )}

        {type === 'warning' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                Incomplete Workout
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {message}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg"
              >
                Save Anyway
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg"
              >
                Continue Workout
              </button>
            </div>
          </>
        )}

        {type === 'coming-soon' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚧</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Coming Soon
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Workout History page is under development.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-200 dark:bg-brand-muted text-slate-900 dark:text-slate-100 font-medium rounded-lg"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutSaveModal;
