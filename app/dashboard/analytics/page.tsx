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
      console.log("Analytics API response:", result);
      if (result?.kpis) {
        console.log("Avg Response Time:", result.kpis.avgResponseTime);
      }

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
    <div className="space-y-8">
      {/* Page header with gradient */}
      <div className="relative">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Analytics
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Zap className="h-3 w-3" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-muted-foreground text-base md:text-lg mt-2">
              Deep insights into your event flows and system performance
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards with gradient effects */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {data?.kpis.totalEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
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
            <div className="text-3xl font-bold mb-1">
              {data?.kpis.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.kpis.successRate}% of executions
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {data?.kpis.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average execution time
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Flows
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1">
              {data?.kpis.activeFlows}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern charts and tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">By Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-20 pointer-events-none z-0" />
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
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-20 pointer-events-none z-0" />
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

            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-20 pointer-events-none z-0" />
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
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-20 pointer-events-none z-0" />
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
      </Tabs>
    </div>
  );
}
