"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook for managing workspaces
 */
export function useWorkspace() {
  const queryClient = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create workspace");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return {
    createWorkspace,
  };
}
