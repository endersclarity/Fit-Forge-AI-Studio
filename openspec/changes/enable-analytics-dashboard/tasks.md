# Tasks: Enable Analytics Dashboard

**Change ID:** `enable-analytics-dashboard`
**Status:** In Progress
**Last Updated:** 2025-10-25

---

## Phase 1: Backend Analytics Engine (4-5 days)

### 1.1 Create Analytics Database Module (2 days)

- [x] Create `backend/database/analytics.ts` file
- [x] Implement main `getAnalytics(userId, timeRangeDays)` function
- [x] Implement `aggregateExerciseProgression(workouts)` helper
- [x] Implement `aggregateMuscleCapacityTrends(muscleBaselines, timeRange)` helper
- [x] Implement `aggregateVolumeTrends(workouts)` helper
- [x] Implement `aggregatePRTimeline(workouts)` helper
- [x] Implement `calculateConsistencyMetrics(workouts)` helper
- [ ] Add unit tests for aggregation functions

### 1.2 Create Analytics API Endpoint (1 day)

- [x] Add `GET /api/analytics` endpoint to `backend/server.ts`
- [x] Implement query parameter parsing (timeRange, exerciseName, muscleName, category)
- [x] Integrate analytics database module with endpoint
- [x] Return proper AnalyticsResponse JSON format
- [x] Add endpoint error handling and validation
- [ ] Test endpoint with sample data

### 1.3 Database Performance Optimization (1-2 days)

- [x] Add index: `CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date)`
- [x] Add index: `CREATE INDEX IF NOT EXISTS idx_muscle_baselines_updated ON muscle_baselines(updated_at)`
- [ ] Profile query performance with test data (1000+ workouts)
- [ ] Optimize slow queries if needed
- [ ] Verify analytics endpoint responds < 1 second

---

## Phase 2: Frontend Analytics Components (5-7 days)

### 2.1 Install Chart Library & Setup (0.5 days)

- [x] Install recharts: `npm install recharts`
- [x] Add analytics types to `types.ts`
- [ ] Create `components/charts/` directory
- [ ] Create base chart styling configuration

### 2.2 Create Main Analytics Screen (1 day)

- [x] Create `components/Analytics.tsx` main component
- [x] Implement layout structure (summary + charts grid)
- [x] Add time range filter component
- [x] Integrate with `/api/analytics` endpoint using fetch/axios
- [x] Handle loading state during data fetch
- [x] Handle error states with user-friendly messages

### 2.3 Build Chart Components (2-3 days)

- [ ] Create `components/ExerciseProgressionChart.tsx` (line chart for weight/reps over time)
- [ ] Create `components/MuscleCapacityChart.tsx` (line chart for baseline growth)
- [ ] Create `components/VolumeTrendsChart.tsx` (stacked bar chart by category)
- [ ] Create `components/ActivityCalendarHeatmap.tsx` (visual workout calendar)
- [ ] Implement responsive design for mobile screens
- [ ] Add tooltips and labels to all charts
- [ ] Test charts with various data ranges

### 2.4 Build Data Cards (1-2 days)

- [ ] Create `components/AnalyticsSummary.tsx` (top summary stats card)
- [ ] Create `components/PRTimelineCard.tsx` (recent PRs list)
- [ ] Create `components/ConsistencyMetricsCard.tsx` (streak, frequency display)
- [ ] Create `components/AnalyticsTimeFilter.tsx` (7/30/90/365 days selector)
- [ ] Style cards consistently with existing UI

### 2.5 Integration & Navigation (0.5 days)

- [x] Add "Analytics" tab/section to Dashboard navigation
- [x] Wire up Analytics screen to app routing
- [ ] Test full data flow from API to charts
- [ ] Verify navigation between Dashboard and Analytics works

---

## Phase 3: Analytics Utility Functions (2-3 days)

### 3.1 Create Analytics Helpers (1-2 days)

- [ ] Create `utils/analyticsHelpers.ts` file
- [ ] Implement `formatChartData(analyticsResponse)` function
- [ ] Implement `calculatePercentageChange(oldValue, newValue)` function
- [ ] Implement `calculateMovingAverage(dataPoints, windowSize)` function
- [ ] Implement `groupByWeek(dataPoints)` function
- [ ] Implement `findTrendDirection(dataPoints)` function ("increasing", "decreasing", "plateau")
- [ ] Add unit tests for utility functions

### 3.2 Empty State Handling (0.5 days)

- [ ] Create `components/EmptyAnalyticsState.tsx` component
- [ ] Display friendly message for new users
- [ ] Show minimum data requirements (3 workouts)
- [ ] Add "Start Training" CTA button
- [ ] Test empty state with new user profile

### 3.3 Data Validation & Error Handling (0.5 days)

- [ ] Handle exercises with single data point gracefully
- [ ] Handle time ranges with no workouts
- [ ] Add error boundaries for chart rendering failures
- [ ] Display fallback UI for missing/invalid data
- [ ] Test error scenarios

---

## Phase 4: Polish & Testing (2-3 days)

### 4.1 Visual Design & Styling (1 day)

- [ ] Apply consistent color scheme across all charts
- [ ] Implement category colors (Push = red, Pull = blue, Legs = yellow, Core = green)
- [ ] Test responsive design on mobile, tablet, desktop
- [ ] Add ARIA labels for accessibility
- [ ] Implement keyboard navigation support
- [ ] Polish spacing, typography, and visual hierarchy

### 4.2 Performance Optimization (0.5 days)

- [ ] Measure analytics API response time with realistic data
- [ ] Implement client-side caching (5-minute cache for analytics data)
- [ ] Lazy load charts (only render visible charts)
- [ ] Profile React re-renders and optimize if needed
- [ ] Verify smooth scrolling and interaction

### 4.3 Integration Testing (0.5 days)

- [ ] Test: workout save → analytics refresh
- [ ] Test: time range filtering (7/30/90/365 days)
- [ ] Test: exercise/muscle selection in charts
- [ ] Test: empty states for new users
- [ ] Test: large dataset (simulate 1 year of workouts)
- [ ] Test: mobile responsiveness
- [ ] Test: error scenarios (API failures, network issues)

### 4.4 Documentation (0.5 days)

- [ ] Update data model documentation with analytics tables/indexes
- [ ] Document `/api/analytics` endpoint in API docs
- [ ] Document analytics utility functions
- [ ] Add inline code comments for complex aggregation logic
- [ ] Update README with Analytics feature description

---

## Success Criteria (From Proposal)

All of the following must be verified before marking this change as complete:

- [ ] Analytics screen accessible from Dashboard
- [ ] Exercise progression chart works with exercise selection
- [ ] Muscle capacity trends display correctly
- [ ] Volume analytics functional by category
- [ ] PR timeline shows recent PRs with dates and improvements
- [ ] Consistency metrics calculated (streak, weekly frequency, workout calendar)
- [ ] Time-range filtering works (7/30/90/365 days, all-time)
- [ ] Charts render correctly on mobile and desktop
- [ ] Performance acceptable (analytics load < 1 second for 1 year of data)
- [ ] Empty state handled gracefully for new users

---

## Notes

**Dependencies:**
- Chart library: recharts (lightweight, 48KB gzipped)
- All workout/muscle data already exists in database
- No schema changes required

**Estimated Timeline:** 2.5-3 weeks (18-21 days)
- Phase 1: 4-5 days
- Phase 2: 5-7 days
- Phase 3: 2-3 days
- Phase 4: 2-3 days
- Buffer: 5-6 days for unexpected issues

**Risk Buffer:** +20% added for unexpected complexity

---

*Tasks created: 2025-10-25*
