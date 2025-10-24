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

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary">+2</span> from last month
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary">+12%</span> from yesterday
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
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary">+0.5%</span> from last week
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
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-destructive">+15ms</span> from last hour
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
              {[
                { name: "GitHub to Slack", status: "active", events: "234" },
                { name: "Stripe to CRM", status: "active", events: "89" },
                { name: "Form to Email", status: "paused", events: "12" },
              ].map((flow, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
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
                        {flow.events} events today
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
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
              {[
                {
                  source: "GitHub",
                  type: "push",
                  status: "success",
                  time: "2 min ago",
                },
                {
                  source: "Stripe",
                  type: "payment.succeeded",
                  status: "success",
                  time: "5 min ago",
                },
                {
                  source: "Custom",
                  type: "user.signup",
                  status: "failed",
                  time: "12 min ago",
                },
              ].map((event, i) => (
                <div
                  key={i}
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
                        event.status === "success"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {event.status}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
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
