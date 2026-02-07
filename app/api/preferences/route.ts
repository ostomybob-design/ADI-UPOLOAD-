import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Preference key is required" },
        { status: 400 }
      );
    }

    const preference = await prisma.user_preferences.findUnique({
      where: { preference_key: key },
    });

    if (!preference) {
      // Return empty object if preference doesn't exist yet
      return NextResponse.json({ value: {} });
    }

    return NextResponse.json({ value: preference.preference_value });
  } catch (error) {
    console.error("Error fetching preference:", error);
    return NextResponse.json(
      { error: "Failed to fetch preference" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const preference = await prisma.user_preferences.upsert({
      where: { preference_key: key },
      update: {
        preference_value: value,
        description: description,
        updated_at: new Date(),
      },
      create: {
        preference_key: key,
        preference_value: value,
        description: description,
      },
    });

    return NextResponse.json({ success: true, preference });
  } catch (error) {
    console.error("Error saving preference:", error);
    return NextResponse.json(
      { error: "Failed to save preference" },
      { status: 500 }
    );
  }
}
