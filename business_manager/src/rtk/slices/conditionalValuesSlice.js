import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'user',
  initialState: {
    disableMenuDnD: false,
    saveToCloudBtnStatus: 'ON_SAVED',
  },
  reducers: {
    setDisableMenuDnD: (state, { payload }) => {
      return { ...state, disableMenuDnD: payload };
    },
    setSaveToCloudBtnStatus: (state, { payload }) => {
      return { ...state, saveToCloudBtnStatus: payload }
    }
  },
})


export const {
  setDisableMenuDnD,
  setSaveToCloudBtnStatus
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;