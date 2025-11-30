import { NextResponse } from "next/server";
import { lateAPI } from "@/lib/late-api";

/**
 * GET /api/late/queue/next-slot
 * Get next available queue slot for a profile
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { message: "profileId is required" },
        { status: 400 }
      );
    }

    const result = await lateAPI.getNextQueueSlot(profileId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting next queue slot:", error);
    return NextResponse.json(
      {
        message: "Failed to get next queue slot",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
