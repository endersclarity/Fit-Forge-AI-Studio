# FitForge Project Overview

**Last Updated**: 2025-11-09
**Project Name**: FitForge-Local
**Type**: Multi-part (Frontend + Backend)
**Status**: 80-90% Infrastructure Complete, Ready for UX/UI Refinement

---

## Executive Summary

FitForge is an AI-powered fitness tracking application that uses **muscle-aware training logic** to optimize workout planning and recovery tracking. The core innovation is a validated fatigue calculation system that tracks muscle-specific recovery states and provides intelligent exercise recommendations.

**Current State**: The infrastructure is 80-90% complete with a working database schema, REST API, and React UI components. The validated calculation algorithms exist in the logic-sandbox but need integration into the backend services. Primary focus now is UX/UI refinement and connecting validated logic to the production system.

---

## Project Vision

### Core Value Proposition

**Problem**: Traditional workout tracking apps don't understand muscle fatigue or recovery. Users often overtrain or undertrain specific muscle groups, leading to plateaus or injury.

**Solution**: FitForge tracks fatigue at the muscle-group level and provides personalized workout recommendations based on real-time recovery state, learned baselines, and validated biomechanics research.

**Key Features**:
1. **Muscle Fatigue Tracking**: Real-time visualization of which muscles are fatigued vs. fresh
2. **Smart Recommendations**: AI suggests exercises based on recovery state and baseline patterns
3. **Adaptive Baselines**: System learns your capacity over time and personalizes recommendations
4. **Recovery Forecasting**: Predicts when muscles will be ready for training again
5. **Progressive Overload**: Automatic detection of when to increase weight/volume

---

## Technical Architecture

### Multi-Part Application

**Frontend**:
- React 19 + TypeScript + Vite
- Component-based UI with React Router
- Recharts for muscle fatigue visualization
- Context API for state management
- Port: 3000

**Backend**:
- Express + TypeScript REST API
- better-sqlite3 (embedded SQLite database)
- 20+ REST endpoints across 6 resources
- Port: 3001

**Shared Code**:
- TypeScript types and interfaces
- Exercise library (150+ exercises)
- Muscle group definitions
- Constants and utilities

### Project Structure

```
FitForge-Local/
├── components/              # React UI components
│   ├── WorkoutBuilder.tsx  # AI workout recommendations
│   ├── RecoveryDashboard.tsx  # Muscle fatigue visualization
│   ├── WorkoutLogger.tsx   # Manual workout entry
│   └── TemplateLibrary.tsx # Template management
├── contexts/               # React Context providers
│   └── WorkoutContext.tsx  # Global workout state
├── shared/                 # Shared TypeScript code
│   ├── exercise-library.ts # Exercise database
│   ├── types.ts           # Type definitions
│   └── muscle-groups.ts   # Muscle mappings
├── backend/                # Express API
│   ├── server.ts          # Main server
│   ├── database/          # SQLite operations
│   │   ├── schema.sql     # Database schema
│   │   ├── database.js    # CRUD operations
│   │   └── analytics.ts   # Metrics calculation
│   └── package.json       # Backend dependencies
├── docs/                   # Documentation
│   ├── logic-sandbox/     # Validated algorithms
│   │   ├── README.md      # Logic validation status
│   │   ├── NEXT-STEPS.md  # Implementation roadmap
│   │   ├── exercises.json # Validated exercise data
│   │   ├── baselines.json # Muscle baseline data
│   │   └── scripts/       # Calculation scripts
│   └── plans/             # Implementation plans
├── openspec/              # OpenSpec change proposals
│   └── changes/archive/   # 25+ implemented proposals
├── package.json           # Frontend dependencies
├── docker-compose.yml     # Local dev environment
└── Dockerfile             # Production build
```

---

## Development History

### Development Method

FitForge was built using:
- **OpenSpec**: Structured change proposal system for feature design
- **Superpowers Workflow**: AI-assisted implementation with subagents
- **Logic Sandbox**: Validate algorithms before production integration

### Key Milestones

**2025-10-24 to 2025-10-27**: Core Infrastructure
- Template-based workouts
- Deployment to Railway
- Muscle fatigue heat map
- Smart exercise recommendations (UI only)
- Progressive overload backend calculations

**2025-10-27**: EMG Research Validation
- Applied peer-reviewed research to exercise library
- Corrected muscle engagement percentages
- 189 scientific citations analyzed

**2025-10-28 to 2025-10-31**: Bug Fixes & Refinement
- React Router navigation
- Workout rotation logic
- Personal record detection
- Muscle visualization feature

**2025-11-07**: Critical Bug Fixes
- Fixed 5 application crash conditions
- Template loading/saving bugs resolved
- API port configuration fixed
- Hardcoded localhost replaced with dynamic URLs

**2025-11-08**: Logic Sandbox Development
- Validated fatigue calculation algorithm
- Validated recovery algorithm (15% daily rate)
- Designed recommendation scoring system
- Created implementation roadmap
- Identified existing vs. planned features

### OpenSpec Changes (25+ Proposals)

**Major Features Implemented**:
- Template-based workouts
- Smart workout continuation
- Failure tracking and PR detection
- Muscle fatigue heat map
- Quick add workout logging
- Analytics dashboard
- Recovery dashboard components
- A/B variation intelligence
- To-failure tracking UI
- Muscle visualization feature
- React Router navigation

**Research Proposals**:
- Muscle fatigue model validation
- EMG research corrections

---

## Current Status

### What's Complete ✅

**Infrastructure (80-90%)**:
- ✅ SQLite database with 7 tables
- ✅ REST API with 20+ endpoints
- ✅ React components for all major features
- ✅ Workout logging system (manual + template)
- ✅ Template management (create, save, load)
- ✅ Personal record tracking
- ✅ Exercise library (150+ exercises)
- ✅ Docker development environment with HMR
- ✅ Railway production deployment
- ✅ Testing infrastructure (Vitest, Storybook)

**Logic Validation (100%)**:
- ✅ Fatigue calculation algorithm validated
- ✅ Recovery algorithm validated (15% daily rate)
- ✅ Exercise recommendation algorithm designed
- ✅ Baseline learning model designed
- ✅ Progressive overload principles documented
- ✅ Feature specifications complete

**Documentation (100%)**:
- ✅ Logic sandbox with test data
- ✅ CHANGELOG with detailed commit history
- ✅ 25+ OpenSpec change proposals archived
- ✅ 17 implementation plans in docs/plans/
- ✅ Implementation roadmap created

### What's Incomplete ❌

**Business Logic Integration (40-50%)**:
- ❌ Fatigue calculation service (algorithm → backend port needed)
- ❌ Recovery time projection (needs integration)
- ❌ Exercise recommendation engine (designed, stub implementation)
- ❌ Baseline learning system (deferred to post-MVP)
- ❌ Progressive overload tracking (conceptual only)

**UX/UI Polish**:
- ❌ UI not fully designed ("haven't really started going in on the UI")
- ❌ User experience not streamlined
- ❌ Missing loading states in some components
- ❌ Error handling not user-friendly
- ❌ Accessibility improvements needed

**Known Bugs**:
- ❌ TemplateCard React 19 compatibility (missing key props)
- ❌ Exercise library corrections needed (10-15 exercises)
- ❌ Real-time muscle state updates not automatic

---

## Implementation Roadmap

### Phase 1: Logic Validation ✅ COMPLETE
- Validate fatigue calculation algorithm
- Validate recovery algorithm
- Design recommendation scoring
- Create implementation roadmap
- **Status**: 100% complete

### Phase 2: Backend Services (4-6 hours) ← CURRENT FOCUS
- Port fatigue calculator from sandbox to backend/services/
- Port recovery calculator from sandbox to backend/services/
- Implement exercise recommendation scoring
- Add baseline auto-update trigger
- **Status**: Next up

### Phase 3: API Integration (3-4 hours)
- Add POST /api/workouts/:id/complete endpoint
- Add POST /api/recommendations/exercises endpoint
- Add GET /api/recovery/timeline endpoint
- Add POST /api/forecast/workout endpoint
- **Status**: Pending

### Phase 4: Frontend Integration (2-3 hours)
- Connect WorkoutBuilder to recommendation API
- Connect RecoveryDashboard to live muscle states
- Wire up baseline update prompts
- Add real-time workout forecast
- **Status**: Pending

### Phase 5: UX/UI Refinement (TBD)
- Brainstorm app look and feel
- Design component layouts
- Improve mobile responsiveness
- Polish interactions and animations
- User testing and feedback
- **Status**: Not started

### Phase 6: Local Testing (2-4 hours)
- Test all features in Docker environment
- Validate calculation accuracy
- Test edge cases
- Performance testing
- **Status**: Pending

### Phase 7: Railway Deployment (2-4 hours)
- Deploy to production
- Smoke test all features
- Monitor logs for errors
- **Status**: Deployment pipeline ready

**Total Estimated Time**: 18-27 hours (3-4 days) + UX/UI design time

---

## Key Technical Concepts

### 1. Muscle Fatigue Model

**Concept**: Track fatigue at the muscle-group level (not just "chest day" but "Pectoralis 65% fatigued").

**Formula**:
```
Fatigue = (Total Volume / Baseline Volume) × 100
Volume = Sum(weight × reps × muscle_engagement%)
```

**Recovery**:
```
Current Fatigue = Initial Fatigue × e^(-recovery_rate × hours)
```

**Validated In**: `docs/logic-sandbox/muscle-fatigue-model.md`

### 2. Exercise Recommendations

**Scoring Algorithm**:
```
Score = (baseline_match × 0.4) +
        (recovery_state × 0.3) +
        (variety × 0.2) +
        (equipment × 0.1)
```

**Filters**:
- Exclude muscles >60% fatigued
- Penalize recently trained muscles
- Filter by available equipment

**Validated In**: `docs/logic-sandbox/workout-builder-recommendations.md`

### 3. Baseline Learning (Post-MVP)

**Concept**: System learns your muscle capacity over time and personalizes recommendations.

**Learning Phases**:
1. Weeks 1-2: Use conservative defaults (confidence 0.3-0.4)
2. Weeks 3-6: Observe patterns (confidence 0.5-0.7)
3. Week 7+: Personalized baselines (confidence 0.8-1.0)

**Update Algorithm**:
```
new_baseline = (old_baseline × 0.7) + (observed_volume × 0.3)
```

**Validated In**: `docs/logic-sandbox/baseline-learning-model.md`

### 4. Progressive Overload (Future)

**Concept**: Gradually increase training stimulus to drive adaptation.

**Target**: 5-10% volume increase per week

**Triggers**:
- If RPE < 7: Suggest weight increase
- If RPE > 8: Suggest volume decrease
- If 4 weeks flat: Suggest deload

**Status**: Conceptual only, not implemented

---

## Critical Gaps Analysis

### 🔴 Blocking MVP

1. **Fatigue Calculation Service**
   - **Gap**: Algorithm validated in sandbox, stub in backend
   - **Impact**: Muscle states show zeros, recovery dashboard non-functional
   - **Fix**: Port `calculate-workout-fatigue.mjs` to `backend/services/fatigueCalculator.js`
   - **Time**: 1-1.5 hours

2. **Recovery Time Projection**
   - **Gap**: No live calculation of "Ready in X hours"
   - **Impact**: Users can't see when muscles will recover
   - **Fix**: Port `calculate-recovery.mjs` to `backend/services/recoveryCalculator.js`
   - **Time**: 30 min - 1 hour

3. **Exercise Recommendation Engine**
   - **Gap**: Algorithm designed, but returns empty array
   - **Impact**: WorkoutBuilder shows hardcoded recommendations
   - **Fix**: Implement scoring in `backend/services/exerciseRecommender.js`
   - **Time**: 2-3 hours

### 🟡 Degrading Experience

4. **Baseline Learning System** (Post-MVP)
   - **Gap**: All users use default baselines
   - **Impact**: Not personalized to individual capacity
   - **Status**: Deferred to post-MVP

5. **Progressive Overload Tracking**
   - **Gap**: No automatic weight/volume progression
   - **Impact**: Users don't get progression guidance
   - **Status**: Future enhancement

### 🟢 Polish

6. **Exercise Library Corrections**
   - **Gap**: 10-15 exercises have wrong muscle targeting
   - **Impact**: Slightly inaccurate recommendations
   - **Fix**: Apply corrections from `exercises.json`
   - **Time**: 1 hour

7. **TemplateCard React 19 Fix**
   - **Gap**: Missing key props causes crash
   - **Impact**: Template library occasionally crashes
   - **Fix**: Add unique keys to list rendering
   - **Time**: 15 minutes

---

## Deployment Information

### Production (Railway)
- **URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
- **Auto-Deploy**: Pushes to GitHub main branch trigger deployment
- **Build**: Multi-stage Docker build (Dockerfile)
- **Database**: SQLite with persistent volume

### Local Development (Docker Compose)
- **Frontend**: http://localhost:3000 (Vite dev server, HMR)
- **Backend**: http://localhost:3001 (nodemon, auto-restart)
- **Command**: `docker-compose up -d`
- **Hot Reload**: Instant code changes without rebuilds

### Port Rules (MANDATORY)
- Frontend: Always port 3000
- Backend: Always port 3001
- Never allow alternate ports (prevents API connection issues)

---

## Exercise Library

**Total Exercises**: 150+ in shared/exercise-library.ts
**Validated**: 48 exercises in docs/logic-sandbox/exercises.json

**Categories**:
- Compound movements (multi-joint, multiple muscles)
- Isolation movements (single-joint, focused)
- Cardio exercises (endurance)

**Muscle Groups** (15 tracked):
- Upper: Chest, Back (Upper/Lower), Shoulders (Front/Side/Rear), Traps
- Arms: Biceps, Triceps, Forearms
- Lower: Quads, Hamstrings, Glutes, Calves
- Core: Abs, Obliques

**Data Fields**:
- Exercise ID, name, category
- Primary muscles (main targets)
- Secondary muscles (supporting)
- Equipment required
- Difficulty level
- Description

**Known Corrections Needed**:
- Barbell Row: Should target Back (Upper + Lower)
- Pull-ups: Should target Back (Upper) + Biceps
- Chin-ups: Should target Biceps + Back (Upper)
- Several isolation exercises missing secondary engagement

---

## Database Schema

### 7 Core Tables

1. **workouts** - Workout sessions (id, name, date, notes)
2. **workout_exercises** - Exercises in workouts (links to exercise library)
3. **exercise_sets** - Individual sets (weight, reps, RPE, rest_time)
4. **muscle_states** - Time-series fatigue tracking (muscle, fatigue, timestamp)
5. **baseline_states** - Learned capacity (muscle, volume, frequency, confidence)
6. **workout_templates** - Saved templates (name, description)
7. **template_exercises** - Exercises in templates (default sets/reps/weight)

**Relationships**:
- workouts → workout_exercises (1:many)
- workout_exercises → exercise_sets (1:many)
- workouts → muscle_states (1:many, tracks source)
- templates → template_exercises (1:many)

**Indexes**:
- muscle_states: timestamp, muscle (for fast time-series queries)

**Schema File**: `backend/database/schema.sql`

---

## Testing Strategy

### Current Coverage
- **Unit Tests**: Vitest configured, minimal tests written
- **Component Tests**: React Testing Library set up, few tests
- **Storybook**: Component documentation and visual testing
- **Integration Tests**: Playwright installed, not yet implemented

### Testing Gaps
- Test coverage below 50%
- No API endpoint tests
- No end-to-end workflow tests
- Missing edge case testing

### Future Testing Plans
- Target 80%+ coverage for calculation logic
- Add API integration tests
- End-to-end tests for critical workflows
- Performance benchmarking

---

## Related Documentation

### Core Documentation
- [Tech Stack](./tech-stack.md) - Framework and library versions
- [API Endpoints](./api-endpoints.md) - Complete REST API reference
- [Data Model](./data-model.md) - Database schema details
- [Component Architecture](./component-architecture.md) - React component hierarchy
- [Business Logic](./business-logic.md) - Calculation algorithms

### Logic Sandbox
- [Logic Sandbox README](./logic-sandbox/README.md) - Validation status
- [Next Steps](./logic-sandbox/NEXT-STEPS.md) - Implementation roadmap
- [Implementation Roadmap](./logic-sandbox/implementation-roadmap.md) - Detailed phases
- [Workout Recommendations](./logic-sandbox/workout-builder-recommendations.md) - Algorithm design

### Development Process
- [CHANGELOG](../CHANGELOG.md) - Commit history with technical context
- [OpenSpec Changes](../openspec/changes/README.md) - Feature proposals
- [Implementation Plans](./plans/) - Task breakdowns

---

## Quick Start Guide

### For Developers

**Clone & Setup**:
```bash
git clone <repo-url>
cd FitForge-Local
docker-compose up -d
```

**Access Application**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Make Changes**:
- Edit `.tsx`, `.ts`, `.js` files → Instant hot reload
- Frontend refreshes automatically
- Backend restarts automatically
- No rebuilds needed!

**Rebuild (Only When Needed)**:
```bash
docker-compose down
docker-compose up -d --build
```

### For Product Planning

**Current Priority**: Backend service integration (18-27 hours)

**Next Priority**: UX/UI brainstorming and design

**Future Enhancements**:
- Baseline learning system
- Progressive overload tracking
- Mobile app (React Native)
- Social features (share workouts)

---

## Success Metrics

### MVP Definition
- ✅ User can log workouts
- ✅ User can create/save templates
- ❌ User sees real-time muscle fatigue (needs integration)
- ❌ User gets intelligent exercise recommendations (needs integration)
- ❌ User sees recovery timeline (needs integration)

### Post-MVP Goals
- Baseline learning adapts to user capacity
- Progressive overload suggestions drive results
- 90%+ user satisfaction with recommendations
- <2s page load time
- Mobile responsive design

---

**Maintained by**: AI-assisted documentation workflow
**Last Updated**: 2025-11-09
**Accuracy**: Verified against codebase and logic-sandbox
