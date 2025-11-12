# FitForge-Local - Product Requirements Document

**Author:** Kaelen
**Date:** 2025-11-10
**Version:** 1.0 (Retroactive - Documents Existing System)
**Project Type:** Brownfield Enhancement

---

## Executive Summary

FitForge is an AI-powered fitness tracking application with **muscle-aware training logic** that optimizes workout planning and recovery tracking. The core innovation is a validated fatigue calculation system that tracks muscle-specific recovery states and provides intelligent exercise recommendations.

**Current Reality**: The infrastructure is 80-90% complete with working database schema, REST API, and React UI components. Validated calculation algorithms exist in logic-sandbox and need integration into backend services.

### What Makes This Special

**Traditional Problem**: Fitness apps don't understand muscle fatigue or recovery. Users overtrain or undertrain specific muscle groups, leading to plateaus or injury.

**FitForge Solution**: Tracks fatigue at the muscle-group level (15 muscles), provides personalized workout recommendations based on real-time recovery state, learned baselines, and validated biomechanics research.

**Key Differentiator**: Muscle fatigue visualization + AI recommendations based on recovery science, not arbitrary workout plans.

**UX Philosophy**: Extremely advanced intelligence underneath, extremely simple on the surface. Quick logging, minimal taps, intelligent information disclosure. See progress and metrics effortlessly without complexity.

---

## Project Classification

**Technical Type:** Full-Stack Web Application (React + Express + SQLite)
**Domain:** Fitness & Health Technology
**Complexity:** Level 3 (Brownfield enhancement with validated algorithms)
**Project Status:** 80% Infrastructure Complete, Ready for Logic Integration

**Brownfield Context:**
- Existing: Database schema (7 tables), REST API (20+ endpoints), React UI (10+ components)
- Missing: 3 calculation services, 4 API endpoints, frontend integration

---

## Success Criteria

### MVP Success (Ready to Launch)
- ✅ **Fatigue tracking works**: Complete workout → See accurate muscle fatigue percentages
- ✅ **Recovery timeline shows**: View dashboard → See when each muscle will be ready (24h/48h/72h)
- ✅ **Recommendations are smart**: Click underworked muscle → Get ranked exercise suggestions
- ✅ **Baselines adapt**: Exceed baseline → Prompted to update capacity
- ✅ **Real-time forecast**: Add exercises → See predicted fatigue before starting

### Post-MVP Success
- **User retention**: 30%+ users return after 7 days (vs. industry 10-20%)
- **Baseline accuracy**: 80%+ users accept baseline update suggestions
- **Recommendation quality**: 70%+ users follow AI exercise suggestions
- **Performance**: <500ms API response times, <2s page loads

---

## Product Scope

### MVP - Minimum Viable Product (What Exists + Missing Pieces)

**Existing Features** (Already Built):
1. ✅ **Workout Logging**
   - Manual set entry with weight/reps/to-failure tracking
   - Template system (save/load workouts)
   - Exercise library (48 validated exercises in logic-sandbox)
   - Personal bests tracking

2. ✅ **Database & API**
   - SQLite schema (7 tables): workouts, exercise_sets, muscle_states, baselines, templates, equipment, personal_bests
   - REST API (20+ endpoints): CRUD for all resources
   - Workout analytics (total volume, PR detection)

3. ✅ **UI Components**
   - WorkoutBuilder (planning + execution modes)
   - RecoveryDashboard (muscle heat map visualization)
   - BaselineManager + BaselineUpdateModal
   - ExerciseRecommendations component
   - RecoveryTimelineView component
   - TemplateLibrary

**Missing Features** (Need to Build - Estimated 11-17 hours):
1. ❌ **Fatigue Calculation Service** (1-1.5 hours)
   - Algorithm validated in logic-sandbox
   - Port to `backend/services/fatigueCalculator.js`
   - Formula: `(muscleVolume / baseline) × 100`

2. ❌ **Recovery Calculation Service** (0.5-1 hour)
   - Linear recovery model validated (15% daily recovery rate)
   - Port to `backend/services/recoveryCalculator.js`
   - Provides 24h/48h/72h projections

3. ❌ **Exercise Recommendation Engine** (2-3 hours)
   - 5-factor scoring algorithm designed
   - Implement in `backend/services/exerciseRecommender.js`
   - Factors: Target muscle (40%), Freshness (25%), Variety (15%), Preference (10%), Primary/Secondary (10%)

4. ❌ **API Endpoints** (3-4 hours)
   - `POST /api/workouts/:id/complete` - Calculate fatigue after workout
   - `POST /api/recommendations/exercises` - Get ranked exercise list
   - `GET /api/recovery/timeline` - Get recovery projections
   - `POST /api/forecast/workout` - Predict fatigue for planned exercises

5. ❌ **Frontend Integration** (2-3 hours)
   - Connect WorkoutBuilder to forecast API
   - Connect RecoveryDashboard to timeline API
   - Connect ExerciseRecommendations to scoring API
   - Wire baseline update trigger

### Growth Features (Post-MVP)

**Phase 1 - High Value Additions:**
- Progressive overload planner ("Duplicate & Progress" with side-by-side preview)
- Recovery-based scheduling (workouts ranked by muscle readiness)
- Workout balance analysis (% posterior vs anterior)
- PR celebration & tracking
- Workout comparison (today vs last time)

**Phase 2 - Intelligence & Insights:**
- Muscle imbalance tracking (30-day trends)
- Deload week suggestions (formula-based detection)
- Dynamic volume slider (adjust target fatigue interactively)
- AI workout optimizer (generate optimized workouts from constraints)

**Phase 3 - Advanced Features:**
- Adaptive baseline learning (automatic capacity updates)
- Advanced recovery models (HRV, sleep tracking)
- Social features (share workouts, challenges)
- Nutrition tracking integration
- Mobile app (React Native)

### Vision (Future)

**Explicitly OUT OF SCOPE:**
- Wearable device integration
- AI coach chat interface
- Community marketplace
- Certification/coaching platform
- Multi-user accounts (teams/trainers)

---

## Functional Requirements

### FR-1: Workout Logging (Existing ✅)
**Status**: Fully implemented
- Users can log exercises with sets/reps/weight
- Mark sets as "to failure" for accurate fatigue calculation
- Save/load workout templates
- Track personal bests automatically

### FR-2: Muscle Fatigue Tracking (Partial - Missing Calculation ❌)
**Status**: UI exists, calculation service needed
- Calculate muscle-specific fatigue after workout
- Display fatigue as percentage of baseline capacity
- Visualize fatigue with color-coded heat map (0-100%)
- Track 15 muscle groups independently

**Required Implementation**:
- Backend service to calculate: `(totalMuscleVolume / baseline) × 100`
- API endpoint: `POST /api/workouts/:id/complete`

### FR-3: Recovery Timeline (Partial - Missing Calculation ❌)
**Status**: UI exists, calculation service needed
- Show current recovery state for all muscles
- Project recovery at 24h, 48h, 72h intervals
- Use linear recovery model (15% per day for MVP)

**Required Implementation**:
- Backend service for recovery calculation
- API endpoint: `GET /api/recovery/timeline`

### FR-4: Exercise Recommendations (Partial - Missing Scoring ❌)
**Status**: UI exists, scoring algorithm needed
- Recommend exercises based on muscle freshness
- Rank by efficiency (5-factor scoring)
- Filter by available equipment
- Warn about bottleneck risks (over-fatigued muscles)

**Required Implementation**:
- Backend service with 5-factor scoring
- API endpoint: `POST /api/recommendations/exercises`

### FR-5: Adaptive Baselines (Partial - Missing Trigger ❌)
**Status**: UI exists, trigger logic needed
- Detect when user exceeds baseline capacity
- Prompt user to update baseline
- Track baseline history over time

**Required Implementation**:
- Logic in `saveWorkout()` to compare volume vs baseline
- Return suggestions in workout completion response

### FR-6: Real-Time Workout Forecast (Missing ❌)
**Status**: Not yet implemented
- Show predicted muscle fatigue as user adds exercises
- Update forecast in real-time
- Warn before creating bottlenecks

**Required Implementation**:
- API endpoint: `POST /api/forecast/workout`
- Frontend integration in WorkoutBuilder

---

## Non-Functional Requirements

### NFR-1: Performance
**Existing System**: <500ms API response times (measured)
- Database queries optimized with indexes
- SQLite in-memory mode for dev
- Frontend uses React Context (minimal re-renders)

**Target**: Maintain <500ms for new calculation endpoints

### NFR-2: Data Integrity
**Existing**: SQLite with foreign key constraints
- Transactions for multi-table updates
- Validation on API layer
- Exercise data validated (all muscle % sum to 100%)

**Target**: Zero data loss, all calculations reproducible

### NFR-3: Scalability
**Current**: Single-user local application
**MVP Target**: Support 1 user with 100+ workouts
**Post-MVP**: Consider multi-user (PostgreSQL migration)

### NFR-4: Availability
**Deployment**: Railway (auto-deploys from GitHub)
**Target**: 99% uptime (Railway SLA)
**Local Dev**: Docker Compose with HMR

### NFR-5: Security
**Current**: Local application, no authentication yet
**Post-MVP**: Add user auth (bcrypt + JWT)
**Data**: SQLite file stored locally (no cloud sync yet)

### NFR-6: Usability
**Research-Backed**: See [research-user-2025-11-09.md](research-user-2025-11-09.md)
- Minimize taps (2 max for common actions)
- Real-time feedback (no manual refresh)
- Visual progress indicators
- Clear error messages

---

## Implementation Planning

### Next Steps

**Phase 3: Backend Services** (4-6 hours)
1. Port fatigue calculator from logic-sandbox
2. Port recovery calculator from logic-sandbox
3. Implement exercise recommendation scoring
4. Add baseline auto-update logic

**Phase 4: API Endpoints** (3-4 hours)
1. Add 4 new endpoints (listed above)
2. Test with Postman/curl
3. Document request/response formats

**Phase 5: Frontend Integration** (2-3 hours)
1. Connect WorkoutBuilder to forecast
2. Connect RecoveryDashboard to timeline
3. Connect ExerciseRecommendations to scoring
4. Wire baseline update prompts

**Phase 6: Testing & Deployment** (4-8 hours)
1. Local Docker testing
2. Railway deployment
3. Smoke testing production
4. Monitor for errors

**Total Estimated Time**: 13-21 hours (3-4 days)

### Epic Breakdown

**Epics will be created based on implementation phases:**
- Epic 1: Calculation Services (Backend)
- Epic 2: API Endpoints (Backend)
- Epic 3: Frontend Integration (React)
- Epic 4: Testing & Deployment

**Next Step:** Run `/bmad:bmm:workflows:create-epics-and-stories` to generate detailed epic breakdown with bite-sized stories.

---

## References

### Source Documentation
- [Project Overview](./project-overview.md) - Architecture and status
- [Tech Stack](./tech-stack.md) - Technologies and tools
- [Logic Sandbox README](./logic-sandbox/README.md) - Validated algorithms
- [NEXT-STEPS](./logic-sandbox/NEXT-STEPS.md) - Implementation roadmap (PRIMARY SOURCE)
- [User Research](./research-user-2025-11-09.md) - User needs and retention factors

### Validated Data
- [exercises.json](./logic-sandbox/exercises.json) - 48 exercises (all corrected to 100%)
- [baselines.json](./logic-sandbox/baselines.json) - Muscle baseline capacities
- [Fatigue Script](./logic-sandbox/scripts/calculate-workout-fatigue.mjs) - Source logic
- [Recovery Script](./logic-sandbox/scripts/calculate-recovery.mjs) - Source logic

### Architecture
- Database Schema: `backend/database/schema.sql` (7 tables)
- API Endpoints: `backend/server.ts` (20+ endpoints)
- React Components: `components/*.tsx` (10+ components)

---

## Important Notes

**This is a RETROACTIVE PRD** documenting an existing brownfield project. All "Existing" features are already built and working. The "Missing" features have validated logic in the logic-sandbox and clear implementation paths.

**Do NOT build features marked "OUT OF SCOPE"** - these require further validation and user research before implementation.

**Source of Truth Priority**:
1. logic-sandbox/NEXT-STEPS.md (implementation reality check)
2. logic-sandbox/README.md (validated algorithms)
3. project-overview.md (current architecture)
4. This PRD (summarizes the above)

---

_This PRD documents the current state of FitForge-Local (80% complete) and the validated path to MVP completion._

_Created: 2025-11-10 via retroactive PRD generation_
_For: Kaelen_
_Purpose: Guide architecture and implementation workflows with accurate scope_
