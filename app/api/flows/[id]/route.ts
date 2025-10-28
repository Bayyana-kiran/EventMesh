import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { getAuthContext, verifyResourceAccess } from "@/lib/auth/server-auth";

// GET /api/flows/[id] - Get a specific flow
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify user has access to this flow
    await verifyResourceAccess(COLLECTION_IDS.FLOWS, id, authContext.user.$id);

    const flow = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id
    );

    return NextResponse.json(flow);
  } catch (error: any) {
    console.error("Failed to fetch flow:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

// PATCH /api/flows/[id] - Update a flow
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify user has access to this flow
    await verifyResourceAccess(COLLECTION_IDS.FLOWS, id, authContext.user.$id);

    const body = await request.json();
    const { name, description, status, nodes, edges } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    // Don't allow changing workspace_id - that would be a security issue!

    const flow = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id,
      updateData
    );

    return NextResponse.json(flow);
  } catch (error: any) {
    console.error("Failed to update flow:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/flows/[id] - Delete a flow
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify user has access to this flow
    await verifyResourceAccess(COLLECTION_IDS.FLOWS, id, authContext.user.$id);

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete flow:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
