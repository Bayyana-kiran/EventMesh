"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Zap, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalFlows: number;
  activeFlows: number;
  eventsToday: number;
  totalEvents: number;
  eventsChange: string;
  successRate: string;
  avgLatency: number;
}

interface RecentFlow {
  id: string;
  name: string;
  status: string;
  eventsToday: number;
}

interface RecentEvent {
  id: string;
  source: string;
  type: string;
  status: string;
  time: string;
  flowId: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFlows, setRecentFlows] = useState<RecentFlow[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentFlows(data.recentFlows);
        setRecentEvents(data.recentEvents);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-destructive mt-2">{error}</p>
          </div>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your event flows.
          </p>
        </div>
        <Link href="/dashboard/flows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Flows
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFlows || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary">{stats?.activeFlows || 0}</span>{" "}
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Today
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventsToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span
                className={
                  parseFloat(stats?.eventsChange || "0") >= 0
                    ? "text-primary"
                    : "text-destructive"
                }
              >
                {parseFloat(stats?.eventsChange || "0") >= 0 ? "+" : ""}
                {stats?.eventsChange}%
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalEvents || 0} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Latency
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgLatency || 0}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 50 executions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent flows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Flows</CardTitle>
            <CardDescription>
              Your most recently created event flows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFlows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No flows yet</p>
                  <p className="text-xs mt-1">
                    Create your first flow to get started
                  </p>
                </div>
              ) : (
                recentFlows.map((flow) => (
                  <Link key={flow.id} href={`/dashboard/flows/${flow.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            flow.status === "active"
                              ? "bg-primary"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{flow.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {flow.eventsToday} events today
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No events yet</p>
                  <p className="text-xs mt-1">
                    Send a webhook to see events here
                  </p>
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{event.source}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          event.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : event.status === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : event.status === "running"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {event.status}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/dashboard/flows/new">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-2 p-6"
              >
                <GitBranch className="h-8 w-8" />
                <span className="font-semibold">Create New Flow</span>
                <span className="text-xs text-muted-foreground">
                  Build a new event routing flow
                </span>
              </Button>
            </Link>
            <Link href="/dashboard/destinations/new">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-2 p-6"
              >
                <Zap className="h-8 w-8" />
                <span className="font-semibold">Add Destination</span>
                <span className="text-xs text-muted-foreground">
                  Connect to Slack, Discord, etc.
                </span>
              </Button>
            </Link>
            <Link href="/dashboard/playground">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-2 p-6"
              >
                <Activity className="h-8 w-8" />
                <span className="font-semibold">Test Webhook</span>
                <span className="text-xs text-muted-foreground">
                  Try the webhook playground
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
