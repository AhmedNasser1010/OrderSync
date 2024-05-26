import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'user',
  initialState: {
    disableMenuDnD: false,
    saveToCloudBtnStatus: 'ON_SAVED',
    savingOrdersTimer: 5
  },
  reducers: {
    setDisableMenuDnD: (state, { payload }) => {
      return { ...state, disableMenuDnD: payload };
    },
    setSaveToCloudBtnStatus: (state, { payload }) => {
      return { ...state, saveToCloudBtnStatus: payload }
    },
    decreaseSavingOrdersTimer: (state, { payload }) => {
      return { ...state, savingOrdersTimer: state.savingOrdersTimer-1 }
    },
    resetSavingOrdersTimer: (state, { payload }) => {
      return { ...state, savingOrdersTimer: 5 }
    },
    savingOrdersTimerIsLoading: (state, { payload }) => {
      return { ...state, savingOrdersTimer: 'Saving' }
    }
  },
})


export const {
  setDisableMenuDnD,
  setSaveToCloudBtnStatus,
  decreaseSavingOrdersTimer,
  resetSavingOrdersTimer,
  savingOrdersTimerIsLoading
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;