---
name: archiving-superpowers-plans
description: Archive completed Superpowers implementation plans by moving them to docs/plans/archive/ and documenting what was implemented. This skill should be used when a Superpowers plan in docs/plans/ has been fully implemented and committed to the codebase.
---

# Archiving Superpowers Plans

This skill provides the workflow for archiving completed Superpowers implementation plans after they have been implemented and committed.

## When to Use This Skill

Use this skill when:
- A Superpowers plan in `docs/plans/` has been fully implemented
- Code has been committed to the main branch
- The plan files are no longer needed in the active directory
- User requests to "archive" or "clean up" Superpowers plans

## Workflow

### Step 1: Verify Implementation

Before archiving, verify the plan has been implemented by checking git history.

```bash
# Search for commits related to the plan
git log --oneline --all --grep="<plan-keyword>" -i

# Example: For Quick Builder plan
git log --oneline --all --grep="quick builder" -i
```

Confirm that:
- Implementation commits exist
- Feature is in the codebase
- Code has been merged to main branch

### Step 2: Create Archive Directory (if needed)

```bash
mkdir -p docs/plans/archive
```

### Step 3: Move Plan Files

Move the plan file(s) to the archive:

```bash
mv docs/plans/<plan-name>.md docs/plans/archive/
```

For multi-file plans (e.g., plan + READY_TO_IMPLEMENT + FIXED), move all related files.

### Step 4: Update Archive README

Update `docs/plans/archive/README.md` with an entry for the archived plan using the template in `references/archive-entry-template.md`.

Required information:
- **Archived date**: Today's date (YYYY-MM-DD)
- **Implementation commit(s)**: Git commit hash(es) from Step 1
- **What was delivered**: Summary of implemented features
- **Related OpenSpec**: Any OpenSpec proposals that relate to this plan

To find related OpenSpec proposals:
1. Check `openspec/changes/archive/` for similar feature names
2. Look for proposals archived around the same date
3. Cross-reference implementation commits

### Step 5: Verify Cleanup

Confirm the active plans directory is clean:

```bash
ls -la docs/plans/
```

Only `archive/` directory should remain (or other active, unimplemented plans).

## Example: Archiving Quick Builder Plan

```bash
# Step 1: Verify
git log --oneline --grep="quick builder" -i
# Found: e7782e0 feat: implement Quick Builder + Execution Mode

# Step 2: Create archive (if needed)
mkdir -p docs/plans/archive

# Step 3: Move files
mv docs/plans/quick-builder-execution-mode-plan.md docs/plans/archive/
mv docs/plans/READY_TO_IMPLEMENT.md docs/plans/archive/
mv docs/plans/quick-builder-FIXED.md docs/plans/archive/

# Step 4: Update README (see references/archive-entry-template.md)
# Add entry to docs/plans/archive/README.md

# Step 5: Verify
ls -la docs/plans/
# Output: Only archive/ directory remains
```

## Cross-Referencing with OpenSpec

Superpowers plans may relate to OpenSpec proposals. When archiving, check for connections:

**Superpowers -> OpenSpec:**
- Superpowers plans are often created from brainstorming sessions
- The same feature may be tracked in both systems
- OpenSpec proposals may be "partially implemented" by Superpowers work

**Example:**
- Superpowers plan: `quick-builder-execution-mode-plan.md`
- Related OpenSpec: `2025-10-27-implement-forecasted-fatigue-workout-builder` (partially implemented)

In the archive README, note these relationships so developers understand which system delivered which features.

## References

See `references/archive-entry-template.md` for the standard format of archive README entries.
