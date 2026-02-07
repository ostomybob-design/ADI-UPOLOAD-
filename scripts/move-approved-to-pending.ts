import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function moveApprovedToReadyToPost() {
  console.log('🔄 Moving all approved posts back to "Ready to Post" (pending)...\n');
  
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

    console.log(`📊 Found ${approvedPosts.length} approved posts\n`);

    if (approvedPosts.length === 0) {
      console.log('✅ No approved posts to move. Done!');
      await prisma.$disconnect();
      return;
    }

    // Show some examples
    console.log('📋 Sample posts that will be moved:');
    approvedPosts.slice(0, 5).forEach((post, i) => {
      console.log(`  ${i + 1}. [ID: ${post.id}] ${post.title.substring(0, 60)}...`);
      if (post.late_post_id) {
        console.log(`     ⚠️  WARNING: Has Late.dev ID - already scheduled!`);
      }
    });

    // Count how many have late_post_id (already scheduled)
    const scheduledCount = approvedPosts.filter(p => p.late_post_id).length;
    if (scheduledCount > 0) {
      console.log(`\n⚠️  WARNING: ${scheduledCount} posts have Late.dev IDs (already scheduled to social media)`);
      console.log('   Moving these back to pending will NOT unschedule them from Late.dev');
      console.log('   They will still publish on their scheduled time\n');
    }

    // Ask for confirmation
    console.log('\n❓ Do you want to proceed? (y/n)');
    
    // Wait for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Type "yes" to continue: ', async (answer: string) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled. No posts were moved.');
        readline.close();
        await prisma.$disconnect();
        return;
      }

      readline.close();

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

      console.log(`\n✅ Successfully moved ${result.count} posts from "Approved" to "Ready to Post" (pending)`);
      console.log('\n📍 Posts are now in the "Ready to Post" tab in your dashboard');
      
      if (scheduledCount > 0) {
        console.log(`\n⚠️  REMINDER: ${scheduledCount} posts are still scheduled in Late.dev`);
        console.log('   Check Late.dev queue if you want to unschedule them');
      }

      await prisma.$disconnect();
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
moveApprovedToReadyToPost();
