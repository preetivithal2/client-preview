"use client";

import { BilgeWaterLog, Regulation } from "../../lib/types";

interface Props {
  formData: Omit<BilgeWaterLog, "id" | "createdAt" | "updatedAt">;
  editingId: string | null;
  regulationsList: Regulation[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function BilgeWaterForm({ formData, editingId, regulationsList, onChange, onBlur, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm p-6 mb-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Row 1: Applicable Regulation — full width */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Applicable Regulation
            </label>
            <select name="regulation" value={formData.regulation || ""} onChange={onChange}
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer">
              <option value="">Select Regulation</option>
              {regulationsList.map((reg) => (
                <option key={reg.id} value={reg.code}>{reg.code}</option>
              ))}
            </select>
          </div>

          {/* Row 2: Start Date/Time | End Date/Time | 15ppm Alarm OK */}
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
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="alarmOk" checked={formData.alarmOk} onChange={onChange}
                className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded border-[var(--clr-border)] focus:ring-0" />
              <label className="text-sm font-medium text-[var(--clr-text-primary)] cursor-pointer">15ppm Alarm OK</label>
            </div>
          </div>

          {/* Row 3: Start Latitude | Start Longitude */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Start Latitude</label>
            <input type="text" name="startLat" value={formData.startLat || ""} onChange={onChange} placeholder="e.g. 34.0522"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Start Longitude</label>
            <input type="text" name="startLong" value={formData.startLong || ""} onChange={onChange} placeholder="e.g. -118.2437"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div /> {/* empty spacer */}

          {/* Row 4: End Latitude | End Longitude */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">End Latitude</label>
            <input type="text" name="endLat" value={formData.endLat || ""} onChange={onChange} placeholder="e.g. 34.0522"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">End Longitude</label>
            <input type="text" name="endLong" value={formData.endLong || ""} onChange={onChange} placeholder="e.g. -118.2437"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div /> {/* empty spacer */}

          {/* Row 5: Overboard Valve No | Seal No Unsealed | Seal No Sealed */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Overboard Valve No</label>
            <input type="text" name="overboardValveNo" value={formData.overboardValveNo || ""} onChange={onChange} placeholder="e.g. 255GF"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Seal No (Unsealed)</label>
            <input type="text" name="sealNoUnsealed" value={formData.sealNoUnsealed || ""} onChange={onChange} placeholder="e.g. EXAMP 1578695"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Seal No (Sealed)</label>
            <input type="text" name="sealNoSealed" value={formData.sealNoSealed || ""} onChange={onChange} placeholder="e.g. EXAMP154444"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>

          {/* Row 6: Total Volume | Total Running HRS | Pump Rate */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Total Volume Discharged (m³) *</label>
            <input type="number" step="0.01" name="volumeM3" value={formData.volumeM3} onChange={onChange} onBlur={onBlur} placeholder="e.g. 3.4" required
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Total Running HRS <span className="text-[9px] text-[var(--clr-text-muted)] font-normal normal-case">(auto)</span></label>
            <input type="text" name="totalRunningHrs" value={formData.totalRunningHrs || ""} onChange={onChange} onBlur={onBlur} placeholder="e.g. 5" disabled
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] font-bold font-mono cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">Pump Rate <span className="text-[9px] text-[var(--clr-text-muted)] font-normal normal-case">(auto — m³/h)</span></label>
            <input type="text" name="pumpRate" value={formData.pumpRate || ""} placeholder="e.g. 0.68" disabled
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] font-bold font-mono cursor-not-allowed" />
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
