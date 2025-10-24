import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";

// GET /api/flows/[id] - Get a specific flow
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flow = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!,
      params.id
    );

    return NextResponse.json(flow);
  } catch (error: any) {
    console.error("Failed to fetch flow:", error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

// PATCH /api/flows/[id] - Update a flow
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, status, nodes, edges } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (nodes !== undefined) updateData.nodes = JSON.stringify(nodes);
    if (edges !== undefined) updateData.edges = JSON.stringify(edges);

    const flow = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!,
      params.id,
      updateData
    );

    return NextResponse.json(flow);
  } catch (error: any) {
    console.error("Failed to update flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/flows/[id] - Delete a flow
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!,
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
