import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

// GET joke(s) of the day
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (date) {
      // Get joke for specific date
      const snapshot = await db.collection('joke_of_the_day')
        .where('date', '==', date)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return NextResponse.json(null);
      }
      
      const doc = snapshot.docs[0];
      return NextResponse.json({ id: doc.id, ...doc.data() });
    } else {
      // Get all jokes
      const snapshot = await db.collection('joke_of_the_day')
        .orderBy('date', 'desc')
        .get();
      
      const jokes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
    
    // Check if joke already exists for this date
    const existingJoke = await db.collection('joke_of_the_day')
      .where('date', '==', date)
      .get();
    
    if (!existingJoke.empty) {
      return NextResponse.json(
        { error: "A joke already exists for this date" },
        { status: 409 }
      );
    }
    
    const docRef = await db.collection('joke_of_the_day').add({
      joke,
      punchline: punchline || null,
      date,
      is_active,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const newDoc = await docRef.get();
    const newJoke = { id: newDoc.id, ...newDoc.data() };
    
    return NextResponse.json(newJoke, { status: 201 });
  } catch (error: any) {
    console.error("Error creating joke:", error);
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
    
    // If updating date, check for conflicts
    if (updates.date) {
      const existingJoke = await db.collection('joke_of_the_day')
        .where('date', '==', updates.date)
        .get();
      
      if (!existingJoke.empty && existingJoke.docs[0].id !== id) {
        return NextResponse.json(
          { error: "A joke already exists for this date" },
          { status: 409 }
        );
      }
    }
    
    await db.collection('joke_of_the_day').doc(id).update({
      ...updates,
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const updatedDoc = await db.collection('joke_of_the_day').doc(id).get();
    const updatedJoke = { id: updatedDoc.id, ...updatedDoc.data() };
    
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
    
    await db.collection('joke_of_the_day').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting joke:", error);
    return NextResponse.json(
      { error: "Failed to delete joke" },
      { status: 500 }
    );
  }
}
