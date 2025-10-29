"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import { GitBranch, TrendingUp, Activity } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";

interface Event {
  $id: string;
  $createdAt: string;
  flow_id: string;
  flow_name: string;
  webhook_url: string;
  payload: string;
  headers: string;
  status: string;
  error_message?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeFlows: 0,
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(
    async (pageNum = page) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/events?limit=${pageSize}&page=${pageNum}`
        );
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);

          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayEvents = data.events.filter((e: Event) => {
            const eventDate = new Date(e.$createdAt);
            return eventDate >= today;
          });

          const successfulEvents = data.events.filter(
            (e: Event) => e.status === "pending" || e.status === "processing"
          );

          const uniqueFlows = new Set(data.events.map((e: Event) => e.flow_id));

          setStats({
            total: data.total,
            today: todayEvents.length,
            successRate:
              data.events.length > 0
                ? Math.round(
                    (successfulEvents.length / data.events.length) * 100
                  )
                : 0,
            avgResponseTime: 245, // TODO: Calculate from actual execution data
            activeFlows: uniqueFlows.size,
          });
          setTotalPages(Math.max(1, Math.ceil((data.total || 0) / pageSize)));
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchEvents(page);
  }, [fetchEvents, page]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getPayloadPreview = (payloadStr: string) => {
    try {
      const payload = JSON.parse(payloadStr);
      // Get first key-value pair as preview
      const keys = Object.keys(payload);
      if (keys.length > 0) {
        return `${keys[0]}: ${JSON.stringify(payload[keys[0]]).substring(
          0,
          30
        )}...`;
      }
      return "Empty payload";
    } catch {
      return "Invalid payload";
    }
  };

  return (
    <div className="space-y-8">
      {/* Subtle glow effect */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Events
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
              <Zap className="h-3 w-3" />
              <span>Stream</span>
            </div>
          </div>
          <p className="text-muted-foreground text-base md:text-lg mt-2">
            Real-time event stream and history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/playground">
            <Button variant="ghost" size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Playground
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-3xl font-bold mb-1">{stats.today}</div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
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
            <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Flows
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">{stats.activeFlows}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-20 pointer-events-none z-0" />
        <CardHeader className="relative z-10">
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest webhook events processed</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {loading ? (
            <PageLoading text="Loading events..." />
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events yet. Send a webhook to create your first event!
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {events.map((event) => {
                  const statusClasses = cn(
                    "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-1",
                    event.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : event.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : event.status === "processing" ||
                        event.status === "running"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  );

                  return (
                    <Link
                      key={event.$id}
                      href={`/dashboard/events/${event.$id}`}
                      className="group block relative overflow-hidden p-4 rounded-lg border border-border/50 hover:border-yellow-500/50 transition-all duration-200 hover:shadow-md hover:shadow-yellow-500/5 bg-card/50 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                              event.status === "failed"
                                ? "bg-destructive/10"
                                : "bg-yellow-500/10"
                            )}
                          >
                            {event.status === "failed" ? (
                              <XCircle className="h-5 w-5 text-destructive" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate group-hover:text-primary transition-colors">
                              {event.flow_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="truncate max-w-[220px]">
                                {getPayloadPreview(event.payload)}
                              </span>
                              <ArrowRight className="h-3 w-3" />
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {event.$id.slice(0, 8)}
                              </span>
                            </div>
                            {event.error_message && (
                              <div className="text-xs text-destructive mt-1 truncate">
                                {event.error_message}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={statusClasses}>
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                event.status === "completed" && "bg-primary",
                                event.status === "failed" && "bg-destructive",
                                (event.status === "processing" ||
                                  event.status === "running") &&
                                  "bg-blue-500 animate-pulse"
                              )}
                            />
                            <span className="capitalize">{event.status}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatTimestamp(event.$createdAt)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
