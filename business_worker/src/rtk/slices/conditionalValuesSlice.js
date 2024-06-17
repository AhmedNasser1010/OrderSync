import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    userRegisterStatus: 'LOGGED_OUT'
  },
  reducers: {
    setUserRegisterStatus: (state, { payload }) => {
      return { ...status, userRegisterStatus: payload }
    }
  },
})


export const {
  setUserRegisterStatus
} = conditionalValuesSlice.actions

export default conditionalValuesSlice.reducer