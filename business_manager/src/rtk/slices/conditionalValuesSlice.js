import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    disableMenuDnD: false,
    saveToCloudBtnStatus: 'ON_SAVED',
    settingsSaveToCloude: 'ON_SAVED',
    savingOrdersTimer: 5
  },
  reducers: {
    setDisableMenuDnD: (state, { payload }) => {
      return { ...state, disableMenuDnD: payload };
    },
    setSaveToCloudBtnStatus: (state, { payload }) => {
      return { ...state, saveToCloudBtnStatus: payload }
    },
    setSettingsSaveToCloudeStatus: (state, { payload }) => {
      return { ...state, settingsSaveToCloude: payload }
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
  setSettingsSaveToCloudeStatus,
  decreaseSavingOrdersTimer,
  resetSavingOrdersTimer,
  savingOrdersTimerIsLoading
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;