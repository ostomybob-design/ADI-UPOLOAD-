import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email-notifications";

// GET - Fetch all away days and check post availability
export async function GET() {
  try {
    const awayDays = await prisma.away_mode.findMany({
      where: {
        away_date: {
          gte: new Date() // Only future days
        }
      },
      orderBy: {
        away_date: 'asc'
      }
    });

    // Count available posts
    const approvedCount = await prisma.search_results.count({
      where: {
        approval_status: "approved",
        late_post_id: null // Not yet scheduled
      }
    });

    const pendingCount = await prisma.search_results.count({
      where: {
        approval_status: "pending"
      }
    });

    return NextResponse.json({
      awayDays,
      stats: {
        approvedPosts: approvedCount,
        pendingPosts: pendingCount
      }
    });
  } catch (error) {
    console.error("Error fetching away days:", error);
    return NextResponse.json(
      { error: "Failed to fetch away days" },
      { status: 500 }
    );
  }
}

// POST - Set away days
export async function POST(request: Request) {
  try {
    const { awayDates } = await request.json();

    if (!Array.isArray(awayDates)) {
      return NextResponse.json(
        { error: "awayDates must be an array" },
        { status: 400 }
      );
    }

    // Delete all existing away days first
    await prisma.away_mode.deleteMany({});

    // Insert new away days
    if (awayDates.length > 0) {
      await prisma.away_mode.createMany({
        data: awayDates.map(date => ({
          away_date: new Date(date)
        })),
        skipDuplicates: true
      });

      // Check if there are enough posts available
      const approvedCount = await prisma.search_results.count({
        where: {
          approval_status: "approved",
          late_post_id: null
        }
      });

      const pendingCount = await prisma.search_results.count({
        where: {
          approval_status: "pending"
        }
      });

      const totalAvailable = approvedCount + pendingCount;
      
      // Send notification if insufficient posts (assume 1 post per day minimum)
      if (totalAvailable < awayDates.length) {
        await sendNotificationEmail({
          type: 'insufficient-posts',
          data: {
            awayDaysCount: awayDates.length,
            approvedCount,
            pendingCount
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: awayDates.length
    });
  } catch (error) {
    console.error("Error saving away days:", error);
    return NextResponse.json(
      { error: "Failed to save away days" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all away days
export async function DELETE() {
  try {
    await prisma.away_mode.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: "All away days cleared"
    });
  } catch (error) {
    console.error("Error clearing away days:", error);
    return NextResponse.json(
      { error: "Failed to clear away days" },
      { status: 500 }
    );
  }
}
