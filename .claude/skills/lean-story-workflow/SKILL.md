---
name: lean-story-workflow
description: Context-aware story implementation workflow for FitForge. Provides phase-specific guidance, enforces verification gates, and tracks progress. Use when starting a story, checking progress mid-implementation, or before marking a story complete. Answers "what should I do now?" not "here's the entire process."
---

# Lean Story Workflow

A lightweight, verification-focused workflow for implementing FitForge stories. Provides just-in-time guidance based on current phase.

## Core Principle
**Trust but Verify** - BMAD structure, Superpowers discipline, Serena intelligence, minimal ceremony.

## Orchestration Pattern (CRITICAL)

**This window is the ORCHESTRATOR, not the worker.**

To preserve context window space, delegate actual work to sub-agents via the Task tool:

- **Orchestrator window (here):** High-level planning, status tracking, reviewing results, decision-making
- **Sub-agents (Task tool):** Actual implementation, test running, code fixes, verification

### When to use Task tool sub-agents:

1. **Implementing story tasks** → Launch implementation agent with specific task instructions
2. **Running verification gates** → Launch verification agent to run build/tests
3. **Fixing test failures** → Launch debugging agent with failure context
4. **Code exploration** → Launch exploration agent to understand codebase

### Sub-agent prompt template:

```
Story: 8.X - [Title]
Phase: [DRAFT/IN PROGRESS/IMPLEMENTED/VERIFIED]
Current Task: [Specific task from story]

Context:
- [Relevant file paths]
- [Key constraints or requirements]
- [Previous decisions from Serena memories]

Instructions:
1. [Specific action to take]
2. [Expected output/verification]
3. Report back: [What to include in final report]

IMPORTANT: Commit after completing each logical chunk.
```

### Orchestrator responsibilities:

- Determine which story/task to work on
- Craft clear sub-agent prompts
- Review sub-agent results
- Update story status based on verified results
- Make strategic decisions
- Manage TodoWrite at high level

### Benefits:

- Context window stays clean for strategic thinking
- Sub-agents work with fresh context (no accumulated confusion)
- Parallel work possible (multiple agents simultaneously)
- Better separation of concerns

## When to Use This Skill

- Starting work on a story
- Checking "where are we?" mid-implementation
- Before claiming a story is complete (MANDATORY verification)
- Returning to work after a break

## Story Lifecycle

```
Draft → In Progress → Implemented → Verified → Done
```

## Phase Detection and Actions

### To determine current phase:

1. Read story file: `docs/stories/X-Y-*.md`
2. Check `## Status` field
3. Cross-reference with git status and recent commits

### Phase-Specific Guidance

#### DRAFT Phase
**Status says:** Draft or not started

**Actions:**
1. Read entire story file (AC, Tasks, Dev Notes)
2. Use Serena to understand relevant code symbols
3. Create TodoWrite list from Tasks/Subtasks
4. Update story status to "In Progress"
5. Commit: `git commit -m "chore: Start Story X.Y"`

#### IN PROGRESS Phase
**Status says:** In Progress

**Orchestrator Actions:**
1. Check TodoWrite for current task
2. **Launch sub-agent** to implement ONE task at a time
3. Review sub-agent results
4. After each task verified:
   - Mark todo complete
   - Confirm sub-agent committed: `feat: Task N of Story X.Y - <description>`
5. Repeat until all tasks done
6. Update status to "Implemented"

#### IMPLEMENTED Phase
**Status says:** Implemented (code done, not verified)

**MANDATORY VERIFICATION GATE:**

**Launch verification sub-agent** with instructions to:
```bash
# 1. Run build
npm run build
# Must pass - NO EXCEPTIONS

# 2. Run related tests
npm run test:run -- <related-files>
# Must pass OR document pre-existing failures

# 3. Check for new warnings
# Review console output

# 4. Report back with evidence
```

**Based on sub-agent report:**

**If gates pass:**
- Update status to "Verified"
- Proceed to completion

**If gates fail:**
- **Launch fix sub-agent** with failure context
- Rerun verification via new sub-agent
- Do NOT proceed until passing

#### VERIFIED Phase
**Status says:** Verified (all gates passed)

**Actions:**
1. Update story's Dev Agent Record section
2. Write Serena memory summarizing implementation
3. Final commit: `feat: Story X.Y complete - <title>`
4. Update status to "Done"

## Non-Negotiable Rules

1. **NEVER mark "Ready for Review" or "Done" without running verification**
2. **Build must pass** - `npm run build` succeeds
3. **Tests must pass** - Or be documented as pre-existing failures
4. **Small commits** - One task or logical chunk at a time
5. **Honest status** - Status reflects reality, not aspirations

## Tool Integration

| Task | Tool to Use |
|------|------------|
| Track session progress | TodoWrite |
| Understand code structure | Serena `get_symbols_overview`, `find_symbol` |
| Find symbol usage | Serena `find_referencing_symbols` |
| Precise symbol edits | Serena `replace_symbol_body` |
| Run tests/build | Bash |
| Remember decisions | Serena `write_memory` |
| Read story file | Read tool |

## Quick Status Check

To answer "where are we?":

1. `Read docs/stories/<current-story>.md` → Get status
2. `git status` → See uncommitted work
3. Check TodoWrite → See task progress
4. `Serena list_memories` → See project context

## Recovery Scenarios

### Uncommitted changes from previous session
1. Review what changed: `git diff --stat`
2. Determine if work is valid
3. Either commit (if good) or revert (if broken)
4. Update story status honestly

### Tests failing after changes
1. Determine: New failure or pre-existing?
2. If new: Fix before proceeding
3. If pre-existing: Document in story notes
4. Never ignore failures without documentation

### Returning after break
1. Read Serena memories for context
2. Check story file status
3. Review TodoWrite state
4. Resume from current phase

## Anti-Patterns to Avoid

- Marking stories complete without verification (Codex problem)
- Large commits with 40+ files (hard to verify)
- Status updates that don't match reality
- Skipping tests because "the code looks right"
- Verbose documentation over action
