"use client";

import { useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";

export default function KpiStats() {
  const { data: workLogs, loading } = useWorkLog();

  const stats = useMemo(() => {
    const isOpen = (s: string | undefined) => s?.toLowerCase().includes('open') ?? false;
    const isHigh = (p: string | undefined) => p?.toUpperCase() === 'HIGH';
    const isProgress = (s: string | undefined) => s?.toLowerCase().includes('progress') ?? false;

    const totalOpen = workLogs.filter((w) => isOpen(w.status)).length;
    const highPriority = workLogs.filter((w) => isOpen(w.status) && isHigh(w.priority)).length;
    const inProgress = workLogs.filter((w) => isProgress(w.status)).length;

    return [
      {
        title: "Total Open Jobs",
        value: loading ? "..." : String(totalOpen).padStart(2, '0'),
        context: "Active maintenance tickets",
        bg: "bg-[var(--clr-bg-card)]",
        border: "border-[var(--clr-border-light)]",
        textColor: "text-[var(--clr-text-body)]",
        icon: (
          <svg className="w-5 h-5 text-[var(--clr-text-body)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        )
      },
      {
        title: "High Priority Faults",
        value: loading ? "..." : String(highPriority).padStart(2, '0'),
        context: "Requires immediate mitigation",
        bg: "bg-[var(--clr-bg-card)]",
        border: "border-[var(--clr-border-light)]",
        textColor: "text-[var(--clr-text-body)]",
        icon: (
          <svg className="w-5 h-5 text-[var(--clr-text-body)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        )
      },
      {
        title: "In-Progress Worklines",
        value: loading ? "..." : String(inProgress).padStart(2, '0'),
        context: "Engineers actively deployed",
        bg: "bg-[var(--clr-bg-card)]",
        border: "border-[var(--clr-border-light)]",
        textColor: "text-[var(--clr-text-body)]",
        icon: (
          <svg className="w-5 h-5 text-[var(--clr-text-body)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
        )
      }
    ];
  }, [workLogs, loading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-xl border ${stat.border} ${stat.bg} shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex items-start justify-between`}
        >
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono tracking-wider text-[var(--clr-text-secondary)] uppercase block">
              {stat.title}
            </span>
            <h2 className={`text-4xl font-black tracking-tight ${stat.textColor}`}>
              {stat.value}
            </h2>
            <p className="text-xs font-medium text-[var(--clr-text-secondary)]">{stat.context}</p>
          </div>
          <div className="p-2.5 bg-[var(--clr-bg-subtle)] rounded-lg shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
