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

### Hybrid Tool Strategy (Based on A/B Testing)

**Use Serena MCP tools for:**
- Understanding code structure → `get_symbols_overview`
- Finding symbol implementations → `find_symbol` with `include_body=True`
- Tracing code relationships → `find_referencing_symbols`
- Project memory/context → `read_memory`, `write_memory`, `list_memories`
- Reflection checkpoints → `think_about_collected_information`, `think_about_task_adherence`
- Session continuity → `prepare_for_new_conversation`

**Use Claude Code tools for:**
- Pattern matching in CSS/config → Grep
- Finding text strings (classNames, etc.) → Grep
- Simple file reads → Read
- Text-based edits → Edit
- Running commands → Bash

### Tool Selection Matrix (Validated via A/B Testing)

| Task | Best Tool | Why | Test Result |
|------|-----------|-----|-------------|
| Track session progress | TodoWrite | Native session tracking | - |
| Understand TypeScript code structure | Serena `get_symbols_overview` | 4x token savings (150 vs 600) | ✅ Test 3 |
| Find where hook/function is used | Serena `find_referencing_symbols` | No false positives, semantic context | ✅ Test 2 (9/10) |
| Trace call chains | Serena `find_referencing_symbols` | Found 14 files, distinguishes imports vs calls | ✅ Test 2 |
| Search CSS class patterns | Grep | Text pattern, not symbols | ✅ Test 3 |
| Read config/JSON files | Read | Not code symbols | ✅ A/B test |
| Edit function implementation | Serena `replace_symbol_body` | Symbol-level precision | - |
| Rename identifiers codebase-wide | Serena `rename_symbol` | Auto-updates all references | ⚠️ Test 1 (code only, not strings) |
| Edit CSS/className strings | Edit | Text replacement | ✅ A/B test |
| Run tests/build | Bash | Shell execution | - |
| Remember decisions | Serena `write_memory` | Persists across sessions | ✅ Test 4 (100x faster) |
| Check previous context | Serena `read_memory` | 2 calls vs 15-20 fresh analysis | ✅ Test 4 |
| Cross-file refactoring | Serena `find_referencing_symbols` | Shows destructuring patterns | ✅ Test 5 |
| Reflect on completeness | Serena `think_about_collected_information` | Forced reflection | - |
| Verify task alignment | Serena `think_about_task_adherence` | Prevents drift | - |

### Validated Performance Metrics

- **Memory retrieval:** 100-300x faster than re-analysis (Test 4)
- **Symbol overview:** 4x token savings vs full file read (Test 3)
- **Reference tracking:** 9/10 accuracy, no false positives (Test 2)
- **Refactoring analysis:** Semantic understanding beats Grep noise (Test 5)
- **Identifier renaming:** Works for code, NOT for string literals (Test 1)

### Serena Thinking Tools (USE FREQUENTLY)

**After research/exploration:**
```
mcp__serena__think_about_collected_information
```
Forces reflection: "Do I have enough info? What's missing?"

**Before making edits:**
```
mcp__serena__think_about_task_adherence
```
Prevents drift: "Am I still on track with the original task?"

**When wrapping up:**
```
mcp__serena__think_about_whether_you_are_done
```
Ensures completeness: "Is this actually done, or am I just tired?"

### Memory Workflow

1. **Start of session:** `list_memories` → See what context exists
2. **Before complex task:** `read_memory` → Load relevant prior analysis
3. **After important decision:** `write_memory` → Persist for future sessions
4. **Running low on context:** `prepare_for_new_conversation` → Create continuation summary

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
