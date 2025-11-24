# Issue #11: Bug: Exercise data incorrectly carries over when switching exercises during workout

**Status:** 🔴 Open
**Labels:** none
**Created:** 11/24/2025
**Updated:** 11/24/2025

---

## Problem Description

When logging a workout, if you complete an exercise and move to the next exercise, the weight/reps/rest values from the previous exercise incorrectly carry over to the new exercise as pre-populated values.

## Steps to Reproduce

1. Start a workout with multiple exercises (e.g., "Push Day A" template)
2. Log Exercise 1: Dumbbell Bench Press - Enter 90 lbs × 10 reps
3. Move to Exercise 2: Tricep Extension
4. **Observe:** The input fields are pre-populated with 90 lbs × 10 reps (from the previous exercise)
5. **Expected:** Tricep Extension should show its own default values, not bench press values

## Why This Is Problematic

- **Wrong Weights:** Different exercises use vastly different weights (90 lbs bench press ≠ 90 lbs tricep extension)
- **Error-Prone:** Easy to accidentally log incorrect data if user doesn't notice the carryover
- **Confusing UX:** Pre-populated values should reflect the current exercise, not the previous one

## Root Cause

The workout logging form is likely using a single state object that persists between exercise transitions, rather than:
1. Clearing state when switching exercises, OR
2. Loading exercise-specific defaults from the template

## Proposed Solution

**Option 1: Clear state between exercises**
- Reset input fields to blank or system defaults when user switches to a new exercise

**Option 2: Use template defaults (PREFERRED)**
- If the workout was started from a saved template with pre-planned sets, use those values as defaults
- This would provide the best UX and ties into **Issue #9** (template details not persisting)
- Example: If template said "Tricep Extension: BW × 10 reps, 90s rest", pre-populate with those values

**Option 3: Use exercise history**
- Load the last logged values for *this specific exercise* (not the previous exercise in the workout)
- Example: If user did Tricep Extension last week at 30 lbs, suggest 30 lbs

## Related Issues

- **Issue #9** - If templates saved full set details, those could be used as intelligent defaults here
- This bug is a symptom of templates only saving `exerciseIds` instead of full set data

## Impact

**Priority:** Medium - Creates data entry errors and user confusion during workouts

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/11
