"use client";

import { useEffect, useState } from "react";
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
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events?limit=50");
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
              ? Math.round((successfulEvents.length / data.events.length) * 100)
              : 0,
          avgResponseTime: 245, // TODO: Calculate from actual execution data
          activeFlows: uniqueFlows.size,
        });
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-2">
            Real-time event stream and history
          </p>
        </div>
        <Button onClick={fetchEvents} disabled={loading} size="sm">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Events Today</CardDescription>
            <CardTitle className="text-3xl">{stats.today}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.successRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Flows</CardDescription>
            <CardTitle className="text-3xl">{stats.activeFlows}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest webhook events processed</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events yet. Send a webhook to create your first event!
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.$id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        event.status === "failed"
                          ? "bg-destructive/10"
                          : "bg-primary/10"
                      }`}
                    >
                      {event.status === "failed" ? (
                        <XCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{event.flow_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="truncate max-w-[200px]">
                          {getPayloadPreview(event.payload)}
                        </span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-mono text-xs">
                          {event.status}
                        </span>
                      </div>
                      {event.error_message && (
                        <div className="text-xs text-destructive mt-1">
                          {event.error_message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatTimestamp(event.$createdAt)}
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
