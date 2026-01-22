import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

// GET all quotes
export async function GET() {
  try {
    const snapshot = await db.collection('quotes')
      .orderBy('created_at', 'desc')
      .get();
    
    const quotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
    
    const docRef = await db.collection('quotes').add({
      quote,
      author: author || null,
      category: category || null,
      is_active,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const newDoc = await docRef.get();
    const newQuote = { id: newDoc.id, ...newDoc.data() };
    
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
    
    await db.collection('quotes').doc(id).update({
      ...updates,
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const updatedDoc = await db.collection('quotes').doc(id).get();
    const updatedQuote = { id: updatedDoc.id, ...updatedDoc.data() };
    
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
    
    await db.collection('quotes').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
