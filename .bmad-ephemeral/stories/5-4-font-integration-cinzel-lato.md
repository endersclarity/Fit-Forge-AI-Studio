# Story 5-4: Font Integration (Cinzel + Lato)

## Epic Context
Epic 5: Design System Foundation

## Story Description
Integrate Cinzel (display) and Lato (body) fonts via @fontsource packages with preloading for optimal performance.

## Acceptance Criteria
- [ ] AC1: @fontsource/cinzel and @fontsource/lato installed
- [ ] AC2: Fonts imported in src/index.css
- [ ] AC3: Headings use Cinzel, body text uses Lato
- [ ] AC4: Font preloading configured in index.html
- [ ] AC5: No FOUT/FOIT flash during page load

## Technical Approach
```css
/* src/index.css */
@import '@fontsource/cinzel/400.css';
@import '@fontsource/cinzel/700.css';
@import '@fontsource/lato/400.css';
@import '@fontsource/lato/700.css';

@layer base {
  body {
    font-family: 'Lato', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Cinzel', serif;
  }
}
```

**Reference:** UX Design Section 2 (Typography), PRD Epic 5 Story 1

## Files to Create/Modify
**Modify:**
- `src/index.css` (add font imports and base styles)
- `index.html` (add font preload tags)

## Dependencies
**Depends On:** 5-2 (Design Tokens)
**Blocks:** 5-5 (Storybook needs fonts loaded)

## Estimated Effort
**0.5 day**

## Definition of Done
- [ ] Fonts load correctly
- [ ] Cinzel displays for all headlines
- [ ] Lato displays for body text
- [ ] No FOUT/FOIT observed
- [ ] Merged to main branch
