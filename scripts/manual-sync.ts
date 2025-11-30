/**
 * Manual sync script
 * Triggers a sync with Late.dev and shows detailed progress
 * 
 * Usage: npx tsx scripts/manual-sync.ts
 */

async function manualSync() {
  try {
    console.log('🔄 Starting manual sync with Late.dev...\n')
    
    const startTime = Date.now()
    
    const response = await fetch('http://localhost:3000/api/late/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ Sync failed (${response.status}):`, error)
      return
    }
    
    const result = await response.json()
    
    console.log('✅ Sync completed successfully!\n')
    console.log('📊 Results:')
    console.log(`  - Duration: ${duration}s`)
    console.log(`  - Posts synced: ${result.synced || 0}`)
    console.log(`  - Posts updated: ${result.updated || 0}`)
    console.log(`  - Posts created: ${result.created || 0}`)
    console.log(`  - Posts cleaned: ${result.cleaned || 0}`)
    
    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`)
      result.errors.forEach((error: string, i: number) => {
        console.log(`  ${i + 1}. ${error}`)
      })
    }
    
    console.log(`\n💬 ${result.message}`)
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the Next.js dev server is running on http://localhost:3000')
      console.error('   Run: npm run dev')
    }
  }
}

manualSync()
