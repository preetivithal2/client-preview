"use client";

import { useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";

export default function StatusDistribution() {
  const { data: workLogs, loading } = useWorkLog();

  const data = useMemo(() => {
    if (loading || workLogs.length === 0) return null;

    const total = workLogs.length;
    const closed = workLogs.filter((w) => w.status?.toLowerCase().includes('closed') || w.status?.toLowerCase().includes('complete')).length;
    const open = total - closed;
    const isOpen = (s: string | undefined) => s?.toLowerCase().includes('open') ?? false;
    const isPrio = (p: string | undefined, val: string) => p?.toUpperCase() === val;
    const high = workLogs.filter((w) => isOpen(w.status) && isPrio(w.priority, 'HIGH')).length;
    const medium = workLogs.filter((w) => isOpen(w.status) && isPrio(w.priority, 'MEDIUM')).length;
    const low = workLogs.filter((w) => isOpen(w.status) && isPrio(w.priority, 'LOW')).length;

    const items = [
      { name: "High Priority", count: high, color: "bg-red-500" },
      { name: "Medium Priority", count: medium, color: "bg-amber-500" },
      { name: "Low Priority", count: low, color: "bg-green-400" },
      { name: "Completed / Closed", count: closed, color: "bg-[#E8EAB2]" },
    ];

    return { total, open, closed, high, medium, low, items };
  }, [workLogs, loading]);

  return (
    <div className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl p-5 lg:p-6 shadow-xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-body)]">
            Status Distribution
          </h3>
          <span className="text-[10px] font-mono bg-[var(--clr-bg-subtle)] text-[var(--clr-text-body)] px-2 py-0.5 font-bold rounded">
            {loading ? "..." : `${data?.total || 0} TOTAL`}
          </span>
        </div>

        {/* Segmented Cumulative Horizontal Component Track */}
        <div className="w-full h-3 bg-[var(--clr-bg-subtle)] rounded-full overflow-hidden flex mb-6">
          {data ? (
            <>
              <div
                className="h-full bg-red-500"
                style={{ width: `${data.total > 0 ? (data.high / data.total) * 100 : 0}%` }}
                title="High Priority"
              />
              <div
                className="h-full bg-amber-500"
                style={{ width: `${data.total > 0 ? (data.medium / data.total) * 100 : 0}%` }}
                title="Medium Priority"
              />
              <div
                className="h-full bg-green-400"
                style={{ width: `${data.total > 0 ? (data.low / data.total) * 100 : 0}%` }}
                title="Low Priority"
              />
              <div
                className="h-full bg-[#E8EAB2]"
                style={{ width: `${data.total > 0 ? (data.closed / data.total) * 100 : 0}%` }}
                title="Completed / Closed"
              />
            </>
          ) : (
            <div className="h-full bg-[var(--clr-bg-subtle)] rounded-full w-full" />
          )}
        </div>

        {/* Summary line: Open vs Closed */}
        {data && (
          <div className="flex items-center justify-between text-xs font-mono text-[var(--clr-text-secondary)] mb-4 px-0.5">
            <span>
              <span className="font-bold text-[var(--clr-text-body)]">{data.open}</span> Open
            </span>
            <span>
              <span className="font-bold text-[var(--clr-text-body)]">{data.closed}</span> Closed
            </span>
          </div>
        )}

        {/* Legend Metric Item Set */}
        <div className="space-y-3.5">
          {data ? (
            data.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${item.color}`} />
                  <span className="font-semibold text-[var(--clr-text-body)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[var(--clr-text-body)] font-bold">{item.count}</span>
                  <span className="text-xs font-medium text-[var(--clr-text-muted)] w-8 text-right">
                    {data.total > 0 ? Math.round((item.count / data.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between text-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[var(--clr-border)]" />
                    <div className="h-3 w-28 bg-[var(--clr-border)] rounded" />
                  </div>
                  <div className="h-3 w-16 bg-[var(--clr-border)] rounded" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
