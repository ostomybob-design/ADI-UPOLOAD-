import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const LATE_API_KEY = process.env.LATE_API_KEY
const LATE_API_URL = "https://getlate.dev/api/v1"
const LATE_PROFILE_ID = process.env.LATE_PROFILE_ID

export async function POST(request: NextRequest) {
  try {
    if (!LATE_API_KEY) {
      return NextResponse.json(
        { error: "Late.dev API key not configured" },
        { status: 500 }
      )
    }

    if (!LATE_PROFILE_ID) {
      return NextResponse.json(
        { error: "Late.dev profile ID not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { postIds } = body

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "postIds array is required" },
        { status: 400 }
      )
    }

    // Fetch all posts from database
    const posts = await prisma.search_results.findMany({
      where: {
        id: { in: postIds },
        approval_status: "approved",
        late_post_id: null, // Only posts not yet scheduled
      },
    })

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "No eligible posts found (must be approved and not already scheduled)" },
        { status: 400 }
      )
    }

    // Get accounts for the profile
    const accountsResponse = await fetch(
      `${LATE_API_URL}/accounts?profileId=${LATE_PROFILE_ID}`,
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

    // Get next available slots
    const slotsResponse = await fetch(
      `${LATE_API_URL}/queue/preview?profileId=${LATE_PROFILE_ID}&count=${posts.length}`,
      {
        headers: {
          Authorization: `Bearer ${LATE_API_KEY}`,
        },
      }
    )

    if (!slotsResponse.ok) {
      throw new Error("Failed to fetch queue slots")
    }

    const slotsData = await slotsResponse.json()
    const availableSlots = slotsData.slots || []

    if (availableSlots.length < posts.length) {
      return NextResponse.json(
        { 
          error: `Not enough queue slots available. Need ${posts.length}, but only ${availableSlots.length} available.`,
          availableSlots: availableSlots.length,
          requestedPosts: posts.length
        },
        { status: 400 }
      )
    }

    // Schedule each post to the next available slot
    const results = []
    const errors = []

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const scheduledFor = availableSlots[i]

      try {
        // Prepare caption with hashtags
        let caption = post.ai_caption || ""
        if (post.ai_hashtags) {
          const hashtags = Array.isArray(post.ai_hashtags)
            ? post.ai_hashtags
            : typeof post.ai_hashtags === "string"
            ? JSON.parse(post.ai_hashtags)
            : []

          const formattedHashtags = hashtags
            .map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))
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
          queuedFromProfile: LATE_PROFILE_ID,
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
          where: { id: post.id },
          data: {
            late_post_id: latePostId,
            late_scheduled_for: new Date(scheduledFor),
            late_platforms: platforms,
            updated_at: new Date(),
          },
        })

        results.push({
          postId: post.id,
          latePostId,
          scheduledFor,
          title: post.title.substring(0, 50),
        })
      } catch (error: any) {
        console.error(`Failed to schedule post ${post.id}:`, error)
        errors.push(`Post "${post.title.substring(0, 50)}...": ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      scheduled: results.length,
      failed: errors.length,
      total: posts.length,
      results,
      errors,
    })
  } catch (error: any) {
    console.error("Bulk schedule error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to bulk schedule posts" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
