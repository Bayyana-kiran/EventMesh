/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = "eventmesh-db";
const FLOWS_COLLECTION = "flows";
const EXECUTIONS_COLLECTION = "executions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    // Make workspaceId optional - if not provided, return all destinations
    // This allows the page to load even without workspace context

    // Make workspaceId optional - if not provided, return all destinations
    // This allows the page to load even without workspace context

    // Get all flows
    const flowsResponse = await databases.listDocuments(
      DATABASE_ID,
      FLOWS_COLLECTION,
      [Query.limit(100)]
    );

    const flows = workspaceId
      ? flowsResponse.documents.filter(
          (f: any) => f.workspace_id === workspaceId
        )
      : flowsResponse.documents;

    // Get executions for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const executionsResponse = await databases.listDocuments(
      DATABASE_ID,
      EXECUTIONS_COLLECTION,
      [Query.limit(500)]
    );

    const executions = workspaceId
      ? executionsResponse.documents.filter(
          (e: any) => e.workspace_id === workspaceId
        )
      : executionsResponse.documents;

    const executionsToday = executions.filter((e: any) => {
      const execDate = new Date(e.$createdAt);
      return execDate >= today;
    });

    // Extract destination nodes from flows
    const destinations: any[] = [];

    flows.forEach((flow: any) => {
      try {
        const nodes =
          typeof flow.nodes === "string" ? JSON.parse(flow.nodes) : flow.nodes;

        if (Array.isArray(nodes)) {
          nodes.forEach((node: any) => {
            if (node.type === "destination") {
              const destType = node.data?.type || "webhook";
              const destUrl =
                node.data?.webhookUrl ||
                node.data?.slackUrl ||
                node.data?.discordUrl ||
                "";

              // Count deliveries today for this flow
              const flowExecutionsToday = executionsToday.filter(
                (e: any) => e.flow_id === flow.$id && e.status === "completed"
              ).length;

              destinations.push({
                id: `${flow.$id}-${node.id}`,
                flowId: flow.$id,
                flowName: flow.name,
                nodeId: node.id,
                name: node.data?.label || `${destType} - ${flow.name}`,
                type: destType,
                url: destUrl,
                status: flow.status === "active" ? "active" : "inactive",
                eventsToday: flowExecutionsToday,
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error parsing nodes for flow ${flow.$id}:`, error);
      }
    });

    // Calculate stats
    const totalDestinations = destinations.length;
    const activeDestinations = destinations.filter(
      (d) => d.status === "active"
    ).length;
    const totalEventsToday = destinations.reduce(
      (sum, d) => sum + d.eventsToday,
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: totalDestinations,
        active: activeDestinations,
        eventsToday: totalEventsToday,
      },
      destinations,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error fetching destinations:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch destinations",
      },
      { status: 500 }
    );
  }
}
