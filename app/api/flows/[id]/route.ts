/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";

// GET /api/flows/[id] - Get a specific flow
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const flow = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id
    );

    return NextResponse.json(flow);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to fetch flow:", error);
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}

// PATCH /api/flows/[id] - Update a flow
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, status, nodes, edges, workspace_id } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    if (workspace_id !== undefined) updateData.workspace_id = workspace_id;

    const flow = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id,
      updateData
    );

    return NextResponse.json(flow);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to update flow:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/flows/[id] - Delete a flow
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to delete flow:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
