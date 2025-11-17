# Exercise Category Grid Implementation Plan

**Feature:** Replace exercise library tabs with 2x2 category button grid (Push/Pull/Legs/Core) with collapsible exercise panels and pagination.

**Date:** 2025-01-17

---

## Task 1: Add Category Type and State Variables

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Replace TabType with CategoryType and add pagination state.

**Code to add after line 6:**
```typescript
type CategoryType = 'Push' | 'Pull' | 'Legs' | 'Core' | null;
const EXERCISES_PER_PAGE = 5;
```

**Code to replace lines 15-16:**
```typescript
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [currentPage, setCurrentPage] = useState(0);
```

**Delete line 8:** Remove the old `TabType` definition.

**Verification:** TypeScript compiles without errors.

---

## Task 2: Create Category Classification Helper

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Add helper function to get exercises by movement pattern category.

**Code to add after line 20 (after state declarations):**
```typescript
  // Get exercises filtered by category and search
  const getExercisesByCategory = (category: CategoryType) => {
    if (!category) return [];

    let exercises = EXERCISE_LIBRARY.filter(ex => ex.category === category);

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return exercises;
  };

  // Get paginated exercises for selected category
  const getPaginatedExercises = () => {
    const allExercises = getExercisesByCategory(selectedCategory);
    const startIndex = currentPage * EXERCISES_PER_PAGE;
    const endIndex = startIndex + EXERCISES_PER_PAGE;
    return {
      exercises: allExercises.slice(startIndex, endIndex),
      totalCount: allExercises.length,
      totalPages: Math.ceil(allExercises.length / EXERCISES_PER_PAGE),
      hasMore: endIndex < allExercises.length,
    };
  };

  // Global search across all categories
  const getGlobalSearchResults = () => {
    if (!searchTerm.trim()) return [];
    return EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
```

**Verification:** No TypeScript errors. Functions are pure and deterministic.

---

## Task 3: Update Category Selection Handler

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Add handler for category button clicks that resets pagination.

**Code to add after getPaginatedExercises function:**
```typescript
  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setCurrentPage(0); // Reset to first page when changing category
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
```

**Verification:** Functions compile without errors.

---

## Task 4: Remove Old Filtering Logic

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Remove the old getFilteredExercises function and filteredExercises variable.

**Delete lines 21-50:** The entire `getFilteredExercises` function.

**Delete line 116:** The `const filteredExercises = getFilteredExercises();` line.

**Verification:** File compiles (will have rendering errors until Task 5).

---

## Task 5: Replace Tab Buttons with Category Grid

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Replace the 3-tab layout with a 2x2 category button grid.

**Replace lines 151-183 (the entire Tabs section) with:**
```typescript
          {/* Category Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {(['Push', 'Pull', 'Legs', 'Core'] as CategoryType[]).map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
```

**Verification:** Grid renders with 4 buttons. Clicking highlights the selected button.

---

## Task 6: Replace Exercise List with Conditional Panel

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Replace the old exercise list rendering with category-based or search-based display.

**Replace lines 185-223 (the entire Exercise List section) with:**
```typescript
          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto px-4">
            {searchTerm.trim() ? (
              // Global search results
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Search results ({getGlobalSearchResults().length})
                </div>
                <div className="space-y-1">
                  {getGlobalSearchResults().slice(0, 20).map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id, ex.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                    >
                      <div>
                        <span>{ex.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          ({ex.category})
                        </span>
                      </div>
                      <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedCategory ? (
              // Category exercises with pagination
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {selectedCategory} exercises ({getPaginatedExercises().totalCount})
                </div>
                <div className="space-y-1">
                  {getPaginatedExercises().exercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id, ex.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                    >
                      <span>{ex.name}</span>
                      <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                    </button>
                  ))}
                </div>
                {/* Pagination Controls */}
                {getPaginatedExercises().totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pb-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-brand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {currentPage + 1} of {getPaginatedExercises().totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!getPaginatedExercises().hasMore}
                      className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-brand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // No category selected
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="text-sm">Select a category to browse exercises</p>
              </div>
            )}
          </div>
```

**Verification:**
- With no category selected: Shows "Select a category to browse exercises"
- With category selected: Shows paginated exercises with page controls
- With search term: Shows global search results with category labels

---

## Task 7: Reset Pagination on Search Change

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Reset pagination when search term changes.

**Replace the search input onChange handler (around line 145):**
```typescript
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0); // Reset pagination on search
              }}
```

**Verification:** Typing in search resets to page 1. Clearing search returns to category view.

---

## Task 8: Verify All Categories Have Exercises

**File:** None (verification only)

**What:** Check that the exercise library has exercises for all 4 categories.

**Verification steps:**
1. Open browser to http://localhost:3000/workout/builder
2. Click "Push" → Should show exercises like "Dumbbell Bench Press", "Push-up"
3. Click "Pull" → Should show exercises like "Pull-up", "Dumbbell Row"
4. Click "Legs" → Should show exercises (need to verify these exist)
5. Click "Core" → Should show exercises (need to verify these exist)

If any category is empty, we may need to add exercises or adjust the category field in the library.

---

## Task 9: Test Complete User Flow

**What:** End-to-end testing of the new UI.

**Test scenarios:**
1. Load page → No category selected, grid shows 4 buttons
2. Click "Push" → Shows 5 exercises, pagination controls appear
3. Click next page → Shows next 5 exercises
4. Click "Pull" → Resets to page 1, shows Pull exercises
5. Type in search → Shows global results with category labels
6. Clear search → Returns to category view
7. Add exercise → Appears in right panel
8. Save workout → Works as before

**Verification:** All scenarios pass without errors.

---

## Summary

**Files modified:** 1 (`components/workout-builder/WorkoutBuilderPage.tsx`)

**Key changes:**
- Removed old tab-based filtering (All/ByMuscle/Categories)
- Added 2x2 category button grid (Push/Pull/Legs/Core)
- Default state: No category selected
- Pagination: 5 exercises per page with next/prev controls
- Global search overrides category selection
- Search results show category labels

**Estimated time:** 30-45 minutes total
