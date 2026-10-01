// components/shared/WorkLogEdit.tsx
"use client";

import { useState, useEffect } from 'react';
import { WorkLogEntry, MediaFile } from '../../../lib/types';
import { formatDate, calculateDaysOpen, getStatusBadgeClasses } from '../../../lib/utils';
import { useEquipment } from '../../../lib/hooks/useEquipment';
import { useAllDropdowns } from '../../../lib/hooks/useAllDropdowns';
import { useRegulations } from '../../../lib/hooks/useRegulations';
import { useCloudinaryUpload } from '../../../lib/hooks/useCloudinaryUpload';
import FileUploader from '../../common/FileUploader';

interface WorkLogEditProps {
  entry: WorkLogEntry;
  onUpdate: (updated: WorkLogEntry) => Promise<void>;
  onCancel: () => void;
}

export default function WorkLogEdit({ entry, onUpdate, onCancel }: WorkLogEditProps) {
  const { data: equipmentList, loading: eqLoading } = useEquipment();
  const { getOptions, loading: ddLoading } = useAllDropdowns();
  const { data: regulationsList, loading: regLoading } = useRegulations();

  const [formData, setFormData] = useState<WorkLogEntry>({ ...entry });
  const [selectedEquipment, setSelectedEquipment] = useState(
    equipmentList.find((e) => e.id === entry.equipmentId) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { upload, uploading, progress, error: uploadError } = useCloudinaryUpload();

  // Sync selectedEquipment once equipmentList loads
  useEffect(() => {
    if (equipmentList.length > 0 && entry.equipmentId) {
      const eq = equipmentList.find((e) => e.id === entry.equipmentId);
      if (eq) setSelectedEquipment(eq);
    }
  }, [equipmentList, entry.equipmentId]);

  // Job status controls whether completion fields are enabled
  const isClosed = formData.status?.toLowerCase().includes('closed') ?? false;

  // Handle file upload to Cloudinary and accumulate in formData.files
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    const jobId = formData.jobId || `edit-${Date.now()}`;
    const folderPath = `work-logs/${jobId}`;
    const result = await upload(file, folderPath);
    if (!result) return;

    handleChange('mediaAttachments', result.url);

    const mediaFile: MediaFile = {
      id: crypto.randomUUID(),
      jobId: formData.jobId || undefined,
      fileName: result.fileName,
      publicId: result.publicId,
      url: result.url,
      type: result.type,
      size: result.bytes,
      provider: 'cloudinary',
      providerId: result.publicId,
      uploadedAt: new Date().toISOString(),
    };

    const existing = Array.isArray(formData.files) ? formData.files : [];
    handleChange('files', [...existing, mediaFile]);
  };

  // Remove a file from the files array by ID
  const handleRemoveFile = (fileId: string) => {
    const existing = Array.isArray(formData.files) ? formData.files : [];
    const updated = existing.filter((f) => f.id !== fileId);
    handleChange('files', updated);
    if (updated.length === 0) handleChange('mediaAttachments', '');
  };

  const uploadedFiles: MediaFile[] = Array.isArray(formData.files) ? formData.files : [];

  const handleChange = (field: keyof WorkLogEntry, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEquipmentChange = (eqId: string) => {
    const eq = equipmentList.find((item) => item.id === eqId) || null;
    setSelectedEquipment(eq);
    setFormData((prev) => ({
      ...prev,
      equipmentId: eqId,
      equipmentSpecs: eq
        ? {
            maker: eq.makerModel?.split(' ')[0] || '',
            model: eq.makerModel?.split(' ').slice(1).join(' ') || '',
            serial: eq.serialNumber || '',
            specs: eq.specs || '',
          }
        : undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.equipmentId) newErrors.equipmentId = 'Please select equipment';
    if (!formData.reportedDate) newErrors.reportedDate = 'Please select reported date';
    if (!formData.jobDescription?.trim()) newErrors.jobDescription = 'Please describe the issue';
    if (!formData.reportedBy) newErrors.reportedBy = 'Please select reported by';
    const isClosed = formData.status?.toLowerCase().includes('closed') ?? false;
    if (isClosed) {
      if (!formData.dateCompleted) newErrors.dateCompleted = 'Please select completion date';
      if (!formData.completedBy) newErrors.completedBy = 'Please select completed by';
      if (!formData.resolution?.trim()) newErrors.resolution = 'Please describe final resolution';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Preserve the actual job status from dropdown (e.g. "8. Closed")
      const statusValue = formData.status || 'OPEN';
      const daysOpen = calculateDaysOpen(
        formData.reportedDate,
        statusValue.toLowerCase().includes('closed') ? formData.dateCompleted : null
      );
      const updated: WorkLogEntry = { ...formData, priority: (formData.priority || '').toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW', status: statusValue, daysOpen };
      await onUpdate(updated);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for spares multi-select
  const handleSparesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    handleChange('sparesUsed', selected);
  };

  const isLoading = eqLoading || ddLoading || regLoading;
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="text-center text-white">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--clr-bg-card)] backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
          <h3 className="text-xl font-bold text-[var(--clr-text-primary)]">Edit Work Log</h3>
          <button
            onClick={onCancel}
            className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Job ID - read-only */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Job ID
              </label>
              <input
                type="text"
                value={formData.jobId || ''}
                disabled
                className="w-full px-4 py-2.5 bg-[var(--clr-bg-muted)] border border-[var(--clr-border)] rounded-xl text-sm text-[var(--clr-text-muted)] cursor-not-allowed"
              />
            </div>

            {/* Reported Date */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Reported Date *
              </label>
              <input
                type="datetime-local"
                value={formData.reportedDate || ''}
                onChange={(e) => handleChange('reportedDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
                  errors.reportedDate ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]' : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)]'
                }`}
              />
              {errors.reportedDate && <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.reportedDate}</p>}
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Equipment *
              </label>
              <select
                value={formData.equipmentId || ''}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
                  errors.equipmentId ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]' : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)]'
                }`}
              >
                <option value="">Select Equipment</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
              {errors.equipmentId && <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.equipmentId}</p>}
            </div>

            {/* TEMP-HIDDEN FIELD: "Regulation" — hidden per client request. Uncomment the block below to restore. */}
            {/* Regulation
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Regulation
              </label>
              <select
                value={formData.regulation || ''}
                onChange={(e) => handleChange('regulation', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Regulation</option>
                {regulationsList.map((reg) => (
                  <option key={reg.id} value={reg.code}>{reg.code}</option>
                ))}
              </select>
            </div>
            */}

            {/* Component, Vessel, Department */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Component
              </label>
              <select
                value={formData.component || ''}
                onChange={(e) => handleChange('component', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Component</option>
                {getOptions('componentSpec').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Vessel Name
              </label>
              <select
                value={formData.vesselName || ''}
                onChange={(e) => handleChange('vesselName', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Vessel</option>
                {getOptions('vesselName').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Department
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Department</option>
                {getOptions('department').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Priority, Reported By, Office Notified, Assistants */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Priority *
              </label>
              <select
                value={getOptions('priority').find((p) => p.toUpperCase() === (formData.priority || '').toUpperCase()) || ''}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Priority</option>
                {getOptions('priority').map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Reported By *
              </label>
              <select
                value={formData.reportedBy || ''}
                onChange={(e) => handleChange('reportedBy', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
                  errors.reportedBy ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]' : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)]'
                }`}
              >
                <option value="">Select Rank</option>
                {getOptions('reportedBy').map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              {errors.reportedBy && <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.reportedBy}</p>}
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Office Notified?
              </label>
              <select
                value={formData.officeNotified || ''}
                onChange={(e) => handleChange('officeNotified', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Office Notified</option>
                {getOptions('officeNotified').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Assistants Required?
              </label>
              <select
                value={formData.assistantsRequired || ''}
                onChange={(e) => handleChange('assistantsRequired', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Assistance</option>
                {getOptions('assistant').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Job / Defect Description *
              </label>
              <textarea
                value={formData.jobDescription || ''}
                onChange={(e) => handleChange('jobDescription', e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 transition ${
                  errors.jobDescription ? 'border-[var(--clr-text-red)] focus:ring-[var(--clr-ring)]' : 'border-[var(--clr-border)] focus:ring-[var(--clr-ring)]'
                }`}
              />
              {errors.jobDescription && <p className="mt-1 text-xs text-[var(--clr-text-red)]">{errors.jobDescription}</p>}
            </div>

            {/* Troubleshooting fields */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Actions Taken
              </label>
              <textarea
                value={formData.actionsTaken || ''}
                onChange={(e) => handleChange('actionsTaken', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Spares Used <span className="text-[var(--clr-text-muted)]">(multi-select)</span>
              </label>
              <select
                multiple
                value={Array.isArray(formData.sparesUsed) ? formData.sparesUsed : []}
                onChange={handleSparesChange}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition h-28 overflow-y-auto"
              >
                {getOptions('sparesUsed').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--clr-text-muted)]">
                Hold <kbd className="px-1.5 py-0.5 bg-[var(--clr-bg-muted)] rounded text-[10px] border border-[var(--clr-border)]">Ctrl</kbd> (Windows) or <kbd className="px-1.5 py-0.5 bg-[var(--clr-bg-muted)] rounded text-[10px] border border-[var(--clr-border)]">Cmd</kbd> (Mac) to select multiple
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Reason for Job Performed
              </label>
              <select
                value={formData.reasonDelay || ''}
                onChange={(e) => handleChange('reasonDelay', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Reason</option>
                {getOptions('reasonClassifications').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* TEMP-HIDDEN FIELD: "Order Status" — hidden per client request. Uncomment the block below to restore. */}
            {/* Order Status
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Order Status
              </label>
              <select
                value={formData.orderStatus || 'Not Ordered'}
                onChange={(e) => handleChange('orderStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                {getOptions('orderStatus').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            */}

            {/* TEMP-HIDDEN FIELD: "PO/Requisition Ref" — hidden per client request. Uncomment the block below to restore. */}
            {/* PO/Requisition Ref
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                PO/Requisition Ref
              </label>
              <input
                type="text"
                value={formData.poReference || ''}
                onChange={(e) => handleChange('poReference', e.target.value)}
                placeholder="e.g. PO-2025-045"
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              />
            </div>
            */}

            {/* TEMP-HIDDEN FIELD: "Requisition Status" — hidden per client request. Uncomment the block below to restore. */}
            {/* Requisition Status
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Requisition Status
              </label>
              <select
                value={formData.requisitionStatus || ''}
                onChange={(e) => handleChange('requisitionStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Status</option>
                {getOptions('requisitionStatus').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            */}

            {/* TEMP-HIDDEN FIELD: "Tested Criteria" — hidden per client request. Uncomment the block below to restore. */}
            {/* Tested Criteria
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Tested Criteria
              </label>
              <select
                value={formData.testedCriteria || ''}
                onChange={(e) => handleChange('testedCriteria', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Option</option>
                {getOptions('testedCriteria').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            */}

            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Condition
              </label>
              <select
                value={formData.conditionMatrix || ''}
                onChange={(e) => handleChange('conditionMatrix', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition"
              >
                <option value="">Select Condition</option>
                {getOptions('conditionMatrix').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Media Attachments */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Media Attachments
              </label>
              <FileUploader
                onFileChange={handleFileUpload}
                initialFile={null}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi,.doc,.docx,.xls,.xlsx"
                maxSize={20 * 1024 * 1024}
                label="Drop files here or click to browse"
                uploading={uploading}
                uploadProgress={progress}
                uploadError={uploadError}
              />
              {/* Uploaded files list with remove */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]"
                    >
                      {file.type?.startsWith('image/') ? (
                        <img src={file.url} alt={file.fileName} className="w-10 h-10 rounded object-cover border border-[var(--clr-border)] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-card)] flex items-center justify-center text-[var(--clr-text-secondary)] shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                      )}
                      <span className="flex-1 min-w-0 text-sm text-[var(--clr-text-primary)] truncate">{file.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-red)] rounded-full transition shrink-0 cursor-pointer"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Status */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Job Status *
              </label>
              <select
                value={formData.status || 'OPEN'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] transition font-bold"
              >
                <option value="OPEN">OPEN</option>
                {getOptions('jobStatus').filter((o) => o !== 'OPEN').map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Resolution fields — disabled unless completed */}
            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Date Completed
              </label>
              <input
                type="datetime-local"
                value={formData.dateCompleted || ''}
                onChange={(e) => handleChange('dateCompleted', e.target.value || null)}
                disabled={!isClosed}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
                  isClosed
                    ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)]'
                    : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
                } border-[var(--clr-border)]`}
              />
              {errors.dateCompleted && <p className="mt-1 text-xs text-red-500">{errors.dateCompleted}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Completed By
              </label>
              <select
                value={formData.completedBy || ''}
                onChange={(e) => handleChange('completedBy', e.target.value)}
                disabled={!isClosed}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
                  isClosed
                    ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)]'
                    : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
                } ${errors.completedBy ? 'border-[var(--clr-text-red)]' : 'border-[var(--clr-border)]'}`}
              >
                <option value="">Select Rank</option>
                {getOptions('completedBy').map((person) => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
              {errors.completedBy && <p className="mt-1 text-xs text-red-500">{errors.completedBy}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
                Final Resolution / Root Cause
              </label>
              <textarea
                value={formData.resolution || ''}
                onChange={(e) => handleChange('resolution', e.target.value)}
                disabled={!isClosed}
                rows={3}
                placeholder={isClosed ? "What fixed the problem?" : "Complete the job to enter resolution"}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition ${
                  isClosed
                    ? 'bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)]'
                    : 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] cursor-not-allowed'
                } ${errors.resolution ? 'border-[var(--clr-text-red)]' : 'border-[var(--clr-border)]'}`}
              />
              {errors.resolution && <p className="mt-1 text-xs text-red-500">{errors.resolution}</p>}
            </div>
          </div>

          {/* Status Preview */}
          <div className="bg-[var(--clr-bg-muted)] rounded-xl p-4 flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="font-mono text-[var(--clr-text-secondary)] uppercase text-xs">Status:</span>
              <span className={`ml-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(formData.status || 'OPEN')}`}>
                {formData.status?.toUpperCase() || 'OPEN'}
              </span>
            </div>
            <div>
              <span className="font-mono text-[var(--clr-text-secondary)] uppercase text-xs">Days Open:</span>
              <span className="ml-2 font-bold text-[var(--clr-text-primary)]">
                {calculateDaysOpen(formData.reportedDate, isClosed ? formData.dateCompleted : null)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--clr-border)]">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-8 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Saving...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}