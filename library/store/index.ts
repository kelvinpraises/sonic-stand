import { create } from "zustand";
import { devtools } from "zustand/middleware";

import createAnalyticsSlice from "./create-analytics-slice";

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<[typeof createAnalyticsSlice]>;

const useStore = create<State>()(
  devtools(
    (set, get, store) => ({
      ...createAnalyticsSlice(set, get, store),
    }),
    { name: "SonicStand" }
  )
);

export default useStore;
