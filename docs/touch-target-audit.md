# Touch Target Compliance Audit
**Date:** 2025-11-13
**Story:** 6.4 - Touch Target Compliance Audit
**Target:** 60x60px minimum (exceeds WCAG 44pt requirement)
**Spacing:** 8px minimum between adjacent targets

## Audit Results

### Critical Fixes Required

| Component | Element | Current Size | Target Size | Status | File |
|-----------|---------|--------------|-------------|---------|------|
| Workout.tsx | "To Failure" checkbox | w-11 h-11 (44x44px) | 60x60px + label | ❌ NEEDS FIX | components/Workout.tsx:798-812 |
| Workout.tsx | Filter pills (Category) | px-3 py-1 (~variable) | h-12 min (48px) | ❌ NEEDS FIX | components/Workout.tsx:80 |
| Workout.tsx | Filter pills (Equipment) | px-3 py-1 (~variable) | h-12 min (48px) | ❌ NEEDS FIX | components/Workout.tsx:92 |
| Workout.tsx | Filter pills (Muscle) | px-3 py-1 (~variable) | h-12 min (48px) | ❌ NEEDS FIX | components/Workout.tsx:104 |
| Workout.tsx | Exercise list buttons | p-3 (~variable width) | min-w-[60px] min-h-[60px] | ❌ NEEDS FIX | components/Workout.tsx:120 |
| Workout.tsx | +15s button | px-3 py-1 (~variable) | min-w-[60px] min-h-[60px] | ❌ NEEDS FIX | components/Workout.tsx:152 |
| Workout.tsx | Done/Skip button | text-sm (~variable) | min-w-[60px] min-h-[60px] | ❌ NEEDS FIX | components/Workout.tsx:72 |
| Button.tsx | Button sm size | h-8 (32px) | h-15 (60px) or min-h-[60px] | ❌ NEEDS FIX | components/ui/Button.tsx:20 |
| Button.tsx | Button md size | h-10 (40px) | h-15 (60px) or min-h-[60px] | ❌ NEEDS FIX | components/ui/Button.tsx:21 |
| Button.tsx | Button lg size | h-12 (48px) | h-15 (60px) or min-h-[60px] | ❌ NEEDS FIX | components/ui/Button.tsx:22 |

### Summary Statistics
- **Total Interactive Elements Audited:** 10 critical elements
- **Elements Below 60px:** 10 (100%)
- **Target Compliance Rate:** 0% (needs to reach 90%+)
- **Average Current Size:** ~38px
- **Target Average Size:** 60px

### Implementation Plan
1. Update Button.tsx base component to enforce 60px minimum
2. Fix "To Failure" checkbox in Workout.tsx (add label, increase size)
3. Update all filter pills to h-12 minimum
4. Add min-w-[60px] min-h-[60px] to all interactive elements
5. Verify 8px spacing between adjacent elements
6. Run accessibility tests (axe-core, Lighthouse)
7. Test on mobile devices

### WCAG Compliance
- **Current:** Fails WCAG 2.1 Level AA (44pt minimum)
- **Target:** Exceeds WCAG 2.1 Level AA (60px = ~45pt at 96dpi)
- **Goal:** 90%+ compliance rate
