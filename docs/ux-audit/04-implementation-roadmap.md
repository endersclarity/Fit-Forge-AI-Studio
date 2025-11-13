# FitForge UX Implementation Roadmap

**Created:** 2025-11-12
**Based on:** Gap Analysis (Phase 3)
**Total Stories:** 15 user stories across 3 sprints

---

## Sprint 1: Critical Fixes (Week 1)

**Goal:** Fix P0 issues - accessibility and major UX blockers
**Duration:** 5 days
**Stories:** 4

### Story 1.1: Enlarge Touch Targets to WCAG Minimum

**As a** FitForge user with motor difficulties or large fingers
**I want** all interactive elements to be at least 44×44px
**So that** I can accurately tap controls in the gym environment

**Acceptance Criteria:**
- [ ] To-failure checkbox enlarged from 20×20px to 44×44px
- [ ] All buttons minimum 44×44px (audit completed)
- [ ] Add text label "To Failure" next to checkbox for clarity
- [ ] Adequate spacing (8px min) between adjacent tappable elements
- [ ] Mobile device testing confirms improved tap accuracy

**Implementation Details:**
```tsx
// Workout.tsx lines 798-810 - BEFORE
<button className="w-5 h-5"> {/* 20×20px - TOO SMALL */}
  <div className="w-5 h-5">
    {toFailure && <CheckIcon />}
  </div>
</button>

// AFTER
<button className="w-11 h-11 flex items-center gap-2"> {/* 44×44px */}
  <div className="w-6 h-6 rounded border-2 flex items-center justify-center">
    {toFailure && <CheckIcon className="w-4 h-4" />}
  </div>
  <span className="text-sm text-gray-400">To Failure</span>
</button>
```

**Files:**
- Modify: `components/Workout.tsx:798-810`
- Modify: All button components (audit list needed)
- Test: Manual mobile device testing

**Effort:** 4 hours
**Priority:** P0 (Critical)
**Dependencies:** None

---

### Story 1.2: Add Equipment Filtering to Quick Add

**As a** FitForge user
**I want** the exercise picker to only show exercises I have equipment for
**So that** I don't waste time selecting exercises I can't perform

**Acceptance Criteria:**
- [ ] ExercisePicker accepts `userEquipment` prop
- [ ] Filters exercise list to only show available equipment
- [ ] "Show All Exercises" toggle to bypass filter
- [ ] Badge on picker shows active filter count
- [ ] Bodyweight exercises always shown (no equipment required)

**Implementation Details:**
```tsx
// ExercisePicker.tsx - Add filtering
interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  category?: Category;
  userEquipment?: EquipmentItem[]; // NEW
}

const filteredExercises = useMemo(() => {
  if (!userEquipment?.length) return exercises;

  return exercises.filter(ex => {
    // Always show bodyweight
    if (ex.equipment === 'Bodyweight') return true;

    // Check if user has required equipment
    const requiredEquipment = Array.isArray(ex.equipment)
      ? ex.equipment
      : [ex.equipment];

    return requiredEquipment.some(reqEq =>
      userEquipment.some(userEq => userEq.type === reqEq)
    );
  });
}, [exercises, userEquipment]);
```

**Files:**
- Modify: `components/ExercisePicker.tsx` (add filtering logic)
- Modify: `components/QuickAdd.tsx` (pass equipment prop)
- Test: Verify with various equipment configurations

**Effort:** 2 hours
**Priority:** P0 (Critical)
**Dependencies:** None

---

### Story 1.3: Standardize Modal Dismiss Methods

**As a** FitForge user
**I want** consistent ways to close modals (backdrop, X, ESC, swipe)
**So that** I never feel stuck in a modal

**Acceptance Criteria:**
- [ ] Create reusable `Modal` wrapper component
- [ ] All modals support: backdrop click, X button, ESC key
- [ ] Bottom sheet variant supports: swipe down gesture
- [ ] Focus returns to trigger element on close
- [ ] Keyboard trap prevents tabbing outside modal
- [ ] 11 existing modals refactored to use wrapper

**Implementation Details:**
```tsx
// Create: components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'full-screen' | 'bottom-sheet';
  height?: '40%' | '60%' | '80%';
  preventBackdropClose?: boolean; // For critical forms
}

const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, children, variant = 'full-screen',
  height = '60%', preventBackdropClose = false
}) => {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const firstFocusable = modalRef.current.querySelector('button, input');
    (firstFocusable as HTMLElement)?.focus();
  }, [isOpen]);

  // Swipe-to-dismiss for bottom sheets
  const [startY, setStartY] = useState(0);
  const handleTouchStart = (e: TouchEvent) => setStartY(e.touches[0].clientY);
  const handleTouchEnd = (e: TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    if (variant === 'bottom-sheet' && endY - startY > 100) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={preventBackdropClose ? undefined : onClose}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={variant === 'bottom-sheet'
          ? `relative w-full h-[${height}] bg-brand-surface rounded-t-2xl`
          : 'relative w-full h-full bg-brand-surface'}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle (bottom sheets only) */}
        {variant === 'bottom-sheet' && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-400 rounded-full" />
          </div>
        )}

        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>
  );
};
```

**Refactor List (11 modals):**
1. `BaselineUpdateModal.tsx`
2. `SetEditModal.tsx`
3. `WorkoutSummaryModal.tsx`
4. `WorkoutPlannerModal.tsx`
5. `MuscleDeepDiveModal.tsx`
6. `TemplateSelector.tsx`
7. `FABMenu.tsx`
8. `EquipmentModal.tsx`
9. `ExercisePicker.tsx` (when used as modal)
10. `HistoryModal.tsx`
11. `FailureTooltip.tsx`

**Files:**
- Create: `components/ui/Modal.tsx`
- Modify: 11 modal components (refactor to use Modal wrapper)
- Test: All dismiss methods on each modal

**Effort:** 8 hours (1 day)
**Priority:** P0 (Critical)
**Dependencies:** None

---

### Story 1.4: Reduce Modal Nesting to 2 Levels

**As a** FitForge user
**I want** to never be more than 2 modals deep
**So that** I always know how to get back to the main screen

**Acceptance Criteria:**
- [ ] Dashboard → QuickAdd flow: Max 2 levels
- [ ] FABMenu converted to bottom sheet (not modal)
- [ ] ExercisePicker replaces QuickAdd content (same level)
- [ ] Exercise detail opens as Level 2, returns to picker
- [ ] No path allows 3+ nested modals

**Implementation Details:**

**Flow Redesign:**
```
BEFORE:
Dashboard (base)
  → FABMenu (modal 1, full-screen)
    → QuickAdd (modal 2, full-screen)
      → ExercisePicker (modal 3, full-screen)

AFTER:
Dashboard (base)
  → QuickAdd (bottom sheet, 60% height) - Modal Level 1
    ↔ ExercisePicker (replaces QuickAdd content) - Still Level 1
      → ExerciseDetail (full-screen preview) - Modal Level 2

FABMenu → Convert to floating button menu (not modal)
```

**Code Changes:**
```tsx
// FABMenu.tsx - Convert from modal to floating menu
const FABMenu = ({ onQuickWorkout, onPlanWorkout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Menu options (slide up when open) */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-2">
          <button onClick={() => { onQuickWorkout(); setIsOpen(false); }}>
            Quick Workout
          </button>
          <button onClick={() => { onPlanWorkout(); setIsOpen(false); }}>
            Plan Workout
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-cyan rounded-full"
      >
        +
      </button>
    </div>
  );
};

// QuickAdd.tsx - Open as bottom sheet
const [showQuickAdd, setShowQuickAdd] = useState(false);

<Modal
  isOpen={showQuickAdd}
  onClose={() => setShowQuickAdd(false)}
  variant="bottom-sheet"
  height="60%"
>
  {step === 'picker' && (
    <ExercisePicker onSelect={(ex) => {
      setSelectedExercise(ex);
      setStep('logging');
    }} />
  )}
  {step === 'logging' && (
    <QuickAddForm exercise={selectedExercise} />
  )}
</Modal>
```

**Files:**
- Modify: `components/FABMenu.tsx` (convert to floating menu)
- Modify: `components/QuickAdd.tsx` (use bottom sheet Modal)
- Modify: `components/ExercisePicker.tsx` (integrate into QuickAdd)
- Modify: `components/Dashboard.tsx` (update FABMenu usage)

**Effort:** 3 days
**Priority:** P0 (Critical)
**Dependencies:** Story 1.3 (Modal wrapper must exist)

---

## Sprint 2: High Priority UX Improvements (Weeks 2-3)

**Goal:** Reduce per-set interactions from 8-12 to 3-4 taps
**Duration:** 10 days
**Stories:** 5

### Story 2.1: Inline Number Editing for Reps/Weight

**As a** FitForge user in the gym
**I want** to tap reps/weight values to edit them with a large, easy-to-see picker
**So that** I can quickly log sets without squinting at small inputs

**Acceptance Criteria:**
- [ ] Reps/weight displayed at 48-60pt font size
- [ ] Tap value → number picker appears inline
- [ ] Picker has +/- buttons for quick adjustments
- [ ] Keyboard entry still available for exact values
- [ ] Tap outside or "Done" to confirm
- [ ] Works in Workout.tsx and QuickAddForm.tsx

**Implementation Details:**
```tsx
// Create: components/ui/InlineNumberPicker.tsx
interface InlineNumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  largeDisplay?: boolean; // 60pt vs 20pt font
}

const InlineNumberPicker: React.FC<InlineNumberPickerProps> = ({
  value, onChange, min = 0, max = 999, step = 1, label, largeDisplay = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      {/* Display mode */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className={largeDisplay ? 'text-6xl font-bold' : 'text-xl font-semibold'}
        >
          {value}
          {label && <span className="text-sm text-gray-500 ml-1">{label}</span>}
        </button>
      )}

      {/* Edit mode - Bottom sheet picker */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          variant="bottom-sheet"
          height="40%"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Set {label || 'Value'}
            </h3>

            {/* Large value display */}
            <div className="text-center text-6xl font-bold mb-6">
              {value}
            </div>

            {/* Quick adjust buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => onChange(Math.max(min, value - step * 5))}
                className="flex-1 py-3 bg-gray-200 rounded"
              >
                −{step * 5}
              </button>
              <button
                onClick={() => onChange(Math.max(min, value - step))}
                className="flex-1 py-3 bg-gray-200 rounded"
              >
                −{step}
              </button>
              <button
                onClick={() => onChange(Math.min(max, value + step))}
                className="flex-1 py-3 bg-gray-200 rounded"
              >
                +{step}
              </button>
              <button
                onClick={() => onChange(Math.min(max, value + step * 5))}
                className="flex-1 py-3 bg-gray-200 rounded"
              >
                +{step * 5}
              </button>
            </div>

            {/* Keyboard input fallback */}
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= min && val <= max) onChange(val);
              }}
              className="w-full p-3 text-center text-2xl border rounded mb-4"
            />

            {/* Done button */}
            <button
              onClick={() => setIsEditing(false)}
              className="w-full py-4 bg-brand-cyan text-brand-dark rounded font-bold"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

// Usage in Workout.tsx
<InlineNumberPicker
  value={set.weight}
  onChange={(w) => updateSet(ex.id, set.id, 'weight', w)}
  min={0}
  max={500}
  step={2.5}
  label="lbs"
  largeDisplay
/>

<InlineNumberPicker
  value={set.reps}
  onChange={(r) => updateSet(ex.id, set.id, 'reps', r)}
  min={1}
  max={50}
  step={1}
  label="reps"
  largeDisplay
/>
```

**Files:**
- Create: `components/ui/InlineNumberPicker.tsx`
- Modify: `components/Workout.tsx:813-824` (replace inputs)
- Modify: `components/QuickAddForm.tsx:111-178` (replace inputs)
- Test: Mobile device testing, picker usability

**Effort:** 2 days
**Priority:** P1 (High)
**Dependencies:** Story 1.3 (Modal wrapper)

---

### Story 2.2: Auto-Starting Rest Timer

**As a** FitForge user
**I want** the rest timer to start automatically after logging a set
**So that** I don't have to manually activate it every time

**Acceptance Criteria:**
- [ ] Timer auto-starts with 90s default after set logged
- [ ] Compact timer display (doesn't cover content)
- [ ] Shows next exercise info while resting
- [ ] Skip button to end rest early
- [ ] +15s button to extend rest
- [ ] Audio alert when timer completes

**Implementation Details:**
```tsx
// Workout.tsx - Auto-start timer after logging set
const handleLogSet = (exerciseId: string, setId: string) => {
  // Mark set as complete
  setCompletedSets(prev => new Set(prev).add(setId));

  // Auto-start rest timer (90s default, customizable per exercise)
  const exercise = loggedExercises.find(ex => ex.id === exerciseId);
  const restDuration = exercise?.restTimerSeconds || 90;
  startRestTimer(restDuration);
};

// RestTimer.tsx - Compact design
const RestTimer: React.FC<{ remaining: number; onSkip: () => void; onAdd: (seconds: number) => void }> = ({
  remaining, onSkip, onAdd
}) => {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="fixed top-4 right-4 bg-brand-cyan text-brand-dark rounded-lg p-3 shadow-lg z-30">
      {/* Compact timer */}
      <div className="flex items-center gap-3">
        <ClockIcon className="w-5 h-5" />
        <span className="text-2xl font-bold font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <button onClick={() => onAdd(15)} className="text-sm px-2">
          +15s
        </button>
        <button onClick={onSkip} className="text-sm px-2">
          Skip
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-brand-dark/20 rounded mt-2">
        <div
          className="h-full bg-brand-dark rounded"
          style={{ width: `${(remaining / 90) * 100}%` }}
        />
      </div>
    </div>
  );
};
```

**Files:**
- Modify: `components/Workout.tsx` (auto-start logic)
- Modify: `components/RestTimer.tsx` (compact design, fixed position)
- Add: Audio alert (beep sound on completion)
- Test: Timer accuracy, audio playback

**Effort:** 0.5 day (4 hours)
**Priority:** P1 (High)
**Dependencies:** None

---

### Story 2.3: Smart Logging Shortcuts

**As a** FitForge user
**I want** the app to offer "Log All Sets?" after completing 2/3 sets
**So that** I can quickly finish typical 3-set exercises

**Implementation Details:**
```tsx
// Workout.tsx - Detect 2/3 sets pattern
const smartShortcutAvailable = useMemo(() => {
  return loggedExercises.some(ex => {
    const totalSets = ex.sets.length;
    const completedCount = ex.sets.filter(s => completedSets.has(s.id)).length;

    // Show after 2/3 or 3/4 sets completed
    return (totalSets === 3 && completedCount === 2) ||
           (totalSets === 4 && completedCount === 3);
  });
}, [loggedExercises, completedSets]);

const handleLogAllRemaining = (exerciseId: string) => {
  const exercise = loggedExercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  // Get last completed set
  const completedSetIds = exercise.sets.filter(s => completedSets.has(s.id));
  const lastCompleted = completedSetIds[completedSetIds.length - 1];

  // Copy values to remaining sets
  const remaining = exercise.sets.filter(s => !completedSets.has(s.id));
  remaining.forEach(set => {
    updateSet(exercise.id, set.id, 'weight', lastCompleted.weight);
    updateSet(exercise.id, set.id, 'reps', lastCompleted.reps);
  });

  // Mark all as complete
  setCompletedSets(prev => {
    const newSet = new Set(prev);
    remaining.forEach(s => newSet.add(s.id));
    return newSet;
  });
};

// UI
{smartShortcutAvailable && (
  <div className="mt-4 p-4 bg-brand-cyan/10 border border-brand-cyan rounded-lg">
    <p className="text-sm mb-2">Same weight/reps for remaining sets?</p>
    <button
      onClick={() => handleLogAllRemaining(exercise.id)}
      className="w-full py-3 bg-brand-cyan text-brand-dark rounded font-semibold"
    >
      Log All Remaining Sets
    </button>
  </div>
)}
```

**Files:**
- Modify: `components/Workout.tsx` (smart shortcut logic)
- Test: Verify with 3-set and 4-set exercises

**Effort:** 1 day
**Priority:** P1 (High)
**Dependencies:** None

---

### Story 2.4: Bottom Sheet Component (Reusable)

**As a** developer
**I want** a reusable BottomSheet component
**So that** I can use it for filters, quick actions, and confirmations

**Acceptance Criteria:**
- [ ] BottomSheet component supports 40%, 60%, 80% heights
- [ ] Drag handle always visible
- [ ] Swipe-to-dismiss gesture
- [ ] Backdrop dismiss
- [ ] Smooth slide-up/down animation
- [ ] Used for: Equipment filter, FABMenu alternatives

**Implementation:** (See Story 1.3 for Modal component - extract BottomSheet variant)

**Files:**
- Create: `components/ui/BottomSheet.tsx`
- Modify: `components/EquipmentModal.tsx` (use BottomSheet)
- Test: Swipe gestures, animation smoothness

**Effort:** 1 day
**Priority:** P1 (High)
**Dependencies:** Story 1.3 (Modal wrapper)

---

### Story 2.5: Typography Scale Standardization

**As a** developer
**I want** a formal 7-level typography scale
**So that** text sizes are consistent across the app

**Acceptance Criteria:**
- [ ] Define 7-level type scale in Tailwind config
- [ ] Apply to key screens (Dashboard, Workout, Exercise Picker)
- [ ] Document in Storybook
- [ ] All headings use scale (no inline sizes)

**Implementation Details:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'display': ['60px', { lineHeight: '1.1', fontWeight: '700' }], // Timers, large numbers
        'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }], // Page titles
        'title-2': ['22px', { lineHeight: '1.3', fontWeight: '600' }], // Section headers
        'headline': ['20px', { lineHeight: '1.4', fontWeight: '600' }], // Card titles
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }], // Body text
        'subhead': ['14px', { lineHeight: '1.4', fontWeight: '400' }], // Secondary text
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '400' }], // Labels, metadata
      },
    },
  },
};

// Usage
<h1 className="text-title-1">Dashboard</h1>
<h2 className="text-title-2">Recent Workouts</h2>
<p className="text-body">Your workout history</p>
<span className="text-caption text-gray-500">3 days ago</span>
```

**Files:**
- Modify: `tailwind.config.js`
- Modify: Key components (Dashboard, Workout, etc.)
- Create: Storybook stories for typography

**Effort:** 0.5 day (4 hours)
**Priority:** P1 (High)
**Dependencies:** None

---

## Sprint 3: Polish and Medium Priority (Week 4)

**Goal:** Polish UX, improve information architecture
**Duration:** 5 days
**Stories:** 6

### Story 3.1: Button Style Standardization

**As a** developer
**I want** consistent button styles (Primary, Secondary, Tertiary)
**So that** action hierarchy is clear across the app

**Acceptance Criteria:**
- [ ] Define 3 button variants: Primary, Secondary, Tertiary
- [ ] Primary: Cyan fill, dark text (main actions)
- [ ] Secondary: White fill, cyan border (secondary actions)
- [ ] Tertiary: No fill, cyan text (tertiary actions)
- [ ] Create Button component with variants
- [ ] Refactor all buttons to use component

**Implementation Details:**
```tsx
// Create: components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all';

  const variantClasses = {
    primary: 'bg-brand-cyan text-brand-dark hover:bg-brand-cyan/90',
    secondary: 'bg-white text-brand-cyan border-2 border-brand-cyan hover:bg-brand-cyan/10',
    tertiary: 'bg-transparent text-brand-cyan hover:bg-brand-cyan/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Usage
<Button variant="primary" onClick={handleLogSet}>Log Set</Button>
<Button variant="secondary" onClick={handleSkipRest}>Skip Rest</Button>
<Button variant="tertiary" onClick={handleViewHistory}>View History</Button>
```

**Files:**
- Create: `components/ui/Button.tsx`
- Modify: All components using buttons (refactor)
- Create: Storybook stories

**Effort:** 0.5 day (4 hours)
**Priority:** P2 (Medium)
**Dependencies:** None

---

### Story 3.2: Three-Tab Exercise Picker

**As a** FitForge user
**I want** to browse exercises by "All", "By Muscle", or "Category"
**So that** I have flexible ways to find exercises

**Acceptance Criteria:**
- [ ] Three tabs: All | By Muscle | Categories
- [ ] Persistent search bar above tabs
- [ ] "By Muscle" shows body map for selection
- [ ] "Categories" shows Push/Pull/Legs/Core/Full Body
- [ ] Tab state persists during search
- [ ] Filter results update in real-time

**Files:**
- Modify: `components/ExercisePicker.tsx` (add tab navigation)
- Add: Body map component for "By Muscle" tab
- Test: Tab switching, filter persistence

**Effort:** 2 days
**Priority:** P2 (Medium)
**Dependencies:** None

---

### Story 3.3: Dashboard Progressive Disclosure

**As a** new FitForge user
**I want** the dashboard to be less overwhelming
**So that** I can focus on the most important actions first

**Acceptance Criteria:**
- [ ] Collapsible sections for less critical features
- [ ] "Quick Actions" prominent at top
- [ ] Recent workouts visible by default
- [ ] Analytics/charts collapsed by default
- [ ] "Expand All" toggle for power users
- [ ] State persists to localStorage

**Files:**
- Modify: `components/Dashboard.tsx` (add collapsible sections)
- Add: localStorage for state persistence
- Test: Collapse/expand behavior

**Effort:** 1 day
**Priority:** P2 (Medium)
**Dependencies:** None

---

### Story 3.4: Empty State Improvements

**As a** new FitForge user
**I want** helpful guidance when I encounter empty states
**So that** I know what to do next

**Acceptance Criteria:**
- [ ] Empty workout history: "Start your first workout" CTA
- [ ] No exercises selected: "Tap + to add exercises" hint
- [ ] No equipment configured: "Set up your equipment" link
- [ ] Empty search results: "Try different filters" suggestion
- [ ] Each empty state has relevant icon/illustration

**Files:**
- Modify: Components with empty states (Dashboard, WorkoutTemplates, etc.)
- Create: EmptyState component
- Test: All empty state scenarios

**Effort:** 1 day
**Priority:** P2 (Medium)
**Dependencies:** None

---

### Story 3.5: Loading Skeleton Screens

**As a** FitForge user
**I want** to see skeleton loading states instead of spinners
**So that** the app feels faster and more responsive

**Acceptance Criteria:**
- [ ] Exercise picker: Skeleton cards while loading
- [ ] Dashboard: Skeleton sections while loading
- [ ] Workout history: Skeleton list items
- [ ] Smooth shimmer animation (1.5s cycle)
- [ ] Matches actual content layout

**Implementation Details:**
```tsx
// Create: components/ui/Skeleton.tsx
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Usage in ExercisePicker while loading
{isLoading ? (
  <>
    <Skeleton className="h-20 w-full mb-2" />
    <Skeleton className="h-20 w-full mb-2" />
    <Skeleton className="h-20 w-full mb-2" />
  </>
) : (
  exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)
)}
```

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Modify: Components with loading states
- Add: Shimmer animation CSS
- Test: Loading scenarios

**Effort:** 1 day
**Priority:** P2 (Medium)
**Dependencies:** None

---

### Story 3.6: Card Visual Consistency

**As a** developer
**I want** consistent card styling across the app
**So that** the UI feels cohesive

**Acceptance Criteria:**
- [ ] Define Card component with variants
- [ ] All cards use 12pt border radius
- [ ] Consistent shadow elevation
- [ ] Consistent padding (16pt)
- [ ] Refactor all cards to use component

**Files:**
- Create: `components/ui/Card.tsx`
- Modify: All components using cards
- Test: Visual consistency audit

**Effort:** 0.5 day (4 hours)
**Priority:** P2 (Medium)
**Dependencies:** None

---

## Story Dependencies

**Dependency Graph:**
```
Sprint 1:
1.1 Touch Targets (no deps)
1.2 Equipment Filter (no deps)
1.3 Modal Standardization (no deps)
1.4 Modal Nesting → depends on 1.3

Sprint 2:
2.1 Inline Number Picker → depends on 1.3
2.2 Auto-start Timer (no deps)
2.3 Smart Shortcuts (no deps)
2.4 Bottom Sheet → depends on 1.3
2.5 Typography (no deps)

Sprint 3:
3.1 Button Styles (no deps)
3.2 Three-Tab Picker (no deps)
3.3 Progressive Disclosure (no deps)
3.4 Empty States (no deps)
3.5 Skeleton Screens (no deps)
3.6 Card Consistency (no deps)
```

**Critical Path:** Story 1.3 → 1.4 → 2.1 (Modal standardization enables other improvements)

---

## Testing Strategy

### Automated Testing

**Component Tests:**
- Modal: Keyboard navigation, dismiss methods, focus management
- InlineNumberPicker: Input validation, min/max bounds
- BottomSheet: Swipe gestures, backdrop dismiss
- Button: Variant rendering, click handlers

**Integration Tests:**
- Complete workout flow: Start → log sets → finish
- Exercise selection: Filter → search → add to workout
- Modal navigation: Open → nested → dismiss all

**Accessibility Tests:**
- axe-core: Automated WCAG 2.1 AA audit
- Keyboard-only navigation
- Screen reader testing (NVDA/JAWS)
- Touch target size verification (44pt min)

### Manual Testing Checklist

**For Each Story:**
- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces changes
- [ ] Compare to Fitbod reference screenshots
- [ ] Measure before/after interaction counts

**Regression Testing:**
- [ ] Existing flows still work
- [ ] No visual regressions (screenshot comparison)
- [ ] Performance hasn't degraded (Lighthouse)

### User Acceptance Testing

**Test Users:** 3-5 existing FitForge users
**Scenarios:**
1. Complete workout start-to-finish
2. Browse and add exercises with filters
3. View workout history and analytics
4. Update user profile and equipment

**Success Criteria:**
- Task completion rate: >95%
- Time on task: <10% increase vs. pre-changes
- User satisfaction: >4/5 rating
- Zero critical bugs reported

### Performance Testing

**Metrics:**
- Time to Interactive (TTI): <3s
- First Contentful Paint (FCP): <1.5s
- Modal animations: 60fps
- Set logging latency: <100ms

**Tools:**
- Lighthouse performance audit
- React DevTools Profiler
- Chrome DevTools Performance panel

---

## Rollout Strategy

### Phased Rollout

**Phase 1: Internal Testing (Week 1 of Sprint 1)**
- Deploy Sprint 1 stories to staging
- Internal team testing (2 days)
- Fix critical bugs
- Measure performance impact

**Phase 2: Beta Users (Week 2 of Sprint 2)**
- Deploy Sprint 1+2 to 10% of users (feature flag)
- Collect feedback and analytics
- Monitor error rates and performance
- Iterate on feedback

**Phase 3: Gradual Rollout (Week 3 of Sprint 2)**
- Deploy to 50% of users
- Compare metrics vs. control group
- A/B test specific changes if needed
- Address remaining issues

**Phase 4: Full Rollout (Week 1 of Sprint 3)**
- Deploy to 100% of users
- Monitor for 48 hours
- Prepare rollback plan if needed
- Celebrate success!

### Feature Flags

**Key Toggles:**
```typescript
const featureFlags = {
  'ux.inline-number-picker': boolean,
  'ux.auto-rest-timer': boolean,
  'ux.smart-shortcuts': boolean,
  'ux.bottom-sheets': boolean,
  'ux.three-tab-picker': boolean,
};

// Usage
const useInlinePicker = featureFlags['ux.inline-number-picker'];

return useInlinePicker ? (
  <InlineNumberPicker value={weight} onChange={setWeight} />
) : (
  <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
);
```

### Rollback Plan

**Trigger Conditions:**
- Error rate increase >5%
- Performance degradation >20%
- Critical bug affecting workout logging
- User complaints spike >10x normal

**Rollback Steps:**
1. Disable feature flag(s) immediately
2. Verify metrics return to normal
3. Investigate root cause
4. Fix and re-test before re-enabling

---

## Success Metrics

### Quantitative Targets

**Interaction Efficiency:**
- Per-set interactions: 8-12 → 3-4 (60% reduction) ✅
- Workout completion time: -15% ✅
- Exercise selection time: -20% ✅

**Accessibility:**
- Touch target compliance: 100% (WCAG 2.1 AA) ✅
- Color contrast: All pass AA standards ✅
- Keyboard navigation: 100% coverage ✅

**User Engagement:**
- Modal abandonment rate: -30% ✅
- Workout start rate: +10% ✅
- Daily active users: +5% ✅

**Performance:**
- Lighthouse score: >90 ✅
- Time to Interactive: <3s ✅
- 60fps animations: 100% ✅

### Qualitative Targets

**User Feedback:**
- "Much easier to use in the gym" ✅
- "Love the large numbers, easy to read" ✅
- "Finally know how to close modals" ✅
- "Equipment filtering is a game-changer" ✅

**Support Tickets:**
- UX confusion tickets: -20% ✅
- "How do I close this?" tickets: -50% ✅

**Net Promoter Score:**
- Current: 35
- Target: 50 (+15 points)

---

## Phase 4 Complete ✅

**Total Stories:** 15
**Total Effort:** ~4-6 weeks
**Expected Impact:** 60% fewer interactions, WCAG compliant, polished UX

**Ready for:** Implementation execution or review/refinement
