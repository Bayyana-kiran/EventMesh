import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { ID, Models } from "node-appwrite";
import { FlowExecutionEngine } from "@/lib/execution-engine";
import { validateSchema } from "@/lib/utils";
import { Flow, FlowNode, FlowEdge, NodeExecution } from "@/lib/types";

interface ExecutionFlowNode {
  id: string;
  type: "source" | "transform" | "destination";
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

interface ExecutionFlowEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * Execute flow asynchronously in the background
 */
async function executeFlowAsync(
  flow: Flow,
  executionId: string,
  eventId: string,
  payload: Record<string, unknown>
) {
  // make startTime visible to both try and catch blocks
  let startTime = 0;

  // Helper to update execution documents safely. Some Appwrite deployments
  // validate document structure and will reject unknown attributes (for
  // example `duration`). This helper will retry the update after removing
  // any attributes that Appwrite reports as unknown.
  const safeUpdateExecution = async (
    id: string,
    data: Record<string, unknown>
  ) => {
    try {
      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        id,
        data
      );
    } catch (updateErr: unknown) {
      // Normalize response text (try to extract message from JSON if present)
      const errorObj = updateErr as { response?: unknown; message?: unknown };
      const respRaw = errorObj?.response ?? errorObj?.message ?? "";
      let respStr = String(respRaw);

      try {
        // If response is a JSON string, parse and extract the message field
        const parsed =
          typeof respRaw === "string" ? JSON.parse(respRaw) : respRaw;
        if (
          parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          typeof parsed.message === "string"
        ) {
          respStr = parsed.message;
        }
      } catch {
        // ignore JSON parse errors and keep respStr as-is
      }

      const unknownAttrs: string[] = [];

      // Try multiple regex forms to catch both escaped and unescaped quote styles
      const re1 = /Unknown attribute:\s*\"([^\"]+)\"/g; // matches Unknown attribute: "duration"
      const re2 = /Unknown attribute:\s*"([^\"]+)"/g; // matches Unknown attribute: "duration"
      const re3 = /Unknown attribute:\s*([^,\s\}\"]+)/g; // fallback: Unknown attribute: duration

      let m;
      while ((m = re1.exec(respStr))) unknownAttrs.push(m[1]);
      while ((m = re2.exec(respStr))) unknownAttrs.push(m[1]);
      while ((m = re3.exec(respStr))) unknownAttrs.push(m[1]);

      // Deduplicate
      const uniqueAttrs = Array.from(new Set(unknownAttrs));

      if (uniqueAttrs.length > 0) {
        const sanitized: Record<string, unknown> = { ...data };
        for (const a of uniqueAttrs) {
          delete sanitized[a];
        }

        try {
          return await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            COLLECTION_IDS.EXECUTIONS,
            id,
            sanitized
          );
        } catch (err2) {
          console.error("Failed to update execution after sanitizing:", err2);
          throw err2;
        }
      }

      throw updateErr;
    }
  };

  try {
    console.log("🎯 Starting async flow execution:", executionId);

    // measure execution duration locally (will be saved on the execution doc)
    startTime = Date.now();

    // Update execution status to running (use safe helper to avoid schema errors)
    await safeUpdateExecution(executionId, { status: "running" });

    // Parse nodes and edges from flow
    const flowData = flow as unknown as { nodes: string; edges: string };
    const nodesStr = flowData.nodes;
    const edgesStr = flowData.edges;
    const nodes: FlowNode[] = JSON.parse(nodesStr || "[]");
    const edges: FlowEdge[] = JSON.parse(edgesStr || "[]");

    console.log(`📊 Flow has ${nodes.length} nodes and ${edges.length} edges`);

    // Create execution engine
    const engine = new FlowExecutionEngine(
      nodes as unknown as ExecutionFlowNode[],
      edges as unknown as ExecutionFlowEdge[],
      executionId,
      flow.$id,
      eventId,
      payload
    );

    // Execute the flow
    const result = await engine.execute();

    // Calculate duration in ms
    const durationMs = Math.round(Date.now() - startTime);

    // Convert execution steps to node executions format
    const nodeExecutions = result.steps.map((step) => ({
      node_id: step.nodeId,
      status: step.status,
      input: step.input || {},
      output: step.output || {},
      error: step.error,
      duration_ms:
        step.completedAt && step.startedAt
          ? Math.round(
              new Date(step.completedAt).getTime() -
                new Date(step.startedAt).getTime()
            )
          : 0,
    }));

    // Update execution with results
    if (result.success) {
      await safeUpdateExecution(executionId, {
        status: "completed",
        completed_at: new Date().toISOString(),
        duration: durationMs,
        node_executions: JSON.stringify(nodeExecutions),
      });

      // Update event status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EVENTS,
        eventId,
        { status: "processed" }
      );

      console.log("✅ Flow execution completed successfully:", executionId);
    } else {
      await safeUpdateExecution(executionId, {
        status: "failed",
        completed_at: new Date().toISOString(),
        duration: durationMs,
        node_executions: JSON.stringify(nodeExecutions),
      });

      // Update event status
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EVENTS,
        eventId,
        { status: "failed" }
      );

      // Notify about flow failure
      try {
        const notificationBackendUrl =
          process.env.NOTIFICATION_BACKEND_URL || "http://localhost:8080";
        await fetch(`${notificationBackendUrl}/notify/flow-failure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: flow.workspace_id,
            flowName: flow.name,
            error: result.error || "Unknown error",
          }),
        });
      } catch (notifyErr) {
        console.error("Failed to send flow failure notification:", notifyErr);
      }

      console.error("❌ Flow execution failed:", result.error);
    }
  } catch (error: unknown) {
    console.error("❌ Async execution error:", error);

    // Update execution status to failed (ensure duration is saved if possible)
    try {
      const durationMs =
        Date.now() - (typeof startTime === "number" ? startTime : Date.now());

      // Try to get any partial execution steps if available
      const nodeExecutions: NodeExecution[] = [];
      try {
        // If we have a flow and execution context, we could potentially get partial steps
        // For now, we'll leave this empty as the execution failed before completion
      } catch {
        // Ignore errors when trying to get partial steps
      }

      await safeUpdateExecution(executionId, {
        status: "failed",
        completed_at: new Date().toISOString(),
        duration: Math.round(durationMs),
        node_executions: JSON.stringify(nodeExecutions),
      });
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

    const flow = flows.documents.find((f) => {
      const flowDoc = f as unknown as { webhook_url?: string };
      return flowDoc.webhook_url?.includes(webhookId);
    }) as Flow | undefined;

    if (!flow) {
      console.error("❌ No flow found for webhook ID:", webhookId);
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    console.log("✅ Found flow:", flow.name);

    // Validate payload against schema if defined in source node
    const flowData = flow as unknown as { nodes: string };
    const nodes = JSON.parse(flowData.nodes || "[]");
    const sourceNode = nodes.find((node: FlowNode) => node.type === "source");

    if (sourceNode?.data?.config?.schema) {
      console.log("🔍 Validating payload against schema");
      const validation = validateSchema(payload, sourceNode.data.config.schema);

      if (!validation.success) {
        console.error("❌ Schema validation failed:", validation.error);
        return NextResponse.json(
          {
            error: "Invalid payload",
            message: `Payload validation failed: ${validation.error}`,
            details: validation.error,
          },
          { status: 400 }
        );
      }
      console.log("✅ Payload validation passed");
    }

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

    // Check event volume in background
    const notificationBackendUrl =
      process.env.NOTIFICATION_BACKEND_URL || "http://localhost:8080";
    fetch(`${notificationBackendUrl}/check-event-volume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: flow.workspace_id,
      }),
    }).catch((err) => {
      console.error("Failed to check event volume:", err);
    });

    const executionId = ID.unique();
    let execution: Models.Document | null = null;

    // Build execution payload (do NOT include workspace_id at create time to
    // avoid Appwrite collection schema rejections). If the flow has a
    // workspace_id we will try to add it afterwards with an update.
    const executionPayload: Record<string, unknown> = {
      flow_id: flow.$id,
      event_id: event.$id,
      status: "pending",
      started_at: new Date().toISOString(),
    };

    try {
      // Create execution without workspace_id to avoid a 400 from Appwrite when
      // the collection doesn't include that attribute.
      execution = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.EXECUTIONS,
        executionId,
        executionPayload
      );

      console.log("🚀 Execution created:", execution.$id);

      // If the flow has workspace_id, try to add it via update. This keeps the
      // initial create fast and avoids create-time schema validation errors.
      if (flow.workspace_id) {
        try {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            COLLECTION_IDS.EXECUTIONS,
            execution.$id,
            { workspace_id: flow.workspace_id }
          );

          console.log("ℹ️ workspace_id added to execution document");
        } catch (updateErr: unknown) {
          // If the collection schema doesn't accept workspace_id Appwrite will
          // return a document_invalid_structure error mentioning the unknown
          // attribute. Silently acknowledge that case to avoid noisy logs and
          // keep helpful info for other errors.
          const errorObj = updateErr as {
            response?: unknown;
            message?: unknown;
          };
          const resp = errorObj?.response ?? errorObj?.message ?? "";
          const respStr = String(resp);

          if (
            respStr.includes("Unknown attribute") ||
            respStr.includes("workspace_id")
          ) {
            console.info(
              "ℹ️ Executions collection does not accept 'workspace_id'; skipping add."
            );
          } else {
            console.info(
              "ℹ️ Could not add workspace_id to execution document:",
              String(errorObj?.message ?? errorObj)
            );
          }
        }
      }
    } catch (execErr: unknown) {
      // Something prevented creating the execution doc entirely. Log as an
      // error but continue — the flow will still run using the generated
      // `executionId` so that downstream records correlate.
      console.error("❌ Failed to create execution record:", execErr);
    }

    // Execute the flow asynchronously. Use the created execution id if
    // available, otherwise fallback to the generated executionId.
    // We don't await this so the webhook responds quickly.
    executeFlowAsync(
      flow,
      execution?.$id ?? executionId,
      event.$id,
      payload
    ).catch((error) => {
      console.error("❌ Async flow execution failed:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      event_id: event.$id,
      execution_id: execution?.$id ?? executionId,
      flow_id: flow.$id,
      flow_name: flow.name,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
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

    const flow = flows.documents.find((f) => {
      const flowDoc = f as unknown as { webhook_url?: string };
      return flowDoc.webhook_url?.includes(webhookId);
    }) as Flow | undefined;

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
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Failed to get webhook info:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
