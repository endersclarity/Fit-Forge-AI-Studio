import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnalyticsResponse } from '../types';
import { API_BASE_URL } from '../api';
import ExerciseProgressionChart from './ExerciseProgressionChart';
import MuscleCapacityChart from './MuscleCapacityChart';
import VolumeTrendsChart from './VolumeTrendsChart';
import ActivityCalendarHeatmap from './ActivityCalendarHeatmap';
import { ArrowLeftIcon, BarChartIcon } from './Icons';
import { Card, Button, Select, SelectOption } from '@/src/design-system/components/primitives';
import { EmptyState } from './common/EmptyState';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(90);

  const timeRangeOptions: SelectOption[] = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
    { label: 'Last Year', value: '365' },
    { label: 'All Time', value: '3650' },
  ];

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="bg-red-50 border-2 border-red-300 p-8 text-center">
          <h3 className="text-xl font-display font-bold text-red-700 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={fetchAnalytics}
            variant="primary"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Show empty state for users with no workouts
  const hasNoData = analytics.summary.totalWorkouts === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="min-w-[60px] min-h-[60px] rounded-full"
          ariaLabel="Go back to home"
        >
          <ArrowLeftIcon className="w-6 h-6"/>
        </Button>
        <h1 className="text-3xl font-display font-bold text-primary">Analytics Dashboard</h1>

        {/* Time Range Filter */}
        <div className="flex items-center gap-3">
          <label className="text-gray-700 font-body font-medium">Time Range:</label>
          <Select
            options={timeRangeOptions}
            value={timeRange.toString()}
            onChange={(value) => setTimeRange(Number(value))}
            aria-label="Select time range for analytics"
            className="min-w-[200px]"
          />
        </div>
      </header>

      {/* Empty State Message */}
      {hasNoData && (
        <EmptyState
          illustration={
            <BarChartIcon className="w-16 h-16" />
          }
          title="No Workout Data Yet"
          body="Start logging workouts to unlock powerful analytics. Track your volume, PRs, consistency trends, and more - all your training insights in one place."
          ctaText="Go to Dashboard"
          onCtaClick={() => navigate('/')}
          className="mb-8"
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-6 text-center min-h-[60px]">
          <div className="text-gray-600 text-sm mb-2">Total Workouts</div>
          <div className="text-3xl font-display font-bold text-primary">{analytics.summary.totalWorkouts}</div>
        </Card>

        <Card className="p-6 text-center min-h-[60px]">
          <div className="text-gray-600 text-sm mb-2">Total Volume</div>
          <div className="text-3xl font-display font-bold text-primary">
            {Math.round(analytics.summary.totalVolume / 1000)}k
          </div>
          <div className="text-gray-500 text-xs mt-1">lbs</div>
        </Card>

        <Card className="p-6 text-center min-h-[60px]">
          <div className="text-gray-600 text-sm mb-2">PRs Hit</div>
          <div className="text-3xl font-display font-bold text-green-600">{analytics.summary.totalPRs}</div>
        </Card>

        <Card className="p-6 text-center min-h-[60px]">
          <div className="text-gray-600 text-sm mb-2">Current Streak</div>
          <div className="text-3xl font-display font-bold text-orange-600">{analytics.summary.currentStreak}</div>
          <div className="text-gray-500 text-xs mt-1">
            {analytics.summary.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </Card>

        <Card className="p-6 text-center min-h-[60px]">
          <div className="text-gray-600 text-sm mb-2">Weekly Frequency</div>
          <div className="text-3xl font-display font-bold text-purple-600">
            {(analytics.summary.weeklyFrequency || 0).toFixed(1)}
          </div>
          <div className="text-gray-500 text-xs mt-1">workouts/week</div>
        </Card>
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
        <Card className="p-6">
          <h2 className="text-xl font-display font-bold text-primary-dark mb-4">Recent Personal Records</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {analytics.prTimeline.slice(0, 10).map((pr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded hover:bg-gray-200 transition">
                <div className="flex-1">
                  <div className="font-body font-medium text-primary">{pr.exercise}</div>
                  <div className="text-xs text-gray-600">{new Date(pr.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-body font-bold text-primary-dark">{(pr.newVolume || 0).toFixed(0)} lbs</div>
                  <div className="text-xs text-green-600">
                    +{(pr.improvement || 0).toFixed(0)} lbs ({(pr.percentIncrease || 0).toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
            {analytics.prTimeline.length === 0 && (
              <p className="text-center text-gray-600 py-8">No PRs recorded yet. Keep pushing!</p>
            )}
          </div>
        </Card>

        {/* Activity Calendar Heatmap - Full width */}
        <div className="lg:col-span-2">
          <ActivityCalendarHeatmap
            activityCalendar={analytics.consistencyMetrics.activityCalendar}
            timeRangeDays={timeRange}
          />
        </div>

        {/* Consistency Metrics */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-display font-bold text-primary-dark mb-4">Training Consistency</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-100 rounded min-h-[60px]">
              <div className="text-gray-600 text-sm mb-1">Current Streak</div>
              <div className="text-2xl font-display font-bold text-orange-600">{analytics.consistencyMetrics.currentStreak}</div>
              <div className="text-gray-500 text-xs">days</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded min-h-[60px]">
              <div className="text-gray-600 text-sm mb-1">Longest Streak</div>
              <div className="text-2xl font-display font-bold text-orange-600">{analytics.consistencyMetrics.longestStreak}</div>
              <div className="text-gray-500 text-xs">days</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded min-h-[60px]">
              <div className="text-gray-600 text-sm mb-1">This Week</div>
              <div className="text-2xl font-display font-bold text-primary">{analytics.consistencyMetrics.workoutsThisWeek}</div>
              <div className="text-gray-500 text-xs">workouts</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded min-h-[60px]">
              <div className="text-gray-600 text-sm mb-1">Last Week</div>
              <div className="text-2xl font-display font-bold text-primary">{analytics.consistencyMetrics.workoutsLastWeek}</div>
              <div className="text-gray-500 text-xs">workouts</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded min-h-[60px]">
              <div className="text-gray-600 text-sm mb-1">Avg Frequency</div>
              <div className="text-2xl font-display font-bold text-purple-600">
                {(analytics.consistencyMetrics.avgWeeklyFrequency || 0).toFixed(1)}
              </div>
              <div className="text-gray-500 text-xs">workouts/week</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
