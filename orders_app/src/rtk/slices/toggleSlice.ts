import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { MainTabTypes } from "@/types/components";

type Toggle = {
  deletePopup: {
    isOpen: boolean;
    orderId: string | null;
    cancellationReason: string | null;
    error: string | null;
  };
  closeDayPopup: {
    isOpen: boolean;
    isLoading: boolean;
    errors: {
      noQueue: {
        isPassed: boolean;
        text: string;
      };
      hasCompletedOrders: {
        isPassed: boolean;
        text: string;
      };
    };
  };
  activeTab: MainTabTypes;
  optionsMenuView: boolean;
  isAuthLoading: boolean;
};

const initialState: Toggle = {
  deletePopup: {
    isOpen: false,
    orderId: null,
    cancellationReason: null,
    error: null,
  },
  closeDayPopup: {
    isOpen: false,
    isLoading: true,
    errors: {
      noQueue: {
        isPassed: false,
        text: ""
      },
      hasCompletedOrders: {
        isPassed: false,
        text: ""
      }
    },
  },
  activeTab: "RECEIVED",
  optionsMenuView: false,
  isAuthLoading: true
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    setDeletePopup(state, { payload }) {
      state.deletePopup = { ...state.deletePopup, ...payload };
    },
    setCloseDayPopup(state, { payload }) {
      state.closeDayPopup = { ...state.closeDayPopup, ...payload };
    },
    setActiveTab(state, { payload }) {
      state.activeTab = payload;
    },
    setOptionsMenuView(state, { payload }) {
      state.optionsMenuView = payload;
    },
    setIsAuthLoading(state, { payload }) {
      state.isAuthLoading = payload;
    }
  },
});

export const {
  setDeletePopup,
  setCloseDayPopup,
  setActiveTab,
  setOptionsMenuView,
  setIsAuthLoading
} = toggleSlice.actions;

export const deletePopup = (state: RootState) => state.toggle.deletePopup;
export const closeDayPopup = (state: RootState) => state.toggle.closeDayPopup;
export const activeTab = (state: RootState) => state.toggle.activeTab;
export const optionMenuView = (state: RootState) => state.toggle.optionsMenuView;
export const isAuthLoadingStatus = (state: RootState) => state.toggle.isAuthLoading;

export default toggleSlice.reducer;
