import { createSlice } from '@reduxjs/toolkit'

export const servicesSlice = createSlice({
  name: 'services',
  initialState: {},
  reducers: {
    initServices: (state, { payload }) => {
      return payload
    },
    clearServices: (state, { payload }) => {
      return {}
    }
  },
})


export const {
  initServices,
  clearServices
} = servicesSlice.actions

export default servicesSlice.reducer