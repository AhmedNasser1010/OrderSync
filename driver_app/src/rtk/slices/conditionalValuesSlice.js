import { createSlice } from '@reduxjs/toolkit';

export const conditionalValuesSlice = createSlice({
  name: 'conditionalValues',
  initialState: {
    userRegisterStatus: 'LOGGED_OUT',
    geoLocationErr: false
  },
  reducers: {
    setUserRegisterStatus: (state, { payload }) => {
      return { ...state, userRegisterStatus: payload }
    },
    setGeoLocationErr: (state, { payload }) => {
      return { ...state, geoLocationErr: payload }
    }
  },
})


export const {
  setUserRegisterStatus,
  setGeoLocationErr
} = conditionalValuesSlice.actions

export default conditionalValuesSlice.reducer