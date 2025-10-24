import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

// GET /api/executions - List executions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get("flowId");
    const eventId = searchParams.get("eventId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const queries = [];
    if (flowId) {
      queries.push(Query.equal("flowId", flowId));
    }
    if (eventId) {
      queries.push(Query.equal("eventId", eventId));
    }
    queries.push(Query.limit(limit));
    queries.push(Query.orderDesc("startedAt"));

    const executions = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXECUTIONS!,
      queries
    );

    return NextResponse.json(executions);
  } catch (error: any) {
    console.error("Failed to fetch executions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
