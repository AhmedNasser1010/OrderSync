import { createSlice } from '@reduxjs/toolkit'

export const workersSlice = createSlice({
  name: 'workers',
  initialState: [],
  reducers: {
    initWorkers: (state, { payload }) => {
      return payload
    },
    clearWorkers: () => {
      return []
    },
    newWorkers: (state, { payload }) => {
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
	initWorkers,
	clearWorkers,
  newWorkers,
  deleteWorker
} = workersSlice.actions

export default workersSlice.reducer