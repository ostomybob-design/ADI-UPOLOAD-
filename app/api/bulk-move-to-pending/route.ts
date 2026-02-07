import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Move all approved posts back to pending (Ready to Post)
 * This is a one-time utility endpoint
 */
export async function POST() {
  try {
    // Get count of approved posts first
    const approvedPosts = await prisma.search_results.findMany({
      where: {
        approval_status: "approved"
      },
      select: {
        id: true,
        title: true,
        late_post_id: true
      }
    });

    if (approvedPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No approved posts to move",
        count: 0
      });
    }

    const scheduledCount = approvedPosts.filter(p => p.late_post_id).length;

    // Move all approved posts to pending
    const result = await prisma.search_results.updateMany({
      where: {
        approval_status: "approved"
      },
      data: {
        approval_status: "pending",
        approved_at: null,
        approved_by: null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Moved ${result.count} posts from Approved to Ready to Post (pending)`,
      count: result.count,
      scheduledInLateDevCount: scheduledCount,
      warning: scheduledCount > 0 
        ? `${scheduledCount} posts have Late.dev IDs and are still scheduled to publish`
        : null,
      samplePosts: approvedPosts.slice(0, 5).map(p => ({
        id: p.id,
        title: p.title.substring(0, 60) + '...',
        hasLateDevId: !!p.late_post_id
      }))
    });

  } catch (error) {
    console.error("Error moving approved posts:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to move posts",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
