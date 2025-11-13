# FitForge Design System - Quick Reference

**TL;DR:** Copy-paste cheat sheet for developers implementing the new design system.

---

## Colors (Copy-Paste Ready)

```tsx
// Primary Blues
text-primary          // #758AC6 - buttons, accents
text-primary-dark     // #344161 - headlines, body text
text-primary-medium   // #566890 - secondary text
text-primary-light    // #8997B8 - placeholders, icons
text-primary-pale     // #A8B6D5 - subtle elements

bg-primary            // #758AC6
bg-white/50           // Glass surfaces
bg-white/60           // Lighter glass
bg-white/20           // Very subtle glass

border-gray-300/50    // Default glass borders
border-gray-300/70    // Stronger borders
border-white/50       // Highlight borders

bg-badge-bg           // #D9E1F8
border-badge-border   // #BFCBEE
text-badge-text       // #566890
```

---

## Typography

```tsx
// Headings (Cinzel)
className="font-cinzel text-display-xl font-bold text-primary-dark tracking-wider"
// → 32px, bold, wide tracking

className="font-cinzel text-display-md font-bold text-primary-dark tracking-wide"
// → 18px, bold, medium tracking (exercise names)

// Body (Lato)
className="font-lato text-base text-primary-dark"
// → 16px, normal

className="font-lato text-sm font-bold tracking-wide"
// → 14px, bold (category pills)

className="font-lato text-xs"
// → 12px (badges, tags)
```

---

## Components

### Button / Selected Pill
```tsx
<button className="h-10 flex items-center justify-center rounded-full bg-primary px-5 shadow-button-primary">
  <span className="text-white text-sm font-bold tracking-wide">All</span>
</button>
```

### Unselected Pill
```tsx
<button className="h-10 flex items-center justify-center rounded-full bg-white/60 border border-gray-300/70 px-5">
  <span className="text-primary-medium text-sm font-bold tracking-wide">Push</span>
</button>
```

### Glass Card
```tsx
<div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50 shadow-sm">
  {/* content */}
</div>
```

### Exercise Card
```tsx
<div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 min-h-[72px] justify-between rounded-xl border border-gray-300/50 shadow-sm">
  <div className="flex flex-col justify-center">
    <p className="text-primary-dark text-lg font-bold leading-normal font-cinzel tracking-wide">
      Barbell Bench Press
    </p>
    <div className="flex items-center gap-2 mt-1">
      <div className="flex h-6 shrink-0 items-center justify-center rounded-md bg-badge-bg px-2 border border-badge-border">
        <p className="text-badge-text text-xs font-bold">Barbell</p>
      </div>
      <p className="text-primary-light text-xs font-normal">Chest, Triceps</p>
    </div>
  </div>
  <button className="shrink-0 text-primary flex items-center justify-center size-7">
    <span className="material-symbols-outlined text-2xl">add_circle</span>
  </button>
</div>
```

### Search Bar
```tsx
<div className="px-4 py-3">
  <div className="flex items-stretch rounded-xl h-12 shadow-inner bg-white/50 border border-gray-300/50">
    <div className="text-primary-light flex items-center justify-center pl-4">
      <span className="material-symbols-outlined text-xl">search</span>
    </div>
    <input
      className="flex-1 rounded-r-xl text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-transparent placeholder:text-primary-light px-4 pl-2 text-base"
      placeholder="Search the Pantheon of Exercises..."
    />
  </div>
</div>
```

### Equipment Badge
```tsx
<div className="flex h-6 items-center justify-center rounded-md bg-badge-bg px-2 border border-badge-border">
  <p className="text-badge-text text-xs font-bold">Barbell</p>
</div>
```

### Drawer / Bottom Sheet
```tsx
<div className="absolute top-0 left-0 h-full w-full flex flex-col justify-end bg-black/20">
  <div className="flex flex-col h-[85%] rounded-t-[24px] bg-heavenly-gradient shadow-drawer border-t border-white/50">
    {/* Drag handle */}
    <div className="flex h-5 w-full items-center justify-center pt-3 pb-1">
      <div className="h-[6px] w-12 rounded-full bg-primary-pale"></div>
    </div>

    <h1 className="text-primary-dark text-display-xl font-bold tracking-wider px-4 pb-3 pt-4 font-cinzel">
      Add Exercise
    </h1>

    {/* Content */}
  </div>
</div>
```

---

## Spacing

```tsx
p-4    // 16px - standard padding
p-3    // 12px - compact padding
px-5   // 20px horizontal - pill padding

gap-2  // 8px - between pills, badge + text
gap-4  // 16px - between card elements

mt-1   // 4px - small margins
mt-2   // 8px - medium margins
mt-4   // 16px - large margins
```

---

## Border Radius

```tsx
rounded-full  // Pills, buttons, drag handle
rounded-xl    // Cards, search (24px)
rounded-md    // Badges (8px)
rounded-t-[24px]  // Drawer top
```

---

## Shadows

```tsx
shadow-button-primary  // Colored shadow for selected pills
shadow-sm              // Subtle card shadow
shadow-drawer          // Upward shadow for bottom sheets
shadow-inner           // Inset shadow for search
```

---

## Migration Patterns

### Old → New

```tsx
// OLD
<button className="bg-brand-cyan text-white rounded-lg px-4 py-2">
  Save
</button>

// NEW
<button className="h-10 bg-primary text-white rounded-full px-5 shadow-button-primary">
  <span className="text-sm font-bold tracking-wide">Save</span>
</button>
```

```tsx
// OLD
<div className="bg-brand-surface rounded-lg p-4 shadow-md">

// NEW
<div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50 shadow-sm">
```

```tsx
// OLD
<h1 className="text-2xl font-bold text-white">

// NEW
<h1 className="font-cinzel text-display-xl font-bold text-primary-dark tracking-wider">
```

---

## Installation

```bash
npm install @fontsource/cinzel @fontsource/lato
```

```typescript
// In main entry file (index.tsx)
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
```

---

## Tailwind Config Additions

```javascript
// Add to tailwind.config.js
colors: {
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
},

fontFamily: {
  cinzel: ['Cinzel', 'serif'],
  lato: ['Lato', 'sans-serif'],
},

fontSize: {
  'display-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
  'display-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0.05em', fontWeight: '700' }],
  'display-md': ['18px', { lineHeight: '1.4', letterSpacing: '0.025em', fontWeight: '700' }],
},

boxShadow: {
  'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
  'drawer': '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',
},

backgroundImage: {
  'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
},
```

---

## Key Principles

1. **Cinzel for display** (headlines, exercise names) - conveys strength and elegance
2. **Lato for body** (UI text, buttons, labels) - clean and modern
3. **Glass morphism everywhere** - `white/50` + `backdrop-blur-sm` + semi-transparent borders
4. **Primary blue (#758AC6)** replaces cyan (#24aceb)
5. **Rounded-full for interactive elements** (pills, buttons)
6. **Rounded-xl for surfaces** (cards, inputs)
7. **Dark blue text (#344161)** on light backgrounds, not white
8. **Tracking-wide or tracking-wider** for all display text and pills

---

**Full documentation:** `docs/design-system.md`
