"use client";

import { FuelChangeoverLog, Regulation } from "../../lib/types";

interface Props {
  formData: Omit<FuelChangeoverLog, "id" | "createdAt" | "updatedAt">;
  editingId: string | null;
  regulationsList: Regulation[];
  fuelTypeOptions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function FuelChangeoverForm({ formData, editingId, regulationsList, fuelTypeOptions, onChange, onBlur, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 mb-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Regulation */}
        <div className="grid grid-cols-1 gap-4">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Applicable Regulation</label>
            <select name="regulation" value={formData.regulation || ""} onChange={onChange}
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
              <option value="">Select Regulation</option>
              {regulationsList.map((reg) => <option key={reg.id} value={reg.code}>{reg.code}</option>)}
            </select>
          </div>
        </div>

        {/* ═══ COMMENCE CHANGE OVER ═══ */}
        <div className="border border-[var(--clr-border)] rounded-xl overflow-hidden">
          <div className="bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Commence Change Over</div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Date/Time *</label>
              <input type="datetime-local" name="commenceDateTime" value={formData.commenceDateTime} onChange={onChange} onBlur={onBlur} required
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Latitude</label>
              <input type="text" name="commenceLat" value={formData.commenceLat || ""} onChange={onChange} placeholder="e.g. 34.0522"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Longitude</label>
              <input type="text" name="commenceLong" value={formData.commenceLong || ""} onChange={onChange} placeholder="e.g. -118.2437"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">From Fuel</label>
              <select name="fromFuel" value={formData.fromFuel || ""} onChange={onChange}
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
                <option value="">Select Fuel</option>
                {fuelTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Sulphur %</label>
              <input type="text" name="fromSulphur" value={formData.fromSulphur || ""} onChange={onChange} placeholder="e.g. 0.5"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">To Fuel</label>
              <select name="toFuel" value={formData.toFuel || ""} onChange={onChange}
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
                <option value="">Select Fuel</option>
                {fuelTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Sulphur %</label>
              <input type="text" name="toSulphur" value={formData.toSulphur || ""} onChange={onChange} placeholder="e.g. 0.1"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div className="lg:col-span-3">
              <p className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-2">Total ROB MT</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">HSFO</label>
                  <input type="text" name="robHsfoCommence" value={formData.robHsfoCommence || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">LSFO</label>
                  <input type="text" name="robLsfoCommence" value={formData.robLsfoCommence || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 300"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">MGO</label>
                  <input type="text" name="robMgoCommence" value={formData.robMgoCommence || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 100"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ COMPLETED CHANGE OVER ═══ */}
        <div className="border border-[var(--clr-border)] rounded-xl overflow-hidden">
          <div className="bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Completed Change Over</div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Date/Time</label>
              <input type="datetime-local" name="completeDateTime" value={formData.completeDateTime || ""} onChange={onChange} onBlur={onBlur} required
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Latitude</label>
              <input type="text" name="completeLat" value={formData.completeLat || ""} onChange={onChange} placeholder="e.g. 34.0522"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Longitude</label>
              <input type="text" name="completeLong" value={formData.completeLong || ""} onChange={onChange} placeholder="e.g. -118.2437"
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>
            <div className="lg:col-span-3">
              <p className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-2">Total ROB MT</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">HSFO</label>
                  <input type="text" name="robHsfoComplete" value={formData.robHsfoComplete || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 450"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">LSFO</label>
                  <input type="text" name="robLsfoComplete" value={formData.robLsfoComplete || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 280"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">MGO</label>
                  <input type="text" name="robMgoComplete" value={formData.robMgoComplete || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 90"
                    className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RESULTS (auto calculated) ═══ */}
        <div className="space-y-3">
          <div className="bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)] rounded-xl p-4">
            <p className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Total Running HRS <span className="text-[9px] text-[var(--clr-text-muted)] font-normal normal-case">(auto calculated)</span></p>
            <p className="text-2xl font-bold font-mono text-[var(--clr-text-primary)] mt-1">{formData.totalRunningHrs || '—'}</p>
          </div>
          <div className="bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)] rounded-xl p-4">
            <p className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Total Consumption <span className="text-[9px] text-[var(--clr-text-muted)] font-normal normal-case">(all auto calculated)</span></p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="text-center">
                <p className="text-[10px] font-mono font-semibold text-[var(--clr-text-secondary)]">HSFO</p>
                <p className="text-lg font-bold font-mono text-[var(--clr-text-primary)]">{formData.consumptionHsfo || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-semibold text-[var(--clr-text-secondary)]">LSFO</p>
                <p className="text-lg font-bold font-mono text-[var(--clr-text-primary)]">{formData.consumptionLsfo || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-semibold text-[var(--clr-text-secondary)]">MGO</p>
                <p className="text-lg font-bold font-mono text-[var(--clr-text-primary)]">{formData.consumptionMgo || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--clr-border)]">
          {editingId && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition cursor-pointer">Cancel</button>
          )}
          <button type="submit"
            className="px-6 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer">
            {editingId ? "Update Entry" : "Add Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
