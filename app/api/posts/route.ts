import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureHttps } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const {
      imageVideo,
      caption,
      hashtags,
      schedulePost,
      scheduledDate,
      postOnInstagram,
      postOnFacebook,
      latePostId,
      lateStatus,
      rawData,
    } = await req.json();

    // imageVideo should be a Supabase storage URL (uploaded via /api/upload before calling this endpoint)
    // Convert HTTP to HTTPS to avoid mixed content warnings
    let main_image_url = ensureHttps(imageVideo);
    
    // Validate that it's a proper URL, not a data URL
    if (main_image_url && !main_image_url.startsWith('http://') && !main_image_url.startsWith('https://')) {
      return NextResponse.json(
        { message: "Invalid image URL. Image must be uploaded to Supabase first." },
        { status: 400 }
      );
    }

    // Convert hashtags string to a JSON array
    const hashtagsArray = hashtags
      .split("#")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const postData: any = {
      title: caption.substring(0, 500), // Use caption as title, truncate if too long
      url: `https://example.com/post/${Date.now()}`, // Placeholder URL
      snippet: caption.substring(0, 250), // Use caption as snippet, truncate if too long
      ai_caption: caption,
      ai_hashtags: hashtagsArray,
      main_image_url: main_image_url,
      posted_on_instagram: postOnInstagram,
      posted_on_facebook: postOnFacebook,
      content_processed: true, // Assuming content is processed upon creation
      raw_data: rawData || {},
    };

    // Add Late API tracking fields if provided
    if (latePostId) {
      postData.late_post_id = latePostId;
    }
    if (lateStatus) {
      postData.late_status = lateStatus;
    }

    if (schedulePost && scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate);
      postData.scheduled_for = scheduledDateTime;
      
      if (postOnInstagram) {
        postData.instagram_posted_at = scheduledDateTime;
      }
      if (postOnFacebook) {
        postData.facebook_posted_at = scheduledDateTime;
      }
    } else {
      // If not scheduled, post now
      if (postOnInstagram) {
        postData.instagram_posted_at = new Date();
      }
      if (postOnFacebook) {
        postData.facebook_posted_at = new Date();
      }
    }

    const newPost = await prisma.search_results.create({
      data: postData,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Error creating post", error: (error as Error).message },
      { status: 500 }
    );
  }
}
