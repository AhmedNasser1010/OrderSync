import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
	name : "user",
	initialState: {},
		reducers: {
			initUser: (state, { payload }) => {
				return payload		
			},
			clearUser: (state, { payload }) => {
				return {}		
			},
			addUserHomeLocation: (state, { payload }) => {
				return {
					...state,
					location: {
						...state.location,
						positions: {
							...state.location.positions,
							home: payload
						}
					}
				}
			},
			addUserAddress: (state, { payload }) => {
				return {
					...state,
					location: {
						...state.location,
						address: payload
					}
				}
			}
		}
})

export default userSlice.reducer
export const {
	initUser,
	clearUser,
	addUserHomeLocation,
	addUserAddress
} = userSlice.actions