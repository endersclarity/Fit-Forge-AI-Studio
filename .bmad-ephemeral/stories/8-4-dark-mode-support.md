# Story 8-4: Dark Mode Support

## Epic Context
Epic 8: Polish & Accessibility

## Story Description
Implement dark mode with inverted gradient, adjusted glass morphism (white/10 on dark), and theme toggle with persistence.

## Acceptance Criteria
- [ ] AC1: Dark palette defined (from UX Design Section 8 + Gate Check Gap #3)
- [ ] AC2: Dark gradient (gray-900 → gray-800)
- [ ] AC3: Glass surfaces: white/10 on dark backgrounds
- [ ] AC4: Text colors adapted (primary-dark → gray-50)
- [ ] AC5: Theme toggle button (moon/sun icon)
- [ ] AC6: Preference persists to localStorage
- [ ] AC7: All screens tested in dark mode
- [ ] AC8: All text/background combinations pass WCAG AA (4.5:1 normal, 3:1 large)
- [ ] AC9: Focus indicators visible in dark mode (3:1 contrast minimum)
- [ ] AC10: Glass morphism surfaces maintain premium aesthetic in dark mode
- [ ] AC11: Badge colors maintain category distinction in dark mode
- [ ] AC12: Shadows adjusted for dark backgrounds (higher opacity)

## Technical Approach

Implement comprehensive dark mode using Tailwind's class-based dark mode system with localStorage persistence and system preference detection.

### Phase 1: Tailwind Configuration (2 hours)

Update `tailwind.config.js` with dark mode colors:

```javascript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Existing light mode colors
        'primary': '#758AC6',
        'primary-dark': '#344161',
        'primary-medium': '#566890',
        'primary-light': '#8997B8',
        'primary-pale': '#A8B6D5',
        'badge-blue': '#D9E1F8',
        'badge-blue-border': '#BFCBEE',

        // Dark mode specific
        slate: {
          900: '#0f172a',
          800: '#1e293b',
        },
      },
    },
  },
}
```

### Phase 2: Theme Toggle Component (2 hours)

Create theme toggle with localStorage persistence:

```typescript
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)

    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/80 dark:bg-white/10
                 border border-gray-300 dark:border-white/20
                 hover:bg-white dark:hover:bg-white/20
                 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
```

### Phase 3: Apply Dark Variants (4 hours)

Add `dark:` variants to all components following UX Design Section 8 specifications:

**Background Gradients:**
```css
/* Update global CSS */
.heavenly-gradient {
  background: linear-gradient(180deg,
    rgba(235, 241, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
}

.dark .heavenly-gradient {
  background: linear-gradient(180deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.95) 100%
  );
}
```

**Component Examples:**
```tsx
// Exercise Card
<div className="bg-white/50 dark:bg-white/10
                backdrop-blur-sm
                border border-gray-300/50 dark:border-white/10">
  <h3 className="text-primary-dark dark:text-gray-50">Bench Press</h3>
  <p className="text-primary-medium dark:text-gray-300">Chest, Triceps</p>
</div>

// Primary Button
<button className="bg-primary dark:bg-primary-light
                   text-white dark:text-slate-900
                   hover:bg-primary-dark dark:hover:bg-primary">
  Start Workout
</button>

// Input Field
<input className="bg-white/60 dark:bg-white/5
                  border-gray-300 dark:border-white/20
                  text-primary-dark dark:text-gray-50
                  focus:border-primary dark:focus:border-primary-light" />
```

### Phase 4: Contrast Verification (2 hours)

Test all color combinations with WebAIM Contrast Checker:

- Primary text on dark background: #F9FAFB on #0f172a = 15.8:1 ✅ AAA
- Secondary text on dark background: #D1D5DB on #0f172a = 9.2:1 ✅ AAA
- Tertiary text on dark background: #9CA3AF on #0f172a = 7.1:1 ✅ AA+
- Primary button text: #0f172a on #8FA5D9 = 8.1:1 ✅ AAA

Run Lighthouse audit in dark mode: Target 90+ accessibility score.

**Reference:** UX Design Section 8 (Dark Mode Specifications)

**Gate Check Gap #3:** This story resolves dark mode color specifications gap.

## Dependencies
**Depends On:** 5-2 (tokens), 8-2 (glass morphism)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Dark mode implemented
- [ ] Toggle works
- [ ] Preference persists
- [ ] All screens look good in dark
- [ ] Contrast verified
- [ ] Merged to main branch
