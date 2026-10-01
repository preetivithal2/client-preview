
"use client";

import { useState, useMemo, useEffect } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";
import { useAllDropdowns } from "../../lib/hooks/useAllDropdowns";
import { useEquipment } from "../../lib/hooks/useEquipment";
import { WorkLogEntry } from "../../lib/types";
import SearchFilters from "../../components/records/SearchFilters";
import WorkLogTable from "../../components/work-logs/WorkLogTable";
import WorkLogView from "../../components/work-logs/shared/WorkLogView";
import WorkLogEdit from "../../components/work-logs/shared/WorkLogEdit";
import WorkLogDelete from "../../components/work-logs/shared/WorkLogDelete";
import WorkLogMultiPrint from "../../components/work-logs/shared/WorkLogMultiPrint";
import { exportToCsv } from "../../lib/utils";

export default function RecordsPage() {
  const { data: workLogs, loading, error, add, update, remove, refetch: refetchLogs } = useWorkLog();
  const { getOptions, loading: ddLoading, refetch: refetchDropdowns } = useAllDropdowns();
  const { data: equipmentList, loading: eqLoading } = useEquipment();

  const [initialLoad, setInitialLoad] = useState(true);
  const isLoading = loading || ddLoading;

  useEffect(() => {
    if (!isLoading) setInitialLoad(false);
  }, [isLoading]);

  // Shared modal states
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
      setSelectedIds(new Set(filteredWorkLogs.map((e) => e.id!).filter(Boolean)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDownloadSelected = () => {
    const selected = filteredWorkLogs.filter((e) => e.id && selectedIds.has(e.id));
    if (selected.length > 0) {
      setMultiPrintEntries(selected);
    }
  };

  const handleDownloadCsv = () => {
    const selected = filteredWorkLogs.filter((e) => e.id && selectedIds.has(e.id));
    if (selected.length === 0) return;
    exportToCsv(selected, `records-${new Date().toISOString().slice(0, 10)}`, {
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

  // Filter state
  const [filters, setFilters] = useState({
    equipment: "",
    vesselName: "",
    component: "",
    department: "",
    reportedDate: "",
    officeInformed: "",
    priority: "",
    reason: "",
    assistant: "",
    requisitionNo: "",
    spareUsed: "",
    completedBy: "",
    tested: "",
    condition: "",
    status: "",
    keyword: "",
  });

  useEffect(() => {
    const onFocus = () => refetchDropdowns();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetchDropdowns]);

  const handleRefresh = async () => {
    await Promise.all([refetchDropdowns(), refetchLogs()]);
  };

  // Filter logic — works directly on WorkLogEntry fields
  const filteredWorkLogs = useMemo(() => {
    return [...workLogs].filter((entry) => {
      const keyword = filters.keyword.toLowerCase().trim();
      if (keyword) {
        const searchable = `${entry.jobId} ${entry.equipmentName || ""} ${entry.equipmentSpecs?.maker || ""} ${entry.jobDescription} ${entry.reasonDelay || ""} ${entry.completedBy || ""} ${entry.reportedBy || ""}`.toLowerCase();
        if (!searchable.includes(keyword)) return false;
      }

      // Map FilterState fields to WorkLogEntry fields
      const match = (value: string | undefined, filter: string) => {
        if (!filter) return true;
        return (value || "").toLowerCase() === filter.toLowerCase();
      };

      const matchPriority = (value: string | undefined, filter: string) => {
        if (!filter) return true;
        return (value || "").toLowerCase() === filter.toLowerCase();
      };

      const matchOffice = (value: string | undefined, filter: string) => {
        if (!filter) return true;
        return (value || "").toLowerCase() === filter.toLowerCase();
      };

      // sparesUsed is an array — check if any spare matches the filter
      const matchSpares = (spares: string | string[] | undefined, filter: string) => {
        if (!filter) return true;
        if (Array.isArray(spares)) return spares.some((s) => s.toLowerCase().includes(filter.toLowerCase()));
        return (spares || "").toLowerCase().includes(filter.toLowerCase());
      };

      return (
        match(entry.equipmentName, filters.equipment) &&
        match(entry.vesselName, filters.vesselName) &&
        match(entry.component, filters.component) &&
        match(entry.department, filters.department) &&
        match(entry.reportedDate, filters.reportedDate) &&
        matchOffice(entry.officeNotified, filters.officeInformed) &&
        matchPriority(entry.priority, filters.priority) &&
        match(entry.reasonDelay, filters.reason) &&
        match(entry.assistantsRequired, filters.assistant) &&
        match(entry.poReference, filters.requisitionNo) &&
        matchSpares(entry.sparesUsed, filters.spareUsed) &&
        match(entry.completedBy, filters.completedBy) &&
        match(entry.testedCriteria, filters.tested) &&
        match(entry.conditionMatrix, filters.condition) &&
        match(entry.status, filters.status)
      );
    }).sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
  }, [workLogs, filters]);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleView = (entry: WorkLogEntry) => setViewEntry(entry);
  const handleEdit = (entry: WorkLogEntry) => setEditEntry(entry);
  const handleDelete = (entry: WorkLogEntry) => setDeleteEntry(entry);

  const handleUpdateEntry = async (updatedEntry: WorkLogEntry) => {
    const success = await update(updatedEntry.id!, updatedEntry);
    if (success) {
      setEditEntry(null);
      await refetchLogs();
    } else {
      alert("Failed to update. Please try again.");
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const success = await remove(id);
    if (success) {
      setDeleteEntry(null);
      await refetchLogs();
    } else {
      alert("Failed to delete. Please try again.");
    }
  };

  // Loading skeleton with responsive adjustments
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
        <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
          <div className="animate-pulse">
            <div className="h-7 sm:h-8 w-48 sm:w-64 bg-[var(--clr-border)] rounded-lg" />
            <div className="h-4 w-60 sm:w-80 bg-[var(--clr-border)] rounded mt-2 sm:mt-3" />
          </div>
          <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] p-4 sm:p-6 animate-pulse space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
                  <div className="h-3 w-20 sm:w-28 bg-[var(--clr-border)] rounded shrink-0" />
                  <div className="h-9 w-full bg-[var(--clr-border)] rounded-lg" />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <div className="h-10 w-24 sm:w-28 bg-[var(--clr-border)] rounded-xl" />
            </div>
          </div>
          <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] animate-pulse p-4 sm:p-6 space-y-4">
            <div className="h-5 w-40 sm:w-48 bg-[var(--clr-border)] rounded" />
            <div className="h-10 w-full bg-[var(--clr-border)] rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 sm:h-14 w-full bg-[var(--clr-border)] rounded-lg" />
            ))}
          </div>
          {error && (
            <div className="p-4 sm:p-6 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
              Failed to load records. Please refresh the page.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header – fully responsive */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--clr-text-primary)] flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-primary)] bg-clip-text text-transparent">
                Records Management
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-[var(--clr-bg-accent)]/5 text-[var(--clr-text-primary)] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-ring-solid)]/10 whitespace-nowrap">
                Search & Filter
              </span>
            </h1>
            <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
              Find any job record instantly using the filters below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-ring)] rounded-xl transition-all bg-[var(--clr-bg-card)] hover:bg-[var(--clr-bg-card)] shadow-sm shrink-0 self-start"
            title="Refresh data from database"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Search Form – assumes it's internally responsive */}
        <SearchFilters
          onSearch={handleSearch}
          initialFilters={filters}
          equipmentOptions={equipmentList.map(eq => eq.name)}
          componentOptions={getOptions('componentSpec')}
          vesselOptions={getOptions('vesselName')}
          departmentOptions={getOptions('department')}
          reasonOptions={getOptions('reasonClassifications')}
          crewRankOptions={getOptions('completedBy')}
          priorityOptions={getOptions('priority')}
          officeNotifiedOptions={getOptions('officeNotified')}
          assistantOptions={getOptions('assistant')}
          requisitionOptions={getOptions('requisitionStatus')}
          sparesOptions={getOptions('sparesUsed')}
          testedOptions={getOptions('testedCriteria')}
          conditionOptions={getOptions('conditionMatrix')}
          jobStatusOptions={getOptions('jobStatus')}
        />

        {/* Selection Toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-3 bg-[var(--clr-bg-card)] border border-[var(--clr-bg-accent)] rounded-xl flex items-center justify-between gap-3 flex-wrap shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--clr-bg-accent)] text-white flex items-center justify-center text-sm font-bold">
                {selectedIds.size}
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--clr-text-primary)]">Selected Records</p>
                <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">
                  {selectedIds.size} of {filteredWorkLogs.length} records selected
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

        {/* Results Table — reuses WorkLogTable (already responsive with horizontal scroll) */}
        <WorkLogTable
          entries={filteredWorkLogs}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Modals – already responsive */}
        {viewEntry && (
          <WorkLogView entry={viewEntry} onClose={() => setViewEntry(null)} />
        )}
        {editEntry && (
          <WorkLogEdit
            entry={editEntry}
            onUpdate={handleUpdateEntry}
            onCancel={() => setEditEntry(null)}
          />
        )}
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