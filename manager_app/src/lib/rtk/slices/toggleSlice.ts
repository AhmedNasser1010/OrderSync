import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type Toggle = {};

const initialState: Toggle = {};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {

  },
});

// export const {
// } = toggleSlice.actions;

// export const deletePopup = (state: RootState) => state.toggle.deletePopup;

export default toggleSlice.reducer;
