import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    console.log('🗑️ Attempting to delete post with ID:', id);
    
    // First check if the post exists
    const existingPost = await prisma.search_results.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      console.log('⚠️ Post not found:', id);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    console.log('📋 Post found, deleting:', { id, title: existingPost.title });
    
    await prisma.search_results.delete({
      where: { id },
    });

    console.log('✅ Post deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Database error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    const result = await prisma.search_results.findUnique({
      where: { id },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
