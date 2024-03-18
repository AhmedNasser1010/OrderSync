import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'user',
  initialState: {
    disableMenuDnD: false
  },
  reducers: {
    setDisableMenuDnD: (state, { payload }) => {
      return {...state, disableMenuDnD: payload};
    }
  },
})


export const {
  setDisableMenuDnD
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;