"use client";

import { IncineratorLog, Regulation } from "../../lib/types";

interface Props {
  formData: Omit<IncineratorLog, "id" | "createdAt" | "updatedAt">;
  editingId: string | null;
  regulationsList: Regulation[];
  wasteTypeOptions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function IncineratorForm({ formData, editingId, regulationsList, wasteTypeOptions, onChange, onBlur, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 mb-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Row 1: Regulation | Waste Type | (spacer) */}
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0">
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Applicable Regulation</label>
              <select name="regulation" value={formData.regulation || ""} onChange={onChange}
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
                <option value="">Select Regulation</option>
                {regulationsList.map((reg) => <option key={reg.id} value={reg.code}>{reg.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Waste Type *</label>
              <select name="wasteType" value={formData.wasteType} onChange={onChange} required
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
                <option value="">Select Waste Type</option>
                {wasteTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Start Date/Time | End Date/Time | Inc Waste Oil Tank */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Start Date/Time *</label>
            <input type="datetime-local" name="startDateTime" value={formData.startDateTime} onChange={onChange} onBlur={onBlur} required
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">End Date/Time *</label>
            <input type="datetime-local" name="endDateTime" value={formData.endDateTime} onChange={onChange} onBlur={onBlur} required
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Inc Waste Oil Tank (m³)</label>
            <input type="text" name="incWasteOilTankM3" value={formData.incWasteOilTankM3 || ""} onChange={onChange} placeholder="e.g. 3.4"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>

          {/* Row 3: Total Running | Quantity | Unit */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Total Running (hrs) <span className="text-[9px] text-[var(--clr-text-muted)] font-normal normal-case">(auto)</span></label>
            <input type="text" name="totalRunning" value={formData.totalRunning || ""} placeholder="e.g. 5" disabled
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] font-bold font-mono cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Quantity *</label>
            <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={onChange} placeholder="e.g. 250" required
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Unit</label>
            <select name="quantityUnit" value={formData.quantityUnit} onChange={onChange}
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
              <option value="Liters">Liters</option>
              <option value="KG">KG</option>
              <option value="m³">m³</option>
            </select>
          </div>

          {/* Row 4: Remark */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Remark</label>
            <textarea name="remark" value={formData.remark || ""} onChange={onChange} rows={3} placeholder="Any additional notes..."
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
        </div>

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
