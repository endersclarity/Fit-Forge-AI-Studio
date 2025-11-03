---
status: ready
priority: p2
issue_id: "004"
tags: [performance, optimization, api, caching, nice-to-have]
dependencies: ["001"]
---

# API Performance - Real-time Calculation vs Pre-calculated Storage

## Problem Statement

Once muscle fatigue calculation is implemented, we need to decide on the performance strategy. Real-time calculation (calculating muscle states on every API request) could become slow with large workout histories. The investigation plan identifies this as a key design decision that affects API response times and system complexity.

## Findings

- **Current target**: API response time < 500ms (from acceptance criteria)
- **Calculation complexity**: For each API request, must:
  - Query 30 days of workout history
  - Process each workout's exercises
  - Lookup exercise data for each exercise
  - Calculate volume per muscle
  - Apply fatigue model
  - Calculate recovery curve
- **Unknown**: How many workouts in typical 30-day period
- Location: backend/database/analytics.ts (muscle state calculation function)
- **Trade-off**: Simplicity vs Performance

## Proposed Solutions

### Option 1: Real-time Calculation (Recommended for MVP)
- **Pros**:
  - Always accurate, no stale data
  - Simpler implementation
  - No additional database tables
  - Easier to debug and iterate
- **Cons**:
  - Slower API response (calculation on every request)
  - Repeated calculations for same data
  - Could become bottleneck with growth
- **Effort**: Small (included in Issue #001)
- **Risk**: Low - can migrate to Option 2 later if needed

**When to use:**
- MVP and initial launch
- Small to medium user base
- While iterating on fatigue model

### Option 2: Pre-calculated with Caching
- **Pros**:
  - Fast API response (just read from cache/table)
  - Efficient for repeated requests
  - Scales better
- **Cons**:
  - More complex implementation
  - Requires cache invalidation strategy
  - Need to recalculate on workout save
  - Potential stale data if invalidation breaks
- **Effort**: Medium (2-4 hours additional)
- **Risk**: Medium - cache invalidation is hard

**When to use:**
- After MVP if performance issues observed
- Large workout histories causing slow responses
- High request volume

### Option 3: Hybrid - Calculate on Workout Save + Daily Cron
- **Pros**:
  - Balance of accuracy and performance
  - Calculations happen at logical times
  - Can still force refresh if needed
- **Cons**:
  - Most complex to implement
  - Requires job scheduler
  - Need to handle missed cron jobs
- **Effort**: Large (4-6 hours)
- **Risk**: Medium - multiple failure points

## Recommended Action

**Execute Option 1 for MVP** - Implement real-time calculation first

**Migration Path:**
1. Launch with real-time calculation
2. Monitor API response times in production
3. If response time > 500ms consistently, migrate to Option 2
4. If response time acceptable, keep simple solution

**Performance Optimization Triggers:**
- API response time consistently > 500ms
- User complaints about slowness
- Database query time becomes bottleneck
- User base grows significantly

## Technical Details

- **Affected Files**:
  - backend/database/analytics.ts (calculation function)
  - backend/routes/muscle-states.ts (endpoint handler)
  - database/schema.sql (if adding cache table)
  - backend/services/cache.ts (if implementing caching)

- **Related Components**:
  - Muscle state API endpoints
  - Workout save operations (if pre-calculating)
  - Job scheduler (if using cron)

- **Database Changes**:
  - Option 1: No changes
  - Option 2: May add muscle_states_cache table
  - Option 3: Add cache table + job tracking

## Resources

- Original finding: docs/investigations/muscle-fatigue-investigation-plan.md (Phase 3.2)
- Performance target: < 500ms API response
- Related issue: #001 (must complete first)

## Acceptance Criteria

- [ ] API response time measured and documented
- [ ] Performance meets < 500ms target (or documented reason)
- [ ] If using caching: Cache invalidation tested
- [ ] If using caching: Stale data prevented
- [ ] Load testing performed with realistic workout history
- [ ] Decision documented with rationale
- [ ] Migration path defined if needed

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue identified during muscle fatigue investigation triage
- Categorized as P2 IMPORTANT (performance, not blocking MVP)
- Estimated effort: Small to Medium depending on approach
- Marked as dependent on Issue #001

**Learnings:**
- This is a design decision, not a bug
- Should start simple and optimize if needed
- Real-time calculation is simpler and likely sufficient for MVP
- Can migrate to caching later without user-facing changes
- Performance monitoring will guide decision

## Notes

Source: Triage session on 2025-10-31

From investigation plan Phase 3.2 - Key Design Decisions:
- Decision 1: Real-time Calculation vs. Pre-calculated Storage
- Recommendation: Option A initially (simpler), migrate to Option B if performance issues

Priority set to P2 because:
- Not blocking MVP launch
- Can optimize after launch if needed
- Should measure before optimizing
- Premature optimization risk
- Clean migration path exists

**Monitor these metrics in production:**
1. API response time for /api/muscle-states
2. Database query time for workout history
3. User feedback on page load speed
4. Number of workouts per user (affects calculation time)
