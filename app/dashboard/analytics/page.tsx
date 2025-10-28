"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Activity, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageLoading } from "@/components/ui/loading";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  kpis: {
    totalEvents: number;
    successRate: string;
    avgResponseTime: number;
    activeFlows: number;
  };
  eventsOverTime: { date: string; count: number }[];
  successVsFailures: {
    completed: number;
    failed: number;
    pending: number;
  };
  flowPerformance: {
    flowId: string;
    flowName: string;
    events: number;
    successRate: string;
    avgDuration: number;
  }[];
  responseTimeDistribution: {
    "0-100ms": number;
    "100-300ms": number;
    "300-500ms": number;
    "500ms+": number;
  };
}

const COLORS = {
  primary: "hsl(var(--primary))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
};

export default function AnalyticsPage() {
  const { workspace } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!workspace?.$id) {
      setError("No workspace selected");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("workspaceId", workspace.$id);
      params.append("days", "7");

      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [workspace?.$id]);

  useEffect(() => {
    if (workspace?.$id) {
      fetchAnalytics();
      // Refresh every 60 seconds
      const interval = setInterval(fetchAnalytics, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [workspace?.$id, fetchAnalytics]);

  if (loading) {
    return <PageLoading text="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-destructive mt-2">{error}</p>
        </div>
      </div>
    );
  }
  // Prepare pie chart data
  const pieData = [
    {
      name: "Completed",
      value: data?.successVsFailures.completed || 0,
      color: COLORS.success,
    },
    {
      name: "Failed",
      value: data?.successVsFailures.failed || 0,
      color: COLORS.danger,
    },
    {
      name: "Pending",
      value: data?.successVsFailures.pending || 0,
      color: COLORS.warning,
    },
  ];

  // Prepare distribution data
  const distributionData = Object.entries(
    data?.responseTimeDistribution || {}
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track performance and insights
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Events
            </CardDescription>
            <CardTitle className="text-3xl">
              {data?.kpis.totalEvents || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Success Rate
            </CardDescription>
            <CardTitle className="text-3xl">
              {data?.kpis.successRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {data?.kpis.successRate}% of executions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">
              {data?.kpis.avgResponseTime}ms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Average execution time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Flows</CardDescription>
            <CardTitle className="text-3xl">{data?.kpis.activeFlows}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Currently active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">By Flow</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Volume</CardTitle>
              <CardDescription>
                Events processed over time (last 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.eventsOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    name="Events"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Success vs Failures</CardTitle>
                <CardDescription>Event execution outcomes</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: unknown) => {
                        const e = entry as { name?: string; value?: number };
                        const total =
                          pieData.reduce((sum, p) => sum + p.value, 0) || 1;
                        return `${e.name ?? ""}: ${(
                          ((e.value ?? 0) / total) *
                          100
                        ).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS.info} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Performance</CardTitle>
              <CardDescription>Events processed by each flow</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.flowPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="flowName" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="events" fill={COLORS.primary} name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Execution Metrics</CardTitle>
              <CardDescription>
                Success rate and average duration by flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data?.flowPerformance || []).map((flow) => (
                  <div
                    key={flow.flowId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{flow.flowName}</p>
                      <p className="text-sm text-muted-foreground">
                        {flow.events} events processed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm font-medium">
                            {flow.successRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Success
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {Math.round(flow.avgDuration)}ms
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avg Duration
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.flowPerformance ||
                  data.flowPerformance.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No flow data yet</p>
                    <p className="text-xs mt-1">
                      Create flows and send events to see metrics
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
