import React, { useState } from 'react';

const WorkoutHistoryMockups: React.FC = () => {
  const [selectedMockup, setSelectedMockup] = useState<'list' | 'cards' | 'table'>('list');
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);

  // Sample workout data
  const sampleWorkouts = [
    {
      id: 1,
      date: '2025-01-17',
      relativeDate: 'Today',
      type: 'Push',
      variation: 'A',
      duration: '45m',
      exercises: [
        { name: 'Dumbbell Bench Press', sets: [{ weight: 135, reps: 10 }, { weight: 135, reps: 8 }] },
        { name: 'Shoulder Press', sets: [{ weight: 95, reps: 12 }] }
      ],
      totalVolume: 3405,
      hasPR: true
    },
    {
      id: 2,
      date: '2025-01-15',
      relativeDate: '2 days ago',
      type: 'Pull',
      variation: 'B',
      duration: '52m',
      exercises: [
        { name: 'Pull-up', sets: [{ weight: 0, reps: 12 }, { weight: 0, reps: 10 }] },
        { name: 'Dumbbell Row', sets: [{ weight: 85, reps: 10 }] }
      ],
      totalVolume: 2850,
      hasPR: false
    },
    {
      id: 3,
      date: '2025-01-13',
      relativeDate: '4 days ago',
      type: 'Legs',
      variation: 'A',
      duration: '58m',
      exercises: [
        { name: 'Squat', sets: [{ weight: 225, reps: 8 }, { weight: 225, reps: 6 }] },
        { name: 'Leg Press', sets: [{ weight: 315, reps: 12 }] }
      ],
      totalVolume: 6930,
      hasPR: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-brand-surface rounded-lg p-6 border border-slate-200 dark:border-brand-muted">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Workout History - Layout Mockups
          </h1>

          {/* Mockup Selector */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelectedMockup('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMockup === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              Option A: List View
            </button>
            <button
              onClick={() => setSelectedMockup('cards')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMockup === 'cards'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              Option B: Cards/Grid
            </button>
            <button
              onClick={() => setSelectedMockup('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMockup === 'table'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              Option C: Table View
            </button>
          </div>
        </div>

        {/* Mockup Display */}
        <div className="bg-white dark:bg-brand-surface rounded-lg border border-slate-200 dark:border-brand-muted overflow-hidden">
          {/* Page Header with Filters */}
          <div className="p-6 border-b border-slate-200 dark:border-brand-muted">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Workout History
              </h2>
              <button className="text-primary dark:text-primary-light hover:underline">
                ← Back to Dashboard
              </button>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Search by exercise name..."
                className="flex-1 min-w-[250px] px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
              />
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100">
                <option>All Types</option>
                <option>Push</option>
                <option>Pull</option>
                <option>Legs</option>
                <option>Core</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100">
                <option>Most Recent</option>
                <option>Oldest First</option>
                <option>Longest Duration</option>
                <option>Shortest Duration</option>
                <option>Highest Volume</option>
                <option>Lowest Volume</option>
              </select>
            </div>
          </div>

          {/* OPTION A: List View */}
          {selectedMockup === 'list' && (
            <div className="divide-y divide-slate-200 dark:divide-brand-muted">
              {sampleWorkouts.map((workout) => (
                <div key={workout.id} className="hover:bg-slate-50 dark:hover:bg-brand-muted/30">
                  {/* Collapsed Row */}
                  <div
                    onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                    className="p-4 cursor-pointer flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-24 text-sm text-slate-500 dark:text-slate-400">
                      {workout.relativeDate}
                    </div>
                    <div className="flex-1 font-medium text-slate-900 dark:text-slate-100">
                      {workout.type} Day {workout.variation}
                    </div>
                    <div className="flex-shrink-0 w-20 text-sm text-slate-500 dark:text-slate-400">
                      {workout.duration}
                    </div>
                    <div className="flex-shrink-0 w-32 text-sm text-slate-500 dark:text-slate-400">
                      {workout.totalVolume.toLocaleString()} lbs
                    </div>
                    {workout.hasPR && (
                      <div className="flex-shrink-0 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                        🎉 PR
                      </div>
                    )}
                    <div className="flex-shrink-0 flex gap-2">
                      <button className="text-red-500 hover:text-red-600 text-sm">Delete</button>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedWorkout === workout.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedWorkout === workout.id && (
                    <div className="px-4 pb-4 bg-slate-50 dark:bg-brand-dark/50">
                      <div className="space-y-3 pt-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-brand-muted">
                            <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                              {exercise.name}
                            </div>
                            <div className="space-y-1">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <span className="text-slate-400 dark:text-slate-500 w-6">#{setIdx + 1}</span>
                                  <span className="text-slate-900 dark:text-slate-100">
                                    {set.weight === 0 ? 'BW' : `${set.weight} lbs`}
                                  </span>
                                  <span>×</span>
                                  <span className="text-slate-900 dark:text-slate-100">{set.reps} reps</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* OPTION B: Cards/Grid View */}
          {selectedMockup === 'cards' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-white dark:bg-brand-dark rounded-lg border border-slate-200 dark:border-brand-muted overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{workout.relativeDate}</span>
                      {workout.hasPR && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                          🎉 PR
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {workout.type} Day {workout.variation}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{workout.duration}</span>
                      <span>•</span>
                      <span>{workout.totalVolume.toLocaleString()} lbs</span>
                    </div>
                  </div>

                  {/* Expanded Card Content */}
                  {expandedWorkout === workout.id && (
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-brand-muted">
                      <div className="space-y-2 mt-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                              {exercise.name}
                            </div>
                            <div className="space-y-1 ml-2">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="text-slate-600 dark:text-slate-400">
                                  Set {setIdx + 1}: {set.weight === 0 ? 'BW' : `${set.weight} lbs`} × {set.reps} reps
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="mt-3 w-full text-red-500 hover:text-red-600 text-sm py-2 border-t border-slate-200 dark:border-brand-muted">
                        Delete Workout
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* OPTION C: Table View */}
          {selectedMockup === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-brand-muted/50 border-b border-slate-200 dark:border-brand-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-brand-muted">
                      Date ↓
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-brand-muted">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-brand-muted">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-brand-muted">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Exercises
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-brand-muted">
                  {sampleWorkouts.map((workout) => (
                    <React.Fragment key={workout.id}>
                      {/* Table Row */}
                      <tr
                        onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                        className="hover:bg-slate-50 dark:hover:bg-brand-muted/30 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                          {workout.relativeDate}
                          {workout.hasPR && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                              PR
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                          {workout.type} {workout.variation}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {workout.duration}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {workout.totalVolume.toLocaleString()} lbs
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {workout.exercises.length} exercises
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Delete workout');
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedWorkout === workout.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-slate-50 dark:bg-brand-dark/50">
                            <div className="space-y-2">
                              {workout.exercises.map((exercise, idx) => (
                                <div key={idx} className="bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-brand-muted">
                                  <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    {exercise.name}
                                  </div>
                                  <div className="flex gap-4 flex-wrap">
                                    {exercise.sets.map((set, setIdx) => (
                                      <div key={setIdx} className="text-sm text-slate-600 dark:text-slate-400">
                                        Set {setIdx + 1}: {set.weight === 0 ? 'BW' : `${set.weight} lbs`} × {set.reps}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistoryMockups;
