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

export default function FlowsListPage() {
  const flows = [
    {
      id: "1",
      name: "GitHub to Slack",
      description: "Forward GitHub push events to Slack #engineering",
      status: "active",
      eventsToday: 234,
      successRate: 98.5,
      lastRun: "2 min ago",
    },
    {
      id: "2",
      name: "Stripe to CRM",
      description: "Sync Stripe payments to your CRM",
      status: "active",
      eventsToday: 89,
      successRate: 100,
      lastRun: "5 min ago",
    },
    {
      id: "3",
      name: "Form to Email",
      description: "Send form submissions via email",
      status: "paused",
      eventsToday: 12,
      successRate: 95.2,
      lastRun: "1 hour ago",
    },
  ];

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
            key={flow.id}
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
                    <CardDescription>{flow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flow.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {flow.status}
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold">{flow.eventsToday}</div>
                  <div className="text-xs text-muted-foreground">
                    Events Today
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    {flow.successRate}%
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Success Rate
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">{flow.lastRun}</div>
                  <div className="text-xs text-muted-foreground">Last Run</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/flows/${flow.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Flow
                  </Button>
                </Link>
                <Button variant="ghost" size="icon">
                  {flow.status === "active" ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
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
