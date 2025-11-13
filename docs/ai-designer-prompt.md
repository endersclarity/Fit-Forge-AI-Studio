# AI Designer Prompt: FitForge Workout Builder UX Mockup

## Master Prompt

Create a mobile-first workout tracking application interface with the following comprehensive specifications:

### Overall Design Philosophy
Design a modern, clean fitness app interface inspired by Fitbod's UX patterns. The interface should feel premium, tactile, and immediately usable. Prioritize large touch targets (minimum 60px), smooth animations, clear visual hierarchy, and an optimistic, motivating aesthetic. The design emphasizes clarity over complexity, with generous whitespace and a color palette that feels both energetic and professional.

### Layout & Composition

**Canvas Dimensions:**
- Mobile viewport: 375px wide (iPhone standard)
- Full scrollable height with cards stacking vertically
- 16px horizontal padding on main container
- 24px vertical spacing between major sections

**Visual Structure (Top to Bottom):**

1. **Sticky Header Bar** (Always visible at top)
   - White background (#FFFFFF)
   - Subtle shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
   - Height: ~96px
   - Padding: 24px horizontal, 16px vertical
   - Z-index: 30

2. **Exercise Cards Stack** (Scrollable content)
   - Cards have 16px margins between each other
   - Each card is full-width minus container padding
   - Cards appear to float with elevation shadows

3. **Floating Action Button (FAB)** (Fixed bottom-right)
   - Fixed position: 24px from bottom, 24px from right
   - Z-index: 40
   - Appears to hover above all content

4. **Bottom Sheet Drawer** (Slides up from bottom when triggered)
   - Covers 80% of viewport height
   - Starts 24px from top when open
   - Z-index: 50

5. **Rest Timer Banner** (Fixed top, appears when active)
   - Fixed position: 16px from top, 16px from left/right
   - Z-index: 50 (above everything)

### Color Palette (Exact Hex Codes)

**Primary Colors:**
- Primary Blue: #2563EB (rgb(37, 99, 235))
- Primary Blue Hover: #1D4ED8 (rgb(29, 78, 216))
- Primary Blue Light: #3B82F6 (rgb(59, 130, 246))

**Background Colors:**
- Page Background: Linear gradient from #F9FAFB (gray-50) to #EFF6FF (blue-50)
- Card Background: #FFFFFF (white)
- Card Header Background: Linear gradient from #F9FAFB to #FFFFFF
- Expanded Set Background (Blue): #EFF6FF (blue-50)
- Expanded Set Background (Green/Completed): #F0FDF4 (green-50)
- Input Background: #F3F4F6 (gray-100)
- Hover Background: #F9FAFB (gray-50)

**State Colors:**
- Success Green: #10B981 (rgb(16, 185, 129))
- Success Green Border: #10B981
- Success Green Background: #F0FDF4 (green-50)
- Warning Orange: #F97316 (rgb(249, 115, 22))
- Warning Orange Light: #FED7AA (orange-100)

**Border Colors:**
- Default Border: #E5E7EB (gray-200)
- Active Border: #2563EB (blue-500)
- Success Border: #10B981 (green-500)
- Hover Border: #93C5FD (blue-300)

**Text Colors:**
- Primary Text: #111827 (gray-900)
- Secondary Text: #6B7280 (gray-600)
- Tertiary Text: #9CA3AF (gray-500)
- Muted Text: #D1D5DB (gray-400)
- White Text: #FFFFFF
- Blue Text: #2563EB
- Success Text: #059669 (green-700)
- Warning Text: #EA580C (orange-700)

**Shadow Colors:**
- Default Shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
- Elevated Shadow: 0 8px 24px rgba(0, 0, 0, 0.12)
- FAB Shadow: 0 10px 40px rgba(37, 99, 235, 0.4)
- Button Shadow: 0 4px 14px rgba(37, 99, 235, 0.39)
- Rest Timer Shadow: 0 10px 40px rgba(0, 0, 0, 0.15)

### Typography System

**Font Family:**
- System font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
- Fallback: sans-serif

**Font Sizes & Weights:**

- **Extra Large Display (60pt):**
  - Size: 60px / 3.75rem
  - Weight: 700 (bold)
  - Usage: Inline number pickers (weight/reps values)
  - Color: #111827 (gray-900)
  - Features: Tabular numbers for alignment

- **Page Title (48pt):**
  - Size: 48px / 3rem
  - Weight: 700 (bold)
  - Usage: Main page heading ("UX Mockup")
  - Color: #111827 (gray-900)

- **Large Display (48pt):**
  - Size: 48px / 3rem
  - Weight: 700 (bold)
  - Usage: Rest timer countdown
  - Color: #111827 (gray-900)
  - Features: Tabular numbers

- **Section Header (48pt):**
  - Size: 48px / 3rem
  - Weight: 700 (bold)
  - Usage: Drawer titles ("Add Exercise")
  - Color: #111827 (gray-900)

- **Stats Display (36pt):**
  - Size: 36px / 2.25rem
  - Weight: 700 (bold)
  - Usage: Set completion counter (e.g., "3/12")
  - Color: #2563EB (blue-600)

- **Set Number Display (32pt):**
  - Size: 32px / 2rem
  - Weight: 700 (bold)
  - Usage: Weight/reps in set summary
  - Color: #111827 (gray-900)

- **Card Title (30pt):**
  - Size: 30px / 1.875rem
  - Weight: 700 (bold)
  - Usage: Exercise names in cards
  - Color: #111827 (gray-900)

- **Set Counter Badge (32pt):**
  - Size: 32px / 2rem
  - Weight: 700 (bold)
  - Usage: "0/3" in exercise card header
  - Color: #2563EB (blue-600)

- **Large Button Text (18pt):**
  - Size: 18px / 1.125rem
  - Weight: 700 (bold)
  - Usage: Primary action buttons ("Log Set")
  - Color: #FFFFFF (on blue background)

- **Exercise List Item (18pt):**
  - Size: 18px / 1.125rem
  - Weight: 600 (semibold)
  - Usage: Exercise names in picker drawer
  - Color: #111827 (gray-900)

- **Body Text (16pt):**
  - Size: 16px / 1rem
  - Weight: 400 (regular)
  - Usage: Search input placeholder
  - Color: #6B7280 (gray-600)

- **Label Text (14pt):**
  - Size: 14px / 0.875rem
  - Weight: 500 (medium)
  - Usage: Form labels ("Weight", "Reps")
  - Color: #374151 (gray-700)

- **Button Text (14pt):**
  - Size: 14px / 0.875rem
  - Weight: 600 (semibold)
  - Usage: Secondary buttons, category pills
  - Color: Varies by state

- **Badge Text (12pt):**
  - Size: 12px / 0.75rem
  - Weight: 600 (semibold)
  - Usage: Equipment tags, muscle group tags
  - Color: #1D4ED8 (blue-700) on light background

- **Small Label (12pt):**
  - Size: 12px / 0.75rem
  - Weight: 500 (medium)
  - Usage: Unit labels ("LBS", "REPS", "SETS")
  - Transform: uppercase
  - Letter-spacing: 0.05em (tracking-wide)
  - Color: #9CA3AF (gray-500)

- **Tiny Label (10pt):**
  - Size: 10px / 0.625rem
  - Weight: 500 (medium)
  - Usage: "Sets Done" label, "Rest Timer" label
  - Transform: uppercase
  - Letter-spacing: 0.05em (tracking-wide)
  - Color: #9CA3AF (gray-500)

### Component Specifications

---

## 1. STICKY HEADER BAR

**Visual Description:**
A clean, premium header that establishes hierarchy and provides at-a-glance workout progress.

**Dimensions:**
- Width: Full viewport width
- Height: 96px
- Padding: 24px horizontal, 16px vertical
- Background: #FFFFFF (pure white)
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

**Layout:**
Horizontal flexbox with space-between alignment.

**Left Section:**
- Main title: "UX Mockup"
  - Font: 48px, weight 700, color #111827
  - Line height: 1.2
- Subtitle: "Modern Workout Builder Demo"
  - Font: 14px, weight 400, color #6B7280
  - Margin-top: 4px

**Right Section:**
- Large number display: "3/12"
  - Number font: 48px, weight 700, color #2563EB
  - Tabular numbers enabled
- Label below: "SETS DONE"
  - Font: 10px, weight 500, uppercase, letter-spacing 0.05em
  - Color: #9CA3AF

**Positioning:**
- Position: sticky (stays at top when scrolling)
- Top: 0
- Z-index: 30

---

## 2. EXERCISE CARD (Default/Collapsed State)

**Visual Description:**
A pristine white card with subtle elevation, containing an exercise with its sets displayed as interactive buttons.

**Card Container:**
- Background: #FFFFFF
- Border-radius: 16px (rounded-2xl)
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
- Margin-bottom: 16px
- Overflow: hidden

**Card Header Section:**
- Background: Linear gradient from #F9FAFB (left) to #FFFFFF (right)
- Border-bottom: 1px solid #F3F4F6
- Padding: 16px

**Header Layout (Horizontal flex, space-between):**

*Left Content:*
- Exercise name: "Barbell Bench Press"
  - Font: 30px, weight 700, color #111827
  - Line height: 1.3
- Tags row (horizontal flex, gap 8px, margin-top 4px):
  - Equipment badge: "Barbell"
    - Background: #DBEAFE (blue-100)
    - Color: #1D4ED8 (blue-700)
    - Font: 12px, weight 600
    - Padding: 4px 8px
    - Border-radius: 6px
  - Muscle tags: "Chest", "Triceps", "Shoulders"
    - Font: 12px, color #9CA3AF
    - No background
    - Separated by gaps

*Right Content:*
- Sets counter: "3/3"
  - Font: 32px, weight 700, color #2563EB
  - Tabular numbers
- Label: "SETS"
  - Font: 10px, weight 500, uppercase
  - Color: #9CA3AF
  - Letter-spacing: 0.05em

**Card Body Section:**
- Padding: 16px
- Background: #FFFFFF

**Set Buttons (Collapsed - Not Expanded):**
- Each set appears as a button
- Full width
- Padding: 16px
- Border: 2px solid #E5E7EB (gray-200)
- Border-radius: 12px
- Margin-bottom: 12px (between sets)
- Background: #FFFFFF
- Cursor: pointer

**Set Button States:**

*Completed Set (Green):*
- Border: 2px solid #10B981 (green-500)
- Background: #F0FDF4 (green-50)
- Left side: Green circle badge with white checkmark
  - Circle: 32px diameter, #10B981 background
  - Checkmark: white, centered

*Incomplete Set (Gray):*
- Border: 2px solid #E5E7EB (gray-200)
- Background: #FFFFFF
- Left side: Gray circle badge with set number
  - Circle: 32px diameter, #E5E7EB background
  - Number: #374151, 14px, weight 700

**Set Button Content Layout:**
Horizontal flex, items centered, gap 16px

- Badge (circle, 32px)
- Weight value: "185" - 32px, weight 700, #111827
- Unit: "lbs" - 14px, weight 400, #6B7280
- Separator: "×" - 20px, #9CA3AF
- Reps value: "8" - 32px, weight 700, #111827
- Unit: "reps" - 14px, weight 400, #6B7280

---

## 3. EXERCISE CARD (Expanded State with Controls)

**Visual Description:**
When a set is tapped, it expands to reveal large, touch-friendly controls for adjusting weight and reps.

**Expanded Set Container:**
- Border: 2px solid #2563EB (blue-500)
- Background: #EFF6FF (blue-50)
- Border-radius: 12px
- Overflow: hidden
- Animation: Smooth height expansion (spring animation)

**Top Section (Collapsible Header):**
Same layout as collapsed set button, but with:
- Background: #EFF6FF (blue-50)
- Down chevron icon rotates 180° when expanded
- Chevron: 20px, color #9CA3AF

**Expanded Controls Section:**
- Border-top: 1px solid #E5E7EB (gray-200)
- Padding: 16px
- Background: #EFF6FF (blue-50)
- Vertical stack with 24px gaps between elements

**Control Elements (In order):**

### A. Weight Picker

**Label:**
- Text: "Weight"
- Font: 14px, weight 500, color #374151
- Margin-bottom: 12px

**Inline Number Picker Layout:**
Horizontal flex, centered, gap 16px

*Decrement Button:*
- Shape: Circle, 60px diameter
- Background: #E5E7EB (gray-200)
- Active state: #D1D5DB (gray-300)
- Icon: "−" (minus), 36px, color #111827
- Shadow: 0 2px 6px rgba(0, 0, 0, 0.1)
- Disabled opacity: 40%

*Value Display (Center):*
- Large number: "185"
  - Font: 60px, weight 700, color #111827
  - Tabular numbers
- Unit label: "LBS"
  - Font: 12px, weight 500, uppercase
  - Color: #9CA3AF
  - Letter-spacing: 0.05em
  - Margin-top: 4px
- Container width: 140px minimum, centered alignment

*Increment Button:*
- Shape: Circle, 60px diameter
- Background: #2563EB (blue-600)
- Active state: #1D4ED8 (blue-700)
- Icon: "+" (plus), 36px, color #FFFFFF
- Shadow: 0 4px 14px rgba(37, 99, 235, 0.39)
- Disabled opacity: 40%

**Animation:**
- When value changes, number scales up slightly (1.1x) then back to 1.0
- Smooth spring animation, duration ~150ms

### B. Reps Picker

Identical layout to Weight Picker, but:
- Label: "Reps"
- Unit: "REPS"
- Example value: "8"

### C. To Failure Toggle

**Layout:**
Centered horizontally

**Toggle Button:**
- Padding: 8px 16px
- Border-radius: 8px
- Horizontal flex, gap 8px, items centered
- Cursor: pointer

*Unchecked State:*
- Background: #F3F4F6 (gray-100)
- Text color: #374151 (gray-700)
- Checkbox: 20px square, border 2px solid #9CA3AF, no fill

*Checked State:*
- Background: #FED7AA (orange-100)
- Text color: #EA580C (orange-700)
- Checkbox: 20px square, border 2px solid #F97316, fill #F97316
- Checkmark icon: white, 12px

**Label:**
- Text: "To Failure"
- Font: 14px, weight 600

### D. Log Set Button

**Visual Description:**
A prominent, tactile primary action button.

**Dimensions:**
- Width: 100% of container
- Height: 64px (large touch target)
- Border-radius: 12px

**Styling:**
- Background: #2563EB (blue-600)
- Hover: #1D4ED8 (blue-700)
- Active/tap: scale(0.98)
- Shadow: 0 4px 14px rgba(37, 99, 235, 0.39)
- Text: "Log Set"
  - Font: 18px, weight 700, color #FFFFFF
  - Centered

**Interaction:**
- Tap scales down to 98%
- Smooth spring animation
- Haptic feedback on tap (if supported)

---

## 4. LOG ALL REMAINING SETS PROMPT

**Visual Description:**
An intelligent suggestion that appears after completing 2 of 3 sets (or 3 of 4 sets).

**Container:**
- Background: #EFF6FF (blue-50)
- Border: 2px solid #93C5FD (blue-200)
- Border-radius: 12px
- Padding: 16px
- Margin-top: 16px (below last set)
- Animation: Fade in + slide up

**Content:**
- Prompt text: "Same weight/reps for remaining sets?"
  - Font: 14px, weight 400, color #1E3A8A (blue-900)
  - Text-align: center
  - Margin-bottom: 8px

- Action button: "Log All Remaining Sets"
  - Width: 100%
  - Height: 48px
  - Background: #2563EB (blue-600)
  - Hover: #1D4ED8 (blue-700)
  - Border-radius: 8px
  - Font: 14px, weight 600, color #FFFFFF
  - Shadow: 0 2px 8px rgba(37, 99, 235, 0.3)

---

## 5. FLOATING ACTION BUTTON (FAB)

**Visual Description:**
A vibrant blue circular button that floats prominently in the corner, inviting interaction.

**Dimensions:**
- Shape: Perfect circle, 64px diameter
- Position: Fixed
  - Bottom: 24px
  - Right: 24px
- Z-index: 40

**Styling:**
- Background: #2563EB (blue-600)
- Hover: #1D4ED8 (blue-700)
- Shadow: 0 10px 40px rgba(37, 99, 235, 0.4)
- Tap scale: 0.9

**Icon:**
- Plus symbol: "+"
- Size: 32px
- Stroke-width: 2.5px
- Color: #FFFFFF
- Centered in circle

**Animation:**
- Entrance: Scale from 0 to 1 with spring animation
- Delay: 300ms after page load
- Hover: Slight lift (increase shadow)
- Tap: Scale to 0.9

---

## 6. EXERCISE PICKER DRAWER (Bottom Sheet)

**Visual Description:**
A modern bottom sheet drawer that slides up from the bottom, containing a searchable exercise library with category filters.

**Overlay:**
- Background: rgba(0, 0, 0, 0.4)
- Position: Fixed, full viewport
- Z-index: 40

**Drawer Container:**
- Background: #FFFFFF
- Border-radius: 24px 24px 0 0 (rounded top corners only)
- Height: 80vh (80% of viewport height)
- Position: Fixed bottom
- Left: 0, Right: 0
- Z-index: 50
- Shadow: 0 -4px 20px rgba(0, 0, 0, 0.15)

**Animation:**
- Slides up from below viewport
- Spring physics animation
- Duration: ~300ms
- Can be dragged down to dismiss

**Drag Handle:**
- Width: 48px
- Height: 6px
- Border-radius: 3px (fully rounded pill)
- Background: #D1D5DB (gray-300)
- Centered horizontally
- Margin: 12px auto

**Header Section:**
- Padding: 0 24px 16px 24px

*Title:*
- Text: "Add Exercise"
- Font: 48px, weight 700, color #111827
- Margin-bottom: 16px

*Search Bar:*
- Width: 100%
- Height: 48px
- Background: #F3F4F6 (gray-100)
- Border: 2px solid transparent
- Focus border: 2px solid #2563EB
- Border-radius: 12px
- Padding: 12px 16px 12px 44px (left padding for icon)
- Font: 16px, weight 400, color #111827
- Placeholder: "Search exercises...", color #9CA3AF
- Margin-bottom: 16px

*Search Icon:*
- Position: Absolute, left 12px, centered vertically
- Size: 20px
- Color: #9CA3AF
- Magnifying glass icon

*Category Tabs:*
- Horizontal scroll container
- Display: flex, gap 8px
- Margin: -4px (negative to allow shadow space)
- Padding: 4px (inner padding)
- Hide scrollbar visually

**Category Pill Button:**
- Padding: 8px 16px
- Border-radius: 8px
- Font: 14px, weight 600
- White-space: nowrap
- Transition: all 150ms

*Unselected State:*
- Background: #F3F4F6 (gray-100)
- Color: #374151 (gray-700)
- Hover: #E5E7EB (gray-200)

*Selected State:*
- Background: #2563EB (blue-600)
- Color: #FFFFFF
- Shadow: 0 2px 8px rgba(37, 99, 235, 0.3)

**Exercise List:**
- Padding: 0 24px 24px 24px
- Overflow-y: auto (scrollable)
- Flex: 1 (takes remaining height)
- Gap: 8px between items

**Exercise List Item:**
- Width: 100%
- Padding: 16px
- Background: #FFFFFF
- Border: 2px solid #F3F4F6 (gray-100)
- Hover border: 2px solid #93C5FD (blue-300)
- Border-radius: 12px
- Cursor: pointer
- Tap scale: 0.98
- Transition: all 150ms

*Layout:*
Horizontal flex, space-between, items-center

*Left Content:*
- Exercise name: "Barbell Bench Press"
  - Font: 18px, weight 600, color #111827
  - Hover: #2563EB (blue-600)
- Tags row (margin-top 4px, gap 8px):
  - Equipment badge: Same as card (blue-100 background)
  - Muscle tags: First 2 only, 12px, gray-500

*Right Content:*
- Plus icon: 20px, color #9CA3AF
- Hover: #2563EB (blue-600)

**Empty State:**
- Display when no results
- Centered vertically and horizontally
- Icon: Sad face, 32px, in 64px gray-100 circle
- Text: "No exercises found."
- Subtext: "Try a different search or category."
- Font: 16px, color #6B7280

**List Item Animation:**
- Each item staggers in with 20ms delay
- Slide from left (-20px) with fade in
- Spring animation

---

## 7. REST TIMER BANNER

**Visual Description:**
A sleek notification banner that slides down from the top when a set is completed, showing countdown timer with action buttons.

**Container:**
- Position: Fixed
  - Top: 16px
  - Left: 16px
  - Right: 16px
- Z-index: 50 (above everything)
- Background: #FFFFFF
- Border-radius: 16px
- Shadow: 0 10px 40px rgba(0, 0, 0, 0.15)
- Padding: 16px

**Animation:**
- Entrance: Slide down from -100px with spring animation
- Exit: Slide up to -100px
- Smooth opacity fade

**Layout:**
Vertical stack, gap 12px

**Top Row (Horizontal flex, space-between):**

*Left Section:*
- Icon + Timer display (horizontal flex, gap 12px)

*Timer Icon:*
- Circle background: 40px diameter
- Background: #DBEAFE (blue-100)
- Clock icon: 20px, color #2563EB

*Timer Display:*
- Label: "REST TIMER"
  - Font: 10px, weight 500, uppercase
  - Color: #9CA3AF
  - Letter-spacing: 0.05em
- Countdown: "1:30"
  - Font: 48px, weight 700, color #111827
  - Tabular numbers
  - Format: M:SS

*Right Section (Action Buttons):*
Horizontal flex, gap 8px

- "+15s" button:
  - Padding: 8px 16px
  - Background: #F3F4F6 (gray-100)
  - Hover: #E5E7EB (gray-200)
  - Border-radius: 8px
  - Font: 14px, weight 600, color #374151
  - Tap scale: 0.95

- "Skip" button:
  - Padding: 8px 16px
  - Background: #2563EB (blue-600)
  - Hover: #1D4ED8 (blue-700)
  - Border-radius: 8px
  - Font: 14px, weight 600, color #FFFFFF
  - Shadow: 0 2px 8px rgba(37, 99, 235, 0.3)
  - Tap scale: 0.95

**Progress Bar (Bottom):**
- Width: 100%
- Height: 4px
- Background: #E5E7EB (gray-200)
- Border-radius: 2px (fully rounded)
- Overflow: hidden

*Progress Fill:*
- Height: 4px
- Background: #2563EB (blue-600)
- Border-radius: 2px
- Width: Animates from 100% to 0% based on remaining time
- Smooth transition: 300ms

**Countdown Animation:**
- Each second, the number scales up slightly (1.1x) then back
- Smooth spring animation

---

## 8. PAGE BACKGROUND

**Visual Description:**
A subtle, calming gradient that provides depth without distraction.

**Gradient:**
- Type: Linear gradient
- Angle: 135deg (diagonal from top-left to bottom-right)
- Start color: #F9FAFB (gray-50)
- End color: #EFF6FF (blue-50)
- Smooth blend across full viewport

**Properties:**
- Min-height: 100vh (full viewport)
- Padding-bottom: 96px (space for FAB and scrolling)

---

## Visual Design Principles

### Elevation & Shadows
The design uses a 3-tier shadow system:

1. **Base Cards:** 0 4px 12px rgba(0, 0, 0, 0.08)
   - Subtle, just enough to lift from background

2. **Interactive Elements:** 0 4px 14px rgba(37, 99, 235, 0.39)
   - Blue-tinted shadow for primary actions

3. **Floating Elements:** 0 10px 40px with varying alpha
   - Pronounced shadow for FAB and overlays

### Rounded Corners
Consistent border-radius scale:
- Small elements: 6-8px
- Medium elements: 12px
- Large cards: 16px
- Extra large (drawers, modals): 24px
- Circles: 50% (perfect circles)

### Spacing System
Base unit: 4px
- Tight: 4px (0.25rem)
- Small: 8px (0.5rem)
- Medium: 12px (0.75rem)
- Default: 16px (1rem)
- Large: 24px (1.5rem)
- Extra Large: 32px (2rem)

### Touch Targets
All interactive elements minimum 44x44px (iOS guideline), with most primary actions 60x60px or larger.

### Color Usage Guidelines
- **Blue (#2563EB):** Primary actions, progress indicators, active states
- **Green (#10B981):** Completion, success states
- **Orange (#F97316):** Special states (to failure), warnings
- **Gray scale:** Hierarchy, disabled states, borders

### Typography Hierarchy
7 distinct levels:
1. Extra Large Display (60px) - Data that demands focus
2. Page Titles (48px) - Page-level hierarchy
3. Display Numbers (36px) - Important stats
4. Large Text (32px) - Set values
5. Headlines (30px) - Section titles
6. Body Text (16-18px) - Primary content
7. Small Text (12-14px) - Labels, metadata, secondary info

### Animation Principles
- **Spring physics:** Natural, organic feel (stiffness: 300, damping: 30)
- **Scale feedback:** Buttons scale to 0.95-0.98 on tap
- **Smooth transitions:** 150-300ms for most state changes
- **Staggered animations:** 20ms delay between list items
- **Micro-interactions:** Number values scale briefly when changing

### State Indicators
- **Default:** Gray borders, white background
- **Active/Focus:** Blue border, blue-tinted background
- **Completed:** Green border, green-tinted background
- **Hover:** Subtle background change, border color shift
- **Disabled:** 40% opacity, no pointer events

---

## Example Prompts for Specific Views

### Prompt 1: Initial Workout View (Collapsed Cards)

Create a mobile fitness app screenshot showing a workout in progress. The screen has a white header at the top with "UX Mockup" as the title and "3/12 SETS DONE" in large blue numbers on the right. Below, on a subtle gradient background (light gray to pale blue), show 4 white exercise cards stacked vertically. Each card has rounded corners and a soft shadow.

The first card "Barbell Bench Press" shows 3 completed sets with green backgrounds and checkmarks. The second card "Barbell Squat" shows 0/3 sets with gray uncompleted set buttons. Each set button displays the weight and reps (e.g., "185 lbs × 8 reps"). In the bottom-right corner, show a circular blue floating action button with a white plus icon, casting a blue-tinted shadow.

Use the color palette: primary blue #2563EB, success green #10B981, gray borders #E5E7EB, white cards on gradient background. Typography: Bold 48px titles, 32px for numbers, 14-16px for body text. All elements should have modern rounded corners (12-16px radius) and feel tactile and inviting.

### Prompt 2: Expanded Set with Controls

Create a mobile fitness app screenshot focusing on a single expanded exercise set. Show a large white card with "Barbell Squat" at the top. The first set is expanded with a blue border and light blue background, revealing interactive controls.

The set displays large inline number pickers for weight and reps. Each picker has a minus button (gray circle, 60px) on the left, a huge number in the center (60px bold, "185" for weight, "8" for reps), and a plus button (blue circle, 60px) on the right. The blue plus button has a glowing blue shadow. Below the numbers show small gray labels "LBS" and "REPS".

Include a "To Failure" checkbox toggle (unchecked, gray) and a prominent blue "Log Set" button at the bottom (full-width, rounded, with blue shadow). The controls should feel large and touch-friendly with generous spacing (24px gaps).

### Prompt 3: Exercise Picker Drawer

Create a mobile fitness app screenshot showing a bottom sheet drawer covering 80% of the screen. The drawer has a white background with rounded top corners (24px radius) and a small gray drag handle at the very top.

The drawer header shows "Add Exercise" in large bold text (48px), followed by a search bar with rounded corners (12px) and a gray background, with a magnifying glass icon on the left. Below are horizontal scrolling category pills: "All" (selected, blue background), "Push", "Pull", "Legs", "Core", "Full Body" (unselected, gray).

The main area shows a scrollable list of exercise items. Each item is a rounded rectangle (12px radius) with a light gray border, containing the exercise name ("Barbell Bench Press" in 18px semibold), equipment badge ("Barbell" in blue pill), muscle tags ("Chest", "Triceps" in small gray text), and a plus icon on the right. Items should have slight spacing between them (8px).

### Prompt 4: Rest Timer Active

Create a mobile fitness app screenshot with a rest timer banner at the top. The banner is a white rounded rectangle (16px radius) positioned 16px from the screen edges, floating above the content with a strong shadow.

Inside the banner (left to right): A circular blue icon (clock symbol), the label "REST TIMER" in small gray uppercase text above a large countdown "1:30" in bold 48px black numbers. On the right side, two buttons: "+15s" (gray, rounded) and "Skip" (blue, rounded). Below all content, show a thin progress bar (4px height) with blue fill at 75% width.

The banner should appear to float above the exercise cards below with dramatic shadow: 0 10px 40px rgba(0, 0, 0, 0.15).

---

## Technical Notes for AI Image Generation

### For Midjourney:
- Use `--ar 9:16` for mobile portrait aspect ratio
- Add `--style raw` for more literal interpretation
- Use `--v 6` or newer for best UI design results
- Example suffix: `modern mobile fitness app UI, clean interface design, realistic mockup, high fidelity --ar 9:16 --style raw --v 6`

### For DALL-E:
- Request "high-fidelity mobile app mockup"
- Emphasize "modern UI design" and "clean interface"
- Specify "flat design with subtle shadows and gradients"
- Request "crisp typography" and "professional fitness app aesthetic"

### For Stable Diffusion:
- Use prompts like "UI design, mobile app mockup, modern fitness interface"
- Negative prompt: "3D, perspective distortion, unrealistic colors, blur"
- Recommended samplers: DPM++ 2M Karras or Euler A
- CFG Scale: 7-9 for UI design work

### Common Settings:
- Resolution: 1080×1920 (mobile portrait) or 750×1334 (scaled)
- Quality/Details: Maximum available
- Style: Flat design, modern UI, minimalist
- Avoid: Skeuomorphism, excessive gradients, dated design patterns

---

## Color Reference Chart

```
PRIMARY BLUES:
#2563EB - Blue 600 (Primary)
#1D4ED8 - Blue 700 (Hover)
#3B82F6 - Blue 500 (Light)
#DBEAFE - Blue 100 (Badge BG)
#EFF6FF - Blue 50 (Tinted BG)

GRAYS:
#111827 - Gray 900 (Primary Text)
#374151 - Gray 700 (Secondary Text)
#6B7280 - Gray 600 (Tertiary Text)
#9CA3AF - Gray 500 (Muted Text)
#D1D5DB - Gray 300 (Borders)
#E5E7EB - Gray 200 (Light Borders)
#F3F4F6 - Gray 100 (Input BG)
#F9FAFB - Gray 50 (Light BG)

SUCCESS GREENS:
#10B981 - Green 500 (Success)
#059669 - Green 700 (Success Text)
#F0FDF4 - Green 50 (Success BG)

WARNING ORANGES:
#F97316 - Orange 500 (Warning)
#EA580C - Orange 700 (Warning Text)
#FED7AA - Orange 100 (Warning BG)

PURE:
#FFFFFF - White
#000000 - Black (only in rgba for shadows)
```

---

## Implementation Notes

This design was built using:
- **Framework:** React with TypeScript
- **Animation:** Framer Motion (spring physics, stagger animations)
- **UI Library:** Tailwind CSS (utility-first)
- **Drawer:** Vaul (bottom sheet drawer component)
- **Icons:** Heroicons / Custom SVG

Key UX patterns implemented:
1. **Optimistic UI:** Instant visual feedback before API calls
2. **Haptic Feedback:** Vibration on interactions (mobile)
3. **Smart Suggestions:** "Log all remaining" appears contextually
4. **Auto-start Timer:** Rest timer begins immediately after logging set
5. **Inline Editing:** Edit sets in place without navigation
6. **Touch-optimized:** 60px touch targets, swipe-to-dismiss drawer
7. **Progressive Disclosure:** Controls revealed only when needed

---

## Design Inspiration

This mockup synthesizes patterns from:
- **Fitbod:** Inline number pickers, set progression visualization
- **Strong:** Clean card layout, completion badges
- **Apple Fitness:** Modern typography, subtle gradients
- **Material Design 3:** Elevation system, rounded corners
- **iOS Human Interface Guidelines:** Touch targets, haptic feedback

The result is a best-in-class workout tracking interface that feels immediately familiar yet distinctly modern.

---

## Conclusion

This prompt provides pixel-perfect specifications for recreating the FitForge Workout Builder UX mockup. Every color, font size, spacing value, shadow, and interaction has been documented to enable accurate reproduction by AI image generation tools.

For questions or clarifications, refer to the source code at:
`components/ux-mockup/`
