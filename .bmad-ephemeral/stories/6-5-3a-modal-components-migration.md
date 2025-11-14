# Story 6.5.3A: Modal Components Migration

Status: done

## Story

As a user,
I want all modal components to use the unified design system,
so that I experience consistent styling, improved touch targets, glass morphism effects, and the modern bottom drawer pattern across all modal interactions in the application.

## Acceptance Criteria

1. All 6 modals migrated to design system primitives
2. Modals use Sheet component (bottom drawer pattern) replacing old Modal
3. All cards within modals use Card primitive with glass morphism
4. All buttons within modals use Button primitive
5. All form inputs within modals use Input primitive
6. Existing functionality preserved (no behavior changes)
7. Tests updated for new component structure (25+ tests)
8. Design tokens used for all colors (no hardcoded hex/rgb)
9. WCAG AA compliance (60x60px touch targets)
10. Zero regressions in existing modal interactions

## Tasks / Subtasks

- [ ] **Task 1: Migrate WorkoutPlannerModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component (bottom drawer pattern)
  - [ ] Replace inline Card JSX with `<Card>` primitive from design-system
  - [ ] Replace inline Button elements with `<Button>` primitive (variant-aware)
  - [ ] Replace inline Input elements with `<Input>` primitive (variant-aware)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify WorkoutPlannerModal functionality preserved

- [ ] **Task 2: Migrate MuscleDeepDiveModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (if present)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify MuscleDeepDiveModal functionality preserved

- [ ] **Task 3: Migrate modals/MuscleDetailModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (if present)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify MuscleDetailModal functionality preserved

- [ ] **Task 4: Migrate WorkoutSummaryModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (if present)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify WorkoutSummaryModal functionality preserved

- [ ] **Task 5: Migrate SetEditModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify SetEditModal functionality preserved

- [ ] **Task 6: Migrate BaselineUpdateModal.tsx** (AC: 1, 2, 3, 4, 5, 8, 9)
  - [ ] Replace Modal wrapper with Sheet component
  - [ ] Replace inline Card JSX with `<Card>` primitive
  - [ ] Replace inline Button elements with `<Button>` primitive
  - [ ] Replace inline Input elements with `<Input>` primitive (if present)
  - [ ] Update all color references to use design tokens
  - [ ] Apply glass morphism styling to cards
  - [ ] Ensure all touch targets are minimum 60x60px
  - [ ] Update imports to use design-system barrel exports
  - [ ] Verify BaselineUpdateModal functionality preserved

- [ ] **Task 7: Create/Update Tests** (AC: 7, 9, 10)
  - [ ] Create/update WorkoutPlannerModal.test.tsx (5+ tests)
  - [ ] Create/update MuscleDeepDiveModal.test.tsx (5+ tests)
  - [ ] Create/update MuscleDetailModal.test.tsx (4+ tests)
  - [ ] Create/update WorkoutSummaryModal.test.tsx (4+ tests)
  - [ ] Create/update SetEditModal.test.tsx (4+ tests)
  - [ ] Create/update BaselineUpdateModal.test.tsx (3+ tests)
  - [ ] Ensure tests cover Sheet component behavior
  - [ ] Verify touch target size compliance in tests
  - [ ] Test accessibility with axe-core
  - [ ] Verify no visual regressions (functionality preservation)

- [ ] **Task 8: Verification and Final Testing** (AC: 6, 7, 9, 10)
  - [ ] Run full test suite - ensure zero regressions
  - [ ] Test all modal open/close interactions
  - [ ] Test all form submissions within modals
  - [ ] Verify Sheet bottom drawer animations work correctly
  - [ ] Verify 25+ tests passing
  - [ ] Cross-browser testing (component rendering verified through tests)
  - [ ] Mobile device testing (responsive layout verification)

## Dev Notes

### Design System Integration Context

This story is part of **Epic 6.5: Design System Rollout**, which aims to achieve 100% design system adoption across all 77 components in the codebase. Epic 5 successfully created the design system foundation (primitives, tokens, Storybook documentation), and Epic 6 integrated 4 core workflow components as reference implementations.

**Completed in Epic 6.5:**
- Story 6.5.1: Railway Deployment & Missing Primitives ✅ (Badge, ProgressBar, Select created)
- Story 6.5.2A: Design System Patterns ✅ (Toast, CollapsibleSection, Modal→Sheet documentation)
- Story 6.5.2B: Small Page Migrations ✅ (WorkoutTemplates, Analytics - 456 lines migrated)
- Story 6.5.2C: Medium Page Migrations ✅ (RecoveryDashboard, ExerciseRecommendations - 866 lines migrated)
- Story 6.5.2D-1: Profile Page Migration ✅ (Profile - 668 lines migrated)
- Story 6.5.2D-2: Workout Page Migration ✅ (Workout - 904 lines migrated)
- Story 6.5.2D-3: Dashboard Page Migration ✅ (Dashboard - 912 lines migrated)

**Key Design System Components Available:**

- **Sheet Primitive**: `src/design-system/components/primitives/Sheet.tsx`
  - Modern bottom drawer pattern (replaces old Modal)
  - Built on Vaul library (industry-standard mobile UX)
  - Smooth slide-up animation with backdrop
  - Swipe-to-dismiss gesture support
  - Props: open, onOpenChange, children, snapPoints, etc.
  - **Key Component for This Story**: All 6 modals will use Sheet

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
1. `components/WorkoutPlannerModal.tsx` (545 lines)
2. `components/MuscleDeepDiveModal.tsx` (317 lines)
3. `components/modals/MuscleDetailModal.tsx` (221 lines)
4. `components/WorkoutSummaryModal.tsx` (208 lines)
5. `components/SetEditModal.tsx` (263 lines)
6. `components/BaselineUpdateModal.tsx` (77 lines)

**Total Lines to Migrate:** 1,631 lines

**Expected Changes:**
- Import paths: Replace old Modal import with Sheet from `@/src/design-system/components/primitives`
- Import Card, Button, Input primitives from design-system barrel exports
- Component usage: Replace `<Modal>` wrapper with `<Sheet>` (API change required)
- Replace inline JSX with primitive components
- Styling: Replace hardcoded colors with design tokens
- Props: Adapt to new Sheet API (open/onOpenChange pattern)

### Testing Strategy

**Test Files to Create/Update:**
- `components/__tests__/WorkoutPlannerModal.test.tsx` (5+ tests)
- `components/__tests__/MuscleDeepDiveModal.test.tsx` (5+ tests)
- `components/modals/__tests__/MuscleDetailModal.test.tsx` (4+ tests)
- `components/__tests__/WorkoutSummaryModal.test.tsx` (4+ tests)
- `components/__tests__/SetEditModal.test.tsx` (4+ tests)
- `components/__tests__/BaselineUpdateModal.test.tsx` (3+ tests)

**Test Coverage Requirements:**
- Unit tests for component rendering with design system primitives (Sheet, Card, Button, Input)
- Integration tests for modal open/close behavior with Sheet
- Form submission tests within modals
- Accessibility tests (ARIA attributes, keyboard navigation, axe-core compliance)
- Touch target size verification (60x60px minimum)
- Visual regression prevention through functional testing

**Total Tests Required:** 25+ tests (approximately 4-5 tests per modal)

### Architecture Patterns and Constraints

**From architecture-ui-redesign-2025-11-12.md:**

1. **No Backend Changes**: UI redesign is frontend-only, all 20+ API endpoints remain unchanged
2. **Progressive Enhancement**: Old and new UI should coexist during migration (Sheet primitive already available)
3. **Glass Morphism Pattern**: Cards use `bg-white/50` with `backdrop-blur-lg` for depth
4. **Touch Target Compliance**: WCAG AA requires 60x60px minimum (currently 20x20px in some places)
5. **Component API Consistency**: Sheet uses different API than Modal (open/onOpenChange vs isOpen/onClose)

**Modal → Sheet Migration Pattern:**

```tsx
// ❌ OLD: Modal component
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="bg-white p-4">
    <h2>Modal Title</h2>
    <button onClick={handleAction}>Action</button>
  </div>
</Modal>

// ✅ NEW: Sheet component (bottom drawer)
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <Card variant="elevated" className="bg-white/50 backdrop-blur-lg">
    <h2 className="font-display text-primary">Modal Title</h2>
    <Button variant="primary" size="md" onClick={handleAction}>
      Action
    </Button>
  </Card>
</Sheet>
```

**Component Import Strategy:**
```typescript
// ✅ CORRECT: Use barrel exports
import { Sheet, Card, Button, Input } from '@/src/design-system/components/primitives'

// ❌ INCORRECT: Direct imports (avoid)
import Sheet from '@/src/design-system/components/primitives/Sheet/Sheet'
```

**Design Token Usage:**
```tsx
// ✅ CORRECT: Use design tokens
<div className="bg-primary text-white">...</div>
<Card variant="elevated" className="bg-white/50 backdrop-blur-lg">...</Card>
<Button variant="primary" size="md">Submit</Button>
<Input variant="default" size="md" placeholder="Enter value" />

// ❌ INCORRECT: Hardcoded colors
<div className="bg-[#758AC6] text-white">...</div>
<div style={{ backgroundColor: '#758AC6' }}>...</div>
```

**Touch Target Pattern:**
```tsx
// ✅ CORRECT: 60x60px minimum
<Button variant="primary" size="md" className="min-h-[60px]">
  Action
</Button>

// ❌ INCORRECT: Too small (avoid)
<button className="h-8 w-8">X</button>
```

### Project Structure Notes

**Design System Location:**
```
src/design-system/
├── components/
│   ├── primitives/
│   │   ├── Sheet/
│   │   │   ├── Sheet.tsx (✅ Available - bottom drawer)
│   │   │   ├── Sheet.test.tsx
│   │   │   └── Sheet.stories.tsx
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
│   │   └── index.ts (barrel exports)
│   └── patterns/ (Toast, CollapsibleSection, etc.)
├── tokens/
│   └── colors.ts, spacing.ts, typography.ts
└── README.md
```

**Component Files to Modify:**
```
components/
├── WorkoutPlannerModal.tsx (545 lines) - MIGRATE
├── MuscleDeepDiveModal.tsx (317 lines) - MIGRATE
├── WorkoutSummaryModal.tsx (208 lines) - MIGRATE
├── SetEditModal.tsx (263 lines) - MIGRATE
├── BaselineUpdateModal.tsx (77 lines) - MIGRATE
└── modals/
    └── MuscleDetailModal.tsx (221 lines) - MIGRATE
```

**No conflicts detected** - Modal components are standalone and don't have circular dependencies.

### Learnings from Previous Story

**From Story 6.5.2D-3 (Dashboard Page Migration) - Status: done**

Story 6.5.2D-3 successfully migrated Dashboard.tsx (912 lines) to design system primitives. All 38 tests created (all passing) with full accessibility compliance. Code review APPROVED on first pass with zero code changes required.

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
   - **NEW for This Story**: Sheet component (bottom drawer pattern)

3. **Testing Strategy** (Follow Established Patterns):
   - Unit tests for component rendering and design system integration
   - Integration tests for user interactions
   - Accessibility tests (axe-core, ARIA labels, keyboard navigation)
   - Touch target size verification (min-w-[60px] min-h-[60px])
   - Visual regression prevention through functional testing
   - 38 tests created in Dashboard - target 25+ for modals (4-5 tests per modal)

4. **Barrel Export Pattern**:
   - All files in 6.5.2D-3 used `@/src/design-system/components/primitives` barrel exports
   - Sheet component already exported in barrel (created in Epic 6)
   - All primitives ready for use

**Known Limitations from 6.5.2D-3:**
- Accessibility: Card primitives use `role="region"` without unique accessible names, causing landmark-unique violations. Disabled this rule in tests as it's a design system primitive limitation to be addressed in a future story.
- Minor act() warnings in keyboard navigation tests are cosmetic and don't affect functionality.

**Technical Debt to Watch:**
- localStorage mock added to vitest.setup.ts for state persistence (already available for modal preferences)

**Architectural Decisions from 6.5.2D-3:**
- Maintained existing component APIs (props unchanged except Modal→Sheet)
- Frontend-only changes (no backend API modifications)
- All functionality preserved and tested (behavior parity)

**Files Created/Modified in 6.5.2D-3** (For Reference):
- `components/Dashboard.tsx` (migrated) - 912 lines
- `components/__tests__/Dashboard.test.tsx` (created) - 38 tests (all passing)

**Recommendations for This Story (6.5.3A):**
- Follow the same testing patterns (38 tests in 6.5.2D-3, target 25+ for this story)
- Use the same design token conversion patterns
- Apply glass morphism consistently (`bg-white/50 backdrop-blur-lg`)
- Ensure 60x60px touch targets with `min-w-[60px] min-h-[60px]` classes
- Disable `landmark-unique` axe rule in tests (known Card primitive limitation)
- **Focus on Sheet component integration** - this is the first major modal migration
- Test modal open/close behavior thoroughly (Sheet uses different API than Modal)
- Test form submissions within modals (5 modals have forms)
- **Modal-Specific Testing**: Bottom drawer animations, swipe-to-dismiss, backdrop click-to-close
- Consider testing modal stacking if modals can open other modals
- Total lines similar to Dashboard (1,631 lines vs 912 lines) but split across 6 files - expect comparable overall complexity

**Sheet Component API Notes:**
- Sheet uses `open` and `onOpenChange` props (not `isOpen` and `onClose` like old Modal)
- `onOpenChange` receives a boolean parameter: `onOpenChange={(open) => setIsOpen(open)}`
- Sheet supports snap points for partial drawer height
- Sheet includes built-in backdrop and swipe gestures

[Source: .bmad-ephemeral/stories/6-5-2d-3-dashboard-page-migration.md]

### References

- [Source: docs/epics.md - Epic 6.5: Design System Rollout - Story 6.5.3A]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.2: Current Component Structure]
- [Source: docs/architecture-ui-redesign-2025-11-12.md - Section 1.4: Technical Debt Identified]
- [Source: docs/sprint-status.yaml - Epic 6.5 Status: Stories 6.5.1, 6.5.2A-C, 6.5.2D-1, 6.5.2D-2, 6.5.2D-3 complete]
- [Source: CHANGELOG.md - Story 6.5.1: Badge, ProgressBar, Select primitives created]
- [Source: CHANGELOG.md - Story 6.5.2A: Sheet primitive documented and available]
- [Source: CHANGELOG.md - Story 6.5.2B: Design token conversion patterns]
- [Source: CHANGELOG.md - Story 6.5.2C: RecoveryDashboard and ExerciseRecommendations migrations]
- [Source: CHANGELOG.md - Story 6.5.2D-1: Profile migration with Input and Select integration]
- [Source: CHANGELOG.md - Story 6.5.2D-2: Workout migration with comprehensive tests]
- [Source: CHANGELOG.md - Story 6.5.2D-3: Dashboard migration with Badge and ProgressBar]

## Dev Agent Record

### Context Reference

- `.bmad-ephemeral/stories/6-5-3a-modal-components-migration.context.xml` - Story context generated 2025-11-13

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes

**Completed:** 2025-11-13
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### Completion Notes List

### File List
