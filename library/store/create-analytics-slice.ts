import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type AnalyticsState = {
  completedIndexes: number;
  scenesProcessed: number;
  updateStats: (scenesCount: number) => void;
};

export default persist(
  immer<AnalyticsState>((set) => ({
    completedIndexes: 0,
    scenesProcessed: 0,

    updateStats: (scenesCount: number) =>
      set((state) => {
        state.completedIndexes += 1; // Increment caption count by 1
        state.scenesProcessed += scenesCount; // Add the number of scenes processed
      }),
  })),
  {
    name: "analytics-storage",
    storage: createJSONStorage(() => localStorage),
  }
);
