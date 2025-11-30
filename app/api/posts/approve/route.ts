import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postIds, approvedBy, autoSchedule = true } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "Post IDs are required" },
        { status: 400 }
      );
    }

    // Update posts to approved status
    const updatedPosts = await prisma.search_results.updateMany({
      where: {
        id: { in: postIds },
        approval_status: "pending"
      },
      data: {
        approval_status: "approved",
        approved_at: new Date(),
        approved_by: approvedBy || "admin",
        updated_at: new Date()
      }
    });

    // Get approved posts with full data
    const approvedPosts = await prisma.search_results.findMany({
      where: { id: { in: postIds } },
      orderBy: { created_at: "asc" }
    });

    // Auto-schedule to Late.dev queue if enabled
    const scheduledPosts: any[] = [];
    const schedulingErrors: string[] = [];
    
    if (autoSchedule) {
      try {
        // Get connected accounts to determine profile
        const accounts = await lateAPI.getAccounts();
        
        if (accounts.length === 0) {
          console.warn("No connected accounts found in Late.dev");
          schedulingErrors.push("No connected accounts found. Please connect accounts in Late.dev.");
        } else {
          const profileId = accounts[0].profileId;
          console.log(`Using profile ID: ${profileId} for scheduling`);

          // Check if queue exists first
          let queueExists = false;
          try {
            const queueInfo = await lateAPI.getQueueSlots(profileId);
            queueExists = queueInfo.exists && queueInfo.schedule?.active;
            console.log(`Queue exists and active: ${queueExists}`);
          } catch (queueCheckError) {
            console.warn("Could not check queue status:", queueCheckError);
          }

          if (!queueExists) {
            schedulingErrors.push(
              "Queue not configured or inactive. Please set up your queue at https://getlate.dev/queue"
            );
          } else {
            // Schedule each approved post to queue
            for (const post of approvedPosts) {
              try {
                console.log(`Attempting to schedule post ${post.id}...`);
                
                // Get next queue slot
                const queueSlot = await lateAPI.getNextQueueSlot(profileId);
                console.log(`Next queue slot: ${queueSlot.nextSlot}`);

              // Prepare content
              const hashtags = Array.isArray(post.ai_hashtags)
                ? (post.ai_hashtags as string[]).map((tag) => `#${tag}`).join(" ")
                : "";
              const fullContent = hashtags
                ? `${post.ai_caption}\n\n${hashtags}`
                : post.ai_caption || "";

              // Prepare platforms (use all available accounts)
              const platforms = accounts.map((acc) => ({
                platform: acc.platform as "instagram" | "facebook" | "linkedin" | "twitter" | "threads" | "tiktok" | "youtube" | "pinterest" | "reddit" | "bluesky",
                accountId: acc.id || acc._id,
                platformSpecificData:
                  acc.platform === "instagram"
                    ? { contentType: "post" as const }
                    : undefined,
              }));

              // Prepare media items
              const mediaItems: any[] = [];
              if (post.main_image_url) {
                // Validate URL format
                const isValidUrl = post.main_image_url.startsWith('http://') || 
                                  post.main_image_url.startsWith('https://');
                
                if (isValidUrl) {
                  mediaItems.push({
                    type: "image",
                    url: post.main_image_url,
                  });
                  console.log(`Using media URL: ${post.main_image_url}`);
                } else {
                  console.warn(`Invalid media URL format: ${post.main_image_url}`);
                  // Skip media if URL is invalid (e.g., base64)
                }
              }

              // Create post via Late API
              const postData = {
                content: fullContent,
                platforms,
                mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
                scheduledFor: queueSlot.nextSlot,
                timezone: queueSlot.timezone,
                queuedFromProfile: profileId,
              };
              
              console.log("Creating Late.dev post with data:", JSON.stringify(postData, null, 2));
              
              const latePost = await lateAPI.createPost(postData);

              // Update local post with Late info
              await prisma.search_results.update({
                where: { id: post.id },
                data: {
                  late_post_id: latePost.id,
                  late_status: latePost.status,
                  late_scheduled_for: new Date(queueSlot.nextSlot),
                  late_platforms: platforms.map(p => ({ platform: p.platform })),
                },
              });

              scheduledPosts.push({
                postId: post.id,
                latePostId: latePost.id,
                scheduledFor: queueSlot.nextSlot,
              });
              } catch (scheduleError: any) {
                const errorMsg = scheduleError.message || String(scheduleError);
                console.error(`Failed to schedule post ${post.id}:`, errorMsg);
                schedulingErrors.push(`Post ${post.id}: ${errorMsg}`);
                // Continue with other posts even if one fails
              }
            }
          }
        }
      } catch (queueError: any) {
        const errorMsg = queueError.message || String(queueError);
        console.error("Queue scheduling error:", errorMsg);
        schedulingErrors.push(`Queue error: ${errorMsg}`);
        // Don't fail the approval if scheduling fails
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedPosts.count,
      scheduledCount: scheduledPosts.length,
      scheduledPosts,
      schedulingErrors: schedulingErrors.length > 0 ? schedulingErrors : undefined,
      message: `${updatedPosts.count} posts approved${
        scheduledPosts.length > 0
          ? ` and ${scheduledPosts.length} scheduled to queue`
          : schedulingErrors.length > 0
          ? " (scheduling failed - see errors)"
          : " and added to buffer"
      }`,
    });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve posts" },
      { status: 500 }
    );
  }
}
