/**
 * Diagnostic script for sync issues
 * Checks for posts that might cause sync loops
 * 
 * Usage: npx tsx scripts/diagnose-sync-issues.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnoseSyncIssues() {
  try {
    console.log('🔍 Diagnosing sync issues...\n')
    
    // 1. Check for posts with late_post_id
    const postsWithLateId = await prisma.search_results.findMany({
      where: {
        late_post_id: { not: null }
      },
      select: {
        id: true,
        late_post_id: true,
        title: true,
        late_status: true,
        late_scheduled_for: true,
        late_published_at: true
      }
    })
    
    console.log(`📊 Posts with late_post_id: ${postsWithLateId.length}`)
    
    // 2. Check for duplicate late_post_id
    const latePostIdCounts = new Map<string, number>()
    postsWithLateId.forEach(post => {
      if (post.late_post_id) {
        latePostIdCounts.set(
          post.late_post_id, 
          (latePostIdCounts.get(post.late_post_id) || 0) + 1
        )
      }
    })
    
    const duplicates = Array.from(latePostIdCounts.entries())
      .filter(([_, count]) => count > 1)
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate late_post_id values:`)
      duplicates.forEach(([latePostId, count]) => {
        console.log(`  - late_post_id "${latePostId}": ${count} posts`)
        const posts = postsWithLateId.filter(p => p.late_post_id === latePostId)
        posts.forEach(post => {
          console.log(`    • Post ID ${post.id}: "${post.title.substring(0, 50)}..."`)
        })
      })
    } else {
      console.log('✅ No duplicate late_post_id values found')
    }
    
    // 3. Check for invalid late_post_id values
    const invalidLatePostIds = postsWithLateId.filter(post => 
      !post.late_post_id || 
      post.late_post_id === '' || 
      post.late_post_id === 'undefined' ||
      post.late_post_id === 'null'
    )
    
    if (invalidLatePostIds.length > 0) {
      console.log(`\n⚠️  Found ${invalidLatePostIds.length} posts with invalid late_post_id:`)
      invalidLatePostIds.slice(0, 5).forEach(post => {
        console.log(`  - Post ID ${post.id}: late_post_id="${post.late_post_id}"`)
      })
    } else {
      console.log('✅ No invalid late_post_id values found')
    }
    
    // 4. Show status breakdown
    console.log('\n📊 Status breakdown:')
    const statusCounts = {
      scheduled: postsWithLateId.filter(p => p.late_status === 'scheduled').length,
      published: postsWithLateId.filter(p => p.late_status === 'published').length,
      draft: postsWithLateId.filter(p => p.late_status === 'draft').length,
      failed: postsWithLateId.filter(p => p.late_status === 'failed').length,
      other: postsWithLateId.filter(p => !['scheduled', 'published', 'draft', 'failed'].includes(p.late_status || '')).length
    }
    console.log(`  - Scheduled: ${statusCounts.scheduled}`)
    console.log(`  - Published: ${statusCounts.published}`)
    console.log(`  - Draft: ${statusCounts.draft}`)
    console.log(`  - Failed: ${statusCounts.failed}`)
    console.log(`  - Other/None: ${statusCounts.other}`)
    
    // 5. Show sample posts
    console.log('\n📝 Sample posts with late_post_id:')
    postsWithLateId.slice(0, 5).forEach(post => {
      console.log(`  - ID ${post.id}: "${post.title.substring(0, 50)}..."`)
      console.log(`    late_post_id: ${post.late_post_id}`)
      console.log(`    late_status: ${post.late_status || 'null'}`)
      console.log(`    scheduled_for: ${post.late_scheduled_for || 'null'}`)
      console.log(`    published_at: ${post.late_published_at || 'null'}`)
    })
    
    console.log('\n✅ Diagnosis complete!')
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseSyncIssues()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
