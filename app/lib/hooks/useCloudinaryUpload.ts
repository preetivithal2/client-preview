// lib/hooks/useCloudinaryUpload.ts
"use client";

import { useState, useCallback } from 'react';

export interface UploadResult {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  fileName: string;
  type: string;
}

interface UseUploadReturn {
  /** Trigger the upload — call with a file and folder path */
  upload: (file: File, folderPath: string) => Promise<UploadResult | null>;
  /** Whether an upload is in progress */
  uploading: boolean;
  /** Upload progress percentage (0–100). Starts at 0 once upload begins. */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** Most recent upload result */
  result: UploadResult | null;
  /** Reset state back to idle */
  reset: () => void;
}

/**
 * Hook to upload a file to Cloudinary via our internal API route.
 *
 * Usage:
 *   const { upload, uploading, progress, error } = useCloudinaryUpload();
 *   const fileMeta = await upload(myFile, 'work-logs/sm-260704001');
 *
 * Returns upload metadata you can store in Firestore as a MediaFile.
 */
export function useCloudinaryUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const upload = useCallback(async (file: File, folderPath: string): Promise<UploadResult | null> => {
    setUploading(true);
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folderPath);

      setProgress(30);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${response.status}`);
      }

      const data: UploadResult = await response.json();
      setProgress(100);
      setResult(data);
      setUploading(false);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      setUploading(false);
      setProgress(0);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { upload, uploading, progress, error, result, reset };
}
