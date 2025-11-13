# Story 5-3: Primitive Components Library

## Epic Context
Epic 5: Design System Foundation (Week 1)

## Story Description
Build reusable primitive components (Button, Card, Sheet, Input) with glass morphism, rounded corners, and variant support per UX Design specifications.

## User Value
Creates the building blocks for the premium UI redesign - ensures visual consistency across all 96 components.

## Acceptance Criteria
- [ ] AC1: Button component with variants (primary, secondary, ghost) and sizes (sm, md, lg)
- [ ] AC2: Card component with glass morphism (white/50, backdrop-blur-sm, border-gray-300/50)
- [ ] AC3: Sheet component (Vaul wrapper) with heights (40vh, 60vh, 90vh)
- [ ] AC4: Input component with glass background and focus ring
- [ ] AC5: All components use design tokens from tailwind.config.js
- [ ] AC6: Storybook stories created for each component with all variants
- [ ] AC7: Accessibility verified (keyboard nav, ARIA labels, focus indicators)

## Technical Approach
Create `src/design-system/components/primitives/` directory with Button.tsx, Card.tsx, Sheet.tsx, Input.tsx. Each component uses design tokens and follows UX Design Section 3 specifications.

**Button Component:**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'rounded-full font-bold tracking-wide transition-all';
  const variantClasses = {
    primary: 'bg-primary text-white shadow-button-primary hover:brightness-110',
    secondary: 'bg-primary-medium text-white hover:brightness-110',
    ghost: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10',
  };
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`} {...props}>
      {children}
    </button>
  );
};
```

**Reference:**
- UX Design Section 3 (Component Specifications)
- PRD Epic 5 Story 5 (Build reusable component library)

## Files to Create/Modify
**Create:**
- `src/design-system/components/primitives/Button.tsx`
- `src/design-system/components/primitives/Card.tsx`
- `src/design-system/components/primitives/Sheet.tsx`
- `src/design-system/components/primitives/Input.tsx`
- `src/design-system/components/primitives/index.ts` (barrel export)

## Dependencies
**Depends On:** 5-2 (Design Tokens must exist)
**Blocks:** Epic 6 (All interaction redesign needs primitives)

## Testing Strategy
**Unit Tests:** Component rendering, prop validation, variant styling
**Manual Tests:** Storybook visual testing, keyboard navigation, focus states

## Estimated Effort
**2 days**

## Definition of Done
- [ ] All 4 primitive components created
- [ ] Storybook stories demonstrate all variants
- [ ] Accessibility verified (WCAG AA)
- [ ] Documentation updated with usage examples
- [ ] Merged to main branch
