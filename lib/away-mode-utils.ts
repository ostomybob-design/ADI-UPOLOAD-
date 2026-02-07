import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email-notifications";

/**
 * Check if a date is an "away day" and auto-approve posts if needed
 * This is called just-in-time when scheduling posts to Late.dev
 */
export async function checkAndAutoApproveForAwayDay(scheduledDate: Date): Promise<{
  isAwayDay: boolean;
  autoApproved: boolean;
  autoApprovedCount: number;
}> {
  try {
    // Normalize date to just the day (ignore time)
    const dateOnly = new Date(scheduledDate);
    dateOnly.setHours(0, 0, 0, 0);

    // Check if this date is marked as an away day
    const awayDay = await prisma.away_mode.findFirst({
      where: {
        away_date: dateOnly
      }
    });

    if (!awayDay) {
      return { isAwayDay: false, autoApproved: false, autoApprovedCount: 0 };
    }

    console.log(`📅 Away day detected for ${dateOnly.toISOString().split('T')[0]}`);

    // Count how many approved posts are available (not yet scheduled)
    const approvedCount = await prisma.search_results.count({
      where: {
        approval_status: "approved",
        late_post_id: null
      }
    });

    // For simplicity, we'll assume we need at least 1 post
    // In production, you might check the Late.dev queue schedule
    const postsNeeded = Math.max(1 - approvedCount, 0);

    if (postsNeeded === 0) {
      console.log(`✅ Sufficient approved posts available (${approvedCount})`);
      return { isAwayDay: true, autoApproved: false, autoApprovedCount: 0 };
    }

    console.log(`⚠️  Need ${postsNeeded} more approved post(s). Auto-approving from pending...`);

    // Get oldest pending posts
    const pendingPosts = await prisma.search_results.findMany({
      where: {
        approval_status: "pending"
      },
      orderBy: {
        created_at: "asc"
      },
      take: postsNeeded,
      select: {
        id: true
      }
    });

    if (pendingPosts.length === 0) {
      console.log(`❌ No pending posts available to auto-approve`);
      return { isAwayDay: true, autoApproved: false, autoApprovedCount: 0 };
    }

    // Auto-approve the oldest pending posts
    const result = await prisma.search_results.updateMany({
      where: {
        id: { in: pendingPosts.map(p => p.id) }
      },
      data: {
        approval_status: "approved",
        approved_at: new Date(),
        approved_by: "away-mode-auto",
        updated_at: new Date()
      }
    });

    console.log(`✅ Auto-approved ${result.count} post(s) for away day`);

    // Send notification email about auto-approval
    await sendNotificationEmail({
      type: 'away-mode-auto-approval',
      data: {
        awayDate: dateOnly,
        count: result.count,
        scheduledFor: scheduledDate
      }
    });

    return { 
      isAwayDay: true, 
      autoApproved: true, 
      autoApprovedCount: result.count 
    };

  } catch (error) {
    console.error("Error in checkAndAutoApproveForAwayDay:", error);
    return { isAwayDay: false, autoApproved: false, autoApprovedCount: 0 };
  }
}
