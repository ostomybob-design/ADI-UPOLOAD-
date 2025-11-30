import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return the Late.dev configuration
    // In a real app, this would come from a database or environment variables
    const profileId = process.env.LATE_PROFILE_ID

    if (!profileId) {
      return NextResponse.json(
        { error: "Late.dev profile ID not configured" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profileId,
      apiKey: process.env.LATE_API_KEY ? "configured" : "missing"
    })
  } catch (error) {
    console.error("Failed to get Late.dev config:", error)
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    )
  }
}
