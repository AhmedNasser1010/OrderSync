import { createSlice } from '@reduxjs/toolkit';

export const apiUsageSlice = createSlice({
  name: 'apiUsage',
  initialState: {
    read: 0,
    write: 0
  },
  reducers: {
    increseRead: (state) => {
      return { ...state, read: state.read++ }
    },
    increseWrite: (state) => {
      return { ...state, write: state.write++ }
    },
    resetApiUsageCounters: () => {
      return { read: 0, write: 0 }
    }
  },
})


export const {
  increseRead,
  increseWrite,
  resetApiUsageCounters
} = apiUsageSlice.actions

export default apiUsageSlice.reducer