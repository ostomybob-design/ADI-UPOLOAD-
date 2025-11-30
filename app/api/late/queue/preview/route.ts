import { NextRequest, NextResponse } from "next/server"

const LATE_API_KEY = process.env.LATE_API_KEY
const LATE_API_URL = "https://getlate.dev/api/v1"

export async function GET(request: NextRequest) {
  try {
    if (!LATE_API_KEY) {
      return NextResponse.json(
        { error: "Late.dev API key not configured" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")
    const count = searchParams.get("count") || "20"

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${LATE_API_URL}/queue/preview?profileId=${profileId}&count=${count}`,
      {
        headers: {
          Authorization: `Bearer ${LATE_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Late.dev API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch queue preview:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue preview" },
      { status: 500 }
    )
  }
}
