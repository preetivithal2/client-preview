"use client";

import { useState, useEffect } from "react";
import {
  getAllIncineratorLogs,
  addIncineratorLog,
  updateIncineratorLog,
  deleteIncineratorLog,
} from "../../../lib/services/incinerator.service";
import { IncineratorLog } from "../../../lib/types";
import { useRegulations } from "../../../lib/hooks/useRegulations";
import { useAllDropdowns } from "../../../lib/hooks/useAllDropdowns";
import IncineratorForm from "../../../components/environmental-log/IncineratorForm";
import IncineratorTable from "../../../components/environmental-log/IncineratorTable";
import EnvironmentalLogView from "../../../components/environmental-log/EnvironmentalLogView";
import EnvironmentalLogPrint from "../../../components/environmental-log/EnvironmentalLogPrint";
import AlertDialog from "../../../components/common/AlertDialog";
import { exportToCsv } from "../../../lib/utils";

export default function IncineratorPage() {
  const { data: regulationsList } = useRegulations();
  const { getOptions } = useAllDropdowns();
  const [logs, setLogs] = useState<IncineratorLog[]>([]);

  // View / Print / Multi-select
  const [viewEntry, setViewEntry] = useState<IncineratorLog | null>(null);
  const [printEntries, setPrintEntries] = useState<IncineratorLog[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(logs.map((l) => l.id!).filter(Boolean)) : new Set());
  };
  const handlePrintSelected = () => {
    const selected = logs.filter((l) => l.id && selectedIds.has(l.id));
    if (selected.length > 0) setPrintEntries(selected);
  };
  const handleDownloadCsv = () => {
    const selected = logs.filter((l) => l.id && selectedIds.has(l.id));
    if (selected.length === 0) return;
    exportToCsv(selected, `incinerator-${new Date().toISOString().slice(0, 10)}`, {
      startDateTime: "Start Date/Time", endDateTime: "End Date/Time", wasteType: "Waste Type",
      incWasteOilTankM3: "Oil Tank (m³)", totalRunning: "Running (hrs)", quantity: "Quantity",
      quantityUnit: "Unit", remark: "Remark", regulation: "Regulation",
    });
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: "alert" | "confirm"; title: string; message: string; onConfirm?: () => void } | null>(null);

  const emptyForm = {
    startDateTime: "",
    endDateTime: "",
    wasteType: "",
    quantity: "",
    quantityUnit: "Liters",
    incWasteOilTankM3: "",
    totalRunning: "",
    remark: "",
    alarmOk: false,
    regulation: "",
    lat: "",
    long: "",
  };

  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);

  /** Compute derived values synchronously — Total Running HRS */
  const computeAutoFields = (data: typeof emptyForm) => {
    const updates: Record<string, string> = {};
    if (data.startDateTime && data.endDateTime) {
      const diffMs = new Date(data.endDateTime).getTime() - new Date(data.startDateTime).getTime();
      if (diffMs > 0) updates.totalRunning = (diffMs / (1000 * 60 * 60)).toFixed(1);
    }
    return updates;
  };

  const handleBlur = () => {
    setFormData((prev) => ({ ...prev, ...computeAutoFields(prev) }));
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setLogs(await getAllIncineratorLogs());
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDateTime || !formData.endDateTime || !formData.quantity || !formData.wasteType) {
      alert("Please fill in all required fields.");
      return;
    }
    // Compute auto fields on submit
    const dataToSave = { ...formData, ...computeAutoFields(formData) };
    try {
      if (editingId) {
        await updateIncineratorLog(editingId, dataToSave);
      } else {
        await addIncineratorLog(dataToSave);
      }
      resetForm();
      await fetchLogs();
    } catch { alert("Failed to save. Please try again."); }
  };

  const handleEdit = (log: IncineratorLog) => {
    setFormData({
      startDateTime: log.startDateTime,
      endDateTime: log.endDateTime,
      wasteType: log.wasteType,
      quantity: log.quantity,
      quantityUnit: log.quantityUnit || "Liters",
      incWasteOilTankM3: log.incWasteOilTankM3 || "",
      totalRunning: log.totalRunning || "",
      remark: log.remark || "",
      alarmOk: log.alarmOk || false,
      regulation: log.regulation || "",
      lat: log.lat || "",
      long: log.long || "",
    });
    setEditingId(log.id!);
  };

  const handleDelete = (id: string) => {
    setDialog({ type: "confirm", title: "Delete Entry?", message: "Are you sure you want to delete this incinerator entry? This cannot be undone.", onConfirm: async () => {
      try {
        await deleteIncineratorLog(id);
        if (editingId === id) resetForm();
        await fetchLogs();
      } catch { alert("Failed to delete."); }
    }});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-[var(--clr-border)] rounded-lg" />
          <div className="h-72 bg-[var(--clr-border)] rounded-2xl" />
          <div className="h-96 bg-[var(--clr-border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10">
        <div className="max-w-6xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-primary)] bg-clip-text text-transparent">
              Incinerator Management
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Log sludge and solid waste burning operations.
          </p>
        </div>

        <IncineratorForm
          formData={formData}
          editingId={editingId}
          regulationsList={regulationsList}
          wasteTypeOptions={getOptions('wasteType')}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

        {/* Selection Toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-3 bg-[var(--clr-bg-card)] border border-[var(--clr-bg-accent)] rounded-xl flex items-center justify-between gap-3 flex-wrap shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--clr-bg-accent)] text-white flex items-center justify-center text-sm font-bold">{selectedIds.size}</span>
              <div>
                <p className="text-sm font-bold text-[var(--clr-text-primary)]">Selected Entries</p>
                <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">{selectedIds.size} of {logs.length} entries selected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handlePrintSelected} className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                Download PDF
              </button>
              <button type="button" onClick={handleDownloadCsv} className="px-4 py-2 text-xs font-bold text-[var(--clr-text-primary)] bg-[var(--clr-bg-subtle)] hover:bg-[var(--clr-bg-card-hover)] border border-[var(--clr-border)] rounded-lg transition flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download CSV
              </button>
              <button type="button" onClick={() => setSelectedIds(new Set())} className="px-4 py-2 text-xs font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-ring)] rounded-lg transition">Clear Selection</button>
            </div>
          </div>
        )}

        <IncineratorTable
          logs={logs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={(log) => setViewEntry(log)}
          onPrint={(log) => setPrintEntries([log])}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>

      {viewEntry && (
        <EnvironmentalLogView type="incinerator" entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}

      {printEntries && (
        <EnvironmentalLogPrint
          type="incinerator"
          entries={printEntries}
          onClose={() => { setPrintEntries(null); setSelectedIds(new Set()); }}
        />
      )}

      {dialog && (
        <AlertDialog
          open={true}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.type === "confirm" ? "Delete" : "OK"}
          onConfirm={dialog.onConfirm}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
