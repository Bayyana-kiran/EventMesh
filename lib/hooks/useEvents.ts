"use client";

import { useQuery } from "@tanstack/react-query";
import { Event } from "@/lib/types";

export function useEvents(options?: {
  workspaceId?: string;
  flowId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["events", options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.workspaceId)
        params.append("workspaceId", options.workspaceId);
      if (options?.flowId) params.append("flowId", options.flowId);
      if (options?.limit) params.append("limit", options.limit.toString());

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      return data.documents as Event[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useEvent(eventId?: string) {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");

      return (await response.json()) as Event;
    },
    enabled: !!eventId,
  });
}
