# FitForge Source Tree Structure

**Last Updated:** 2025-11-15
**Extracted From:** [docs/architecture-ui-redesign-2025-11-12.md](../architecture-ui-redesign-2025-11-12.md)

## Project Root Structure

```
FitForge-Local/
├── components/              # 96 React components (brownfield)
├── src/                     # Design system (new architecture)
├── backend/                 # Express API server
├── docs/                    # Project documentation
├── .bmad-core/              # BMAD workflow configuration
├── docker-compose.yml       # Local development environment
├── package.json             # Frontend dependencies
└── vite.config.ts           # Vite build configuration
```

## Component Directory (`components/`)

### Legacy UI Components (96 total)

```
components/
├── ui/                      # 13 primitive components
│   ├── Button.tsx           # Wrapper → src/design-system/primitives/Button
│   ├── Card.tsx             # Wrapper → src/design-system/primitives/Card
│   ├── Modal.tsx            # Wrapper → src/design-system/primitives/Sheet
│   ├── Badge.tsx            # Wrapper → src/design-system/primitives/Badge
│   ├── ProgressBar.tsx      # Wrapper → src/design-system/primitives/ProgressBar
│   └── ... (8 more)
│
├── layout/                  # 3 layout components
│   ├── TopNav.tsx           # Navigation bar
│   ├── FAB.tsx              # Wrapper → src/design-system/patterns/FAB
│   └── CollapsibleSection.tsx # Wrapper → src/design-system/patterns/CollapsibleSection
│
├── fitness/                 # 5 specialized components
│   ├── MuscleCard.tsx
│   ├── StatusBadge.tsx
│   ├── ProgressiveOverloadChip.tsx
│   └── ExerciseRecommendationCard.tsx
│
├── onboarding/              # 4 wizard steps
│   ├── ProfileWizard.tsx
│   ├── NameStep.tsx
│   ├── ExperienceStep.tsx
│   └── EquipmentStep.tsx
│
├── (root components)        # 15 major screens
│   ├── Dashboard.tsx        # Main dashboard screen
│   ├── Workout.tsx          # Active workout logging
│   ├── WorkoutBuilder.tsx   # Workout template builder
│   ├── ExerciseRecommendations.tsx
│   ├── RecoveryDashboard.tsx
│   ├── Profile.tsx
│   └── ... (9 more)
│
└── (specialized)            # 60+ feature components
    ├── ExercisePicker.tsx   # Exercise selection modal
    ├── QuickAdd.tsx         # Quick add modal
    ├── MuscleVisualization.tsx
    └── ... (57 more)
```

### Component Wrapper Strategy

**Epic 6.5 Implementation:** Legacy components in `components/` now proxy to design system primitives:

```typescript
// Example: components/ui/Button.tsx
import DesignSystemButton from '@/src/design-system/components/primitives/Button';

export const Button = ({ size = 'md', ...props }) => {
  // Maps legacy 'xl' size to design system 'lg'
  return <DesignSystemButton size={mappedSize} {...props} />;
};
```

**Benefits:**
- Zero breaking changes to existing imports
- Gradual migration without "all-or-nothing" rewrite
- Future codemod can swap imports directly to `@/src/design-system/...`

## Design System Directory (`src/design-system/`)

### New Architecture (Epic 5+)

```
src/design-system/
├── tokens/                  # Design tokens (colors, typography, spacing)
│   ├── colors.ts            # Primary palette, badge colors, glass effects
│   ├── typography.ts        # Cinzel (display) + Lato (body) fonts
│   ├── spacing.ts           # 8px grid scale
│   ├── shadows.ts           # Glass morphism shadow definitions
│   └── animations.ts        # Framer Motion spring configurations
│
├── components/
│   ├── primitives/          # Base UI components
│   │   ├── Button.tsx       # Primary/secondary/ghost variants
│   │   ├── Card.tsx         # Glass morphism card with backdrop-blur
│   │   ├── Sheet.tsx        # Bottom sheet (Vaul wrapper)
│   │   ├── Input.tsx        # Styled input with glass effect
│   │   ├── Badge.tsx        # Equipment/category badges
│   │   ├── Select.tsx       # Custom select dropdown
│   │   └── ProgressBar.tsx  # Styled progress indicator
│   │
│   └── patterns/            # Composite components
│       ├── FAB.tsx          # Floating action button
│       ├── CollapsibleSection.tsx  # Expandable card sections
│       ├── RestTimerBanner.tsx     # 64px fixed-top countdown timer
│       ├── InlineNumberPicker.tsx  # 60pt font +/- controls
│       ├── ExercisePicker.tsx      # Bottom sheet with search
│       └── CategoryPills.tsx       # Pill navigation
│
└── hooks/                   # Custom React hooks
    ├── useHaptic.ts         # Web Vibration API wrapper
    ├── useBottomSheet.ts    # Sheet state management
    └── useRestTimer.ts      # Auto-start timer logic
```

## Backend Directory (`backend/`)

```
backend/
├── routes/                  # 20+ Express routes
│   ├── workouts.ts
│   ├── exercises.ts
│   ├── profile.ts
│   └── ... (17 more)
│
├── services/                # Business logic
│   ├── muscleIntelligence.ts
│   ├── recoveryCalculation.ts
│   └── ...
│
└── db/                      # SQLite database
    └── database.sqlite
```

## Documentation Directory (`docs/`)

```
docs/
├── architecture/            # Architecture documentation
│   ├── tech-stack.md        # THIS FILE - technology inventory
│   ├── coding-standards.md  # Component patterns, style guide
│   └── source-tree.md       # Directory structure reference
│
├── stories/                 # User story markdown files
│   ├── 8-1-framer-motion-animation-system.md
│   ├── 8-2-glass-morphism-refinement.md
│   └── ... (40+ stories)
│
├── architecture-ui-redesign-2025-11-12.md  # Main architecture doc
├── prd-ui-redesign-2025-11-12.md           # Product requirements
├── design-system-wrapper-plan.md           # Epic 6.5 strategy
└── ... (30+ docs)
```

## Key File Locations

### Configuration Files
- `package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind PostCSS configuration
- `.bmad-core/core-config.yaml` - BMAD workflow settings
- `docker-compose.yml` - Development environment

### Entry Points
- `index.tsx` - Frontend application entry
- `App.tsx` - Root React component
- `backend/server.ts` - Express server entry

### Testing
- `**/*.test.tsx` - Component tests (co-located with components)
- `**/*.spec.ts` - Unit tests (co-located with modules)

## File Naming Conventions

### Components
- **PascalCase:** `Button.tsx`, `ExercisePicker.tsx`
- **Co-located tests:** `Button.test.tsx`
- **Interfaces exported:** `ButtonProps`, `ExercisePickerProps`

### Utilities & Hooks
- **camelCase:** `useHaptic.ts`, `formatDate.ts`
- **Prefix hooks with `use`:** `useRestTimer`, `useBottomSheet`

### Documentation
- **kebab-case:** `coding-standards.md`, `tech-stack.md`
- **Versioned docs:** `architecture-ui-redesign-2025-11-12.md`

## Import Path Aliases

```typescript
// Configured in vite.config.ts and tsconfig.json
'@/' → project root
'@/components/' → components directory
'@/src/design-system/' → design system directory
```

### Import Examples
```typescript
// Legacy component wrapper
import { Button } from '@/components/ui/Button';

// Design system primitive (direct)
import DesignSystemButton from '@/src/design-system/components/primitives/Button';

// Design system tokens
import { colors } from '@/src/design-system/tokens/colors';
```

## Where to Find Key Files

### Epic 8 Story Files
- `docs/stories/8-1-framer-motion-animation-system.md`
- `docs/stories/8-2-glass-morphism-refinement.md`
- ... (6 total Epic 8 stories)

### Design System Documentation
- [docs/design-system-wrapper-plan.md](../design-system-wrapper-plan.md) - Wrapper strategy explained
- [docs/architecture-ui-redesign-2025-11-12.md](../architecture-ui-redesign-2025-11-12.md) - Full architecture

### Testing & QA
- `docs/qa/` - QA reports and test results
- `docs/testing/` - Test plans and accessibility reports

## Migration Notes

### Epic 6.5 Wrapper Pattern
- **Old imports remain valid:** `import { Button } from '@/components/ui/Button'`
- **New components use design system:** `import Button from '@/src/design-system/components/primitives/Button'`
- **No breaking changes:** Existing code continues to work
- **Future cleanup:** Run codemod to swap imports after stabilization
