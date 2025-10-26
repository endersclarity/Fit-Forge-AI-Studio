# Design: Recovery Dashboard React Components

**Change ID:** `implement-recovery-dashboard-components`
**Status:** Draft
**Created:** 2025-10-25

---

## Overview

This document defines the technical architecture, component structure, API integration patterns, and design system for the Recovery Dashboard React implementation.

---

## Component Architecture

### Component Hierarchy

```
RecoveryDashboard
├── TopNav
│   ├── Logo
│   ├── Title
│   └── SettingsButton
├── HeroSection
│   ├── WorkoutRecommendation
│   └── LastWorkoutContext
├── MuscleHeatMap
│   ├── CollapsibleSection (PUSH)
│   │   └── MuscleCard × 3
│   ├── CollapsibleSection (PULL)
│   │   └── MuscleCard × 5
│   ├── CollapsibleSection (LEGS)
│   │   └── MuscleCard × 4
│   └── CollapsibleSection (CORE)
│       └── MuscleCard × 1
├── SmartRecommendations
│   ├── CategoryTabs
│   └── ExerciseRecommendationCard × N
├── BottomNav
│   └── NavItem × 5
└── FAB (Start Workout)
```

### Component Organization

```
/components
├── /ui (Base Components - Reusable)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── ProgressBar.tsx
│   └── Modal.tsx
│
├── /fitness (Domain Components - Fitness-Specific)
│   ├── MuscleCard.tsx
│   ├── StatusBadge.tsx
│   ├── ProgressiveOverloadChip.tsx
│   ├── ExerciseRecommendationCard.tsx
│   └── MuscleHeatMap.tsx
│
├── /layout (Layout Components - Screen Structure)
│   ├── TopNav.tsx
│   ├── BottomNav.tsx
│   ├── FAB.tsx
│   └── CollapsibleSection.tsx
│
├── /screens (Page Components)
│   └── RecoveryDashboard.tsx
│
└── /hooks (Data Layer)
    ├── useMuscleStates.ts
    ├── useExerciseRecommendations.ts
    └── useProgressiveOverload.ts
```

---

## Base Components (Phase 1)

### 1. Button Component

**Purpose:** Reusable button for all interactive actions

**Props Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}
```

**Variants:**
- **Primary:** `bg-primary text-white hover:bg-primary/90`
- **Secondary:** `bg-white/10 text-white hover:bg-white/20`
- **Ghost:** `bg-transparent text-white hover:bg-white/5`

**Sizes:**
- **sm:** `px-3 py-1.5 text-sm` (32px height)
- **md:** `px-4 py-2 text-base` (40px height)
- **lg:** `px-6 py-3 text-lg` (48px height)

**Accessibility:**
- Minimum 44×44px touch target
- Focus visible ring: `ring-2 ring-primary ring-offset-2`
- ARIA label support

---

### 2. Card Component

**Purpose:** Container for grouped content

**Props Interface:**
```typescript
interface CardProps {
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Styling:**
- Base: `bg-card-background rounded-lg`
- Elevations: `shadow-sm`, `shadow-md`, `shadow-lg`
- Hover: `hover:bg-white/5 transition-colors duration-300`

---

### 3. Badge Component

**Purpose:** Status indicators with semantic colors

**Props Interface:**
```typescript
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

**Variants:**
- **Success:** `bg-green-500/20 text-green-500`
- **Warning:** `bg-amber-500/20 text-amber-500`
- **Error:** `bg-red-500/20 text-red-500`
- **Info:** `bg-blue-500/20 text-blue-500`

**Shape:** Pill (rounded-full)

---

### 4. ProgressBar Component

**Purpose:** Visual indicator for muscle fatigue levels

**Props Interface:**
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  variant: 'success' | 'warning' | 'error';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}
```

**Color Mapping:**
- 0-33%: Green (success)
- 34-66%: Amber (warning)
- 67-100%: Red (error)

**Implementation:**
```typescript
function ProgressBar({ value, variant, height = 'md', animated = true }: ProgressBarProps) {
  const colorClass = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  }[variant];

  return (
    <div className={`bg-gray-700 rounded-full ${heightClass}`}>
      <div
        className={`${colorClass} rounded-full h-full ${animated ? 'transition-all duration-500 ease-in-out' : ''}`}
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
```

---

### 5. Modal Component

**Purpose:** Overlay dialogs for contextual actions

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Features:**
- Focus trap (trap focus within modal)
- ESC key closes modal
- Click backdrop closes modal
- ARIA dialog role
- Prevent body scroll when open

---

## Fitness Components (Phase 2)

### 1. MuscleCard Component

**Purpose:** Display individual muscle recovery state

**Props Interface:**
```typescript
interface MuscleCardProps {
  muscleName: string;
  fatiguePercent: number; // 0-100
  lastTrained: Date;
  recoveredAt: Date | null;
  onClick?: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Latissimus Dorsi              25%  │ ← Name (left) + % (right, bold)
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ ← ProgressBar (green)
│ Last trained: 3 days ago            │ ← Gray text, smaller
└─────────────────────────────────────┘
```

**Color Logic:**
```typescript
const getVariant = (fatiguePercent: number) => {
  if (fatiguePercent <= 33) return 'success';
  if (fatiguePercent <= 66) return 'warning';
  return 'error';
};
```

**Accessibility:**
- Tappable (min 44px height)
- Screen reader: "Latissimus Dorsi, 25% fatigued, ready to train, last trained 3 days ago"

---

### 2. StatusBadge Component

**Purpose:** Exercise recommendation quality indicator

**Props Interface:**
```typescript
interface StatusBadgeProps {
  status: 'EXCELLENT' | 'GOOD' | 'SUBOPTIMAL';
  size?: 'sm' | 'md' | 'lg';
}
```

**Variants:**
- **EXCELLENT:** Green + `check_circle` icon
- **GOOD:** Blue + `thumb_up` icon
- **SUBOPTIMAL:** Amber + `warning` icon

**Implementation:**
```typescript
const statusConfig = {
  EXCELLENT: {
    color: 'bg-green-500/20 text-green-500',
    icon: 'check_circle'
  },
  GOOD: {
    color: 'bg-blue-500/20 text-blue-500',
    icon: 'thumb_up'
  },
  SUBOPTIMAL: {
    color: 'bg-amber-500/20 text-amber-500',
    icon: 'warning'
  }
};
```

---

### 3. ProgressiveOverloadChip Component

**Purpose:** Show +3% suggestion with tooltip

**Props Interface:**
```typescript
interface ProgressiveOverloadChipProps {
  type: 'weight' | 'reps';
  currentValue: number;
  suggestedValue: number;
  unit: 'lbs' | 'kg' | 'reps';
}
```

**Layout:**
```
┌────────────────────┐
│ ↗ +3% reps: 31     │ ← Chip (blue background)
└────────────────────┘
     ↑
  Tooltip on hover:
  "Progressive overload: 30 → 31 reps (+3%)"
```

**CSS-Only Tooltip:**
```css
.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 300ms ease-out;
}
```

---

### 4. ExerciseRecommendationCard Component

**Purpose:** Complete exercise recommendation with all context

**Props Interface:**
```typescript
interface ExerciseRecommendationCardProps {
  exerciseName: string;
  status: 'EXCELLENT' | 'GOOD' | 'SUBOPTIMAL';
  muscleEngagements: Array<{
    muscle: string;
    percent: number;
    fatigueLevel: number;
  }>;
  lastPerformance: {
    reps: number;
    weight: number;
  };
  progressiveOverload: {
    type: 'weight' | 'reps';
    value: number;
  };
  equipment: string;
  explanation?: string; // For SUBOPTIMAL
  onClick?: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ Pull-ups                    [EXCELLENT] │ ← Name + StatusBadge
│                                         │
│ [Lats 85% 🔴] [Biceps 30% 🟢]         │ ← Muscle pills
│ ───────────────────────────────────────  │
│ Last: 30 reps @ 200lbs  [↗ +3% reps]  │ ← Last perf + chip
│ [🏋️ Pull-up Bar]                        │ ← Equipment
└─────────────────────────────────────────┘
```

**Muscle Pills:**
- Pill background color based on fatigue level
- Text always white for contrast
- Rounded-full with px-2 py-1

---

### 5. MuscleHeatMap Component

**Purpose:** Group 13 muscles into 4 categories

**Props Interface:**
```typescript
interface MuscleHeatMapProps {
  muscles: Array<{
    name: string;
    category: 'PUSH' | 'PULL' | 'LEGS' | 'CORE';
    fatiguePercent: number;
    lastTrained: Date;
    recoveredAt: Date | null;
  }>;
  onMuscleClick?: (muscleName: string) => void;
}
```

**Categories:**
- PUSH (3): Pectoralis Major, Anterior Deltoids, Triceps
- PULL (5): Latissimus Dorsi, Biceps, Rhomboids, Trapezius, Forearms
- LEGS (4): Quadriceps, Hamstrings, Glutes, Calves
- CORE (1): Abdominals

**Implementation:** Maps through muscles, groups by category, renders CollapsibleSection for each

---

## Layout Components (Phase 3)

### 1. CollapsibleSection Component

**Purpose:** Expandable/collapsible container for muscle categories

**Props Interface:**
```typescript
interface CollapsibleSectionProps {
  title: string;
  count?: number; // e.g., "PUSH (3)"
  defaultOpen?: boolean;
  children: React.ReactNode;
}
```

**Implementation:**
```typescript
function CollapsibleSection({ title, count, defaultOpen = false, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={isOpen} className="group">
      <summary
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between cursor-pointer"
      >
        <span className="text-lg font-bold">
          {title} {count && `(${count})`}
        </span>
        <span className={`material-symbols transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </summary>
      <div className={`mt-3 space-y-2 transition-all duration-500 ${isOpen ? 'animate-sweep' : ''}`}>
        {children}
      </div>
    </details>
  );
}
```

**Animation:**
```css
@keyframes sweep {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 2. TopNav Component

**Purpose:** Sticky header with app logo and settings

**Props Interface:**
```typescript
interface TopNavProps {
  onSettingsClick: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ 🏋️ Recovery Dashboard        ⚙️   │
└─────────────────────────────────────┘
```

**Styling:**
- Sticky: `sticky top-0 z-10`
- Background: `bg-background-dark/95 backdrop-blur-sm`
- Padding: `px-4 py-3`

---

### 3. BottomNav Component

**Purpose:** Primary navigation bar (5 items)

**Props Interface:**
```typescript
interface BottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}
```

**Navigation Items:**
```typescript
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'workout', label: 'Workout', icon: 'fitness_center' },
  { id: 'history', label: 'History', icon: 'bar_chart' },
  { id: 'exercises', label: 'Exercises', icon: 'menu_book' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];
```

**Styling:**
- Fixed: `fixed bottom-0 left-0 right-0`
- Background: `bg-card-background border-t border-white/10`
- Icons: 24px Material Symbols
- Active state: `text-primary`

---

### 4. FAB Component

**Purpose:** Floating action button for primary CTA

**Props Interface:**
```typescript
interface FABProps {
  icon: string; // Material Symbol name
  label: string; // ARIA label
  onClick: () => void;
  disabled?: boolean;
}
```

**Styling:**
- Position: `fixed bottom-24 right-6` (24px = 96px above bottom nav)
- Size: `w-16 h-16` (64×64px)
- Background: `bg-primary hover:bg-primary/90`
- Shadow: `shadow-2xl`
- Icon: `text-white text-3xl`
- Z-index: `z-50` (always on top)

---

## Data Layer (API Integration)

### 1. useMuscleStates Hook

**Purpose:** Fetch muscle recovery states from backend

**Implementation:**
```typescript
interface MuscleState {
  name: string;
  category: 'PUSH' | 'PULL' | 'LEGS' | 'CORE';
  fatiguePercent: number;
  lastTrained: string; // ISO date
  recoveredAt: string | null;
}

function useMuscleStates() {
  const [muscles, setMuscles] = useState<MuscleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/muscle-states')
      .then(res => res.json())
      .then(data => {
        setMuscles(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { muscles, loading, error };
}
```

**API Endpoint:**
```
GET /api/muscle-states
```

**Response:**
```json
{
  "muscles": [
    {
      "name": "Latissimus Dorsi",
      "category": "PULL",
      "fatiguePercent": 25,
      "lastTrained": "2025-10-22T10:30:00Z",
      "recoveredAt": "2025-10-23T12:00:00Z"
    },
    ...
  ]
}
```

---

### 2. useExerciseRecommendations Hook

**Purpose:** Fetch smart exercise recommendations

**Implementation:**
```typescript
interface ExerciseRecommendation {
  exerciseName: string;
  status: 'EXCELLENT' | 'GOOD' | 'SUBOPTIMAL';
  muscleEngagements: Array<{
    muscle: string;
    percent: number;
    fatigueLevel: number;
  }>;
  lastPerformance: {
    reps: number;
    weight: number;
  };
  progressiveOverload: {
    type: 'weight' | 'reps';
    value: number;
  };
  equipment: string;
  explanation?: string;
}

function useExerciseRecommendations(category?: string) {
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const url = category
      ? `/api/recommendations?category=${category}`
      : '/api/recommendations';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [category]);

  return { recommendations, loading, error };
}
```

**API Endpoint:**
```
GET /api/recommendations?category=PULL
```

**Response:**
```json
{
  "recommendations": [
    {
      "exerciseName": "Pull-ups",
      "status": "EXCELLENT",
      "muscleEngagements": [
        { "muscle": "Latissimus Dorsi", "percent": 85, "fatigueLevel": 25 },
        { "muscle": "Biceps", "percent": 30, "fatigueLevel": 30 }
      ],
      "lastPerformance": { "reps": 30, "weight": 200 },
      "progressiveOverload": { "type": "reps", "value": 31 },
      "equipment": "Pull-up Bar"
    },
    ...
  ]
}
```

---

## TypeScript Interfaces

### Core Types

```typescript
// Base types
export type ExerciseCategory = 'PUSH' | 'PULL' | 'LEGS' | 'CORE';
export type WorkoutVariation = 'A' | 'B';
export type ExerciseStatus = 'EXCELLENT' | 'GOOD' | 'SUBOPTIMAL';

// Muscle state
export interface MuscleState {
  name: string;
  category: ExerciseCategory;
  fatiguePercent: number;
  lastTrained: string; // ISO date
  recoveredAt: string | null;
}

// Exercise recommendation
export interface MuscleEngagement {
  muscle: string;
  percent: number;
  fatigueLevel: number;
}

export interface LastPerformance {
  reps: number;
  weight: number;
}

export interface ProgressiveOverload {
  type: 'weight' | 'reps';
  value: number;
}

export interface ExerciseRecommendation {
  exerciseName: string;
  status: ExerciseStatus;
  muscleEngagements: MuscleEngagement[];
  lastPerformance: LastPerformance;
  progressiveOverload: ProgressiveOverload;
  equipment: string;
  explanation?: string;
}

// Workout context
export interface WorkoutContext {
  recommended: string; // e.g., "PULL DAY B"
  lastWorkout: {
    name: string;
    daysAgo: number;
  };
}
```

---

## Accessibility Implementation

### Semantic HTML

```typescript
// RecoveryDashboard.tsx
<main role="main" aria-label="Recovery Dashboard">
  <header role="banner">
    <TopNav />
  </header>

  <section aria-labelledby="heat-map-title">
    <h2 id="heat-map-title">Muscle Recovery Heat Map</h2>
    <MuscleHeatMap />
  </section>

  <aside role="complementary" aria-label="Smart Recommendations">
    <SmartRecommendations />
  </aside>

  <nav role="navigation" aria-label="Primary">
    <BottomNav />
  </nav>
</main>
```

### ARIA Labels

**Icon-only buttons:**
```typescript
<button aria-label="Settings" onClick={onSettingsClick}>
  <span className="material-symbols" aria-hidden="true">settings</span>
</button>
```

**Progress bars:**
```typescript
<div
  role="progressbar"
  aria-label="Latissimus Dorsi fatigue level"
  aria-valuenow={25}
  aria-valuemin={0}
  aria-valuemax={100}
>
  {/* Visual bar */}
</div>
```

**Screen reader announcements:**
```typescript
<div aria-live="polite" aria-atomic="true">
  {muscleUpdated && `${muscleName} updated to ${fatiguePercent}% fatigue`}
</div>
```

### Keyboard Navigation

**Focus management:**
```typescript
// Tab order
1. Settings button (top nav)
2. Muscle category headers
3. Muscle cards (within expanded category)
4. Recommendation tabs
5. Recommendation cards
6. FAB button
7. Bottom nav items (1-5)
```

**Keyboard shortcuts:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ESC closes modals
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }

    // Enter/Space activates focused element
    // Handled by native button behavior
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isModalOpen]);
```

### Focus Indicators

```css
/* Visible focus rings (not on mouse click) */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Optimization

### React Optimization

**1. Memoization:**
```typescript
// MuscleCard - prevent re-renders if props unchanged
export const MuscleCard = React.memo(({
  muscleName,
  fatiguePercent,
  lastTrained,
  recoveredAt,
  onClick
}: MuscleCardProps) => {
  // Component implementation
});
```

**2. Key prop usage:**
```typescript
{muscles.map(muscle => (
  <MuscleCard
    key={muscle.name} // Stable key for React reconciliation
    {...muscle}
  />
))}
```

**3. Avoid inline functions:**
```typescript
// Bad: Creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// Good: Use useCallback or extract handler
const handleClick = useCallback(() => {
  handleAction(id);
}, [id]);

<button onClick={handleClick}>Click</button>
```

### Data Fetching Optimization

**1. Cache API responses:**
```typescript
const muscleCache = new Map();

function useMuscleStates() {
  const cached = muscleCache.get('muscles');
  if (cached && Date.now() - cached.timestamp < 60000) {
    return { muscles: cached.data, loading: false, error: null };
  }

  // Fetch fresh data...
}
```

**2. Offline support:**
```typescript
// Service worker caches API responses
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/muscle-states')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open('api-cache').then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});
```

### Bundle Size Optimization

**1. Code splitting:**
```typescript
// Lazy load non-critical components
const SettingsModal = lazy(() => import('./SettingsModal'));
```

**2. Tree shaking:**
```typescript
// Import only what's needed
import { useState, useEffect } from 'react'; // Good
// vs
import React from 'react'; // Imports entire library
```

---

## Testing Strategy

### Unit Tests (Components)

**Button.test.tsx:**
```typescript
describe('Button', () => {
  it('renders with correct variant class', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop true', () => {
    render(<Button disabled onClick={() => {}}>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**MuscleCard.test.tsx:**
```typescript
describe('MuscleCard', () => {
  it('displays correct fatigue percentage', () => {
    render(<MuscleCard muscleName="Latissimus Dorsi" fatiguePercent={25} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shows green progress bar when fatigue <= 33%', () => {
    render(<MuscleCard fatiguePercent={25} />);
    expect(screen.getByRole('progressbar')).toHaveClass('bg-green-500');
  });

  it('shows amber progress bar when fatigue 34-66%', () => {
    render(<MuscleCard fatiguePercent={50} />);
    expect(screen.getByRole('progressbar')).toHaveClass('bg-amber-500');
  });

  it('shows red progress bar when fatigue >= 67%', () => {
    render(<MuscleCard fatiguePercent={80} />);
    expect(screen.getByRole('progressbar')).toHaveClass('bg-red-500');
  });
});
```

### Integration Tests (Hooks)

**useMuscleStates.test.ts:**
```typescript
describe('useMuscleStates', () => {
  it('fetches muscle states from API', async () => {
    const mockData = [{ name: 'Lats', fatiguePercent: 25 }];
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => mockData
    });

    const { result, waitForNextUpdate } = renderHook(() => useMuscleStates());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.muscles).toEqual(mockData);
    expect(result.current.loading).toBe(false);
  });

  it('handles API errors gracefully', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const { result, waitForNextUpdate } = renderHook(() => useMuscleStates());

    await waitForNextUpdate();

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });
});
```

### E2E Tests (Cypress/Playwright)

**recovery-dashboard.spec.ts:**
```typescript
describe('Recovery Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('displays muscle heat map with 13 muscles', () => {
    cy.get('[data-testid="muscle-card"]').should('have.length', 13);
  });

  it('expands muscle category when clicked', () => {
    cy.contains('PULL (5)').click();
    cy.get('[data-testid="muscle-card"]').filter(':visible').should('have.length', 5);
  });

  it('filters recommendations by category', () => {
    cy.contains('Pull').click();
    cy.get('[data-testid="recommendation-card"]').each($card => {
      cy.wrap($card).should('contain', 'Pull');
    });
  });

  it('navigates with keyboard', () => {
    cy.get('body').tab(); // Focus first element
    cy.focused().should('have.attr', 'aria-label', 'Settings');

    cy.focused().tab(); // Next element
    cy.focused().should('contain', 'PUSH');
  });
});
```

---

## Rollback Plan

**If Issues Arise Post-Deployment:**

### Quick Disable (< 5 minutes)
```typescript
// Add feature flag in config
export const ENABLE_RECOVERY_DASHBOARD = process.env.ENABLE_DASHBOARD === 'true';

// In App.tsx
{ENABLE_RECOVERY_DASHBOARD ? (
  <RecoveryDashboard />
) : (
  <PlaceholderDashboard />
)}
```

### Partial Rollback
- Keep components, remove API integration (show mock data)
- Keep base components, rollback fitness components
- Keep everything, fix bugs independently

### Full Rollback
- Revert commits
- No database changes (frontend only)
- No data loss

---

## Success Criteria

**Definition of Done:**

- [ ] All base components render correctly in Storybook
- [ ] All fitness components display accurate data
- [ ] Dashboard assembles correctly with all sections
- [ ] API integration works (muscle states + recommendations)
- [ ] Color coding matches spec (green/amber/red thresholds)
- [ ] Collapsible sections animate smoothly (500ms)
- [ ] WCAG AAA compliance verified (WAVE, axe, Lighthouse)
- [ ] Keyboard navigation works (all interactive elements)
- [ ] Screen reader announces content correctly
- [ ] Dashboard loads in <1 second
- [ ] Works on mobile (iPhone SE, Pixel 5)
- [ ] Works across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Respects `prefers-reduced-motion`
- [ ] No console errors or warnings
- [ ] All tests pass (unit + integration + E2E)

---

*This design document serves as the technical specification for implementing the Recovery Dashboard React components. All implementation should follow these patterns and architectures.*
