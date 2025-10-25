# Proposal: Enable Template-Based Workout Selection

**Change ID:** `enable-template-based-workouts`

**Status:** Proposed

**Date:** 2025-10-24

**Priority:** High (Core UX Feature)

---

## 📋 Summary

Enable users to select pre-configured workout templates from the home page and a dedicated templates browsing page. When a template is selected, the workout setup screen pre-populates with the template's exercises, allowing users to customize weights, reps, sets, and exercise selection before starting the workout.

---

## 🎯 User Goals

1. **Quick Start:** Users can rapidly begin a workout by selecting a pre-configured template instead of manually selecting each exercise
2. **Customization:** Users can modify template exercises (add, remove, change) and pre-configure weights and reps for future consistency
3. **Discovery:** Users can browse all available templates in a dedicated UI to understand their options
4. **Efficiency:** Reduce friction in the common case of "I want to do Push Day A again"

---

## 🚀 Key Features

### 1. **Dashboard Shortcuts**
- Display 4 most-used/favorite templates as quick-start cards on the dashboard
- Show template name, variation (A/B), exercise count, and equipment needed
- Clicking a card initiates the workout with that template

### 2. **Dedicated Templates Page**
- Browse all 8 templates organized by category (Push, Pull, Legs, Core)
- Split-view UI:
  - Left: Template list with filters
  - Right: Selected template details (exercises, equipment, description)
- Click to select and start a workout with that template

### 3. **Template-Powered Workout Setup**
- When a template is selected, the Workout setup screen pre-populates with:
  - Workout type (Push/Pull/Legs/Core)
  - Workout variation (A or B)
  - All exercises from the template with default sets/reps/weight
- Users can:
  - Add new exercises (beyond template)
  - Remove exercises from the template
  - Change exercises
  - Pre-configure weight, reps, and sets
  - Modify variation if needed

### 4. **Navigation Integration**
- Add "Templates" tab/link to main navigation
- Dashboard includes "Quick Start" section with template shortcuts

---

## 📊 User Journeys

### Journey 1: Quick Start from Dashboard
```
Dashboard (home)
  → See "Quick Start Workouts" section
  → Tap "Push Day A" card
  → Workout setup screen loads with Push Day A exercises pre-filled
  → Start workout OR customize exercises first
  → Begin tracking
```

### Journey 2: Browse and Select from Templates Page
```
Dashboard (home)
  → Tap "Templates" in navigation
  → View all templates grouped by category
  → Tap "Pull Day B" in list
  → Right panel shows exercises and equipment
  → Tap "Start Workout" button
  → Workout setup screen loads with Pull Day B pre-filled
  → Begin workout
```

### Journey 3: Customize Template Before Starting
```
(After selecting template - at Workout setup screen)
  → Template exercises are pre-filled
  → User wants to add "Preacher Curls" not in template
  → Tap "Add Exercise" button
  → Select "Preacher Curls"
  → Now template has 7 exercises
  → User sets weight: 30 lbs, reps: 8, sets: 3
  → Tap "Start Workout"
  → Begin tracking with custom configuration
```

---

## 🔗 Dependencies & Relationships

- **Depends on:** Backend templates API (✅ already exists)
- **Depends on:** Exercise library and muscle engagement data (✅ already exists)
- **Related to:** Personal Bests (shows PR info during workout)
- **Related to:** Dashboard (displays quick-start cards)
- **Related to:** Main navigation (Templates tab added)

---

## ✅ Definition of Done

- [ ] Dashboard displays 4 quick-start template cards
- [ ] Clicking a template card pre-populates workout with that template
- [ ] Dedicated Templates page exists with split-view UI
- [ ] Selecting a template from Templates page starts workout with pre-filled exercises
- [ ] Workout setup screen allows adding/removing/changing exercises from template
- [ ] Users can pre-configure weight, reps, and sets before starting
- [ ] Navigation includes Templates link
- [ ] UI works on mobile and desktop
- [ ] No regressions in existing workout flow
- [ ] TypeScript strict mode maintained

---

## 🎨 UI Specifications

### Dashboard Quick Start Section
```
┌─────────────────────────────────┐
│ QUICK START WORKOUTS            │
├─────────────────────────────────┤
│                                 │
│ [Push Day A]  [Pull Day A]      │
│  6 exercises  6 exercises       │
│  ⭐ Favorite   Dumbbells        │
│                                 │
│ [Legs Day A]  [Core Day A]      │
│  4 exercises  3 exercises       │
│  Kettlebell   Bodyweight        │
│                                 │
│ [View All Templates →]          │
└─────────────────────────────────┘
```

### Templates Page - Split View
```
┌──────────────────┬───────────────────────┐
│ TEMPLATES        │ SELECTED TEMPLATE     │
│                  │                       │
│ Push             │ Push Day A (Var. A)   │
│  ✓ Push Day A    │ ⭐ Favorite           │
│  • Push Day B    │                       │
│                  │ Exercises (6):        │
│ Pull             │ • Dumbbell Bench      │
│  • Pull Day A    │ • Tricep Extension    │
│  • Pull Day B    │ • Single Arm Bench    │
│                  │ • Shoulder Press      │
│ Legs             │ • Kettlebell Press    │
│  • Legs Day A    │ • TRX Pushup          │
│  • Legs Day B    │                       │
│                  │ Equipment:            │
│ Core             │ • Dumbbells           │
│  • Core Day A    │ • Kettlebell          │
│  • Core Day B    │ • TRX                 │
│                  │                       │
│                  │ [Start Workout →]    │
└──────────────────┴───────────────────────┘
```

### Workout Setup with Template
```
┌──────────────────────────────────┐
│ New Workout (from Push Day A)     │
│                                  │
│ Workout Type: Push               │
│ Variation: A                      │
│                                  │
│ EXERCISES (from template):       │
│ □ Dumbbell Bench                 │
│   - Sets: 3  Reps: 8  Weight: 50 │
│ □ Tricep Extension               │
│   - Sets: 3  Reps: 8  Weight: 20 │
│ □ Single Arm Bench               │
│   - Sets: 3  Reps: 8  Weight: 30 │
│ □ Shoulder Press                 │
│   - Sets: 3  Reps: 8  Weight: 35 │
│ □ Kettlebell Press               │
│   - Sets: 3  Reps: 6  Weight: 40 │
│ □ TRX Pushup                     │
│   - Sets: 3  Reps: 12 Weight: BW │
│                                  │
│ [+ Add Exercise] [Start ▶]       │
└──────────────────────────────────┘
```

---

## 🔐 Non-Goals (Out of Scope)

- ❌ Saving custom user workout templates (for now)
- ❌ Auto-loading last workout (separate feature)
- ❌ Sharing templates with other users
- ❌ Template editing/creation UI (API exists, no UI needed)
- ❌ Template versioning
- ❌ Equipment filtering on templates page

---

## 📈 Success Metrics

- Users can start a template-based workout in < 3 taps
- 80%+ of users use templates instead of manual exercise selection
- Average workout setup time decreases
- Template usage counter increases with each completed workout

---

## 🚨 Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Workout setup screen becomes cluttered | Split into sections, use collapsible panels |
| Users confused by "from template" vs "from scratch" | Clear labeling, visual distinction in UI |
| Template exercises don't match user's equipment | Show equipment on template cards, users can add/remove |
| Weight/rep defaults don't match user level | Pre-fill with sensible defaults, users override |

---

## 📝 Notes

- All 8 templates are already seeded in the database
- Exercise library (48 exercises) is complete with muscle engagement data
- Personal Bests API exists to show PR info during customization
- No new database schema changes needed

---

**Next Step:** Review this proposal and approve, then proceed with `design.md` and `tasks.md` creation.
