import { NextRequest, NextResponse } from "next/server";

// Simple test webhook that echoes back the received JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    console.log("[test-webhook] received payload:", body);

    return NextResponse.json(
      {
        success: true,
        received: body,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[test-webhook] error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: "Test webhook endpoint" });
}
