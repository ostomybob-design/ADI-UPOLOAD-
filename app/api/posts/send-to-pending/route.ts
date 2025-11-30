import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Update post to pending status
    await prisma.search_results.update({
      where: { id: postId },
      data: {
        approval_status: "pending",
        approved_at: null,
        approved_by: null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Post sent back to pending"
    });
  } catch (error) {
    console.error("Send to pending error:", error);
    return NextResponse.json(
      { error: "Failed to send post to pending" },
      { status: 500 }
    );
  }
}
