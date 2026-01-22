/**
 * Sync Late.dev post IDs to database
 * This script finds posts in the database that are missing late_post_id
 * and matches them with Late.dev posts by content/date to update the ID
 */

import { prisma } from "../lib/db";
import { lateAPI } from "../lib/late-api";

async function syncLatePostIds() {
  console.log("🔄 Starting Late.dev post ID sync...\n");

  try {
    // Get all posts from database that might be scheduled but missing late_post_id
    const dbPosts = await prisma.search_results.findMany({
      where: {
        OR: [
          { late_post_id: null },
          { late_post_id: "" }
        ],
        approval_status: "approved"
      }
    });

    console.log(`📊 Found ${dbPosts.length} database posts without late_post_id\n`);

    // Get all scheduled posts from Late.dev
    const latePosts = await lateAPI.getPosts({ status: "scheduled" });
    console.log(`📊 Found ${latePosts.length} scheduled posts in Late.dev\n`);

    let updatedCount = 0;

    for (const dbPost of dbPosts) {
      // Try to find matching Late.dev post by content (first 100 chars)
      const contentSnippet = dbPost.ai_caption?.substring(0, 100);
      
      if (!contentSnippet) continue;

      const matchingLatePost = latePosts.find((latePost: any) => {
        const latePostObj = (latePost as any).post || latePost;
        const lateContent = latePostObj.content?.substring(0, 100);
        return lateContent === contentSnippet;
      });

      if (matchingLatePost) {
        const latePostObj = (matchingLatePost as any).post || matchingLatePost;
        const latePostId = (latePostObj as any)._id || latePostObj.id;

        console.log(`✅ Match found for post ${dbPost.id}:`);
        console.log(`   Late.dev ID: ${latePostId}`);
        console.log(`   Content: ${contentSnippet.substring(0, 50)}...`);

        // Update database with late_post_id
        await prisma.search_results.update({
          where: { id: dbPost.id },
          data: {
            late_post_id: latePostId,
            late_status: latePostObj.status,
            late_scheduled_for: latePostObj.scheduledFor ? new Date(latePostObj.scheduledFor) : null,
          }
        });

        updatedCount++;
        console.log(`   ✓ Updated in database\n`);
      }
    }

    console.log(`\n🎉 Sync complete! Updated ${updatedCount} posts with Late.dev IDs`);

  } catch (error) {
    console.error("❌ Error syncing post IDs:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncLatePostIds()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
