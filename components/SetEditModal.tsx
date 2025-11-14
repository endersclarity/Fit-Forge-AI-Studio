import React, { useState, useEffect } from 'react';
import { BuilderSet, Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../constants';
import { isBodyweightExercise } from '../utils/helpers';
import { Sheet, Card, Button, Input } from '../src/design-system/components/primitives';

interface SetEditModalProps {
  set: BuilderSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSet: BuilderSet) => void;
  onAddSet?: (newSetValues: { weight: number; reps: number; restTimerSeconds: number }) => void; // Callback to add another set with current values
  currentBodyweight?: number; // Current user bodyweight from profile
}

const SetEditModal: React.FC<SetEditModalProps> = ({ set, isOpen, onClose, onSave, onAddSet, currentBodyweight }) => {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [restTimer, setRestTimer] = useState(90);
  const [usingBodyweight, setUsingBodyweight] = useState(false);

  // Get the exercise details
  const exercise: Exercise | undefined = set ? EXERCISE_LIBRARY.find(ex => ex.id === set.exerciseId) : undefined;
  const isBodyweightEx = isBodyweightExercise(exercise);

  // Initialize form values when set changes
  useEffect(() => {
    if (set) {
      // Smart detection: Auto-fill bodyweight for bodyweight exercises
      if (isBodyweightEx && currentBodyweight && set.weight === 0) {
        setWeight(currentBodyweight);
        setUsingBodyweight(true);
      } else {
        setWeight(set.weight);
        setUsingBodyweight(set.weight === currentBodyweight && currentBodyweight !== undefined);
      }
      setReps(set.reps);
      setRestTimer(set.restTimerSeconds);
    }
  }, [set, currentBodyweight, isBodyweightEx]);

  const handleSave = () => {
    if (!set) return;

    const updatedSet: BuilderSet = {
      ...set,
      weight,
      reps,
      restTimerSeconds: restTimer,
      // Include bodyweightAtTime if using bodyweight
      bodyweightAtTime: usingBodyweight && currentBodyweight ? currentBodyweight : undefined,
    };

    onSave(updatedSet);
    onClose();
  };

  const handleAddSet = () => {
    if (!onAddSet) return;

    // Call the parent's callback with the current values
    onAddSet({
      weight,
      reps,
      restTimerSeconds: restTimer,
    });

    // Don't close the modal - allow user to continue adding sets or close manually
  };

  if (!set) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      height="md"
      title="Edit Set"
      description={set.exerciseName}
    >
      <div className="space-y-6">
        <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
          <div className="font-semibold font-display text-foreground">{set.exerciseName}</div>
        </Card>

        <div className="space-y-4">
          {/* Weight Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-gray-600 font-body">Weight (lbs)</label>
              {currentBodyweight && (
                <Button
                  onClick={() => {
                    setWeight(currentBodyweight);
                    setUsingBodyweight(true);
                  }}
                  variant={usingBodyweight ? 'primary' : 'secondary'}
                  size="sm"
                  className="text-xs"
                >
                  {usingBodyweight ? '✓ BW' : 'Use BW'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setWeight(Math.max(0, weight - 5));
                  setUsingBodyweight(false);
                }}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                -5
              </Button>
              <Button
                onClick={() => {
                  setWeight(Math.max(0, weight - 2.5));
                  setUsingBodyweight(false);
                }}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                -2.5
              </Button>
              <div className="flex-1 relative">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    setWeight(Number(e.target.value));
                    setUsingBodyweight(false);
                  }}
                  variant="default"
                  size="md"
                  className="text-center"
                />
                {usingBodyweight && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary pointer-events-none">
                    BW
                  </span>
                )}
              </div>
              <Button
                onClick={() => {
                  setWeight(weight + 2.5);
                  setUsingBodyweight(false);
                }}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                +2.5
              </Button>
              <Button
                onClick={() => {
                  setWeight(weight + 5);
                  setUsingBodyweight(false);
                }}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                +5
              </Button>
            </div>
          </div>

          {/* Reps Input */}
          <div>
            <label className="block text-sm text-gray-600 font-body mb-2">Reps</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setReps(Math.max(1, reps - 1))}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                -1
              </Button>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                variant="default"
                size="md"
                className="flex-1 text-center"
              />
              <Button
                onClick={() => setReps(reps + 1)}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                +1
              </Button>
            </div>
          </div>

          {/* Rest Timer Input */}
          <div>
            <label className="block text-sm text-gray-600 font-body mb-2">Rest Time (seconds)</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setRestTimer(Math.max(15, restTimer - 15))}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                -15
              </Button>
              <Input
                type="number"
                value={restTimer}
                onChange={(e) => setRestTimer(Math.max(15, Number(e.target.value)))}
                variant="default"
                size="md"
                className="flex-1 text-center"
              />
              <Button
                onClick={() => setRestTimer(restTimer + 15)}
                variant="secondary"
                size="sm"
                className="min-h-[60px]"
              >
                +15
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {onAddSet && (
            <Button
              onClick={handleAddSet}
              variant="primary"
              size="md"
              className="w-full min-h-[60px] bg-green-600 hover:bg-green-700"
            >
              + Add Another Set
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
              size="md"
              className="flex-1 min-h-[60px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              className="flex-1 min-h-[60px]"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};

export default SetEditModal;
