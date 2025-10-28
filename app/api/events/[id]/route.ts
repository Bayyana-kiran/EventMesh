import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";

// GET /api/events/[id] - Get event details
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const Params = (await Promise.resolve(context.params)) as {
      id: string;
    };

    const event = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS!,
      Params.id
    );

    return NextResponse.json(event);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to fetch event:", error);
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}
