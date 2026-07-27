import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import loadFromLocalStorage from "@/utilities/loadFromLocalStorage";
import saveToLocalStorage from "@/utilities/saveToLocalStorage";

type Toggle = {
  theme: "light" | "dark";
};

const initialState: Toggle = {
  theme: "light",
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
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

export const { initTheme, setTheme } = toggleSlice.actions;

export const selectTheme = (state: RootState) => state.toggle.theme;

export default toggleSlice.reducer;
