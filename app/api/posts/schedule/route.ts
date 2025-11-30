import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const LATE_API_KEY = process.env.LATE_API_KEY
const LATE_API_URL = "https://getlate.dev/api/v1"

export async function POST(request: NextRequest) {
  try {
    if (!LATE_API_KEY) {
      return NextResponse.json(
        { error: "Late.dev API key not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { postId, scheduledFor, profileId } = body

    if (!postId || !scheduledFor || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields: postId, scheduledFor, profileId" },
        { status: 400 }
      )
    }

    // Fetch the post from database
    const post = await prisma.search_results.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.approval_status !== "approved") {
      return NextResponse.json(
        { error: "Post must be approved before scheduling" },
        { status: 400 }
      )
    }

    // Get accounts for the profile
    const accountsResponse = await fetch(
      `${LATE_API_URL}/accounts?profileId=${profileId}`,
      {
        headers: {
          Authorization: `Bearer ${LATE_API_KEY}`,
        },
      }
    )

    if (!accountsResponse.ok) {
      throw new Error("Failed to fetch accounts")
    }

    const accountsData = await accountsResponse.json()
    const accounts = accountsData.accounts || []

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "No social media accounts connected to this profile" },
        { status: 400 }
      )
    }

    // Prepare platforms array
    const platforms = accounts
      .filter((acc: any) => acc.isActive)
      .map((acc: any) => ({
        platform: acc.platform,
        accountId: acc._id,
      }))

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: "No active social media accounts found" },
        { status: 400 }
      )
    }

    // Prepare caption with hashtags
    let caption = post.ai_caption || ""
    if (post.ai_hashtags) {
      const hashtags = Array.isArray(post.ai_hashtags)
        ? post.ai_hashtags
        : typeof post.ai_hashtags === "string"
        ? post.ai_hashtags.split(",").map((tag: string) => tag.trim())
        : []

      const formattedHashtags = hashtags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
        .join(" ")

      if (formattedHashtags) {
        caption = `${caption}\n\n${formattedHashtags}`
      }
    }

    // Prepare media items
    const mediaItems = []
    if (post.main_image_url) {
      mediaItems.push({
        type: "image",
        url: post.main_image_url,
      })
    }

    // Create post on Late.dev
    const latePostData: any = {
      content: caption,
      scheduledFor: scheduledFor,
      timezone: "UTC",
      platforms: platforms,
      queuedFromProfile: profileId,
    }

    if (mediaItems.length > 0) {
      latePostData.mediaItems = mediaItems
    }

    const lateResponse = await fetch(`${LATE_API_URL}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(latePostData),
    })

    if (!lateResponse.ok) {
      const errorData = await lateResponse.json()
      throw new Error(errorData.error || "Failed to schedule post on Late.dev")
    }

    const latePost = await lateResponse.json()
    const latePostId = latePost.post?.id || latePost.post?._id || latePost.id || latePost._id

    // Update database with Late.dev info
    await prisma.search_results.update({
      where: { id: postId },
      data: {
        late_post_id: latePostId,
        late_scheduled_for: new Date(scheduledFor),
        late_platforms: platforms,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      latePostId,
      scheduledFor,
      platforms,
    })
  } catch (error: any) {
    console.error("Failed to schedule post:", error)
    return NextResponse.json(
      { error: error.message || "Failed to schedule post" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
