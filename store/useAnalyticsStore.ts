import { create } from "zustand";

interface AnalyticsStore {
  timeRange: "24h" | "7d" | "30d" | "90d";
  setTimeRange: (range: "24h" | "7d" | "30d" | "90d") => void;
  selectedFlow: string | null;
  setSelectedFlow: (id: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  timeRange: "24h",
  setTimeRange: (range) => set({ timeRange: range }),
  selectedFlow: null,
  setSelectedFlow: (id) => set({ selectedFlow: id }),
}));
