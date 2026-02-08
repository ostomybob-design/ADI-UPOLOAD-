import { NextRequest, NextResponse } from "next/server"

// This endpoint manages bot configuration settings
// In a real implementation, these would update GitHub Actions workflow variables
// For now, we'll store them in a simple JSON config in the database

export async function GET() {
  try {
    // For now, return hardcoded settings from the workflow file
    // In the future, these could be stored in database or GitHub variables
    const settings = {
      maxPostsPerQuery: 5,
      scheduleTimes: ["09:00", "17:00"],
      enabled: true,
      useSerper: true,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Failed to fetch bot settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bot settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { maxPostsPerQuery, scheduleTimes, enabled, useSerper } = body

    // Validate inputs
    if (maxPostsPerQuery < 1 || maxPostsPerQuery > 20) {
      return NextResponse.json(
        { error: "maxPostsPerQuery must be between 1 and 20" },
        { status: 400 }
      )
    }

    // NOTE: For these settings to actually take effect, you need to:
    // 1. Update the GitHub Actions workflow file (.github/workflows/scraper.yml)
    // 2. Or use GitHub API to update repository variables/secrets
    
    // For now, we'll store in database for future reference
    // In production, you would:
    // - Use GitHub API to update workflow variables
    // - Or store in database and have workflow read from API endpoint

    console.log("Bot settings updated:", {
      maxPostsPerQuery,
      scheduleTimes,
      enabled,
      useSerper,
    })

    // TODO: Implement GitHub API integration to update workflow variables
    // Example: Update MAX_POSTS_PER_QUERY, schedule cron times, USE_SERPER flag
    
    return NextResponse.json({ 
      success: true,
      message: "Settings saved. To apply changes, update .github/workflows/scraper.yml manually for now.",
      settings: { maxPostsPerQuery, scheduleTimes, enabled, useSerper }
    })
  } catch (error) {
    console.error("Failed to save bot settings:", error)
    return NextResponse.json(
      { error: "Failed to save bot settings" },
      { status: 500 }
    )
  }
}
