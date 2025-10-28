/**
 * Flow Execution Engine
 * Processes flow executions by traversing nodes and executing transformations
 */

interface FlowNode {
  id: string;
  type: "source" | "transform" | "destination";
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

interface ExecutionContext {
  executionId: string;
  flowId: string;
  eventId: string;
  inputData: Record<string, unknown>;
  currentData: Record<string, unknown>;
  steps: ExecutionStep[];
}

interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

export class FlowExecutionEngine {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private context: ExecutionContext;

  constructor(
    nodes: FlowNode[],
    edges: FlowEdge[],
    executionId: string,
    flowId: string,
    eventId: string,
    inputData: Record<string, unknown>
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = {
      executionId,
      flowId,
      eventId,
      inputData,
      currentData: inputData,
      steps: [],
    };
  }

  /**
   * Execute the flow from source to destinations
   */
  async execute(): Promise<{
    success: boolean;
    output: Record<string, unknown> | null;
    steps: ExecutionStep[];
    error?: string;
  }> {
    try {
      console.log("🚀 Starting flow execution:", this.context.executionId);

      // Find the source node
      const sourceNode = this.nodes.find((n) => n.type === "source");
      if (!sourceNode) {
        throw new Error("No source node found in flow");
      }

      console.log("📥 Source node:", sourceNode.id);

      // Execute from source node
      await this.executeNode(sourceNode);

      // Traverse and execute all connected nodes
      await this.traverseAndExecute(sourceNode.id);

      console.log("✅ Flow execution completed successfully");

      return {
        success: true,
        output: this.context.currentData,
        steps: this.context.steps,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Flow execution failed:", error);

      return {
        success: false,
        output: null,
        steps: this.context.steps,
        error: errorMessage,
      };
    }
  }

  /**
   * Traverse the flow graph and execute nodes in order
   */
  private async traverseAndExecute(currentNodeId: string): Promise<void> {
    // Find all edges from current node
    const outgoingEdges = this.edges.filter((e) => e.source === currentNodeId);

    for (const edge of outgoingEdges) {
      const nextNode = this.nodes.find((n) => n.id === edge.target);
      if (!nextNode) continue;

      // Execute the next node
      await this.executeNode(nextNode);

      // Continue traversal
      await this.traverseAndExecute(nextNode.id);
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: FlowNode): Promise<void> {
    const step: ExecutionStep = {
      nodeId: node.id,
      nodeType: node.type,
      status: "running",
      startedAt: new Date().toISOString(),
      input: this.context.currentData,
    };

    this.context.steps.push(step);

    try {
      console.log(`⚙️ Executing ${node.type} node:`, node.id);

      switch (node.type) {
        case "source":
          // Source node just passes data through
          step.output = this.context.currentData;
          break;

        case "transform":
          // Execute transformation
          step.output = await this.executeTransform(
            node,
            this.context.currentData
          );
          if (step.output) {
            this.context.currentData = step.output;
          }
          break;

        case "destination":
          // Send to destination
          step.output = await this.executeDestination(
            node,
            this.context.currentData
          );
          break;

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      step.status = "completed";
      step.completedAt = new Date().toISOString();

      console.log(`✅ Node ${node.id} completed`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Node ${node.id} failed:`, error);

      step.status = "failed";
      step.completedAt = new Date().toISOString();
      step.error = errorMessage;

      throw error;
    }
  }

  /**
   * Execute a transform node
   */
  private async executeTransform(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const transformType = node.data?.type || "javascript";

    console.log(`🔄 Transform type: ${transformType}`);

    if (transformType === "javascript") {
      return this.executeJavaScriptTransform(node, data);
    } else if (transformType === "ai") {
      return this.executeAITransform(node, data);
    } else {
      // Default: pass through
      return data;
    }
  }

  /**
   * Execute JavaScript transformation
   */
  private executeJavaScriptTransform(
    node: FlowNode,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    try {
      // Get the JavaScript code from node configuration
      const code = (node.data?.code as string) || "return data;";

      console.log("📝 Executing JavaScript:", code.substring(0, 100));

      // Create a safe execution context
      // WARNING: This is NOT truly sandboxed for production!
      // For production, use vm2, isolated-vm, or worker threads
      const func = new Function("data", code);
      const result = func(data);

      console.log("✅ JavaScript executed successfully");

      return result as Record<string, unknown>;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ JavaScript execution failed:", error);
      throw new Error(`JavaScript transform failed: ${errorMessage}`);
    }
  }

  /**
   * Execute AI transformation using Gemini
   */
  private async executeAITransform(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const prompt = (node.data?.prompt as string) || "Transform this data";
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      console.log(
        "🤖 Calling Gemini AI with prompt:",
        prompt.substring(0, 100)
      );

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${prompt}\n\nInput data: ${JSON.stringify(
                      data,
                      null,
                      2
                    )}\n\nReturn only valid JSON output.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result = (await response.json()) as Record<string, unknown>;
      const candidates = result.candidates as Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No response from Gemini");
      }

      // Try to parse JSON from response
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        // If not JSON, return as text
        return { aiResponse: text, originalData: data };
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ AI transform failed:", error);
      throw new Error(`AI transform failed: ${errorMessage}`);
    }
  }

  /**
   * Execute a destination node
   */
  private async executeDestination(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const destinationType = node.data?.type || "webhook";

    console.log(`📤 Destination type: ${destinationType}`);

    if (destinationType === "webhook") {
      return this.sendToWebhook(node, data);
    } else if (destinationType === "slack") {
      return this.sendToSlack(node, data);
    } else if (destinationType === "discord") {
      return this.sendToDiscord(node, data);
    } else {
      console.warn("⚠️ Unknown destination type, skipping");
      return { skipped: true, reason: "Unknown destination type" };
    }
  }

  /**
   * Send data to a webhook
   */
  private async sendToWebhook(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const webhookUrl = (node.data?.webhookUrl || node.data?.url) as string;

      if (!webhookUrl) {
        throw new Error("No webhook URL configured");
      }

      console.log("📡 Sending to webhook:", webhookUrl);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${responseText}`);
      }

      console.log("✅ Webhook delivery successful");

      return {
        success: true,
        status: response.status,
        response: responseText,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Webhook delivery failed:", error);
      throw new Error(`Webhook delivery failed: ${errorMessage}`);
    }
  }

  /**
   * Send data to Slack
   */
  private async sendToSlack(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const webhookUrl = node.data?.slackWebhook as string;

      if (!webhookUrl) {
        throw new Error("No Slack webhook URL configured");
      }

      console.log("📱 Sending to Slack");

      const message = {
        text: (node.data?.message as string) || JSON.stringify(data, null, 2),
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*EventMesh Notification*\n\`\`\`${JSON.stringify(
                data,
                null,
                2
              )}\`\`\``,
            },
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack returned ${response.status}`);
      }

      console.log("✅ Slack delivery successful");

      return { success: true, channel: "slack" };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Slack delivery failed:", error);
      throw new Error(`Slack delivery failed: ${errorMessage}`);
    }
  }

  /**
   * Send data to Discord
   */
  private async sendToDiscord(
    node: FlowNode,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const webhookUrl = node.data?.discordWebhook as string;

      if (!webhookUrl) {
        throw new Error("No Discord webhook URL configured");
      }

      console.log("💬 Sending to Discord");

      const message = {
        content: (node.data?.message as string) || "EventMesh Notification",
        embeds: [
          {
            title: "Flow Execution",
            description: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
            color: 5814783, // Blue color
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Discord returned ${response.status}`);
      }

      console.log("✅ Discord delivery successful");

      return { success: true, channel: "discord" };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Discord delivery failed:", error);
      throw new Error(`Discord delivery failed: ${errorMessage}`);
    }
  }
}
