import React from 'react';
import { PRHighlight, WeeklyStats } from '../utils/statsHelpers';

interface QuickTrainingStatsProps {
  streak: number;
  weeklyStats: WeeklyStats;
  recentPRs: PRHighlight[];
}

const QuickTrainingStats: React.FC<QuickTrainingStatsProps> = React.memo(({
  streak,
  weeklyStats,
  recentPRs
}) => {
  const handlePRClick = () => {
    if (recentPRs.length === 0) return;

    // Show toast with PR details
    const prList = recentPRs.map(pr =>
      `${pr.exercise}: +${pr.improvement.toFixed(1)}%`
    ).join('\n');

    alert(`Recent PRs:\n\n${prList}`);
  };

  const getStreakColor = () => {
    if (streak >= 3) return 'text-green-400';
    if (streak >= 1) return 'text-yellow-400';
    return 'text-slate-400';
  };

  const getWeeklyTrend = () => {
    const { thisWeek, lastWeek } = weeklyStats;
    if (thisWeek > lastWeek) {
      return { text: `↑ from ${lastWeek}`, color: 'text-green-400' };
    }
    if (thisWeek < lastWeek) {
      return { text: `↓ from ${lastWeek}`, color: 'text-red-400' };
    }
    return { text: `→ same`, color: 'text-slate-400' };
  };

  const trend = getWeeklyTrend();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Streak Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400 uppercase tracking-wide">Streak</span>
          <span className="text-2xl">🔥</span>
        </div>
        <div className={`text-3xl font-bold ${getStreakColor()}`}>
          {streak}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {streak === 0 ? 'Start your streak today!' : `consecutive day${streak !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Weekly Stats Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400 uppercase tracking-wide">This Week</span>
          <span className="text-2xl">📊</span>
        </div>
        <div className="text-3xl font-bold text-blue-400">
          {weeklyStats.thisWeek}
        </div>
        <div className={`text-xs mt-1 ${trend.color}`}>
          {trend.text}
        </div>
      </div>

      {/* PRs Card */}
      <div
        className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${
          recentPRs.length > 0 ? 'cursor-pointer hover:bg-slate-750 transition-colors' : ''
        }`}
        onClick={handlePRClick}
        role={recentPRs.length > 0 ? 'button' : undefined}
        tabIndex={recentPRs.length > 0 ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && recentPRs.length > 0) {
            handlePRClick();
          }
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400 uppercase tracking-wide">PRs</span>
          <span className="text-2xl">🏆</span>
        </div>
        <div className="text-3xl font-bold text-yellow-400">
          {recentPRs.length}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {recentPRs.length === 0 ? 'last 7 days' : `new${recentPRs.length > 0 ? ' - click for details' : ''}`}
        </div>
      </div>
    </div>
  );
});

QuickTrainingStats.displayName = 'QuickTrainingStats';

export default QuickTrainingStats;
