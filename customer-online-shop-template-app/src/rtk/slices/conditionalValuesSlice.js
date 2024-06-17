import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    cartWindow: false
  },
  reducers: {
    toggleCartWindow: (state, { payload }) => {
      return { ...state, cartWindow: !state.cartWindow };
    }
  },
})


export const {
  toggleCartWindow
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;