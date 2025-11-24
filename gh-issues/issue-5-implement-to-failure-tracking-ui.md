# Issue #5: Implement To Failure Tracking UI

**Status:** 🔴 Open
**Labels:** enhancement
**Created:** 10/26/2025
**Updated:** 10/26/2025

---

## Problem
Database has `to_failure` column and backend baseline learning exists, but users have no way to indicate which sets were performed to muscular failure.

## Solution
Add intuitive UI controls in Workout screen:
- Auto-mark last set of each exercise as "to failure" (smart default)
- Allow users to toggle failure marker on/off for any set
- Visually distinguish failure sets from submaximal sets
- Pass `to_failure` flag to backend when saving workouts
- Enable "Greasing the Groove" mode for intentional submaximal training

## Tasks
- [ ] Add to-failure toggle UI in Workout screen
- [ ] Implement smart default (last set = failure)
- [ ] Add visual distinction for failure sets
- [ ] Pass flag to backend on save
- [ ] Add Greasing the Groove mode
- [ ] Test baseline learning accuracy improvement

**Priority:** Critical (Unblocks baseline learning accuracy)
**OpenSpec Change:** `2025-10-26-implement-to-failure-tracking-ui`

See full proposal: `openspec/changes/2025-10-26-implement-to-failure-tracking-ui/proposal.md`

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/5
