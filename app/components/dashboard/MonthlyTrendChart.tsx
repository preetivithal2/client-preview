"use client";

import { useState, useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";

type RangeFilter = "h2" | "h1" | "year";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyTrendChart() {
  const { data: workLogs, loading } = useWorkLog();
  const [range, setRange] = useState<RangeFilter>("h2");

  const chartData = useMemo(() => {
    if (loading || workLogs.length === 0) return [];

    // Count jobs per month for the current year
    const currentYear = new Date().getFullYear();
    const monthCounts = new Array(12).fill(0);

    workLogs.forEach((w) => {
      if (!w.createdAt) return;
      const date = w.createdAt.toDate ? w.createdAt.toDate() : new Date(w.createdAt);
      if (date.getFullYear() === currentYear) {
        monthCounts[date.getMonth()] += 1;
      }
    });

    // Determine which months to show based on filter
    let monthsToShow: number[];
    if (range === "h2") {
      monthsToShow = [6, 7, 8, 9, 10, 11]; // Jul-Dec
    } else if (range === "h1") {
      monthsToShow = [0, 1, 2, 3, 4, 5]; // Jan-Jun
    } else {
      monthsToShow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // All
    }

    const data = monthsToShow.map((m) => ({
      month: MONTHS_SHORT[m],
      jobs: monthCounts[m],
    }));

    // Compute bar heights as percentage of max
    const maxJobs = Math.max(...data.map((d) => d.jobs), 1);

    return data.map((d) => ({
      ...d,
      height: Math.max(Math.round((d.jobs / maxJobs) * 100), 5),
    }));
  }, [workLogs, loading, range]);

  // MoM change: compare last two visible months with data
  const momChange = useMemo(() => {
    const withJobs = chartData.filter((d) => d.jobs > 0);
    if (withJobs.length < 2) return null;
    const last = withJobs[withJobs.length - 1].jobs;
    const prev = withJobs[withJobs.length - 2].jobs;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [chartData]);

  return (
    <div className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl p-5 lg:p-6 shadow-xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-body)]">
            Monthly Maintenance Record
          </h3>
          <div className="flex items-center gap-2">
            {momChange !== null && (
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  momChange >= 0
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {momChange >= 0 ? "+" : ""}
                {momChange}% MoM
              </span>
            )}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeFilter)}
              className="text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] bg-transparent border border-[var(--clr-border-light)] rounded px-2 py-1 cursor-pointer focus:outline-none"
            >
              <option value="h2">Current 6 Months</option>
              <option value="h1">Last 6 Months</option>
              <option value="year">One Year</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-[var(--clr-text-secondary)] mb-6">
          Workload frequency trend matrix
          {range === "year" ? " across full year" : range === "h2" ? " — H2" : " — H1"}
        </p>

        {/* Lightweight Pure CSS/HTML Graph Matrix */}
        <div className="h-44 w-full flex items-end justify-between gap-4 px-2 relative border-b border-[var(--clr-border-light)]">

          {/* Background Grid Accent Rules */}
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-[var(--clr-border-light)]" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--clr-border-light)]" />

          {chartData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group z-10">

              {/* Dynamic Bar Floating Label Container */}
              <span className="text-xs font-mono font-black text-[var(--clr-text-body)] opacity-80 group-hover:opacity-100 transition-opacity">
                {data.jobs}
              </span>

              {/* Main Structural Bar Component */}
              <div
                className="w-full bg-[var(--clr-bg-accent)] group-hover:bg-[var(--clr-bg-accent-hover)] rounded-t-md transition-all duration-300 relative"
                style={{ height: `${data.height}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--clr-text-accent-gold)] rounded-t-md" />
              </div>

            </div>
          ))}
        </div>

        {/* Horizontal Label Strip */}
        <div className="flex justify-between mt-2.5 px-2">
          {chartData.map((data, idx) => (
            <span key={idx} className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] flex-1 text-center">
              {data.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
