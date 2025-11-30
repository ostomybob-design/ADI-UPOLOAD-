import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, updates } = body;

    console.log('📝 Edit API called with:', { postId, updates });

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
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

    // Update the post
    const updatedPost = await prisma.search_results.update({
      where: { id },
      data: {
        ...updates,
        is_edited: true,
        updated_at: new Date(),
      },
    });

    console.log('✅ Post updated successfully:', updatedPost.id);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("❌ Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post", details: (error as Error).message },
      { status: 500 }
    );
  }
}
