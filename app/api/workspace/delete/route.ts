import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { COLLECTION_IDS } from "@/lib/types";
import { Query } from "node-appwrite";

// DELETE /api/workspace/delete - Delete workspace and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, userId, confirmationText } = body;

    // Validation
    if (!workspaceId || !userId) {
      return NextResponse.json(
        { success: false, error: "Workspace ID and User ID are required" },
        { status: 400 }
      );
    }

    if (confirmationText !== "DELETE") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid confirmation. Please type DELETE to confirm.",
        },
        { status: 400 }
      );
    }

    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    // Step 1: Verify workspace ownership
    console.log(`🔍 Verifying workspace ownership: ${workspaceId}`);
    const workspace = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );

    if (workspace.owner_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this workspace",
        },
        { status: 403 }
      );
    }

    console.log(`✅ Workspace verified: ${workspace.name}`);

    // Step 2: Delete all flows in the workspace
    console.log("🗑️  Deleting flows...");
    try {
      const flowsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.FLOWS,
        [Query.equal("workspace_id", workspaceId), Query.limit(500)]
      );

      for (const flow of flowsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.FLOWS,
          flow.$id
        );
      }
      console.log(`✅ Deleted ${flowsResponse.documents.length} flows`);
    } catch (error: any) {
      console.error("Error deleting flows:", error);
      // Continue even if flows deletion fails
    }

    // Step 3: Delete all events in the workspace
    console.log("🗑️  Deleting events...");
    try {
      const eventsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.EVENTS,
        [Query.equal("workspace_id", workspaceId), Query.limit(1000)]
      );

      for (const event of eventsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.EVENTS,
          event.$id
        );
      }
      console.log(`✅ Deleted ${eventsResponse.documents.length} events`);
    } catch (error: any) {
      console.error("Error deleting events:", error);
      // Continue even if events deletion fails
    }

    // Step 4: Delete all executions in the workspace
    console.log("🗑️  Deleting executions...");
    try {
      const executionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        [Query.limit(1000)]
      );

      // Filter executions by workspace_id if the field exists
      const workspaceExecutions = executionsResponse.documents.filter(
        (e: any) => e.workspace_id === workspaceId
      );

      for (const execution of workspaceExecutions) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.EXECUTIONS,
          execution.$id
        );
      }
      console.log(`✅ Deleted ${workspaceExecutions.length} executions`);
    } catch (error: any) {
      console.error("Error deleting executions:", error);
      // Continue even if executions deletion fails
    }

    // Step 5: Delete all destinations in the workspace
    console.log("🗑️  Deleting destinations...");
    try {
      const destinationsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.DESTINATIONS,
        [Query.equal("workspace_id", workspaceId), Query.limit(500)]
      );

      for (const destination of destinationsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.DESTINATIONS,
          destination.$id
        );
      }
      console.log(
        `✅ Deleted ${destinationsResponse.documents.length} destinations`
      );
    } catch (error: any) {
      console.error("Error deleting destinations:", error);
      // Continue even if destinations deletion fails
    }

    // Step 6: Delete all API keys in the workspace
    console.log("🗑️  Deleting API keys...");
    try {
      const apiKeysResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.API_KEYS,
        [Query.equal("workspace_id", workspaceId), Query.limit(500)]
      );

      for (const apiKey of apiKeysResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.API_KEYS,
          apiKey.$id
        );
      }
      console.log(`✅ Deleted ${apiKeysResponse.documents.length} API keys`);
    } catch (error: any) {
      console.error("Error deleting API keys:", error);
      // Continue even if API keys deletion fails
    }

    // Step 7: Delete all analytics data in the workspace
    console.log("🗑️  Deleting analytics...");
    try {
      const analyticsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.ANALYTICS,
        [Query.equal("workspace_id", workspaceId), Query.limit(1000)]
      );

      for (const analytics of analyticsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_IDS.ANALYTICS,
          analytics.$id
        );
      }
      console.log(
        `✅ Deleted ${analyticsResponse.documents.length} analytics records`
      );
    } catch (error: any) {
      console.error("Error deleting analytics:", error);
      // Continue even if analytics deletion fails
    }

    // Step 8: Finally, delete the workspace itself
    console.log("🗑️  Deleting workspace...");
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );

    console.log(`✅ Workspace deleted successfully: ${workspace.name}`);

    return NextResponse.json({
      success: true,
      message: "Workspace and all associated data deleted successfully",
      deletedWorkspace: {
        id: workspaceId,
        name: workspace.name,
      },
    });
  } catch (error: any) {
    console.error("❌ DELETE /api/workspace/delete error:", error);

    // Provide more helpful error messages
    if (error.code === 404) {
      return NextResponse.json(
        {
          success: false,
          error: "Workspace not found",
        },
        { status: 404 }
      );
    }

    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this workspace",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete workspace",
        details: error.code ? `Error code: ${error.code}` : undefined,
      },
      { status: 500 }
    );
  }
}
