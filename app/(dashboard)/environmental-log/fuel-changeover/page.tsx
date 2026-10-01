"use client";

import { useState, useEffect } from "react";
import {
  getAllFuelChangeoverLogs,
  addFuelChangeoverLog,
  updateFuelChangeoverLog,
  deleteFuelChangeoverLog,
} from "../../../lib/services/fuelChangeover.service";
import { FuelChangeoverLog } from "../../../lib/types";
import { useRegulations } from "../../../lib/hooks/useRegulations";
import { useAllDropdowns } from "../../../lib/hooks/useAllDropdowns";
import FuelChangeoverForm from "../../../components/environmental-log/FuelChangeoverForm";
import FuelChangeoverTable from "../../../components/environmental-log/FuelChangeoverTable";
import EnvironmentalLogView from "../../../components/environmental-log/EnvironmentalLogView";
import EnvironmentalLogPrint from "../../../components/environmental-log/EnvironmentalLogPrint";
import AlertDialog from "../../../components/common/AlertDialog";
import { exportToCsv } from "../../../lib/utils";

export default function FuelChangeoverPage() {
  const { data: regulationsList } = useRegulations();
  const { getOptions } = useAllDropdowns();
  const [logs, setLogs] = useState<FuelChangeoverLog[]>([]);

  // View / Print / Multi-select
  const [viewEntry, setViewEntry] = useState<FuelChangeoverLog | null>(null);
  const [printEntries, setPrintEntries] = useState<FuelChangeoverLog[] | null>(null);
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
    exportToCsv(selected, `fuel-changeover-${new Date().toISOString().slice(0, 10)}`, {
      commenceDateTime: "C. Date/Time", commenceLat: "C. Latitude", commenceLong: "C. Longitude",
      fromFuel: "From Fuel", fromSulphur: "From S%", toFuel: "To Fuel", toSulphur: "To S%",
      robHsfoCommence: "ROB HSFO", robLsfoCommence: "ROB LSFO", robMgoCommence: "ROB MGO",
      completeDateTime: "E. Date/Time", completeLat: "E. Latitude", completeLong: "E. Longitude",
      robHsfoComplete: "ROB HSFO", robLsfoComplete: "ROB LSFO", robMgoComplete: "ROB MGO",
      totalRunningHrs: "Run (hrs)", consumptionHsfo: "Con. HSFO", consumptionLsfo: "Con. LSFO", consumptionMgo: "Con. MGO", regulation: "Regulation",
    });
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: "alert" | "confirm"; title: string; message: string; onConfirm?: () => void } | null>(null);

  const emptyForm = {
    commenceDateTime: "",
    commenceLat: "",
    commenceLong: "",
    fromFuel: "",
    fromSulphur: "",
    toFuel: "",
    toSulphur: "",
    robHsfoCommence: "",
    robLsfoCommence: "",
    robMgoCommence: "",
    completeDateTime: "",
    completeLat: "",
    completeLong: "",
    robHsfoComplete: "",
    robLsfoComplete: "",
    robMgoComplete: "",
    totalRunningHrs: "",
    consumptionHsfo: "",
    consumptionLsfo: "",
    consumptionMgo: "",
    regulation: "",
  };

  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);

  /** Compute derived values synchronously */
  const computeAutoFields = (data: typeof emptyForm) => {
    const updates: Record<string, string> = {};

    if (data.commenceDateTime && data.completeDateTime) {
      const diffMs = new Date(data.completeDateTime).getTime() - new Date(data.commenceDateTime).getTime();
      if (diffMs > 0) updates.totalRunningHrs = (diffMs / (1000 * 60 * 60)).toFixed(1);
    }

    const cons = (c: string, e: string) => {
      const cv = parseFloat(c);
      const ev = parseFloat(e);
      return (!isNaN(cv) && !isNaN(ev) && cv > 0) ? Math.max(0, cv - ev).toFixed(1) : "";
    };
    updates.consumptionHsfo = cons(data.robHsfoCommence, data.robHsfoComplete);
    updates.consumptionLsfo = cons(data.robLsfoCommence, data.robLsfoComplete);
    updates.consumptionMgo = cons(data.robMgoCommence, data.robMgoComplete);

    return updates;
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setLogs(await getAllFuelChangeoverLogs());
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = () => {
    setFormData((prev) => ({ ...prev, ...computeAutoFields(prev) }));
  };

  const resetForm = () => { setFormData(emptyForm); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commenceDateTime || !formData.completeDateTime) {
      alert("Please fill in both Commence Date/Time and Complete Date/Time.");
      return;
    }
    // Compute auto fields on submit
    const dataToSave = { ...formData, ...computeAutoFields(formData) };
    try {
      if (editingId) {
        await updateFuelChangeoverLog(editingId, dataToSave);
      } else {
        await addFuelChangeoverLog(dataToSave);
      }
      resetForm();
      await fetchLogs();
    } catch { alert("Failed to save. Please try again."); }
  };

  const handleEdit = (log: FuelChangeoverLog) => {
    setFormData({
      commenceDateTime: log.commenceDateTime || "",
      commenceLat: log.commenceLat || "",
      commenceLong: log.commenceLong || "",
      fromFuel: log.fromFuel || "",
      fromSulphur: log.fromSulphur || "",
      toFuel: log.toFuel || "",
      toSulphur: log.toSulphur || "",
      robHsfoCommence: log.robHsfoCommence || "",
      robLsfoCommence: log.robLsfoCommence || "",
      robMgoCommence: log.robMgoCommence || "",
      completeDateTime: log.completeDateTime || "",
      completeLat: log.completeLat || "",
      completeLong: log.completeLong || "",
      robHsfoComplete: log.robHsfoComplete || "",
      robLsfoComplete: log.robLsfoComplete || "",
      robMgoComplete: log.robMgoComplete || "",
      totalRunningHrs: log.totalRunningHrs || "",
      consumptionHsfo: log.consumptionHsfo || "",
      consumptionLsfo: log.consumptionLsfo || "",
      consumptionMgo: log.consumptionMgo || "",
      regulation: log.regulation || "",
    });
    setEditingId(log.id!);
  };

  const handleDelete = (id: string) => {
    setDialog({ type: "confirm", title: "Delete Entry?", message: "Are you sure you want to delete this fuel changeover entry? This cannot be undone.", onConfirm: async () => {
      try {
        await deleteFuelChangeoverLog(id);
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
              Fuel Changeover System
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Log fuel changeover procedures when entering/exiting Emission Control Areas (ECA).
          </p>
        </div>

        <FuelChangeoverForm
          formData={formData}
          editingId={editingId}
          regulationsList={regulationsList}
          fuelTypeOptions={getOptions('fuelType')}
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

        <FuelChangeoverTable
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
        <EnvironmentalLogView type="fuel" entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}

      {printEntries && (
        <EnvironmentalLogPrint
          type="fuel"
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
