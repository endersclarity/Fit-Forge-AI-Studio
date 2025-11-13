# Epic 7 Post-6.5 Review Checklist

**Purpose**: Ensure Epic 7 stories are architecturally aligned with the post-Epic 6.5 codebase.

**When to Use**: After Epic 6.5 completes, before starting Epic 7 execution.

**Why This Matters**: Epic 7 stories were drafted BEFORE Epic 6.5 existed. Epic 6.5 migrates 73 components to the design system, potentially changing import paths, component APIs, and architectural patterns. Epic 7 stories need to reference the POST-6.5 architecture, not the PRE-6.5 architecture.

---

## What Changed in Epic 6.5

### Component Migrations (77 total)
- **4 already integrated**: WorkoutBuilder, QuickAdd, CalibrationEditor, EngagementViewer
- **73 newly migrated**: Dashboard, Workout, Profile, ExerciseRecommendations, Recovery Dashboard, Analytics, all modals, all forms, all utilities

### Import Path Changes
**Before (Legacy):**
```typescript
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FAB } from '../components/layout/FAB';
```

**After (Design System):**
```typescript
import { Card, Button, Sheet } from '@/src/design-system/components/primitives';
import { FAB } from '@/src/design-system/components/patterns';
```

### Component API Changes
- **Modal → Sheet**: Bottom drawer pattern, different props
- **Card**: Now has variant prop (glass, solid, outline)
- **Button**: Standardized size/variant props
- **Forms**: All use Input primitive (consistent API)

### Removed Components
- `components/ui/Card.tsx` → DELETED
- `components/ui/Button.tsx` → DELETED
- `components/ui/Modal.tsx` → DELETED (use Sheet)
- `components/layout/FAB.tsx` → DELETED (use design-system FAB)
- `components/ui/Badge.tsx` → DELETED (use design-system Badge)
- `components/ui/ProgressBar.tsx` → DELETED (use design-system ProgressBar)

---

## Review Checklist for Each Epic 7 Story

For each of the 5 Epic 7 stories, verify:

### Story 7.1: Auto-Starting Rest Timer

**Components Referenced:**
- [ ] RestTimerBanner (NEW component - check import paths)
- [ ] ProgressBar (migrated to design-system primitive)
- [ ] Button (for skip/dismiss - use design-system Button)

**Check:**
- [ ] Import paths use `@/src/design-system/components/primitives`
- [ ] ProgressBar uses design-system primitive (not old ui/ProgressBar)
- [ ] Button uses design-system variant system (variant="secondary")
- [ ] Touch targets meet 60x60px (WCAG AA - Epic 6.5 standard)
- [ ] Uses design tokens for colors (bg-primary, text-secondary, etc.)

**Potential Issues:**
- Story might reference `components/ui/ProgressBar.tsx` (deleted in 6.5)
- Positioning z-index needs to account for Sheet z-index hierarchy

**Action Items:**
- [ ] Update ProgressBar import to design-system
- [ ] Verify z-index: RestTimerBanner (20) < FAB (30) < Sheet (40+)

---

### Story 7.2: "Log All Sets?" Smart Shortcut

**Components Referenced:**
- [ ] Sheet (for bottom drawer confirmation modal)
- [ ] Button (for confirm/cancel actions)
- [ ] WorkoutBuilder (context - already migrated in Epic 6)
- [ ] SetConfigurator (context - migrated in Epic 6.5.3)

**Check:**
- [ ] Sheet import from `@/src/design-system/components/primitives`
- [ ] Button uses variant system (confirm = primary, cancel = secondary)
- [ ] WorkoutBuilder API stable (Epic 6 migration)
- [ ] SetConfigurator API understood (Epic 6.5.3 migration changes)
- [ ] Pattern detection logic doesn't depend on old component structure

**Potential Issues:**
- WorkoutBuilder internal state might have changed during migration
- SetConfigurator props might be different post-migration

**Action Items:**
- [ ] Review WorkoutBuilder.tsx post-6.5 for state management changes
- [ ] Review SetConfigurator.tsx post-6.5 for prop interface
- [ ] Verify pattern detection works with new component structure

---

### Story 7.3: One-Tap Set Duplication

**Components Referenced:**
- [ ] Button (for "Copy Previous Set" action)
- [ ] HorizontalSetInput (migrated in Epic 6.5.4)
- [ ] SetConfigurator (migrated in Epic 6.5.3)
- [ ] CurrentSetDisplay (migrated in Epic 6.5.4)

**Check:**
- [ ] Button import from design-system
- [ ] HorizontalSetInput API understood (Epic 6.5.4 changes)
- [ ] SetConfigurator state management compatible
- [ ] CurrentSetDisplay data structure compatible
- [ ] Haptic feedback hook available (useHaptic from Epic 6)

**Potential Issues:**
- Form components might have different state management post-migration
- Set data structure might be accessed differently

**Action Items:**
- [ ] Review HorizontalSetInput.tsx post-6.5 for prop interface
- [ ] Review SetConfigurator.tsx for state hooks
- [ ] Verify CurrentSetDisplay data access patterns
- [ ] Confirm useHaptic hook location (design-system or utils?)

---

### Story 7.4: Equipment Filtering

**Components Referenced:**
- [ ] ExercisePicker (migrated in Epic 6.5.3)
- [ ] Badge (for filter count - new design-system primitive)
- [ ] QuickAdd (context - already migrated in Epic 6)
- [ ] Select/Dropdown (new design-system primitive from 6.5.1)

**Check:**
- [ ] ExercisePicker import path correct
- [ ] Badge import from `@/src/design-system/components/primitives`
- [ ] Select import from `@/src/design-system/components/primitives`
- [ ] QuickAdd integration points stable (Epic 6 migration)
- [ ] localStorage integration pattern documented

**Potential Issues:**
- ExercisePicker might have different filter API post-migration
- Badge primitive created in 6.5.1 (verify variant options)
- Select primitive created in 6.5.1 (verify API)

**Action Items:**
- [ ] Review ExercisePicker.tsx post-6.5 for filter implementation
- [ ] Review Badge primitive API (variants: success/warning/error/info)
- [ ] Review Select primitive API (keyboard navigation, a11y)
- [ ] Verify localStorage pattern matches 6.5 conventions

---

### Story 7.5: Progressive Disclosure

**Components Referenced:**
- [ ] CollapsibleSection (new design-system pattern from 6.5.2)
- [ ] Dashboard (migrated in Epic 6.5.2)
- [ ] Workout (migrated in Epic 6.5.2)
- [ ] QuickAdd (already migrated in Epic 6)
- [ ] Button (for show/hide toggle)

**Check:**
- [ ] CollapsibleSection import from `@/src/design-system/components/patterns`
- [ ] Dashboard integration points understood (Epic 6.5.2 changes)
- [ ] Workout form structure understood (Epic 6.5.2 changes)
- [ ] Button uses icon variant for toggle (if applicable)
- [ ] Animation uses design-system motion tokens

**Potential Issues:**
- CollapsibleSection created in 6.5.2 (verify expand/collapse API)
- Dashboard/Workout forms might have different layout post-migration
- Advanced options might be structured differently

**Action Items:**
- [ ] Review CollapsibleSection pattern API (expand/collapse, animation)
- [ ] Review Dashboard.tsx post-6.5 for form layout
- [ ] Review Workout.tsx post-6.5 for form structure
- [ ] Identify which options are "advanced" (rest time, notes, to-failure)
- [ ] Verify localStorage key naming conventions from 6.5

---

## Epic-Level Concerns

### Design Tokens Usage
- [ ] All Epic 7 components use design tokens (not hardcoded colors)
- [ ] Color palette: `bg-primary`, `bg-secondary`, `text-primary`, `text-secondary`
- [ ] Spacing: `spacing-sm`, `spacing-md`, `spacing-lg`
- [ ] Typography: Font scale from design tokens

### Touch Targets (WCAG AA)
- [ ] All interactive elements ≥ 60x60px (Epic 6.5 standard)
- [ ] Verified in mobile viewport (375px width)
- [ ] Buttons, toggles, badges all compliant

### Component Composition
- [ ] Sheet used for modals/drawers (not legacy Modal)
- [ ] Card used with glass morphism variant
- [ ] Button uses size/variant system consistently
- [ ] Input uses design-system primitive (not custom inputs)

### Testing Strategy
- [ ] All Epic 7 components import from design-system
- [ ] Test mocks updated for new component structure
- [ ] Integration tests account for post-6.5 architecture
- [ ] No imports from deleted components (ui/Card, ui/Button, etc.)

---

## Post-Review Actions

After completing this checklist:

1. **Update Epic 7 Story Files** (`.bmad-ephemeral/stories/7-*.md`)
   - Correct import paths
   - Update component references
   - Note API changes
   - Add architectural notes

2. **Document Breaking Changes**
   - Create `docs/epic-7-6.5-migration-notes.md` if significant changes needed
   - List all component API differences
   - Provide migration examples

3. **Verify Build**
   - Run `npm run build` to catch import errors
   - Fix any broken imports from deleted components
   - Ensure TypeScript types resolve correctly

4. **Update Epic 7 Definition** (if needed)
   - Revise story descriptions for clarity
   - Add Epic 6.5 dependency notes
   - Update technical notes section

---

## Sign-Off

**Epic 6.5 Completion Date:** _______________

**Reviewer:** _______________

**Epic 7 Stories Reviewed:** [ ] All 5 stories checked

**Breaking Changes Identified:** [ ] Yes [ ] No

**Action Items Created:** _______________

**Ready for Epic 7 Execution:** [ ] Yes [ ] No (explain: ________________)

---

**Next Step:** Run `/bmad-epic-sprint` for Epic 7 with confidence that stories align with current architecture.
