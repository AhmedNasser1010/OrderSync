import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import loadFromLocalStorage from "@/utilities/loadFromLocalStorage";
import saveToLocalStorage from "@/utilities/saveToLocalStorage";

type Toggle = {
  timeRange: string;
  customDateRange: { start: string; end: string };
  theme: "light" | "dark";
};

const initialState: Toggle = {
  timeRange: "7",
  customDateRange: { start: "", end: "" },
  theme: "light",
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    initTimeRange: (state) => {
      state.timeRange = loadFromLocalStorage("timeRange");
    },
    setTimeRange: (state, { payload }) => {
      saveToLocalStorage("timeRange", payload);
      state.timeRange = payload;
    },
    setCustomDateRange: (state, { payload }) => {
      state.customDateRange = payload;
    },
    initTheme: (state) => {
      const saved = loadFromLocalStorage("theme");
      if (saved === "dark" || saved === "light") {
        state.theme = saved;
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        state.theme = "dark";
      }
    },
    setTheme: (state, { payload }: { payload: "light" | "dark" }) => {
      saveToLocalStorage("theme", payload);
      state.theme = payload;
    },
  },
});

export const {
  initTimeRange,
  setTimeRange,
  setCustomDateRange,
  initTheme,
  setTheme,
} = toggleSlice.actions;

export const timeRange = (state: RootState) => state.toggle.timeRange;
export const customDateRange = (state: RootState) => state.toggle.customDateRange;
export const selectTheme = (state: RootState) => state.toggle.theme;

export default toggleSlice.reducer;
