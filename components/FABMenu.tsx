import React from 'react';

interface FABMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWorkout: () => void;
  onBuildWorkout: () => void;
  onLoadTemplate: () => void;
}

const FABMenu: React.FC<FABMenuProps> = ({
  isOpen,
  onClose,
  onLogWorkout,
  onBuildWorkout,
  onLoadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-t-2xl p-6 w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-center">Quick Actions</h3>

        <div className="space-y-3">
          <button
            onClick={onLogWorkout}
            className="w-full bg-brand-muted text-white font-semibold py-4 px-4 rounded-lg hover:bg-brand-dark transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-bold">Log Workout</div>
              <div className="text-sm text-slate-400">Record a completed workout</div>
            </div>
          </button>

          <button
            onClick={onBuildWorkout}
            className="w-full bg-brand-cyan text-brand-dark font-semibold py-4 px-4 rounded-lg hover:bg-cyan-400 transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">🏗️</span>
            <div>
              <div className="font-bold">Build Workout</div>
              <div className="text-sm text-slate-600">Plan and execute with timers</div>
            </div>
          </button>

          <button
            onClick={onLoadTemplate}
            className="w-full bg-brand-muted text-white font-semibold py-4 px-4 rounded-lg hover:bg-brand-dark transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-bold">Load Template</div>
              <div className="text-sm text-slate-400">Use a saved workout plan</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <style>{`
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FABMenu;
