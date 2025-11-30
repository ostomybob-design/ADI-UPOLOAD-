import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";
import { Prisma } from "@prisma/client";

// Rate limiting: Track last sync time
let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 10000; // 10 seconds cooldown between syncs

/**
 * POST /api/late/sync
 * Sync posts from Late.dev API to local database
 * Updates status, scheduled times, and published times
 */
export async function POST(req: Request) {
  // Check rate limit
  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN_MS) {
    const remainingTime = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncTime)) / 1000);
    console.log(`⏳ Sync rate limited. Please wait ${remainingTime} seconds.`);
    return NextResponse.json({
      success: false,
      error: "Rate limited",
      message: `Please wait ${remainingTime} seconds before syncing again`,
      remainingTime
    }, { status: 429 });
  }
  
  lastSyncTime = now;
  try {
    console.log("🔄 Starting Late.dev sync...");
    
    // Step 1: Clean up orphaned posts (posts with invalid late_post_id)
    const orphanedPosts = await prisma.search_results.findMany({
      where: {
        late_post_id: { not: null },
        OR: [
          { late_post_id: "" },
          { late_post_id: "undefined" },
          { late_post_id: null }
        ]
      },
      select: { id: true, late_post_id: true }
    });
    
    if (orphanedPosts.length > 0) {
      console.log(`🧹 Cleaning up ${orphanedPosts.length} orphaned posts...`);
      await prisma.search_results.updateMany({
        where: {
          id: { in: orphanedPosts.map(p => p.id) }
        },
        data: {
          late_post_id: null,
          late_status: null,
          late_scheduled_for: null,
          late_published_at: null,
          late_platforms: Prisma.JsonNull
        }
      });
      console.log(`✅ Cleaned up ${orphanedPosts.length} orphaned posts`);
    }
    
    // Step 2: Fetch all posts from Late.dev
    const latePosts = await lateAPI.getPosts({ limit: 1000 });
    console.log(`📥 Fetched ${latePosts.length} posts from Late.dev`);
    
    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    
    // Create a Set of valid Late.dev post IDs for quick lookup
    const validLatePostIds = new Set(latePosts.map(p => p.id));
    
    // Step 3: Sync posts from Late.dev
    for (const latePost of latePosts) {
      try {
        // Skip if post ID is invalid
        if (!latePost.id || latePost.id === "undefined") {
          console.warn(`⚠️ Skipping post with invalid ID: ${latePost.id}`);
          continue;
        }
        
        // Find local post by late_post_id
        const localPost = await prisma.search_results.findFirst({
          where: { late_post_id: latePost.id }
        });
        
        if (localPost) {
          // Only update if there are actual changes to avoid unnecessary updates
          const needsUpdate = 
            localPost.late_status !== latePost.status ||
            (latePost.scheduledFor && localPost.late_scheduled_for?.toISOString() !== new Date(latePost.scheduledFor).toISOString()) ||
            (latePost.publishedAt && localPost.late_published_at?.toISOString() !== new Date(latePost.publishedAt).toISOString());
          
          if (needsUpdate) {
            // Update existing post
            const updateData: any = {
              late_status: latePost.status,
              updated_at: new Date()
            };
            
            // Update scheduled time if available
            if (latePost.scheduledFor) {
              updateData.late_scheduled_for = new Date(latePost.scheduledFor);
            }
            
            // Update published time if published
            if (latePost.publishedAt) {
              updateData.late_published_at = new Date(latePost.publishedAt);
            }
            
            // Update platforms (convert to JSON)
            if (latePost.platforms) {
              updateData.late_platforms = latePost.platforms as any;
            }
            
            await prisma.search_results.update({
              where: { id: localPost.id },
              data: updateData
            });
            
            updatedCount++;
            console.log(`✅ Updated post ${localPost.id} (Late ID: ${latePost.id})`);
          }
        } else {
          // This is a post in Late.dev that doesn't exist locally
          // We'll create a minimal record for it so it shows up in the dashboard
          const newPost = await prisma.search_results.create({
            data: {
              title: latePost.content?.substring(0, 100) || "Untitled Post",
              url: `https://getlate.dev/posts/${latePost.id}`,
              snippet: latePost.content?.substring(0, 200),
              search_query: "late-dev-import",
              content_processed: true,
              approval_status: "approved",
              approved_at: new Date(latePost.createdAt || Date.now()),
              ai_caption: latePost.content,
              late_post_id: latePost.id,
              late_status: latePost.status,
              late_scheduled_for: latePost.scheduledFor ? new Date(latePost.scheduledFor) : null,
              late_published_at: latePost.publishedAt ? new Date(latePost.publishedAt) : null,
              late_platforms: (latePost.platforms || []) as any,
              created_at: new Date(latePost.createdAt || Date.now()),
              updated_at: new Date()
            }
          });
          
          createdCount++;
          console.log(`✨ Created new post ${newPost.id} from Late.dev (Late ID: ${latePost.id})`);
        }
        
        syncedCount++;
      } catch (postError: any) {
        const errorMsg = `Failed to sync post ${latePost.id}: ${postError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    // Step 4: Clean up posts that were deleted from Late.dev
    const localPostsWithLateId = await prisma.search_results.findMany({
      where: {
        late_post_id: { not: null }
      },
      select: { id: true, late_post_id: true }
    });
    
    const deletedFromLate = localPostsWithLateId.filter(
      p => p.late_post_id && !validLatePostIds.has(p.late_post_id)
    );
    
    if (deletedFromLate.length > 0) {
      console.log(`🗑️ Found ${deletedFromLate.length} posts deleted from Late.dev, clearing their Late.dev data...`);
      await prisma.search_results.updateMany({
        where: {
          id: { in: deletedFromLate.map(p => p.id) }
        },
        data: {
          late_post_id: null,
          late_status: null,
          late_scheduled_for: null,
          late_published_at: null,
          late_platforms: Prisma.JsonNull
        }
      });
      console.log(`✅ Cleared Late.dev data from ${deletedFromLate.length} posts`);
    }
    
    console.log(`✅ Sync complete: ${syncedCount} posts synced (${updatedCount} updated, ${createdCount} created)`);
    
    return NextResponse.json({
      success: true,
      synced: syncedCount,
      updated: updatedCount,
      created: createdCount,
      cleaned: orphanedPosts.length + deletedFromLate.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Synced ${syncedCount} posts from Late.dev (${updatedCount} updated, ${createdCount} created, ${orphanedPosts.length + deletedFromLate.length} cleaned)`
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to sync posts from Late.dev", 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/late/sync
 * Get sync status and last sync time
 */
export async function GET() {
  try {
    // Get counts from local database
    const totalPosts = await prisma.search_results.count({
      where: { late_post_id: { not: null } }
    });
    
    const scheduledPosts = await prisma.search_results.count({
      where: {
        late_scheduled_for: { not: null },
        late_published_at: null
      }
    });
    
    const publishedPosts = await prisma.search_results.count({
      where: { late_published_at: { not: null } }
    });
    
    return NextResponse.json({
      totalPostsWithLateId: totalPosts,
      scheduledPosts,
      publishedPosts,
      message: "Sync status retrieved"
    });
  } catch (error) {
    console.error("Failed to get sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}
