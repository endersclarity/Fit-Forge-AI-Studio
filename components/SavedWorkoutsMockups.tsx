import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X, Edit2, Play, Trash2, ArrowLeft } from 'lucide-react';

interface WorkoutTemplate {
  id: string;
  name: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Core';
  variation: string;
  exerciseIds: string[];
  exercises: string[];
  timesUsed: number;
}

const mockTemplates: WorkoutTemplate[] = [
  { id: '1', name: 'Push Day A', category: 'Push', variation: 'A', exerciseIds: ['bench-press', 'shoulder-press', 'tricep-dips'], exercises: ['Dumbbell Bench Press', 'Dumbbell Shoulder Press', 'Tricep Dips'], timesUsed: 12 },
  { id: '2', name: 'Pull Day A', category: 'Pull', variation: 'A', exerciseIds: ['pull-up', 'barbell-row', 'bicep-curl'], exercises: ['Pull-up', 'Barbell Row', 'Dumbbell Bicep Curl'], timesUsed: 10 },
  { id: '3', name: 'Leg Day B', category: 'Legs', variation: 'B', exerciseIds: ['squat', 'lunge', 'calf-raise'], exercises: ['Kettlebell Goblet Squat', 'Dumbbell Lunge', 'Calf Raise'], timesUsed: 8 },
  { id: '4', name: 'Core Blast', category: 'Core', variation: 'A', exerciseIds: ['plank', 'crunch', 'leg-raise'], exercises: ['Plank', 'Ab Crunch', 'Hanging Leg Raise'], timesUsed: 5 },
];

type ViewMode = 'full-page' | 'modal';
type CategoryFilter = 'All' | 'Push' | 'Pull' | 'Legs' | 'Core';

const SavedWorkoutsMockups: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('full-page');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter templates based on search and category
  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.exercises.some((exercise) =>
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    ) || template.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderTemplateCard = (template: WorkoutTemplate) => {
    const isExpanded = expandedId === template.id;
    const previewExercises = template.exercises.slice(0, 3).join(', ') + (template.exercises.length > 3 ? '...' : '');

    return (
      <div
        key={template.id}
        className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-4 transition-all hover:shadow-md"
      >
        <div
          className="cursor-pointer"
          onClick={() => toggleExpanded(template.id)}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span className="font-medium">{template.category}</span>
            <span>•</span>
            <span>Variation {template.variation}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span>{template.exercises.length} exercises</span>
            <span>•</span>
            <span>Used {template.timesUsed} times</span>
          </div>

          {!isExpanded && (
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              {previewExercises}
            </p>
          )}

          <div className="flex items-center justify-between">
            <button className="text-sm text-primary hover:text-primary-dark dark:text-accent dark:hover:text-accent-light flex items-center gap-1">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show more</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-muted">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Exercises:
            </h4>
            <ul className="space-y-2 mb-4">
              {template.exercises.map((exercise, index) => (
                <li
                  key={index}
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <span className="text-slate-400 dark:text-slate-500 font-medium min-w-[20px]">
                    {index + 1}.
                  </span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Edit template: ${template.name}`);
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Begin workout: ${template.name}`);
                }}
              >
                <Play className="w-4 h-4" />
                Begin Workout
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete template "${template.name}"?`)) {
                    alert(`Deleted: ${template.name}`);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by exercise name or template name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Category:
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="px-4 py-2 bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
        >
          <option value="All">All Categories</option>
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
          <option value="Core">Core</option>
        </select>
      </div>
    </div>
  );

  const renderFullPageView = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            className="flex items-center gap-2 text-primary hover:text-primary-dark dark:text-accent dark:hover:text-accent-light mb-4 transition-colors"
            onClick={() => alert('Navigate back to Dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Saved Workouts
          </h1>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(renderTemplateCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              No templates found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModalView = () => (
    <>
      {/* Trigger Button */}
      {!showModal && (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            Open Saved Workouts Modal
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal Container */}
          <div className="bg-slate-50 dark:bg-brand-dark rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-brand-muted">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Saved Workouts
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-brand-surface rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Filters */}
              {renderFilters()}

              {/* Templates Grid */}
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(renderTemplateCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-400">
                    No templates found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div>
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-2 shadow-lg">
        <button
          onClick={() => {
            setViewMode('full-page');
            setShowModal(false);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'full-page'
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-muted'
          }`}
        >
          Full Page
        </button>
        <button
          onClick={() => {
            setViewMode('modal');
            setShowModal(false);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'modal'
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-muted'
          }`}
        >
          Modal
        </button>
      </div>

      {/* Render Selected View */}
      {viewMode === 'full-page' ? renderFullPageView() : renderModalView()}
    </div>
  );
};

export default SavedWorkoutsMockups;
