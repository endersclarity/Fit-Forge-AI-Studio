# FitForge Coding Standards

**Last Updated:** 2025-11-15
**Extracted From:** [docs/architecture-ui-redesign-2025-11-12.md](../architecture-ui-redesign-2025-11-12.md), [docs/design-system-wrapper-plan.md](../design-system-wrapper-plan.md)

---

## Design System Principles

### 1. Glass Morphism Pattern

All cards, modals, and surfaces use **glass morphism** with consistent properties:

```tsx
// Standard glass card pattern
<div className="bg-white/50 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
  {content}
</div>

// Dark mode variant
<div className="dark:bg-white/10 dark:border-white/10 backdrop-blur-lg">
  {content}
</div>
```

**Requirements:**
- Background: `bg-white/50` (50% opacity white)
- Backdrop blur: `backdrop-blur-lg` (essential for glass effect)
- Border: `border border-white/20` (20% opacity provides definition)
- Border radius: `rounded-2xl` (16px) for cards, `rounded-full` for buttons
- Shadow: `shadow-lg` for depth

**Browser Compatibility:**
- `backdrop-filter` supported in Chrome, Safari, Firefox, Edge
- Fallback: Solid `bg-white/90` for unsupported browsers (feature detection)

### 2. Typography Scale

**Cinzel** (Display Font - Headlines):
```tsx
import '@fontsource/cinzel';

// Page titles
<h1 className="font-cinzel text-4xl text-primary-dark">Dashboard</h1>

// Section headers
<h2 className="font-cinzel text-2xl text-primary-dark">Quick Stats</h2>
```

**Lato** (Body Font - Readable Text):
```tsx
import '@fontsource/lato';

// Body text (default)
<p className="font-lato text-base text-primary-dark">Your workout summary...</p>

// Small text
<span className="font-lato text-sm text-primary-medium">12 reps</span>
```

**Font Sizing:**
- Inline number pickers: `text-6xl` (60pt for easy readability)
- Headlines: `text-4xl` (36pt)
- Section headers: `text-2xl` (24pt)
- Body: `text-base` (16pt)
- Secondary: `text-sm` (14pt)

### 3. Color System (Design Tokens)

Use semantic color tokens from `src/design-system/tokens/colors.ts`:

```tsx
// Primary palette (sophisticated blues)
bg-primary           // #758AC6 - primary action color
text-primary-dark    // #344161 - headlines, primary text
text-primary-medium  // #566890 - secondary text, pills
text-primary-light   // #8997B8 - placeholders, tertiary text

// Badge colors
bg-badge-bg          // #D9E1F8 - badge background
text-badge-text      // #334877 - badge text

// Glass surfaces
bg-white/50          // 50% white for glass cards
backdrop-blur-lg     // Essential for glass effect
border-white/20      // 20% white for glass borders
```

**DO NOT use arbitrary colors:**
```tsx
// ❌ BAD - Arbitrary colors
<div className="bg-[#22d3ee]">

// ✅ GOOD - Design tokens
<div className="bg-primary">
```

---

## Component Patterns

### 1. React Component Structure

**Standard pattern with forwardRef:**
```tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`rounded-full px-6 py-3 ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

**Key rules:**
- Always use `React.forwardRef` for components that render DOM elements
- Set `displayName` for debugging
- Export interface AND component
- Default export for design system primitives
- Named export for wrapper components

### 2. Prop Interface Conventions

```tsx
// ✅ GOOD - Extends HTML attributes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

// ✅ GOOD - Omits conflicting props
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  icon?: string;
}

// ❌ BAD - Doesn't extend HTML attributes
export interface ButtonProps {
  onClick: () => void;
  className: string;
}
```

### 3. Wrapper Component Pattern

**Epic 6.5 strategy:** Legacy imports proxy to design system primitives:

```tsx
// components/ui/Button.tsx (wrapper)
import DesignSystemButton, {
  type ButtonProps as DesignSystemButtonProps,
} from '@/src/design-system/components/primitives/Button';

export interface ButtonProps
  extends Omit<DesignSystemButtonProps, 'size'> {
  size?: DesignSystemButtonProps['size'] | 'xl'; // Legacy 'xl' maps to 'lg'
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, DesignSystemButtonProps['size']> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg', // Legacy mapping
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'md', ...props }, ref) => {
    const mappedSize = sizeMap[size] ?? 'md';
    return <DesignSystemButton ref={ref} size={mappedSize} {...props} />;
  }
);

Button.displayName = 'Button';
export default Button;
```

**Benefits:**
- Zero breaking changes to existing code
- Gradual migration without "all-or-nothing" rewrite
- Future codemod can swap imports mechanically

---

## Accessibility Standards

### 1. Touch Target Sizing

**WCAG 2.1 Level AA Compliance:**
- **Minimum touch target:** 60×60px (CSS pixels)
- **Applies to:** All interactive elements (buttons, checkboxes, links, FABs)

```tsx
// ✅ GOOD - Meets 60×60px minimum
<button className="min-h-[60px] min-w-[60px] px-4">Save</button>

// ✅ GOOD - Explicit sizing
<button className="h-16 w-16 rounded-full">+</button>

// ❌ BAD - Too small (40×40px)
<button className="h-10 w-10">×</button>
```

**Testing:**
Use browser DevTools to measure actual rendered size (not just CSS classes).

### 2. Focus Indicators

**Always provide visible focus outlines:**
```tsx
// ✅ GOOD - Custom focus ring
<button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  Save
</button>

// ❌ BAD - Removed focus outline
<button className="focus:outline-none">
  Save
</button>
```

### 3. ARIA Labels

**Provide labels for all interactive elements:**
```tsx
// ✅ GOOD - Icon-only button with aria-label
<button aria-label="Close modal" className="...">
  ×
</button>

// ✅ GOOD - Form input with label
<label htmlFor="exercise-name">Exercise Name</label>
<input id="exercise-name" type="text" />

// ❌ BAD - Missing label
<button className="...">×</button>
```

### 4. Color Contrast

**WCAG AA Requirements:**
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Testing:** Use WebAIM Contrast Checker or Lighthouse audits.

---

## Animation Standards (Epic 8.1)

### 1. Framer Motion Usage

**Only animate transform and opacity properties for 60fps performance:**

```tsx
import { motion } from 'framer-motion';

// ✅ GOOD - Transform/opacity only
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  {content}
</motion.div>

// ❌ BAD - Animating layout properties
<motion.div
  animate={{ width: 300, height: 200 }} // Causes reflows!
>
  {content}
</motion.div>
```

### 2. Spring Animation Defaults

**Standard spring configuration:**
```tsx
transition={{
  type: 'spring',
  stiffness: 300,
  damping: 30
}}
```

### 3. Reduced Motion Support

**Respect OS preferences:**
```tsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring' }}
>
  {content}
</motion.div>
```

### 4. Feature Flag Gating

**Allow runtime toggling:**
```tsx
const animationsEnabled = import.meta.env.VITE_ANIMATIONS_ENABLED === 'true';

{animationsEnabled ? (
  <motion.button whileTap={{ scale: 0.95 }}>Save</motion.button>
) : (
  <button>Save</button>
)}
```

---

## Testing Standards

### 1. Component Tests

**Co-locate tests with components:**
```
components/ui/Button.tsx
components/ui/Button.test.tsx
```

**Testing Library patterns:**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Save</Button>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByText('Save'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Accessibility Tests

**Use jest-axe for automated checks:**
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Save</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Code Organization Rules

### 1. File Structure

**Component file:**
```tsx
// 1. Imports
import React from 'react';
import { motion } from 'framer-motion';

// 2. Type definitions
export interface ButtonProps { ... }

// 3. Component implementation
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// 4. DisplayName
Button.displayName = 'Button';

// 5. Default export
export default Button;
```

### 2. Import Order

```tsx
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 3. Internal components
import { Button } from '@/components/ui/Button';
import { Card } from '@/src/design-system/components/primitives/Card';

// 4. Utilities and hooks
import { useHaptic } from '@/src/design-system/hooks/useHaptic';

// 5. Types
import type { Exercise } from '@/types';

// 6. Styles (if any)
import './styles.css';
```

### 3. Naming Conventions

**Components:**
- PascalCase: `Button`, `ExercisePicker`, `RestTimerBanner`

**Hooks:**
- camelCase with `use` prefix: `useHaptic`, `useRestTimer`, `useBottomSheet`

**Utilities:**
- camelCase: `formatDate`, `vibrate`, `calculateVolume`

**Constants:**
- UPPER_SNAKE_CASE: `DEFAULT_REST_SECONDS`, `MAX_SETS`

**Interfaces:**
- PascalCase with `Props` suffix: `ButtonProps`, `CardProps`

---

## Performance Guidelines

### 1. Memoization

**Use React.memo for expensive components:**
```tsx
export const ExpensiveChart = React.memo(({ data }) => {
  // Complex rendering logic
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data; // Custom comparison
});
```

### 2. Code Splitting

**Use React.lazy for route-level splitting:**
```tsx
const Dashboard = React.lazy(() => import('./components/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### 3. Bundle Size

**Target:** < 1 MB compressed JavaScript bundle

**Avoid:**
- Lodash (use native ES6 instead)
- Moment.js (use date-fns or native Intl)
- Large icon libraries (use selective imports)

---

## Git Commit Conventions

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(animation): add Framer Motion spring transitions to bottom sheets

fix(dashboard): repair corrupted JSX in Quick Stats card

docs(architecture): extract coding standards to separate file
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This

```tsx
// ❌ Arbitrary colors instead of design tokens
<div className="bg-[#758AC6]">

// ❌ Missing forwardRef for DOM components
export const Button = ({ children }) => <button>{children}</button>

// ❌ Animating width/height (causes layout thrashing)
<motion.div animate={{ width: 300 }}>

// ❌ Touch targets too small
<button className="h-8 w-8">×</button>

// ❌ Missing accessibility labels
<button onClick={handleClose}>×</button>

// ❌ Hardcoded strings instead of semantic variables
const BLUE = '#758AC6'; // Use design tokens instead
```

### ✅ Do This Instead

```tsx
// ✅ Use design tokens
<div className="bg-primary">

// ✅ Use forwardRef
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)

// ✅ Animate transform/opacity
<motion.div animate={{ opacity: 1, y: 0 }}>

// ✅ Meet 60×60px touch target minimum
<button className="min-h-[60px] min-w-[60px]">×</button>

// ✅ Provide aria-label
<button onClick={handleClose} aria-label="Close modal">×</button>

// ✅ Import from design tokens
import { colors } from '@/src/design-system/tokens/colors';
```

---

## Questions?

For more details, see:
- [Architecture Document](../architecture-ui-redesign-2025-11-12.md)
- [Wrapper Strategy](../design-system-wrapper-plan.md)
- [Tech Stack](./tech-stack.md)
- [Source Tree](./source-tree.md)
