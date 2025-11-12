---
name: bmad-story-sprint
description: Automates the complete BMAD story development lifecycle from creation through completion. This skill should be used when the user wants to run a complete story sprint including create-story, story-context, dev-story, code-review (with iterative fixes), and story-done workflows in sequence. Use when the user says something like "Run BMAD Story Sprint for story 1.4" or "Complete story 2.3 using the story sprint workflow."
---

# BMAD Story Sprint

This skill automates the complete story development lifecycle in the BMAD (Build-Measure-Analyze-Deploy) methodology, executing all necessary workflows in sequence with proper error handling and context management.

## Purpose

Execute a complete story sprint from start to finish, including:
1. Story creation
2. Context generation
3. Implementation
4. Code review with iterative fixes
5. Final completion

This eliminates the need to manually run each workflow step individually and ensures consistent execution of the BMAD story lifecycle.

## When to Use This Skill

Use this skill when:
- The user requests to complete a story from start to finish
- The user says "Run BMAD Story Sprint for story X.X"
- The user wants to automate the story development workflow
- A story needs to go through the full lifecycle without manual intervention

## How to Use This Skill

### Story Identification

Extract the story number from the user's request. Examples:
- "Run BMAD Story Sprint for story 1.4" → story number is "1.4"
- "Complete story 2.3 using story sprint" → story number is "2.3"
- "Use BMAD Story Sprint on 3.1" → story number is "3.1"

### Workflow Execution Sequence

Execute the following BMAD workflows in order, using fresh Task tool subagents for each workflow to manage context effectively:

#### Step 1: Create Story
Run the `/bmad:bmm:workflows:create-story` workflow to draft the story from the epic requirements.

**What it does:**
- Reads epic file to find story requirements
- Creates story markdown file with tasks, acceptance criteria, and dev notes
- Updates sprint status to "drafted"

**On Success:** Proceed to Step 2
**On Failure:** Stop and notify user of the failure

#### Step 2: Generate Story Context
Run the `/bmad:bmm:workflows:story-context` workflow to generate technical context.

**What it does:**
- Analyzes story requirements and identifies needed documentation/code artifacts
- Creates context XML file with all relevant references
- Updates sprint status to "ready-for-dev"

**Validation Required:**
After the workflow completes, verify success by:
1. Reading the generated context XML file (`.bmad-ephemeral/stories/[story-key].context.xml`)
2. Checking that placeholder tags like `{{docs_artifacts}}`, `{{code_artifacts}}`, `{{constraints}}`, `{{interfaces}}`, `{{test_standards}}` have been REPLACED with actual content
3. Verifying the sprint status file shows story status as "ready-for-dev" (not "drafted")
4. If any placeholders remain or status wasn't updated, treat as FAILURE

**On Success:** Proceed to Step 3
**On Failure:** Stop and notify user that context generation was incomplete

#### Step 3: Implement Story
Run the `/bmad:bmm:workflows:dev-story` workflow to implement the story.

**What it does:**
- Reads story file and context XML
- Implements all tasks and subtasks
- Writes comprehensive tests
- Updates sprint status to "review"

**Validation Required:**
After the workflow completes, verify success by:
1. Checking that all tests pass (workflow should report test results)
2. Verifying the sprint status file shows story status as "review" (not "ready-for-dev")
3. Confirming implementation files were created
4. If tests fail or status wasn't updated, treat as FAILURE

**On Success:** Create commit with message "Story X.X: Initial implementation", then proceed to Step 4
**On Failure:** Stop and notify user of the failure (e.g., tests failing, implementation errors)

#### Step 4: Code Review (First Pass)
Run the `/bmad:bmm:workflows:code-review` workflow to review the implementation.

**What it does:**
- Reviews implementation against acceptance criteria
- Validates test coverage
- Checks code quality and patterns
- Appends review notes to story file

**Possible Outcomes:**
- **APPROVE:** Proceed to Step 6 (Story Done)
- **CHANGES REQUESTED:** Proceed to Step 5 (Implement Fixes)
- **Error/Failure:** Stop and notify user

#### Step 5: Implement Code Review Fixes
If code review requested changes, implement the fixes.

**What to do:**
- Read the "Senior Developer Review" section from the story file
- Identify all HIGH and MEDIUM priority action items
- Implement fixes for each action item
- Update tests as needed
- Run tests to verify fixes

**On Success:** Create commit with message "Story X.X: Code review fixes applied", then proceed to Step 5a
**On Failure:** Stop and notify user that fixes could not be implemented

#### Step 5a: Code Review (Second Pass)
Run the `/bmad:bmm:workflows:code-review` workflow again to verify fixes.

**Possible Outcomes:**
- **APPROVE:** Proceed to Step 6 (Story Done)
- **CHANGES REQUESTED (still has issues):** Stop and notify user that fixes were insufficient and manual intervention is needed
- **Error/Failure:** Stop and notify user

#### Step 6: Mark Story Done
Run the `/bmad:bmm:workflows:story-done` workflow to mark the story complete.

**What it does:**
- Updates story file with completion notes
- Updates sprint status to "done"
- Records completion date

**On Success:** Report completion to user with summary
**On Failure:** Stop and notify user

### Context Management

To avoid context window exhaustion with these context-intensive workflows:

1. **Use Task tool with subagents** for each workflow step
2. **Create fresh subagents** for each workflow (don't reuse)
3. **Execute workflows sequentially**, not in parallel (they depend on each other)
4. **Clear prompt:** Each Task tool prompt should clearly specify:
   - Which workflow to run (the exact slash command)
   - What validation checks to perform after workflow completes
   - What to report back (including validation results)
   - What constitutes success vs. failure
5. **Validate outputs:** Don't assume a workflow succeeded just because it didn't error - verify the expected outputs were actually created and populated

### Error Handling

At each step, if a workflow fails:
1. **Stop execution** immediately
2. **Notify the user** with:
   - Which step failed
   - What the error was
   - Current status of the story
3. **Do not proceed** to subsequent steps

Common failure scenarios:
- Story creation fails (epic not found, malformed epic file)
- Context generation fails (missing documentation)
- Implementation fails (tests don't pass)
- Code review finds critical issues that can't be auto-fixed
- Second code review still finds issues

### Commit Strategy

Create git commits at these checkpoints:
1. **After dev-story completes:** "Story X.X: Initial implementation"
2. **After implementing code review fixes:** "Story X.X: Code review fixes applied"

This allows easy rollback if code review determines something was broken that wasn't actually broken.

Use the Bash tool with git commands:
```bash
git add .
git commit -m "Story X.X: <message>"
```

### Final Reporting

When the story sprint completes successfully, report to the user:

- **Story Number:** X.X
- **Story Title:** [from story file]
- **Status:** done
- **Total Workflows Executed:** [count]
- **Code Review Iterations:** [1 or 2]
- **Commits Created:** [list commit messages]
- **Next Backlog Story:** [check sprint-status.yaml]

Suggest next steps:
- Review the completed story in the story file
- Start the next backlog story
- Run retrospective if epic is complete

## Example Usage

**User:** "Run BMAD Story Sprint for story 1.4"

**Execution:**
1. Extract story number: "1.4"
2. Run create-story workflow (subagent)
3. Run story-context workflow (subagent)
4. Run dev-story workflow (subagent)
5. Commit: "Story 1.4: Initial implementation"
6. Run code-review workflow (subagent)
7. If changes requested:
   - Implement fixes
   - Commit: "Story 1.4: Code review fixes applied"
   - Run code-review workflow again (subagent)
8. If approved, run story-done workflow (subagent)
9. Report completion with summary

## Validation Checklist

Before marking the skill execution complete, verify:

- [ ] Story number correctly extracted from user input
- [ ] create-story workflow completed successfully
- [ ] story-context workflow completed successfully
- [ ] dev-story workflow completed successfully
- [ ] Initial implementation committed
- [ ] code-review workflow executed (first pass)
- [ ] If changes requested: fixes implemented and committed
- [ ] If changes requested: code-review workflow executed (second pass)
- [ ] Code review approved (after 1 or 2 iterations)
- [ ] story-done workflow completed successfully
- [ ] Sprint status shows story as "done"
- [ ] Summary reported to user

## Notes

- This skill assumes all BMAD workflows are available as slash commands
- Each workflow is context-intensive; use fresh subagents for each
- Do not run workflows in parallel; they must be sequential
- If any step fails, stop immediately and inform the user
- Maximum of 2 code review iterations before requiring manual intervention
