# Design System Wrapper Plan

**Author:** Codex (AI pair)  
**Date:** 2025-11-14  
**Context:** FitForge-Local design system rollout

## Why

Epic 6.5’s full rewrite approach (migrating ~70 components + 400+ tests) created an “all-or-nothing” bottleneck. To keep shipping while still moving toward the new visual language, we’re taking a compatibility wrapper approach:

- Legacy entry-points (`components/ui/*`, `components/layout/*`) now proxy the design-system primitives/patterns.
- Screens can continue importing from existing paths, but render the new glass-morphism components under the hood.
- We only migrate component internals opportunistically (during high-impact feature work) instead of en masse.

## What changed today

- `Button`, `Card`, `Badge`, `ProgressBar`, and `Modal` now re-export the design-system primitives while keeping legacy props (size enums, `ariaLabel`, etc.).
- `FAB` and `CollapsibleSection` from `components/layout` forward to their design-system pattern counterparts with minimal glue (e.g., legacy `count` appended to the title string).
- Wrapper-focused unit tests validate the integration contract (e.g., `Modal` calling `onClose` when the underlying sheet closes) instead of duplicating primitive-level checks.

## Implementation philosophy (going forward)

1. **Wrappers first**  
   - Keep legacy import paths stable.  
   - When we need additional primitives, add them to the wrappers directory with the same pattern (map old props → new primitives, keep stories/tests lightweight).

2. **High-impact pages only**  
   - Prioritize migrations for Dashboard, Workout, Recovery, and modal workflows touched by Epic 7.  
   - Leave low-impact utilities alone until we naturally touch them.

3. **Codemod cleanup later**  
   - Once the wrappers prove stable, run a codemod to swap imports directly to `@/src/design-system/...` and delete the legacy files (this becomes a reversible mechanical change).

4. **Automation assistance**  
   - Maintain a small script to report “legacy class usage” so we know where inline Tailwind or duplicated components remain without manual bookkeeping.

## Next steps

1. Use the wrappers for Epic 7 work immediately—no need to block on component migrations.
2. When touching a screen, migrate it in-place (the wrappers already provide the primitives).
3. After the key flows are on the new design language, plan the codemod + cleanup story (delete `components/ui/*` once imports move).

This approach keeps the ship velocity high while ensuring that everything new renders through the vetted design system.
