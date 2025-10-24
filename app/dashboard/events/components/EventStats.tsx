"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventStatsProps {
  totalEvents: number;
  successRate: number;
  avgResponseTime: string;
  activeFlows: number;
}

export function EventStats({
  totalEvents,
  successRate,
  avgResponseTime,
  activeFlows,
}: EventStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Events Today</CardDescription>
          <CardTitle className="text-3xl">
            {totalEvents.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="text-3xl text-primary">
            {successRate}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Avg Response Time</CardDescription>
          <CardTitle className="text-3xl">{avgResponseTime}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Active Flows</CardDescription>
          <CardTitle className="text-3xl">{activeFlows}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
