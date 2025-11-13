# Gap-Fixing Execution Checklist

**Quick reference for executing the gap-fixing plan**

---

## Phase 1: Critical Pre-Epic 5 (1 Day)

### ✅ Task 1.1: Touch Target Audit (2 hours)

**Agent:** Explore (very thorough)

**Prompt:**
```
Audit all interactive elements in FitForge for WCAG touch target compliance (44×44px minimum).

Scan components/ directory and create a table with:
- Component name
- File path + line number
- Element type (button/input/link)
- Current size
- WCAG status (Pass/Fail)
- Priority (P0/P1/P2)

Output: docs/ux-audit/touch-target-audit.md
```

**Deliverable:**
- [ ] `docs/ux-audit/touch-target-audit.md` created
- [ ] All interactive elements catalogued
- [ ] Story 1.1 updated with specific file list

---

### ✅ Task 1.2: Modal Inventory Verification (1 hour)

**Agent:** Explore (medium)

**Prompt:**
```
Verify the modal inventory in Story 1.3 is complete.

Search components/ for:
- Files with "Modal" in name
- Components with className="fixed" or "absolute inset-0"
- Overlay/backdrop patterns

Compare findings to Story 1.3 list (11 modals). Document any missing modals.

For each modal, note current dismiss methods (X/backdrop/ESC/swipe).

Output: Update Story 1.3 in docs/ux-audit/04-implementation-roadmap.md
```

**Deliverable:**
- [ ] Modal inventory verified
- [ ] Current dismiss methods documented
- [ ] Story 1.3 updated if needed

---

### ✅ Task 1.3: Story Validation (3 hours)

**Agent:** Explore (medium)

**Prompt:**
```
Validate Sprint 1 story file references against current codebase.

For each file/line reference in Stories 1.1-1.4:
1. Verify file exists
2. Check line numbers are accurate
3. Confirm code structure matches story assumptions
4. Update if files moved/refactored

Output: Updated 04-implementation-roadmap.md with corrected paths
```

**Deliverable:**
- [ ] All Sprint 1 file paths validated
- [ ] Line numbers verified
- [ ] Any discrepancies documented
- [ ] Stories updated

---

### ✅ Task 1.4: Create Epic Structure (2 hours)

**Agent:** PM agent

**Prompt:**
```
Create 3 formal epic files from the UX roadmap sprints.

Epic 5: Critical UX Fixes (Stories 1.1-1.4, Week 1)
Epic 6: Interaction Efficiency (Stories 2.1-2.5, Weeks 2-3)
Epic 7: Visual Polish (Stories 3.1-3.6, Week 4)

For each epic, include:
- Epic goal/theme
- Success criteria
- Story list with checkboxes
- Dependencies
- Risk assessment
- Testing strategy
- Success metrics

Output: 3 files in docs/ux-audit/epics/
```

**Deliverable:**
- [ ] `docs/ux-audit/epics/epic-5-critical-ux-fixes.md`
- [ ] `docs/ux-audit/epics/epic-6-interaction-efficiency.md`
- [ ] `docs/ux-audit/epics/epic-7-visual-polish.md`

---

## Phase 1 Complete? ✅

**Checklist:**
- [ ] Touch target audit complete
- [ ] Modal inventory verified
- [ ] Story file references validated
- [ ] 3 epic files created
- [ ] **Epic 5 ready to start**

**Time Spent:** _____ hours (target: 8 hours)

---

## Phase 2: Story Enrichment (1 Day, Parallel)

### ✅ Task 2.1: Test Specifications (4 hours)

**Agent:** Tech Writer or Dev

**Prompt:**
```
Create detailed test specifications for UX roadmap components.

For each component in Sprints 1-2:
- Unit tests (component behavior)
- Integration tests (user flows)
- Accessibility tests (WCAG 2.1 AA)
- Manual tests (browsers/devices)

Format with test categories, checkboxes, expected behavior.

Output: docs/ux-audit/test-specifications.md
```

**Deliverable:**
- [ ] `docs/ux-audit/test-specifications.md` created
- [ ] All Sprint 1-2 components covered

---

### ✅ Task 2.2: Dependency Visualization (1 hour)

**Agent:** Architect or PM

**Prompt:**
```
Create Mermaid dependency diagrams for UX roadmap.

Diagrams:
1. Story dependency graph (all 15 stories)
2. Epic timeline (3 sprints)
3. Component dependencies

Highlight critical path and parallel work opportunities.

Output: docs/ux-audit/dependencies.md
```

**Deliverable:**
- [ ] `docs/ux-audit/dependencies.md` created
- [ ] 3 Mermaid diagrams included

---

### ✅ Task 2.3: Quantify Rollback Criteria (2 hours)

**Agent:** Architect or DevOps

**Prompt:**
```
Quantify rollback criteria and monitoring strategy.

Define:
1. Baseline metrics (current error rates, performance)
2. Trigger thresholds (when to rollback)
3. Monitoring tools (Sentry, Lighthouse CI, etc.)
4. Step-by-step rollback procedure

Output: Enhanced Rollback Plan section in 04-implementation-roadmap.md
```

**Deliverable:**
- [ ] Baseline metrics documented
- [ ] Thresholds quantified
- [ ] Monitoring tools specified
- [ ] Rollback procedure written

---

### ✅ Task 2.4: Timeline Documentation (1 hour)

**Agent:** PM

**Prompt:**
```
Document timeline assumptions and create realistic calendar estimates.

Clarify:
- Effort vs. calendar time
- Buffer for code review, testing, deployment
- Team size and hours/day assumptions
- Parallel work accounting

Output: Timeline Assumptions section in 04-implementation-roadmap.md
```

**Deliverable:**
- [ ] Timeline assumptions documented
- [ ] Realistic calendar estimates provided
- [ ] Resource allocation specified

---

## Phase 2 Complete? ✅

**Checklist:**
- [ ] Test specifications written
- [ ] Dependency diagrams created
- [ ] Rollback criteria quantified
- [ ] Timeline assumptions documented

**Time Spent:** _____ hours (target: 8 hours)

---

## Phase 3: Polish (0.5 Days, Optional)

### ✅ Task 3.1: Animation Examples (2 hours)

**Agent:** UX Designer or Dev

**Deliverable:**
- [ ] `docs/ux-audit/animation-specifications.md` created

---

### ✅ Task 3.2: Dark Mode Colors (2 hours)

**Agent:** UX Designer

**Deliverable:**
- [ ] `docs/ux-audit/design-tokens.md` created

---

## Overall Progress

**Phase 1 (Critical):** ☐ Not Started | ☐ In Progress | ☐ Complete
**Phase 2 (Enrichment):** ☐ Not Started | ☐ In Progress | ☐ Complete
**Phase 3 (Polish):** ☐ Not Started | ☐ In Progress | ☐ Complete | ☑️ Skipped

**Epic 5 Ready?** ☐ Yes | ☐ No (Phase 1 incomplete)

---

## Quick Commands

### Run Phase 1 with Subagent-Driven Development

```bash
# Invoke skill
/superpowers:subagent-driven-development

# Specify plan
docs/plans/GAP-FIXING-EXECUTION-PLAN.md

# Execute Phase 1 tasks (1.1, 1.2, 1.3, 1.4)
```

### Manual Task Execution

```bash
# Task 1.1 - Touch Target Audit
Task: "Audit all interactive elements for WCAG compliance"
Agent: Explore (very thorough)
Output: docs/ux-audit/touch-target-audit.md

# Task 1.2 - Modal Inventory
Task: "Verify modal inventory is complete"
Agent: Explore (medium)
Output: Update Story 1.3

# Task 1.3 - Story Validation
Task: "Validate Sprint 1 file references"
Agent: Explore (medium)
Output: Update 04-implementation-roadmap.md

# Task 1.4 - Epic Structure
Task: "Create 3 epic files"
Agent: PM
Output: docs/ux-audit/epics/*.md
```

---

## Success Metrics

**Phase 1 Success:**
- Touch target audit has specific component list
- Modal inventory verified (not just assumed)
- All file paths validated (no broken references)
- Epic files created with clear goals

**Ready for Epic 5 When:**
- All Phase 1 tasks complete
- Story 1.1 has specific files to modify (not vague "all buttons")
- Story 1.3 has complete modal list
- File paths validated

---

**Created:** 2025-11-12
**Status:** Ready to execute
**Estimated Time:** 1 day (Phase 1) + 1 day (Phase 2) + 0.5 days (Phase 3)
