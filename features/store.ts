import { configureStore } from "@reduxjs/toolkit";

// import rootReducer from './rootReducer'
import baseReducer from "./slices/base";

export const store = configureStore({
  reducer: {
    // root: rootReducer,,
    base: baseReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
