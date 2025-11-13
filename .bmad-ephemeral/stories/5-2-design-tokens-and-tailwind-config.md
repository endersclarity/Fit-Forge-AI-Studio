# Story 5-2: Design Tokens and Tailwind Config

## Epic Context
Epic 5: Design System Foundation (Week 1)

## Story Description
Configure complete design token system in Tailwind with colors, typography, spacing, shadows from UX Design specifications.

## User Value
Establishes the visual DNA of FitForge's premium redesign - sophisticated blues, elegant typography, and consistent spacing.

## Acceptance Criteria
- [ ] AC1: Primary color palette configured (#758AC6, #344161, #566890, #8997B8, #A8B6D5)
- [ ] AC2: Badge colors configured (#D9E1F8 bg, #BFCBEE border, #566890 text)
- [ ] AC3: Typography scale configured (display-xl, display-lg, display-md with Cinzel specs)
- [ ] AC4: Shadow tokens configured (button-primary, drawer)
- [ ] AC5: Background gradients configured (heavenly-gradient)
- [ ] AC6: Border radius tokens configured (xl: 24px, 2xl: 32px)
- [ ] AC7: All tokens accessible via Tailwind classes (e.g., bg-primary, text-primary-dark)
- [ ] AC8: Color contrast verified for WCAG AA compliance

## Technical Approach
Tokens already added in Story 5-1's tailwind.config.js. This story verifies all tokens work correctly and documents usage patterns.

Create `src/design-system/tokens/colors.ts` for programmatic access:
```typescript
export const colors = {
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
} as const;
```

**Reference:**
- UX Design Section 2 (Design System Application)
- design-system.md Lines 27-69 (color definitions)

## Files to Create/Modify
**Create:**
- `src/design-system/tokens/colors.ts` - Programmatic color access
- `src/design-system/tokens/typography.ts` - Typography scales
- `src/design-system/tokens/spacing.ts` - 8px grid system
- `src/design-system/tokens/shadows.ts` - Shadow definitions

**Modify:**
- `tailwind.config.js` - Already complete from 5-1, verify all tokens present

## Dependencies
**Depends On:** 5-1 (Tailwind migration must be complete)
**Blocks:** 5-3 (Primitive Components need tokens), 5-4 (Font loading)

## Testing Strategy
**Manual Tests:**
1. Create test component using all tokens
2. Verify colors render correctly
3. Check text contrast meets WCAG AA (use WebAIM checker)
4. Test in light mode (dark mode in Epic 8)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] All token files created in src/design-system/tokens/
- [ ] Tailwind config verified complete
- [ ] Test component demonstrates all tokens
- [ ] WCAG AA contrast verified
- [ ] Documentation updated with token usage guide
- [ ] Merged to main branch
