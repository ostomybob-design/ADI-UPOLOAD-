import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET joke(s) of the day
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (date) {
      // Get joke for specific date
      const joke = await prisma.joke_of_the_day.findUnique({
        where: { date: new Date(date) }
      });
      return NextResponse.json(joke);
    } else {
      // Get all jokes
      const jokes = await prisma.joke_of_the_day.findMany({
        orderBy: { date: 'desc' }
      });
      return NextResponse.json(jokes);
    }
  } catch (error) {
    console.error("Error fetching jokes:", error);
    return NextResponse.json(
      { error: "Failed to fetch jokes" },
      { status: 500 }
    );
  }
}

// POST create new joke
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { joke, punchline, date, is_active = true } = body;
    
    if (!joke || !date) {
      return NextResponse.json(
        { error: "Joke and date are required" },
        { status: 400 }
      );
    }
    
    const newJoke = await prisma.joke_of_the_day.create({
      data: {
        joke,
        punchline,
        date: new Date(date),
        is_active,
      }
    });
    
    return NextResponse.json(newJoke, { status: 201 });
  } catch (error: any) {
    console.error("Error creating joke:", error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A joke already exists for this date" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create joke" },
      { status: 500 }
    );
  }
}

// PATCH update joke
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
    
    // Convert date string to Date if present
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    const updatedJoke = await prisma.joke_of_the_day.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      }
    });
    
    return NextResponse.json(updatedJoke);
  } catch (error) {
    console.error("Error updating joke:", error);
    return NextResponse.json(
      { error: "Failed to update joke" },
      { status: 500 }
    );
  }
}

// DELETE joke
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
    
    await prisma.joke_of_the_day.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting joke:", error);
    return NextResponse.json(
      { error: "Failed to delete joke" },
      { status: 500 }
    );
  }
}
