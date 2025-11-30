import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { content, scheduledFor } = body;

    if (!content && !scheduledFor) {
      return NextResponse.json(
        { error: "Content or scheduledFor is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LATE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Late.dev API key not configured" },
        { status: 500 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (content) {
      updateData.content = content;
    }
    if (scheduledFor) {
      updateData.scheduledFor = scheduledFor;
    }

    console.log(`Updating Late.dev post ${postId} with:`, updateData);

    // Update the post on Late.dev
    const response = await fetch(
      `https://getlate.dev/api/v1/posts/${postId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Late.dev API error:", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || "Failed to update post on Late.dev");
    }

    const updatedPost = await response.json();
    console.log("Late.dev post updated successfully:", updatedPost);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating Late.dev post:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update post",
      },
      { status: 500 }
    );
  }
}
