import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { MuscleCapacityTrend } from '../types';

interface MuscleCapacityChartProps {
  muscleCapacityTrends: Record<string, MuscleCapacityTrend>;
}

const MuscleCapacityChart: React.FC<MuscleCapacityChartProps> = ({
  muscleCapacityTrends
}) => {
  const muscles = Object.keys(muscleCapacityTrends);
  const [selectedMuscle, setSelectedMuscle] = useState<string>(
    muscles.length > 0 ? muscles[0] : ''
  );

  if (muscles.length === 0) {
    return (
      <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Muscle Capacity Growth</h2>
        <div className="bg-brand-dark/50 rounded p-8 text-center">
          <p className="text-slate-400">No muscle capacity data available</p>
        </div>
      </div>
    );
  }

  const trend = muscleCapacityTrends[selectedMuscle];
  const chartData = trend.dataPoints.map((dp) => ({
    date: new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    capacity: dp.capacity
  }));

  // Format capacity in thousands for display
  const formatCapacity = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Muscle Capacity Growth</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your muscle baseline capacity over time
          </p>
        </div>

        {/* Muscle Selector */}
        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          className="bg-brand-dark border border-brand-muted rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan min-w-[200px]"
        >
          {muscles.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Current Capacity</div>
          <div className="text-lg font-bold text-brand-cyan">
            {formatCapacity(trend.currentCapacity)}
          </div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Total Growth</div>
          <div className={`text-lg font-bold ${
            trend.percentGrowth >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend.percentGrowth >= 0 ? '+' : ''}{trend.percentGrowth.toFixed(1)}%
          </div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Avg/Month</div>
          <div className="text-lg font-bold text-purple-400">
            {formatCapacity(trend.avgGrowthPerMonth)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8' }}
              tickFormatter={formatCapacity}
              label={{ value: 'Capacity', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
              formatter={(value: any) => [formatCapacity(value), 'Capacity']}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7, fill: '#34d399' }}
              name="Capacity"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Indicator */}
      {trend.percentGrowth > 0 && (
        <div className="mt-4 bg-green-900/20 border border-green-500/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-400 font-semibold text-sm">Positive Growth</span>
              <span className="text-slate-400 text-xs ml-2">
                {selectedMuscle} is getting stronger
              </span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">
                +{formatCapacity(trend.currentCapacity - trend.startingCapacity)}
              </div>
              <div className="text-slate-400 text-xs">capacity increase</div>
            </div>
          </div>
        </div>
      )}

      {trend.percentGrowth === 0 && (
        <div className="mt-4 bg-brand-dark/50 border border-brand-muted rounded-lg p-3">
          <p className="text-slate-400 text-sm text-center">
            Keep training to see capacity growth for {selectedMuscle}
          </p>
        </div>
      )}
    </div>
  );
};

export default MuscleCapacityChart;
