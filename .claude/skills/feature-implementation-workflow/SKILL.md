---
name: feature-implementation-workflow
description: Orchestrates feature implementation from brainstorming through execution and knowledge capture. This skill should be used when implementing new features with full lifecycle management including design exploration, planning, sub-agent execution, and Serena memory capture. Lighter alternative to BMAD for intermittent feature work.
---

# Feature Implementation Workflow

Orchestrates the complete feature implementation lifecycle by invoking specialized skills in sequence: brainstorming, planning, execution, and knowledge capture.

## When to Use

- Implementing new features that need design exploration
- Adding functionality that requires user input on UX/architecture decisions
- Features that benefit from structured planning before coding
- Work that should be captured in Serena memory for future sessions

## Workflow Phases

### Phase 1: Load Context (Serena)
Before starting, check for relevant Serena memories:
```
mcp__serena__list_memories()
mcp__serena__read_memory("relevant_topic")
```
Load any existing architectural decisions, patterns, or conventions.

### Phase 2: Brainstorming (Superpowers)
Invoke `superpowers:brainstorming` skill for interactive design exploration:
- Structured Socratic dialogue with user
- Present options in ~200 word sections for digestibility
- Create visual mockups when helpful (use Task tool)
- Output: Design document saved to `docs/plans/YYYY-MM-DD-feature-name.md`

**Key brainstorming phases:**
1. Understanding (what/how questions)
2. Exploration (present alternative approaches)
3. Design presentation (validate in sections)
4. Documentation (capture decisions)

### Phase 3: Planning (Superpowers write-plan)
Invoke `/superpowers:write-plan` slash command:
- Creates bite-sized implementation tasks (2-5 minutes each)
- Complete code in plan (not pseudo-code)
- Exact file paths and verification steps
- Output: `docs/plans/YYYY-MM-DD-feature-name-implementation.md`

### Phase 4: Execution (Sub-agents)
Use Task tool to dispatch sub-agents for each task:
```
Task(
  description="Execute Task N",
  prompt="Execute Task N from docs/plans/...",
  subagent_type="general-purpose"
)
```

**Execution pattern:**
- One sub-agent per task
- Review results after each task
- Fix bugs as discovered (update memory with lessons)
- Test incrementally with Chrome DevTools or manual testing

### Phase 5: Knowledge Capture (Serena)
After implementation, write Serena memory:
```
mcp__serena__write_memory(
  memory_file_name="feature_name_implementation",
  content="# Feature Implementation Patterns\n\n..."
)
```

**Memory should include:**
- Architecture decisions and rationale
- Bug fixes with root causes
- API contracts and data structures
- Code patterns specific to the codebase
- Lessons learned during implementation

### Phase 6: Verification & Commit
- Test full user flow (Chrome DevTools recommended)
- Fix any remaining issues
- Commit with descriptive message
- Update memory if new lessons learned

## Quick Reference

**Start workflow:**
1. Check Serena memories for context
2. Run `superpowers:brainstorming` for design
3. Run `/superpowers:write-plan` for tasks
4. Execute tasks with Task tool sub-agents
5. Write Serena memory with patterns
6. Test and commit

**Key outputs:**
- `docs/plans/YYYY-MM-DD-feature-name.md` (design doc)
- `docs/plans/YYYY-MM-DD-feature-name-implementation.md` (task plan)
- Serena memory file with learned patterns

**Common pitfalls to avoid:**
- Don't assume codebase structure in plans (verify with Serena or exploration)
- Don't call `clearCurrentExercise()` before navigate (useEffect race condition)
- Always match exact API contracts (read existing code first)
- Docker HMR may need container restart for new directories
