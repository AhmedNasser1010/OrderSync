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
    workerOnlineStatus: (state, { payload }) => {
      const { id, value } = payload
      console.log(payload)
      return state.map(worker => {
        if (worker.userInfo.uid === id) {
          return {
            ...worker,
            online: {
              ...worker.online,
              byManager: value
            }
          }
        } else {
          return worker
        }
      })
    },
  },
})


export const {
	initStaff,
	clearStaff,
  newStaff,
  deleteWorker,
  workerOnlineStatus
} = staffSlice.actions

export default staffSlice.reducer