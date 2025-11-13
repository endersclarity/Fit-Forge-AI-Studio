# FitForge UI/UX Redesign - Integration Architecture

**Project:** FitForge UI/UX Transformation 2025
**Created:** 2025-11-12
**Version:** 1.0
**Type:** Frontend-Only Integration Architecture
**Scope:** Epics 5-8 (Design System Foundation → Polish & Accessibility)

---

## Executive Summary

### Architectural Scope

**This is NOT a full system architecture** - it's an **Integration Architecture** showing how the UI redesign (Epics 5-8 from PRD) integrates with FitForge's existing brownfield codebase.

**What This Document Covers:**
- Frontend-only UI/UX transformation
- Progressive enhancement with feature flags
- Parallel operation (old + new UI coexist)
- Tailwind CDN → PostCSS migration
- Design system integration into 96 existing React components

**What This Document Does NOT Cover:**
- Backend API changes (none required - all 20+ endpoints unchanged)
- Database schema modifications (SQLite remains unchanged)
- New business logic (muscle intelligence services from Epics 1-4 already complete)

### Key Architectural Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Tailwind CDN → PostCSS** | Design tokens need compile-time control, CDN too limited | Requires build process update, enables custom tokens |
| **Feature Flag Strategy** | Gradual rollout minimizes risk, allows instant rollback | Temporary code duplication, cleanup needed post-launch |
| **Parallel Component Approach** | Old UI remains functional during migration | 2x component maintenance during transition |
| **Bottom Sheet Pattern (Vaul)** | Industry-standard mobile UX, reduces modal nesting | New dependency, learning curve for team |
| **No Backend Changes** | UI redesign independent of backend services | Frontend-only scope, faster deployment |

### Timeline & Risk Assessment

**Duration:** 3-4 sprints (4-6 weeks)
**Risk Level:** Medium (Tailwind migration, user adoption)
**Rollback Complexity:** Low (feature flag toggle)

**Critical Path Dependencies:**
1. Epic 5 (Design System) → Epic 6 (Core Interaction)
2. Epic 6 → Epic 7 (Intelligence Shortcuts)
3. Epics 5-7 → Epic 8 (Polish & Accessibility)

---

## 1. Current Architecture Analysis

### 1.1 Existing Technology Stack

**Frontend (Established Patterns):**
```typescript
// Technology Inventory
React: 19.2.0              // Modern concurrent features
TypeScript: 5.8.2          // Strict type checking enabled
Vite: 6.2.0                // HMR dev server (instant reload)
React Router DOM: 6.30.1   // Client-side routing
Tailwind CSS: CDN          // ⚠️ MIGRATION TARGET (CDN → PostCSS)
Framer Motion: 12.23.24    // ✅ Already installed (animations ready)
Vaul: 1.1.2                // ✅ Already installed (bottom sheets ready)
```

**Backend (Unchanged):**
```typescript
// No modifications required for UI redesign
Node.js + Express: 4.18.2
TypeScript: 5.3.3
better-sqlite3: 9.2.2      // Synchronous SQLite
```

**Development Environment:**
```yaml
# docker-compose.yml (existing configuration)
services:
  frontend:
    build: Dockerfile.dev   # Vite dev server with HMR
    ports: ["3000:3000"]    # MANDATORY - never change
    volumes:
      - ./components:/app/components  # Hot reload enabled
      - ./App.tsx:/app/App.tsx
      - ./index.tsx:/app/index.tsx

  backend:
    build: backend/Dockerfile.dev  # nodemon auto-restart
    ports: ["3001:3001"]           # MANDATORY - never change
    volumes:
      - ./backend:/app/backend     # Hot reload enabled
```

### 1.2 Current Component Structure

**96 React Components Across 9 Directories:**

```
components/
├── ui/                         # 13 primitives (Button, Card, Modal, Badge)
│   ├── Button.tsx             # ⚠️ NEEDS: rounded-full, new colors
│   ├── Card.tsx               # ⚠️ NEEDS: glass morphism
│   ├── Modal.tsx              # ⚠️ NEEDS: bottom sheet migration
│   └── Badge.tsx              # ⚠️ NEEDS: new badge colors
│
├── fitness/                    # 5 specialized components
│   ├── MuscleCard.tsx         # ⚠️ NEEDS: glass morphism
│   ├── StatusBadge.tsx        # ⚠️ NEEDS: new colors
│   ├── ProgressiveOverloadChip.tsx  # ⚠️ NEEDS: new pill styling
│   └── ExerciseRecommendationCard.tsx  # ⚠️ NEEDS: Cinzel typography
│
├── layout/                     # 3 layout components
│   ├── TopNav.tsx             # ⚠️ NEEDS: glass morphism
│   ├── FAB.tsx                # ⚠️ NEEDS: new shadow, primary color
│   └── CollapsibleSection.tsx # ⚠️ NEEDS: new borders
│
├── onboarding/                 # 4 wizard steps
│   ├── ProfileWizard.tsx      # ⚠️ NEEDS: Cinzel headlines
│   ├── NameStep.tsx           # ⚠️ NEEDS: glass inputs
│   ├── ExperienceStep.tsx     # ⚠️ NEEDS: new pill styling
│   └── EquipmentStep.tsx      # ⚠️ NEEDS: new pill styling
│
├── (root components)           # 15 major screens
│   ├── Dashboard.tsx          # ⚠️ NEEDS: glass cards, Cinzel, gradient bg
│   ├── Workout.tsx            # ⚠️ NEEDS: inline pickers, bottom sheets
│   ├── WorkoutBuilder.tsx     # ⚠️ NEEDS: bottom sheets, FAB
│   ├── ExerciseRecommendations.tsx  # ⚠️ NEEDS: new card styling
│   ├── RecoveryDashboard.tsx  # ⚠️ NEEDS: glass morphism
│   └── ... (10 more)
│
└── (specialized)               # 60+ feature components
    ├── ExercisePicker.tsx     # ⚠️ NEEDS: bottom sheet, glass search
    ├── QuickAdd.tsx           # ⚠️ NEEDS: bottom sheet navigation
    ├── MuscleVisualization.tsx # ⚠️ NEEDS: glass overlay
    └── ... (57 more)
```

### 1.3 Current Styling Patterns

**Tailwind CDN Configuration (index.html):**
```html
<!-- CURRENT: CDN with inline config -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'brand-cyan': '#22d3ee',      // ⚠️ TO BE REPLACED with #758AC6
          'brand-dark': '#0f172a',      // ⚠️ TO BE REPLACED with #344161
          'brand-surface': '#1e293b',   // ⚠️ TO BE REPLACED with white/50
          'brand-muted': '#475569',     // ⚠️ TO BE REPLACED with #566890
        },
      },
    },
  }
</script>
```

**Common Styling Patterns (To Be Updated):**
```tsx
// Pattern 1: Buttons (Current)
<button className="bg-brand-cyan text-white rounded-lg px-4 py-2">
  Save
</button>

// Pattern 2: Cards (Current)
<div className="bg-brand-surface rounded-lg p-4 shadow-md">
  {content}
</div>

// Pattern 3: Pills (Current)
<div className="bg-brand-cyan/20 text-brand-cyan px-4 py-2 rounded-lg">
  All
</div>

// Pattern 4: Typography (Current)
<h1 className="text-2xl font-bold text-white">
  Dashboard
</h1>
```

### 1.4 Technical Debt Identified

**Critical Issues:**
1. **Tailwind via CDN** - Blocks design token system, no tree-shaking
2. **No formal typography scale** - Mixed fonts, inconsistent sizes
3. **Inconsistent button patterns** - 3+ different primary button styles
4. **Modal nesting 3-4 levels deep** - Dashboard → FABMenu → QuickAdd → ExercisePicker
5. **Touch targets too small** - 20×20px checkboxes (WCAG violation)

**Medium Issues:**
6. **No design system documentation** - Component variants scattered
7. **Inconsistent spacing** - Mix of Tailwind scale + custom values
8. **No dark mode support** - Hard-coded light colors only
9. **Limited accessibility** - Missing ARIA labels, focus indicators inconsistent

---

## 2. UI Redesign Architecture

### 2.1 Design System Layer (New)

**Directory Structure:**
```
src/design-system/              # ⚠️ NEW DIRECTORY
├── tokens/
│   ├── colors.ts              # Design tokens from design-system.md
│   ├── typography.ts          # Cinzel + Lato font definitions
│   ├── spacing.ts             # 8px grid scale (Tailwind default compatible)
│   ├── shadows.ts             # Glass morphism shadows
│   └── animations.ts          # Framer Motion spring configs
│
├── components/
│   ├── primitives/
│   │   ├── Button.tsx         # Base button with variants (primary/secondary/ghost)
│   │   ├── Card.tsx           # Glass morphism card with backdrop-blur
│   │   ├── Sheet.tsx          # Bottom sheet wrapper (Vaul integration)
│   │   └── Input.tsx          # Styled input with glass effect
│   │
│   └── patterns/
│       ├── InlineNumberPicker.tsx  # 60pt font, +/- buttons
│       ├── ExercisePicker.tsx      # Bottom sheet with search/filters
│       ├── RestTimer.tsx           # Compact timer banner
│       └── CategoryPills.tsx       # Selected/unselected pill states
│
└── hooks/
    ├── useHaptic.ts           # Web Vibration API wrapper
    ├── useBottomSheet.ts      # Sheet state management
    └── useRestTimer.ts        # Auto-start timer logic
```

**Token Implementation (colors.ts):**
```typescript
// src/design-system/tokens/colors.ts
export const colors = {
  // Primary Palette (Sophisticated Blues)
  primary: {
    DEFAULT: '#758AC6',   // Replaces brand-cyan (#22d3ee)
    dark: '#344161',      // Replaces brand-dark (#0f172a) for text
    medium: '#566890',    // New: Secondary text, pills
    light: '#8997B8',     // New: Placeholders, tertiary text
    pale: '#A8B6D5',      // New: Drag handles, subtle elements
  },

  // Badge Colors (Equipment, Categories)
  badge: {
    bg: '#D9E1F8',        // Light blue background
    border: '#BFCBEE',    // Border color
    text: '#566890',      // Medium blue text
  },

  // Surface Colors (Glass Morphism)
  glass: {
    main: 'rgba(255, 255, 255, 0.50)',      // Cards, modals
    light: 'rgba(255, 255, 255, 0.60)',     // Unselected pills
    subtle: 'rgba(255, 255, 255, 0.20)',    // Background overlays
  },

  // Legacy (Deprecated - remove after migration)
  'brand-cyan': '#22d3ee',
  'brand-dark': '#0f172a',
  'brand-surface': '#1e293b',
  'brand-muted': '#475569',
} as const;

export type ColorToken = keyof typeof colors;
```

**Typography Implementation (typography.ts):**
```typescript
// src/design-system/tokens/typography.ts
export const typography = {
  // Display (Cinzel Serif) - Headlines, Exercise Names
  display: {
    xl: {
      fontSize: '32px',
      lineHeight: '1.2',
      letterSpacing: '0.05em',
      fontWeight: '700',
      fontFamily: 'Cinzel, serif',
    },
    lg: {
      fontSize: '24px',
      lineHeight: '1.3',
      letterSpacing: '0.05em',
      fontWeight: '700',
      fontFamily: 'Cinzel, serif',
    },
    md: {
      fontSize: '18px',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      fontWeight: '700',
      fontFamily: 'Cinzel, serif',
    },
  },

  // Body (Lato Sans) - UI Elements, Body Text
  body: {
    lg: { fontSize: '18px', lineHeight: '1.56', fontWeight: '400' },
    base: { fontSize: '16px', lineHeight: '1.5', fontWeight: '400' },
    sm: { fontSize: '14px', lineHeight: '1.4', fontWeight: '700' },  // Pills
    xs: { fontSize: '12px', lineHeight: '1.3', fontWeight: '400' },  // Badges
  },

  // Numeric (Lato) - Large Gym-Readable Numbers
  numeric: {
    xl: { fontSize: '60px', lineHeight: '1.2', fontWeight: '700' },  // Inline picker
    lg: { fontSize: '48px', lineHeight: '1.2', fontWeight: '600' },  // Set counters
    md: { fontSize: '36px', lineHeight: '1', fontWeight: '500' },    // Timer
  },
} as const;
```

### 2.2 Tailwind Migration Architecture

**Current State (CDN):**
```html
<!-- index.html -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { /* inline config */ }
</script>
```

**Target State (PostCSS):**
```
FitForge-Local/
├── tailwind.config.js      # ⚠️ NEW FILE
├── postcss.config.js       # ⚠️ NEW FILE
├── src/
│   └── index.css           # ⚠️ NEW FILE with @tailwind directives
└── index.html              # ⚠️ MODIFIED (remove CDN script)
```

**Migration Steps:**

**Step 1: Install Dependencies**
```bash
npm install -D tailwindcss postcss autoprefixer @fontsource/cinzel @fontsource/lato
```

**Step 2: Create tailwind.config.js**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // New Design System Colors
        primary: {
          DEFAULT: '#758AC6',
          dark: '#344161',
          medium: '#566890',
          light: '#8997B8',
          pale: '#A8B6D5',
        },
        badge: {
          bg: '#D9E1F8',
          border: '#BFCBEE',
          text: '#566890',
        },

        // Legacy (Deprecated - for gradual migration)
        'brand-cyan': '#22d3ee',
        'brand-dark': '#0f172a',
        'brand-surface': '#1e293b',
        'brand-muted': '#475569',
      },

      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        lato: ['Lato', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        body: ['Lato', 'sans-serif'],
      },

      fontSize: {
        'display-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0.05em' }],
        'display-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0.05em' }],
        'display-md': ['18px', { lineHeight: '1.4', letterSpacing: '0.025em' }],
      },

      boxShadow: {
        'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
        'drawer': '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',
      },

      backgroundImage: {
        'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
      },

      borderRadius: {
        xl: '1.5rem',  // 24px - cards, search bars
        '2xl': '2rem', // 32px
      },
    },
  },
  plugins: [],
}
```

**Step 3: Create postcss.config.js**
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 4: Create src/index.css**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Font imports */
@import '@fontsource/cinzel/400.css';
@import '@fontsource/cinzel/700.css';
@import '@fontsource/lato/400.css';
@import '@fontsource/lato/700.css';

/* Custom base styles */
@layer base {
  body {
    @apply bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 text-primary-dark;
    font-family: 'Lato', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.025em;
  }
}
```

**Step 5: Update index.html**
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FitForge</title>

    <!-- ⚠️ REMOVE: CDN Tailwind -->
    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
    <!-- <script>tailwind.config = {...}</script> -->

    <script
      src="//unpkg.com/react-grab/dist/index.global.js"
      crossorigin="anonymous"
      data-enabled="true"
    ></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

**Step 6: Update main.tsx**
```typescript
// main.tsx (or index.tsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './src/index.css'  // ⚠️ ADD: Import Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 7: Verify Build Process**
```bash
# Test development build
docker-compose down
docker-compose up -d --build

# Verify HMR still works
# 1. Edit a component
# 2. Check browser auto-refreshes
# 3. Check no console errors
```

**Rollback Plan:**
```bash
# If PostCSS migration breaks build:
1. Revert index.html (restore CDN script)
2. Delete tailwind.config.js, postcss.config.js, src/index.css
3. git checkout index.html main.tsx
4. Rebuild containers
```

### 2.3 Component Migration Strategy

**Phase 1: Create Design System (Epic 5 - Week 1)**
```
Goal: Build reusable primitives, zero impact on existing UI

Actions:
1. Create src/design-system/ folder structure
2. Implement Button.tsx, Card.tsx, Sheet.tsx, Input.tsx primitives
3. Add CategoryPills.tsx, InlineNumberPicker.tsx patterns
4. Document in Storybook
5. Test in isolation (no production code changes yet)

Deliverables:
- ✅ Design system folder with 8 components
- ✅ Storybook documentation
- ✅ Zero regressions (old UI unchanged)
```

**Phase 2: Wrap Existing Components (Epic 6 - Weeks 2-3)**
```
Goal: Parallel operation - old and new UI coexist via feature flags

Strategy:
// components/ui/Button.tsx
import { Button as NewButton } from '@/src/design-system/components/primitives/Button';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export function Button(props) {
  const { ui_redesign_enabled } = useFeatureFlags();

  if (ui_redesign_enabled) {
    return <NewButton {...props} />;
  }

  // Old implementation (unchanged)
  return (
    <button className="bg-brand-cyan text-white rounded-lg px-4 py-2" {...props} />
  );
}

Actions:
1. Wrap Button, Card, Modal, Badge components with feature flags
2. Update Dashboard, WorkoutBuilder, Workout to use wrapped components
3. Test both old and new UI paths
4. Deploy with feature flag OFF initially

Deliverables:
- ✅ 15 components support both UIs
- ✅ Feature flag controls toggle
- ✅ Old UI remains default
```

**Phase 3: Migrate Component Internals (Epic 7 - Weeks 3-4)**
```
Goal: Replace old styling with new design system

Strategy:
// Before (Old UI)
<button className="bg-brand-cyan text-white rounded-lg px-4 py-2">
  Save
</button>

// After (New UI)
<button className="bg-primary text-white rounded-full px-5 py-2 text-sm font-bold tracking-wide shadow-button-primary">
  Save
</button>

Actions:
1. Update all className usages to new tokens
2. Replace manual styles with design system utilities
3. Test visual regression (screenshot comparison)
4. Gradual rollout (10% → 50% → 100%)

Deliverables:
- ✅ All components use new design tokens
- ✅ Visual regression tests pass
- ✅ 50%+ users on new UI
```

**Phase 4: Remove Old Patterns (Epic 8 - Week 4)**
```
Goal: Cleanup - remove feature flags and legacy code

Actions:
1. Set feature flag to 100% permanently
2. Remove old component implementations
3. Delete legacy color tokens (brand-cyan, etc.)
4. Archive feature flag system
5. Update documentation

Deliverables:
- ✅ Feature flags removed
- ✅ Codebase simplified
- ✅ Documentation updated
```

### 2.4 Feature Flag System

**Implementation:**
```typescript
// src/lib/feature-flags.ts
export const features = {
  ui_redesign_enabled: import.meta.env.VITE_UI_REDESIGN === 'true',
  design_system_v2: import.meta.env.VITE_DESIGN_V2 === 'true',
  glass_morphism: import.meta.env.VITE_GLASS === 'true',
  bottom_sheets: import.meta.env.VITE_BOTTOM_SHEETS === 'true',
  inline_pickers: import.meta.env.VITE_INLINE_PICKERS === 'true',
  auto_rest_timer: import.meta.env.VITE_AUTO_TIMER === 'true',
  smart_shortcuts: import.meta.env.VITE_SMART_SHORTCUTS === 'true',
} as const;

export type FeatureFlag = keyof typeof features;

// Hook for convenient access
export function useFeatureFlags() {
  return features;
}
```

**Environment Configuration:**
```bash
# .env.development (local dev - feature flags OFF by default)
VITE_UI_REDESIGN=false
VITE_DESIGN_V2=false
VITE_GLASS=false
VITE_BOTTOM_SHEETS=false

# .env.staging (internal testing - feature flags ON)
VITE_UI_REDESIGN=true
VITE_DESIGN_V2=true
VITE_GLASS=true
VITE_BOTTOM_SHEETS=true

# .env.production (gradual rollout - controlled via Railway dashboard)
VITE_UI_REDESIGN=false  # Start OFF, toggle to enable
```

**Usage in Components:**
```typescript
// components/WorkoutBuilder.tsx
import { useFeatureFlags } from '@/src/lib/feature-flags';
import { ExercisePicker as OldPicker } from './ExercisePicker';
import { ExercisePicker as NewPicker } from '@/src/design-system/patterns/ExercisePicker';

export function WorkoutBuilder() {
  const { bottom_sheets } = useFeatureFlags();

  return (
    <div>
      {bottom_sheets ? (
        <NewPicker />  {/* Bottom sheet pattern */}
      ) : (
        <OldPicker />  {/* Full-screen modal */}
      )}
    </div>
  );
}
```

---

## 3. Integration Points

### 3.1 No Backend Changes Required

**All 20+ REST Endpoints Remain Unchanged:**
```typescript
// Existing endpoints continue working
POST   /api/workouts/:id/complete      // Fatigue calculation
POST   /api/recommendations/exercises  // Exercise scoring
GET    /api/recovery/timeline          // Recovery projection
POST   /api/forecast/workout           // Workout forecast
GET    /api/muscle-states              // Current fatigue
POST   /api/workouts                   // Log workout
GET    /api/workouts/:id               // Get workout
// ... 15+ more endpoints (all unchanged)
```

**Frontend Services Unchanged:**
```typescript
// src/services/ (existing files - no modifications)
workoutService.ts      // ✅ No changes needed
exerciseService.ts     // ✅ No changes needed
fatigueService.ts      // ✅ No changes needed
recoveryService.ts     // ✅ No changes needed
```

### 3.2 Frontend Integration

**Component Tree (Before UI Redesign):**
```
App.tsx
├── Dashboard.tsx
│   ├── MuscleVisualization.tsx
│   ├── LastWorkoutSummary.tsx
│   ├── QuickTrainingStats.tsx
│   └── FABMenu.tsx
│       └── QuickAdd.tsx
│           └── ExercisePicker.tsx (full-screen modal)
│
├── WorkoutBuilder.tsx
│   ├── PlannedExerciseList.tsx
│   ├── VolumeSlider.tsx
│   └── ExercisePicker.tsx (full-screen modal)
│
└── Workout.tsx
    ├── ExerciseGroup.tsx
    ├── HorizontalSetInput.tsx
    └── RestTimer.tsx (full-width overlay)
```

**Component Tree (After UI Redesign):**
```
App.tsx
├── Dashboard.tsx
│   ├── MuscleVisualization.tsx (glass overlay added)
│   ├── LastWorkoutSummary.tsx (glass card)
│   ├── QuickTrainingStats.tsx (glass card)
│   └── FAB.tsx (new shadow, primary color)
│       └── QuickAdd → ExercisePicker (bottom sheet 60vh)
│
├── WorkoutBuilder.tsx
│   ├── PlannedExerciseList.tsx (glass cards)
│   ├── VolumeSlider.tsx (updated thumb styling)
│   └── ExercisePicker (bottom sheet 60vh)
│
└── Workout.tsx
    ├── ExerciseGroup.tsx (glass cards, Cinzel names)
    ├── InlineNumberPicker.tsx (NEW: 60pt numbers, +/- buttons)
    └── RestTimerBanner.tsx (NEW: compact top banner)
```

**State Management (No Changes):**
```typescript
// Existing patterns remain
App.tsx: useAPIState() hook
  └── profile, workouts, personalBests, muscleBaselines, templates

WorkoutBuilder.tsx: useState() for local state
  └── plannedExercises, selectedExercises, showForecast

Dashboard.tsx: useState() + useMuscleStates() hook
  └── muscleStates, lastWorkout, recommendedWorkout
```

### 3.3 Dependency Changes

**New Dependencies (package.json):**
```json
{
  "dependencies": {
    "framer-motion": "^12.23.24",  // ✅ Already installed
    "vaul": "^1.1.2"                // ✅ Already installed
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",        // ⚠️ NEW (CDN → PostCSS)
    "postcss": "^8.4.0",            // ⚠️ NEW (required by Tailwind)
    "autoprefixer": "^10.4.0",      // ⚠️ NEW (vendor prefixes)
    "@fontsource/cinzel": "^5.0.0", // ⚠️ NEW (display font)
    "@fontsource/lato": "^5.0.0"    // ⚠️ NEW (body font)
  }
}
```

**Bundle Size Impact:**
```
Current Build (CDN Tailwind):
- Bundle: ~450KB (React + deps)
- Tailwind: ~300KB (CDN loaded separately)
- Total: ~750KB

New Build (PostCSS Tailwind + Fonts):
- Bundle: ~450KB (React + deps)
- Tailwind: ~80KB (purged, tree-shaken)
- Fonts: ~300KB (Cinzel + Lato woff2)
- Framer Motion: ~100KB (already installed)
- Vaul: ~15KB (already installed)
- Total: ~945KB

Net Increase: +195KB (+26%)
Mitigations: Code splitting, lazy loading, gzip compression
```

---

## 4. Build & Deployment Architecture

### 4.1 Development Environment (Docker Compose with HMR)

**Existing docker-compose.yml (Unchanged):**
```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports: ["3000:3000"]       # MANDATORY PORT
    volumes:
      - ./components:/app/components     # Hot reload
      - ./App.tsx:/app/App.tsx
      - ./index.tsx:/app/index.tsx
      - /app/node_modules                # Use container modules
    environment:
      - NODE_ENV=development
      - VITE_UI_REDESIGN=false           # ⚠️ NEW: Feature flag

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile.dev
    ports: ["3001:3001"]       # MANDATORY PORT
    volumes:
      - ./backend:/app/backend           # Hot reload
      - ./data:/data                     # Database persistence
    environment:
      - NODE_ENV=development
```

**HMR Workflow (No Changes):**
```
Developer edits component → Vite detects change → Browser auto-refreshes
Developer edits backend → nodemon detects change → Server auto-restarts

NO container rebuilds needed for code changes!
Only rebuild when package.json changes (new dependencies)
```

### 4.2 Build Process Changes

**Existing Dockerfile (Production):**
```dockerfile
# Dockerfile (current - for Railway deployment)
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build  # ⚠️ STILL WORKS (Vite build)

# Output: dist/ folder with static files
```

**New Build Process (PostCSS Integration):**
```
1. npm ci → Install dependencies (now includes tailwindcss)
2. Vite build → Compile TypeScript + React
   ├── Run Tailwind PostCSS → Generate CSS with design tokens
   ├── Purge unused styles → Reduce bundle size
   └── Copy fonts → Include Cinzel + Lato woff2 files
3. Output dist/ folder → Static HTML + JS + CSS + fonts
```

**vite.config.ts (No Changes Required):**
```typescript
// vite.config.ts (existing configuration works with PostCSS)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
```

### 4.3 Railway Deployment (No Architecture Changes)

**Deployment Workflow (Unchanged):**
```
1. Push to GitHub main branch
2. Railway webhook triggers build
3. Runs: npm run build (Vite build with Tailwind PostCSS)
4. Deploys: dist/ folder to CDN
5. Backend: Compiled TypeScript in backend/dist/
6. Database: SQLite with persistent volume

Production URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
```

**Environment Variables (Railway Dashboard):**
```bash
# Add to Railway project settings
VITE_UI_REDESIGN=false      # Start with old UI (safe rollout)
VITE_DESIGN_V2=false
VITE_GLASS=false
VITE_BOTTOM_SHEETS=false

# Toggle to enable new UI (instant deployment)
VITE_UI_REDESIGN=true  # Enables new design system
```

**Rollback Strategy:**
```
Scenario: New UI causes critical bugs

Rollback Steps:
1. Open Railway dashboard
2. Set VITE_UI_REDESIGN=false
3. Redeploy (2-3 minutes)
4. Verify old UI restored
5. Investigate issue in staging

Time to Rollback: < 5 minutes
Data Impact: None (frontend-only change)
```

---

## 5. Migration Plan (Epic Breakdown)

### Epic 5: Design System Foundation (Week 1 - 5 days)

**Goal:** Establish visual identity and core component library

**Tasks:**

**Day 1: Tailwind Migration**
```bash
# 1. Install dependencies (1 hour)
npm install -D tailwindcss postcss autoprefixer
npm install @fontsource/cinzel @fontsource/lato

# 2. Create configuration files (2 hours)
- tailwind.config.js (design tokens)
- postcss.config.js (PostCSS setup)
- src/index.css (@tailwind directives)

# 3. Update index.html (30 minutes)
- Remove CDN script
- Test build process

# 4. Verify HMR still works (30 minutes)
docker-compose down
docker-compose up -d --build
```

**Day 2: Typography & Colors**
```typescript
// 1. Create src/design-system/tokens/ (2 hours)
- colors.ts (primary palette, badge colors, glass colors)
- typography.ts (Cinzel display, Lato body, numeric scales)

// 2. Update Tailwind config (1 hour)
- Import tokens
- Add custom font families
- Add custom shadows

// 3. Test token usage (1 hour)
- Create sample component
- Verify Cinzel loads
- Check color contrast
```

**Day 3-4: Primitive Components**
```typescript
// Build reusable components (2 days)
1. Button.tsx (3 hours)
   - Variants: primary, secondary, ghost
   - States: default, hover, active, disabled
   - Sizes: sm, md, lg
   - Rounded-full, shadow-button-primary

2. Card.tsx (3 hours)
   - Glass morphism: white/50, backdrop-blur-sm
   - Border: gray-300/50
   - Rounded-xl (24px)
   - Variants: default, elevated, flat

3. Sheet.tsx (Vaul wrapper) (4 hours)
   - Heights: 40vh, 60vh, 90vh
   - Drag handle (48×6px, pale blue)
   - Swipe-to-dismiss
   - Backdrop (black/40)
   - Top border highlight (white/50)

4. Input.tsx (2 hours)
   - Glass background (white/50)
   - Inner shadow (inset 0 1px 2px)
   - Focus ring (primary color)
   - Icon support (Material Icons)
```

**Day 5: Documentation & Testing**
```bash
# 1. Create Storybook stories (3 hours)
- Button.stories.tsx (all variants)
- Card.stories.tsx (glass backgrounds)
- Sheet.stories.tsx (height variants)
- Input.stories.tsx (with/without icons)

# 2. Accessibility audit (2 hours)
- Color contrast (WCAG AA)
- Focus indicators
- Keyboard navigation
- Screen reader labels

# 3. Document usage guidelines (1 hour)
- When to use each component
- Variant selection guide
- Common patterns
```

**Acceptance Criteria:**
- ✅ Fonts load correctly (Cinzel for headlines, Lato for body)
- ✅ Tailwind config includes all design tokens
- ✅ Color palette passes WCAG AA contrast tests (4.5:1 minimum)
- ✅ Glass effects work on various backgrounds (marble, gradient, solid)
- ✅ Component library documented in Storybook with examples
- ✅ HMR still works (edit component → browser auto-refreshes)

---

### Epic 6: Core Interaction Redesign (Weeks 2-3 - 10 days)

**Goal:** Reduce per-set interactions from 8-12 clicks → 3-4 taps

**Week 2 Tasks:**

**Day 1: Bottom Sheet Navigation**
```typescript
// Create BottomSheet component wrapper (6 hours)
1. Integrate Vaul library
2. Add height variants (40%, 60%, 90%)
3. Implement drag handle
4. Test swipe-to-dismiss
5. Add backdrop click-to-close
6. Create Storybook story
```

**Day 2-3: Reduce Modal Nesting**
```typescript
// Refactor modal hierarchy (2 days)

Current: Dashboard → FABMenu → QuickAdd → ExercisePicker (4 levels)
Target:  Dashboard → QuickAdd (bottom sheet) → Done (2 levels)

Actions:
1. Convert FABMenu to floating button (not modal)
2. Make QuickAdd open as bottom sheet (60% height)
3. ExercisePicker replaces QuickAdd content (same sheet)
4. Exercise detail opens as full-screen (Level 2)
5. Audit all workflows to ensure max 2 levels
6. Test escape paths (swipe, backdrop, X, ESC key)
```

**Day 4: Inline Number Pickers**
```typescript
// Create InlineNumberPicker component (6 hours)
1. Display value at 60pt font (gym readable from 2 feet)
2. +/- buttons (60×60px, WCAG compliant)
3. Tap value → bottom sheet with keyboard input
4. Haptic feedback on button press (10ms vibration)
5. Min/max validation
6. Step increment (configurable: 1 for reps, 5 for weight)

// Integrate into Workout.tsx (2 hours)
1. Replace <input type="number"> with InlineNumberPicker
2. Update weight/reps inputs
3. Test with gloves (simulate fat fingers)
```

**Day 5: Touch Target Compliance**
```typescript
// Enlarge all interactive elements (4 hours)

Audit checklist:
1. Buttons: min-w-[60px] min-h-[60px]
2. Checkboxes: Replace with 60×60px touch area
3. Pills: h-10 (40px) → h-12 (48px) for better thumb reach
4. Icons: Wrap in 60×60px clickable area
5. Links: Add padding to increase tap area
6. Spacing: Ensure 8px minimum between targets

// Update components:
- Workout.tsx (checkboxes, action buttons)
- ExercisePicker.tsx (exercise cards)
- Dashboard.tsx (quick action buttons)
- All forms (input fields, select dropdowns)
```

**Week 3 Tasks:**

**Day 1: FAB Patterns**
```typescript
// Update FAB component (3 hours)
1. Primary action button (64×64px, bottom-right)
2. Shadow: 0 4px 16px rgba(117,138,198,0.4)
3. Icon: 28px Material Icon
4. States: hover (scale 1.05), active (scale 0.95)
5. Entrance animation (spring physics)
6. Position: fixed bottom-6 right-6 (thumb-friendly zone)

// Integrate into Dashboard (1 hour)
- Replace old FABMenu with new FAB
- Menu slides up on tap (not modal)
- Test on mobile devices
```

**Day 2: Standardize Modal Dismiss**
```typescript
// Create Modal wrapper component (4 hours)
1. 4 dismiss methods: swipe down, backdrop tap, X button, ESC key
2. Trap focus inside modal
3. Return focus to trigger on close
4. Prevent scroll on body when open
5. Add ARIA attributes (role="dialog", aria-modal="true")

// Refactor all 11 modals to use wrapper (2 hours)
- BaselineUpdateModal
- SetEditModal
- WorkoutSummaryModal
- WorkoutPlannerModal
- MuscleDeepDiveModal
- TemplateSelector
- FABMenu (if kept as modal)
- EquipmentModal
- MuscleDetailModal
- ExercisePicker
- ProfileModal
```

**Day 3-5: Integration Testing**
```bash
# Test core workflows (3 days)
1. Workout logging flow (start → log sets → complete)
2. Exercise selection (picker → add → configure)
3. Template creation (builder → save → load)
4. Profile editing (onboarding → equipment → save)
5. Analytics viewing (dashboard → deep dive → return)

# Accessibility testing
1. Keyboard-only navigation
2. Screen reader compatibility (NVDA/JAWS)
3. Focus trapping in modals
4. ARIA label verification
5. Color contrast in all states

# Mobile device testing
1. iOS Safari (iPhone 12, 13, 14)
2. Android Chrome (various screen sizes)
3. Touch target accuracy (with gloves)
4. Swipe gestures (bottom sheets)
5. Haptic feedback (if supported)
```

**Acceptance Criteria:**
- ✅ Bottom sheets used for all Level 1 interactions (filters, quick actions)
- ✅ No workflow allows 3+ modal depth (max 2 levels enforced)
- ✅ Inline pickers show 60pt font, tappable from 2 feet away
- ✅ 90%+ of interactive elements at 60×60px minimum
- ✅ FAB accessible with thumb on 6.5" phone (bottom-right zone)
- ✅ All modals dismissable 4 ways (swipe/tap/X/ESC)
- ✅ Zero regressions in existing functionality

---

### Epic 7: Intelligence Shortcuts (Weeks 3-4 - 5 days)

**Goal:** Leverage smart features to reduce friction

**Day 1: Auto-Starting Rest Timer**
```typescript
// Create RestTimerBanner component (4 hours)
1. Position: fixed top-0 (below app header)
2. Height: 64px (doesn't block content)
3. Design: white/90 bg, backdrop-blur-xl, primary border
4. Timer: 36px font (readable but compact)
5. Progress bar: 4px height, animates width 100% → 0%
6. Buttons: Skip (X icon, 40×40px), +15s
7. Animation: Slide down from top (200ms spring)

// Auto-start logic (2 hours)
// In Workout.tsx
const handleLogSet = (setId) => {
  markSetComplete(setId);

  // Auto-start rest timer
  const exercise = findExercise(setId);
  const restSeconds = exercise.restTimerSeconds || 90;
  startRestTimer(restSeconds);

  // Haptic feedback
  navigator.vibrate?.(50);
};

// On timer complete (0s):
- Gentle haptic (20ms)
- Banner pulses green briefly
- Auto-dismiss after 2 seconds
```

**Day 2: "Log All Sets?" Smart Shortcut**
```typescript
// Implement pattern detection (4 hours)
// In ExerciseGroup.tsx

useEffect(() => {
  const completedSets = exercise.sets.filter(s => s.completed);
  const remainingSets = exercise.sets.filter(s => !s.completed);

  // Pattern: 2/3 sets complete, same weight/reps
  if (remainingSets.length === 1 && completedSets.length >= 2) {
    const firstSet = completedSets[0];
    const allMatch = completedSets.every(
      s => s.weight === firstSet.weight && s.reps === firstSet.reps
    );

    if (allMatch) {
      showLogAllShortcut({
        exercise: exercise.name,
        sets: exercise.sets.length,
        weight: firstSet.weight,
        reps: firstSet.reps,
        onConfirm: () => logRemainingSetsWith(firstSet),
        onCancel: () => hideLogAllShortcut(),
      });
    }
  }
}, [exercise.sets]);

// Modal design (2 hours)
- Bottom sheet (40vh)
- Headline (Cinzel 32px): "Log All Sets?"
- Subtext: "3 sets of 8 reps at 135 lbs"
- Buttons: Yes (primary), No (secondary)
- Haptic on confirm (100ms)
```

**Day 3: One-Tap Set Duplication**
```typescript
// Add "Copy Previous Set" button (2 hours)
// In HorizontalSetInput.tsx

<button
  onClick={handleCopyPrevious}
  className="min-w-[60px] min-h-[60px] rounded-full bg-primary-light/20
    border-2 border-primary-light text-primary-medium"
>
  <CopyIcon size={24} />
</button>

const handleCopyPrevious = () => {
  const lastSet = exercise.sets[currentSetIndex - 1];
  if (lastSet) {
    setWeight(lastSet.weight);
    setReps(lastSet.reps);
    setToFailure(lastSet.toFailure);
    navigator.vibrate?.(10);
  }
};

// Positioning: Next to weight/reps inputs (4 hours)
- Test with various set counts (1-6 sets)
- Disable on first set (no previous)
- Show tooltip on first use ("Copy previous set")
```

**Day 4: Equipment Filtering**
```typescript
// Update ExercisePicker.tsx (3 hours)
1. Fetch userProfile.equipment array
2. Filter exercise list: exercises.filter(e =>
     userProfile.equipment.includes(e.equipment)
   )
3. Add "Show All" toggle (bypass filter)
4. Badge shows active filter count ("3 equipment types")
5. Persist filter state to localStorage

// Integration testing (2 hours)
- Test with various equipment configurations
- Verify "Show All" reveals hidden exercises
- Check filter persists across sessions
```

**Day 5: Progressive Disclosure**
```typescript
// Update form components (4 hours)

// Workout.tsx - Collapse advanced options
const [showAdvanced, setShowAdvanced] = useState(false);

<div>
  {/* Always visible: weight, reps, log button */}
  <InlineNumberPicker label="Weight" value={weight} />
  <InlineNumberPicker label="Reps" value={reps} />
  <Button onClick={handleLog}>Log Set</Button>

  {/* Collapsed by default */}
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
</div>

// Dashboard - Collapsible sections (2 hours)
- "Last Workout" (collapsed by default)
- "Training Stats" (collapsed)
- "Muscle Recovery" (always visible)
- State persists to localStorage
```

**Acceptance Criteria:**
- ✅ Rest timer auto-starts after logging set, doesn't obstruct view
- ✅ "Log All Sets?" shortcut appears after 2/3 sets with matching values
- ✅ Set duplication reduces logging time by 50% (4-6 clicks → 2 taps)
- ✅ Equipment filtering prevents unusable exercise suggestions
- ✅ Advanced options hidden by default, accessible on demand
- ✅ All shortcuts have haptic feedback (if device supports)

---

### Epic 8: Polish & Accessibility (Week 4 - 5 days)

**Goal:** Premium animations, accessibility, dark mode

**Day 1: Framer Motion Animations**
```typescript
// Add animations to key components (6 hours)

// 1. Bottom sheet - Spring animation
import { motion } from 'framer-motion';

<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  className="fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-[24px]"
>
  {content}
</motion.div>

// 2. Button press - Scale animation
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  Log Set
</motion.button>

// 3. Page transitions - Slide from right
<motion.div
  initial={{ x: 300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -300, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  {page content}
</motion.div>

// 4. List items - Stagger animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Day 2: Glass Morphism Polish**
```typescript
// Test glass effects across backgrounds (6 hours)

1. Test on heavenly gradient (default)
   - white/50 → adjust to white/60 if too transparent
   - Verify text readability (WCAG AA)

2. Test on dark backgrounds (dark mode)
   - white/10 on dark surfaces
   - Borders need higher opacity (white/20)

3. Test on marble texture (optional background)
   - Adjust blur strength (blur-sm → blur-md)
   - Ensure borders provide definition

4. Test on various image backgrounds
   - User-uploaded workout photos
   - Ensure content remains readable

// Browser compatibility testing (2 hours)
- Chrome: backdrop-filter supported
- Safari: backdrop-filter supported (with -webkit prefix)
- Firefox: backdrop-filter supported (enabled by default)
- Edge: backdrop-filter supported
- Fallback: Solid backgrounds for unsupported browsers
```

**Day 3: WCAG 2.1 AA+ Compliance Audit**
```bash
# Run automated tests (2 hours)
npm install -D axe-core @axe-core/react

// Add axe to App.tsx (development only)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}

// Run Lighthouse audit on all screens
npm run build
npm run preview
# Open DevTools → Lighthouse → Accessibility

Target: 90+ score on all screens

# Manual testing (4 hours)
1. Keyboard-only navigation
   - Tab through all interactive elements
   - Verify focus indicators visible
   - Test modal focus trapping
   - Ensure logical tab order

2. Screen reader testing (NVDA on Windows, VoiceOver on Mac)
   - All buttons have descriptive labels
   - Form inputs announce errors
   - Modal dialogs announce correctly
   - Live regions for dynamic content

3. Color contrast verification
   - Use WebAIM Contrast Checker
   - Primary text: #344161 on white → 8.9:1 (AAA)
   - Secondary text: #566890 on white → 4.5:1 (AA)
   - White on primary: white on #758AC6 → 3.2:1 (AA for large text)

4. Touch target verification
   - Measure all interactive elements
   - Ensure 60×60px minimum (exceeds WCAG 44pt)
   - Check spacing (8px minimum between targets)
```

**Day 4: Dark Mode Support**
```typescript
// Define dark color tokens (3 hours)
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          // Light mode (existing)
          DEFAULT: '#758AC6',
          dark: '#344161',

          // Dark mode (new)
          'dark-bg': '#1e293b',
          'dark-text': '#e2e8f0',
          'dark-surface': '#0f172a',
        },
      },
      backgroundImage: {
        // Light mode gradient
        'heavenly-gradient': 'linear-gradient(180deg, rgba(235,241,255,0.95) 0%, rgba(255,255,255,0.95) 100%)',

        // Dark mode gradient
        'dark-gradient': 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
      },
    },
  },
};

// Update components with dark mode classes (3 hours)
<div className="
  bg-white/50 dark:bg-white/10
  text-primary-dark dark:text-gray-50
  border-gray-300/50 dark:border-white/10
">
  {content}
</div>

// Add theme toggle (1 hour)
const [theme, setTheme] = useState('light');

useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

**Day 5: Empty States & Performance**
```typescript
// Empty states (2 hours)
// Create EmptyState component
<div className="flex flex-col items-center justify-center py-12">
  <IllustrationSVG className="w-48 h-48 opacity-50" />
  <h3 className="font-cinzel text-xl text-primary-dark mt-4">
    No workouts yet
  </h3>
  <p className="text-primary-medium mt-2 text-center max-w-sm">
    Start your fitness journey by logging your first workout
  </p>
  <Button onClick={handleStartWorkout} className="mt-6">
    Log Workout
  </Button>
</div>

// Add to components:
- Dashboard (no workouts)
- WorkoutTemplates (no templates)
- PersonalBests (no PRs)
- Analytics (insufficient data)

// Skeleton screens (2 hours)
// Replace loading spinners with skeleton screens
<div className="animate-pulse">
  <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
</div>

// Performance optimization (2 hours)
1. React.memo for expensive components
   - MuscleVisualization (re-renders on every state change)
   - ExerciseCard (list items)
   - MuscleHeatMap (chart rendering)

2. Code splitting with React.lazy
   - Analytics screen (heavy charts)
   - Storybook (development only)
   - Modal components (load on demand)

3. Lighthouse performance audit
   - Target: 90+ performance score
   - Monitor: TTI <3s, FCP <1.5s
   - Fix: Large images, unused JavaScript
```

**Acceptance Criteria:**
- ✅ Animations run at 60fps, feel responsive (no jank)
- ✅ Glass effects look premium, readability maintained on all backgrounds
- ✅ Lighthouse accessibility score: 90+ on all screens
- ✅ Dark mode covers all screens, persists preference to localStorage
- ✅ Empty states provide clear guidance and call-to-action
- ✅ Performance: TTI <3s, FCP <1.5s, Lighthouse 90+ all categories

---

## 6. Risk Assessment & Mitigation

### High Risks

**Risk 1: Tailwind Migration Breaking Build**
- **Probability:** Medium
- **Impact:** High (blocks all development until fixed)
- **Symptoms:** Build fails, HMR broken, styles not loading
- **Mitigation:**
  1. Test in separate branch first (`git checkout -b tailwind-migration`)
  2. Keep CDN script as backup during transition (comment out, don't delete)
  3. Verify HMR works before committing (`docker-compose up -d --build`)
  4. Document rollback steps in README
- **Rollback Plan:**
  ```bash
  # Revert to CDN Tailwind
  git checkout main index.html main.tsx
  rm tailwind.config.js postcss.config.js src/index.css
  docker-compose down
  docker-compose up -d --build
  ```

**Risk 2: User Confusion from Dramatic UI Change**
- **Probability:** High (major visual overhaul)
- **Impact:** Medium (temporary frustration, support burden, negative reviews)
- **Symptoms:** Increased support tickets, negative feedback, feature discovery issues
- **Mitigation:**
  1. Onboarding tour highlighting new UI patterns (5-screen walkthrough)
  2. Gradual rollout with feature flags (10% → 50% → 100% over 2 weeks)
  3. In-app "What's New" modal with screenshots and explanations
  4. Easy toggle back to old UI (first 2 weeks only, via settings menu)
  5. Feedback loop: In-app survey after 1 week of usage
- **Contingency:**
  - If NPS drops >10 points: pause rollout, gather feedback, iterate
  - If support tickets spike >50%: add more in-app guidance, video tutorials
  - If critical workflows broken: instant rollback via feature flag

**Risk 3: Performance Degradation from Animations**
- **Probability:** Medium (glass morphism + Framer Motion can be heavy)
- **Impact:** High (frustration, app feels slow, poor user experience)
- **Symptoms:** Laggy animations, low FPS, battery drain on mobile
- **Mitigation:**
  1. 60fps target for all animations (monitor with Chrome DevTools Performance)
  2. Lighthouse CI monitoring on every PR (fail build if score <90)
  3. React.memo for expensive components (MuscleVisualization, charts)
  4. Code splitting to reduce bundle size (lazy load modals, analytics)
  5. GPU-accelerated transforms only (`transform`, `opacity` - avoid `width`, `height`)
  6. Kill switch: Feature flag to disable animations (`VITE_ANIMATIONS_ENABLED`)
- **Performance Budget:**
  - Bundle size: <1MB (current ~750KB + 200KB for new UI)
  - TTI: <3 seconds
  - FCP: <1.5 seconds
  - Animation FPS: 60fps minimum

### Medium Risks

**Risk 4: Feature Flag Complexity**
- **Probability:** Low (simple boolean flags)
- **Impact:** Medium (confusing codebase if not cleaned up)
- **Symptoms:** Dead code, hard-to-trace bugs, maintenance burden
- **Mitigation:**
  1. Simple boolean flags only (no complex logic)
  2. Clear naming convention (`ui_redesign_enabled`, `bottom_sheets`)
  3. Document flag purpose and removal timeline in code comments
  4. Remove flags after 100% rollout (Week 5 cleanup sprint)
  5. Automated tests for both flag states (old + new UI paths)

**Risk 5: Dark Mode Edge Cases**
- **Probability:** Medium (many components to update)
- **Impact:** Low (visual glitches, not blocking)
- **Symptoms:** Text invisible on dark bg, wrong contrast ratios
- **Mitigation:**
  1. Dedicated dark mode testing phase (Day 4 of Epic 8)
  2. Test all components in both light and dark modes
  3. Screenshot comparison tool (Percy.io or Chromatic)
  4. User testing with dark mode preference enabled
  5. Post-launch: Monitor bug reports, iterate on visual issues

**Risk 6: Bottom Sheet Library (Vaul) Bugs**
- **Probability:** Low (popular library, well-maintained)
- **Impact:** Medium (swipe gestures fail, poor UX on mobile)
- **Symptoms:** Sheets don't close, drag handle unresponsive, iOS Safari issues
- **Mitigation:**
  1. Test Vaul thoroughly in dev environment before integration
  2. Fallback: Build custom BottomSheet if Vaul has critical bugs
  3. Monitor Vaul GitHub issues for known problems
  4. Test on iOS Safari, Android Chrome (primary devices)
  5. Consider alternative: Radix UI Dialog if Vaul fails

### Low Risks

**Risk 7: Font Loading Performance Hit**
- **Probability:** Low (modern browsers handle fonts well)
- **Impact:** Low (brief FOUT/FOIT flash on first load)
- **Symptoms:** Flash of unstyled text, layout shift during font swap
- **Mitigation:**
  1. Use `@fontsource` npm packages (self-hosted, fast)
  2. Font-display: swap (show fallback, then swap to Cinzel/Lato)
  3. Preload critical fonts in index.html (`<link rel="preload">`)
  4. Monitor Lighthouse performance score (ensure no regression)

**Risk 8: Glass Morphism Browser Compatibility**
- **Probability:** Low (modern browsers support backdrop-filter)
- **Impact:** Low (fallback to solid backgrounds on old browsers)
- **Symptoms:** No blur effect, solid backgrounds instead of glass
- **Mitigation:**
  1. Check caniuse.com: backdrop-filter supported in Chrome 76+, Safari 9+, Firefox 103+
  2. Fallback: Solid backgrounds (white/90) on unsupported browsers
  3. Feature detection: `@supports (backdrop-filter: blur(10px))`
  4. Test on Safari, Chrome, Firefox, Edge (all current versions)
  5. Progressive enhancement: works without glass, just less premium feel

---

## 7. Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Design System Components:**
```typescript
// src/design-system/components/primitives/__tests__/Button.test.tsx
describe('Button', () => {
  it('renders primary variant with correct styles', () => {
    const { getByRole } = render(<Button variant="primary">Click me</Button>);
    const button = getByRole('button');

    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('shadow-button-primary');
  });

  it('applies hover state animation', () => {
    const { getByRole } = render(<Button>Hover me</Button>);
    const button = getByRole('button');

    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle({ transform: 'scale(1.05)' });
  });

  it('is accessible with keyboard navigation', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Press me</Button>);
    const button = getByRole('button');

    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Hooks Testing:**
```typescript
// src/design-system/hooks/__tests__/useBottomSheet.test.tsx
describe('useBottomSheet', () => {
  it('opens and closes sheet', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('sets height variant', () => {
    const { result } = renderHook(() => useBottomSheet({ height: '60vh' }));
    expect(result.current.height).toBe('60vh');
  });
});
```

**Feature Flag Testing:**
```typescript
// src/lib/__tests__/feature-flags.test.tsx
describe('Feature Flags', () => {
  it('respects environment variables', () => {
    vi.stubEnv('VITE_UI_REDESIGN', 'true');
    const flags = useFeatureFlags();
    expect(flags.ui_redesign_enabled).toBe(true);
  });

  it('defaults to false when env var not set', () => {
    vi.stubEnv('VITE_UI_REDESIGN', undefined);
    const flags = useFeatureFlags();
    expect(flags.ui_redesign_enabled).toBe(false);
  });
});
```

### Integration Tests

**Component Migration:**
```typescript
// components/__tests__/WorkoutBuilder.integration.test.tsx
describe('WorkoutBuilder with Feature Flags', () => {
  it('uses old UI when flag is off', () => {
    vi.stubEnv('VITE_BOTTOM_SHEETS', 'false');
    const { getByTestId } = render(<WorkoutBuilder />);

    // Old UI: Full-screen modal
    expect(getByTestId('exercise-picker-modal')).toBeInTheDocument();
  });

  it('uses new UI when flag is on', () => {
    vi.stubEnv('VITE_BOTTOM_SHEETS', 'true');
    const { getByTestId } = render(<WorkoutBuilder />);

    // New UI: Bottom sheet
    expect(getByTestId('exercise-picker-sheet')).toBeInTheDocument();
    expect(getByTestId('exercise-picker-sheet')).toHaveClass('h-[60vh]');
  });
});
```

**API Integration (No Changes Expected):**
```typescript
// Existing tests should still pass (no API changes)
describe('Workout Completion Flow', () => {
  it('calculates fatigue after workout', async () => {
    const { getByRole } = render(<Workout />);

    // Log sets...
    await userEvent.click(getByRole('button', { name: 'Complete Workout' }));

    // Verify API call made (unchanged endpoint)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/workouts/123/complete',
        expect.any(Object)
      );
    });
  });
});
```

### E2E Tests (Playwright)

**Critical User Flows:**
```typescript
// e2e/workout-logging.spec.ts
test('Log workout with new bottom sheet UI', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Open exercise picker (bottom sheet)
  await page.click('[data-testid="add-exercise-fab"]');
  await page.waitForSelector('[data-testid="exercise-picker-sheet"]');

  // Verify bottom sheet height
  const sheet = page.locator('[data-testid="exercise-picker-sheet"]');
  await expect(sheet).toHaveCSS('height', '60vh');

  // Search for exercise
  await page.fill('[placeholder="Search exercises..."]', 'Squat');
  await page.click('text=Barbell Squat');

  // Log sets with inline number pickers
  await page.click('[data-testid="inline-picker-weight-increment"]'); // + button
  await page.click('[data-testid="inline-picker-reps-increment"]');
  await page.click('text=Log Set');

  // Verify rest timer auto-starts
  await expect(page.locator('[data-testid="rest-timer-banner"]')).toBeVisible();
  await expect(page.locator('text=90s')).toBeVisible();

  // Complete workout
  await page.click('text=Complete Workout');
  await expect(page.locator('text=Workout Summary')).toBeVisible();
});

test('Swipe to dismiss bottom sheet', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="add-exercise-fab"]');

  const sheet = page.locator('[data-testid="exercise-picker-sheet"]');
  await expect(sheet).toBeVisible();

  // Simulate swipe down gesture
  await sheet.dragTo(sheet, {
    sourcePosition: { x: 200, y: 50 },
    targetPosition: { x: 200, y: 400 },
  });

  // Verify sheet dismissed
  await expect(sheet).not.toBeVisible();
});
```

**Accessibility Tests:**
```typescript
// e2e/accessibility.spec.ts
test('Keyboard navigation through bottom sheet', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="add-exercise-fab"]');

  // Focus should trap inside sheet
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focusedElement).toContain('exercise-picker');

  // ESC key should close sheet
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="exercise-picker-sheet"]')).not.toBeVisible();
});

test('WCAG AA compliance', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Run axe accessibility checks
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toHaveLength(0);
});
```

### Visual Regression Tests

**Screenshot Comparison:**
```typescript
// e2e/visual-regression.spec.ts
test('Dashboard matches design system', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await expect(page).toHaveScreenshot('dashboard-new-ui.png', {
    fullPage: true,
    threshold: 0.2, // Allow 20% difference for dynamic content
  });
});

test('Glass morphism effects render correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Verify backdrop-blur applied
  const card = page.locator('.bg-white\\/50').first();
  const backdropFilter = await card.evaluate(el =>
    window.getComputedStyle(el).backdropFilter
  );
  expect(backdropFilter).toContain('blur');
});
```

**Responsive Breakpoints:**
```typescript
// e2e/responsive.spec.ts
test('Mobile layout (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('http://localhost:3000');

  // Verify touch targets are 60x60px
  const button = page.locator('[data-testid="log-set-button"]');
  const box = await button.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(60);
  expect(box?.height).toBeGreaterThanOrEqual(60);
});

test('Tablet layout (768px)', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad Mini
  await page.goto('http://localhost:3000');

  // Verify bottom sheet uses 60vh height (not 90vh)
  const sheet = page.locator('[data-testid="exercise-picker-sheet"]');
  await expect(sheet).toHaveCSS('height', '60vh');
});
```

---

## 8. Performance Targets

### Core Web Vitals

**Lighthouse Scores (Target: 90+ All Categories):**
```
Performance:    90+
Accessibility:  90+
Best Practices: 90+
SEO:            90+
```

**Specific Metrics:**
```typescript
// Core Web Vitals (measured in production)
LCP (Largest Contentful Paint): < 2.5s
  - Current: ~2.1s (baseline)
  - Target: < 2.5s (maintain)
  - Risk: Fonts + glass effects could increase LCP
  - Mitigation: Preload fonts, optimize images

FID (First Input Delay): < 100ms
  - Current: ~40ms (baseline)
  - Target: < 100ms (maintain)
  - Risk: Framer Motion animations could block main thread
  - Mitigation: Use GPU-accelerated transforms only

CLS (Cumulative Layout Shift): < 0.1
  - Current: ~0.05 (baseline)
  - Target: < 0.1 (maintain)
  - Risk: Font swapping (FOUT/FOIT)
  - Mitigation: font-display: swap, preload fonts
```

### Custom Metrics

**Bundle Size Budget:**
```
Current Bundle:
- React + deps: ~450KB
- Tailwind (CDN): ~300KB (loaded separately)
- Total: ~750KB

New Bundle (PostCSS + Fonts):
- React + deps: ~450KB
- Tailwind (purged): ~80KB (tree-shaken)
- Fonts (Cinzel + Lato): ~300KB (woff2)
- Framer Motion: ~100KB (already installed)
- Vaul: ~15KB (already installed)
- Total: ~945KB

Budget: < 1MB (1000KB)
Current: 945KB ✅ Under budget
Headroom: 55KB for future growth
```

**Animation Performance:**
```typescript
// Target: 60fps for all animations
// Measurement: Chrome DevTools Performance panel

// Good: Uses transform (GPU-accelerated)
<motion.div
  animate={{ x: 100 }}  // ✅ Uses transform: translateX()
  transition={{ type: 'spring' }}
/>

// Bad: Uses width (triggers layout)
<motion.div
  animate={{ width: 300 }}  // ❌ Triggers reflow, causes jank
/>

// Best Practice: Batch animations in single frame
useEffect(() => {
  requestAnimationFrame(() => {
    // Batch DOM reads
    const height = element.offsetHeight;

    // Batch DOM writes
    element.style.transform = `translateY(${height}px)`;
  });
}, []);
```

**API Response Times (No Change Expected):**
```
POST /api/workouts/:id/complete:      < 500ms
POST /api/recommendations/exercises:  < 500ms
GET  /api/recovery/timeline:          < 500ms
POST /api/forecast/workout:           < 500ms

Target: Maintain existing <500ms baseline
UI changes should not impact backend performance
```

### Optimization Strategies

**Code Splitting:**
```typescript
// Lazy load heavy components
const Analytics = React.lazy(() => import('./components/Analytics'));
const MuscleDeepDiveModal = React.lazy(() => import('./components/MuscleDeepDiveModal'));

// Usage with Suspense
<Suspense fallback={<SkeletonScreen />}>
  <Analytics />
</Suspense>
```

**Tree Shaking:**
```javascript
// tailwind.config.js - Purge unused styles
module.exports = {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind will remove unused classes from production build
};

// Estimated savings: 220KB (300KB CDN → 80KB purged)
```

**Font Subsetting:**
```bash
# Use @fontsource packages (already subset)
npm install @fontsource/cinzel  # Only includes used weights (400, 700)
npm install @fontsource/lato     # Only includes used weights (400, 700)

# Estimated size: 300KB total (vs 500KB+ for full fonts)
```

**Image Optimization:**
```typescript
// Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Workout" />
</picture>

// Lazy load images below fold
<img loading="lazy" src="chart.png" alt="Progress chart" />
```

---

## 9. Rollout Strategy

### Phase 1: Internal Testing (Week 1)

**Environment:** Staging
**Audience:** Development team (5-10 users)
**Feature Flag:** `VITE_UI_REDESIGN=true`
**Duration:** 2-3 days

**Actions:**
1. Deploy to staging environment with all feature flags enabled
2. Internal team manual testing (2 days)
   - Test all workflows end-to-end
   - Log bugs in issue tracker
   - Validate design system consistency
3. Fix critical bugs before beta rollout
4. Measure performance impact (Lighthouse scores)
5. Document any unexpected issues

**Exit Criteria:**
- ✅ Zero critical bugs (P0 severity)
- ✅ All core workflows functional
- ✅ Lighthouse scores 90+ on all screens
- ✅ Team approval to proceed to beta

---

### Phase 2: Beta Users (Weeks 2-3)

**Environment:** Production
**Audience:** Opted-in beta testers (10% of user base)
**Feature Flag:** `VITE_UI_REDESIGN=true` (controlled rollout)
**Duration:** 1-2 weeks

**Actions:**
1. Deploy to production with feature flag OFF by default
2. Enable for 10% of users (random selection or opt-in)
3. Collect feedback via in-app survey
   ```typescript
   // Show survey after 3 days of using new UI
   if (daysUsedNewUI >= 3) {
     showSurvey({
       title: "How's the new UI?",
       questions: [
         "Rate your experience (1-5 stars)",
         "What do you like most?",
         "What could be improved?",
         "Would you recommend to a friend?"
       ]
     });
   }
   ```
4. Monitor error rates and performance metrics
   - Error tracking (Sentry or similar)
   - Performance monitoring (Google Analytics)
   - User engagement (time on app, workout completion rate)
5. Iterate based on feedback
   - Fix P1 bugs (high impact, medium severity)
   - Tweak UI based on common complaints
   - Optimize performance bottlenecks

**Exit Criteria:**
- ✅ Error rate increase <5%
- ✅ Performance degradation <10%
- ✅ NPS score stable or improved (+0 to +10)
- ✅ >80% positive feedback from beta users
- ✅ Zero critical bugs reported

---

### Phase 3: Gradual Rollout (Weeks 3-4)

**Environment:** Production
**Audience:** 50% of users (A/B test)
**Feature Flag:** Controlled via Railway dashboard
**Duration:** 1 week

**Actions:**
1. Increase rollout to 50% of users
2. A/B test: Compare old UI vs new UI
   ```typescript
   // Track metrics for both groups
   const metrics = {
     oldUI: {
       workoutCompletionRate: 0.85,
       avgSessionDuration: 12.5, // minutes
       nps: 35,
       errorRate: 0.02,
     },
     newUI: {
       workoutCompletionRate: 0.92, // +8% 🎉
       avgSessionDuration: 14.2,    // +13% 🎉
       nps: 42,                     // +7 points 🎉
       errorRate: 0.021,            // +0.001 (acceptable)
     }
   };
   ```
3. Monitor for 7 days, compare metrics
4. If metrics positive: proceed to full launch
5. If metrics negative: pause and investigate

**Decision Matrix:**
| Metric | Old UI | New UI | Change | Action |
|--------|--------|--------|--------|--------|
| Workout Completion | 85% | 92% | +8% | ✅ Launch |
| Session Duration | 12.5min | 14.2min | +13% | ✅ Launch |
| NPS | 35 | 42 | +7 | ✅ Launch |
| Error Rate | 0.02 | 0.021 | +0.001 | ✅ Acceptable |

**Exit Criteria:**
- ✅ Metrics show improvement or neutral (no regressions)
- ✅ User feedback remains positive
- ✅ Team consensus to proceed
- ✅ Rollback plan tested and ready

---

### Phase 4: Full Launch (Week 4)

**Environment:** Production
**Audience:** 100% of users
**Feature Flag:** `VITE_UI_REDESIGN=true` (permanent)
**Duration:** 1 week monitoring

**Actions:**
1. Enable new UI for 100% of users
2. Monitor for 48 hours
   - Watch error rates closely
   - Check support ticket volume
   - Monitor server load
3. Remove feature flag toggle from settings (Week 5)
   - Users can no longer switch back to old UI
4. Cleanup: Remove old component implementations (Week 5-6)
   ```typescript
   // Before (feature flag wrapper)
   export function Button(props) {
     const { ui_redesign_enabled } = useFeatureFlags();
     if (ui_redesign_enabled) return <NewButton {...props} />;
     return <OldButton {...props} />;  // ❌ DELETE
   }

   // After (cleanup)
   export function Button(props) {
     return <NewButton {...props} />;  // ✅ Single implementation
   }
   ```
5. Archive feature flag system
6. Celebrate success with team! 🎉

**Success Indicators:**
- ✅ Stable error rates (<5% increase)
- ✅ Support tickets under control (<20% increase)
- ✅ User feedback remains positive
- ✅ Lighthouse scores 90+ maintained
- ✅ No critical bugs reported

**Rollback Plan (If Needed):**
```bash
# Instant rollback (< 5 minutes)
1. Open Railway dashboard
2. Set VITE_UI_REDESIGN=false
3. Redeploy (automatic)
4. Verify old UI restored
5. Notify users of temporary rollback
6. Fix critical issue in dev environment
7. Re-test in staging
8. Re-launch when ready
```

---

## 10. Summary

### Key Architectural Decisions

**1. Tailwind CDN → PostCSS Migration**
- **Decision:** Migrate from CDN to PostCSS-based Tailwind
- **Rationale:** Enables custom design tokens, tree-shaking, better performance
- **Impact:** Requires build process update, reduces bundle size by 220KB
- **Risk:** Medium (could break build during migration)
- **Mitigation:** Test in separate branch, keep CDN as backup, document rollback

**2. Feature Flag Strategy**
- **Decision:** Use environment variable feature flags for gradual rollout
- **Rationale:** Minimizes risk, allows instant rollback, enables A/B testing
- **Impact:** Temporary code duplication, cleanup needed post-launch
- **Risk:** Low (simple boolean flags)
- **Mitigation:** Remove flags after 100% rollout (Week 5 cleanup)

**3. Parallel Component Approach**
- **Decision:** Old and new UI coexist during migration (Weeks 2-4)
- **Rationale:** Zero downtime, safe rollout, gradual user adoption
- **Impact:** 2x component maintenance during transition
- **Risk:** Low (well-defined migration path)
- **Mitigation:** Clear timeline for removing old code

**4. Bottom Sheet Pattern (Vaul)**
- **Decision:** Replace full-screen modals with bottom sheets
- **Rationale:** Industry-standard mobile UX, reduces modal nesting 4 → 2 levels
- **Impact:** New dependency (~15KB), better touch interactions
- **Risk:** Low (popular library, fallback to custom implementation if needed)
- **Mitigation:** Test thoroughly on iOS Safari + Android Chrome

**5. No Backend Changes**
- **Decision:** UI redesign independent of backend services
- **Rationale:** Reduces scope, faster deployment, parallel development possible
- **Impact:** Frontend-only changes, all 20+ API endpoints unchanged
- **Risk:** None (backend stability maintained)

### Migration Timeline

**Total Duration:** 4-6 weeks (4 epics across 3-4 sprints)

| Epic | Duration | Key Deliverables |
|------|----------|------------------|
| **Epic 5: Design System** | Week 1 (5 days) | Tailwind PostCSS, tokens, primitives, Storybook |
| **Epic 6: Core Interaction** | Weeks 2-3 (10 days) | Bottom sheets, inline pickers, touch targets |
| **Epic 7: Intelligence** | Weeks 3-4 (5 days) | Auto-timer, smart shortcuts, filters |
| **Epic 8: Polish** | Week 4 (5 days) | Animations, accessibility, dark mode |
| **Rollout** | Week 4 (gradual) | 10% → 50% → 100% users |
| **Cleanup** | Week 5-6 | Remove flags, delete old code |

### Success Metrics

**Primary Targets:**
- ✅ **60% interaction reduction:** 8-12 clicks → 3-4 taps per set
- ✅ **WCAG AA+ compliance:** Lighthouse accessibility 90+
- ✅ **Touch target compliance:** 90%+ at 60×60px minimum
- ✅ **Performance maintained:** Lighthouse 90+ all categories

**Secondary Targets:**
- ✅ **NPS improvement:** +10-15 points (measure premium perception)
- ✅ **30-day retention:** +15% (reduced friction)
- ✅ **"Beautiful" mentions:** 3x increase in reviews
- ✅ **Bundle size:** <1MB (current 945KB ✅)

### Risk Mitigation Summary

**High Risks:**
1. Tailwind migration breaking build → Test in branch, keep CDN backup
2. User confusion from UI change → Onboarding tour, gradual rollout, easy toggle
3. Performance degradation → 60fps target, Lighthouse CI, kill switch

**Medium Risks:**
4. Feature flag complexity → Simple flags, clear naming, cleanup after launch
5. Dark mode edge cases → Dedicated testing, screenshot comparison
6. Bottom sheet library bugs → Test thoroughly, custom fallback ready

**Low Risks:**
7. Font loading performance → Preload fonts, font-display: swap
8. Glass morphism compatibility → Feature detection, solid fallback

### Integration Points

**Frontend Changes:**
- 96 React components migrated to new design system
- New design-system/ folder with tokens + primitives
- Tailwind config with custom colors, fonts, shadows
- Feature flags in src/lib/feature-flags.ts

**Backend Changes:**
- **None** - All 20+ REST endpoints unchanged
- No database schema modifications
- No business logic changes

**Deployment Changes:**
- **Development:** Docker Compose (HMR still works)
- **Production:** Railway (add VITE_UI_REDESIGN env var)
- **Build:** Vite build with Tailwind PostCSS (no code changes)

### Final Checklist

**Before Launch:**
- [ ] Tailwind PostCSS migration tested and verified
- [ ] All 8 primitive components built and documented
- [ ] 15+ major screens migrated to new UI
- [ ] Feature flags tested (both old and new UI paths)
- [ ] Accessibility audit complete (Lighthouse 90+)
- [ ] Performance audit complete (bundle <1MB, 60fps)
- [ ] Dark mode tested on all screens
- [ ] E2E tests cover critical workflows
- [ ] Rollback plan documented and tested

**After Launch:**
- [ ] Monitor metrics for 2 weeks (error rate, NPS, performance)
- [ ] Collect user feedback via in-app survey
- [ ] Fix P1 bugs within 48 hours
- [ ] Remove feature flags after stable rollout (Week 5)
- [ ] Delete old component code (Week 5-6)
- [ ] Archive feature flag system (Week 6)
- [ ] Update documentation with new UI patterns
- [ ] Celebrate with team! 🎉

---

**Document Generated:** 2025-11-12
**Version:** 1.0
**Author:** Winston (Architecture Agent in Autonomous Mode)
**Next Step:** Execute Epic 5 (Design System Foundation) using story sprint workflow

_This architecture ensures the UI redesign integrates seamlessly with FitForge's existing brownfield codebase while minimizing risk through feature flags, gradual rollout, and comprehensive testing._
