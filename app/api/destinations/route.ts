import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { getAuthContext } from "@/lib/auth/server-auth";

const DATABASE_ID = "eventmesh-db";
const FLOWS_COLLECTION = "flows";
const EXECUTIONS_COLLECTION = "executions";

export async function GET(request: Request) {
  try {
    // Authenticate user and get their workspace
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { workspace } = authContext;

    // Get flows for this workspace only
    const flowsResponse = await databases.listDocuments(
      DATABASE_ID,
      FLOWS_COLLECTION,
      [Query.equal("workspace_id", workspace.$id), Query.limit(100)]
    );

    const flows = flowsResponse.documents;

    // Get executions for today for this workspace only
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const executionsResponse = await databases.listDocuments(
      DATABASE_ID,
      EXECUTIONS_COLLECTION,
      [Query.equal("workspace_id", workspace.$id), Query.limit(500)]
    );

    const executionsToday = executionsResponse.documents.filter((e: any) => {
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
  } catch (error: any) {
    console.error("❌ Error fetching destinations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch destinations",
      },
      { status: 500 }
    );
  }
}
