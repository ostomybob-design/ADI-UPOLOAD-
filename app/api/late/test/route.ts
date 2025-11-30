import { NextResponse } from "next/server";

/**
 * GET /api/late/test
 * Test endpoint to verify Late API configuration
 */
export async function GET() {
  const apiKey = process.env.LATE_API_KEY;
  
  // Check if API key is loaded
  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "LATE_API_KEY environment variable is not set",
      hint: "Add LATE_API_KEY to your Vercel environment variables",
      docs: "See frontend/VERCEL_ENV_SETUP.md for instructions"
    }, { status: 500 });
  }
  
  // Check API key format
  if (!apiKey.startsWith("sk_")) {
    return NextResponse.json({
      status: "warning",
      message: "API key format looks incorrect",
      keyPrefix: apiKey.substring(0, 3),
      expectedPrefix: "sk_",
      hint: "Late.dev API keys should start with 'sk_'"
    }, { status: 200 });
  }
  
  // Test API key by calling Late API
  try {
    const response = await fetch("https://getlate.dev/api/v1/profiles", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: "error",
        message: "Late API returned an error",
        statusCode: response.status,
        statusText: response.statusText,
        error: errorText,
        hint: response.status === 401 
          ? "API key is invalid or expired. Generate a new one at https://getlate.dev/settings/api-keys"
          : "Check Late.dev API status"
      }, { status: 200 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: "success",
      message: "Late API connection successful",
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      profilesFound: data.profiles?.length || 0,
      profiles: data.profiles?.map((p: any) => ({
        id: p._id || p.id,
        name: p.name
      })) || []
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to Late API",
      error: (error as Error).message,
      hint: "Check your internet connection and Late.dev API status"
    }, { status: 500 });
  }
}
