// lib/services/cloudinary.service.ts
// Server-only: uses Cloudinary SDK (never import in client components)

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - Raw file bytes
 * @param folderPath - Cloudinary folder, e.g. "work-logs/{jobId}"
 * @param publicId - Unique public ID for the file (e.g. "timestamp_filename")
 * @param mimeType - MIME type of the file (for resource_type detection)
 */
export async function uploadFile(
  buffer: Buffer,
  folderPath: string,
  publicId: string,
  mimeType: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Determine resource_type based on MIME type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (mimeType.startsWith('image/')) resourceType = 'image';
    else if (mimeType.startsWith('video/')) resourceType = 'video';
    else if (
      mimeType === 'application/pdf' ||
      mimeType.startsWith('application/') ||
      mimeType.startsWith('text/')
    ) {
      resourceType = 'raw';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID.
 */
export async function deleteFile(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary delete failed: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}