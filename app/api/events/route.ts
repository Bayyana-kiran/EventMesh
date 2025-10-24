import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const flowId = searchParams.get("flowId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const queries = [];
    if (flowId) {
      queries.push(Query.equal("flowId", flowId));
    }
    queries.push(Query.limit(limit));
    queries.push(Query.orderDesc("receivedAt"));

    const events = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS!,
      queries
    );

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
