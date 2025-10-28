import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { COLLECTION_IDS } from "@/lib/types";
import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";

// GET /api/workspace - List all workspaces for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user ID from session (you may need to adjust this based on your auth setup)
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // For demo purposes, using a placeholder user ID
    // In production, extract this from your session/auth token
    const userId = session.value || "demo-user-id";

    // Get current workspace from cookie
    const currentWorkspaceId = cookieStore.get("currentWorkspaceId")?.value;

    // List all workspaces for this user
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTION_IDS.WORKSPACES,
      [Query.equal("owner_id", userId), Query.orderDesc("$createdAt")]
    );

    const workspaces = response.documents;
    const current = currentWorkspaceId
      ? workspaces.find((w) => w.$id === currentWorkspaceId)
      : workspaces[0];

    return NextResponse.json({
      success: true,
      workspaces,
      current: current || null,
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Workspace name is required" },
        { status: 400 }
      );
    }

    // Get user ID from session
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.value || "demo-user-id";

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

    // Set as current workspace
    const response = NextResponse.json({
      success: true,
      workspace,
      message: "Workspace created successfully",
    });

    response.cookies.set("currentWorkspaceId", workspace.$id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
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
