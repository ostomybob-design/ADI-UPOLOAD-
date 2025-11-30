import { NextResponse } from "next/server";
import { lateAPI } from "@/lib/late-api";

/**
 * GET /api/late/accounts
 * Get all connected social media accounts from Late API
 */
export async function GET() {
  try {
    const accounts = await lateAPI.getAccounts();
    
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts from Late API:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch accounts from Late API", 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
