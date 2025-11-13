# Automated BMAD Workflow Execution Plan
## UI Redesign with Premium Design System

**Created:** 2025-11-12
**Project:** FitForge-Local
**Epic:** Epic 5 - Premium UI Design System Implementation
**Execution Mode:** Fully Automated (Hands-Off)

---

## 🎯 Objective

Execute the complete BMAD workflow cycle for implementing the premium UI design system (inspired by Stitch AI output) using automated task agents. This will create:
1. PRD for UI redesign
2. UX design formalization
3. Architecture for design system + migration
4. Gate check validation
5. Sprint planning with stories

**User Involvement:** Minimal - only after sprint planning is complete

---

## 📋 Execution Sequence

### Phase 1: PRD Creation
**Workflow:** `/bmad:bmm:workflows:prd`
**Agent:** PM (John)
**Context Sources:**
- `docs/ux-audit/` (all 4 files - comprehensive UX analysis)
- `docs/design-system.md` (extracted Stitch design system)
- `docs/design-system-implementation-roadmap.md` (15.5 day plan)
- `docs/ux-audit/stitch_expanded_set_view/` (AI-generated design reference)
- Current FitForge components (for "before" state)

**Task Agent Instructions:**
```
Launch PM agent (John) to create a comprehensive PRD for "Premium UI Design System Implementation"

Context to provide:
1. UX Audit Summary:
   - 15 critical UX issues identified
   - 50+ Fitbod patterns analyzed
   - 23 gaps prioritized with impact scores
   - 15 user stories already outlined (use as foundation)
   - 60% interaction reduction potential
   - 3x larger touch targets needed
   - 4-6 week implementation estimate

2. Design Vision (from Stitch output):
   - Cinzel serif + Lato sans-serif typography
   - Sophisticated blue palette (#758AC6, #344161)
   - Glass morphism aesthetic (semi-transparent surfaces)
   - Premium fitness brand positioning
   - Classical strength meets modern clarity

3. Technical Context:
   - Brownfield React + TypeScript + Tailwind app
   - 96 existing components to potentially migrate
   - Hot reload dev environment (Docker)
   - Production deployment on Railway
   - Need migration strategy (parallel vs replacement)

4. Business Goals:
   - Transform from "tech startup" to "premium fitness brand"
   - Increase user satisfaction by 30-40%
   - Reduce workout logging friction by 60%
   - Achieve WCAG 2.1 AA compliance
   - Differentiate from competitors

Output: docs/prd-ui-redesign-2025-11-12.md

The PRD should include:
- Executive summary
- Problem statement (current UX issues)
- Proposed solution (design system + component library)
- User stories (reference the 15 from UX audit)
- Success metrics
- Timeline and phases
- Risks and mitigations
```

**Expected Output:** `docs/prd-ui-redesign-2025-11-12.md`

---

### Phase 2: UX Design Formalization
**Workflow:** `/bmad:bmm:workflows:create-ux-design`
**Agent:** UX Designer (Sally)
**Context Sources:**
- `docs/prd-ui-redesign-2025-11-12.md` (from Phase 1)
- `docs/design-system.md` (Stitch extraction)
- `docs/design-system-colors.md` (color specifications)
- `docs/design-system-quick-reference.md` (component patterns)
- `docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/screen.png`

**Task Agent Instructions:**
```
Launch UX Designer agent (Sally) to formalize the UI design system

Context to provide:
1. PRD from Phase 1 (full document)

2. Design System Already Extracted:
   - Complete color palette (11 colors with hex codes)
   - Typography system (Cinzel display, Lato body)
   - Spacing scale (4px base, 8 steps)
   - Border radius scale (5 variants)
   - Shadow system (4 types)
   - 6 major component patterns documented

3. AI-Generated Reference:
   - Stitch output shows target aesthetic
   - Exercise picker drawer is the exemplar
   - Glass morphism, rounded corners, elegant shadows
   - "Heavenly gradient" background
   - Premium, aspirational feel

4. Sally's Job:
   - Formalize design tokens (already 90% done)
   - Create component specifications
   - Define interaction patterns
   - Document accessibility requirements
   - Create design principles doc
   - Specify responsive behavior
   - Define animation guidelines

Output: docs/ux-design-premium-system-2025-11-12.md

The design doc should include:
- Design philosophy and principles
- Complete design token specifications
- Component library catalog (20+ components)
- Interaction patterns and micro-animations
- Responsive breakpoints
- Accessibility standards (WCAG 2.1 AA)
- Visual design examples
- Figma/design tool export specs
```

**Expected Output:** `docs/ux-design-premium-system-2025-11-12.md`

---

### Phase 3: Architecture Design
**Workflow:** `/bmad:bmm:workflows:architecture`
**Agent:** Architect (Winston)
**Context Sources:**
- `docs/prd-ui-redesign-2025-11-12.md` (from Phase 1)
- `docs/ux-design-premium-system-2025-11-12.md` (from Phase 2)
- `docs/design-system-implementation-roadmap.md` (15.5 day timeline)
- Current codebase structure (components/, frontend/src/)
- `tailwind.config.js` (current config)
- `package.json` (current dependencies)

**Task Agent Instructions:**
```
Launch Architect agent (Winston) to design the technical architecture for UI redesign

Context to provide:
1. PRD and UX Design docs from Phases 1-2

2. Current Technical State:
   - 96 React components across 9 subdirectories
   - Tailwind CSS (CDN currently, needs PostCSS migration)
   - No formal component library
   - Props drilling issues in Dashboard
   - Inconsistent modal patterns
   - <10% test coverage

3. Design System Requirements:
   - Install @fontsource/cinzel and @fontsource/lato
   - Update tailwind.config.js with new color palette
   - Create design token system
   - Build component library (Button, Card, Modal, BottomSheet, etc.)
   - Migrate 96 existing components

4. Architectural Decisions Needed:
   - Component library structure (where to place new components?)
   - Migration strategy (parallel development vs replacement?)
   - Feature flag approach (gradual rollout)
   - State management for new components (Context? Zustand?)
   - Testing strategy (Storybook? Visual regression?)
   - Performance considerations (bundle size impact)
   - Rollback plan (if users hate it)
   - Build process changes (Tailwind PostCSS, font loading)

5. Key Constraints:
   - Cannot break existing functionality
   - Must maintain hot reload in Docker
   - Production deployment on Railway must continue working
   - Need backwards compatibility during migration
   - Timeline: 15.5 days (3 weeks)

Output: docs/architecture-ui-redesign-2025-11-12.md

The architecture doc should include:
- Component library structure
- Migration phases (6 phases from roadmap)
- Feature flag strategy
- Tailwind configuration changes
- Dependency additions
- Testing approach
- Performance considerations
- Rollback procedures
- File structure changes
- Build process updates
```

**Expected Output:** `docs/architecture-ui-redesign-2025-11-12.md`

---

### Phase 4: Solutioning Gate Check
**Workflow:** `/bmad:bmm:workflows:solutioning-gate-check`
**Agent:** Architect (Winston)
**Context Sources:**
- `docs/prd-ui-redesign-2025-11-12.md` (Phase 1)
- `docs/ux-design-premium-system-2025-11-12.md` (Phase 2)
- `docs/architecture-ui-redesign-2025-11-12.md` (Phase 3)

**Task Agent Instructions:**
```
Launch Architect agent (Winston) to perform gate check validation

Context to provide:
All three documents from Phases 1-3

Gate Check Validation:
1. PRD ↔ UX Design Alignment
   - Do design tokens match PRD requirements?
   - Are all user stories designable with this system?
   - Does design support accessibility goals (WCAG 2.1 AA)?
   - Are success metrics measurable with this design?

2. UX Design ↔ Architecture Alignment
   - Can architecture implement all design components?
   - Is migration strategy realistic for timeline?
   - Are dependencies correct for design system?
   - Do feature flags enable gradual rollout?

3. PRD ↔ Architecture Alignment
   - Does architecture solve the problems in PRD?
   - Is timeline achievable (15.5 days vs PRD estimate)?
   - Are risks from PRD mitigated by architecture?
   - Can success metrics be tracked with this approach?

4. Gaps and Conflicts
   - Identify any contradictions between docs
   - Find missing requirements
   - Spot technical feasibility issues
   - Note scope creep risks

Output: docs/implementation-readiness-ui-redesign-2025-11-12.md

The gate check report should include:
- Alignment matrix (PRD ↔ Design ↔ Architecture)
- Identified gaps or conflicts
- Recommendations for resolution
- Risk assessment
- Go/No-Go decision with justification
- Prerequisites before starting implementation
```

**Expected Output:** `docs/implementation-readiness-ui-redesign-2025-11-12.md`

---

### Phase 5: Sprint Planning
**Workflow:** `/bmad:bmm:workflows:sprint-planning`
**Agent:** Scrum Master (Bob)
**Context Sources:**
- `docs/prd-ui-redesign-2025-11-12.md` (Phase 1)
- `docs/ux-design-premium-system-2025-11-12.md` (Phase 2)
- `docs/architecture-ui-redesign-2025-11-12.md` (Phase 3)
- `docs/implementation-readiness-ui-redesign-2025-11-12.md` (Phase 4)
- `docs/design-system-implementation-roadmap.md` (15.5 day plan with phases)
- `docs/ux-audit/04-implementation-roadmap.md` (15 user stories)

**Task Agent Instructions:**
```
Launch Scrum Master agent (Bob) to create Epic 5 sprint plan

Context to provide:
All documents from Phases 1-4, plus implementation roadmap

Sprint Planning Requirements:
1. Create Epic 5 in .bmad-ephemeral/sprint-status.yaml
2. Break down into user stories (suggest 15-20 stories)
3. Organize into 3 sprints based on roadmap phases:
   - Sprint 1 (Week 1): Foundation - Design tokens, base components
   - Sprint 2 (Weeks 2-3): Migration - Migrate existing screens
   - Sprint 3 (Week 4): Polish - Animations, testing, deployment

4. Reference the 15 stories from UX audit:
   - Story 1.1: Enlarge touch targets (P0)
   - Story 1.2: Equipment filtering (P0)
   - Story 1.3: Modal dismiss standardization (P0)
   - Story 1.4: Reduce modal nesting (P0)
   - Story 2.1: Inline number pickers (P1)
   - Story 2.2: Auto-starting rest timer (P1)
   - Story 2.3: Smart logging shortcuts (P1)
   - Story 2.4: Bottom sheet component (P1)
   - Story 2.5: Typography scale (P1)
   - Story 3.1: Button standardization (P2)
   - Story 3.2: Three-tab exercise picker (P2)
   - Story 3.3: Dashboard progressive disclosure (P2)
   - Story 3.4: Empty state improvements (P2)
   - Story 3.5: Loading skeletons (P2)
   - Story 3.6: Card consistency (P2)

5. Add architecture-specific stories:
   - Install fonts and update Tailwind config
   - Create Storybook setup
   - Build design token system
   - Implement feature flags
   - Setup visual regression testing

6. Each story needs:
   - Clear acceptance criteria
   - File dependencies
   - Time estimate
   - Story dependencies
   - Testing requirements

Output: .bmad-ephemeral/sprint-status.yaml (updated with Epic 5)

The sprint plan should include:
- Epic 5 definition and goals
- 15-20 user stories organized by sprint
- Dependencies mapped
- Time estimates totaling ~15.5 days
- Clear DoD for each story
- Testing strategy per story
```

**Expected Output:** `.bmad-ephemeral/sprint-status.yaml` (updated with Epic 5)

---

## 🤖 Automation Execution Plan

### Sequential Task Agent Launches

Each phase launches in sequence, passing context forward:

```typescript
// Phase 1: PRD
Task.launch({
  agent: "pm",
  workflow: "/bmad:bmm:workflows:prd",
  context: [
    "docs/ux-audit/**/*",
    "docs/design-system*.md"
  ],
  output: "docs/prd-ui-redesign-2025-11-12.md"
})

// Phase 2: UX Design (waits for Phase 1)
Task.launch({
  agent: "ux-designer",
  workflow: "/bmad:bmm:workflows:create-ux-design",
  context: [
    "docs/prd-ui-redesign-2025-11-12.md", // FROM PHASE 1
    "docs/design-system*.md",
    "docs/ux-audit/stitch_expanded_set_view/**/*"
  ],
  output: "docs/ux-design-premium-system-2025-11-12.md"
})

// Phase 3: Architecture (waits for Phase 2)
Task.launch({
  agent: "architect",
  workflow: "/bmad:bmm:workflows:architecture",
  context: [
    "docs/prd-ui-redesign-2025-11-12.md", // FROM PHASE 1
    "docs/ux-design-premium-system-2025-11-12.md", // FROM PHASE 2
    "docs/design-system-implementation-roadmap.md",
    "components/**/*", // CURRENT CODEBASE
    "tailwind.config.js",
    "package.json"
  ],
  output: "docs/architecture-ui-redesign-2025-11-12.md"
})

// Phase 4: Gate Check (waits for Phase 3)
Task.launch({
  agent: "architect",
  workflow: "/bmad:bmm:workflows:solutioning-gate-check",
  context: [
    "docs/prd-ui-redesign-2025-11-12.md", // PHASE 1
    "docs/ux-design-premium-system-2025-11-12.md", // PHASE 2
    "docs/architecture-ui-redesign-2025-11-12.md" // PHASE 3
  ],
  output: "docs/implementation-readiness-ui-redesign-2025-11-12.md"
})

// Phase 5: Sprint Planning (waits for Phase 4)
Task.launch({
  agent: "sm",
  workflow: "/bmad:bmm:workflows:sprint-planning",
  context: [
    "docs/prd-ui-redesign-2025-11-12.md", // PHASE 1
    "docs/ux-design-premium-system-2025-11-12.md", // PHASE 2
    "docs/architecture-ui-redesign-2025-11-12.md", // PHASE 3
    "docs/implementation-readiness-ui-redesign-2025-11-12.md", // PHASE 4
    "docs/design-system-implementation-roadmap.md",
    "docs/ux-audit/04-implementation-roadmap.md"
  ],
  output: ".bmad-ephemeral/sprint-status.yaml"
})
```

---

## 📦 Context Package for Each Phase

### Phase 1 (PRD) - Context Bundle
```
Required Files:
- docs/ux-audit/00-index.md
- docs/ux-audit/01-current-state-audit.md
- docs/ux-audit/02-fitbod-pattern-analysis.md
- docs/ux-audit/03-gap-analysis.md
- docs/ux-audit/04-implementation-roadmap.md
- docs/design-system.md
- docs/design-system-implementation-roadmap.md
- docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/screen.png

Key Instructions for PM:
- Problem: Current UI has 15 critical issues (see 01-current-state-audit.md)
- Solution: Premium design system (see design-system.md)
- Reference: Stitch AI output shows target aesthetic
- Scope: 15 user stories (see 04-implementation-roadmap.md)
- Timeline: 15.5 days (3 weeks)
- Success Metrics: 60% interaction reduction, 30-40% satisfaction increase
```

### Phase 2 (UX Design) - Context Bundle
```
Required Files:
- docs/prd-ui-redesign-2025-11-12.md (OUTPUT FROM PHASE 1)
- docs/design-system.md
- docs/design-system-colors.md
- docs/design-system-quick-reference.md
- docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/code.html
- docs/ux-audit/stitch_expanded_set_view/exercise_picker_drawer/screen.png

Key Instructions for UX Designer:
- Design system 90% extracted from Stitch (just formalize it)
- Create component specs (Button, Card, Modal, BottomSheet, etc.)
- Document interaction patterns (hover, active, focus states)
- Define animation guidelines (spring physics, timing)
- Specify responsive behavior (mobile-first)
- WCAG 2.1 AA compliance requirements
```

### Phase 3 (Architecture) - Context Bundle
```
Required Files:
- docs/prd-ui-redesign-2025-11-12.md (PHASE 1)
- docs/ux-design-premium-system-2025-11-12.md (PHASE 2)
- docs/design-system-implementation-roadmap.md
- components/ (all subdirectories)
- tailwind.config.js
- package.json
- vite.config.ts
- docker-compose.yml

Key Instructions for Architect:
- Current state: 96 components, props drilling, inconsistent patterns
- Target state: Component library + design tokens
- Migration: 6 phases (preparation → foundation → migration → testing → launch → optimization)
- Key decisions: Feature flags, state management, testing strategy
- Constraints: Cannot break existing features, maintain hot reload
- Timeline: 15.5 days
```

### Phase 4 (Gate Check) - Context Bundle
```
Required Files:
- docs/prd-ui-redesign-2025-11-12.md (PHASE 1)
- docs/ux-design-premium-system-2025-11-12.md (PHASE 2)
- docs/architecture-ui-redesign-2025-11-12.md (PHASE 3)

Key Instructions for Architect:
- Validate ALL THREE docs align (no contradictions)
- Check: Can design be implemented with this architecture?
- Check: Does architecture solve PRD problems?
- Check: Are timelines realistic?
- Check: Are risks mitigated?
- Output: Go/No-Go decision
```

### Phase 5 (Sprint Planning) - Context Bundle
```
Required Files:
- docs/prd-ui-redesign-2025-11-12.md (PHASE 1)
- docs/ux-design-premium-system-2025-11-12.md (PHASE 2)
- docs/architecture-ui-redesign-2025-11-12.md (PHASE 3)
- docs/implementation-readiness-ui-redesign-2025-11-12.md (PHASE 4)
- docs/design-system-implementation-roadmap.md
- docs/ux-audit/04-implementation-roadmap.md
- .bmad-ephemeral/sprint-status.yaml

Key Instructions for Scrum Master:
- Create Epic 5 in sprint-status.yaml
- Use the 15 stories from UX audit as foundation
- Add architecture-specific stories (fonts, Tailwind, Storybook, etc.)
- Organize into 3 sprints (weeks 1, 2-3, 4)
- Map dependencies clearly
- Total: ~15.5 days effort
```

---

## ⚠️ Critical Requirements

### Context Awareness
Each agent MUST:
1. Read ALL provided context files completely
2. Reference specific findings from previous phases
3. Maintain consistency with earlier decisions
4. Build incrementally (don't start from scratch)

### Document Quality
Each output MUST:
1. Be comprehensive (no placeholders or TODOs)
2. Include specific examples and code snippets
3. Reference context sources (cite which file informed decisions)
4. Be immediately actionable (developers can start coding from it)

### Handoff Quality
Each phase MUST:
1. Produce the expected output file
2. Confirm file exists before next phase starts
3. Pass file path to next agent explicitly
4. Summarize key decisions for next agent

---

## 🎬 Execution Command

**User says:** "Go"

**Claude executes:**
```
Phase 1: Launch PRD agent
↓ (waits for completion)
Phase 2: Launch UX Design agent
↓ (waits for completion)
Phase 3: Launch Architecture agent
↓ (waits for completion)
Phase 4: Launch Gate Check agent
↓ (waits for completion)
Phase 5: Launch Sprint Planning agent
↓
DONE - Return control to user
```

**User involvement:** ZERO until Phase 5 completes

**Estimated time:** 30-45 minutes (depends on agent speed)

---

## ✅ Success Criteria

By the end, we should have:
1. ✅ `docs/prd-ui-redesign-2025-11-12.md` (comprehensive PRD)
2. ✅ `docs/ux-design-premium-system-2025-11-12.md` (formalized design system)
3. ✅ `docs/architecture-ui-redesign-2025-11-12.md` (technical architecture)
4. ✅ `docs/implementation-readiness-ui-redesign-2025-11-12.md` (gate check report)
5. ✅ `.bmad-ephemeral/sprint-status.yaml` (Epic 5 with 15-20 stories)

**Result:** Ready to execute Epic 5 using `bmad-epic-sprint` skill

---

## 🚀 Next Steps (After Automation)

**User returns and runs:**
```bash
# Review the 5 generated documents
# Verify Epic 5 in sprint-status.yaml

# Execute Epic 5
/bmad-epic-sprint 5
```

**This will:**
- Run each story in Epic 5 sequentially
- Code review between stories
- Update sprint-status.yaml automatically
- Implement the full UI redesign

---

## 📝 Notes

- Each workflow is context-sensitive (agents have access to all prior outputs)
- Agents use Task tool to avoid polluting main context
- Documents are comprehensive (no placeholders)
- Sprint planning creates immediately executable stories
- User can interrupt at any phase if needed
- All files are version controlled (can roll back)

**Ready to execute? Just say "Go"**
