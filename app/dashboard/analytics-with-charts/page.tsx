"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
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

// Sample data - replace with real data from API
const eventVolumeData = [
  { time: "00:00", events: 120 },
  { time: "04:00", events: 45 },
  { time: "08:00", events: 280 },
  { time: "12:00", events: 456 },
  { time: "16:00", events: 623 },
  { time: "20:00", events: 312 },
];

const successFailureData = [
  { name: "Success", value: 24132, color: "hsl(var(--primary))" },
  { name: "Failed", value: 368, color: "hsl(var(--destructive))" },
];

const flowPerformanceData = [
  { name: "GitHub to Slack", events: 2340 },
  { name: "Stripe to CRM", events: 1890 },
  { name: "Form to Email", events: 450 },
  { name: "Custom Webhook", events: 1200 },
];

export default function AnalyticsPageWithCharts() {
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
            <CardTitle className="text-3xl">24.5K</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Success Rate
            </CardDescription>
            <CardTitle className="text-3xl">98.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">234ms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-destructive flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              +15ms from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Flows</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3 from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Event Volume (Last 24 Hours)</CardTitle>
          <CardDescription>Events processed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventVolumeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Success vs Failures */}
        <Card>
          <CardHeader>
            <CardTitle>Success vs Failures</CardTitle>
            <CardDescription>Event execution outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={successFailureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {successFailureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Flow Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Flow Performance</CardTitle>
            <CardDescription>Events by flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={flowPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="events" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
