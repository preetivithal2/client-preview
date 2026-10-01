"use client";

import { useState, useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";
import { WorkLogEntry } from "../../lib/types";
import WorkLogView from "../work-logs/shared/WorkLogView";

type PriorityFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

function calcDaysPassed(createdAt: any): number {
  if (!createdAt) return 0;
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
}

export default function SparePartsTable() {
  const { data: workLogs, loading } = useWorkLog();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("HIGH");
  const [viewEntry, setViewEntry] = useState<WorkLogEntry | null>(null);

  const rows = useMemo(() => {
    if (loading) return [];

    // Only entries that have spares used (handle both string and array)
    const entries = workLogs.filter((w) => {
      const spares = Array.isArray(w.sparesUsed) ? w.sparesUsed : (w.sparesUsed ? [w.sparesUsed] : []);
      return spares.length > 0 && spares.some((s) => s && s.trim());
    });

    return entries.map((w) => {
      const spares = Array.isArray(w.sparesUsed) ? w.sparesUsed : (w.sparesUsed ? [w.sparesUsed] : []);
      return {
        entry: w,
        id: w.id || w.jobId,
        poReference: w.poReference || "-",
        sparesName: spares.filter((s) => s && s.trim()).join(", "),
        orderStatus: w.orderStatus || "-",
        priority: w.priority,
        daysPassed: calcDaysPassed(w.createdAt),
      };
    });
  }, [workLogs, loading]);

  const filteredRows = useMemo(() => {
    if (priorityFilter === "ALL") return rows;
    return rows.filter((r) => r.priority?.toUpperCase() === priorityFilter);
  }, [rows, priorityFilter]);

  const priorityCounts = useMemo(() => {
    return {
      ALL: rows.length,
      HIGH: rows.filter((r) => r.priority?.toUpperCase() === "HIGH").length,
      MEDIUM: rows.filter((r) => r.priority?.toUpperCase() === "MEDIUM").length,
      LOW: rows.filter((r) => r.priority?.toUpperCase() === "LOW").length,
    };
  }, [rows]);

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl shadow-xs overflow-hidden">
      {/* Header Container */}
      <div className="p-5 border-b border-[var(--clr-border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-body)]">
            Pending Spare Parts Tracker
          </h3>
          <p className="text-xs text-[var(--clr-text-secondary)] mt-0.5">
            Orders with spares requisitioned - {filteredRows.length} of {rows.length} entries
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="priority-filter"
            className="text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-wider"
          >
            Filter:
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="text-[11px] font-mono bg-amber-50/60 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer transition-all uppercase tracking-wide"
          >
            <option value="ALL">All ({priorityCounts.ALL})</option>
            <option value="HIGH">High ({priorityCounts.HIGH})</option>
            <option value="MEDIUM">Medium ({priorityCounts.MEDIUM})</option>
            <option value="LOW">Low ({priorityCounts.LOW})</option>
          </select>
        </div>
      </div>

      {/* Main Records Presentation Surface */}
      <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--clr-bg-card-hover)] border-b border-[var(--clr-border-light)] text-[11px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-wider sticky top-0 z-10">
              <th className="py-3 px-5 bg-[var(--clr-bg-card-hover)]">PO / Requisition Ref</th>
              <th className="py-3 px-5 bg-[var(--clr-bg-card-hover)]">Spares Name</th>
              <th className="py-3 px-5 bg-[var(--clr-bg-card-hover)]">Order Status</th>
              <th className="py-3 px-5 bg-[var(--clr-bg-card-hover)]">Job Priority</th>
              <th className="py-3 px-5 text-center bg-[var(--clr-bg-card-hover)]">Days Passed</th>
              <th className="py-3 px-5 text-center bg-[var(--clr-bg-card-hover)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--clr-border-light)] text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs font-mono text-[var(--clr-text-muted)] uppercase tracking-wide">
                  Loading...
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-[var(--clr-bg-card-hover)]/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs font-bold text-[var(--clr-text-body)]">
                    {row.poReference}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[var(--clr-text-body)] max-w-[200px] truncate">
                    {row.sparesName}
                  </td>
                  <td className="py-3.5 px-5 text-[var(--clr-text-body)]">
                    {row.orderStatus}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${getPriorityBadge(row.priority)}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[var(--clr-text-body)]">
                    {row.daysPassed}d
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => setViewEntry(row.entry)}
                      className="text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
                      title="View details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs font-mono text-[var(--clr-text-muted)] uppercase tracking-wide">
                  No spare parts orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewEntry && (
        <WorkLogView entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </div>
  );
}
