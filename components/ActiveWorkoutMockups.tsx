import React, { useState } from 'react';

const ActiveWorkoutMockups: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A');

  // Mock data for all options
  const exercises = [
    { name: 'Pull-up', setsCompleted: 3, totalSets: 3, completed: true },
    { name: 'Dumbbell Row', setsCompleted: 1, totalSets: 3, completed: false },
    { name: 'Lat Pulldown', setsCompleted: 0, totalSets: 3, completed: false },
  ];

  const currentSet = { weight: 45, reps: 12, restSeconds: 90 };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Active Workout UI Options
        </h1>

        {/* Option Selector */}
        <div className="flex gap-4 mb-8">
          {(['A', 'B', 'C'] as const).map(option => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedOption === option
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'bg-white dark:bg-brand-surface text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-brand-muted'
              }`}
            >
              Option {option}
            </button>
          ))}
        </div>

        {/* Option A: Split Panel */}
        {selectedOption === 'A' && (
          <div className="bg-white dark:bg-brand-surface rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-brand-muted bg-slate-100 dark:bg-brand-dark">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Option A: Split Panel (Desktop-Optimized)
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Timer: 05:22
                </span>
              </div>
            </div>

            <div className="flex h-[650px]">
              {/* Left Panel - Exercise List */}
              <div className="w-2/5 border-r border-slate-200 dark:border-brand-muted p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  EXERCISES
                </h3>
                <div className="space-y-2">
                  {exercises.map((ex, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        ex.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : i === 1
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                          : 'bg-slate-50 dark:bg-brand-dark border border-slate-200 dark:border-brand-muted hover:bg-slate-100 dark:hover:bg-brand-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ex.name}
                        </span>
                        {ex.completed ? (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {ex.setsCompleted}/{ex.totalSets}
                          </span>
                        )}
                      </div>
                      {!ex.completed && ex.setsCompleted > 0 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Set {ex.setsCompleted + 1} of {ex.totalSets}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg">
                  Finish Workout
                </button>
              </div>

              {/* Right Panel - Active Set Logger */}
              <div className="w-3/5 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Dumbbell Row
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Target: 3 sets
                </p>

                {/* Set History - Already Logged */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    COMPLETED SETS
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 dark:text-green-400 font-semibold">Set 1</span>
                        <span className="text-slate-900 dark:text-slate-100">45 lbs × 12 reps</span>
                      </div>
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    </div>
                  </div>
                </div>

                {/* Current Set to Log */}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    CURRENT SET (2 of 3)
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500 space-y-4">
                    {/* Weight Input */}
                    <div className="flex items-center gap-4">
                      <label className="w-20 flex-shrink-0 text-slate-600 dark:text-slate-400">Weight</label>
                      <input
                        type="number"
                        value={currentSet.weight}
                        className="flex-1 min-w-0 text-2xl font-bold text-center py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        readOnly
                      />
                      <span className="flex-shrink-0 text-slate-500 dark:text-slate-400">lbs</span>
                    </div>

                    {/* Reps Input */}
                    <div className="flex items-center gap-4">
                      <label className="w-20 flex-shrink-0 text-slate-600 dark:text-slate-400">Reps</label>
                      <input
                        type="number"
                        value={currentSet.reps}
                        className="flex-1 min-w-0 text-2xl font-bold text-center py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        readOnly
                      />
                    </div>

                    {/* Rest Timer */}
                    <div className="flex items-center gap-4">
                      <label className="w-20 text-slate-600 dark:text-slate-400">Rest</label>
                      <div className="flex-1 flex items-center justify-center gap-4">
                        <button className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg">-</button>
                        <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {currentSet.restSeconds}s
                        </span>
                        <button className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg">+</button>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-lg shadow-button-primary">
                      ✓ Log Set & Start Rest Timer
                    </button>
                  </div>
                </div>

                {/* Remaining Sets Preview */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    REMAINING
                  </h4>
                  <div className="bg-slate-50 dark:bg-brand-dark p-3 rounded-lg border border-slate-200 dark:border-brand-muted opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Set 3</span>
                      <span className="text-slate-600 dark:text-slate-400">45 lbs × 12 reps</span>
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 text-brand-primary hover:text-brand-primary/80 border border-dashed border-brand-primary/50 rounded-lg">
                  + Add Another Set
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Option B: Accordion In-Place */}
        {selectedOption === 'B' && (
          <div className="bg-white dark:bg-brand-surface rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
            <div className="p-4 border-b border-slate-200 dark:border-brand-muted bg-slate-100 dark:bg-brand-dark">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Option B: Accordion In-Place
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Timer: 05:22
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Completed Exercise - Collapsed */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Pull-up</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    3/3 complete
                  </span>
                </div>
              </div>

              {/* Active Exercise - Expanded */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500 text-xl">▼</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Dumbbell Row</span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    1/3 complete
                  </span>
                </div>

                <div className="px-4 pb-4 space-y-4">
                  <div className="bg-white dark:bg-brand-dark rounded-lg p-4 space-y-4">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Set 2
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Weight</label>
                        <input
                          type="number"
                          value={currentSet.weight}
                          className="w-full text-xl font-bold text-center py-2 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-surface text-slate-900 dark:text-slate-100"
                          readOnly
                        />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 mt-5">×</span>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Reps</label>
                        <input
                          type="number"
                          value={currentSet.reps}
                          className="w-full text-xl font-bold text-center py-2 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-surface text-slate-900 dark:text-slate-100"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Rest Timer</span>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-slate-200 dark:bg-brand-muted rounded">-</button>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{currentSet.restSeconds}s</span>
                        <button className="px-3 py-1 bg-slate-200 dark:bg-brand-muted rounded">+</button>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg">
                      ✓ Log Set
                    </button>
                  </div>

                  <button className="w-full py-2 text-sm text-brand-primary hover:text-brand-primary/80">
                    + Add Another Set
                  </button>
                </div>
              </div>

              {/* Pending Exercise - Collapsed */}
              <div className="bg-slate-50 dark:bg-brand-dark border border-slate-200 dark:border-brand-muted rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-brand-muted cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xl">▷</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Lat Pulldown</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    0/3
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg">
                Finish Workout
              </button>
            </div>
          </div>
        )}

        {/* Option C: List + Modal (FitBod Style) */}
        {selectedOption === 'C' && (
          <div className="relative max-w-2xl mx-auto">
            {/* Main List */}
            <div className="bg-white dark:bg-brand-surface rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-brand-muted bg-slate-100 dark:bg-brand-dark">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Option C: List + Modal (FitBod Style)
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Timer: 05:22
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {exercises.map((ex, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      ex.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-slate-50 dark:bg-brand-dark border border-slate-200 dark:border-brand-muted hover:bg-slate-100 dark:hover:bg-brand-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {ex.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {ex.completed
                            ? `${ex.totalSets}/${ex.totalSets} logged`
                            : `${ex.totalSets} sets • 12 reps • 45 lb`}
                        </div>
                      </div>
                      {ex.completed && (
                        <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}

                <button className="w-full py-2 text-brand-primary hover:text-brand-primary/80 border border-dashed border-brand-primary/50 rounded-lg">
                  + Add Exercise
                </button>

                <button className="w-full mt-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg">
                  Finish Workout
                </button>
              </div>
            </div>

            {/* Modal Overlay (showing what appears when you click) */}
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-end">
              <div className="w-full bg-white dark:bg-brand-surface rounded-t-2xl p-6">
                <div className="w-12 h-1 bg-slate-300 dark:bg-brand-muted rounded-full mx-auto mb-4" />

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Dumbbell Row
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Set 2 of 3
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={currentSet.weight}
                        className="w-full text-3xl font-bold text-center py-3 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        readOnly
                      />
                      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1">lbs</div>
                    </div>
                    <span className="text-2xl text-slate-400">×</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={currentSet.reps}
                        className="w-full text-3xl font-bold text-center py-3 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        readOnly
                      />
                      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1">reps</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg">-</button>
                    <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Rest: {currentSet.restSeconds}s
                    </span>
                    <button className="px-4 py-2 bg-slate-200 dark:bg-brand-muted rounded-lg">+</button>
                  </div>
                </div>

                <button className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-lg rounded-lg">
                  ✓ Log Set
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-8 bg-white dark:bg-brand-surface rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {selectedOption === 'A' && 'Option A: Split Panel'}
            {selectedOption === 'B' && 'Option B: Accordion In-Place'}
            {selectedOption === 'C' && 'Option C: List + Modal'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {selectedOption === 'A' && 'Desktop-optimized two-column layout. Exercise list on left stays visible while logging sets on the right. Clicking an exercise loads it into the right panel. Clear visual separation between navigation and active logging.'}
            {selectedOption === 'B' && 'Single-column accordion layout. Completed exercises collapse with green checkmark. Active exercise expands to show set logger inline. Clicking a new exercise collapses current and expands new one. More compact, mobile-friendly feel.'}
            {selectedOption === 'C' && 'FitBod-inspired pattern. Main list shows all exercises with status. Tapping exercise opens a bottom sheet/modal for set logging. After logging, modal closes and list updates. Familiar mobile pattern but works on desktop too.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutMockups;
