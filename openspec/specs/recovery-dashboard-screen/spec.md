# recovery-dashboard-screen Specification

## Purpose
TBD - created by archiving change 2025-10-25-implement-recovery-dashboard-components. Update Purpose after archive.
## Requirements
### Requirement: Display Muscle Recovery Heat Map

**Description:** Dashboard SHALL display all 13 muscle groups organized into 4 collapsible categories with color-coded fatigue visualization.

**Acceptance Criteria:**
- 13 muscles displayed (Pectoralis, Deltoids, Triceps, Biceps, Lats, Rhomboids, Trapezius, Forearms, Core, Quads, Hamstrings, Glutes, Calves)
- Grouped into PUSH (3), PULL (5), LEGS (4), CORE (1) categories
- Each muscle shows fatigue percentage and color-coded progress bar
- Green (0-33%), Amber (34-66%), Red (67-100%) color coding
- Last trained date displayed in human-readable format
- Categories are collapsible with smooth animations
- Minimum 44×44px touch targets for accessibility

#### Scenario: User opens dashboard with mixed muscle states

**Given:** User has the following muscle states:
- Latissimus Dorsi: 25% fatigue (last trained 3 days ago)
- Pectoralis Major: 85% fatigue (last trained yesterday)
- Quadriceps: 45% fatigue (last trained 2 days ago)
- Abdominals: 15% fatigue (last trained 4 days ago)

**When:** Dashboard loads

**Then:** Heat map displays with 4 categories
**And:** PULL category contains Lats with 25% and green progress bar
**And:** PUSH category contains Pectoralis with 85% and red progress bar
**And:** LEGS category contains Quads with 45% and amber progress bar
**And:** CORE category contains Abdominals with 15% and green progress bar
**And:** Each shows "X days ago" relative timestamp

#### Scenario: User expands collapsible muscle category

**Given:** Dashboard is loaded with PULL category collapsed
**When:** User taps "PULL (5)" header
**Then:** Category expands with smooth animation (500ms duration)
**And:** 5 muscle cards become visible
**And:** Chevron icon rotates 180 degrees
**And:** Animation respects `prefers-reduced-motion` setting

---

### Requirement: Show Smart Exercise Recommendations

**Description:** Dashboard SHALL display personalized exercise recommendations with status badges indicating workout quality based on muscle recovery states.

**Acceptance Criteria:**
- Recommendations fetched from `/api/recommendations` endpoint
- Each recommendation shows exercise name, status badge, muscle engagement, last performance, and progressive overload suggestion
- Status badges: EXCELLENT (green + check icon), GOOD (blue + thumb icon), SUBOPTIMAL (amber + warning icon)
- Muscle engagement displayed as pills with fatigue-based color coding
- Progressive overload chip shows +3% suggestion
- Category filtering tabs (All/Push/Pull/Legs/Core)
- Equipment icon displayed for each exercise
- SUBOPTIMAL exercises include explanation text

#### Scenario: User views EXCELLENT exercise recommendation

**Given:** Pull-ups has status EXCELLENT with:
- Muscle engagement: Lats 85% (25% fatigued), Biceps 30% (30% fatigued)
- Last performance: 30 reps @ 200lbs
- Progressive overload: +3% reps = 31 reps
- Equipment: Pull-up Bar

**When:** Recommendation card renders

**Then:** Shows "Pull-ups" as exercise name
**And:** Displays green EXCELLENT badge with check_circle icon
**And:** Shows muscle pills: "Lats 85%" with green background, "Biceps 30%" with green background
**And:** Displays "Last: 30 reps @ 200lbs"
**And:** Shows blue chip "↗ +3% reps: 31"
**And:** Shows pull-up bar icon with "Pull-up Bar" label

#### Scenario: User views SUBOPTIMAL exercise recommendation

**Given:** Bench Press has status SUBOPTIMAL with:
- Muscle engagement: Pectoralis 85% (85% fatigued)
- Explanation: "Pectoralis Major highly fatigued (85%). Consider rest or alternative exercises."

**When:** Recommendation card renders

**Then:** Shows "Bench Press" as exercise name
**And:** Displays amber SUBOPTIMAL badge with warning icon
**And:** Shows muscle pill: "Pectoralis 85%" with red background
**And:** Displays explanation text below exercise name
**And:** Text color is amber to match badge

#### Scenario: User filters recommendations by category

**Given:** Dashboard shows 15 total recommendations across all categories
**When:** User taps "Pull" category tab
**Then:** Only Pull exercises are displayed
**And:** Tab has active visual state (underline or background)
**And:** Other tabs remain tappable
**And:** Count updates: "Pull (5)" if 5 Pull exercises shown

---

### Requirement: Provide Instant Workout Guidance

**Description:** Dashboard SHALL display hero section with recommended workout type and last workout context to enable instant decision-making.

**Acceptance Criteria:**
- Hero shows recommended workout category (e.g., "Ready for: PULL DAY B")
- Last workout context displayed (e.g., "Last workout: Pull Day A (3 days ago)")
- Recommendation based on muscle recovery and A/B variation pattern
- Large, prominent text (32px heading)
- Positioned at top of dashboard for immediate visibility

#### Scenario: User sees recommended workout

**Given:** User's muscle states indicate:
- PULL muscles are recovered (average 25% fatigue)
- Last workout was "Pull Day A" 3 days ago
- A/B variation suggests "Pull Day B" next

**When:** Dashboard loads

**Then:** Hero section displays "Ready for: PULL DAY B"
**And:** Subtext shows "Last workout: Pull Day A (3 days ago)"
**And:** Text is bold and prominent
**And:** Green or blue accent color indicates readiness

#### Scenario: User should rest (all muscles fatigued)

**Given:** All muscle groups are >70% fatigued
**When:** Dashboard loads
**Then:** Hero section displays "Rest Day Recommended"
**And:** Explanation: "All muscle groups need recovery. Consider light cardio or rest."
**And:** Text is amber or red to indicate caution

---

### Requirement: Enable Keyboard Navigation

**Description:** Dashboard SHALL be fully navigable via keyboard for accessibility compliance (WCAG AAA).

**Acceptance Criteria:**
- All interactive elements reachable via Tab key
- Tab order: Settings → Muscle categories → Muscle cards → Recommendation tabs → Recommendation cards → FAB → Bottom nav
- Enter or Space activates focused element
- ESC closes modals
- Focus indicators visible (2px primary color ring with 2px offset)
- Skip links available ("Skip to main content")
- No keyboard traps

#### Scenario: User navigates with keyboard

**Given:** Dashboard is loaded and focused
**When:** User presses Tab key
**Then:** Focus moves to Settings button (top right)
**When:** User presses Tab again
**Then:** Focus moves to first muscle category header (PUSH)
**When:** User presses Enter on PUSH header
**Then:** Category expands/collapses
**When:** User presses Tab while PUSH is expanded
**Then:** Focus moves to first muscle card in PUSH
**When:** User continues tabbing
**Then:** Focus moves through all muscle cards, then to next category
**And:** Visual focus ring is clearly visible on all elements
**And:** Focus ring respects `prefers-reduced-motion`

---

### Requirement: Support Screen Readers

**Description:** Dashboard SHALL provide complete screen reader support with proper ARIA labels, roles, and semantic HTML.

**Acceptance Criteria:**
- Semantic HTML tags used (main, header, nav, section, aside, article)
- All interactive elements have ARIA labels
- Icon-only buttons labeled (e.g., "Settings", "Expand category")
- Progress bars have role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax
- Dynamic content updates announced via aria-live regions
- Landmark roles defined for navigation
- Heading hierarchy correct (H1 → H2 → H3 → H4)

#### Scenario: Screen reader user navigates dashboard

**Given:** User has NVDA/JAWS screen reader active
**When:** Dashboard loads
**Then:** Screen reader announces "Recovery Dashboard, main region"
**When:** User navigates to muscle card
**Then:** Screen reader announces "Latissimus Dorsi, 25 percent fatigued, ready to train, last trained 3 days ago, button"
**When:** User navigates to progress bar
**Then:** Screen reader announces "Progress bar, 25 percent, ready to train"
**When:** User navigates to recommendation card
**Then:** Screen reader announces "Pull-ups, excellent, recommended exercise, last performed 30 reps at 200 pounds"
**When:** Muscle state updates
**Then:** Aria-live region announces "Latissimus Dorsi updated to 30 percent fatigue"

---

### Requirement: Load Dashboard Performantly

**Description:** Dashboard SHALL load and render within 1 second on average network conditions.

**Acceptance Criteria:**
- Initial render < 500ms (skeleton screen)
- API data loads < 1 second total
- Smooth 60fps animations
- No layout shifts during load (CLS < 0.1)
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Lighthouse Performance score ≥ 90

#### Scenario: User on average 4G connection

**Given:** User opens app on 4G connection (typical ~10Mbps)
**When:** Dashboard loads
**Then:** Skeleton screen appears within 500ms
**And:** Muscle heat map data populates within 1 second
**And:** Recommendations appear within 1.5 seconds
**And:** No jank or stuttering during scroll
**And:** Animations run at 60fps
**And:** Total load time < 2 seconds

#### Scenario: User on slow 3G connection

**Given:** User opens app on slow 3G connection (~1Mbps)
**When:** Dashboard loads
**Then:** Skeleton screen appears within 500ms
**And:** Progressive loading: heat map → recommendations → complete
**And:** Offline banner shown if network fails
**And:** Cached data displayed immediately if available
**And:** Retry mechanism for failed requests

---

### Requirement: Work Offline with Cached Data

**Description:** Dashboard SHALL display cached muscle states and recommendations when offline, with clear indication of offline mode.

**Acceptance Criteria:**
- Service worker caches API responses
- Cached data displayed when network unavailable
- Offline banner shown at top of screen
- "Last updated: X minutes ago" timestamp displayed
- Pull-to-refresh attempts to fetch fresh data
- Graceful degradation (no crashes, no broken UI)

#### Scenario: User goes offline after loading dashboard

**Given:** User has loaded dashboard successfully online
**And:** Muscle states and recommendations are cached
**When:** User goes offline (airplane mode)
**And:** User refreshes the app
**Then:** Dashboard loads from cache
**And:** Offline banner displays: "Offline - showing cached data"
**And:** Timestamp shows: "Last updated: 5 minutes ago"
**And:** All features remain functional (collapsible sections, filtering)
**And:** No console errors

#### Scenario: User opens app for first time while offline

**Given:** User has never loaded the app before
**And:** No cached data exists
**When:** User opens app while offline
**Then:** Offline banner displays: "Offline - unable to load data"
**And:** Message shows: "Connect to internet to view recovery dashboard"
**And:** Retry button available
**When:** User regains connection and taps retry
**Then:** Dashboard loads successfully
**And:** Data is cached for future offline use

---

### Requirement: Display Loading States

**Description:** Dashboard SHALL show skeleton screens during data loading to prevent blank screen and layout shift.

**Acceptance Criteria:**
- Skeleton screens match final layout
- Smooth transition from skeleton to content
- No layout shift (elements don't jump)
- Loading indicators for slow connections
- Timeout handling (> 10 seconds shows error)

#### Scenario: Normal loading sequence

**Given:** User opens dashboard
**When:** API request is in flight
**Then:** Skeleton heat map displays (4 category blocks with shimmer effect)
**And:** Skeleton recommendation cards display (3 cards with shimmer)
**When:** API responds with data
**Then:** Skeleton fades out smoothly (300ms transition)
**And:** Actual content fades in
**And:** No content jumping or shifting

#### Scenario: Slow loading (> 3 seconds)

**Given:** API request takes > 3 seconds
**When:** 3 seconds elapse
**Then:** Progress indicator appears
**And:** Message: "Taking longer than usual..."
**When:** 10 seconds elapse
**Then:** Error state displays
**And:** Message: "Unable to load. Check connection."
**And:** Retry button available

---

### Requirement: Handle API Errors Gracefully

**Description:** Dashboard SHALL display user-friendly error messages and recovery options when API requests fail.

**Acceptance Criteria:**
- Network errors show offline banner
- 500 errors show "Server error, try again"
- 404 errors handled (shouldn't occur for muscle states)
- Retry mechanism available
- Errors don't crash the app
- User can still navigate elsewhere

#### Scenario: API returns 500 error

**Given:** `/api/muscle-states` returns 500 Internal Server Error
**When:** Dashboard attempts to load
**Then:** Error banner displays: "Unable to load muscle states. Server error."
**And:** Retry button available
**And:** User can navigate to other screens (History, Settings)
**And:** No console crashes

#### Scenario: Network timeout

**Given:** API request exceeds 10 second timeout
**When:** Timeout occurs
**Then:** Error banner displays: "Request timed out. Check your connection."
**And:** Retry button available
**When:** User taps retry
**Then:** New request initiated
**And:** Loading state shown again

---

### Requirement: Respect User Motion Preferences

**Description:** Dashboard SHALL honor `prefers-reduced-motion` setting for users sensitive to animation.

**Acceptance Criteria:**
- All animations disable when `prefers-reduced-motion: reduce`
- Collapsible sections expand/collapse instantly (no animation)
- Progress bar fills instantly (no transition)
- Page transitions instant (no slides/fades)
- Tooltips appear instantly (no fade)
- Functional behavior unchanged (only motion removed)

#### Scenario: User has reduced motion enabled

**Given:** User's OS has "Reduce motion" accessibility setting enabled
**When:** Dashboard loads
**Then:** All CSS animations have 0.01ms duration
**And:** Collapsible sections expand/collapse instantly
**And:** Progress bars fill instantly
**And:** No smooth scrolling
**And:** All features remain functional

---

