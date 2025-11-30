/**
 * Supabase Storage Utility
 * Handles image uploads to Supabase Storage bucket
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = "images";

export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File or Blob to upload
 * @param folder - Optional folder path (e.g., 'posts', 'drafts')
 * @returns Public URL of the uploaded file
 */
export async function uploadToSupabase(
  file: File | Blob,
  folder: string = "posts"
): Promise<UploadResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase configuration is missing");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file instanceof File ? file.name.split(".").pop() : "jpg";
  const filename = `${timestamp}-${randomString}.${extension}`;
  const filePath = `${folder}/${filename}`;

  // Upload to Supabase Storage
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": file.type || "image/jpeg",
    },
    body: file,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload to Supabase: ${error}`);
  }

  // Get public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;

  return {
    url: publicUrl,
    path: filePath,
    publicUrl,
  };
}

/**
 * Convert base64 data URL to Blob
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Upload base64 image to Supabase
 */
export async function uploadBase64ToSupabase(
  base64: string,
  folder: string = "posts"
): Promise<UploadResult> {
  const blob = base64ToBlob(base64);
  return uploadToSupabase(blob, folder);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabase(filePath: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase configuration is missing");
  }

  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete from Supabase: ${error}`);
  }
}
