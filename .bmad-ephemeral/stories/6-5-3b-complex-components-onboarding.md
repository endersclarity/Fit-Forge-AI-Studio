# Story 6.5.3B: Complex Components & Onboarding

Status: drafted

## Story

As a user,
I want all complex components (MuscleVisualization, MuscleBaselinesPage, SetConfigurator, ExercisePicker, RecommendationCard, TargetModePanel, ExerciseCard) and onboarding flow components (EquipmentStep, ProfileWizard) to use the unified design system,
so that I experience consistent styling, improved touch targets, glass morphism effects, and modern interaction patterns across all complex UI interactions and the onboarding experience.

## Acceptance Criteria

1. All 9 components migrated to design system primitives
2. All cards use Card primitive with glass morphism
3. All buttons use Button primitive
4. All form inputs use Input primitive
5. Existing functionality preserved (no behavior changes)
6. Tests updated for new component structure (30+ tests)
7. Design tokens used for all colors (no hardcoded hex/rgb)
8. WCAG AA compliance (60x60px touch targets)
9. Zero regressions in existing component interactions

## Tasks / Subtasks

- [ ] **Task 1: Migrate MuscleVisualization.tsx** (AC: 1, 2, 3, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive from design-system
  - [ ] Replace inline Button elements with `<Button>` primitive (variant-aware)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify MuscleVisualization functionality preserved

- [ ] **Task 2: Migrate MuscleBaselinesPage.tsx** (AC: 1, 2, 3, 4, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify MuscleBaselinesPage functionality preserved

- [ ] **Task 3: Migrate SetConfigurator.tsx** (AC: 1, 2, 3, 4, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify SetConfigurator functionality preserved

- [ ] **Task 4: Migrate ExercisePicker.tsx** (AC: 1, 2, 3, 4, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (search inputs)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify ExercisePicker functionality preserved

- [ ] **Task 5: Migrate RecommendationCard.tsx** (AC: 1, 2, 3, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify RecommendationCard functionality preserved

- [ ] **Task 6: Migrate TargetModePanel.tsx** (AC: 1, 2, 3, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify TargetModePanel functionality preserved

- [ ] **Task 7: Migrate ExerciseCard.tsx** (AC: 1, 2, 3, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify ExerciseCard functionality preserved

- [ ] **Task 8: Migrate onboarding/EquipmentStep.tsx** (AC: 1, 2, 3, 4, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (if present)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify EquipmentStep functionality preserved

- [ ] **Task 9: Migrate onboarding/ProfileWizard.tsx** (AC: 1, 2, 3, 4, 7, 8)
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify ProfileWizard functionality preserved

- [ ] **Task 10: Create/Update Tests** (AC: 6, 8, 9)
  - [ ] Create/update MuscleVisualization.test.tsx (5+ tests)
  - [ ] Create/update MuscleBaselinesPage.test.tsx (4+ tests)
  - [ ] Create/update SetConfigurator.test.tsx (4+ tests)
  - [ ] Create/update ExercisePicker.test.tsx (4+ tests)
  - [ ] Create/update RecommendationCard.test.tsx (3+ tests)
  - [ ] Create/update TargetModePanel.test.tsx (3+ tests)
  - [ ] Create/update ExerciseCard.test.tsx (3+ tests)
  - [ ] Create/update EquipmentStep.test.tsx (2+ tests)
  - [ ] Create/update ProfileWizard.test.tsx (2+ tests)
  - [ ] Ensure tests cover design system integration
  - [ ] Verify touch target size compliance in tests
  - [ ] Test accessibility with axe-core
  - [ ] Verify no visual regressions (functionality preservation)

- [ ] **Task 11: Verification and Final Testing** (AC: 5, 6, 8, 9)
  - [ ] Run full test suite - ensure zero regressions
  - [ ] Test all component interactions
  - [ ] Test all form submissions
  - [ ] Verify 30+ tests passing
  - [ ] Cross-browser testing (component rendering verified through tests)
  - [ ] Mobile device testing (responsive layout verification)
  - [ ] Test muscle visualization rendering
  - [ ] Test onboarding flow completion

## Dev Notes

### Design System Integration Context

This story is part of **Epic 6.5: Design System Rollout**, which aims to achieve 100% design system adoption across all 77 components in the codebase. Epic 5 successfully created the design system foundation (primitives, tokens, Storybook documentation), and Epic 6 integrated 4 core workflow components as reference implementations.

**Completed in Epic 6.5:**
- Story 6.5.1: Railway Deployment & Missing Primitives (Badge, ProgressBar, Select created)
- Story 6.5.2A: Design System Patterns (Toast, CollapsibleSection, Modal→Sheet documentation)
- Story 6.5.2B: Small Page Migrations (WorkoutTemplates, Analytics - 456 lines migrated)
- Story 6.5.2C: Medium Page Migrations (RecoveryDashboard, ExerciseRecommendations - 866 lines migrated)
- Story 6.5.2D-1: Profile Page Migration (Profile - 668 lines migrated)
- Story 6.5.2D-2: Workout Page Migration (Workout - 904 lines migrated)
- Story 6.5.2D-3: Dashboard Page Migration (Dashboard - 912 lines migrated)
- Story 6.5.3A: Modal Components Migration (6 modals - 1,631 lines migrated)

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
  - Variants: default, error, success
  - Sizes: sm, md, lg
  - States: disabled, error
  - Label and error message support

- **Badge Primitive**: `src/design-system/components/primitives/Badge.tsx`
  - Variants: success, warning, error, info, primary
  - Used for status indicators and tags

- **ProgressBar Primitive**: `src/design-system/components/primitives/ProgressBar.tsx`
  - Animated progress bars with spring physics
  - Used in muscle capacity visualization

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
1. `components/MuscleVisualization.tsx` (379 lines)
2. `components/MuscleBaselinesPage.tsx` (299 lines)
3. `components/SetConfigurator.tsx` (291 lines)
4. `components/ExercisePicker.tsx` (275 lines)
5. `components/RecommendationCard.tsx` (215 lines)
6. `components/TargetModePanel.tsx` (215 lines)
7. `components/ExerciseCard.tsx` (209 lines)
8. `components/onboarding/EquipmentStep.tsx` (223 lines)
9. `components/onboarding/ProfileWizard.tsx` (143 lines)

**Total Lines to Migrate:** 2,249 lines

**Expected Changes:**
- Import Card, Button, Input, Badge, ProgressBar primitives from design-system barrel exports
- Replace inline JSX with primitive components
- Styling: Replace hardcoded colors with design tokens
- Props: Adapt to new primitive APIs

### Testing Strategy

**Test Files to Create/Update:**
- `components/__tests__/MuscleVisualization.test.tsx` (5+ tests)
- `components/__tests__/MuscleBaselinesPage.test.tsx` (4+ tests)
- `components/__tests__/SetConfigurator.test.tsx` (4+ tests)
- `components/__tests__/ExercisePicker.test.tsx` (4+ tests)
- `components/__tests__/RecommendationCard.test.tsx` (3+ tests)
- `components/__tests__/TargetModePanel.test.tsx` (3+ tests)
- `components/__tests__/ExerciseCard.test.tsx` (3+ tests)
- `components/onboarding/__tests__/EquipmentStep.test.tsx` (2+ tests)
- `components/onboarding/__tests__/ProfileWizard.test.tsx` (2+ tests)

**Test Coverage Requirements:**
- Unit tests for component rendering with design system primitives (Card, Button, Input)
- Integration tests for component interactions
- Form submission tests (MuscleBaselinesPage, SetConfigurator, ExercisePicker, ProfileWizard, EquipmentStep)
- Accessibility tests (ARIA attributes, keyboard navigation, axe-core compliance)
- Touch target size verification (60x60px minimum)
- Visual regression prevention through functional testing
- Muscle visualization rendering tests
- Onboarding flow tests

**Total Tests Required:** 30+ tests (3-5 tests per component)

### Architecture Patterns and Constraints

**From architecture-ui-redesign-2025-11-12.md:**

1. **No Backend Changes**: UI redesign is frontend-only, all 20+ API endpoints remain unchanged
2. **Progressive Enhancement**: Old and new UI should coexist during migration (all primitives already available)
3. **Glass Morphism Pattern**: Cards use `bg-white/50` with `backdrop-blur-lg` for depth
4. **Touch Target Compliance**: WCAG AA requires 60x60px minimum (currently 20x20px in some places)

**Component Import Strategy:**
```typescript
// CORRECT: Use barrel exports
import { Card, Button, Input, Badge, ProgressBar } from '@/src/design-system/components/primitives'

// INCORRECT: Direct imports (avoid)
import Card from '@/src/design-system/components/primitives/Card/Card'
```

**Design Token Usage:**
```tsx
// CORRECT: Use design tokens
<div className="bg-primary text-white">...</div>
<Card variant="elevated" className="bg-white/50 backdrop-blur-lg">...</Card>
<Button variant="primary" size="md">Submit</Button>
<Input variant="default" size="md" placeholder="Enter value" />

// INCORRECT: Hardcoded colors
<div className="bg-[#758AC6] text-white">...</div>
<div style={{ backgroundColor: '#758AC6' }}>...</div>
```

**Touch Target Pattern:**
```tsx
// CORRECT: 60x60px minimum
<Button variant="primary" size="md" className="min-h-[60px]">
  Action
</Button>

// INCORRECT: Too small (avoid)
<button className="h-8 w-8">X</button>
```

### Project Structure Notes

**Design System Location:**
```
src/design-system/
├── components/
│   ├── primitives/
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.test.tsx
│   │   │   └── Card.stories.tsx
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.test.tsx
│   │   │   └── Input.stories.tsx
│   │   ├── Badge/
│   │   ├── ProgressBar/
│   │   └── index.ts (barrel exports)
│   └── patterns/ (Toast, CollapsibleSection, etc.)
├── tokens/
│   └── colors.ts, spacing.ts, typography.ts
└── README.md
```

**Component Files to Modify:**
```
components/
├── MuscleVisualization.tsx (379 lines) - MIGRATE
├── MuscleBaselinesPage.tsx (299 lines) - MIGRATE
├── SetConfigurator.tsx (291 lines) - MIGRATE
├── ExercisePicker.tsx (275 lines) - MIGRATE
├── RecommendationCard.tsx (215 lines) - MIGRATE
├── TargetModePanel.tsx (215 lines) - MIGRATE
├── ExerciseCard.tsx (209 lines) - MIGRATE
└── onboarding/
    ├── EquipmentStep.tsx (223 lines) - MIGRATE
    └── ProfileWizard.tsx (143 lines) - MIGRATE
```

**No conflicts detected** - Components are standalone and don't have circular dependencies.

### Learnings from Previous Story

**From Story 6.5.3A (Modal Components Migration) - Status: done**

Story 6.5.3A successfully migrated 6 modal components (1,631 lines) to design system primitives using the Sheet component. Code review status and test results pending in the file.

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
   - Input: Default, error, success variants for form fields
   - Badge: Success, warning, error, info, primary variants
   - ProgressBar: Animated progress bars with spring physics

3. **Testing Strategy** (Follow Established Patterns):
   - Unit tests for component rendering and design system integration
   - Integration tests for user interactions
   - Accessibility tests (axe-core, ARIA labels, keyboard navigation)
   - Touch target size verification (min-w-[60px] min-h-[60px])
   - Visual regression prevention through functional testing
   - Target 30+ tests for this story (3-5 tests per component)

4. **Barrel Export Pattern**:
   - All files use `@/src/design-system/components/primitives` barrel exports
   - All primitives ready for use

**Known Limitations from Previous Stories:**
- Accessibility: Card primitives use `role="region"` without unique accessible names, causing landmark-unique violations. Disabled this rule in tests as it's a design system primitive limitation to be addressed in a future story.
- Minor act() warnings in keyboard navigation tests are cosmetic and don't affect functionality.

**Technical Debt to Watch:**
- localStorage mock added to vitest.setup.ts for state persistence (already available)

**Architectural Decisions from Previous Stories:**
- Maintained existing component APIs (props unchanged)
- Frontend-only changes (no backend API modifications)
- All functionality preserved and tested (behavior parity)

**Recommendations for This Story (6.5.3B):**
- Follow the same testing patterns (30+ tests target)
- Use the same design token conversion patterns
- Apply glass morphism consistently (`bg-white/50 backdrop-blur-lg`)
- Ensure 60x60px touch targets with `min-w-[60px] min-h-[60px]` classes
- Disable `landmark-unique` axe rule in tests (known Card primitive limitation)
- **Focus on complex component states** - muscle visualization, configurators, pickers
- Test form submissions thoroughly (SetConfigurator, ExercisePicker, ProfileWizard, EquipmentStep)
- Test muscle visualization rendering and interaction
- Test onboarding flow completion
- Ensure ProgressBar is used in MuscleVisualization and MuscleBaselinesPage
- Total lines similar to previous migrations - expect 6-8 hours implementation time

[Source: .bmad-ephemeral/stories/6-5-3a-modal-components-migration.md]

### References

- [Source: docs/epics.md - Epic 6.5: Design System Rollout - Story 6.5.3B]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.2: Current Component Structure]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.4: Technical Debt Identified]
- [Source: docs/sprint-status.yaml - Epic 6.5 Status: Stories 6.5.1, 6.5.2A-C, 6.5.2D-1, 6.5.2D-2, 6.5.2D-3, 6.5.3A complete]
- [Source: CHANGELOG.md - Story 6.5.1: Badge, ProgressBar, Select primitives created]
- [Source: CHANGELOG.md - Story 6.5.2A: Design token conversion patterns]
- [Source: CHANGELOG.md - Story 6.5.2B: Small page migrations]
- [Source: CHANGELOG.md - Story 6.5.2C: Medium page migrations]
- [Source: CHANGELOG.md - Story 6.5.2D-1: Profile migration with Input and Select integration]
- [Source: CHANGELOG.md - Story 6.5.2D-2: Workout migration with comprehensive tests]
- [Source: CHANGELOG.md - Story 6.5.2D-3: Dashboard migration with Badge and ProgressBar]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
