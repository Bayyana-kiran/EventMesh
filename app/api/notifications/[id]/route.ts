import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { read } = body;

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.NOTIFICATIONS,
      id,
      { read: read ?? true }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.NOTIFICATIONS,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to delete notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
