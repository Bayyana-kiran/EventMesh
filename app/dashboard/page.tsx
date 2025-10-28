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
import {
  Plus,
  GitBranch,
  Zap,
  TrendingUp,
  Activity,
  Send,
  ArrowRight,
  Inbox,
  Sparkles,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent className="relative">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flows and Events Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent" />
              <CardHeader className="relative">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="relative space-y-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent" />
          <CardHeader className="relative">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border"
                >
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      {/* Page header with gradient */}
      <div className="relative">
        {/* Subtle glow effect */}
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Dashboard
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              Welcome back! Here's what's happening with your event flows.
            </p>
          </div>
          <Link href="/dashboard/flows/new">
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Flow</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards with gradient effects */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Flows
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {stats?.totalFlows || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-semibold">
                {stats?.activeFlows || 0}
              </span>{" "}
              active flows
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Today
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {stats?.eventsToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  "font-semibold",
                  parseFloat(stats?.eventsChange || "0") >= 0
                    ? "text-primary"
                    : "text-destructive"
                )}
              >
                {parseFloat(stats?.eventsChange || "0") >= 0 ? "+" : ""}
                {stats?.eventsChange}%
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">{stats?.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalEvents || 0} total events
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Latency
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {stats?.avgLatency || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Last 50 executions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent flows and events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">
                  Recent Flows
                </CardTitle>
                <CardDescription className="mt-1">
                  Your most recently created event flows
                </CardDescription>
              </div>
              <Link href="/dashboard/flows">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {recentFlows.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                      <GitBranch className="h-8 w-8 text-purple-500/50" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No flows yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first flow to get started
                  </p>
                  <Link href="/dashboard/flows/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Flow
                    </Button>
                  </Link>
                </div>
              ) : (
                recentFlows.map((flow) => (
                  <Link key={flow.id} href={`/dashboard/flows/${flow.id}`}>
                    <div className="group relative overflow-hidden p-4 rounded-lg border border-border/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-purple-500/5">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full transition-all",
                              flow.status === "active"
                                ? "bg-primary shadow-lg shadow-primary/50 animate-pulse"
                                : "bg-muted-foreground"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate group-hover:text-primary transition-colors">
                              {flow.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <Zap className="h-3 w-3 inline mr-1" />
                              {flow.eventsToday} events today
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-50" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">
                  Recent Events
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest events processed
                </CardDescription>
              </div>
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                      <Inbox className="h-8 w-8 text-yellow-500/50" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No events yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Send a webhook to see events here
                  </p>
                  <Link href="/dashboard/playground">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Play className="h-4 w-4" />
                      Try Playground
                    </Button>
                  </Link>
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative overflow-hidden p-4 rounded-lg border border-border/50 hover:border-yellow-500/50 transition-all duration-200 hover:shadow-md hover:shadow-yellow-500/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <p className="font-semibold truncate">
                            {event.source}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-1",
                            event.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : event.status === "failed"
                              ? "bg-destructive/10 text-destructive"
                              : event.status === "running"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              event.status === "completed" && "bg-primary",
                              event.status === "failed" && "bg-destructive",
                              event.status === "running" &&
                                "bg-blue-500 animate-pulse"
                            )}
                          />
                          {event.status}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions with modern design */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="relative">
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          <CardDescription className="mt-1">
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/dashboard/flows/new">
              <div className="group relative overflow-hidden h-full p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GitBranch className="h-7 w-7 text-purple-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-base block mb-1 group-hover:text-primary transition-colors">
                      Create New Flow
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Build a new event routing flow
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/destinations/new">
              <div className="group relative overflow-hidden h-full p-6 rounded-lg border border-border/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="h-7 w-7 text-green-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-base block mb-1 group-hover:text-green-500 transition-colors">
                      Add Destination
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Connect to Slack, Discord, etc.
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/playground">
              <div className="group relative overflow-hidden h-full p-6 rounded-lg border border-border/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 text-cyan-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-base block mb-1 group-hover:text-cyan-500 transition-colors">
                      Test Webhook
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Try the webhook playground
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
