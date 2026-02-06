import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function analyzeAutoApprovedPosts() {
  console.log("🔍 Analyzing Auto-Approved Posts\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Get all approved posts
  const approvedPosts = await prisma.search_results.findMany({
    where: {
      approval_status: "approved"
    },
    orderBy: {
      created_at: 'desc'
    },
    select: {
      id: true,
      title: true,
      approval_status: true,
      approved_by: true,
      approved_at: true,
      created_at: true,
      late_post_id: true,
      raw_data: true,
      search_query: true,
    }
  });

  console.log(`\n📊 Total Approved Posts: ${approvedPosts.length}\n`);

  // Categorize posts
  const categories = {
    manuallyApproved: [] as any[],
    autoApprovedUser: [] as any[],
    autoApprovedAdmin: [] as any[],
    lateDevImport: [] as any[],
    suspiciousNoApprover: [] as any[],
  };

  for (const post of approvedPosts) {
    // Check if approved by a specific user
    if (post.approved_by === "user") {
      categories.autoApprovedUser.push(post);
    } else if (post.approved_by === "admin") {
      categories.autoApprovedAdmin.push(post);
    } else if (post.search_query === "late-dev-import") {
      categories.lateDevImport.push(post);
    } else if (!post.approved_by) {
      categories.suspiciousNoApprover.push(post);
    } else {
      categories.manuallyApproved.push(post);
    }
  }

  // Print analysis
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 BREAKDOWN BY APPROVAL TYPE\n");
  
  console.log(`✅ Manually Approved: ${categories.manuallyApproved.length}`);
  console.log(`🤖 Auto-Approved (user): ${categories.autoApprovedUser.length}`);
  console.log(`👤 Auto-Approved (admin): ${categories.autoApprovedAdmin.length}`);
  console.log(`📥 Late.dev Import: ${categories.lateDevImport.length}`);
  console.log(`⚠️  NO APPROVER (suspicious): ${categories.suspiciousNoApprover.length}\n`);

  // Show suspicious posts
  if (categories.suspiciousNoApprover.length > 0) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  POSTS WITH NO APPROVER (Likely Auto-Approved)\n");
    categories.suspiciousNoApprover.slice(0, 10).forEach((post) => {
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title.substring(0, 60)}...`);
      console.log(`Created: ${post.created_at}`);
      console.log(`Approved: ${post.approved_at || 'N/A'}`);
      console.log(`Search Query: ${post.search_query || 'N/A'}`);
      console.log(`Late Post ID: ${post.late_post_id || 'N/A'}`);
      console.log(`Raw Data Keys: ${post.raw_data ? Object.keys(post.raw_data as any).join(', ') : 'None'}`);
      console.log('---');
    });
  }

  // Show auto-approved by "user" posts
  if (categories.autoApprovedUser.length > 0) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🤖 AUTO-APPROVED POSTS (approved_by = 'user')\n");
    console.log("These were likely approved when scheduling to Late.dev\n");
    categories.autoApprovedUser.slice(0, 5).forEach((post) => {
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title.substring(0, 60)}...`);
      console.log(`Created: ${post.created_at}`);
      console.log(`Approved: ${post.approved_at}`);
      console.log(`Late Post ID: ${post.late_post_id || 'N/A'}`);
      console.log('---');
    });
  }

  // Check for recent patterns
  const recentPosts = approvedPosts.filter(p => {
    const daysSinceCreated = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 7;
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📅 POSTS APPROVED IN LAST 7 DAYS: ${recentPosts.length}\n`);
  
  if (recentPosts.length > 0) {
    const recentByApprover = recentPosts.reduce((acc, post) => {
      const key = post.approved_by || 'NO_APPROVER';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(recentByApprover).forEach(([approver, count]) => {
      console.log(`  ${approver}: ${count} posts`);
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💡 RECOMMENDATIONS:\n");
  console.log("1. Check your Vercel deployment logs for POST /api/posts requests");
  console.log("2. Look for the User-Agent and Origin in the logs above");
  console.log("3. Posts with approved_by='user' are from Late.dev scheduling");
  console.log("4. Posts with NO APPROVER might be from an external bot");
  console.log("\n🔗 Vercel Logs: https://vercel.com/ostomybob-design/projects");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await prisma.$disconnect();
}

analyzeAutoApprovedPosts().catch(console.error);
