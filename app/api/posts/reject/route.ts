import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, reason } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await prisma.search_results.update({
      where: { id: postId },
      data: {
        approval_status: "rejected",
        rejection_reason: reason || "No reason provided",
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject post" },
      { status: 500 }
    );
  }
}
