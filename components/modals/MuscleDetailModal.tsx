import React from 'react';
import { MuscleStateData } from '../../types';

interface MuscleDetailModalProps {
  muscleName: string;
  muscleData: MuscleStateData & { projections?: { '24h': number; '48h': number; '72h': number } };
  onClose: () => void;
}

/**
 * MuscleDetailModal - Shows detailed recovery information for a specific muscle
 *
 * Displays:
 * - Current fatigue percentage
 * - Recovery projections (24h/48h/72h)
 * - Estimated time to full recovery
 * - Last workout date for that muscle
 *
 * AC 8: When user clicks muscle, show detailed info
 */
export const MuscleDetailModal: React.FC<MuscleDetailModalProps> = ({
  muscleName,
  muscleData,
  onClose
}) => {
  // Format the last trained date
  const formatLastTrained = (lastTrained: string | null): string => {
    if (!lastTrained) return 'Never trained';

    const date = new Date(lastTrained);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    // Format as "MMM DD, YYYY"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format recovery time
  const formatRecoveryTime = (daysUntil: number): string => {
    if (daysUntil <= 0) return 'Fully recovered';

    const days = Math.floor(daysUntil);
    const hours = Math.round((daysUntil - days) * 24);

    if (days === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };

  // Get recovery projections from API data (AC 8)
  const projection24h = muscleData.projections?.['24h'] ?? 0;
  const projection48h = muscleData.projections?.['48h'] ?? 0;
  const projection72h = muscleData.projections?.['72h'] ?? 0;

  // Determine status color
  const getStatusColor = (): string => {
    const fatigue = muscleData.currentFatiguePercent;
    if (fatigue <= 30) return 'text-green-400';
    if (fatigue <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBgColor = (): string => {
    const fatigue = muscleData.currentFatiguePercent;
    if (fatigue <= 30) return 'bg-green-500';
    if (fatigue <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (): string => {
    const fatigue = muscleData.currentFatiguePercent;
    if (fatigue <= 30) return 'Ready to Train';
    if (fatigue <= 60) return 'Recovering';
    return 'Needs Rest';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="muscle-detail-title"
    >
      <div
        className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-700">
          <div className="flex-1">
            <h2 id="muscle-detail-title" className="text-2xl font-bold text-slate-200 mb-2">
              {muscleName}
            </h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              <span className={`w-2 h-2 rounded-full ${getStatusBgColor()}`}></span>
              {getStatusText()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 -mr-2 -mt-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Fatigue */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">Current Fatigue</span>
              <span className={`text-2xl font-bold ${getStatusColor()}`}>
                {Math.round(muscleData.currentFatiguePercent)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getStatusBgColor()}`}
                style={{ width: `${Math.min(100, muscleData.currentFatiguePercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Recovery Projections */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-3">Recovery Projections</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">24 hours</div>
                <div className="text-slate-200 text-lg font-bold">{projection24h}%</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">48 hours</div>
                <div className="text-slate-200 text-lg font-bold">{projection48h}%</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">72 hours</div>
                <div className="text-slate-200 text-lg font-bold">{projection72h}%</div>
              </div>
            </div>
          </div>

          {/* Full Recovery Time */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Estimated Full Recovery</div>
                <div className="text-slate-200 text-lg font-semibold">
                  {formatRecoveryTime(muscleData.daysUntilRecovered)}
                </div>
              </div>
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Last Workout */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Last Trained</div>
                <div className="text-slate-200 text-lg font-semibold">
                  {formatLastTrained(muscleData.lastTrained)}
                </div>
              </div>
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Recovery Status Indicator */}
          <div className="border-t border-slate-700 pt-4">
            <div className="text-center text-slate-400 text-sm">
              {muscleData.currentFatiguePercent <= 30 && (
                <p>This muscle is ready for high-intensity training.</p>
              )}
              {muscleData.currentFatiguePercent > 30 && muscleData.currentFatiguePercent <= 60 && (
                <p>This muscle can handle moderate training loads.</p>
              )}
              {muscleData.currentFatiguePercent > 60 && (
                <p>This muscle needs more recovery time before training again.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuscleDetailModal;
