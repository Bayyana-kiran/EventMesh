import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/workspace/switch - Switch to a different workspace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json(
        { success: false, error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Set the workspace cookie
    const response = NextResponse.json({
      success: true,
      workspaceId,
      message: "Workspace switched successfully",
    });

    const cookieStore = await cookies();
    response.cookies.set("currentWorkspaceId", workspaceId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("POST /api/workspace/switch error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage || "Failed to switch workspace" },
      { status: 500 }
    );
  }
}
