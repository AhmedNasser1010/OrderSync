import { createSlice } from '@reduxjs/toolkit'

export const queueSlice = createSlice({
  name: 'queue',
  initialState: [],
  reducers: {
    initQueue: (state, { payload }) => {
      return payload
    },
    clearQueue: (state, { payload }) => {
      return []
    }
  },
})


export const {
  initQueue,
  clearQueue
} = queueSlice.actions

export default queueSlice.reducer