# Story 6.5.2D: Large Page Migrations

Status: ready-for-dev

## Story

As a user,
I want Profile, Workout, and Dashboard pages to use the unified design system,
so that I experience consistent styling, improved touch targets, glass morphism effects, and maintainable component architecture across all major application pages.

## Acceptance Criteria

1. Profile page uses Card primitive for all sections
2. Workout page uses Sheet primitive for workout builder modal
3. Dashboard uses Card primitive for quick stats sections
4. All forms use Input primitive with consistent styling
5. All buttons use Button primitive with proper variants
6. Design tokens used for all colors (no hardcoded hex/rgb)
7. WCAG AA compliance (60x60px touch targets)
8. Glass morphism applied consistently
9. Comprehensive tests (20+ tests per component, 60+ total)
10. Zero regressions in existing functionality

## Tasks / Subtasks

- [ ] **Task 1: Migrate Profile.tsx** (AC: 1, 4, 5, 6, 7, 8, 10)
  - [ ] Replace inline Card JSX with `<Card>` primitive from `@/src/design-system/components/primitives`
  - [ ] Replace all form inputs with `<Input>` primitive (consistent styling)
  - [ ] Replace inline Button elements with `<Button>` primitive (variant-aware)
  - [ ] Replace inline Select elements with `<Select>` primitive (if used)
  - [ ] Update all color references to use design tokens (`bg-primary`, `text-secondary`, etc.)
  - [ ] Apply glass morphism styling to cards (`bg-white/50`, `backdrop-blur-lg`)
  - [ ] Ensure all touch targets are minimum 60x60px (WCAG AA compliance)
  - [ ] Update imports to use design-system barrel exports
  - [ ] Update/create tests for new component structure (20+ tests)
  - [ ] Verify no visual regressions (functionality preservation)

- [ ] **Task 2: Migrate Workout.tsx** (AC: 2, 4, 5, 6, 7, 8, 10)
  - [ ] Replace workout builder modal with `<Sheet>` primitive (bottom drawer pattern)
  - [ ] Replace inline Card JSX with `<Card>` primitive for workout sections
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace all form inputs with `<Input>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Update/create tests for new component structure (20+ tests)
  - [ ] Verify no visual regressions (workout tracking functionality preserved)

- [ ] **Task 3: Migrate Dashboard.tsx** (AC: 3, 5, 6, 7, 8, 10)
  - [ ] Replace inline Card JSX with `<Card>` primitive for quick stats sections
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Badge elements with `<Badge>` primitive (if used for status indicators)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Update/create tests for new component structure (20+ tests)
  - [ ] Verify no visual regressions (dashboard visualizations preserved)

- [ ] **Task 4: Verification and Testing** (AC: 9, 10)
  - [ ] Run full test suite (ensure baseline tests still passing)
  - [ ] Test Profile functionality (user data display, editing, saving)
  - [ ] Test Workout functionality (workout tracking, set logging, completion)
  - [ ] Test Dashboard functionality (stats display, navigation, quick actions)
  - [ ] Verify touch target sizes using browser dev tools
  - [ ] Cross-browser testing (Chrome, Safari, Firefox if applicable)
  - [ ] Mobile device testing (responsive layout verification)
  - [ ] Verify Sheet animations are smooth (workout builder modal)
  - [ ] Ensure 60+ total tests passing (20+ per component)

## Dev Notes

### Design System Integration Context

This story is part of **Epic 6.5: Design System Rollout**, which aims to achieve 100% design system adoption across all 77 components in the codebase. This is the largest single migration story in Epic 6.5, migrating 2,334 lines across three critical pages.

**Completed in Epic 6.5:**
- Story 6.5.1: Railway Deployment & Missing Primitives ✅ (Badge, ProgressBar, Select created)
- Story 6.5.2A: Design System Patterns ✅ (Toast, CollapsibleSection, Modal→Sheet documentation)
- Story 6.5.2B: Small Page Migrations ✅ (WorkoutTemplates, Analytics - 456 lines migrated)
- Story 6.5.2C: Medium Page Migrations ✅ (RecoveryDashboard, ExerciseRecommendations - 866 lines migrated)

**Key Design System Components Available:**

- **Card Primitive**: `src/design-system/components/primitives/Card.tsx`
  - Glass morphism styling (`bg-white/50`, `backdrop-blur-lg`)
  - Variants: default, elevated, flat
  - Props: children, variant, className, onClick, etc.

- **Button Primitive**: `src/design-system/components/primitives/Button.tsx`
  - Variants: primary, secondary, tertiary, ghost, destructive
  - Sizes: sm, md, lg
  - States: disabled, loading
  - Touch-friendly (minimum 60x60px)

- **Input Primitive**: `src/design-system/components/primitives/Input.tsx`
  - Variants: text, number, email, password, etc.
  - States: disabled, error, success
  - Consistent styling across all forms

- **Sheet Primitive**: `src/design-system/components/primitives/Sheet.tsx`
  - Bottom drawer pattern (replaces modal)
  - Framer Motion animations
  - Backdrop overlay support
  - Mobile-first responsive

- **Badge Primitive**: `src/design-system/components/primitives/Badge.tsx`
  - Variants: success, warning, error, info, primary
  - Sizes: sm, md, lg
  - Used for status indicators, counts, labels

- **Select Primitive**: `src/design-system/components/primitives/Select.tsx`
  - Keyboard navigation support
  - Variants: default, error
  - Accessible dropdown implementation

**Design Tokens (from tailwind.config.js):**

Colors:
- Primary: `#758AC6` (Cinzel Blue) - `bg-primary`, `text-primary`
- Secondary: `#566890` (Muted Blue) - `bg-secondary`, `text-secondary`
- Accent: `#C67575` (Rose) - `bg-accent`, `text-accent`
- Background: `#F5F7FA` (Light Gray) - `bg-background`
- Surface: `white` with opacity (`bg-white/50` for glass morphism)
- Text: `#344161` (Dark Blue) - `text-foreground`

Spacing: Tailwind default scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64)

Typography:
- Headings: Cinzel (serif, elegant) - `font-display`
- Body: Lato (sans-serif, readable) - `font-body`

### Component File Locations

**Target Files for Migration:**
1. `components/Profile.tsx` (518 lines) - user profile management
2. `components/Workout.tsx` (904 lines) - active workout tracking
3. `components/Dashboard.tsx` (912 lines) - main dashboard with visualizations

**Total Lines to Migrate:** 2,334 lines (largest migration in Epic 6.5)

**Expected Changes:**
- Import paths: Replace old component imports with `import { Card, Button, Input, Sheet, Badge, Select } from '@/src/design-system/components/primitives'`
- Component usage: Replace inline JSX with primitive components
- Styling: Replace hardcoded colors with design tokens
- Props: Adapt to new component APIs (may require prop mapping)
- State management: Ensure component state is preserved during migration

### Testing Strategy

**Test Files to Create/Update:**
- `components/__tests__/Profile.test.tsx` (create - 20+ comprehensive tests)
- `components/__tests__/Workout.test.tsx` (create - 20+ comprehensive tests)
- `components/__tests__/Dashboard.test.tsx` (create - 20+ comprehensive tests)

**Test Coverage Requirements:**
- Unit tests for component rendering with design system primitives
- Integration tests for user interactions (clicks, form submissions, navigation)
- Accessibility tests (ARIA attributes, keyboard navigation, axe-core compliance)
- Sheet animation tests (smooth transitions for workout builder modal)
- Touch target size verification (60x60px minimum)
- Visual regression prevention through functional testing
- State management tests (ensure data persistence across component updates)

### Architecture Patterns and Constraints

**From architecture-ui-redesign-2025-11-12.md:**

1. **No Backend Changes**: UI redesign is frontend-only, all 20+ API endpoints remain unchanged
2. **Progressive Enhancement**: Old and new UI should coexist during migration (though for this story, direct replacement is acceptable as Epic 5 is complete)
3. **Glass Morphism Pattern**: Cards use `bg-white/50` with `backdrop-blur-lg` for depth
4. **Touch Target Compliance**: WCAG AA requires 60x60px minimum (currently 20x20px in some places)
5. **Component API Consistency**: Maintain existing component APIs where possible to minimize breaking changes

**Component Import Strategy:**
```typescript
// ✅ CORRECT: Use barrel exports
import { Card, Button, Input, Sheet, Badge, Select } from '@/src/design-system/components/primitives'

// ❌ INCORRECT: Direct imports (avoid)
import Card from '@/src/design-system/components/primitives/Card/Card'
```

**Design Token Usage:**
```tsx
// ✅ CORRECT: Use design tokens
<div className="bg-primary text-white">...</div>
<Card variant="elevated" className="bg-white/50 backdrop-blur-lg">...</Card>
<Button variant="primary" size="lg">Save Profile</Button>

// ❌ INCORRECT: Hardcoded colors
<div className="bg-[#758AC6] text-white">...</div>
<div style={{ backgroundColor: '#758AC6' }}>...</div>
```

**Sheet Pattern for Modals:**
```tsx
// ✅ CORRECT: Use Sheet primitive for workout builder
<Sheet isOpen={isWorkoutBuilderOpen} onClose={() => setIsWorkoutBuilderOpen(false)}>
  <Sheet.Content>
    {/* Workout builder content */}
  </Sheet.Content>
</Sheet>

// ❌ INCORRECT: Legacy modal implementation
<Modal show={show} onHide={onHide}>...</Modal>
```

### Project Structure Notes

**Design System Location:**
```
src/design-system/
├── components/
│   ├── primitives/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Sheet/
│   │   ├── Badge/
│   │   ├── Select/
│   │   └── index.ts (barrel exports)
│   └── patterns/ (Toast, CollapsibleSection, etc.)
├── tokens/
│   └── colors.ts, spacing.ts, typography.ts
└── README.md
```

**Component Files to Modify:**
```
components/
├── Profile.tsx (518 lines) - MIGRATE
├── Workout.tsx (904 lines) - MIGRATE
├── Dashboard.tsx (912 lines) - MIGRATE
└── (remaining components) - FUTURE STORIES
```

**No conflicts detected** - Profile, Workout, and Dashboard are top-level page components with minimal cross-dependencies.

### Learnings from Previous Story

**From Story 6.5.2C (Medium Page Migrations) - Status: done**

Story 6.5.2C successfully migrated RecoveryDashboard.tsx and ExerciseRecommendations.tsx (866 lines total) to design system primitives. All 40 core tests passing with full accessibility compliance. Code review APPROVED on first pass with zero code changes required.

**Key Patterns to Reuse:**

1. **Design Token Conversions** (Apply Same Patterns):
   - `bg-brand-dark` → `bg-background`
   - `text-brand-cyan` → `text-primary`
   - `bg-brand-cyan` → `bg-primary`
   - `bg-brand-surface` → Card primitive with glass morphism
   - `text-slate-*` → `text-gray-*`
   - Font classes: `font-display` (Cinzel) for headings, `font-body` (Lato) for text

2. **Components Used** (Same Primitives Available):
   - Card: Glass morphism cards with variants (default, elevated)
   - Button: Primary, secondary, ghost variants with 60x60px touch targets
   - Badge: Success, warning, error, info, primary variants
   - ProgressBar: Smooth spring animations for recovery indicators

3. **Testing Strategy** (Follow Established Patterns):
   - Unit tests for component rendering and design system integration
   - Integration tests for user interactions
   - Accessibility tests (axe-core, ARIA labels, keyboard navigation)
   - Touch target size verification (min-w-[60px] min-h-[60px])
   - Visual regression prevention through functional testing

4. **Barrel Export Pattern**:
   - Both files in 6.5.2C used `@/src/design-system/components/primitives` barrel exports
   - All primitives already exported in barrel (Badge, ProgressBar, Card, Button, Input, Sheet, Select)

**Known Limitations from 6.5.2C:**
- Accessibility: Card primitives use `role="region"` without unique accessible names, causing landmark-unique violations. Disabled this rule in tests as it's a design system primitive limitation to be addressed in a future story.
- Minor act() warnings in keyboard navigation tests are cosmetic and don't affect functionality.

**Technical Debt to Watch:**
- No specific technical debt items from 6.5.2C that affect this story.

**Architectural Decisions from 6.5.2C:**
- Maintained existing component APIs (RecoveryDashboardProps, ExerciseRecommendationsProps unchanged)
- Frontend-only changes (no backend API modifications)
- All functionality preserved and tested (behavior parity)

**Files Created/Modified in 6.5.2C** (For Reference):
- `components/screens/RecoveryDashboard.tsx` (migrated) - 366 lines
- `components/ExerciseRecommendations.tsx` (migrated) - 500 lines
- `components/__tests__/RecoveryDashboard.test.tsx` (created) - 22 tests
- `components/__tests__/ExerciseRecommendations.test.tsx` (created) - 26 tests

**Recommendations for This Story (6.5.2D):**
- Follow the same testing patterns (20+ tests per component meets the "comprehensive" requirement)
- Use the same design token conversion patterns
- Apply glass morphism consistently (`bg-white/50 backdrop-blur-lg`)
- Ensure 60x60px touch targets with `min-w-[60px] min-h-[60px]` classes
- Disable `landmark-unique` axe rule in tests (known Card primitive limitation)
- Pay special attention to Sheet component usage in Workout.tsx (workout builder modal)
- Profile.tsx and Dashboard.tsx likely use many Input/Select primitives (form-heavy pages)
- Test state management carefully since these are complex, stateful components

[Source: .bmad-ephemeral/stories/6-5-2c-medium-page-migrations.md]

### References

- [Source: docs/epics.md - Epic 6.5: Design System Rollout - Story 6.5.2D]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.2: Current Component Structure]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.4: Technical Debt Identified]
- [Source: docs/sprint-status.yaml - Epic 6.5 Status: Stories 6.5.1, 6.5.2A, 6.5.2B, 6.5.2C complete]
- [Source: CHANGELOG.md - Story 6.5.1: Badge, ProgressBar, Select primitives created]
- [Source: CHANGELOG.md - Story 6.5.2B: Design token conversion patterns]
- [Source: CHANGELOG.md - Story 6.5.2C: Medium page migration patterns established]

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/6-5-2d-large-page-migrations.context.xml` - Story context generated 2025-11-13

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
