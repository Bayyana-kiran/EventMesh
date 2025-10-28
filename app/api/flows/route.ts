import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";

// GET /api/flows - List all flows
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const flows = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      [Query.equal("workspace_id", workspaceId), Query.orderDesc("$createdAt")]
    );

    return NextResponse.json(flows);
  } catch (error: any) {
    console.error("Failed to fetch flows:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/flows - Create a new flow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, workspaceId, nodes, edges } = body;

    if (!name || !workspaceId) {
      return NextResponse.json(
        { error: "Name and workspace ID are required" },
        { status: 400 }
      );
    }

    // Generate unique webhook URL
    const webhookId = ID.unique();
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/${webhookId}`;

    const flow = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      ID.unique(),
      {
        name,
        description: description || "",
        workspace_id: workspaceId,
        status: "draft",
        nodes: nodes ? JSON.stringify(nodes) : JSON.stringify([]),
        edges: edges ? JSON.stringify(edges) : JSON.stringify([]),
        webhook_url: webhookUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return NextResponse.json(flow, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
