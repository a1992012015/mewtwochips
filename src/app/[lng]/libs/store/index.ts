import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "@/app/[lng]/libs/store/features/counter/counterSlice";
import virtuosoWidthReducer from "@/app/[lng]/libs/store/features/virtuosoWidthSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      virtuoso: virtuosoWidthReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
