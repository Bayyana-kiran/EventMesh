import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS!;
const FLOWS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!;

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get("flowId");
    const status = searchParams.get("status");
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log("📋 Fetching events with filters:", { flowId, status, limit });

    // Build query
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];

    if (flowId) {
      queries.push(Query.equal("flow_id", flowId));
    }

    if (status) {
      queries.push(Query.equal("status", status));
    }

    if (workspaceId) {
      queries.push(Query.equal("workspace_id", workspaceId));
    }

    // Fetch events
    const eventsResponse = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      queries
    );

    console.log(`✅ Found ${eventsResponse.documents.length} events`);

    // Fetch flow names for each event
    const eventsWithFlows = await Promise.all(
      eventsResponse.documents.map(async (event) => {
        try {
          const flow = await databases.getDocument(
            DATABASE_ID,
            FLOWS_COLLECTION_ID,
            event.flow_id
          );
          return {
            ...event,
            flow_name: flow.name,
          };
        } catch (error) {
          console.warn(`⚠️ Could not fetch flow ${event.flow_id}:`, error);
          return {
            ...event,
            flow_name: "Unknown Flow",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithFlows,
      total: eventsResponse.total,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error fetching events:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
