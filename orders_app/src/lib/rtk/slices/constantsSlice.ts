import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Constants {
  userUid: string | null;
}

const initialState: Constants = {
  userUid: null
};

export const constantsSlice = createSlice({
  name: 'constants',
  initialState,
  reducers: {
    setUserUid(state, { payload }) {
      state.userUid = payload
    }
  },
});

export const { setUserUid } = constantsSlice.actions;

export const userUid = (state: RootState) => state.constants.userUid;

export default constantsSlice.reducer;
