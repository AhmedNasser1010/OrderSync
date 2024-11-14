import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

type Constants = {
  userUid: string | null;
  accessToken: string | null;
}

const initialState: Constants = {
  userUid: null,
  accessToken: null
};

export const constantsSlice = createSlice({
  name: 'constants',
  initialState,
  reducers: {
    setUserUid(state, { payload }) {
      state.userUid = payload
    },
    setAccessToken(state, { payload }) {
      state.accessToken = payload
    }
  },
});

export const { setUserUid, setAccessToken } = constantsSlice.actions;

export const userUid = (state: RootState) => state.constants.userUid;
export const accessToken = (state: RootState) => state.constants.accessToken;

export default constantsSlice.reducer;
