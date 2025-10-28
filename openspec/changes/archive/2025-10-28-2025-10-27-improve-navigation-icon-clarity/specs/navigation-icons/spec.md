# Spec: Navigation Icons

**Capability:** `navigation-icons`
**Change Type:** ADDED
**Change ID:** `improve-navigation-icon-clarity`

---

## ADDED Requirements

### Requirement: Visual Distinction

**ID:** `NAV-001`
**Priority:** High

All navigation icons MUST be visually distinct from each other to prevent user confusion.

#### Scenario: Comparing all navigation icons

**Given** all navigation icons are rendered
**When** a user scans the navigation bar
**Then** NO two icons MUST share similar shapes or silhouettes
**And** each icon MUST be immediately distinguishable from others
**And** icons MUST use different primary visual elements (e.g., house vs bicep vs clipboard)

#### Scenario: Duplicate chart icons removed

**Given** the navigation contains multiple chart-like icons
**When** icons are updated
**Then** only ONE chart/analytics icon MUST exist
**And** all other icons MUST use different visual metaphors
**And** no icon MUST resemble a bar chart unless it represents analytics

---

### Requirement: Semantic Clarity

**ID:** `NAV-002`
**Priority:** High

Each navigation icon MUST semantically suggest its destination or function.

#### Scenario: Icon meaning without labels

**Given** a user sees a navigation icon for the first time
**When** they view the icon without clicking
**Then** the icon shape MUST suggest its purpose
**And** common icon conventions MUST be followed (house=home, trophy=achievements, etc.)

**Examples:**
- Dashboard/Home → 🏠 House icon
- Workout Logger → 💪 Bicep or ✍️ Pencil+list icon
- Templates → 📋 Clipboard icon
- Analytics/Stats → 📊 Bar chart icon
- Personal Bests → 🏆 Trophy icon
- Profile → 👤 Person icon (already clear)

---

### Requirement: Tooltip Support

**ID:** `NAV-003`
**Priority:** High

Every navigation icon MUST display a tooltip on hover showing its destination name.

#### Scenario: Hovering over icon

**Given** a user hovers over any navigation icon
**When** the cursor remains on the icon for >300ms
**Then** a tooltip MUST appear
**And** the tooltip MUST display the destination name (e.g., "Dashboard", "Workout Logger")
**And** the tooltip MUST be positioned near the icon without obscuring it
**And** the tooltip MUST disappear when hover ends

#### Scenario: Touch devices

**Given** a user on a touch device
**When** they long-press a navigation icon (>500ms)
**Then** a tooltip or label MUST appear briefly
**Or** text labels MUST be visible by default on touch devices

---

### Requirement: Accessibility Compliance

**ID:** `NAV-004`
**Priority:** High

Navigation icons MUST meet WCAG 2.1 Level AA accessibility standards.

#### Scenario: Screen reader compatibility

**Given** a user with a screen reader
**When** they navigate to an icon
**Then** an ARIA label MUST be announced
**And** the ARIA label MUST match the tooltip text
**And** the ARIA label MUST clearly describe the destination

**Example:**
```html
<button aria-label="Dashboard">
  <HomeIcon />
</button>
```

#### Scenario: Keyboard navigation

**Given** a user navigating with keyboard
**When** they press Tab key
**Then** focus MUST move to each navigation icon in order
**And** a visible focus indicator MUST appear
**And** pressing Enter MUST activate the selected icon

#### Scenario: Touch target size

**Given** navigation icons on any device
**When** rendered
**Then** each icon's clickable area MUST be at least 44x44 pixels
**And** adequate spacing MUST exist between icons (min 8px)
**And** touch targets MUST not overlap

---

### Requirement: Icon Consistency

**ID:** `NAV-005`
**Priority:** Medium

All navigation icons MUST use consistent styling.

#### Scenario: Visual consistency

**Given** all navigation icons
**When** rendered
**Then** all icons MUST use the same stroke width
**And** all icons MUST use the same size (24x24px or 32x32px)
**And** all icons MUST use the same color scheme
**And** hover states MUST be consistent across all icons

---

## Cross-References

- **Related Capabilities:**
  - `navigation-accessibility` (added in this change)
  - `homepage-layout` (modified in streamline-homepage proposal)

- **Related Changes:**
  - Future: Add back button to navigation (user requested)
  - Future: Mobile navigation drawer (if needed)

---

## Notes

Addresses user feedback: "Top navigation icons are confusing - two look identical (both appear like bar charts). Only the profile icon is clear about what it does."

Solution: Replace duplicate/confusing icons with semantically distinct alternatives and add tooltips for clarity.
