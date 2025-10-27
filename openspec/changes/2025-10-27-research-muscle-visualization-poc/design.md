# Design: Muscle Visualization POC

**Change ID:** `2025-10-27-research-muscle-visualization-poc`

---

## Overview

This document captures the architectural thinking and design decisions for the muscle visualization proof of concept. Since this is a **research spike**, the design is intentionally exploratory and will be refined based on POC findings.

---

## Problem Context

From user testing feedback, the current FitForge homepage lacks a clear visual focus for answering the primary user question: **"What should I work out today?"**

Muscle fatigue data exists in the database but is not presented in an immediately scannable, visual format. Users want to see their body's recovery state **at a glance** without reading numbers or navigating multiple sections.

---

## Design Principles for POC

### 1. Standalone & Isolated
- POC lives in `/poc/` directory completely separate from main app
- No dependencies on FitForge database or API
- Can be opened directly in browser (`poc/index.html`)
- Uses hardcoded mock data for muscle fatigue percentages

**Rationale:** Isolates technical validation from integration complexity. We can iterate quickly without touching production code.

### 2. Minimal Viable Validation
- Focus on 3-5 major muscle groups (not all 13)
- Simple color-tinting (red/yellow/green)
- Basic interactions (hover tooltip, click detection)
- No production polish, accessibility, or mobile optimization

**Rationale:** Validate core feasibility first. Production features come later if POC succeeds.

### 3. Technology Agnostic
- Start with vanilla HTML/CSS/JS (no framework lock-in)
- Explore multiple technical approaches (SVG, Canvas, WebGL)
- Choose simplest approach that meets requirements
- Document how to translate to React/TypeScript

**Rationale:** Keep options open. Don't commit to React patterns until we know what works.

---

## Technical Approaches Under Exploration

### Option A: SVG-Based Muscle Regions

**Concept:**
- Find or create SVG anatomical diagram with defined `<path>` elements for each muscle
- Dynamically set `fill` attribute based on fatigue percentage
- Use SVG event listeners for hover/click

**Pros:**
- Precise muscle region boundaries
- Easy hover/click detection (paths have built-in hit testing)
- Scalable (resolution-independent)
- CSS-friendly (can use transitions, filters)

**Cons:**
- Requires quality SVG anatomical diagram (may be hard to find)
- Complex SVG paths can be large file size
- Potentially requires manual path creation/editing

**Example Code:**
```html
<svg viewBox="0 0 800 600">
  <path id="pecs" d="M 200 150 ..." fill="#6bcf7f" />
  <path id="lats" d="M 180 200 ..." fill="#ffd93d" />
</svg>
```

```javascript
document.getElementById('pecs').addEventListener('mouseenter', (e) => {
  showTooltip('Pectoralis', 75);
});
```

---

### Option B: Canvas with Image Masks

**Concept:**
- Use photorealistic muscle images (PNG/JPG)
- Draw colored overlays using HTML Canvas 2D context
- Implement custom hit detection for hover/click

**Pros:**
- Works with high-quality raster images
- Good rendering performance
- Full control over visual effects

**Cons:**
- Hit detection requires manual implementation (pixel-based or region mapping)
- Harder to achieve smooth hover transitions
- Requires maintaining coordinate maps for muscle regions

**Example Code:**
```javascript
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0);
  // Draw colored overlay for each muscle region
  ctx.fillStyle = 'rgba(255, 107, 107, 0.6)'; // Red for fatigued muscle
  ctx.fillRect(muscleX, muscleY, muscleWidth, muscleHeight);
};
```

---

### Option C: CSS Overlays on Positioned Images

**Concept:**
- Base anatomical image as background
- Position transparent colored `<div>` elements over each muscle region
- Use CSS for hover effects and color transitions

**Pros:**
- Simplest implementation (pure HTML/CSS)
- Easy hover effects with `:hover` pseudo-class
- No JavaScript library dependencies

**Cons:**
- Requires precise positioning (fragile to image size changes)
- Limited flexibility for complex muscle shapes
- Not truly "coloring the muscle" (just overlaying rectangles)

**Example Code:**
```html
<div class="muscle-viz">
  <img src="anatomy.jpg" />
  <div class="muscle-overlay pecs" style="background: rgba(107, 207, 127, 0.6);"></div>
  <div class="muscle-overlay lats" style="background: rgba(255, 217, 61, 0.6);"></div>
</div>
```

---

### Option D: WebGL/Three.js (3D Model)

**Concept:**
- Load 3D anatomical model (OBJ, GLTF format)
- Apply color materials to mesh regions based on fatigue
- Enable rotation, zoom, camera controls

**Pros:**
- Delivers "dream version" (3D rotatable model)
- Excellent performance for complex visuals
- Future-proof for advanced features

**Cons:**
- Steep learning curve (Three.js, 3D graphics concepts)
- Requires 3D anatomical model (harder to source than 2D images)
- Overkill for 2D MVP
- Larger bundle size

**Note:** This approach is **deferred to future** unless simpler options fail entirely.

---

## Data Model

### Mock Muscle Data Structure

```typescript
interface MuscleState {
  id: string;           // Unique identifier (e.g., 'pecs', 'lats')
  name: string;         // Display name (e.g., 'Pectoralis', 'Latissimus Dorsi')
  fatigue: number;      // Percentage 0-100
  color: string;        // Computed hex color based on fatigue
}

const mockData: MuscleState[] = [
  { id: 'pecs', name: 'Pectoralis', fatigue: 75, color: '#ff6b6b' },
  { id: 'lats', name: 'Latissimus Dorsi', fatigue: 45, color: '#ffd93d' },
  { id: 'quads', name: 'Quadriceps', fatigue: 15, color: '#6bcf7f' },
  { id: 'delts', name: 'Deltoids', fatigue: 60, color: '#ffb74d' },
  { id: 'biceps', name: 'Biceps', fatigue: 30, color: '#a5d6a7' }
];
```

### Color Mapping Function

```javascript
function getFatigueColor(percentage) {
  // 0-33% = Green (fresh)
  if (percentage <= 33) {
    return interpolateColor('#6bcf7f', '#ffd93d', percentage / 33);
  }
  // 33-66% = Yellow (moderate)
  else if (percentage <= 66) {
    return interpolateColor('#ffd93d', '#ff6b6b', (percentage - 33) / 33);
  }
  // 66-100% = Red (fatigued)
  else {
    return interpolateColor('#ff6b6b', '#d32f2f', (percentage - 66) / 34);
  }
}

function interpolateColor(color1, color2, ratio) {
  // Linear interpolation between two hex colors
  // Implementation depends on approach (CSS mix-blend-mode, manual RGB calc, etc.)
}
```

---

## Interaction Design

### Level 1: Glance (No Interaction)
- **User Action:** Opens POC in browser
- **System Response:** Displays muscle diagram with colored regions
- **User Perception:** "My chest is red (fatigued), legs are green (fresh), back is yellow (recovering)"

### Level 2: Hover (Tooltip)
- **User Action:** Hovers mouse over muscle region
- **System Response:**
  - Muscle region highlights slightly (opacity increase or border)
  - Tooltip appears near cursor showing:
    - Muscle name
    - Exact fatigue percentage
- **User Perception:** "Pectoralis - 75% fatigued"

### Level 3: Click (Event Trigger)
- **User Action:** Clicks on muscle region
- **System Response:**
  - Console logs muscle info (POC)
  - In production: Would open detailed panel with exercise recommendations
- **User Perception:** "I can drill down for more details if needed"

---

## Integration Path (Future)

After POC validation, here's how this would integrate into FitForge:

### 1. React Component Structure

```typescript
// components/MuscleVisualization.tsx
interface MuscleVisualizationProps {
  muscleData: MuscleState[];
  onMuscleClick?: (muscleId: string) => void;
  className?: string;
}

export const MuscleVisualization: React.FC<MuscleVisualizationProps> = ({
  muscleData,
  onMuscleClick,
  className
}) => {
  // Render muscle diagram with color-tinting based on chosen approach
  // Handle hover/click interactions
  // Forward click events to parent component
};
```

### 2. Data Fetching

```typescript
// In Dashboard.tsx or App.tsx
const { data: muscleStates, loading } = useAPIState<MuscleState[]>({
  endpoint: '/api/muscle-states',
  method: 'GET',
  autoFetch: true
});

return (
  <MuscleVisualization
    muscleData={muscleStates}
    onMuscleClick={(muscleId) => openMuscleDetailPanel(muscleId)}
  />
);
```

### 3. API Endpoint

Backend already has `GET /api/muscle-states` returning:
```json
[
  {
    "muscle_name": "Pectoralis",
    "fatigue_percentage": 75.5,
    "volume_today": 12500,
    "last_trained": "2025-10-26T10:30:00Z"
  },
  // ... 13 total muscles
]
```

Just need to map `muscle_name` to `id` for visualization:
```typescript
const muscleIdMap = {
  'Pectoralis': 'pecs',
  'Latissimus Dorsi': 'lats',
  // ...
};
```

### 4. Homepage Integration

Current Dashboard.tsx structure:
```typescript
<Dashboard>
  <WelcomeBanner />
  <LastWorkoutContext />  // Existing
  <QuickStartButtons />   // Existing
  <MuscleVisualization /> // NEW - Hero placement
  <RecommendedExercises />
  <Templates />
</Dashboard>
```

Muscle viz becomes the **hero element** (top of page, largest visual focus).

---

## Success Metrics

### POC Validates These Assumptions:
1. ✅ Color-tinting muscles based on data is technically feasible
2. ✅ Visual output is clear and instantly understandable
3. ✅ Hover/click interactions work smoothly
4. ✅ Performance is acceptable (no lag/jank)
5. ✅ Approach can integrate with React/TypeScript without major refactoring

### POC Reveals These Unknowns:
1. ❓ Best technical approach (SVG vs Canvas vs CSS)
2. ❓ How to source/create anatomical imagery
3. ❓ Implementation timeline for full feature
4. ❓ Any unexpected technical challenges

---

## Risk Mitigation

### Risk: Cannot find suitable anatomical imagery
**POC Test:** Try multiple sources in Task 1.2 (open source, AI generation, manual creation)
**Fallback:** Simplified geometric shapes representing muscle groups (less visually appealing but functional)

### Risk: Color-tinting approach doesn't look good
**POC Test:** Build multiple prototypes with different approaches
**Fallback:** Use status bars only (boring but proven)

### Risk: Performance issues
**POC Test:** Profile with browser DevTools, test on slower hardware
**Fallback:** Reduce number of muscle regions, simplify rendering

---

## Future Enhancements (Post-POC)

If POC succeeds, these features become possible:

1. **Animated Transitions:** Muscles smoothly change color as fatigue updates
2. **Historical Overlay:** Show "ghost" of yesterday's fatigue state for comparison
3. **Click → Exercise Recommendations:** Panel with smart exercise suggestions (from brainstorming session)
4. **Mobile Optimization:** Touch-friendly interactions, responsive layout
5. **Accessibility:** ARIA labels, keyboard navigation, high contrast mode
6. **3D Model (Dream Version):** Rotatable anatomy with heat map

---

## Decision Points

After completing POC (Phase 3), we must decide:

**Option 1: Proceed with Full Implementation**
- POC demonstrated feasibility
- User value is clear
- Timeline is acceptable
- Create full OpenSpec proposal with spec deltas

**Option 2: Pivot to Alternative Approach**
- Primary approach had issues
- Try different technical method
- Run another short POC iteration

**Option 3: Defer Feature**
- Technical blockers too significant
- Resource/timeline constraints
- Explore simpler alternatives (status bars, lists)

---

*This design document will be updated based on POC findings and recommendations.*
