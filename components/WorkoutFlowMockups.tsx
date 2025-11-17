import React, { useState } from 'react';

// Sample exercises for the mockup
const SAMPLE_EXERCISES = [
  { id: 'bench-press', name: 'Bench Press' },
  { id: 'squat', name: 'Squat' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'overhead-press', name: 'Overhead Press' },
  { id: 'barbell-row', name: 'Barbell Row' },
];

interface LoggedSet {
  weight: number;
  reps: number;
}

interface LoggedExercise {
  name: string;
  sets: LoggedSet[];
}

// ========================================
// APPROACH A: Stateless Page-Based
// ========================================
const ApproachA: React.FC = () => {
  const [screen, setScreen] = useState<'picker' | 'logger' | 'summary'>('picker');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weight, setWeight] = useState('135');
  const [reps, setReps] = useState('10');
  const [currentSets, setCurrentSets] = useState<LoggedSet[]>([]);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);

  const handleSelectExercise = (name: string) => {
    setSelectedExercise(name);
    setCurrentSets([]);
    setScreen('logger');
  };

  const handleAddSet = () => {
    setCurrentSets([...currentSets, { weight: parseInt(weight), reps: parseInt(reps) }]);
  };

  const handleDifferentExercise = () => {
    if (currentSets.length > 0) {
      setLoggedExercises([...loggedExercises, { name: selectedExercise, sets: currentSets }]);
    }
    setCurrentSets([]);
    setSelectedExercise('');
    setScreen('picker');
  };

  const handleFinish = () => {
    if (currentSets.length > 0) {
      setLoggedExercises([...loggedExercises, { name: selectedExercise, sets: currentSets }]);
    }
    setScreen('summary');
  };

  const handleReset = () => {
    setScreen('picker');
    setSelectedExercise('');
    setCurrentSets([]);
    setLoggedExercises([]);
  };

  return (
    <div className="bg-white dark:bg-brand-surface rounded-lg border border-slate-300 dark:border-brand-muted h-[600px] flex flex-col">
      <div className="bg-slate-100 dark:bg-brand-muted px-4 py-3 border-b border-slate-300 dark:border-brand-muted">
        <h3 className="font-bold text-slate-900 dark:text-white">A: Stateless Page-Based</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Full screen transitions</p>
      </div>

      <div className="flex-1 overflow-hidden">
        {screen === 'picker' && (
          <div className="h-full bg-slate-50 dark:bg-brand-dark p-4 space-y-3">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Select Exercise</h4>
            {SAMPLE_EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelectExercise(ex.name)}
                className="w-full min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg px-4 py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
              >
                {ex.name}
              </button>
            ))}
          </div>
        )}

        {screen === 'logger' && (
          <div className="h-full bg-slate-50 dark:bg-brand-dark p-4 flex flex-col">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{selectedExercise}</h4>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full text-5xl font-bold text-center py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Reps</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full text-5xl font-bold text-center py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                />
              </div>

              {currentSets.length > 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Sets logged: {currentSets.length}
                </div>
              )}
            </div>

            <div className="space-y-2 mt-auto">
              <button
                onClick={handleAddSet}
                className="w-full min-h-[48px] bg-brand-cyan text-brand-dark font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Add Set
              </button>
              <button
                onClick={handleDifferentExercise}
                className="w-full min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
              >
                Different Exercise
              </button>
              <button
                onClick={handleFinish}
                className="w-full min-h-[48px] bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
              >
                Finish Workout
              </button>
            </div>
          </div>
        )}

        {screen === 'summary' && (
          <div className="h-full bg-slate-50 dark:bg-brand-dark p-4 flex flex-col">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Workout Summary</h4>
            <div className="flex-1 overflow-y-auto space-y-3">
              {loggedExercises.map((ex, i) => (
                <div key={i} className="bg-white dark:bg-brand-surface p-3 rounded-lg border border-slate-300 dark:border-brand-muted">
                  <div className="font-semibold text-slate-900 dark:text-white">{ex.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {ex.sets.map((s, j) => (
                      <span key={j}>
                        {s.weight}x{s.reps}
                        {j < ex.sets.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-4 w-full min-h-[48px] bg-brand-cyan text-brand-dark font-bold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              New Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// APPROACH B: Single Page with Modals
// ========================================
const ApproachB: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'picker' | 'logger'>('picker');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weight, setWeight] = useState('135');
  const [reps, setReps] = useState('10');
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);

  const handleSelectExercise = (name: string) => {
    setSelectedExercise(name);
    setModalStep('logger');
  };

  const handleLogSet = () => {
    const existingIndex = loggedExercises.findIndex((ex) => ex.name === selectedExercise);
    if (existingIndex >= 0) {
      const updated = [...loggedExercises];
      updated[existingIndex].sets.push({ weight: parseInt(weight), reps: parseInt(reps) });
      setLoggedExercises(updated);
    } else {
      setLoggedExercises([
        ...loggedExercises,
        { name: selectedExercise, sets: [{ weight: parseInt(weight), reps: parseInt(reps) }] },
      ]);
    }
    setShowModal(false);
    setModalStep('picker');
    setSelectedExercise('');
  };

  const handleReset = () => {
    setLoggedExercises([]);
  };

  return (
    <div className="bg-white dark:bg-brand-surface rounded-lg border border-slate-300 dark:border-brand-muted h-[600px] flex flex-col relative">
      <div className="bg-slate-100 dark:bg-brand-muted px-4 py-3 border-b border-slate-300 dark:border-brand-muted">
        <h3 className="font-bold text-slate-900 dark:text-white">B: Single Page with Modals</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Summary always visible</p>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-brand-dark p-4 flex flex-col">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Workout</h4>

        <div className="flex-1 overflow-y-auto space-y-3">
          {loggedExercises.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              No exercises logged yet
            </div>
          ) : (
            loggedExercises.map((ex, i) => (
              <div key={i} className="bg-white dark:bg-brand-surface p-3 rounded-lg border border-slate-300 dark:border-brand-muted">
                <div className="font-semibold text-slate-900 dark:text-white">{ex.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {ex.sets.map((s, j) => (
                    <span key={j}>
                      {s.weight}x{s.reps}
                      {j < ex.sets.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => setShowModal(true)}
            className="w-full min-h-[48px] bg-brand-cyan text-brand-dark font-bold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Add Exercise
          </button>
          {loggedExercises.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface rounded-lg w-full max-w-sm">
            <div className="p-4 border-b border-slate-300 dark:border-brand-muted flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white">
                {modalStep === 'picker' ? 'Select Exercise' : selectedExercise}
              </h4>
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalStep('picker');
                  setSelectedExercise('');
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                X
              </button>
            </div>
            <div className="p-4">
              {modalStep === 'picker' && (
                <div className="space-y-2">
                  {SAMPLE_EXERCISES.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex.name)}
                      className="w-full min-h-[48px] bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-muted rounded-lg px-4 py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              )}
              {modalStep === 'logger' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Weight (lbs)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full text-4xl font-bold text-center py-3 bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Reps</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full text-4xl font-bold text-center py-3 bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                    />
                  </div>
                  <button
                    onClick={handleLogSet}
                    className="w-full min-h-[48px] bg-brand-cyan text-brand-dark font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    Log Set
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// APPROACH C: Bottom-Up Flow (FitFlow Pattern)
// ========================================
const ApproachC: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weight, setWeight] = useState('135');
  const [reps, setReps] = useState('10');
  const [currentSetCount, setCurrentSetCount] = useState(0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const handleSelectExercise = (name: string) => {
    // Save current exercise if it has sets
    if (selectedExercise && currentSetCount > 0) {
      const existingIndex = loggedExercises.findIndex((ex) => ex.name === selectedExercise);
      if (existingIndex >= 0) {
        // Already saved incrementally
      } else {
        // This shouldn't happen in normal flow
      }
    }
    setSelectedExercise(name);
    setCurrentSetCount(0);
  };

  const handleLogSet = () => {
    const existingIndex = loggedExercises.findIndex((ex) => ex.name === selectedExercise);
    if (existingIndex >= 0) {
      const updated = [...loggedExercises];
      updated[existingIndex].sets.push({ weight: parseInt(weight), reps: parseInt(reps) });
      setLoggedExercises(updated);
    } else {
      setLoggedExercises([
        ...loggedExercises,
        { name: selectedExercise, sets: [{ weight: parseInt(weight), reps: parseInt(reps) }] },
      ]);
    }
    setCurrentSetCount(currentSetCount + 1);
  };

  const handleSwitchExercise = () => {
    setSelectedExercise('');
    setCurrentSetCount(0);
  };

  const handleReset = () => {
    setSelectedExercise('');
    setCurrentSetCount(0);
    setLoggedExercises([]);
  };

  return (
    <div className="bg-white dark:bg-brand-surface rounded-lg border border-slate-300 dark:border-brand-muted h-[600px] flex flex-col">
      <div className="bg-slate-100 dark:bg-brand-muted px-4 py-3 border-b border-slate-300 dark:border-brand-muted">
        <h3 className="font-bold text-slate-900 dark:text-white">C: Bottom-Up Flow (FitFlow)</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Progressive reveal pattern</p>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-brand-dark p-4 flex flex-col">
        {/* Mini summary at top */}
        {loggedExercises.length > 0 && (
          <div className="mb-4 p-3 bg-white dark:bg-brand-surface rounded-lg border border-slate-300 dark:border-brand-muted">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">SESSION LOG</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {loggedExercises.map((ex, i) => (
                <div key={i} className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{ex.name}</span>: {ex.sets.length} sets
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main interaction area */}
        <div className="flex-1 flex flex-col">
          {!selectedExercise ? (
            // Exercise picker prominent
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Pick Exercise</h4>
              {SAMPLE_EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex.name)}
                  className="w-full min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg px-4 py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          ) : (
            // Input flow after exercise selected
            <div className="flex-1 flex flex-col">
              {/* Large exercise name */}
              <div className="text-center mb-6">
                <h4 className="text-3xl font-bold text-brand-cyan">{selectedExercise}</h4>
                {currentSetCount > 0 && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Set #{currentSetCount + 1}
                  </div>
                )}
              </div>

              {/* Weight/Reps inputs */}
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-5xl font-bold text-center py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Reps</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full text-5xl font-bold text-center py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-white focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-auto space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleLogSet}
                    className="flex-1 min-h-[48px] bg-brand-cyan text-brand-dark font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    Log Set
                  </button>
                  <button
                    onClick={() => setShowRestTimer(!showRestTimer)}
                    className="min-w-[48px] min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors flex items-center justify-center"
                    title="Rest Timer"
                  >
                    {showRestTimer ? '2:00' : '⏱'}
                  </button>
                </div>
                <button
                  onClick={handleSwitchExercise}
                  className="w-full min-h-[48px] bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
                >
                  Switch Exercise
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset button */}
        {loggedExercises.length > 0 && (
          <button
            onClick={handleReset}
            className="mt-4 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            Reset Demo
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
const WorkoutFlowMockups: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-brand-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Workout Flow Comparison
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Interactive mockups to evaluate different UX patterns for logging workouts.
            Click through each approach to experience the flow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ApproachA />
          <ApproachB />
          <ApproachC />
        </div>

        <div className="mt-8 bg-white dark:bg-brand-surface rounded-lg border border-slate-300 dark:border-brand-muted p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Differences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">A: Stateless Page-Based</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Full screen transitions</li>
                <li>Summary only at end</li>
                <li>Clear navigation flow</li>
                <li>Higher cognitive load (no context)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">B: Single Page with Modals</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Summary always visible</li>
                <li>Modal overlays for input</li>
                <li>Context preserved</li>
                <li>May feel disruptive</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">C: Bottom-Up Flow</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Progressive reveal</li>
                <li>Optimized for multiple sets</li>
                <li>Mini summary builds up</li>
                <li>Large typography for gym visibility</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => window.history.back()}
            className="min-h-[48px] px-6 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFlowMockups;
