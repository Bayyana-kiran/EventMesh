"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

export default function AnalyticsPage() {
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

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">By Flow</TabsTrigger>
          <TabsTrigger value="destinations">By Destination</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Volume</CardTitle>
              <CardDescription>Events processed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be rendered here using Recharts
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Success vs Failures</CardTitle>
                <CardDescription>Event execution outcomes</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                Pie chart will be rendered here
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                Histogram will be rendered here
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Performance</CardTitle>
              <CardDescription>Events by flow</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              Bar chart will be rendered here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Activity</CardTitle>
              <CardDescription>Events by destination</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              Bar chart will be rendered here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
