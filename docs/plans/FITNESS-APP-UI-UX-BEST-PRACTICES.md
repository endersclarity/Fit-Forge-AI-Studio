# Fitness App Workout Builder UI/UX Best Practices

**Comprehensive research-backed guidance for building modern, polished fitness app interfaces**

Last Updated: 2025-11-12

---

## Table of Contents

1. [Modern Bottom Sheet Patterns](#modern-bottom-sheet-patterns)
2. [Touch-Friendly Number Pickers](#touch-friendly-number-pickers)
3. [Animation & Micro-interactions](#animation--micro-interactions)
4. [Design System Tokens](#design-system-tokens)
5. [Component Libraries](#component-libraries)
6. [Complete Implementation Guide](#complete-implementation-guide)

---

## Modern Bottom Sheet Patterns

### Recommended Libraries

#### 1. Vaul (Primary Recommendation)
**Authority Level: Industry Standard - Built by Emil Kowalski**

```bash
npm install vaul
```

**Why Vaul?**
- Built specifically to recreate iOS Sheet experience on web
- Based on Radix Dialog primitive (accessibility built-in)
- Smooth animations with background scaling
- Swipe-to-dismiss gestures
- TypeScript support

**Implementation Example:**

```tsx
import { Drawer } from 'vaul';

function WorkoutDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Add Exercise
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] h-[80%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-white rounded-t-[24px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
            <Drawer.Title className="font-bold text-2xl mb-4">
              Select Exercise
            </Drawer.Title>
            {/* Content */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

**Best Practices from Research:**

1. **Accessibility** (WAI-ARIA Compliance)
   - Use `aria-hidden` on background content when drawer is open
   - Enable focus trapping (Vaul handles this automatically)
   - Ensure keyboard navigation works for all interactive elements

2. **Snap Points Configuration**
   ```tsx
   <Drawer.Root snapPoints={[0.4, 0.7, 1]}>
     {/* Drawer content */}
   </Drawer.Root>
   ```
   - Always use ascending order: `[0.4, 0.7, 1]` not `[1, 0.7, 0.4]`
   - Common patterns: 50% (half), 90% (almost full), 100% (full)

3. **Mobile Scroll Prevention**
   - Vaul includes 100ms timeout to prevent accidental dragging after reaching top
   - This addresses fast mobile scrolling behavior

4. **Background Scaling Effect**
   ```tsx
   <Drawer.Root shouldScaleBackground>
     {/* Creates iOS-like depth effect */}
   </Drawer.Root>
   ```

5. **Handle-Only Dragging** (for forms)
   ```tsx
   <Drawer.Root handleOnly>
     {/* Only drag handle triggers close, not content area */}
   </Drawer.Root>
   ```

#### 2. shadcn/ui Drawer (Alternative)
**Authority Level: Official shadcn/ui Component**

```bash
npx shadcn-ui@latest add drawer
```

**When to Use:**
- Already using shadcn/ui ecosystem
- Need responsive pattern (Dialog on desktop, Drawer on mobile)

**Responsive Pattern Example:**

```tsx
import { useMediaQuery } from '@/hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function ResponsiveDrawer({ children, trigger }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}
```

---

## Touch-Friendly Number Pickers

### Best Practices for Large Touch Targets

**WCAG 2.1 AA Guidance:**
- Level AA: No specific requirement (any size acceptable)
- Level AAA: Minimum 44x44 CSS pixels
- **WCAG 2.2 (Coming)**: 24x24 CSS pixels for Level AA

**Recommended: 48-60pt touch targets for fitness apps**

### Implementation Patterns

#### Pattern 1: Increment/Decrement Buttons

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

function NumberPicker({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit = 'kg'
}: NumberPickerProps) {
  const increment = () => {
    if (value < max) onChange(value + step);
  };

  const decrement = () => {
    if (value > min) onChange(value - step);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Decrement Button - 60px touch target */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={decrement}
        className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold active:bg-gray-300"
        aria-label="Decrease value"
      >
        −
      </motion.button>

      {/* Large Display - 60pt font */}
      <div className="flex flex-col items-center min-w-[120px]">
        <motion.div
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-bold text-gray-900"
        >
          {value}
        </motion.div>
        <span className="text-sm text-gray-500 uppercase mt-1">{unit}</span>
      </div>

      {/* Increment Button - 60px touch target */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={increment}
        className="w-[60px] h-[60px] rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white active:bg-blue-700"
        aria-label="Increase value"
      >
        +
      </motion.button>
    </div>
  );
}
```

**Key Features:**
- 60px touch targets exceed WCAG AAA guidelines
- 60pt font size for easy reading during workouts
- Motion feedback on button press
- Clear visual hierarchy with color coding

#### Pattern 2: Swipeable Number Picker

**Authority Level: Mobile-first UI Pattern**

```bash
npm install react-swipeable
```

```tsx
import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import { motion, useSpring } from 'framer-motion';

function SwipeNumberPicker({ value, onChange, min, max }: Props) {
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (value < max) onChange(value + 1);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    },
    onSwipedDown: () => {
      if (value > min) onChange(value - 1);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  return (
    <div
      {...handlers}
      className="select-none touch-none py-8"
    >
      <motion.div
        style={{ y }}
        className="text-7xl font-bold text-center"
      >
        {value}
      </motion.div>
      <div className="text-center text-sm text-gray-500 mt-2">
        Swipe up/down to adjust
      </div>
    </div>
  );
}
```

#### Pattern 3: Native Input with Mobile Keyboard

**Authority Level: HTML5 Best Practice**

```tsx
function NativeNumberInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-6xl font-bold text-center border-0 bg-transparent focus:outline-none w-full"
    />
  );
}
```

**Best Practices:**
- Use `inputMode="numeric"` for optimized mobile keyboard
- Add `pattern="[0-9]*"` for iOS to show number pad
- Avoid `type="tel"` unless for phone numbers
- Use `type="number"` for actual numeric values

---

## Animation & Micro-interactions

### Framer Motion Best Practices

**Authority Level: Official Framer Motion Documentation**

#### 1. Spring Animations (Physics-Based)

**Why Springs?** Feel more natural than duration-based animations for interactive UI.

```tsx
import { motion } from 'framer-motion';

// Basic spring animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  Workout Card
</motion.div>
```

**Spring Configuration Guide:**

| Property | Low | Medium | High | Use Case |
|----------|-----|--------|------|----------|
| `stiffness` | 100 | 300 | 500 | Slow/fluid vs Snappy/responsive |
| `damping` | 10 | 30 | 50 | Bouncy vs Smooth |
| `mass` | 0.1 | 1 | 2 | Light vs Heavy feel |

**Recommended Presets:**

```tsx
// Smooth, fluid (meditation/yoga apps)
const smooth = { type: "spring", stiffness: 100, damping: 30 };

// Responsive, energetic (fitness apps)
const energetic = { type: "spring", stiffness: 300, damping: 25 };

// Snappy, instant (micro-interactions)
const snappy = { type: "spring", stiffness: 500, damping: 30 };
```

#### 2. 60fps Performance Optimization

**Authority Level: Chrome DevTools Performance Standards**

**GPU-Accelerated Properties (Use These):**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (coming soon: full acceleration)

**AVOID Animating (Causes Repaints):**
- `width`, `height`
- `top`, `left`, `margin`
- `padding`
- `background-color` (use with caution)

**Example: Performant Card Animation**

```tsx
// GOOD - GPU accelerated
<motion.div
  whileHover={{
    scale: 1.05,
    rotateX: 5,
  }}
  whileTap={{
    scale: 0.98
  }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 30
  }}
  className="workout-card"
>
  {/* Card content */}
</motion.div>

// BAD - Triggers layout recalculation
<motion.div
  whileHover={{
    width: "110%",  // ❌ Avoid
    marginTop: 10,  // ❌ Avoid
  }}
>
  {/* Card content */}
</motion.div>
```

#### 3. Layout Animations (Advanced)

**Authority Level: Framer Motion FLIP technique**

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function WorkoutList({ exercises }: Props) {
  return (
    <AnimatePresence>
      {exercises.map((exercise) => (
        <motion.div
          key={exercise.id}
          layout // Automatically animates layout changes
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            layout: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="exercise-card"
        >
          {exercise.name}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

#### 4. Gesture Animations

```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

function SwipeableCard({ onSwipeComplete }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 150) {
          onSwipeComplete(offset.x > 0 ? 'right' : 'left');
        }
      }}
      style={{ x, rotate, opacity }}
      className="swipe-card"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

### Haptic Feedback (Web)

**Authority Level: Web Vibration API (MDN)**

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ❌ No support (iOS 18 has checkbox-only support)

```tsx
function hapticFeedback(pattern: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: [10, 20, 10],
    };
    navigator.vibrate(patterns[pattern]);
  }
}

// Usage in components
<button
  onClick={() => {
    hapticFeedback('medium');
    handleClick();
  }}
>
  Add Exercise
</button>
```

**Progressive Enhancement Pattern:**

```tsx
const useHaptics = () => {
  const isSupported = 'vibrate' in navigator;

  const trigger = (pattern: 'light' | 'medium' | 'heavy') => {
    if (!isSupported) return;

    const patterns = {
      light: 10,
      medium: 20,
      heavy: [10, 20, 10],
    };

    navigator.vibrate(patterns[pattern]);
  };

  return { trigger, isSupported };
};
```

---

## Design System Tokens

### 8pt Grid System

**Authority Level: Google Material Design & Apple iOS HIG**

**Why 8pt?**
- Scales perfectly across device pixel ratios (0.75x, 1x, 1.5x, 2x)
- Recommended by Apple and Google
- Creates consistent rhythm and hierarchy
- Simplifies designer-developer handoff

### Spacing Scale

**Recommended Implementation:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      '0': '0',
      '1': '0.125rem',  // 2px - micro spacing
      '2': '0.25rem',   // 4px - half-step for icons
      '3': '0.5rem',    // 8px  - base unit
      '4': '1rem',      // 16px
      '5': '1.5rem',    // 24px
      '6': '2rem',      // 32px
      '8': '2.5rem',    // 40px
      '10': '3rem',     // 48px
      '12': '4rem',     // 64px
      '16': '6rem',     // 96px
      '20': '8rem',     // 128px
    },
  },
};
```

**Usage Examples:**

```tsx
// Padding/Margins always multiples of 8px
<div className="p-4">         {/* 16px */}
<div className="mt-6">        {/* 32px */}
<div className="gap-5">       {/* 24px */}

// Icons and small elements use 4px half-step
<div className="p-2">         {/* 4px around small icon */}
```

### Typography Scale

**Authority Level: Modular Scale System (7-level hierarchy)**

**Recommended Ratios:**
- **Minor Third (1.2)**: Subtle contrast, high readability
- **Major Third (1.25)**: Moderate contrast, versatile (Recommended)
- **Golden Ratio (1.618)**: High contrast, dramatic

**7-Level Implementation (Major Third):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontSize: {
      'xs': ['0.64rem', { lineHeight: '1rem' }],    // 10.24px - Labels
      'sm': ['0.8rem', { lineHeight: '1.25rem' }],  // 12.8px  - Small text
      'base': ['1rem', { lineHeight: '1.5rem' }],   // 16px    - Body
      'lg': ['1.25rem', { lineHeight: '1.75rem' }], // 20px    - H6
      'xl': ['1.563rem', { lineHeight: '2rem' }],   // 25px    - H5
      '2xl': ['1.953rem', { lineHeight: '2.25rem' }], // 31.25px - H4
      '3xl': ['2.441rem', { lineHeight: '2.5rem' }],  // 39px    - H3
      '4xl': ['3.052rem', { lineHeight: '3rem' }],    // 48.8px  - H2
      '5xl': ['3.815rem', { lineHeight: '3.5rem' }],  // 61px    - H1
      '6xl': ['4.768rem', { lineHeight: '4rem' }],    // 76px    - Display
      '7xl': ['5.96rem', { lineHeight: '4.5rem' }],   // 95px    - Hero
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
};
```

**Usage in Fitness App:**

```tsx
// Workout builder number display
<div className="text-7xl font-bold">315</div>

// Exercise name
<h3 className="text-3xl font-semibold">Barbell Squat</h3>

// Set/Rep labels
<span className="text-sm text-gray-500">SET 1</span>

// Body text
<p className="text-base">Instructions for proper form...</p>
```

### Color Palette (Fitness App Specific)

**Authority Level: Research from Fitbod, Strong, Apple Fitness+**

**Color Psychology:**
- **Blue**: Trust, calmness, professional (use for primary actions)
- **Green**: Health, growth, vitality (use for progress/success)
- **Red/Orange**: Energy, intensity (use for high-intensity workouts)
- **Purple**: Premium, motivation (use for achievements)

**Recommended Palette:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Neutrals (8pt inspired)
      white: '#FFFFFF',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },

      // Primary (Blue - Trust & Calm)
      primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6', // Main
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },

      // Success (Green - Progress)
      success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        500: '#22C55E', // Main
        700: '#15803D',
      },

      // Energy (Orange - Intensity)
      energy: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        500: '#F97316', // Main
        700: '#C2410C',
      },

      // Premium (Purple - Achievements)
      premium: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        500: '#A855F7', // Main
        700: '#7E22CE',
      },
    },
  },
};
```

### Shadow/Elevation System

**Authority Level: Material Design 3 + Tailwind CSS**

**Installation:**

```bash
npm install tailwindcss-elevation
```

**Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        // Material Design inspired
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-4': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-6': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation-8': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // Colored shadows for glass morphism
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [
    require('tailwindcss-elevation')(['responsive']),
  ],
};
```

**Usage Hierarchy:**

```tsx
// Cards at rest
<div className="shadow-elevation-2">

// Cards on hover
<div className="shadow-elevation-4 hover:shadow-elevation-6">

// Bottom sheets / Modals
<div className="shadow-elevation-8">

// Active/focused elements
<div className="shadow-glow-blue">

// Achievement badges
<div className="shadow-glow-green">
```

---

## Component Libraries

### Recommended Stack

**Authority Level: Industry Standard - React + TypeScript + Tailwind**

#### 1. shadcn/ui (Primary Recommendation)

**Why shadcn/ui?**
- Built on Radix UI (accessibility baked in)
- Copy/paste components (full ownership)
- Tailwind CSS styling
- TypeScript first
- No runtime bundle

```bash
# Initialize
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add drawer
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add slider
```

**Key Components for Fitness Apps:**

```tsx
// Button with loading state
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Start Workout
</Button>

// Card for exercise display
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Barbell Squat</CardTitle>
  </CardHeader>
  <CardContent>
    3 sets × 10 reps
  </CardContent>
</Card>

// Tabs for workout sections
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="strength">
  <TabsList>
    <TabsTrigger value="strength">Strength</TabsTrigger>
    <TabsTrigger value="cardio">Cardio</TabsTrigger>
  </TabsList>
  <TabsContent value="strength">...</TabsContent>
</Tabs>
```

#### 2. Radix UI Primitives (Foundation)

**Authority Level: Official Radix UI Documentation**

**When to Use Directly:**
- Need more control than shadcn/ui provides
- Building custom components
- Want headless UI primitives

**Key Accessibility Features:**
- WAI-ARIA compliant
- Keyboard navigation built-in
- Focus management automatic
- Screen reader support

**Example: Custom Slider for Weight Selection**

```tsx
import * as Slider from '@radix-ui/react-slider';

function WeightSlider({ value, onChange }: Props) {
  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={[value]}
      onValueChange={([val]) => onChange(val)}
      max={500}
      step={5}
      aria-label="Weight"
    >
      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
        <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb className="block w-8 h-8 bg-white shadow-elevation-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </Slider.Root>
  );
}
```

#### 3. Framer Motion (Animations)

```bash
npm install framer-motion
```

**Authority Level: Official Framer Motion Docs**

See [Animation & Micro-interactions](#animation--micro-interactions) section for detailed examples.

#### 4. React Swipeable (Gestures)

```bash
npm install react-swipeable
```

**Authority Level: 600+ projects on npm**

```tsx
import { useSwipeable } from 'react-swipeable';

function SwipeableExerciseCard({ onNext, onPrevious }: Props) {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrevious,
    trackMouse: true, // Desktop testing
    preventScrollOnSwipe: true,
  });

  return (
    <div {...handlers} className="exercise-card">
      {/* Card content */}
    </div>
  );
}
```

#### 5. Vaul (Bottom Sheets)

See [Modern Bottom Sheet Patterns](#modern-bottom-sheet-patterns) section.

---

## Complete Implementation Guide

### Full Component Example: Workout Builder UI

**File: `components/WorkoutBuilder.tsx`**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export function WorkoutBuilder() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Today's Workout</h1>
        <p className="text-base text-gray-600 mt-2">
          {exercises.length} exercises • {exercises.reduce((acc, ex) => acc + ex.sets, 0)} total sets
        </p>
      </header>

      {/* Exercise List */}
      <AnimatePresence>
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: index * 0.05
            }}
          >
            <ExerciseCard exercise={exercise} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Exercise Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 left-0 right-0 px-4"
      >
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full h-14 text-lg font-semibold shadow-elevation-6"
          size="lg"
        >
          Add Exercise
        </Button>
      </motion.div>

      {/* Exercise Selector Drawer */}
      <ExerciseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddExercise={(exercise) => {
          setExercises([...exercises, exercise]);
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="mb-4"
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="shadow-elevation-2 hover:shadow-elevation-4 transition-shadow cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{exercise.name}</CardTitle>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              ▼
            </motion.div>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>{exercise.sets} sets</span>
            <span>×</span>
            <span>{exercise.reps} reps</span>
            <span>@</span>
            <span className="font-semibold text-blue-600">{exercise.weight} kg</span>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CardContent>
                <SetEditor exercise={exercise} />
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Set Editor with Number Pickers
function SetEditor({ exercise }: { exercise: Exercise }) {
  const [weight, setWeight] = useState(exercise.weight);
  const [reps, setReps] = useState(exercise.reps);

  const haptic = (intensity: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity === 'light' ? 10 : 20);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Weight Picker */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Weight
        </label>
        <NumberPicker
          value={weight}
          onChange={(val) => {
            setWeight(val);
            haptic('light');
          }}
          min={0}
          max={500}
          step={5}
          unit="kg"
        />
      </div>

      {/* Reps Picker */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Reps
        </label>
        <NumberPicker
          value={reps}
          onChange={(val) => {
            setReps(val);
            haptic('light');
          }}
          min={1}
          max={50}
          step={1}
          unit="reps"
        />
      </div>

      {/* Save Button */}
      <Button
        className="w-full h-12"
        onClick={() => {
          haptic('medium');
          // Save logic
        }}
      >
        Save Changes
      </Button>
    </div>
  );
}

// Number Picker Component
interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

function NumberPicker({ value, onChange, min, max, step, unit }: NumberPickerProps) {
  const increment = () => {
    if (value < max) onChange(value + step);
  };

  const decrement = () => {
    if (value > min) onChange(value - step);
  };

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Decrement */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={decrement}
        disabled={value <= min}
        className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-elevation-2"
        aria-label={`Decrease ${unit}`}
      >
        −
      </motion.button>

      {/* Display */}
      <div className="flex flex-col items-center min-w-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-6xl font-bold text-gray-900 tabular-nums"
          >
            {value}
          </motion.div>
        </AnimatePresence>
        <span className="text-sm text-gray-500 uppercase tracking-wide mt-2">
          {unit}
        </span>
      </div>

      {/* Increment */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={increment}
        disabled={value >= max}
        className="w-[60px] h-[60px] rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-elevation-3 shadow-glow-blue"
        aria-label={`Increase ${unit}`}
      >
        +
      </motion.button>
    </div>
  );
}

// Exercise Drawer Component
interface ExerciseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
}

function ExerciseDrawer({ isOpen, onClose, onAddExercise }: ExerciseDrawerProps) {
  const exercises = [
    'Barbell Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
  ];

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 shadow-elevation-8">
          <div className="p-6 bg-white rounded-t-[24px] flex-1 overflow-auto">
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />

            {/* Title */}
            <Drawer.Title className="font-bold text-3xl mb-6 text-gray-900">
              Select Exercise
            </Drawer.Title>

            {/* Exercise List */}
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <motion.button
                  key={exercise}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(10);
                    onAddExercise({
                      id: Date.now().toString(),
                      name: exercise,
                      sets: 3,
                      reps: 10,
                      weight: 60,
                    });
                  }}
                  className="w-full p-5 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-lg font-medium transition-colors shadow-elevation-1 hover:shadow-elevation-2"
                >
                  {exercise}
                </motion.button>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Complete Tailwind Configuration

**File: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 8pt Grid Spacing
      spacing: {
        '0': '0',
        '1': '0.125rem',  // 2px
        '2': '0.25rem',   // 4px
        '3': '0.5rem',    // 8px
        '4': '1rem',      // 16px
        '5': '1.5rem',    // 24px
        '6': '2rem',      // 32px
        '8': '2.5rem',    // 40px
        '10': '3rem',     // 48px
        '12': '4rem',     // 64px
        '16': '6rem',     // 96px
        '20': '8rem',     // 128px
      },

      // Modular Typography Scale (Major Third - 1.25)
      fontSize: {
        'xs': ['0.64rem', { lineHeight: '1rem' }],
        'sm': ['0.8rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'xl': ['1.563rem', { lineHeight: '2rem' }],
        '2xl': ['1.953rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.441rem', { lineHeight: '2.5rem' }],
        '4xl': ['3.052rem', { lineHeight: '3rem' }],
        '5xl': ['3.815rem', { lineHeight: '3.5rem' }],
        '6xl': ['4.768rem', { lineHeight: '4rem' }],
        '7xl': ['5.96rem', { lineHeight: '4.5rem' }],
      },

      // Fitness App Color Palette
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          700: '#15803D',
        },
        energy: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#F97316',
          700: '#C2410C',
        },
        premium: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          500: '#A855F7',
          700: '#7E22CE',
        },
      },

      // Material Design Shadows
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-4': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-6': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation-8': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
      },

      // Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Package Dependencies

**File: `package.json` (relevant dependencies)**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "vaul": "^0.9.0",
    "react-swipeable": "^7.0.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.312.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

---

## Key Takeaways & Best Practices Summary

### Must-Have Features

1. **Bottom Sheets**
   - Use Vaul for iOS-like experience
   - Enable swipe-to-dismiss
   - Include background scaling
   - Ensure focus trapping

2. **Touch Targets**
   - Minimum 48x48px (preferably 60x60px)
   - Large, bold typography (48-60pt for workout numbers)
   - Generous spacing between interactive elements

3. **Animations**
   - Use spring physics (stiffness: 300, damping: 30)
   - Only animate `transform` and `opacity` for 60fps
   - Add haptic feedback on interactions (progressive enhancement)
   - Keep animations under 300ms for micro-interactions

4. **Design Tokens**
   - Follow 8pt grid system for all spacing
   - Use modular scale for typography (Major Third ratio)
   - Implement 6-8 elevation levels with shadows
   - Create semantic color palette with purpose

5. **Accessibility**
   - All components must be keyboard navigable
   - Include ARIA labels and roles
   - Maintain WCAG 2.1 AA compliance
   - Use semantic HTML

### Performance Checklist

- [ ] All animations use GPU-accelerated properties
- [ ] No layout thrashing (avoid animating width/height/margins)
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size < 200KB for UI components
- [ ] First contentful paint < 1.5s
- [ ] Components use `React.memo` where appropriate

### Accessibility Checklist

- [ ] Touch targets ≥ 48px
- [ ] Color contrast ratio ≥ 4.5:1 (text)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on icon-only buttons
- [ ] Screen reader tested

---

## Resources & Citations

### Official Documentation
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vaul](https://vaul.emilkowal.ski/)
- [Tailwind CSS](https://tailwindcss.com/)

### Standards & Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Web Vibration API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

### Research Sources
- Chrome DevTools Performance Standards
- CSS-Tricks: GPU Acceleration
- Medium: Fitbod UI/UX Case Study
- LambdaTest: CSS GPU Acceleration
- Algolia: 60fps Web Animations

---

**Document Version**: 1.0
**Last Research Date**: 2025-11-12
**Stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Framer Motion 11
