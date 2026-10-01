"use client";

import { IncineratorLog } from "../../lib/types";
import { exportToCsv } from "../../lib/utils";

interface Props {
  logs: IncineratorLog[];
  onEdit: (log: IncineratorLog) => void;
  onDelete: (id: string) => void;
  onView?: (log: IncineratorLog) => void;
  onPrint?: (log: IncineratorLog) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
}

export default function IncineratorTable({ logs, onEdit, onDelete, onView, onPrint, selectedIds, onToggleSelect, onToggleSelectAll }: Props) {
  const multiSelectEnabled = !!selectedIds && !!onToggleSelect;
  const allSelected = multiSelectEnabled && logs.length > 0 && logs.every((l) => selectedIds!.has(l.id!));
  const handleExportCsv = () => {
    exportToCsv(logs, `incinerator-${new Date().toISOString().slice(0, 10)}`, {
      startDateTime: "Start Date/Time",
      endDateTime: "End Date/Time",
      wasteType: "Waste Type",
      incWasteOilTankM3: "Oil Tank (m³)",
      totalRunning: "Running (hrs)",
      quantity: "Quantity",
      quantityUnit: "Unit",
      remark: "Remark",
      regulation: "Regulation",
    });
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Log Entries</h3>
          <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] bg-[var(--clr-bg-muted)] px-2.5 py-1 rounded">{logs.length} entries</span>
        </div>
        {logs.length > 0 && (
          <button onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-ring)] rounded-lg transition cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-[var(--clr-text-muted)] font-mono text-sm">No incinerator entries yet. Add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--clr-bg-subtle)] border-b border-[var(--clr-border)] sticky top-0 z-10">
              <tr>
                {multiSelectEnabled && (
                  <th className="text-center py-3 px-2 w-[40px]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                      className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer"
                      title="Select all"
                    />
                  </th>
                )}
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-12">#</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Start</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">End</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Waste Type</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Oil Tank (m³)</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Run (hrs)</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Quantity</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Unit</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Regulation</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Remark</th>
                <th className="text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clr-border)]">
              {logs.map((log, idx) => (
                <tr key={log.id} className={`hover:bg-[var(--clr-bg-card-hover)] transition-colors ${multiSelectEnabled && selectedIds!.has(log.id!) ? 'bg-[var(--clr-bg-subtle)]' : ''}`}>
                  {multiSelectEnabled && (
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds!.has(log.id!)}
                        onChange={() => onToggleSelect?.(log.id!)}
                        className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer"
                        title="Select entry"
                      />
                    </td>
                  )}
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-muted)]">{logs.length - idx}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-primary)]">{new Date(log.startDateTime).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-primary)]">{new Date(log.endDateTime).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs text-[var(--clr-text-primary)]">{log.wasteType}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)]">{log.incWasteOilTankM3 || '—'}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)]">{log.totalRunning || '—'}</td>
                  <td className="py-3 px-4 font-mono text-sm font-semibold text-[var(--clr-text-primary)]">{log.quantity}</td>
                  <td className="py-3 px-4 text-xs text-[var(--clr-text-secondary)]">{log.quantityUnit || '—'}</td>
                  <td className="py-3 px-4 text-xs text-[var(--clr-text-secondary)]">{log.regulation || '—'}</td>
                  <td className="py-3 px-4 text-xs text-[var(--clr-text-secondary)] max-w-[150px] truncate" title={log.remark || ''}>{log.remark || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {onView && (
                        <button onClick={() => onView(log)} className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => onEdit(log)} className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(log.id!)} className="p-1.5 text-[var(--clr-text-secondary)] hover:text-red-600 transition cursor-pointer" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
