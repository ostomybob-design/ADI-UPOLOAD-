import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/fix-http-urls
 * Converts all HTTP image URLs to HTTPS in the database
 */
export async function POST() {
  try {
    console.log('🔍 Finding posts with HTTP image URLs...');

    // Find all posts with HTTP URLs
    const postsWithHttp = await prisma.search_results.findMany({
      where: {
        main_image_url: {
          startsWith: 'http://'
        }
      },
      select: {
        id: true,
        main_image_url: true,
      }
    });

    console.log(`Found ${postsWithHttp.length} posts with HTTP URLs`);

    if (postsWithHttp.length === 0) {
      return NextResponse.json({
        message: 'No posts to update',
        updated: 0,
        failed: 0
      });
    }

    let updated = 0;
    let failed = 0;
    const results = [];

    for (const post of postsWithHttp) {
      try {
        const oldUrl = post.main_image_url;
        const newUrl = oldUrl?.replace('http://', 'https://') || null;

        await prisma.search_results.update({
          where: { id: post.id },
          data: { main_image_url: newUrl }
        });

        results.push({
          id: post.id,
          oldUrl,
          newUrl,
          status: 'success'
        });
        updated++;
      } catch (error) {
        results.push({
          id: post.id,
          oldUrl: post.main_image_url,
          error: (error as Error).message,
          status: 'failed'
        });
        failed++;
      }
    }

    return NextResponse.json({
      message: `Updated ${updated} posts, ${failed} failed`,
      updated,
      failed,
      results
    });
  } catch (error) {
    console.error('Error fixing HTTP URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fix HTTP URLs', details: (error as Error).message },
      { status: 500 }
    );
  }
}
