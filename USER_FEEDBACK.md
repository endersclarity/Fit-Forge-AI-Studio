# User Experience Feedback Log

> **Purpose:** Capture raw, unfiltered observations and reactions while using FitForge as a real user.
>
> **Workflow:** User verbally shares impressions during/after app usage → Claude organizes entries with structure, context, and tags → Periodic review identifies patterns → OpenSpec proposals address recurring themes
>
> **Guidelines:**
> - Transcript-based: User speaks their immediate reactions, Claude captures them
> - Vague impressions are valuable data - no need for perfect articulation
> - Focus on WHAT was experienced, not solutions (that comes later via OpenSpec)
> - Context matters: what was the user trying to accomplish?
> - Tags help spot patterns during periodic reviews

**Common Tags:** #workout-logging #exercise-selection #ui #ux #performance #navigation #recovery-tracking #recommendations #templates #data-entry #onboarding #progression

---

## How This Works

1. **User uses the app** and verbally shares their gut reactions with Claude
2. **Claude captures and organizes** the feedback with proper context and tags
3. **Periodic reviews** (weekly/monthly) identify recurring patterns
4. **OpenSpec proposals** are created when patterns warrant formal changes

---

## 2025-10-27 - Starting User Testing Phase

**Context:** Transitioning from builder mode to active user mode

- App is feature-complete enough for real-world use
- Time to experience it as the primary user, not just the developer
- Goal: Capture authentic reactions before rationalization sets in

**Initial commitment:**
- Use FitForge as my only workout logger going forward
- Record thoughts immediately when they occur
- Be honest about friction points, even minor ones
- Trust the process: patterns will emerge over time

---

## Feedback Entries

<!-- Newest entries first. Claude maintains this section based on user transcripts. -->

### 2025-10-27 - First Real User Test Session

**Context:** First time using the app as an actual user rather than developer. Fresh eyes on the homepage/dashboard experience.

**Navigation & UI Clarity:**
- Top navigation icons are confusing - two look identical (both appear like bar charts)
- Only the profile icon is clear about what it does
- No back button visible - everything seems crammed into one page (localhost:3000)
- Need actual page navigation or modal flows, not everything on one screen

**Information Overload - Homepage Redundancy:**
- "Welcome back tester, ready to forge strength" - the tagline is unnecessary/silly
- Just "Welcome back [Name]" is sufficient (or show username next to profile icon)
- Workout history appears THREE times in different sections (massive redundancy)
- "Browse Workout Templates" and "View All Templates" appear to be duplicate buttons
- Recovery information shown in multiple ways (timeline box + should be in muscle viz)
- Don't need workout recommendations "up front" - should be progressive disclosure

**Missing: Primary Visual Focus**
- **CRITICAL:** Homepage should lead with large, clear muscular structure visualization showing current fatigue levels
- Want color-coded muscle fatigue (red → yellow → green) with lines connecting to muscle names and percentages
- This visual should be THE primary decision-making tool for "what should I work out today?"
- Current approach buries this information or doesn't present it prominently enough

**Workout Rotation Logic (Explicit Requirements):**
- User's actual rotation: 2 days on, 1 day off, 1 day on, 1 day off (repeating)
- Never more than 5 days before hitting same muscle group again
- Sequence: Push A → Leg A → [day off] → Pull A → [day off or Core] → Push B → Leg B → [day off] → Pull B
- Core is optional/random, doesn't interfere with main rotation (Push/Pull/Legs)
- Cycle through all "A" variations before moving to "B" variations
- Quick Start should show next logical workout based on this explicit schedule (no formula, just historical logic)

**Quick Start Section:**
- Currently shows: Push Day A, Core Day A, Core Day B, Leg Day A
- Should only show THE NEXT logical workout based on rotation
- Note: "Last Workouts" section shows Push B was last, so today should be Push A (logic appears to work!)
- But don't need to see ALL last workouts as separate cards - this should be collapsed/dropdown

**Feature Requests & Ideas:**

**🔥 KILLER FEATURE - Forecasted Fatigue Workout Builder:**
- While building a workout, show forecasted fatigue levels in real-time
- Use volume sliders instead of manual weight/reps entry during planning
- As slider moves, visualize how muscle fatigue would increase for each engaged muscle
- Show what all muscles would look like POST-workout
- Then, once desired fatigue targets are set, automatically create workout structure (sets/reps/weight based on history and PRs)
- This lets users work backward from desired fatigue outcomes to workout structure

**Other Buttons/Actions Needed:**
- "Quick Workout" - immediate modal with: select exercise, equipment, weight, reps, rest timer, "to failure" toggle
- "Recommend based on freshest muscles" - button with placeholder for future AI logic
- "View saved templates" - quick access
- "Start custom workout" - open workout builder modal
- Workout History - dropdown/collapsed view (last 3 workouts), not prominent cards

**Motivational Elements:**
- Streak, "This Week", Personal Records buttons exist but feel static
- Would like "rolling disclosure" of interesting stats
- Show if user is meeting +3% progressive overload goals
- Visual feedback on whether volume is increasing per exercise over time
- Consider animated sprites instead of static images for visual interest

**Data Display Issues:**
- Beginner/Intermediate labels on exercises: **Don't care about these, remove them**
- Muscle engagement percentages shown are minimal/incomplete
- Recent Perplexity research on muscle engagement isn't reflected in recommendations
- Want to see MORE detail: major AND minor muscle groups per exercise
- Want to see current fatigue levels alongside engagement percentages in exercise cards

**Recovery System:**
- Current system: 7 days to full recovery
- **Should change to: 5 days to 100% recovery** (starting from 100% fatigue)
- "Recovery Timeline" box is redundant if muscle fatigue visualization is good enough
- Color-coded fatigue bars should be sufficient visual indicator

**Recommended Exercises Section:**
- Logic looks solid, split by muscle groups is "rad"
- Want to understand the formula for how recommendations are generated
- Section looks "pretty fucking clean" overall
- But needs to integrate forecasted fatigue visualization
- Should show: engagement % AND current fatigue level AND forecasted post-exercise fatigue

**Profile/User Management:**
- Currently shows "tester" profile
- Want it to say "Welcome back Kaelin" (user's actual name)
- Need different profiles eventually, but for now just one user is fine

**Tags:** #homepage #navigation #information-architecture #ux #redundancy #muscle-visualization #workout-rotation #progressive-disclosure #forecasted-fatigue #recovery-system #recommendations #motivational-elements

---
