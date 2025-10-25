import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { VolumeTrends } from '../types';

interface VolumeTrendsChartProps {
  volumeTrends: VolumeTrends;
}

const VolumeTrendsChart: React.FC<VolumeTrendsChartProps> = ({ volumeTrends }) => {
  if (!volumeTrends.byWeek || volumeTrends.byWeek.length === 0) {
    return (
      <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Weekly Volume Trends</h2>
        <div className="bg-brand-dark/50 rounded p-8 text-center">
          <p className="text-slate-400">No volume data available</p>
        </div>
      </div>
    );
  }

  // Format chart data for stacked bar chart
  const chartData = volumeTrends.byWeek.map((week) => ({
    week: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Push: week.Push,
    Pull: week.Pull,
    Legs: week.Legs,
    Core: week.Core,
    total: week.total
  }));

  // Format volume in thousands
  const formatVolume = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  // Calculate total volume
  const totalVolume = volumeTrends.byWeek.reduce((sum, week) => sum + week.total, 0);
  const avgWeeklyVolume = totalVolume / volumeTrends.byWeek.length;

  return (
    <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-200">Weekly Volume Trends</h2>
        <p className="text-sm text-slate-400 mt-1">
          Training volume breakdown by category
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-center">
          <div className="text-xs text-red-300 mb-1">Push</div>
          <div className="text-lg font-bold text-red-400">
            {formatVolume(volumeTrends.byCategory.Push.total)}
          </div>
          {volumeTrends.byCategory.Push.percentChange !== 0 && (
            <div className={`text-xs ${volumeTrends.byCategory.Push.percentChange > 0 ? 'text-green-400' : 'text-red-300'}`}>
              {volumeTrends.byCategory.Push.percentChange > 0 ? '+' : ''}{volumeTrends.byCategory.Push.percentChange.toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 text-center">
          <div className="text-xs text-blue-300 mb-1">Pull</div>
          <div className="text-lg font-bold text-blue-400">
            {formatVolume(volumeTrends.byCategory.Pull.total)}
          </div>
          {volumeTrends.byCategory.Pull.percentChange !== 0 && (
            <div className={`text-xs ${volumeTrends.byCategory.Pull.percentChange > 0 ? 'text-green-400' : 'text-red-300'}`}>
              {volumeTrends.byCategory.Pull.percentChange > 0 ? '+' : ''}{volumeTrends.byCategory.Pull.percentChange.toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 text-center">
          <div className="text-xs text-yellow-300 mb-1">Legs</div>
          <div className="text-lg font-bold text-yellow-400">
            {formatVolume(volumeTrends.byCategory.Legs.total)}
          </div>
          {volumeTrends.byCategory.Legs.percentChange !== 0 && (
            <div className={`text-xs ${volumeTrends.byCategory.Legs.percentChange > 0 ? 'text-green-400' : 'text-red-300'}`}>
              {volumeTrends.byCategory.Legs.percentChange > 0 ? '+' : ''}{volumeTrends.byCategory.Legs.percentChange.toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-center">
          <div className="text-xs text-green-300 mb-1">Core</div>
          <div className="text-lg font-bold text-green-400">
            {formatVolume(volumeTrends.byCategory.Core.total)}
          </div>
          {volumeTrends.byCategory.Core.percentChange !== 0 && (
            <div className={`text-xs ${volumeTrends.byCategory.Core.percentChange > 0 ? 'text-green-400' : 'text-red-300'}`}>
              {volumeTrends.byCategory.Core.percentChange > 0 ? '+' : ''}{volumeTrends.byCategory.Core.percentChange.toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="week"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8' }}
              tickFormatter={formatVolume}
              label={{ value: 'Volume (lbs)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
              formatter={(value: any, name: string) => {
                const labels: Record<string, string> = {
                  Push: 'Push',
                  Pull: 'Pull',
                  Legs: 'Legs',
                  Core: 'Core'
                };
                return [`${formatVolume(value)} lbs`, labels[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
            />
            <Bar dataKey="Push" stackId="volume" fill="#f87171" />
            <Bar dataKey="Pull" stackId="volume" fill="#60a5fa" />
            <Bar dataKey="Legs" stackId="volume" fill="#facc15" />
            <Bar dataKey="Core" stackId="volume" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Volume Display */}
      <div className="mt-4 bg-brand-dark/50 border border-brand-muted rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Average Weekly Volume</span>
          <span className="text-brand-cyan font-bold text-lg">
            {formatVolume(avgWeeklyVolume)} lbs
          </span>
        </div>
      </div>
    </div>
  );
};

export default VolumeTrendsChart;
