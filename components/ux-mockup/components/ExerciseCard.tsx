import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InlineNumberPicker from './InlineNumberPicker';
import { WorkoutExercise, Set } from '../data/mockData';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: string, field: 'reps' | 'weight' | 'completed' | 'toFailure', value: number | boolean) => void;
  onLogSet: (setId: string) => void;
  showLogAllButton?: boolean;
  onLogAll?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onUpdateSet,
  onLogSet,
  showLogAllButton,
  onLogAll,
}) => {
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mb-4"
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Exercise Header */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{exercise.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                  {exercise.equipment}
                </span>
                {exercise.muscleGroups.map((muscle, idx) => (
                  <span key={idx} className="text-xs text-gray-500">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{completedSets}/{totalSets}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Sets</div>
            </div>
          </div>
        </div>

        {/* Sets */}
        <div className="p-4 space-y-3">
          {exercise.sets.map((set, index) => (
            <div key={set.id}>
              <motion.div
                layout
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  set.completed
                    ? 'border-green-500 bg-green-50'
                    : expandedSetId === set.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Set Summary */}
                <motion.button
                  onClick={() => setExpandedSetId(expandedSetId === set.id ? null : set.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                  whileTap={{ scale: 0.98 }}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Set Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      set.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {set.completed ? '✓' : index + 1}
                    </div>

                    {/* Weight × Reps */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{set.weight}</span>
                      <span className="text-sm text-gray-500">lbs</span>
                      <span className="text-gray-400 mx-1">×</span>
                      <span className="text-2xl font-bold text-gray-900">{set.reps}</span>
                      <span className="text-sm text-gray-500">reps</span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: expandedSetId === set.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.button>

                {/* Expanded Set Editor */}
                <AnimatePresence>
                  {expandedSetId === set.id && !set.completed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-6">
                        {/* Weight Picker */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Weight
                          </label>
                          <InlineNumberPicker
                            value={set.weight}
                            onChange={(val) => onUpdateSet(set.id, 'weight', val)}
                            min={0}
                            max={500}
                            step={5}
                            unit="lbs"
                          />
                        </div>

                        {/* Reps Picker */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Reps
                          </label>
                          <InlineNumberPicker
                            value={set.reps}
                            onChange={(val) => onUpdateSet(set.id, 'reps', val)}
                            min={1}
                            max={50}
                            step={1}
                            unit="reps"
                          />
                        </div>

                        {/* To Failure Toggle */}
                        <div className="flex items-center justify-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onUpdateSet(set.id, 'toFailure', !set.toFailure)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              set.toFailure
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              set.toFailure ? 'border-orange-500 bg-orange-500' : 'border-gray-400'
                            }`}>
                              {set.toFailure && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-semibold">To Failure</span>
                          </motion.button>
                        </div>

                        {/* Log Set Button */}
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onLogSet(set.id)}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-colors"
                          style={{
                            WebkitTapHighlightColor: 'transparent',
                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
                          }}
                        >
                          Log Set
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}

          {/* Log All Remaining Sets Button */}
          {showLogAllButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
            >
              <p className="text-sm text-blue-900 mb-2 text-center">
                Same weight/reps for remaining sets?
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onLogAll}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Log All Remaining Sets
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseCard;
