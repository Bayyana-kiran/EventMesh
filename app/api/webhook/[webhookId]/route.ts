import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { ID } from "node-appwrite";
import { FlowExecutionEngine } from "@/lib/execution-engine";

/**
 * Execute flow asynchronously in the background
 */
async function executeFlowAsync(
  flow: any,
  executionId: string,
  eventId: string,
  payload: any
) {
  try {
    console.log("🎯 Starting async flow execution:", executionId);

    // Update execution status to running
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.EXECUTIONS,
      executionId,
      { status: "running" }
    );

    // Parse nodes and edges from flow
    const nodes = JSON.parse(flow.nodes || "[]");
    const edges = JSON.parse(flow.edges || "[]");

    console.log(`📊 Flow has ${nodes.length} nodes and ${edges.length} edges`);

    // Create execution engine
    const engine = new FlowExecutionEngine(
      nodes,
      edges,
      executionId,
      flow.$id,
      eventId,
      payload
    );

    // Execute the flow
    const result = await engine.execute();

    // Update execution with results
    if (result.success) {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        executionId,
        {
          status: "completed",
          completed_at: new Date().toISOString(),
        }
      );

      // Update event status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EVENTS,
        eventId,
        { status: "processed" }
      );

      console.log("✅ Flow execution completed successfully:", executionId);
    } else {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        executionId,
        {
          status: "failed",
          completed_at: new Date().toISOString(),
        }
      );

      // Update event status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EVENTS,
        eventId,
        { status: "failed" }
      );

      console.error("❌ Flow execution failed:", result.error);
    }
  } catch (error: unknown) {
    console.error("❌ Async execution error:", error);

    // Update execution status to failed
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        executionId,
        {
          status: "failed",
          completed_at: new Date().toISOString(),
        }
      );
    } catch (updateError) {
      console.error("Failed to update execution status:", updateError);
    }
  }
}

// POST /api/webhook/[webhookId] - Receive webhook
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await context.params;

    // Parse the incoming webhook payload
    const payload = await request.json();
    const headers: Record<string, string> = {};

    // Capture headers
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log("📥 Webhook received:", {
      webhookId,
      payload,
      headers: Object.keys(headers),
    });

    // Find the flow by webhook_url
    const flows = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS
    );

    const flow = flows.documents.find((f: any) =>
      f.webhook_url?.includes(webhookId)
    );

    if (!flow) {
      console.error("❌ No flow found for webhook ID:", webhookId);
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    console.log("✅ Found flow:", flow.name);

    // Check if flow is active
    if (flow.status !== "active") {
      console.warn("⚠️ Flow is not active:", flow.status);
      return NextResponse.json(
        { error: "Flow is not active", status: flow.status },
        { status: 400 }
      );
    }

    // Create an event record
    const event = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.EVENTS,
      ID.unique(),
      {
        workspace_id: flow.workspace_id,
        flow_id: flow.$id,
        source: "webhook",
        event_type: "webhook.received",
        payload: JSON.stringify(payload),
        headers: JSON.stringify(headers),
        received_at: new Date().toISOString(),
        status: "pending",
      }
    );

    console.log("📝 Event created:", event.$id);

    // Create an execution record
    const execution = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.EXECUTIONS,
      ID.unique(),
      {
        flow_id: flow.$id,
        event_id: event.$id,
        status: "pending",
        started_at: new Date().toISOString(),
      }
    );

    console.log("🚀 Execution created:", execution.$id);

    // Execute the flow asynchronously
    // We don't await this so the webhook responds quickly
    executeFlowAsync(flow, execution.$id, event.$id, payload).catch((error) => {
      console.error("❌ Async flow execution failed:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      event_id: event.$id,
      execution_id: execution.$id,
      flow_id: flow.$id,
      flow_name: flow.name,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Webhook processing failed:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET /api/webhook/[webhookId] - Get webhook info
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ webhookId: string }> }
) {
  try {
    const { webhookId } = await context.params;

    // Find the flow by webhook_url
    const flows = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.FLOWS
    );

    const flow = flows.documents.find((f: any) =>
      f.webhook_url?.includes(webhookId)
    );

    if (!flow) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({
      webhook_id: webhookId,
      flow_id: flow.$id,
      flow_name: flow.name,
      status: flow.status,
      webhook_url: flow.webhook_url,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to get webhook info:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
