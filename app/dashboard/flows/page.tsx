"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  GitBranch,
  Play,
  Pause,
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFlows } from "@/lib/hooks/useFlows";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";

export default function FlowsListPage() {
  const { workspace } = useAuth();
  const { data: flowsData, isLoading, error } = useFlows(workspace?.$id);
  const flows = flowsData || [];

  console.log("🔍 Flows page debug:", {
    workspace: workspace?.$id,
    flowsData,
    isLoading,
    error,
    flowsCount: flows.length,
  });

  if (isLoading) {
    return <PageLoading text="Loading flows..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flows</h1>
            <p className="text-destructive mt-2">
              Error loading flows: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flows</h1>
          <p className="text-muted-foreground mt-2">
            Manage your event routing flows
          </p>
        </div>
        <Link href="/dashboard/flows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
        </Link>
      </div>

      {/* Flows Grid */}
      <div className="grid grid-cols-1 gap-6">
        {flows.map((flow) => (
          <Card
            key={flow.$id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{flow.name}</CardTitle>
                    <CardDescription>
                      {flow.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={flow.status === "active" ? "default" : "secondary"}
                  >
                    {flow.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Webhook URL
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block truncate">
                    {flow.webhook_url}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm mt-1">
                    {new Date(
                      flow.$createdAt || flow.created_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/flows/${flow.$id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Configure Flow
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state for when there are no flows */}
      {flows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flows yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first flow to start routing events
            </p>
            <Link href="/dashboard/flows/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Flow
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
