/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { Workspace } from "@/lib/types";

const DATABASE_ID = "eventmesh-db";
const WORKSPACES_COLLECTION = "workspaces";
const API_KEYS_COLLECTION = "api_keys";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Workspace ID is required",
        },
        { status: 400 }
      );
    }

    // Get workspace details
    const workspace = (await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION,
      workspaceId
    )) as Workspace;

    // Get API keys for workspace
    const apiKeysResponse = await databases.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION,
      [Query.equal("workspace_id", workspaceId), Query.limit(50)]
    );

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.$id,
        name: workspace.name,
        created: workspace.$createdAt,
        settings: workspace.settings,
      },
      apiKeys: apiKeysResponse.documents.map((key: any) => ({
        id: key.$id,
        name: key.name,
        key: key.key_hash,
        created: key.$createdAt,
        lastUsed: key.last_used_at,
      })),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error fetching workspace settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch workspace settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, name, settings } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (settings) updates.settings = JSON.stringify(settings);

    const workspace = (await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION,
      workspaceId,
      updates
    )) as Workspace;

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.$id,
        name: workspace.name,
        settings: workspace.settings,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error updating workspace:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to update workspace",
      },
      { status: 500 }
    );
  }
}
