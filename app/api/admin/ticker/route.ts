import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all ticker messages
export async function GET() {
  try {
    const messages = await prisma.ticker_messages.findMany({
      orderBy: [
        { order_index: 'asc' },
        { created_at: 'desc' }
      ]
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching ticker messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker messages" },
      { status: 500 }
    );
  }
}

// POST create new ticker message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, is_active = true, order_index = 0 } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    const newMessage = await prisma.ticker_messages.create({
      data: {
        message,
        is_active,
        order_index,
      }
    });
    
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating ticker message:", error);
    return NextResponse.json(
      { error: "Failed to create ticker message" },
      { status: 500 }
    );
  }
}

// PATCH update ticker message
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
    
    const updatedMessage = await prisma.ticker_messages.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      }
    });
    
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating ticker message:", error);
    return NextResponse.json(
      { error: "Failed to update ticker message" },
      { status: 500 }
    );
  }
}

// DELETE ticker message
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
    
    await prisma.ticker_messages.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticker message:", error);
    return NextResponse.json(
      { error: "Failed to delete ticker message" },
      { status: 500 }
    );
  }
}
