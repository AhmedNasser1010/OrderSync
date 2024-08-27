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
			},
			updateUserName: (state, { payload }) => {
				return {
					...state,
					userInfo: {
						...state.userInfo,
						name: payload
					}
				}
			},
			updateUserPhone: (state, { payload }) => {
				return {
					...state,
					userInfo: {
						...state.userInfo,
						phone: payload
					}
				}
			},
			updateUserAddress: (state, { payload }) => {
				return {
					...state,
					locations: {
						...state.locations,
						home: {
							...state.locations.home,
							address: payload
						}
					}
				}
			},
			updateUserLocation: (state, { payload }) => {
				return {
					...state,
					locations: {
						...state.locations,
						home: {
							...state.locations.home,
							latlng: payload
						}
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
	addUserAddress,
	updateUserName,
	updateUserPhone,
	updateUserAddress,
	updateUserLocation
} = userSlice.actions