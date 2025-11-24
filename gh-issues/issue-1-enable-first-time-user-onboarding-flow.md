# Issue #1: Enable First-Time User Onboarding Flow

**Status:** ✅ Closed
**Labels:** enhancement
**Created:** 10/26/2025
**Updated:** 11/12/2025

---

## Problem
New users cannot use the app - crashes with "User not found" error when no profile exists in database.

## Solution
Implement first-time user detection and guided onboarding flow with profile setup (name, experience level, equipment).

## Tasks
- [ ] Detect first-time user (no profile in database)
- [ ] Create profile setup wizard UI
- [ ] Add profile creation API endpoint
- [ ] Handle onboarding flow before showing main dashboard
- [ ] Test new user experience

**Priority:** High (Blocks new user adoption)
**OpenSpec Change:** `2025-10-26-enable-first-time-user-onboarding`

See full proposal: `openspec/changes/2025-10-26-enable-first-time-user-onboarding/PROPOSAL.md`

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/1
