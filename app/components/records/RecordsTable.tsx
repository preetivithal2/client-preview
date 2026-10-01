"use client";

import { Record as RecordType } from "./types";
import { getStatusBadgeClasses } from "../../lib/utils";

interface RecordsTableProps {
  records: RecordType[];
  onView: (record: RecordType) => void;
  onEdit: (record: RecordType) => void;
  onDelete: (id: string) => void;
}

export default function RecordsTable({
  records,
  onView,
  onEdit,
  onDelete,
}: RecordsTableProps) {
  const priorityBadge = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    const styles: Record<string, string> = {
      high: "bg-[var(--clr-bg-red)] text-[var(--clr-text-red)] border-[var(--clr-bg-red-border)]",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      low: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return styles[p] || styles.low;
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl shadow-sm border border-[var(--clr-border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">
          Search Results
        </h3>
        <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] bg-[var(--clr-bg-subtle)] px-2.5 py-1 rounded">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--clr-bg-page)] border-b border-[var(--clr-border)] text-[11px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-wider">
              <th className="py-3.5 px-6 text-left">Job ID</th>
              <th className="py-3.5 px-6 text-left">Component</th>
              <th className="py-3.5 px-6 text-left">Vessel</th>
              <th className="py-3.5 px-6 text-left">Priority</th>
              <th className="py-3.5 px-6 text-left">Reported Date</th>
              <th className="py-3.5 px-6 text-left">Status</th>
              <th className="py-3.5 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--clr-border)]">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[var(--clr-text-muted)] font-mono text-sm">
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-[var(--clr-bg-page)] transition-colors group">
                  <td className="py-3 px-6 font-mono text-xs font-bold text-[var(--clr-text-primary)]">{record.jobId || '-'}</td>
                  <td className="py-3 px-6 font-medium text-[var(--clr-text-primary)]">{record.component}</td>
                  <td className="py-3 px-6 text-[var(--clr-text-primary)]">{record.vesselName}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityBadge(
                        record.priority
                      )}`}
                    >
                      {record.priority?.toUpperCase() || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-[var(--clr-text-primary)]">{record.reportedDate}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(record.status || "OPEN")}`}
                    >
                      {record.status || "OPEN"}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(record)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(record)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-red)] transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
