import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query, AppwriteException } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { Execution } from "@/lib/types";

// GET /api/executions - List executions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get("flowId");
    const eventId = searchParams.get("eventId");
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const baseQueries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    const queries = [...baseQueries];
    if (flowId) queries.push(Query.equal("flow_id", flowId));
    if (eventId) queries.push(Query.equal("event_id", eventId));
    if (workspaceId) queries.push(Query.equal("workspace_id", workspaceId));

    let executionsResponse;
    try {
      executionsResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        queries
      );
    } catch (err: unknown) {
      const appwriteErr = err as AppwriteException;
      const resp = appwriteErr.response ?? appwriteErr.message ?? "";
      const respStr = String(resp);
      if (
        workspaceId &&
        (respStr.includes("Attribute not found") ||
          respStr.includes("workspace_id") ||
          respStr.includes("Unknown attribute"))
      ) {
        console.info(
          "⚠️ Executions collection does not support 'workspace_id' filter; retrying without it."
        );
        const queriesNoWorkspace = [...baseQueries];
        if (flowId) queriesNoWorkspace.push(Query.equal("flow_id", flowId));
        if (eventId) queriesNoWorkspace.push(Query.equal("event_id", eventId));

        executionsResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_IDS.EXECUTIONS,
          queriesNoWorkspace
        );
      } else {
        throw err;
      }
    }

    // Parse node_executions from string to array for each execution
    const executions = executionsResponse.documents.map((execution) => ({
      ...(execution as unknown as Execution & { node_executions: string }),
      node_executions: JSON.parse(
        (execution as unknown as Execution & { node_executions: string })
          .node_executions || "[]"
      ),
    }));

    console.log(`✅ Found ${executionsResponse.documents.length} executions`);

    return NextResponse.json({
      success: true,
      executions: executions,
      total: executionsResponse.total,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
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
