import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { MainTabTypes } from "@/types/orders";

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
    result: {
      type: "success" | "error" | null;
      text: string;
    };
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
    result: {
      type: null,
      text: ""
    },
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
    }
  },
});

export const {
  setDeletePopup,
  setCloseDayPopup,
  setActiveTab,
  setOptionsMenuView,
} = toggleSlice.actions;

export const deletePopup = (state: RootState) => state.toggle.deletePopup;
export const closeDayPopup = (state: RootState) => state.toggle.closeDayPopup;
export const activeTab = (state: RootState) => state.toggle.activeTab;
export const optionMenuView = (state: RootState) => state.toggle.optionsMenuView;

export default toggleSlice.reducer;
