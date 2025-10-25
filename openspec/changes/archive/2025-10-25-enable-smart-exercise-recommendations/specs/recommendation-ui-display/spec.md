# Spec: Recommendation UI Display

**Capability:** `recommendation-ui-display`
**Status:** Proposed
**Created:** 2025-10-25

---

## ADDED Requirements

### Requirement: Display Recommendations Section on Dashboard

**ID:** REC-UI-001

The system SHALL display a "Recommended Exercises" section on the Dashboard below the muscle heat map.

#### Scenario: Dashboard with recommendations

**Given:**
- User opens Dashboard
- Muscle states loaded successfully
- At least 1 exercise recommended

**When:** Page renders

**Then:**
- "Recommended Exercises" section is visible
- Section appears below muscle heat map
- Section shows recommended exercises grouped by status

---

### Requirement: Group Recommendations by Status

**ID:** REC-UI-002

The system SHALL group and display recommendations in four collapsible sections based on status:

1. **"⭐ Excellent Opportunities"** - Status: excellent, always expanded
2. **"✅ Good Options"** - Status: good, always expanded
3. **"⚠️ Suboptimal (Limiting Factors Detected)"** - Status: suboptimal, collapsed by default
4. **"❌ Not Recommended (Needs Recovery)"** - Status: not-recommended, collapsed by default

#### Scenario: All status groups present

**Given:**
- Recommendations contain exercises with all 4 statuses

**When:** Recommendations render

**Then:**
- 4 sections displayed in order (excellent, good, suboptimal, not-recommended)
- Excellent and good sections expanded by default
- Suboptimal and not-recommended sections collapsed by default
- User can expand/collapse any section

---

#### Scenario: No "excellent" recommendations

**Given:**
- No exercises have status "excellent"
- Some exercises have status "good"

**When:** Recommendations render

**Then:**
- "⭐ Excellent Opportunities" section not displayed
- "✅ Good Options" section displayed first

---

### Requirement: Display Recommendation Cards

**ID:** REC-UI-003

Each recommendation SHALL be displayed as a card containing:

- Exercise name (bold, 16px)
- Status badge (⭐ ✅ ⚠️ ❌ icon)
- Muscle engagement list (primary muscles highlighted)
- Equipment requirement with availability indicator
- Explanation text (italic, gray, 12px)
- "Add to Workout" button (primary action)

#### Scenario: Excellent status card

**Given:**
- Exercise: Pull-ups
- Status: excellent
- Primary muscles: Lats (85%)
- Equipment: Pull-up Bar (available)
- Explanation: "All muscles fully recovered - maximum training potential"

**When:** Card renders

**Then:**
- Exercise name: "Pull-ups"
- Status badge: ⭐ with green background
- Muscles: "Lats 85%, Biceps 30%, Rhomboids 20%"
- Equipment: "✅ Pull-up Bar available"
- Explanation: "All muscles fully recovered..."
- Button: "Add to Workout" (enabled, green)

---

#### Scenario: Suboptimal status card with limiting factor

**Given:**
- Exercise: Dumbbell Pullover
- Status: suboptimal
- Limiting factors: Pecs (85% fatigued)
- Explanation: "Pecs are 85% fatigued and may limit performance"

**When:** Card renders

**Then:**
- Status badge: ⚠️ with yellow background
- Limiting factor highlighted in red: "Pecs 85% ⚠️"
- Explanation shows warning color
- Button: "Add Anyway" (secondary style, gray)

---

### Requirement: Category Filtering

**ID:** REC-UI-004

The system SHALL provide category filter tabs at the top of recommendations section:

- All (default)
- Push
- Pull
- Legs
- Core

#### Scenario: Filter by Pull category

**Given:**
- User viewing "All" recommendations (48 exercises)

**When:** User clicks "Pull" tab

**Then:**
- Only Pull exercises displayed
- "Pull" tab highlighted
- Exercise count updated: "Pull (12)"
- Other categories hidden

---

#### Scenario: No exercises in selected category

**Given:**
- User selects "Core" category
- All Core exercises filtered out by equipment

**When:** Category renders

**Then:**
- Empty state displayed: "No Core exercises available with your equipment"
- Suggestion: "Update your equipment in Profile"

---

### Requirement: Collapsible Sections

**ID:** REC-UI-005

The system SHALL allow users to expand/collapse recommendation groups.

#### Scenario: Expand collapsed section

**Given:**
- "⚠️ Suboptimal" section is collapsed

**When:** User clicks section header

**Then:**
- Section expands with smooth animation
- Chevron icon rotates 180° (down to up)
- Exercise cards revealed
- Section state persists during session

---

### Requirement: Status Badges

**ID:** REC-UI-006

The system SHALL display status badges with consistent visual styling:

| Status | Icon | Background | Text Color |
|--------|------|------------|------------|
| excellent | ⭐ | #10b981 (green) | white |
| good | ✅ | #3b82f6 (blue) | white |
| suboptimal | ⚠️ | #f59e0b (yellow) | black |
| not-recommended | ❌ | #ef4444 (red) | white |

#### Scenario: Status badge rendering

**Given:**
- Recommendation with status "excellent"

**When:** Badge renders

**Then:**
- Icon: ⭐
- Background: #10b981
- Border radius: 4px
- Padding: 4px 8px
- Font size: 14px

---

### Requirement: Muscle Engagement Display

**ID:** REC-UI-007

The system SHALL display muscle engagements with visual emphasis on:
- **Primary muscles** (engagement >= 50%) - Bold text
- **Limiting factors** (fatigue > 66%) - Red text with ⚠️ icon

#### Scenario: Primary muscle highlighting

**Given:**
- Exercise: Bench Press
- Pecs: 85% engagement (primary)
- Triceps: 35% engagement
- Deltoids: 30% engagement

**When:** Muscle list renders

**Then:**
- "**Pecs 85%**, Triceps 35%, Deltoids 30%"
- Pecs displayed in bold

---

#### Scenario: Limiting factor highlighting

**Given:**
- Exercise: Dumbbell Pullover
- Pecs: 65% engagement, 85% fatigued (limiting factor)

**When:** Muscle list renders

**Then:**
- "<span style='color: red'>Pecs 65% ⚠️</span>"
- Red text color
- Warning icon

---

### Requirement: Equipment Availability Indicator

**ID:** REC-UI-008

The system SHALL display equipment requirements with availability status:
- ✅ Available - Green checkmark
- ❌ Not available - Red X (grayed out card)

#### Scenario: Equipment available

**Given:**
- Exercise requires: Dumbbells
- User has: Dumbbells (quantity 2)

**When:** Equipment indicator renders

**Then:**
- "✅ Dumbbells available"
- Green text

---

#### Scenario: Equipment not available

**Given:**
- Exercise requires: Bench
- User does not have Bench

**When:** Equipment indicator renders

**Then:**
- "❌ Bench not available"
- Red text
- Entire card grayed out (opacity 0.5)
- "Add to Workout" button disabled

---

### Requirement: Responsive Design

**ID:** REC-UI-009

The system SHALL display recommendations responsively across screen sizes:

- **Desktop (>768px):** 2 cards per row, grid layout
- **Tablet (768px):** 1 card per row, stacked layout
- **Mobile (<768px):** 1 card per row, full width

#### Scenario: Mobile rendering

**Given:**
- Screen width: 375px (iPhone)

**When:** Recommendations render

**Then:**
- 1 card per row
- Full width cards
- Scrollable list
- Category tabs scrollable horizontally

---

### Requirement: Empty States

**ID:** REC-UI-010

The system SHALL display helpful empty states when no recommendations available:

#### Scenario: All muscles fatigued (no recommendations)

**Given:**
- All exercises have status "not-recommended"
- No "excellent" or "good" recommendations

**When:** Recommendations render

**Then:**
- Empty state displayed: "🛌 Rest Day Recommended"
- Message: "All major muscle groups need recovery. Consider light mobility work, stretching, or a rest day."

---

#### Scenario: No equipment (no exercises available)

**Given:**
- User has no equipment in profile
- All exercises require equipment

**When:** Recommendations render

**Then:**
- Empty state: "⚙️ No Equipment Configured"
- Message: "Update your equipment in Profile to see exercise recommendations"
- Button: "Go to Profile"

---

### Requirement: Loading and Error States

**ID:** REC-UI-011

The system SHALL display appropriate loading and error states:

#### Scenario: Loading muscle states

**Given:**
- GET /api/muscle-states in progress

**When:** Component renders

**Then:**
- Skeleton loader displayed
- Placeholder cards with gray background
- "Loading recommendations..." text

---

#### Scenario: API error

**Given:**
- GET /api/muscle-states fails with 500 error

**When:** Component renders

**Then:**
- Error state displayed: "⚠️ Unable to load recommendations"
- Message: "Muscle data unavailable. Please refresh the page."
- Retry button

---

### Requirement: Accessibility

**ID:** REC-UI-012

The system SHALL meet accessibility standards:

- Status badges have aria-label: "Excellent opportunity", "Good option", etc.
- Collapsible sections use aria-expanded attribute
- Keyboard navigation for "Add to Workout" buttons (tab, enter)
- Focus indicators visible on all interactive elements
- Color contrast ratio >= 4.5:1 for text

#### Scenario: Screen reader support

**Given:**
- User using screen reader

**When:** Recommendations section focused

**Then:**
- Screen reader announces: "Recommended Exercises, 12 excellent opportunities, 8 good options, 5 suboptimal"
- Each card announces exercise name, status, and explanation

---

### Requirement: Animation and Transitions

**ID:** REC-UI-013

The system SHALL use smooth transitions for UI state changes:

- Section expand/collapse: 200ms ease-in-out
- Status badge hover: scale(1.05), 100ms
- Card hover: slight shadow elevation, 150ms
- Tab switch: fade content, 150ms

#### Scenario: Section collapse animation

**Given:**
- "Suboptimal" section is expanded

**When:** User clicks to collapse

**Then:**
- Content height animates from full to 0 over 200ms
- Chevron rotates smoothly
- No layout jump

---

## Implementation Notes

**Component Location:** `components/ExerciseRecommendations.tsx`

**Sub-components:**
- `components/RecommendationCard.tsx`
- `components/CollapsibleSection.tsx`
- `components/CategoryTabs.tsx`

**Styling:** Use Tailwind CSS utility classes for consistency

**State Management:** React useState for local UI state (expanded sections, selected category)

**Dependencies:**
- utils/exerciseRecommendations.ts (algorithm)
- types.ts (ExerciseRecommendation, Exercise, etc.)

---

*These requirements define a user-friendly, accessible, and visually clear recommendation display system that guides users to optimal exercise choices.*
