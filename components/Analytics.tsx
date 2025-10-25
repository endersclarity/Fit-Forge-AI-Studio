import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnalyticsResponse } from '../types';
import { API_BASE_URL } from '../api';
import ExerciseProgressionChart from './ExerciseProgressionChart';
import MuscleCapacityChart from './MuscleCapacityChart';
import VolumeTrendsChart from './VolumeTrendsChart';
import ActivityCalendarHeatmap from './ActivityCalendarHeatmap';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(90);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<AnalyticsResponse>(
        `${API_BASE_URL}/analytics?timeRange=${timeRange}`
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-cyan mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Analytics</h3>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-brand-cyan text-brand-dark font-semibold rounded-lg hover:bg-cyan-400 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Check if user has enough data
  if (analytics.summary.totalWorkouts < 3) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-brand-surface border border-brand-cyan/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-cyan mb-4">Not Enough Data Yet</h2>
          <p className="text-slate-300 mb-2">Keep training to unlock your analytics dashboard!</p>
          <p className="text-slate-400 text-sm mb-2">
            You need at least 3 workouts to see meaningful analytics.
          </p>
          <p className="text-brand-cyan font-semibold">
            Current workouts: {analytics.summary.totalWorkouts}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-cyan">Analytics Dashboard</h1>

        {/* Time Range Filter */}
        <div className="flex items-center gap-3">
          <label className="text-slate-300 font-medium">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-brand-surface border border-brand-muted rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
            <option value={3650}>All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
          <div className="text-slate-400 text-sm mb-2">Total Workouts</div>
          <div className="text-3xl font-bold text-brand-cyan">{analytics.summary.totalWorkouts}</div>
        </div>

        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
          <div className="text-slate-400 text-sm mb-2">Total Volume</div>
          <div className="text-3xl font-bold text-brand-cyan">
            {Math.round(analytics.summary.totalVolume / 1000)}k
          </div>
          <div className="text-slate-500 text-xs mt-1">lbs</div>
        </div>

        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
          <div className="text-slate-400 text-sm mb-2">PRs Hit</div>
          <div className="text-3xl font-bold text-green-400">{analytics.summary.totalPRs}</div>
        </div>

        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
          <div className="text-slate-400 text-sm mb-2">Current Streak</div>
          <div className="text-3xl font-bold text-orange-400">{analytics.summary.currentStreak}</div>
          <div className="text-slate-500 text-xs mt-1">
            {analytics.summary.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 text-center">
          <div className="text-slate-400 text-sm mb-2">Weekly Frequency</div>
          <div className="text-3xl font-bold text-purple-400">
            {analytics.summary.weeklyFrequency.toFixed(1)}
          </div>
          <div className="text-slate-500 text-xs mt-1">workouts/week</div>
        </div>
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Progression Chart */}
        <ExerciseProgressionChart exerciseProgression={analytics.exerciseProgression} />

        {/* Volume Trends Chart */}
        <VolumeTrendsChart volumeTrends={analytics.volumeTrends} />

        {/* Muscle Capacity Chart */}
        <MuscleCapacityChart muscleCapacityTrends={analytics.muscleCapacityTrends} />

        {/* PR Timeline */}
        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Recent Personal Records</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {analytics.prTimeline.slice(0, 10).map((pr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-brand-dark/50 rounded hover:bg-brand-dark/70 transition">
                <div className="flex-1">
                  <div className="font-medium text-brand-cyan">{pr.exercise}</div>
                  <div className="text-xs text-slate-500">{new Date(pr.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-200">{pr.newVolume.toFixed(0)} lbs</div>
                  <div className="text-xs text-green-400">
                    +{pr.improvement.toFixed(0)} lbs ({pr.percentIncrease.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
            {analytics.prTimeline.length === 0 && (
              <p className="text-center text-slate-400 py-8">No PRs recorded yet. Keep pushing!</p>
            )}
          </div>
        </div>

        {/* Activity Calendar Heatmap - Full width */}
        <div className="lg:col-span-2">
          <ActivityCalendarHeatmap
            activityCalendar={analytics.consistencyMetrics.activityCalendar}
            timeRangeDays={timeRange}
          />
        </div>

        {/* Consistency Metrics */}
        <div className="bg-brand-surface border border-brand-muted rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Training Consistency</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-brand-dark/50 rounded">
              <div className="text-slate-400 text-sm mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-orange-400">{analytics.consistencyMetrics.currentStreak}</div>
              <div className="text-slate-500 text-xs">days</div>
            </div>
            <div className="text-center p-4 bg-brand-dark/50 rounded">
              <div className="text-slate-400 text-sm mb-1">Longest Streak</div>
              <div className="text-2xl font-bold text-orange-400">{analytics.consistencyMetrics.longestStreak}</div>
              <div className="text-slate-500 text-xs">days</div>
            </div>
            <div className="text-center p-4 bg-brand-dark/50 rounded">
              <div className="text-slate-400 text-sm mb-1">This Week</div>
              <div className="text-2xl font-bold text-brand-cyan">{analytics.consistencyMetrics.workoutsThisWeek}</div>
              <div className="text-slate-500 text-xs">workouts</div>
            </div>
            <div className="text-center p-4 bg-brand-dark/50 rounded">
              <div className="text-slate-400 text-sm mb-1">Last Week</div>
              <div className="text-2xl font-bold text-brand-cyan">{analytics.consistencyMetrics.workoutsLastWeek}</div>
              <div className="text-slate-500 text-xs">workouts</div>
            </div>
            <div className="text-center p-4 bg-brand-dark/50 rounded">
              <div className="text-slate-400 text-sm mb-1">Avg Frequency</div>
              <div className="text-2xl font-bold text-purple-400">
                {analytics.consistencyMetrics.avgWeeklyFrequency.toFixed(1)}
              </div>
              <div className="text-slate-500 text-xs">workouts/week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
