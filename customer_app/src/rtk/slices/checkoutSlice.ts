import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CheckoutState {
  comment?: string;
  user?: {
    name: string | null;
    phone: string | null;
    secondPhone: string | null;
  };
  location?: {
    latlng?: (number | null)[];
    address?: string;
  };
  payment?: {
    method: string;
  };
  [key: string]: unknown;
}

const initialState: CheckoutState = {
  comment: "",
  user: {
    name: null,
    phone: null,
    secondPhone: null,
  },
  location: {
    latlng: [null, null],
    address: "",
  },
  payment: {
    method: "CASH",
  },
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    clearCheckout: () => {
      return {
        comment: "",
        user: {
          name: null,
          phone: null,
          secondPhone: null,
        },
        location: {
          latlng: [null, null],
          address: "",
        },
        payment: {
          method: "CASH",
        },
      };
    },
    addCheckout: (state, { payload }: PayloadAction<Partial<CheckoutState>>) => {
      return {
        ...state,
        ...payload,
      };
    },
    addToUserLocation: (
      state,
      { payload }: PayloadAction<Partial<{ latlng: number[]; address: string }>>
    ) => {
      return {
        ...state,
        location: {
          ...state.location,
          ...payload,
        },
      };
    },
  },
});

export const { clearCheckout, addCheckout, addToUserLocation } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
