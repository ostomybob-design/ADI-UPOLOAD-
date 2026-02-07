import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";
import { sendNotificationEmail } from "@/lib/email-notifications";

/**
 * Check if there are enough posts available for upcoming queue slots
 * Can be called manually or by a cron job
 */
export async function GET() {
  try {
    // Get approved posts count
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

    // If no approved posts, send notification
    if (approvedCount === 0) {
      try {
        // Get next queue slot info
        const accounts = await lateAPI.getAccounts();
        let nextSlot = null;
        
        if (accounts.length > 0) {
          const profileId = accounts[0].profileId;
          const queueInfo = await lateAPI.getNextQueueSlot(profileId);
          nextSlot = queueInfo.nextSlot;
        }

        await sendNotificationEmail({
          type: 'no-posts-available',
          data: {
            approvedCount,
            pendingCount,
            nextSlot
          }
        });

        return NextResponse.json({
          warning: true,
          message: "No approved posts available - notification sent",
          approvedCount,
          pendingCount,
          nextSlot
        });
      } catch (emailError) {
        console.error("Failed to send notification:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      approvedCount,
      pendingCount,
      message: approvedCount > 0 
        ? `${approvedCount} post(s) available` 
        : "No approved posts available"
    });

  } catch (error) {
    console.error("Error checking post availability:", error);
    return NextResponse.json(
      { error: "Failed to check post availability" },
      { status: 500 }
    );
  }
}
