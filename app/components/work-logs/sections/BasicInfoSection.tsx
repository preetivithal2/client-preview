
// components/work-logs/sections/BasicInfoSection.tsx
"use client";

import { Equipment, Regulation } from '../../../lib/types';

interface Props {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  onEquipmentChange: (eqId: string) => void;
  equipmentList: Equipment[];
  regulationsList: Regulation[];
  selectedEquipment: Equipment | null;
  errors: Record<string, string>;
}

export default function BasicInfoSection({
  formData,
  onFieldChange,
  onEquipmentChange,
  equipmentList,
  regulationsList,
  selectedEquipment,
  errors,
}: Props) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        {/* <span className="text-2xl">📋</span> */}
        <h3 className="text-lg font-bold text-[var(--clr-text-primary)]">Basic Information</h3>
        <span className="text-xs text-[var(--clr-text-muted)]">Step 1 of 4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job ID - Auto-generated */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Job ID <span className="text-[var(--clr-text-muted)]">(auto)</span>
          </label>
          <div className="w-full px-4 py-2.5 bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)] rounded-xl text-sm font-mono text-[var(--clr-text-primary)]">
            {formData.jobId || 'Generating...'}
          </div>
        </div>

        {/* Reported Date */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Reported Date *
          </label>
          <input
            type="datetime-local"
            value={formData.reportedDate || ''}
            onChange={(e) => onFieldChange('reportedDate', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
              errors.reportedDate
                ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]'
                : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
            }`}
          />
          {errors.reportedDate && (
            <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.reportedDate}</p>
          )}
        </div>

        {/* Equipment Dropdown */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Equipment *
          </label>
          <select
            value={formData.equipmentId || ''}
            onChange={(e) => onEquipmentChange(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
              errors.equipmentId
                ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]'
                : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
            }`}
          >
            <option value="">Select Equipment</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
          {errors.equipmentId && (
            <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.equipmentId}</p>
          )}
        </div>

        {/* TEMP-HIDDEN FIELD: "Regulation" — hidden per client request. Uncomment the block below to restore. */}
        {/* Regulation Dropdown
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Applicable Regulation
          </label>
          <select
            value={formData.regulation || ''}
            onChange={(e) => onFieldChange('regulation', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Regulation</option>
            {regulationsList.map((reg) => (
              <option key={reg.id} value={reg.code}>
                {reg.code}
              </option>
            ))}
          </select>
        </div>
        */}
      </div>

      {/* ============================================================
          EQUIPMENT DETAILS (Appears when equipment is selected)
          ============================================================ */}
      {selectedEquipment && (
        <div className="bg-[var(--clr-bg-subtle)] rounded-xl p-4 border border-[var(--clr-border)] space-y-2">
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">
            Equipment Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-[var(--clr-text-secondary)]">Maker & Model:</span>
              <span className="ml-2 font-medium text-[var(--clr-text-primary)]">
                {selectedEquipment.makerModel || '—'}
              </span>
            </div>
            <div>
              <span className="text-[var(--clr-text-secondary)]">Serial Number:</span>
              <span className="ml-2 font-mono text-[var(--clr-text-primary)]">
                {selectedEquipment.serialNumber || '—'}
              </span>
            </div>
            <div>
              <span className="text-[var(--clr-text-secondary)]">Technical Specs:</span>
              <span className="ml-2 font-medium text-[var(--clr-text-primary)]">
                {selectedEquipment.specs || '—'}
              </span>
            </div>
          </div>
          {selectedEquipment.file?.url && (
            <div className="mt-2 pt-2 border-t border-[var(--clr-border)]">
              <span className="text-[var(--clr-text-secondary)] text-xs">Manual:</span>
              <a
                href={selectedEquipment.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[var(--clr-text-accent-gold)] hover:underline text-xs font-medium"
              >
                📄 View Document
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}