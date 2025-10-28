import { NextRequest, NextResponse } from "next/server";

/**
 * Test webhook endpoint to receive data from flow destinations
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("🎯 Test webhook received:", JSON.stringify(payload, null, 2));

    return NextResponse.json({
      success: true,
      message: "Test webhook received",
      receivedAt: new Date().toISOString(),
      payload,
    });
  } catch (error: any) {
    console.error("❌ Test webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test webhook endpoint",
    usage: "POST data to this endpoint to test flow destinations",
    url: "/api/test-webhook",
  });
}
