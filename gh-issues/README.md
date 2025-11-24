# GitHub Issues (Local Mirror)

This folder contains a local copy of all GitHub issues for reference by AI coding assistants that don't have access to GitHub's external API.

## Structure

- Each issue is saved as `issue-{number}-{title-slug}.md`
- `_issues.json` contains the raw JSON data from GitHub
- Issues are automatically fetched with `gh issue list`

## Updating Issues

To refresh all issues from GitHub:

```bash
gh issue list --state all --json number,title,state,body,labels,createdAt,updatedAt --limit 100 > gh-issues/_issues.json
# Then re-run the script to generate individual markdown files
```

## Open Issues

- [#12 - CRITICAL: 'Failed to save workout' - entire workout data lost](issue-12-failed-to-save-workout.md) 🚨
- [#11 - Bug: Exercise data incorrectly carries over when switching exercises](issue-11-exercise-data-carryover.md)
- [#10 - Investigate: Missing 'To Failure' button in workout logging](issue-10-to-failure-investigation.md)
- [#9 - Workout Builder: Missing 'Start Workout' button and template details not persisting](issue-9-workout-builder-issues.md)
- [#7 - [Enhancement] Implement Detailed Muscle Fatigue Tracking](issue-7-detailed-muscle-tracking.md)
- [#6 - Research & Validate Muscle Fatigue Model](issue-6-muscle-fatigue-research.md)
- [#5 - Implement To Failure Tracking UI](issue-5-to-failure-ui.md)
- [#4 - Implement Personal Muscle Engagement Calibration](issue-4-muscle-engagement-calibration.md)

## Closed Issues

- [#3 - Implement A/B Variation Intelligence](issue-3-ab-variation-intelligence.md) ✅
- [#2 - Enhance Quick Workout Logger](issue-2-quick-workout-logger.md) ✅
- [#1 - Enable First-Time User Onboarding Flow](issue-1-first-time-onboarding.md) ✅
