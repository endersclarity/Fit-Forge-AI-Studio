# Spec: Exercise Discovery by Muscle

**Capability:** `exercise-discovery-by-muscle`
**Change:** `enable-muscle-fatigue-heat-map`
**Status:** Proposed

---

## Overview

This capability enables users to tap on any muscle in the heat map to discover which exercises target that specific muscle group. This helps users plan workouts by connecting muscle recovery status directly to actionable exercise recommendations.

---

## ADDED Requirements

### Requirement: Make Muscles Tappable/Clickable

**Description:** System SHALL make each muscle row interactive with tap/click support.

**Acceptance Criteria:**
- Each muscle row is a clickable/tappable element
- Visual feedback on hover (desktop) and tap (mobile)
- Cursor changes to pointer on hover
- Accessible via keyboard (Enter/Space)
- ARIA attributes for screen readers

#### Scenario: User clicks muscle on desktop
**Given:** User is viewing heat map on desktop
**When:** User hovers over "Lats" muscle row
**Then:** Cursor changes to pointer
**And:** Row has subtle hover effect (background color change)
**When:** User clicks "Lats"
**Then:** Exercise modal opens showing Lats exercises

#### Scenario: User taps muscle on mobile
**Given:** User is viewing heat map on mobile device
**When:** User taps "Pectoralis" muscle row
**Then:** Exercise modal opens immediately
**And:** Modal is full-screen or bottom-sheet style

---

### Requirement: Display Exercise Modal with Filtered Exercises

**Description:** System SHALL show a modal listing all exercises that target the selected muscle.

**Acceptance Criteria:**
- Modal opens when muscle row is clicked/tapped
- Modal title shows muscle name: "Exercises for {Muscle}"
- Displays exercises from EXERCISE_LIBRARY that engage this muscle
- Shows exercise name, category, and engagement percentage
- Sorted by engagement percentage (highest first)
- Scrollable if list exceeds viewport height

#### Scenario: User clicks Lats muscle
**Given:** User clicks "Lats" in heat map
**When:** Exercise modal opens
**Then:** Modal title shows "Exercises for Lats"
**And:** Displays exercises like:
  - Pull-ups (85% engagement)
  - Dumbbell Row (75% engagement)
  - Dumbbell Pullover (60% engagement)
**And:** Exercises sorted by engagement % descending

#### Scenario: Muscle with many exercises
**Given:** User clicks "Pectoralis"
**And:** 8 exercises target Pectoralis
**When:** Modal opens
**Then:** All 8 exercises display
**And:** Modal is scrollable
**And:** User can scroll to see all exercises

---

### Requirement: Show Exercise Engagement Percentage

**Description:** System SHALL display how much each exercise engages the selected muscle.

**Acceptance Criteria:**
- Engagement percentage shown for each exercise
- Format: "{X}%" (e.g., "85%", "60%")
- Visually prominent (color: brand-cyan or similar)
- Positioned to right of exercise name

#### Scenario: User views engagement percentages
**Given:** User opens Biceps exercise modal
**When:** Exercises display
**Then:** Each exercise shows engagement %:
  - "Bicep Curls: 80%"
  - "Pull-ups: 30%"
  - "Dumbbell Row: 20%"
**And:** Higher percentages appear at top of list

---

### Requirement: Close Modal Interaction

**Description:** System SHALL provide multiple ways to close the exercise modal.

**Acceptance Criteria:**
- Close button (X icon) in modal header
- Click/tap outside modal (overlay click)
- Escape key press (desktop)
- Accessible close button with ARIA label

#### Scenario: User closes modal with close button
**Given:** Exercise modal is open
**When:** User clicks "X" close button
**Then:** Modal closes immediately
**And:** Heat map returns to normal view

#### Scenario: User closes modal with overlay click
**Given:** Exercise modal is open
**When:** User clicks/taps the darkened area outside modal
**Then:** Modal closes
**And:** Heat map is interactive again

#### Scenario: User closes modal with Escape key
**Given:** Exercise modal is open on desktop
**When:** User presses Escape key
**Then:** Modal closes immediately

---

### Requirement: Handle Muscles with No Exercises

**Description:** System SHALL gracefully handle muscles with no exercises in the library.

**Acceptance Criteria:**
- If no exercises engage the muscle: show empty state
- Message: "No exercises found for this muscle."
- Still allow modal to close normally
- Don't crash or show error

#### Scenario: User clicks muscle with no exercises
**Given:** A muscle has no exercises targeting it (unlikely but possible)
**When:** User clicks that muscle
**Then:** Modal opens with message: "No exercises found for this muscle."
**And:** Close button still works
**And:** User can dismiss modal normally

---

## MODIFIED Requirements

### Requirement: Muscle Row Interaction

**Description:** System SHALL modify muscle rows to support both expansion (existing) and exercise discovery (new).

**Before:**
```tsx
<button onClick={() => setExpandedMuscle(isExpanded ? null : muscle)}>
  {/* Show baseline/volume stats on expand */}
</button>
```

**After:**
```tsx
<button onClick={() => handleMuscleClick(muscle)}>
  {/* Can toggle between:
      1. Show baseline/volume stats (existing functionality)
      2. Show exercises for muscle (new functionality)
   */}
</button>
```

**Changes:**
- Decide on single interaction vs dual interaction
- **Option A (Recommended):** Single click opens exercise modal, remove baseline expansion
- **Option B:** Click opens exercise modal, separate "stats" button for baseline info
- **Option C:** Click toggles baseline stats, separate "exercises" button

**Recommended:** Option A - Simplify to exercise modal only, as this aligns better with user goal of "what can I do with this muscle?"

#### Scenario: User clicks muscle (Option A)
**Given:** User clicks "Pectoralis"
**When:** Click registers
**Then:** Exercise modal opens (not baseline stats)
**And:** User sees exercises they can perform

---

## Implementation Notes

**Exercise Filtering Logic:**
```typescript
function getExercisesForMuscle(muscle: Muscle): ExerciseForMuscle[] {
  return EXERCISE_LIBRARY
    .map(exercise => {
      const engagement = exercise.muscleEngagements.find(e => e.muscle === muscle);
      if (!engagement) return null;
      return {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        engagement: engagement.percentage
      };
    })
    .filter((ex): ex is ExerciseForMuscle => ex !== null)
    .sort((a, b) => b.engagement - a.engagement);
}
```

**Modal Component:**
```tsx
interface ExerciseModalProps {
  muscle: Muscle;
  exercises: ExerciseForMuscle[];
  isOpen: boolean;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ muscle, exercises, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header>
          <h3>Exercises for {muscle}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          {exercises.length === 0 ? (
            <p>No exercises found for this muscle.</p>
          ) : (
            <ul>
              {exercises.map(ex => (
                <li key={ex.id}>
                  <span>{ex.name}</span>
                  <span className="engagement">{ex.engagement}%</span>
                  <span className="category">{ex.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
```

**State Management:**
```typescript
const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleMuscleClick = (muscle: Muscle) => {
  setSelectedMuscle(muscle);
  setIsModalOpen(true);
};

const handleModalClose = () => {
  setIsModalOpen(false);
  setSelectedMuscle(null);
};

const exercisesForMuscle = selectedMuscle
  ? getExercisesForMuscle(selectedMuscle)
  : [];
```

**Modal Styling:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--brand-surface);
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

/* Mobile: Full-screen modal */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
```

**Accessibility:**
```tsx
// Focus trap in modal
useEffect(() => {
  if (isModalOpen) {
    const closeButton = modalRef.current?.querySelector('[aria-label="Close"]');
    closeButton?.focus();
  }
}, [isModalOpen]);

// Escape key handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isModalOpen) {
      handleModalClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isModalOpen]);

// Prevent body scroll when modal open
useEffect(() => {
  if (isModalOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => { document.body.style.overflow = ''; };
}, [isModalOpen]);
```

**Performance:**
- Exercise filtering happens once per modal open (not on every render)
- Use `useMemo` if exercises list is reused
- Modal renders only when open (conditional rendering)

---

## Testing Checklist

**Interaction:**
- [ ] Clicking muscle opens exercise modal
- [ ] Modal shows correct muscle name in title
- [ ] Exercises filtered correctly for muscle

**Exercise Display:**
- [ ] All exercises for muscle appear
- [ ] Sorted by engagement % (highest first)
- [ ] Engagement % displayed for each exercise
- [ ] Exercise category shown

**Modal Behavior:**
- [ ] Close button works
- [ ] Overlay click closes modal
- [ ] Escape key closes modal
- [ ] Modal scrolls if content exceeds viewport

**Edge Cases:**
- [ ] Muscle with no exercises shows empty state
- [ ] Muscle with 1 exercise displays correctly
- [ ] Muscle with 10+ exercises scrolls properly
- [ ] Rapid clicking doesn't break modal

**Accessibility:**
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces modal open/close
- [ ] Focus moves to modal when opened
- [ ] Focus returns to muscle row when closed
- [ ] ARIA labels present on close button

**Mobile:**
- [ ] Modal is touch-friendly on mobile
- [ ] Full-screen or bottom-sheet style on small screens
- [ ] Scrolling works on touch devices
- [ ] Overlay tap closes modal

---

## Design Rationale

**Why Exercise Discovery?**
- Connects muscle status directly to actionable workouts
- Helps users answer: "My lats are ready - what can I do?"
- Reduces mental load (no need to remember which exercises work which muscles)
- Encourages exploration of exercise library

**Why Modal (vs. Inline Expansion)?**
- Focused attention on exercises
- More space to display multiple exercises
- Doesn't disrupt heat map layout
- Familiar interaction pattern

**Why Show Engagement %?**
- Helps users choose most effective exercises
- "Pull-ups work lats at 85%" > "Dumbbell pullover works lats at 60%"
- Guides exercise selection based on recovery goals

---

*This spec enables users to discover exercises for any muscle directly from the heat map, connecting recovery status to actionable workout planning.*
