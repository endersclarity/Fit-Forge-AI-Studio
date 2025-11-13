import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from 'vaul';
import { Exercise } from '../data/mockData';

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Full Body'];

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onClose();
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="flex flex-col h-full">
            {/* Drag Handle */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex-shrink-0">
              <Drawer.Title className="font-bold text-3xl text-gray-900 mb-4">
                Add Exercise
              </Drawer.Title>

              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-gray-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors text-base"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory(category);
                      if ('vibrate' in navigator) navigator.vibrate(10);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <AnimatePresence mode="wait">
                {filteredExercises.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-center">
                      No exercises found.<br />
                      <span className="text-sm">Try a different search or category.</span>
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredExercises.map((exercise, index) => (
                      <motion.button
                        key={exercise.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{
                          delay: index * 0.02,
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(exercise)}
                        className="w-full p-4 bg-white hover:bg-gray-50 rounded-xl text-left border-2 border-gray-100 hover:border-blue-300 transition-all group"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {exercise.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {exercise.equipment}
                              </span>
                              {exercise.muscleGroups.slice(0, 2).map((muscle, idx) => (
                                <span key={idx} className="text-xs text-gray-500">
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default ExercisePicker;
