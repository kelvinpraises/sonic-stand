import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type AnalyticsState = {
  completedCaptions: number;
  scenesProcessed: number;
  updateStats: (scenesCount: number) => void;
};

export default persist(
  immer<AnalyticsState>((set) => ({
    completedCaptions: 0,
    scenesProcessed: 0,

    updateStats: (scenesCount: number) =>
      set((state) => {
        state.completedCaptions += 1; // Increment caption count by 1
        state.scenesProcessed += scenesCount; // Add the number of scenes processed
      }),
  })),
  {
    name: "analytics-storage",
    storage: createJSONStorage(() => localStorage),
  }
);
