import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { getAuthContext } from "@/lib/auth/server-auth";

// GET /api/flows - List all flows for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get their workspace
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { workspace } = authContext;

    // List flows only from user's workspace
    const flows = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      [
        Query.equal("workspace_id", workspace.$id),
        Query.orderDesc("$createdAt"),
      ]
    );

    return NextResponse.json(flows);
  } catch (error: any) {
    console.error("Failed to fetch flows:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flows" },
      { status: 500 }
    );
  }
}

// POST /api/flows - Create a new flow
export async function POST(request: NextRequest) {
  try {
    // Authenticate user and get their workspace
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { workspace } = authContext;
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate unique webhook URL
    const webhookId = ID.unique();
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/${webhookId}`;

    // Create flow in user's workspace
    const flow = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      ID.unique(),
      {
        name,
        description: description || "",
        workspace_id: workspace.$id, // Use authenticated user's workspace
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
    return NextResponse.json(
      { error: error.message || "Failed to create flow" },
      { status: 500 }
    );
  }
}
