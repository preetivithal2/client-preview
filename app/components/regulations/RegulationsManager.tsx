// components/regulations/RegulationsManager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  getAllRegulations,
  addRegulation,
  updateRegulation,
  deleteRegulation,
} from "../../lib/firestore";
import { Regulation, MediaFile } from "../../lib/types";
import FileUploader from "../common/FileUploader";
import { useCloudinaryUpload } from "../../lib/hooks/useCloudinaryUpload";

export default function RegulationsManager() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFile, setExistingFile] = useState<{ name: string; url: string; type?: string } | null>(null);
  const { upload, uploading, progress, error: uploadError, reset: resetUpload } = useCloudinaryUpload();

  const fetchRegulations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRegulations();
      setRegulations(data);
    } catch (err: any) {
      console.error("Failed to fetch regulations:", err);
      setError(err.message || "Failed to load regulations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const resetForm = () => {
    setInputValue("");
    setDescription("");
    setSelectedFiles([]);
    setExistingFile(null);
    setEditingId(null);
    resetUpload();
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      alert("Please enter a regulation code/name.");
      return;
    }

    // Upload to Cloudinary if new files are selected
    let attachment = existingFile;
    let filesData: MediaFile[] = [];
    if (selectedFiles.length > 0) {
      const folderPath = `regulations-assets/${editingId || `new-${Date.now()}`}`;

      for (const f of selectedFiles) {
        const uploadResult = await upload(f, folderPath);
        if (uploadResult) {
          // Keep the last uploaded file as legacy attachment reference
          attachment = {
            name: f.name,
            url: uploadResult.url,
            type: f.type,
          };

          const mediaFile: MediaFile = {
            id: crypto.randomUUID(),
            ...(editingId ? { regulationId: editingId } : {}),
            fileName: uploadResult.fileName,
            publicId: uploadResult.publicId,
            url: uploadResult.url,
            type: uploadResult.type,
            size: uploadResult.bytes,
            provider: 'cloudinary',
            providerId: uploadResult.publicId,
            uploadedAt: new Date().toISOString(),
          };
          filesData = [...filesData, mediaFile];
        }
      }
    }

    try {
      if (editingId) {
        await updateRegulation(editingId, trimmed, description, attachment, filesData);
      } else {
        await addRegulation(trimmed, description, attachment, filesData);
      }
      resetForm();
      await fetchRegulations();
    } catch (err: any) {
      console.error("Failed to save regulation:", err);
      alert(err.message || "Failed to save regulation. Please try again.");
    }
  };

  const handleEdit = (regulation: Regulation) => {
    setEditingId(regulation.id);
    setInputValue(regulation.code);
    setDescription(regulation.description || "");
    setExistingFile(regulation.attachment || null);
    setSelectedFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this regulation?")) {
      try {
        await deleteRegulation(id);
        if (editingId === id) resetForm();
        await fetchRegulations();
      } catch (err: any) {
        console.error("Failed to delete regulation:", err);
        alert(err.message || "Failed to delete regulation. Please try again.");
      }
    }
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl shadow-sm border border-[var(--clr-border)] overflow-hidden">
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 border-b border-[var(--clr-border)] space-y-4">
        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Regulation Name / Code *
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. MARPOL Annex I, SOLAS II-1"
            className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Engine room environmental regulations covering bilge water treatment and oil residue management."
            rows={2}
            className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
            Attachment (PDF, Image, etc.)
          </label>
          <FileUploader
            onFileChange={handleFileChange}
            initialFile={existingFile}
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
            maxSize={10 * 1024 * 1024} // 10MB
            label="Drop files or click to browse"
            uploading={uploading}
            uploadProgress={progress}
            uploadError={uploadError}
          />
          {/* Selected files list with remove */}
          {selectedFiles.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {selectedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]">
                  <div className="w-8 h-8 rounded bg-[var(--clr-bg-card)] flex items-center justify-center text-[var(--clr-text-secondary)] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="flex-1 min-w-0 text-sm text-[var(--clr-text-primary)] truncate">{f.name}</span>
                  <span className="text-xs text-[var(--clr-text-muted)] shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(idx)}
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

        <div className="flex items-end justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] text-sm font-bold rounded-xl transition shadow-sm"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </form>

      {error && (
        <div className="px-6 py-2 bg-[var(--clr-bg-red)] border-b border-[var(--clr-bg-red-border)] text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[var(--clr-text-muted)] font-mono text-sm">
            <span className="w-3 h-3 border-2 border-[var(--clr-text-secondary)] border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : regulations.length === 0 ? (
          <div className="text-center py-8 text-[var(--clr-text-muted)] font-mono text-sm">
            No regulations added yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--clr-bg-page)] border-b border-[var(--clr-border)] text-[11px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4 text-left w-[40%]">Regulation</th>
                  <th className="py-3 px-4 text-left">Attachment</th>
                  <th className="py-3 px-4 text-center w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clr-border)]">
                {regulations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[var(--clr-bg-page)] transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-[var(--clr-text-primary)]">
                        {reg.code}
                      </span>
                      {reg.description && (
                        <p className="text-xs text-[var(--clr-text-secondary)] mt-0.5 leading-snug">
                          {reg.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {!reg.attachment && (!reg.files || reg.files.length === 0) ? (
                        <span className="text-[var(--clr-text-muted)] text-xs">—</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Legacy attachment */}
                          {reg.attachment?.url && (
                            <a
                              href={reg.attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs font-medium"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                              </svg>
                              {reg.attachment.name}
                            </a>
                          )}
                          {/* Multiple files */}
                          {reg.files && reg.files.length > 0 && reg.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs font-medium"
                            >
                              {f.type?.startsWith('image/') ? (
                                <img src={f.url} alt={f.fileName} className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                              )}
                              <span className="truncate max-w-[200px]">{f.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(reg)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-red)] transition cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}