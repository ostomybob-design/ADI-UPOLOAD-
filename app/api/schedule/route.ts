import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lateAPI } from "@/lib/late-api";

export async function GET() {
  try {
    // Get Late.dev config from database
    const lateConfig = await prisma.late_config.findFirst({
      orderBy: { created_at: "desc" }
    });

    if (!lateConfig) {
      // Return default schedule structure for compatibility
      return NextResponse.json({
        posts_per_day: 3,
        posting_times: ["09:00", "13:00", "18:00"],
        timezone: "UTC",
        instagram_enabled: true,
        facebook_enabled: true,
        buffer_size: 7,
        auto_approve_enabled: false,
        queue_enabled: false
      });
    }

    // Parse queue slots if available
    const queueSlots = lateConfig.queue_slots as any;
    const posting_times = Array.isArray(queueSlots) 
      ? queueSlots.map((slot: any) => slot.time)
      : ["09:00", "13:00", "18:00"];

    return NextResponse.json({
      posts_per_day: posting_times.length,
      posting_times,
      timezone: lateConfig.queue_timezone || "UTC",
      instagram_enabled: !!lateConfig.instagram_account_id,
      facebook_enabled: !!lateConfig.facebook_account_id,
      buffer_size: 7,
      auto_approve_enabled: false,
      queue_enabled: lateConfig.queue_enabled,
      profile_id: lateConfig.profile_id,
      profile_name: lateConfig.profile_name
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      posts_per_day,
      posting_times,
      timezone,
      profile_id
    } = body;

    // Validate posting times
    if (!Array.isArray(posting_times) || posting_times.length !== posts_per_day) {
      return NextResponse.json(
        { error: "Posting times must match posts per day" },
        { status: 400 }
      );
    }

    // Get Late.dev config
    const lateConfig = await prisma.late_config.findFirst();

    if (!lateConfig || !lateConfig.profile_id) {
      return NextResponse.json(
        { error: "Late.dev profile not configured. Please connect accounts first." },
        { status: 400 }
      );
    }

    // Convert posting times to queue slots format
    // Distribute across all days of the week
    const queueSlots = [];
    for (let day = 0; day < 7; day++) {
      for (const time of posting_times) {
        queueSlots.push({
          dayOfWeek: day,
          time: time
        });
      }
    }

    // Update queue via Late.dev API
    try {
      await lateAPI.updateQueueSlots({
        profileId: lateConfig.profile_id,
        timezone: timezone || "UTC",
        slots: queueSlots,
        active: true,
        reshuffleExisting: false
      });

      // Update local config
      await prisma.late_config.update({
        where: { id: lateConfig.id },
        data: {
          queue_enabled: true,
          queue_timezone: timezone || "UTC",
          queue_slots: queueSlots,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        posts_per_day,
        posting_times,
        timezone: timezone || "UTC",
        queue_enabled: true,
        profile_id: lateConfig.profile_id
      });
    } catch (apiError: any) {
      console.error("Late.dev API error:", apiError);
      return NextResponse.json(
        { error: `Failed to update queue: ${apiError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Schedule update error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
