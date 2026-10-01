

// components/work-logs/WorkLogTable.tsx
"use client";

import { WorkLogEntry } from '../../lib/types';
import { formatDate, getStatusBadgeClasses } from '../../lib/utils';

interface WorkLogTableProps {
  entries: WorkLogEntry[];
  onView: (entry: WorkLogEntry) => void;
  onEdit: (entry: WorkLogEntry) => void;
  onDelete: (entry: WorkLogEntry) => void;   // ← now receives the whole entry
  // Optional multi-select support
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
}

export default function WorkLogTable({ entries, onView, onEdit, onDelete, selectedIds, onToggleSelect, onToggleSelectAll }: WorkLogTableProps) {
  const multiSelectEnabled = !!selectedIds && !!onToggleSelect;
  const allSelected = multiSelectEnabled && entries.length > 0 && entries.every((e) => selectedIds!.has(e.id!));
  const priorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-[var(--clr-bg-red)] text-[var(--clr-text-red)] border-[var(--clr-bg-red-border)]';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusColor = (status: string) => {
    return getStatusBadgeClasses(status);
  };

  // Helper to display sparesUsed array as comma-separated string
  const displaySpares = (spares: any) => {
    if (!spares) return '-';
    if (Array.isArray(spares)) return spares.join(', ') || '-';
    return spares; // fallback if string
  };

  return (
    <div className="bg-[var(--clr-bg-card)] backdrop-blur-sm border border-[var(--clr-border)] rounded-2xl shadow-sm">
      <div className="overflow-x-auto max-h-[450px] overflow-y-auto rounded-2xl">
        <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
          <thead className="bg-[var(--clr-bg-subtle)] [&>th]:border-b [&>th]:border-[var(--clr-border)]">
            <tr>
              {multiSelectEnabled && (
                <th className="sticky left-0 top-0 z-40 bg-[var(--clr-bg-subtle)] text-center py-3 px-2 w-[40px]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                    className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer"
                    title="Select all"
                  />
                </th>
              )}
              {/* Sticky Job ID - Full width, no truncation */}
              <th className={`sticky top-0 z-30 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[130px] ${multiSelectEnabled ? 'left-[40px]' : 'left-0'}`}>
                Job ID
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[100px]">
                Reported
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Equipment
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[80px]">
                Priority
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[180px]">
                Description
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[80px]">
                Status
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[70px]">
                Days
              </th>
              {/* TEMP-HIDDEN COLUMN: "Regulation" — hidden per client request. Uncomment to restore. */}
              {/* <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Regulation
              </th> */}
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Component
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Vessel
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Department
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Reported By
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[100px]">
                Office
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Assistants
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[150px]">
                Actions Taken
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[150px]">
                Spares
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Reason
              </th>
              {/* TEMP-HIDDEN COLUMN: "Order Status" — hidden per client request. Uncomment to restore. */}
              {/* <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Order Status
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[100px]">
                PO Ref
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[110px]">
                Req Status
              </th> */}
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[80px]">
                Media
              </th>
              {/* TEMP-HIDDEN COLUMN: "Tested" — hidden per client request. Uncomment to restore. */}
              {/* <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Tested
              </th> */}
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Condition
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[100px]">
                Completed
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[120px]">
                Completed By
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[180px]">
                Resolution
              </th>
              <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:border-b [&>tr>td]:border-[var(--clr-border)]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={multiSelectEnabled ? 22 : 21} className="py-10 text-center text-[var(--clr-text-muted)] font-mono text-sm">
                  No work log entries yet. Add one above.
                </td>
              </tr>
            ) : (
              entries.map(entry => {
                const status = entry.status || 'OPEN';
                const rowBg = entry.priority?.toUpperCase() === 'HIGH' && status?.toLowerCase().includes('open') ? 'bg-[var(--clr-bg-red)]' : 'bg-[var(--clr-bg-card)]';
                const isSelected = multiSelectEnabled ? selectedIds!.has(entry.id!) : false;
                return (
                  <tr key={entry.id} className={`${rowBg} hover:bg-[var(--clr-bg-page)] transition ${isSelected ? 'ring-2 ring-inset ring-[var(--clr-bg-accent)]' : ''}`}>
                    {multiSelectEnabled && (
                      <td className="sticky left-0 z-30 bg-[var(--clr-bg-card)] py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(entry.id!)}
                          className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer"
                          title={`Select ${entry.jobId || ''}`}
                        />
                      </td>
                    )}
                    {/* Sticky Job ID - Full value, no truncation */}
                    <td className={`sticky z-20 bg-[var(--clr-bg-card)] py-3 px-4 font-mono text-xs font-bold text-[var(--clr-text-primary)] whitespace-nowrap ${multiSelectEnabled ? 'left-[40px]' : 'left-0'}`}>
                      {entry.jobId || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--clr-text-primary)] whitespace-nowrap">{formatDate(entry.reportedDate)}</td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.equipmentName || ''}>
                      {entry.equipmentName || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityColor(entry.priority)}`} title={`Raw priority: "${entry.priority}"`}>
                        {(entry.priority || '').toUpperCase() || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 truncate max-w-[180px] text-[var(--clr-text-primary)]" title={entry.jobDescription}>
                      {entry.jobDescription}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${statusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--clr-text-primary)] whitespace-nowrap">{entry.daysOpen ?? '-'}</td>
                    {/* TEMP-HIDDEN COLUMN: "Regulation" — hidden per client request. Uncomment to restore. */}
                    {/* <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.regulation || ''}>
                      {entry.regulation || '-'}
                    </td> */}
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.component || ''}>
                      {entry.component || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.vesselName || ''}>
                      {entry.vesselName || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.department || ''}>
                      {entry.department || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.reportedBy || ''}>
                      {entry.reportedBy || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[100px]" title={entry.officeNotified || ''}>
                      {entry.officeNotified || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.assistantsRequired || ''}>
                      {entry.assistantsRequired || '-'}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[150px] text-[var(--clr-text-primary)]" title={entry.actionsTaken || ''}>
                      {entry.actionsTaken || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[150px]" title={displaySpares(entry.sparesUsed)}>
                      {displaySpares(entry.sparesUsed)}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.reasonDelay || ''}>
                      {entry.reasonDelay || '-'}
                    </td>
                    {/* TEMP-HIDDEN COLUMN: "Order Status / PO Ref / Req Status" — hidden per client request. Uncomment to restore. */}
                    {/* <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.orderStatus || ''}>
                      {entry.orderStatus || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[100px]" title={entry.poReference || ''}>
                      {entry.poReference || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[110px]" title={entry.requisitionStatus || ''}>
                      {entry.requisitionStatus || '-'}
                    </td> */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {entry.mediaAttachments ? (
                        <a href={entry.mediaAttachments} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          Link
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    {/* TEMP-HIDDEN COLUMN: "Tested" — hidden per client request. Uncomment to restore. */}
                    {/* <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.testedCriteria || ''}>
                      {entry.testedCriteria || '-'}
                    </td> */}
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.conditionMatrix || ''}>
                      {entry.conditionMatrix || '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] whitespace-nowrap">{entry.dateCompleted ? formatDate(entry.dateCompleted) : '-'}</td>
                    <td className="py-3 px-4 text-[var(--clr-text-primary)] truncate max-w-[120px]" title={entry.completedBy || ''}>
                      {entry.completedBy || '-'}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[180px] text-[var(--clr-text-primary)]" title={entry.resolution || ''}>
                      {entry.resolution || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(entry)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                        
                          onClick={() => onDelete(entry)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}