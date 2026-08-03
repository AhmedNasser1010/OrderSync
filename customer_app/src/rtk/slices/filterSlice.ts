import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FiltersState = string[];

const initialState: FiltersState = [];

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    addFilter: (state, { payload }: PayloadAction<string>) => {
      return [...state, payload];
    },
    removeFilter: (state, { payload }: PayloadAction<string>) => {
      return state.filter((filter) => filter !== payload);
    },
    clearAll: () => {
      return [];
    },
    deleteAllExcepts: (state, { payload }: PayloadAction<string[]>) => {
      return state.filter((filter) => payload.includes(filter));
    },
  },
});

export const { addFilter, removeFilter, clearAll, deleteAllExcepts } =
  filterSlice.actions;

export default filterSlice.reducer;
