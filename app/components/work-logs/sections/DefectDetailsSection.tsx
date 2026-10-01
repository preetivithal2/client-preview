

// components/work-logs/sections/DefectDetailsSection.tsx
"use client";

interface Props {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  priorityOptions: string[];
  officeNotifiedOptions: string[];
  reportedByOptions: string[];
  reasonDelayOptions: string[];
  getDropdownOptions: (key: string) => string[];
  errors: Record<string, string>;
}

export default function DefectDetailsSection({
  formData,
  onFieldChange,
  priorityOptions,
  officeNotifiedOptions,
  reportedByOptions,
  reasonDelayOptions,
  getDropdownOptions,
  errors,
}: Props) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        {/* <span className="text-2xl">🔍</span> */}
        <h3 className="text-lg font-bold text-[var(--clr-text-primary)]">Defect Details</h3>
        <span className="text-xs text-[var(--clr-text-muted)]">Step 2 of 4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vessel Name */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Vessel Name
          </label>
          <select
            value={formData.vesselName || ''}
            onChange={(e) => onFieldChange('vesselName', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Vessel Name</option>
            {getDropdownOptions('vesselName').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Component */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Component
          </label>
          <select
            value={formData.component || ''}
            onChange={(e) => onFieldChange('component', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Component</option>
            {getDropdownOptions('componentSpec').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Department
          </label>
          <select
            value={formData.department || ''}
            onChange={(e) => onFieldChange('department', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Department</option>
            {getDropdownOptions('department').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Priority *
          </label>
          <select
            value={priorityOptions.find((p) => p.toUpperCase() === (formData.priority || '').toUpperCase()) || ''}
            onChange={(e) => onFieldChange('priority', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Priority</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Reported By */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Reported By *
          </label>
          <select
            value={formData.reportedBy || ''}
            onChange={(e) => onFieldChange('reportedBy', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
              errors.reportedBy
                ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]'
                : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
            }`}
          >
            <option value="">Select Rank</option>
            {reportedByOptions.map((rank) => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
          {errors.reportedBy && (
            <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.reportedBy}</p>
          )}
        </div>

        {/* Assistants Required */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Assistants Required?
          </label>
          <select
            value={formData.assistantsRequired || ''}
            onChange={(e) => onFieldChange('assistantsRequired', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Assistance</option>
            {getDropdownOptions('assistant').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Office Notified */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Office Notified?
          </label>
          <select
            value={formData.officeNotified || ''}
            onChange={(e) => onFieldChange('officeNotified', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Office Notified</option>
            {officeNotifiedOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Reason for Job Performed */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Reason for Job Performed
          </label>
          <select
            value={formData.reasonDelay || ''}
            onChange={(e) => onFieldChange('reasonDelay', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Reason</option>
            {reasonDelayOptions.length > 0 ? (
              reasonDelayOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))
            ) : (
              <option value="" disabled>No reasons configured</option>
            )}
          </select>
        </div>

        {/* Job Description (full width) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Job / Defect Description *
          </label>
          <textarea
            value={formData.jobDescription || ''}
            onChange={(e) => onFieldChange('jobDescription', e.target.value)}
            rows={3}
            placeholder="Describe the issue in detail..."
            className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
              errors.jobDescription
                ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]'
                : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)]'
            }`}
          />
          {errors.jobDescription && (
            <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.jobDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}