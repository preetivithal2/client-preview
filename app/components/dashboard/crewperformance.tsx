// components/dashboard/CrewPerformance.tsx
"use client";

import { useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";

// Overdue threshold in days – you can adjust this
const OVERDUE_THRESHOLD = 3;

interface CrewMetric {
  rank: string;
  total: number;
  completed: number;
  overdue: number;
  avgDays: number;
  completionRate: number;
}

export default function CrewPerformance() {
  const { data: workLogs, loading, error } = useWorkLog();

  const metrics = useMemo<CrewMetric[]>(() => {
    if (!workLogs) return [];

    const rankMap: Record<string, { total: number; completed: number; overdue: number; daysSum: number }> = {};

    workLogs.forEach((log) => {
      const rank = log.reportedBy || "Unknown";
      if (!rankMap[rank]) {
        rankMap[rank] = { total: 0, completed: 0, overdue: 0, daysSum: 0 };
      }
      rankMap[rank].total += 1;

      if (log.status?.toLowerCase().includes('closed') && log.daysOpen !== undefined) {
        rankMap[rank].completed += 1;
        rankMap[rank].daysSum += log.daysOpen;
      } else if (log.status?.toLowerCase().includes('open')) {
        const daysOpen = log.daysOpen ?? 0;
        if (daysOpen > OVERDUE_THRESHOLD) {
          rankMap[rank].overdue += 1;
        }
      }
    });

    return Object.entries(rankMap)
      .map(([rank, data]) => ({
        rank,
        total: data.total,
        completed: data.completed,
        overdue: data.overdue,
        avgDays: data.completed > 0 ? Number((data.daysSum / data.completed).toFixed(1)) : 0,
        completionRate: data.total > 0 ? Number(((data.completed / data.total) * 100).toFixed(0)) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [workLogs]);

  if (loading) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 animate-pulse">
        <div className="h-5 w-48 bg-[var(--clr-border)] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[var(--clr-border)] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 text-sm text-[var(--clr-text-red)]">
        Failed to load performance data.
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 text-center text-[var(--clr-text-muted)] font-mono text-sm">
        No work log data available for performance analytics.
      </div>
    );
  }

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)] flex items-center gap-2">
          <span>📊</span> Crew Performance Analytics
        </h3>
        <span className="text-[10px] font-mono text-[var(--clr-text-secondary)] bg-[var(--clr-bg-muted)] px-2.5 py-1 rounded">
          {metrics.length} ranks
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest border-b border-[var(--clr-border)]">
              <th className="py-2 px-3">Rank / Engineer</th>
              <th className="py-2 px-3 text-center">Assigned</th>
              <th className="py-2 px-3 text-center">Completed</th>
              <th className="py-2 px-3 text-center">Overdue</th>
              <th className="py-2 px-3 text-center">Avg. Days</th>
              <th className="py-2 px-3 text-center">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--clr-border)]">
            {metrics.map((metric) => (
              <tr key={metric.rank} className="hover:bg-[var(--clr-bg-card-hover)] transition-colors">
                <td className="py-3 px-3 font-semibold text-[var(--clr-text-primary)]">
                  {metric.rank}
                </td>
                <td className="py-3 px-3 text-center font-mono font-medium text-[var(--clr-text-primary)]">
                  {metric.total}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                    {metric.completed}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${metric.overdue > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {metric.overdue > 0 ? `${metric.overdue}` : '0'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-mono text-[var(--clr-text-secondary)]">
                  {metric.avgDays > 0 ? `${metric.avgDays}d` : '—'}
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-[var(--clr-text-primary)] min-w-[2.5rem] text-right">
                      {metric.completionRate}%
                    </span>
                    <div className="w-24 h-1.5 bg-[var(--clr-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metric.completionRate}%`,
                          background: `linear-gradient(90deg, ${metric.completionRate > 70 ? '#22c55e' : metric.completionRate > 40 ? '#eab308' : '#ef4444'}, ${metric.completionRate > 70 ? '#16a34a' : metric.completionRate > 40 ? '#ca8a04' : '#dc2626'})`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Small note about overdue threshold */}
      <div className="px-6 py-2 border-t border-[var(--clr-border)] text-[10px] text-[var(--clr-text-muted)] font-mono">
        Overdue = Open tasks &gt; {OVERDUE_THRESHOLD} days
      </div>
    </div>
  );
}