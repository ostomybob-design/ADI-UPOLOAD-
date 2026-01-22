import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all quotes
export async function GET() {
  try {
    const quotes = await prisma.quotes.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

// POST create new quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote, author, category, is_active = true } = body;
    
    if (!quote) {
      return NextResponse.json(
        { error: "Quote is required" },
        { status: 400 }
      );
    }
    
    const newQuote = await prisma.quotes.create({
      data: {
        quote,
        author,
        category,
        is_active,
      }
    });
    
    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}

// PATCH update quote
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    const updatedQuote = await prisma.quotes.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      }
    });
    
    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: "Failed to update quote" },
      { status: 500 }
    );
  }
}

// DELETE quote
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    await prisma.quotes.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
