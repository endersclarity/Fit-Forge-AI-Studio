import React, { useState } from 'react';

const WorkoutBuilderMockups: React.FC = () => {
  const [activeScreenA, setActiveScreenA] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
        Workout Builder - Approach Comparison
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Approach A: Multi-Page Flow */}
        <div className="space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Approach A: Multi-Page Flow
            </h2>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Sequential screens with clear progression
            </p>
          </div>

          {/* Screen Navigation */}
          <div className="flex gap-2">
            {[1, 2, 3].map((screen) => (
              <button
                key={screen}
                onClick={() => setActiveScreenA(screen)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeScreenA === screen
                    ? 'bg-brand-purple text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Screen {screen}
              </button>
            ))}
          </div>

          {/* Screen Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Screen 1: Exercise Picker */}
            {activeScreenA === 1 && (
              <div className="p-4 space-y-4">
                <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Screen 1: Select Exercises
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    className="w-full px-4 py-2 pl-10 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500"
                    readOnly
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <div className="flex-1 py-1.5 text-center text-xs font-medium bg-white dark:bg-slate-600 rounded text-slate-900 dark:text-white shadow-sm">
                    All
                  </div>
                  <div className="flex-1 py-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    By Muscle
                  </div>
                  <div className="flex-1 py-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    Categories
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-2">
                  {['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Shoulder Press'].map((exercise, idx) => (
                    <label key={exercise} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        defaultChecked={idx < 2}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-purple focus:ring-brand-purple"
                      />
                      <span className="text-sm text-slate-900 dark:text-white">{exercise}</span>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button className="w-full py-2.5 bg-brand-purple text-white rounded-lg text-sm font-medium">
                    Next: Review Selection (2)
                  </button>
                </div>
              </div>
            )}

            {/* Screen 2: Review List */}
            {activeScreenA === 2 && (
              <div className="p-4 space-y-4">
                <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Screen 2: Configure Exercises
                </div>

                {/* Selected Exercises with Drag Handles */}
                <div className="space-y-3">
                  {['Bench Press', 'Squat'].map((exercise) => (
                    <div key={exercise} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex flex-col gap-0.5 cursor-move">
                          <div className="w-4 h-0.5 bg-slate-400 rounded"></div>
                          <div className="w-4 h-0.5 bg-slate-400 rounded"></div>
                          <div className="w-4 h-0.5 bg-slate-400 rounded"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{exercise}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">Sets</label>
                          <input
                            type="number"
                            defaultValue={3}
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-600 rounded border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">Reps</label>
                          <input
                            type="number"
                            defaultValue={10}
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-600 rounded border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">Weight</label>
                          <input
                            type="number"
                            placeholder="lbs"
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-600 rounded border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <button className="w-full py-2.5 bg-brand-purple text-white rounded-lg text-sm font-medium">
                    Next: Save & Start
                  </button>
                  <button className="w-full py-2 text-slate-600 dark:text-slate-400 text-sm">
                    Back to Selection
                  </button>
                </div>
              </div>
            )}

            {/* Screen 3: Save & Start */}
            {activeScreenA === 3 && (
              <div className="p-4 space-y-4">
                <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Screen 3: Save & Start
                </div>

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Selected Exercises:</div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-900 dark:text-white">1. Bench Press - 3x10</div>
                    <div className="text-sm text-slate-900 dark:text-white">2. Squat - 3x10</div>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Upper Body Day"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    Start Workout
                  </button>
                  <button className="w-full py-2.5 bg-brand-purple text-white rounded-lg text-sm font-medium">
                    Save as Template
                  </button>
                  <button className="w-full py-2 text-slate-600 dark:text-slate-400 text-sm">
                    Back to Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approach B: Modal-Based Builder */}
        <div className="space-y-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
            <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-1">
              Approach B: Modal-Based Builder
            </h2>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Overlay wizard with step indicator
            </p>
          </div>

          {/* Background with Modal */}
          <div className="relative bg-slate-200 dark:bg-slate-900 rounded-xl h-[500px] overflow-hidden">
            {/* Semi-transparent Background */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Main Content (dimmed) */}
            <div className="absolute inset-0 p-4 opacity-30">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 h-full">
                <div className="text-sm text-slate-500">Dashboard content behind modal...</div>
              </div>
            </div>

            {/* Modal */}
            <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Workout</h3>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-brand-purple text-white text-xs flex items-center justify-center font-medium">1</div>
                    <span className="text-xs font-medium text-brand-purple">Select</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs flex items-center justify-center font-medium">2</div>
                    <span className="text-xs text-slate-500">Configure</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs flex items-center justify-center font-medium">3</div>
                    <span className="text-xs text-slate-500">Save</span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Shoulder Press', 'Barbell Row'].map((exercise, idx) => (
                    <label key={exercise} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        defaultChecked={idx < 3}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-purple focus:ring-brand-purple"
                      />
                      <span className="text-sm text-slate-900 dark:text-white">{exercise}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-brand-purple text-white rounded-lg text-sm font-medium">
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Approach C: Hybrid Full Page */}
        <div className="space-y-4">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-1">
              Approach C: Hybrid Full Page
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400">
              Split-screen with live preview
            </p>
          </div>

          {/* Full Page Layout */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Workout Builder</h3>
            </div>

            {/* Split Screen */}
            <div className="flex divide-x divide-slate-200 dark:divide-slate-700 h-[380px]">
              {/* Left Panel: Exercise Picker */}
              <div className="w-1/2 flex flex-col">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Exercise Library
                  </div>

                  {/* Search */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-3 py-1.5 pl-8 bg-white dark:bg-slate-700 rounded text-xs text-slate-900 dark:text-white placeholder-slate-500"
                      readOnly
                    />
                    <svg className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1">
                    <div className="px-2 py-1 text-xs font-medium bg-brand-purple text-white rounded">All</div>
                    <div className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">Muscle</div>
                    <div className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">Category</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Shoulder Press', 'Barbell Row', 'Lunges'].map((exercise) => (
                    <button
                      key={exercise}
                      className="w-full text-left p-2 text-xs bg-slate-50 dark:bg-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white flex justify-between items-center"
                    >
                      {exercise}
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Panel: Selected Exercises */}
              <div className="w-1/2 flex flex-col bg-slate-50 dark:bg-slate-900/30">
                <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Your Workout (3 exercises)
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {['Bench Press', 'Squat', 'Pull-ups'].map((exercise, idx) => (
                    <div key={exercise} className="bg-white dark:bg-slate-800 rounded p-2 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex flex-col gap-0.5 cursor-move">
                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-900 dark:text-white flex-1">{exercise}</span>
                        <button className="text-red-400 hover:text-red-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <input
                          type="number"
                          defaultValue={3}
                          placeholder="Sets"
                          className="px-1.5 py-1 text-xs bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          defaultValue={10}
                          placeholder="Reps"
                          className="px-1.5 py-1 text-xs bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="lbs"
                          className="px-1.5 py-1 text-xs bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex gap-2">
              <input
                type="text"
                placeholder="Workout name..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
              />
              <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                Save Template
              </button>
              <button className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-medium">
                Start Workout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Notes */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Approach Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Multi-Page Flow</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>+ Clear linear progression</li>
              <li>+ Less cognitive load per screen</li>
              <li>+ Better for mobile</li>
              <li>- More navigation clicks</li>
              <li>- Can't see full picture at once</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Modal-Based Builder</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>+ Maintains context</li>
              <li>+ Focused experience</li>
              <li>+ Easy to cancel</li>
              <li>- Limited screen space</li>
              <li>- Can feel constrained</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Hybrid Full Page</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>+ All info visible at once</li>
              <li>+ Immediate feedback</li>
              <li>+ Power user friendly</li>
              <li>- Higher initial complexity</li>
              <li>- Needs larger screen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilderMockups;
