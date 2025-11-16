# Epic 7 Post-6.5 Review Checklist

**Purpose**: Ensure Epic 7 stories are architecturally aligned with the post-Epic 6.5 codebase.

**When to Use**: After Epic 6.5 completes, before starting Epic 7 execution.

**Why This Matters**: Epic 7 stories were drafted BEFORE Epic 6.5 existed. Epic 6.5 migrates 73 components to the design system, potentially changing import paths, component APIs, and architectural patterns. Epic 7 stories need to reference the POST-6.5 architecture, not the PRE-6.5 architecture.

---

## What Changed in Epic 6.5

### Component Migrations (wrappers-first)
- **Wrappers**: `components/ui/*` + `components/layout/*` now re-export design-system primitives/patterns so legacy imports keep working while we migrate usage incrementally.
- **Targeted migrations**: High-touch screens (Workout, Dashboard, QuickAdd, planner modals) already render DS components through those wrappers.
- **Cleanup**: Once Epic 7 lands, run a codemod to swap imports to `@/src/design-system/...` and delete the wrappers.

### Import Path Guidance
**Current (wrapper) usage:**
```typescript
import { Button } from '../components/ui/Button'; // wrapper → DS Button
import FAB from '../components/layout/FAB';        // wrapper → DS FAB
```

**Future (direct) usage:**
```typescript
import { Button, Sheet } from '@/src/design-system/components/primitives';
import FAB from '@/src/design-system/components/patterns/FAB';
```

### Component API Notes
- **Modal/Sheet**: `components/ui/Modal` is a thin bridge around the DS Sheet (`isOpen`, `onClose`), so Epic 7 can keep using the legacy props while still rendering the new bottom drawer.
- **Card/Button/Badge/ProgressBar**: Wrappers map legacy props (`size`, `variant`, etc.) onto DS equivalents—callers migrate by simply importing the wrapper.
- **Forms/Inputs**: Importing from the wrappers gives DS styling immediately; importing directly from DS is encouraged for new code.

---

## Review Checklist for Each Epic 7 Story

For each of the 5 Epic 7 stories, verify:

### Story 7.1: Auto-Starting Rest Timer

**Status:** ✅ Delivered. `RestTimerBanner` (`src/design-system/components/patterns/RestTimerBanner.tsx`) is wired into `components/Workout.tsx` with DS wrappers, ProgressBar, and haptics already in place.

---

### Story 7.2: "Log All Sets?" Smart Shortcut

**Status:** ✅ Delivered. Pattern detection lives in `src/utils/detectLogAllSetsPattern.ts`, and the DS Sheet-backed modal with toast/haptics is implemented inside `components/Workout.tsx`.

---

### Story 7.3: One-Tap Set Duplication

**Status:** ✅ Delivered. The “Copy” button inside `components/Workout.tsx` duplicates the previous set, uses the DS Button wrapper, and fires `useHaptic(10)` per AC3.

---

### Story 7.4: Equipment Filtering

**Status:** ✅ Delivered. `components/ExercisePicker.tsx` filters by the athlete’s `availableEquipment`, persists the “Show all” toggle, and QuickAdd/Dashboard now pass equipment arrays through.

---

### Story 7.5: Progressive Disclosure

**Status:** ✅ Delivered. Workout and Dashboard each expose localStorage-backed “Show advanced” toggles with smooth transitions so primary fields stay visible by default.

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
