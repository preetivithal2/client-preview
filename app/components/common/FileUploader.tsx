"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  initialFile?: { name: string; url: string } | null;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Show an upload progress bar instead of the drop zone */
  uploading?: boolean;
  /** Upload progress percentage (0–100) */
  uploadProgress?: number;
  /** Upload error message to display */
  uploadError?: string | null;
}

export default function FileUploader({
  onFileChange,
  initialFile = null,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  label = "Drop file here or click to browse",
  multiple = false,
  uploading = false,
  uploadProgress = 0,
  uploadError = null,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    // Validate size
    if (selectedFile.size > maxSize) {
      setError(`File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    setError(null);
    setFile(selectedFile);
    // Create preview URL for images
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    onFileChange(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (multiple) {
      files.forEach((f) => handleFile(f));
    } else if (files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (multiple) {
      Array.from(files).forEach((f) => handleFile(f));
    } else {
      handleFile(files[0]);
    }
    // Reset input so same files can be re-selected
    e.target.value = "";
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    onFileChange(null);
    setError(null);
  };

  // If initial file exists and no file selected, show it
  const displayName = file ? file.name : initialFile?.name;
  const displayUrl = file ? previewUrl : initialFile?.url;

  return (
    <div className="w-full">
      {/* Upload progress state */}
      {uploading ? (
        <div className="border-2 border-dashed border-[var(--clr-border)] rounded-xl p-6 bg-[var(--clr-bg-page)]">
          <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
            <span className="w-8 h-8 border-2 border-[var(--clr-bg-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--clr-text-secondary)]">
              Uploading... {uploadProgress}%
            </p>
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs h-2 bg-[var(--clr-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--clr-bg-accent)] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
            isDragging
              ? "border-[#C9A253] bg-amber-50/50"
              : "border-[var(--clr-border)] hover:border-[#C9A253] hover:bg-[var(--clr-bg-page)]"
          } ${file || initialFile ? "bg-[var(--clr-bg-page)]" : "bg-[var(--clr-bg-card)]"}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            className="hidden"
            accept={accept}
            multiple={multiple}
          />

          {!file && !initialFile ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
              <svg
                className="w-10 h-10 text-[var(--clr-text-muted)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm font-medium text-[var(--clr-text-secondary)]">
                {multiple ? `${label} (multi-file)` : label}
              </p>
              <p className="text-xs text-[var(--clr-text-muted)]">
                {multiple ? "Select multiple files at once" : `Supported: ${accept === "*/*" ? "All files" : accept}`}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* File icon / preview */}
              {displayUrl && displayUrl.startsWith("blob:") ? (
                <img
                  src={displayUrl}
                  alt="File preview"
                  className="w-12 h-12 rounded object-cover border border-[var(--clr-border)]"
                />
              ) : (
                <div className="w-12 h-12 bg-[var(--clr-bg-subtle)] rounded-lg flex items-center justify-center text-[var(--clr-text-secondary)]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--clr-text-primary)] truncate">
                  {displayName || "Unnamed file"}
                </p>
                {file && (
                  <p className="text-xs text-[var(--clr-text-secondary)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
                {initialFile && !file && (
                  <p className="text-xs text-emerald-600">✓ Existing file</p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1.5 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-red)] rounded-full transition cursor-pointer"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload error */}
      {uploadError && <p className="mt-1 text-xs text-[var(--clr-text-red)] font-medium">{uploadError}</p>}

      {/* Local validation error */}
      {error && !uploading && <p className="mt-1 text-xs text-[var(--clr-text-red)] font-medium">{error}</p>}

      {/* Hint text */}
      {initialFile && !file && !uploading && (
        <p className="mt-1 text-xs text-[var(--clr-text-muted)]">
          Click or drop a new file to replace the existing one.
        </p>
      )}
    </div>
  );
}
