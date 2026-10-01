// app/api/upload/route.ts
// Next.js 16 API route — receives file from client, uploads to Cloudinary, returns metadata

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '../../lib/services/cloudinary.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!folder) {
      return NextResponse.json({ error: 'No folder path provided' }, { status: 400 });
    }

    // Generate a unique public ID: timestamp_originalname (no extension — Cloudinary adds it)
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // strip extension
      .replace(/[^a-zA-Z0-9_-]/g, '_') // sanitize
      .slice(0, 60); // limit length
    const publicId = `${timestamp}_${sanitizedName}`;

    // Read file as ArrayBuffer, convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadFile(buffer, folder, publicId, file.type);

    return NextResponse.json({
      publicId: result.publicId,
      url: result.url,
      format: result.format,
      bytes: result.bytes,
      fileName: file.name,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// Respond with 405 for other methods
export async function GET() {
  return NextResponse.json({ message: 'Upload API — use POST' }, { status: 405 });
}
