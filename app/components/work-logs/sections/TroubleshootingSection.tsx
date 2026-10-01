// components/work-logs/sections/TroubleshootingSection.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import FileUploader from '../../common/FileUploader';
import { useCloudinaryUpload } from '../../../lib/hooks/useCloudinaryUpload';
import { MediaFile } from '../../../lib/types';

interface Props {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  orderStatusOptions: string[];
  getDropdownOptions: (key: string) => string[];
  errors: Record<string, string>;
}

export default function TroubleshootingSection({
  formData,
  onFieldChange,
  orderStatusOptions,
  getDropdownOptions,
  errors,
}: Props) {
  const { upload, uploading, progress, error: uploadError, reset: resetUpload } = useCloudinaryUpload();

  // Ref to safely accumulate files across rapid parallel uploads
  const filesRef = useRef<MediaFile[]>([]);

  // Sync ref with formData whenever it changes from outside
  useEffect(() => {
    filesRef.current = Array.isArray(formData.files) ? formData.files : [];
  }, [formData.files]);

  // Searchable multi-select for Spares Used
  const [sparesSearch, setSparesSearch] = useState('');
  const sparesOptions = getDropdownOptions('sparesUsed');
  const filteredSpares = useMemo(() => {
    if (!sparesSearch.trim()) return sparesOptions;
    return sparesOptions.filter((opt) =>
      opt.toLowerCase().includes(sparesSearch.toLowerCase())
    );
  }, [sparesOptions, sparesSearch]);

  const toggleSpare = (spare: string) => {
    const exists = selectedSpares.includes(spare);
    if (exists) {
      onFieldChange('sparesUsed', selectedSpares.filter((s: string) => s !== spare));
    } else {
      onFieldChange('sparesUsed', [...selectedSpares, spare]);
    }
  };

  // Handle file upload to Cloudinary
  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      resetUpload();
      return;
    }

    const jobId = formData.jobId || `pending-${Date.now()}`;
    const folderPath = `work-logs/${jobId}`;

    const result = await upload(file, folderPath);
    if (!result) return;

    // Update mediaAttachments (legacy) with the latest URL
    onFieldChange('mediaAttachments', result.url);

    // Build a MediaFile entry for Firestore
    const mediaFile: MediaFile = {
      id: crypto.randomUUID(),
      ...(formData.jobId ? { jobId: formData.jobId } : {}),
      fileName: result.fileName,
      publicId: result.publicId,
      url: result.url,
      type: result.type,
      size: result.bytes,
      provider: 'cloudinary',
      providerId: result.publicId,
      uploadedAt: new Date().toISOString(),
    };

    // Accumulate via ref (avoids stale closure reads of formData.files from parallel uploads)
    filesRef.current = [...filesRef.current, mediaFile];
    onFieldChange('files', filesRef.current);
  };

  // Remove a file from the uploaded files array by ID
  const handleRemoveFile = (fileId: string) => {
    const existingFiles: MediaFile[] = Array.isArray(formData.files) ? formData.files : [];
    const updated = existingFiles.filter((f) => f.id !== fileId);
    onFieldChange('files', updated.length > 0 ? updated : []);
    filesRef.current = updated;
    if (updated.length === 0) {
      onFieldChange('mediaAttachments', '');
    }
  };

  // Get existing uploaded files
  const uploadedFiles: MediaFile[] = Array.isArray(formData.files) ? formData.files : [];

  // Get selected spares as array
  const selectedSpares = Array.isArray(formData.sparesUsed)
    ? formData.sparesUsed
    : formData.sparesUsed
      ? [formData.sparesUsed]
      : [];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-[var(--clr-text-primary)]">Troubleshooting & Actions</h3>
        <span className="text-xs text-[var(--clr-text-muted)]">Step 3 of 4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Actions Taken */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Actions Taken / Troubleshooting
          </label>
          <textarea
            value={formData.actionsTaken || ''}
            onChange={(e) => onFieldChange('actionsTaken', e.target.value)}
            rows={2}
            placeholder="Describe steps taken, tests performed..."
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          />
        </div>

        {/* Spares Used — Searchable Multi-Select */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Spares Used
          </label>
          {/* Search input */}
          <input
            type="text"
            value={sparesSearch}
            onChange={(e) => setSparesSearch(e.target.value)}
            placeholder="Type to search spares..."
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition placeholder:text-[var(--clr-text-muted)]"
          />
          {/* Scrollable filtered list — always visible */}
          <div className="mt-1 border border-[var(--clr-border)] rounded-xl bg-[var(--clr-bg-card)] shadow-sm max-h-36 overflow-y-auto">
            {filteredSpares.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[var(--clr-text-muted)] text-center">
                {sparesSearch ? 'No matching spares found.' : 'No spares available.'}
              </p>
            ) : (
              filteredSpares.map((opt) => {
                const isSelected = selectedSpares.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSpare(opt)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--clr-bg-subtle)] text-[var(--clr-text-primary)] font-bold border-l-2 border-[var(--clr-bg-accent)]'
                        : 'text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-subtle)]'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{opt}
                  </button>
                );
              })
            )}
          </div>
          {/* Selected spares tags */}
          {selectedSpares.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedSpares.map((s: string) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)] rounded-full">
                  {s}
                  <button type="button" onClick={() => toggleSpare(s)} className="cursor-pointer text-[var(--clr-text-on-accent)]/70 hover:text-[var(--clr-text-on-accent)]">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TEMP-HIDDEN FIELD: "Order Status" — hidden per client request. Uncomment the block below to restore. */}
        {/* Order Status
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Order Status
          </label>
          <select
            value={formData.orderStatus || 'Not Ordered'}
            onChange={(e) => onFieldChange('orderStatus', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            {orderStatusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        */}

        {/* TEMP-HIDDEN FIELD: "PO/Requisition Ref" — hidden per client request. Uncomment the block below to restore. */}
        {/* PO Reference
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            PO/Requisition Ref
          </label>
          <input
            type="text"
            value={formData.poReference || ''}
            onChange={(e) => onFieldChange('poReference', e.target.value)}
            placeholder="e.g. PO-2025-045"
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
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
            onChange={(e) => onFieldChange('requisitionStatus', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Status</option>
            {getDropdownOptions('requisitionStatus').map((opt: string) => (
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
            onChange={(e) => onFieldChange('testedCriteria', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Option</option>
            {getDropdownOptions('testedCriteria').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        */}

        {/* Condition Matrix */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Condition
          </label>
          <select
            value={formData.conditionMatrix || ''}
            onChange={(e) => onFieldChange('conditionMatrix', e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Condition</option>
            {getDropdownOptions('conditionMatrix').map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Media Attachments - FileUploader Component */}
        <div className="sm:col-span-2">
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

          {/* List of uploaded files */}
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
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-sm text-blue-600 hover:underline truncate">{file.fileName}</a>
                  <button type="button" onClick={() => handleRemoveFile(file.id)} className="p-1 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-red)] rounded-full transition shrink-0 cursor-pointer" title="Remove file">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
