import React, { useState } from 'react';
import { MuscleStateData } from '../../types';
import { Sheet, Card, Button } from '../../src/design-system/components/primitives';

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
  const [isOpen, setIsOpen] = useState(true);

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
    if (fatigue <= 30) return 'text-green-600';
    if (fatigue <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = (): string => {
    const fatigue = muscleData.currentFatiguePercent;
    if (fatigue <= 30) return 'bg-green-600';
    if (fatigue <= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusText = (): string => {
    const fatigue = muscleData.currentFatiguePercent;
    if (fatigue <= 30) return 'Ready to Train';
    if (fatigue <= 60) return 'Recovering';
    return 'Needs Rest';
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      height="lg"
      title={muscleName}
      description={getStatusText()}
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold font-body ${getStatusColor()}`}>
            <span className={`w-2 h-2 rounded-full ${getStatusBgColor()}`}></span>
            {getStatusText()}
          </div>
        </Card>

        {/* Current Fatigue */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm font-medium font-body">Current Fatigue</span>
            <span className={`text-2xl font-bold font-display ${getStatusColor()}`}>
              {Math.round(muscleData.currentFatiguePercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getStatusBgColor()}`}
              style={{ width: `${Math.min(100, muscleData.currentFatiguePercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Recovery Projections */}
        <div>
          <h3 className="text-foreground font-semibold font-display mb-3">Recovery Projections</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3 text-center">
              <div className="text-gray-600 text-xs mb-1 font-body">24 hours</div>
              <div className="text-foreground text-lg font-bold font-display">{projection24h}%</div>
            </Card>
            <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3 text-center">
              <div className="text-gray-600 text-xs mb-1 font-body">48 hours</div>
              <div className="text-foreground text-lg font-bold font-display">{projection48h}%</div>
            </Card>
            <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-3 text-center">
              <div className="text-gray-600 text-xs mb-1 font-body">72 hours</div>
              <div className="text-foreground text-lg font-bold font-display">{projection72h}%</div>
            </Card>
          </div>
        </div>

        {/* Full Recovery Time */}
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm mb-1 font-body">Estimated Full Recovery</div>
              <div className="text-foreground text-lg font-semibold font-display">
                {formatRecoveryTime(muscleData.daysUntilRecovered)}
              </div>
            </div>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>

        {/* Last Workout */}
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm mb-1 font-body">Last Trained</div>
              <div className="text-foreground text-lg font-semibold font-display">
                {formatLastTrained(muscleData.lastTrained)}
              </div>
            </div>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </Card>

        {/* Recovery Status Indicator */}
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className="text-center text-gray-600 text-sm font-body">
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
        </Card>

        <Button
          onClick={handleClose}
          variant="primary"
          size="lg"
          className="w-full min-h-[60px]"
        >
          Close
        </Button>
      </div>
    </Sheet>
  );
};

export default MuscleDetailModal;
