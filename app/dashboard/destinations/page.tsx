"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Webhook, MessageSquare, Mail, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthContext";

interface Destination {
  id: string;
  flowId: string;
  flowName: string;
  nodeId: string;
  name: string;
  type: string;
  url: string;
  status: string;
  eventsToday: number;
}

export default function DestinationsPage() {
  const { workspace } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, eventsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspace?.$id) {
      fetchDestinations();
      const interval = setInterval(fetchDestinations, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [workspace?.$id]);

  const fetchDestinations = async () => {
    if (!workspace?.$id) {
      setError("No workspace selected");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("workspaceId", workspace.$id);

      const response = await fetch(`/api/destinations?${params}`);
      const data = await response.json();

      if (data.success) {
        setDestinations(data.destinations);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch destinations");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <MessageSquare className="h-5 w-5" />;
      case "discord":
        return <MessageSquare className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "webhook":
        return <Webhook className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-destructive mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground mt-2">
            Manage where your events are delivered
          </p>
        </div>
        <Link href="/dashboard/flows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Destinations</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {stats.active}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Events Delivered Today</CardDescription>
            <CardTitle className="text-3xl">{stats.eventsToday}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinations.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Webhook className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  No destinations configured
                </p>
                <p className="text-sm mb-4">
                  Add destination nodes to your flows to see them here
                </p>
                <Link href="/dashboard/flows/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Flow
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          destinations.map((destination) => (
            <Card
              key={destination.id}
              className="hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getIcon(destination.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {destination.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {destination.url || destination.flowName}
                      </CardDescription>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      destination.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {destination.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {destination.eventsToday}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Events Today
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/flows/${destination.flowId}`}>
                      <Button variant="outline" size="sm">
                        View Flow
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {destination.type.toUpperCase()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Flow: {destination.flowName}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
