import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ConstantsState {
  userUid: string | null;
  accessToken: string | null;
  orderId: string | null;
}

const initialState: ConstantsState = {
  userUid: null,
  accessToken: null,
  orderId: null,
};

const constantsSlice = createSlice({
  name: "constants",
  initialState,
  reducers: {
    setUserUid: (state, { payload }: PayloadAction<string | null>) => {
      state.userUid = payload;
    },
    setAccessToken: (state, { payload }: PayloadAction<string | null>) => {
      state.accessToken = payload;
    },
    setOrderId: (state, { payload }: PayloadAction<string | null>) => {
      state.orderId = payload;
    },
  },
});

export const { setUserUid, setAccessToken, setOrderId } = constantsSlice.actions;

export const userUid = (state: { constants: ConstantsState }) =>
  state.constants.userUid;
export const accessToken = (state: { constants: ConstantsState }) =>
  state.constants.accessToken;

export default constantsSlice.reducer;
