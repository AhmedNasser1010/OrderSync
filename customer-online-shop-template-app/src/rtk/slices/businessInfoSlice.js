import { createSlice } from '@reduxjs/toolkit'

export const businessInfoSlice = createSlice({
  name: 'businessInfo',
  initialState: {},
  reducers: {
    initBusinessInfo: (state, { payload }) => {
      return {...payload}
    },
    clearBusinessInfo: (state, { payload }) => {
      return {}
    }
  },
})


export const {
  initBusinessInfo,
  clearBusinessInfo
} = businessInfoSlice.actions

export default businessInfoSlice.reducer