import { NextResponse } from "next/server";
import { lateAPI } from "@/lib/late-api";

/**
 * POST /api/late/posts
 * Create a post via Late API
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("📤 Creating Late.dev post with data:", JSON.stringify(body, null, 2));
    
    const result = await lateAPI.createPost(body);
    
    console.log("✅ Late.dev API returned:", JSON.stringify(result, null, 2));
    console.log("🔍 Result type:", typeof result);
    console.log("🔍 Result keys:", Object.keys(result));
    
    // Late.dev wraps the response in a 'post' property
    // Return the post object directly for easier access
    const postData = (result as any).post || result;
    console.log("� Returning post data:", postData);
    
    return NextResponse.json(postData, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating post via Late API:", error);
    console.error("❌ Error details:", (error as Error).message);
    return NextResponse.json(
      { 
        message: "Failed to create post via Late API", 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/late/posts
 * Get all posts from Late API with optional filters
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params: any = {};
    if (searchParams.get("page")) params.page = parseInt(searchParams.get("page")!);
    if (searchParams.get("limit")) params.limit = parseInt(searchParams.get("limit")!);
    if (searchParams.get("status")) params.status = searchParams.get("status");
    if (searchParams.get("platform")) params.platform = searchParams.get("platform");
    if (searchParams.get("profileId")) params.profileId = searchParams.get("profileId");
    
    const posts = await lateAPI.getPosts(params);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts from Late API:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch posts from Late API", 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
