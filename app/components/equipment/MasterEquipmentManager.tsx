"use client";

import { useState, useEffect } from "react";
import FileUploader from "../common/FileUploader";
import {
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "../../lib/firestore";
import { Equipment, MediaFile } from "../../lib/types";
import { useCloudinaryUpload } from "../../lib/hooks/useCloudinaryUpload";



export default function MasterEquipmentManager() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Equipment, "id">>({
    name: "",
    makerModel: "",
    serialNumber: "",
    specs: "",
    file: null,
    files: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { upload, uploading, progress, error: uploadError, reset: resetUpload } = useCloudinaryUpload();

    useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEquipment();
      setEquipmentList(data);
    } catch (err: any) {
      console.error("Failed to fetch equipment:", err);
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      makerModel: "",
      serialNumber: "",
      specs: "",
      file: null,
      files: [],
    });
    setSelectedFiles([]);
    setEditingId(null);
    resetUpload();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const { name, makerModel, serialNumber } = formData;
    if (!name.trim() || !makerModel.trim() || !serialNumber.trim()) {
      alert("Please fill in all required fields (Name, Maker/Model, Serial Number).");
      return;
    }

    let fileData = formData.file;
    let filesData: MediaFile[] = formData.files || [];
    if (selectedFiles.length > 0) {
      const equipmentId = editingId || `new-${Date.now()}`;
      const folderPath = `equipment-assets/${equipmentId}`;

      for (const f of selectedFiles) {
        const uploadResult = await upload(f, folderPath);
        if (uploadResult) {
          // Keep the last uploaded file as the legacy "file" field
          fileData = {
            name: f.name,
            url: uploadResult.url,
            type: f.type,
          };

          const mediaFile: MediaFile = {
            id: crypto.randomUUID(),
            ...(editingId ? { equipmentId: editingId } : {}),
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

    const payload = { ...formData, file: fileData, files: filesData };

    try {
      if (editingId) {
        await updateEquipment(editingId, payload);
      } else {
        await addEquipment(payload);
      }
      resetForm();
      await fetchEquipment();
    } catch (err: any) {
      console.error("Failed to save equipment:", err);
      alert(err.message || "Failed to save equipment. Please try again.");
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingId(equipment.id);
    setFormData({
      name: equipment.name,
      makerModel: equipment.makerModel,
      serialNumber: equipment.serialNumber,
      specs: equipment.specs,
      file: equipment.file,
    });
    setSelectedFiles([]);
  };

    const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this equipment entry?")) {
      try {
        await deleteEquipment(id);
        if (editingId === id) resetForm();
        await fetchEquipment();
      } catch (err: any) {
        console.error("Failed to delete equipment:", err);
        alert(err.message || "Failed to delete equipment. Please try again.");
      }
    }
  };

  const handleImportCSV = () => {
    alert("CSV import will be implemented with Firebase storage.");
  };
  const handleExportCSV = () => {
    alert("CSV export will be implemented.");
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl shadow-sm border border-[var(--clr-border)] overflow-hidden">
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 border-b border-[var(--clr-border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Main Engine"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[#C9A253]/50 focus:border-[#C9A253] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Maker & Model *
            </label>
            <input
              type="text"
              name="makerModel"
              value={formData.makerModel}
              onChange={handleChange}
              placeholder="e.g. Wärtsilä W32"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[#C9A253]/50 focus:border-[#C9A253] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Serial Number *
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="e.g. SN-2024-001"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[#C9A253]/50 focus:border-[#C9A253] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Technical Specifications
            </label>
            <input
              type="text"
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              placeholder="e.g. 3200 kW, 750 RPM"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[#C9A253]/50 focus:border-[#C9A253] transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1">
              Attachment (PDF, Image, Document)
            </label>
            <FileUploader
              onFileChange={handleFileChange}
              initialFile={formData.file}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.svg,.txt"
              maxSize={20 * 1024 * 1024} // 20MB
              label="Drop files here or click to browse"
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
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
          >
            {editingId ? "Update Equipment" : "Add Equipment"}
          </button>
        </div>
      </form>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-[var(--clr-border)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--clr-bg-page)]">
                <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)]">
          {loading ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-[var(--clr-text-secondary)] border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : (
            `${equipmentList.length} equipment entries`
          )}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleImportCSV}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-lg hover:bg-[var(--clr-bg-subtle)] transition cursor-pointer"
          >
            📥 Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-lg hover:bg-[var(--clr-bg-subtle)] transition cursor-pointer"
          >
            📤 Export CSV
          </button>
        </div>
            </div>

      {error && (
        <div className="px-6 py-2 bg-[var(--clr-bg-red)] border-b border-[var(--clr-bg-red-border)] text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="p-6 overflow-x-auto">
        {equipmentList.length === 0 ? (
          <div className="text-center py-8 text-[var(--clr-text-muted)] font-mono text-sm">
            No equipment entries yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--clr-bg-page)] border-b border-[var(--clr-border)] text-[11px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Maker & Model</th>
                <th className="py-3 px-4 text-left">Serial No.</th>
                <th className="py-3 px-4 text-left">Specs</th>
                <th className="py-3 px-4 text-left">Attachment</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clr-border)]">
              {equipmentList.map((eq) => (
                <tr key={eq.id} className="hover:bg-[var(--clr-bg-page)] transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--clr-text-primary)]">{eq.name}</td>
                  <td className="py-3 px-4 text-[var(--clr-text-primary)]">{eq.makerModel}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-primary)]">{eq.serialNumber}</td>
                  <td className="py-3 px-4 text-xs text-[var(--clr-text-primary)]">{eq.specs || "—"}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {eq.file ? (
                        <a
                          href={eq.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                          {eq.file.name}
                        </a>
                      ) : null}
                      {eq.files && eq.files.length > 0 && eq.files.map((f) => (
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
                          <span className="truncate max-w-[120px]">{f.fileName}</span>
                        </a>
                      ))}
                      {!eq.file && (!eq.files || eq.files.length === 0) && (
                        <span className="text-[var(--clr-text-muted)] text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(eq)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id)}
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
        )}
      </div>
    </div>
  );
}