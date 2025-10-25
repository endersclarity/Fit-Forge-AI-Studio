# Spec: Muscle Category Grouping

**Capability:** `muscle-category-grouping`
**Change:** `enable-muscle-fatigue-heat-map`
**Status:** Proposed

---

## Overview

This capability organizes the 13 tracked muscles into four logical categories (Push, Pull, Legs, Core) with visual headers. This categorization aligns with workout programming principles and helps users quickly identify which muscle groups are ready for their next training session.

---

## ADDED Requirements

### Requirement: Group Muscles by Category

**Description:** System SHALL organize muscles into Push, Pull, Legs, and Core categories.

**Acceptance Criteria:**
- **Push muscles:** Pectoralis, Deltoids, Triceps (3 muscles)
- **Pull muscles:** Lats, Rhomboids, Trapezius, Biceps, Forearms (5 muscles)
- **Legs muscles:** Quadriceps, Hamstrings, Glutes, Calves (4 muscles)
- **Core muscles:** Core (1 muscle)
- Total: 13 muscles across 4 categories
- Categories displayed in order: Push, Pull, Legs, Core

#### Scenario: User views heat map
**Given:** User opens Dashboard
**When:** Muscle heat map loads
**Then:** Muscles are grouped under category headers
**And:** Push section appears first
**And:** Pull section appears second
**And:** Legs section appears third
**And:** Core section appears fourth

#### Scenario: All Push muscles display together
**Given:** User has trained Push exercises 2 days ago
**When:** User views heat map
**Then:** Pectoralis, Deltoids, and Triceps appear consecutively
**And:** All are under "PUSH MUSCLES" header
**And:** No other muscles mixed into Push section

---

### Requirement: Display Category Headers

**Description:** System SHALL display clear visual headers for each muscle category.

**Acceptance Criteria:**
- Header text: "PUSH MUSCLES", "PULL MUSCLES", "LEGS MUSCLES", "CORE"
- Header styling: Uppercase, small font, slate-400 color, bold/semibold
- Header appears above first muscle in category
- Visual spacing between categories for clarity

#### Scenario: User scans heat map quickly
**Given:** User opens Dashboard
**When:** User glances at heat map
**Then:** Category headers are immediately visible
**And:** User can distinguish categories at a glance
**And:** Headers don't blend into muscle rows

---

### Requirement: Maintain Muscle Order Within Categories

**Description:** System SHALL display muscles in logical anatomical order within each category.

**Acceptance Criteria:**
- **Push order:** Pectoralis → Deltoids → Triceps (top to bottom)
- **Pull order:** Lats → Rhomboids → Trapezius → Biceps → Forearms (top to bottom)
- **Legs order:** Quadriceps → Hamstrings → Glutes → Calves (top to bottom)
- **Core order:** Core (single muscle)
- Order is consistent across all page loads

#### Scenario: User views Push muscles
**Given:** User opens heat map
**When:** User looks at Push section
**Then:** Pectoralis appears first
**And:** Deltoids appears second
**And:** Triceps appears third
**And:** Order never changes

---

### Requirement: Visual Separation Between Categories

**Description:** System SHALL provide visual spacing between category sections.

**Acceptance Criteria:**
- Margin or padding between last muscle of one category and next category header
- Clear visual break (not just color change)
- Consistent spacing across all category boundaries
- Responsive design maintains separation on all screen sizes

#### Scenario: User distinguishes Push from Pull
**Given:** User views heat map
**When:** User scrolls from Push section to Pull section
**Then:** Clear visual gap appears between Triceps (last Push) and "PULL MUSCLES" header
**And:** User can easily identify where Push ends and Pull begins

---

## MODIFIED Requirements

### Requirement: Muscle Display Sorting

**Description:** System SHALL change muscle sorting from recovery-based to category-based.

**Before:**
```typescript
// Sorted by recovery percentage (least to most recovered)
muscleData.sort((a, b) => a.recovery - b.recovery)
```

**After:**
```typescript
// Categorized by workout type
const MUSCLE_CATEGORIES = {
  Push: [Muscle.Pectoralis, Muscle.Deltoids, Muscle.Triceps],
  Pull: [Muscle.Lats, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Biceps, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Hamstrings, Muscle.Glutes, Muscle.Calves],
  Core: [Muscle.Core]
};

// Display in category order, not recovery order
```

**Changes:**
- Remove global sorting by recovery percentage
- Apply categorization structure
- Maintain anatomical order within categories

#### Scenario: Lats are most fatigued but still in Pull section
**Given:** Lats are 95% fatigued (most fatigued of all muscles)
**And:** Calves are 10% fatigued (least fatigued)
**When:** User views heat map
**Then:** Lats appear in Pull section (not at top of entire list)
**And:** Calves appear in Legs section (not at bottom of entire list)
**And:** Categories remain organized by workout type

---

## Implementation Notes

**Category Definition:**
```typescript
const MUSCLE_CATEGORIES: Record<string, Muscle[]> = {
  Push: [Muscle.Pectoralis, Muscle.Deltoids, Muscle.Triceps],
  Pull: [Muscle.Lats, Muscle.Rhomboids, Muscle.Trapezius, Muscle.Biceps, Muscle.Forearms],
  Legs: [Muscle.Quadriceps, Muscle.Hamstrings, Muscle.Glutes, Muscle.Calves],
  Core: [Muscle.Core]
};
```

**Category Header Component:**
```tsx
<div className="mb-2 mt-4 first:mt-0">
  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
    {category} Muscles
  </h4>
</div>
```

**Data Transformation:**
```typescript
const categorizedData = Object.entries(MUSCLE_CATEGORIES).map(([category, muscles]) => ({
  category,
  muscles: muscles.map(muscle => {
    const state = muscleStates[muscle];
    // ... compute fatigue, recovery, etc.
    return { muscle, fatiguePercent, ... };
  })
}));
```

**Rendering:**
```tsx
{categorizedData.map(({ category, muscles }) => (
  <div key={category}>
    <CategoryHeader name={category} />
    {muscles.map(muscleData => (
      <MuscleRow key={muscleData.muscle} data={muscleData} />
    ))}
  </div>
))}
```

**Responsive Considerations:**
- Mobile: Single column, full width categories
- Desktop: Potentially side-by-side categories (optional future enhancement)
- Headers always sticky at category top (optional enhancement)

**Performance:**
- Use `useMemo` to categorize muscles once
- Avoid re-categorizing on every render
- Only recalculate when muscle list changes (which is never - always 13 muscles)

**Accessibility:**
- Category headers use semantic `<h4>` tags
- Proper heading hierarchy (h3 for "Muscle Fatigue Heat Map", h4 for categories)
- Screen readers announce category before muscles

---

## Testing Checklist

**Category Structure:**
- [ ] Push section has exactly 3 muscles
- [ ] Pull section has exactly 5 muscles
- [ ] Legs section has exactly 4 muscles
- [ ] Core section has exactly 1 muscle
- [ ] Total muscles displayed: 13

**Visual Presentation:**
- [ ] Category headers are uppercase
- [ ] Headers use slate-400 color
- [ ] Headers are semibold/bold weight
- [ ] Visual spacing between categories

**Order Validation:**
- [ ] Push: Pectoralis, Deltoids, Triceps (in order)
- [ ] Pull: Lats, Rhomboids, Trapezius, Biceps, Forearms (in order)
- [ ] Legs: Quadriceps, Hamstrings, Glutes, Calves (in order)
- [ ] Core: Core

**Edge Cases:**
- [ ] All muscles in one category fatigued (still grouped correctly)
- [ ] Never-trained muscles still appear in correct category
- [ ] Category headers appear even if all muscles in category are 0% fatigue

---

## Design Rationale

**Why These Categories?**
- **Push:** Muscles primarily engaged in pushing movements (bench, overhead press)
- **Pull:** Muscles primarily engaged in pulling movements (rows, pull-ups)
- **Legs:** Lower body muscles (squats, lunges, deadlifts)
- **Core:** Stabilizer muscles (planks, ab work)

**Why This Order?**
- Push/Pull/Legs is a common training split
- Upper body (Push/Pull) before lower body (Legs)
- Core last as it's often worked as accessory

**Anatomical Order Within Categories:**
- **Top to bottom:** Larger muscles to smaller (pecs → delts → triceps)
- **Proximal to distal:** Closer to torso to extremities (lats → biceps → forearms)
- **Anterior to posterior:** Front to back (quads → hams → glutes)

---

*This spec ensures muscles are organized in a logical, workout-programming-aligned structure that helps users quickly identify which muscle groups are ready for their next training session.*
