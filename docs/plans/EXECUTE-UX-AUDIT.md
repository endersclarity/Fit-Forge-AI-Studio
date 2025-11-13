# AUTONOMOUS EXECUTION INSTRUCTIONS

## For Claude: Run This Entire Plan Without User Input

**USER REQUEST:** Execute the complete UX audit (all 4 phases, 20 tasks) autonomously while user is away.

**CRITICAL INSTRUCTIONS:**
1. ✅ **DO NOT STOP** between phases or tasks - keep going automatically
2. ✅ **DO NOT ASK** for user confirmation or input - make autonomous decisions
3. ✅ **DO COMMIT** after each major artifact is created
4. ✅ **DO DOCUMENT** all findings as you go
5. ✅ **DO USE AGENTS** as specified in each task (Explore, best-practices-researcher, etc.)
6. ✅ **DO COMPLETE** all 4 phases before stopping

**EXECUTION COMMAND:**
Run all tasks in `docs/plans/2025-11-12-ux-audit-and-redesign.md` sequentially:

---

## Phase 1: Current State Audit (Tasks 1.1 - 1.5)

**Run autonomously:**
- Task 1.1: Launch Explore agent, document component architecture, commit
- Task 1.2: Launch Explore agent for workout logging, document findings, commit
- Task 1.3: Launch Explore agent for exercise selection, document findings, commit
- Task 1.4: Launch pattern-recognition-specialist for modals/navigation, document, commit
- Task 1.5: Launch Explore agent for visual hierarchy, document, create Phase 1 summary, commit

**Expected Output:** `docs/ux-audit/01-current-state-audit.md` with complete analysis

---

## Phase 2: Fitbod Pattern Analysis (Tasks 2.1 - 2.4)

**Run autonomously:**
- Task 2.1: Launch best-practices-researcher for Fitbod workout logging flows, document, commit
- Task 2.2: Launch best-practices-researcher for Fitbod exercise selection, document, commit
- Task 2.3: Launch pattern-recognition-specialist for Fitbod modal/nav patterns, document, commit
- Task 2.4: Launch best-practices-researcher for Fitbod visual design, create Phase 2 summary, commit

**Expected Output:** `docs/ux-audit/02-fitbod-pattern-analysis.md` with extracted patterns

---

## Phase 3: Gap Analysis (Tasks 3.1 - 3.5)

**Run autonomously:**
- Task 3.1: Launch architecture-strategist to compare FitForge vs Fitbod, document gaps, commit
- Task 3.2: Create prioritization matrix automatically (calculate impact × effort scores), commit
- Task 3.3: Write detailed recommendations for top 10 issues with code examples, commit
- Task 3.4: Document visual mockup proposals (text descriptions, no need to generate actual mockups), commit
- Task 3.5: Write executive summary, commit

**Expected Output:** `docs/ux-audit/03-gap-analysis.md` with prioritized recommendations

---

## Phase 4: Implementation Roadmap (Tasks 4.1 - 4.5)

**Run autonomously:**
- Task 4.1: Convert top 10-15 recommendations into user stories with acceptance criteria, commit
- Task 4.2: Create dependency graph (mermaid diagram), commit
- Task 4.3: Document testing strategy, commit
- Task 4.4: Create rollout plan with feature flags, commit
- Task 4.5: Create master index linking all documents, final commit

**Expected Output:** `docs/ux-audit/04-implementation-roadmap.md` + `docs/ux-audit/00-index.md`

---

## Success Criteria

When complete, the following should exist:

```
docs/ux-audit/
├── 00-index.md                    ✅ Master index
├── 01-current-state-audit.md      ✅ Phase 1 complete
├── 02-fitbod-pattern-analysis.md  ✅ Phase 2 complete
├── 03-gap-analysis.md             ✅ Phase 3 complete
└── 04-implementation-roadmap.md   ✅ Phase 4 complete
```

**Git History:** 20+ commits documenting each task completion

**Final Message to User:**
```
✅ UX Audit Complete!

All 4 phases finished:
- Phase 1: Current state analyzed (X issues identified)
- Phase 2: Fitbod patterns extracted (Y patterns documented)
- Phase 3: Gap analysis with prioritization matrix
- Phase 4: Implementation roadmap with Z user stories

Review: docs/ux-audit/00-index.md

Ready to start implementation!
```

---

## Autonomous Decision-Making Guidelines

**When multiple options exist, automatically choose:**
- **Thoroughness level:** "very thorough" for Phases 1-2, "medium" for later phases
- **Documentation style:** Detailed with code examples and file references
- **Prioritization:** Impact × Effort scoring (High=3, Medium=2, Low=1)
- **Story count:** Top 10-15 most impactful issues become stories
- **Mockup generation:** Text descriptions only (no HTML generation during autonomous run)

**If agent returns incomplete data:**
- Document what was found
- Note gaps in documentation
- Continue to next task (don't block)

**If error occurs:**
- Document the error in the relevant markdown file
- Attempt to continue with next task
- Report all errors at end

---

## START EXECUTION NOW

**Claude:** Begin autonomous execution of all 20 tasks. Do not stop until Phase 4 Task 4.5 is complete.

Run time estimate: 30-60 minutes of continuous agent work.

**GO!** 🚀
