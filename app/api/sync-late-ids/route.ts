import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";

/**
 * GET /api/sync-late-ids
 * Sync Late.dev post IDs to database for posts missing late_post_id
 */
export async function GET() {
  try {
    console.log("🔄 Starting Late.dev post ID sync...");

    // Get all approved posts from database without late_post_id
    const dbPosts = await prisma.search_results.findMany({
      where: {
        OR: [
          { late_post_id: null },
          { late_post_id: "" }
        ],
        approval_status: "approved"
      }
    });

    console.log(`📊 Found ${dbPosts.length} database posts without late_post_id`);

    // Get all scheduled posts from Late.dev
    const latePosts = await lateAPI.getPosts({ status: "scheduled" });
    console.log(`📊 Found ${latePosts.length} scheduled posts in Late.dev`);

    let updatedCount = 0;
    const updates: any[] = [];

    for (const dbPost of dbPosts) {
      // Try to find matching Late.dev post by content (first 100 chars)
      const contentSnippet = dbPost.ai_caption?.substring(0, 100);
      
      if (!contentSnippet) continue;

      const matchingLatePost = latePosts.find((latePost: any) => {
        const lateContent = latePost.content?.substring(0, 100);
        return lateContent === contentSnippet;
      });

      if (matchingLatePost) {
        const latePostId = (matchingLatePost as any)._id || matchingLatePost.id;

        console.log(`✅ Match found for post ${dbPost.id} -> Late.dev ID: ${latePostId}`);

        // Update database with late_post_id
        await prisma.search_results.update({
          where: { id: dbPost.id },
          data: {
            late_post_id: latePostId,
            late_status: matchingLatePost.status,
            late_scheduled_for: matchingLatePost.scheduledFor 
              ? new Date(matchingLatePost.scheduledFor) 
              : null,
          }
        });

        updatedCount++;
        updates.push({
          dbPostId: dbPost.id,
          latePostId: latePostId,
          content: contentSnippet.substring(0, 50) + "..."
        });
      }
    }

    console.log(`🎉 Sync complete! Updated ${updatedCount} posts`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${updatedCount} posts`,
      totalDbPosts: dbPosts.length,
      totalLatePosts: latePosts.length,
      updatedCount,
      updates
    });

  } catch (error) {
    console.error("❌ Error syncing post IDs:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to sync post IDs", 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
