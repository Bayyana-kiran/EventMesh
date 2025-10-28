import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";

// GET /api/executions - List executions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get("flowId");
    const eventId = searchParams.get("eventId");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("📋 Fetching executions with filters:", {
      flowId,
      eventId,
      limit,
    });

    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];

    if (flowId) {
      queries.push(Query.equal("flow_id", flowId));
    }
    if (eventId) {
      queries.push(Query.equal("event_id", eventId));
    }

    const executionsResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.EXECUTIONS,
      queries
    );

    console.log(`✅ Found ${executionsResponse.documents.length} executions`);

    return NextResponse.json({
      success: true,
      executions: executionsResponse.documents,
      total: executionsResponse.total,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Failed to fetch executions:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
