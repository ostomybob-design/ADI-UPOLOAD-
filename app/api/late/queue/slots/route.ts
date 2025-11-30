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

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${LATE_API_URL}/queue/slots?profileId=${profileId}`,
      {
        headers: {
          Authorization: `Bearer ${LATE_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Queue not configured for this profile" },
          { status: 404 }
        )
      }
      throw new Error(`Late.dev API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch queue slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue slots" },
      { status: 500 }
    )
  }
}
