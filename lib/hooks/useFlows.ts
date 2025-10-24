"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flow } from "@/lib/types";

export function useFlows(workspaceId?: string) {
  return useQuery({
    queryKey: ["flows", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspaceId", workspaceId);

      const response = await fetch(`/api/flows?${params}`);
      if (!response.ok) throw new Error("Failed to fetch flows");

      const data = await response.json();
      return data.documents as Flow[];
    },
    enabled: !!workspaceId,
  });
}

export function useFlow(flowId?: string) {
  return useQuery({
    queryKey: ["flows", flowId],
    queryFn: async () => {
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) throw new Error("Failed to fetch flow");

      return (await response.json()) as Flow;
    },
    enabled: !!flowId,
  });
}

export function useCreateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      workspaceId: string;
      nodes?: any[];
      edges?: any[];
    }) => {
      const response = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create flow");
      return (await response.json()) as Flow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

export function useUpdateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flowId,
      data,
    }: {
      flowId: string;
      data: Partial<Flow>;
    }) => {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update flow");
      return (await response.json()) as Flow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      queryClient.invalidateQueries({ queryKey: ["flows", variables.flowId] });
    },
  });
}

export function useDeleteFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flowId: string) => {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flow");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}
