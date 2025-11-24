# Issue #10: Investigate: Missing 'To Failure' button in workout logging

**Status:** 🔴 Open
**Labels:** none
**Created:** 11/24/2025
**Updated:** 11/24/2025

---

## Investigation Needed

During workout logging, there is no visible "To Failure" button or toggle to indicate whether a set was taken to failure or stopped short (submaximal).

## Questions to Investigate

1. **Was this feature intentionally removed?**
   - Was there a decision to abandon "to failure" tracking?
   - If so, what was the reasoning?

2. **Was this feature planned but not implemented?**
   - Should it exist but is missing from the UI?
   - Are there backend structures in place that aren't being used?

3. **Database Check**
   - Does the `exercise_sets` table have a `to_failure` column?
   - Is this data being tracked on the backend but not exposed in the UI?

## Context

The "to failure" metric is important for:
- Understanding training intensity
- Tracking whether sets are truly maximal or submaximal
- Progressive overload planning (pushing to failure vs. autoregulation)
- Recovery estimation (failure sets require more recovery)

## Expected Behavior

When logging a set, users should be able to indicate:
- ✅ **To Failure** - Set taken until muscular failure
- ❌ **Submaximal** - Set stopped before failure (RIR > 0)

## Current Behavior

No option exists to mark sets as "to failure" vs "submaximal" in the workout logging interface.

---

**Action Items:**
1. Check git history for any "to failure" related code or decisions
2. Review database schema for `to_failure` column
3. Review any architectural documents or PRD for original intent
4. Determine if this should be implemented or if it was intentionally excluded

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/10
