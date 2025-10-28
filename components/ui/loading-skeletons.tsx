"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlowListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="relative overflow-hidden border-border/50 bg-card/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div>
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 to-transparent" />
          <div className="relative flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="relative flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="relative overflow-hidden border-border/50 bg-card/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardHeader className="relative pb-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-9 w-20" />
          </CardHeader>
          <CardContent className="relative">
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// New comprehensive dashboard loader
export function DashboardFullLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <DashboardStatsSkeleton />

      {/* Flows and Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-border/50 bg-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />
          <CardHeader className="relative">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="relative space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-50" />
          <CardHeader className="relative">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="relative space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-20 rounded-full ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border/50"
              >
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
