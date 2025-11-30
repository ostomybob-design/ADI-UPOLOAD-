import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    console.log("🔍 Unschedule request received:", { postId, bodyType: typeof postId });

    if (!postId) {
      console.error("❌ No postId provided");
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Determine if this is a Late.dev post ID (string with letters) or Supabase ID (numeric)
    const isLateDevId = typeof postId === 'string' && /[a-f]/.test(postId);
    console.log("🔍 ID type detection:", { postId, isLateDevId });

    let post;
    if (isLateDevId) {
      // Look up by Late.dev post ID
      console.log("🔍 Querying database by late_post_id:", postId);
      post = await prisma.search_results.findUnique({
        where: { late_post_id: postId }
      });
    } else {
      // Look up by Supabase database ID
      const numericPostId = parseInt(postId, 10);
      console.log("🔢 Converted postId:", { original: postId, numeric: numericPostId, isNaN: isNaN(numericPostId) });
      
      if (isNaN(numericPostId)) {
        console.error("❌ Invalid post ID format:", postId);
        return NextResponse.json(
          { error: "Invalid post ID format" },
          { status: 400 }
        );
      }

      console.log("🔍 Querying database by id:", numericPostId);
      post = await prisma.search_results.findUnique({
        where: { id: numericPostId }
      });
    }
    
    console.log("📊 Database query result:", post ? { id: post.id, title: post.title, hasLatePostId: !!post.late_post_id } : "NOT FOUND");

    if (!post) {
      console.error("❌ Post not found in database:", postId);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete from Late.dev if it has a late_post_id
    if (post.late_post_id) {
      console.log("🗑️ Attempting to delete from Late.dev:", post.late_post_id);
      try {
        await lateAPI.deletePost(post.late_post_id);
        console.log(`✅ Deleted post ${post.late_post_id} from Late.dev`);
      } catch (lateError: any) {
        console.error("❌ Failed to delete from Late.dev:", lateError);
        // Continue even if Late.dev deletion fails
        return NextResponse.json(
          { error: `Failed to delete from Late.dev: ${lateError.message}` },
          { status: 500 }
        );
      }
    } else {
      console.log("ℹ️ No late_post_id found, skipping Late.dev deletion");
    }

    // Update local database to set status back to pending
    console.log("💾 Updating database to clear Late.dev fields");
    await prisma.search_results.update({
      where: { id: post.id },
      data: {
        approval_status: "pending",
        late_post_id: null,
        late_status: null,
        late_scheduled_for: null,
        late_platforms: Prisma.JsonNull,
        late_error_message: null,
        updated_at: new Date()
      }
    });
    
    console.log("✅ Successfully unscheduled post:", post.id);

    return NextResponse.json({ 
      success: true,
      message: "Post unscheduled and moved back to pending"
    });
  } catch (error: any) {
    console.error("❌ Unschedule error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return NextResponse.json(
      { error: `Failed to unschedule post: ${error.message}` },
      { status: 500 }
    );
  }
}
