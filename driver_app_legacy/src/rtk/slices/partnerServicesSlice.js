import { createSlice } from '@reduxjs/toolkit'

export const partnerServicesSlice = createSlice({
  name: 'partnerServices',
  initialState: {},
  reducers: {
    initPartnerServices: (state, { payload }) => {
      return payload
    },
    clearPartnerServices: (state) => {
      return {}
    }
  },
})


export const {
  initPartnerServices,
  clearPartnerServices
} = partnerServicesSlice.actions

export default partnerServicesSlice.reducer