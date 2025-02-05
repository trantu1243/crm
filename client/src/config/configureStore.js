import { configureStore } from "@reduxjs/toolkit";
import reducers from "../reducers";

export default function configureAppStore() {
  return configureStore({
    reducer: {
      ...reducers,
    },
  });
}
