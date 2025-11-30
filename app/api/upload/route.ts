import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = "images";

/**
 * POST /api/upload
 * Upload media to Supabase Storage
 */
export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { message: "Supabase configuration is missing" },
        { status: 500 }
      );
    }

    const { file, folder = "posts" } = await req.json();

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert base64 to blob
    let blob: Blob;
    let contentType = "image/jpeg";

    if (file.startsWith("data:")) {
      // Base64 data URL
      const parts = file.split(";base64,");
      contentType = parts[0].split(":")[1];
      const base64Data = parts[1];
      
      // Convert base64 to binary
      const binaryString = Buffer.from(base64Data, "base64");
      blob = new Blob([binaryString], { type: contentType });
    } else {
      return NextResponse.json(
        { message: "Invalid file format" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = contentType.split("/")[1] || "jpg";
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": contentType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("❌ Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload to Supabase", details: error },
        { status: 500 }
      );
    }

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;

    console.log("✅ File uploaded successfully to Supabase:", publicUrl);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error uploading file", error: (error as Error).message },
      { status: 500 }
    );
  }
}
