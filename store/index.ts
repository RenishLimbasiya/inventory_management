import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import movementReducer from "./movementSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    movements: movementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
