import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    disableMenuDnD: false,
    saveToCloudBtnStatus: 'ON_SAVED',
    settingsSaveToCloude: 'ON_SAVED',
    savingOrdersTimer: 5,
    userRegisterStatus: 'LOGGED_OUT',
    isGetAppData: null
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
    },
    setUserRegisterStatus: (state, { payload }) => {
      return { ...state, userRegisterStatus: payload }
    },
    setIsGetAppData: (state, { payload }) => {
      return { ...state, isGetAppData: payload }
    }
  },
})


export const {
  setDisableMenuDnD,
  setSaveToCloudBtnStatus,
  setSettingsSaveToCloudeStatus,
  decreaseSavingOrdersTimer,
  resetSavingOrdersTimer,
  savingOrdersTimerIsLoading,
  setUserRegisterStatus,
  setIsGetAppData
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;