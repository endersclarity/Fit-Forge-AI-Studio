import React from 'react';
import { BuilderSet } from '../types';
import HorizontalSetInput from './HorizontalSetInput';

interface CurrentSetDisplayProps {
  set: BuilderSet;
  setNumber: number;
  totalSets: number;
  restTimerEndTime: number | null;
  onComplete: () => void;
  onSkip: () => void;
}

const CurrentSetDisplay: React.FC<CurrentSetDisplayProps> = ({
  set,
  setNumber,
  totalSets,
  restTimerEndTime,
  onComplete,
  onSkip,
}) => {
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  React.useEffect(() => {
    if (!restTimerEndTime) {
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((restTimerEndTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [restTimerEndTime]);

  const isResting = restTimerEndTime && timeRemaining > 0;

  return (
    <div className="bg-brand-muted p-6 rounded-lg">
      {/* Exercise header */}
      <div className="text-center mb-6">
        <div className="text-sm text-slate-400 mb-1">
          Set {setNumber} of {totalSets}
        </div>
        <h3 className="text-2xl font-bold mb-4">{set.exerciseName}</h3>
      </div>

      {/* Horizontal set input */}
      <div className="mb-6">
        <HorizontalSetInput
          setNumber={setNumber}
          exerciseName={set.exerciseName}
          weight={set.weight}
          reps={set.reps}
          restTimerSeconds={set.restTimerSeconds}
          isLogged={false}
          isActive={true}
          onWeightChange={() => {}} // Read-only in execution mode
          onRepsChange={() => {}} // Read-only in execution mode
          onLog={onComplete}
        />
      </div>

      {/* Rest timer or action buttons */}
      {isResting ? (
        <div className="text-center">
          <div className="text-4xl font-bold text-brand-cyan mb-2">{timeRemaining}s</div>
          <div className="text-sm text-slate-400 mb-4">Rest time remaining</div>
          <div className="w-full bg-brand-dark rounded-full h-2 mb-4">
            <div
              className="bg-brand-cyan h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${((set.restTimerSeconds - timeRemaining) / set.restTimerSeconds) * 100}%`,
              }}
            />
          </div>
          <button
            onClick={onSkip}
            className="w-full bg-brand-muted text-slate-400 font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Skip Rest
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onComplete}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg hover:bg-cyan-400 transition-colors text-lg"
          >
            LOG SET
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-brand-muted text-slate-400 font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Skip Set
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentSetDisplay;
