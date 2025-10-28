import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { COLLECTION_IDS } from "@/lib/types";
import { ID, Query } from "node-appwrite";

// GET /api/workspace - List all workspaces for the current user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // List all workspaces for this user
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTION_IDS.WORKSPACES,
      [Query.equal("owner_id", userId), Query.orderDesc("$createdAt")]
    );

    const workspaces = response.documents;

    return NextResponse.json({
      success: true,
      workspaces,
      current: workspaces[0] || null,
    });
  } catch (error: any) {
    console.error("GET /api/workspace error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST /api/workspace - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Workspace name is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

  

    // Create the workspace
    const workspace = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTION_IDS.WORKSPACES,
      ID.unique(),
      {
        name: name.trim(),
        owner_id: userId,
        created_at: new Date().toISOString(),
        settings: JSON.stringify({
          timezone: "UTC",
          retention_days: 30,
        }),
      }
    );

    return NextResponse.json({
      success: true,
      workspace,
      message: "Workspace created successfully",
    });
  } catch (error: any) {
    console.error("POST /api/workspace error:", error);

    // Provide more helpful error messages
    if (error.code === 401) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please ensure you're logged in and have the correct permissions",
        },
        { status: 401 }
      );
    }

    if (error.code === 404) {
      return NextResponse.json(
        {
          success: false,
          error: "Workspace collection not found. Please run database setup.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create workspace",
        details: error.code ? `Error code: ${error.code}` : undefined,
      },
      { status: 500 }
    );
  }
}
