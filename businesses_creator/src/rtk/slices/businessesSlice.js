import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Functions
import _addDoc from "../../function/_addDoc.js";
import _getDocs from "../../function/_getDocs.js";
import _deleteDoc from "../../function/_deleteDoc.js";
import _updateDoc from "../../function/_updateDoc.js";
import _getSubcollections from "../../function/_getSubcollections.js";
import auth_signupUser from "../../function/auth_signupUser.js";


export const fetchBusinesses = createAsyncThunk("businesses/fetchBusinesses", (userId, thunkAPI) => {

	const currentState = thunkAPI.getState();

	if (currentState.businesses.length === 0) {
		return _getSubcollections("businesses", currentState.user.data.businesses);
	}

	return currentState.businesses;
});


export const businessesSlice = createSlice({
	name: 'businesses',
	initialState: [],
	reducers: {
		deleteBusiness: (state, { payload }) => {
			const currentBus = state.filter(business => business.accessToken === payload)[0]
			_deleteDoc("businesses", payload);
			_deleteDoc("menus", payload);
			_deleteDoc("orders", payload);
			_deleteDoc("users", currentBus.owner.uid);
			return state.filter(business => business.accessToken !== payload);
		},
		updateBusiness: (state, { payload }) => {
			_updateDoc("businesses", payload, payload.accessToken);
			return state.map(business => {
				if (business.accessToken === payload.accessToken) {
					return payload;
				} else {
					return business;
				}
			})
		},
		addBusiness: (state, { payload }) => {
			_addDoc("businesses", payload, payload.accessToken)
			  .then(passed => {
			  	// add current give user data to users collection
			  	const userData = {
						accessToken: payload.accessToken,
						joinDate: Date.now(),
						partnerUid: payload.partnerUid,
						uid: payload.owner.uid,
						userInfo: {
							email: payload.owner.contact.email,
							name: `${payload.owner.basic.fName} ${payload.owner.basic.lName}`,
							phone: payload.owner.contact.phone,
							role: 'BUSINESS_MANAGER',
							uid: payload.owner.uid
						}
					}
			    _addDoc("users", userData, payload.owner.uid)
			    _addDoc("menus", {partnerUid: payload.partnerUid, items: [], categories: [], accessToken: payload.accessToken}, payload.accessToken)
			    _addDoc("orders", {partnerUid: payload.partnerUid, open: [], closed: [], accessToken: payload.accessToken}, payload.accessToken)
					
			  });
			return [...state, payload]
		},
		clearBusinesses: () => {
			return [];
		}
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
			return payload;
		})
	},
})


export const { deleteBusiness, updateBusiness, addBusiness, clearBusinesses } = businessesSlice.actions;
export default businessesSlice.reducer;