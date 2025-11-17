import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../../constants';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';

const ExercisePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectExercise, startSession, session } = useWorkoutSession();
  const [searchTerm, setSearchTerm] = useState('');

  // Start session on first render if not already started
  React.useEffect(() => {
    if (!session.startTime) {
      startSession();
    }
  }, [session.startTime, startSession]);

  const filteredExercises = EXERCISE_LIBRARY.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercise = (id: string, name: string) => {
    selectExercise(id, name);
    navigate('/workout/log');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Select Exercise
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
        </div>

        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none"
        />

        <div className="space-y-2">
          {filteredExercises.slice(0, 20).map(exercise => (
            <button
              key={exercise.id}
              onClick={() => handleSelectExercise(exercise.id, exercise.name)}
              className="w-full text-left px-4 py-4 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  {exercise.name}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {exercise.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExercisePickerPage;
