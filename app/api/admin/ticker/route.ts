import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

// GET all ticker messages
export async function GET() {
  try {
    const snapshot = await db.collection('ticker_messages')
      .orderBy('order_index', 'asc')
      .orderBy('created_at', 'desc')
      .get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
    
    const docRef = await db.collection('ticker_messages').add({
      message,
      is_active,
      order_index,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const newDoc = await docRef.get();
    const newMessage = { id: newDoc.id, ...newDoc.data() };
    
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
    
    await db.collection('ticker_messages').doc(id).update({
      ...updates,
      updated_at: FieldValue.serverTimestamp(),
    });
    
    const updatedDoc = await db.collection('ticker_messages').doc(id).get();
    const updatedMessage = { id: updatedDoc.id, ...updatedDoc.data() };
    
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
    
    await db.collection('ticker_messages').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticker message:", error);
    return NextResponse.json(
      { error: "Failed to delete ticker message" },
      { status: 500 }
    );
  }
}
