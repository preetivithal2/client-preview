"use client";

import { useState, useEffect } from "react";
import { Record } from "./types";

interface RecordModalProps {
  record: Record;
  mode: "view" | "edit";
  onClose: () => void;
  onSave: (updated: Record) => void;
}

export default function RecordModal({ record, mode, onClose, onSave }: RecordModalProps) {
  const [formData, setFormData] = useState<Record>(record);

  // Update internal state when record changes (e.g., when editing different item)
  useEffect(() => {
    setFormData(record);
  }, [record]);

  const handleChange = (key: keyof Record, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--clr-bg-card)]/95 backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
          <h3 className="text-xl font-bold text-[var(--clr-text-primary)]">
            {isView ? "View Record" : "Edit Record"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Job ID
              </label>
              <p className="text-sm font-mono font-bold text-[var(--clr-text-primary)]">{record.jobId || '-'}</p>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Component
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.component}</p>
              ) : (
                <input
                  type="text"
                  value={formData.component}
                  onChange={(e) => handleChange("component", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Vessel Name
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.vesselName}</p>
              ) : (
                <input
                  type="text"
                  value={formData.vesselName}
                  onChange={(e) => handleChange("vesselName", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Department
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.department}</p>
              ) : (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Reported Date
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.reportedDate}</p>
              ) : (
                <input
                  type="date"
                  value={formData.reportedDate}
                  onChange={(e) => handleChange("reportedDate", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Priority
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.priority}</p>
              ) : (
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Office Informed
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.officeInformed}</p>
              ) : (
                <select
                  value={formData.officeInformed}
                  onChange={(e) => handleChange("officeInformed", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Reason
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.reason}</p>
              ) : (
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Assistant Required?
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.assistant}</p>
              ) : (
                <select
                  value={formData.assistant}
                  onChange={(e) => handleChange("assistant", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Requisition No
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.requisitionNo}</p>
              ) : (
                <input
                  type="text"
                  value={formData.requisitionNo}
                  onChange={(e) => handleChange("requisitionNo", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Spares Used
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.spareUsed}</p>
              ) : (
                <input
                  type="text"
                  value={formData.spareUsed}
                  onChange={(e) => handleChange("spareUsed", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Completed By
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.completedBy}</p>
              ) : (
                <input
                  type="text"
                  value={formData.completedBy}
                  onChange={(e) => handleChange("completedBy", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Tested
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.tested}</p>
              ) : (
                <select
                  value={formData.tested}
                  onChange={(e) => handleChange("tested", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Condition
              </label>
              {isView ? (
                <p className="text-sm font-medium text-[var(--clr-text-primary)]">{record.condition}</p>
              ) : (
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Description
            </label>
            {isView ? (
              <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)]">
                {record.description}
              </p>
            ) : (
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
              />
            )}
          </div>

          {!isView && (
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--clr-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}