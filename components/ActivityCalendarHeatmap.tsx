import React from 'react';
import { ActivityDay } from '../types';

interface ActivityCalendarHeatmapProps {
  activityCalendar: ActivityDay[];
  timeRangeDays?: number;
}

const ActivityCalendarHeatmap: React.FC<ActivityCalendarHeatmapProps> = ({
  activityCalendar,
  timeRangeDays = 90
}) => {
  // Create a map of dates to activity data
  const activityMap = new Map<string, ActivityDay>();
  activityCalendar.forEach(activity => {
    activityMap.set(activity.date, activity);
  });

  // Generate calendar grid (last N days)
  const today = new Date();
  const days: Array<{ date: string; activity: ActivityDay | null; dayOfWeek: number }> = [];

  for (let i = timeRangeDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    days.push({
      date: dateKey,
      activity: activityMap.get(dateKey) || null,
      dayOfWeek
    });
  }

  // Group days into weeks
  const weeks: Array<Array<{ date: string; activity: ActivityDay | null; dayOfWeek: number }>> = [];
  let currentWeek: Array<{ date: string; activity: ActivityDay | null; dayOfWeek: number }> = [];

  // Add empty days at the start if needed to align with Sunday
  const firstDayOfWeek = days[0]?.dayOfWeek || 0;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: '', activity: null, dayOfWeek: i });
  }

  days.forEach(day => {
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || day === days[days.length - 1]) {
      // End of week or last day
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Push: 'bg-red-500',
      Pull: 'bg-blue-500',
      Legs: 'bg-yellow-500',
      Core: 'bg-green-500'
    };
    return colors[category] || 'bg-brand-cyan';
  };

  // Calculate stats
  const totalWorkouts = activityCalendar.length;
  const workoutDays = new Set(activityCalendar.map(a => a.date)).size;
  const activeDaysPercentage = (workoutDays / timeRangeDays) * 100;

  return (
    <div className="bg-brand-surface border border-brand-muted rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-200">Training Activity</h2>
        <p className="text-sm text-slate-400 mt-1">
          Your workout frequency over the last {timeRangeDays} days
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Active Days</div>
          <div className="text-lg font-bold text-brand-cyan">{workoutDays}</div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Total Workouts</div>
          <div className="text-lg font-bold text-brand-cyan">{totalWorkouts}</div>
        </div>
        <div className="bg-brand-dark/50 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Activity Rate</div>
          <div className="text-lg font-bold text-green-400">
            {activeDaysPercentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div
                key={i}
                className="flex-1 text-center text-xs text-slate-400 font-medium min-w-[32px]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex items-center">
                {/* Week number or month indicator */}
                <div className="w-8 text-xs text-slate-500 text-right pr-2">
                  {weekIndex === 0 || weekIndex % 4 === 0 ? `W${weekIndex + 1}` : ''}
                </div>

                {/* Days in week */}
                <div className="flex gap-1">
                  {week.map((day, dayIndex) => {
                    const key = `${weekIndex}-${dayIndex}`;

                    // Empty placeholder
                    if (!day.date) {
                      return (
                        <div
                          key={key}
                          className="w-8 h-8 rounded bg-transparent"
                        />
                      );
                    }

                    // Day with or without activity
                    const hasActivity = day.activity !== null;
                    const bgColor = hasActivity
                      ? getCategoryColor(day.activity!.category)
                      : 'bg-brand-dark/50';
                    const borderColor = hasActivity
                      ? 'border-transparent'
                      : 'border-brand-muted';

                    return (
                      <div
                        key={key}
                        className={`w-8 h-8 rounded border ${bgColor} ${borderColor} transition-all hover:scale-110 hover:ring-2 hover:ring-brand-cyan cursor-pointer relative group`}
                        title={
                          hasActivity
                            ? `${new Date(day.date).toLocaleDateString()}: ${day.activity!.category} (${day.activity!.workoutCount} workout${day.activity!.workoutCount > 1 ? 's' : ''})`
                            : `${new Date(day.date).toLocaleDateString()}: Rest day`
                        }
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-dark border border-brand-muted rounded text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {hasActivity && (
                            <div className="text-brand-cyan">{day.activity!.category}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <span className="text-slate-400">Categories:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-slate-300">Push</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-slate-300">Pull</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-slate-300">Legs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-slate-300">Core</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-brand-dark/50 border border-brand-muted"></div>
          <span className="text-slate-300">Rest</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendarHeatmap;
