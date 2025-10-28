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
    const flowsResponse = await databases.listDocuments(
      DATABASE_ID,
      FLOWS_COLLECTION,
      [Query.limit(100)]
    );

    // Filter by workspace if provided
    const flows = workspaceId
      ? flowsResponse.documents.filter(
          (f: any) => f.workspace_id === workspaceId
        )
      : flowsResponse.documents;
    const totalFlows = flows.length;
    const activeFlows = flows.filter((f: any) => f.status === "active").length;

    // Get events (today and total)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsResponse = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION,
      [Query.limit(100)]
    );

    const events = workspaceId
      ? eventsResponse.documents.filter(
          (e: any) => e.workspace_id === workspaceId
        )
      : eventsResponse.documents;

    const eventsToday = events.filter((e: any) => {
      const eventDate = new Date(e.$createdAt);
      return eventDate >= today;
    }).length;

    const totalEvents = events.length;

    // Get yesterday's count for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const eventsYesterday = events.filter((e: any) => {
      const eventDate = new Date(e.$createdAt);
      return eventDate >= yesterday && eventDate < today;
    }).length;

    // Get executions for success rate
    const executionsResponse = await databases.listDocuments(
      DATABASE_ID,
      EXECUTIONS_COLLECTION,
      [Query.limit(100)]
    );

    const flowIds = new Set(flows.map((f: any) => f.$id));
    const executions = workspaceId
      ? executionsResponse.documents.filter((e: any) =>
          Boolean(e.flow_id && flowIds.has(e.flow_id))
        )
      : executionsResponse.documents;

    // Accept both 'success' and legacy 'completed' statuses
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

    const executionsWithDuration = executions
      .filter((e: any) => e.status === "success" || e.status === "completed")
      .map((e: any) => ({
        ...e,
        _rawDuration: e.duration ?? e.duration_ms ?? e.durationMs,
        _duration: Number(e.duration ?? e.duration_ms ?? e.durationMs ?? NaN),
        _completedAt: e.completed_at || e.$updatedAt || e.$createdAt || null,
      }))
      .map((e: any) => {
        if (!Number.isFinite(e._duration)) {
          if (e.started_at && e.completed_at) {
            const started = new Date(e.started_at).getTime();
            const completed = new Date(e.completed_at).getTime();
            const computed =
              Number.isFinite(started) && Number.isFinite(completed)
                ? Math.max(0, Math.round(completed - started))
                : NaN;
            return { ...e, _duration: computed };
          }
        }
        return e;
      })
      .filter((e: any) => Number.isFinite(e._duration));

    const recentExecutions = executionsWithDuration
      .sort((a: any, b: any) => {
        const ta = a._completedAt ? new Date(a._completedAt).getTime() : 0;
        const tb = b._completedAt ? new Date(b._completedAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 50);

    let avgLatency = 0;
    if (recentExecutions.length > 0) {
      const totalDuration = recentExecutions.reduce((sum: number, e: any) => {
        return sum + Number(e._duration ?? 0);
      }, 0);
      avgLatency = Math.round(totalDuration / recentExecutions.length);
    }

    // Get recent flows (last 5)
    const recentFlows = flows
      .sort((a: any, b: any) => {
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      })
      .slice(0, 5)
      .map((flow: any) => {
        // Count events for this flow today
        const flowEventsToday = events.filter((e: any) => {
          const eventDate = new Date(e.$createdAt);
          return e.flow_id === flow.$id && eventDate >= today;
        }).length;

        return {
          id: flow.$id,
          name: flow.name,
          status: flow.status,
          eventsToday: flowEventsToday,
        };
      });

    // Get recent events (last 5)
    const recentEvents = events
      .sort((a: any, b: any) => {
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      })
      .slice(0, 5)
      .map((event: any) => {
        // Find execution for this event
        const execution = executions.find((e: any) => e.event_id === event.$id);

        // Calculate time ago
        const timeAgo = getTimeAgo(new Date(event.$createdAt));

        return {
          id: event.$id,
          source: event.source || "Webhook",
          type: event.event_type || "webhook.received",
          status: execution?.status || "pending",
          time: timeAgo,
          flowId: event.flow_id,
        };
      });

    // Calculate change percentages
    const eventsChange =
      eventsYesterday > 0
        ? (((eventsToday - eventsYesterday) / eventsYesterday) * 100).toFixed(1)
        : eventsToday > 0
        ? "100"
        : "0";

    const debugMode = searchParams.get("debug") === "true";

    const responsePayload: any = {
      success: true,
      stats: {
        totalFlows,
        activeFlows,
        eventsToday,
        totalEvents,
        eventsChange,
        successRate,
        avgLatency,
      },
      recentFlows,
      recentEvents,
    };

    if (debugMode) {
      // include helpful diagnostic info to understand why avgLatency might be 0
      responsePayload._debug = {
        executionsTotal: executions.length,
        executionsWithDuration: executionsWithDuration.length,
        recentExecutionsCount: recentExecutions.length,
        recentDurationsSample: recentExecutions
          .slice(0, 10)
          .map((e: any) => Number(e._duration ?? 0)),
      };
    }

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
