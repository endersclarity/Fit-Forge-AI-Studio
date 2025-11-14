import React from 'react';
import { Muscle } from '../types';
import { Sheet, Card, Button } from '../src/design-system/components/primitives';

interface BaselineUpdate {
  muscle: Muscle;
  oldMax: number;
  newMax: number;
  sessionVolume: number;
}

interface BaselineUpdateModalProps {
  isOpen: boolean;
  updates: BaselineUpdate[];
  onConfirm: () => void;
  onDecline: () => void;
}

const BaselineUpdateModal: React.FC<BaselineUpdateModalProps> = ({
  isOpen,
  updates,
  onConfirm,
  onDecline,
}) => {
  if (updates.length === 0) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onDecline(); }}
      height="md"
      title="New Muscle Capacity Records! 🎉"
      description="You just achieved new maximum session volumes"
    >
      <div className="space-y-6">
        <p className="text-gray-600 font-body">
          You just achieved new maximum session volumes for the following muscles:
        </p>

        <div className="space-y-3">
          {updates.map(({ muscle, oldMax, newMax, sessionVolume }) => (
            <Card key={muscle} variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
              <div className="font-semibold text-primary font-display">{muscle}</div>
              <div className="text-sm text-gray-600 font-body mt-1">
                Session Volume: <span className="text-foreground font-semibold">{sessionVolume.toLocaleString()} lbs</span>
              </div>
              <div className="text-sm text-gray-600 font-body">
                Previous Max: {oldMax.toLocaleString()} lbs →
                <span className="text-green-600 ml-1 font-semibold">New Max: {newMax.toLocaleString()} lbs</span>
              </div>
              <div className="text-xs text-gray-500 font-body mt-1">
                +{((newMax - oldMax) / oldMax * 100).toFixed(1)}% improvement
              </div>
            </Card>
          ))}
        </div>

        <p className="text-sm text-gray-600 font-body">
          Update your muscle capacity baselines to reflect this performance?
          This helps the system provide more accurate workout recommendations.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onDecline}
            variant="secondary"
            size="md"
            className="flex-1 min-h-[60px]"
          >
            Keep Current
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            size="md"
            className="flex-1 min-h-[60px]"
          >
            Update Baselines
          </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default BaselineUpdateModal;
