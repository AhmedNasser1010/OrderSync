import { createSlice } from '@reduxjs/toolkit'

export const staffSlice = createSlice({
  name: 'staff',
  initialState: [],
  reducers: {
    initStaff: (state, { payload }) => {
      return payload
    },
    clearStaff: () => {
      return []
    },
    newStaff: (state, { payload }) => {
      return [
        ...state,
        payload
      ]
    },
    deleteWorker: (state, { payload }) => {
      return state.filter(worker => worker.userInfo.uid !== payload)
    },
  },
})


export const {
	initStaff,
	clearStaff,
  newStaff,
  deleteWorker
} = staffSlice.actions

export default staffSlice.reducer