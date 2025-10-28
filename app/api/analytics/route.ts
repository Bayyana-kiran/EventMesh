/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = "eventmesh-db";
const FLOWS_COLLECTION = "flows";
const EVENTS_COLLECTION = "events";
const EXECUTIONS_COLLECTION = "executions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const days = parseInt(searchParams.get("days") || "7");

    // Make workspaceId optional - if not provided, return data for all workspaces
    // This allows the page to load even without workspace context

    // Get all data - remove workspace_id filter since not all collections have it
    const flowsResponse = await databases.listDocuments(
      DATABASE_ID,
      FLOWS_COLLECTION,
      [Query.limit(100)]
    );

    const eventsResponse = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION,
      [Query.limit(500)]
    );

    const executionsResponse = await databases.listDocuments(
      DATABASE_ID,
      EXECUTIONS_COLLECTION,
      [Query.limit(500)]
    );

    // Filter by workspace if provided
    const flows = workspaceId
      ? flowsResponse.documents.filter(
          (f: any) => f.workspace_id === workspaceId
        )
      : flowsResponse.documents;
    const events = workspaceId
      ? eventsResponse.documents.filter(
          (e: any) => e.workspace_id === workspaceId
        )
      : eventsResponse.documents;
    
    const flowIds = new Set(flows.map((f: any) => f.$id));
    const executions = workspaceId
      ? executionsResponse.documents.filter((e: any) =>
          Boolean(e.flow_id && flowIds.has(e.flow_id))
        )
      : executionsResponse.documents;

    // Calculate KPIs
    const totalEvents = events.length;
    const completedExecutions = executions.filter(
      (e: any) => e.status === "success" || e.status === "completed"
    ).length;
    const failedExecutions = executions.filter(
      (e: any) => e.status === "failed"
    ).length;
    const totalExecutions = completedExecutions + failedExecutions;
    const successRate =
      totalExecutions > 0
        ? ((completedExecutions / totalExecutions) * 100).toFixed(1)
        : "0.0";

    // Calculate average response time
    const completedWithDuration = executions.filter(
      (e: any) =>
        (e.status === "success" || e.status === "completed") &&
        (e.duration || e.duration === 0)
    );
    const avgResponseTime =
      completedWithDuration.length > 0
        ? Math.round(
            completedWithDuration.reduce(
              (sum: number, e: any) => sum + (e.duration || 0),
              0
            ) / completedWithDuration.length
          )
        : 0;

    const activeFlows = flows.filter((f: any) => f.status === "active").length;

    // Events over time (last N days)
    const eventsOverTime: { date: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = events.filter((e: any) => {
        const eventDate = new Date(e.$createdAt);
        return eventDate >= date && eventDate < nextDate;
      }).length;

      eventsOverTime.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      });
    }

    // Success vs Failures
    const successVsFailures = {
      completed: completedExecutions,
      failed: failedExecutions,
      pending: executions.filter(
        (e: any) => e.status === "pending" || e.status === "running"
      ).length,
    };

    // Flow performance (events per flow)
    const flowPerformance = flows
      .map((flow: any) => {
        const flowEvents = events.filter((e: any) => e.flow_id === flow.$id);
        const flowExecutions = executions.filter(
          (e: any) => e.flow_id === flow.$id
        );
        const flowCompleted = flowExecutions.filter(
          (e: any) => e.status === "success" || e.status === "completed"
        ).length;
        const flowFailed = flowExecutions.filter(
          (e: any) => e.status === "failed"
        ).length;
        const flowTotal = flowCompleted + flowFailed;

        return {
          flowId: flow.$id,
          flowName: flow.name,
          events: flowEvents.length,
          successRate:
            flowTotal > 0
              ? ((flowCompleted / flowTotal) * 100).toFixed(1)
              : "0.0",
          avgDuration:
            flowExecutions
              .filter((e: any) => e.duration)
              .reduce((sum: number, e: any) => sum + (e.duration || 0), 0) /
            (flowExecutions.filter((e: any) => e.duration).length || 1),
        };
      })
      .sort((a, b) => b.events - a.events);

    // Response time distribution (bucketing)
    const responseTimes = completedWithDuration.map(
      (e: any) => e.duration || 0
    );
    const distribution = {
      "0-100ms": responseTimes.filter((t) => t < 100).length,
      "100-300ms": responseTimes.filter((t) => t >= 100 && t < 300).length,
      "300-500ms": responseTimes.filter((t) => t >= 300 && t < 500).length,
      "500ms+": responseTimes.filter((t) => t >= 500).length,
    };

    return NextResponse.json({
      success: true,
      kpis: {
        totalEvents,
        successRate,
        avgResponseTime,
        activeFlows,
      },
      eventsOverTime,
      successVsFailures,
      flowPerformance,
      responseTimeDistribution: distribution,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
