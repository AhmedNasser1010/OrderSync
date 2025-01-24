import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import loadFromLocalStorage from "@/utilities/loadFromLocalStorage";
import saveToLocalStorage from "@/utilities/saveToLocalStorage";

type Toggle = {
  timeRange: string;
};

const initialState: Toggle = {
  timeRange: "7"
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
  },
});

export const {
  initTimeRange,
  setTimeRange
} = toggleSlice.actions;

export const timeRange = (state: RootState) => state.toggle.timeRange;

export default toggleSlice.reducer;
