import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    enableNavigationBar: true,
    disableMenuDnD: false,
    saveToCloudBtnStatus: 'ON_SAVED',
    settingsSaveToCloude: 'ON_SAVED',
    savingOrdersTimer: 5,
    userRegisterStatus: 'LOGGED_OUT',
    isGetAppData: null,
    discountDialog: {
      isOpen: false,
      id: '',
      type: ''
    },
    printedOrders: []
  },
  reducers: {
    enableNavigationBar: (state, { payload }) => {
      // return state.enableNavigationBar = payload
      return { ...state, enableNavigationBar: payload }
    },
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
    },
    setDiscountDialog: (state, { payload }) => {
      return { ...state, discountDialog: payload }
    },
    setPrintedOrders: (state, { payload }) => {
      return { ...state, printedOrders: [...state.printedOrders, payload] }
    }
  },
})


export const {
  enableNavigationBar,
  setDisableMenuDnD,
  setSaveToCloudBtnStatus,
  setSettingsSaveToCloudeStatus,
  decreaseSavingOrdersTimer,
  resetSavingOrdersTimer,
  savingOrdersTimerIsLoading,
  setUserRegisterStatus,
  setIsGetAppData,
  setDiscountDialog,
  setPrintedOrders
} = conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;