import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const results = await prisma.search_results.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
