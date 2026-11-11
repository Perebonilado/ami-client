import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { amiApi } from "./api";
import { withFixedRandom } from "./fixed-random";
import { session } from "./session";

/** One store per browser tab (created in StoreProvider), never shared between server requests. */
export function makeStore() {
  return withFixedRandom(() =>
    configureStore({
      reducer: {
        [amiApi.reducerPath]: amiApi.reducer,
        [session.name]: session.reducer,
      },
      middleware: (getDefault) => getDefault().concat(amiApi.middleware),
    }),
  );
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
