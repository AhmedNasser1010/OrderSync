import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  balance: number;
  credits?: Array<{
    id: string;
    amount: number;
    expiresAt: number;
    source: string;
    orderId?: string;
  }>;
  loaded: boolean;
}

const initialState: WalletState = {
  balance: 0,
  loaded: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    initWallet(
      state,
      action: PayloadAction<{
        balance: number;
        credits?: WalletState["credits"];
      }>
    ) {
      state.balance = action.payload.balance;
      if (action.payload.credits) state.credits = action.payload.credits;
      state.loaded = true;
    },
    clearWallet() {
      return initialState;
    },
  },
});

export const { initWallet, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
