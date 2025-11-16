# FitForge Design System

**Version:** 1.0.0
**Last Updated:** 2025-11-12
**Status:** Active - Ready for Implementation

---

## Overview

This design system is extracted from the AI-generated Stitch design (Exercise Picker Drawer) and establishes FitForge's visual foundation. It embodies a **premium fitness experience** with elegant serif typography, sophisticated blue tones, glass morphism effects, and a heavenly gradient aesthetic.

**Design Philosophy:**
- **Elegance meets strength** - Cinzel serif headlines convey classical power and timeless quality
- **Premium fitness brand** - Sophisticated color palette and glass morphism create luxury feel
- **Clarity and focus** - Clean layouts, generous whitespace, clear visual hierarchy
- **Heavenly aesthetic** - Soft gradients and ethereal backgrounds evoke aspirational fitness goals

---

## 1. Color System

### Primary Palette

#### Blue Tones (Primary)
```css
--color-primary: #758AC6;           /* Primary brand blue - buttons, accents */
--color-primary-dark: #344161;      /* Dark blue - headlines, body text */
--color-primary-medium: #566890;    /* Medium blue - secondary text, pills */
--color-primary-light: #8997B8;     /* Light blue - placeholders, icons */
--color-primary-pale: #A8B6D5;      /* Pale blue - drag handles, subtle elements */
```

**Usage:**
- `#758AC6` - Primary actions, selected states, interactive elements
- `#344161` - Headlines (Cinzel), primary body text
- `#566890` - Secondary text in pills, unselected states
- `#8997B8` - Placeholders, tertiary text, icons
- `#A8B6D5` - Drag handles, very subtle UI elements

#### Surface Colors (Glass Morphism)
```css
--color-surface-glass-light: rgba(255, 255, 255, 0.55);       /* Default glass */
--color-surface-glass-light-elevated: rgba(255, 255, 255, 0.62); /* Raised cards */
--color-surface-glass-dark: rgba(15, 23, 42, 0.72);           /* Dark mode */
--color-surface-glass-dark-elevated: rgba(15, 23, 42, 0.82);  /* Dark mode raised */
```

**Usage:**
- `glass.surface.light` – Cards, search bars, Surface-level glass
- `glass.surface.lightElevated` – Raised/elevated cards (e.g., modals, notifications)
- `glass.surface.dark` – Dark-theme glass
- `glass.surface.darkElevated` – Raised dark surfaces (sheets/modals)

#### Border Colors
```css
--color-border-glass-light: rgba(255, 255, 255, 0.35);
--color-border-glass-subtle: rgba(255, 255, 255, 0.25);
--color-border-glass-dark: rgba(255, 255, 255, 0.18);
```

**Usage:**
- `glass.border.light` – Default borders (cards, search)
- `glass.border.subtle` – Pills/subtle dividers
- `glass.border.dark` – Dark theme border color

#### Accent & Badge Colors
```css
--color-badge-background: #D9E1F8;  /* Light blue badge background */
--color-badge-border: #BFCBEE;      /* Badge border */
--color-badge-text: #566890;        /* Badge text */
```

**Usage:**
- Equipment type badges (Barbell, Dumbbell, Cable, Machine)

#### Shadows & Effects
```css
--shadow-button-primary: 0 2px 8px rgba(117, 138, 198, 0.4);  /* Selected pill shadow */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);                  /* Card shadow-sm */
--shadow-drawer: 0 -10px 30px -15px rgba(0, 0, 0, 0.2);      /* Drawer shadow */
--shadow-search-inner: inset 0 1px 2px rgba(0, 0, 0, 0.05);  /* Search bar inner shadow */
--shadow-glass-elevated: 0 20px 45px -35px rgba(15, 23, 42, 0.75); /* Elevated glass depth */
```

#### Background Gradients
```css
/* Heavenly Gradient (Light Mode) */
background-image: linear-gradient(180deg,
  rgba(235, 241, 255, 0.95) 0%,     /* Soft blue-white */
  rgba(255, 255, 255, 0.95) 100%    /* Pure white */
);

/* Marble Background (Conceptual) */
background-image: url('marble-texture.jpg');
background-size: cover;
background-position: center;

/* Dark Overlay for behind drawer */
background-color: rgba(0, 0, 0, 0.20);
```

---

### Current FitForge Colors (To Be Replaced)

**Deprecated:**
```css
--brand-cyan: #24aceb;              /* Current primary - too bright */
--brand-dark: #111c21;              /* Current dark background */
--brand-surface: /* undefined */    /* Current card background */
--brand-muted: /* undefined */      /* Current muted elements */
```

**Migration:**
- Replace `brand-cyan` (#24aceb) with `primary` (#758AC6)
- Replace `brand-dark` with `primary-dark` (#344161) for text
- Add new glass morphism surfaces instead of solid backgrounds

---

## 2. Typography

### Font Families

```css
/* Primary Fonts */
--font-display: 'Cinzel', serif;    /* Headlines, exercise names */
--font-body: 'Lato', sans-serif;    /* Body text, UI elements */
```

**CDN Links:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
```

**NPM Installation (Recommended):**
```bash
npm install @fontsource/cinzel @fontsource/lato
```

```typescript
// In your main entry file
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
```

### Type Scale

#### Display (Cinzel)
```css
--text-display-xl: 32px;            /* Page titles, drawer titles */
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.05em;           /* tracking-wider */
  color: #344161;                   /* primary-dark */
  line-height: 1.2;

--text-display-lg: 24px;            /* Section headers */
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #344161;

--text-display-md: 18px;            /* Exercise names */
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.025em;          /* tracking-wide */
  color: #344161;
  line-height: 1.4;
```

**Usage:**
- `32px` - "Add Exercise", page titles
- `18px` - "Barbell Bench Press", exercise names in cards

#### Body (Lato)
```css
--text-base: 16px;                  /* Default body text */
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  color: #344161;
  line-height: 1.5;

--text-sm: 14px;                    /* Category pills */
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  letter-spacing: 0.025em;          /* tracking-wide */
  line-height: 1.4;

--text-xs: 12px;                    /* Badges, muscle tags */
  font-family: 'Lato', sans-serif;
  font-weight: 400 | 700;
  line-height: 1.3;
```

**Font Weights:**
- `400` - Regular (body text, placeholders)
- `700` - Bold (buttons, pills, badges, emphasis)

**Letter Spacing:**
- `tracking-wide` (0.025em) - Exercise names, category pills
- `tracking-wider` (0.05em) - Large display text

---

## 3. Spacing System

### Scale
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
```

### Component Spacing
```css
/* Padding */
p-4: 16px;          /* Card padding, page gutters */
p-3: 12px;          /* Category pills padding, list padding */
p-5: 20px;          /* Category pills horizontal (px-5) */

/* Gaps */
gap-2: 8px;         /* Between category pills, badge + text */
gap-4: 16px;        /* Between exercise card elements */

/* Margins */
mt-1: 4px;          /* Badge + muscle text margin */
mt-2: 8px;          /* Search to pills */
mt-4: 16px;         /* Title to search */
pb-3: 12px;         /* Title bottom padding */
pt-4: 16px;         /* Title top padding */
```

---

## 4. Border Radius

```css
--radius-sm: 0.375rem;      /* 6px - Not used in Stitch */
--radius-md: 0.5rem;        /* 8px - Badges (rounded-md) */
--radius-lg: 1rem;          /* 16px - Background placeholders */
--radius-xl: 1.5rem;        /* 24px - Cards, search, drawer (rounded-xl) */
--radius-2xl: 24px;         /* Drawer top radius (rounded-t-[24px]) */
--radius-full: 9999px;      /* Pills, buttons, drag handle */
```

**Usage:**
- `rounded-xl` (24px) - Exercise cards, search bar, main surfaces
- `rounded-full` - Category pills, drag handle
- `rounded-md` (8px) - Equipment badges
- `rounded-t-[24px]` - Drawer top corners

---

## 5. Shadows & Elevation

```css
/* Button Shadow (Selected Pill) */
box-shadow: 0 2px 8px rgba(117, 138, 198, 0.4);

/* Card Shadow (Exercise Cards) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);  /* shadow-sm */

/* Drawer Shadow (Bottom Sheet) */
box-shadow: 0 -10px 30px -15px rgba(0, 0, 0, 0.2);

/* Inner Shadow (Search Bar) */
box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);  /* shadow-inner */
```

---

## 6. Component Patterns

### 6.1 Drawer / Bottom Sheet

```html
<!-- Full height drawer with rounded top -->
<div class="absolute top-0 left-0 h-full w-full flex flex-col justify-end bg-black/20">
  <div class="flex flex-col h-[85%] rounded-t-[24px] bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] border-t border-white/50">
    <!-- Drag handle -->
    <div class="flex h-5 w-full items-center justify-center pt-3 pb-1 shrink-0">
      <div class="h-[6px] w-12 rounded-full bg-[#A8B6D5]"></div>
    </div>

    <!-- Title -->
    <h1 class="text-[#344161] text-[32px] font-bold tracking-wider px-4 text-left pb-3 pt-4 font-cinzel">
      Add Exercise
    </h1>

    <!-- Content... -->
  </div>
</div>
```

**Key Properties:**
- Height: `85%` of viewport
- Top radius: `24px`
- Background: Heavenly gradient with 95% opacity
- Border top: `white/50` for highlight
- Shadow: Upward (-10px Y)
- Drag handle: 6px × 48px, pale blue (#A8B6D5)

---

### 6.2 Search Bar

```html
<div class="px-4 py-3">
  <label class="flex flex-col min-w-40 h-12 w-full">
    <div class="flex w-full flex-1 items-stretch rounded-xl h-full shadow-inner bg-white/50 border border-gray-300/50">
      <!-- Icon -->
      <div class="text-[#8997B8] flex items-center justify-center pl-4 rounded-l-xl">
        <span class="material-symbols-outlined" style="font-size: 20px;">search</span>
      </div>

      <!-- Input -->
      <input
        class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#344161] focus:outline-0 focus:ring-2 focus:ring-[#758AC6] border-none bg-transparent h-full placeholder:text-[#8997B8] px-4 pl-2 text-base font-normal leading-normal"
        placeholder="Search the Pantheon of Exercises..."
      />
    </div>
  </label>
</div>
```

**Key Properties:**
- Height: `48px` (h-12)
- Glass background: `white/50`
- Border: `gray-300/50`
- Inner shadow for depth
- Focus ring: `#758AC6` (primary blue)
- Icon color: `#8997B8` (light blue)
- Placeholder: `#8997B8`
- Text color: `#344161` (dark blue)

---

### 6.3 Category Pills (Selected vs Unselected)

```html
<!-- Selected Pill -->
<div class="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#758AC6] px-5 shadow-[0_2px_8px_rgba(117,138,198,0.4)]">
  <p class="text-white text-sm font-bold tracking-wide">All</p>
</div>

<!-- Unselected Pill -->
<div class="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/60 border border-gray-300/70 px-5">
  <p class="text-[#566890] text-sm font-bold tracking-wide">Push</p>
</div>
```

**Key Properties:**

**Selected State:**
- Background: `#758AC6` (solid primary blue)
- Text: `white`
- Shadow: `0 2px 8px rgba(117,138,198,0.4)`
- No border

**Unselected State:**
- Background: `white/60` (glass)
- Text: `#566890` (medium blue)
- Border: `gray-300/70`
- No shadow

**Both:**
- Height: `40px` (h-10)
- Padding: `20px horizontal` (px-5)
- Font: `14px bold` with `tracking-wide`
- Border radius: `full`

---

### 6.4 Exercise Card

```html
<div class="flex items-center gap-4 bg-white/50 p-4 min-h-[72px] justify-between rounded-xl border border-gray-300/50 shadow-sm">
  <!-- Content -->
  <div class="flex flex-col justify-center">
    <!-- Exercise Name (Cinzel) -->
    <p class="text-[#344161] text-lg font-bold leading-normal font-cinzel tracking-wide">
      Barbell Bench Press
    </p>

    <!-- Badge + Muscle Tags -->
    <div class="flex items-center gap-2 mt-1">
      <!-- Equipment Badge -->
      <div class="flex h-6 shrink-0 items-center justify-center rounded-md bg-[#D9E1F8] px-2 border border-[#BFCBEE]">
        <p class="text-[#566890] text-xs font-bold">Barbell</p>
      </div>

      <!-- Muscle Tags -->
      <p class="text-[#8997B8] text-xs font-normal">Chest, Triceps</p>
    </div>
  </div>

  <!-- Action Button -->
  <div class="shrink-0">
    <div class="text-[#758AC6] flex size-7 items-center justify-center">
      <span class="material-symbols-outlined" style="font-size: 24px;">add_circle</span>
    </div>
  </div>
</div>
```

**Key Properties:**
- Background: `white/50` (glass)
- Border: `gray-300/50`
- Border radius: `xl` (24px)
- Padding: `16px` (p-4)
- Min height: `72px`
- Shadow: `sm` (subtle)
- Exercise name: Cinzel, 18px, bold, dark blue (#344161)
- Badge: Light blue background (#D9E1F8), medium blue text (#566890)
- Muscle tags: Light blue (#8997B8), 12px
- Action icon: Primary blue (#758AC6), 24px

---

### 6.5 Equipment Badge

```html
<div class="flex h-6 shrink-0 items-center justify-center rounded-md bg-[#D9E1F8] px-2 border border-[#BFCBEE]">
  <p class="text-[#566890] text-xs font-bold">Barbell</p>
</div>
```

**Key Properties:**
- Height: `24px` (h-6)
- Background: `#D9E1F8` (light blue)
- Border: `#BFCBEE` (light blue border)
- Text: `#566890` (medium blue), 12px bold
- Border radius: `md` (8px)
- Padding: `8px horizontal` (px-2)

---

### 6.6 Glass Morphism Pattern

Use the shared Tailwind utilities introduced in Story 8.2:

```html
<div class="glass-panel rounded-2xl p-6">
  ...
</div>

<div class="glass-panel-elevated rounded-[32px] p-8">
  ...
</div>
```

- `.glass-panel` → Light-mode glass, 55% opacity, blur-lg, border with white/35%
- `.glass-panel-elevated` → Adds elevated opacity (62%), stronger shadow (`shadow-glass`)
- `dark:...` variants are baked into the utility so no extra classes are required
- Fallback: When `backdrop-filter` isn’t supported, utilities automatically apply solid backgrounds `rgba(255,255,255,0.85)` / `rgba(15,23,42,0.85)` so text remains legible. See CSS in `src/index.css`.

---

## 7. Iconography

### Icon System
- **Library:** Material Symbols Outlined
- **CDN:** `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`
- **Default size:** 20-24px
- **Colors:** Match text color or use primary blue (#758AC6) for actions

**Common Icons:**
- `search` - Search bars (20px)
- `add_circle` - Add actions (24px)
- `drag_handle` - Reorderable lists

---

## 8. Visual Design Principles

### Glass Morphism
- **Utilities:** `.glass-panel` and `.glass-panel-elevated` ensure consistency
- **Transparency:** 55–62% opacity on light surfaces, 72–82% on dark surfaces
- **Backdrop blur:** `backdrop-blur-lg` (8px) with fallback solids for Safari/old Edge
- **Borders:** Semi-transparent white borders (`glass.border.*`) for depth
- **Layering:** Dark-mode overlay gradient + `glass-panel-elevated` for drawers and quick actions

### Heavenly Gradient
- **Direction:** Top to bottom (180deg)
- **Start:** Soft blue-white (`#EBF1FF` at 95% opacity)
- **End:** Pure white at 95% opacity
- **Usage:** Drawer/modal backgrounds, page backgrounds

### Marble Background (Conceptual)
- **Image:** White marble texture
- **Treatment:** Covered by glass surfaces with backdrop blur
- **Purpose:** Premium texture, partially visible through glass

### Shadows & Depth
- **Subtle elevation:** Use `shadow-sm` (cards)
- **Button emphasis:** Use colored shadows matching button color
- **Drawers:** Use upward shadows (`0 -10px...`)
- **Inner shadows:** Use for inset elements (search bars)

### Background Validation (Epic 8.2)
- **Heavenly gradient:** No changes required – `glass-panel` keeps text AAA contrast.
- **Dark gradient:** Switch to `.glass-panel-elevated` for analytics modals to avoid halos.
- **Marble texture:** Added `bg-marble-texture` option; `glass-panel` keeps streaks muted.
- **High-contrast photo overlay:** Use `glass-panel-elevated` + `bg-photo-overlay` to ensure readability.
- See `docs/testing/accessibility/glass-validation.md` for screenshots + notes.

---

## 9. Tailwind Configuration

### Recommended `tailwind.config.js`

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#758AC6',
          dark: '#344161',
          medium: '#566890',
          light: '#8997B8',
          pale: '#A8B6D5',
        },

        // Badge Colors
        badge: {
          bg: '#D9E1F8',
          border: '#BFCBEE',
          text: '#566890',
        },

        // Legacy (to be deprecated)
        'brand-cyan': '#24aceb',
        'brand-dark': '#111c21',
      },

      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Lato', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },

      fontSize: {
        'display-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
        'display-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0.05em', fontWeight: '700' }],
        'display-md': ['18px', { lineHeight: '1.4', letterSpacing: '0.025em', fontWeight: '700' }],
      },

      borderRadius: {
        DEFAULT: '0.5rem',      // 8px
        lg: '1rem',             // 16px
        xl: '1.5rem',           // 24px
        '2xl': '2rem',          // 32px
        full: '9999px',
      },

      boxShadow: {
        'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
        'drawer': '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',
      },

      backgroundImage: {
        'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
      },
    },
  },
  plugins: [],
}
```

---

## 10. Component Migration Guide

### Current → New Design System

#### Buttons
**Before:**
```tsx
<button className="bg-brand-cyan text-white rounded-lg px-4 py-2">
  Save
</button>
```

**After:**
```tsx
<button className="bg-primary text-white rounded-full px-5 py-2 text-sm font-bold tracking-wide shadow-button-primary">
  Save
</button>
```

**Changes:**
- Color: `brand-cyan` → `primary` (#758AC6)
- Radius: `rounded-lg` → `rounded-full`
- Shadow: Add `shadow-button-primary`
- Typography: Add `text-sm font-bold tracking-wide`

---

#### Cards
**Before:**
```tsx
<div className="bg-brand-surface rounded-lg p-4 shadow-md">
  {/* content */}
</div>
```

**After:**
```tsx
<div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50 shadow-sm">
  {/* content */}
</div>
```

**Changes:**
- Background: Solid → Glass (`white/50`)
- Add backdrop blur
- Border radius: `lg` → `xl`
- Shadow: `md` → `sm`
- Add semi-transparent border

---

#### Typography
**Before:**
```tsx
<h1 className="text-2xl font-bold text-white">
  Dashboard
</h1>
```

**After:**
```tsx
<h1 className="text-display-xl font-cinzel font-bold text-primary-dark tracking-wider">
  Dashboard
</h1>
```

**Changes:**
- Font: Default → Cinzel
- Color: `white` → `primary-dark` (#344161)
- Add letter spacing
- Use semantic size token

---

#### Pills/Badges (Selected)
**Before:**
```tsx
<div className="bg-brand-cyan text-white px-4 py-2 rounded-lg">
  All
</div>
```

**After:**
```tsx
<div className="h-10 flex items-center justify-center rounded-full bg-primary px-5 shadow-button-primary">
  <p className="text-white text-sm font-bold tracking-wide">All</p>
</div>
```

**Changes:**
- Fixed height: `h-10`
- Border radius: `lg` → `full`
- Add shadow
- Typography: Add bold + tracking

---

#### Pills/Badges (Unselected)
**Before:**
```tsx
<div className="bg-white/10 text-white px-4 py-2 rounded-lg">
  Push
</div>
```

**After:**
```tsx
<div className="h-10 flex items-center justify-center rounded-full bg-white/60 border border-gray-300/70 px-5">
  <p className="text-primary-medium text-sm font-bold tracking-wide">Push</p>
</div>
```

**Changes:**
- Background: `white/10` → `white/60`
- Add border
- Text color: `white` → `primary-medium` (#566890)
- Typography: Add bold + tracking

---

## 11. Implementation Checklist

### Phase 1: Setup
- [ ] Install fonts (`@fontsource/cinzel`, `@fontsource/lato`)
- [ ] Update `tailwind.config.js` with new color tokens
- [ ] Add font family extensions
- [ ] Add border radius extensions
- [ ] Add shadow extensions
- [ ] Import fonts in main entry file

### Phase 2: Core Components
- [ ] Update Button component with new styles
- [ ] Update Card component with glass morphism
- [ ] Create Pill/Badge component
- [ ] Update search input styling
- [ ] Create drawer/bottom sheet component

### Phase 3: Typography
- [ ] Replace heading styles with Cinzel
- [ ] Keep body text with Lato
- [ ] Add letter spacing to appropriate elements
- [ ] Update text color tokens

### Phase 4: Layout & Surfaces
- [ ] Apply heavenly gradient to page backgrounds
- [ ] Convert solid backgrounds to glass surfaces
- [ ] Add backdrop blur where appropriate
- [ ] Update border colors to semi-transparent

### Phase 5: Polish
- [ ] Add shadows to interactive elements
- [ ] Update focus states with primary color
- [ ] Test glass effects across different backgrounds
- [ ] Ensure consistent spacing throughout

---

## 12. Design Tokens Reference

### Quick Copy-Paste Tokens

```css
/* Colors */
#758AC6  /* primary */
#344161  /* primary-dark (text) */
#566890  /* primary-medium */
#8997B8  /* primary-light */
#A8B6D5  /* primary-pale */
#D9E1F8  /* badge-bg */
#BFCBEE  /* badge-border */

/* Backgrounds */
rgba(255, 255, 255, 0.50)  /* glass main */
rgba(255, 255, 255, 0.60)  /* glass light */
rgba(255, 255, 255, 0.20)  /* glass subtle */

/* Borders */
rgba(209, 213, 219, 0.50)  /* border-gray-300/50 */
rgba(209, 213, 219, 0.70)  /* border-gray-300/70 */
rgba(255, 255, 255, 0.50)  /* border-white/50 */

/* Shadows */
0 2px 8px rgba(117, 138, 198, 0.4)      /* button-primary */
0 1px 3px rgba(0, 0, 0, 0.1)            /* shadow-sm */
0 -10px 30px -15px rgba(0, 0, 0, 0.2)  /* drawer */
inset 0 1px 2px rgba(0, 0, 0, 0.05)    /* shadow-inner */

/* Gradient */
linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)
```

---

## 13. Comparison: Old vs New

### Visual Differences

| Aspect | Current FitForge | New Design System |
|--------|------------------|-------------------|
| **Primary Color** | Bright cyan (#24aceb) | Sophisticated blue (#758AC6) |
| **Typography** | Generic sans-serif | Cinzel (display) + Lato (body) |
| **Surfaces** | Solid dark backgrounds | Glass morphism (white/50) |
| **Aesthetic** | Tech/gaming | Premium fitness/classical |
| **Shadows** | Standard grays | Colored shadows matching UI |
| **Border Radius** | Mostly `rounded-lg` | Mix of `rounded-xl` and `rounded-full` |
| **Text Colors** | White/light gray | Blue tones (#344161, #566890) |
| **Buttons** | Rectangular with cyan | Rounded pills with sophisticated blue |

### Why the Change?

**Current Issues:**
1. Bright cyan feels "tech startup" not "premium fitness"
2. Solid dark backgrounds feel heavy and gaming-like
3. Generic typography lacks personality
4. No consistent visual hierarchy

**New Benefits:**
1. Elegant blue palette conveys trust, strength, and sophistication
2. Glass morphism feels modern, light, and premium
3. Cinzel serif adds classical strength and timeless quality
4. Clear hierarchy with Cinzel (headlines) vs Lato (body)
5. Heavenly aesthetic is aspirational and motivating

---

## 14. Usage Examples

### Complete Exercise Card Component

```tsx
interface ExerciseCardProps {
  name: string;
  equipment: string;
  muscles: string;
  onAdd: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  equipment,
  muscles,
  onAdd
}) => {
  return (
    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 min-h-[72px] justify-between rounded-xl border border-gray-300/50 shadow-sm">
      <div className="flex flex-col justify-center">
        {/* Exercise Name */}
        <p className="text-primary-dark text-lg font-bold leading-normal font-cinzel tracking-wide">
          {name}
        </p>

        {/* Badge + Tags */}
        <div className="flex items-center gap-2 mt-1">
          {/* Equipment Badge */}
          <div className="flex h-6 shrink-0 items-center justify-center rounded-md bg-badge-bg px-2 border border-badge-border">
            <p className="text-badge-text text-xs font-bold">{equipment}</p>
          </div>

          {/* Muscle Tags */}
          <p className="text-primary-light text-xs font-normal">{muscles}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onAdd}
        className="shrink-0 text-primary flex items-center justify-center size-7 hover:opacity-80 transition-opacity"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
          add_circle
        </span>
      </button>
    </div>
  );
};
```

### Complete Category Pills Component

```tsx
interface CategoryPillsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex gap-2 p-3 pl-4 overflow-x-auto">
      {categories.map((category) => {
        const isSelected = category === selected;

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`
              flex h-10 shrink-0 items-center justify-center gap-x-2
              rounded-full px-5 transition-all
              ${isSelected
                ? 'bg-primary text-white shadow-button-primary'
                : 'bg-white/60 border border-gray-300/70 text-primary-medium'
              }
            `}
          >
            <p className="text-sm font-bold tracking-wide">{category}</p>
          </button>
        );
      })}
    </div>
  );
};
```

---

## 15. Accessibility Notes

### Color Contrast
- Primary dark (#344161) on white: **WCAG AAA** (8.9:1)
- Primary (#758AC6) on white: **WCAG AA** (3.2:1)
- White on primary (#758AC6): **WCAG AA** (3.2:1)
- Badge text (#566890) on badge bg (#D9E1F8): **WCAG AA** (4.1:1)

### Glass Surface Contrast
| Surface | Text | Ratio | Result |
| --- | --- | --- | --- |
| `glass.surface.light` + `text-primary-dark` | 9.7:1 | AAA |
| `glass.surface.lightElevated` + `text-primary-medium` | 5.4:1 | AA |
| `glass.surface.dark` + `text-white` | 7.8:1 | AAA |
| `glass.surface.darkElevated` + `text-primary-light` | 4.5:1 | AA |

- Measurements taken via WebAIM Contrast Checker as part of Epic 8.2 validation.

### Glass Morphism Considerations
- Ensure sufficient opacity (50%+) for readability
- Always pair with backdrop blur
- Use borders for definition
- Test against various backgrounds

### Typography
- Minimum size: 12px (badges)
- Body text: 16px (optimal readability)
- Line height: 1.4-1.5 (comfortable reading)

---

## 16. Motion System

### Infrastructure
- **Provider:** `src/providers/MotionProvider.tsx` wraps the React tree and exposes `useMotion()` helpers.
- **Feature Flag:** `VITE_ANIMATIONS_ENABLED` controls whether motion props run (see `.env.example`).
- **Reduced Motion:** The provider listens to `prefers-reduced-motion` and automatically disables animations when requested.

### Presets
- All shared variants live in `src/providers/motion-presets.ts`:
  - `SPRING_TRANSITION` (stiffness 300, damping 30, mass 0.8)
  - `pageTransitionVariants` for route transitions
  - `sheetVariants` + `overlayVariants` for Vaul sheets/modals
  - `listContainerVariants` + `listItemVariants` for staggered dashboards/lists
  - `shimmerVariants` for skeleton shimmer loops (1.5s cycle)

### Usage Guidelines
1. Wrap repeated UI (dashboard cards, recommendation grids, WorkoutBuilder rows) in a `motion.div` with `listContainerVariants`, then apply `listItemVariants` to the children.
2. Use the provider-aware primitives:
   - `Button` now applies tap/hover feedback via Framer Motion when enabled.
   - `Sheet` animates bottom sheets/modals using shared spring presets.
3. Always guard optional motion with `useMotionEnabled()` so feature flag + reduced-motion states are respected.
4. Storybook stories (`Button.stories.tsx`, `Sheet.stories.tsx`, and `patterns/PageTransitions.stories.tsx`) demonstrate the new animation system for QA/reference.

---

## 17. Developer Resources

### Stitch HTML Reference
- **Location:** `docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/code.html`
- **Screenshot:** `docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/screen.png`

### Material Symbols
- **Documentation:** https://fonts.google.com/icons
- **CDN:** Already included in Stitch HTML

### Font Resources
- **Cinzel:** https://fonts.google.com/specimen/Cinzel
- **Lato:** https://fonts.google.com/specimen/Lato
- **Fontsource:** https://fontsource.org/

---

## 18. Next Steps

1. **Review with team** - Ensure alignment on visual direction
2. **Update Tailwind config** - Add all new tokens
3. **Create base components** - Button, Card, Badge, Pill, Input
4. **Build Storybook stories** - Document all component variants
5. **Update existing components** - Migrate one screen at a time
6. **Test thoroughly** - Especially glass effects across different backgrounds

---

**Questions or feedback?** Reference the Stitch HTML/screenshot for the source of truth.

**Version History:**
- 1.0.0 (2025-11-12) - Initial extraction from Stitch Exercise Picker Drawer
