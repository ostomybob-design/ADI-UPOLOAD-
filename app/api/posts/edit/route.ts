import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, updates } = body;

    console.log('📝 Edit API called with:', JSON.stringify({ postId, updates }, null, 2));

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: "Updates object is required" },
        { status: 400 }
      );
    }

    // Validate postId is a number
    const id = typeof postId === 'string' ? parseInt(postId) : postId;
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    // Check if post exists first
    const existingPost = await prisma.search_results.findUnique({
      where: { id },
    });

    if (!existingPost) {
      console.error('❌ Post not found:', id);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    console.log('✅ Found existing post:', existingPost.id);
    console.log('📊 Current late_post_id in DB:', existingPost.late_post_id);
    console.log('📊 New late_post_id from updates:', updates.late_post_id);

    // Sanitize updates to remove any undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    console.log('🧹 Clean updates:', JSON.stringify(cleanUpdates, null, 2));

    // Update the post
    const updatedPost = await prisma.search_results.update({
      where: { id },
      data: {
        ...cleanUpdates,
        is_edited: true,
        updated_at: new Date(),
      },
    });

    console.log('✅ Post updated successfully:', updatedPost.id);
    console.log('📊 Updated late_post_id in DB:', updatedPost.late_post_id);

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error("❌ Error updating post:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error meta:", error.meta);
    console.error("❌ Full error:", JSON.stringify(error, null, 2));
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      console.error("🚨 Unique constraint violation on field:", error.meta?.target);
      return NextResponse.json(
        { error: "Unique constraint violation", field: error.meta?.target, details: error.message },
        { status: 409 }
      );
    }

    // Check for invalid data type
    if (error.code === 'P2023') {
      console.error("🚨 Invalid data type:", error.message);
      return NextResponse.json(
        { error: "Invalid data type", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update post", details: error.message, code: error.code },
      { status: 500 }
    );
  }
}
