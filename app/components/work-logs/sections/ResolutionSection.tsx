



// components/work-logs/sections/ResolutionSection.tsx
"use client";

import { Equipment } from '../../../lib/types';
import { calculateDaysOpen, getStatusBadgeClasses } from '../../../lib/utils';

interface Props {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  completedByOptions: string[];
  jobStatusOptions: string[];
  selectedEquipment: Equipment | null;
  errors: Record<string, string>;
}

export default function ResolutionSection({
  formData,
  onFieldChange,
  completedByOptions,
  jobStatusOptions,
  selectedEquipment,
  errors,
}: Props) {
  const status = formData.status || 'Open';
  const isClosed = status.toLowerCase().includes('closed'); // Enable fields when status contains "closed"
  const daysOpen = calculateDaysOpen(
    formData.reportedDate as string,
    isClosed ? formData.dateCompleted as string | null : null
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-[var(--clr-text-primary)]">Resolution & Completion</h3>
        <span className="text-xs text-[var(--clr-text-muted)]">Step 4 of 4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Status */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Job Status *
          </label>
          <select
            value={status}
            onChange={(e) => onFieldChange('status', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition font-bold"
          >
            <option value="OPEN">OPEN</option>
            {jobStatusOptions.filter((o) => o !== 'OPEN').map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Date Completed – always visible, disabled unless CLOSED */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Date Completed
          </label>
          <input
            type="datetime-local"
            value={formData.dateCompleted || ''}
            onChange={(e) => onFieldChange('dateCompleted', e.target.value || null)}
            disabled={!isClosed}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
              isClosed
                ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
                : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
            } border-[var(--clr-border)]`}
          />
          {errors.dateCompleted && <p className="mt-1 text-xs text-red-500">{errors.dateCompleted}</p>}
        </div>

        {/* Completed By – always visible, disabled unless CLOSED */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Completed By
          </label>
          <select
            value={formData.completedBy || ''}
            onChange={(e) => onFieldChange('completedBy', e.target.value)}
            disabled={!isClosed}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
              isClosed
                ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
                : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
            } border-[var(--clr-border)]`}
          >
            <option value="">Select Rank</option>
            {completedByOptions.map((person) => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>
          {errors.completedBy && <p className="mt-1 text-xs text-red-500">{errors.completedBy}</p>}
        </div>

        {/* Final Resolution – always visible, disabled unless CLOSED */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Final Resolution / Root Cause
          </label>
          <textarea
            value={formData.resolution || ''}
            onChange={(e) => onFieldChange('resolution', e.target.value)}
            disabled={!isClosed}
            rows={3}
            placeholder={isClosed ? "What fixed the problem?" : "Complete the job to enter resolution"}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
              isClosed
                ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
                : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
            } border-[var(--clr-border)]`}
          />
          {errors.resolution && <p className="mt-1 text-xs text-red-500">{errors.resolution}</p>}
        </div>
      </div>

      {/* Status Preview */}
      <div className="bg-[var(--clr-bg-subtle)] rounded-xl p-4 flex flex-wrap items-center gap-6 text-sm">
        <div>
          <span className="font-mono text-[var(--clr-text-secondary)] uppercase text-xs">Status:</span>
          <span className={`ml-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(status)}`}>
            {status}
          </span>
        </div>
        <div>
          <span className="font-mono text-[var(--clr-text-secondary)] uppercase text-xs">Days Open:</span>
          <span className="ml-2 font-bold text-[var(--clr-text-primary)]">{daysOpen}</span>
        </div>
        <div>
          <span className="font-mono text-[var(--clr-text-secondary)] uppercase text-xs">Job ID:</span>
          <span className="ml-2 font-mono font-bold text-[var(--clr-text-primary)]">{formData.jobId || 'N/A'}</span>
        </div>
        {selectedEquipment && (
          <div className="text-[var(--clr-text-secondary)]">
            <span className="font-mono uppercase text-xs">Equip:</span>
            <span className="ml-1">{selectedEquipment.makerModel}</span>
          </div>
        )}
      </div>
    </div>
  );
}