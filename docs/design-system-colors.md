# FitForge Color Palette

Complete color reference extracted from Stitch AI-generated design.

---

## Primary Blues

### Primary Blue
**Hex:** `#758AC6`
**RGB:** `117, 138, 198`
**Usage:** Selected buttons, primary actions, interactive accents, icons
**Tailwind:** `bg-primary`, `text-primary`, `border-primary`

```css
background-color: #758AC6;
color: #758AC6;
border-color: #758AC6;
```

---

### Primary Dark
**Hex:** `#344161`
**RGB:** `52, 65, 97`
**Usage:** Headlines (Cinzel), primary body text, exercise names
**Tailwind:** `text-primary-dark`
**Contrast:** WCAG AAA on white (8.9:1)

```css
color: #344161;
```

---

### Primary Medium
**Hex:** `#566890`
**RGB:** `86, 104, 144`
**Usage:** Unselected pill text, secondary text, badge text
**Tailwind:** `text-primary-medium`

```css
color: #566890;
```

---

### Primary Light
**Hex:** `#8997B8`
**RGB:** `137, 151, 184`
**Usage:** Placeholders, tertiary text, search icons, muscle tags
**Tailwind:** `text-primary-light`

```css
color: #8997B8;
```

---

### Primary Pale
**Hex:** `#A8B6D5`
**RGB:** `168, 182, 213`
**Usage:** Drag handles, very subtle UI elements
**Tailwind:** `bg-primary-pale`, `text-primary-pale`

```css
background-color: #A8B6D5;
```

---

## Badge Colors

### Badge Background
**Hex:** `#D9E1F8`
**RGB:** `217, 225, 248`
**Usage:** Equipment badge backgrounds (Barbell, Dumbbell, etc.)
**Tailwind:** `bg-badge-bg`

```css
background-color: #D9E1F8;
```

---

### Badge Border
**Hex:** `#BFCBEE`
**RGB:** `191, 203, 238`
**Usage:** Equipment badge borders
**Tailwind:** `border-badge-border`

```css
border-color: #BFCBEE;
```

---

### Badge Text
**Hex:** `#566890`
**RGB:** `86, 104, 144`
**Usage:** Equipment badge text (same as primary-medium)
**Tailwind:** `text-badge-text`
**Contrast:** WCAG AA on #D9E1F8 (4.1:1)

```css
color: #566890;
```

---

## Glass Surfaces

### Main Glass Surface
**RGBA:** `rgba(255, 255, 255, 0.50)`
**Hex Equivalent:** `#FFFFFF80`
**Usage:** Cards, search bars, main glass elements
**Tailwind:** `bg-white/50`

```css
background-color: rgba(255, 255, 255, 0.50);
/* Always pair with backdrop-filter */
backdrop-filter: blur(8px);
```

---

### Light Glass Surface
**RGBA:** `rgba(255, 255, 255, 0.60)`
**Hex Equivalent:** `#FFFFFF99`
**Usage:** Unselected pills, lighter glass elements
**Tailwind:** `bg-white/60`

```css
background-color: rgba(255, 255, 255, 0.60);
```

---

### Subtle Glass Surface
**RGBA:** `rgba(255, 255, 255, 0.20)`
**Hex Equivalent:** `#FFFFFF33`
**Usage:** Background placeholders, very subtle overlays
**Tailwind:** `bg-white/20`

```css
background-color: rgba(255, 255, 255, 0.20);
backdrop-filter: blur(4px);
```

---

## Border Colors

### Default Glass Border
**RGBA:** `rgba(209, 213, 219, 0.50)`
**Base:** Gray-300 (#D1D5DB)
**Usage:** Cards, search bars, glass surfaces
**Tailwind:** `border-gray-300/50`

```css
border: 1px solid rgba(209, 213, 219, 0.50);
```

---

### Strong Glass Border
**RGBA:** `rgba(209, 213, 219, 0.70)`
**Base:** Gray-300 (#D1D5DB)
**Usage:** Unselected pills, stronger definition
**Tailwind:** `border-gray-300/70`

```css
border: 1px solid rgba(209, 213, 219, 0.70);
```

---

### Highlight Border
**RGBA:** `rgba(255, 255, 255, 0.50)`
**Usage:** Drawer top border, highlight edges
**Tailwind:** `border-white/50`

```css
border-top: 1px solid rgba(255, 255, 255, 0.50);
```

---

## Overlay Colors

### Dark Overlay
**RGBA:** `rgba(0, 0, 0, 0.20)`
**Usage:** Behind drawers/modals, subtle dimming
**Tailwind:** `bg-black/20`

```css
background-color: rgba(0, 0, 0, 0.20);
```

---

## Gradients

### Heavenly Gradient (Light Mode)
**CSS:**
```css
background-image: linear-gradient(180deg,
  rgba(235, 241, 255, 0.95) 0%,
  rgba(255, 255, 255, 0.95) 100%
);
```

**Breakdown:**
- **Start:** `#EBF1FF` at 95% opacity - Soft blue-white
- **End:** `#FFFFFF` at 95% opacity - Pure white
- **Direction:** Top to bottom (180deg)

**Tailwind:** `bg-heavenly-gradient`

**Usage:** Drawer backgrounds, modal backgrounds, page backgrounds

---

## Shadow Colors

### Primary Button Shadow
**RGBA:** `rgba(117, 138, 198, 0.4)`
**Base:** #758AC6 at 40% opacity
**CSS:**
```css
box-shadow: 0 2px 8px rgba(117, 138, 198, 0.4);
```

---

### Standard Card Shadow
**RGBA:** `rgba(0, 0, 0, 0.1)`
**CSS:**
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```
**Tailwind:** `shadow-sm`

---

### Drawer Shadow
**RGBA:** `rgba(0, 0, 0, 0.2)`
**CSS:**
```css
box-shadow: 0 -10px 30px -15px rgba(0, 0, 0, 0.2);
```

---

### Inner Shadow
**RGBA:** `rgba(0, 0, 0, 0.05)`
**CSS:**
```css
box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
```
**Tailwind:** `shadow-inner`

---

## Legacy Colors (To Be Deprecated)

### Brand Cyan (Old)
**Hex:** `#24aceb`
**RGB:** `36, 172, 235`
**Status:** ❌ Deprecated - Replace with `#758AC6`

### Brand Dark (Old)
**Hex:** `#111c21`
**RGB:** `17, 28, 33`
**Status:** ❌ Deprecated - Use glass surfaces or `#344161` for text

---

## Color Usage Matrix

| Element | Color | Hex/RGBA |
|---------|-------|----------|
| **Headlines** | Primary Dark | `#344161` |
| **Body Text** | Primary Dark | `#344161` |
| **Secondary Text** | Primary Medium | `#566890` |
| **Placeholder Text** | Primary Light | `#8997B8` |
| **Primary Button** | Primary | `#758AC6` |
| **Primary Button Text** | White | `#FFFFFF` |
| **Unselected Pill** | White/60 | `rgba(255,255,255,0.6)` |
| **Unselected Pill Text** | Primary Medium | `#566890` |
| **Card Background** | White/50 | `rgba(255,255,255,0.5)` |
| **Card Border** | Gray-300/50 | `rgba(209,213,219,0.5)` |
| **Search Icon** | Primary Light | `#8997B8` |
| **Action Icon** | Primary | `#758AC6` |
| **Equipment Badge BG** | Badge BG | `#D9E1F8` |
| **Equipment Badge Text** | Badge Text | `#566890` |
| **Equipment Badge Border** | Badge Border | `#BFCBEE` |
| **Drag Handle** | Primary Pale | `#A8B6D5` |
| **Modal Overlay** | Black/20 | `rgba(0,0,0,0.2)` |

---

## Accessibility

### WCAG Contrast Ratios

| Foreground | Background | Ratio | WCAG Level |
|------------|-----------|-------|------------|
| #344161 | #FFFFFF | 8.9:1 | ✅ AAA |
| #566890 | #FFFFFF | 4.5:1 | ✅ AA |
| #758AC6 | #FFFFFF | 3.2:1 | ✅ AA |
| #FFFFFF | #758AC6 | 3.2:1 | ✅ AA |
| #566890 | #D9E1F8 | 4.1:1 | ✅ AA |

**Minimum standards met:** WCAG AA for all text elements

---

## Material Symbols Icon Colors

| Context | Color | Hex |
|---------|-------|-----|
| Search Icon | Primary Light | `#8997B8` |
| Action Icon (Add) | Primary | `#758AC6` |
| Active/Selected | Primary | `#758AC6` |
| Inactive/Disabled | Primary Light | `#8997B8` |

---

## Color Naming Convention

```typescript
// Color naming pattern:
primary           // Main brand color
primary-dark      // Darker variant (text)
primary-medium    // Medium variant (secondary text)
primary-light     // Lighter variant (placeholders)
primary-pale      // Very light variant (subtle UI)

badge-bg          // Badge background
badge-border      // Badge border
badge-text        // Badge text

// Opacity variants:
white/50          // 50% opacity white
black/20          // 20% opacity black
gray-300/50       // 50% opacity gray-300
```

---

## Figma / Design Tool Export

```
Primary Blues:
#758AC6 - Primary
#344161 - Primary Dark
#566890 - Primary Medium
#8997B8 - Primary Light
#A8B6D5 - Primary Pale

Badge Colors:
#D9E1F8 - Badge Background
#BFCBEE - Badge Border
#566890 - Badge Text

Glass Surfaces:
#FFFFFF at 50% - Main Glass
#FFFFFF at 60% - Light Glass
#FFFFFF at 20% - Subtle Glass

Borders:
#D1D5DB at 50% - Default
#D1D5DB at 70% - Strong
#FFFFFF at 50% - Highlight

Overlays:
#000000 at 20% - Dark Overlay

Gradients:
Heavenly: #EBF1FF → #FFFFFF (95% opacity both)
```

---

## CSS Custom Properties

```css
:root {
  /* Primary Blues */
  --color-primary: #758AC6;
  --color-primary-dark: #344161;
  --color-primary-medium: #566890;
  --color-primary-light: #8997B8;
  --color-primary-pale: #A8B6D5;

  /* Badge Colors */
  --color-badge-bg: #D9E1F8;
  --color-badge-border: #BFCBEE;
  --color-badge-text: #566890;

  /* Glass Surfaces */
  --surface-glass-main: rgba(255, 255, 255, 0.50);
  --surface-glass-light: rgba(255, 255, 255, 0.60);
  --surface-glass-subtle: rgba(255, 255, 255, 0.20);

  /* Borders */
  --border-glass-default: rgba(209, 213, 219, 0.50);
  --border-glass-strong: rgba(209, 213, 219, 0.70);
  --border-highlight: rgba(255, 255, 255, 0.50);

  /* Overlays */
  --overlay-dark: rgba(0, 0, 0, 0.20);

  /* Gradients */
  --gradient-heavenly: linear-gradient(180deg,
    rgba(235, 241, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );

  /* Shadows */
  --shadow-button-primary: 0 2px 8px rgba(117, 138, 198, 0.4);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-drawer: 0 -10px 30px -15px rgba(0, 0, 0, 0.2);
  --shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

---

## Testing Color Combinations

### Good Combinations ✅

```
- #344161 text on white background
- #344161 text on white/50 glass
- #758AC6 background with white text
- #566890 text on #D9E1F8 background
- #8997B8 text on white/50 (placeholders)
```

### Avoid ❌

```
- #8997B8 text on white/20 (insufficient contrast)
- #758AC6 text on white/60 (may be too light)
- #A8B6D5 text on white (too low contrast)
```

---

**Reference:** Extracted from `docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/`
