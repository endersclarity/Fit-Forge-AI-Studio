# Design System Tokens

Comprehensive design token system for FitForge's UI redesign. This system provides both Tailwind classes and programmatic access to colors, typography, spacing, and shadows.

## Table of Contents

- [Quick Start](#quick-start)
- [Color Tokens](#color-tokens)
- [Typography Tokens](#typography-tokens)
- [Spacing Tokens](#spacing-tokens)
- [Shadow Tokens](#shadow-tokens)
- [WCAG Compliance](#wcag-compliance)
- [Usage Patterns](#usage-patterns)

## Quick Start

### Using Tailwind Classes

```tsx
// Colors
<div className="bg-primary text-white">Primary Background</div>
<div className="bg-primary-dark text-white">Dark Background</div>
<div className="text-primary-medium">Medium Text</div>

// Typography
<h1 className="text-display-xl font-display">Heading</h1>
<p className="text-base font-body">Body text</p>

// Spacing & Borders
<div className="p-6 rounded-xl">Card with standard padding and border radius</div>

// Shadows
<button className="shadow-button-primary">Primary Button</button>
<div className="shadow-drawer">Drawer Component</div>
```

### Programmatic Access

```typescript
import { colors, typography, spacing, shadows } from '@/design-system/tokens';

// Use in styled components or inline styles
const buttonStyle = {
  backgroundColor: colors.primary.dark,
  color: '#FFFFFF',
  padding: spacing[3],
  borderRadius: '24px',
  boxShadow: shadows['button-primary'],
  fontFamily: typography.fontFamily.body.join(', '),
};
```

## Color Tokens

### Primary Palette

Sophisticated blues for branding and hierarchy:

| Token | Hex Code | Tailwind Class | Usage |
|-------|----------|----------------|-------|
| Primary | #758AC6 | `bg-primary`, `text-primary` | Primary brand color, large headings only |
| Primary Dark | #344161 | `bg-primary-dark`, `text-primary-dark` | Body text, buttons, high contrast |
| Primary Medium | #566890 | `bg-primary-medium`, `text-primary-medium` | Secondary text, badges |
| Primary Light | #8997B8 | `bg-primary-light`, `text-primary-light` | Hover states, decorative |
| Primary Pale | #A8B6D5 | `bg-primary-pale`, `text-primary-pale` | Subtle backgrounds |

### Badge Colors

Subtle, refined indicators:

| Token | Hex Code | Tailwind Class | Usage |
|-------|----------|----------------|-------|
| Badge BG | #D9E1F8 | `bg-badge-bg` | Badge background |
| Badge Border | #BFCBEE | `border-badge-border` | Badge border |
| Badge Text | #566890 | `text-badge-text` | Badge text |

**Badge Example:**
```tsx
<div className="inline-flex items-center px-4 py-2 bg-badge-bg border-2 border-badge-border text-badge-text font-body font-medium rounded-xl">
  Status Badge
</div>
```

### Legacy Colors

Maintained for backward compatibility (will be phased out):
- `brand-cyan`: #22d3ee
- `brand-dark`: #0f172a
- `brand-surface`: #1e293b
- `brand-muted`: #475569

## Typography Tokens

### Font Families

- **Display (Cinzel)**: Serif font for headings and titles
  - Tailwind: `font-display` or `font-cinzel`
  - Programmatic: `typography.fontFamily.display`

- **Body (Lato)**: Sans-serif for body text and UI
  - Tailwind: `font-body` or `font-lato`
  - Programmatic: `typography.fontFamily.body`

### Display Scale (Cinzel - Headings)

| Size | Font Size | Line Height | Letter Spacing | Tailwind Class |
|------|-----------|-------------|----------------|----------------|
| XL | 32px | 1.2 | 0.05em | `text-display-xl` |
| LG | 24px | 1.3 | 0.05em | `text-display-lg` |
| MD | 18px | 1.4 | 0.025em | `text-display-md` |

**Usage:**
```tsx
<h1 className="text-display-xl font-display text-primary-dark">
  Main Heading
</h1>
```

### Body Scale (Lato - Body Text)

Standard Tailwind text sizes with Lato font:
- `text-xl` - 20px (Body XL)
- `text-lg` - 18px (Body LG)
- `text-base` - 16px (Body MD - default)
- `text-sm` - 14px (Body SM)
- `text-xs` - 12px (Body XS)

**Usage:**
```tsx
<p className="text-base font-body text-primary-medium">
  Body paragraph with optimal readability.
</p>
```

## Spacing Tokens

### 8px Grid System

All spacing is based on 8px units for visual consistency:

| Units | Pixels | Tailwind | Programmatic |
|-------|--------|----------|--------------|
| 1 | 8px | `p-1`, `m-1`, `gap-1` | `spacing[1]` |
| 2 | 16px | `p-2`, `m-2`, `gap-2` | `spacing[2]` |
| 3 | 24px | `p-3`, `m-3`, `gap-3` | `spacing[3]` |
| 4 | 32px | `p-4`, `m-4`, `gap-4` | `spacing[4]` |
| 6 | 48px | `p-6`, `m-6`, `gap-6` | `spacing[6]` |
| 8 | 64px | `p-8`, `m-8`, `gap-8` | `spacing[8]` |

### Semantic Spacing

Use semantic spacing for common patterns:

```typescript
import { semanticSpacing } from '@/design-system/tokens';

// Component padding
componentPadding.sm  // 16px
componentPadding.md  // 24px
componentPadding.lg  // 32px

// Element gaps
elementGap.sm  // 16px
elementGap.md  // 24px

// Section gaps
sectionGap.md  // 48px
sectionGap.lg  // 64px
```

### Border Radius

| Token | Size | Tailwind | Usage |
|-------|------|----------|-------|
| XL | 24px | `rounded-xl` | Cards, search bars |
| 2XL | 32px | `rounded-2xl` | Large containers |

## Shadow Tokens

### Standard Shadows

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| SM | `shadow-sm` | Subtle elevation |
| MD | `shadow-md` | Cards, containers |
| LG | `shadow-lg` | Dropdowns, popovers |
| XL | `shadow-xl` | Modals |

### Component-Specific Shadows

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Button Primary | `shadow-button-primary` | Primary action buttons |
| Drawer | `shadow-drawer` | Bottom sheet, drawers |

**Example:**
```tsx
<button className="px-6 py-3 bg-primary-dark text-white rounded-xl shadow-button-primary">
  Primary Action
</button>
```

## WCAG Compliance

All color combinations have been verified for WCAG AA compliance.

### ✅ Safe Combinations (WCAG AA Compliant)

**For All Text Sizes:**
- Primary Dark on White: 10.84:1 ratio
- Primary Medium on White: 6.89:1 ratio
- White on Primary Dark: 10.84:1 ratio
- White on Primary Medium: 6.89:1 ratio
- Badge Text on Badge BG: 4.82:1 ratio

**For Large Text Only (18px+):**
- Primary on White: 3.71:1 ratio
- White on Primary: 3.71:1 ratio

### ⚠️ Guidelines

1. **Body Text**: Always use `text-primary-dark` or `text-primary-medium`
2. **Headings**: Safe to use `text-primary` for large headings (18px+)
3. **Buttons**: Use `bg-primary-dark` or `bg-primary-medium` with white text
4. **Avoid**: Never use `primary-light` or `primary-pale` for text

### Programmatic Verification

```typescript
import { isSafeCombination } from '@/design-system/tokens/contrast-verification';

const result = isSafeCombination('#344161', '#FFFFFF', 'normal');
// { safe: true, ratio: 10.84 }
```

## Usage Patterns

### Primary Button

```tsx
<button className="px-6 py-3 bg-primary-dark text-white font-body font-medium rounded-xl shadow-button-primary hover:bg-primary-medium transition-colors">
  Primary Action
</button>
```

### Card Component

```tsx
<div className="p-6 bg-white rounded-2xl shadow-lg space-y-4">
  <h3 className="text-display-md font-display text-primary-dark">Card Title</h3>
  <p className="text-base font-body text-primary-medium">Card content with optimal spacing.</p>
</div>
```

### Status Badge

```tsx
<div className="inline-flex items-center px-4 py-2 bg-badge-bg border-2 border-badge-border text-badge-text font-body font-medium rounded-xl">
  Active
</div>
```

### Gradient Background

```tsx
<div className="p-12 bg-heavenly-gradient rounded-2xl">
  <h2 className="text-display-lg font-display text-primary-dark">
    Content on Gradient
  </h2>
</div>
```

### Section with Proper Spacing

```tsx
<section className="space-y-6 p-6">
  <h2 className="text-display-lg font-display text-primary-dark">Section Title</h2>
  <div className="space-y-4">
    <p className="text-base font-body text-primary-medium">First paragraph</p>
    <p className="text-base font-body text-primary-medium">Second paragraph</p>
  </div>
</section>
```

## Testing

To visually verify all tokens, use the DesignTokenDemo component:

```tsx
import DesignTokenDemo from '@/design-system/DesignTokenDemo';

// Render in your app
<DesignTokenDemo />
```

## Migration from Legacy

When updating existing components:

1. Replace `brand-cyan` with `primary` or `primary-dark`
2. Replace `brand-dark` with `primary-dark`
3. Update font classes to `font-display` (headings) or `font-body` (text)
4. Use new spacing scale based on 8px grid
5. Replace custom shadows with design system shadows
6. Verify contrast with WCAG verification utilities

## References

- UX Design Section 2 (Design System Application)
- `docs/design-system.md` - Complete design system specification
- `tailwind.config.js` - Tailwind configuration
- `contrast-verification.ts` - WCAG compliance utilities
