import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";

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
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!,
      [Query.equal("workspaceId", workspaceId)]
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

    // Generate webhook ID
    const webhookId = `wh_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const flow = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!,
      ID.unique(),
      {
        name,
        description: description || "",
        workspaceId,
        webhookId,
        status: "active",
        nodes: nodes ? JSON.stringify(nodes) : "[]",
        edges: edges ? JSON.stringify(edges) : "[]",
      }
    );

    return NextResponse.json(flow, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
