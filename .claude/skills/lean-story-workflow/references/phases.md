# Story Phases Quick Reference

## Phase Flow
```
DRAFT → IN PROGRESS → IMPLEMENTED → VERIFIED → DONE
```

---

## DRAFT

**Indicators:**
- Story file status: "Draft" or empty
- No TodoWrite tasks created
- No commits referencing this story

**Duration:** 5-10 minutes

**Immediate Actions:**
1. Read story file completely
2. Use Serena for code understanding if needed
3. Create TodoWrite from Tasks section
4. Update status to "In Progress"
5. Initial commit

**Output:** Clear understanding of work, task list ready

---

## IN PROGRESS

**Indicators:**
- Story file status: "In Progress"
- Active TodoWrite tasks
- Recent commits for this story

**Duration:** Variable (depends on story size)

**Immediate Actions:**
1. Check which task is current (TodoWrite)
2. Implement that ONE task
3. Commit after completion
4. Mark todo done
5. Move to next task

**Key Discipline:**
- One task at a time
- Small commits (not giant changesets)
- Keep todo list current
- Don't jump ahead

**Output:** Incremental progress, traceable commits

---

## IMPLEMENTED

**Indicators:**
- Story file status: "Implemented"
- All TodoWrite tasks complete
- All code written

**Duration:** 10-20 minutes (verification time)

**CRITICAL:** This is where verification gates apply

**Immediate Actions:**
1. Run `npm run build` - MUST PASS
2. Run relevant tests - MUST PASS (or document pre-existing)
3. Check each AC is satisfied
4. Fix any issues found
5. Only then update status

**Output:** Evidence that code works

---

## VERIFIED

**Indicators:**
- Story file status: "Verified"
- Build passes
- Tests pass
- ACs satisfied

**Duration:** 10 minutes

**Immediate Actions:**
1. Update Dev Agent Record in story file
2. Optional: Write Serena memory
3. Final commit with story reference
4. Update status to "Done"

**Output:** Complete documentation, final commit

---

## DONE

**Indicators:**
- Story file status: "Done"
- All commits made
- Documentation complete

**Immediate Actions:**
- None, story is complete
- Move to next story if continuing

---

## Phase Transitions

### DRAFT → IN PROGRESS
**Trigger:** Starting work on story
**Required:** Understanding of story requirements
**Artifact:** TodoWrite task list created

### IN PROGRESS → IMPLEMENTED
**Trigger:** All tasks complete
**Required:** All TodoWrite items done
**Artifact:** Code changes committed

### IMPLEMENTED → VERIFIED
**Trigger:** Verification gates pass
**Required:** Build passes, tests pass, ACs met
**Artifact:** Evidence of verification

### VERIFIED → DONE
**Trigger:** Documentation complete
**Required:** Dev Agent Record updated
**Artifact:** Final commit

---

## Current Phase Detection

To quickly determine phase:

```
1. Read story status field
   - "Draft" or empty → DRAFT phase
   - "In Progress" → IN PROGRESS phase
   - "Implemented" → IMPLEMENTED phase
   - "Verified" → VERIFIED phase
   - "Done" → DONE phase
   - "Ready for Review" → Treat as IMPLEMENTED (needs verification)

2. Cross-check with reality:
   - git status: uncommitted work?
   - TodoWrite: tasks in progress?
   - Recent commits: what was last done?
```

---

## Stuck in a Phase?

### Stuck in IN PROGRESS
- Task too large? Break it down further
- Unclear requirements? Re-read AC
- Code complexity? Use Serena to understand dependencies

### Stuck in IMPLEMENTED (can't pass verification)
- Build fails? Fix syntax/type errors
- Tests fail? Determine if new or pre-existing
- AC unclear? Document interpretation in story notes

### Regressed from VERIFIED
- New issue found? Update status back to IMPLEMENTED
- Honest status is better than false completion
