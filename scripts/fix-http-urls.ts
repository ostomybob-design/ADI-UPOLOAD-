/**
 * Script to fix HTTP image URLs to HTTPS in the database
 * Run with: npx tsx scripts/fix-http-urls.ts
 */

import { prisma } from '../lib/db';

async function fixHttpUrls() {
  console.log('🔍 Finding posts with HTTP image URLs...\n');

  // Find all posts with HTTP URLs
  const postsWithHttp = await prisma.search_results.findMany({
    where: {
      main_image_url: {
        startsWith: 'http://'
      }
    },
    select: {
      id: true,
      main_image_url: true,
    }
  });

  console.log(`Found ${postsWithHttp.length} posts with HTTP URLs\n`);

  if (postsWithHttp.length === 0) {
    console.log('✅ No posts to update!');
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const post of postsWithHttp) {
    try {
      const oldUrl = post.main_image_url;
      const newUrl = oldUrl?.replace('http://', 'https://') || null;

      await prisma.search_results.update({
        where: { id: post.id },
        data: { main_image_url: newUrl }
      });

      console.log(`✅ Post ${post.id}: ${oldUrl} → ${newUrl}`);
      updated++;
    } catch (error) {
      console.error(`❌ Failed to update post ${post.id}:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));
}

fixHttpUrls()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
