import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET a single post by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid post ID" },
        { status: 400 }
      );
    }

    const post = await prisma.search_results.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "Error fetching post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// UPDATE a post by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid post ID" },
        { status: 400 }
      );
    }

    const {
      imageVideo,
      caption,
      hashtags,
      schedulePost,
      scheduledDate,
      postOnInstagram,
      postOnFacebook,
    } = await req.json();

    // Convert hashtags string to a JSON array
    const hashtagsArray = hashtags
      .split("#")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const updateData: any = {
      title: caption.substring(0, 500),
      snippet: caption.substring(0, 250),
      ai_caption: caption,
      ai_hashtags: hashtagsArray,
      main_image_url: imageVideo,
      posted_on_instagram: postOnInstagram,
      posted_on_facebook: postOnFacebook,
      updated_at: new Date(),
    };

    if (schedulePost && scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate);
      if (postOnInstagram) {
        updateData.instagram_posted_at = scheduledDateTime;
      }
      if (postOnFacebook) {
        updateData.facebook_posted_at = scheduledDateTime;
      }
    } else {
      if (postOnInstagram) {
        updateData.instagram_posted_at = new Date();
      }
      if (postOnFacebook) {
        updateData.facebook_posted_at = new Date();
      }
    }

    const updatedPost = await prisma.search_results.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Error updating post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a post by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid post ID" },
        { status: 400 }
      );
    }

    await prisma.search_results.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post", error: (error as Error).message },
      { status: 500 }
    );
  }
}
