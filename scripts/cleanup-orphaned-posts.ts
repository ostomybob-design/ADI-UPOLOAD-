/**
 * Cleanup script for orphaned posts
 * Run this to clean up posts with invalid late_post_id values
 * 
 * Usage: npx tsx scripts/cleanup-orphaned-posts.ts
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOrphanedPosts() {
  try {
    console.log('🔍 Searching for orphaned posts...')
    
    // Find posts with invalid late_post_id
    const orphanedPosts = await prisma.search_results.findMany({
      where: {
        late_post_id: { not: null },
        OR: [
          { late_post_id: "" },
          { late_post_id: "undefined" },
        ]
      },
      select: { 
        id: true, 
        late_post_id: true,
        title: true 
      }
    })
    
    console.log(`📋 Found ${orphanedPosts.length} orphaned posts`)
    
    if (orphanedPosts.length === 0) {
      console.log('✅ No orphaned posts found!')
      return
    }
    
    // Show sample of orphaned posts
    console.log('\n📝 Sample orphaned posts:')
    orphanedPosts.slice(0, 5).forEach(post => {
      console.log(`  - ID ${post.id}: "${post.title.substring(0, 50)}..." (late_post_id: ${post.late_post_id})`)
    })
    
    // Clean up orphaned posts
    console.log('\n🧹 Cleaning up orphaned posts...')
    const result = await prisma.search_results.updateMany({
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
    })
    
    console.log(`✅ Cleaned up ${result.count} orphaned posts`)
    console.log('\n🎉 Cleanup complete!')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOrphanedPosts()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
