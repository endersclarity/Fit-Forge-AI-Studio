# Archive Entry Template

Use this template when adding entries to `docs/plans/archive/README.md`.

## Template

```markdown
### [Feature Name]
**Archived:** YYYY-MM-DD
**Implemented:** Commit `<hash>` (YYYY-MM-DD)
**Files:**
- `filename1.md` - Description
- `filename2.md` - Description (if multi-file)

**What was delivered:**
- Component/feature 1
- Component/feature 2
- Database changes (if any)
- API endpoints (if any)

**Related OpenSpec:** [None | Partially implemented X | Implemented Y | Superseded Z]

---
```

## Example Entry

```markdown
### Quick Builder + Execution Mode
**Archived:** 2025-10-29
**Implemented:** Commit `e7782e0` (2025-10-28)
**Files:**
- `quick-builder-execution-mode-plan.md` - Complete implementation plan (83KB)
- `READY_TO_IMPLEMENT.md` - Summary with decisions and verification checklist
- `quick-builder-FIXED.md` - Patch notes for fixes during implementation

**What was delivered:**
- WorkoutBuilder component with planning + execution modes
- Template system with save/load
- Guided timer with auto-advance
- Real-time muscle fatigue visualization (current + forecast)
- 7 new components, 2 backend endpoints, 1 database migration

**Related OpenSpec:** Partially implemented the archived `2025-10-27-implement-forecasted-fatigue-workout-builder` OpenSpec proposal

---
```

## Field Descriptions

### Feature Name
Clear, descriptive title for the feature (matches plan name when possible)

### Archived
Date when the plan was moved to archive (YYYY-MM-DD format)

### Implemented
- Commit hash (short form, 7 characters)
- Date of implementation commit

For multi-commit features, use earliest commit or most significant one.

### Files
List all plan files being archived:
- Main plan filename
- Supporting files (READY_TO_IMPLEMENT, FIXED, etc.)
- Brief description of each file's purpose

### What was delivered
Concrete summary of implementation:
- New components created
- Backend changes (APIs, database)
- Features added
- Number of files changed (if significant)

Focus on user-visible features and technical changes.

### Related OpenSpec
Document relationship to OpenSpec proposals:

**Options:**
- `None` - No related OpenSpec proposal
- `Partially implemented <proposal-id>` - Superpowers plan delivered part of an OpenSpec proposal
- `Implemented <proposal-id>` - Superpowers plan fully delivered an OpenSpec proposal
- `Superseded <proposal-id>` - Superpowers plan replaced an OpenSpec approach
- `Related to <proposal-id>` - Loose connection (same feature area)

**How to find related proposals:**
1. Check `openspec/changes/archive/` for similar dates
2. Search for similar feature names
3. Look at git commits mentioned in OpenSpec ARCHIVE_NOTE.md files
4. Cross-reference implementation dates

## Multiple Related Proposals Example

```markdown
**Related OpenSpec:**
- Partially implemented `2025-10-27-implement-forecasted-fatigue-workout-builder` (forecasting)
- Superseded `2025-10-27-implement-muscle-deep-dive-modal` (replaced with interactive version)
```

## README Structure

The archive README should have:
1. Header explaining archive policy
2. List of archived plans (most recent first)
3. Workflow section at bottom
4. Active plans reference

Keep entries in reverse chronological order (newest first).
