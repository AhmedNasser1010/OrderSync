// import { createSlice } from "@reduxjs/toolkit"
// import toast from "react-hot-toast"

// export const cartSlice = createSlice({
// 	name: "cart",
// 	initialState: { items: [], restaurant: "" },
// 	reducers: {
// 		initCart: (state, { payload }) => {
// 			return payload;
// 		},
// 		clearCart: () => {
// 			return { items: [], restaurant: "" };
// 		},
// 		addToCart: (state, { payload }) => {
// 			state.items = [...state.items, { ...payload }];
// 		},
// 		quantityHandle: (state, { payload }) => {
// 			state.items = state.items.reduce((acc, item) => {
// 				if (item.id === payload.id && item.selectedSize === payload.selectedSize) {
// 					if (payload.quantity === "+") {
// 						acc.push({ ...item, quantity: item.quantity + 1 });
// 					} else if (payload.quantity === "-") {
// 						if (item.quantity > 1) {
// 							acc.push({ ...item, quantity: item.quantity - 1 });
// 						}
// 					}
// 				} else {
// 					acc.push(item);
// 				}
// 				return acc;
// 			}, []);
// 			if (state.items.length === 0) {
// 				state.restaurant = ""
// 				toast.success("Cart is cleared Successfully", {
// 					className: "font-ProximaNovaSemiBold",
// 					position: "top-center",
// 					duration: 1500,
// 				})
// 			}
// 		},
// 		setRestaurant: (state, { payload }) => {
// 			state.restaurant = payload;
// 		},
// 		handleAddDiscount: (state, { payload }) => {
// 			const { id, discountCode } = payload
// 			return {
// 				...state,
// 				items: state.items.map(item => {
// 					if (item.id === id) {
// 						return {
// 							...item,
// 							discountCode
// 						}
// 					}
// 					return item
// 				})
// 			}
// 		}
// 	},
// });

// export const {
// 	initCart,
// 	clearCart,
// 	addToCart,
// 	quantityHandle,
// 	setRestaurant,
// 	handleAddDiscount
// } = cartSlice.actions;

// export default cartSlice.reducer;


// src/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Load initial state from localStorage if available
const loadStateFromLocalStorage = () => {
  const savedCart = localStorage.getItem("cartState");
  return savedCart ? JSON.parse(savedCart) : { items: [], restaurant: "" };
};

// Save state to localStorage whenever changes occur
const saveStateToLocalStorage = (state) => {
  localStorage.setItem("cartState", JSON.stringify(state));
};

const initialState = loadStateFromLocalStorage();

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initCart: (state, { payload }) => {
      const newState = payload;
      saveStateToLocalStorage(newState);
      return newState;
    },
    clearCart: () => {
      const newState = { items: [], restaurant: "" };
      saveStateToLocalStorage(newState);
      return newState;
    },
    addToCart: (state, { payload }) => {
      state.items.push({ ...payload });
      saveStateToLocalStorage(state);
    },
    quantityHandle: (state, { payload }) => {
      state.items = state.items.reduce((acc, item) => {
        if (item.id === payload.id && item.selectedSize === payload.selectedSize) {
          if (payload.quantity === "+") {
            acc.push({ ...item, quantity: item.quantity + 1 });
          } else if (payload.quantity === "-" && item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      
      // Update restaurant status and show toast if cart is cleared
      if (state.items.length === 0) {
        state.restaurant = "";
        toast.success("Cart is cleared successfully", {
          className: "font-ProximaNovaSemiBold",
          position: "top-center",
          duration: 1500,
        });
      }
      saveStateToLocalStorage(state);
    },
    setRestaurant: (state, { payload }) => {
      state.restaurant = payload;
      saveStateToLocalStorage(state);
    },
    handleAddDiscount: (state, { payload }) => {
      const { id, discountCode } = payload;
      state.items = state.items.map((item) =>
        item.id === id ? { ...item, discountCode } : item
      );
      saveStateToLocalStorage(state);
    },
  },
});

export const {
  initCart,
  clearCart,
  addToCart,
  quantityHandle,
  setRestaurant,
  handleAddDiscount,
} = cartSlice.actions;

export default cartSlice.reducer;
