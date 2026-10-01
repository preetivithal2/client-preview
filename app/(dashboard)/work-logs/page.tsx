

// "use client";

// import { useState, useEffect } from 'react';
// import { WorkLogEntry } from '../../lib/types';
// import { useWorkLog } from '../../lib/hooks/useWorkLog';
// import WorkLogForm from '../../components/work-logs/WorkLogForm';
// import WorkLogTable from '../../components/work-logs/WorkLogTable';
// import WorkLogViewModal from '../../components/work-logs/WorkLogViewModal';

// export default function WorkLogPage() {
//   const { data: entries, loading, error, add, update, remove, refetch } = useWorkLog();
//   const [initialLoad, setInitialLoad] = useState(true);

//   useEffect(() => {
//     if (!loading) setInitialLoad(false);
//   }, [loading]);

//   const [editingEntry, setEditingEntry] = useState<WorkLogEntry | null>(null);
//   const [viewingEntry, setViewingEntry] = useState<WorkLogEntry | null>(null);

//   // Add or update entry via Firestore
//   const handleSaveEntry = async (entry: Omit<WorkLogEntry, 'id'>): Promise<string | null> => {
//     if (editingEntry && editingEntry.id) {
//       // Update existing
//       const success = await update(editingEntry.id, entry as Partial<WorkLogEntry>);
//       if (success) {
//         setEditingEntry(null);
//         return editingEntry.id;
//       }
//       return null;
//     } else {
//       // Add new
//       const id = await add(entry);
//       if (id) {
//         return id;
//       }
//       return null;
//     }
//   };

//   // Delete entry with confirmation
//   const handleDeleteEntry = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this work log entry?')) {
//       const success = await remove(id);
//       if (!success) {
//         alert('Failed to delete. Please try again.');
//       }
//     }
//   };

//   // View entry (open modal)
//   const handleViewEntry = (entry: WorkLogEntry) => {
//     setViewingEntry(entry);
//   };

//   // Edit entry (populate form)
//   const handleEditEntry = (entry: WorkLogEntry) => {
//     setEditingEntry(entry);
//     // Scroll to form
//     document.getElementById('worklog-form')?.scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="min-h-screen bg-[var(--clr-bg-page-alt)] p-6 md:p-10 animate-fadeIn">
//       <div className="max-w-[1600px] mx-auto">
//         {/* Header */}
//         <header className="mb-8">
//           <h1 className="text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
//             <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
//               Work Log Registry
//             </span>
//             <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
//               Daily Log
//             </span>
//           </h1>
//           <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
//             Record, track, and manage all machinery jobs and defect resolutions.
//           </p>
//         </header>

//         {/* Form Section */}
//         <section id="worklog-form" className="bg-[var(--clr-bg-card)] backdrop-blur-sm border border-[var(--clr-border)] rounded-2xl shadow-sm p-6 md:p-8 mb-8">
//           <WorkLogForm
//             onSave={handleSaveEntry}
//             editingEntry={editingEntry}
//             onCancelEdit={() => setEditingEntry(null)}
//           />
//         </section>

//         {/* Table Section */}
//         <section>
//           {initialLoad ? (
//             <div className="bg-[var(--clr-bg-card)] backdrop-blur-sm border border-[var(--clr-border)] rounded-2xl shadow-sm p-6 animate-pulse space-y-4">
//               <div className="h-5 w-40 bg-[var(--clr-border)] rounded" />
//               <div className="h-10 w-full bg-[var(--clr-border)] rounded-lg" />
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <div key={i} className="h-14 w-full bg-[var(--clr-border)] rounded-lg" />
//               ))}
//             </div>
//           ) : (
//             <WorkLogTable
//               entries={entries}
//               onView={handleViewEntry}
//               onEdit={handleEditEntry}
//               onDelete={handleDeleteEntry}
//             />
//           )}
//           {error && !initialLoad && (
//             <div className="mt-4 p-4 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
//               Failed to load work logs. Please refresh the page.
//             </div>
//           )}
//         </section>

//         {/* View Modal */}
//         {viewingEntry && (
//           <WorkLogViewModal
//             entry={viewingEntry}
//             onClose={() => setViewingEntry(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// }




// app/(dashboard)/work-logs/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { WorkLogEntry } from '../../lib/types';
import { useWorkLog } from '../../lib/hooks/useWorkLog';
import WorkLogForm from '../../components/work-logs/WorkLogForm';
import WorkLogTable from '../../components/work-logs/WorkLogTable';
import WorkLogView from '../../components/work-logs/shared/WorkLogView';
import WorkLogEdit from '../../components/work-logs/shared/WorkLogEdit';
import WorkLogDelete from '../../components/work-logs/shared/WorkLogDelete';
import WorkLogMultiPrint from '../../components/work-logs/shared/WorkLogMultiPrint';
import { addNotification } from '../../lib/notificationService';
import { exportToCsv } from '../../lib/utils';

export default function WorkLogPage() {
  const { data: rawEntries, loading, error, add, update, remove, refetch } = useWorkLog();
  const [initialLoad, setInitialLoad] = useState(true);

  // Sort newest first by reportedDate
  const entries = useMemo(() => {
    return [...rawEntries].sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
  }, [rawEntries]);

  useEffect(() => {
    if (!loading) setInitialLoad(false);
  }, [loading]);

  // Modal states
  const [viewEntry, setViewEntry] = useState<WorkLogEntry | null>(null);
  const [editEntry, setEditEntry] = useState<WorkLogEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<WorkLogEntry | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiPrintEntries, setMultiPrintEntries] = useState<WorkLogEntry[] | null>(null);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(entries.map((e) => e.id!).filter(Boolean)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDownloadSelected = () => {
    const selected = entries.filter((e) => e.id && selectedIds.has(e.id));
    if (selected.length > 0) {
      setMultiPrintEntries(selected);
    }
  };

  const handleDownloadCsv = () => {
    const selected = entries.filter((e) => e.id && selectedIds.has(e.id));
    if (selected.length === 0) return;
    exportToCsv(selected, `work-logs-${new Date().toISOString().slice(0, 10)}`, {
      jobId: "Job ID",
      reportedDate: "Reported Date",
      status: "Status",
      priority: "Priority",
      equipmentName: "Equipment",
      component: "Component",
      vesselName: "Vessel",
      department: "Department",
      jobDescription: "Description",
      reportedBy: "Reported By",
      officeNotified: "Office Notified",
      assistantsRequired: "Assistants",
      reasonDelay: "Reason",
      // TEMP-HIDDEN: regulation: "Regulation",
      // TEMP-HIDDEN: orderStatus: "Order Status",
      // TEMP-HIDDEN: poReference: "PO Ref",
      // TEMP-HIDDEN: requisitionStatus: "Requisition",
      sparesUsed: "Spares",
      // TEMP-HIDDEN: testedCriteria: "Tested",
      conditionMatrix: "Condition",
      dateCompleted: "Completed Date",
      completedBy: "Completed By",
      resolution: "Resolution",
    });
  };

  // ---- Add new entry (only creation, no editing via this form) ----
  const handleAddEntry = async (entry: Omit<WorkLogEntry, 'id'>): Promise<string | null> => {
    const id = await add(entry);
    return id || null;
  };

  // ---- Edit handlers ----
  const handleViewEntry = (entry: WorkLogEntry) => setViewEntry(entry);
  const handleEditEntry = (entry: WorkLogEntry) => setEditEntry(entry);
  const handleDeleteEntry = (entry: WorkLogEntry) => setDeleteEntry(entry);

  // ---- Update (from Edit modal) ----
  const handleUpdateEntry = async (updatedEntry: WorkLogEntry) => {
    const success = await update(updatedEntry.id, updatedEntry);
    if (success) {
      setEditEntry(null);
      // Optionally refetch to sync UI
      await refetch();
    } else {
      alert('Failed to update. Please try again.');
    }
  };

  // ---- Delete (from Delete modal) ----
  const handleDeleteConfirm = async (id: string) => {
    const jobId = deleteEntry?.jobId || id;
    const success = await remove(id);
    if (success) {
      setDeleteEntry(null);
      addNotification("delete", `Work log "${jobId}" has been deleted.`);
      await refetch();
    } else {
      alert('Failed to delete. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--clr-bg-page-alt)] p-6 md:p-10 animate-fadeIn">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
              Work Log Registry
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
              Daily Log
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Record, track, and manage all machinery jobs and defect resolutions.
          </p>
        </header>

        {/* Form Section – only for adding new entries */}
        <section id="worklog-form" className="bg-[var(--clr-bg-card)] backdrop-blur-sm border border-[var(--clr-border)] rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <WorkLogForm
            onSave={handleAddEntry}
            editingEntry={null}        // No editing via this form
            onCancelEdit={() => {}}    // Not used
          />
        </section>

        {/* Table Section */}
        <section>
          {/* Selection Toolbar */}
          {selectedIds.size > 0 && !initialLoad && (
            <div className="mb-4 p-3 bg-[var(--clr-bg-card)] border border-[var(--clr-bg-accent)] rounded-xl flex items-center justify-between gap-3 flex-wrap shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[var(--clr-bg-accent)] text-white flex items-center justify-center text-sm font-bold">
                  {selectedIds.size}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--clr-text-primary)]">Selected Work Logs</p>
                  <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">
                    {selectedIds.size} of {entries.length} entries selected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSelected}
                  className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-4 py-2 text-xs font-bold text-[var(--clr-text-primary)] bg-[var(--clr-bg-subtle)] hover:bg-[var(--clr-bg-card-hover)] border border-[var(--clr-border)] rounded-lg transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-4 py-2 text-xs font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-ring)] rounded-lg transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {initialLoad ? (
            <div className="bg-[var(--clr-bg-card)] backdrop-blur-sm border border-[var(--clr-border)] rounded-2xl shadow-sm p-6 animate-pulse space-y-4">
              <div className="h-5 w-40 bg-[var(--clr-border)] rounded" />
              <div className="h-10 w-full bg-[var(--clr-border)] rounded-lg" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 w-full bg-[var(--clr-border)] rounded-lg" />
              ))}
            </div>
          ) : (
            <WorkLogTable
              entries={entries}
              onView={handleViewEntry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}  // passes entry object
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          )}
          {error && !initialLoad && (
            <div className="mt-4 p-4 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
              Failed to load work logs. Please refresh the page.
            </div>
          )}
        </section>

        {/* View Modal */}
        {viewEntry && (
          <WorkLogView
            entry={viewEntry}
            onClose={() => setViewEntry(null)}
          />
        )}

        {/* Edit Modal */}
        {editEntry && (
          <WorkLogEdit
            entry={editEntry}
            onUpdate={handleUpdateEntry}
            onCancel={() => setEditEntry(null)}
          />
        )}

        {/* Delete Modal */}
        {deleteEntry && (
          <WorkLogDelete
            entry={deleteEntry}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteEntry(null)}
          />
        )}

        {/* Multi-Print (selected entries) */}
        {multiPrintEntries && (
          <WorkLogMultiPrint
            entries={multiPrintEntries}
            onClose={() => { setMultiPrintEntries(null); setSelectedIds(new Set()); }}
          />
        )}
      </div>
    </div>
  );
}