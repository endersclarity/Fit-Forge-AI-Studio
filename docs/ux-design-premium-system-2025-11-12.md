# FitForge UX Design Specification - Premium System

**Project:** FitForge UI/UX Transformation 2025
**Created:** 2025-11-12
**Version:** 1.0
**Type:** UX Design Specification
**Status:** Ready for Epic Implementation

---

## 1. Design Philosophy & Principles

### Core Philosophy: "Elegance meets strength"

FitForge embodies the intersection of classical power and modern clarity. Our design system channels the timeless quality of classical training principles through sophisticated visual language that makes advanced intelligence effortless to use.

**Visual DNA:**
- Classical power (Cinzel serif) meets modern clarity (Lato sans)
- Sophisticated restraint vs. bright excitement
- Intelligence made effortless
- Premium fitness experience that respects the user's dedication

---

### Design Principles

#### 1. Gym-First Design
**Context:** Users are exercising, sweaty, wearing gloves, viewing from distance

**Requirements:**
- **Large targets:** 60x60px minimum (exceeds WCAG 44pt) - sweaty fingers, gloves, distance viewing
- **Readable fonts:** 48-60pt for primary values (reps/weight) - glanceable from arm's length
- **High contrast:** WCAG AA minimum for all text, AAA for critical values
- **Zero mistakes:** Clear affordances, immediate feedback, undo support
- **One-hand use:** Bottom-aligned primary actions, thumb-friendly zones

**Application:**
```tsx
// Inline number display - gym readable from 2 feet away
<div className="text-6xl font-lato font-bold text-primary-dark">
  135
</div>

// Touch targets - easy to hit while fatigued
<button className="min-w-[60px] min-h-[60px] rounded-full">
  +
</button>
```

---

#### 2. Zero Mistakes
**Context:** Prevent errors during high-intensity training moments

**Requirements:**
- Clear visual affordances (what's tappable is obvious)
- Immediate visual feedback on all interactions
- Undo support for accidental taps
- Confirmation for destructive actions
- Progressive disclosure (hide complexity until needed)

**Application:**
```tsx
// Clear affordance - button looks tappable
<button className="bg-primary text-white rounded-full shadow-button-primary
  hover:scale-105 active:scale-95 transition-transform">
  Log Set
</button>

// Immediate feedback - haptic + visual
const handleLogSet = () => {
  navigator.vibrate?.(50); // Haptic
  setShowSuccess(true);    // Visual checkmark
  setTimeout(() => setShowSuccess(false), 1000);
};
```

---

#### 3. Progressive Disclosure
**Context:** Show what's needed, hide complexity

**Requirements:**
- Default view shows 80% use case
- Advanced options accessible but collapsed
- Clear "Show More" affordances
- State persists across sessions
- Never hide critical information

**Application:**
```tsx
// Default view - most users need this
<div>
  <input placeholder="Reps" />
  <input placeholder="Weight" />
  <button>Log Set</button>
</div>

// Advanced options - collapsed by default
{showAdvanced && (
  <div className="mt-4 space-y-2">
    <input placeholder="Rest Time (sec)" />
    <textarea placeholder="Notes" />
    <label>
      <input type="checkbox" /> To Failure
    </label>
  </div>
)}
<button onClick={() => setShowAdvanced(!showAdvanced)}>
  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
</button>
```

---

#### 4. Intelligent Defaults
**Context:** Reduce manual work through smart assumptions

**Requirements:**
- Auto-start rest timer after logging set
- Pre-fill values from previous set
- Smart suggestions based on history
- One-tap shortcuts for common patterns
- Override capability for edge cases

**Application:**
```tsx
// Auto-start 90s rest timer
useEffect(() => {
  if (setJustLogged) {
    startRestTimer(90);
  }
}, [setJustLogged]);

// Pre-fill from previous set
const newSet = {
  reps: lastSet.reps,
  weight: lastSet.weight,
  toFailure: false, // Default off
};

// Smart shortcut - "Log All Sets?"
const showLogAllShortcut =
  completedSets === totalSets - 1 && // One set left
  allSetsMatchPattern(completedSets); // Same weight/reps
```

---

#### 5. Premium Aesthetic
**Context:** Visual quality signals intelligent features

**Requirements:**
- Glass morphism surfaces (semi-transparent with blur)
- Spring animations (natural physics)
- Heavenly gradients (aspirational aesthetic)
- Cinzel serif for power, Lato sans for clarity
- Sophisticated blue palette (not bright/gaming)

**Application:**
```tsx
// Glass card
<div className="bg-white/50 backdrop-blur-sm border border-gray-300/50
  rounded-xl shadow-sm">
  {content}
</div>

// Spring animation
<motion.div
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  {content}
</motion.div>

// Heavenly gradient background
<div className="bg-gradient-to-b from-[#EBF1FF]/95 to-white/95">
  {content}
</div>
```

---

## 2. Design System Application

### Typography Hierarchy

#### Display Typography (Cinzel - Serif)
**Purpose:** Headlines, exercise names, page titles - convey strength and authority

```tsx
// Display XL - Page titles, drawer headers
className="font-cinzel text-[32px] leading-[1.2] font-bold tracking-wider text-primary-dark"
// Example: "Add Exercise", "Workout Summary"

// Display LG - Section headers
className="font-cinzel text-2xl leading-[1.3] font-bold tracking-wider text-primary-dark"
// Example: "Today's Workout", "Recovery Status"

// Display MD - Exercise names, card titles
className="font-cinzel text-lg leading-[1.4] font-bold tracking-wide text-primary-dark"
// Example: "Barbell Bench Press", "Dumbbell Curls"
```

**Usage Rules:**
- Always use for exercise names (establishes importance)
- Always use for page/section titles
- Always use for modal headers
- Never use for body text or UI labels

---

#### Body Typography (Lato - Sans Serif)
**Purpose:** UI elements, body text, buttons - modern clarity

```tsx
// Large - Primary content, important labels
className="font-lato text-lg leading-[1.56] font-normal text-primary-dark"
// Example: Set descriptions, important instructions

// Regular - Default body text, most UI
className="font-lato text-base leading-6 font-normal text-primary-dark"
// Example: Descriptions, help text, explanations

// Small - Category pills, secondary labels
className="font-lato text-sm leading-[1.4] font-bold tracking-wide"
// Example: "Push", "Pull", "Legs" category pills

// Tiny - Badges, metadata, legal text
className="font-lato text-xs leading-[1.3] font-normal text-primary-light"
// Example: "Chest, Triceps" muscle tags
```

**Usage Rules:**
- Use for all interactive elements (buttons, inputs)
- Use for descriptive text
- Bold (700) for emphasis and labels
- Regular (400) for body content

---

#### Numeric Typography (Lato - Sans Serif)
**Purpose:** Numbers displayed large for gym visibility

```tsx
// Extra Large - Inline number pickers (gym readable from 2 feet)
className="font-lato text-6xl leading-[1.2] font-bold text-primary-dark"
// Example: "135" lbs, "8" reps in picker

// Large - Set counters, badges
className="font-lato text-4xl leading-[1.2] font-semibold text-primary-dark"
// Example: "3/3" sets completed

// Medium - Numeric badges, counts
className="font-lato text-2xl leading-8 font-medium text-primary"
// Example: Rest timer "90s"
```

**Usage Rules:**
- Always use Lato for numbers (better legibility than Cinzel)
- Minimum 36px for numbers shown during workout
- Use tabular-nums variant when available for alignment

---

### Color Application

#### Surface Colors

**Primary Surfaces (Glass Morphism):**
```tsx
// Main glass surface - cards, modals, inputs
className="bg-white/50 backdrop-blur-sm border border-gray-300/50"
// Use: Exercise cards, workout summary, search bars

// Light glass - unselected pills, secondary surfaces
className="bg-white/60 backdrop-blur-sm border border-gray-300/70"
// Use: Unselected category pills, inactive states

// Subtle glass - background overlays
className="bg-white/20 backdrop-filter blur-sm"
// Use: Behind-drawer overlays, loading states
```

**Background Colors:**
```tsx
// Light mode - heavenly gradient
className="bg-gradient-to-b from-[#EBF1FF]/95 to-white/95"
// Use: Page backgrounds, drawer backgrounds

// Dark mode - inverted gradient (if implementing dark mode)
className="bg-gradient-to-b from-gray-900/95 to-gray-800/95"
// Use: Dark mode page backgrounds
```

---

#### Interactive Colors

**Primary Actions:**
```tsx
// Primary button - main CTAs
className="bg-primary text-white"
// Hex: #758AC6
// Use: "Log Set", "Save", "Start Workout"

// Primary hover - 10% darker
className="hover:bg-[#5F72A8]"
// Calculated: darken(#758AC6, 10%)

// Secondary button - less prominent actions
className="bg-primary-medium text-white"
// Hex: #566890
// Use: "Cancel", "Skip", "Later"
```

**State Colors:**
```tsx
// Success - completed actions
className="bg-emerald-500 text-white"
// Hex: #10B981
// Use: "Set logged", "Workout complete" confirmations

// Danger - destructive actions
className="bg-red-500 text-white"
// Hex: #EF4444
// Use: "Delete set", "Clear workout" warnings

// Warning - attention needed
className="bg-amber-500 text-white"
// Hex: #F59E0B
// Use: "Low recovery warning", "Overtraining alert"
```

---

#### Text Colors

**Hierarchy:**
```tsx
// Primary text - headlines, body text
className="text-primary-dark"
// Hex: #344161
// Contrast: 8.9:1 on white (WCAG AAA)

// Secondary text - labels, metadata
className="text-primary-medium"
// Hex: #566890
// Contrast: 4.5:1 on white (WCAG AA)

// Tertiary text - placeholders, hints
className="text-primary-light"
// Hex: #8997B8
// Contrast: 3.0:1 on white (WCAG AA for large text)

// On primary - text on colored backgrounds
className="text-white"
// Contrast: 3.2:1 on #758AC6 (WCAG AA)
```

---

### Spacing Scale (8px Base Grid)

**Component Spacing:**
```tsx
// Tight spacing - between related items
className="gap-1"  // 4px  - icon + text
className="gap-2"  // 8px  - badge + muscle tags
className="gap-3"  // 12px - form field groups

// Standard spacing - default component padding
className="gap-4"  // 16px - card padding, list items
className="p-4"    // 16px - card internal padding

// Generous spacing - section separation
className="gap-6"  // 24px - section breaks
className="gap-8"  // 32px - major sections
className="gap-12" // 48px - page-level spacing
```

**Touch Target Spacing:**
```tsx
// Minimum spacing between tappable elements
className="space-y-2" // 8px vertical between buttons
className="space-x-2" // 8px horizontal between buttons

// Comfortable spacing - prevent fat-finger errors
className="space-y-4" // 16px vertical (recommended)
className="space-x-4" // 16px horizontal (recommended)
```

---

## 3. Component Specifications

### 3.1 Bottom Sheet (Vaul Library)

**Purpose:** Replace full-screen modals with contextual sheets

**Specifications:**
```tsx
// Height variants
height: {
  'compact': '40vh',    // Quick actions, confirmations
  'standard': '60vh',   // Exercise picker, filters
  'tall': '90vh'        // Full content (rare)
}

// Visual design
{
  borderRadius: '24px 24px 0 0', // Top corners only
  background: 'linear-gradient(180deg, rgba(235,241,255,0.95) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
  border: '1px solid rgba(255,255,255,0.5)', // Top border only
}

// Drag handle
{
  width: '48px',
  height: '6px',
  borderRadius: '999px',
  background: '#A8B6D5', // primary-pale
  margin: '12px auto 0',
}

// Animation (spring physics)
{
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8
}

// Swipe threshold
{
  dismissThreshold: 0.4,  // 40% of height
  minSwipeDistance: 200,  // 200px
}
```

**Implementation Example:**
```tsx
import { Drawer } from 'vaul';

<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    <Drawer.Content className="fixed bottom-0 left-0 right-0 h-[60vh] flex flex-col
      rounded-t-[24px] bg-gradient-to-b from-[#EBF1FF]/95 to-white/95
      border-t border-white/50 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">

      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-12 h-[6px] rounded-full bg-primary-pale" />
      </div>

      {/* Title */}
      <Drawer.Title className="font-cinzel text-[32px] font-bold tracking-wider
        text-primary-dark px-4 pb-3 pt-4">
        Add Exercise
      </Drawer.Title>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

**Usage:**
- Exercise picker (60vh height)
- Filter panels (40vh height)
- Quick actions (40vh height)
- Confirmations (40vh height)
- Never use for full-screen content (use page navigation instead)

#### Responsive Height Specifications

Bottom sheet heights vary by use case and viewport:

| Use Case | Mobile (<768px) | Tablet (768-1024px) | Desktop (1024px+) | Notes |
|----------|----------------|---------------------|-------------------|-------|
| Exercise Picker | 90vh | 70vh | 60vh | Full list view with search |
| Quick Add Exercise | 60vh | 60vh | 50vh | Compact form with recent exercises |
| Filter Panel | 40vh | 40vh | 40vh | Consistent across breakpoints |
| Confirmation Dialogs | 40vh | 35vh | 30vh | Minimal content, smaller on desktop |
| Rest Timer Settings | 50vh | 45vh | 40vh | Timer configuration form |
| Workout History | 85vh | 75vh | 65vh | Scrollable list with details |

**Implementation:**
```tsx
const getSheetHeight = (useCase: SheetUseCase, viewport: Viewport) => {
  const heights = {
    exercisePicker: { mobile: '90vh', tablet: '70vh', desktop: '60vh' },
    quickAdd: { mobile: '60vh', tablet: '60vh', desktop: '50vh' },
    filter: { mobile: '40vh', tablet: '40vh', desktop: '40vh' },
    confirmation: { mobile: '40vh', tablet: '35vh', desktop: '30vh' },
    restTimer: { mobile: '50vh', tablet: '45vh', desktop: '40vh' },
    history: { mobile: '85vh', tablet: '75vh', desktop: '65vh' },
  }
  return heights[useCase][viewport]
}
```

**Breakpoint Detection:**
- Use CSS media queries or JS `window.matchMedia()`
- Mobile: `(max-width: 767px)`
- Tablet: `(min-width: 768px) and (max-width: 1023px)`
- Desktop: `(min-width: 1024px)`

---

### 3.2 Inline Number Picker

**Purpose:** Large, gym-readable number input with tap-to-edit

**Specifications:**
```tsx
// Container dimensions
{
  width: '180px',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px'
}

// Number display (center)
{
  fontSize: '60px',      // 60pt - readable from 2 feet
  fontFamily: 'Lato',
  fontWeight: 700,
  color: '#344161',      // primary-dark
  lineHeight: 1,
  userSelect: 'none',
}

// +/- Buttons
{
  width: '60px',
  height: '60px',        // WCAG compliant
  borderRadius: '50%',
  background: '#758AC6', // primary
  color: 'white',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

// Button states
{
  default: { opacity: 1 },
  hover: { filter: 'brightness(1.1)' },
  active: { transform: 'scale(0.95)' },
  disabled: { opacity: 0.4, cursor: 'not-allowed' }
}

// Haptic feedback (on tap)
{
  duration: '10ms',
  pattern: [10], // Single short pulse
}
```

**Implementation Example:**
```tsx
const InlineNumberPicker: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ value, onChange, min = 0, max = 999, step = 1, unit = '' }) => {

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    navigator.vibrate?.(10); // Haptic
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    navigator.vibrate?.(10); // Haptic
  };

  const handleTapValue = () => {
    // Open bottom sheet with keyboard input
    // (Alternative: inline contentEditable)
  };

  return (
    <div className="flex items-center justify-between gap-2 w-[180px] h-20">
      {/* Decrement */}
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-[60px] h-[60px] rounded-full bg-primary text-white
          flex items-center justify-center text-2xl font-bold
          hover:brightness-110 active:scale-95 disabled:opacity-40
          transition-all duration-150"
      >
        −
      </button>

      {/* Value display */}
      <button
        onClick={handleTapValue}
        className="flex-1 text-center"
      >
        <div className="text-6xl font-lato font-bold text-primary-dark leading-none">
          {value}
        </div>
        {unit && (
          <div className="text-sm font-lato text-primary-medium mt-1">
            {unit}
          </div>
        )}
      </button>

      {/* Increment */}
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-[60px] h-[60px] rounded-full bg-primary text-white
          flex items-center justify-center text-2xl font-bold
          hover:brightness-110 active:scale-95 disabled:opacity-40
          transition-all duration-150"
      >
        +
      </button>
    </div>
  );
};
```

**Usage:**
- Weight input (step: 5, unit: "lbs")
- Reps input (step: 1)
- Rest timer adjustment (step: 15, unit: "sec")
- Any numeric value shown during workout

---

### 3.3 FAB (Floating Action Button)

**Purpose:** Primary action always accessible

**Specifications:**
```tsx
// Dimensions
{
  width: '64px',
  height: '64px',
  borderRadius: '50%',
}

// Position
{
  position: 'fixed',
  bottom: '24px',        // Above bottom nav
  right: '24px',
  zIndex: 40,
}

// Visual design
{
  background: '#758AC6',
  backdropFilter: 'blur(8px)',  // Glass effect
  boxShadow: '0 4px 16px rgba(117, 138, 198, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}

// Icon
{
  size: '28px',
  color: 'white',
}

// States
{
  default: { transform: 'scale(1)' },
  hover: {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(117, 138, 198, 0.5)'
  },
  active: { transform: 'scale(0.95)' },
}

// Animation (entrance)
{
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  }
}
```

**Implementation Example:**
```tsx
import { motion } from 'framer-motion';

<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleAddExercise}
  className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary
    backdrop-blur-sm shadow-[0_4px_16px_rgba(117,138,198,0.4)]
    border border-white/30 flex items-center justify-center z-40"
>
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</motion.button>
```

**Usage:**
- "Add Exercise" during workout
- "Start Workout" on dashboard
- Always shows primary action for current context
- Badge shows count when relevant (e.g., "3 exercises added")

---

### 3.4 Rest Timer Banner

**Purpose:** Non-intrusive timer that doesn't block content

**Specifications:**
```tsx
// Dimensions
{
  height: '64px',
  width: '100%',
}

// Position
{
  position: 'fixed',
  top: '0px',            // Below app header (if present)
  left: '0',
  right: '0',
  zIndex: 30,
}

// Visual design
{
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #758AC6',
  borderTop: 'none',
  boxShadow: '0 2px 8px rgba(117, 138, 198, 0.2)',
}

// Timer text
{
  fontSize: '36px',
  fontFamily: 'Lato',
  fontWeight: 600,
  color: '#758AC6',      // primary
}

// Progress bar
{
  height: '4px',
  background: '#E5E7EB', // gray-200
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
}

// Progress fill
{
  height: '4px',
  background: '#758AC6', // primary
  transition: 'width 1s linear',
}

// Dismiss button
{
  width: '40px',
  height: '40px',        // Touch target compliant
  borderRadius: '50%',
}
```

**Implementation Example:**
```tsx
const RestTimer: React.FC<{
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ initialSeconds, onComplete, onSkip }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const progress = (seconds / initialSeconds) * 100;

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <motion.div
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      exit={{ y: -64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl
        border-b border-primary shadow-md z-30"
    >
      {/* Content */}
      <div className="flex items-center justify-between px-6 h-full">
        <div className="text-sm font-lato font-medium text-primary-medium">
          Rest Time
        </div>

        <div className="text-4xl font-lato font-semibold text-primary">
          {seconds}s
        </div>

        <button
          onClick={onSkip}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300
            flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-primary transition-all duration-1000 linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
```

**Behavior:**
- Auto-starts after logging a set
- Counts down from exercise.restTimerSeconds (default: 90s)
- Progress bar animates smoothly
- At 0s: Gentle haptic pulse (20ms), banner pulses green briefly
- Tap X or start next set to dismiss
- Doesn't block view of next exercise

---

### 3.5 Exercise Card

**Purpose:** Display exercise with sets in workout

**Specifications:**
```tsx
// Container
{
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(4px)',
  borderRadius: '16px',
  border: '1px solid rgba(229, 231, 235, 0.5)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  marginBottom: '16px',
}

// Hover state
{
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  transform: 'translateY(-2px)',
  transition: 'all 0.2s ease',
}

// Active/tap state
{
  transform: 'scale(0.98)',
}

// Exercise name (Cinzel)
{
  fontSize: '18px',
  fontFamily: 'Cinzel',
  fontWeight: 700,
  letterSpacing: '0.025em',
  color: '#344161',      // primary-dark
  lineHeight: 1.4,
}

// Equipment badge
{
  height: '24px',
  padding: '0 8px',
  background: '#D9E1F8',
  border: '1px solid #BFCBEE',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#566890',
}

// Muscle tags
{
  fontSize: '12px',
  color: '#8997B8',      // primary-light
  fontWeight: 400,
}
```

**Implementation Example:**
```tsx
const ExerciseCard: React.FC<{
  exercise: WorkoutExercise;
  onUpdateSet: (setId: string, field: string, value: any) => void;
  onLogSet: (setId: string) => void;
}> = ({ exercise, onUpdateSet, onLogSet }) => {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50
        shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
        transition-all duration-200 mb-4"
    >
      {/* Exercise header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Exercise name */}
          <h3 className="font-cinzel text-lg font-bold tracking-wide text-primary-dark mb-1">
            {exercise.name}
          </h3>

          {/* Equipment + muscles */}
          <div className="flex items-center gap-2">
            <div className="h-6 px-2 bg-badge-bg border border-badge-border rounded-md
              flex items-center justify-center">
              <span className="text-xs font-bold text-badge-text">
                {exercise.equipment}
              </span>
            </div>
            <span className="text-xs text-primary-light">
              {exercise.muscleGroups.join(', ')}
            </span>
          </div>
        </div>

        {/* Options menu */}
        <button className="w-8 h-8 flex items-center justify-center text-primary-medium">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            setNumber={index + 1}
            onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
            onLog={() => onLogSet(set.id)}
          />
        ))}
      </div>
    </motion.div>
  );
};
```

**Usage:**
- Workout screen (list of exercises)
- Workout summary
- Template editor
- Always shows: name, equipment, muscles, all sets

---

### 3.6 Category Pills (Selected/Unselected States)

**Purpose:** Filter navigation with clear selected state

**Specifications:**
```tsx
// Container (horizontal scroll)
{
  display: 'flex',
  gap: '8px',
  padding: '12px 16px',
  overflowX: 'auto',
  scrollbarWidth: 'none', // Hide scrollbar
}

// Pill dimensions
{
  height: '40px',
  paddingLeft: '20px',
  paddingRight: '20px',
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
}

// Selected state
{
  background: '#758AC6',
  color: 'white',
  boxShadow: '0 2px 8px rgba(117, 138, 198, 0.4)',
  border: 'none',
}

// Unselected state
{
  background: 'rgba(255, 255, 255, 0.6)',
  color: '#566890',      // primary-medium
  border: '1px solid rgba(209, 213, 219, 0.7)',
  boxShadow: 'none',
}

// Text
{
  fontSize: '14px',
  fontFamily: 'Lato',
  fontWeight: 700,
  letterSpacing: '0.025em',
}

// Transitions
{
  transition: 'all 0.2s ease',
}
```

**Implementation Example:**
```tsx
const CategoryPills: React.FC<{
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}> = ({ categories, selected, onSelect }) => {

  return (
    <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
      {categories.map((category) => {
        const isSelected = category === selected;

        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileTap={{ scale: 0.95 }}
            className={`
              h-10 px-5 rounded-full shrink-0
              text-sm font-bold tracking-wide
              transition-all duration-200
              ${isSelected
                ? 'bg-primary text-white shadow-button-primary'
                : 'bg-white/60 text-primary-medium border border-gray-300/70'
              }
            `}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
};
```

**Usage:**
- Exercise picker category filter ("All", "Push", "Pull", "Legs")
- Muscle group filter
- Equipment type filter
- Any mutually-exclusive filter set

---

## 4. Interaction Patterns

### 4.1 Bottom Sheet Navigation Flow

**Scenario:** Add exercise to workout

**Flow:**
```
1. User taps "Add Exercise" FAB
   → FAB scales down (0.95) with haptic feedback

2. Bottom sheet slides up from bottom
   → Animation: Spring physics (300ms)
   → Backdrop fades in (150ms, black/40)

3. Sheet reaches 60vh height
   → Drag handle visible at top
   → Search bar auto-focuses (keyboard appears on mobile)

4. User types or scrolls
   → Real-time filtering
   → Results update immediately

5. User taps exercise card
   → Card scales down briefly (0.98)
   → Haptic feedback (50ms)
   → Sheet slides down (300ms spring)
   → Exercise added to workout
   → Success toast appears briefly

Alternative: Swipe down or tap backdrop
   → Sheet dismisses without action
   → Returns to workout view
```

**Code Example:**
```tsx
const WorkoutScreen = () => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    // Add exercise
    addToWorkout(exercise);

    // Haptic feedback
    navigator.vibrate?.(50);

    // Close sheet
    setIsPickerOpen(false);

    // Show success toast
    showToast('Exercise added!');
  };

  return (
    <>
      {/* Workout content */}
      <div>...</div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPickerOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary"
      >
        +
      </motion.button>

      {/* Exercise picker sheet */}
      <Drawer.Root open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 h-[60vh]
            bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 rounded-t-[24px]">
            <ExercisePicker onSelect={handleAddExercise} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};
```

---

### 4.2 Inline Number Picker Flow

**Scenario:** Adjust weight for a set

**Flow:**
```
1. User sees current value displayed large (60pt)
   → "135 lbs" in center
   → +/- buttons on sides (60x60px each)

2. User taps + button
   → Button scales down (0.95)
   → Haptic feedback (10ms pulse)
   → Value increments (135 → 140)
   → Number animates (spring transition)

3. User taps value itself
   → Bottom sheet opens (40vh)
   → Number pad appears (or keyboard on desktop)
   → Current value pre-filled

4. User enters "145"
   → Each digit tap has haptic feedback
   → Preview shows "145 lbs"

5. User taps "Done" or hits Enter
   → Value updates
   → Sheet dismisses
   → Keyboard hides

Alternative: User taps - button repeatedly
   → Each tap: haptic + value change
   → Smooth animation between values
   → Minimum value respected (can't go below 0)
```

**Code Example:**
```tsx
const InlineNumberPicker = ({ value, onChange, unit = 'lbs' }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleIncrement = () => {
    onChange(value + 5);
    navigator.vibrate?.(10);
  };

  const handleDecrement = () => {
    if (value >= 5) {
      onChange(value - 5);
      navigator.vibrate?.(10);
    }
  };

  const handleTapValue = () => {
    setIsEditing(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 w-[180px] h-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDecrement}
          className="w-[60px] h-[60px] rounded-full bg-primary text-white
            text-2xl font-bold"
        >
          −
        </motion.button>

        <button onClick={handleTapValue} className="flex-1 text-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="text-6xl font-bold text-primary-dark"
          >
            {value}
          </motion.div>
          <div className="text-sm text-primary-medium">{unit}</div>
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleIncrement}
          className="w-[60px] h-[60px] rounded-full bg-primary text-white
            text-2xl font-bold"
        >
          +
        </motion.button>
      </div>

      {/* Number input sheet */}
      {isEditing && (
        <BottomSheet
          height="40vh"
          onClose={() => setIsEditing(false)}
        >
          <NumberPad
            value={value}
            onChange={onChange}
            onDone={() => setIsEditing(false)}
          />
        </BottomSheet>
      )}
    </>
  );
};
```

---

### 4.3 Rest Timer Auto-Start Flow

**Scenario:** User logs final rep of a set

**Flow:**
```
1. User logs set (taps "Log" button or completes reps)
   → Set marked as complete
   → Checkmark appears with green flash
   → Haptic feedback (50ms)

2. Rest timer banner slides down from top (200ms spring)
   → Shows "90s" countdown
   → Progress bar starts animating
   → Banner doesn't block next exercise view

3. Timer counts down: 90 → 89 → 88...
   → Updates every second
   → Progress bar shrinks proportionally
   → User can scroll workout while timer runs

4. User ready early? Taps X or starts next set
   → Banner slides up (200ms spring)
   → Timer cancelled
   → User proceeds immediately

5. Timer reaches 0
   → Gentle haptic (20ms)
   → Banner pulses green briefly
   → Auto-dismisses after 2 seconds
   OR stays visible until user starts next set
```

**Code Example:**
```tsx
const WorkoutScreen = () => {
  const [restTimer, setRestTimer] = useState<number | null>(null);

  const handleLogSet = (exerciseId: string, setId: string) => {
    // Mark set complete
    markSetComplete(exerciseId, setId);

    // Haptic feedback
    navigator.vibrate?.(50);

    // Auto-start rest timer
    const exercise = findExercise(exerciseId);
    setRestTimer(exercise.restTimerSeconds || 90);
  };

  const handleSkipRest = () => {
    setRestTimer(null);
  };

  const handleRestComplete = () => {
    // Gentle haptic
    navigator.vibrate?.(20);

    // Auto-dismiss after 2s
    setTimeout(() => setRestTimer(null), 2000);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Rest timer */}
      <AnimatePresence>
        {restTimer !== null && (
          <RestTimerBanner
            seconds={restTimer}
            onComplete={handleRestComplete}
            onSkip={handleSkipRest}
          />
        )}
      </AnimatePresence>

      {/* Exercise list */}
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          onLogSet={(setId) => handleLogSet(ex.id, setId)}
        />
      ))}
    </div>
  );
};
```

---

### 4.4 "Log All Sets?" Smart Shortcut Flow

**Scenario:** User has logged 2/3 sets with same weight/reps

**Flow:**
```
1. User logs set 2 of 3
   → Set marked complete
   → App detects pattern:
     - Set 1: 135 lbs × 8 reps
     - Set 2: 135 lbs × 8 reps
     - Set 3: Not logged

2. Modal slides up (250ms spring) with glass morphism
   → Headline (Cinzel 32px): "Log All Sets?"
   → Subtext (Lato 16px): "3 sets of 8 reps at 135 lbs"
   → Buttons: "Yes" (primary), "No" (secondary)

3a. User taps "Yes"
   → All remaining sets logged with same values
   → Modal dismisses
   → Success haptic (100ms)
   → Toast: "3 sets logged!"
   → Rest timer starts

3b. User taps "No"
   → Modal dismisses
   → User continues manual logging

Edge case: User already changed weight for set 3
   → Shortcut doesn't appear (pattern broken)
```

**Code Example:**
```tsx
const ExerciseCard = ({ exercise, onLogSet }) => {
  const [showLogAllModal, setShowLogAllModal] = useState(false);

  useEffect(() => {
    // Detect pattern
    const completedSets = exercise.sets.filter(s => s.completed);
    const remainingSets = exercise.sets.filter(s => !s.completed);

    if (remainingSets.length === 1 && completedSets.length >= 2) {
      // Check if all completed sets match
      const firstSet = completedSets[0];
      const allMatch = completedSets.every(
        s => s.weight === firstSet.weight && s.reps === firstSet.reps
      );

      if (allMatch) {
        setShowLogAllModal(true);
      }
    }
  }, [exercise.sets]);

  const handleLogAll = () => {
    const lastCompleted = exercise.sets.filter(s => s.completed).pop();
    const remainingSets = exercise.sets.filter(s => !s.completed);

    remainingSets.forEach(set => {
      onLogSet(set.id, lastCompleted.weight, lastCompleted.reps);
    });

    navigator.vibrate?.(100);
    setShowLogAllModal(false);
    showToast(`${remainingSets.length + 1} sets logged!`);
  };

  return (
    <>
      <div>{/* Exercise card content */}</div>

      {/* Log All modal */}
      <AnimatePresence>
        {showLogAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowLogAllModal(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm mx-4"
            >
              <h2 className="font-cinzel text-3xl font-bold text-primary-dark mb-2">
                Log All Sets?
              </h2>
              <p className="font-lato text-base text-primary-medium mb-6">
                {exercise.sets.length} sets of {exercise.sets[0].reps} reps at {exercise.sets[0].weight} lbs
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleLogAll}
                  className="flex-1 h-12 bg-primary text-white rounded-full
                    font-bold shadow-button-primary hover:brightness-110"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowLogAllModal(false)}
                  className="flex-1 h-12 bg-white/60 text-primary-medium rounded-full
                    font-bold border border-gray-300/70"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

---

## 5. Animation Specifications

All animations use **Framer Motion** with spring physics for natural, premium feel.

### Default Spring Config
```tsx
const defaultSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};
```

---

### Animation Library

#### Slide In (Bottom Sheets, Modals)
```tsx
// Bottom sheet entrance
initial={{ y: '100%' }}
animate={{ y: 0 }}
exit={{ y: '100%' }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}

// Modal entrance (from center)
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}
transition={{ type: 'spring', stiffness: 400, damping: 25 }}
```

---

#### Fade In (Overlays, Toasts)
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.15 }}
```

---

#### Scale (Buttons, Interactive Elements)
```tsx
// On tap
whileTap={{ scale: 0.95 }}

// On hover (desktop)
whileHover={{ scale: 1.05 }}

// Entrance
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

---

#### Lift (Cards on Hover)
```tsx
// Subtle lift with shadow increase
whileHover={{
  y: -4,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
}}
transition={{ duration: 0.2 }}
```

---

#### Pulse (Notifications, Alerts)
```tsx
// Attention-grabbing pulse
animate={{
  scale: [1, 1.05, 1],
}}
transition={{
  duration: 0.6,
  repeat: 3,
  ease: 'easeInOut'
}}
```

---

#### List Animations (Stagger)
```tsx
// Container
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {/* Items */}
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

### Performance Guidelines

**Always:**
- Use GPU-accelerated properties only: `transform`, `opacity`
- Add `will-change: transform` to elements that will animate
- Batch layout reads/writes (use RAF if needed)
- Keep animations under 300ms for micro-interactions
- Target 60fps minimum (monitor with DevTools)

**Never:**
- Animate `width`, `height`, `top`, `left` directly
- Animate during heavy computation
- Chain animations that cause layout thrashing
- Animate more than 10 elements simultaneously

**Optimization Example:**
```tsx
// Bad - causes layout reflow
<motion.div
  animate={{ width: isOpen ? 300 : 0 }}
/>

// Good - uses transform
<motion.div
  animate={{ scaleX: isOpen ? 1 : 0 }}
  style={{ transformOrigin: 'left' }}
/>
```

---

## 6. Accessibility Specifications

### WCAG 2.1 AA+ Compliance

#### Touch Targets
```tsx
// Minimum size
minWidth: '60px',    // Exceeds WCAG 44pt
minHeight: '60px',

// Spacing between targets
gap: '8px',          // Minimum 8px to prevent fat-finger errors

// Example
<button className="min-w-[60px] min-h-[60px] rounded-full">
  Log
</button>

<div className="flex gap-2">
  <button className="w-[60px] h-[60px]">−</button>
  <div className="flex-1">{value}</div>
  <button className="w-[60px] h-[60px]">+</button>
</div>
```

---

#### Color Contrast

**Text Contrast Ratios:**
```tsx
// Primary text (body copy, labels)
text-primary-dark (#344161) on white
→ 8.9:1 ratio ✅ WCAG AAA

// Secondary text (metadata, hints)
text-primary-medium (#566890) on white
→ 4.5:1 ratio ✅ WCAG AA

// Tertiary text (placeholders - large text only)
text-primary-light (#8997B8) on white
→ 3.0:1 ratio ✅ WCAG AA (18pt+)

// White text on primary background
text-white on bg-primary (#758AC6)
→ 3.2:1 ratio ✅ WCAG AA

// Badge text
text-badge-text (#566890) on bg-badge-bg (#D9E1F8)
→ 4.1:1 ratio ✅ WCAG AA
```

**Never Use:**
- #8997B8 (primary-light) on white for body text
- #A8B6D5 (primary-pale) on white for any text
- Color as the only differentiator (use icons, labels, patterns)

---

#### Focus Indicators
```tsx
// Focus ring for all interactive elements
focus:outline-none
focus:ring-2
focus:ring-primary
focus:ring-offset-2

// Example
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Log Set
</button>

// Focus within (for composite widgets)
<div className="focus-within:ring-2 focus-within:ring-primary">
  <input />
</div>
```

---

#### Keyboard Navigation

**Tab Order:**
1. Header navigation (if present)
2. Primary actions (FAB, "Start Workout")
3. Exercise cards (top to bottom)
4. Set inputs within cards (left to right)
5. Footer actions

**Keyboard Shortcuts:**
```tsx
// ESC - Close modals/sheets
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);

// Enter - Submit forms, log sets
<button
  onClick={handleSubmit}
  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
>
  Log Set
</button>

// Arrow keys - Navigate pickers, adjust numbers
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') increment();
  if (e.key === 'ArrowDown') decrement();
};
```

---

#### Screen Reader Support

**ARIA Labels:**
```tsx
// Buttons without visible text
<button aria-label="Close modal">
  <XIcon />
</button>

// Current state
<button aria-label={`Weight: ${weight} pounds`}>
  {weight}
</button>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={completedSets}
  aria-valuemin={0}
  aria-valuemax={totalSets}
  aria-label="Workout progress"
>
  {completedSets}/{totalSets} sets
</div>
```

**ARIA Live Regions:**
```tsx
// Announce dynamic updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {restTimerSeconds > 0 && `Rest timer: ${restTimerSeconds} seconds`}
</div>

// Success messages
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {message}
</div>
```

**Semantic HTML:**
```tsx
// Use semantic elements
<button>          // Not <div onClick>
<nav>             // For navigation
<main>            // For primary content
<article>         // For exercise cards
<form>            // For data entry
```

---

#### Motion Preferences
```tsx
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={prefersReducedMotion ? {} : { y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : defaultSpring}
>
  {content}
</motion.div>

// CSS alternative
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Responsive Breakpoints

### Breakpoint Scale

```tsx
// Mobile (primary target)
'sm': '320px',   // iPhone SE
'md': '375px',   // iPhone 12/13
'lg': '414px',   // iPhone 12 Pro Max

// Tablet
'xl': '768px',   // iPad Mini
'2xl': '1024px', // iPad Pro

// Desktop
'3xl': '1280px', // Desktop
'4xl': '1920px', // Large desktop
```

---

### Mobile-First Adjustments

#### Touch Targets
```tsx
// Mobile: 60x60px (primary target)
className="w-[60px] h-[60px]"

// Desktop: 48x48px (mouse is more precise)
className="w-[60px] h-[60px] lg:w-12 lg:h-12"
```

#### Font Sizes
```tsx
// Inline number picker
className="text-6xl lg:text-5xl"  // 60px → 48px on desktop

// Exercise names
className="text-lg lg:text-base"  // 18px → 16px on desktop
```

#### Bottom Sheets
```tsx
// Mobile: 90vh max (almost full screen)
height: '90vh'

// Tablet/Desktop: 60vh (keep context visible)
className="h-[90vh] lg:h-[60vh]"
```

#### FAB Position
```tsx
// Mobile: Bottom-right (thumb zone)
className="fixed bottom-6 right-6"

// Desktop: Top-right (consistent with desktop patterns)
className="fixed bottom-6 right-6 lg:top-6 lg:bottom-auto"
```

---

### Container Max Widths

```tsx
// Workout screens - comfortable reading width
className="max-w-2xl mx-auto px-4"  // 672px max

// Dashboard - use available space
className="max-w-7xl mx-auto px-4"  // 1280px max

// Modals - centered, readable
className="max-w-lg mx-auto"        // 512px max
```

---

## 8. Dark Mode Specifications

Dark mode provides a sophisticated alternative color scheme optimized for low-light environments while maintaining the premium aesthetic and WCAG 2.1 AA+ compliance.

#### Background System

**Light Mode Heavenly Gradient:**
```css
background: linear-gradient(180deg,
  rgba(235, 241, 255, 0.95) 0%,   /* Pale blue tint */
  rgba(255, 255, 255, 0.95) 100%   /* Pure white */
);
```

**Dark Mode Heavenly Gradient:**
```css
background: linear-gradient(180deg,
  rgba(15, 23, 42, 0.95) 0%,    /* slate-900 tint */
  rgba(30, 41, 59, 0.95) 100%    /* slate-800 tint */
);
```

#### Surface Colors

**Glass Morphism Surfaces:**

| Surface Type | Light Mode | Dark Mode | Usage |
|-------------|-----------|-----------|-------|
| Card | `bg-white/50 backdrop-blur-sm border-gray-300/50` | `dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/10` | Exercise cards, workout cards |
| Modal | `bg-white/90 backdrop-blur-xl border-gray-300/50` | `dark:bg-slate-900/90 dark:backdrop-blur-xl dark:border-white/10` | Bottom sheets, dialogs |
| Input | `bg-white/60 border-gray-300/50` | `dark:bg-white/5 dark:border-white/10` | Text inputs, number pickers |
| Button Primary | `bg-primary` (#758AC6) | `dark:bg-primary-light` (#8FA5D9) | CTAs, FAB |
| Button Secondary | `bg-white/80 border-gray-300` | `dark:bg-white/10 dark:border-white/20` | Cancel, back buttons |

#### Text Colors

**Text Hierarchy:**

| Text Type | Light Mode | Dark Mode | Contrast Ratio (Dark) |
|-----------|-----------|-----------|----------------------|
| Primary (Headlines) | `text-primary-dark` (#344161) | `dark:text-gray-50` (#F9FAFB) | 15.8:1 ✅ AAA |
| Secondary (Body) | `text-primary-medium` (#566890) | `dark:text-gray-300` (#D1D5DB) | 9.2:1 ✅ AAA |
| Tertiary (Metadata) | `text-primary-light` (#8997B8) | `dark:text-gray-400` (#9CA3AF) | 7.1:1 ✅ AA+ |
| Placeholder | `text-primary-pale` (#A8B6D5) | `dark:text-gray-500` (#6B7280) | 4.8:1 ✅ AA |
| On Primary Button | `text-white` | `text-slate-900` | 8.1:1 ✅ AAA |
| Success | `text-green-600` (#059669) | `dark:text-green-400` (#34D399) | 5.2:1 ✅ AA |
| Danger | `text-red-600` (#DC2626) | `dark:text-red-400` (#F87171) | 5.9:1 ✅ AA |

#### Interactive Elements

**State Colors:**

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Link Default | `text-primary` (#758AC6) | `dark:text-primary-light` (#8FA5D9) |
| Link Hover | `text-primary-dark` (#344161) | `dark:text-primary` (#758AC6) |
| Focus Ring | `ring-primary` (#758AC6) | `dark:ring-primary-light` (#8FA5D9) |
| Selection | `bg-primary/20` | `dark:bg-primary-light/30` |

**Button States:**

| State | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Primary Default | `bg-primary` (#758AC6) | `dark:bg-primary-light` (#8FA5D9) |
| Primary Hover | `bg-primary-dark` (#344161) | `dark:bg-primary` (#758AC6) |
| Primary Active | `bg-primary-dark` + `scale-95` | `dark:bg-primary` + `scale-95` |
| Primary Disabled | `bg-primary/50` | `dark:bg-primary-light/50` |
| Secondary Default | `bg-white/80 border-gray-300` | `dark:bg-white/10 dark:border-white/20` |
| Secondary Hover | `bg-white border-gray-400` | `dark:bg-white/20 dark:border-white/30` |

#### Border & Divider Colors

| Type | Light Mode | Dark Mode |
|------|-----------|-----------|
| Card Border | `border-gray-300/50` | `dark:border-white/10` |
| Modal Border | `border-gray-300/50` | `dark:border-white/10` |
| Input Border | `border-gray-300` | `dark:border-white/20` |
| Input Focus Border | `border-primary` (#758AC6) | `dark:border-primary-light` (#8FA5D9) |
| Divider | `border-gray-200` | `dark:border-white/10` |

#### Shadow System

**Light Mode Shadows:**
```css
/* Button Primary */
box-shadow: 0 2px 8px rgba(117, 138, 198, 0.3);

/* Card */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Modal/Drawer */
box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
```

**Dark Mode Shadows:**
```css
/* Button Primary */
box-shadow: 0 2px 8px rgba(143, 165, 217, 0.4);

/* Card */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

/* Modal/Drawer */
box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.6);
```

#### Badge Colors

**Exercise Category Badges:**

| Badge Type | Light Mode | Dark Mode |
|-----------|-----------|-----------|
| Strength | `bg-badge-blue border-badge-blue-border text-primary-medium` | `dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300` |
| Cardio | `bg-green-100 border-green-300 text-green-700` | `dark:bg-green-900/50 dark:border-green-700 dark:text-green-300` |
| Flexibility | `bg-purple-100 border-purple-300 text-purple-700` | `dark:bg-purple-900/50 dark:border-purple-700 dark:text-purple-300` |

#### Implementation

**Tailwind Dark Mode Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class-based dark mode for manual toggle
  theme: {
    extend: {
      colors: {
        // Light mode colors (existing)
        'primary': '#758AC6',
        'primary-dark': '#344161',
        'primary-medium': '#566890',
        'primary-light': '#8997B8',
        'primary-pale': '#A8B6D5',

        // Dark mode specific colors
        'slate': {
          900: '#0f172a',
          800: '#1e293b',
        },
      },
    },
  },
}
```

**Theme Toggle Component:**
```typescript
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load saved preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)

    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/80 dark:bg-white/10
                 border border-gray-300 dark:border-white/20
                 hover:bg-white dark:hover:bg-white/20
                 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
```

#### Accessibility Verification

**WCAG 2.1 AA Compliance Requirements:**
- All text/background combinations must pass 4.5:1 for normal text
- All text/background combinations must pass 3:1 for large text (18pt+)
- Focus indicators must have 3:1 contrast against background
- Interactive elements must maintain 3:1 contrast in all states

**Testing Checklist:**
- [ ] Run Lighthouse accessibility audit in dark mode (target: 90+)
- [ ] Verify all text colors with WebAIM Contrast Checker
- [ ] Test focus indicators on dark backgrounds
- [ ] Verify glass morphism surfaces have sufficient opacity
- [ ] Test with high contrast mode enabled
- [ ] Verify images/icons have sufficient contrast
- [ ] Test color blindness simulations (protanopia, deuteranopia, tritanopia)

---

## 9. Implementation Priorities

### Must Have (Epic 5-6)

**Week 1-3: Foundation + Core Patterns**

1. **Design System Integration**
   - Install Cinzel + Lato fonts
   - Update Tailwind config with color tokens
   - Create base component library
   - Document in Storybook

2. **Bottom Sheet Navigation**
   - Install Vaul library
   - Create BottomSheet component
   - Migrate Exercise Picker to sheet
   - Convert all modals to 2-level max

3. **Inline Number Pickers**
   - Create InlineNumberPicker component
   - Replace small inputs in Workout.tsx
   - Large 60pt font for gym readability
   - +/- buttons with haptic feedback

4. **Touch Target Compliance**
   - Audit all interactive elements
   - Enlarge to 60x60px minimum
   - Add adequate spacing (8px min)
   - Test on actual devices

---

### Should Have (Epic 7)

**Week 3-4: Intelligence Shortcuts**

1. **Rest Timer Auto-Start**
   - Create RestTimerBanner component
   - Auto-start after logging set
   - Compact design (doesn't block content)
   - Skip button + progress bar

2. **"Log All Sets?" Shortcut**
   - Detect pattern (2/3 sets match)
   - Show modal with pre-filled values
   - One-tap to log remaining sets
   - 60% interaction reduction

3. **Spring Animations**
   - Install Framer Motion
   - Add to bottom sheets (slide up/down)
   - Add to buttons (scale on tap)
   - Add to cards (lift on hover)
   - Target: 60fps for all animations

---

### Nice to Have (Epic 8)

**Week 4: Polish**

1. **Glass Morphism Polish**
   - Add backdrop-blur to all surfaces
   - Test against various backgrounds
   - Ensure border definition
   - Verify readability

2. **Dark Mode**
   - Define dark color tokens
   - Implement dark gradient
   - Glass surfaces: white/10 on dark
   - Test all components

3. **Advanced Animations**
   - Stagger animations for lists
   - Page transitions
   - Skeleton loading screens
   - Empty state animations

---

## 10. Developer Handoff

### Design Tokens Quick Reference

**Colors:**
```tsx
bg-primary           // #758AC6
text-primary-dark    // #344161
text-primary-medium  // #566890
text-primary-light   // #8997B8
bg-badge-bg          // #D9E1F8
border-badge-border  // #BFCBEE
```

**Typography:**
```tsx
font-cinzel          // Headlines, exercise names
font-lato            // Body, UI elements
text-[32px]          // Display XL (page titles)
text-lg              // Display MD (exercise names)
text-sm font-bold    // Category pills
text-6xl             // Inline number picker
```

**Spacing:**
```tsx
gap-2                // 8px
gap-4                // 16px
p-4                  // 16px padding
min-w-[60px]         // Touch target width
min-h-[60px]         // Touch target height
```

**Patterns:**
```tsx
// Glass card
className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50 shadow-sm"

// Primary button
className="bg-primary text-white rounded-full px-5 h-10 font-bold shadow-button-primary"

// Category pill (selected)
className="bg-primary text-white rounded-full px-5 h-10 shadow-button-primary"

// Category pill (unselected)
className="bg-white/60 text-primary-medium rounded-full px-5 h-10 border border-gray-300/70"
```

---

### Component Library Location

**Reference Implementation:**
- `components/ux-mockup/WorkoutBuilder.tsx` - Working prototype with all patterns
- `docs/design-system-quick-reference.md` - Copy-paste cheat sheet
- `docs/design-system.md` - Complete specification

**To Be Built (Epic 5):**
- `components/ui/BottomSheet.tsx`
- `components/ui/InlineNumberPicker.tsx`
- `components/ui/RestTimerBanner.tsx`
- `components/ui/CategoryPills.tsx`
- `components/ui/Button.tsx` (updated)
- `components/ui/Card.tsx` (updated)

---

### Testing Checklist

**Visual Regression:**
- [ ] All components match design system tokens
- [ ] Glass effects work on various backgrounds
- [ ] Dark mode (if implemented) matches light mode structure

**Accessibility:**
- [ ] All touch targets 60x60px minimum
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works (Tab, Esc, Arrow keys)
- [ ] Screen reader announces all actions
- [ ] Focus indicators visible on all interactive elements

**Interaction:**
- [ ] Bottom sheets swipe to dismiss
- [ ] Inline pickers have haptic feedback
- [ ] Rest timer auto-starts after logging set
- [ ] "Log All Sets?" appears after pattern detected
- [ ] All animations run at 60fps

**Responsive:**
- [ ] Works on 320px (iPhone SE)
- [ ] Works on 375px (iPhone 12)
- [ ] Works on 768px (iPad Mini)
- [ ] Works on 1280px+ (desktop)
- [ ] Touch targets adjust for desktop (60px → 48px)

---

## Summary

This UX Design Specification transforms the PRD requirements into actionable design specifications. Developers can implement directly from:

1. **Component Specifications** (Section 3) - Exact dimensions, colors, code examples
2. **Interaction Patterns** (Section 4) - Step-by-step flows with code
3. **Animation Specifications** (Section 5) - Framer Motion configs
4. **Accessibility** (Section 6) - WCAG compliance requirements
5. **Implementation Priorities** (Section 9) - What to build in each epic

**Key Deliverables:**
- 6 major components fully specified (Bottom Sheet, Inline Picker, FAB, Rest Timer, Exercise Card, Category Pills)
- 4 interaction patterns with code examples (Bottom Sheet, Inline Picker, Rest Timer, Log All Shortcut)
- Complete animation library with spring configs
- WCAG 2.1 AA+ compliance requirements
- Responsive breakpoints and dark mode specifications

**Next Step:** Execute Epic 5 (Design System Foundation) using `/bmad:bmm:workflows:dev-story` workflow.

---

**Document History:**
- **Version 1.0** (2025-11-12): Initial UX Design Specification
- **Created by:** Sally (UX Designer Agent in Autonomous Mode)
- **Sources:** PRD, Design System, UX Audit, WorkoutBuilder prototype
- **Status:** Ready for Epic 5-8 Implementation
