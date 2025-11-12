# FitForge Documentation Index

**Last Updated**: 2025-11-09
**Project**: FitForge-Local
**Documentation Status**: ✅ Complete

---

## 🚀 Quick Start

**New to FitForge?** Start here:
1. [Project Overview](./project-overview.md) - Vision, architecture, current status
2. [Tech Stack](./tech-stack.md) - Technologies and tools
3. [API Endpoints](./api-endpoints.md) - REST API reference

**Starting Development?** Read this:
1. [Project Overview](./project-overview.md#quick-start-guide) - Setup instructions
2. [Tech Stack](./tech-stack.md#development-workflow) - Docker Compose HMR workflow
3. [Logic Sandbox](./logic-sandbox/README.md) - Validated algorithms

---

## 📚 Core Documentation

### Project Information

**[Project Overview](./project-overview.md)**
- Executive summary and vision
- Technical architecture
- Development history
- Current status and roadmap
- Critical gaps analysis
- Quick start guide

**[Tech Stack](./tech-stack.md)**
- Frontend: React 19, Vite 6, TypeScript 5.8
- Backend: Express 4, SQLite, TypeScript
- Testing: Vitest, Storybook, Playwright
- Development workflow (Docker Compose HMR)
- Deployment (Railway production)

### Technical Reference

**[API Endpoints](./api-endpoints.md)**
- Complete REST API reference
- Request/response examples
- Error handling
- Implementation status
- cURL examples

**[Data Model](./data-model.md)** _(To be generated)_
- Database schema (7 tables)
- Entity relationships
- Exercise library structure
- Indexes and constraints

**[Component Architecture](./component-architecture.md)** _(To be generated)_
- React component hierarchy
- Context providers
- Routing structure
- State management patterns

**[Business Logic](./business-logic.md)** _(To be generated)_
- Fatigue calculation algorithm
- Recovery projection
- Exercise recommendation scoring
- Baseline learning model
- Progressive overload system

---

## 🧪 Logic Sandbox (Validated Algorithms)

The logic sandbox contains fully validated algorithms ready for production integration.

**[Logic Sandbox README](./logic-sandbox/README.md)**
- ✅ Validation status (Phase 1 complete)
- Test scenarios and results
- Data schema reference
- Formulas and calculations

**[Next Steps](./logic-sandbox/NEXT-STEPS.md)**
- Reality check: 80% done!
- Implementation plan (18-27 hours)
- What's missing vs. what exists
- Quick win roadmap

**[Implementation Roadmap](./logic-sandbox/implementation-roadmap.md)**
- Phase-by-phase implementation guide
- Backend services to build
- API endpoints to add
- Frontend integration tasks
- Testing checklist

**[Workout Recommendations Algorithm](./logic-sandbox/workout-builder-recommendations.md)**
- Exercise scoring algorithm
- Recommendation logic
- Filtering and safety checks

**Feature Specifications**:
- [Post-Workout Actions](./logic-sandbox/feature-ideas/post-workout-actions.md) - 15 features (MVP prioritized)
- [Pre-Workout Forecast](./logic-sandbox/feature-ideas/pre-workout-forecast.md) - Real-time forecast, sliders, AI optimizer

**Validated Data**:
- [exercises.json](./logic-sandbox/exercises.json) - 48 exercises with corrected muscle engagement
- [baselines.json](./logic-sandbox/baselines.json) - Muscle baseline data
- [workouts/](./logic-sandbox/workouts/) - Test workout logs
- [calculations/](./logic-sandbox/calculations/) - Validation results

---

## 📋 Implementation Plans

**[Plans Directory](./plans/)**

Active plans for ongoing development work.

**Current Plans**:
- 2025-11-07: App health triage
- 2025-11-07: Fix critical app crashes
- 2025-11-07: Template card crash fix
- 2025-11-07: Workout template loading
- 2025-11-07: Group sets by exercise
- 2025-11-08: Muscle fatigue calculation
- 2025-11-08: Horizontal inline set logging
- And 10 more archived plans...

---

## 🔄 OpenSpec Change Proposals

**[OpenSpec Changes README](../openspec/changes/README.md)**

Structured change proposals documenting feature evolution.

**Active Proposals**: 1
- Personal Muscle Engagement Calibration (draft)

**Recently Implemented**: 25+ proposals
- EMG Research Corrections (2025-10-27)
- A/B Variation Intelligence (2025-10-27)
- To-Failure Tracking UI (2025-10-26)
- Recovery Dashboard Components (2025-10-25)
- And 20+ more in archive/

**Archived**: `openspec/changes/archive/` (25+ proposals)

---

## 📝 Development History

**[CHANGELOG](../CHANGELOG.md)**

Chronological commit history with technical context.

**Format**: Commit hash → Files changed → Technical impact → UX notes

**Latest Entries**:
- 2025-11-08: Skip rest button, HMR dev environment
- 2025-11-07: Horizontal inline set logging
- 2025-11-07: Template save bug fix
- 2025-11-07: Critical crash fixes (5 bugs)
- 2025-10-31: Muscle fatigue calculation fix

**Audience**: AI-assisted debugging and developer reference

---

## 🎯 Critical Gaps & Next Steps

### 🔴 Blocking MVP (18-27 hours)

1. **Fatigue Calculation Service** (1-1.5 hours)
   - Port `calculate-workout-fatigue.mjs` → `backend/services/fatigueCalculator.js`
   - Connect to POST /api/muscle-states/calculate endpoint

2. **Recovery Time Projection** (0.5-1 hour)
   - Port `calculate-recovery.mjs` → `backend/services/recoveryCalculator.js`
   - Add GET /api/recovery/timeline endpoint

3. **Exercise Recommendation Engine** (2-3 hours)
   - Implement scoring algorithm in `backend/services/exerciseRecommender.js`
   - Connect to POST /api/recommendations/exercises endpoint

4. **Frontend Integration** (2-3 hours)
   - Connect WorkoutBuilder to recommendation API
   - Connect RecoveryDashboard to live muscle states
   - Wire up baseline update prompts

5. **Testing & Deployment** (4-8 hours)
   - Local Docker testing
   - Railway deployment
   - Smoke testing

**Total**: 18-27 hours (3-4 days)

### 🟡 Post-MVP Enhancements

- Baseline learning system (adaptive personalization)
- Progressive overload tracking
- UX/UI brainstorming and design refinement
- Exercise library corrections (10-15 exercises)
- Mobile responsiveness improvements

---

## 🔍 Finding Things

### By Topic

**Getting Started**:
- Setup: [Project Overview](./project-overview.md#quick-start-guide)
- Architecture: [Project Overview](./project-overview.md#technical-architecture)
- Development: [Tech Stack](./tech-stack.md#development-workflow)

**API Development**:
- Endpoints: [API Endpoints](./api-endpoints.md)
- Database: [Data Model](./data-model.md) _(To be generated)_
- Business Logic: [Business Logic](./business-logic.md) _(To be generated)_

**Frontend Development**:
- Components: [Component Architecture](./component-architecture.md) _(To be generated)_
- State: [Component Architecture](./component-architecture.md#context-providers) _(To be generated)_
- Routing: [Tech Stack](./tech-stack.md#routing-structure)

**Algorithms**:
- Fatigue: [Logic Sandbox README](./logic-sandbox/README.md#formulas-to-validate)
- Recovery: [Logic Sandbox README](./logic-sandbox/README.md#recovery-calculation-mvp-linear)
- Recommendations: [Workout Recommendations](./logic-sandbox/workout-builder-recommendations.md)

### By File Type

**Markdown Documentation** (`.md`):
- `/docs/*.md` - Core documentation
- `/docs/logic-sandbox/*.md` - Validated algorithms
- `/docs/plans/*.md` - Implementation plans
- `/openspec/changes/README.md` - Change proposals

**JSON Data** (`.json`):
- `/docs/logic-sandbox/exercises.json` - Validated exercise data
- `/docs/logic-sandbox/baselines.json` - Muscle baseline data
- `/docs/logic-sandbox/workouts/*.json` - Test workout logs

**Code** (`.ts`, `.tsx`, `.js`):
- `/components/*.tsx` - React UI components
- `/contexts/*.tsx` - React Context providers
- `/shared/*.ts` - Shared TypeScript code
- `/backend/*.ts` - Express API backend

**Database** (`.sql`):
- `/backend/database/schema.sql` - SQLite database schema

---

## 🏗️ Project Structure

```
FitForge-Local/
├── docs/                       # 📚 Documentation (YOU ARE HERE)
│   ├── index.md               # Master index
│   ├── project-overview.md    # Project summary
│   ├── tech-stack.md          # Technology reference
│   ├── api-endpoints.md       # REST API docs
│   ├── logic-sandbox/         # Validated algorithms
│   │   ├── README.md          # Validation status
│   │   ├── NEXT-STEPS.md      # Implementation guide
│   │   ├── exercises.json     # Exercise data
│   │   ├── baselines.json     # Baseline data
│   │   └── scripts/           # Calculation scripts
│   └── plans/                 # Implementation plans
│
├── components/                 # React UI components
├── contexts/                  # React Context providers
├── shared/                    # Shared TypeScript code
│   ├── exercise-library.ts   # Exercise database
│   ├── types.ts              # Type definitions
│   └── muscle-groups.ts      # Muscle mappings
│
├── backend/                   # Express API
│   ├── server.ts             # Main server
│   ├── database/             # SQLite operations
│   │   ├── schema.sql        # Database schema
│   │   ├── database.js       # CRUD operations
│   │   └── analytics.ts      # Metrics calculation
│   └── services/             # Business logic (to be built)
│
├── openspec/                  # OpenSpec proposals
│   └── changes/
│       ├── README.md          # Change log
│       └── archive/           # 25+ completed proposals
│
├── docker-compose.yml         # Local dev environment
├── Dockerfile                 # Production build
├── package.json               # Frontend dependencies
└── CHANGELOG.md               # Commit history
```

---

## 📖 Documentation Standards

### File Naming
- Use kebab-case: `project-overview.md`
- Descriptive names: `api-endpoints.md` not `api.md`
- Date prefixes for plans: `2025-11-07-fix-crash.md`

### Markdown Formatting
- Start with H1 title
- Include "Last Updated" date
- Use emoji sparingly for visual hierarchy
- Code blocks with language hints
- Internal links use relative paths

### Status Markers
- ✅ Complete
- ⚠️ Partial/In Progress
- ❌ Not Started
- 🔴 Critical
- 🟡 Important
- 🟢 Minor

---

## 🤝 Contributing

### Documentation Updates
- Run document-project workflow when structure changes
- Update CHANGELOG.md for all commits
- Archive OpenSpec proposals when completed
- Keep index.md current with new files

### Code Changes
- Follow BMM (BMad Method) workflow
- Create OpenSpec proposals for features
- Validate logic in sandbox before production
- Update relevant documentation

---

## 🆘 Need Help?

**Can't find something?**
- Check this index for links
- Search for keywords in files
- Review OpenSpec changes for feature history
- Check CHANGELOG for recent changes

**Starting a new feature?**
1. Review [Logic Sandbox](./logic-sandbox/README.md) for validated logic
2. Check [OpenSpec Archive](../openspec/changes/archive/) for similar features
3. Read [Next Steps](./logic-sandbox/NEXT-STEPS.md) for implementation guidance

**Found a bug?**
- Check [CHANGELOG](../CHANGELOG.md) for recent fixes
- Review [Implementation Plans](./plans/) for known issues
- Check [Project Overview](./project-overview.md#known-issues--technical-debt)

---

## 📊 Documentation Coverage

### ✅ Complete
- Project overview and vision
- Technology stack reference
- API endpoint catalog
- Logic sandbox validation
- Development workflow
- OpenSpec change history
- CHANGELOG with commit details

### 🏗️ To Be Generated
- Detailed data model documentation
- Component architecture diagrams
- Business logic detailed reference
- Test coverage reports
- Performance benchmarks

---

## 🔗 External Links

**Production Deployment**:
- https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Development**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Related Projects**:
- OpenSpec: Structured change proposals
- Superpowers: AI-assisted development workflow
- BMad Method: Brownfield project methodology

---

**Maintained by**: AI-assisted documentation workflow (BMad Method)
**Generated**: 2025-11-09 via document-project workflow
**Next Update**: When project structure changes significantly
