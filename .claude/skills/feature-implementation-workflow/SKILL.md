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

### Phase 2: Scope Definition (Critical!)
**"AI is not point-and-shoot - spend time upfront to save headaches later"**

Work with user to create a **properly documented plan**:
- Talk through what you want to achieve (use voice if available)
- Get everything out of your head into the plan
- Read it back, tweak until scope is perfect
- Break into logical sections (like planning an actual project)

**Key scope questions:**
- What problem are we solving? (user pain point)
- What patterns exist already? (check Serena memories)
- What's the simplest approach that works?
- What could go wrong? (dependencies, edge cases)

### Phase 3: Brainstorming (Superpowers)
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

### Phase 4: Planning (Superpowers write-plan)
Invoke `/superpowers:write-plan` slash command:
- Creates bite-sized implementation tasks (2-5 minutes each)
- Complete code in plan (not pseudo-code)
- Exact file paths and verification steps
- Output: `docs/plans/YYYY-MM-DD-feature-name-implementation.md`

### Phase 5: Execution (Serena-First Approach)
**CRITICAL: Use Serena tools BEFORE writing any code**

Before each implementation task, establish context using Serena:
```
1. mcp__serena__get_symbols_overview("path/to/file.tsx")
   → Understand existing structure

2. mcp__serena__find_symbol(name_path="ComponentName", relative_path="...", include_body=true)
   → Read only what you need

3. mcp__serena__find_referencing_symbols(name_path="functionName", relative_path="...")
   → Trace dependencies and usage patterns

4. mcp__serena__search_for_pattern(substring_pattern="pattern", relative_path="...")
   → Find similar implementations to match patterns
```

**Then implement using sub-agents:**
```
Task(
  description="Execute Task N with Serena context",
  prompt="Using the patterns found via Serena tools, execute Task N from docs/plans/...",
  subagent_type="general-purpose"
)
```

**Execution pattern (Serena-First):**
- ⚠️ **NEVER Read/Grep entire files** - use Serena symbol tools first
- Match existing code patterns (Serena shows you how it's done elsewhere)
- Use symbolic editing (replace_symbol_body, insert_after_symbol) when possible
- One sub-agent per task, with Serena context loaded
- Review results after each task
- Fix bugs as discovered (update memory with lessons)
- Test incrementally with Chrome DevTools or manual testing

**Memory-First Pattern:**
Before starting ANY task:
```
1. list_memories() - Check what context exists
2. read_memory("relevant_topic") - Load prior analysis instantly
3. Only re-analyze if memory doesn't exist
```

### Phase 6: Knowledge Capture (Serena)
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

### Phase 7: Verification & Commit
- Test full user flow (Chrome DevTools recommended)
- Fix any remaining issues
- Commit with descriptive message
- Update memory if new lessons learned

## Quick Reference

**Start workflow:**
1. **Memory-First**: Check Serena memories for context (list_memories → read_memory)
2. **Scope Definition**: Talk through requirements, document properly
3. **Brainstorm**: Run `superpowers:brainstorming` for design options
4. **Plan**: Run `/superpowers:write-plan` for bite-sized tasks
5. **Serena-First Execution**: Use Serena tools to understand patterns BEFORE coding
6. **Implement**: Execute tasks with Task tool sub-agents (with Serena context)
7. **Capture**: Write Serena memory with patterns and lessons
8. **Verify**: Test and commit

**Key outputs:**
- `docs/plans/YYYY-MM-DD-feature-name.md` (design doc)
- `docs/plans/YYYY-MM-DD-feature-name-implementation.md` (task plan)
- Serena memory file with learned patterns

**The Serena-First Mindset:**
⚠️ **NEVER Read/Grep entire files first**
1. Use `get_symbols_overview` to understand structure
2. Use `find_symbol` to read only what you need
3. Use `find_referencing_symbols` to trace usage
4. Use `search_for_pattern` to find similar implementations
5. Match existing patterns (don't invent new ones)

**Common pitfalls to avoid:**
- ❌ Reading entire files instead of using Serena symbol tools
- ❌ Skipping scope definition (rushing to code)
- ❌ Not checking Serena memories first (re-inventing patterns)
- ❌ Assuming codebase structure (verify with Serena)
- ❌ Not matching existing code patterns (creates inconsistency)
- ❌ Docker HMR issues (may need container restart for new directories)

**The Compound Effect:**
- 60-70% time savings on complex features
- Fewer bugs (matching existing patterns)
- Better quality (using proven implementations)
- Less context switching (Serena maintains continuity)
- No babysitting AI (proper scope = autonomous execution)
