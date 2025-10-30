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
import { ExerciseProgression } from '../types';

interface ExerciseProgressionChartProps {
  exerciseProgression: Record<string, ExerciseProgression>;
}

const ExerciseProgressionChart: React.FC<ExerciseProgressionChartProps> = ({
  exerciseProgression
}) => {
  const exercises = Object.keys(exerciseProgression);
  const [selectedExercise, setSelectedExercise] = useState<string>(
    exercises.length > 0 ? exercises[0] : ''
  );

  if (exercises.length === 0) {
    return (
      <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Exercise Progression</h2>
        <div className="bg-brand-dark/50 rounded p-8 text-center">
          <p className="text-slate-400">No exercise data available</p>
        </div>
      </div>
    );
  }

  const progression = exerciseProgression[selectedExercise];
  const chartData = progression.dataPoints.map((dp) => ({
    date: new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: dp.volume,
    weight: dp.weight,
    reps: dp.reps
  }));

  return (
    <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Exercise Progression</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your volume improvement over time
          </p>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-brand-dark border border-brand-muted rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan min-w-[200px]"
        >
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Best Set</div>
          <div className="text-lg font-bold text-brand-cyan">
            {(progression.bestSingleSet || 0).toFixed(0)} lbs
          </div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Progress</div>
          <div className={`text-lg font-bold ${
            (progression.percentChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {(progression.percentChange || 0) >= 0 ? '+' : ''}{(progression.percentChange || 0).toFixed(1)}%
          </div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Data Points</div>
          <div className="text-lg font-bold text-slate-200">
            {progression.dataPoints.length}
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
                if (name === 'volume') return [`${(value || 0).toFixed(0)} lbs`, 'Volume'];
                if (name === 'weight') return [`${(value || 0).toFixed(1)} lbs`, 'Weight'];
                if (name === 'reps') return [value || 0, 'Reps'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6, fill: '#22d3ee' }}
              name="Volume"
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 5, fill: '#c084fc' }}
              name="Weight"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Latest PR Badge */}
      {progression.latestPR && (
        <div className="mt-4 bg-green-900/20 border border-green-500/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-400 font-semibold text-sm">Latest PR</span>
              <span className="text-slate-400 text-xs ml-2">
                {new Date(progression.latestPR.date).toLocaleDateString()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">
                {(progression.latestPR.weight || 0).toFixed(1)} lbs × {progression.latestPR.reps || 0} reps
              </div>
              <div className="text-slate-400 text-xs">
                {((progression.latestPR.weight || 0) * (progression.latestPR.reps || 0)).toFixed(0)} lbs total
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseProgressionChart;
